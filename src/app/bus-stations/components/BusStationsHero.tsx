import React from "react";
import Link from "next/link";
import styles from "../bus-stations.module.css";

interface BusStationsHeroProps {
  stationsCount: number;
  companiesCount: number;
  destinationsCount: number;
}

export default function BusStationsHero({
  stationsCount,
  companiesCount,
  destinationsCount
}: BusStationsHeroProps) {
  return (
    <div className={styles.heroBanner}>
      {/* Back Button */}
      <Link href="/" className={styles.backBtnCircle} aria-label="الرجوع للرئيسية">
        <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
      </Link>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          <img
            src="/images/icons2d/bus.png"
            alt="Cairo Bus"
            loading="lazy"
            decoding="async"
            className={styles.heroIcon}
          />
          <span>مواقف الأتوبيسات</span>
        </h1>

        <p className={styles.heroSubtitle}>
          دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى ومواعيد وشركات النقل.
        </p>

        {stationsCount > 0 && (
          <div className={styles.heroStatsRow}>
            <div className={styles.statBadge}>
              <i className="bx bx-map-pin" style={{ color: "var(--color-secondary)" }} />
              <span>{stationsCount} مواقف رئيسية</span>
            </div>
            {companiesCount > 0 && (
              <div className={styles.statBadge}>
                <i className="bx bxs-bus" style={{ color: "#10b981" }} />
                <span>{companiesCount} شركات سفر</span>
              </div>
            )}
            {destinationsCount > 0 && (
              <div className={styles.statBadge}>
                <i className="bx bx-compass" style={{ color: "#f59e0b" }} />
                <span>{destinationsCount}+ وجهة سفر</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
