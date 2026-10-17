import React from "react";
import styles from "../ports.module.css";

export default function PortsLoading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>جاري التحقق من تفاصيل دليل الموانئ...</p>
    </div>
  );
}
