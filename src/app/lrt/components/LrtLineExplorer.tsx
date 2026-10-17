import React from "react";
import { LrtLineExplorerProps, LrtStation } from "../types";
import { LRT_LINE_TABS, STATION_DETAILS } from "../constants";
import styles from "../lrt.module.css";

export default function LrtLineExplorer({
  panelRef,
  activeLine,
  onSelectTab,
  stations,
  expandedStation,
  onToggleStation,
  onOpenReportModal,
}: LrtLineExplorerProps) {
  const currentTabConfig =
    LRT_LINE_TABS.find((t) => t.id === activeLine) || LRT_LINE_TABS[0];

  const stationsList: LrtStation[] = React.useMemo(() => {
    if (activeLine === "trunk") {
      return stations
        .filter((s) => s.line_type === "trunk")
        .sort((a, b) => a.station_order - b.station_order);
    }
    if (activeLine === "capital") {
      return stations
        .filter((s) => s.line_type === "capital")
        .sort((a, b) => a.station_order - b.station_order);
    }
    if (activeLine === "ramadan") {
      return stations
        .filter((s) => s.line_type === "ramadan")
        .sort((a, b) => a.station_order - b.station_order);
    }
    return [
      ...stations
        .filter((s) => s.line_type === "trunk")
        .sort((a, b) => a.station_order - b.station_order),
      ...stations
        .filter((s) => s.line_type === "capital")
        .sort((a, b) => a.station_order - b.station_order),
      ...stations
        .filter((s) => s.line_type === "ramadan")
        .sort((a, b) => a.station_order - b.station_order),
    ];
  }, [stations, activeLine]);

  return (
    <div ref={panelRef} className={styles.explorerSection}>
      <div className={styles.explorerSectionHeader}>
        <h2 className={styles.explorerTitle}>
          محطات ومسارات القطار الكهربائي LRT
        </h2>
        <p className={styles.explorerSubtitle}>
          اختر المسار لاستعراض المحطات والمعالم المحيطة ومحطات التبادل تفصيلياً.
        </p>
      </div>

      {/* Explorer Tab Switcher */}
      <div className={styles.tabsBar}>
        {LRT_LINE_TABS.map((tab) => {
          const active = activeLine === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`${styles.tabButton} ${active ? styles.tabButtonActive : ""}`}
              style={
                {
                  "--tab-color": tab.color,
                  "--tab-bg": `${tab.color}15`,
                  "--tab-glow": `${tab.color}25`,
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: tab.color,
                  marginBottom: "4px",
                  boxShadow: active ? `0 0 8px ${tab.color}` : "none",
                }}
              />
              <span
                className={styles.tabLabel}
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stations Explorer Container */}
      <div className={styles.explorerContainer}>
        <div className={styles.explorerHeaderBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 className={styles.explorerBranchTitle}>
                {currentTabConfig.title}
              </h3>
              <p className={styles.explorerBranchDesc}>
                {currentTabConfig.description}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "8px",
                backgroundColor: `${currentTabConfig.color}18`,
                color: currentTabConfig.color,
                border: `1px solid ${currentTabConfig.color}30`,
              }}
            >
              {stationsList.length} محطة
            </span>
          </div>
        </div>

        {/* Scrollable station timeline list */}
        <div className={styles.timelineStationList}>
          {stationsList.map((station, idx) => {
            const isLast = idx === stationsList.length - 1;

            let color = "#06b6d4";
            if (station.line_type === "capital") color = "#a855f7";
            else if (station.line_type === "ramadan") color = "#10b981";

            const isTransfer =
              station.name === "عدلي منصور" ||
              station.name === "بدر" ||
              station.name === "مدينة الفنون والثقافة" ||
              station.name === "العاصمة المركزية";

            const isExpanded = expandedStation === station.name;
            const dbLandmarks =
              Array.isArray(station.landmarks) && station.landmarks.length > 0
                ? (station.landmarks as string[])
                : null;
            const staticDetails = STATION_DETAILS[station.name];
            const details =
              staticDetails || dbLandmarks
                ? {
                    landmarks: dbLandmarks || staticDetails?.landmarks || [],
                    type: staticDetails?.type || "عادية",
                    status: station.status || staticDetails?.status || "تشغيل فعلي",
                  }
                : null;

            return (
              <div
                id={`station-${station.name}`}
                key={`${station.line_type}-${station.name}-${idx}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  paddingRight: "26px",
                }}
              >
                {/* Circle Node on the timeline */}
                <div
                  style={{
                    position: "absolute",
                    right: "2px",
                    top: "16px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background:
                      details?.status === "تحت الإنشاء" ? "var(--bgPrimary)" : color,
                    border:
                      details?.status === "تحت الإنشاء"
                        ? `3px dashed ${color}`
                        : `3.5px solid var(--bgPrimary, #000)`,
                    zIndex: 2,
                    boxShadow: isExpanded ? `0 0 10px ${color}` : `0 0 6px ${color}40`,
                    transition: "all 0.3s ease",
                  }}
                />

                {/* Content Box */}
                <div
                  onClick={() => onToggleStation(station.name)}
                  className={`${styles.stationNodeCard} ${
                    isExpanded ? styles.stationNodeCardExpanded : ""
                  }`}
                  style={
                    {
                      "--node-color": color,
                      "--node-glow": `${color}30`,
                      opacity: details?.status === "تحت الإنشاء" ? 0.8 : 1,
                    } as React.CSSProperties
                  }
                >
                  {/* Header Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: "800",
                          color:
                            details?.status === "تحت الإنشاء"
                              ? "var(--text-secondary)"
                              : "var(--text-primary)",
                        }}
                      >
                        {station.name}
                      </span>
                      {details?.status === "تحت الإنشاء" && (
                        <span
                          style={{
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ef4444",
                            fontSize: "0.68rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          تحت الإنشاء 🚧
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isTransfer && (
                        <span
                          style={{
                            background: "rgba(251, 191, 36, 0.12)",
                            color: "#fbbf24",
                            fontSize: "0.7rem",
                            padding: "2px 7px",
                            borderRadius: "6px",
                            fontWeight: "700",
                            border: "1px solid rgba(251, 191, 36, 0.25)",
                          }}
                        >
                          محطة تبادلية 🔀
                        </span>
                      )}
                      <i
                        className={`bx bx-chevron-${isExpanded ? "up" : "down"}`}
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "1.2rem",
                        }}
                      />
                    </div>
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border-glass)",
                        paddingTop: "12px",
                        marginTop: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        animation: "fadeIn 0.25s ease",
                      }}
                    >
                      {details ? (
                        <>
                          {/* Connection Type */}
                          {details.type && (
                            <div
                              style={{
                                fontSize: "0.82rem",
                                color: "var(--text-secondary)",
                                background: "rgba(6, 182, 212, 0.06)",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "1px solid rgba(6, 182, 212, 0.15)",
                              }}
                            >
                              <strong style={{ color: "var(--text-primary)" }}>
                                🔗 طبيعة المحطة:
                              </strong>{" "}
                              {details.type}
                            </div>
                          )}

                          {/* Landmarks */}
                          {details.landmarks && details.landmarks.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--text-secondary)",
                                  marginBottom: "6px",
                                  fontWeight: "700",
                                }}
                              >
                                📍 المعالم والمواقع المحيطة:
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {details.landmarks.map((landmark, lIdx) => (
                                  <span
                                    key={lIdx}
                                    style={{
                                      background: "var(--bg-secondary)",
                                      color: "var(--text-secondary)",
                                      fontSize: "0.78rem",
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      border: "1px solid var(--border-glass)",
                                    }}
                                  >
                                    {landmark}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-secondary)",
                            fontStyle: "italic",
                          }}
                        >
                          لا توجد تفاصيل إضافية مسجلة لهذه المحطة حالياً.
                        </span>
                      )}

                      {/* Report Station Issue Button */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: "6px",
                          borderTop: "1px dashed var(--border-glass)",
                          paddingTop: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReportModal(station.name);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "0.76rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontFamily: "inherit",
                            padding: "2px 6px",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.textDecoration = "underline")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.textDecoration = "none")
                          }
                        >
                          <i className="fa-solid fa-triangle-exclamation" />
                          <span>الإبلاغ عن مشكلة في هذه المحطة</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rail segment */}
                {!isLast && (
                  <div
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "28px",
                      bottom: "-10px",
                      width: "2px",
                      backgroundColor: color,
                      opacity: 0.35,
                      zIndex: 1,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
