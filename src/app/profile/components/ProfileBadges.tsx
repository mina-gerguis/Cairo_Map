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
  return (
    <div
      className={`glass-panel ${styles.userBadgesContainer}`}
      style={{
        justifyContent: "center",
        marginBottom: "24px",
        marginTop: "8px",
        fontFamily: "var(--font-heading)",
      }}
    >
      {/* Points Badge */}
      <div
        className={`sub-title ${styles.badgePill} ${styles.badgePoints}`}
        title="النقاط"
        onClick={(e) => {
          if (!isOwnProfile) return;
          e.stopPropagation();
          onOpenPointsModal();
        }}
        style={{ cursor: isOwnProfile ? "pointer" : "default" }}
      >
        <i className="bx bxs-coin"></i>
        <span>{formatNumber(profile?.points ?? 0)} نقطة</span>
      </div>

      {/* Primary Wallet Balance Badge */}
      <div
        className={`sub-title ${styles.badgePill} ${styles.badgeWallet}`}
        title="الرصيد الأساسي"
        onClick={(e) => {
          if (!isOwnProfile) return;
          e.stopPropagation();
          onOpenWalletModal();
        }}
        style={{ cursor: isOwnProfile ? "pointer" : "default" }}
      >
        <i className="bx bxs-wallet"></i>
        <span>{formatNumber(profile?.balance ?? 0, 2)} ج.م</span>
      </div>

      {/* Promo Balance Badge */}
      <div
        className={`sub-title ${styles.badgePill} ${styles.badgePromo}`}
        title="الرصيد الترويجي"
      >
        <i className="bx bxs-gift"></i>
        <span>{formatNumber(profile?.promo_balance ?? 0, 2)} ترويجي</span>
      </div>
    </div>
  );
};
