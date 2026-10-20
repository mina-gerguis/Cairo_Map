import React from "react";
import { FavoritesHeaderProps } from "../types";
import styles from "../favorites.module.css";
import { ChevronRight } from "lucide-react";

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
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h1 className={styles.headerTitle}>{title}</h1>
        </div>
      </div>
    </header>
  );
}
