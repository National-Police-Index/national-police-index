"use client";

import { useSearchParams } from "next/navigation";
import styles from "./Pagination.module.scss";
import Link from "next/link";

interface CursorPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isCapped?: boolean;
  currentPageCount?: number;
  onPageSizeChange?: (newSize: number) => void;
}

export default function CursorPagination({
  currentPage,
  totalCount,
  pageSize,
  baseUrl,
  hasPreviousPage,
  hasNextPage,
  isCapped = false,
  currentPageCount,
  onPageSizeChange,
}: CursorPaginationProps) {
  const searchParams = useSearchParams();
  const pageSizeOptions = [16, 100, 200];

  const createPageUrl = (direction: "next" | "prev") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(
      "page",
      direction === "next"
        ? (currentPage + 1).toString()
        : (currentPage - 1).toString()
    );

    params.set("direction", direction);

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
      <svg
        width="9"
        height="14"
        viewBox="0 0 9 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        opacity={disabled ? 0.5 : 1}
      >
        <path
          d="M7.34313 1.34315L1.68628 7L7.34313 12.6569"
          stroke="#4F8C7E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  const Next: React.FC<{ disabled: boolean }> = ({ disabled }) => (
    <>
      <span className="sr-only">Next</span>
      <svg
        width="9"
        height="14"
        viewBox="0 0 9 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        opacity={disabled ? 0.5 : 1}
      >
        <path
          d="M1.65687 1.34315L7.31372 7L1.65687 12.6569"
          stroke="#4F8C7E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  return (
    <div
      className={`flex items-center justify-between ${styles.paginationWrapper}`}
    >
      <div className="">
        Displaying{" "}
        {((currentPage - 1) * pageSize + 1).toLocaleString()}-
        {(currentPageCount != null
          ? (currentPage - 1) * pageSize + currentPageCount
          :
            isCapped || totalCount <= 0
            ? currentPage * pageSize
            : Math.min(currentPage * pageSize, totalCount)
        ).toLocaleString()}
        {totalCount > 0 && (
          <>
            {" "}
            of {totalCount.toLocaleString()}
            {isCapped ? "+" : ""}
          </>
        )}
      </div>

      <nav className={`flex items-center justify-center ${styles.pagination}`}>
        <ul className="flex items-center">
          {/* Previous page */}
          <li
            className={`${!hasPreviousPage ? "cursor-not-allowed" : ""} ${
              styles.arrow
            }`}
          >
            {hasPreviousPage ? (
              <a
                href={!hasPreviousPage ? "#" : createPageUrl("prev")}
                className={`block ${
                  !hasPreviousPage
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100 hover:text-gray-700"
                }`}
                aria-disabled={!hasPreviousPage}
              >
                <Prev disabled={false} />
              </a>
            ) : (
              <Prev disabled={true} />
            )}
          </li>

          {/* Current page indicator */}
          <li className="">
            {isCapped || totalCount <= 0
              ? `Page ${currentPage.toLocaleString()}`
              : `Page ${currentPage} of ${totalPages.toLocaleString() || 1}`}
          </li>

          {/* Next page */}
          <li
            className={`${!hasNextPage ? "cursor-not-allowed" : ""} ${
              styles.arrow
            }`}
          >
            {hasNextPage ? (
              <Link
                href={!hasNextPage ? "#" : createPageUrl("next")}
                className={`${
                  !hasNextPage
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100 hover:text-gray-700 text-slate-500"
                }`}
                aria-disabled={!hasNextPage}
              >
                <Next disabled={false} />
              </Link>
            ) : (
              <Next disabled={true} />
            )}
          </li>
        </ul>
      </nav>

      <div>
        {
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="">
              Show:
            </label>
            <select
              id="page-size"
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        }
      </div>
    </div>
  );
}
