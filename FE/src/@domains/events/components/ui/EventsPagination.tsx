// react
import { useMemo } from "react";

// third-party
import { ChevronLeft, ChevronRight } from "lucide-react";

// @shared
import { cn } from "@shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";

type EventsPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange: (value: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
};

/**
 * generatePageNumbers - Utility function
 * @returns void
 */
const generatePageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
/**
 * pages - Utility function
 * @returns void
 */
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage <= 4) {
      for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push("ellipsis");
      for (let i = totalPages - 3; i < totalPages; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    } else {
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return pages;
};

export const EventsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
/**
 * EventsPagination - React component
 * @returns React element
 */
  onItemsPerPageChange,
  itemsPerPageOptions = [12, 24, 48],
  className,
}: EventsPaginationProps) => {
  const pages = useMemo(
    () => generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
/**
 * pages - Utility function
 * @returns void
 */
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 font-inter sm:flex-row sm:justify-between",
        className
      )}
/**
 * canGoPrevious - Utility function
 * @returns void
 */
    >
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-[14px] font-medium text-slate-600">
/**
 * canGoNext - Utility function
 * @returns void
 */
          Items per page
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
/**
 * startItem - Utility function
 * @returns void
 */
        >
          <SelectTrigger
            aria-label="Items per page"
            className="h-10 w-[70px] cursor-pointer rounded-lg border border-slate-200 bg-white px-3 font-inter text-[14px] font-semibold text-slate-700 shadow-none transition-colors hover:bg-slate-50 focus:!border focus:!border-slate-300 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 data-[state=open]:border-slate-300 data-[state=open]:bg-slate-50"
/**
 * endItem - Utility function
 * @returns void
 */
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[70px] rounded-xl border-slate-200 bg-white font-inter text-slate-900 shadow-lg">
            {itemsPerPageOptions.map((option) => (
              <SelectItem
                key={option}
                value={option.toString()}
                className="text-[13px] font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination info and controls */}
      <div className="flex items-center gap-4">
        {/* Info */}
        <div className="text-[14px] font-medium text-slate-600">
          {startItem}-{endItem} of {totalItems}
        </div>

        {/* Page controls */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            type="button"
            onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            aria-label="Previous page"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors",
              canGoPrevious
                ? "cursor-pointer hover:bg-slate-50 hover:text-slate-900"
                : "cursor-not-allowed opacity-40"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Page numbers */}
          {pages.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="flex h-10 w-10 items-center justify-center text-slate-400"
                >
                  ...
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-2 text-[14px] font-semibold transition-colors",
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                )}
              >
                {page}
              </button>
            );
          })}

          {/* Next button */}
          <button
            type="button"
/**
 * isActive - Utility function
 * @returns void
 */
            onClick={() => canGoNext && onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors",
              canGoNext
                ? "cursor-pointer hover:bg-slate-50 hover:text-slate-900"
                : "cursor-not-allowed opacity-40"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
