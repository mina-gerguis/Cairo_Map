"use client";

import React from "react";
import { PlaceDetailsHeaderProps } from "../types";
import { CATEGORY_LABELS } from "../constants";

export default function PlaceDetailsHeader({
  place,
  onShare,
  onClose,
}: PlaceDetailsHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border-glass)",
        borderRadius: "14px",
        padding: "10px 16px",
      }}
    >
      {/* Left: Share */}
      <button
        onClick={onShare}
        style={{
          background: "var(--color-secondary)",
          border: "1px solid var(--border-glass)",
          color: "#ffffff",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.1rem",
          transition: "all 0.2s",
        }}
        title="مشاركة المكان"
      >
        <i className="bx bx-share-alt"></i>
      </button>

      {/* Center: Centered Place Name */}
      <div
        style={{
          textAlign: "center",
          flex: 1,
          minWidth: 0,
          padding: "0 10px",
        }}
      >
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: "bold",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "var(--text-primary)",
          }}
        >
          {place.name}
        </h3>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            display: "flex",
            gap: "5px",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span>{place.categoryLabel || CATEGORY_LABELS[place.category]}</span>
          {place.subCategories && place.subCategories.length > 0 && (
            <span>
              {place.subCategories
                .map((sc) => CATEGORY_LABELS[sc] || sc)
                .join(" | ")}
            </span>
          )}
          {place.place_type && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <i
                className="bx bx-folder-open"
                style={{ fontSize: "0.85rem" }}
              ></i>
              {place.place_type}
            </span>
          )}
        </span>
      </div>

      {/* Right: Close X */}
      <button
        onClick={onClose}
        style={{
          background: "rgba(131, 131, 131, 0.14)",
          border: "1px solid var(--border-glass)",
          color: "var(--text-primary)",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.2rem",
          transition: "all 0.2s",
        }}
        title="إغلاق"
      >
        <i className="bx bx-x"></i>
      </button>
    </div>
  );
}
