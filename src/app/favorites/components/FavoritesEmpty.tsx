import React from "react";
import { FavoritesEmptyProps } from "../types";
import { ICONS_3D } from "../constants";
import styles from "../favorites.module.css";

export default function FavoritesEmpty({
  title = "لا يوجد أماكن مفضلة",
  description = "لم تقم بإضافة أي أماكن للمفضلة بعد.",
}: FavoritesEmptyProps) {
  return (
    <div className={styles.emptyState}>
      <img
        src={ICONS_3D.BROKEN_HEART}
        width="64"
        height="64"
        alt="لا توجد عناصر بالمفضلة"
        className={styles.emptyIcon}
        loading="lazy"
        decoding="async"
      />
      <p className={`sub-title ${styles.emptyTitle}`}>{title}</p>
      <p className={`sub-title ${styles.emptyDesc}`}>{description}</p>
    </div>
  );
}
