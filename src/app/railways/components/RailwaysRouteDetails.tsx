import React, { RefObject } from "react";
import { RailwayRoute } from "../types";
import styles from "../railways.module.css";

interface RailwaysRouteDetailsProps {
  detailsPanelRef: RefObject<HTMLDivElement | null>;
  route: RailwayRoute;
  color: string;
  onOpenReport: () => void;
}

export default function RailwaysRouteDetails({
  detailsPanelRef,
  route,
  color,
  onOpenReport,
}: RailwaysRouteDetailsProps) {
  const startStation = route.stops?.[0]?.name?.replace(" (رمسيس)", "")?.replace(" (محطة رمسيس)", "") || route.from || "القاهرة";
  const endStation = route.stops?.[route.stops.length - 1]?.name?.replace(" (محطة سيدي جابر / مصر)", "") || route.to || "الوصول";

  return (
    <div id="railway-route-details" ref={detailsPanelRef} className={styles.detailsCard}>
      {/* Header */}
      <div className={styles.detailsHeader}>
        <h2 className={styles.detailsTitle}>
          <i className="fa-solid fa-train" style={{ color }} />
          <span>تفاصيل {route.name}</span>
        </h2>
      </div>

      {/* 3-Column Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricTile}>
          <div className={styles.metricValue} style={{ color }}>
            {startStation}
          </div>
          <div className={styles.metricLabel}>محطة البداية</div>
        </div>

        <div className={styles.metricTile}>
          <div className={styles.metricValue} style={{ color }}>
            {endStation}
          </div>
          <div className={styles.metricLabel}>محطة الوصول</div>
        </div>

        <div className={styles.metricTile}>
          <div className={styles.metricValue} style={{ color: "var(--text-primary)" }}>
            {route.duration || "حسب نوع القطار"}
          </div>
          <div className={styles.metricLabel}>متوسط وقت السفر</div>
        </div>
      </div>

      {/* Train Classes & Ticket Prices */}
      {route.classes && route.classes.length > 0 && (
        <div className={styles.classesBox}>
          <h3 className={styles.sectionHeaderTitle}>
            <i className="fa-solid fa-tags" style={{ color }} />
            <span>فئات القطارات وأسعار التذاكر على هذا الخط</span>
          </h3>

          <div className={styles.classesList}>
            {route.classes.map((cls, cIdx) => (
              <div key={cIdx} className={styles.classItem}>
                <div className={styles.classItemTop}>
                  <span className={styles.className}>{cls.name}</span>
                  <span className={styles.classPrice}>{cls.price}</span>
                </div>
                {cls.features && (
                  <div className={styles.classFeatures}>
                    {cls.features}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Stops Vertical Timeline */}
      <div className={styles.timelineBox}>
        <h3 className={styles.sectionHeaderTitle}>
          <i className="fa-solid fa-route" style={{ color }} />
          <span>المحطات الرئيسية على هذا الخط ({route.stops?.length || 0} محطة)</span>
        </h3>

        <div className={styles.stopsTimeline}>
          {route.stops && route.stops.length > 0 ? (
            route.stops.map((stop, sIdx) => {
              const isFirst = sIdx === 0;
              const isLast = sIdx === route.stops.length - 1;
              const isUnderConstruction = stop.status === "تحت الإنشاء";

              return (
                <div key={sIdx} style={{ display: "flex", flexDirection: "column" }}>
                  <div className={styles.stopRow}>
                    {/* Dot */}
                    <div className={styles.stopDotContainer}>
                      <div
                        className={styles.stopDot}
                        style={{
                          width: isFirst || isLast ? "12px" : "8px",
                          height: isFirst || isLast ? "12px" : "8px",
                          backgroundColor: isUnderConstruction ? "transparent" : color,
                          border: isUnderConstruction
                            ? "2px dashed #ef4444"
                            : isFirst || isLast
                            ? "2px solid var(--bgPrimary, #18181b)"
                            : "none",
                          boxShadow: isUnderConstruction
                            ? "none"
                            : isFirst || isLast
                            ? `0 0 0 2px ${color}`
                            : "none",
                        }}
                      />
                    </div>

                    {/* Stop Info */}
                    <div className={styles.stopName}>
                      <span
                        style={{
                          fontWeight: isFirst || isLast ? "800" : "600",
                          color: isUnderConstruction
                            ? "#ef4444"
                            : isFirst || isLast
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {stop.name}
                      </span>

                      {isUnderConstruction && (
                        <span className={`${styles.stopBadge} ${styles.stopBadgeConstructing}`}>
                          تحت الإنشاء 🚧
                        </span>
                      )}
                      {isFirst && (
                        <span className={`${styles.stopBadge} ${styles.stopBadgeTerminal}`}>
                          (بداية الخط)
                        </span>
                      )}
                      {isLast && (
                        <span className={`${styles.stopBadge} ${styles.stopBadgeTerminal}`}>
                          (نهاية الخط)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className={styles.connectorLine}>
                      <div className={styles.stopDotContainer}>
                        <div
                          className={styles.connectorBar}
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "16px", fontSize: "0.88rem" }}>
              لا توجد محطات مضافة لهذا الخط حالياً.
            </div>
          )}
        </div>
      </div>

      {/* Travel Tip */}
      {route.tips && (
        <div className={styles.tipCard}>
          <i className="bx bxs-info-circle" style={{ color, fontSize: "1.2rem", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ color: "var(--text-primary)" }}>نصيحة السفر: </strong>
            <span style={{ color: "var(--text-secondary)" }}>{route.tips}</span>
          </div>
        </div>
      )}

      {/* Report Button for this route */}
      <div className={styles.routeReportBtnWrapper}>
        <button
          type="button"
          onClick={onOpenReport}
          className="btn btn-report"
          style={{
            fontSize: "0.82rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "10px",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation" />
          <span>الإبلاغ عن خطأ في مواعيد أو تفاصيل هذا الخط</span>
        </button>
      </div>
    </div>
  );
}
