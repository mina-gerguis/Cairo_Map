"use client";

import React, { useState } from "react";
import { ImageWithSkeletonProps } from "../types";

export default function ImageWithSkeleton({
  src,
  alt,
  style,
  className,
  onClick,
  onError,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{ position: "relative", ...style, overflow: "hidden" }}
      className={className}
      onClick={onClick}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--bg-glass-card, rgba(255, 255, 255, 0.05))",
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: style?.objectFit || "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setLoaded(true);
          if (onError) onError(e);
        }}
      />
    </div>
  );
}
