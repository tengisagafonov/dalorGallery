"use client";

import { Icon } from "./gallery-icon";

type Props = {
  currentPage: number;
  nextLabel: string;
  onPageChange: (page: number) => void;
  previousLabel: string;
  totalPages: number;
};

export function GalleryPagination({
  currentPage,
  nextLabel,
  onPageChange,
  previousLabel,
  totalPages,
}: Props) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-9 flex items-center justify-center gap-2" aria-label="Template pages">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex size-10 items-center justify-center rounded-full border border-line bg-elevated transition hover:border-line-hover disabled:cursor-not-allowed disabled:opacity-35"
        aria-label={previousLabel}
      >
        <Icon name="arrow" className="size-4 rotate-180" />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`size-10 rounded-full text-sm font-semibold transition ${
            page === currentPage
              ? "bg-accent text-on-accent shadow-md"
              : "border border-line bg-elevated text-ink-muted hover:border-line-hover"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex size-10 items-center justify-center rounded-full border border-line bg-elevated transition hover:border-line-hover disabled:cursor-not-allowed disabled:opacity-35"
        aria-label={nextLabel}
      >
        <Icon name="arrow" className="size-4" />
      </button>
    </nav>
  );
}
