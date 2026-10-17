import React, { RefObject } from "react";
import styles from "../propose-place.module.css";

interface ProposePlaceHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  isEditMode: boolean;
  proposalsCount: number;
}

export default function ProposePlaceHero({
  headerRef,
  isEditMode,
  proposalsCount,
}: ProposePlaceHeroProps) {
  return (
    <div ref={headerRef} className={styles.heroSection}>
      {/* Live Badge */}
      <div className={styles.livePill}>
        <span className={styles.liveDot} />
        <i className={isEditMode ? "bx bx-edit-alt" : "bx bx-map-pin"} style={{ fontSize: "1rem" }} />
        <span>{isEditMode ? "تعديل وإعادة إرسال مكان" : "اقتراح مكان جديد"}</span>
      </div>

      {/* Main Title */}
      <h1 className={styles.heroTitle}>
        <i
          className="bx bxs-store-alt"
          style={{
            fontSize: "clamp(2rem, 5vw, 2.7rem)",
            color: "var(--color-primary, #6c63ff)",
          }}
        />
        <span className={styles.heroTitleGradient}>
          {isEditMode ? "تعديل بيانات المكان المقترح" : "ساهم في إضافة مكان جديد"}
        </span>
      </h1>

      {/* Subtitle */}
      <p className={styles.heroSubtitle}>
        يمكنك اقتراح أي مكان متميز (مطعم، كافيه، حديقة، صيدلية، الخ). سيقوم فريق الإدارة بمراجعة التفاصيل ونشره فور الاعتماد!
      </p>

      {/* Quick Stats / Info Row */}
      <div className={styles.heroStatsRow}>
        <div className={styles.statBadge}>
          <i className="bx bx-check-shield" style={{ color: "#10b981" }} />
          <span>مراجعة واعتماد رسمي</span>
        </div>
        <div className={styles.statBadge}>
          <i className="bx bx-gift" style={{ color: "#f59e0b" }} />
          <span>نقاط ومكافآت مجتمعية</span>
        </div>
        {proposalsCount > 0 && (
          <div className={styles.statBadge}>
            <i className="bx bx-bookmark-alt" style={{ color: "var(--color-primary, #6c63ff)" }} />
            <span>لديك {proposalsCount} مكان مقترح</span>
          </div>
        )}
      </div>
    </div>
  );
}
