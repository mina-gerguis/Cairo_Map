import React from "react";
import { MonorailOverviewPanelProps } from "../types";
import styles from "../monorail.module.css";

export default function MonorailOverviewPanel({
  panelRef,
}: MonorailOverviewPanelProps) {
  return (
    <div ref={panelRef} className={styles.stationCard}>
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h2 className={styles.stationName}>عن مشروع مونوريل القاهرة الكبرى</h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted, #71717a)" }}>
              أطول شبكة مونوريل بدون سائق في العالم بطول إجمالي يقارب 100 كم لخطيه
            </p>
          </div>
        </div>
      </div>

      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.86rem",
          lineHeight: "1.7",
          margin: 0,
        }}
      >
        يعد مونوريل القاهرة نقلة نوعية في منظومة النقل الجماعي الأخضر النظيف في مصر، حيث يربط العاصمة الإدارية الجديدة والقاهرة الجديدة ومدينة السادس من أكتوبر ومحافظة الجيزة والقاهرة عبر قطارات Alstom Innovia 300 المعلقة، لنقل ما يقارب 500 ألف راكب يومياً.
      </p>

      <div className={styles.overviewGrid}>
        <div className={styles.overviewFeatureTile}>
          <div
            style={{
              fontWeight: "800",
              color: "#3b82f6",
              fontSize: "0.88rem",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>⚡</span>
            <span>سرعة تشغيلية عالية</span>
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            تصل سرعة القطارات التصميمية إلى 90 كم/س بسرعة تجارية 80 كم/س لاختصار أزمنة الرحلات وتفادي الزحام المروري السطحي.
          </div>
        </div>

        <div className={styles.overviewFeatureTile}>
          <div
            style={{
              fontWeight: "800",
              color: "#10b981",
              fontSize: "0.88rem",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🌿</span>
            <span>طاقة كهربائية صديقة للبيئة</span>
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            يعمل كلياً بالطاقة الكهربائية النظيفة بدون انبعاثات كربونية مع مكابح ذاتية لتوليد الطاقة وتقليل التلوث السمعي والبصري.
          </div>
        </div>

        <div className={styles.overviewFeatureTile}>
          <div
            style={{
              fontWeight: "800",
              color: "#a855f7",
              fontSize: "0.88rem",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🤖</span>
            <span>تحكم آلي ذكي (بدون سائق)</span>
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            أنظمة مسار متكاملة بأعلى معايير الأمان والسلامة العالمية GoA4 لإدارة التقاطر ومراقبة السرعات وأبواب الأرصفة إلكترونياً.
          </div>
        </div>

        <div className={styles.overviewFeatureTile}>
          <div
            style={{
              fontWeight: "800",
              color: "#f59e0b",
              fontSize: "0.88rem",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🔀</span>
            <span>ربط متكامل مع شبكة النقل</span>
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            محطات تبادلية مباشرة مع الخط الثالث للمترو في (الاستاد، وادي النيل)، والقطار الخفيف LRT في (الفنون والثقافة)، والأتوبيس الترددي BRT.
          </div>
        </div>
      </div>
    </div>
  );
}
