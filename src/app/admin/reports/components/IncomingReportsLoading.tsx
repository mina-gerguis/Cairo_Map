"use client";

import React from "react";

export function IncomingReportsLoading() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--text-secondary)" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--border-glass)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px",
        }}
      />
      <span style={{ fontSize: "0.92rem", fontWeight: "600" }}>جاري تحميل كافة البلاغات والاقتراحات الواردة...</span>
    </div>
  );
}
