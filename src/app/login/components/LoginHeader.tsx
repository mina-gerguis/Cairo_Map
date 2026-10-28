import React from "react";
import { LoginHeaderProps } from "../types";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

export const LoginHeader: React.FC<LoginHeaderProps> = ({
  title = LOGIN_TEXTS.TITLE,
  subtitle = LOGIN_TEXTS.SUBTITLE,
}) => {
  return (
    <div className={styles.cardHeader}>
      {/* Brand Identity Badge */}
      <div className={styles.brandBadge}>
        <div className={styles.brandIconWrapper}>
          <img
            src="/icons/qareeb.webp"
            alt="Cairo Map"
            className={styles.brandLogo}
          />
        </div>
        <span className={styles.brandTitle}>ماب القاهرة</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className={styles.cardTitle}>{title}</h1>
      <p className={styles.cardDescription}>{subtitle}</p>
    </div>
  );
};
