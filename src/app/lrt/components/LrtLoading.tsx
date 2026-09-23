import React from "react";

export default function LrtLoading({ message = "جاري تحميل البيانات..." }: { message?: string }) {
  return (
    <div
      className="app-container"
      style={{
        maxWidth: "800px",
        paddingTop: "100px",
        textAlign: "center",
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          border: "4px solid var(--border-glass)",
          borderTop: "4px solid var(--color-secondary, #06b6d4)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px",
        }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>{message}</p>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `,
        }}
      />
    </div>
  );
}
