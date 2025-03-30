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
    pageSize?: number;
    pageToken?: string; // Base64 encoded last document
  };
}

export function useOfficersByUid({ state, searchParams = { pageSize: 20 } }: UseOfficersByUidProps) {
  // Memoize search parameters to prevent unnecessary re-renders
  const searchParameters = useMemo(() => ({
    query: searchParams.query?.toLowerCase() || '',
    agency: searchParams.agency?.toLowerCase() || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    sortBy: searchParams.sortBy || 'last_name',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: parseInt(searchParams.pageSize || '20', 10),
    page: parseInt(searchParams.page || '1', 10)
  }), [searchParams.query, searchParams.agency, searchParams.startDate, 
      searchParams.endDate, searchParams.sortBy, searchParams.sortOrder]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);


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
        let queryConstraints = [
          where('state', '==', state.toLowerCase())
        ];

        // Add optional filters if they exist
        if (searchParameters.query) {
          queryConstraints.push(where('full_name_lower', '>=', searchParameters.query));
          queryConstraints.push(where('full_name_lower', '<=', searchParameters.query + '\uf8ff'));
        }

        if (searchParameters.agency) {
          queryConstraints.push(where('agency_name_lower', '==', searchParameters.agency));
        }

        if (searchParameters.startDate) {
          queryConstraints.push(where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          queryConstraints.push(where('end_date', '<=', searchParameters.endDate));
        }

        // Add sorting
        queryConstraints.push(orderBy(sortField, sortDirection));
        
        // Add pagination
        const pageSize = searchParameters.pageSize;
        const offset = (searchParameters.page - 1) * pageSize;
        
        // Get all documents up to the end of the current page
        queryConstraints.push(limit((searchParameters.page) * pageSize));
        
        const snapshot = await getDocs(query(officersRef, ...queryConstraints));
        const allDocs = snapshot.docs;
        
        // Get only the documents for the current page
        const pageDocs = allDocs.slice(offset, offset + pageSize);
        
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
        console.log('sorted groups', sortedGroups);

        setOfficerGroups(sortedGroups);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [state, searchParameters]);

  return {
    loading,
    error,
    officerGroups
  };
}
