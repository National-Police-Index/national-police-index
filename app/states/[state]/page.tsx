'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { useOfficersByUid } from '@/hooks/useOfficersByUid';
import { useStateStats } from '@/hooks/useStateStats';
import SearchFilters from '@/components/search/SearchFilters';
import { US_STATES } from '@/constants/states';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/common/Pagination';
import OfficerCard from '@/components/officers/OfficerCard';

interface StatePageProps {
  params: Promise<{
    state: string;
  }>;
  searchParams: Promise<{
    page?: string;
    query?: string;
    agency?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    pageSize?: string;
  }>;
}

export default function StatePage({ params, searchParams }: StatePageProps) {
  const { state } = use(params);
  const resolvedSearchParams = use(searchParams);
  const stateData = US_STATES.find(
    s => s.reference.toLowerCase() === state.toLowerCase()
  );

  if (!stateData?.hasData) {
    notFound();
  }

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = parseInt(resolvedSearchParams.pageSize || '20', 10);

  const { loading: statsLoading, error: statsError, stats } = useStateStats(state);
  const { loading: officersLoading, error: officersError, officerGroups } = useOfficersByUid({
    state,
    searchParams: {
      ...resolvedSearchParams,
      pageSize,
      pageToken: undefined // We're not using infinite scroll anymore
    }
  });

  const loading = statsLoading || officersLoading;
  const error = statsError || officersError;
  const totalPages = stats ? Math.ceil(stats.total_officers / pageSize) : 0;

  const lastYearIndex = Object.keys(stats?.total_officer_end_date || {}).length;
  const lastYear = lastYearIndex > 0 ? Object.keys(stats?.total_officer_end_date || {})[lastYearIndex - 1] : '';
  const lastYearAmount = lastYearIndex > 0 ? (stats?.total_officer_end_date?.[lastYear]) : 0;

  const startYearIndex = Object.keys(stats?.total_officer_start_date || {}).length;
  const startYear = startYearIndex > 0 ? Object.keys(stats?.total_officer_start_date || {})[startYearIndex - 1] : '';
  const startYearAmount = startYearIndex > 0 ? (stats?.total_officer_start_date?.[startYear]) : 0;
  return (
    <div className="w-full mx-auto">
      <PageHeader
        title={stateData.name}
        description={`Searching  and explore police officer records in ${stateData.name}`}
        statistics={[
          {
            value: stats?.total_officers || 0,
            label: "Total officers"
          },
          {
            value: lastYearAmount || 0,
            label: `Officers terminated in ${lastYear}`
          },
          {
            value: startYearAmount || 0,
            label: `Officers started in ${startYear}`
          },
        ]}
      />

      <div className="w-full bg-white rounded-tl-3xl rounded-tr-3xl pt-12 ">
        <div className="w-5/6 mx-auto">

          <SearchFilters />

          <div className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-gray-600">Loading officers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Error loading officers: {error.message}
              </div>
            ) : officerGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No officers found matching your search criteria.
              </div>
            ) : (
              <>
                <div className="space-y-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto place-items-center">
                  {officerGroups.map((group) => (
                    <OfficerCard key={group.person_nbr} officer={group.records[0]} />
                  ))}
                </div>
                <div className="mt-8">
                  {totalPages > 1 && (
                    <div className="mt-8">
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