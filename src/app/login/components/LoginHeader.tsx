import React from "react";
import { LoginHeaderProps } from "../types";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

export const LoginHeader: React.FC<LoginHeaderProps> = ({
  title = LOGIN_TEXTS.TITLE,
  subtitle = LOGIN_TEXTS.SUBTITLE,
}) => {
  return (
    <div className={styles.header}>
      {/* Platform Logo */}
      <div className={styles.logoWrapper}>
        <img
          src="/images/logo/darkMode_logo.png"
          alt="ماب القاهرة"
          className={styles.logoImgDark}
        />
        <img
          src="/images/logo/lightMode_logo.png"
          alt="ماب القاهرة"
          className={styles.logoImgLight}
        />
      </div>

      {/* Main Title & Subtitle */}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
};
