"use client";

import React from "react";
import { PlacePhotoGalleryProps } from "../types";

export default function PlacePhotoGallery({
  images,
  placeName,
}: PlacePhotoGalleryProps) {
  if (!images || images.length <= 1) return null;

  return (
    <div style={{ marginBottom: "30px" }}>
      <h4
        style={{
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "14px",
          color: "var(--text-primary)",
        }}
      >
        معرض الصور
      </h4>
      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            style={{
              width: "160px",
              height: "107px",
              borderRadius: "12px",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid var(--border-glass)",
            }}
          >
            <img
              src={imgUrl}
              alt={`${placeName}-${idx}`}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
