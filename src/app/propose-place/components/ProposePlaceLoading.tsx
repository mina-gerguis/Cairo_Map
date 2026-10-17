import React from "react";
import styles from "../propose-place.module.css";

export default function ProposePlaceLoading() {
  return (
    <div
      className={styles.pageWrapper}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "75vh",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          border: "3px solid rgba(255, 255, 255, 0.08)",
          borderTopColor: "var(--color-primary, #6c63ff)",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
          marginBottom: "18px",
        }}
      />
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "1rem",
          fontFamily: "var(--font-sub, var(--font-almarai, sans-serif))",
        }}
      >
        جاري تحميل نموذج اقتراح المكان...
      </p>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
        }}
      />
    </div>
  );
}
