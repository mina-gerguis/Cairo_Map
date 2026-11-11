"use client";

import React, { useState } from "react";
import {
  MessageSquarePlus,
  Sparkles,
  HelpCircle,
  Users,
  CheckCircle2,
  Search,
  Activity,
  Flame,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import styles from "@/app/had-yaaraf/had-yaaraf.module.css";

interface CommunityStatsBannerProps {
  totalQuestions: number;
  totalAnswers: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenAskModal: () => void;
  solvedCount?: number;
}

export default function CommunityStatsBanner({
  totalQuestions,
  totalAnswers,
  searchQuery,
  onSearchChange,
  onOpenAskModal,
  solvedCount = Math.max(1, Math.round(totalAnswers * 0.6)),
}: CommunityStatsBannerProps) {
  const [filterPeriod, setFilterPeriod] = useState<"اليوم" | "هذا الأسبوع" | "الكل">("الكل");

  // Solved ratio
  const resolutionRate = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 85;

  return (
    <div className={styles.bentoHeroSection}>
      {/* ── Top Status Bar (inspired by Admin Bento Status Bar) ── */}
      <div className={styles.bentoStatusBar}>
        <div className={styles.bentoStatusRight}>
          <div className={styles.bentoLiveBadge}>
            <span className={styles.bentoLiveDot} />
            <span>مجتمع قريب التفاعلي</span>
          </div>
          <span className={styles.bentoCityPill}>
            <MapPin style={{ width: "13px", height: "13px", color: "var(--color-primary, #2727ff)" }} />
            <span>القاهرة الكبرى وضواحيها</span>
          </span>
        </div>

        <div className={styles.bentoPeriodPills}>
          {(["اليوم", "هذا الأسبوع", "الكل"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setFilterPeriod(period)}
              className={`${styles.bentoPeriodBtn} ${filterPeriod === period ? styles.bentoPeriodBtnActive : ""}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bento Grid Layout ── */}
      <div className={styles.bentoHeroGrid}>
        {/* TILE 1: Main Welcome & Search Tile (Wide Span 2) */}
        <div className={`${styles.bentoTile} ${styles.bentoTileMain}`}>
          <div className={styles.bentoTileGlow} />

          <div className={styles.bentoMainHeader}>
            <div className={styles.bentoBadge}>
              <Sparkles style={{ width: "14px", height: "14px", color: "#facc15" }} />
              <span>مساحة الأسئلة والمساعدات اليومية</span>
            </div>
            <h1 className={styles.bentoTitle}>
              حد يعرف؟ <span className={styles.bentoTitleHighlight}>اسأل وجاوب</span>
            </h1>
            <p className={styles.bentoSubtitle}>
              استفسر عن أي مواصلة، ميكروباص، مترو، محطة، أو مصلحة حكومية. شارك السؤال مع أهالي وسكان القاهرة الكبرى وتلقَّ الإجابات فوراً.
            </p>
          </div>

          {/* Search Bar & Primary CTA */}
          <div className={styles.bentoSearchArea}>
            <div className={styles.bentoSearchBox}>
              <Search className={styles.bentoSearchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث في أسئلة وتجارب الأعضاء (رمسيس، التجمع، مترو، المعادي)..."
                className={styles.bentoSearchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className={styles.bentoClearBtn}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAskModal}
              className={styles.bentoAskBtn}
            >
              <MessageSquarePlus style={{ width: "18px", height: "18px" }} />
              <span>اسأل المجتمع الآن</span>
            </button>
          </div>

          {/* Quick Trending Topics Tags */}
          <div className={styles.bentoQuickTags}>
            <span className={styles.bentoQuickTagsLabel}>
              <Flame style={{ width: "14px", height: "14px", color: "#f59e0b" }} /> الأكثر بحثاً:
            </span>
            {["خط المترو الثالث", "ميكروباصات التجمع", "موقف السلام", "العاصمة الإدارية", "شبرا الخيمة"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSearchChange(tag)}
                className={styles.bentoMiniTag}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* TILE 2: Solved Rate / Community Resolution Gauge Tile */}
        <div className={`${styles.bentoTile} ${styles.bentoTileGauge}`}>
          <div className={styles.bentoTileHeader}>
            <span className={styles.bentoTileTitle}>نسبة الحل والإفادة</span>
            <span className={styles.bentoPillSuccess}>
              <TrendingUp style={{ width: "12px", height: "12px" }} />
              <span>نشط جداً</span>
            </span>
          </div>

          <div className={styles.bentoGaugeCenter}>
            <div className={styles.bentoGaugeCircleWrapper}>
              <svg width="120" height="70" viewBox="0 0 120 70" aria-hidden>
                <path
                  d="M 12 60 A 48 48 0 0 1 108 60"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <path
                  d="M 12 60 A 48 48 0 0 1 108 60"
                  fill="none"
                  stroke="var(--color-primary, #2727ff)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={Math.PI * 48}
                  strokeDashoffset={Math.PI * 48 * (1 - Math.min(1, resolutionRate / 100))}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className={styles.bentoGaugeValue}>
                {resolutionRate}
                <span className={styles.bentoGaugeUnit}>%</span>
              </div>
            </div>
            <p className={styles.bentoGaugeDesc}>
              معدل الأسئلة التي حصلت على إجابة موثقة ودقيقة من المجتمع
            </p>
          </div>

          <div className={styles.bentoGaugeFooter}>
            <div className={styles.bentoGaugeFooterItem}>
              <span>إجمالي المساعدات</span>
              <strong>{totalAnswers}</strong>
            </div>
            <div className={styles.bentoGaugeDivider} />
            <div className={styles.bentoGaugeFooterItem}>
              <span>أسئلة مفتوحة</span>
              <strong>{totalQuestions}</strong>
            </div>
          </div>
        </div>

        {/* TILE 3: Fast Stats & Realtime Pulse Tile (Featured Style) */}
        <div className={`${styles.bentoTile} ${styles.bentoTileStats}`}>
          <div className={styles.bentoTileHeader}>
            <span className={styles.bentoTileTitle}>مؤشرات المجتمع</span>
            <span className={styles.bentoLiveStreamBadge}>
              <Activity style={{ width: "13px", height: "13px" }} />
              <span>تحديث حي</span>
            </span>
          </div>

          <div className={styles.bentoMetricsGrid}>
            <div className={styles.bentoMetricItem}>
              <div className={styles.bentoMetricIconCircle} style={{ background: "rgba(39, 39, 255, 0.15)", color: "#60a5fa" }}>
                <HelpCircle style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <span className={styles.bentoMetricVal}>{totalQuestions}</span>
                <span className={styles.bentoMetricLabel}>سؤال واستفسار</span>
              </div>
            </div>

            <div className={styles.bentoMetricItem}>
              <div className={styles.bentoMetricIconCircle} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                <CheckCircle2 style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <span className={styles.bentoMetricVal}>{totalAnswers}</span>
                <span className={styles.bentoMetricLabel}>إجابة وتجربة</span>
              </div>
            </div>

            <div className={styles.bentoMetricItem}>
              <div className={styles.bentoMetricIconCircle} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                <Users style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <span className={styles.bentoMetricVal}>100%</span>
                <span className={styles.bentoMetricLabel}>مجاني ومفتوح</span>
              </div>
            </div>
          </div>

          <div className={styles.bentoStatsTip}>
            <Clock style={{ width: "13px", height: "13px", color: "var(--color-primary, #2727ff)" }} />
            <span>متوسط وقت الرد الأول: أقل من <strong>15 دقيقة</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
