import React from "react";
import { FavoritesHeaderProps } from "../types";
import styles from "../favorites.module.css";

export default function FavoritesHeader({
  onBack,
  title = "الأماكن المفضلة",
}: FavoritesHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            onClick={onBack}
            className={styles.backBtn}
            aria-label="الرجوع"
          >
            <i className={`bx bx-chevron-right ${styles.backIcon}`} />
          </button>
          <h1 className={styles.headerTitle}>{title}</h1>
        </div>
      </div>
    </header>
  );
}
