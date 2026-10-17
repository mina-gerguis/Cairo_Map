import React, { RefObject, useRef, useEffect } from "react";
import { Port, PortFilter, CategoryCounts } from "../types";
import { PORT_FILTERS, POPULAR_PORT_SEARCHES } from "../constants";
import styles from "../ports.module.css";

interface PortsSearchCardProps {
  searchPanelRef: RefObject<HTMLDivElement | null>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: PortFilter;
  onFilterChange: (filter: PortFilter) => void;
  counts: CategoryCounts;
  searchResults: Port[];
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  onSelectPort: (port: Port) => void;
}

export default function PortsSearchCard({
  searchPanelRef,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  counts,
  searchResults,
  isDropdownOpen,
  setIsDropdownOpen,
  onSelectPort,
}: PortsSearchCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsDropdownOpen]);

  return (
    <div ref={searchPanelRef} className={styles.searchBentoCard}>
      <div className={styles.searchBentoHeader}>
        <h2 className={styles.searchTitle}>
          <i className="bx bx-search-alt" style={{ color: "var(--color-secondary, #3b82f6)" }} />
          <span>البحث السريع وتصفية الموانئ</span>
        </h2>
      </div>

      <div className={styles.inputGroup}>
        {/* Search Field & Instant Autocomplete Dropdown */}
        <div ref={containerRef} className={styles.searchFieldWrapper}>
          <label className={styles.fieldLabel}>
            <i className="bx bx-anchor" style={{ color: "var(--color-secondary, #3b82f6)" }} />
            <span>ابحث باسم الميناء، المحافظة، أو البحر</span>
          </label>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="مثال: الإسكندرية، السخنة، دمياط، بورسعيد..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="input-fields"
              style={{
                width: "100%",
                paddingLeft: searchQuery ? "42px" : "16px",
                height: "48px",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setIsDropdownOpen(false);
                }}
                className={styles.clearBtn}
                aria-label="مسح البحث"
              >
                ×
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Results */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div className={styles.autocompleteDropdown}>
              {searchResults.length === 0 ? (
                <div className={styles.emptyAutocomplete}>
                  لم يتم العثور على موانئ مطابقة لبحثك
                </div>
              ) : (
                searchResults.map((port, idx) => (
                  <div
                    key={port.id || idx}
                    onClick={() => onSelectPort(port)}
                    className={styles.autocompleteItem}
                  >
                    <div className={styles.autocompleteItemContent}>
                      <span style={{ fontSize: "1.1rem" }}>⚓</span>
                      <span className={styles.autocompletePortName}>{port.name}</span>
                    </div>
                    <span className={styles.autocompletePill}>{port.governorate}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Popular Preset Searches Chips */}
        <div className={styles.presetChipsWrapper}>
          <span className={styles.presetLabel}>بحث رائج:</span>
          {POPULAR_PORT_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onSearchChange(term)}
              className={`${styles.chipTag} ${searchQuery === term ? styles.chipTagActive : ""}`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className={styles.filterPillsRow}>
          {PORT_FILTERS.map((filter) => {
            const count = counts[filter.id] || 0;
            const isActive = selectedFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={`${styles.filterPillBtn} ${isActive ? styles.filterPillBtnActive : ""}`}
              >
                <i className={filter.icon} />
                <span>{filter.label} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
