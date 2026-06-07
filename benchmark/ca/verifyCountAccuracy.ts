/**
 * Is the displayed total count correct, or capped by the 10k-doc fetch?
 *
 * getTotalCount() fetches up to limit(10000) docs matching the anchor prefix,
 * then dedups to unique person_nbr. If a term matches MORE than 10,000 docs,
 * the count silently undercounts (it only ever sees the first 10k docs).
 *
 * This compares:
 *   capped   = the hook's count (limit 10000, dedup)   <- what the UI shows
 *   truth    = exhaustive scan (paginate ALL docs, dedup, no cap)
 *
 * Run:  npx tsx benchmark/ca/verifyCountAccuracy.ts john
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, query, where, orderBy, limit, startAfter,
  getDocsFromServer, QueryDocumentSnapshot, DocumentData, Firestore,
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

const STATE = "california";
const COUNT_LIMIT = 10000;

function caSearchTerms(raw: string): string[] {
  return raw.toLowerCase().trim().split(/\s+/).filter((t) => t.length >= 2);
}
function caAnchorTerm(terms: string[]): string {
  return terms.reduce((a, b) => (b.length > a.length ? b : a), terms[0] ?? "");
}
function caMatchesAllTerms(o: DocumentData, terms: string[]): boolean {
  const tokens = `${o.first_name} ${o.last_name}`.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((t) => tokens.some((tok: string) => tok.startsWith(t)));
}

// The hook's getTotalCount(): single fetch, limit 10000, dedup.
async function cappedCount(db: Firestore, raw: string) {
  const terms = caSearchTerms(raw);
  let q = query(collection(db, "db_launch"));
  q = query(q, where("state", "==", STATE));
  q = query(q, limit(COUNT_LIMIT));
  q = query(q, where("search_prefixes", "array-contains", caAnchorTerm(terms)));
  const snap = await getDocsFromServer(q);
  const uniq = new Set<string>();
  snap.docs.forEach((d) => { const o = d.data(); if (caMatchesAllTerms(o, terms)) uniq.add(o.person_nbr); });
  return { docsFetched: snap.size, unique: uniq.size, hitCap: snap.size >= COUNT_LIMIT };
}

// Ground truth: paginate through EVERY matching doc, no cap.
async function trueCount(db: Firestore, raw: string) {
  const terms = caSearchTerms(raw);
  const anchor = caAnchorTerm(terms);
  const uniq = new Set<string>();
  let totalDocs = 0;
  let cursor: QueryDocumentSnapshot | null = null;
  const PAGE = 10000;
  for (;;) {
    let q = query(collection(db, "db_launch"));
    q = query(q, where("state", "==", STATE));
    q = query(q, where("search_prefixes", "array-contains", anchor));
    q = query(q, orderBy("__name__"));
    q = query(q, limit(PAGE));
    if (cursor) q = query(q, startAfter(cursor));
    const snap = await getDocsFromServer(q);
    if (snap.empty) break;
    snap.docs.forEach((d) => { const o = d.data(); if (caMatchesAllTerms(o, terms)) uniq.add(o.person_nbr); });
    totalDocs += snap.size;
    if (snap.size < PAGE) break;
    cursor = snap.docs[snap.docs.length - 1];
  }
  return { totalDocs, unique: uniq.size };
}

async function main() {
  const raw = process.argv[2] || "john";
  const db = getFirestore(initializeApp(firebaseConfig));
  console.log(`Query: "${raw}"  (anchor="${caAnchorTerm(caSearchTerms(raw))}")\n`);

  const capped = await cappedCount(db, raw);
  console.log(`UI count (capped, limit 10k): docsFetched=${capped.docsFetched}  unique=${capped.unique}  hitCap=${capped.hitCap}`);

  const truth = await trueCount(db, raw);
  console.log(`Ground truth (full scan):     totalDocs=${truth.totalDocs}  unique=${truth.unique}`);

  const ok = capped.unique === truth.unique;
  console.log(`\n${ok ? "✅ ACCURATE" : "❌ UNDERCOUNT"}: UI shows ${capped.unique}, true unique = ${truth.unique}` +
    (ok ? "" : `  (missing ${truth.unique - capped.unique} because the 10k-doc cap truncated the scan)`));
  process.exit(0);
}
main().catch((e) => { console.error("failed:", e); process.exit(1); });
