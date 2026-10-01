"use client";

import React from "react";
import styles from "../reports.module.css";

interface IncomingReportsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function IncomingReportsHeader({ loading, onRefresh }: IncomingReportsHeaderProps) {
  return (
    <div className={styles.headerWrapper}>
      <div className={styles.headerLeft}>
        <div className={styles.headerIcon}>
          <i className="bx bx-inbox"></i>
        </div>
        <div>
          <h1 className={styles.headerTitle}>
            البلاغات والاقتراحات الواردة
          </h1>
          <p className={styles.headerSubtitle}>
            مركز إدارة البلاغات الموحد: بلاغات الأماكن، التواصل، المترو، السرفيس، الدليل وملاحظات المستخدمين.
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className={styles.refreshBtn}
      >
        <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`} style={{ fontSize: "1.15rem" }}></i>
        <span>تحديث البيانات</span>
      </button>
    </div>
  );
}

