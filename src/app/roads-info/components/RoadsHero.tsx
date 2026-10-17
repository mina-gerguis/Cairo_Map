"use client";

import React from "react";
import Image from "next/image";
import styles from "../roads-info.module.css";
import { RoadsStats } from "../types";

interface RoadsHeroProps {
  stats: RoadsStats;
}

export function RoadsHero({ stats }: RoadsHeroProps) {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBadge}>
        <i className="bx bx-tachometer" style={{ fontSize: "1.1rem" }} />
        <span>دليل الطرق وسرعات الرادار والمحاور السريعة</span>
      </div>

      <h1 className={styles.heroTitle}>معلومات الطرق والسرعات المقررة</h1>

      <p className={styles.heroSubtitle}>
        استكشف شبكة الطرق والمحاور المصرية، السرعات الرسمية المحددة للرادار لكل نوع مركبة (ملاكي، ميني باص، ميكروباص، ربع نقل، أتوبيس)، الطقس المباشر، وأحدث أخبار المرور والشبورة.
      </p>

      {/* Quick Statistics Banner */}
      <div className={styles.heroStatsGrid}>
        <div className={styles.heroStatCard}>
          <div className={styles.heroStatIcon}>
            <i className="bx bx-git-branch" />
          </div>
          <div>
            <div className={styles.heroStatValue}>{stats.totalRoads} طريق</div>
            <div className={styles.heroStatLabel}>إجمالي المحاور والطرق</div>
          </div>
        </div>

        <div className={styles.heroStatCard}>
          <div className={styles.heroStatIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <i className="bx bx-map-pin" />
          </div>
          <div>
            <div className={styles.heroStatValue}>{stats.totalDistanceKm.toLocaleString("ar-EG")} كم</div>
            <div className={styles.heroStatLabel}>إجمالي أطوال الشبكة</div>
          </div>
        </div>

        <div className={styles.heroStatCard}>
          <div className={styles.heroStatIcon} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
            <i className="bx bx-radar" />
          </div>
          <div>
            <div className={styles.heroStatValue}>رادارات ذكية</div>
            <div className={styles.heroStatLabel}>مراقبة السرعات والمسار</div>
          </div>
        </div>

        <div className={styles.heroStatCard}>
          <div className={styles.heroStatIcon} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
            <i className="bx bx-sun" />
          </div>
          <div>
            <div className={styles.heroStatValue}>طقس حي مباشر</div>
            <div className={styles.heroStatLabel}>تنبيهات الشبورة والأمطار</div>
          </div>
        </div>
      </div>
    </section>
  );
}
