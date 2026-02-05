import React from "react";
import { Button } from "@app/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  activeColor?: string; // Optional: custom color for active page
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  activeColor = "bg-[#00563B]",
}: PaginationProps) => {
  // Helper to generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const siblingCount = 2; // Number of pages to show on each side of current page
    // Total numbers to show: 1 (first) + 1 (last) + current + 2*siblingCount + 2 (ellipses)
    // effectively we want to be smart.

    // If total pages is small, show all
    // Threshold: 1 + 1 + 2*siblingCount + 2 ellipses + 1 current = 5 + 2 + 2 = 9?
    // Let's just say if totalPages <= 7 show all.
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first
    pages.push(1);

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - 1,
    );

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      // Near start
      // Show 1, 2, 3, 4, 5, ..., total
      let leftItemCount = 3 + 2 * siblingCount; // 7 items total?
      // Let's just force 1, 2, 3, 4, 5, 6
      for (let i = 2; i <= 6; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      // Near end
      // Show 1, ..., total-5, total-4, total-3, total-2, total-1, total
      pages.push("...");
      for (let i = totalPages - 5; i < totalPages; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    } else if (showLeftEllipsis && showRightEllipsis) {
      // Middle
      pages.push("...");
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else {
      // Fallback (rare/impossible with current logic but good safe)
      for (let i = 2; i < totalPages; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 w-9 p-0"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </div>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <Button
            key={page}
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={`h-9 min-w-[36px] px-3 ${
              isCurrent
                ? `${activeColor} text-white hover:${activeColor}/90 hover:text-white border-transparent`
                : "text-gray-700"
            }`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 w-9 p-0"
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
