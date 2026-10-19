"use client";

import React from "react";
import { UserProfile } from "../types";
import { formatNumber } from "../utils";
import styles from "../page.module.css";

interface ProfileBadgesProps {
  profile: UserProfile | null;
  isOwnProfile: boolean;
  onOpenPointsModal: () => void;
  onOpenWalletModal: () => void;
}

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  profile,
  isOwnProfile,
  onOpenPointsModal,
  onOpenWalletModal,
}) => {
  const balance = profile?.balance ?? 0;
  const formattedBalance =
    balance % 1 === 0 ? balance.toString() : formatNumber(balance, 2);

  const handleClick = (e: React.MouseEvent) => {
    if (!isOwnProfile) return;
    e.stopPropagation();
    onOpenWalletModal();
  };

  return (
    <div
      className={styles.noonBalanceCard}
      onClick={handleClick}
      role="button"
      tabIndex={isOwnProfile ? 0 : -1}
      title="عرض الرصيد والمحفظة والنقاط"
      style={{ cursor: isOwnProfile ? "pointer" : "default" }}
    >
      {/* Right side: Wallet Icon & Title */}
      <div className={styles.noonBalanceRight}>
        <div className={styles.noonBalanceIcon} aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            <rect
              x="2.5"
              y="4.5"
              width="19"
              height="15.5"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M2.5 8.5h19"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <rect
              x="8.5"
              y="11.5"
              width="7"
              height="5.5"
              rx="1.8"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </div>
        <span className={styles.noonBalanceTitle}>رصيد الماب</span>
      </div>

      {/* Left side: Amount Pill Badge */}
      <div className={styles.noonBalancePill}>
        <span className={styles.noonBalanceAmount}>{formattedBalance} ج.م.</span>
        <svg
          className={styles.noonBalanceChevron}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
    </div>
  );
};
