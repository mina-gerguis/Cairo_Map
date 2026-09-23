import React from "react";

interface BusStationsLoadingProps {
  message?: string;
}

export default function BusStationsLoading({
  message = "جاري التحقق من التفاصيل ..."
}: BusStationsLoadingProps) {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        paddingTop: "120px",
        paddingBottom: "80px",
        textAlign: "center",
        direction: "rtl"
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128, 128, 128, 0.1)",
          borderTop: "4px solid var(--color-secondary, #3b82f6)",
          borderRadius: "50%",
          animation: "busSpin 1s linear infinite",
          margin: "0 auto 24px"
        }}
      />
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "1.05rem",
          fontFamily: "var(--font-heading, var(--font-cairo))"
        }}
      >
        {message}
      </p>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes busSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
        }}
      />
    </div>
  );
}
