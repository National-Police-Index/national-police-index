'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { useStaticText } from '@/hooks/useStaticText';
import { useOfficersByUid } from '@/hooks/useOfficersByUid';
import { useStateStats } from '@/hooks/useStateStats';
import SearchFilters from '@/components/search/SearchFilters';
import { US_STATES, STATE_DESCRIPTIONS } from '@/constants/states';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/common/Pagination';
import OfficerCard from '@/components/officers/OfficerCard';
import styles from './styles.module.scss';
import { useEffect } from 'react';
import React from 'react';
import parse from 'html-react-parser';

function toTitleCase(str: string) {
  return str.replace(/-+/g, ' ').replace(
    /\w\S*/g,
    (text: string) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

// Function to render state descriptions with HTML content and make URLs clickable
function parseDescription(text: string | undefined): React.ReactNode {
  if (!text) return null;

  // Check if the description contains HTML tags
  if (text.includes('<')) {
    // Use the html-react-parser library to render HTML content
    return parse(text, {
      replace: (domNode: any) => {
        if (domNode.type === 'tag') {
          if (domNode.name === 'a') {
            // Apply consistent styling to all anchor tags
            const props = domNode.attribs || {};
            // Extract link text safely
            let linkText = props.href;
            if (domNode.children && domNode.children[0] && 'data' in domNode.children[0]) {
              linkText = domNode.children[0].data;
            }

            return (
              <a
                {...props}
                className="text-emerald-700 hover:underline"
              >
                {linkText}
              </a>
            );
          }
          // Allow all other HTML tags to be rendered normally
        }
        return domNode;
      }
    });
  }

  // For plain text descriptions with URLs, use the previous implementation
  // Regular expression to find URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text by URLs
  const parts = text.split(urlRegex);

  // Map through parts and convert URLs to anchor tags
  return (
    <>
      {parts.map((part, i) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              {part}
            </a>
          );
        }
        // Return regular text
        return part;
      })}
    </>
  );
}

export default function StatePageClient() {
  const params = useParams();
  const state = params.state as string;
  const { getText } = useStaticText('state');
  const searchParams = useSearchParams();
  const resolvedSearchParams = Object.fromEntries(searchParams);
  const stateData = US_STATES.find(
    s => s.reference.toLowerCase() === state.toLowerCase()
  );

  if (!stateData?.hasData) {
    notFound();
  }

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 16; // Fixed page size

  const { loading: statsLoading, error: statsError, stats } = useStateStats(state);
  console.log('STATS', stats);
  const { loading: officersLoading, error: officersError, officerGroups, totalGroups } = useOfficersByUid({
    state,
    searchParams: {
      ...resolvedSearchParams,
      pageSize: pageSize.toString(),
      page: currentPage.toString()
    }
  });

  const loading = statsLoading || officersLoading;
  const error = statsError || officersError;
  const totalPages = totalGroups ? Math.ceil(totalGroups / pageSize) : 0;

  useEffect(() => {
    if (!loading && currentPage > totalPages && totalPages > 0) {
      window.location.href = `/states/${state}?page=${totalPages}`;
    }
  }, [loading, currentPage, totalPages, state]);

  // Log a warning if we don't have the expected number of officers
  if (!loading && !error && officerGroups.length < pageSize && currentPage < totalPages) {
    console.warn('Warning: Expected', pageSize, 'officers but only got', officerGroups.length);
  }

  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={getText('officers-title', '{state}').replace('{state}', toTitleCase(stateData.name))}
        description={parseDescription(STATE_DESCRIPTIONS[state as keyof typeof STATE_DESCRIPTIONS]) || `Search and explore police officer records in ${stateData.name}`}
        statistics={stats?.stats.filter(stat => stat.value !== '0').map(stat => ({
          value: parseInt(stat.value),
          label: stat.label,
          literal: stat.literal
        }))}
      />

      <div className={`relative w-full bg-white rounded-tl-3xl rounded-tr-3xl z-1 ${styles.pageContentWrapper}`}>
        <div className="container-a mx-auto">

          <SearchFilters state={state} />

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
                    <OfficerCard key={group.person_nbr} officer={group.records[0]} />
                  ))}
                </div>
                <div className={styles.paginationWrapper}>
                  {totalPages > 0 && (
                    <div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        baseUrl={`/states/${state}`}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
