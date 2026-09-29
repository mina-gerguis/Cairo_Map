import React from "react";
import styles from "../brt.module.css";

export default function BrtLoading() {
  return (
    <div className={styles.pageWrapper} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        width: "44px",
        height: "44px",
        border: "3px solid rgba(255,255,255,0.08)",
        borderTopColor: "var(--color-primary, #e11d48)",
        borderRadius: "50%",
        animation: "spin 0.9s linear infinite",
        marginBottom: "20px"
      }} />
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem", fontFamily: "var(--font-sub)" }}>جاري تحميل دليل الأتوبيس الترددي BRT...</p>
      <style dangerouslySetInnerHTML={{
        __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
      }} />
    </div>
  );
}
