import React from "react";
import { MicrobusRoute, VoteStats } from "../types";
import MicrobusTimeline from "./MicrobusTimeline";
import styles from "../microbus.module.css";

interface MicrobusRouteItemProps {
  route: MicrobusRoute;
  stationName: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  accentColor: string;
  voteStats: VoteStats;
  onVote: (type: "like" | "dislike") => void;
  onOpenReport: () => void;
}

export default function MicrobusRouteItem({
  route,
  stationName,
  isExpanded,
  onToggleExpand,
  accentColor,
  voteStats,
  onVote,
  onOpenReport,
}: MicrobusRouteItemProps) {
  const { likes, dislikes, userVote } = voteStats;

  return (
    <div className={styles.routeCard}>
      {/* Route Header */}
      <div
        onClick={onToggleExpand}
        className={`${styles.routeHeader} ${isExpanded ? styles.routeHeaderActive : ""}`}
      >
        <div className={styles.routeTitle}>
          <i className="bx bx-right-arrow-alt" style={{ transform: "scaleX(-1)" }} />
          <span>إلى {route.destination}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="tab">
            {route.fare} جنيه
          </span>
          <i className={`bx bx-chevron-${isExpanded ? "up" : "down"}`} style={{ fontSize: "1.2rem", color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Route Expanded Details Box */}
      {isExpanded && (
        <div className={styles.routeDetailsBox}>
          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            {/* Vehicle Tile */}
            {/* <div className={styles.metricTile}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>نوع الميكوباص</span>
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {route.vehicleType || "ميكروباص"}
                </span>
              </div>
            </div> */}

            {/* Duration Tile */}
            <div className={styles.metricTile}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>وقت الوصول</span>
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {route.duration ? `${route.duration} دقيقة` : "30-45 دقيقة"}
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginRight: "5px" }}>تقريبا</span>
                </span>
              </div>
            </div>

            {/* Fare Full Tile */}
            <div className={styles.metricTile}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>الأجرة</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800" }}>
                  {route.fare} جنيه
                </span>
              </div>
            </div>
          </div>

          {/* Transit Stepper Timeline */}
          {route.via && (
            <MicrobusTimeline
              stationName={stationName}
              via={route.via}
              destination={route.destination}
              accentColor={accentColor}
            />
          )}

          {/* Notes / Description Callout */}
          {(route.description || route.notes) && (
            <div style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              background: "var(--bg-glass)",
              padding: "10px 12px",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border-glass)",
              lineHeight: "1.6"
            }}>
              <i className="bx bx-info-circle" style={{ marginLeft: "6px", color: accentColor }} />
              {route.description || route.notes}
            </div>
          )}

          {/* Interactive Voting & Report Row */}
          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>
              هل الخط دقيق؟
            </span>
          </div>
          <div className={styles.actionsRow}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onVote("like");
                }}
                className={`${styles.voteButton} ${userVote === "like" ? styles.voteButtonActiveLike : ""}`}
              >
                <i className="bx bx-like" />
                <span>({likes})</span>
              </button>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onVote("dislike");
                }}
                className={`${styles.voteButton} ${userVote === "dislike" ? styles.voteButtonActiveDislike : ""}`}
              >
                <i className="bx bx-dislike" />
                <span>({dislikes})</span>
              </button>
            </div>
            <div >
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onOpenReport();
                }}
                className="btn btn-report"
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                }}
              >
                <i className="bx bx-error" />
                <span>إبلاغ عن خطأ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
