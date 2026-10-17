"use client";

import React from "react";
import { isCurrentlyOpen } from "@/lib/workingHours";
import { PlaceQuickInfoProps } from "../types";

export default function PlaceQuickInfo({
  displayBranch,
  rating,
  reviewsCount = 0,
  onReviewsClick,
}: PlaceQuickInfoProps) {
  const isOpen = displayBranch.workingHours
    ? isCurrentlyOpen(displayBranch.workingHours)
    : null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.04)",
        borderRadius: "14px",
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      {/* Hours / Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          حالة المكان
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {displayBranch.workingHours ? (
            isOpen ? (
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  color: "#34c759",
                }}
              >
                مفتوح
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  color: "#ff3b30",
                }}
              >
                مغلق
              </span>
            )
          ) : (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              غير محدد
            </span>
          )}
        </div>
      </div>

      {/* Ratings */}
      {rating !== undefined && (
        <div
          onClick={onReviewsClick}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            التقييمات والآراء
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {" "}
              ({reviewsCount})
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: "bold",
                color: "#ff9f0a",
              }}
            >
              {Number(rating).toFixed(1)} ★
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
