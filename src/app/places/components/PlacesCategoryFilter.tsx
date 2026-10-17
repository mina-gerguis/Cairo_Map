"use client";

import React from "react";
import { CATEGORIES_STRUCTURE, formatBoxIcon } from "@/data/places";
import { PlacesCategoryFilterProps } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../constants";

export default function PlacesCategoryFilter({
  selectedCategory,
  selectedSubCategory,
  selectedType,
  onSelectCategory,
  onSelectSubCategory,
  onSelectType,
  places,
  isProximityEnabled,
  locationLoading,
  onToggleProximity,
}: PlacesCategoryFilterProps) {
  // العثور على أنواع الأماكن المتاحة لهذا التصنيف الفرعي
  const availableTypes = React.useMemo(() => {
    if (selectedCategory === "all" || !selectedSubCategory) return [];

    return Array.from(
      new Set(
        places
          .filter((p) => {
            const matchesMain = p.category === selectedCategory;
            const matchesSub = p.subCategories?.includes(selectedSubCategory);
            return matchesMain && matchesSub && p.place_type?.trim();
          })
          .map((p) => p.place_type!.trim())
      )
    ).filter(Boolean);
  }, [places, selectedCategory, selectedSubCategory]);

  return (
    <>
      {/* ── Categories + Proximity Button ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`btn ${isProximityEnabled ? "btn-primary" : ""}`}
          onClick={onToggleProximity}
          disabled={locationLoading}
          style={{
            padding: "10px 16px",
            fontSize: "0.9rem",
            flexShrink: 0,
            gap: "6px",
            border: "1px solid var(--border-glass)",
            fontFamily: "var(--font-sub)",
            width: "100%",
          }}
        >
          {locationLoading ? (
            <span
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          )}
          {isProximityEnabled ? "قريب مني ✓" : "قريب مني"}
        </button>

        <div
          className="sub-title"
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            flexGrow: 1,
          }}
        >
          {["all", ...CATEGORIES_STRUCTURE.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              className={`category-pill ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => {
                onSelectCategory(cat);
                onSelectSubCategory(null);
                onSelectType(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-cairo)",
                fontSize: "0.8rem",
              }}
            >
              <i
                className={`bx ${CATEGORY_ICONS[cat] || "bx-category"}`}
                style={{ fontSize: "1.1rem" }}
              />
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Subcategories Row */}
      {selectedCategory !== "all" && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
            marginBottom: "16px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <button
            className={`category-pill ${
              selectedSubCategory === null ? "active" : ""
            }`}
            onClick={() => {
              onSelectSubCategory(null);
              onSelectType(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-cairo)",
              fontSize: "0.78rem",
            }}
          >
            <i className="bx bx-grid-alt" style={{ fontSize: "1rem" }} />
            الكل في {CATEGORY_LABELS[selectedCategory]}
          </button>
          {CATEGORIES_STRUCTURE.find(
            (m) => m.name === selectedCategory
          )?.subCategories.map((sub) => (
            <button
              key={sub.name}
              className={`category-pill ${
                selectedSubCategory === sub.name ? "active" : ""
              }`}
              onClick={() => {
                onSelectSubCategory(sub.name);
                onSelectType(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-cairo)",
                fontSize: "0.78rem",
              }}
            >
              <i className={`${sub.icon}`} style={{ fontSize: "1rem" }} />
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Place Types Tabs */}
      {selectedCategory !== "all" &&
        selectedSubCategory &&
        availableTypes.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              borderBottom: "1px solid var(--border-glass)",
              paddingBottom: "10px",
              marginBottom: "20px",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            <button
              onClick={() => onSelectType(null)}
              style={{
                background:
                  selectedType === null
                    ? "rgba(108, 99, 255, 0.15)"
                    : "none",
                border: "none",
                color:
                  selectedType === null
                    ? "var(--color-primary, #6c63ff)"
                    : "var(--text-secondary)",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "700",
                fontFamily: "var(--font-cairo)",
              }}
            >
              الكل
            </button>
            {availableTypes.map((tName) => {
              const typePlace = places.find((p) => p.place_type === tName);
              const typeIcon = formatBoxIcon(
                typePlace?.place_type_icon || "fa-solid fa-address-book"
              );
              return (
                <button
                  key={tName}
                  onClick={() => onSelectType(tName)}
                  style={{
                    background:
                      selectedType === tName
                        ? "rgba(108, 99, 255, 0.15)"
                        : "none",
                    border: "none",
                    color:
                      selectedType === tName
                        ? "var(--color-primary, #6c63ff)"
                        : "var(--text-secondary)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-cairo)",
                  }}
                >
                  <i className={typeIcon} />
                  <span style={{ whiteSpace: "nowrap" }}>{tName}</span>
                </button>
              );
            })}
          </div>
        )}
    </>
  );
}
