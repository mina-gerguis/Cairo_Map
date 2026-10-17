"use client";

import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { PlaceTitleSectionProps } from "../types";

export default function PlaceTitleSection({
  place,
  displayBranch,
  currentDistance,
}: PlaceTitleSectionProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h1
        style={{
          fontFamily: "var(--font-cairo)",
          fontSize: "1.8rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          margin: "0 0 6px",
        }}
      >
        {place.name}
      </h1>
      {place.name_en && (
        <div
          style={{
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            fontWeight: "600",
            margin: "0 0 8px",
            direction: "ltr",
          }}
        >
          {place.name_en}
        </div>
      )}
      {place.shortDescription && (
        <p
          style={{
            fontSize: ".9rem",
            color: "var(--text-secondary)",
            fontWeight: "500",
            margin: "0 0 10px",
          }}
        >
          {place.shortDescription}
        </p>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        <span>
          <FaMapMarkerAlt /> {displayBranch.city} / {displayBranch.governorate}
        </span>
        {currentDistance !== null && (
          <>
            <span>•</span>
            <span style={{ color: "var(--colorSuccess)", fontWeight: "600" }}>
              تبعد{" "}
              {currentDistance < 1
                ? `${Math.round(currentDistance * 1000)} متر`
                : `${currentDistance.toFixed(1)} كم`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
