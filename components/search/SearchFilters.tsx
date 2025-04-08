'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SearchFilters as SearchFiltersType } from '@/types';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    startDate: undefined,
    endDate: undefined,
    agency: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.agency) params.set('agency', filters.agency);
    if (filters.startDate) params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.set('endDate', filters.endDate.toISOString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    // Reset to page 1 when applying new filters
    params.set('page', '1');

    // Update URL with search parameters
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6 mb-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search input */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1 relative rounded-md shadow-sm bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-300 ">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Search by name, agency, or ID"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
        </div>

      </div>

      <div className="grid gap-4 grid-cols-5">
        {/* Date range pickers */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker
            id="start-date"
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date || undefined })}
            className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-300 "
            placeholderText="Select start date"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <DatePicker
            id="end-date"
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date || undefined })}
            className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-300 "
            placeholderText="Select end date"
          />
        </div>

        {/* Agency filter */}

        <div>
          <label htmlFor="agency" className="block text-sm font-medium text-gray-700">
            Agency
          </label>
          <select
            id="agency"
            name="agency"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-300 "
            value={filters.agency}
            onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
          >
            <option value="">All Agencies</option>
            {/* Add agency options dynamically */}
          </select>
        </div>

        {/* Sort by */}
        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort-by"
            name="sort-by"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-300 "
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'name' | 'date' | 'agency' })}
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="agency">Agency</option>
          </select>
        </div>

        {/* Sort order */}
        <div>
          <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700">
            Download
          </label>
          <select
            id="sort-order"
            name="sort-order"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-stone-300 "
            value={filters.sortOrder}
            onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={() => setFilters({
            query: '',
            startDate: undefined,
            endDate: undefined,
            agency: '',
            sortBy: 'name',
            sortOrder: 'asc'
          })}
        >
          Clear Filters
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-900 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
}
