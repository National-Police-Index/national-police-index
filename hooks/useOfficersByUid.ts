"use client";

import {
  collection,
  collectionGroup,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { db } from "@/lib/firebase";
import type { PoliceOfficer } from "@/types";

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
    [searchParams],
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
    ],
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
    parseInt(searchParams.currentPage || "1", 10),
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
              (stat: any) => stat.label === "Total Officers",
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
        let countQuery = query(collection(db, "db_launch"));
        countQuery = query(
          countQuery,
          where("state", "==", state.toLowerCase()),
        );
        countQuery = query(countQuery, limit(10000));

        if (searchParameters.query) {
          countQuery = query(
            countQuery,
            where(
              "searchQueries",
              "array-contains-any",
              searchParameters.query.toLowerCase().split(" ").slice(0, 20),
            ),
          );
        }

        if (searchParameters.agency) {
          countQuery = query(
            countQuery,
            where("agency_name", "==", searchParameters.agency),
          );
        }

        if (searchParameters.startDate) {
          const startDate = new Date(searchParameters.startDate);
          countQuery = query(
            countQuery,
            where("start_date_iso", ">=", startDate.toISOString()),
          );
        }

        if (searchParameters.endDate) {
          const endDate = new Date(searchParameters.endDate);
          countQuery = query(
            countQuery,
            where("end_date_iso", "<=", endDate.toISOString()),
          );
        }

        const countSnapshot = await getDocs(countQuery);

        const uniqueOfficers = new Set();
        countSnapshot.docs.forEach((doc) => {
          const officer = doc.data() as PoliceOfficer;
          uniqueOfficers.add(officer.person_nbr);
        });

        const uniqueCount = uniqueOfficers.size;

        setCountCache((prev) => ({ ...prev, [filtersCacheKey]: uniqueCount }));

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
    [],
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

        const cachedCount = countCache[filtersCacheKey];
        if (cachedCount) {
          setTotalCount(cachedCount);
        } else {
          const totalCount = await getTotalCount();
          setTotalCount(totalCount);
        }

        const officersRef = collectionGroup(db, "db_launch");
        // const pageSize = searchParameters.query ? 100 : searchParameters.pageSize;
        const pageSize = searchParameters.query
          ? 100
          : searchParameters.pageSize;

        let q = query(officersRef, where("state", "==", state.toLowerCase()));

        if (searchParameters.query) {
          q = query(
            q,
            where(
              "searchQueries",
              "array-contains-any",
              searchParameters.query.toLowerCase().split(" ").slice(0, 20),
            ),
          );
        }

        if (searchParameters.agency) {
          q = query(q, where("agency_name", "==", searchParameters.agency));
        }

        if (searchParameters.startDate) {
          const startDate = new Date(searchParameters.startDate);
          q = query(q, where("start_date_iso", ">=", startDate.toISOString()));
        }

        if (searchParameters.endDate) {
          const endDate = new Date(searchParameters.endDate);
          q = query(q, where("end_date_iso", "<=", endDate.toISOString()));
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
            searchParameters.sortOrder === "desc" ? "desc" : "asc",
          ),
        );
        q = query(q, limit(pageSize * (searchParameters.query ? 100 : 10)));

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
        let attempts = 0;
        const maxAttempts = 10;

        const terms = searchParameters.query
          ? searchParameters.query.trim().toLowerCase().split(" ")
          : false;

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

            if (terms && terms.length > 1) {
              if (
                !(
                  terms.includes(officer.first_name.toLowerCase()) &&
                  terms.includes(officer.last_name.toLowerCase())
                )
              ) {
                continue;
              }
            }

            if (!groupedOfficers.has(officer.person_nbr)) {
              groupedOfficers.set(officer.person_nbr, [officer]);
              uniqueCount++;
              lastDocIndex = i;
            } else {
              groupedOfficers.get(officer.person_nbr)?.push(officer);
            }
          }

          if (
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

          if (lastDocIndex >= 0) {
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
        setHasNextPage(uniqueCount >= searchParameters.pageSize);

        const groups = Array.from(groupedOfficers.entries()).map(
          ([person_nbr, records]) => ({
            person_nbr,
            records: records.sort(
              (a, b) =>
                new Date(b.start_date).getTime() -
                new Date(a.start_date).getTime(),
            ),
          }),
        );

        if (isMounted) {
          setOfficerGroups(groups);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch officers"),
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
    currentPage,
    hasNextPage,
    hasPreviousPage,
    pageSize: searchParameters.pageSize,
  };
}
