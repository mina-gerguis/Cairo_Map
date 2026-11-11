"use client";

import React from "react";
import { Coins, Sparkles, ChevronLeft, PiggyBank } from "lucide-react";
import { UserProfile } from "../types";
import { formatNumber } from "../utils";
import styles from "../page.module.css";
import { IconTicket } from "@tabler/icons-react";

interface ProfileBadgesProps {
  profile: UserProfile | null;
  isOwnProfile: boolean;
  onOpenPointsModal: () => void;
  onOpenWalletModal: (initialTab?: "main" | "promo") => void;
  promoBalanceOverride?: number;
  mainBalanceOverride?: number;
}

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  profile,
  isOwnProfile,
  onOpenPointsModal,
  onOpenWalletModal,
  promoBalanceOverride,
  mainBalanceOverride,
}) => {
  const balance = mainBalanceOverride ?? profile?.balance ?? 0;
  const promoBalance = promoBalanceOverride ?? profile?.promo_balance ?? 0;
  const points = profile?.points ?? 0;

  const formatMoney = (val: number) =>
    val % 1 === 0 ? val.toString() : formatNumber(val, 2);

  const formattedBalance = formatMoney(balance);

  const handleOpenWallet = (e: React.MouseEvent) => {
    if (!isOwnProfile) return;
    e.stopPropagation();
    onOpenWalletModal("main");
  };

  const handleOpenPoints = (e: React.MouseEvent) => {
    if (!isOwnProfile) return;
    e.stopPropagation();
    onOpenPointsModal();
  };

  const handleOpenPromo = (e: React.MouseEvent) => {
    if (!isOwnProfile) return;
    e.stopPropagation();
    onOpenWalletModal("promo");
  };

  return (
    <div style={{ marginTop: "8px", marginBottom: "24px" }}>
      {/* 1. Original Noon-style Main Wallet Card */}
      <div
        className={styles.noonBalanceCard}
        onClick={handleOpenWallet}
        role="button"
        tabIndex={isOwnProfile ? 0 : -1}
        title="عرض الرصيد الأساسي والمحفظة"
        style={{
          cursor: isOwnProfile ? "pointer" : "default",
          marginTop: 0,
          marginBottom: "10px",
        }}
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

      {/* 2. Two Side-by-Side Tiles Below Wallet: Points + Promotional Balance */}
      <div className={styles.walletDualCard} style={{ marginTop: 0, marginBottom: 0 }}>
        {/* Points Tile */}
        <button
          type="button"
          onClick={handleOpenPoints}
          disabled={!isOwnProfile}
          className={`${styles.walletTileBtn} bg-glass`}
          title="عرض تفاصيل وتحويل النقاط"
        >
          <div className={styles.walletTileTop}>
            <span className="p-1">
              <Coins size={18} strokeWidth={1.8} className="color-fg" />
            </span>
            <span className={styles.walletTileLabel}>النقاط</span>
            {isOwnProfile && <ChevronLeft size={14} className={styles.walletTileChevron} />}
          </div>

          <div className={styles.walletTileValueRow}>
            <span className={styles.walletTileAmount}>{formatNumber(points)}</span>
            <span className={styles.walletTileCurrency}>نقطة</span>
          </div>
        </button>

        {/* Promotional Balance Tile */}
        <button
          type="button"
          onClick={handleOpenPromo}
          disabled={!isOwnProfile}
          className={`${styles.walletTileBtn} bg-glass`}
          title="عرض الرصيد الترويجي وصلاحيته"
        >
          <div className={styles.walletTileTop}>
            <span className="pt-1">
              <IconTicket stroke={2} size={18} strokeWidth={1.8} className="color-fg" />
            </span>
            <span className={styles.walletTileLabel}>المكأفات</span>
            {isOwnProfile && <ChevronLeft size={14} className={styles.walletTileChevron} />}
          </div>

          <div className={styles.walletTileValueRow}>
            <span className={styles.walletTileAmount}>{formatMoney(promoBalance)}</span>
            <span className={styles.walletTileCurrency}>ج.م</span>
          </div>
        </button>
      </div>
    </div>
  );
};
