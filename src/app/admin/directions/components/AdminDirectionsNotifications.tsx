import React from "react";

interface AdminDirectionsNotificationsProps {
  error?: string;
  success?: string;
}

export function AdminDirectionsNotifications({
  error,
  success
}: AdminDirectionsNotificationsProps) {
  return (
    <>
      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10b981",
            fontWeight: "600"
          }}
        >
          <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
            fontWeight: "600"
          }}
        >
          <i className="bx bx-error" style={{ fontSize: "1.3rem" }} />
          <span style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{error}</span>
        </div>
      )}
    </>
  );
}
