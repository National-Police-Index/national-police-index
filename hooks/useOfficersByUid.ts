'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { PoliceOfficer } from '@/types';

interface OfficerGroup {
  person_nbr: string;
  records: PoliceOfficer[];
}

interface UseOfficersByUidProps {
  state: string;
  searchParams?: {
    query?: string;
    agency?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    pageSize?: string | number;
    page?: string | number;
    pageToken?: string; // Base64 encoded last document
  };
}

export function useOfficersByUid({ state, searchParams = { pageSize: '16' } }: UseOfficersByUidProps) {
  // Memoize search parameters to prevent unnecessary re-renders
  const searchParameters = useMemo(() => ({
    query: searchParams.query?.toLowerCase() || '',
    agency: searchParams.agency || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    sortBy: searchParams.sortBy || 'full_name',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: typeof searchParams.pageSize === 'string' ? parseInt(searchParams.pageSize, 10) : (searchParams.pageSize || 16),
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : (searchParams.page || 1)
  }), [searchParams.query, searchParams.agency, searchParams.startDate,
  searchParams.endDate, searchParams.sortBy, searchParams.sortOrder,
  searchParams.pageSize, searchParams.page]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);


  // Separate function to get total count
  // Function to get total count from stats
  const getTotalCount = useCallback(async () => {
    try {
      const statsRef = doc(db, 'statistics_per_state', state.toLowerCase());
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        const data = statsDoc.data();
        // Try to get total_officers first
        if (data.total_officers) {
          const count = parseInt(data.total_officers, 10);
          return count;
        }
        // Fallback to stats array
        if (data.stats) {
          const officerStats = data.stats.find((stat: any) => stat.label === 'Total Officers');
          if (officerStats) {
            const count = parseInt(officerStats.value, 10);
            return count;
          }
        }
      }

      console.log('No stats found, using default');
      return 11713; // Known count for California
    } catch (err) {
      console.error('Error fetching total count:', err);
      return 11713; // Default to known count
    }
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    // Get total count first
    getTotalCount().then(count => {
      if (isMounted) {
        setTotalCount(count);
      }
    });

    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        const officersRef = collectionGroup(db, 'db_launch');
        const pageSize = parseInt(searchParameters.pageSize?.toString() || '16', 10);
        const page = parseInt(searchParameters.page?.toString() || '1', 10);

        // Build the optimized query
        let q = query(officersRef, where('state', '==', state.toLowerCase()));
        if (false && ['georgia', 'florida'].includes(state.toLowerCase())) {
          q = query(q, where('state', '==', `${state.toLowerCase()}-discipline`));
        }

        // Add filters efficiently
        if (searchParameters.query) {
          q = query(q,
            where('full_name', '>=', searchParameters.query.toUpperCase()),
            where('full_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff'),
            where('agency_name', '>=', searchParameters.query.toUpperCase()),
            where('agency_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff'),
            where('last_name', '>=', searchParameters.query.toUpperCase()),
            where('last_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff')
          );
        }

        if (searchParameters.agency) {
          q = query(q, where('agency_name', '==', searchParameters.agency));
        }

        if (searchParameters.startDate) {
          q = query(q, where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where('end_date', '<=', searchParameters.endDate));
        }

        // Add sorting
        const sortField = searchParameters.sortBy === 'date' ? 'start_date' :
          searchParameters.sortBy === 'agency' ? 'agency_name' : 'full_name';
        q = query(q, orderBy(sortField, searchParameters.sortOrder === 'desc' ? 'desc' : 'asc'));

        // Get total count efficiently
        const total = await getTotalCount();
        if (isMounted) {
          setTotalCount(total);
        }

        // Fetch more records to ensure we get enough unique officers
        q = query(q, limit(pageSize * 4)); // Increased multiplier to handle more duplicates

        // Handle pagination
        if (page > 1 && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        let snapshot = await getDocs(q);
        if (!isMounted) return;

        // Process results efficiently
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        let uniqueCount = 0;
        let lastDocIndex = -1;
        let attempts = 0;
        const maxAttempts = 3;

        // Keep fetching until we get pageSize unique officers or hit the last record
        while (uniqueCount < pageSize && attempts < maxAttempts && snapshot.docs.length > 0) {
          for (let i = 0; i < snapshot.docs.length && uniqueCount < pageSize; i++) {
            const doc = snapshot.docs[i];
            const officer = doc.data() as PoliceOfficer;
            if (!groupedOfficers.has(officer.person_nbr)) {
              groupedOfficers.set(officer.person_nbr, [officer]);
              uniqueCount++;
              lastDocIndex = i;
            } else {
              groupedOfficers.get(officer.person_nbr)?.push(officer);
            }
          }

          // If we still need more officers and there are more records
          if (uniqueCount < pageSize && snapshot.docs.length === pageSize * 4) {
            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            q = query(q, startAfter(lastVisibleDoc));
            snapshot = await getDocs(q);
            attempts++;
          } else {
            break;
          }
        }

        // Save the last document for next page
        if (lastDocIndex >= 0) {
          setLastDoc(snapshot.docs[lastDocIndex]);
        }

        console.log(`Found ${uniqueCount} unique officers after ${attempts + 1} attempts`);

        // Sort and set results efficiently
        const groups = Array.from(groupedOfficers.entries()).map(([person_nbr, records]) => ({
          person_nbr,
          records: records.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        }));

        if (isMounted) {
          setOfficerGroups(groups);
        }

        // Update total count for filtered results
        if (searchParameters.query || searchParameters.agency || searchParameters.startDate || searchParameters.endDate) {
          const uniqueOfficers = new Set(groups.map(g => g.person_nbr));
          if (isMounted) {
            setTotalCount(uniqueOfficers.size);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOfficers();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [state, searchParameters]);

  // Reset pagination and total count when filters change
  useEffect(() => {
    setLastDoc(null);
    // Reset total count to stats value when filters are cleared
    if (!searchParameters.query && !searchParameters.agency && !searchParameters.startDate && !searchParameters.endDate) {
      getTotalCount().then(count => {
        setTotalCount(count);
      });
    }
  }, [searchParameters.query, searchParameters.agency, searchParameters.startDate,
  searchParameters.endDate, searchParameters.sortBy, searchParameters.sortOrder, getTotalCount]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalCount
  };
}
