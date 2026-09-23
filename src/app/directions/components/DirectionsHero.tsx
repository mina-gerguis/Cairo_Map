import React, { RefObject } from "react";
import styles from "../page.module.css";

interface DirectionsHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  popularRoutesCount?: number;
}

export default function DirectionsHero({
  headerRef,
  popularRoutesCount = 0,
}: DirectionsHeroProps) {
  return (
    <div ref={headerRef} className={styles.heroSection}>
      <div className={styles.livePill}>
        <span className={styles.liveDot} />
        <span>دليل السفر والانتقال الذكي</span>
      </div>

      <h1 className={styles.heroTitle}>
        <img
          src="/images/icons2d/arab_republic _of_egypt.png"
          alt="Egypt"
          loading="lazy"
          decoding="async"
          style={{ width: "42px", height: "auto", objectFit: "contain" }}
        />
        <span className={styles.heroTitleGradient}>ازاي اروح ..؟</span>
      </h1>

      <p className={styles.heroSubtitle}>
        دليل السفر والانتقال الذكي لمختلف وسائل المواصلات بالقاهرة والمحافظات. ابحث عن أي مكان وسنوجهك لأفضل طريق وأقل تكلفة بدقة.
      </p>

      <div className={styles.heroStatsRow}>
        <div className="tab">
          <i className="bx bx-compass" style={{ marginLeft: "4px", color: "var(--color-secondary)" }} />
          <span>مسارات ذكية ومباشرة</span>
        </div>
        <div className="tab">
          <i className="bx bx-bus" style={{ marginLeft: "4px", color: "#10b981" }} />
          <span>ميكروباص • مترو • أتوبيسات</span>
        </div>
        {popularRoutesCount > 0 && (
          <div className="tab">
            <i className="bx bx-trending-up" style={{ marginLeft: "4px", color: "#f59e0b" }} />
            <span>{popularRoutesCount} مسار شائع</span>
          </div>
        )}
      </div>
    </div>
  );
}
