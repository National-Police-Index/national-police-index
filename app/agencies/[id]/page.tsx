'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStaticText } from '@/hooks/useStaticText';
import { useAgencyStats } from '@/hooks/useAgencyStats';
import { useOfficersByAgency } from '@/hooks/useOfficersByAgency';
import SearchFilters from '@/components/search/SearchFilters';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/common/Pagination';
import OfficerCard from '@/components/officers/OfficerCard';
import styles from './styles.module.scss';
import { US_STATES } from '@/constants/states';

interface SearchParams {
  page?: string;
  pageSize?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default function AgencyPage() {
  const params = useParams();
  const id = decodeURIComponent(decodeURIComponent(params.id as string));
  const { getText } = useStaticText('agency');
  const searchParams = useSearchParams();
  const resolvedSearchParams = Object.fromEntries(searchParams) as SearchParams;

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 16; // Fixed page size, matches state page

  // Get agency statistics
  const { loading: statsLoading, error: statsError, stats } = useAgencyStats(id);

  const stateData = US_STATES.find(
    s => s.reference.toLowerCase() === stats?.state.toLowerCase()
  );
  // Get officers for this agency
  const { loading: officersLoading, error: officersError, officerGroups, totalGroups } = useOfficersByAgency({
    agencyName: stats?.name || '',
    agencyId: id,
    searchParams: {
      ...resolvedSearchParams,
      pageSize: pageSize.toString(),
      page: currentPage.toString()
    }
  });

  // Add a separate loading state for search operations
  const [searchLoading, setSearchLoading] = useState(false);

  // Track previous loading state to detect transitions
  const [prevOfficersLoading, setPrevOfficersLoading] = useState(officersLoading);

  // More aggressive reset of searchLoading state
  useEffect(() => {
    // Detect when officersLoading transitions from true to false
    if (prevOfficersLoading && !officersLoading) {
      setSearchLoading(false);
    }

    // Update previous loading state
    setPrevOfficersLoading(officersLoading);

    // Safety timeout to prevent stuck loading state (3 seconds max)
    const timeout = setTimeout(() => {
      if (searchLoading) {
        setSearchLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [officersLoading, searchLoading, prevOfficersLoading]);

  const loading = statsLoading || officersLoading || searchLoading;
  const error = statsError || officersError;
  // Calculate total pages based on unique officer groups instead of total records
  const totalPages = totalGroups ? Math.ceil(totalGroups / pageSize) : 0;

  // Debug logging similar to state page

  // Redirect if user is on a page that doesn't exist
  useEffect(() => {
    if (!loading && currentPage > totalPages && totalPages > 0) {
      window.location.href = `/agencies/${encodeURIComponent(id)}?page=${totalPages}`;
    }
  }, [loading, currentPage, totalPages, id]);
  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={getText('officers-title', `Officers in {state}`).replace('{state}', stats?.name || '') + (stateData ? ` - ${stateData?.name}` : '')}
        description={`Searching and exploring police officer records in ${stats?.name || ''}`}
        statistics={statsLoading ? (
          // Show loading skeleton for statistics when they're being calculated
          Array(4).fill(0).map((_, i) => ({
            value: -1, // Special value to indicate loading
            label: i === 0 ? 'Calculating statistics...' : ''
          }))
        ) : stats?.stats?.filter(stat => stat.value !== '0').map(stat => ({
          value: parseInt(stat.value),
          label: stat.label
        }))}
      />

      <div className={`relative w-full bg-white rounded-tl-3xl rounded-tr-3xl z-1 ${styles.pageContentWrapper}`}>
        <div className="container-a mx-auto">

          <SearchFilters
            state={stats?.state}
            agencyMode={true}
            onSearchStarted={() => { setSearchLoading(true); setTimeout(() => setSearchLoading(false), 1000); }}
          />

          {/* Show a notice when stats are being calculated on-the-fly */}
          {statsLoading && !stats?.is_partial && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Calculating agency statistics on-the-fly. This may take a moment for agencies with many records.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.cardsWrapper}>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 ">Loading officers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Error loading officers: {error.message}
              </div>
            ) : officerGroups.length === 0 ? (
              <div className="text-center py-12 ">
                No officers found matching your search criteria.
              </div>
            ) : (
              <>
                <div className={`flex flex-wrap gap-6 ${styles.cards}`}>
                  {officerGroups.map((group) => (
                    <OfficerCard key={group.person_nbr} officer={group.records[0]} />
                  ))}
                </div>
                <div className={styles.paginationWrapper}>
                  {totalPages > 1 && (
                    <div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={`/agencies/${decodeURIComponent(id)}`}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
