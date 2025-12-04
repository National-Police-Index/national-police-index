"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CursorPagination from "@/components/common/CursorPagination";
import OfficerCard from "@/components/officers/OfficerCard";
import PageHeader from "@/components/PageHeader";
import SearchFilters from "@/components/search/SearchFilters";
import { US_STATES } from "@/constants/states";
import { useAgencyAnalytics } from "@/hooks/useAgencyAnalytics";
import { useAgencyStats } from "@/hooks/useAgencyStats";
import { useOfficersByAgency } from "@/hooks/useOfficersByAgency";
import { useStaticText } from "@/hooks/useStaticText";
import styles from "./styles.module.scss";

interface SearchParams {
  page?: string;
  pageSize?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  direction?: string;
}

export default function AgencyPage() {
  const params = useParams();
  const pathname = usePathname();

  let stateId = useMemo(() => {
    return pathname.split("/")?.slice(2, 3)?.join("/");
  }, [pathname]);

  const id = decodeURIComponent(decodeURIComponent(params.id as string));
  if (!stateId) {
    stateId = decodeURIComponent(decodeURIComponent(params.state as string));
  }

  const { getText } = useStaticText("agency");
  const searchParams = useSearchParams();
  const resolvedSearchParams = Object.fromEntries(searchParams) as SearchParams;

  const pageSize = 16;
  const direction = resolvedSearchParams.direction as
    | "next"
    | "prev"
    | undefined;
  const page = resolvedSearchParams.page || "1";

  const {
    loading: statsLoading,
    error: statsError,
    stats,
  } = useAgencyStats(id, stateId);

  let stateData = US_STATES.find((s) => s.reference.toLowerCase() === stateId);
  if (!stateData) {
    stateData = US_STATES.find(
      (s) => s.reference.toLowerCase() === stats?.state.toLowerCase(),
    );
  }
  console.log("stateData", stateId, stateData);
  // Analytics tracking for agency page
  const analyticsData = stats
    ? {
        agencyId: id,
        agencyName: stats.name,
        state: stateData?.name || stats.state,
        officerCount: stats.stats?.find(
          (stat) => stat.label === "Total Officers",
        )?.value
          ? parseInt(
              stats.stats.find((stat) => stat.label === "Total Officers")
                ?.value || "0",
              10,
            )
          : undefined,
      }
    : null;

  useAgencyAnalytics(analyticsData);

  const {
    loading: officersLoading,
    error: officersError,
    officerGroups,
    totalGroups,
    hasNextPage,
    hasPreviousPage,
    currentPage: apiCurrentPage,
  } = useOfficersByAgency({
    agencyName: stats?.name || "",
    agencyId: id,
    state: stateId,
    searchParams: {
      ...resolvedSearchParams,
      pageSize: pageSize.toString(),
      page,
      direction,
    },
  });

  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setSearchLoading(officersLoading);

    const timeout = setTimeout(() => {
      if (searchLoading) {
        setSearchLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [officersLoading, searchLoading]);

  const loading = statsLoading || officersLoading || searchLoading;
  const error = statsError || officersError;

  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={
          getText("officers-title", `Officers in {state}`).replace(
            "{state}",
            stats?.name || "",
          ) + (stateData ? ` - ${stateData?.name}` : "")
        }
        description={`Searching and exploring police officer records in ${
          stats?.name || ""
        }`}
        statistics={
          statsLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => ({
                  value: -1,
                  label: i === 0 ? "Calculating statistics..." : "",
                }))
            : stats?.stats
                ?.filter((stat) => stat.value !== "0")
                .map((stat) => ({
                  value: parseInt(stat.value, 10),
                  label: stat.label,
                }))
        }
      />

      <div
        className={`relative w-full bg-white rounded-tl-3xl rounded-tr-3xl z-1 ${styles.pageContentWrapper}`}
      >
        <div className="container-a mx-auto">
          <SearchFilters
            state={stats?.state}
            agencyMode={true}
            onSearchStarted={() => setSearchLoading(true)}
          />

          {/* Show a notice when stats are being calculated on-the-fly */}
          {statsLoading && !stats?.is_partial && (
            <div className="bg-[#F3F4F6] border-l-4 border-[#4F8C7E] p-4 my-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#4F8C7E] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-[#122823]">
                    Calculating agency statistics on-the-fly. This may take a
                    moment for agencies with many records.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.cardsWrapper}>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 ">Loading officers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Error loading officers: {error.message}
              </div>
            ) : officerGroups.length === 0 ? (
              <div className="text-center py-12 ">
                No officers found matching your search criteria.
              </div>
            ) : (
              <>
                <div className={`flex flex-wrap gap-6 ${styles.cards}`}>
                  {officerGroups.map((group) => (
                    <OfficerCard
                      key={group.person_nbr}
                      officer={group.records[0]}
                    />
                  ))}
                </div>
                <div className={styles.paginationWrapper}>
                  <div>
                    <CursorPagination
                      currentPage={apiCurrentPage}
                      totalCount={totalGroups || 0}
                      pageSize={pageSize}
                      baseUrl={`/agencies/${encodeURIComponent(id)}`}
                      hasPreviousPage={hasPreviousPage}
                      hasNextPage={hasNextPage}
                      onPageSizeChange={(newSize) => {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.set("pageSize", newSize.toString());
                        window.location.href = `/agencies/${encodeURIComponent(
                          id,
                        )}?${params.toString()}`;
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
