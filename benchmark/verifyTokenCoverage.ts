/**
 * SEARCH TOKEN COVERAGE — reads only. Scans every doc of each state and checks
 * the stored search tokens:
 *
 *  - searchQueries missing / empty           -> FAIL (name search can't find the doc
 *                                               by any word; only last_name ranges)
 *  - searchQueries not what searchTokens()   -> "old format", reported; FAIL only
 *    builds today (e.g. "zeilenga,")            with --strict. Fixed by re-running
 *                                               scripts/addSearchQueriesByState.ts
 *  - search_prefixes missing / mismatched    -> FAIL, in prefix-indexed states
 *    (PREFIX_STATES)                            (CA search queries that field)
 *
 * Docs with no name at all are skipped, as the pipeline scripts skip them.
 * Run right after a state's pipeline (use --strict then) or a re-upload.
 *
 * Run:  npx tsx benchmark/verifyTokenCoverage.ts <state...> [--strict]
 * Exit: 0 pass, 1 any failure.
 */
import * as admin from "firebase-admin";
import { loadServiceAccount } from "../utils/loadServiceAccount";
import { searchTokens } from "../lib/officerSearch";
import { searchPrefixesFor } from "../scripts/addSearchPrefixesByState";

/** States whose search reads `search_prefixes` (see CA_FAST_SEARCH_ENABLED). */
const PREFIX_STATES = ["california"];
const PAGE = 5000;
const MAX_EXAMPLES = 5;

const sameSet = (a: unknown, b: string[]) =>
  Array.isArray(a) && new Set(a).size === b.length && b.every((x) => a.includes(x));

async function scanState(db: admin.firestore.Firestore, state: string, strict: boolean): Promise<boolean> {
  const prefixed = PREFIX_STATES.includes(state);
  const fields = ["first_name", "middle_name", "last_name", "full_name", "searchQueries", ...(prefixed ? ["search_prefixes"] : [])];
  let total = 0, nameless = 0, missing = 0, oldFormat = 0, prefixMissing = 0, prefixWrong = 0;
  const examples: string[] = [];
  const note = (s: string) => { if (examples.length < MAX_EXAMPLES) examples.push(s); };

  let last: admin.firestore.QueryDocumentSnapshot | null = null;
  for (;;) {
    let q = db.collectionGroup("db_launch").where("state", "==", state).select(...fields);
    if (last) q = q.startAfter(last);
    const snap = await q.limit(PAGE).get();
    for (const d of snap.docs) {
      total++;
      const x = d.data();
      if (!x.first_name && !x.last_name && !x.full_name) { nameless++; continue; }
      const name = x.full_name ?? `${x.first_name} ${x.last_name}`;

      if (!Array.isArray(x.searchQueries) || x.searchQueries.length === 0) {
        missing++;
        note(`${d.id} "${name}" missing searchQueries`);
      } else if (!sameSet(x.searchQueries, searchTokens(x))) {
        oldFormat++;
        note(`${d.id} "${name}" old-format searchQueries ${JSON.stringify(x.searchQueries)}`);
      }

      if (prefixed && (x.first_name || x.last_name)) {
        // An empty array is valid when every word is too short to index.
        if (!Array.isArray(x.search_prefixes)) {
          prefixMissing++;
          note(`${d.id} "${name}" missing search_prefixes`);
        } else if (!sameSet(x.search_prefixes, searchPrefixesFor(x.first_name ?? "", x.last_name ?? ""))) {
          prefixWrong++;
          note(`${d.id} "${name}" mismatched search_prefixes`);
        }
      }
    }
    if (total && total % 50000 < snap.size) console.log(`  ${state}: scanned ${total}...`);
    if (snap.size < PAGE) break;
    last = snap.docs[snap.docs.length - 1];
  }

  const ok = total > 0 && missing === 0 && prefixMissing === 0 && prefixWrong === 0 && (!strict || oldFormat === 0);
  console.log(
    `${ok ? "✅" : "❌"} ${state}: ${total} docs, ${missing} missing searchQueries, ${oldFormat} old-format` +
    (prefixed ? `, ${prefixMissing} missing / ${prefixWrong} mismatched search_prefixes` : "") +
    `, ${nameless} skipped (no name)` + (total === 0 ? "  NO DOCS" : "")
  );
  for (const e of examples) console.log(`     ${e}`);
  return ok;
}

async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const states = args.filter((a) => !a.startsWith("--"));
  if (!states.length) {
    console.log("usage: npx tsx benchmark/verifyTokenCoverage.ts <state...> [--strict]");
    process.exitCode = 1;
    return;
  }
  admin.initializeApp({ credential: admin.credential.cert(await loadServiceAccount()) });
  const db = admin.firestore();

  let ok = true;
  for (const s of states) ok = (await scanState(db, s.toLowerCase(), strict)) && ok;
  console.log(ok ? "\nCOVERAGE OK ✅" : "\nCOVERAGE INCOMPLETE ❌");
  process.exitCode = ok ? 0 : 1;
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
