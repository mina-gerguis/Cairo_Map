"use client";

import React from "react";
import styles from "../reports.module.css";
import { CategoryFilterType, StatusFilterType, IncomingReportsStats } from "../types";
import { CATEGORY_TABS, STATUS_FILTER_OPTIONS } from "../constants";

interface IncomingReportsFiltersProps {
  stats: IncomingReportsStats;
  categoryFilter: CategoryFilterType;
  setCategoryFilter: (cat: CategoryFilterType) => void;
  statusFilter: StatusFilterType;
  setStatusFilter: (st: StatusFilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function IncomingReportsFilters({
  stats,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
}: IncomingReportsFiltersProps) {
  const getCategoryCount = (id: CategoryFilterType): number => {
    switch (id) {
      case "all":
        return stats.total;
      case "places":
        return stats.placesCount;
      case "contacts":
        return stats.contactsCount;
      case "microbus":
        return stats.microbusCount;
      case "bus_stations":
        return stats.busStationsCount;
      case "brt":
        return stats.brtCount;
      case "metro":
        return stats.metroCount;
      case "monorail":
        return stats.monorailCount;
      case "lrt":
        return stats.lrtCount;
      case "railways":
        return stats.railwayCount;
      case "airports":
        return stats.airportsCount;
      case "ports":
        return stats.portsCount;
      case "parking":
        return stats.parkingCount;
      case "directory":
        return stats.directoryCount;
      case "bugs":
        return stats.bugsCount;
      case "suggestions":
        return stats.suggestionsCount;
      case "routes":
        return stats.routesCount;
      default:
        return 0;
    }
  };

  return (
    <div className={styles.filterContainer}>
      {/* Category / Type Tabs */}
      <div className={styles.categoryTabsRow}>
        {CATEGORY_TABS.map((tab) => {
          const count = getCategoryCount(tab.id);
          const isSelected = categoryFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`${styles.categoryPill} ${isSelected ? styles.categoryPillActive : ""}`}
            >
              <span>{tab.label}</span>
              <span className={styles.categoryPillBadge}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Controls Row */}
      <div className={styles.searchAndStatusRow}>
        <div className={styles.searchInputWrapper}>
          <i className={`bx bx-search ${styles.searchIcon}`}></i>
          <input
            type="text"
            placeholder="ابحث بالاسم، رقم الهاتف، الإيميل، اسم المكان، أو محتوى البلاغ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusFilterGroup}>
          {STATUS_FILTER_OPTIONS.map((st) => {
            const isSelected = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`${styles.statusPill} ${isSelected ? styles.statusPillActive : ""}`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

