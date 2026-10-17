"use client";

import React from "react";

interface AdminMicrobusStationsNotificationsProps {
  error?: string;
  success?: string;
}

export function AdminMicrobusStationsNotifications({
  error,
  success
}: AdminMicrobusStationsNotificationsProps) {
  if (!error && !success) return null;

  return (
    <>
      {success && (
        <div
          role="status"
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "12px 16px",
            borderRadius: "10px",
            color: "#10b981",
            marginBottom: "16px",
            fontSize: "0.9rem"
          }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "12px 16px",
            borderRadius: "10px",
            color: "#ef4444",
            marginBottom: "16px",
            fontSize: "0.9rem"
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}
