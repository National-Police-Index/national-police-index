"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PoliceOfficer } from "@/types";

interface OfficerGroup {
  person_nbr: string;
  records: PoliceOfficer[];
}

interface UseOfficersByAgencyProps {
  agencyName: string;
  agencyId?: string;
  searchParams?: {
    query?: string;
    startDate?: string;
    endDate?: string;
    activeOnly?: string;
    sortBy?: string;
    pageSize?: string;
    page?: string;
    direction?: "next" | "prev";
  };
}

export function useOfficersByAgency({
  agencyName,
  agencyId,
  searchParams = { pageSize: "16" },
}: UseOfficersByAgencyProps) {
  const searchParameters = useMemo(
    () => ({
      query: searchParams.query?.toLowerCase() || "",
      startDate: searchParams.startDate || "",
      endDate: searchParams.endDate || "",
      activeOnly: searchParams.activeOnly || "false",
      sortBy: searchParams.sortBy || "last_name",
      pageSize:
        typeof searchParams.pageSize === "string"
          ? parseInt(searchParams.pageSize, 10)
          : searchParams.pageSize || 16,
      page: parseInt(searchParams.page || "1", 10),
      direction: searchParams.direction,
    }),
    [
      searchParams.query,
      searchParams.startDate,
      searchParams.endDate,
      searchParams.sortBy,
      searchParams.pageSize,
      searchParams.page,
      searchParams.activeOnly,
      searchParams.direction,
    ]
  );

  const searchParamsString = useMemo(
    () =>
      JSON.stringify({
        agencyName,
        query: searchParameters.query,
        startDate: searchParameters.startDate,
        endDate: searchParameters.endDate,
        activeOnly: searchParameters.activeOnly,
        sortBy: searchParameters.sortBy,
        pageSize: searchParameters.pageSize,
        direction: searchParameters.direction,
        page: searchParameters.page,
      }),
    [agencyName, searchParameters]
  );

  const normalizedAgencyId = agencyName
    .toLowerCase()
    .replace(/[/\\]/g, "%2F")
    .replace(/[^a-z0-9-]/g, "-");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [sortedGroups, setSortedGroups] = useState<OfficerGroup[]>([]);
  const [totalOfficers, setTotalOfficers] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.page || "1", 10)
  );
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [lastDoc, setLastDoc] = useState<any | null>(null);

  const [countCache, setCountCache] = useState<Record<string, number>>({});

  const cursorHistoryRef = useRef<{
    cursors: any[];
    currentIndex: number;
  }>({ cursors: [], currentIndex: -1 });

  const fetchStateRef = useRef({
    isFetching: false,
    fetchCount: 0,
    lastParams: "",
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
  });

  const filtersCacheKey = useMemo(() => {
    return JSON.stringify({
      agencyName,
      query: searchParameters.query,
      startDate: searchParameters.startDate,
      endDate: searchParameters.endDate,
      activeOnly: searchParameters.activeOnly,
      sortBy: searchParameters.sortBy,
      pageSize: searchParameters.pageSize,
    });
  }, [
    agencyName,
    searchParameters.query,
    searchParameters.startDate,
    searchParameters.endDate,
    searchParameters.activeOnly,
    searchParameters.sortBy,
    searchParameters.pageSize,
  ]);

  const getTotalCount = useCallback(async () => {
    try {
      if (countCache[filtersCacheKey]) {
        return countCache[filtersCacheKey];
      }

      if (
        !searchParameters.query &&
        !searchParameters.startDate &&
        !searchParameters.endDate
      ) {
        const statsRef = doc(db, "statistics_per_agency", normalizedAgencyId);
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

        const oldStatsRef = doc(db, "agency_statistics", normalizedAgencyId);
        const oldStatsDoc = await getDoc(oldStatsRef);

        if (oldStatsDoc.exists()) {
          const statsData = oldStatsDoc.data();
          const totalOfficersStat = statsData.stats?.find(
            (stat: any) => stat.label === "Total Officers"
          );
          if (totalOfficersStat) {
            const count = parseInt(totalOfficersStat.value, 10);

            setCountCache((prev) => ({ ...prev, [filtersCacheKey]: count }));
            return count;
          }
        }
      }

      try {
        let countQuery = query(collectionGroup(db, "db_launch"));
        countQuery = query(countQuery, where("agency_name", "==", agencyName));
        countQuery = query(countQuery, limit(10000));

        if (searchParameters.query) {
          countQuery = query(
            countQuery,
            where(
              "searchQueries",
              "array-contains-any",
              searchParameters.query.toLowerCase().split(" ").slice(0, 20)
            )
          );
        }

        if (searchParameters.startDate) {
          const startDate = new Date(searchParameters.startDate);
          countQuery = query(
            countQuery,
            where("start_date", ">=", startDate.toISOString())
          );
        }

        if (searchParameters.endDate) {
          const endDate = new Date(searchParameters.endDate);
          countQuery = query(
            countQuery,
            where("end_date", "<=", endDate.toISOString())
          );
        }

        if (searchParameters.activeOnly === "true") {
          countQuery = query(countQuery, where("end_date", "==", ""));
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
        return 500;
      }
    } catch (err) {
      return 500;
    }
  }, [
    agencyName,
    normalizedAgencyId,
    filtersCacheKey,
    countCache,
    searchParameters,
  ]);

  useEffect(() => {
    let isMounted = true;

    if (fetchStateRef.current.lastParams === searchParamsString) {
      return;
    }

    if (fetchStateRef.current.debounceTimer) {
      clearTimeout(fetchStateRef.current.debounceTimer);
    }

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

        let officerCount = null;
        const totalCount = await getTotalCount();
        setTotalCount(totalCount);

        try {
          const statsRef = doc(db, "statistics_per_agency", normalizedAgencyId);
          const statsDoc = await getDoc(statsRef);

          if (statsDoc.exists()) {
            const statsData = statsDoc.data();
            if (statsData.total_officers !== undefined) {
              officerCount = statsData.total_officers;
              setTotalOfficers(officerCount);
            }
          }

          if (officerCount === null) {
            const oldStatsRef = doc(
              db,
              "agency_statistics",
              normalizedAgencyId
            );
            const oldStatsDoc = await getDoc(oldStatsRef);

            if (oldStatsDoc.exists()) {
              const statsData = oldStatsDoc.data();
              const totalOfficersStat = statsData.stats?.find(
                (stat: any) => stat.label === "Total Officers"
              );

              if (totalOfficersStat) {
                officerCount = parseInt(totalOfficersStat.value, 10);
                setTotalOfficers(officerCount);
              }
            }
          }
        } catch (statsError) {
          console.error("Error fetching agency stats:", statsError);
        }

        const officersRef = collectionGroup(db, "db_launch");

        const sortField =
          searchParameters.sortBy === "date" ? "start_date" : "last_name";
        const sortDirection = "asc";

        let q = query(
          officersRef,
          where("agency_name", "==", agencyName),
          orderBy(sortField, sortDirection)
        );

        if (searchParameters.query) {
          q = query(
            q,

            where(
              "searchQueries",
              "array-contains-any",
              searchParameters.query.toLowerCase().split(" ").slice(0, 20)
            )
          );
        }

        if (searchParameters.startDate) {
          q = query(q, where("start_date", ">=", searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where("end_date", "<=", searchParameters.endDate));
        }

        if (searchParameters.activeOnly === "true") {
          q = query(q, where("end_date", "==", ""));
        }

        const pageSize = searchParameters.pageSize || 16;
        const page = currentPage;
        const direction = searchParameters.direction;

        q = query(q, limit(pageSize * 10));

        if (direction === "next" && lastDoc) {
          q = query(q, startAfter(lastDoc));
        } else if (direction === "prev" && currentPage > 1) {
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
        } else if (currentPage === 1 || !direction) {
          cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
        }

        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs;

        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        let uniqueCount = 0;
        let lastDocIndex = -1;
        let attempts = 0;
        const maxAttempts = 10;

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
            const person_nbr = officer.person_nbr;

            if (!groupedOfficers.has(person_nbr)) {
              groupedOfficers.set(person_nbr, []);
              uniqueCount++;
              lastDocIndex = i;
            }

            groupedOfficers.get(person_nbr)?.push(officer);
          }

          attempts++;
        }

        if (snapshot.docs.length > 0) {
          const firstDoc = snapshot.docs[0];

          if (lastDocIndex >= 0) {
            const lastVisibleDoc = snapshot.docs[lastDocIndex];
            setLastDoc(lastVisibleDoc);

            if (currentPage === 1) {
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

              newCursors.push(firstDoc);

              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: newIndex,
              };
            } else if (!direction && currentPage > 1) {
              const newCursors = [];
              newCursors.push(firstDoc);

              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: 0,
              };
            }
          }
        }

        const officerGroups = Array.from(groupedOfficers.entries()).map(
          ([person_nbr, records]) => ({
            person_nbr,
            records: records.sort((a, b) => {
              const dateA = new Date(a.start_date).getTime();
              const dateB = new Date(b.start_date).getTime();
              return dateB - dateA;
            }),
          })
        );

        let newPage;
        if (!direction) {
          newPage = currentPage;
        } else {
          newPage =
            direction === "next"
              ? currentPage + 1
              : direction === "prev"
              ? Math.max(1, currentPage - 1)
              : currentPage;
        }

        setCurrentPage(newPage);
        setHasPreviousPage(newPage > 1);
        setHasNextPage(uniqueCount >= pageSize);

        setSortedGroups(officerGroups);
        setOfficerGroups(officerGroups.slice(0, pageSize));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch officers")
        );
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
    };
  }, [searchParamsString]);

  useEffect(() => {
    if (searchParameters.page && searchParameters.page !== 1) {
      return;
    }

    if (!searchParameters.direction && !searchParameters.page) {
      setCurrentPage(1);
      setLastDoc(null);
      cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
      setHasPreviousPage(false);
    }
  }, [
    agencyName,
    searchParameters.query,
    searchParameters.startDate,
    searchParameters.endDate,
    searchParameters.activeOnly,
    searchParameters.sortBy,
    searchParameters.pageSize,
  ]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalCount,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
  };
}
