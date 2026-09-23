import React from "react";
import { Port } from "../types";
import styles from "../ports.module.css";

interface PortCardProps {
  port: Port;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function PortCard({
  port,
  isExpanded,
  onToggleExpand,
}: PortCardProps) {
  const isMed = port.sea.includes("المتوسط");

  return (
    <div
      id={`port-card-${encodeURIComponent(port.name)}`}
      className={`${styles.portCard} ${isExpanded ? styles.portCardActive : ""}`}
    >
      {/* Port Header */}
      <div className={styles.portHeader}>
        <div className={styles.portTitleGroup}>
          <div
            className={styles.portIconBox}
            style={{
              background: isMed ? "rgba(6, 182, 212, 0.12)" : "rgba(239, 68, 68, 0.12)",
              borderColor: isMed ? "rgba(6, 182, 212, 0.25)" : "rgba(239, 68, 68, 0.25)",
              color: isMed ? "#06b6d4" : "#ef4444",
            }}
          >
            <i className={isMed ? "bx bx-water" : "bx bx-ship"} />
          </div>

          <div>
            <h3 className={styles.portName}>{port.name}</h3>
            <div className={styles.badgesRow}>
              <span className={styles.seaBadge}>
                <i className="bx bx-compass" />
                <span>{port.sea}</span>
              </span>
              <span className={styles.govBadge}>
                <i className="bx bx-map-pin" style={{ marginLeft: "3px" }} />
                <span>{port.governorate}</span>
              </span>
              {port.status && (
                <span className={styles.statusBadge}>
                  <i className="bx bx-check-shield" style={{ marginLeft: "3px" }} />
                  <span>{port.status}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          type="button"
          onClick={onToggleExpand}
          className={styles.expandBtn}
          aria-label={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        >
          <span>{isExpanded ? "إخفاء" : "التفاصيل"}</span>
          <i
            className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
            style={{ fontSize: "1.15rem" }}
          />
        </button>
      </div>

      {/* Port Brief Description */}
      <p className={styles.portSummary}>{port.description}</p>

      {/* Highlights Bar */}
      <div className={styles.highlightsGrid}>
        <div className={styles.highlightItem}>
          <span className={styles.highlightLabel}>
            <i className="bx bx-category" style={{ color: "var(--color-secondary, #3b82f6)" }} />
            <span>نوع الميناء وتخصصه:</span>
          </span>
          <span className={styles.highlightValue}>{port.type}</span>
        </div>

        <div className={styles.highlightItem}>
          <span className={styles.highlightLabel}>
            <i className="bx bx-trending-up" style={{ color: "#10b981" }} />
            <span>القدرة التشغيلية:</span>
          </span>
          <span className={styles.highlightValue}>{port.capacity}</span>
        </div>
      </div>

      {/* Collapsible Technical Details */}
      {isExpanded && (
        <div className={styles.expandedSection}>
          {port.berths_count && (
            <div className={styles.sectionBlock}>
              <span className={styles.sectionTitle}>
                <i className="bx bx-buildings" style={{ color: "#06b6d4" }} />
                <span>الأرصفة والتجهيزات الفنية والملاحية:</span>
              </span>
              <p className={styles.sectionContent}>{port.berths_count}</p>
            </div>
          )}

          {port.connections && port.connections.length > 0 && (
            <div className={styles.sectionBlock}>
              <span className={styles.sectionTitle}>
                <i className="bx bx-git-branch" style={{ color: "#8b5cf6" }} />
                <span>طرق الوصول وشبكات الربط البري والحديدي:</span>
              </span>
              <div className={styles.connectionsWrapper}>
                {port.connections.map((conn, cIdx) => (
                  <span key={cIdx} className={styles.connectionPill}>
                    <i className="bx bx-link" style={{ fontSize: "0.85rem" }} />
                    <span>{conn}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {port.operator && (
            <div className={styles.sectionBlock}>
              <span className={styles.sectionTitle}>
                <i className="bx bx-briefcase" style={{ color: "#f59e0b" }} />
                <span>الهيئة والجهة المشغلة:</span>
              </span>
              <p className={styles.sectionContent}>{port.operator}</p>
            </div>
          )}
        </div>
      )}

      {/* Card Footer Actions */}
      <div className={styles.cardActions}>
        <a
          href={port.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapButton}
        >
          <i className="bx bx-map" style={{ fontSize: "1.15rem" }} />
          <span>عرض الموقع والاتجاهات الجغرافية (Google Maps)</span>
        </a>
      </div>
    </div>
  );
}
