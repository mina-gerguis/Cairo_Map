"use client";

import React from "react";
import styles from "../reports.module.css";
import { IncomingReportsStats as StatsType } from "../types";

interface IncomingReportsStatsProps {
  stats: StatsType;
}

export function IncomingReportsStats({ stats }: IncomingReportsStatsProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          <i className="bx bx-collection"></i> إجمالي الوارد
        </span>
        <div className={styles.statCountRow}>
          <span className={styles.statCount} style={{ color: "var(--text-primary)" }}>
            {stats.total}
          </span>
          <span className={styles.statUnit}>بلاغ ورسالة</span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardPending}`}>
        <span className={styles.statLabel} style={{ color: "#f59e0b" }}>
          ⏳ قيد الانتظار والمعالجة
        </span>
        <div className={styles.statCountRow}>
          <span className={styles.statCount} style={{ color: "#f59e0b" }}>
            {stats.pending}
          </span>
          <span className={styles.statUnit} style={{ color: "#f59e0b" }}>
            في انتظار الإجراء
          </span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardPlaces}`}>
        <span className={styles.statLabel} style={{ color: "#ec4899" }}>
          📍 بلاغات الأماكن
        </span>
        <div className={styles.statCountRow}>
          <span className={styles.statCount} style={{ color: "#ec4899" }}>
            {stats.placesCount}
          </span>
          <span className={styles.statUnit} style={{ color: "#ec4899" }}>
            بلاغ وتعديل
          </span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardContacts}`}>
        <span className={styles.statLabel} style={{ color: "#6366f1" }}>
          📩 رسائل التواصل
        </span>
        <div className={styles.statCountRow}>
          <span className={styles.statCount} style={{ color: "#6366f1" }}>
            {stats.contactsCount}
          </span>
          <span className={styles.statUnit} style={{ color: "#6366f1" }}>
            رسالة دعم
          </span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardDone}`}>
        <span className={styles.statLabel} style={{ color: "#10b981" }}>
          ✅ مكتمل ومقبول
        </span>
        <div className={styles.statCountRow}>
          <span className={styles.statCount} style={{ color: "#10b981" }}>
            {stats.actionTaken}
          </span>
          <span className={styles.statUnit} style={{ color: "#10b981" }}>
            تمت معالجته
          </span>
        </div>
      </div>
    </div>
  );
}

