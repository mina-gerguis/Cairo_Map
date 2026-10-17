"use client";

import React, { RefObject, useMemo } from "react";
import styles from "../parking.module.css";

interface ParkingSearchCardProps {
  searchPanelRef?: RefObject<HTMLDivElement | null>;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedArea: string;
  onSelectedAreaChange: (value: string) => void;
  areas: string[];
}

export function ParkingSearchCard({
  searchPanelRef,
  searchTerm,
  onSearchTermChange,
  selectedArea,
  onSelectedAreaChange,
  areas,
}: ParkingSearchCardProps) {
  const filteredAreasList = useMemo(
    () => areas.filter((a) => a !== "all"),
    [areas]
  );

  const hasActiveFilters = Boolean(searchTerm.trim() || selectedArea !== "all");

  const handleResetFilters = () => {
    onSearchTermChange("");
    onSelectedAreaChange("all");
  };

  return (
    <div ref={searchPanelRef} className={styles.searchBentoCard}>
      <div className={styles.searchBentoHeader}>
        <h2 className={styles.searchTitle}>
          <i
            className="bx bx-search-alt"
            style={{ color: "var(--color-secondary, #3b82f6)" }}
          />
          <span>البحث وتصفية الجراجات</span>
        </h2>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className={styles.chipTag}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.25)",
              color: "#ef4444",
              fontSize: "0.75rem",
              padding: "4px 10px",
            }}
          >
            <i className="bx bx-trash" /> مسح التصفية
          </button>
        )}
      </div>

      <div className={styles.inputGroup}>
        {/* Area Selection Dropdown */}
        <div>
          <label className={styles.fieldLabel}>
            <i className="bx bx-map-pin" style={{ color: "var(--color-secondary, #3b82f6)" }} />
            <span>اختر المنطقة أو الحي</span>
          </label>
          <select
            value={selectedArea}
            onChange={(e) => onSelectedAreaChange(e.target.value)}
            className={styles.modernSelect}
          >
            <option value="all">جميع المناطق ({filteredAreasList.length} منطقة)</option>
            {filteredAreasList.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Live Search Input */}
        <div>
          <label className={styles.fieldLabel}>
            <i className="bx bx-search" style={{ color: "var(--color-secondary, #3b82f6)" }} />
            <span>ابحث بالاسم أو الشارع أو محطة المترو</span>
          </label>
          <div className={styles.searchFieldWrapper}>
            <input
              type="text"
              placeholder="مثال: جراج التحرير، روكسي، العتبة، الدقي..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className={styles.searchInput}
            />
            <i className={`bx bx-search ${styles.searchLeadingIcon}`} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchTermChange("")}
                className={styles.clearBtn}
                aria-label="مسح البحث"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Preset Area Chips */}
          {filteredAreasList.length > 0 && (
            <div className={styles.presetChipsWrapper}>
              <span
                style={{
                  fontSize: "0.76rem",
                  color: "var(--text-muted)",
                  fontWeight: "700",
                }}
              >
                مناطق مميزة:
              </span>
              {filteredAreasList.slice(0, 6).map((area) => {
                const isActive = selectedArea === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => onSelectedAreaChange(isActive ? "all" : area)}
                    className={`${styles.chipTag} ${
                      isActive ? styles.chipTagActive : ""
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParkingSearchCard;
