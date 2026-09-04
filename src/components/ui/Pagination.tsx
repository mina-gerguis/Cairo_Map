"use client";

import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with Ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={`pagination-container ${className}`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        marginTop: "16px",
        width: "100%",
        direction: "rtl",
      }}
    >
      {/* Previous Button (Right Chevron in RTL) */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-btn"
        aria-label="الصفحة السابقة"
        title="الصفحة السابقة"
      >
        <i className="bx bx-chevron-right" style={{ fontSize: "1.2rem" }}></i>
      </button>

      {/* Page Links */}
      {pages.map((p, idx) => {
        if (p === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="pagination-ellipsis"
              style={{
                color: "var(--text-muted)",
                padding: "0 6px",
                fontSize: "1rem",
                userSelect: "none",
              }}
            >
              •••
            </span>
          );
        }

        const isActive = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`pagination-btn ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button (Left Chevron in RTL) */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-btn"
        aria-label="الصفحة التالية"
        title="الصفحة التالية"
      >
        <i className="bx bx-chevron-left" style={{ fontSize: "1.2rem" }}></i>
      </button>
    </nav>
  );
}
