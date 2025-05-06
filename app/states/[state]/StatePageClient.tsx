'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { useStaticText } from '@/hooks/useStaticText';
import { useOfficersByUid } from '@/hooks/useOfficersByUid';
import { useStateStats } from '@/hooks/useStateStats';
import SearchFilters from '@/components/search/SearchFilters';
import { US_STATES } from '@/constants/states';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/common/Pagination';
import OfficerCard from '@/components/officers/OfficerCard';
import styles from './styles.module.scss';
import { useEffect } from 'react';

export default function StatePageClient() {
  const params = useParams();
  const state = params.state as string;
  const { getText } = useStaticText('state');
  const searchParams = useSearchParams();
  const resolvedSearchParams = Object.fromEntries(searchParams);
  const stateData = US_STATES.find(
    s => s.reference.toLowerCase() === state.toLowerCase()
  );

  if (!stateData?.hasData) {
    notFound();
  }

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 16; // Fixed page size

  const { loading: statsLoading, error: statsError, stats } = useStateStats(state);
  const { loading: officersLoading, error: officersError, officerGroups, totalGroups } = useOfficersByUid({
    state,
    searchParams: {
      ...resolvedSearchParams,
      pageSize: pageSize.toString(),
      page: currentPage.toString()
    }
  });

  const loading = statsLoading || officersLoading;
  const error = statsError || officersError;
  const totalPages = totalGroups ? Math.ceil(totalGroups / pageSize) : 0;

  useEffect(() => {
    if (!loading && currentPage > totalPages && totalPages > 0) {
      window.location.href = `/states/${state}?page=${totalPages}`;
    }
  }, [loading, currentPage, totalPages, state]);

  // Debug logging
  console.log('Pagination Debug:', {
    totalGroups,
    pageSize,
    totalPages,
    currentPage,
    officerGroupsLength: officerGroups?.length || 0,
    shouldShowPagination: totalPages > 1,
    isLastPage: currentPage === totalPages,
    expectedPageSize: currentPage === totalPages ? undefined : pageSize
  });

  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={getText('officers-title', 'Officers in {state}').replace('{state}', state.toUpperCase())}
        description={`Searching  and explore police officer records in ${stateData.name}`}
        statistics={stats?.stats.filter(stat => stat.value !== '0').map(stat => ({
          value: parseInt(stat.value),
          label: stat.label
        }))}
      />

      <div className={`relative w-full bg-white rounded-tl-3xl rounded-tr-3xl z-1 ${styles.pageContentWrapper}`}>
        <div className="container-a mx-auto">

          <SearchFilters />

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
                        baseUrl={`/states/${state}`}
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
