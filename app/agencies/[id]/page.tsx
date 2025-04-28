'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useStaticText } from '@/hooks/useStaticText';
import Link from 'next/link';
import { useAgencyStats } from '@/hooks/useAgencyStats';
import { useOfficersByAgency } from '@/hooks/useOfficersByAgency';
import SearchFilters from '@/components/search/SearchFilters';
import Pagination from '@/components/common/Pagination';

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
  console.log('Resolved Search Params:', decodeURIComponent(id), resolvedSearchParams);
  const { loading: statsLoading, error: statsError, stats } = useAgencyStats(decodeURIComponent(id) as string);
  console.log('STats', stats)

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading agency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600">
          Agency not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{stats.name}</h1>
        <p className="text-gray-600 mb-4">State: {stats.state.toUpperCase()}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">{getText('active-records', 'Active Records')}</p>
            <p className="text-2xl font-semibold">
              {Object.values(stats.total_officer_start_date).reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{getText('total-officers', 'Total Officers')}</p>
            <p className="text-2xl font-semibold">{stats.total_officers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-2xl font-semibold">
              {new Date(stats.last_updated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="mb-8">
        <SearchFilters />
      </div>

      {/* Results */}
      <div className="space-y-8">
        {officerGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No officers found matching your search criteria.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
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
                          Latest Position: {group.records[0].position || 'N/A'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        {group.records.length} record{group.records.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p>Start Date: {new Date(group.records[0].start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p>Status: {group.records[0].status || 'Active'}</p>
                          <p>End Date: {group.records[0].end_date ? new Date(group.records[0].end_date).toLocaleDateString() : 'Present'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/agencies/${decodeURIComponent(id)}`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
