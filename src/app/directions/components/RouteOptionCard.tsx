import React from "react";
import { RouteOption } from "../types";
import {
  buildLegsFromOption,
  computeTotalTripSummary,
  shareRoute,
  getTransitOptionIconPath
} from "../utils";
import RouteLegTimeline from "./RouteLegTimeline";
import styles from "../page.module.css";

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

  const handleShare = () => {
    shareRoute({
      from: resolvedFrom,
      to: resolvedTo,
      option,
      legs,
      summary
    });
  };

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
              <i className={iconData.iconClass || "bx bx-bus"} style={{ color: "var(--color-secondary)" }} />
            </div>
          )}
          <span>{option.typeName}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span className={styles.farePill}>
            {summary.totalCost} جنيه
          </span>
          <span className={styles.timePill}>
            {summary.totalDuration}
          </span>
        </div>
      </div>

      {/* Option Details Box */}
      <div className={styles.routeDetailsBox}>
        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          {/* Fare tile */}
          <div className={styles.metricTile}>
            <div className={styles.metricTileIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <i className="bx bx-money" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>التكلفة الإجمالية</span>
              <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#10b981" }}>
                {summary.totalCost} ج.م
              </span>
            </div>
          </div>

          {/* Duration tile */}
          <div className={styles.metricTile}>
            <div className={styles.metricTileIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--color-secondary)" }}>
              <i className="bx bx-time-five" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>الوقت المقدر</span>
              <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-secondary)" }}>
                {summary.totalDuration}
              </span>
            </div>
          </div>

          {/* Stages tile */}
          <div className={styles.metricTile}>
            <div className={styles.metricTileIcon} style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              <i className="bx bx-git-branch" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>مراحل التنقل</span>
              <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {legs.length} {legs.length === 1 ? "وسيلة واحدة" : "وسائل نقل"}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-stage vertical timeline */}
        <div className={styles.timelineWrapper}>
          <RouteLegTimeline legs={legs} />
        </div>

        {/* Tips section if available */}
        {option.tips && (
          <div className={styles.tipsBox}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800", color: "#f59e0b", marginBottom: "4px" }}>
              <i className="bx bxs-bulb" style={{ fontSize: "1.1rem" }} />
              <span>نصيحة مهمة للمسار:</span>
            </div>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>{option.tips}</p>
          </div>
        )}

        {/* Action Buttons: WhatsApp Share, Maps, Report */}
        <div className={styles.actionsRow}>
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-primary"
            style={{
              flex: 1,
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }} />
            <span>مشاركة الخط</span>
          </button>

          {option.map_link && (
            <a
              href={option.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                flex: 1,
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              <i className="bx bx-navigation" style={{ fontSize: "1.1rem" }} />
              <span>خريطة Google</span>
            </a>
          )}

          <button
            type="button"
            className="btn btn-report"
            onClick={() => onOpenReportModal(option)}
            style={{
              flex: option.map_link ? "0 0 auto" : 1,
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "0 18px"
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" />
            <span>إبلاغ عن خطأ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
