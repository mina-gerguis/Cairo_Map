import React from "react";
import { FavoritesLoadingProps } from "../types";
import styles from "../favorites.module.css";

export default function FavoritesLoading({
  message = "جاري تحميل المفضلة...",
}: FavoritesLoadingProps) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner} />
      <p className="sub-title">{message}</p>
    </div>
  );
}
