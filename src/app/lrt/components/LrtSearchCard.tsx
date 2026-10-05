import React from "react";
import { LrtSearchCardProps } from "../types";
import styles from "../lrt.module.css";

export default function LrtSearchCard({
  panelRef,
  searchContainerRef,
  searchQuery,
  onSearchQueryChange,
  isDropdownOpen,
  setIsDropdownOpen,
  searchResults,
  onSelectStation,
}: LrtSearchCardProps) {
  return (
    <div
      ref={(node) => {
        if (panelRef && "current" in panelRef) {
          (panelRef as any).current = node;
        }
        if (searchContainerRef && "current" in searchContainerRef) {
          (searchContainerRef as any).current = node;
        }
      }}
      className={styles.searchBentoCard}
    >
      <div className={styles.searchHeader}>
        <h3 className={styles.searchTitle}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ color: "#06b6d4" }}
          />
          ابحث في محطات القطار الكهربائي LRT
        </h3>
        {searchQuery.trim().length > 0 && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {searchResults.length} نتيجة
          </span>
        )}
      </div>

      <div className={styles.searchInputWrapper}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="اكتب اسم المحطة (مثل: عدلي منصور، الفنون والثقافة، بدر...)"
          value={searchQuery}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            onSearchQueryChange(e.target.value);
            setIsDropdownOpen(true);
          }}
        />

        {searchQuery && (
          <button
            type="button"
            className={styles.searchClearBtn}
            onClick={() => {
              onSearchQueryChange("");
              setIsDropdownOpen(false);
            }}
            aria-label="مسح البحث"
          >
            ✕
          </button>
        )}

        {/* Instant Search Results Dropdown */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div className={styles.searchDropdown}>
            {searchResults.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                }}
              >
                لم يتم العثور على محطات مطابقة لـ &quot;{searchQuery}&quot;
              </div>
            ) : (
              searchResults.map((station, index) => {
                let lineColor = "#06b6d4";
                let lineName = "الجذع الرئيسي";
                if (station.line_type === "capital") {
                  lineColor = "#a855f7";
                  lineName = "تفريعة العاصمة";
                } else if (station.line_type === "ramadan") {
                  lineColor = "#10b981";
                  lineName = "تفريعة العاشر";
                }

                return (
                  <div
                    key={station.id || `${station.line_type}-${station.name}-${index}`}
                    onClick={() => onSelectStation(station)}
                    className={styles.searchDropdownItem}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          backgroundColor: lineColor,
                          boxShadow: `0 0 6px ${lineColor}80`,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "800",
                          color: "var(--text-primary)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {station.name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          backgroundColor: lineColor + "18",
                          color: lineColor,
                          border: `1px solid ${lineColor}30`,
                        }}
                      >
                        {lineName}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
