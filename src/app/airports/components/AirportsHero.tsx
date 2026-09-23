import React from "react";
import Link from "next/link";
import styles from "../airports.module.css";

interface AirportsHeroProps {
  totalAirports: number;
  internationalCount?: number;
}

export default function AirportsHero({
  totalAirports,
  internationalCount
}: AirportsHeroProps) {
  return (
    <div className={styles.heroBanner}>
      {/* Back Button Circle */}
      <Link href="/" className={styles.backBtnCircle} aria-label="الرجوع للرئيسية">
        <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
      </Link>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          <img
            src="/images/icons2d/airport.png"
            alt="Cairo Airports"
            loading="lazy"
            decoding="async"
            className={styles.heroIcon}
          />
          <span>دليل المطارات المصرية</span>
        </h1>

        <p className={styles.heroSubtitle}>
          دليلك الشامل للمطارات الدولية والمحلية في مصر. ابحث عن معلومات الصالات، شركات الطيران المتاحة، أرقام الهواتف، والخدمات والوصول المباشر.
        </p>

        {/* Badges row */}
        <div className={styles.heroStatsRow}>
          <div className={`${styles.statBadge} ${styles.statBadgeHighlight}`}>
            <span>مطارات مصر ({totalAirports}) ✈️</span>
          </div>
          {internationalCount !== undefined && internationalCount > 0 && (
            <div className={styles.statBadge}>
              <i className="bx bx-globe" style={{ color: "var(--color-secondary)" }} />
              <span>{internationalCount} مطار دولي</span>
            </div>
          )}
          <div className={styles.statBadge}>
            <i className="bx bx-check-shield" style={{ color: "#10b981" }} />
            <span>الصالات والخدمات المتاحة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
