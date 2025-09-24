"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Combobox, Transition } from "@headlessui/react";
import { Checkbox } from "../ui/Checkbox";
import { SearchFilters as SearchFiltersType } from "@/types";
import { getAllAgencies, filterAgenciesByTerm } from "@/lib/searchAgencies";
import styles from "./styles.module.scss";
import debounce from "lodash/debounce";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Fragment } from "react";

interface SearchFiltersProps {
  state?: string;
  agencyMode?: boolean;
  onSearchStarted?: () => void;
}

export default function SearchFilters({
  state,
  agencyMode = false,
  onSearchStarted,
}: SearchFiltersProps) {
  const router = useRouter();
  const [agencyQuery, setAgencyQuery] = useState("");
  const [agencies, setAgencies] = useState<{ name: string; count: number }[]>(
    []
  );
  const [filteredAgencies, setFilteredAgencies] = useState<
    { name: string; count: number }[]
  >([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);
  const [isLoadingFullAgencyList, setIsLoadingFullAgencyList] = useState(false);
  const [reset, setReset] = useState(false);

  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("query") || ""
  );

  const [filters, setRawFilters] = useState<SearchFiltersType>({
    query: searchParams.get("query") || "",
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    agency: searchParams.get("agency") || "",
    sortBy:
      (searchParams.get("sortBy") as "name" | "date" | "agency" | undefined) ||
      undefined,
    sortOrder:
      (searchParams.get("sortOrder") as "asc" | "desc" | undefined) ||
      undefined,
    activeOnly: searchParams.get("activeOnly") || "false",
    reset,
  });

  const setFilters = (filters: SearchFiltersType) => {
    setReset(true);
    setRawFilters({ ...filters });
  };

  const filterAgenciesByQuery = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredAgencies(agencies.slice(0, 100));
        setIsLoadingAgencies(false);
        return;
      }

      if (state) {
        const filtered = filterAgenciesByTerm(state, query);

        if (filtered.length > 0 || query.trim().length < 2) {
          setFilteredAgencies(filtered);
          setIsLoadingAgencies(false);
          setIsLoadingFullAgencyList(false);
        } else if (query.trim().length >= 2) {
          setIsLoadingFullAgencyList(true);

          setTimeout(() => {
            const updatedFiltered = filterAgenciesByTerm(state, query);
            setFilteredAgencies(updatedFiltered);
            setIsLoadingAgencies(false);
            setIsLoadingFullAgencyList(false);
          }, 2000);
        }
      } else {
        const lowerQuery = query.toLowerCase();
        const filtered = agencies.filter((agency) =>
          agency.name.toLowerCase().includes(lowerQuery)
        );
        setFilteredAgencies(filtered);
        setIsLoadingAgencies(false);
      }
    },
    [agencies, state]
  );

  useEffect(() => {
    if (!agencyMode && state) {
      setIsLoadingAgencies(true);
      getAllAgencies(state)
        .then((results) => {
          setAgencies(results);
          setFilteredAgencies(results.slice(0, 100));
          setIsLoadingAgencies(false);

          if (agencyQuery && agencyQuery.trim().length >= 2) {
            filterAgenciesByQuery(agencyQuery);
          }
        })
        .catch((error) => {
          console.error(error);
          setIsLoadingAgencies(false);
        });
    }
  }, [state, filterAgenciesByQuery, agencyQuery, agencyMode]);

  const debouncedFilter = useMemo(
    () => debounce(filterAgenciesByQuery, 300),
    [filterAgenciesByQuery]
  );

  useEffect(() => {
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);

  const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
    const selectElement = e.currentTarget;
    const options = selectElement.querySelectorAll("option");
    options.forEach((option) => {
      if (option.value === "") {
        option.disabled = true;
      }
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.query && filters.query.trim() !== "") {
      params.set("query", filters.query);
    } else {
      params.delete("query");
    }

    if (filters.agency) {
      params.set("agency", filters.agency);
    } else {
      params.delete("agency");
    }

    if (filters.startDate) {
      params.set("startDate", filters.startDate.toISOString());
    } else {
      params.delete("startDate");
    }

    if (filters.endDate) {
      params.set("endDate", filters.endDate.toISOString());
    } else {
      params.delete("endDate");
    }

    if (filters.activeOnly) {
      params.set("activeOnly", filters.activeOnly);
    } else {
      params.delete("activeOnly");
    }

    if (filters.sortOrder) {
      params.set("sortOrder", filters.sortOrder);
    } else {
      params.delete("sortOrder");
    }

    if (reset) {
      params.set("page", "1");
      params.delete("direction");
      setReset(false);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router, searchParams]);

  const downloadEntireCSV = async () => {
    if (!state) return;

    try {
      const storage = getStorage();
      const csvFileName = `${state.toLowerCase()}-processed.csv`;
      const csvRef = ref(storage, csvFileName);

      const downloadURL = await getDownloadURL(csvRef);

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
      console.error(error);
      alert("Error downloading CSV. Please try again later.");
    }
  };

  const downloadFilteredCSV = async () => {
    if (!state) return;

    try {
      const params = new URLSearchParams();
      if (filters.query) params.set("query", filters.query);
      if (filters.agency) params.set("agency", filters.agency);
      if (filters.startDate)
        params.set("startDate", filters.startDate.toISOString());
      if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
      if (filters.sortBy) params.set("sortBy", filters.sortBy);

      params.set("state", state.toLowerCase());

      const response = await fetch(`/api/download/csv?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to generate CSV");
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
      console.error(error);
      alert("Error generating filtered CSV. Please try again later.");
    }
  };

  const handleDownloadOption = (option: string) => {
    if (option === "entire") {
      downloadEntireCSV();
    } else if (option === "filtered") {
      downloadFilteredCSV();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.delete("direction");
    if (filters.query) params.set("query", filters.query);
    if (filters.agency) params.set("agency", filters.agency);
    if (filters.startDate)
      params.set("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className={`${styles.formFilters}`}>
      <div className="">
        {/* Search input */}
        <div className="">
          <div className="relative">
            <div className={`absolute ${styles.searchIcon}`}>
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 21.5C16.7467 21.5 21 17.2467 21 12C21 6.75329 16.7467 2.5 11.5 2.5C6.25329 2.5 2 6.75329 2 12C2 17.2467 6.25329 21.5 11.5 21.5Z"
                  stroke="#122823"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 22.5L20 20.5"
                  stroke="#122823"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {false && (
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search Data"
                value={searchQuery}
                onBlur={(e) => {
                  e.preventDefault();
                  if (onSearchStarted) onSearchStarted();
                  if (searchQuery !== filters.query) {
                    setFilters({ ...filters, query: searchQuery });
                    handleSearch(e);
                  }
                }}
                onChange={(e) => {
                  e.preventDefault();
                  const newQuery = e.target.value;
                  setSearchQuery(newQuery);

                  if (newQuery === "") {
                    setFilters({ ...filters, query: "" });

                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("query");
                    router.push(`?${params.toString()}`, { scroll: false });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (onSearchStarted) onSearchStarted();
                    setFilters({ ...filters, query: searchQuery });
                    handleSearch(e);
                  }
                }}
              />
            )}
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search Data"
              value={searchQuery}
              onChange={(e) => {
                e.preventDefault();
                const newQuery = e.target.value;
                setSearchQuery(newQuery);

                if (newQuery === "") {
                  setFilters({ ...filters, query: "" });

                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("query");
                  params.set("page", "1");
                  params.delete("direction");
                  router.push(`?${params.toString()}`, { scroll: false });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                }
              }}
            />
            <button
              type="submit"
              className={styles.searchButton}
              onClick={(e) => {
                e.preventDefault();
                if (onSearchStarted) onSearchStarted();
                setFilters({ ...filters, query: searchQuery });
                handleSearch(e);
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex ${styles.filtersRow} ${
          !agencyMode ? styles.stateFilters : ""
        }`}
      >
        {/* Date range pickers */}
        <div className={styles.datePicker}>
          <DatePicker
            id="start-date"
            selected={filters.startDate}
            onChange={(date) =>
              setFilters({ ...filters, startDate: date || undefined })
            }
            placeholderText="Start date"
            popperPlacement="bottom-start"
          />
        </div>

        <div className={styles.datePicker}>
          <DatePicker
            id="end-date"
            selected={filters.endDate}
            onChange={(date) =>
              setFilters({ ...filters, endDate: date || undefined })
            }
            placeholderText="End date"
            popperPlacement="bottom-start"
          />
        </div>

        {/* Agency filter */}
        {!agencyMode && (
          <div className={styles.agency}>
            <Combobox
              as="div"
              value={filters.agency}
              onChange={(selectedAgency: string) => {
                setFilters({ ...filters, agency: selectedAgency || "" });

                setAgencyQuery(selectedAgency || "");
              }}
              className={styles.select}
            >
              <div className="relative">
                <div className="relative flex w-full">
                  {isLoadingAgencies && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#122823] border-r-transparent" />
                    </div>
                  )}
                  {agencyQuery && agencyQuery.length > 0 && (
                    <div className={styles.agencyCount}>
                      {filteredAgencies.length > 0 && !isLoadingAgencies
                        ? `${filteredAgencies.length} results`
                        : ""}
                    </div>
                  )}
                  <Combobox.Input
                    className="w-full"
                    placeholder="Search agency..."
                    value={agencyQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAgencyQuery(value);

                      if (!value.trim()) {
                        setFilters({ ...filters, agency: "" });
                      }

                      if (value.trim().length > 1) {
                        setIsLoadingAgencies(true);
                      } else {
                        setIsLoadingAgencies(false);
                      }

                      const keyEvent = window.event as KeyboardEvent;
                      if (keyEvent && keyEvent.key === "Enter") {
                        filterAgenciesByQuery(value);
                      } else {
                        debouncedFilter(value);
                      }
                    }}
                    displayValue={(agency: string) => agency}
                  />
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => {
                    if (!filters.agency) {
                      setAgencyQuery("");
                    }
                  }}
                >
                  <Combobox.Options
                    className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ${styles.agencyOptions}`}
                  >
                    {isLoadingAgencies ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {isLoadingFullAgencyList
                            ? "Loading all agencies..."
                            : "Loading agencies..."}
                        </div>
                      </div>
                    ) : filteredAgencies.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        No agencies found for this search.
                      </div>
                    ) : (
                      filteredAgencies.map((agency) => (
                        <Combobox.Option
                          key={agency.name}
                          value={agency.name}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                              active ? styles.active : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {agency.name}
                                </span>
                                {/*span className={`inline-block text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {agency.count} officers
                                </span>*/}
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
        )}

        {/* Sort by */}
        {!agencyMode && (
          <div>
            <select
              id="sort-by"
              name="sort-by"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as "name" | "date" | "agency",
                })
              }
              onClick={handleSelectClick}
            >
              <option value="">Sort by</option>
              <option value="name">Name</option>
              <option value="date">Date</option>
              {state && <option value="agency">Agency</option>}
            </select>
          </div>
        )}

        {/* Sort order */}
        {false && (
          <div>
            <select
              id="sort-order"
              name="sort-order"
              value={filters.sortOrder}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortOrder: e.target.value as "asc" | "desc",
                })
              }
              onClick={handleSelectClick}
            >
              <option value="">Sort</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        )}

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
      {agencyMode && (
        <Checkbox
          id="active-only"
          checked={filters.activeOnly === "true"}
          onChange={(checked) =>
            setFilters({ ...filters, activeOnly: checked ? "true" : "false" })
          }
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
