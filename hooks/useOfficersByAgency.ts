'use client';

import { useState, useEffect, useMemo } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PoliceOfficer } from '@/types';

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
    sortBy?: string;
    sortOrder?: string;
    pageSize?: string;
    page?: string;
  };
}

export function useOfficersByAgency({ agencyName, agencyId, searchParams = { pageSize: '16' } }: UseOfficersByAgencyProps) {
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

  // Get the actual agency ID from the name if not provided
  const normalizedAgencyId = useMemo(() => {
    return agencyId?.replace(/\//g, '%2F') || agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/\//g, '-slash-');
  }, [agencyId, agencyName]);
  console.log('normalizedAgencyId', normalizedAgencyId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [sortedGroups, setSortedGroups] = useState<OfficerGroup[]>([]);
  const [totalOfficers, setTotalOfficers] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        // First, try to get the total_officers count from stats
        let officerCount = null;

        try {
          const statsRef = doc(db, 'statistics_per_agency', normalizedAgencyId);
          const statsDoc = await getDoc(statsRef);

          if (statsDoc.exists()) {
            const statsData = statsDoc.data();
            if (statsData.total_officers !== undefined) {
              officerCount = statsData.total_officers;
              setTotalOfficers(officerCount);
              console.log(`Using total_officers (${officerCount}) from statistics_per_agency`);
            }
          }

          // If not found in new collection, try the old one
          if (officerCount === null) {
            const oldStatsRef = doc(db, 'agency_statistics', normalizedAgencyId);
            const oldStatsDoc = await getDoc(oldStatsRef);

            if (oldStatsDoc.exists()) {
              const statsData = oldStatsDoc.data();
              const totalOfficersStat = statsData.stats?.find((stat: any) => stat.label === 'Total Officers');

              if (totalOfficersStat) {
                officerCount = parseInt(totalOfficersStat.value, 10);
                setTotalOfficers(officerCount);
                console.log(`Using Total Officers (${officerCount}) from agency_statistics`);
              }
            }
          }
        } catch (statsError) {
          console.error('Error fetching agency stats:', statsError);
          // Continue fetching officers even if stats retrieval fails
        }

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
            // where('full_name_lower', '>=', searchParameters.query),
            // where('full_name_lower', '<=', searchParameters.query + '\uf8ff')

            where(
              'searchQueries',
              'array-contains-any',
              searchParameters.query.toLowerCase().split(' ').slice(0, 20), // firestore limit is 30, 20 to be safe
            )
          );
        }

        if (searchParameters.startDate) {
          q = query(q, where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where('end_date', '<=', searchParameters.endDate));
        }

        // Determine how many officers to fetch
        const pageSize = searchParameters.pageSize || 16;
        const page = searchParameters.page || 1;

        // Fetch approach depends on whether we have a total count
        let officerFetchLimit = pageSize * 4; // Default multiplier

        // If we have total_officers and are requesting a specific page, we can be smarter
        if (officerCount !== null) {
          // Calculate the ideal limit based on total officers and current page
          // We'll fetch enough for the current page, but not too many
          const totalPages = Math.ceil(officerCount / pageSize);
          const isLastPage = page >= totalPages;

          if (isLastPage) {
            // For the last page, we just need the remainder
            const remainingOfficers = officerCount % pageSize || pageSize;
            // Still fetch a bit more to account for duplicates
            officerFetchLimit = remainingOfficers * 2;
          } else {
            // For normal pages, fetch 4x to handle duplicates
            officerFetchLimit = pageSize * 4;
          }

          console.log(`Fetching ${officerFetchLimit} officers for page ${page}/${totalPages} (pageSize: ${pageSize})`);
        } else {
          console.log(`No total_officers count available, fetching ${officerFetchLimit} officers`);
        }

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
    totalGroups: totalOfficers !== null ? totalOfficers : (sortedGroups?.length || 0)
  };
}
