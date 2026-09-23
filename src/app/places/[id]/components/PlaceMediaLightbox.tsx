"use client";

import React from "react";
import { PlaceMediaLightboxProps } from "../types";

export default function PlaceMediaLightbox({
  images,
  activeIndex,
  onClose,
  onNext,
  onPrev,
}: PlaceMediaLightboxProps) {
  if (activeIndex === null || !images || images.length === 0) return null;

  const currentImage = images[activeIndex];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "rgba(255,255,255,0.2)",
          color: "#fff",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          fontSize: "1.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 10001,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <i className="bx bx-x"></i>
      </button>

      {/* Prev / Next (Right chevron in RTL) */}
      {images.length > 1 && (
        <button
          style={{
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            fontSize: "1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10001,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <i className="bx bx-chevron-right"></i>
        </button>
      )}

      {/* Main preview image */}
      <img
        src={currentImage}
        alt="ميديا مكبرة"
        loading="lazy"
        decoding="async"
        style={{
          maxWidth: "90%",
          maxHeight: "80vh",
          objectFit: "contain",
          borderRadius: "12px",
        }}
        onClick={(e) => e.stopPropagation()}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
        }}
      />

      {/* Left chevron in RTL */}
      {images.length > 1 && (
        <button
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            fontSize: "1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10001,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <i className="bx bx-chevron-left"></i>
        </button>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
