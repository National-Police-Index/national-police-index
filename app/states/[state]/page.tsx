'use client';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useOfficersByUid } from '@/hooks/useOfficersByUid';
import { useStateStats } from '@/hooks/useStateStats';
import OfficerCard from '@/components/officers/OfficerCard';
import SearchFilters from '@/components/search/SearchFilters';
import Pagination from '@/components/common/Pagination';
import { US_STATES } from '@/constants/states';

interface StatePageProps {
  params: Promise<{
    state: string;
  }>;
}

interface SearchParams {
  page?: string;
  query?: string;
  agency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  pageSize?: string;
}

export default function StatePage({ params, searchParams }: StatePageProps & { searchParams: Promise<SearchParams> }) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-left mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {stateData.name}
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Search and explore police officer records in {stateData.name}
        </p>
        {stats && (
          <p className="mt-2 text-sm text-gray-500">
            Total officers: {stats.total_officers.toLocaleString()}
          </p>
        )}
      </div>

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
          <div className="space-y-8">
            {officerGroups.map((group) => (
              <div key={group.person_nbr} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {group.records[0].full_name}
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {group.records.map((record, index) => (
                    <div key={`${record.document_id}-${index}`} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <OfficerCard officer={record} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
        )}
      </div>
    </div>
  );
}
