"use client";

import React from "react";
import { PlaceReviewsSummaryProps } from "../types";

export function PlaceReviewsSummary({ place }: PlaceReviewsSummaryProps) {
  const roundedRating = Math.min(5, Math.max(0, Math.round(place.rating || 0)));
  const formattedScore = Number(place.rating || 0).toFixed(1);

  return (
    <div
      className="glass-panel"
      style={{
        padding: "24px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "800",
            color: "var(--text-primary)",
          }}
        >
          {place.name}
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            marginTop: "4px",
          }}
        >
          {place.categoryLabel} • {place.city} / {place.governorate}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: "rgba(255, 159, 10, 0.08)",
          padding: "12px 20px",
          borderRadius: "16px",
          border: "1px solid rgba(255, 159, 10, 0.15)",
        }}
      >
        <div style={{ fontSize: "2rem", fontWeight: "900", color: "#ff9f0a" }}>
          {formattedScore}
        </div>
        <div>
          <div style={{ color: "#ff9f0a", fontSize: "1.1rem" }}>
            {"★".repeat(roundedRating) + "☆".repeat(5 - roundedRating)}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginTop: "2px",
            }}
          >
            بناءً على {place.reviewsCount || 0} تقييم
          </div>
        </div>
      </div>
    </div>
  );
}
