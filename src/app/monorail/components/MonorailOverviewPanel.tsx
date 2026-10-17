import React from "react";
import { MonorailOverviewPanelProps } from "../types";
import styles from "../monorail.module.css";

export default function MonorailOverviewPanel({
  panelRef,
}: MonorailOverviewPanelProps) {
  return (
    <div ref={panelRef} className={styles.overviewBentoCard}>
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          margin: "0 0 8px",
        }}
      >
        عن مشروع مونوريل القاهرة الكبرى
      </h2>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          lineHeight: "1.7",
          margin: 0,
        }}
      >
        يعد مونوريل القاهرة أطول شبكة مونوريل بدون سائق في العالم بطول إجمالي يقارب
        100 كم لخطيه (شرق وغرب النيل)، حيث ينقل ما يقارب 500 ألف راكب يومياً بوسيلة
        مواصلات حضارية صديقة للبيئة تعمل بقطارات Alstom Innovia 300 فائقة التطور.
      </p>

      <div className={styles.overviewGrid}>
        <div className={styles.overviewFeatureTile}>
          <div
            style={{
              fontWeight: "800",
              color: "#3b82f6",
              fontSize: "0.9rem",
              marginBottom: "4px",
            }}
          >
            ⚡ سرعة تشغيلية عالية
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            سرعة تصميمية تصل إلى 80 كم/ساعة، مما يختصر زمن الرحلة بين نصر والعاصمة
            إلى نحو 60 دقيقة فقط.
          </div>
        </div>

        <div className={styles.overviewFeatureTile}>
          <div
            style={{
              fontWeight: "800",
              color: "#10b981",
              fontSize: "0.9rem",
              marginBottom: "4px",
            }}
          >
            🔄 تكامل ذكي مع المترو والـ LRT
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            محطات تبادلية كبرى في الاستاد ووادي النيل مع الخط الثالث، ومدينة الفنون مع
            القطار الخفيف LRT.
          </div>
        </div>
      </div>
    </div>
  );
}
