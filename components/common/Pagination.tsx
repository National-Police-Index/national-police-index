'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

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

  return (

    <nav className="flex items-center justify-center">
      <ul className="flex items-center -space-x-px">
        {/* Previous page */}
        <li>

          <Link
            href={currentPage === 1 ? '#' : createPageUrl(currentPage - 1)}
            className={`block px-3 py-2 ml-0 text-emerald-900 text-lg ${currentPage === 1
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-100 hover:text-gray-700'
              }`}
            aria-disabled={currentPage === 1}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
        </li>

        {/* Page numbers */}
        {pages.map((page) => (
          <li key={page}>
            <Link
              href={createPageUrl(page)}
              className={`px-3 py-2 leading-tight ${currentPage === page
                ? 'z-10 text-emerald-900 text-lg font-normal font-["Inter"] underline leading-relaxed'
                : 'text-emerald-950 text-lg font-normal font-["Inter"] leading-relaxed hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              {page}
            </Link>
          </li>
        ))}

        {/* Next page */}
        <li>
          <Link
            href={currentPage === totalPages ? '#' : createPageUrl(currentPage + 1)}
            className={`block px-3 py-2 leading-tight text-gray-500 ${currentPage === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-100 hover:text-gray-700 text-slate-500'
              }`}
            aria-disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
