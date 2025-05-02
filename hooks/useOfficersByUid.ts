'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { use } from 'react';

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
    agency: searchParams.agency?.toLowerCase() || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    sortBy: searchParams.sortBy || 'last_name',
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

  console.log('search parameters', searchParameters);

  // Separate function to get total count
  const fetchTotalCount = useCallback(async () => {
    try {
      const officersRef = collectionGroup(db, 'db_launch');
      let q = query(officersRef, where('state', '==', state.toLowerCase()));

      if (searchParameters.query) {
        q = query(q,
          where('full_name', '>=', searchParameters.query.toUpperCase()),
          where('full_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff')
        );
      }

      if (searchParameters.agency) {
        q = query(q, where('agency_name_lower', '==', searchParameters.agency));
      }

      if (searchParameters.startDate) {
        q = query(q, where('start_date', '>=', searchParameters.startDate));
      }

      if (searchParameters.endDate) {
        q = query(q, where('end_date', '<=', searchParameters.endDate));
      }

      const snapshot = await getDocs(q);
      
      // Count unique person_nbr values
      const uniquePersonNbrs = new Set();
      snapshot.docs.forEach(doc => {
        const officer = doc.data() as PoliceOfficer;
        uniquePersonNbrs.add(officer.person_nbr);
      });

      return uniquePersonNbrs.size;
    } catch (err) {
      console.error('Error fetching total count:', err);
      return 0;
    }
  }, [state, searchParameters]);

  // Function to get total count directly from db_launch
  const getTotalCount = useCallback(async () => {
    try {
      const officersRef = collectionGroup(db, 'db_launch');
      let q = query(officersRef, where('state', '==', state.toLowerCase()));

      // Add filters if they exist
      if (searchParameters.query) {
        q = query(q,
          where('full_name', '>=', searchParameters.query.toUpperCase()),
          where('full_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff')
        );
      }

      if (searchParameters.agency) {
        q = query(q, where('agency_name_lower', '==', searchParameters.agency));
      }

      if (searchParameters.startDate) {
        q = query(q, where('start_date', '>=', searchParameters.startDate));
      }

      if (searchParameters.endDate) {
        q = query(q, where('end_date', '<=', searchParameters.endDate));
      }

      const snapshot = await getDocs(q);
      const uniqueOfficers = new Set();
      snapshot.docs.forEach(doc => {
        const officer = doc.data() as PoliceOfficer;
        uniqueOfficers.add(officer.person_nbr);
      });

      const count = uniqueOfficers.size;
      console.log('Total unique officers found:', count);
      return count;
    } catch (err) {
      console.error('Error fetching total count:', err);
      return 0;
    }
  }, [state, searchParameters]);

  useEffect(() => {
    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        // Use collection group query for better performance
        const officersRef = collectionGroup(db, 'db_launch');

        // Add sorting
        const sortField = searchParameters.sortBy === 'date' ? 'start_date' :
          searchParameters.sortBy === 'agency' ? 'agency_name' :
            'last_name';

        const sortDirection = searchParameters.sortOrder === 'desc' ? 'desc' : 'asc';

        // Build base query with mandatory state filter
        let baseQuery = query(officersRef, where('state', '==', state.toLowerCase()));
        
        // Build query for pagination
        let q = baseQuery;

        // Add optional filters if they exist
        if (searchParameters.query) {
          q = query(q,
            where('full_name', '>=', searchParameters.query.toUpperCase()),
            where('full_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff')
          );
        }

        if (searchParameters.agency) {
          q = query(q, where('agency_name_lower', '==', searchParameters.agency));
        }

        if (searchParameters.startDate) {
          q = query(q, where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where('end_date', '<=', searchParameters.endDate));
        }

        // Add sorting
        q = query(q, orderBy(sortField, sortDirection));

        // Get total count
        const total = await getTotalCount();
        console.log('Setting total count:', total);
        setTotalCount(total);

        const pageSize = searchParameters.pageSize || 16;
        const page = searchParameters.page || 1;

        // Fetch 3x the page size to ensure we get enough unique officers
        q = query(q, limit(pageSize * 3));

        // If we're not on the first page and have a last document, use startAfter
        if (page > 1 && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        
        // Group officers by person_nbr
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        let uniqueCount = 0;
        let lastDocIndex = -1;

        for (let i = 0; i < snapshot.docs.length && uniqueCount < pageSize; i++) {
          const doc = snapshot.docs[i];
          const officer = doc.data() as PoliceOfficer;
          const person_nbr = officer.person_nbr;

          if (!groupedOfficers.has(person_nbr)) {
            groupedOfficers.set(person_nbr, []);
            uniqueCount++;
          }
          groupedOfficers.get(person_nbr)?.push(officer);
          lastDocIndex = i;
        }

        // Save the last document that gave us our last unique officer
        if (lastDocIndex >= 0) {
          setLastDoc(snapshot.docs[lastDocIndex]);
        }

        // Sort records within each group by date and set them directly
        const groups = Array.from(groupedOfficers.entries()).map(([person_nbr, records]) => ({
          person_nbr,
          records: records.sort((a, b) => {
            const dateA = new Date(a.start_date).getTime();
            const dateB = new Date(b.start_date).getTime();
            return dateB - dateA; // Sort by most recent first
          })
        }));

        setOfficerGroups(groups);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [state, searchParameters]);

  // Reset lastDoc when search parameters change (except page)
  useEffect(() => {
    setLastDoc(null);
  }, [searchParameters.query, searchParameters.agency, searchParameters.startDate, 
      searchParameters.endDate, searchParameters.sortBy, searchParameters.sortOrder]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalCount
  };
}
