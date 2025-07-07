'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Combobox, Transition } from '@headlessui/react';
import { Checkbox } from '../ui/Checkbox';
import { SearchFilters as SearchFiltersType } from '@/types';
import { getAllAgencies } from '@/lib/searchAgencies';
import styles from './styles.module.scss';
import debounce from 'lodash/debounce';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { Fragment } from 'react';

interface SearchFiltersProps {
  state?: string;
  searchDebounceMs?: number;
}

export default function SearchFilters({ state, searchDebounceMs = 2000 }: SearchFiltersProps) {
  const router = useRouter();
  const [agencyQuery, setAgencyQuery] = useState('');
  const [agencies, setAgencies] = useState<{ name: string, count: number }[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<{ name: string, count: number }[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);

  // Initialize filters from URL params
  const searchParams = useSearchParams();

  // Keep track of the actual search query separately from filters
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('query') || '');

  const [filters, setRawFilters] = useState<SearchFiltersType>({
    query: searchParams.get('query') || '',
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate') as string) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate') as string) : undefined,
    agency: searchParams.get('agency') || '',
    sortBy: (searchParams.get('sortBy') as 'name' | 'date' | 'agency' | undefined) || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) || undefined,
    page: searchParams.get('page') || '1',
    activeOnly: searchParams.get('activeOnly') || 'false'
  });

  const setFilters = (filters: SearchFiltersType) => {
    console.log('setFilters', filters);
    setRawFilters({ ...filters, page: '1' });
  };

  // Create debounced function for updating search query in filters
  const debouncedSetSearchQuery = useMemo(() =>
    debounce((query: string) => {
      setFilters({ ...filters, query });
    }, searchDebounceMs),
    [filters, searchDebounceMs]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  // Fetch all agencies for the current state when component mounts
  useEffect(() => {
    if (state) {
      setIsLoadingAgencies(true);
      getAllAgencies(state)
        .then(results => {
          setAgencies(results);
          setFilteredAgencies(results);
          setIsLoadingAgencies(false);
        })
        .catch(error => {
          console.error('Error loading agencies:', error);
          setIsLoadingAgencies(false);
        });
    }
  }, [state]);

  // Filter agencies based on query
  const filterAgencies = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredAgencies(agencies);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = agencies.filter(agency =>
      agency.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredAgencies(filtered);
  }, [agencies]);

  // Create a debounced filter function
  const debouncedFilter = useMemo(
    () => debounce(filterAgencies, 200),
    [filterAgencies] // filterAgencies is the only function we need to track
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);

  const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
    const selectElement = e.currentTarget;
    const options = selectElement.querySelectorAll('option');
    options.forEach((option) => {
      if (option.value === '') {
        option.disabled = true;
      }
    });
  };

  // submit form whenever the filters state is updated
  useEffect(() => {
    // Preserve existing URL parameters
    const params = new URLSearchParams(searchParams.toString());

    // Update with current filter values
    if (filters.query) {
      params.set('query', filters.query);
    } else {
      params.delete('query');
    }

    if (filters.agency) {
      params.set('agency', filters.agency);
    } else {
      params.delete('agency');
    }

    if (filters.startDate) {
      params.set('startDate', filters.startDate.toISOString());
    } else {
      params.delete('startDate');
    }

    if (filters.endDate) {
      params.set('endDate', filters.endDate.toISOString());
    } else {
      params.delete('endDate');
    }

    if (filters.sortBy) {
      params.set('sortBy', filters.sortBy);
    } else {
      params.delete('sortBy');
    }

    if (filters.activeOnly) {
      params.set('activeOnly', filters.activeOnly);
    } else {
      params.delete('activeOnly');
    }


    if (filters.sortOrder) {
      params.set('sortOrder', filters.sortOrder);
    } else {
      params.delete('sortOrder');
    }

    if (filters.page) {
      params.set('page', filters.page);
      delete filters.page;
    }

    if (!params.has('page')) {
      params.set('page', '1');
    }

    // Update URL with search parameters (without causing a full page reload)
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router, searchParams]);

  const downloadEntireCSV = async () => {
    if (!state) return;

    try {
      const storage = getStorage();
      const csvFileName = `${state.toLowerCase()}-processed.csv`;
      const csvRef = ref(storage, csvFileName);

      const downloadURL = await getDownloadURL(csvRef);

      console.log('download url', downloadURL);
      // Create a temporary link and trigger the download
      window.open(downloadURL);
      /*
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = csvFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      */
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV. Please try again later.');
    }
  };

  const downloadFilteredCSV = async () => {
    if (!state) return;

    try {
      // Generate query params based on current filters
      const params = new URLSearchParams();
      if (filters.query) params.set('query', filters.query);
      if (filters.agency) params.set('agency', filters.agency);
      if (filters.startDate) params.set('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.set('endDate', filters.endDate.toISOString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      // Add state parameter
      params.set('state', state.toLowerCase());

      // Call the API endpoint to generate the filtered CSV
      const response = await fetch(`/api/download/csv?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to generate CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      /*
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.toLowerCase()}-filtered.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      */
      window.open(url);
    } catch (error) {
      console.error('Error generating filtered CSV:', error);
      alert('Error generating filtered CSV. Please try again later.');
    }
  };

  const handleDownloadOption = (option: string) => {
    if (option === 'entire') {
      downloadEntireCSV();
    } else if (option === 'filtered') {
      downloadFilteredCSV();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset to page 1 when applying new filters via the search button
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (filters.query) params.set('query', filters.query);
    if (filters.agency) params.set('agency', filters.agency);
    if (filters.startDate) params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.set('endDate', filters.endDate.toISOString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    // Update URL with search parameters
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className={`${styles.formFilters}`}>
      <div className="">
        {/* Search input */}
        <div className="">
          <div className="relative">
            <div className={`absolute ${styles.searchIcon}`}>
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 21.5C16.7467 21.5 21 17.2467 21 12C21 6.75329 16.7467 2.5 11.5 2.5C6.25329 2.5 2 6.75329 2 12C2 17.2467 6.25329 21.5 11.5 21.5Z" stroke="#122823" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 22.5L20 20.5" stroke="#122823" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search Data"
              value={searchQuery}
              onChange={(e) => {
                const newQuery = e.target.value;
                setSearchQuery(newQuery);
                debouncedSetSearchQuery(newQuery);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Cancel the debounced function
                  debouncedSetSearchQuery.cancel();
                  // Immediately execute the search
                  setFilters({ ...filters, query: searchQuery });
                  // Submit the form to update the URL
                  handleSearch(e);
                }
              }}
            />
            {false && (<button
              type="submit"
              className={styles.searchButton}
            >
              Search
            </button>)}
          </div>
        </div>

      </div>

      <div className={`flex ${styles.filtersRow} ${state ? styles.stateFilters : ''}`}>
        {/* Date range pickers */}
        <div className={styles.datePicker}>
          <DatePicker
            id="start-date"
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date || undefined })}
            placeholderText="Start date"
            popperPlacement="bottom-start"
          />
        </div>

        <div className={styles.datePicker}>
          <DatePicker
            id="end-date"
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date || undefined })}
            placeholderText="End date"
            popperPlacement="bottom-start"
          />
        </div>

        {/* Agency filter */}
        {state &&
          <div className={styles.agency}>
            <Combobox
              as="div"
              value={filters.agency}
              onChange={(value) => setFilters({ ...filters, agency: value || '' })}
              disabled={!state}
              style={{
                opacity: !state ? 0.5 : 1,
                pointerEvents: !state ? 'none' : 'auto'
              }}
            >
              <div className="relative">
                <div className="relative w-full">
                  {isLoadingAgencies && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent" />
                    </div>
                  )}
                  <Combobox.Input
                    className="w-full"
                    placeholder="Search agency..."
                    onChange={(e) => {
                      setAgencyQuery(e.target.value);
                      debouncedFilter(e.target.value);
                    }}
                    displayValue={(agency: string) => agency}
                  />
                  {false && (<button
                    type="submit"
                    className={styles.searchButton}
                  >
                    Select
                  </button>)}
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setAgencyQuery('')}
                >
                  <Combobox.Options className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ${styles.agencyOptions}`}>
                    {filteredAgencies.length === 0 && agencyQuery.length > 0 ? (
                      <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                        No agencies found.
                      </div>
                    ) : (
                      filteredAgencies.map((agency) => (
                        <Combobox.Option
                          key={agency.name}
                          value={agency.name}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-3 pr-9 ${active ? styles.active : 'text-gray-900'}`
                          }
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center justify-between">
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {agency.name}
                                </span>
                                <span className={`inline-block text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {agency.count} officers
                                </span>
                              </div>
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
          </div>
        }

        {/* Sort by */}
        <div>
          <select
            id="sort-by"
            name="sort-by"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'name' | 'date' | 'agency' })}
            onClick={handleSelectClick}
          >
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="date">Date</option>
            {state && <option value="agency">Agency</option>}
          </select>
        </div>

        {/* Sort order */}
        {false && <div>
          <select
            id="sort-order"
            name="sort-order"
            value={filters.sortOrder}
            onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
            onClick={handleSelectClick}
          >
            <option value="">Sort</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>}

        {/* Download options */}
        {state && (
          <div>
            <select
              id="download-options"
              name="download-options"
              defaultValue=""
              onChange={(e) => handleDownloadOption(e.target.value)}
              onClick={handleSelectClick}
              className={styles.downloadSelect}
            >
              <option value="">Download CSV</option>
              <option value="entire">Entire CSV</option>
              <option value="filtered">Filtered CSV</option>
            </select>
          </div>
        )}
      </div>

      {/* Active Officers Filter */}
      {!state && (
        <Checkbox
          id="active-only"
          checked={filters.activeOnly === 'true'}
          onChange={(checked) => setFilters({ ...filters, activeOnly: checked ? 'true' : 'false' })}
          label="Show only active officers"
        />
      )}

      {/* <div className={`flex justify-end ${styles.buttonGroup}`}>
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => setFilters({
            query: '',
            startDate: undefined,
            endDate: undefined,
            agency: '',
            sortBy: undefined,
            sortOrder: undefined
          })}
        >
          Clear Filters
        </button>
        <button
          className={styles.applyButton}
          type="submit"
        >
          Apply Filters
        </button>
      </div> */}
    </form>
  );
}
