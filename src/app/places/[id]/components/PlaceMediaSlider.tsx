"use client";

import React from "react";
import { PlaceMediaSliderProps } from "../types";

export default function PlaceMediaSlider({
  mediaList,
  onMediaClick,
}: PlaceMediaSliderProps) {
  if (!mediaList || mediaList.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {mediaList.map((mediaUrl, idx) => (
          <div
            key={idx}
            onClick={() => onMediaClick(idx)}
            style={{
              width: "150px",
              height: "160px",
              borderRadius: "18px",
              overflow: "hidden",
              flexShrink: 0,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <img
              src={mediaUrl}
              alt={`ميديا-${idx}`}
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
