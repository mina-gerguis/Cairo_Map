"use client";

import React, { useEffect } from "react";
import { MediaLightboxProps } from "../types";
import ImageWithSkeleton from "./ImageWithSkeleton";

export default function MediaLightbox({
  images,
  activeIndex,
  onClose,
  onChangeIndex,
}: MediaLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        onChangeIndex((activeIndex + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        onChangeIndex((activeIndex - 1 + images.length) % images.length);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length, onChangeIndex, onClose]);

  if (images.length === 0 || activeIndex < 0 || activeIndex >= images.length) {
    return null;
  }

  return (
    <div
      className="ios-sheet-overlay"
      onClick={onClose}
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          background: "rgba(255,255,255,0.15)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.5rem",
          zIndex: 1102,
        }}
        aria-label="إغلاق"
      >
        ✕
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChangeIndex((activeIndex - 1 + images.length) % images.length);
          }}
          style={{
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1101,
          }}
          aria-label="السابق"
        >
          ❯
        </button>
      )}

      <ImageWithSkeleton
        src={images[activeIndex]}
        alt="ميديا"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "80vw",
          maxHeight: "95vh",
          height: "50%",
          borderRadius: "var(--ra-18)",
          objectFit: "fill",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
      />

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChangeIndex((activeIndex + 1) % images.length);
          }}
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1101,
          }}
          aria-label="التالي"
        >
          ❮
        </button>
      )}

      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            color: "#fff",
            background: "rgba(0,0,0,0.5)",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "0.9rem",
          }}
        >
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
