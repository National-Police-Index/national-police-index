'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { useStaticText } from '@/hooks/useStaticText';
import { useOfficersByUid } from '@/hooks/useOfficersByUid';
import { useStateStats } from '@/hooks/useStateStats';
import SearchFilters from '@/components/search/SearchFilters';
import { US_STATES, STATE_DESCRIPTIONS } from '@/constants/states';
import PageHeader from '@/components/PageHeader';
import CursorPagination from '@/components/common/CursorPagination';
import OfficerCard from '@/components/officers/OfficerCard';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import React from 'react';
import parse from 'html-react-parser';

function toTitleCase(str: string) {
  return str.replace(/-+/g, ' ').replace(
    /\w\S*/g,
    (text: string) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}


function parseDescription(text: string | undefined): React.ReactNode {
  if (!text) return null;

  
  if (text.includes('<')) {
    
    return parse(text, {
      replace: (domNode: any) => {
        if (domNode.type === 'tag') {
          if (domNode.name === 'a') {
            
            const props = domNode.attribs || {};
            
            let linkText = props.href;
            if (domNode.children && domNode.children[0] && 'data' in domNode.children[0]) {
              linkText = domNode.children[0].data;
            }

            delete props.class;

            return (
              <a
                {...props}
                className={styles.descriptionLink}
              >
                {linkText}
              </a>
            );
          }
        }
        return domNode;
      }
    });
  }

  
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  
  const parts = text.split(urlRegex);

  
  return (
    <>
      {parts.map((part, i) => {
        
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        }
        
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

  const pageSize = parseInt(resolvedSearchParams.pageSize || '16', 10); 

  const { loading: statsLoading, error: statsError, stats } = useStateStats(state);
  
  const direction = resolvedSearchParams.direction as 'next' | 'prev' | undefined;
  const page = resolvedSearchParams.page || '1';

  
  const [navigationDirection, setNavigationDirection] = useState<'next' | 'prev' | undefined>(direction);

  
  useEffect(() => {
    setNavigationDirection(direction);
  }, [direction]);

  const {
    loading: officersLoading,
    error: officersError,
    officerGroups,
    totalGroups,
    hasNextPage,
    hasPreviousPage,
    currentPage: apiCurrentPage,
    pageSize: apiPageSize
  } = useOfficersByUid({
    state,
    searchParams: {
      ...resolvedSearchParams,
      pageSize: pageSize.toString(),
      direction: navigationDirection || undefined,
      page
    }
  });
  const currentPage = apiCurrentPage;
  
  const [searchLoading, setSearchLoading] = useState(false);
  const loading = statsLoading || officersLoading || searchLoading;

  
  useEffect(() => {
    if (!officersLoading) {
      setSearchLoading(false);
    }
  }, [officersLoading]);
  const error = statsError || officersError;
  const totalPages = totalGroups ? Math.ceil(totalGroups / pageSize) : 0;

  
  

  
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

          <SearchFilters
            state={state}
            agencyMode={false}
            onSearchStarted={() => { setSearchLoading(true); setTimeout(() => setSearchLoading(false), 1000); }}
          />

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
                  {totalGroups > 0 && (
                    <div>
                      <CursorPagination
                        currentPage={apiCurrentPage}
                        totalCount={totalGroups}
                        pageSize={apiPageSize || pageSize}
                        baseUrl={`/states/${state}`}
                        hasPreviousPage={hasPreviousPage}
                        hasNextPage={hasNextPage}
                        onPageSizeChange={(newSize) => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('pageSize', newSize.toString());
                          
                          window.location.href = `/states/${state}?${params.toString()}`;
                        }}
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
