/**
 * CA multi-term recall regression test — the named cases behind the
 * "Joseph Goosby returns nothing" bug.
 *
 * Ground truth is independent of anchor choice: scan each term's own
 * array-contains query exhaustively and intersect. Complements
 * benchmark/verifySearchRecall.ts, which samples the whole DB.
 *
 * Run:  npx tsx benchmark/ca/verifyMultiTermRecall.ts [pageSize] [--legacy]
 */
import {
  collectionGroup, query, where, orderBy, limit, getDocsFromServer, startAfter,
  QueryDocumentSnapshot, DocumentData, Firestore, QueryConstraint,
  Query,
} from "firebase/firestore";
import * as dotenv from "dotenv";
import { PoliceOfficer } from "@/types";

dotenv.config({ path: ".env.local" });

// Imports must be dynamic: `@/lib/firebase` reads env at module scope.
let db: Firestore;
let caSearchTerms: (raw: string) => string[];
let caAnchorTerm: (terms: string[]) => string;
let matchesAllTerms: (officer: PoliceOfficer, terms: string[]) => boolean;
let pickNameConstraints: (
  base: Query<DocumentData>,
  tokenField: string,
  terms: string[]
) => Promise<QueryConstraint[] | null>;

async function loadAppCode() {
  ({ db } = await import("@/lib/firebase"));
  const hook = await import("@/hooks/useOfficersByUid");
  caSearchTerms = hook.caSearchTerms;
  caAnchorTerm = hook.caAnchorTerm;
  matchesAllTerms = hook.matchesAllTerms;
  pickNameConstraints = hook.pickNameConstraints;
}

const STATE = "california";
const SCAN_PAGE = 5000; // ground-truth scan only, not the hook

const CASES = [
  "joseph goosby",   // the reported bug: first name is the anchor
  "michael goosby",  // same shape, different first name
  "smith john",      // both terms common; the old suite called this COMPLETE
  "goosby",          // control: single term
  "wilson",          // control: single term, many matches
];

/** Every person_nbr in one term's own scan that matches ALL typed terms. */
async function scanTerm(term: string, ts: string[]) {
  const found = new Set<string>();
  let cursor: QueryDocumentSnapshot | null = null;
  let docsRead = 0;
  for (;;) {
    let q = query(
      collectionGroup(db, "db_launch"),
      where("state", "==", STATE),
      where("search_prefixes", "array-contains", term),
      orderBy("last_name", "asc"),
      limit(SCAN_PAGE)
    );
    if (cursor) q = query(q, startAfter(cursor));
    const snap = await getDocsFromServer(q);
    if (snap.empty) break;
    docsRead += snap.size;
    for (const d of snap.docs) {
      const o = d.data() as PoliceOfficer;
      if (matchesAllTerms(o, ts)) found.add(o.person_nbr);
    }
    if (snap.docs.length < SCAN_PAGE) break;
    cursor = snap.docs[snap.docs.length - 1];
  }
  return { found, docsRead };
}

/** Anchor-agnostic ground truth: intersection of every term's own scan. */
async function groundTruth(raw: string) {
  const ts = caSearchTerms(raw);
  const scans = await Promise.all(ts.map((t) => scanTerm(t, ts)));
  let truth = scans[0].found;
  for (const s of scans.slice(1)) {
    truth = new Set([...truth].filter((p) => s.found.has(p)));
  }
  return { truth, docsScanned: scans.reduce((n, s) => n + s.docsRead, 0) };
}

/** Page 1 of the shipped CA fast path. */
async function hookPageOne(raw: string, pageSize: number, legacy: boolean) {
  const ts = caSearchTerms(raw);
  const base = query(
    collectionGroup(db, "db_launch"),
    where("state", "==", STATE)
  );
  const ranged = legacy ? null : await pickNameConstraints(base, "search_prefixes", ts);
  const q = query(
    base,
    ...(ranged ?? [where("search_prefixes", "array-contains", caAnchorTerm(ts))]),
    orderBy("last_name", "asc"),
    limit(pageSize * 10) // hook: pageSize * 10 on the CA fast path
  );
  const snap = await getDocsFromServer(q);

  const shown = new Set<string>();
  for (const d of snap.docs) {
    if (shown.size >= pageSize) break;
    const o = d.data() as PoliceOfficer;
    if (!matchesAllTerms(o, ts)) continue;
    shown.add(o.person_nbr);
  }
  const names = snap.docs.map((d) => String(d.data().last_name ?? "").toLowerCase());
  return {
    shown,
    fetched: snap.size,
    shape: ranged ? "surname-range" : "anchor-only",
    window: names.length ? `${names[0]} .. ${names[names.length - 1]}` : "(empty)",
  };
}

async function main() {
  await loadAppCode();
  const args = process.argv.slice(2);
  const legacy = args.includes("--legacy");
  const pageSize = parseInt(args.find((a) => !a.startsWith("--")) || "16", 10);

  console.log(`CA multi-term recall — pageSize=${pageSize}, page-1 fetch=${pageSize * 10}` +
    (legacy ? "  [--legacy: pre-fix shape, failures expected]" : "") + "\n");

  let failures = 0;
  for (const raw of CASES) {
    const { truth, docsScanned } = await groundTruth(raw);
    const page1 = await hookPageOne(raw, pageSize, legacy);

    // Fewer than min(truth, pageSize) means matches exist but are unreachable:
    // the pagination bar only renders when results do, so page 1 is a dead end.
    const expected = Math.min(truth.size, pageSize);
    const ok = page1.shown.size >= expected;
    if (!ok) failures++;

    console.log(
      `"${raw}"\n` +
      `  shape=${page1.shape}  fetched=${page1.fetched}  last_name window: ${page1.window}\n` +
      `  ground truth (anchor-agnostic, ${docsScanned} docs scanned): ${truth.size} officer(s)\n` +
      `  page 1 shows: ${page1.shown.size}  (expected >= ${expected})\n` +
      `  => ${ok ? "PASS ✅" : `FAIL ❌ ${truth.size - page1.shown.size} matching officer(s) unreachable`}\n`
    );
  }

  console.log(failures === 0 ? "All cases PASS ✅" : `${failures}/${CASES.length} cases FAIL ❌`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
