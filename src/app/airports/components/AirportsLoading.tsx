import React from "react";
import styles from "../airports.module.css";

export default function AirportsLoading() {
  return (
    <div className={styles.authLoadingScreen}>
      <div className={styles.authLoadingSpinner} />
      <p className={styles.authLoadingText}>جاري التحقق من التفاصيل ...</p>
    </div>
  );
}
