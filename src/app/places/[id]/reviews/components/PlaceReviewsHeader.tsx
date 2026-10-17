"use client";

import React from "react";
import { PlaceReviewsHeaderProps } from "../types";

export function PlaceReviewsHeader({ onBack }: PlaceReviewsHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      <button
        className="btn"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
        }}
      >
        <i className="bx bx-arrow-back" style={{ fontSize: "1.2rem" }}></i>
        العودة للمكان
      </button>

      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>كل التقييمات</h3>
    </div>
  );
}
