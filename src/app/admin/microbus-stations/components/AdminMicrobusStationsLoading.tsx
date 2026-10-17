"use client";

import React from "react";
import styles from "../../admin.module.css";

export function AdminMicrobusStationsLoading() {
  return (
    <div
      className={styles.adminShell}
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid rgba(255,255,255,0.05)",
          borderTopColor: "var(--color-secondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
        جاري تحميل إدارة مواقف السرفيس...
      </p>
    </div>
  );
}
