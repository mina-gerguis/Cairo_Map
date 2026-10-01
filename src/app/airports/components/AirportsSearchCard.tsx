import React from "react";
import { AirportCategoryFilter } from "../types";
import { AIRPORT_CATEGORY_FILTERS } from "../constants";
import styles from "../airports.module.css";

interface AirportsSearchCardProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: AirportCategoryFilter;
  onCategoryChange: (category: AirportCategoryFilter) => void;
  categoryCounts?: Record<AirportCategoryFilter, number>;
}

export default function AirportsSearchCard({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryCounts
}: AirportsSearchCardProps) {
  return (
    <div className={styles.searchCard}>
      {/* Search Header */}
      <div className={styles.searchHeader}>
        <div className={styles.searchHeaderIcon}>
          <i className="bx bx-search-alt-2" />
        </div>
        <div>
          <h2 className={styles.searchHeaderTitle}>البحث والفلترة السريعة</h2>
          <p className={styles.searchHeaderDesc}>
            ابحث بالاسم، المدينة، المحافظة، أو الكود الدولي (CAI, SSH, HBE...)
          </p>
        </div>
      </div>

      {/* Input */}
      <div className={styles.searchInputWrapper}>
        <input
          id="airports-search-input"
          type="text"
          placeholder="ابحث عن مطار القاهرة، برج العرب، مطار سفنكس، الغردقة..."
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

      {/* Category Filter Chips */}
      <div className={styles.filterChipsScroll}>
        {AIRPORT_CATEGORY_FILTERS.map(filter => {
          const isSelected = selectedCategory === filter.id;
          const count = categoryCounts ? categoryCounts[filter.id] : undefined;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onCategoryChange(filter.id)}
              className={`${styles.filterChip} ${
                isSelected ? styles.filterChipActive : ""
              }`}
            >
              {filter.icon && <i className={filter.icon} />}
              <span>{filter.label}</span>
              {count !== undefined && (
                <span
                  className={`${styles.filterChipCount} ${
                    isSelected ? styles.filterChipCountActive : ""
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
