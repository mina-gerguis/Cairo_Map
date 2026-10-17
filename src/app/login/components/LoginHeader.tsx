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
          src="/images/logo/lightMode_logo.webp"
          alt="ماب القاهرة"
          className="w-32"
        />
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="font-display text-4xl font-black mb-2">{title}</h1>
      <p className="text-muted text-md font-sub">{subtitle}</p>
    </div>
  );
};
