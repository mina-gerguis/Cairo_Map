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

export default function RouteSearchCard({
  searchPanelRef,
  className = "",
  title = "تحديد محطة الانطلاق والوجهة",
  titleIcon = <i className="fa-solid fa-compass" style={{ color: "var(--color-secondary, #3b82f6)" }} />,
  headerAction,
  fromInput,
  setFromInput,
  fromLabel,
  fromPlaceholder = "اكتب مكان الانطلاق... (رمسيس، موقف الأحرار، الجيزة...)",
  fromIcon = <i className="bx bx-map-pin" style={{ color: "#10b981" }} />,
  showGps = true,
  isLocating = false,
  onUseGPS,
  gpsTitle = "تحديد الموقع بالـ GPS",
  toInput,
  setToInput,
  toLabel,
  toPlaceholder = "اكتب الوجهة... (التجمع، المعادي، 6 أكتوبر، العبور...)",
  toIcon = <i className="bx bx-flag" style={{ color: "#ef4444" }} />,
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

      <div className={styles.inputGroup}>
        {/* FROM INPUT FIELD */}
        <div
          className={styles.fieldContainer}
          style={{ zIndex: showFromSuggestions ? 100 : 2 }}
        >
          <div className={styles.fieldLabel}>
            <div className={styles.labelLeft}>
              {fromLabel || (
                <>
                  <span>هتتحرك منين ؟</span>
                </>
              )}
            </div>

            <div className={styles.labelActions}>
              {showGps && onUseGPS && (
                <button
                  type="button"
                  onClick={onUseGPS}
                  title={gpsTitle}
                  className={styles.gpsBtn}
                >
                  <i
                    className={`bx ${isLocating ? "bx-loader-alt bx-spin" : "bx-target-lock"}`}
                    style={{ color: isLocating ? "#ef4444" : "var(--color-secondary, #3b82f6)" }}
                  />
                  <span>موقعي</span>
                </button>
              )}

              {showVoiceInput && (
                <VoiceInputButton
                  onTranscript={(text) => {
                    setFromInput(text);
                    setShowFromSuggestions(true);
                  }}
                />
              )}
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <input
              className={`input-fields ${styles.input}`}
              placeholder={fromPlaceholder}
              value={fromInput}
              onChange={(e) => {
                setFromInput(e.target.value);
                setShowFromSuggestions(true);
              }}
              onFocus={() => setShowFromSuggestions(true)}
              onBlur={() => setTimeout(() => setShowFromSuggestions(false), 250)}
            />

            {fromInput.trim() && (
              <button
                type="button"
                onClick={() => {
                  setFromInput("");
                  setShowFromSuggestions(false);
                }}
                className={styles.clearBtn}
                aria-label="مسح حقل الانطلاق"
              >
                ×
              </button>
            )}

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

        {/* SWAP BUTTON */}
        {showSwap && onSwap && (
          <div className={styles.swapBtnRow}>
            <button
              type="button"
              onClick={onSwap}
              title="تبديل نقطة الانطلاق والوصول"
              className={styles.swapBtn}
              aria-label="تبديل نقطة الانطلاق والوصول"
            >
              <i className="bx bx-transfer-alt" />
            </button>
          </div>
        )}

        {/* TO INPUT FIELD */}
        <div
          className={styles.fieldContainer}
          style={{ zIndex: showToSuggestions ? 100 : 1 }}
        >
          <div className={styles.fieldLabel}>
            <div className={styles.labelLeft}>
              {toLabel || (
                <>
                  <span>عايز تروح فين ؟</span>
                </>
              )}
            </div>

            <div className={styles.labelActions}>
              {showVoiceInput && (
                <VoiceInputButton
                  onTranscript={(text) => {
                    setToInput(text);
                    setShowToSuggestions(true);
                  }}
                />
              )}
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <input
              className={`input-fields ${styles.input}`}
              placeholder={toPlaceholder}
              value={toInput}
              onChange={(e) => {
                setToInput(e.target.value);
                setShowToSuggestions(true);
              }}
              onFocus={() => setShowToSuggestions(true)}
              onBlur={() => setTimeout(() => setShowToSuggestions(false), 250)}
            />

            {toInput.trim() && (
              <button
                type="button"
                onClick={() => {
                  setToInput("");
                  setShowToSuggestions(false);
                }}
                className={styles.clearBtn}
                aria-label="مسح حقل الوجهة"
              >
                ×
              </button>
            )}

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
