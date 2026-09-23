import React, { RefObject, useMemo, useState } from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { CitySuggestion } from "../types";
import { calculateLocationScore } from "../utils";
import styles from "../page.module.css";

interface RouteSearchCardProps {
  searchPanelRef: RefObject<HTMLDivElement | null>;
  fromInput: string;
  toInput: string;
  setFromInput: (val: string) => void;
  setToInput: (val: string) => void;
  uniqueCitiesList: CitySuggestion[];
  onSearch: () => void;
  onSwap: () => void;
  isLocating: boolean;
  onUseGPS: () => void;
}

export default function RouteSearchCard({
  searchPanelRef,
  fromInput,
  toInput,
  setFromInput,
  setToInput,
  uniqueCitiesList,
  onSearch,
  onSwap,
  isLocating,
  onUseGPS,
}: RouteSearchCardProps) {
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Filter and rank autocomplete suggestions for "from" input
  const filteredFromCities = useMemo(() => {
    const rawInput = fromInput.trim();
    if (!rawInput) return uniqueCitiesList;

    const scored = (uniqueCitiesList || [])
      .map(item => {
        const score = calculateLocationScore(item.name, item.searchNames?.join(", "), rawInput);
        return { item, score };
      })
      .filter(({ item, score }) => {
        if (item.name.toLowerCase() === rawInput.toLowerCase()) return false;
        return score >= 120;
      })
      .sort((a, b) => b.score - a.score);

    return scored.map(s => s.item);
  }, [fromInput, uniqueCitiesList]);

  // Filter and rank autocomplete suggestions for "to" input
  const filteredToCities = useMemo(() => {
    const rawInput = toInput.trim();
    if (!rawInput) return uniqueCitiesList;

    const scored = (uniqueCitiesList || [])
      .map(item => {
        const score = calculateLocationScore(item.name, item.searchNames?.join(", "), rawInput);
        return { item, score };
      })
      .filter(({ item, score }) => {
        if (item.name.toLowerCase() === rawInput.toLowerCase()) return false;
        return score >= 120;
      })
      .sort((a, b) => b.score - a.score);

    return scored.map(s => s.item);
  }, [toInput, uniqueCitiesList]);

  const isSearchDisabled = !fromInput.trim() || !toInput.trim();

  return (
    <div ref={searchPanelRef} className={styles.searchBentoCard}>
      <div className={styles.searchBentoHeader}>
        <h2 className={styles.searchTitle}>
          <i className="fa-solid fa-compass" style={{ color: "var(--color-secondary)" }} />
          <span>تحديد محطة الانطلاق والوجهة</span>
        </h2>
      </div>

      <div className={styles.inputGroup}>
        {/* FROM INPUT */}
        <div style={{ position: "relative", zIndex: showFromSuggestions ? 100 : 2 }}>
          <div className={styles.fieldLabel}>
            <span>
              <i className="fa-solid fa-route" style={{ marginLeft: "6px", color: "#10b981" }} />
              هتتحرك منين ؟
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                onClick={onUseGPS}
                title="تحديد الموقع بالـ GPS"
                className={styles.chipTag}
                style={{
                  padding: "3px 10px",
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <i
                  className={`bx ${isLocating ? "bx-loader-alt bx-spin" : "bx-target-lock"}`}
                  style={{ color: isLocating ? "#ef4444" : "var(--color-secondary)" }}
                />
                <span>موقعي</span>
              </button>
              <VoiceInputButton
                onTranscript={(text) => {
                  setFromInput(text);
                  setShowFromSuggestions(true);
                }}
              />
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <span className={styles.inputStartIcon}>
              <i className="bx bx-map-pin" style={{ color: "#10b981" }} />
            </span>
            <input
              className={styles.modernInput}
              placeholder="اكتب مكان الانطلاق... (رمسيس، موقف الأحرار، الجيزة...)"
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
                aria-label="مسح الانطلاق"
              >
                ×
              </button>
            )}

            {/* From Suggestions Dropdown */}
            {showFromSuggestions && (filteredFromCities || []).length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {(filteredFromCities || []).slice(0, 8).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => {
                      setFromInput(item.name);
                      setShowFromSuggestions(false);
                    }}
                    className={styles.suggestionItem}
                  >
                    <span>{item.name}</span>
                    <i className="bx bx-chevron-left" style={{ color: "var(--text-muted)" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SWAP BUTTON */}
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

        {/* TO INPUT */}
        <div style={{ position: "relative", zIndex: showToSuggestions ? 100 : 1 }}>
          <div className={styles.fieldLabel}>
            <span>
              <i className="fa-solid fa-route" style={{ marginLeft: "6px", color: "#ef4444" }} />
              عايز تروح فين ؟
            </span>
            <VoiceInputButton
              onTranscript={(text) => {
                setToInput(text);
                setShowToSuggestions(true);
              }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <span className={styles.inputStartIcon}>
              <i className="bx bx-flag" style={{ color: "#ef4444" }} />
            </span>
            <input
              className={styles.modernInput}
              placeholder="اكتب الوجهة... (التجمع، المعادي، 6 أكتوبر، العبور...)"
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
                aria-label="مسح الوجهة"
              >
                ×
              </button>
            )}

            {/* To Suggestions Dropdown */}
            {showToSuggestions && (filteredToCities || []).length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {(filteredToCities || []).slice(0, 8).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => {
                      setToInput(item.name);
                      setShowToSuggestions(false);
                    }}
                    className={styles.suggestionItem}
                  >
                    <span>{item.name}</span>
                    <i className="bx bx-chevron-left" style={{ color: "var(--text-muted)" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Preset Chips */}
          <div className={styles.presetChipsWrapper}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: "700" }}>
              وجهات شائعة:
            </span>
            {["التجمع الخامس", "6 أكتوبر", "موقف العاشر", "المهندسين", "المعادي", "العبور"].map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => {
                  setToInput(dest);
                  setShowToSuggestions(false);
                }}
                className={`${styles.chipTag} ${toInput === dest ? styles.chipTagActive : ""}`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSearch}
        disabled={isSearchDisabled}
        style={{
          width: "100%",
          marginTop: "16px",
          height: "46px",
          fontSize: "0.95rem",
          fontWeight: "700",
          cursor: isSearchDisabled ? "not-allowed" : "pointer",
          opacity: isSearchDisabled ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <i className="bx bx-search-alt" style={{ fontSize: "1.25rem" }} />
        <span>ابحث عن مسارات المواصلات</span>
      </button>
    </div>
  );
}
