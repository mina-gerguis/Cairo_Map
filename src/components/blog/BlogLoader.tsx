import React from "react";
import styles from "./BlogLoader.module.css";

interface BlogLoaderProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  minHeight?: string;
  cardOnly?: boolean;
}

export default function BlogLoader({
  title = "جاري تحميل المقالات...",
  subtitle = "نجهز لك أحدث أدلة التنقل والنصائح الحصرية في القاهرة",
  icon = "bx bx-news",
  minHeight = "75vh",
  cardOnly = false,
}: BlogLoaderProps) {
  const content = (
    <div className={styles.loaderCard}>
      <div className={styles.ambientGlow} />
      
      <div className={styles.spinnerGraphic}>
        <div className={styles.outerRing} />
        <div className={styles.innerPulseRing} />
        <div className={styles.iconBadge}>
          <i className={icon} />
        </div>
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>

      <div className={styles.shimmerTrack}>
        <div className={styles.shimmerBar} />
      </div>
    </div>
  );

  if (cardOnly) {
    return content;
  }

  return (
    <div className={styles.loaderWrapper} style={{ minHeight }}>
      {content}
    </div>
  );
}
