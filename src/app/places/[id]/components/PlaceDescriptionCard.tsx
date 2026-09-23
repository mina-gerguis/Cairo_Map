"use client";

import React from "react";
import { PlaceDescriptionCardProps } from "../types";

export default function PlaceDescriptionCard({
  description,
}: PlaceDescriptionCardProps) {
  if (!description) return null;

  return (
    <div
      style={{
        background: "rgba(120, 120, 120, 0.03)",
        border: "1px solid var(--border-glass)",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "24px",
      }}
    >
      <h4
        style={{
          fontSize: "1.05rem",
          fontWeight: "700",
          marginBottom: "8px",
          color: "var(--text-primary)",
        }}
      >
        نبذة عن المكان
      </h4>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          lineHeight: "1.8",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}
