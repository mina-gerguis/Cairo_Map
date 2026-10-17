import React from "react";
import { MonorailLineExplorerProps } from "../types";
import { MONORAIL_STATION_DETAILS } from "../constants";
import styles from "../monorail.module.css";

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
  return (
    <div ref={panelRef} className={styles.explorerHeader} style={{ marginTop: "24px" }}>
      {/* Header of explorer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: `${selectedLineObj.color}18`,
              border: `1px solid ${selectedLineObj.color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: selectedLineObj.color,
              fontSize: "1.1rem",
            }}
          >
            <i className={selectedLineObj.icon} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {selectedLineObj.name}
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {currentLineStations.length} محطة — الطول: {selectedLineObj.length} — زمن الرحلة: {selectedLineObj.time}
            </span>
          </div>
        </div>

        {/* Line Switch Tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {allLines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => onSelectLine(line.id)}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                background:
                  selectedLine === line.id ? line.color : "var(--bg-secondary)",
                color: selectedLine === line.id ? "#ffffff" : "var(--text-secondary)",
                border:
                  selectedLine === line.id
                    ? `1px solid ${line.color}`
                    : "1px solid var(--border-glass)",
                transition: "all 0.2s ease",
              }}
            >
              {line.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Line Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            بداية الخط
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: "800", color: selectedLineObj.color, marginTop: "2px" }}>
            {selectedLineObj.from}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            نهاية الخط
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: "800", color: selectedLineObj.color, marginTop: "2px" }}>
            {selectedLineObj.to}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            طول المسار
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>
            {selectedLineObj.length}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            زمن المسار كاملاً
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>
            {selectedLineObj.time}
          </div>
        </div>
      </div>

      {/* Search inside line stations */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <input
          className={styles.searchInput}
          placeholder={`ابحث في محطات ${selectedLineObj.shortName}...`}
          value={lineSearchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          style={{ height: "44px", fontSize: "0.88rem" }}
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

      {/* Stations Timeline */}
      <div className={styles.stationTimelineBox}>
        {filteredCurrentLineStations.length > 0 ? (
          filteredCurrentLineStations.map((stationObj, idx) => {
            const station = stationObj.name;
            const isFirst = idx === 0 && !lineSearchQuery;
            const isLast =
              idx === filteredCurrentLineStations.length - 1 &&
              !lineSearchQuery;
            const details = MONORAIL_STATION_DETAILS[station];
            const landmarks = details?.landmarks || [];
            const isUnderConstruction = details?.status === "تحت الإنشاء";
            const isTransfer = details?.type?.includes("تبادلية");
            const isExpanded = expandedStation === station;

            return (
              <div
                key={idx}
                id={`station-${station}`}
                className={styles.stationNodeItem}
                style={{
                  borderRight: `3px solid ${isTransfer ? "#f59e0b" : selectedLineObj.color}`,
                }}
              >
                <div
                  onClick={() => onToggleStation(station)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "800",
                        color: isUnderConstruction ? "#ef4444" : "var(--text-primary)",
                      }}
                    >
                      {station}
                    </span>

                    {isFirst && (
                      <span style={{ fontSize: "0.72rem", color: selectedLineObj.color, fontWeight: "700" }}>
                        (بداية الخط 🚩)
                      </span>
                    )}
                    {isLast && (
                      <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: "700" }}>
                        (نهاية الخط 🎯)
                      </span>
                    )}

                    {isTransfer && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          color: "#f59e0b",
                          background: "rgba(245, 158, 11, 0.12)",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          padding: "2px 7px",
                          borderRadius: "6px",
                        }}
                      >
                        {details?.type || "محطة تبادلية"}
                      </span>
                    )}

                    {details?.status === "تشغيل تجريبي" && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          background: "rgba(59, 130, 246, 0.12)",
                          color: "#3b82f6",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: "700",
                        }}
                      >
                        تشغيل تجريبي ⚡
                      </span>
                    )}
                  </div>

                  <i
                    className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
                    style={{
                      fontSize: "1.2rem",
                      color: isExpanded ? selectedLineObj.color : "var(--text-secondary)",
                    }}
                  />
                </div>

                {/* Expanded Landmarks / Status details */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-glass)",
                      paddingTop: "10px",
                      marginTop: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    {landmarks.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "4px" }}>
                          📍 المعالم الحيوية القريبة:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {landmarks.map((landmark, lIdx) => (
                            <span
                              key={lIdx}
                              style={{
                                background: "var(--bg-secondary)",
                                color: "var(--text-secondary)",
                                fontSize: "0.76rem",
                                padding: "3px 8px",
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

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReportModal(station);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <i className="fa-solid fa-triangle-exclamation" />
                        <span>الإبلاغ عن مشكلة في هذه المحطة</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            لا توجد محطات مطابقة للبحث
          </div>
        )}
      </div>
    </div>
  );
}
