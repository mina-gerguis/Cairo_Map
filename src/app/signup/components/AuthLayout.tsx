import React from "react";
import styles from "../signup.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.authLayout}>
      {/* Soft ambient background accents */}
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />
      <div className={styles.ambientOrb3} />

      <div className={styles.formContainer}>
        {children}
      </div>
    </div>
  );
};
