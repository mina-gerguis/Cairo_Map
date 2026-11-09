import React from "react";
import { DirectorySearchPanelProps } from "../types";
import { getDialUrl } from "../utils";
import styles from "../directory.module.css";
import searchStyles from "@/components/common/RouteSearchCard/RouteSearchCard.module.css";
import VoiceInputButton from "@/components/VoiceInputButton";

export default function DirectorySearchPanel({
  searchPanelRef,
  searchQuery,
  setSearchQuery,
  isFocused,
  setIsFocused,
  recentSearches,
  searchSuggestions,
  onSaveSearch,
  onClearRecentSearches,
}: DirectorySearchPanelProps) {
  return (
    <div
      ref={searchPanelRef}
      className="details-panel"
      style={{ position: "relative", zIndex: 100 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h5 className="text-lg fw-bold" style={{ margin: 0 }}>
          ابحث في دليل الأرقام والخدمات
        </h5>
      </div>

      {/* Search Input Container */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <label
            style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ marginLeft: "6px", color: "var(--color-secondary)" }}
            ></i>
            ابحث بالاسم، الرقم، التخصص، أو الخدمة:
          </label>
        </div>

        <div className={searchStyles.inputWrapper}>
          {/* Left search icon like Metro & Monorail */}
          <div className={searchStyles.inputStartIcon}>
            <span
              className={searchStyles.inputStartBtnStatic}
              style={{
                color: "var(--text-muted, #71717a)",
                fontSize: "1.05rem",
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </span>
          </div>

          <input
            className={`input-fields ${searchStyles.input}`}
            type="text"
            placeholder="مثال: البنك الأهلي، الإسعاف، تحويل فودافون كاش، طوارئ الغاز..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSaveSearch(searchQuery);
                setIsFocused(false);
              }
            }}
            style={{
              width: "100%",
              direction: "rtl",
              fontFamily: "var(--font-body)",
              paddingRight: "48px",
              paddingLeft: "48px",
              outline: "none",
              border: "none",
              boxShadow: "none",
            }}
          />

          {/* End actions: Clear button or Voice Input */}
          <div className={searchStyles.inputEndActions} style={{ right: "14px" }}>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                title="مسح"
                aria-label="مسح البحث"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted, #71717a)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            ) : (
              <VoiceInputButton
                onTranscript={(text) => {
                  setSearchQuery(text);
                  onSaveSearch(text);
                }}
              />
            )}
          </div>
        </div>

        {/* Instant Suggestions Dropdown */}
        {isFocused && searchQuery.trim() !== "" && searchSuggestions.length > 0 && (
          <div className={styles.suggestionsDropdown}>
            {searchSuggestions.map((entry) => (
              <div
                key={entry.id}
                className={styles.suggestionItem}
                onMouseDown={() => {
                  setSearchQuery(entry.name);
                  onSaveSearch(entry.name);
                  setIsFocused(false);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>
                    <img
                      src={entry.logo_url}
                      alt={entry.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-full)",
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: "700",
                      color: "var(--color-fg)",
                    }}
                  >
                    {entry.name}
                  </span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <a
                    href={getDialUrl(entry.phone_number)}
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "800",
                      color: "var(--color-secondary)",
                      background: "var(--bg-glass)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-md)",
                      direction: "ltr",
                    }}
                  >
                    {entry.phone_number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches Row */}
      {recentSearches.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "-4px",
          }}
        >
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
            }}
          >
            آخر البحث:
          </span>
          {recentSearches.map((term, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSearchQuery(term);
                onSaveSearch(term);
              }}
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-glass)",
                background: "var(--bg-secondary)",
                color: "var(--color-fg)",
                cursor: "pointer",
              }}
            >
              {term}
            </button>
          ))}
          <button
            type="button"
            onClick={onClearRecentSearches}
            className="action-btn action-btn-delete"
            style={{ cursor: "pointer", padding: "2px 6px", fontSize: "0.75rem" }}
            title="مسح سجل البحث"
          >
            <i className="bx bx-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
}
