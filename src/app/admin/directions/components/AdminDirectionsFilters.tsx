import React from "react";
import styles from "../directions.module.css";

interface AdminDirectionsFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: string;
  onFilterTypeChange: (val: string) => void;
}

export function AdminDirectionsFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange
}: AdminDirectionsFiltersProps) {
  return (
    <div className={styles.filterCard}>
      <div className={styles.searchWrapper}>
        <i className={`bx bx-search ${styles.searchIcon}`} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="ابحث بالنقطة، الوجهة، أو الكلمات البديلة..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className={styles.filterSelect}
        value={filterType}
        onChange={(e) => onFilterTypeChange(e.target.value)}
      >
        <option value="all">كل وسائل المواصلات</option>
        <option value="microbus">ميكروباص</option>
        <option value="bus">أتوبيس</option>
        <option value="brt">الأتوبيس الترددي (BRT)</option>
        <option value="metro">مترو</option>
        <option value="lrt">القطار الكهربائي (LRT)</option>
        <option value="train">قطار</option>
        <option value="monorail">مونوريل</option>
        <option value="multi">مواصلات متعددة</option>
        <option value="car">عربية خاص</option>
      </select>
    </div>
  );
}
