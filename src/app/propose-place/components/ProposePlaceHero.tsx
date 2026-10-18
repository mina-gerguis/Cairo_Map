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
      {/* Main Title */}
      <h1 className={styles.heroTitle}>
        <span className={styles.heroTitleGradient}>
          {isEditMode ? "تعديل بيانات المكان المقترح" : "ساهم في إضافة مكان جديد"}
        </span>
      </h1>

      {/* Subtitle */}
      <p className={styles.heroSubtitle}>
        يمكنك اقتراح أي مكان متميز (مطعم، كافيه، حديقة، صيدلية، الخ). سيقوم فريق الإدارة بمراجعة التفاصيل ونشره فور الاعتماد!
      </p>
    </div>
  );
}
