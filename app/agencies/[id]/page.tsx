'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAgencyStats } from '@/hooks/useAgencyStats';
import { useOfficersByAgency } from '@/hooks/useOfficersByAgency';
import SearchFilters from '@/components/search/SearchFilters';
import Pagination from '@/components/common/Pagination';

interface SearchParams {
  page?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default function AgencyPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const agencyName = decodeURIComponent(id as string).replace(/-/g, ' ');
  
  // Get agency statistics
  const { loading: statsLoading, error: statsError, stats } = useAgencyStats(id as string);
  
  // Get officers for this agency
  const { loading: officersLoading, error: officersError, officerGroups } = useOfficersByAgency({
    agencyName: stats?.name || '',
    searchParams: Object.fromEntries(searchParams) as SearchParams
  });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const totalPages = stats ? Math.ceil(stats.total_officers / pageSize) : 0;

  if (statsLoading || officersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading agency data...</p>
        </div>
      </div>
    );
  }

  if (statsError || officersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-600">
          {statsError?.message || officersError?.message}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-600">
          Agency not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{stats.name}</h1>
        <p className="text-gray-600 mb-4">State: {stats.state.toUpperCase()}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Officers</p>
            <p className="text-2xl font-semibold">{stats.total_officers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Records</p>
            <p className="text-2xl font-semibold">
              {Object.values(stats.total_officer_start_date).reduce((a, b) => a + b, 0)}
            </p>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/agencies/${id}`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
