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
            src="/images/brand/qareeb_nobg_light.webp"
            alt="Cairo Map"
            className={styles.brandLogo}
          />
        </div>
        <span className="fs-md fw-bold">قريب ماب</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="fs-3xl fw-bold font-display">{title}</h1>
      <p className="fs-sm fw-medium font-sub text-muted">{subtitle}</p>
    </div>
  );
};
