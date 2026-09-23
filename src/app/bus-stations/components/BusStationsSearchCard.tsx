import React from "react";
import styles from "../bus-stations.module.css";

interface BusStationsSearchCardProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function BusStationsSearchCard({
  searchQuery,
  onSearchChange
}: BusStationsSearchCardProps) {
  return (
    <div className={styles.searchCard}>
      <label htmlFor="bus-station-search" className={styles.searchLabel}>
        🔍 ابحث عن موقف أو وجهة سفر
      </label>

      <div className={styles.searchInputWrapper}>
        <input
          id="bus-station-search"
          type="text"
          placeholder="ابحث باسم الموقف، أو المحافظة، أو الوجهة..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
          autoComplete="off"
        />

        <i className={`bx bx-search ${styles.searchIcon}`} aria-hidden="true" />

        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onSearchChange("")}
            aria-label="مسح البحث"
          >
            <i className="bx bx-x" />
          </button>
        )}
      </div>
    </div>
  );
}
