"use client";

import React from "react";
import { getMainCategoryImage } from "@/data/places";
import { PlaceWithDist } from "../types";

interface PlacesSearchSuggestionsProps {
  suggestions: PlaceWithDist[];
  activeSuggestionIndex: number;
  setActiveSuggestionIndex: (index: number) => void;
  onSelectPlace: (place: PlaceWithDist) => void;
  isLight: boolean;
}

export default function PlacesSearchSuggestions({
  suggestions,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  onSelectPlace,
  isLight,
}: PlacesSearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className="search-suggestions-dropdown"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: isLight
          ? "rgba(255, 255, 255, 0.98)"
          : "rgba(30, 30, 40, 0.96)",
        border: isLight
          ? "1px solid rgba(0, 0, 0, 0.08)"
          : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        marginTop: "10px",
        maxHeight: "220px",
        overflowY: "auto",
        zIndex: 99999,
        boxShadow: isLight
          ? "0 20px 40px rgba(0, 0, 0, 0.12)"
          : "0 20px 40px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
        padding: "8px",
        direction: "rtl",
      }}
    >
      {suggestions.map((place, index) => {
        const isActive = index === activeSuggestionIndex;

        return (
          <div
            key={place.id}
            className={`suggestion-item ${isActive ? "active" : ""}`}
            onClick={() => onSelectPlace(place)}
            onMouseEnter={() => setActiveSuggestionIndex(index)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: "14px",
              cursor: "pointer",
              gap: "16px",
              border: "1px solid transparent",
              backgroundColor: isActive
                ? isLight
                  ? "rgba(108, 99, 255, 0.1)"
                  : "rgba(108, 99, 255, 0.2)"
                : "transparent",
              borderColor: isActive
                ? isLight
                  ? "rgba(108, 99, 255, 0.15)"
                  : "rgba(108, 99, 255, 0.25)"
                : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <div
              className="suggestion-item-main"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "transparent",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                <img
                  src={getMainCategoryImage(place.category, place.subCategories)}
                  alt={place.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div
                className="suggestion-details"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "right",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  className="suggestion-name"
                  style={{
                    fontFamily: "var(--font-cairo), sans-serif",
                    fontWeight: 700,
                    fontSize: "0.98rem",
                    color: isLight ? "#1f2937" : "#f3f4f6",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {place.name}
                  {place.name_en && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: isLight ? "#6b7280" : "#9ca3af",
                        marginRight: "6px",
                        fontWeight: "normal",
                      }}
                    >
                      ({place.name_en})
                    </span>
                  )}
                </span>
                <span
                  className="suggestion-subtitle"
                  style={{
                    fontFamily: "var(--font-cairo), sans-serif",
                    fontSize: "0.8rem",
                    color: isLight ? "#6b7280" : "#9ca3af",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: "3px",
                    opacity: 0.85,
                  }}
                >
                  {place.categoryLabel} • {place.city}، {place.governorate}
                </span>
              </div>
            </div>

            {place.rating !== undefined && place.rating > 0 && (
              <div
                className="suggestion-meta"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#ff9f0a",
                  flexShrink: 0,
                  direction: "ltr",
                }}
              >
                <span>{Number(place.rating).toFixed(1)}</span>
                <i className="bx bxs-star" style={{ fontSize: "0.95rem" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
