import React from "react";
import { FavoritesLockStateProps } from "../types";
import { ICONS_3D } from "../constants";
import styles from "../favorites.module.css";

export default function FavoritesLockState({ onLogin }: FavoritesLockStateProps) {
  return (
    <div className={styles.lockContainer}>
      {/* Blurred decorative skeleton cards */}
      <div className={styles.blurredSkeleton} aria-hidden="true">
        <div className={styles.skeletonTabs}>
          <div className={styles.skeletonTab1} />
          <div className={styles.skeletonTab2} />
          <div className={styles.skeletonTab3} />
        </div>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`glass-card ${styles.skeletonCard}`} />
          ))}
        </div>
      </div>

      {/* Lock CTA Card Overlay */}
      <div className={styles.lockOverlay}>
        <div className={`glass-panel ${styles.lockCard}`}>
          <div className={styles.lockIconWrapper}>
            <img
              src={ICONS_3D.PADLOCK}
              width="64"
              height="64"
              alt="قفل الأمان"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h2 className={styles.lockTitle}>سجل الدخول أولاً</h2>
          <p className={`sub-title ${styles.lockDesc}`}>
            يجب عليك تسجيل الدخول لتتمكن من رؤية الأماكن المفضلة لديك وإدارتها.
          </p>
          <div className={styles.lockActions}>
            <button
              type="button"
              onClick={onLogin}
              className={`btn btn-primary sub-title ${styles.loginBtn}`}
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
