import React from "react";
import Image from "next/image";
import { MonorailLineExplorerProps } from "../types";
import { MONORAIL_STATION_DETAILS, MONORAIL_STATION_COORDINATES } from "../constants";
import ProjectBanner from "@/components/common/ProjectBanner";
import styles from "../monorail.module.css";

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
  if (typeStr.includes("LRT") || typeStr.includes("القطار الكهربائي الخفيف")) {
    return {
      name: "القطار الخفيف LRT",
      logo: "/images/transit/lrt.webp",
      alt: "قطار كهربائي خفيف LRT",
    };
  }
  if (typeStr.includes("BRT") || typeStr.includes("الترددي")) {
    return {
      name: "الأتوبيس الترددي BRT",
      logo: "/images/transit/brt.webp",
      alt: "الأتوبيس الترددي BRT",
    };
  }
  if (typeStr.includes("السريع") || typeStr.includes("HSR") || typeStr.includes("قطار")) {
    return {
      name: "القطار الكهربائي السريع",
      logo: "/images/transit/train.webp",
      alt: "القطار الكهربائي السريع",
    };
  }
  return {
    name: "محطة تبادلية",
    logo: "/images/transit/transfer.webp",
    alt: "محطة تبادلية",
  };
}

/**
 * Generates Google Maps search / navigation URL for a given monorail station
 */
function getGoogleMapsUrl(stationName: string, lineName: string): string {
  const coords = MONORAIL_STATION_COORDINATES[stationName];
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }
  const query = encodeURIComponent(`محطة مونوريل ${stationName} ${lineName}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function MonorailLineExplorer({
  panelRef,
  selectedLineObj,
  allLines,
  selectedLine,
  onSelectLine,
  currentLineStations,
  filteredCurrentLineStations,
  lineSearchQuery,
  onSearchQueryChange,
  expandedStation,
  onToggleStation,
  onOpenReportModal,
}: MonorailLineExplorerProps) {
  const color = selectedLineObj.color;

  return (
    <div id="monorail-line-explorer-panel" ref={panelRef} className={styles.stationCard}>
      {/* Line Header */}
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h2 className={styles.stationName}>{selectedLineObj.name}</h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted, #71717a)" }}>
              {selectedLineObj.desc || "استعراض مسار المحطات، المعالم القريبة ومحطات التبديل"}
            </p>
          </div>
        </div>

        {/* Switch Line Buttons */}
        <div className="w-full" style={{ display: "flex", gap: "6px" }}>
          {allLines.map((line) => {
            const isActive = selectedLine === line.id;
            return (
              <button
                key={line.id}
                type="button"
                onClick={() => onSelectLine(line.id)}
                className="btn w-full font-sub fw-700"
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  background: isActive ? "var(--tab-active-bg)" : "rgba(255, 255, 255, 0.04)",
                  color: isActive ? "var(--tab-active-color)" : "var(--text-secondary)",
                  border: isActive
                    ? `none`
                    : "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                  transition: "all 0.2s ease",
                }}
              >
                {line.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details Grid (From, To, Count) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted, #71717a)", fontWeight: "600" }}>محطة البداية</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {currentLineStations[0]?.name || selectedLineObj.from}
          </span>
        </div>

        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted, #71717a)", fontWeight: "600" }}>محطة النهاية</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {currentLineStations[currentLineStations.length - 1]?.name || selectedLineObj.to}
          </span>
        </div>

        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted, #71717a)", fontWeight: "600" }}>المحطات</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--color-fg)" }}>
            {currentLineStations.length > 0 ? `${currentLineStations.length} محطة` : "تحت الإنشاء"}
          </span>
        </div>
      </div>

      {/* Search inside line stations */}
      <div style={{ position: "relative" }}>
        <input
          className="input-fields"
          placeholder={`ابحث في محطات ${selectedLineObj.shortName}...`}
          value={lineSearchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
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
            onClick={() => onSearchQueryChange("")}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Detailed stops vertical timeline */}
      <div className="bg-secondary border border-glass rounded-lg p-4">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: "800",
              margin: 0,
              color: "var(--color-fg)",
              fontFamily: "var(--font-sub, inherit)",
            }}
          >
            المحطات المسجلة على هذا الخط ({currentLineStations.length})
          </h3>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
            انقر على اسم المحطة لاستعراض المعالم وموقعها بالخريطة
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredCurrentLineStations.length > 0 ? (
            filteredCurrentLineStations.map((stationObj, idx) => {
              const station = stationObj.name;
              const details = MONORAIL_STATION_DETAILS[station];
              const landmarks =
                stationObj.landmarks && Array.isArray(stationObj.landmarks) && stationObj.landmarks.length > 0
                  ? stationObj.landmarks
                  : details?.landmarks || [];
              const status = stationObj.status || details?.status || "تشغيل تجريبي";
              const isUnderConstruction = status === "تحت الإنشاء";

              const isFirst = idx === 0 && !lineSearchQuery;
              const isLast = idx === filteredCurrentLineStations.length - 1 && !lineSearchQuery;
              const isTransfer =
                Boolean(stationObj.type?.includes("تبادلية")) ||
                Boolean(details?.type?.includes("تبادلية"));
              const isExpanded = expandedStation === station;
              const transferInfo = isTransfer
                ? getTransferInfo(stationObj.type || details?.type || "")
                : null;
              const googleMapsUrl = getGoogleMapsUrl(station, selectedLineObj.name);

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
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
                            color: isExpanded ? "var(--color-secondary, #3b82f6)" : "var(--text-muted)",
                            transition: "all 0.2s ease",
                          }}
                        />
                        {isFirst && (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "6px" }}>
                            (بداية الخط)
                          </span>
                        )}
                        {isLast && (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "6px" }}>
                            (نهاية الخط)
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
                              background:"var(--tab-active-bg)",
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
                            color: "#3b82f6",
                            fontSize: "0.78rem",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          <span>⚡ حالة المحطة: تشغيل تجريبي بالركاب.</span>
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
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "var(--color-secondary, #3b82f6)",
                            border: "1px solid rgba(59, 130, 246, 0.28)",
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <i className="fa-solid fa-map-location-dot" style={{ fontSize: "0.85rem" }} />
                          <span>فتح موقع المحطة على خرائط جوجل ↗</span>
                        </a>
                      </div>

                      {/* Station Report Problem Banner using ProjectBanner */}
                      <div
                        style={{ marginTop: "10px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          onClick={() => onOpenReportModal(station)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Connective Line Between Stops */}
                  {!isLast && (
                    <div style={{ display: "flex", gap: "12px", minHeight: "14px" }}>
                      <div
                        style={{
                          width: "16px",
                          display: "flex",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "2px",
                            backgroundColor: color,
                            minHeight: "14px",
                            opacity: 0.35,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
              لا توجد محطات مسجلة لهذا الخط حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
