"use client";

import React from "react";
import { MessageSquarePlus, Sparkles, HelpCircle, Users, CheckCircle2, Search } from "lucide-react";
import styles from "@/app/had-yaaraf/had-yaaraf.module.css";

interface CommunityStatsBannerProps {
  totalQuestions: number;
  totalAnswers: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenAskModal: () => void;
}

export default function CommunityStatsBanner({
  totalQuestions,
  totalAnswers,
  searchQuery,
  onSearchChange,
  onOpenAskModal,
}: CommunityStatsBannerProps) {
  return (
    <div className={styles.heroBanner}>
      {/* Ambient background glows */}
      <div className={`${styles.heroGlowCircle} ${styles.heroGlowBlue}`} />
      <div className={`${styles.heroGlowCircle} ${styles.heroGlowAmber}`} />

      {/* Pill Badge */}
      <div className={styles.heroBadge}>
        <Sparkles style={{ width: "16px", height: "16px", color: "#facc15" }} />
        <span>خدمة مجتمع قريب التفاعلية</span>
      </div>

      {/* Main Title & Slogan */}
      <h1 className={styles.heroTitle}>
        حد يعرف؟ <span className={styles.heroTitleHighlight}>اسأل وجاوب</span> 🤔
      </h1>
      <p className={styles.heroSubtitle}>
        عندك سؤال عن مواصلة، طريق، مكان خروجة، أو ورقة حكومية؟ اسأل مجتمع القاهرة الكبرى والناس هتجاوبك وتفيدك فوراً.
      </p>

      {/* Search Input & Ask Button */}
      <div className={styles.heroControls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في أسئلة المجتمع (مثال: التجمع، المترو، حديقة الأزهر)..."
            className={styles.searchInput}
          />
          <Search style={{ width: "20px", height: "20px" }} className={styles.searchIcon} />
        </div>

        <button
          type="button"
          onClick={onOpenAskModal}
          className={styles.askBtnPrimary}
        >
          <MessageSquarePlus style={{ width: "18px", height: "18px" }} />
          <span>اسأل سؤالك الآن</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className={styles.heroStats}>
        <div className={styles.statItem}>
          <HelpCircle style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
          <span>
            <strong>{totalQuestions}</strong> سؤال مطروح
          </span>
        </div>

        <div className={styles.statItem}>
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#10b981" }} />
          <span>
            <strong>{totalAnswers}</strong> إجابة ومساعدة
          </span>
        </div>

        <div className={styles.statItem}>
          <Users style={{ width: "16px", height: "16px", color: "#a855f7" }} />
          <span>مجتمع نشط ومفتوح 100%</span>
        </div>
      </div>
    </div>
  );
}
