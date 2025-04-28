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

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  const Prev: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Previous</span>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity={disabled ? .5 : 1} d="M7.34313 1.34315L1.68628 7L7.34313 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );

  const Next: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Next</span>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity={disabled ? .5 : 1} d="M1.65687 1.34315L7.31372 7L1.65687 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );

  return (

    <nav className={`flex items-center justify-center ${styles.pagination}`}>
      <ul className="flex items-center">
        {/* Previous page */}
        <li className={currentPage === 1 ? 'cursor-not-allowed' : ''}>
          {currentPage !== 1 ? 
            (<Link
              href={currentPage === 1 ? '#' : createPageUrl(currentPage - 1)}
              className={`block text-emerald-900 text-lg ${currentPage === 1
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700'
                }`}
              aria-disabled={currentPage === 1}
            >
              <Prev disabled={false} />
            </Link>) :
            (
              <Prev disabled={true} />
            )}
        </li>

        {/* Page numbers */}
        {pages.map((page) => {
          if (page !== currentPage) {
            return (
              <li key={page}>
                <Link
                  href={createPageUrl(page)}
                  className={`leading-tight ${currentPage === page
                    ? 'z-10 text-lg font-normal font-["Inter"] underline'
                    : 'text-[#122823] text-lg font-normal font-["Inter"] leading-relaxed hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {page}
                </Link>
              </li>
            )
          } else {
            return (
              <li key={page}>
                <span className='underline'>{page}</span>
              </li>
            )
          }
        })}

        {/* Next page */}
        <li className={currentPage !== totalPages ? 'cursor-not-allowed' : ''}>
          {currentPage !== totalPages ? 
            (<Link
              href={currentPage === totalPages ? '#' : createPageUrl(currentPage + 1)}
              className={`${currentPage === totalPages
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700 text-slate-500'
                }`}
              aria-disabled={currentPage === totalPages}
            >
              <Next disabled={false} />
            </Link>) :
            (
              <Next disabled={true} />
            )
          }
        </li>
      </ul>
    </nav>
  );
}
