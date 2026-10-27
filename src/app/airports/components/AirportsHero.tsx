"use client";

import React, { useRef } from "react";
import Link from "next/link";
import styles from "../airports.module.css";
import { gsap, useGSAP } from "@/lib/gsap";

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
  const heroContentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (heroContentRef.current) {
      const title = heroContentRef.current.querySelector(`.${styles.heroTitle}`);
      const subtitle = heroContentRef.current.querySelector(`.${styles.heroSubtitle}`);
      const stats = heroContentRef.current.querySelectorAll(`.${styles.statBadge}`);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (title) tl.from(title, { autoAlpha: 0, y: 20, duration: 0.55 });
      if (subtitle) tl.from(subtitle, { autoAlpha: 0, y: 15, duration: 0.5 }, "-=0.3");
      if (stats.length > 0) {
        tl.from(stats, {
          autoAlpha: 0,
          y: 12,
          scale: 0.95,
          stagger: 0.08,
          duration: 0.45,
          clearProps: "transform,opacity,visibility",
        }, "-=0.25");
      }
    }
  }, []);

  return (
    <div className={styles.heroBanner}>
      {/* Back Button */}
      <Link href="/" className={styles.backBtnCircle} aria-label="الرجوع للرئيسية">
        <i className="bx bx-right-arrow-alt" />
      </Link>

      <div ref={heroContentRef} className={styles.heroContent}>
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
