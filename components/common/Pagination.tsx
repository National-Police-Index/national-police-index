'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import styles from './Pagination.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const getPages = (): (number | null)[] => {
    const pageNeighbours = 1; // For a middle size of 3 (current + 1 on each side)
    const totalNumbers = 5; // first + last + middle (3)
    const totalBlocks = totalNumbers + 2; // totalNumbers + 2 ellipsis placeholders

    // Case 1: Total pages is less than the number of pages we want to show (e.g., 7)
    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = 1;
    const endPage = totalPages;

    const leftSiblingIndex = Math.max(currentPage - pageNeighbours, startPage);
    const rightSiblingIndex = Math.min(currentPage + pageNeighbours, endPage);

    /*
      We do not want to show dots if there is only one position left
      after/before the left/right page count as that would lead to a change if our Pagination
      component size which we do not want
    */
    const shouldShowLeftEllipsis = leftSiblingIndex > startPage + 1;
    const shouldShowRightEllipsis = rightSiblingIndex < endPage - 1;

    const firstPageIndex = startPage;
    const lastPageIndex = endPage;

    // Case 2: No left ellipsis to show, but rights ellipsis needed
    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * pageNeighbours; // 3 fixed pages + 2 neighbours
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, null, lastPageIndex];
    }

    // Case 3: No right ellipsis to show, but left ellipsis needed
    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * pageNeighbours;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, null, ...rightRange];
    }

    // Case 4: Both left and right ellipsis needed
    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, null, ...middleRange, null, lastPageIndex];
    }

    // Fallback: Should not happen with the logic above but added for safety
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const pages = getPages();

  const Prev: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Previous</span>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={disabled ? .5 : 1}>
        <path d="M7.34313 1.34315L1.68628 7L7.34313 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );

  const Next: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Next</span>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={disabled ? .5 : 1}>
        <path d="M1.65687 1.34315L7.31372 7L1.65687 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );

  const First: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">First</span>
      <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={disabled ? .5 : 1}>
        <path d="M6.71569 1.34315L1.05884 7L6.71569 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.0294 1.34315L12.3726 7L18.0294 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );

  const Last: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Last</span>
      <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={disabled ? .5 : 1}>
        <path d="M5.97059 1.34315L11.6274 7L5.97059 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.2843 1.34315L22.9412 7L17.2843 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );

  const Ellipsis: React.FC = () => (
    <>
      <span className="sr-only">Ellipsis</span>
      <svg width="16" height="5" viewBox="0 0 16 5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.52202 4.18537C2.06179 4.18537 1.66761 4.02344 1.33949 3.69957C1.01563 3.37571 0.855824 2.98366 0.860085 2.52344C0.855824 2.07173 1.01563 1.68608 1.33949 1.36648C1.66761 1.04261 2.06179 0.880682 2.52202 0.880682C2.95668 0.880682 3.3402 1.04261 3.67259 1.36648C4.00923 1.68608 4.17969 2.07173 4.18395 2.52344C4.17969 2.83026 4.09872 3.10937 3.94105 3.3608C3.78764 3.61222 3.58523 3.8125 3.33381 3.96165C3.08665 4.1108 2.81605 4.18537 2.52202 4.18537ZM8.00639 4.18537C7.54616 4.18537 7.15199 4.02344 6.82386 3.69957C6.5 3.37571 6.3402 2.98366 6.34446 2.52344C6.3402 2.07173 6.5 1.68608 6.82386 1.36648C7.15199 1.04261 7.54616 0.880682 8.00639 0.880682C8.44105 0.880682 8.82457 1.04261 9.15696 1.36648C9.49361 1.68608 9.66406 2.07173 9.66832 2.52344C9.66406 2.83026 9.5831 3.10937 9.42543 3.3608C9.27202 3.61222 9.0696 3.8125 8.81818 3.96165C8.57102 4.1108 8.30043 4.18537 8.00639 4.18537ZM13.4908 4.18537C13.0305 4.18537 12.6364 4.02344 12.3082 3.69957C11.9844 3.37571 11.8246 2.98366 11.8288 2.52344C11.8246 2.07173 11.9844 1.68608 12.3082 1.36648C12.6364 1.04261 13.0305 0.880682 13.4908 0.880682C13.9254 0.880682 14.3089 1.04261 14.6413 1.36648C14.978 1.68608 15.1484 2.07173 15.1527 2.52344C15.1484 2.83026 15.0675 3.10937 14.9098 3.3608C14.7564 3.61222 14.554 3.8125 14.3026 3.96165C14.0554 4.1108 13.7848 4.18537 13.4908 4.18537Z" fill="#4F8C7E"/>
      </svg>
    </>
  );

  const isFirstPage = currentPage === 1;
  const isNotFirstPage = currentPage !== 1;
  const isLastPage = currentPage === totalPages;
  const isNotLastPage = currentPage !== totalPages;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav className={`flex items-center justify-center ${styles.pagination}`}>
      <ul className="flex items-center">
        {/* First page */}
        <li className={`${isFirstPage ? 'cursor-not-allowed' : ''} ${styles.arrow}`}>
          {isNotFirstPage ? 
            (<Link
              href={isFirstPage ? '#' : createPageUrl(1)}
              className={`block text-emerald-900 ${isFirstPage
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700'
                }`}
              aria-disabled={isFirstPage}
            >
              <First disabled={false} />
            </Link>) :
            (
              <First disabled={true} />
            )}
        </li>

        {/* Previous page */}
        <li className={`${isFirstPage ? 'cursor-not-allowed' : ''} ${styles.arrow}`}>
          {isNotFirstPage ? 
            (<Link
              href={isFirstPage ? '#' : createPageUrl(prevPage)}
              className={`block text-emerald-900 ${isFirstPage
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700'
                }`}
              aria-disabled={isFirstPage}
            >
              <Prev disabled={false} />
            </Link>) :
            (
              <Prev disabled={true} />
            )}
        </li>

        {/* Page numbers & Ellipsis */}
        {pages.map((page, index) => {
          if (page === null) {
            return (
              <li key={`ellipsis-${index}`} className={styles.ellipsis}>
                <Ellipsis />
              </li>
            );
          }

          if (page !== currentPage) {
            return (
              <li key={page}>
                <Link
                  href={createPageUrl(page)}
                  className={`leading-tight ${currentPage === page
                    ? 'z-10 font-normal font-["Inter"] underline' // Should not happen with this logic, but kept for safety
                    : 'text-[#122823] font-normal font-["Inter"] leading-relaxed hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {page}
                </Link>
              </li>
            )
          } else {
            return (
              <li key={page}>
                <span className='underline font-normal font-["Inter"] leading-relaxed'>{page}</span> {/* Added styles for consistency */}
              </li>
            )
          }
        })}

        {/* Next page */}
        <li className={`${isLastPage ? 'cursor-not-allowed' : ''} ${styles.arrow}`}>
          {isNotLastPage ? 
            (<Link
              href={isLastPage ? '#' : createPageUrl(nextPage)}
              className={`${isLastPage
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700 text-slate-500'
                }`}
              aria-disabled={isLastPage}
            >
              <Next disabled={false} />
            </Link>) :
            (
              <Next disabled={true} />
            )
          }
        </li>

        {/* Last page */}
        <li className={`${isLastPage ? 'cursor-not-allowed' : ''} ${styles.arrow}`}>
          {isNotLastPage ?
            (<Link
              href={isLastPage ? '#' : createPageUrl(totalPages)}
              className={`block text-emerald-900 ${isLastPage
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700'
                }`}
              aria-disabled={isLastPage}
            >
              <Last disabled={false} />
            </Link>) :
            (
              <Last disabled={true} />
            )}
        </li>
      </ul>
    </nav>
  );
}
