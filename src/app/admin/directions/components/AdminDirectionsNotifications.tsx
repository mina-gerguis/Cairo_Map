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
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "14px 18px",
            borderRadius: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px"
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
            color: "#34d399",
            padding: "14px 18px",
            borderRadius: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
          <span>{success}</span>
        </div>
      )}
    </>
  );
}
