import React, { useState } from "react";
import { RouteOption } from "../types";
import {
  buildLegsFromOption,
  computeTotalTripSummary,
  getTransitOptionIconPath,
} from "../utils";
import RouteLegTimeline from "./RouteLegTimeline";
import ShareModal from "@/components/common/ShareModal";
import styles from "./RouteOptionCard.module.css";

interface RouteOptionCardProps {
  option: RouteOption;
  resolvedFrom: string;
  resolvedTo: string;
  onOpenReportModal: (option: RouteOption) => void;
}

export default function RouteOptionCard({
  option,
  resolvedFrom,
  resolvedTo,
  onOpenReportModal,
}: RouteOptionCardProps) {
  const legs = buildLegsFromOption(option);
  const summary = computeTotalTripSummary(option, legs);
  const iconData = getTransitOptionIconPath(option);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/directions?from=${encodeURIComponent(resolvedFrom)}&to=${encodeURIComponent(resolvedTo)}`;
  const shareText = `🚗 خط السير عبر ماب القاهرة (Cairo Map) 🗺️\n📍 من: ${resolvedFrom}\n🎯 إلى: ${resolvedTo}\n🚌 نوع الوسيلة: ${option.typeName}\n💵 الإجمالي: ${summary.totalCost} ج.م\n⏱️ المدة المتوقعة: ${summary.totalDuration}`;

  return (
    <div className={styles.routeCard}>
      {/* Option Header */}
      <div className={styles.routeHeader}>
        <div className={styles.routeTitle}>
          {iconData.type === "image" && iconData.src ? (
            <img
              src={iconData.src}
              loading="lazy"
              decoding="async"
              style={{ width: "36px", height: "auto", objectFit: "contain" }}
              alt={option.typeName}
            />
          ) : (
            <div className={styles.bentoIconBox}>
              <i
                className={iconData.iconClass || "bx bx-bus"}
                style={{ color: "var(--color-secondary)" }}
              />
            </div>
          )}
          <span>{option.typeName}</span>
        </div>

        <div className={styles.headerPills}>
          <span className={`${styles.headerPill} tab`}>
            {summary.totalCost} جنيه
          </span>
          <span className={`${styles.headerPill} tab`}>
            {summary.totalDuration}
          </span>
        </div>
      </div>

      {/* Option Details Box */}
      <div className={styles.routeDetailsBox}>
        {/* Multi-stage vertical timeline */}
        <div className={styles.timelineWrapper}>
          <RouteLegTimeline legs={legs} />
        </div>

        {/* Tips section if available */}
        {option.tips && (
          <div className={styles.tipsBox}>
            <div className={styles.tipsHeader}>
              <i className="bx bxs-bulb" style={{ fontSize: "1.1rem" }} />
              <span>نصيحة مهمة للمسار:</span>
            </div>
            <p className={styles.tipsText}>{option.tips}</p>
          </div>
        )}

        {/* Action Buttons: Universal Share, Maps, Report */}
        <div className={styles.actionsRow}>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className={`btn btn-primary ${styles.actionBtn} ${!option.map_link ? styles.actionBtnFull : ""}`}
            title="مشاركة أو نسخ رابط المسار"
          >
            <i className="bx bx-share-alt" />
            <span>مشاركة المسار</span>
          </button>

          {option.map_link && (
            <a
              href={option.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-secondary ${styles.actionBtn}`}
            >
              <i className="bx bx-navigation" />
              <span>خريطة Google</span>
            </a>
          )}

          <button
            type="button"
            className={`btn btn-report ${styles.reportBtn}`}
            onClick={() => onOpenReportModal(option)}
          >
            <i className="fa-solid fa-triangle-exclamation" />
            <span>إبلاغ عن خطأ</span>
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="مشاركة مسار المواصلات"
        subtitle={`من ${resolvedFrom} إلى ${resolvedTo} (${option.typeName})`}
        shareUrl={shareUrl}
        shareText={shareText}
      />
    </div>
  );
}
