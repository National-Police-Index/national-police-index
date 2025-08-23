'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Pagination.module.scss';

interface CursorPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageSizeChange?: (newSize: number) => void;
}

export default function CursorPagination({
  currentPage,
  totalCount,
  pageSize,
  baseUrl,
  hasPreviousPage,
  hasNextPage,
  onPageSizeChange
}: CursorPaginationProps) {
  const searchParams = useSearchParams();
  const pageSizeOptions = [16, 100, 200];

  const createPageUrl = (direction: 'next' | 'prev') => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Eliminamos el parámetro page ya que no se puede acceder a una página específica con cursores
    params.set('page', direction === 'next' ? (currentPage + 1).toString() : (currentPage - 1).toString());
    //router.push(`?${params.toString()}`, { scroll: false });
    
    // Establecemos solo la dirección de navegación
    params.set('direction', direction);
    console.log('CREATE PAGE URL', params.toString());
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const Prev: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Previous</span>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={disabled ? .5 : 1}>
        <path d="M7.34313 1.34315L1.68628 7L7.34313 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );

  const Next: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Next</span>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={disabled ? .5 : 1}>
        <path d="M1.65687 1.34315L7.31372 7L1.65687 12.6569" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );

  return (
    <div className={`flex items-center justify-between ${styles.paginationWrapper}`}>
      <div className="">
        Displaying {totalCount > 0 ? (
            <>
            {((currentPage - 1) * pageSize + 1).toLocaleString()}-
            {Math.min(currentPage * pageSize, totalCount).toLocaleString()} of {totalCount.toLocaleString()}
            </>
        ) : (
          '0 items'
        )}
      </div>

      <nav className={`flex items-center justify-center ${styles.pagination}`}>
        <ul className="flex items-center">
          {/* Previous page */}
          <li className={`${!hasPreviousPage ? 'cursor-not-allowed' : ''} ${styles.arrow}`}>
            {hasPreviousPage ?
              (<Link
                href={!hasPreviousPage ? '#' : createPageUrl('prev')}
                className={`block ${!hasPreviousPage
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-100 hover:text-gray-700'
                  }`}
                aria-disabled={!hasPreviousPage}
              >
                <Prev disabled={false} />
              </Link>) :
              (
                <Prev disabled={true} />
              )}
          </li>

          {/* Current page indicator */}
          <li className="">
            Page {currentPage} of {totalPages.toLocaleString() || 1}
          </li>

          {/* Next page */}
          <li className={`${!hasNextPage ? 'cursor-not-allowed' : ''} ${styles.arrow}`}>
            {hasNextPage ?
              (<Link
                href={!hasNextPage ? '#' : createPageUrl('next')}
                className={`${!hasNextPage
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-100 hover:text-gray-700 text-slate-500'
                  }`}
                aria-disabled={!hasNextPage}
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

      <div className="flex items-center space-x-2">
        <label htmlFor="page-size" className="">
          Show:
        </label>
        <select
          id="page-size"
          className={styles.pageSizeSelect}
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
