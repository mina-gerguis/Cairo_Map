"use client";

import React from "react";

interface IncomingReportsToastProps {
  toast: { type: "success" | "error"; text: string } | null;
}

export function IncomingReportsToast({ toast }: IncomingReportsToastProps) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 99999,
        backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        fontWeight: "700",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "metro-animate-slide-up 0.3s ease",
      }}
    >
      <i
        className={toast.type === "success" ? "bx bx-check-circle" : "bx bx-error"}
        style={{ fontSize: "1.2rem" }}
      ></i>
      {toast.text}
    </div>
  );
}
