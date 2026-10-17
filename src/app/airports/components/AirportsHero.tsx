import React from "react";
import Link from "next/link";
import styles from "../airports.module.css";

interface AirportsHeroProps {
  totalAirports: number;
  internationalCount?: number;
  domesticCount?: number;
}

export default function AirportsHero({
  totalAirports,
  internationalCount,
  domesticCount
}: AirportsHeroProps) {
  return (
    <div className={styles.heroBanner}>
      {/* Back Button */}
      <Link href="/" className={styles.backBtnCircle} aria-label="الرجوع للرئيسية">
        <i className="bx bx-right-arrow-alt" />
      </Link>

      <div className={styles.heroContent}>
        {/* Title */}
        <h1 className={styles.heroTitle}>
          <div className={styles.heroIconWrap}>
            <i className="bx bxs-plane-alt" />
          </div>
          <span>دليل المطارات المصرية</span>
        </h1>

        {/* Subtitle */}
        <p className={styles.heroSubtitle}>
          دليلك الشامل لجميع المطارات الدولية والمحلية في جمهورية مصر العربية. استعرض بيانات الصالات، أرقام الهواتف الرسمية، خطوط الطيران المتاحة، ووسائل الوصول المباشرة.
        </p>

        {/* Badges / Stats Row */}
        <div className={styles.heroStatsRow}>
          <div className={`${styles.statBadge} ${styles.statBadgePrimary}`}>
            <i className="bx bx-buildings" />
            <span>إجمالي المطارات ({totalAirports})</span>
          </div>

          {internationalCount !== undefined && internationalCount > 0 && (
            <div className={`${styles.statBadge} ${styles.statBadgeGold}`}>
              <i className="bx bx-globe" />
              <span>{internationalCount} مطار دولي</span>
            </div>
          )}

          {domesticCount !== undefined && domesticCount > 0 && (
            <div className={styles.statBadge}>
              <i className="bx bx-map-pin" />
              <span>{domesticCount} مطار داخلي وإقليمي</span>
            </div>
          )}

          <div className={`${styles.statBadge} ${styles.statBadgeSuccess}`}>
            <i className="bx bx-check-shield" />
            <span>دليل محدث ومعتمد</span>
          </div>
        </div>
      </div>
    </div>
  );
}
