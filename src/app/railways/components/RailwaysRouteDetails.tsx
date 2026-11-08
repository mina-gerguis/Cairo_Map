import React, { RefObject } from "react";
import { RailwayRoute } from "../types";
import ProjectBanner from "@/components/common/ProjectBanner";
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
          <div className={styles.metricValue} style={{ color: "var(--color-fg)" }}>
            {route.duration || "حسب نوع القطار"}
          </div>
          <div className={styles.metricLabel}>متوسط وقت السفر</div>
        </div>
      </div>

      {/* Train Classes & Ticket Prices
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
      )} */}

      {/* Horizontal Route Stops Stepper */}
      <div className={styles.timelineBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <h3 className={styles.sectionHeaderTitle} style={{ margin: 0 }}>
            <i className="bx bx-transfer" style={{ color, fontSize: "1.2rem" }} />
            <span>المسار والمحطات التي يمر بها القطار ({route.stops?.length || 0} محطة):</span>
          </h3>
        </div>

        {route.stops && route.stops.length > 0 ? (
          <div style={{ overflowX: "auto", paddingBottom: "12px", paddingTop: "8px" }} className="hide-scrollbar">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                position: "relative",
                minWidth: `${Math.max(route.stops.length * 130, 480)}px`,
                padding: "0 24px",
              }}
            >
              {/* Connecting Line between stops */}
              <div
                style={{
                  position: "absolute",
                  top: "11px",
                  left: "32px",
                  right: "32px",
                  height: "2px",
                  background: "var(--border-glass, rgba(255, 255, 255, 0.12))",
                  zIndex: 1,
                }}
              />

              {route.stops.map((stop, idx, arr) => {
                const isStart = idx === 0;
                const isEnd = idx === arr.length - 1;
                const isUnderConstruction = stop.status === "تحت الإنشاء";

                // Terminal or intermediate colors
                const dotColor = isUnderConstruction
                  ? "#ef4444"
                  : isStart
                    ? "#ef4444"
                    : isEnd
                      ? "#10b981"
                      : color || "#3b82f6";

                return (
                  <div
                    key={idx}
                    style={{
                      flex: "1 1 0%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      zIndex: 2,
                      minWidth: "100px",
                      padding: "0 4px",
                    }}
                  >
                    {/* Stepper Dot */}
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: `3px solid ${dotColor}`,
                        backgroundColor: "var(--color-bg, #18181b)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "10px",
                        boxShadow: `0 0 10px ${dotColor}40`,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: isUnderConstruction ? "transparent" : dotColor,
                        }}
                      />
                    </div>

                    {/* Stop Name & Status */}
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isStart || isEnd ? "800" : "600",
                          color: isUnderConstruction
                            ? "#ef4444"
                            : isStart || isEnd
                              ? "var(--color-fg)"
                              : "var(--text-secondary)",
                          textAlign: "center",
                          lineHeight: "1.35",
                          whiteSpace: "normal",
                        }}
                      >
                        {stop.name}
                      </span>

                      {isStart && (
                        <span style={{ fontSize: "0.66rem", color: "#ef4444", fontWeight: "700" }}>
                          (بداية الخط)
                        </span>
                      )}
                      {isEnd && (
                        <span style={{ fontSize: "0.66rem", color: "#10b981", fontWeight: "700" }}>
                          (نهاية الخط)
                        </span>
                      )}
                      {isUnderConstruction && (
                        <span style={{ fontSize: "0.64rem", color: "#ef4444", fontWeight: "700" }}>
                          تحت الإنشاء 🚧
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "16px", fontSize: "0.88rem" }}>
            لا توجد محطات مضافة لهذا الخط حالياً.
          </div>
        )}
      </div>

      {/* Travel Tip
      {route.tips && (
        <div className={styles.tipCard}>
          <i className="bx bxs-info-circle" style={{ color, fontSize: "1.2rem", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ color: "var(--color-fg)" }}>نصيحة السفر: </strong>
            <span style={{ color: "var(--text-secondary)" }}>{route.tips}</span>
          </div>
        </div>
      )} */}

      {/* Report Banner for this route using ProjectBanner */}
      <div style={{ marginTop: "16px" }} onClick={(e) => e.stopPropagation()}>
        <ProjectBanner
          variant="error"
          label={`هل لاحظت بيانات غير دقيقة في خط ${route.name}؟`}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "16px", height: "16px" }}
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          callToAction={{
            label: "إبلاغ الآن",
            onClick: onOpenReport,
          }}
        />
      </div>
    </div>
  );
}
