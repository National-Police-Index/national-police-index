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

export function useOfficersByAgency({ agencyName, searchParams = { pageSize: 20 } }: UseOfficersByAgencyProps) {
  console.log('Agency Name:', agencyName);
  const searchParameters = useMemo(() => ({
    query: searchParams.query?.toLowerCase() || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    sortBy: searchParams.sortBy || 'last_name',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: (searchParams.pageSize || '20'),
    page: parseInt(searchParams.page || '1', 10)
  }), [searchParams.query, searchParams.startDate, searchParams.endDate, 
      searchParams.sortBy, searchParams.sortOrder, searchParams.pageSize, searchParams.page]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);

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

        // Add pagination
        // Add pagination
        const pageSize = parseInt(searchParameters.pageSize);
        q = query(q, limit(pageSize * searchParameters.page));
        
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs;
        
        // Get only the documents for the current page
        const startIndex = (searchParameters.page - 1) * pageSize;
        const pageDocs = allDocs.slice(startIndex, startIndex + pageSize);

        // Group officers by person_nbr
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        
        pageDocs.forEach((doc) => {
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

        setOfficerGroups(sortedGroups);
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
    officerGroups
  };
}
