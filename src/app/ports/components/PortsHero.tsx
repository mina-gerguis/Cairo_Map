import React, { RefObject } from "react";
import styles from "../ports.module.css";
import { ASSETS } from "@/constants/assets";

interface PortsHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  totalPorts: number;
  mediterraneanCount: number;
  redSeaCount: number;
}

export default function PortsHero({
  headerRef,
  totalPorts,
  mediterraneanCount,
  redSeaCount,
}: PortsHeroProps) {
  return (
    <div ref={headerRef} className={styles.heroSection}>

      <h1 className={styles.heroTitle}>
        <img
          src= { ASSETS.transit.ports }
          alt="جمهورية مصر العربية"
          loading="lazy"
          decoding="async"
          style={{ width: "48px", height: "48px", objectFit: "contain" }}
        />
        <span className={styles.heroTitleGradient}>دليل الموانئ البحرية</span>
      </h1>

      <p className={styles.heroSubtitle}>
        استكشف الموانئ المصرية على البحرين المتوسط والأحمر، تخصصاتها التشغيلية، طاقتها الاستيعابية، أرصفة التداول، وروابط النقل البري والحديدي.
      </p>

      <div className={styles.heroStatsRow}>
        <div className="tab">
          <span>⚓ {totalPorts} موانئ بحرية</span>
        </div>
        <div className="tab">
          <span>🌊 {mediterraneanCount} بالمتوسط</span>
        </div>
        <div className="tab">
          <span>🔴 {redSeaCount} بالأحمر والقناة</span>
        </div>
      </div>
    </div>
  );
}
