'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Combobox } from '@headlessui/react';
import { SearchFilters as SearchFiltersType } from '@/types';
import { searchAgencies } from '@/lib/searchAgencies';
import styles from './styles.module.scss';
import debounce from 'lodash/debounce';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface SearchFiltersProps {
  state?: string;
}

export default function SearchFilters({ state }: SearchFiltersProps) {
  const router = useRouter();
  const [agencyQuery, setAgencyQuery] = useState('');
  const [agencies, setAgencies] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    startDate: undefined,
    endDate: undefined,
    agency: '',
    sortBy: undefined,
    sortOrder: undefined
  });

  // Create a debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        console.log('Searching agencies...', query);
        const results = await searchAgencies(query);
        console.log('Results', results)
        setAgencies(results);
      }, 300),
    []
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
    const selectElement = e.currentTarget;
    const options = selectElement.querySelectorAll('option');
    options.forEach((option) => {
      if (option.value === '') {
        option.disabled = true;
      }
    });
  };

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
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
        </div>

      </div>

      <div className={`flex ${styles.filtersRow}`}>
        {/* Date range pickers */}
        <div className={styles.datePicker}>
          <DatePicker
            id="start-date"
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date || undefined })}
            placeholderText="Start date"
          />
        </div>

        <div className={styles.datePicker}>
          <DatePicker
            id="end-date"
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date || undefined })}
            placeholderText="End date"
          />
        </div>

        {/* Agency filter */}
        {state && <div className={styles.agency}>
          <Combobox
            as="div"
            value={filters.agency}
            onChange={(value) => setFilters({ ...filters, agency: value || '' })}
          >
            <div className="relative">
              <Combobox.Input
                className="w-full"
                placeholder="Search agency..."
                onChange={(e) => {
                  setAgencyQuery(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                displayValue={(agency: string) => agency}
              />
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                {agencies.map((agency) => (
                  <Combobox.Option
                    key={agency}
                    value={agency}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-3 pr-9 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                  >
                    {agency}
                  </Combobox.Option>
                ))}
                {agencyQuery.length >= 3 && agencies.length === 0 && (
                  <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900">
                    No agencies found
                  </div>
                )}
              </Combobox.Options>
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

      <div className={`flex justify-end ${styles.buttonGroup}`}>
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
      </div>
    </form>
  );
}
