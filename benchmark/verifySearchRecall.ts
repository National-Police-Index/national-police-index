/**
 * SEARCH RECALL & LATENCY SUITE — one representative sample across all states.
 *
 * The oracle is a real officer document, not another query shape: officers are
 * sampled out of Firestore, searched for the way people actually type, and
 * must come back. Searches run through benchmark/searchPageOne.ts, which calls
 * the app's own search core, so this tests the code that ships.
 *
 * SAMPLE. Small surname windows from every state with data feed one pool;
 * officers are then picked per CASE (middle name, multi-word names, punctuated
 * / Mc / hyphenated surnames, short names, plain) round-robin across states,
 * plus a few plain officers from every state so each state's data shape (comma
 * tokens, untokenised middle names, CA prefixes, ...) is covered.
 * By default (seed 0) the windows are fixed and picks use a stable hash, so
 * runs over the same data test the same officers and compare cleanly with
 * --compare. --seed=random (for CI) draws random surname windows and picks on
 * every run, so newly uploaded data enters the sample over time; the seed is
 * printed and saved, and --seed=<n> replays that exact sample.
 *
 * CHECKS. Each officer is searched in every input STYLE that applies. A style
 * check passes when the officer is on page 1, reachable by paging (up to
 * MAX_PAGES), or hidden behind MAX_PAGES full pages of genuine matches
 * ("crowded", e.g. surname-only "smith").
 *
 * GROUND-TRUTH CHECKS. For each sampled officer's "first last" search, and for
 * each named REGRESSION, the truth is every officer with one of the given
 * exact surnames whose name matches the typed terms, scanned via last_name,
 * independently of the search tokens and the planner. Then:
 *  - page-fill: page 1 shows every truth officer, up to the page size;
 *  - all-pages: paging to the end reaches every truth officer (small truths);
 *  - count:     the app's result count (countMatches) is at least the truth.
 * The regressions pin queries that once failed; they cover every state shape
 * the sample may miss, and replace the old California-only scripts.
 *
 * MATCH SEMANTICS (the oracle's, written independently of the app): every
 * typed term, lowercased with surrounding punctuation removed, must be a
 * prefix of some name token. Tokens come from first, middle and last name
 * and the words of full_name,
 * split on spaces and hyphens, plus punctuation-free forms of each name
 * ("o'brien" -> "obrien", "mc adams" -> "mcadams").
 *
 * Run:  npx tsx benchmark/verifySearchRecall.ts [state...] [--per-case=N]
 *         [--per-state=N] [--json=path] [--compare=path] [--p95-budget=ms]
 *         [--verbose] [--no-regressions] [--seed=<n>|random]
 * Exit: 0 every check passes and latency is within budget, 1 otherwise,
 *       2 nothing could be checked.
 */
import {
  collectionGroup, query, where, orderBy, limit, startAfter,
  getDocsFromServer, QueryDocumentSnapshot, DocumentData,
} from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";
import { PoliceOfficer } from "@/types";
import { US_STATES } from "@/constants/states";
import { loadAppCode, searchPages, countSearch, withTimeout, DEFAULT_PAGE_SIZE } from "./searchPageOne";

const MAX_PAGES = 5;
/** A page that hasn't answered by now fails as a timeout instead of stalling the run. */
const PAGE_TIMEOUT_MS = 20_000;
/** Any single page-1 search slower than this fails, whatever the p95. */
const HARD_MAX_MS = 8_000;
const DEFAULT_P95_BUDGET_MS = 3_000;
/** Surnames with more records than this skip the ground-truth checks. */
const TRUTH_SCAN_CAP = 3_000;
/** Regressions may name big surnames ("smith"), so scan further. */
const REGRESSION_SCAN_CAP = 15_000;
/** The all-pages check runs when the truth fits in this many pages. */
const ALL_PAGES_MAX = 6;

/**
 * Queries that once failed, each with the exact last_name values its matches
 * are stored under (the ground truth scans those). Every query is a real
 * officer or search and every surname spelling was checked to exist
 * (2026-11-14); a regression whose truth comes back empty is reported. States without data in a
 * run are skipped.
 */
const REGRESSIONS: {
  state: string; query: string; surnames: string[]; why: string;
  /** What the oracle matches with, when it can't read `query` itself ("mc adams" = "mcadams"). */
  truthQuery?: string;
}[] = [
  { state: "california", query: "joseph goosby", surnames: ["Goosby"], why: "first name as anchor" },
  { state: "california", query: "smith john", surnames: ["Smith"], why: "both terms common, reversed" },
  { state: "california", query: "wilson", surnames: ["Wilson"], why: "single common term" },
  { state: "california", query: "zywi", surnames: ["Zywicki"], why: "partial surname, late in the alphabet" },
  { state: "california", query: "da rosa", surnames: ["DA Rosa", "Darosa"], why: "split particle, two readings" },
  { state: "california", query: "eric da gama", surnames: ["DA Gama"], why: "capitalised particle" },
  { state: "california", query: "roger carol wiberg", surnames: ["Wiberg"], why: "middle name" },
  { state: "arizona", query: "owen mc adams", surnames: ["Mcadams"], why: "Mc split vs stored joined", truthQuery: "owen mcadams" },
  { state: "arizona", query: "mardoqueu l da silva jr", surnames: ["DA Silva Jr"], why: "initial, particle, suffix" },
  { state: "indiana", query: "tyrae murphy", surnames: ["Dabney-murphy"], why: "hyphen part" },
  { state: "illinois", query: "raynaldo de la cruz", surnames: ["Delacruz", "De La Cruz", "Dela Cruz"], why: "two particles typed split, stored joined", truthQuery: "raynaldo delacruz" },
  { state: "north-carolina", query: "jose lopez", surnames: ["Lopez", "Fuentes-lopez"], why: "hyphen part behind a common pair (old tokens)" },
  { state: "florida", query: "wiblin, jerry", surnames: ["Wiblin"], why: "\"last, first\" (was 24s)" },
  { state: "ohio", query: "zeilenga", surnames: ["Zeilenga"], why: "\"Last, First\" full_name tokens" },
];

// Surname windows spread across the alphabet, including punctuation-led and
// Mc ranges and late letters a last_name-ordered truncated fetch reaches last.
const WINDOWS = ["B", "Ch", "D'", "Da ", "Ga", "Ho", "Ki", "Mc", "Mc ", "O'", "Pe", "Sa", "Wi", "Y"];
/** Kept in every seeded sample: the punctuation / particle shapes are rare. */
const SHAPE_WINDOWS = ["D'", "Da ", "Mc", "Mc ", "O'"];
const RANDOM_WINDOWS = 9;
const WINDOW_SIZE = 20;

/** Small seeded PRNG (mulberry32), so a seed replays the same sample. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Surname windows for a seed: the fixed set for 0, else shapes + random "Xy" starts. */
function windowsFor(seed: number): string[] {
  if (seed === 0) return WINDOWS;
  const r = rng(seed);
  const letter = (from: string) => from[Math.floor(r() * from.length)];
  const out = new Set(SHAPE_WINDOWS);
  while (out.size < SHAPE_WINDOWS.length + RANDOM_WINDOWS) {
    const head = letter("ABCDEFGHIJKLMNOPRSTVWY");
    out.add(head + letter("AEIOU".includes(head) ? "bdlmnrst" : "aeiou")); // "Ka", "Ol": real surname starts
  }
  return [...out];
}

type Officer = PoliceOfficer & { middle_name?: string; _state: string };

// --- name helpers (oracle side, independent of the app) ---------------------

const lc = (s: string | undefined) => (s ?? "").toLowerCase().trim();
const words = (s: string | undefined) => lc(s).split(/\s+/).filter(Boolean);
const squash = (s: string) => s.replace(/[^a-z]/g, "");
const cleanTerm = (t: string) => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");

function oracleTokens(o: Officer): string[] {
  // full_name too: it sometimes holds words the split fields lack (GA stores
  // middle "Viterialfredo" beside full_name "saenz, de viteri alfredo").
  const fullWords = lc(o.full_name).split(/[\s,]+/).map(cleanTerm);
  const names = [o.first_name, o.middle_name, o.last_name, ...fullWords].map(lc).filter(Boolean);
  const out = new Set<string>();
  for (const n of names) {
    for (const w of n.split(/\s+/)) {
      out.add(w);
      out.add(squash(w));
      for (const part of w.split("-")) out.add(part);
    }
    out.add(squash(n));
  }
  out.delete("");
  return [...out];
}

function intendedMatch(o: Officer, raw: string): boolean {
  const terms = lc(raw).split(/\s+/).map(cleanTerm).filter(Boolean);
  const toks = oracleTokens(o);
  return terms.every((t) => toks.some((tok) => tok.startsWith(t) || tok.startsWith(squash(t))));
}

// --- cases & styles ----------------------------------------------------------

const CASES: Record<string, (o: Officer) => boolean> = {
  "middle-name": (o) => lc(o.middle_name).length > 1,
  "middle-initial": (o) => lc(o.middle_name).replace(/\./g, "").length === 1,
  "multiword-first": (o) => words(o.first_name).length > 1,
  "multiword-surname": (o) => words(o.last_name).length > 1 && !/^mc\s/.test(lc(o.last_name)),
  "apostrophe-surname": (o) => o.last_name.includes("'"),
  "hyphen-surname": (o) => o.last_name.includes("-"),
  "mc-surname": (o) => /^ma?c\s?[a-z]/.test(lc(o.last_name)),
  "short-name": (o) => lc(o.first_name).length <= 2 || lc(o.last_name).length <= 2,
  "plain": (o) => words(o.first_name).length === 1 && words(o.last_name).length === 1 && /^[a-z]+$/.test(lc(o.last_name)),
};

interface Style {
  key: string;
  build: (o: Officer) => string | null;
}

const first = (o: Officer) => lc(o.first_name);
const last = (o: Officer) => lc(o.last_name);

const STYLES: Style[] = [
  { key: "first last", build: (o) => `${first(o)} ${last(o)}` },
  { key: "last first", build: (o) => `${last(o)} ${first(o)}` },
  { key: "last, first", build: (o) => `${last(o)}, ${first(o)}` },
  { key: "messy case/spacing", build: (o) => `  ${o.first_name.toUpperCase()}   ${o.last_name}  ` },
  { key: "surname only", build: (o) => last(o) },
  {
    key: "partial surname",
    build: (o) => (words(o.last_name).length === 1 && last(o).length >= 6 ? `${first(o)} ${last(o).slice(0, 4)}` : null),
  },
  {
    key: "partial first name",
    build: (o) => (words(o.first_name).length === 1 && first(o).length >= 5 ? `${first(o).slice(0, 3)} ${last(o)}` : null),
  },
  {
    key: "first middle last",
    build: (o) => (lc(o.middle_name).length > 1 ? `${first(o)} ${lc(o.middle_name)} ${last(o)}` : null),
  },
  {
    key: "first initial last",
    build: (o) => (lc(o.middle_name) ? `${first(o)} ${lc(o.middle_name).charAt(0)} ${last(o)}` : null),
  },
  {
    key: "surname w/o punctuation",
    build: (o) => (/['.]/.test(o.last_name) ? `${first(o)} ${last(o).replace(/['.]/g, "")}` : null),
  },
  {
    key: "mc joined/split",
    build: (o) => {
      const m = last(o).match(/^(ma?c)(\s?)([a-z].*)$/);
      if (!m) return null;
      return `${first(o)} ${m[2] ? `${m[1]}${m[3]}` : `${m[1]} ${m[3]}`}`;
    },
  },
  {
    key: "multiword surname joined",
    build: (o) => (words(o.last_name).length > 1 ? `${first(o)} ${words(o.last_name).join("")}` : null),
  },
  {
    key: "hyphen part",
    build: (o) => {
      const parts = last(o).split("-");
      return parts.length > 1 && parts[parts.length - 1].length >= 3 ? `${first(o)} ${parts[parts.length - 1]}` : null;
    },
  },
];

interface Check {
  state: string;
  style: string;
  query: string;
  person: string;
  name: string;
  cases: string[];
  found: boolean;
  /** 1-based page found on, -1 crowded, 0 not found. */
  page: number;
  ms: number;
  fetched: number;
  shape: string;
  error?: string;
  truth?: number;
  truthOnPage1?: number;
}

// --- deterministic sampling ----------------------------------------------------

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const casesOf = (o: Officer) => Object.entries(CASES).filter(([, f]) => f(o)).map(([k]) => k);

async function stateWindows(state: string, windows: string[]): Promise<Officer[]> {
  const { db } = await loadAppCode();
  const out: Officer[] = [];
  const snaps = await Promise.all(windows.map((w) =>
    getDocsFromServer(query(
      collectionGroup(db, "db_launch"), where("state", "==", state),
      where("last_name", ">=", w), orderBy("last_name", "asc"), limit(WINDOW_SIZE),
    )).catch((e) => { console.log(`  window "${w}" failed for ${state}: ${(e as Error).message.slice(0, 160)}`); return null; })
  ));
  for (const s of snaps) for (const d of s?.docs ?? []) out.push({ ...(d.data() as PoliceOfficer), _state: state });
  return out;
}

function pickPool(byState: Map<string, Officer[]>, perCase: number, perState: number, seed: number): Officer[] {
  const rank = (o: Officer) => stableHash(seed === 0 ? o.person_nbr : `${seed}:${o.person_nbr}`);
  const usable = new Map<string, Officer[]>();
  for (const [state, list] of byState) {
    const seen = new Set<string>();
    usable.set(state, list
      .filter((o) => o.first_name && o.last_name && o.person_nbr && !/\d/.test(`${o.first_name} ${o.last_name}`))
      .filter((o) => !seen.has(o.person_nbr) && !!seen.add(o.person_nbr))
      .sort((a, b) => rank(a) - rank(b)));
  }

  const chosen = new Map<string, Officer>();
  const key = (o: Officer) => `${o._state}|${o.person_nbr}`;
  const states = [...usable.keys()].sort();

  // Every case, round-robin across states.
  for (const c of Object.keys(CASES)) {
    let taken = 0;
    for (let round = 0; taken < perCase && round < 50; round++) {
      let progressed = false;
      for (const s of states) {
        if (taken >= perCase) break;
        const hits = usable.get(s)!.filter((o) => CASES[c](o) && !chosen.has(key(o)));
        if (hits.length) { chosen.set(key(hits[0]), hits[0]); taken++; progressed = true; }
      }
      if (!progressed) break;
    }
  }
  // A few officers from every state, for per-state data shapes.
  for (const s of states) {
    const already = [...chosen.values()].filter((o) => o._state === s).length;
    for (const o of usable.get(s)!.filter((o) => !chosen.has(key(o))).slice(0, Math.max(0, perState - already))) {
      chosen.set(key(o), o);
    }
  }
  return [...chosen.values()];
}

// --- ground truth --------------------------------------------------------------

/** Officers stored under any of these exact surnames who match `raw`; null past the cap. */
async function surnameTruth(state: string, lastNames: string[], raw: string, cap = TRUTH_SCAN_CAP): Promise<Set<string> | null> {
  const { db } = await loadAppCode();
  const found = new Set<string>();
  let read = 0;
  for (const lastName of lastNames) {
    let cursor: QueryDocumentSnapshot<DocumentData> | null = null;
    for (;;) {
      let q = query(collectionGroup(db, "db_launch"), where("state", "==", state),
        where("last_name", "==", lastName), orderBy("last_name"), limit(1000));
      if (cursor) q = query(q, startAfter(cursor));
      const snap = await getDocsFromServer(q);
      read += snap.size;
      for (const d of snap.docs) {
        const o = { ...(d.data() as PoliceOfficer), _state: state };
        if (intendedMatch(o, raw)) found.add(o.person_nbr);
      }
      if (snap.size < 1000) break;
      if (read >= cap) return null;
      cursor = snap.docs[snap.docs.length - 1];
    }
  }
  return found;
}

// --- running checks ---------------------------------------------------------------

function baseCheck(o: Officer, style: string, raw: string) {
  return {
    state: o._state, style, query: raw, person: o.person_nbr,
    name: [o.first_name, o.middle_name, o.last_name].filter(Boolean).join(" "),
    cases: casesOf(o),
  };
}

async function runStyle(o: Officer, style: string, raw: string): Promise<Check> {
  const base = baseCheck(o, style, raw);
  try {
    const [p1] = await searchPages(o._state, raw, 1, { pageTimeoutMs: PAGE_TIMEOUT_MS });
    let found = p1.shown.has(o.person_nbr);
    let page = found ? 1 : 0;
    if (!found && p1.hasNextPage) {
      const pages = await searchPages(o._state, raw, MAX_PAGES, { pageTimeoutMs: PAGE_TIMEOUT_MS });
      const at = pages.findIndex((p) => p.shown.has(o.person_nbr));
      if (at >= 0) {
        found = true;
        page = at + 1;
      } else if (pages.length === MAX_PAGES && pages.every((p) => p.shown.size === DEFAULT_PAGE_SIZE)) {
        found = true;
        page = -1;
      }
    }
    return { ...base, found, page, ms: p1.ms, fetched: p1.fetched, shape: p1.shape };
  } catch (e) {
    return { ...base, found: false, page: 0, ms: 0, fetched: 0, shape: "error", error: (e as Error).message.slice(0, 140) };
  }
}

type CheckBase = ReturnType<typeof baseCheck>;

/** page-fill, all-pages and count checks of `raw` against a surname ground truth. */
async function runTruthChecks(
  base: (style: string) => CheckBase, state: string, raw: string, surnames: string[], cap = TRUTH_SCAN_CAP,
  truthQuery = raw
): Promise<Check[]> {
  let truth: Set<string> | null;
  try {
    truth = await surnameTruth(state, surnames, truthQuery, cap);
  } catch (e) {
    return [{ ...base("page-fill"), found: false, page: 0, ms: 0, fetched: 0, shape: "error", error: `truth: ${(e as Error).message.slice(0, 120)}` }];
  }
  if (!truth || truth.size === 0) return [];
  const out: Check[] = [];
  try {
    // page-fill: page 1 shows every truth officer up to the page size, or
    // is full of other genuine matches ("wilson" also matches first names).
    const pageCount = truth.size <= ALL_PAGES_MAX * DEFAULT_PAGE_SIZE ? 4 * ALL_PAGES_MAX : 1;
    const pages = await searchPages(state, raw, pageCount, { pageTimeoutMs: PAGE_TIMEOUT_MS });
    const p1 = pages[0];
    const expected = Math.min(truth.size, DEFAULT_PAGE_SIZE);
    const onPage = [...p1.shown].filter((p) => truth.has(p)).length;
    const fullOfMatches = p1.officers.length === DEFAULT_PAGE_SIZE &&
      p1.officers.every((o) => intendedMatch({ ...o, _state: state }, truthQuery));
    out.push({
      ...base("page-fill"), found: onPage >= expected || fullOfMatches, page: 1, ms: p1.ms, fetched: p1.fetched, shape: p1.shape,
      truth: truth.size, truthOnPage1: onPage,
    });

    // all-pages: page to the end (pages can run sparse, so allow 4x the
    // pages the truth alone needs) and every truth officer must appear.
    if (pageCount > 1) {
      const seen = new Set(pages.flatMap((p) => [...p.shown]));
      const reached = [...truth].filter((p) => seen.has(p)).length;
      out.push({
        ...base("all-pages"), found: reached === truth.size, page: pages.length,
        ms: pages.reduce((n, p) => n + p.ms, 0), fetched: pages.reduce((n, p) => n + p.fetched, 0),
        shape: p1.shape, truth: truth.size, truthOnPage1: reached,
      });
    }

    // count: the shown total must cover the truth (it may include matches
    // under other surnames). A capped count is a lower bound and passes.
    const c = await withTimeout(countSearch(state, raw), PAGE_TIMEOUT_MS, "count");
    out.push({
      ...base("count"), found: c.capped || c.count >= truth.size, page: 1, ms: c.ms, fetched: c.reads,
      shape: p1.shape, truth: truth.size, truthOnPage1: c.count,
    });
  } catch (e) {
    out.push({ ...base("page-fill"), found: false, page: 0, ms: 0, fetched: 0, shape: "error", error: (e as Error).message.slice(0, 140) });
  }
  return out;
}

// --- reporting ------------------------------------------------------------------------

const pct = (xs: number[], p: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0;
};

interface Row { key: string; checks: number; passRate: number; p50: number; p95: number; reads50: number }

function rows(checks: Check[], keyOf: (c: Check) => string[]): Row[] {
  const keys = [...new Set(checks.flatMap(keyOf))];
  return keys.map((key) => {
    const cs = checks.filter((c) => keyOf(c).includes(key));
    const ok = cs.filter((c) => !c.error);
    return {
      key, checks: cs.length,
      passRate: cs.filter((c) => c.found).length / cs.length,
      p50: pct(ok.map((c) => c.ms), 0.5), p95: pct(ok.map((c) => c.ms), 0.95),
      reads50: pct(ok.map((c) => c.fetched), 0.5),
    };
  });
}

function printRows(title: string, rs: Row[], prev?: Row[]) {
  console.log(`\n${title.padEnd(26)} checks  recall          p50ms  p95ms  reads(p50)`);
  for (const r of rs) {
    const p = prev?.find((x) => x.key === r.key);
    const delta = p ? `(${r.passRate >= p.passRate ? "+" : ""}${((r.passRate - p.passRate) * 100).toFixed(0)})` : "";
    console.log(
      `${r.key.padEnd(26)} ${String(r.checks).padStart(6)}  ${(r.passRate * 100).toFixed(0).padStart(4)}% ${delta.padEnd(7)}  ` +
      `${r.p50.toFixed(0).padStart(5)}  ${r.p95.toFixed(0).padStart(5)}  ${String(r.reads50).padStart(9)}`
    );
  }
}

function describe(c: Check): string {
  const kind = c.style.replace(/^regression /, "");
  const what = kind === "page-fill"
    ? `page 1 shows ${c.truthOnPage1} of ${c.truth} matching officer(s)`
    : kind === "all-pages" ? `${c.page} page(s) reach ${c.truthOnPage1} of ${c.truth} matching officer(s)`
    : kind === "count" ? `count ${c.truthOnPage1}, ground truth ${c.truth}`
    : c.error ? `ERROR ${c.error}`
    : c.found ? (c.page === -1 ? "crowded" : `found on page ${c.page}`)
    : `"${c.name}" (${c.person}) not reachable in ${MAX_PAGES} pages`;
  return `${c.state} [${c.style}] "${c.query}" -> ${what}  [${c.shape}, read ${c.fetched}, ${c.ms.toFixed(0)}ms]`;
}

async function main() {
  await loadAppCode();
  const args = process.argv.slice(2);
  const arg = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
  const perCase = parseInt(arg("per-case") ?? "8", 10);
  const perState = parseInt(arg("per-state") ?? "2", 10);
  const seedArg = arg("seed") ?? "0";
  const seed = seedArg === "random" ? 1 + Math.floor(Math.random() * 2 ** 31) : parseInt(seedArg, 10) || 0;
  const windows = windowsFor(seed);
  console.log(`seed ${seed}${seed === 0 ? " (fixed sample)" : ""}  windows ${JSON.stringify(windows)}  (replay: --seed=${seed})`);
  const p95Budget = parseInt(arg("p95-budget") ?? String(DEFAULT_P95_BUDGET_MS), 10);
  const verbose = args.includes("--verbose");
  const only = args.filter((a) => !a.startsWith("--"));
  const states = only.length
    ? only
    : US_STATES.filter((s) => s.hasData && !s.reference.includes("discipline")).map((s) => s.reference);
  const t0 = Date.now();

  // 1. sample
  const byState = new Map<string, Officer[]>();
  // One state at a time: firing every state's windows at once (~300 queries)
  // overwhelms the client channel and they all fail.
  for (const s of states) {
    const docs = await stateWindows(s, windows);
    if (docs.length) byState.set(s, docs);
  }
  const skipped = states.filter((s) => !byState.has(s));
  if (skipped.length) console.log(`no data / not searchable, skipped: ${skipped.join(", ")}`);
  const pool = pickPool(byState, perCase, perState, seed);
  const caseCounts = Object.keys(CASES).map((c) => `${c} ${pool.filter((o) => CASES[c](o)).length}`);
  console.log(`sample: ${pool.length} officers from ${new Set(pool.map((o) => o._state)).size} states  (${caseCounts.join(", ")})\n`);

  // 2. check (sequential, so latency isn't distorted by our own concurrency)
  const checks: Check[] = [];
  for (const o of pool) {
    for (const style of STYLES) {
      const raw = style.build(o);
      if (raw === null) continue;
      const c = await runStyle(o, style.key, raw);
      checks.push(c);
      if (verbose || !c.found) console.log(`${c.found ? "  ✅" : "  ❌"} ${describe(c)}`);
    }
    const raw = `${first(o)} ${last(o)}`;
    for (const c of await runTruthChecks((style) => baseCheck(o, style, raw), o._state, raw, [o.last_name])) {
      checks.push(c);
      if (verbose || !c.found) console.log(`${c.found ? "  ✅" : "  ❌"} ${describe(c)}`);
    }
  }

  // 2b. named regressions
  if (!args.includes("--no-regressions")) {
    for (const r of REGRESSIONS.filter((r) => byState.has(r.state))) {
      const base = (style: string): CheckBase => ({
        state: r.state, style: `regression ${style}`, query: r.query, person: "-", name: r.why, cases: ["regression"],
      });
      const rs = await runTruthChecks(base, r.state, r.query, r.surnames, REGRESSION_SCAN_CAP, r.truthQuery);
      if (!rs.length) console.log(`  ⚠️  regression "${r.query}" (${r.state}): no ground truth found, skipped`);
      for (const c of rs) {
        checks.push(c);
        if (verbose || !c.found) console.log(`${c.found ? "  ✅" : "  ❌"} ${describe(c)}`);
      }
    }
  }
  if (!checks.length) {
    console.log("\nNO CHECKS RAN ❌ could not reach Firestore or sample any officers");
    process.exit(2);
  }

  // 3. report
  let prev: { styles?: Row[]; cases?: Row[]; states?: Row[] } = {};
  const comparePath = arg("compare");
  if (comparePath) {
    try { prev = JSON.parse(fs.readFileSync(comparePath, "utf8")).summary; } catch { console.log(`could not read ${comparePath}`); }
  }
  const summary = {
    styles: rows(checks, (c) => [c.style]),
    cases: rows(checks, (c) => c.cases),
    states: rows(checks, (c) => [c.state]),
  };
  printRows("by input style", summary.styles, prev.styles);
  printRows("by name case", summary.cases, prev.cases);
  printRows("by state", summary.states, prev.states);

  // The budget is for what a user waits on: page 1 of a search. all-pages
  // sums many pages, and the count loads in the background after results
  // render, so it is reported on its own.
  const isPageOne = (c: Check) => !/(all-pages|count)$/.test(c.style);
  const ms = checks.filter((c) => !c.error && isPageOne(c)).map((c) => c.ms);
  const countMs = checks.filter((c) => !c.error && c.style.endsWith("count")).map((c) => c.ms);
  const p95 = pct(ms, 0.95);
  const slow = checks.filter((c) => isPageOne(c) && c.ms > HARD_MAX_MS);
  const fails = checks.filter((c) => !c.found);
  const shapes: Record<string, number> = {};
  for (const c of checks) shapes[c.shape] = (shapes[c.shape] ?? 0) + 1;
  console.log(`\nquery shapes: ${JSON.stringify(shapes)}`);
  console.log(`latency: p50 ${pct(ms, 0.5).toFixed(0)}ms  p95 ${p95.toFixed(0)}ms (budget ${p95Budget})  max ${Math.max(...ms).toFixed(0)}ms  (page 1)`);
  if (countMs.length) {
    console.log(`count latency (background): p50 ${pct(countMs, 0.5).toFixed(0)}ms  p95 ${pct(countMs, 0.95).toFixed(0)}ms  max ${Math.max(...countMs).toFixed(0)}ms`);
  }
  for (const c of slow) console.log(`  🐢 over ${HARD_MAX_MS}ms: ${describe(c)}`);
  console.log(`runtime ${((Date.now() - t0) / 60000).toFixed(1)} min`);

  const outPath = arg("json") ?? path.join("benchmark", "results", `recall-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ when: new Date().toISOString(), seed, windows, states, perCase, perState, summary, p95, checks }, null, 2));
  console.log(`results: ${outPath}`);

  const latencyOk = p95 <= p95Budget && slow.length === 0;
  const ok = fails.length === 0 && latencyOk;
  console.log(ok
    ? `\nALL PASS ✅ ${checks.length} checks, ${pool.length} officers`
    : `\nFAIL ❌ ${fails.length}/${checks.length} checks failed${latencyOk ? "" : "; latency over budget"}`);
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
