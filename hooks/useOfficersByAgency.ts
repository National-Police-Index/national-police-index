'use client';

import { useState, useEffect, useMemo } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PoliceOfficer } from '@/types';

interface OfficerGroup {
  person_nbr: string;
  records: PoliceOfficer[];
}

interface UseOfficersByAgencyProps {
  agencyName: string;
  searchParams?: {
    query?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    pageSize?: string;
    page?: string;
  };
}

export function useOfficersByAgency({ agencyName, searchParams = { pageSize: '16' } }: UseOfficersByAgencyProps) {
  console.log('Agency Name:', agencyName);
  const searchParameters = useMemo(() => ({
    query: searchParams.query?.toLowerCase() || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    sortBy: searchParams.sortBy || 'last_name',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: typeof searchParams.pageSize === 'string' ? parseInt(searchParams.pageSize, 10) : (searchParams.pageSize || 16),
    page: parseInt(searchParams.page || '1', 10)
  }), [searchParams.query, searchParams.startDate, searchParams.endDate, 
      searchParams.sortBy, searchParams.sortOrder, searchParams.pageSize, searchParams.page]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [sortedGroups, setSortedGroups] = useState<OfficerGroup[]>([]);

  useEffect(() => {
    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        const officersRef = collectionGroup(db, 'db_launch');
        
        // Build query with mandatory agency filter and sorting
        const sortField = searchParameters.sortBy === 'date' ? 'start_date' : 'last_name';
        const sortDirection = searchParameters.sortOrder === 'desc' ? 'desc' : 'asc';
        
        let q = query(
          officersRef,
          where('agency_name', '==', agencyName),
          orderBy(sortField, sortDirection)
        );

        // Add optional filters
        if (searchParameters.query) {
          q = query(q,
            where('full_name_lower', '>=', searchParameters.query),
            where('full_name_lower', '<=', searchParameters.query + '\uf8ff')
          );
        }

        if (searchParameters.startDate) {
          q = query(q, where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where('end_date', '<=', searchParameters.endDate));
        }

        // Remove Firestore pagination; fetch a large enough batch to ensure enough groups for the requested page
        const pageSize = searchParameters.pageSize || 16;
        const page = searchParameters.page || 1;
        const officerFetchLimit = pageSize * 10; // Fetch up to 10x the page size to increase likelihood of filling the group page
        const qWithLimit = query(q, limit(officerFetchLimit));
        
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

        setSortedGroups(sortedGroups);

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
  }, [agencyName, searchParameters]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: sortedGroups?.length || 0
  };
}
