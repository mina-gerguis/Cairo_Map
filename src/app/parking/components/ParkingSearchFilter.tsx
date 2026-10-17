"use client";

import React from "react";
import { ParkingSearchFilterProps } from "../types";

export function ParkingSearchFilter({
  searchTerm,
  onSearchTermChange,
  selectedArea,
  onSelectedAreaChange,
  areas,
}: ParkingSearchFilterProps) {
  return (
    <div
      className="metro-animate-slide-up metro-delay-200"
      style={{
        backgroundColor: "var(--bgPrimary)",
        border: "1px solid var(--border-glass)",
        borderRadius: "15px",
        padding: "20px",
        marginTop: "24px",
        boxShadow: "var(--shadow-sm)",
        position: "relative",
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Search Input */}
        <div style={{ position: "relative" }}>
          <i
            className="bx bx-search"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              fontSize: "1.2rem",
            }}
          ></i>
          <input
            type="text"
            placeholder="ابحث باسم الجراج أو الشارع أو أقرب محطة مترو..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 40px 10px 12px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              fontFamily: "var(--font-cairo)",
              outline: "none",
            }}
          />
        </div>

        {/* Area Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
            }}
          >
            تصفية حسب المنطقة:
          </label>
          <select
            value={selectedArea}
            onChange={(e) => onSelectedAreaChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              fontFamily: "var(--font-cairo)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option
              value="all"
              style={{
                backgroundColor: "var(--bgPrimary)",
                color: "var(--text-primary)",
              }}
            >
              جميع المناطق
            </option>
            {areas
              .filter((a) => a !== "all")
              .map((area) => (
                <option
                  key={area}
                  value={area}
                  style={{
                    backgroundColor: "var(--bgPrimary)",
                    color: "var(--text-primary)",
                  }}
                >
                  {area}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}
