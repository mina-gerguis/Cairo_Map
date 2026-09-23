import React from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { DirectorySearchPanelProps } from "../types";
import { getDialUrl } from "../utils";
import styles from "../directory.module.css";

export default function DirectorySearchPanel({
  searchPanelRef,
  searchQuery,
  setSearchQuery,
  isFocused,
  setIsFocused,
  activeMainTab,
  setActiveMainTab,
  telecomCodesCount,
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

        {/* Quick Section Tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setActiveMainTab("phones")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
              background:
                activeMainTab === "phones"
                  ? "var(--color-secondary)"
                  : "var(--bg-secondary)",
              color: activeMainTab === "phones" ? "#ffffff" : "var(--text-secondary)",
              border:
                activeMainTab === "phones"
                  ? "1px solid var(--color-secondary)"
                  : "1px solid var(--border-glass)",
              transition: "all 0.2s ease",
            }}
          >
            <i className="fa-solid fa-phone" style={{ marginLeft: "4px" }}></i>
            أرقام وخطوط ساخنة
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("telecom")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
              background:
                activeMainTab === "telecom"
                  ? "var(--color-secondary)"
                  : "var(--bg-secondary)",
              color: activeMainTab === "telecom" ? "#ffffff" : "var(--text-secondary)",
              border:
                activeMainTab === "telecom"
                  ? "1px solid var(--color-secondary)"
                  : "1px solid var(--border-glass)",
              transition: "all 0.2s ease",
            }}
          >
            <i className="fa-solid fa-hashtag" style={{ marginLeft: "4px" }}></i>
            أكواد المحمول ({telecomCodesCount})
          </button>
        </div>
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
          <VoiceInputButton
            onTranscript={(text) => {
              setSearchQuery(text);
              onSaveSearch(text);
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <input
            className="input-fields"
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
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              ✕
            </button>
          )}
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
                  <span
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                    }}
                  >
                    {entry.name}
                  </span>
                  {entry.specialty && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: "var(--border-glass)",
                        color: "var(--text-secondary)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {entry.specialty}
                    </span>
                  )}
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "800",
                      color: "var(--colorSuccess)",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "8px",
                      direction: "ltr",
                    }}
                  >
                    {entry.phone_number}
                  </span>
                  <a
                    href={getDialUrl(entry.phone_number)}
                    style={{
                      color: "var(--color-secondary)",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                    }}
                    title="اتصال مباشر"
                  >
                    <i className="fa-solid fa-phone"></i>
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
            آخر عمليات البحث:
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
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              🔍 {term}
            </button>
          ))}
          <button
            type="button"
            onClick={onClearRecentSearches}
            className="actionBtn actionBtnDelete"
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
