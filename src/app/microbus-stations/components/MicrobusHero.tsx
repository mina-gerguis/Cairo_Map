import React, { RefObject } from "react";
import styles from "../microbus.module.css";

interface MicrobusHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  stationsCount: number;
  linesCount: number;
}

export default function MicrobusHero({
  headerRef,
  stationsCount,
  linesCount,
}: MicrobusHeroProps) {
  return (
    <div ref={headerRef} className={styles.heroSection}>
      <h1 className={styles.heroTitle}>
        <img
          src="/images/icons2d/microbus.png"
          alt="Cairo Microbus"
          loading="lazy"
          decoding="async"
          className="h-auto"
          style={{ width: "60px", height: "42px", objectFit: "contain" }}
        />
        <span className={styles.heroTitleGradient}>مواقف الميكروباص</span>
      </h1>

      <p className={styles.heroSubtitle}>
        استكشف خطوط السير والتعرفة الرسمية التقريبية ونقاط الانطلاق في القاهرة والجيزة بدقة وسهولة.
      </p>

      <div className={styles.heroStatsRow}>
        <div className="tab">
          <i className="bx bx-buildings" style={{ color: "#3b82f6" }} />
          <span>{stationsCount} موقف</span>
        </div>
        <div className="tab">
          <i className="bx bx-route" style={{ color: "#10b981" }} />
          <span>{linesCount} خط سير</span>
        </div>
      </div>
    </div>
  );
}
