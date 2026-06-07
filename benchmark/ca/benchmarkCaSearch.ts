/**
 * Benchmark: CA "old path" (searchQueries / array-contains-any) vs
 * "fast path" (search_prefixes / array-contains), measured against the real
 * Firestore backend.
 * Run:  npx tsx scripts/benchmarkCaSearch.ts
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  or,
  getDocsFromServer,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Firestore,
} from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ----- config -----
const STATE = "california";
const TEST_QUERIES = ["smith", "wilson", "joh", "smith john", "garcia"];
const RUNS = 4; // per query per path; run 1 = cold (channel warmup), rest = steady
const INTERNAL_PAGE_SIZE = 100; // hook uses 100 when a query is present
const MIN_PREFIX_LENGTH = 2;

// ----- helpers mirroring the hook -----
function caSearchTerms(raw: string): string[] {
  return raw.toLowerCase().trim().split(/\s+/).filter((t) => t.length >= MIN_PREFIX_LENGTH);
}
function caAnchorTerm(terms: string[]): string {
  return terms.reduce((a, b) => (b.length > a.length ? b : a), terms[0] ?? "");
}
function caMatchesAllTerms(officer: DocumentData, terms: string[]): boolean {
  const tokens = `${officer.first_name} ${officer.last_name}`.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => tokens.some((tok: string) => tok.startsWith(term)));
}

interface RunResult {
  ms: number;
  docsRead: number;
  uniqueOfficers: number;
}

// OLD path: or(searchQueries array-contains-any, person_nbr ==) + orderBy(last_name), limit 100*100.
async function runOldPath(db: Firestore, rawQuery: string): Promise<RunResult> {
  const officersRef = collectionGroup(db, "db_launch");
  const terms = rawQuery.trim().toLowerCase().split(" ");
  const queryTerms = rawQuery.toLowerCase().split(" ").slice(0, 20);

  let q = query(officersRef, where("state", "==", STATE));
  q = query(
    q,
    or(
      where("searchQueries", "array-contains-any", queryTerms),
      where("person_nbr", "==", rawQuery)
    )
  );
  q = query(q, orderBy("last_name", "asc"));
  q = query(q, limit(INTERNAL_PAGE_SIZE * 100));

  const t0 = performance.now();
  let snapshot = await getDocsFromServer(q);
  let totalDocs = snapshot.size;

  // Replicate the hook's client-side dedup + multi-term filter loop.
  const grouped = new Map<string, true>();
  let unique = 0;
  let attempts = 0;
  while (unique < INTERNAL_PAGE_SIZE && attempts < 10 && snapshot.docs.length > 0) {
    for (let i = 0; i < snapshot.docs.length && unique < INTERNAL_PAGE_SIZE; i++) {
      const officer = snapshot.docs[i].data();
      if (terms.length > 1) {
        if (!(terms.includes(String(officer.first_name).toLowerCase()) &&
              terms.includes(String(officer.last_name).toLowerCase()))) continue;
      }
      if (!grouped.has(officer.person_nbr)) { grouped.set(officer.person_nbr, true); unique++; }
    }
    if (unique < INTERNAL_PAGE_SIZE && snapshot.docs.length === INTERNAL_PAGE_SIZE * 10) {
      const last = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot;
      q = query(q, startAfter(last));
      snapshot = await getDocsFromServer(q);
      totalDocs += snapshot.size;
      attempts++;
    } else break;
  }
  const ms = performance.now() - t0;
  return { ms, docsRead: totalDocs, uniqueOfficers: unique };
}

// FAST path: array-contains(anchor) + orderBy(last_name), limit 100*10, client
// allTermsMatch, SINGLE fetch (no continuation) — matches the hook's capped CA path.
async function runFastPath(db: Firestore, rawQuery: string): Promise<RunResult> {
  const officersRef = collectionGroup(db, "db_launch");
  const caTerms = caSearchTerms(rawQuery);
  const anchor = caAnchorTerm(caTerms);

  let q = query(officersRef, where("state", "==", STATE));
  q = query(q, where("search_prefixes", "array-contains", anchor));
  q = query(q, orderBy("last_name", "asc"));
  q = query(q, limit(INTERNAL_PAGE_SIZE * 10));

  const t0 = performance.now();
  let snapshot = await getDocsFromServer(q);
  let totalDocs = snapshot.size;

  // SINGLE fetch only — no continuation loop (matches the capped CA fast path).
  const grouped = new Map<string, true>();
  let unique = 0;
  for (let i = 0; i < snapshot.docs.length && unique < INTERNAL_PAGE_SIZE; i++) {
    const officer = snapshot.docs[i].data();
    if (!caMatchesAllTerms(officer, caTerms)) continue;
    if (!grouped.has(officer.person_nbr)) { grouped.set(officer.person_nbr, true); unique++; }
  }
  const ms = performance.now() - t0;
  return { ms, docsRead: totalDocs, uniqueOfficers: unique };
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  console.log("Firebase project:", firebaseConfig.projectId);
  console.log(`Runs per path: ${RUNS} (run 1 = cold/channel warmup)\n`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const rows: string[] = [];
  rows.push(
    "| Query | Path | Docs read | Unique found | Cold ms | Warm median ms |"
  );
  rows.push("|-------|------|-----------|--------------|---------|----------------|");

  for (const rawQuery of TEST_QUERIES) {
    for (const [label, fn] of [
      ["OLD", runOldPath],
      ["FAST", runFastPath],
    ] as const) {
      const results: RunResult[] = [];
      for (let r = 0; r < RUNS; r++) {
        try {
          results.push(await fn(db, rawQuery));
        } catch (e) {
          console.error(`ERROR on "${rawQuery}" [${label}]:`, (e as Error).message);
          results.push({ ms: NaN, docsRead: -1, uniqueOfficers: -1 });
          break;
        }
      }
      const cold = results[0];
      const warm = results.slice(1).map((r) => r.ms).filter((n) => !Number.isNaN(n));
      const warmMed = warm.length ? median(warm) : NaN;
      rows.push(
        `| \`${rawQuery}\` | ${label} | ${cold.docsRead} | ${cold.uniqueOfficers} | ${cold.ms.toFixed(0)} | ${Number.isNaN(warmMed) ? "n/a" : warmMed.toFixed(0)} |`
      );
      console.log(
        `${rawQuery.padEnd(12)} ${label.padEnd(4)}  docs=${String(cold.docsRead).padStart(5)}  unique=${String(cold.uniqueOfficers).padStart(3)}  cold=${cold.ms.toFixed(0)}ms  warmMed=${Number.isNaN(warmMed) ? "n/a" : warmMed.toFixed(0) + "ms"}`
      );
    }
    console.log("");
  }

  console.log("\n===== Markdown table =====\n");
  console.log(rows.join("\n"));
  process.exit(0);
}

main().catch((e) => {
  console.error("Benchmark failed:", e);
  process.exit(1);
});
