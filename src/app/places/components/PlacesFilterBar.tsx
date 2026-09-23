"use client";

import React from "react";
import { PlacesFilterBarProps } from "../types";

export default function PlacesFilterBar({
  minRating,
  setMinRating,
  activeFeature,
  setActiveFeature,
}: PlacesFilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "32px",
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "14px",
        padding: "12px 0px",
      }}
    >
      <span
        style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          fontWeight: "700",
          fontFamily: "var(--font-cairo)",
        }}
      >
        تصفية حسب:
      </span>

      {/* Rating Filter Dropdown */}
      <div style={{ position: "relative" }}>
        <select
          value={minRating}
          onChange={(e) => setMinRating(parseFloat(e.target.value))}
          style={{
            background: "var(--bg-glass-card, rgba(255, 255, 255, 0.05))",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            color: "var(--text-primary)",
            padding: "6px 8px",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: "var(--font-cairo)",
            outline: "none",
          }}
        >
          <option
            value="0"
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            الكل ⭐
          </option>
          <option
            value="4"
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            4.0+ ⭐
          </option>
          <option
            value="4.5"
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            4.5+ ⭐
          </option>
        </select>
      </div>

      {/* Classification Filter Dropdown */}
      <div style={{ position: "relative" }}>
        <select
          value={activeFeature || ""}
          onChange={(e) => setActiveFeature(e.target.value)}
          style={{
            background: "var(--bg-glass-card, rgba(255, 255, 255, 0.05))",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            color: "var(--text-primary)",
            padding: "6px 8px",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: "var(--font-cairo)",
            outline: "none",
          }}
        >
          <option
            value=""
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            كل الأجواء ✨
          </option>
          <option
            value="quiet_place"
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            🤫 أماكن هادئة
          </option>
          <option
            value="kids_friendly"
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            🧸 مخصصة للأطفال
          </option>
          <option
            value="family_friendly"
            style={{
              background: "var(--bg-secondary, #fff)",
              color: "var(--text-primary, #000)",
            }}
          >
            💑 عائلية وكابلز
          </option>
        </select>
      </div>
    </div>
  );
}
