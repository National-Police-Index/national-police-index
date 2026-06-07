/**
 * Completeness proof for the capped CA fast path: simulate the hook's page-by-
 * page cursor pagination and confirm that scrolling through ALL pages reaches
 * EVERY matching officer — i.e. nothing is hidden — and matches a ground-truth
 * exhaustive scan. Also reports per-page latency.
 *
 * Run:  npx tsx scripts/verifyPaginationCompleteness.ts
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore, collectionGroup, query, where, orderBy, limit,
  getDocsFromServer, startAfter, QueryDocumentSnapshot, DocumentData, Firestore,
} from "firebase/firestore";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const STATE = "california";
// Page size is configurable so we can verify completeness at the proposed
// 16-per-page as well as the original 100:  npx tsx ... verify... 16
const INTERNAL_PAGE_SIZE = parseInt(process.argv[2] || "100", 10);
const FETCH_LIMIT = INTERNAL_PAGE_SIZE * 10; // matches the hook (pageSize * 10)
const MIN_PREFIX = 2;

function terms(raw: string) { return raw.toLowerCase().trim().split(/\s+/).filter((t) => t.length >= MIN_PREFIX); }
function anchorOf(ts: string[]) { return ts.reduce((a, b) => (b.length > a.length ? b : a), ts[0] ?? ""); }
function matchesAll(o: DocumentData, ts: string[]) {
  const toks = `${o.first_name} ${o.last_name}`.toLowerCase().split(/\s+/).filter(Boolean);
  return ts.every((t) => toks.some((tok: string) => tok.startsWith(t)));
}

// Ground truth: exhaustively page the anchor query (no unique cap) and collect
// every matching person_nbr. This is "all results that exist".
async function groundTruth(db: Firestore, raw: string): Promise<Set<string>> {
  const ts = terms(raw); const anchor = anchorOf(ts);
  const all = new Set<string>();
  let cursor: QueryDocumentSnapshot | null = null;
  for (;;) {
    let q = query(collectionGroup(db, "db_launch"),
      where("state", "==", STATE),
      where("search_prefixes", "array-contains", anchor),
      orderBy("last_name", "asc"), limit(FETCH_LIMIT));
    if (cursor) q = query(q, startAfter(cursor));
    const snap = await getDocsFromServer(q);
    if (snap.empty) break;
    for (const d of snap.docs) { const o = d.data(); if (matchesAll(o, ts)) all.add(o.person_nbr); }
    if (snap.docs.length < FETCH_LIMIT) break;
    cursor = snap.docs[snap.docs.length - 1];
  }
  return all;
}


async function simulatePaging(db: Firestore, raw: string) {
  const ts = terms(raw); const anchor = anchorOf(ts);
  const seen = new Set<string>();
  let cursor: QueryDocumentSnapshot | null = null;
  let page = 0; let hasNext = true; let maxPageMs = 0; let totalDocs = 0;
  while (hasNext) {
    page++;
    let q = query(collectionGroup(db, "db_launch"),
      where("state", "==", STATE),
      where("search_prefixes", "array-contains", anchor),
      orderBy("last_name", "asc"), limit(FETCH_LIMIT));
    if (cursor) q = query(q, startAfter(cursor));
    const t0 = performance.now();
    const snap = await getDocsFromServer(q);
    const ms = performance.now() - t0;
    maxPageMs = Math.max(maxPageMs, ms);
    totalDocs += snap.size;
    if (snap.empty) break;

    let uniqueThisPage = 0; let lastExamined = -1;
    for (let i = 0; i < snap.docs.length && uniqueThisPage < INTERNAL_PAGE_SIZE; i++) {
      lastExamined = i;
      const o = snap.docs[i].data();
      if (!matchesAll(o, ts)) continue;
      if (!seen.has(o.person_nbr)) { seen.add(o.person_nbr); uniqueThisPage++; }
    }
    cursor = snap.docs[lastExamined >= 0 ? lastExamined : snap.docs.length - 1];
    hasNext = uniqueThisPage >= INTERNAL_PAGE_SIZE || snap.docs.length === FETCH_LIMIT;
    if (page > 2000) { console.log("  (safety stop at 2000 pages)"); break; }
  }
  return { seen, pages: page, maxPageMs, totalDocs };
}

async function main() {
  const app = initializeApp(cfg);
  const db = getFirestore(app);
  for (const raw of ["smith john", "wilson", "garcia smith"]) {
    const truth = await groundTruth(db, raw);
    const sim = await simulatePaging(db, raw);
    const missing = [...truth].filter((p) => !sim.seen.has(p));
    const ok = missing.length === 0 && sim.seen.size === truth.size;
    console.log(
      `"${raw}": groundTruth=${truth.size} pagedThrough=${sim.seen.size} ` +
      `pages=${sim.pages} maxPageLatency=${sim.maxPageMs.toFixed(0)}ms ` +
      `=> ${ok ? "COMPLETE ✅ (no hidden results)" : `INCOMPLETE ❌ missing ${missing.length}`}`
    );
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
