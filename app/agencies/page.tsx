'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAgencies } from '@/hooks/useAgencies';

export default function AgenciesPage() {
  const { loading, error, agencies } = useAgencies();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Get unique states from agencies
  const states = [...new Set(agencies.map(agency => agency.state))].sort();

  // Filter agencies based on search and state
  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = !selectedState || agency.state === selectedState;
    return matchesSearch && matchesState;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading agencies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Law Enforcement Agencies</h1>
        <p className="text-gray-600">Browse through {agencies.length} agencies across the United States</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Agencies
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by agency name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by State
            </label>
            <select
              id="state"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>
                  {state.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agency List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgencies.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-gray-600">
            No agencies found matching your criteria.
          </div>
        ) : (
          filteredAgencies.map((agency) => {
            const agencyId = agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return (
              <Link
                key={agencyId}
                href={`/agencies/${agencyId}`}
                className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {agency.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {agency.state.toUpperCase()}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-blue-600">
                      {agency.total_officers} Officers
                    </div>
                    <div className="text-gray-500">
                      Updated {new Date(agency.last_updated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
