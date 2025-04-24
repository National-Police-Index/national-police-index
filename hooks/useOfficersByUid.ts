'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
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

  console.log('search parameters', searchParameters);

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

        // Build query with mandatory state filter
        let q = query(officersRef, where('state', '==', state.toLowerCase()));

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

        // Remove Firestore pagination; fetch a large enough batch to ensure enough groups for the requested page.
        // You may want to tune this multiplier for performance if your dataset is very large.
        const pageSize = searchParameters.pageSize || 16;
        const page = searchParameters.page || 1;
        const officerFetchLimit = pageSize * 10; // Fetch up to 10x the page size to increase likelihood of filling the group page.
        // Remove limit/startAfter pagination
        const qWithLimit = query(q, limit(officerFetchLimit));
        console.log('query', qWithLimit);

        const snapshot = await getDocs(qWithLimit);
        const allDocs = snapshot.docs;

        // Group officers by person_nbr
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        allDocs.forEach((doc) => {
          const officer = doc.data() as PoliceOfficer;
          const person_nbr = officer.person_nbr;
          if (!groupedOfficers.has(person_nbr)) {
            groupedOfficers.set(person_nbr, []);
          }
          groupedOfficers.get(person_nbr)?.push(officer);
        });

        // Sort records within each group by date
        const sortedGroups = Array.from(groupedOfficers.entries()).map(([person_nbr, records]) => ({
          person_nbr,
          records: records.sort((a, b) => {
            const dateA = new Date(a.start_date).getTime();
            const dateB = new Date(b.start_date).getTime();
            return dateB - dateA; // Sort by most recent first
          })
        }));

        // Paginate groups in-memory
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginatedGroups = sortedGroups.slice(startIdx, endIdx);
        console.log('paginated groups', paginatedGroups);

        setOfficerGroups(paginatedGroups);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [state, searchParameters, searchParams.page]);

  return {
    loading,
    error,
    officerGroups
  };
}
