import React from "react";
import styles from "../airports.module.css";

interface AirportsSearchCardProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function AirportsSearchCard({
  searchQuery,
  onSearchChange
}: AirportsSearchCardProps) {
  return (
    <div className={styles.searchCard}>
      <label className={styles.searchLabel} htmlFor="airports-search-input">
        <i
          className="bx bx-search"
          style={{ color: "var(--color-secondary)", fontSize: "1.1rem" }}
        />
        <span>ابحث في المطارات المصرية</span>
      </label>

      <div className={styles.searchInputWrapper}>
        <input
          id="airports-search-input"
          type="text"
          placeholder="ابحث باسم المطار أو المدينة أو الكود ..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className={styles.searchInput}
          autoComplete="off"
        />

        <i className={`bx bx-search ${styles.searchIcon}`} />

        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
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
