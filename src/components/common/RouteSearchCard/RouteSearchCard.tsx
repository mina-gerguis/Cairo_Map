"use client";

import React, { useMemo, useState } from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import styles from "./RouteSearchCard.module.css";
import { RouteSearchCardProps, SearchSuggestion } from "./types";

function defaultNormalize(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .trim();
}

function defaultFilterSuggestions(
  items: (SearchSuggestion | string)[],
  query: string
): SearchSuggestion[] {
  const rawInput = query.trim();
  if (!rawInput) return [];

  const qNorm = defaultNormalize(rawInput);

  return items
    .map((item) => (typeof item === "string" ? { name: item, searchNames: [] } : item))
    .filter((item) => {
      const nameNorm = defaultNormalize(item.name);
      if (nameNorm === qNorm) return false;
      if (nameNorm.includes(qNorm)) return true;
      if (
        item.searchNames &&
        item.searchNames.some((sn: string) => defaultNormalize(sn).includes(qNorm))
      ) {
        return true;
      }
      return false;
    });
}

// Default icons matching the reference design
const DefaultOriginIcon = () => (
  <svg
    className={styles.inputIconSvg}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7" />
  </svg>
);

const DefaultDestIcon = () => (
  <svg
    className={styles.inputIconSvg}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

export default function RouteSearchCard({
  searchPanelRef,
  className = "",
  title = "تحديد محطة الانطلاق والوجهة",
  titleIcon = <i className="fa-solid fa-compass" style={{ color: "var(--color-secondary, #3b82f6)" }} />,
  headerAction,
  fromInput,
  setFromInput,
  fromLabel,
  fromPlaceholder = "موقعي الجغرافي",
  fromIcon,
  showGps = true,
  isLocating = false,
  onUseGPS,
  gpsTitle = "تحديد الموقع بالـ GPS",
  locationBadge,
  onClearLocationBadge,
  toInput,
  setToInput,
  toLabel,
  toPlaceholder = "اكتب الوجهة... (جامعة، محطة، مول...)",
  toIcon,
  showVoiceInput = true,
  showSwap = true,
  onSwap,
  suggestions = [],
  filterSuggestions,
  maxSuggestions = 8,
  presetsTitle = "وجهات شائعة:",
  presets = ["التجمع الخامس", "6 أكتوبر", "موقف العاشر", "المهندسين", "المعادي", "العبور"],
  onSelectPreset,
  searchButtonText = "ابحث عن مسارات المواصلات",
  searchButtonIcon = <i className="bx bx-search-alt" style={{ fontSize: "1.25rem" }} />,
  onSearch,
  isSearchDisabled,
  isLoading = false,
}: RouteSearchCardProps) {
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Suggestions for "From" field
  const filteredFromSuggestions = useMemo(() => {
    if (!fromInput.trim()) return [];
    if (filterSuggestions) {
      return filterSuggestions(suggestions, fromInput);
    }
    return defaultFilterSuggestions(suggestions, fromInput);
  }, [fromInput, suggestions, filterSuggestions]);

  // Suggestions for "To" field
  const filteredToSuggestions = useMemo(() => {
    if (!toInput.trim()) return [];
    if (filterSuggestions) {
      return filterSuggestions(suggestions, toInput);
    }
    return defaultFilterSuggestions(suggestions, toInput);
  }, [toInput, suggestions, filterSuggestions]);

  const disabled =
    typeof isSearchDisabled === "boolean"
      ? isSearchDisabled
      : !fromInput.trim() || !toInput.trim() || isLoading;

  const handleSelectPreset = (dest: string) => {
    if (onSelectPreset) {
      onSelectPreset(dest);
    } else {
      setToInput(dest);
    }
    setShowToSuggestions(false);
  };

  const getSuggestionName = (item: SearchSuggestion | string): string => {
    return typeof item === "string" ? item : item.name;
  };

  return (
    <div
      ref={searchPanelRef}
      className={`${styles.card} ${className}`.trim()}
    >
      {/* Header */}
      {(title || headerAction) && (
        <div className={styles.header}>
          {title && (
            <h2 className={styles.title}>
              {titleIcon}
              <span>{title}</span>
            </h2>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={styles.searchBoxContainer}>
        {/* FROM INPUT FIELD */}
        <div
          className={styles.fieldContainer}
          style={{ zIndex: showFromSuggestions ? 100 : 2 }}
        >

          <div className={styles.inputWrapper}>
            {/* Left Origin Icon (Clickable to trigger GPS) */}
            <div className={styles.inputStartIcon}>
              {onUseGPS ? (
                <button
                  type="button"
                  onClick={onUseGPS}
                  disabled={isLocating}
                  title={gpsTitle || "تحديد موقعي الحالي بالـ GPS"}
                  aria-label={gpsTitle || "تحديد موقعي الحالي بالـ GPS"}
                  className={styles.inputStartBtn}
                >
                  {isLocating ? (
                    <i
                      className="bx bx-loader-alt bx-spin"
                      style={{ fontSize: "1.25rem", color: "var(--color-secondary, #3b82f6)" }}
                    />
                  ) : (
                    fromIcon || <DefaultOriginIcon />
                  )}
                </button>
              ) : (
                <span className={styles.inputStartBtnStatic}>
                  {fromIcon || <DefaultOriginIcon />}
                </span>
              )}
            </div>

            {/* Input field */}
            <input
              className={`input-fields ${styles.input}`}
              placeholder={fromPlaceholder}
              value={fromInput}
              onChange={(e) => {
                setFromInput(e.target.value);
                setShowFromSuggestions(true);
              }}
              style={{ outline: "none", border: "none", boxShadow: "none" }}
            />

            {/* From Suggestions Dropdown */}
            {showFromSuggestions && filteredFromSuggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {filteredFromSuggestions.slice(0, maxSuggestions).map((item, idx) => {
                  const name = getSuggestionName(item);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        setFromInput(name);
                        setShowFromSuggestions(false);
                      }}
                      className={styles.suggestionItem}
                    >
                      <span>{name}</span>
                      <i className="bx bx-chevron-left" style={{ color: "var(--text-muted, #71717a)" }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SWAP BUTTON - Right Junction */}
        {showSwap && onSwap && (
          <div className={styles.swapBtnAnchor}>
            <button
              type="button"
              onClick={onSwap}
              title="تبديل نقطة الانطلاق والوصول"
              className={styles.swapBtn}
              aria-label="تبديل نقطة الانطلاق والوصول"
            >
              <svg
                className={styles.swapIconSvg}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 20V4M7 4L3 8M7 4L11 8M17 4V20M17 20L21 16M17 20L13 16" />
              </svg>
            </button>
          </div>
        )}

        {/* TO INPUT FIELD */}
        <div
          className={styles.fieldContainer}
          style={{ zIndex: showToSuggestions ? 100 : 1 }}
        >
          <div className={styles.inputWrapper}>
            {/* Left Destination Icon */}
            <span className={styles.inputStartIcon}>
              {toIcon || <DefaultDestIcon />}
            </span>

            {/* Input field */}
            <input
              className={`input-fields ${styles.input}`}
              placeholder={toPlaceholder}
              value={toInput}
              onChange={(e) => {
                setToInput(e.target.value);
                setShowToSuggestions(true);
              }}
              style={{ outline: "none", border: "none", boxShadow: "none" }}
            />

          

            {/* To Suggestions Dropdown */}
            {showToSuggestions && filteredToSuggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {filteredToSuggestions.slice(0, maxSuggestions).map((item, idx) => {
                  const name = getSuggestionName(item);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        setToInput(name);
                        setShowToSuggestions(false);
                      }}
                      className={styles.suggestionItem}
                    >
                      <span>{name}</span>
                      <i className="bx bx-chevron-left" style={{ color: "var(--text-muted, #71717a)" }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Preset Chips */}
          {presets && presets.length > 0 && (
            <div className={styles.presetChipsWrapper}>
              {presetsTitle && (
                <span className={styles.presetLabel}>
                  {presetsTitle}
                </span>
              )}
              {presets.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => handleSelectPreset(dest)}
                  className={`${styles.chipTag} ${toInput === dest ? styles.chipTagActive : ""}`}
                >
                  {dest}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="button"
        className={`btn btn-primary w-full ${styles.submitBtn} ${disabled ? styles.submitBtnDisabled : ""}`}
        onClick={onSearch}
        disabled={disabled}
      >
        {isLoading ? (
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.25rem" }} />
        ) : (
          searchButtonIcon
        )}
        <span>{searchButtonText}</span>
      </button>
    </div>
  );
}
