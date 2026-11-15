/**
 * SEARCH TOKEN CONTRACT — offline, no Firestore. Proves the tokens the data
 * pipeline stores agree with the search code's client filter, for every state:
 *
 *  1. searchQueries (scripts/addSearchQueriesByState.ts -> searchTokens):
 *     every stored token, typed as a search, must pass matchesAllTerms, or the
 *     server returns officers the page then silently drops; and every word of
 *     first / middle / last name (and its punctuation-free form and hyphen
 *     parts) must be stored, or array-contains on it finds nobody.
 *  2. search_prefixes (scripts/addSearchPrefixesByState.ts, California today):
 *     every indexed prefix must pass the filter, and every prefix (>= 2 chars)
 *     of a first / last name word must be indexed. The reverse need not hold:
 *     the filter also accepts forms the prefix index lacks (punctuation-free
 *     words, hyphen parts, middle names), which the planner's last_name range
 *     and any-term arms find instead.
 *
 * Run:  npx tsx benchmark/verifySearchTokens.ts
 * Exit: 0 all pass, 1 any failure.
 */
import { PoliceOfficer } from "@/types";
import { matchesAllTerms, normalizeQuery, searchTokens } from "@/lib/officerSearch";
import { searchPrefixesFor, MIN_PREFIX_LENGTH } from "@/scripts/addSearchPrefixesByState";

interface Name {
  first: string;
  middle?: string;
  last: string;
  /** full_name exactly as stored ("" where the state stores none). */
  full: string;
  /** Where the record was found. */
  from: string;
}

// Real records (Firestore db_launch, checked 2026-11-14), one per data shape
// seen in production, so the contract is tested on what the pipeline meets.
const NAMES: Name[] = [
  { from: "minnesota", first: "Steven", last: "Andersen", full: "Andersen, Steven" },                 // "Last, First"
  { from: "minnesota", first: "Donald", last: "Mc Adams", full: "Mc Adams, Donald" },                 // split particle
  { from: "arizona", first: "Mardoqueu", middle: "Luiz", last: "DA Silva Jr", full: "" },              // caps particle, suffix, no full_name
  { from: "california", first: "Johnny", last: "O'neal Jr", full: "JOHNNY O'NEAL JR" },               // ALL-CAPS full_name, suffix
  { from: "arizona", first: "Miller-dinh", middle: "C.", last: "Dao", full: "" },                     // hyphenated first name, "C."
  { from: "kentucky", first: "Bryan", middle: "D.", last: "Oberhausen", full: "Oberhausen, Bryan D." },
  { from: "florida", first: "James", middle: "J.", last: "O'brien", full: "James J. O'Brien" },
  { from: "california", first: "Ashton", last: "O'boyle-womeldorf", full: "ASHTON O'BOYLE-WOMELDORF" }, // apostrophe + hyphen
  { from: "ohio", first: "Amy", last: "O'hare-moses", full: "O'hare-moses, Amy" },
  { from: "california", first: "Sterling W III", last: "O'ran", full: "STERLING W III O'RAN" },        // initial + suffix in first_name
  { from: "florida", first: "Luz Marie", middle: "Â Â Â Â Â Â Â Â Â Â Â Â Â Â Â", last: "D'urbano", full: "Luz Marie D'Urbano" }, // mojibake middle, non-ascii
  { from: "georgia", first: "Derek D'auntae", last: "Dailey", full: "dailey, derek d'auntae" },       // lowercase "last, first"
  { from: "georgia", first: "De", middle: "Viterialfredo", last: "Saenz", full: "saenz, de      viteri alfredo" }, // fields disagree with full_name
  { from: "ohio", first: "J", middle: "Timothy", last: "O'donnell", full: "O'Donnell, J  Timothy" },   // 1-char first, double space
  { from: "texas", first: "Alan", last: "O'berg", full: "Alan  O'berg" },
];

const label = (n: Name) => [n.first, n.middle, n.last].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
const words = (s: string | undefined) => (s ?? "").toLowerCase().split(/[\s,]+/).filter(Boolean);

/** Forms of a name word the stored tokens must contain. */
function requiredForms(word: string): string[] {
  const w = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (!w) return [];
  const flat = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
  return [w, flat(w), ...w.split("-"), ...w.split("-").map(flat)].filter(Boolean);
}

/** Every substring (len >= 2) of every word: prefixes must match, the rest mustn't be indexed. */
function substrings(first: string, last: string): Set<string> {
  const out = new Set<string>();
  for (const tok of `${first} ${last}`.toLowerCase().split(/\s+/).filter(Boolean)) {
    for (let i = 0; i < tok.length; i++) for (let j = i + 2; j <= tok.length; j++) out.add(tok.slice(i, j));
  }
  ["zz", "smi ", "ohn", "mith", "xq"].forEach((t) => out.add(t));
  return out;
}

let checks = 0;
let failures = 0;
function check(ok: boolean, what: string) {
  checks++;
  if (!ok) {
    failures++;
    console.log(`  ❌ ${what}`);
  }
}

console.log("searchQueries (all states)");
for (const n of NAMES) {
  const record = { first_name: n.first, middle_name: n.middle, last_name: n.last, full_name: n.full };
  const officer = record as PoliceOfficer;
  const tokens = searchTokens(record);
  const set = new Set(tokens);

  check(tokens.length === set.size, `"${label(n)}" duplicate tokens ${JSON.stringify(tokens)}`);
  for (const t of tokens) {
    check(!/[\s,]/.test(t) && t.length > 0, `"${label(n)}" malformed token ${JSON.stringify(t)}`);
    const typed = normalizeQuery(t);
    check(typed.length === 1 && matchesAllTerms(officer, typed), `"${label(n)}" stores "${t}" but the filter rejects it`);
  }
  for (const w of [...words(n.first), ...words(n.middle), ...words(n.last)]) {
    for (const f of requiredForms(w)) check(set.has(f), `"${label(n)}" missing token "${f}"`);
  }
  console.log(`  ${label(n).padEnd(34)} ${n.from.padEnd(11)} ${JSON.stringify(tokens)}`);
}

console.log("\nsearch_prefixes (prefix-indexed states: california)");
for (const n of NAMES) {
  const officer = { first_name: n.first, middle_name: n.middle, last_name: n.last } as PoliceOfficer;
  const prefixes = searchPrefixesFor(n.first, n.last);
  const set = new Set(prefixes);

  check(prefixes.length === set.size, `"${label(n)}" duplicate prefixes`);
  for (const p of prefixes) check(p.length >= MIN_PREFIX_LENGTH && !/\s/.test(p), `"${label(n)}" bad prefix ${JSON.stringify(p)}`);
  for (const t of substrings(n.first, n.last)) {
    const typed = normalizeQuery(t).filter((x) => x.length >= MIN_PREFIX_LENGTH);
    if (typed.length !== 1) continue; // never searched as a single term
    const indexed = set.has(typed[0]);
    const filtered = matchesAllTerms(officer, typed);
    const plainPrefix = `${n.first} ${n.last}`.toLowerCase().split(/\s+/).some((w) => w.startsWith(typed[0]));
    check(!(indexed && !filtered), `"${label(n)}" indexes "${typed[0]}" but the filter rejects it`);
    check(!(plainPrefix && !indexed), `"${label(n)}" prefix "${typed[0]}" not indexed`);
  }
  console.log(`  ${label(n).padEnd(34)} ${n.from.padEnd(11)} ${prefixes.length} prefixes`);
}

console.log(`\n${checks} checks over ${NAMES.length} names — ` + (failures === 0 ? "ALL PASS ✅" : `${failures} FAIL ❌`));
process.exitCode = failures === 0 ? 0 : 1;
