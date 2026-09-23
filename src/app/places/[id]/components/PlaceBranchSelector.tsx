"use client";

import React from "react";
import { PlaceBranchSelectorProps } from "../types";

export default function PlaceBranchSelector({
  branches,
  selectedBranchId,
  onSelectBranch,
}: PlaceBranchSelectorProps) {
  if (!branches || branches.length <= 1) return null;

  return (
    <div style={{ marginBottom: "24px", paddingTop: "20px" }}>
      <h4
        style={{
          fontSize: "1rem",
          marginBottom: "12px",
          color: "var(--text-secondary)",
          fontWeight: "bold",
        }}
      >
        اختر الفرع:
      </h4>
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        className="hide-scrollbar"
      >
        {branches.map((b) => {
          const isSelected = b.id === selectedBranchId;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBranch(b.id)}
              style={{
                background: isSelected
                  ? "var(--color-secondary)"
                  : "rgba(120,120,120,0.1)",
                color: isSelected ? "#fff" : "var(--text-primary)",
                border: isSelected ? "none" : "1px solid var(--border-glass)",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "0.95rem",
                fontWeight: isSelected ? "bold" : "normal",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {b.isMain && <span style={{ fontSize: "0.8rem" }}>⭐</span>}
              {b.name} {b.city ? `- ${b.city}` : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
