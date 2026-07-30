/**
 * GENERAL SEARCH RECALL SUITE — all states, both search paths.
 *
 * The oracle is a real document, not another query shape: sample actual officers
 * out of Firestore, search their exact name, assert they come back. Sampling is
 * biased toward what breaks — surnames late in the alphabet, multi-word surnames.
 * Query helpers are imported from the hook so this cannot drift from what ships.
 *
 * Run:  npx tsx benchmark/verifySearchRecall.ts [state...] [--per=N] [--legacy]
 */
import {
  collectionGroup, collection, query, where, orderBy, limit, or,
  getDocsFromServer, Firestore, QueryConstraint, DocumentData,
  Query,
} from "firebase/firestore";
import * as dotenv from "dotenv";
import { PoliceOfficer } from "@/types";

dotenv.config({ path: ".env.local" });

// `@/lib/firebase` reads NEXT_PUBLIC_* at module scope and ES imports hoist above
// dotenv.config(), so app code must be imported dynamically once env is loaded.
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

const ALL_STATES = [
  "california", "florida", "texas", "ohio", "illinois", "georgia", "utah",
  "washington", "arizona", "oregon", "colorado", "tennessee", "kentucky",
  "maryland", "vermont", "wyoming", "south-carolina", "west-virginia",
  "north-carolina", "new-jersey", "missouri", "oklahoma", "alaska", "idaho",
];

const PAGE_SIZE = 16;
const CA_LIMIT_MULTIPLIER = 10;   // hook: useCaFastPath ? 10 : 100
const NON_CA_LIMIT_MULTIPLIER = 100;

interface Sample {
  first: string;
  last: string;
  person: string;
  bucket: string;
}

/** Pull real officers out of the DB. These ARE the ground truth. */
async function sampleOfficers(state: string, perBucket: number): Promise<Sample[]> {
  // Late surnames are hardest: a truncated ascending window never reaches them.
  const buckets: { name: string; constraints: QueryConstraint[] }[] = [
    { name: "late-surname", constraints: [orderBy("last_name", "desc"), limit(perBucket * 12)] },
    { name: "early-surname", constraints: [orderBy("last_name", "asc"), limit(perBucket * 4)] },
    { name: "mid-surname", constraints: [where("last_name", ">=", "M"), orderBy("last_name", "asc"), limit(perBucket * 4)] },
  ];

  const out: Sample[] = [];
  const seen = new Set<string>();

  for (const b of buckets) {
    let snap;
    try {
      snap = await getDocsFromServer(
        query(collectionGroup(db, "db_launch"), where("state", "==", state), ...b.constraints)
      );
    } catch {
      continue;
    }
    let taken = 0;
    // Prefer multi-word surnames: they exercise the tokenising filter.
    const docs = snap.docs.map((d) => d.data());
    const multiWord = docs.filter((o) => typeof o.last_name === "string" && /\s|-/.test(o.last_name));
    for (const o of [...multiWord, ...docs]) {
      if (taken >= perBucket) break;
      if (!o.first_name || !o.last_name) continue;
      const key = `${o.first_name}|${o.last_name}`.toLowerCase();
      if (seen.has(key)) continue;
      // A name with a digit routes into the person_nbr branch, not name search.
      if (/\d/.test(`${o.first_name} ${o.last_name}`)) continue;
      seen.add(key);
      out.push({
        first: o.first_name, last: o.last_name, person: o.person_nbr,
        bucket: /\s|-/.test(o.last_name) ? `${b.name}+multiword` : b.name,
      });
      taken++;
    }
  }
  return out;
}

/** Page 1 of the real search, mirroring the branch structure in the hook. */
async function searchPageOne(state: string, raw: string, legacy = false) {
  const lowered = raw.toLowerCase();
  const searchingByUid = /\d/.test(lowered.trim());
  const isCa = state.toLowerCase() === "california";

  let q = query(collectionGroup(db, "db_launch"), where("state", "==", state));

  const caTerms = isCa && !searchingByUid ? caSearchTerms(lowered) : [];
  const useCaFastPath = caTerms.length > 0;
  // `--legacy` reproduces the pre-fix shape, so this suite can be shown to go red
  // on the bug it exists to catch.
  const canRangeOnLastName = !searchingByUid && !legacy;

  let shape: string;
  if (useCaFastPath) {
    const ranged = canRangeOnLastName
      ? await pickNameConstraints(q, "search_prefixes", caTerms)
      : null;
    shape = ranged ? "ca:surname-range" : "ca:anchor-only";
    q = query(q, ...(ranged ?? [where("search_prefixes", "array-contains", caAnchorTerm(caTerms))]));
    q = query(q, orderBy("last_name", "asc"));
  } else {
    const queryTerms = lowered.split(" ").slice(0, 20);
    const ranged = canRangeOnLastName
      ? await pickNameConstraints(q, "searchQueries", queryTerms)
      : null;
    shape = ranged ? "nonca:surname-range" : "nonca:contains-any";
    if (ranged) {
      q = query(q, ...ranged);
    } else {
      q = query(q, or(
        where("searchQueries", "array-contains-any", queryTerms),
        where("person_nbr", "==", lowered)
      ));
    }
    q = query(q, orderBy("last_name", "asc"));
  }

  const multiplier = useCaFastPath ? CA_LIMIT_MULTIPLIER : NON_CA_LIMIT_MULTIPLIER;
  q = query(q, limit(PAGE_SIZE * multiplier));

  const t0 = performance.now();
  const snap = await getDocsFromServer(q);
  const ms = performance.now() - t0;

  // Same client-side grouping/filtering the hook applies to build a page.
  const terms = useCaFastPath ? caTerms : lowered.trim().split(" ");
  const shown = new Set<string>();
  for (const d of snap.docs) {
    if (shown.size >= PAGE_SIZE) break;
    const officer = d.data() as PoliceOfficer;
    if (terms.length > 1 && !matchesAllTerms(officer, terms)) continue;
    shown.add(officer.person_nbr);
  }
  return { shown, fetched: snap.size, ms, shape };
}

async function stateHasData(state: string) {
  try {
    const snap = await getDocsFromServer(
      query(collection(db, "db_launch"), where("state", "==", state), limit(1))
    );
    return !snap.empty;
  } catch {
    return false;
  }
}

async function main() {
  await loadAppCode();
  const args = process.argv.slice(2);
  const perArg = args.find((a) => a.startsWith("--per="));
  const perBucket = perArg ? parseInt(perArg.split("=")[1], 10) : 4;
  const legacy = args.includes("--legacy");
  const only = args.filter((a) => !a.startsWith("--"));
  const states = only.length ? only : ALL_STATES;
  if (legacy) console.log("running with --legacy (pre-fix query shape); failures are expected\n");

  let totalChecks = 0;
  let totalFails = 0;
  const failuresByState: Record<string, string[]> = {};
  const shapeCounts: Record<string, number> = {};
  let slowest = { name: "", ms: 0 };

  for (const state of states) {
    if (!(await stateHasData(state))) {
      console.log(`${state.padEnd(16)} — no data, skipped`);
      continue;
    }
    const samples = await sampleOfficers(state, perBucket);
    if (!samples.length) {
      console.log(`${state.padEnd(16)} — no usable samples, skipped`);
      continue;
    }

    const fails: string[] = [];
    for (const s of samples) {
      const raw = `${s.first} ${s.last}`.toLowerCase();
      let res;
      try {
        res = await searchPageOne(state, raw, legacy);
      } catch (e: unknown) {
        fails.push(`"${raw}" (${s.bucket}) ERROR ${(e as Error).message.slice(0, 90)}`);
        totalChecks++; totalFails++;
        continue;
      }
      shapeCounts[res.shape] = (shapeCounts[res.shape] ?? 0) + 1;
      if (res.ms > slowest.ms) slowest = { name: `${state} "${raw}"`, ms: res.ms };

      totalChecks++;
      if (!res.shown.has(s.person)) {
        totalFails++;
        fails.push(
          `"${raw}" -> person_nbr ${s.person} NOT on page 1 ` +
          `[${s.bucket}, ${res.shape}, fetched ${res.fetched}]`
        );
      }
    }

    if (fails.length) {
      failuresByState[state] = fails;
      console.log(`${state.padEnd(16)} ${samples.length - fails.length}/${samples.length} ✅  ${fails.length} FAIL ❌`);
      for (const f of fails) console.log(`    ${f}`);
    } else {
      console.log(`${state.padEnd(16)} ${samples.length}/${samples.length} ✅`);
    }
  }

  console.log(`\nquery shapes used: ${JSON.stringify(shapeCounts)}`);
  console.log(`slowest page-1 query: ${slowest.name} ${slowest.ms.toFixed(0)}ms`);

  // A run that checked nothing is broken, not passing.
  if (totalChecks === 0) {
    console.log("\nNO CHECKS RAN ❌ — could not reach Firestore or sample any officers");
    process.exit(2);
  }

  console.log(
    totalFails === 0
      ? `\nALL PASS ✅ — ${totalChecks} sampled officers all reachable by full-name search`
      : `\n${totalFails}/${totalChecks} FAILED ❌ across ${Object.keys(failuresByState).length} state(s)`
  );
  process.exit(totalFails === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
