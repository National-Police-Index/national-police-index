/**
 * Search harness shared by the benchmark suites. It runs the app's own search
 * core (lib/officerSearch.ts: planSearch + fetchPage, the same functions
 * useOfficersByUid calls), so a suite always tests the search that ships,
 * never a hand-copied replica of it.
 *
 * Reads go to the server (getDocsFromServer), never the local cache, so
 * latency and read counts are real.
 */
import { getDocsFromServer, Firestore } from "firebase/firestore";
import * as dotenv from "dotenv";
import { PoliceOfficer } from "@/types";
import type * as Search from "@/lib/officerSearch";

dotenv.config({ path: ".env.local" });

export const DEFAULT_PAGE_SIZE = 16;

// `@/lib/firebase` reads env at module scope and ES imports hoist above
// dotenv.config(), so app code is imported dynamically.
export interface AppCode {
  db: Firestore;
  search: typeof Search;
  caFastSearchEnabled: boolean;
  caSearchTerms: typeof Search.caSearchTerms;
  matchesAllTerms: typeof Search.matchesAllTerms;
}

let cached: AppCode | null = null;

export async function loadAppCode(): Promise<AppCode> {
  if (!cached) {
    const { db } = await import("@/lib/firebase");
    const search = await import("@/lib/officerSearch");
    cached = {
      db,
      search,
      caFastSearchEnabled: search.CA_FAST_SEARCH_ENABLED,
      caSearchTerms: search.caSearchTerms,
      matchesAllTerms: search.matchesAllTerms,
    };
  }
  return cached;
}

export interface PageResult {
  /** person_nbr of every officer the page renders. */
  shown: Set<string>;
  /** One representative record per officer, in display order. */
  officers: PoliceOfficer[];
  /** Docs read for the page (query-planning probes excluded). */
  fetched: number;
  /** Wall time for the page, query planning included. */
  ms: number;
  shape: string;
  hasNextPage: boolean;
}

export interface SearchOptions {
  pageSize?: number;
  /** Fail a page that hasn't answered within this many ms. */
  pageTimeoutMs?: number;
  agency?: string;
  sortBy?: string;
  sortOrder?: string;
}

/** Rejects if `p` hasn't settled within `ms`. */
export function withTimeout<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms: ${what}`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

function searchInput(state: string, raw: string, opts: SearchOptions): Search.SearchInput {
  return {
    state,
    // The hook lowercases searchParams.query before searching.
    query: raw.toLowerCase(),
    agency: opts.agency ?? "",
    startDate: "",
    endDate: "",
    sortBy: opts.sortBy ?? "full_name",
    sortOrder: opts.sortOrder ?? "asc",
    pageSize: opts.pageSize ?? DEFAULT_PAGE_SIZE,
  };
}

/** Pages 1..maxPages of a search, following the app's cursor exactly. */
export async function searchPages(
  state: string,
  raw: string,
  maxPages: number,
  opts: SearchOptions = {}
): Promise<PageResult[]> {
  const { db, search } = await loadAppCode();
  const input = searchInput(state, raw, opts);
  const pageSize = input.pageSize;

  const pages: PageResult[] = [];
  let cursor: Search.SearchCursor | null = null;
  for (let p = 0; p < maxPages; p++) {
    const t0 = performance.now();
    const plan = await search.planSearch(db, input);
    const fetching = search.fetchPage(plan, cursor, pageSize, getDocsFromServer);
    const page = opts.pageTimeoutMs ? await withTimeout(fetching, opts.pageTimeoutMs, `page ${p + 1}`) : await fetching;
    pages.push({
      shown: new Set(page.groups.map((g) => g.person_nbr)),
      officers: page.groups.map((g) => g.records[0]),
      fetched: page.reads,
      ms: performance.now() - t0,
      shape: plan.shape,
      hasNextPage: page.hasNextPage,
    });
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return pages;
}

/** Page 1 of a search, exactly as the app renders it. */
export async function searchPageOne(
  state: string,
  raw: string,
  opts: SearchOptions = {}
): Promise<PageResult> {
  const [first] = await searchPages(state, raw, 1, opts);
  return first;
}

/** The result count the app shows for a search (useOfficersByUid's total). */
export async function countSearch(
  state: string,
  raw: string,
  opts: SearchOptions = {}
): Promise<{ count: number; capped: boolean; reads: number; ms: number }> {
  const { db, search } = await loadAppCode();
  const t0 = performance.now();
  const plan = await search.planSearch(db, searchInput(state, raw, opts));
  const res = await search.countMatches(plan, getDocsFromServer);
  return { ...res, ms: performance.now() - t0 };
}
