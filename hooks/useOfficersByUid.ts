"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  getDocs,
  QueryDocumentSnapshot,
  doc,
  getDoc,
  DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { PoliceOfficer } from "@/types";

import { planSearch, fetchPage, countMatches, SearchCursor, SearchPlan } from "@/lib/officerSearch";

// Re-exported so existing importers keep working; the implementations live in
// lib/officerSearch.ts, shared with the search benchmarks.
export {
  titleCaseTerm,
  normalizeQuery,
  matchesAllTerms,
  matchesQuery,
} from "@/lib/officerSearch";

interface OfficerGroup {
  person_nbr: string;
  records: PoliceOfficer[];
}

interface SearchParams {
  currentPage?: string;
  page?: string;
  pageSize: string;
  query?: string;
  agency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  direction?: "next" | "prev";
}

interface UseOfficersByUidProps {
  state: string;
  searchParams?: SearchParams;
}

export function useOfficersByUid({
  state,
  searchParams = { pageSize: "16", page: "" },
}: UseOfficersByUidProps) {
  const searchParamsString = useMemo(
    () => JSON.stringify(searchParams),
    [searchParams]
  );
  const searchParameters = useMemo(
    () => ({
      query: searchParams.query?.toLowerCase() || "",
      agency: searchParams.agency || "",
      page: searchParams.page || "1",
      startDate: searchParams.startDate || "",
      endDate: searchParams.endDate || "",
      sortBy: searchParams.sortBy || "full_name",
      sortOrder: searchParams.sortOrder || "asc",
      pageSize: parseInt(searchParams.pageSize || "16", 10),
      direction: searchParams.direction,
    }),
    [
      searchParams.query,
      searchParams.agency,
      searchParams.startDate,
      searchParams.endDate,
      searchParams.sortOrder,
      searchParams.sortBy,
      searchParams.pageSize,
      searchParams.direction,
      searchParams.page,
    ]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [, setFirstDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Where the next page starts (a SearchCursor from lib/officerSearch).
  const [lastDoc, setLastDoc] = useState<SearchCursor | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.currentPage || "1", 10)
  );
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const cancelTokenRef = useRef<AbortController | null>(null);

  const fetchStateRef = useRef({
    isFetching: false,
    fetchCount: 0,
    lastParams: "",
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
  });

  const cursorHistoryRef = useRef<{
    cursors: SearchCursor[];
    currentIndex: number;
  }>({ cursors: [], currentIndex: -1 });

  // One plan per search (filters + page size), reused by every page and the
  // count. A SearchCursor only makes sense against the plan that produced it,
  // and planning isn't reproducible (probe and count timing can change which
  // arms a plan holds), so re-planning on Next could skip or repeat results.
  const planCacheRef = useRef<{ key: string; plan: Promise<SearchPlan> } | null>(null);

  const [countCache, setCountCache] = useState<Record<string, number>>({});
  // Tracks whether a given filter's count hit the 10k-doc fetch cap. When true,
  // the displayed total is a lower bound (e.g. "5,967+"), not an exact count.
  // why do we have a lower bound if we're able to eventually render them all. For speed? 
  const [countCapCache, setCountCapCache] = useState<Record<string, boolean>>(
    {}
  );

  const filtersCacheKey = useMemo(() => {
    return JSON.stringify({
      state,
      query: searchParameters.query,
      agency: searchParameters.agency,
      startDate: searchParameters.startDate,
      endDate: searchParameters.endDate,
      sortBy: searchParameters.sortBy,
      sortOrder: searchParameters.sortOrder,
      pageSize: searchParameters.pageSize,
    });
  }, [
    state,
    searchParameters.query,
    searchParameters.agency,
    searchParameters.startDate,
    searchParameters.endDate,
    searchParameters.sortBy,
    searchParameters.sortOrder,
    searchParameters.pageSize,
  ]);

  const getPlan = useCallback((): Promise<SearchPlan> => {
    const cached = planCacheRef.current;
    if (cached && cached.key === filtersCacheKey) return cached.plan;
    const plan = planSearch(db, { state, ...searchParameters });
    planCacheRef.current = { key: filtersCacheKey, plan };
    // A failed plan isn't kept, so the next attempt plans afresh.
    plan.catch(() => {
      if (planCacheRef.current?.plan === plan) planCacheRef.current = null;
    });
    return plan;
  }, [state, filtersCacheKey, searchParameters]);

  const getTotalCount = useCallback(async () => {
    try {
      if (countCache[filtersCacheKey]) {
        return countCache[filtersCacheKey];
      }

      if (
        !searchParameters.query &&
        !searchParameters.agency &&
        !searchParameters.startDate &&
        !searchParameters.endDate
      ) {
        const statsRef = doc(db, "statistics_per_state", state);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const data = statsDoc.data();

          if (data.total_officers) {
            const count = parseInt(data.total_officers, 10);

            setCountCache((prev) => ({ ...prev, [filtersCacheKey]: count }));
            return count;
          } else if (data.stats) {
            const officerStats = data.stats.find(
              (stat: any) => stat.label === "Total Officers"
            );
            if (officerStats) {
              const count = parseInt(officerStats.value, 10);

              setCountCache((prev) => ({ ...prev, [filtersCacheKey]: count }));
              return count;
            }
          }
        }
      }

      try {
        // Same plan and client filter as the result pages, so the total
        // agrees with what paging shows.
        const plan = await getPlan();
        const { count, capped } = await countMatches(plan, getDocs);

        setCountCache((prev) => ({ ...prev, [filtersCacheKey]: count }));
        setCountCapCache((prev) => ({ ...prev, [filtersCacheKey]: capped }));

        return count;
      } catch {
        const defaultCount = 11713;
        return defaultCount;
      }
    } catch (err) {
      console.error("Error fetching total count:", err);
      const defaultCount = 11713;
      setCountCache((prev) => ({ ...prev, [filtersCacheKey]: defaultCount }));
      return defaultCount;
    }
  }, [state, filtersCacheKey, countCache, searchParameters, getPlan]);

  useEffect(() => {
    let isMounted = true;

    if (fetchStateRef.current.lastParams === searchParamsString) {
      return;
    }

    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
    }

    if (fetchStateRef.current.debounceTimer) {
      clearTimeout(fetchStateRef.current.debounceTimer);
    }

    cancelTokenRef.current = new AbortController();

    fetchStateRef.current.debounceTimer = setTimeout(() => {
      fetchStateRef.current.isFetching = true;
      fetchStateRef.current.lastParams = searchParamsString;
      fetchStateRef.current.fetchCount++;
      fetchOfficers();
    }, 300);

    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        // The total count only feeds the pagination bar. The expensive
        // uncached count (up to a 10k-doc fetch) is deferred until after the
        // results render bc running it concurrently with the main query,
        // starves the main query on the shared Firestore channel. 

        const cachedCount = countCache[filtersCacheKey];
        if (cachedCount) {
          setTotalCount(cachedCount);
        }

        // Show the selected page size. This previously forced
        // 100 for any query while the UI reported (and the user selected) a
        // different size — so a "16 per page" search actually rendered 100 cards
        // under a "1–16" label with a 6x-inflated page count.
        const pageSize = searchParameters.pageSize;

        // Planning, fetching and page assembly live in lib/officerSearch.ts,
        // shared with the search benchmarks.
        const plan = await getPlan();

        const direction = searchParameters.direction;
        const currentPageNum = currentPage;

        // cursors[i] is the doc page i + 2 starts after, so going back to a
        // page replays exactly the cursor it was first fetched with.
        let startCursor: SearchCursor | null = null;
        if (direction === "next" && lastDoc) {
          startCursor = lastDoc;
        } else if (direction === "prev" && currentPageNum > 1) {
          const history = cursorHistoryRef.current;
          const prevIndex = history.currentIndex - 1;
          if (prevIndex >= 0 && prevIndex < history.cursors.length) {
            startCursor = history.cursors[prevIndex];
            cursorHistoryRef.current.currentIndex = prevIndex;
          } else {
            cursorHistoryRef.current.currentIndex = -1;
          }
        } else if (currentPageNum === 1 || !direction) {
          cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
        }

        const page = await fetchPage(plan, startCursor, pageSize, getDocs);
        if (!isMounted) return;

        if (page.firstDoc) {
          setFirstDoc(page.firstDoc);
          if (page.nextCursor) setLastDoc(page.nextCursor);

          if (direction === "next" && startCursor) {
            const newCursors = [...cursorHistoryRef.current.cursors];
            const newIndex = cursorHistoryRef.current.currentIndex + 1;
            if (newIndex < newCursors.length) newCursors.splice(newIndex);
            newCursors.push(startCursor);
            cursorHistoryRef.current = { cursors: newCursors, currentIndex: newIndex };
          } else if (currentPageNum === 1 && direction !== "prev") {
            cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
          }
        }

        let newPage;
        if (!direction) {
          newPage = currentPageNum;
        } else {
          newPage =
            direction === "next"
              ? currentPageNum + 1
              : direction === "prev"
              ? Math.max(1, currentPageNum - 1)
              : currentPageNum;
        }

        setCurrentPage(newPage);
        setHasPreviousPage(newPage > 1);
        setHasNextPage(page.hasNextPage);

        const groups = page.groups.map(({ person_nbr, records }) => ({
          person_nbr,
          records: records.sort(
            (a, b) =>
              new Date(b.start_date).getTime() -
              new Date(a.start_date).getTime()
          ),
        }));

        if (isMounted) {
          setOfficerGroups(groups);
        }

        // After results render, fetch the total count in the background
        // on the free channel to keep initial results fast. 
        if (!cachedCount) {
          // A time-capped count is a lower bound, so it can never be fewer
          // than the officers already shown up to this page.
          const shownSoFar = (newPage - 1) * pageSize + groups.length;
          getTotalCount().then((count) => {
            if (isMounted) setTotalCount(Math.max(count, shownSoFar));
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch officers")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchStateRef.current.isFetching = false;
        }
      }
    }

    return () => {
      isMounted = false;
      if (fetchStateRef.current.debounceTimer) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(fetchStateRef.current.debounceTimer);
      }
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, searchParamsString]);

  useEffect(() => {
    if (searchParameters.page && searchParameters.page !== "1") {
      return;
    }
    setLastDoc(null);
    setFirstDoc(null);
    setCurrentPage(1);
    cursorHistoryRef.current = { cursors: [], currentIndex: -1 };

    setHasPreviousPage(false);

    if (
      !searchParameters.query &&
      !searchParameters.agency &&
      !searchParameters.startDate &&
      !searchParameters.endDate
    ) {
      getTotalCount().then((count) => {
        setTotalCount(count);
      });
    }
  }, [searchParameters, getTotalCount]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalCount,
    totalGroupsCapped: countCapCache[filtersCacheKey] ?? false,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    pageSize: searchParameters.pageSize,
  };
}
