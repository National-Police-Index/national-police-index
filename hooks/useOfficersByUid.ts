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
    pageSize: searchParams.pageSize || 20,
    pageToken: searchParams.pageToken
  }), [searchParams.query, searchParams.agency, searchParams.startDate, 
      searchParams.endDate, searchParams.sortBy, searchParams.sortOrder]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

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
        queryConstraints.push(limit(searchParameters.pageSize));
        
        // If we have a page token, start after the last document
        if (searchParameters.pageToken) {
          try {
            const lastDocData = JSON.parse(atob(searchParameters.pageToken));
            queryConstraints.push(startAfter(lastDocData));
          } catch (e) {
            console.error('Invalid page token:', e);
          }
        }

        const q = query(officersRef, ...queryConstraints);

        const snapshot = await getDocs(q);
        
        // Group officers by person_nbr
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        
        snapshot.docs.forEach((doc) => {
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

        // Update state
        setOfficerGroups(prevGroups => searchParameters.pageToken 
          ? [...prevGroups, ...sortedGroups]
          : sortedGroups
        );
        
        // Update pagination state
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastDoc(lastVisible);
        setHasMore(snapshot.docs.length === searchParameters.pageSize);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
      } finally {
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [state, searchParameters]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    
    // Create a base64 token from the last document
    if (lastDoc) {
      const token = btoa(JSON.stringify(lastDoc.data()));
      // Call the hook again with the new page token
      searchParams.pageToken = token;
    }
  }, [hasMore, loading, lastDoc, searchParams]);

  return {
    loading,
    error,
    officerGroups,
    hasMore,
    loadMore
  };
}
