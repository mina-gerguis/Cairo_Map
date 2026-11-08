import React from "react";
import Image from "next/image";
import { LrtLineExplorerProps, LrtStation } from "../types";
import { LRT_LINE_TABS, STATION_DETAILS } from "../constants";
import ProjectBanner from "@/components/common/ProjectBanner";
import styles from "../lrt.module.css";

/**
 * Returns transit logo and name depending on the transfer type
 */
function getTransferInfo(typeStr: string) {
  if (typeStr.includes("مترو") || typeStr.includes("المترو")) {
    return {
      name: "مترو الأنفاق (الخط 3)",
      logo: "/images/transit/metro.webp",
      alt: "مترو الأنفاق",
    };
  }
  if (typeStr.includes("مونوريل") || typeStr.includes("المونوريل")) {
    return {
      name: "مونوريل العاصمة",
      logo: "/images/transit/monorail_east.webp",
      alt: "مونوريل العاصمة",
    };
  }
  if (typeStr.includes("BRT") || typeStr.includes("الترددي")) {
    return {
      name: "الأتوبيس الترددي BRT",
      logo: "/images/transit/brt.webp",
      alt: "الأتوبيس الترددي BRT",
    };
  }
  if (typeStr.includes("السريع") || typeStr.includes("سكة حديد") || typeStr.includes("قطار")) {
    return {
      name: "القطار الكهربائي السريع / السكك الحديدية",
      logo: "/images/transit/train.webp",
      alt: "قطار سريع",
    };
  }
  return {
    name: "محطة تبادلية",
    logo: "/images/transit/transfer.webp",
    alt: "محطة تبادلية",
  };
}

/**
 * Generates Google Maps search / navigation URL for an LRT station
 */
function getGoogleMapsUrl(stationName: string): string {
  const query = encodeURIComponent(`محطة القطار الكهربائي الخفيف LRT ${stationName}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function LrtLineExplorer({
  panelRef,
  activeLine,
  onSelectTab,
  stations,
  expandedStation,
  onToggleStation,
  onOpenReportModal,
}: LrtLineExplorerProps) {
  const [lineSearchQuery, setLineSearchQuery] = React.useState("");

  const currentTabConfig =
    LRT_LINE_TABS.find((t) => t.id === activeLine) || LRT_LINE_TABS[0];
  const color = currentTabConfig.color;

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

  const filteredStations = React.useMemo(() => {
    const q = lineSearchQuery.trim();
    if (!q) return stationsList;
    return stationsList.filter((s) => {
      const details = STATION_DETAILS[s.name];
      const matchName = s.name.includes(q);
      const matchLandmark = details?.landmarks?.some((l) => l.includes(q));
      return matchName || matchLandmark;
    });
  }, [stationsList, lineSearchQuery]);

  return (
    <div id="lrt-line-explorer-panel" ref={panelRef} className={styles.stationCard}>
      {/* Tab Switcher & Header */}
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h3 className={styles.stationName}>{currentTabConfig.title}</h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {currentTabConfig.description}
            </p>
          </div>
        </div>

        {/* Sub-branch pill tabs */}
        <div className={styles.branchTabs}>
          {LRT_LINE_TABS.map((tab) => {
            const active = activeLine === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id);
                  setLineSearchQuery("");
                }}
                className={`${styles.branchTab} ${active ? styles.branchTabActive : ""}`}
                style={
                  active
                    ? {
                        borderColor: tab.color,
                        color: tab.color,
                      }
                    : undefined
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details Grid (From, To, Count) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>محطة البداية</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {stationsList[0]?.name || "عدلي منصور"}
          </span>
        </div>

        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>محطة النهاية</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {stationsList[stationsList.length - 1]?.name || "مدينة الفنون"}
          </span>
        </div>

        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>المحطات</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--color-fg)" }}>
            {stationsList.length} محطة
          </span>
        </div>
      </div>

      {/* Search inside line stations */}
      <div style={{ position: "relative" }}>
        <input
          className="input-fields"
          placeholder={`ابحث في محطات مسار ${currentTabConfig.label}...`}
          value={lineSearchQuery}
          onChange={(e) => setLineSearchQuery(e.target.value)}
          style={{
            height: "44px",
            fontSize: "0.88rem",
            width: "100%",
            borderRadius: "10px",
            padding: "0 14px",
            paddingLeft: lineSearchQuery ? "38px" : "14px",
          }}
        />
        {lineSearchQuery && (
          <button
            type="button"
            onClick={() => setLineSearchQuery("")}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Stations Timeline List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filteredStations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            لا توجد محطات مطابقة للبحث
          </div>
        ) : (
          filteredStations.map((stationItem, idx) => {
            const station = stationItem.name;
            const details = STATION_DETAILS[station];
            // Prefer landmarks and status directly from database / state (stationItem), fallback to STATION_DETAILS
            const landmarks =
              stationItem.landmarks && Array.isArray(stationItem.landmarks) && stationItem.landmarks.length > 0
                ? stationItem.landmarks
                : details?.landmarks || [];
            const status = stationItem.status || details?.status || "تشغيل فعلي";
            const isUnderConstruction = status === "تحت الإنشاء";

            const isFirst = idx === 0 && !lineSearchQuery;
            const isLast = idx === filteredStations.length - 1 && !lineSearchQuery;
            const isTransfer =
              Boolean(stationItem.type?.includes("تبادلية")) ||
              Boolean(details?.type?.includes("تبادلية")) ||
              station === "عدلي منصور" ||
              station === "بدر" ||
              station === "مدينة الفنون والثقافة" ||
              station === "العاصمة المركزية";
            const isExpanded = expandedStation === station;
            const transferInfo = isTransfer
              ? getTransferInfo(stationItem.type || details?.type || "")
              : null;
            const googleMapsUrl = getGoogleMapsUrl(station);

            return (
              <div key={`${stationItem.line_type}-${station}-${idx}`} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minHeight: "36px",
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "16px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: isTransfer || isFirst || isLast ? "12px" : "8px",
                        height: isTransfer || isFirst || isLast ? "12px" : "8px",
                        borderRadius: "50%",
                        backgroundColor: isUnderConstruction
                          ? "transparent"
                          : isTransfer
                          ? "#f59e0b"
                          : color,
                        border: isUnderConstruction
                          ? `2px dashed #ef4444`
                          : isFirst || isLast
                          ? `2px solid var(--color-bg, #18181b)`
                          : "none",
                        boxShadow:
                          isUnderConstruction
                            ? "none"
                            : isFirst || isLast
                            ? `0 0 0 2px ${color}`
                            : "none",
                      }}
                    />
                  </div>

                  {/* Text & Badges */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexGrow: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      onClick={() => onToggleStation(station)}
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: isFirst || isLast || isTransfer ? "800" : "600",
                        color: "var(--color-fg)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      {station}
                      <i
                        className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
                        style={{
                          fontSize: "0.95rem",
                          color: isExpanded ? "var(--color-secondary, #06b6d4)" : "var(--text-muted)",
                          transition: "all 0.2s ease",
                        }}
                      />
                      {isFirst && (
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "6px" }}>
                          (بداية المسار)
                        </span>
                      )}
                      {isLast && (
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "6px" }}>
                          (نهاية المسار)
                        </span>
                      )}
                    </span>

                    {/* Transfer badge with logo and text */}
                    {isTransfer && transferInfo && (
                      <div style={{ display: "flex", gap: "6px", marginRight: "auto" }}>
                        <span
                          className="font-inter"
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            color: "var(--tab-active-color)",
                            background: "var(--tab-active-bg)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Image
                            src={transferInfo.logo}
                            alt={transferInfo.alt}
                            width={14}
                            height={14}
                            style={{ objectFit: "contain", borderRadius: "2px" }}
                          />
                          <span>تبادلية مع {transferInfo.name}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Landmarks / Status details */}
                {isExpanded && (
                  <div className="rounded-lg p-4 bg-glass mt-1">
                    {/* Station Operational Status */}
                    {isUnderConstruction ? (
                      <div
                        style={{
                          color: "#ef4444",
                          fontSize: "0.78rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "8px",
                        }}
                      >
                        <span>⚠️ هذه المحطة قيد الإنشاء والتجهيز وليست في الخدمة الفعلية بعد.</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "#10b981",
                          fontSize: "0.78rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "8px",
                        }}
                      >
                        <span>⚡ حالة المحطة: تشغيل فعلي بالركاب.</span>
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        marginBottom: "6px",
                        fontWeight: "700",
                      }}
                    >
                      المعالم والأماكن الحيوية القريبة من المحطة:
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {landmarks.length > 0 ? (
                        landmarks.map((landmark: string, lIdx: number) => (
                          <span
                            key={lIdx}
                            style={{
                              fontSize: "0.74rem",
                              background: "rgba(255, 255, 255, 0.05)",
                              color: "var(--color-fg)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                            }}
                          >
                            📍 {landmark}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          لم يتم تسجيل معالم قريبة لهذه المحطة بعد.
                        </span>
                      )}
                    </div>

                    {/* Google Maps Button & Station Actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "14px",
                        paddingTop: "10px",
                        borderTop: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                      }}
                    >
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          background: "rgba(6, 182, 212, 0.12)",
                          color: "#06b6d4",
                          border: "1px solid rgba(6, 182, 212, 0.28)",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <i className="fa-solid fa-map-location-dot" style={{ fontSize: "0.85rem" }} />
                        <span>فتح موقع المحطة على خرائط جوجل ↗</span>
                      </a>
                    </div>

                    {/* Station Report Problem Banner using ProjectBanner */}
                    <div style={{ marginTop: "12px" }}>
                      <ProjectBanner
                        variant="error"
                        label={`هل لاحظت بيانات غير دقيقة في محطة ${station}؟`}
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
                          onClick: () => onOpenReportModal(station),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
