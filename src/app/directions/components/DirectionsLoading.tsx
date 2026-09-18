import React from "react";

export default function DirectionsLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "50px",
        backgroundColor: "var(--bgPrimary)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl"
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--color-secondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px"
        }}
      />
      <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem", fontFamily: "var(--font-sub)" }}>
        جاري التحقق من التفاصيل ...
      </p>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}}
      />
    </div>
  );
}
