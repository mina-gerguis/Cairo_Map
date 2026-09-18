import React from "react";

export function AdminDirectionsLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        gap: "16px"
      }}
    >
      <i
        className="bx bx-loader-alt"
        style={{
          fontSize: "2.5rem",
          color: "#3b82f6",
          animation: "spin 1s linear infinite"
        }}
      />
      <p style={{ color: "#94a3b8", fontWeight: "600" }}>
        جاري تحميل لوحة إدارة المسارات والطرق...
      </p>
    </div>
  );
}
