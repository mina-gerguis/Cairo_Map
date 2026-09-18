import React from "react";

export function AdminDirectionsLoading() {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px"
      }}
    >
      <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.5rem", color: "var(--color-primary, #6366f1)" }} />
      <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>
        جاري تحميل إدارة خطوط المواصلات...
      </span>
    </div>
  );
}
