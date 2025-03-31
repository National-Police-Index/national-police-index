'use client';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
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
          <>
      <div className="space-y-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {officerGroups.map((group) => (
              <Link 
                href={`/officers/${group.person_nbr}`} 
                key={group.person_nbr} 
                className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {group.records[0].full_name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Latest Agency: {group.records[0].agency_name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {group.records.length} record{group.records.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p>Latest Position: {group.records[0].position || 'N/A'}</p>
                        <p className="mt-1">Start Date: {new Date(group.records[0].start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p>Status: {group.records[0].status || 'Active'}</p>
                        <p className="mt-1">End Date: {group.records[0].end_date ? new Date(group.records[0].end_date).toLocaleDateString() : 'Present'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
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
  );
}
