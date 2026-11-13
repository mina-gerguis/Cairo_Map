"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./save-location.module.css";
import ClearSearch from "./clearSearch";

interface SearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalLocations?: number;
  filteredLocationsCount?: number;
  locationsCount?: number;
  resultsCount?: number;
  placeholder?: string;
}

export function SearchBoxBase({
  searchQuery,
  setSearchQuery,
  totalLocations,
  filteredLocationsCount,
  locationsCount,
  resultsCount,
  placeholder = "ابحث في أماكنك المحفوظة (بالاسم، العنوان، الملاحظات)...",
}: SearchBoxProps) {
  const total = totalLocations ?? locationsCount ?? 0;
  const count = filteredLocationsCount ?? resultsCount ?? 0;

  return (
    <div className="search-box">
      <FaSearch className="search-box-icon" />
      <input
        type="text"
        className={`search-input ${total > 0 ? (searchQuery ? styles.searchInputWithClear : styles.searchInputCustom) : ""}`}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className={styles.searchEndAdornment}>
        {total > 0 && (
          <span className={styles.searchResultsCount}>
            <span className="font-inter">{count}</span>{" "}
            {count === 1
              ? "نتيجة"
              : count >= 3 && count <= 10
                ? "نتائج"
                : "نتيجة"}
          </span>
        )}
        {searchQuery && (
          <ClearSearch onClear={() => setSearchQuery("")} />
        )}
      </div>
    </div>
  );
}


export default function SearchBox({
  searchQuery,
  setSearchQuery,
  totalLocations,
  filteredLocationsCount,
  locationsCount,
  resultsCount,
  placeholder = "ابحث في أماكنك المحفوظة (بالاسم، العنوان، الملاحظات)...",
}: SearchBoxProps) {
  const total = totalLocations ?? locationsCount ?? 0;
  const count = filteredLocationsCount ?? resultsCount ?? 0;

  return (
    <div className="search-box">
      <FaSearch className="search-box-icon" />
      <input
        type="text"
        className={`search-input ${total > 0 ? (searchQuery ? styles.searchInputWithClear : styles.searchInputCustom) : ""}`}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className={styles.searchEndAdornment}>
        {total > 0 && (
          <span className={styles.searchResultsCount}>
            <span className="font-inter">{count}</span>{" "}
            {count === 1
              ? "نتيجة"
              : count >= 3 && count <= 10
                ? "نتائج"
                : "نتيجة"}
          </span>
        )}
        {searchQuery && (
          <ClearSearch onClear={() => setSearchQuery("")} />
        )}
      </div>
    </div>
  );
}