import React from "react";
import { LoginLayoutProps } from "../types";
import styles from "../login.module.css";

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div className={styles.loginLayout}>
      {/* Vertical Dashed Guide Lines (Shadcn Studio signature) */}
      <div className={styles.guideLineLeft} aria-hidden="true" />
      <div className={styles.guideLineRight} aria-hidden="true" />

      {/* Center Dashed Frame with Infinite Top & Bottom Bands */}
      <div className={styles.dashedFrame}>
        {children}
      </div>
    </div>
  );
};
