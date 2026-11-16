/**
 * SEARCH TOKEN CONTRACT — offline, no Firestore. Proves the tokens the data
 * pipeline stores agree with the search code's client filter, for every state:
 *
 *  1. searchQueries (scripts/addSearchQueriesByState.ts -> searchTokens):
 *     every stored token, typed as a search, must pass matchesAllTerms, or the
 *     server returns officers the page then silently drops; and every word of
 *     first / middle / last name (and its punctuation-free form and hyphen
 *     parts) must be stored, or array-contains on it finds nobody.
 *  2. name_prefixes (scripts/addNamePrefixesByState.ts, every state), the
 *     field name search queries: for every substring of every name word,
 *     typed as a search, the field holds its prefixKey exactly when the
 *     client filter accepts it. So the server never misses an officer the
 *     filter would show, nor returns one it would drop.
 *
 * Run:  npx tsx benchmark/verifySearchTokens.ts
 * Exit: 0 all pass, 1 any failure.
 */
import { PoliceOfficer } from "@/types";
import { matchesAllTerms, normalizeQuery, searchTokens, namePrefixes, prefixKey, MIN_PREFIX_LENGTH } from "@/lib/officerSearch";

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

/** Every substring (len >= 2) of every word, plus a few never-present strings. */
function substrings(name: string): Set<string> {
  const out = new Set<string>();
  for (const tok of name.toLowerCase().split(/[\s,]+/).filter(Boolean)) {
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

console.log("\nname_prefixes (all states; the field name search queries)");
for (const n of NAMES) {
  const record = { first_name: n.first, middle_name: n.middle, last_name: n.last, full_name: n.full };
  const officer = record as PoliceOfficer;
  const prefixes = namePrefixes(record);
  const set = new Set(prefixes);

  check(prefixes.length === set.size, `"${label(n)}" duplicate prefixes`);
  for (const p of prefixes) check(p.length >= MIN_PREFIX_LENGTH && !/[\s,]/.test(p), `"${label(n)}" bad prefix ${JSON.stringify(p)}`);
  // Exact contract: the server holds a typed term's key exactly when the
  // client filter accepts the term, so search neither misses nor drops.
  for (const t of substrings([n.first, n.middle ?? "", n.last, n.full].join(" "))) {
    const typed = normalizeQuery(t);
    if (typed.length !== 1 || prefixKey(typed[0]).length < MIN_PREFIX_LENGTH) continue; // initials: client-only
    const indexed = set.has(prefixKey(typed[0]));
    const filtered = matchesAllTerms(officer, typed);
    check(!(indexed && !filtered), `"${label(n)}" indexes "${typed[0]}" but the filter rejects it`);
    check(!(filtered && !indexed), `"${label(n)}" filter accepts "${typed[0]}" but it isn't indexed`);
  }
  console.log(`  ${label(n).padEnd(34)} ${n.from.padEnd(11)} ${prefixes.length} prefixes`);
}

console.log(`\n${checks} checks over ${NAMES.length} names — ` + (failures === 0 ? "ALL PASS ✅" : `${failures} FAIL ❌`));
process.exitCode = failures === 0 ? 0 : 1;
