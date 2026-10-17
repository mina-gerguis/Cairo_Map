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
      <div className={styles.searchHeader}>
        <label htmlFor="bus-station-search" className={styles.searchLabel}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: "#f59e0b" }} />
          <span>ابحث عن موقف أو وجهة سفر أو شركة</span>
        </label>
      </div>

      <div className={styles.searchInputWrapper}>
        <input
          id="bus-station-search"
          type="text"
          placeholder="ابحث باسم الموقف (الترجمان، ألماظة)، أو المحافظة، أو الوجهة (الإسكندرية، شرم الشيخ)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
          autoComplete="off"
        />

        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onSearchChange("")}
            aria-label="مسح البحث"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
