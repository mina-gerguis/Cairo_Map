"use client";

import React from "react";
import { PlaceCoverImageProps } from "../types";

export default function PlaceCoverImage({
  place,
  categoryColor,
  categoryIcon,
  categoryLabel,
}: PlaceCoverImageProps) {
  const coverSrc =
    place.images && place.images[0] ? place.images[0] : "/placeholder.jpg";

  return (
    <div style={{ height: "340px", width: "100%", position: "relative" }}>
      <img
        src={coverSrc}
        alt={place.name}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
        }}
      />
      {/* Category Badge overlay */}
      <span
        style={{
          position: "absolute",
          bottom: "20px",
          right: "24px",
          background: categoryColor,
          color: "#ffffff",
          fontSize: "0.85rem",
          fontWeight: "bold",
          padding: "6px 14px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <i
          className={`bx ${categoryIcon || "bx-category"}`}
          style={{ fontSize: "1rem" }}
        ></i>
        {categoryLabel}
        {place.place_type && ` - ${place.place_type}`}
      </span>
    </div>
  );
}
