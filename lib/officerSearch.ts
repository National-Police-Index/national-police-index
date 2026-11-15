// Officer search core: query planning, fetching and page assembly, with no
// React state.
//
// useOfficersByUid calls these to build every page, and the search benchmarks
// under benchmark/ call the very same functions, so a benchmark always
// measures the search that ships instead of a hand-copied replica.

import {
  collectionGroup,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getCountFromServer,
  startAfter,
  or,
  DocumentData,
  Firestore,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

import { PoliceOfficer } from "@/types";

// ---------------------------------------------------------------------------
// Token fields
//
// Name search reads `name_prefixes` (scripts/addNamePrefixesByState.ts): every
// prefix of length >= 2 of every name token (see searchTokens), in
// punctuation-free form. A typed term matches a record on the client
// (termMatches) exactly when name_prefixes holds prefixKey(term), so the
// server never misses an officer the filter would accept and never returns
// one it would drop.
//
// `searchQueries` (whole words, older pipeline) is still read by searches
// with digits (badge numbers) and by name searches with an agency filter or
// a date / agency sort, which have indexes on it and none on name_prefixes.
// ---------------------------------------------------------------------------

export const NAME_PREFIX_FIELD = "name_prefixes";
/** Shorter terms (initials) are too unselective to index; they're checked on the client. */
export const MIN_PREFIX_LENGTH = 2;

// ---------------------------------------------------------------------------
// Query normalisation and matching
// ---------------------------------------------------------------------------

// Letters and digits in any script, so "josé" and "muñoz" keep their accents.
const squash = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
const trimPunct = (s: string) => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** One name word's searchable forms: trimmed, punctuation-free, hyphen parts. */
function addWordForms(out: Set<string>, w: string): void {
  const word = trimPunct(w);
  if (!word) return;
  out.add(word).add(squash(word));
  for (const part of word.split("-")) out.add(part).add(squash(part));
}

/**
 * Lowercased search terms: commas and surrounding punctuation dropped
 * ("smith, john" -> ["smith", "john"]), internal apostrophes and hyphens kept,
 * duplicates removed.
 */
export function normalizeQuery(raw: string): string[] {
  const terms = raw
    .toLowerCase()
    .replace(/,/g, " ")
    .split(/\s+/)
    .map(trimPunct)
    .filter(Boolean);
  return [...new Set(terms)];
}

// Surname particles people type either joined or split ("mcarthur" /
// "mc arthur", "darosa" / "da rosa"); states store them either way too.
const PARTICLES = ["mc", "mac", "da", "de", "del", "della", "di", "du", "la", "le", "van", "von", "st", "o", "d"];

/**
 * The term sets a query may mean: as typed, and with split particles joined
 * to the next term ("mitchell mc arthur" -> also "mitchell mcarthur").
 */
export function termAlternatives(terms: string[]): string[][] {
  const joined: string[] = [];
  for (let i = 0; i < terms.length; i++) {
    if (PARTICLES.includes(terms[i]) && i + 1 < terms.length) {
      joined.push(terms[i] + terms[i + 1]);
      i++;
    } else {
      joined.push(terms[i]);
    }
  }
  return joined.length === terms.length ? [terms] : [terms, joined];
}

/**
 * Lowercased tokens an officer can be found by: each word of first, middle
 * and last name (surrounding punctuation trimmed), its punctuation-free form,
 * its hyphen parts, and each whole name with spaces and punctuation removed
 * ("O'brien" -> "o'brien", "obrien"; "Da Rosa" -> "da", "rosa", "darosa";
 * "Abee-ramirez" -> "abee", "ramirez").
 */
export function nameTokens(officer: PoliceOfficer): string[] {
  const out = new Set<string>();
  for (const name of [officer.first_name, officer.middle_name, officer.last_name]) {
    const n = (name ?? "").toLowerCase();
    if (!n.trim()) continue;
    for (const w of n.split(/[\s,]+/)) addWordForms(out, w);
    out.add(squash(n));
  }
  out.delete("");
  return [...out];
}

/**
 * The `searchQueries` array the data pipeline (scripts/addSearchQueriesByState.ts)
 * stores: nameTokens plus the same forms of every full_name word, so "Last,
 * First" full names yield "last", never "last,". Built from the very function
 * the client matcher uses, so stored tokens and matching can't drift apart.
 */
export function searchTokens(record: {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
}): string[] {
  const out = new Set(nameTokens(record as PoliceOfficer));
  for (const w of (record.full_name ?? "").toLowerCase().split(/[\s,]+/)) addWordForms(out, w);
  out.delete("");
  return [...out];
}

/** The name_prefixes key a typed term is looked up by: its punctuation-free form. */
export function prefixKey(term: string): string {
  return squash(term);
}

/**
 * The `name_prefixes` array scripts/addNamePrefixesByState.ts stores: every
 * prefix (length >= MIN_PREFIX_LENGTH) of the punctuation-free form of every
 * searchTokens token. Every token's punctuation-free form is itself a token,
 * and dropping punctuation from a prefix leaves a prefix of the squashed
 * token, so a term passes termMatches exactly when this array holds
 * prefixKey(term) (for keys of at least MIN_PREFIX_LENGTH).
 */
export function namePrefixes(record: {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
}): string[] {
  const out = new Set<string>();
  for (const tok of searchTokens(record)) {
    const flat = squash(tok);
    for (let len = MIN_PREFIX_LENGTH; len <= flat.length; len++) out.add(flat.slice(0, len));
  }
  return [...out];
}

function termMatches(tokens: string[], term: string): boolean {
  const flat = squash(term);
  return tokens.some((tok) => tok.startsWith(term) || (flat !== "" && tok.startsWith(flat)));
}

// Every typed term must be a prefix of some name token (first, middle, last
// or full_name; see searchTokens, the very tokens the pipeline stores, so the
// server never returns an officer this filter then drops), in any order. Enforced on the client over whatever
// candidate set the server returned.
export function matchesAllTerms(officer: PoliceOfficer, terms: string[]): boolean {
  const tokens = searchTokens(officer);
  return terms.every((t) => termMatches(tokens, t));
}

/** True when the officer matches any of the query's term alternatives. */
export function matchesQuery(officer: PoliceOfficer, alternatives: string[][]): boolean {
  if (!alternatives.length) return true;
  const tokens = searchTokens(officer);
  return alternatives.some((terms) => terms.every((t) => termMatches(tokens, t)));
}

// ---------------------------------------------------------------------------
// Surname ranges
//
// last_name is stored capitalised ("Smith", "O'brien", "Mc Adams" or
// "Mcadams", "Da Rosa"), and a Firestore range is case-sensitive, so a typed
// surname becomes one or more capitalised range starts. U+F8FF sorts above
// any character used in a name.
// ---------------------------------------------------------------------------

const NAME_RANGE_HIGH = String.fromCharCode(0xf8ff);

export function titleCaseTerm(term: string): string {
  return term.charAt(0).toUpperCase() + term.slice(1);
}

/** Every capitalised spelling a typed surname term may be stored under. */
export function surnameRangeStarts(term: string): string[] {
  const starts = new Set<string>([titleCaseTerm(term)]);
  const flat = squash(term);
  if (flat && flat !== term) starts.add(titleCaseTerm(flat)); // typed "o'brien", stored "Obrien"
  if (/^[odl][a-z]{3,}$/.test(flat)) {
    const head = flat[0].toUpperCase();
    starts.add(`${head}'${flat.slice(1)}`); // typed "obrien", stored "O'brien"
    starts.add(`${head}' ${titleCaseTerm(flat.slice(1))}`); // stored "O' Brien" (FL)
  }
  for (const p of PARTICLES) {
    if (p.length < 2 || !term.startsWith(p) || term.length - p.length < 3) continue;
    const rest = term.slice(p.length);
    starts.add(`${titleCaseTerm(p)} ${titleCaseTerm(rest)}`); // typed "mcadams", stored "Mc Adams"
    starts.add(`${titleCaseTerm(p)} ${rest}`);
    starts.add(`${p.toUpperCase()} ${titleCaseTerm(rest)}`); // stored "DA Gama"
  }
  return [...starts];
}

function lastNameRange(start: string): QueryConstraint[] {
  return [where("last_name", ">=", start), where("last_name", "<", start + NAME_RANGE_HIGH)];
}

/** Client-side replica of lastNameRange. */
function inLastNameRange(doc: DocumentData, start: string): boolean {
  const l = String(doc.last_name ?? "");
  return l >= start && l < start + NAME_RANGE_HIGH;
}

function tokenListHas(doc: DocumentData, field: string, term: string): boolean {
  const v = doc[field];
  return Array.isArray(v) && v.includes(term);
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

/** Search inputs after the hook's defaulting (query already lowercased). */
export interface SearchInput {
  state: string;
  query: string;
  agency: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
  pageSize: number;
}

export interface SearchPlan {
  /**
   * One or more queries ("arms"), each with every filter and its orderBy but
   * no limit or cursor. Plans with more than one arm always sort by
   * (last_name asc, document path).
   */
  arms: Query<DocumentData>[];
  /**
   * Arm indices per tier, in display order. Pages show every result of a
   * tier before the next, so precise arms (the name proved by a token plus a
   * surname) outrank broad ones (a whole surname range, any typed word):
   * "an le" shows An Le before the many Leonard Andersons.
   */
  tiers: number[][];
  /**
   * Client replica of each arm's server filter, so a later tier can skip the
   * docs an earlier tier already showed. Empty for single-tier plans.
   */
  armTests: ((doc: DocumentData) => boolean)[];
  /** Docs per arm per fetch window. */
  windowSize: number;
  /** Fetch windows a single page may scan before it stops short. */
  maxWindows: number;
  /** Results must match one of these term sets on the client ([] = no filter). */
  matchAlternatives: string[][];
  clientStartIso: string | null;
  clientEndIso: string | null;
  /** Which query shape was chosen, for benchmarks and debugging. */
  shape: string;
}

/** Docs a probe reads to judge a candidate arm. */
const PROBE_LIMIT = 20;
/**
 * How long the planner waits for the per-term counts that pick the rarest
 * term. They run alongside the probes; a count that hasn't answered by then
 * counts as "too common to pick".
 */
const TERM_COUNT_TIMEOUT_MS = 2_000;
/**
 * The rarest-term arm is added only when that term is this rare: it bounds
 * the arm's reads, and the counts stop at it so they stay fast. When every
 * term is more common, the matches it could add sit behind many others.
 */
const RARE_ARM_MAX = 1_000;
/** Upper bound on candidate arms probed per search (one parallel round trip). */
const MAX_PROBES = 24;
/** Terms (longest first) considered as anchor or surname. */
const MAX_PLAN_TERMS = 4;
/** Name-search windows: tight arms, a few windows so sparse matches fill page 1. */
const NAME_WINDOW_MULTIPLIER = 10;
const NAME_MAX_WINDOWS = 5;

interface Candidate {
  key: string;
  kind: "pair" | "surname" | "token" | "any";
  surname?: string;
  /** Pair arms: the anchor term and the last_name range start. */
  anchor?: string;
  start?: string;
  constraints: QueryConstraint[];
  /** Client replica of `constraints`. */
  test: (doc: DocumentData) => boolean;
}

/**
 * Name search over the token field plus last_name, built to find every
 * officer whose name matches the typed terms (see matchesQuery), whatever
 * order, spelling of particles or punctuation the user and the data use.
 *
 * Which typed term is the surname is unknown, so candidate arms are:
 *  - pair:    token field contains term A, last_name starts with term B
 *             (each spelling of B), for every ordered pair of terms;
 *  - surname: last_name starts with term B alone, which catches what pair
 *             arms can't anchor (partial first names outside CA, surname
 *             words stored with punctuation such as "zeilenga,");
 *  - token:   token field contains one term (single-term searches);
 *  - any:     token field contains any typed term, added unprobed when no
 *             pair arm hit, for surnames no range start reaches.
 *
 * All candidates are probed in one parallel round trip. Every arm whose probe
 * holds a genuine match is kept, so ambiguous queries keep every reading
 * ("da rosa" is both Daniel Rosa and anyone surnamed Da Rosa). A surname arm
 * is dropped when a pair arm on the same surname already hit, since it is the
 * same officers plus many non-matches.
 */
async function planNameSearch(
  base: Query<DocumentData>,
  raw: string
): Promise<{
  arms: Query<DocumentData>[];
  tiers: number[][];
  armTests: ((doc: DocumentData) => boolean)[];
  alternatives: string[][];
  shape: string;
} | null> {
  const terms = normalizeQuery(raw);
  if (!terms.length) return null;
  const alternatives = termAlternatives(terms);

  // Anchor / surname candidates come from every alternative; single letters
  // (initials) are far too unselective to anchor or range on, so they are
  // only checked on the client. The likely surnames always make the cut — a
  // joined particle form, the last and the first typed term — and the rest
  // fill up by length ("an thien dinh huu le" keeps "le" and "an").
  const joinedForms = alternatives.flat().filter((t) => !terms.includes(t));
  const byLength = [...terms].sort((a, b) => b.length - a.length);
  const planTerms = [...new Set([...joinedForms, terms[terms.length - 1], terms[0], ...byLength])]
    .filter((t) => t.length >= 2)
    .slice(0, MAX_PLAN_TERMS);
  if (!planTerms.length) return null;

  // name_prefixes holds every prefix of every name word (middle names and
  // hyphen parts included), so a token arm on a term proves that term
  // matched: pair arms are tight. Terms are looked up by their prefixKey.
  const tokenField = NAME_PREFIX_FIELD;
  const anchorable = (t: string) => prefixKey(t).length >= MIN_PREFIX_LENGTH;

  const candidates: Candidate[] = [];
  const add = (c: Candidate) => {
    if (!candidates.some((x) => x.key === c.key)) candidates.push(c);
  };

  if (planTerms.length === 1) {
    const t = planTerms[0];
    if (anchorable(t)) {
      const k = prefixKey(t);
      add({
        key: `token:${k}`,
        kind: "token",
        constraints: [where(tokenField, "array-contains", k)],
        test: (d) => tokenListHas(d, tokenField, k),
      });
    }
  }
  // Surname preference: the last typed term or a joined particle form
  // ("dagama"), then the first, then the rest.
  const ordered = [...planTerms].sort((a, b) => {
    const rank = (t: string) =>
      t === terms[terms.length - 1] || !terms.includes(t) ? 0 : t === terms[0] ? 1 : 2;
    return rank(a) - rank(b);
  });
  for (const surname of ordered) {
    for (const start of surnameRangeStarts(surname)) {
      for (const anchor of planTerms.filter((t) => t !== surname && anchorable(t)).slice(0, 2)) {
        const k = prefixKey(anchor);
        add({
          key: `pair:${k}:${start}`,
          kind: "pair",
          surname,
          anchor: k,
          start,
          constraints: [where(tokenField, "array-contains", k), ...lastNameRange(start)],
          test: (d) => tokenListHas(d, tokenField, k) && inLastNameRange(d, start),
        });
      }
      add({
        key: `surname:${start}`,
        kind: "surname",
        surname,
        constraints: lastNameRange(start),
        test: (d) => inLastNameRange(d, start),
      });
    }
  }
  const probed = candidates.slice(0, MAX_PROBES);

  // Every match holds every typed term, so the officers holding the rarest
  // term contain them all: one arm on it is complete, at the lowest cost any
  // complete arm can have. Counted per term (index-only, cheap) alongside the
  // probes, up to RARE_ARM_MAX. Only terms in every alternative qualify ("mc
  // adams" may match as "mcadams", which holds no "adams" prefix).
  const countable = planTerms.filter((t) => anchorable(t) && alternatives.every((alt) => alt.includes(t)));
  const countsP = Promise.all(
    countable.map((t) =>
      Promise.race([
        // orderBy last_name: the (state, name_prefixes, last_name) index
        // serves it; without the sort Firestore would need another index.
        getCountFromServer(
          query(
            base,
            where(tokenField, "array-contains", prefixKey(t)),
            orderBy("last_name", "asc"),
            limit(RARE_ARM_MAX + 1)
          )
        ).then(
          (r) => r.data().count
        ),
        new Promise<number>((resolve) => setTimeout(() => resolve(Infinity), TERM_COUNT_TIMEOUT_MS)),
      ]).catch(() => Infinity)
    )
  );

  const probes = await Promise.all(
    probed.map((c) =>
      getDocs(query(base, ...c.constraints, orderBy("last_name", "asc"), limit(PROBE_LIMIT))).catch(
        () => null
      )
    )
  );
  const hit = probed.map((_, i) =>
    (probes[i]?.docs ?? []).some((d) => matchesQuery(d.data() as PoliceOfficer, alternatives))
  );
  const full = probed.map((_, i) => (probes[i]?.size ?? 0) === PROBE_LIMIT);
  const counts = await countsP;
  let rareTerm: string | null = null;
  if (planTerms.length > 1) {
    let best = RARE_ARM_MAX + 1;
    countable.forEach((t, i) => {
      if (counts[i] < best) [best, rareTerm] = [counts[i], t];
    });
  }

  const pairHitSurnames = new Set(
    probed.filter((c, i) => hit[i] && c.kind === "pair").map((c) => c.surname)
  );
  // A surname arm whose probe came back short is the whole range, already
  // read: keep it even when a pair arm hit, since it also holds matches the
  // token field can't prove (middle names where they aren't tokenised).
  // The likely surnames (the last typed term or a joined particle form, then
  // the first typed term) keep their ranges even then: they hold partial
  // first names the token field can't prove ("an le" for Anh Le outside CA).
  // They rank after the precise arms, so they cost reads only when those
  // don't fill the page.
  const lastTyped = new Set([terms[terms.length - 1], ...joinedForms]);
  const primary = new Set([...lastTyped, terms[0]]);
  let chosen = probed.filter(
    (c, i) =>
      hit[i] &&
      !(c.kind === "surname" && pairHitSurnames.has(c.surname) && full[i] && !primary.has(c.surname!))
  );
  // No probe holds a match in its first PROBE_LIMIT docs: a full probe may
  // still hide matches further down, so keep those arms.
  if (!chosen.length) chosen = probed.filter((_, i) => full[i]);
  // The rarest term's arm: complete, so matches no pair or range reaches
  // ("Fuentes-lopez" for "jose lopez", where the Jose Lopezes hit a pair arm)
  // still come up. It holds every officer the rare term's surname ranges
  // hold, so it replaces them and ranks as they would.
  if (rareTerm) {
    const t: string = rareTerm;
    const k = prefixKey(t);
    chosen = chosen.filter((c) => !(c.kind === "surname" && c.surname === t));
    chosen.push({
      key: `rare:${k}`,
      kind: "surname",
      surname: t,
      constraints: [where(tokenField, "array-contains", k)],
      test: (d) => tokenListHas(d, tokenField, k),
    });
  }
  // No complete arm (every term too common, or the counts timed out) and no
  // pair arm proved the name:
  // scan every officer holding any typed word. The client filter keeps
  // genuine matches.
  if (!rareTerm && planTerms.length > 1 && !chosen.some((c) => c.kind === "pair")) {
    const anyTerms = [...new Set(alternatives.flat().map(prefixKey))]
      .filter((k) => k.length >= MIN_PREFIX_LENGTH)
      .slice(0, 10);
    chosen.push({
      key: "any",
      kind: "any",
      constraints: [where(tokenField, "array-contains-any", anyTerms)],
      test: (d) => anyTerms.some((t) => tokenListHas(d, tokenField, t)),
    });
  }
  if (!chosen.length) return null;

  // Tiers: precise arms (pair / token prove the name), then the last typed
  // term's surname range, then the first typed term's, then the other broad
  // scans (other surname readings, any typed word). Empty tiers are dropped.
  const rank = (c: Candidate) =>
    c.kind === "pair" || c.kind === "token" ? 0
    : c.kind === "surname" && lastTyped.has(c.surname!) ? 1
    : c.kind === "surname" && primary.has(c.surname!) ? 2
    : 3;
  chosen.sort((a, b) => rank(a) - rank(b));
  const tiers = [0, 1, 2, 3]
    .map((r) => chosen.map((c, i) => (rank(c) === r ? i : -1)).filter((i) => i >= 0))
    .filter((t) => t.length > 0);

  const arms = chosen.map((c) => query(base, ...c.constraints, orderBy("last_name", "asc")));
  const kinds = [...new Set(chosen.map((c) => c.kind))].join("+");
  return {
    arms,
    tiers,
    armTests: chosen.map((c) => c.test),
    alternatives,
    shape: `name:${kinds}(${arms.length})${tiers.length > 1 ? `/${tiers.length}` : ""}`,
  };
}

export async function planSearch(db: Firestore, input: SearchInput): Promise<SearchPlan> {
  const state = input.state.toLowerCase();
  const base = query(collectionGroup(db, "db_launch"), where("state", "==", state));
  const searchingByUid = !!input.query && /\d/.test(input.query.trim());
  const clientStartIso = input.query && input.startDate ? new Date(input.startDate).toISOString() : null;
  const clientEndIso = input.query && input.endDate ? new Date(input.endDate).toISOString() : null;

  // Name searches sorted by name with no agency filter use the multi-arm
  // planner; the last_name ranges it relies on need last_name to lead the
  // sort, and an agency filter would need indexes that don't exist.
  const nameSortable =
    !input.agency && input.sortBy !== "date" && input.sortBy !== "agency";
  if (input.query && !searchingByUid && nameSortable) {
    const named = await planNameSearch(base, input.query);
    if (named) {
      return {
        arms: named.arms,
        tiers: named.tiers,
        armTests: named.armTests,
        windowSize: input.pageSize * NAME_WINDOW_MULTIPLIER,
        maxWindows: NAME_MAX_WINDOWS,
        matchAlternatives: named.alternatives,
        clientStartIso,
        clientEndIso,
        shape: named.shape,
      };
    }
  }

  // Everything else: one query. A name search lands here only with an agency
  // filter, a date/agency sort, digits in it, or when no candidate arm found
  // anything at all (then a broad any-term query is the last resort). Only
  // the last case has a name_prefixes index; the others use searchQueries.
  let q = base;
  let shape = "browse";
  if (input.query) {
    const terms = normalizeQuery(input.query).slice(0, 10);
    if (searchingByUid) {
      shape = "uid";
      q = query(q, or(where("searchQueries", "array-contains-any", terms), where("person_nbr", "==", input.query.trim())));
    } else if (nameSortable) {
      shape = "prefix-any";
      const keys = [...new Set(terms.map(prefixKey))].filter((k) => k.length >= MIN_PREFIX_LENGTH);
      q = query(q, where(NAME_PREFIX_FIELD, "array-contains-any", keys.length ? keys : [""]));
    } else {
      shape = "contains-any";
      q = query(q, where("searchQueries", "array-contains-any", terms.length ? terms : [""]));
    }
  }
  if (!searchingByUid) {
    if (input.agency) q = query(q, where("agency_name", "==", input.agency));
    // Firestore can't combine array-contains(-any) with a range filter on a
    // different field, so with a name search the date range is client-side.
    if (!input.query) {
      if (input.startDate) q = query(q, where("start_date_iso", ">=", new Date(input.startDate).toISOString()));
      if (input.endDate) q = query(q, where("end_date_iso", "<=", new Date(input.endDate).toISOString()));
    }
    const sortField =
      input.sortBy === "date" ? "start_date" : input.sortBy === "agency" ? "agency_name" : "last_name";
    q = query(q, orderBy(sortField, input.sortOrder === "desc" ? "desc" : "asc"));
  }

  const terms = input.query ? normalizeQuery(input.query) : [];
  return {
    arms: [q],
    tiers: [[0]],
    armTests: [],
    windowSize: input.pageSize * (input.query ? 100 : 10),
    // Browsing may need several windows when grouping many records per
    // officer leaves the page short; a broad name query gets one wide window.
    maxWindows: input.query ? 1 : 10,
    matchAlternatives: terms.length > 1 ? termAlternatives(terms) : [],
    clientStartIso,
    clientEndIso,
    shape,
  };
}

// ---------------------------------------------------------------------------
// Fetching and page assembly
// ---------------------------------------------------------------------------

export type DocsFetcher = (q: Query<DocumentData>) => Promise<QuerySnapshot<DocumentData>>;
type Doc = QueryDocumentSnapshot<DocumentData>;

/** Firestore's order for multi-arm plans: last_name asc, then document path. */
function compareDocs(a: Doc, b: Doc): number {
  const la = String(a.get("last_name") ?? "");
  const lb = String(b.get("last_name") ?? "");
  if (la !== lb) return la < lb ? -1 : 1;
  return a.ref.path < b.ref.path ? -1 : a.ref.path > b.ref.path ? 1 : 0;
}

/**
 * Some arms merged into one stream in sort order (a k-way merge). Each
 * arm keeps its own cursor and buffer and is refilled only once its buffer is
 * used up, every empty arm in parallel, so nothing is fetched twice and
 * reading stops the moment the caller stops pulling. A doc several arms hold
 * comes out once. Multi-arm plans sort by (last_name, path), which
 * compareDocs mirrors; a single arm may use any sort.
 */
class MergedStream {
  private bufs: Doc[][];
  private pos: number[];
  private last: (Doc | null)[];
  private done: boolean[];
  private lastPath: string | null = null;
  reads = 0;
  rounds = 0;
  /** next() returned null because the deadline passed, not because the arms ran out. */
  outOfTime = false;

  constructor(
    private arms: Query<DocumentData>[],
    startCursor: Doc | null,
    private chunk: number,
    private fetcher: DocsFetcher,
    /** Epoch ms after which no further fetch round starts (the first always runs). */
    public deadline = Infinity
  ) {
    const n = arms.length;
    this.bufs = Array.from({ length: n }, () => []);
    this.pos = new Array(n).fill(0);
    this.last = new Array(n).fill(startCursor);
    this.done = new Array(n).fill(false);
  }

  /** Fetch the next chunk for every arm whose buffer is used up; false if out of time. */
  private async refill(): Promise<boolean> {
    const empty = this.arms
      .map((_, i) => i)
      .filter((i) => !this.done[i] && this.pos[i] >= this.bufs[i].length);
    if (!empty.length) return true;
    if (this.rounds > 0 && Date.now() > this.deadline) return false;
    this.rounds++;
    const snaps = await Promise.all(
      empty.map((i) => {
        const after = this.last[i];
        const arm = this.arms[i];
        return this.fetcher(after ? query(arm, startAfter(after), limit(this.chunk)) : query(arm, limit(this.chunk)));
      })
    );
    empty.forEach((i, k) => {
      const snap = snaps[k];
      this.reads += snap.size;
      this.bufs[i] = snap.docs;
      this.pos[i] = 0;
      this.done[i] = snap.size < this.chunk;
      if (snap.size) this.last[i] = snap.docs[snap.size - 1];
    });
    return true;
  }

  /** True when no arm can yield another doc (meaningful after next()). */
  get exhausted(): boolean {
    return this.arms.every((_, i) => this.done[i] && this.pos[i] >= this.bufs[i].length);
  }

  async next(): Promise<Doc | null> {
    for (;;) {
      // An arm with an empty buffer could still hold the next doc in order,
      // so without a refill no doc can be emitted safely.
      if (!(await this.refill())) {
        this.outOfTime = true;
        return null;
      }
      let best = -1;
      for (let i = 0; i < this.bufs.length; i++) {
        if (this.pos[i] >= this.bufs[i].length) continue;
        if (best < 0 || compareDocs(this.bufs[i][this.pos[i]], this.bufs[best][this.pos[best]]) < 0) best = i;
      }
      if (best < 0) return null;
      const d = this.bufs[best][this.pos[best]++];
      if (d.ref.path === this.lastPath) continue; // already emitted by another arm
      this.lastPath = d.ref.path;
      return d;
    }
  }
}

/**
 * Where a page starts: the tier, and the doc within it to start after (null =
 * the tier's beginning). Opaque to callers, who only hand it back.
 */
export interface SearchCursor {
  tier: number;
  after: Doc | null;
}

export interface SearchPage {
  /** Officers in display order, each with their records on this page. */
  groups: { person_nbr: string; records: PoliceOfficer[] }[];
  /** First doc of the page. */
  firstDoc: Doc | null;
  /** Where the next page starts, or null if there is no next page. */
  nextCursor: SearchCursor | null;
  hasNextPage: boolean;
  /** Docs read from Firestore for this page, query planning excluded. */
  reads: number;
  windows: number;
}

function matchesPlan(officer: PoliceOfficer, plan: SearchPlan): boolean {
  if (!matchesQuery(officer, plan.matchAlternatives)) return false;
  if (plan.clientStartIso && (!officer.start_date_iso || officer.start_date_iso < plan.clientStartIso)) {
    return false;
  }
  if (plan.clientEndIso && officer.end_date_iso && officer.end_date_iso > plan.clientEndIso) {
    return false;
  }
  return true;
}

/**
 * Fetch time a page that already shows a result may spend before it stops
 * and returns what it has. Sparse fallback searches (no pair arm proved the
 * name) would otherwise read thousands of docs to fill one page; the rest is
 * one Next click away, since the cursor resumes exactly where this page
 * stopped, so no match is lost.
 */
export const PAGE_TIME_BUDGET_MS = 600;
/** A page with no result yet keeps looking until this hard ceiling. */
export const EMPTY_PAGE_TIME_BUDGET_MS = 2_500;

/**
 * Build one page: pull docs tier by tier (each tier's arms merged in sort
 * order) from `startCursor` until the page holds pageSize officers, the
 * results run out, the page has examined windowSize * maxWindows docs, or the
 * time budget is spent. A later tier skips docs an earlier tier's arms hold,
 * since those were shown already. The cursor advances to the last doc
 * examined (match or not), so paging moves through the candidate set even
 * across sparse or zero-match stretches.
 */
export async function fetchPage(
  plan: SearchPlan,
  startCursor: SearchCursor | null,
  pageSize: number,
  fetcher: DocsFetcher = getDocs
): Promise<SearchPage> {
  const started = Date.now();
  let deadline = started + EMPTY_PAGE_TIME_BUDGET_MS;
  const examineCap = plan.windowSize * plan.maxWindows;
  const grouped = new Map<string, PoliceOfficer[]>();
  let firstDoc: Doc | null = null;
  let cursor: SearchCursor = startCursor ?? { tier: 0, after: null };
  let examined = 0;
  let reads = 0;
  let rounds = 0;
  let stopped = false; // page full, examine cap or out of time: more may follow

  while (cursor.tier < plan.tiers.length) {
    const tierArms = plan.tiers[cursor.tier];
    const earlierArms = plan.tiers.slice(0, cursor.tier).flat();
    const stream = new MergedStream(tierArms.map((i) => plan.arms[i]), cursor.after, plan.windowSize, fetcher, deadline);
    let tierDone = false;
    for (;;) {
      if (grouped.size >= pageSize || examined >= examineCap) {
        stopped = true;
        break;
      }
      stream.deadline = deadline;
      const d = await stream.next();
      if (!d) {
        if (stream.outOfTime) stopped = true;
        else tierDone = true;
        break;
      }
      examined++;
      firstDoc ??= d;
      cursor = { tier: cursor.tier, after: d };
      const data = d.data();
      if (earlierArms.some((i) => plan.armTests[i](data))) continue; // shown by an earlier tier
      const officer = data as PoliceOfficer;
      if (!matchesPlan(officer, plan)) continue;
      const existing = grouped.get(officer.person_nbr);
      if (existing) existing.push(officer);
      else {
        grouped.set(officer.person_nbr, [officer]);
        // Something to show: from here on the shorter budget applies.
        if (grouped.size === 1) deadline = started + PAGE_TIME_BUDGET_MS;
      }
    }
    reads += stream.reads;
    rounds += stream.rounds;
    if (tierDone) {
      cursor = { tier: cursor.tier + 1, after: null };
      continue;
    }
    // Stopped mid-tier; nothing more in it only if every arm is used up.
    if (stream.exhausted) cursor = { tier: cursor.tier + 1, after: null };
    break;
  }

  const hasNextPage = stopped && cursor.tier < plan.tiers.length && examined > 0;
  return {
    groups: [...grouped.entries()].map(([person_nbr, records]) => ({ person_nbr, records })),
    firstDoc,
    nextCursor: hasNextPage ? cursor : null,
    hasNextPage,
    reads,
    windows: rounds,
  };
}

/** Docs per arm per fetch when counting. */
const COUNT_CHUNK = 1000;
/** Docs a count may read before it reports a lower bound. */
export const COUNT_READ_CAP = 10_000;
/**
 * Time a count may take before it reports a lower bound. It runs right after
 * a page renders, on the same connection as the user's next search, so a long
 * count over a broad reading ("ho", "mc") must not hold that channel.
 */
export const COUNT_TIME_BUDGET_MS = 3_000;

/**
 * Unique officers a plan matches, walking the same merged arms and client
 * filter as fetchPage so the total agrees with what the pages show. Stops
 * after COUNT_READ_CAP docs or COUNT_TIME_BUDGET_MS; `capped` then means the
 * count is a lower bound.
 */
export async function countMatches(
  plan: SearchPlan,
  fetcher: DocsFetcher = getDocs
): Promise<{ count: number; capped: boolean; reads: number }> {
  const stream = new MergedStream(plan.arms, null, COUNT_CHUNK, fetcher, Date.now() + COUNT_TIME_BUDGET_MS);
  const people = new Set<string>();
  for (;;) {
    if (stream.reads >= COUNT_READ_CAP) return { count: people.size, capped: !stream.exhausted, reads: stream.reads };
    const d = await stream.next();
    if (!d) return { count: people.size, capped: stream.outOfTime, reads: stream.reads };
    const officer = d.data() as PoliceOfficer;
    if (matchesPlan(officer, plan)) people.add(officer.person_nbr);
  }
}
