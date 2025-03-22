'use client';

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
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
            href={currentPage === 1 ? '#' : `${baseUrl}?page=${currentPage - 1}`}
            className={`block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg ${
              currentPage === 1
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
              href={`${baseUrl}?page=${page}`}
              className={`px-3 py-2 leading-tight border ${
                currentPage === page
                  ? 'z-10 text-blue-600 border-blue-300 bg-blue-50'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {page}
            </Link>
          </li>
        ))}

        {/* Next page */}
        <li>
          <Link
            href={currentPage === totalPages ? '#' : `${baseUrl}?page=${currentPage + 1}`}
            className={`block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg ${
              currentPage === totalPages
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 hover:text-gray-700'
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
