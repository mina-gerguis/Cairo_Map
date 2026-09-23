import React from "react";
import { LrtLineExplorerProps, LrtStation } from "../types";
import { LRT_LINE_TABS, STATION_DETAILS } from "../constants";

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
    <div
      ref={panelRef}
      className="metro-animate-slide-up metro-delay-300"
      style={{ marginTop: "32px" }}
    >
      <h2
        style={{
          fontSize: "1.3rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          marginBottom: "6px",
          textAlign: "center",
        }}
      >
        محطات القطار الكهربائي LRT
      </h2>
      <p
        className="sub-title"
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        اختر المسار لاستعراض المحطات والمعالم المحيطة بها تفصيلياً.
      </p>

      {/* Explorer Tab Switcher */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {LRT_LINE_TABS.map((tab) => {
          const active = activeLine === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                background: "var(--bgPrimary)",
                border: active
                  ? `2px solid ${tab.color}`
                  : "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "10px 4px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "center",
                boxShadow: active ? `0 0 10px ${tab.color}15` : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--hoverBtn)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "var(--bgPrimary)";
              }}
            >
              <div
                className="sub-title"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                }}
              >
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stations Explorer Container */}
      <div
        style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "14px",
            marginBottom: "16px",
          }}
        >
          <h3
            className="sub-title"
            style={{
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            {currentTabConfig.title}
          </h3>
          <p
            className="sub-title"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
              margin: 0,
            }}
          >
            {currentTabConfig.description}
          </p>
        </div>

        {/* Scrollable station timeline list */}
        <div
          style={{
            maxHeight: "550px",
            overflowY: "auto",
            padding: "16px 5px",
            background: "transparent",
          }}
        >
          {stationsList.map((station, idx) => {
            const isLast = idx === stationsList.length - 1;

            let color = "#06b6d4";
            if (station.line_type === "capital") color = "#a855f7";
            else if (station.line_type === "ramadan") color = "#10b981";

            const isTransfer =
              station.name === "عدلي منصور" ||
              station.name === "بدر" ||
              station.name === "مدينة الفنون والثقافة";
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
                }}
              >
                {/* Circle Node on the timeline */}
                <div
                  style={{
                    position: "absolute",
                    right: "-29px",
                    top: "15px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background:
                      details?.status === "تحت الإنشاء" ? "var(--bgPrimary)" : color,
                    border:
                      details?.status === "تحت الإنشاء"
                        ? `3px dashed ${color}`
                        : `4.5px solid var(--bgPrimary, #000)`,
                    zIndex: 2,
                    boxShadow: isExpanded ? `0 0 10px ${color}` : "none",
                    transition: "all 0.3s ease",
                  }}
                />

                {/* Content Box */}
                <div
                  onClick={() => onToggleStation(station.name)}
                  style={{
                    backgroundColor: "var(--bgPrimary)",
                    border: isExpanded
                      ? `1px solid ${color}`
                      : details?.status === "تحت الإنشاء"
                      ? `1px dashed ${color}50`
                      : "1px solid var(--border-glass)",
                    opacity: details?.status === "تحت الإنشاء" ? 0.75 : 1,
                    borderRadius: "var(--radius-card)",
                    padding: "12px 16px",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    cursor: "pointer",
                    transition:
                      "transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                    marginBottom: "4px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
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
                          fontSize: "1.02rem",
                          fontWeight: "700",
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

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {isTransfer && (
                        <span
                          style={{
                            background: "rgba(251, 191, 36, 0.12)",
                            color: "#fbbf24",
                            fontSize: "0.68rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          تبادلية
                        </span>
                      )}
                      <i
                        className={`bx bx-chevron-${isExpanded ? "up" : "down"}`}
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "1.3rem",
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
                          {/* Landmarks */}
                          <div>
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                marginBottom: "6px",
                                fontWeight: "700",
                              }}
                            >
                              📍 المعالم القريبة:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {details.landmarks.map((landmark, lIdx) => (
                                <span
                                  key={lIdx}
                                  style={{
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.78rem",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--border-glass)",
                                  }}
                                >
                                  {landmark}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Connection Type */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "14px",
                              marginTop: "4px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              🔗 نوع المحطة:{" "}
                              <strong style={{ color: "var(--text-primary)" }}>
                                {details.type}
                              </strong>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          لم يتم توفير تفاصيل إضافية لهذه المحطة حالياً.
                        </span>
                      )}

                      {/* Report Station Issue Button */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: "8px",
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
                            fontFamily: "var(--font-cairo)",
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
                      display: "flex",
                      gap: "12px",
                      minHeight: "14px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: "-22px",
                        top: "0",
                        bottom: "0",
                        width: "2px",
                        backgroundColor: color,
                        opacity: 0.5,
                      }}
                    />
                    <div style={{ height: "14px" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
