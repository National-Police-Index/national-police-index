'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useStaticText } from '@/hooks/useStaticText';
import { useAgencyStats } from '@/hooks/useAgencyStats';
import { useOfficersByAgency } from '@/hooks/useOfficersByAgency';
import SearchFilters from '@/components/search/SearchFilters';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/common/Pagination';
import OfficerCard from '@/components/officers/OfficerCard';
import styles from './styles.module.scss';

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
  const id = params.id as string;
  const { getText } = useStaticText('agency');
  const searchParams = useSearchParams();
  const resolvedSearchParams = Object.fromEntries(searchParams) as SearchParams;

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = parseInt(resolvedSearchParams.pageSize || '16', 10);

  // Get agency statistics
  const { loading: statsLoading, error: statsError, stats } = useAgencyStats(decodeURIComponent(id) as string);

  // Get officers for this agency
  const { loading: officersLoading, error: officersError, officerGroups, totalGroups } = useOfficersByAgency({
    agencyName: stats?.name || '',
    searchParams: {
      ...resolvedSearchParams,
      pageSize: pageSize.toString(),
    }
  });

  const loading = statsLoading || officersLoading;
  const error = statsError || officersError;
  // Calculate total pages based on unique officer groups instead of total records
  const totalPages = totalGroups ? Math.ceil(totalGroups / pageSize) : 0;

  console.log('STATS', decodeURIComponent(id), stats);
  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={getText('officers-title', 'Officers in {state}').replace('{state}', stats?.name || '')}
        description={`Searching  and explore police officer records in ${stats?.name || ''}`}

        statistics={stats?.stats?.filter(stat => stat.value !== '0').map(stat => ({
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
