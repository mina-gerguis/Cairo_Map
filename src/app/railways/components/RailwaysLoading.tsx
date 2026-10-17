import React from "react";
import styles from "../railways.module.css";

export default function RailwaysLoading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.spinner} />
      <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", fontFamily: "var(--font-sub, inherit)" }}>
        جاري تحميل بيانات قطارات سكك حديد مصر...
      </p>
    </div>
  );
}
