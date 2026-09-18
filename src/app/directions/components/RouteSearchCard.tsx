import React, { RefObject, useMemo, useState } from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { CitySuggestion } from "../types";
import { normalizeArabic, calculateLocationScore } from "../utils";

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
    <div ref={searchPanelRef} className="details-panel" style={{ position: "relative", zIndex: 20 }}>
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          margin: "0 0 4px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <i className="fa-solid fa-compass" style={{ color: "var(--color-secondary)" }}></i>
        <span>تحديد محطة الانطلاق والوجهة</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
        {/* FROM INPUT */}
        <div style={{ position: "relative", zIndex: showFromSuggestions ? 100 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0 }}>
              <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "#10b981" }}></i> هتتحرك منين ؟
            </label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                onClick={onUseGPS}
                title="حدد موقعك الحالي بالـ GPS"
                style={{
                  background: "transparent",
                  color: isLocating ? "#ef4444" : "var(--text-primary)",
                  border: "none",
                  padding: "0px 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <i className="bx bx-target-lock" style={{ fontSize: "1.1rem" }} />
              </button>
              <VoiceInputButton
                onTranscript={(text) => {
                  setFromInput(text);
                  setShowFromSuggestions(true);
                }}
              />
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <input
              className="input-fields"
              placeholder="اكتب اسم مكان الانطلاق... (مثال: موقف الأحرار أو الزقازيق أو رمسيس)"
              value={fromInput}
              onChange={(e) => {
                setFromInput(e.target.value);
                setShowFromSuggestions(true);
              }}
              onFocus={() => setShowFromSuggestions(true)}
              onBlur={() => setTimeout(() => setShowFromSuggestions(false), 250)}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-body)",
              }}
            />
            {fromInput.trim() && (
              <button
                type="button"
                onClick={() => {
                  setFromInput("");
                  setShowFromSuggestions(false);
                }}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--textSecondary)",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* From Suggestions Dropdown */}
          {showFromSuggestions && (filteredFromCities || []).length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--bgSecondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                zIndex: 999,
                maxHeight: "220px",
                overflowY: "auto",
                boxShadow: "var(--shadow-lg)",
                marginTop: "6px",
                fontFamily: "var(--font-body)",
              }}
            >
              {(filteredFromCities || []).map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => {
                    setFromInput(item.name);
                    setShowFromSuggestions(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-glass)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SWAP BUTTON */}
        <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
          <button
            type="button"
            onClick={onSwap}
            title="تبديل نقطة الانطلاق والوصول"
            style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--textSecondary)",
              fontSize: "1.1rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "rotate(180deg)";
              e.currentTarget.style.background = "var(--hoverBtn)";
              e.currentTarget.style.color = "var(--color-secondary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "rotate(0deg)";
              e.currentTarget.style.background = "var(--bgSecondary)";
              e.currentTarget.style.color = "var(--textSecondary)";
            }}
          >
            ⇅
          </button>
        </div>

        {/* TO INPUT */}
        <div style={{ position: "relative", zIndex: showToSuggestions ? 100 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0 }}>
              <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "#ef4444" }}></i> لفين ؟
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                setToInput(text);
                setShowToSuggestions(true);
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <input
              className="input-fields"
              placeholder="اكتب اسم الوجهة... (مثال: معرض الكتاب أو التجمع الخامس أو أكتوبر)"
              value={toInput}
              onChange={(e) => {
                setToInput(e.target.value);
                setShowToSuggestions(true);
              }}
              onFocus={() => setShowToSuggestions(true)}
              onBlur={() => setTimeout(() => setShowToSuggestions(false), 250)}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-body)",
              }}
            />
            {toInput.trim() && (
              <button
                type="button"
                onClick={() => {
                  setToInput("");
                  setShowToSuggestions(false);
                }}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--textSecondary)",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* To Suggestions Dropdown */}
          {showToSuggestions && (filteredToCities || []).length > 0 && (
            <div
              style={{
                position: "relative",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--bgSecondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                zIndex: 999,
                maxHeight: "220px",
                overflowY: "auto",
                boxShadow: "var(--shadow-lg)",
                marginTop: "6px",
                fontFamily: "var(--font-body)",
              }}
            >
              {(filteredToCities || []).map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => {
                    setToInput(item.name);
                    setShowToSuggestions(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-glass)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
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
          marginTop: "4px",
          fontSize: "var(--fs-sm)",
          fontWeight: "var(--fw-bold)",
          cursor: isSearchDisabled ? "not-allowed" : "pointer",
          opacity: isSearchDisabled ? 0.6 : 1,
        }}
      >
        <i className="bx bx-search-alt" style={{ fontSize: "1.2rem" }} />
        <span>ابحث عن مسارات المواصلات</span>
      </button>
    </div>
  );
}
