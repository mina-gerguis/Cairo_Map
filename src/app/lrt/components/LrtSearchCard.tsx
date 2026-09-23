import React from "react";
import { LrtSearchCardProps } from "../types";

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
      className="metro-animate-slide-up metro-delay-200"
      style={{
        backgroundColor: "var(--bgPrimary)",
        border: "1px solid var(--border-glass)",
        borderRadius: "var(--radius-card)",
        padding: "20px",
        marginTop: "24px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        zIndex: 30,
      }}
    >
      <div style={{ position: "relative" }}>
        <label
          style={{
            fontSize: "0.85rem",
            fontWeight: "700",
            color: "var(--text-secondary)",
            display: "block",
            marginBottom: "8px",
          }}
        >
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ marginLeft: "5px", color: "var(--color-secondary)" }}
          />{" "}
          ابحث في محطات القطار الكهربائي LRT
        </label>
        <input
          className="input-fields"
          type="text"
          placeholder="ابحث باسم المحطة..."
          value={searchQuery}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            onSearchQueryChange(e.target.value);
            setIsDropdownOpen(true);
          }}
          style={{
            width: "100%",
            direction: "rtl",
            fontFamily: "var(--font-heading)",
            height: "50px",
          }}
        />

        {/* Instant Search Results Dropdown */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-sm)",
              zIndex: 100,
              marginTop: "6px",
              maxHeight: "260px",
              overflowY: "auto",
              padding: "8px 0",
            }}
          >
            {searchResults.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                لم يتم العثور على محطات مطابقة
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
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      borderBottom:
                        index < searchResults.length - 1
                          ? "1px solid var(--border-glass)"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: lineColor,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {station.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          backgroundColor: lineColor + "1a",
                          color: lineColor,
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
