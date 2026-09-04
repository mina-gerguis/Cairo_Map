"use client";

import React, { useState, useEffect, useRef } from "react";

// Helper function to normalize Arabic text for smarter search
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/[ةه]/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[\u064B-\u065F]/g, ""); // Remove diacritics
}

// Levenshtein Distance for typo tolerance
function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i: number, j: number;
  for (i = 0; i <= a.length; i++) tmp.push([i]);
  for (j = 1; j <= b.length; j++) tmp[0].push(j);
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

// Find closest match for "Did you mean..." suggestions
function findDidYouMean(query: string, options: string[]): string | null {
  const normQuery = normalizeArabic(query);
  if (!normQuery || normQuery.length < 2) return null;

  let bestMatch: string | null = null;
  let minDistance = Infinity;

  for (const option of options) {
    const normOption = normalizeArabic(option);
    const dist = getLevenshteinDistance(normQuery, normOption);

    // Threshold calculation: allow 1 typo for short words, 2 for medium, etc.
    const maxAllowedDist = Math.max(1, Math.floor(normOption.length * 0.35));
    if (dist < minDistance && dist <= maxAllowedDist) {
      minDistance = dist;
      bestMatch = option;
    }
  }

  // Only return if it's a typo, not an exact match (distance > 0)
  return minDistance > 0 ? bestMatch : null;
}

interface MultiSelectSearchProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelectSearch({
  options: defaultOptions,
  selected = [],
  onChange,
  placeholder = "اختر الخدمات المتاحة...",
  label
}: MultiSelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Combine default options with any custom options added by user
  const [allOptions, setAllOptions] = useState<string[]>([]);

  useEffect(() => {
    // Add any pre-selected options that aren't in the default list as custom options
    const initialCustoms = selected.filter(s => !defaultOptions.includes(s));
    setCustomOptions(prev => Array.from(new Set([...prev, ...initialCustoms])));
  }, [selected, defaultOptions]);

  useEffect(() => {
    // Keep all options updated
    setAllOptions(Array.from(new Set([...defaultOptions, ...customOptions])));
  }, [defaultOptions, customOptions]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleOption = (option: string) => {
    const isSelected = selected.includes(option);
    const nextSelected = isSelected
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(nextSelected);
  };

  const handleAddNewOption = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check if it already exists
    if (!allOptions.includes(trimmed)) {
      setCustomOptions(prev => [...prev, trimmed]);
    }

    // Add to selected if not already selected
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setSearchQuery("");
  };

  // Filter options based on search query
  const normalizedQuery = normalizeArabic(searchQuery);
  const filteredOptions = allOptions.filter(option =>
    normalizeArabic(option).includes(normalizedQuery)
  );

  // Advanced suggestion (Did you mean...)
  // Show it only if there is no exact or partial matches in the filtered list
  const didYouMean = filteredOptions.length === 0 && searchQuery.length >= 2
    ? findDidYouMean(searchQuery, allOptions)
    : null;

  const isExactMatch = allOptions.some(
    opt => normalizeArabic(opt) === normalizedQuery
  );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", textAlign: "right" }} dir="rtl">
      {label && (
        <label className="help-label" style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)", display: "block" }}>
          {label}
        </label>
      )}

      {/* Trigger Selector */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="input-fields"
        style={{
          minHeight: "50px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          cursor: "pointer",
          padding: "10px 16px",
          position: "relative",
          background: "var(--bgGlass)",
          border: isOpen ? "1px solid var(--colorPrimary)" : "1px solid var(--borderGlass)",
          borderRadius: "var(--radius-sm)",
          boxShadow: isOpen ? "0 0 0 3px rgba(0, 111, 238, 0.15)" : "none",
          transition: "all 0.25s ease"
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{placeholder}</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", width: "90%" }}>
            {selected.map(item => (
              <span
                key={item}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
                style={{
                  background: "rgba(0, 111, 238, 0.12)",
                  color: "var(--colorPrimary)",
                  border: "1px solid rgba(0, 111, 238, 0.2)",
                  padding: "4px 10px",
                  borderRadius: "14px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {item}
                <i className="bx bx-x" style={{ fontSize: "1rem", cursor: "pointer" }}></i>
              </span>
            ))}
          </div>
        )}
        <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
          <i className={`bx ${isOpen ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.3rem" }}></i>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 999,
            marginTop: "6px",
            background: "var(--bgGlass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--borderPrimary)",
            borderRadius: "var(--radius-xs)",
            boxShadow: "var(--shadow-xs)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {/* Search Input Box */}
          <div style={{ position: "relative" }}>
            <input
              ref={searchInputRef}
              type="text"
              className="input-fields"
              placeholder="ابحث عن الخدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "10px 36px 10px 14px",
                fontSize: "0.9rem",
                borderRadius: "10px"
              }}
            />
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <i className="bx bx-search" style={{ fontSize: "1.1rem" }}></i>
            </div>
          </div>

          {/* Spell check suggestion (Did you mean) */}
          {didYouMean && (
            <div
              style={{
                fontSize: "0.82rem",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "var(--accent-warning)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>هل تقصد:</span>
              <button
                type="button"
                onClick={() => setSearchQuery(didYouMean)}
                style={{
                  background: "var(--accent-warning)",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {didYouMean}
              </button>
              <span>؟</span>
            </div>
          )}

          {/* Options List */}
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              paddingRight: "4px"
            }}
            className="hide-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                لا توجد خدمات مطابقة للبحث.
              </div>
            ) : (
              filteredOptions.map(option => {
                const isChecked = selected.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isChecked ? "rgba(0, 111, 238, 0.08)" : "transparent",
                      color: isChecked ? "var(--textPrimary)" : "var(--textSecondary)",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = "var(--hoverBtn, rgba(39, 39, 42, 0.8))";
                        e.currentTarget.style.color = "var(--textPrimary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--textSecondary)";
                      }
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: isChecked ? "600" : "400" }}>{option}</span>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: isChecked ? "none" : "2px solid var(--borderGlass-bright)",
                        background: isChecked ? "var(--colorPrimary)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff"
                      }}
                    >
                      {isChecked && <i className="bx bx-check" style={{ fontSize: "1.1rem", fontWeight: "bold" }}></i>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Custom Service Input Option */}
          {searchQuery.trim() !== "" && !isExactMatch && (
            <button
              type="button"
              onClick={handleAddNewOption}
              style={{
                width: "100%",
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--colorSuccess)",
                border: "1px dashed rgba(16, 185, 129, 0.4)",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "4px"
              }}
            >
              <i className="bx bx-plus-circle" style={{ fontSize: "1.1rem" }}></i>
              إضافة "{searchQuery.trim()}" كخدمة جديدة
            </button>
          )}
        </div>
      )}
    </div>
  );
}
