"use client";

import React from "react";
import styles from "../../admin.module.css";

export function AdminBrtStationsLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner} />
      <span>جاري تحميل بيانات محطات الأتوبيس الترددي ...</span>
    </div>
  );
}
