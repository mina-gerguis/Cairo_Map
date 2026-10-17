"use client";

import React from "react";
import styles from "../roads-info.module.css";
import { ROAD_TYPE_OPTIONS } from "../constants";
import { RoadTypeFilter } from "../types";

interface RoadsSearchCardProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: RoadTypeFilter;
  onTypeChange: (type: RoadTypeFilter) => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  allGovernorates: string[];
}

export function RoadsSearchCard({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedGovernorate,
  onGovernorateChange,
  allGovernorates,
}: RoadsSearchCardProps) {
  return (
    <div className={styles.searchCard}>
      <div className={styles.searchInputsRow}>
        <div className={styles.searchInputWrapper}>
          <i className={`bx bx-search ${styles.searchIcon}`} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ابحث باسم الطريق، كود الطريق، نقطة البداية أو النهاية (مثلاً: طريق السويس، الضبعة، الدائري)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                left: "14px",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
              title="مسح البحث"
            >
              <i className="bx bx-x" />
            </button>
          )}
        </div>

        <select
          className={styles.filterSelect}
          value={selectedGovernorate}
          onChange={(e) => onGovernorateChange(e.target.value)}
        >
          <option value="all">كل المحافظات والنطاقات</option>
          {allGovernorates.map((gov) => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>
      </div>

      {/* Road Types Filter Chips */}
      <div className={styles.filterChipsRow}>
        {ROAD_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.filterChip} ${
              selectedType === opt.id ? styles.filterChipActive : ""
            }`}
            onClick={() => onTypeChange(opt.id as RoadTypeFilter)}
          >
            <i className={opt.icon} />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
