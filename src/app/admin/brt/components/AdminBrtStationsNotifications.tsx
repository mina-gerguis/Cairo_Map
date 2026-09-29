"use client";

import React from "react";

interface AdminBrtStationsNotificationsProps {
  error?: string;
  success?: string;
}

export function AdminBrtStationsNotifications({
  error,
  success
}: AdminBrtStationsNotificationsProps) {
  if (!error && !success) return null;

  return (
    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.9rem"
          }}
        >
          <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#34d399",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.9rem"
          }}
        >
          <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
