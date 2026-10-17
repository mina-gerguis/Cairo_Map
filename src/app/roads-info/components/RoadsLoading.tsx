"use client";

import React from "react";
import styles from "../roads-info.module.css";

export function RoadsLoading() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          color: "var(--text-secondary)",
        }}
      >
        <i
          className="bx bx-loader-alt bx-spin"
          style={{ fontSize: "2.5rem", color: "var(--color-primary, #3b82f6)" }}
        />
        <h3 style={{ color: "#fff", fontSize: "1.1rem" }}>جاري تحميل دليل وسرعات الطرق المصرية...</h3>
      </div>
    </div>
  );
}
