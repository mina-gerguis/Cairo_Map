import React, { RefObject } from "react";
import styles from "../railways.module.css";

interface RailwaysHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  routesCount: number;
  stationsCount: number;
}

export default function RailwaysHero({
  headerRef,
  routesCount,
  stationsCount,
}: RailwaysHeroProps) {
  return (
    <div ref={headerRef} className={styles.heroSection}>
      <h1 className={styles.heroTitle}>
        <img
          src="/images/icons2d/Cairo_train.png"
          alt="Cairo Train"
          loading="lazy"
          decoding="async"
          style={{ width: "42px", height: "42px", objectFit: "contain" }}
        />
        <span className={styles.heroTitleGradient}>سكك حديد مصر</span>
      </h1>

      <p className={styles.heroSubtitle}>
        استكشف شبكة قطارات سكك حديد مصر، اعرف أسعار التذاكر وفئات القطارات، ومسارات الرحلات والمدد الزمنية للخطوط ومحطات التوقف.
      </p>

      <div className={styles.heroStatsRow}>
        <div className={styles.statBadge}>
          <i className="fa-solid fa-route" style={{ color: "#3b82f6" }} />
          <span>{routesCount} خطوط رئيسية</span>
        </div>
        <div className={styles.statBadge}>
          <i className="fa-solid fa-map-pin" style={{ color: "#10b981" }} />
          <span>{stationsCount} محطة توقف</span>
        </div>
        <div className={styles.statBadge}>
          <i className="fa-solid fa-train-subway" style={{ color: "#f59e0b" }} />
          <span>تالجو • VIP • مكيف • روسي</span>
        </div>
      </div>
    </div>
  );
}
