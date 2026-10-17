"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  const [imgSrc, setImgSrc] = useState(src);

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
            zIndex: 1,
          }}
        />
      )}
      <Image
        src={imgSrc}
        alt={alt || "صورة المكان"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: (style?.objectFit as any) || "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setImgSrc("https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80");
          setLoaded(true);
          if (onError) onError(e);
        }}
      />
    </div>
  );
}
