"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  doc,
  getDoc,
  collection,
  DocumentData,
  or,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { PoliceOfficer } from "@/types";

// California fast-path search helpers.
//
// A recent migration means that CA officer data carry a `search_prefixes` array 
// (every prefix of length >= 2 of each name token,
// e.g. "John Smith" -> ["jo","joh","john","sm",...]). 
// That lets the CA branch run a single tight `array-contains` query instead of the
// broader `array-contains-any` over-fetch used for every other state. These
// helpers are only ever invoked from the CA branch — other states are untouched.

const CA_MIN_PREFIX_LENGTH = 2;
const CA_FAST_SEARCH_ENABLED = true;

function caSearchTerms(rawQuery: string): string[] {
  return rawQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= CA_MIN_PREFIX_LENGTH);
}

// The longest term is the most selective, so anchoring the indexed query on it
// yields the smallest candidate set from Firestore.
function caAnchorTerm(terms: string[]): string {
  return terms.reduce((a, b) => (b.length > a.length ? b : a), terms[0] ?? "");
}

// Every typed term must be a prefix of some token of the officer's name. This
// enforces AND semantics + any-order matching on the client, over whatever
// candidate set the server query returned. Used by both the CA fast path and
// the non-CA search path.
function matchesAllTerms(officer: PoliceOfficer, terms: string[]): boolean {
  const tokens = `${officer.first_name} ${officer.last_name}`
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return terms.every((term) => tokens.some((tok) => tok.startsWith(term)));
}

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
  const [firstDoc, setFirstDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

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
    cursors: QueryDocumentSnapshot[];
    currentIndex: number;
  }>({ cursors: [], currentIndex: -1 });

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
        const countSearchingByUid =
          !!searchParameters.query && /\d/.test(searchParameters.query.trim());
        const countCaTerms =
          state.toLowerCase() === "california" &&
          searchParameters.query &&
          !countSearchingByUid
            ? caSearchTerms(searchParameters.query)
            : [];
        const countUseCaFastPath =
          CA_FAST_SEARCH_ENABLED &&
          countCaTerms.length > 0 &&
          !searchParameters.agency;
        const countNonCaSearch =
          !countUseCaFastPath && !!searchParameters.query;

        // Same constraint as the main query: skip server-side date range when a
        // name search is active, then filter dates client-side.
        const countStartIso = searchParameters.startDate
          ? new Date(searchParameters.startDate).toISOString()
          : null;
        const countEndIso = searchParameters.endDate
          ? new Date(searchParameters.endDate).toISOString()
          : null;

        let countQuery;
        if (countUseCaFastPath) {
          // CA fast path: anchor on the most selective prefix term.
          countQuery = query(
            collection(db, "db_launch"),
            where("state", "==", state.toLowerCase()),
            where(
              "search_prefixes",
              "array-contains",
              caAnchorTerm(countCaTerms)
            ),
            limit(10000)
          );
        } else if (countNonCaSearch) {
          // Mirror the results query exactly (reuses the same existing index):
          // searchQueries tokens + person_nbr, ordered by last_name.
          const queryTerms = searchParameters.query
            .toLowerCase()
            .split(" ")
            .slice(0, 20);
          let q = query(
            collectionGroup(db, "db_launch"),
            where("state", "==", state.toLowerCase())
          );
          q = query(
            q,
            or(
              where("searchQueries", "array-contains-any", queryTerms),
              where("person_nbr", "==", searchParameters.query)
            )
          );
          if (searchParameters.agency) {
            q = query(q, where("agency_name", "==", searchParameters.agency));
          }
          q = query(q, orderBy("last_name", "asc"));
          q = query(q, limit(10000));
          countQuery = q;
        } else {
          // No name search: count by state (+ optional agency / date range).
          let q = query(
            collection(db, "db_launch"),
            where("state", "==", state.toLowerCase()),
            limit(10000)
          );
          if (searchParameters.agency) {
            q = query(q, where("agency_name", "==", searchParameters.agency));
          }
          if (countStartIso) {
            q = query(q, where("start_date_iso", ">=", countStartIso));
          }
          if (countEndIso) {
            q = query(q, where("end_date_iso", "<=", countEndIso));
          }
          countQuery = q;
        }

        const countSnapshot = await getDocs(countQuery);

        const countTerms = searchParameters.query
          ? searchParameters.query.trim().toLowerCase().split(" ")
          : [];
        const uniqueOfficers = new Set();
        countSnapshot.docs.forEach((doc) => {
          const officer = doc.data() as PoliceOfficer;
          // CA fast path: the anchor query only guarantees the most selective
          // term matched, so require all typed terms client-side here too.
          if (countUseCaFastPath && !matchesAllTerms(officer, countCaTerms)) {
            return;
          }
          // Non-CA multi-term: require every term (prefix, any order) — same
          // filter the results use — so the count matches what's displayed.
          if (
            countNonCaSearch &&
            countTerms.length > 1 &&
            !matchesAllTerms(officer, countTerms)
          ) {
            return;
          }
          if (searchParameters.query) {
            if (countStartIso && (!officer.start_date_iso || officer.start_date_iso < countStartIso)) return;
            if (countEndIso && officer.end_date_iso && officer.end_date_iso > countEndIso) return;
          }
          uniqueOfficers.add(officer.person_nbr);
        });

        const uniqueCount = uniqueOfficers.size;
        // If the fetch came back full (10k docs), there are almost certainly
        // more matches we didn't see, so the unique total is a lower bound.
        const capped = countSnapshot.size >= 10000;

        setCountCache((prev) => ({ ...prev, [filtersCacheKey]: uniqueCount }));
        setCountCapCache((prev) => ({ ...prev, [filtersCacheKey]: capped }));

        return uniqueCount;
      } catch (countErr) {
        const defaultCount = 11713;
        return defaultCount;
      }
    } catch (err) {
      console.error("Error fetching total count:", err);
      const defaultCount = 11713;
      setCountCache((prev) => ({ ...prev, [filtersCacheKey]: defaultCount }));
      return defaultCount;
    }
  }, [state, filtersCacheKey, countCache, searchParameters]);

  const calculateUniqueOfficersCount = useCallback(
    (docs: QueryDocumentSnapshot<DocumentData>[]) => {
      const uniqueOfficers = new Set();
      docs.forEach((doc) => {
        const officer = doc.data() as PoliceOfficer;
        uniqueOfficers.add(officer.person_nbr);
      });
      return uniqueOfficers.size;
    },
    []
  );

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

        const officersRef = collectionGroup(db, "db_launch");
        // Show the selected page size. This previously forced
        // 100 for any query while the UI reported (and the user selected) a
        // different size — so a "16 per page" search actually rendered 100 cards
        // under a "1–16" label with a 6x-inflated page count.
        const pageSize = searchParameters.pageSize;

        let q = query(officersRef, where("state", "==", state.toLowerCase()));

        const searchingByUid = searchParameters.query && /\d/.test(searchParameters.query.trim());

        // California-specific: single `array-contains` on the most
        // selective prefix term, ordered by last_name. Only activates for CA
        // name searches with at least one >= 2-char term;
        // everything else flows through the existing path below untouched.
        const caTerms =
          state.toLowerCase() === "california" &&
          searchParameters.query &&
          !searchingByUid
            ? caSearchTerms(searchParameters.query)
            : [];
        const useCaFastPath =
          CA_FAST_SEARCH_ENABLED && caTerms.length > 0 && !searchParameters.agency;

        if (useCaFastPath) {
          q = query(
            q,
            where("search_prefixes", "array-contains", caAnchorTerm(caTerms))
          );
          q = query(q, orderBy("last_name", "asc"));
        } else {
          if (searchParameters.query) {
            const queryTerms = searchParameters.query.toLowerCase().split(" ").slice(0, 20);
            q = query(q,
              or(where("searchQueries", "array-contains-any", queryTerms),
                 where("person_nbr", "==", searchParameters.query)
              )
            );
          }

          if(!searchingByUid) {
              if (searchParameters.agency) {
                q = query(q, where("agency_name", "==", searchParameters.agency));
              }

              // Firestore can't combine array-contains-any (from name search) with
              // a range filter on a different field. When a name search is active,
              // skip the date range filters here and apply them client-side below.
              if (!searchParameters.query) {
                if (searchParameters.startDate) {
                  const startDate = new Date(searchParameters.startDate);
                  q = query(q, where("start_date_iso", ">=", startDate.toISOString()));
                }

                if (searchParameters.endDate) {
                  const endDate = new Date(searchParameters.endDate);
                  q = query(q, where("end_date_iso", "<=", endDate.toISOString()));
                }
              }

              const sortField =
                searchParameters.sortBy === "date"
                  ? "start_date"
                  : searchParameters.sortBy === "agency"
                  ? "agency_name"
                  : "last_name";

                q = query(
                  q,
                  orderBy(
                    sortField,
                    searchParameters.sortOrder === "desc" ? "desc" : "asc"
                  )
                );
          }
        }
        const limitMultiplier = searchParameters.query
          ? useCaFastPath
            ? 10
            : 100
          : 10;
        q = query(q, limit(pageSize * limitMultiplier));

        const direction = searchParameters.direction;
        const currentPageNum = currentPage;

        if (direction === "next" && lastDoc) {
          q = query(q, startAfter(lastDoc));
        } else if (direction === "prev" && currentPageNum > 1) {
          const history = cursorHistoryRef.current;
          const prevIndex = history.currentIndex - 1;

          if (prevIndex >= 0 && prevIndex < history.cursors.length) {
            const prevCursor = history.cursors[prevIndex];
            q = query(q, startAfter(prevCursor));

            cursorHistoryRef.current.currentIndex = prevIndex;
          } else if (prevIndex === -1) {
            cursorHistoryRef.current.currentIndex = -1;
          } else {
            cursorHistoryRef.current.currentIndex = -1;
          }
        } else if (currentPageNum === 1 || !direction) {
          cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
        }

        let snapshot = await getDocs(q);
        if (!isMounted) return;

        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        let uniqueCount = 0;
        let lastDocIndex = -1;
        // CA-specific: index of the last doc actually examined (match or not),
        // so the cursor always advances through the anchor set even across
        // sparse / zero-match pages — guaranteeing paging reaches every hit.
        let lastExaminedIndex = -1;
        let attempts = 0;
        const maxAttempts = 10;

        const terms = searchParameters.query
          ? searchParameters.query.trim().toLowerCase().split(" ")
          : false;

        const clientStartIso = searchParameters.query && searchParameters.startDate
          ? new Date(searchParameters.startDate).toISOString()
          : null;
        const clientEndIso = searchParameters.query && searchParameters.endDate
          ? new Date(searchParameters.endDate).toISOString()
          : null;

        while (
          uniqueCount < pageSize &&
          attempts < maxAttempts &&
          snapshot.docs.length > 0
        ) {
          for (
            let i = 0;
            i < snapshot.docs.length && uniqueCount < pageSize;
            i++
          ) {
            const doc = snapshot.docs[i];
            const officer = doc.data() as PoliceOfficer;
            lastExaminedIndex = i;

            if (useCaFastPath) {
              // CA-specific: the anchor query only guarantees the most
              // selective term matched. Require all typed terms (prefix, any
              // order) here.
              if (!matchesAllTerms(officer, caTerms)) {
                continue;
              }
            } else if (terms && terms.length > 1) {
              // Non-CA multi-term: require every typed term to be a prefix of
              // some name token (any order). The old check demanded the terms
              // exactly equal the officer's full first AND last name, so it
              // dropped anyone with a multi-word name (e.g. "tina smith" missed
              // "Tina Glover Smith") — returning almost nothing for any
              // multi-term non-CA search.
              if (!matchesAllTerms(officer, terms)) {
                continue;
              }
            }

            if (clientStartIso && (!officer.start_date_iso || officer.start_date_iso < clientStartIso)) {
              continue;
            }
            if (clientEndIso && officer.end_date_iso && officer.end_date_iso > clientEndIso) {
              continue;
            }

            if (!groupedOfficers.has(officer.person_nbr)) {
              groupedOfficers.set(officer.person_nbr, [officer]);
              uniqueCount++;
              lastDocIndex = i;
            } else {
              groupedOfficers.get(officer.person_nbr)?.push(officer);
            }
          }

          // CA fast path is capped at a single fetch: the anchor query already
          // returns a tight candidate set, and the continuation loop is what
          // made sparse multi-term searches (e.g. "smith john") do 5 sequential
          // round trips. One fetch keeps latency ~1 round trip; cursor
          // pagination still fetches the next page on demand.
          if (
            !useCaFastPath &&
            uniqueCount < pageSize &&
            snapshot.docs.length === pageSize * 10
          ) {
            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            q = query(q, startAfter(lastVisibleDoc));
            snapshot = await getDocs(q);
            attempts++;
          } else {
            break;
          }
        }

        if (snapshot.docs.length > 0) {
          setFirstDoc(snapshot.docs[0]);

          if (useCaFastPath) {
            // Advance the cursor to the last examined doc
            const caCursorIndex =
              lastExaminedIndex >= 0
                ? lastExaminedIndex
                : snapshot.docs.length - 1;
            setLastDoc(snapshot.docs[caCursorIndex]);

            if (currentPageNum === 1) {
              cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
            } else if (direction === "next") {
              const newCursors = [...cursorHistoryRef.current.cursors];
              const newIndex = cursorHistoryRef.current.currentIndex + 1;
              if (newIndex < newCursors.length) newCursors.splice(newIndex);
              newCursors.push(snapshot.docs[0]);
              cursorHistoryRef.current = { cursors: newCursors, currentIndex: newIndex };
            } else if (!direction && currentPageNum > 1) {
              cursorHistoryRef.current = { cursors: [snapshot.docs[0]], currentIndex: 0 };
            }
          } else if (lastDocIndex >= 0) {
            const newLastDoc = snapshot.docs[lastDocIndex];

            setLastDoc(newLastDoc);
            if (currentPageNum === 1) {
              cursorHistoryRef.current = {
                cursors: [],
                currentIndex: -1,
              };
            } else if (direction === "next") {
              const newCursors = [...cursorHistoryRef.current.cursors];
              const newIndex = cursorHistoryRef.current.currentIndex + 1;

              if (newIndex < newCursors.length) {
                newCursors.splice(newIndex);
              }

              newCursors.push(snapshot.docs[0]);

              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: newIndex,
              };
            } else if (!direction && currentPageNum > 1) {
              const newCursors = [];
              newCursors.push(snapshot.docs[0]);

              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: 0,
              };
            }
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
        // CA-specific there's a next page if EITHER this page hit the unique
        // cap (we stopped scanning early, so more matches remain in this fetch's
        // tail) OR the fetch came back full (more anchor docs remain to scan).
        // Both conditions together guarantee paging reaches every hit — sparse
        // multi-term AND dense single-term — until the anchor set is exhausted.
        setHasNextPage(
          useCaFastPath
            ? uniqueCount >= pageSize ||
                snapshot.docs.length === pageSize * limitMultiplier
            : uniqueCount >= searchParameters.pageSize
        );

        const groups = Array.from(groupedOfficers.entries()).map(
          ([person_nbr, records]) => ({
            person_nbr,
            records: records.sort(
              (a, b) =>
                new Date(b.start_date).getTime() -
                new Date(a.start_date).getTime()
            ),
          })
        );

        if (isMounted) {
          setOfficerGroups(groups);
        }

        // After results render, fetch the total count in the background
        // on the free channel to keep initial results fast. 
        if (!cachedCount) {
          getTotalCount().then((count) => {
            if (isMounted) setTotalCount(count);
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
        clearTimeout(fetchStateRef.current.debounceTimer);
      }
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort();
      }
    };
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
