import React from "react";
import { LineId, MetroLineExplorerProps } from "../types";
import { LINE_COLORS, LINE_NAMES } from "../constants";
import styles from "../metro.module.css";

export default function MetroLineExplorer({
  panelRef,
  selectedLineObj,
  explorerLine,
  line3ActiveBranch,
  onSelectBranch,
  currentExplorerStations,
  expandedStation,
  onToggleStation,
  onSwitchLine,
  stationLinesMap,
  color,
  onOpenReportModal,
}: MetroLineExplorerProps) {
  return (
    <div id="metro-line-explorer-panel" ref={panelRef} className={styles.stationCard}>
      {/* Line Header & Line 3 Branch Tabs */}
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className={styles.stationIconBadge}
            style={{
              background: `${color}18`,
              borderColor: `${color}35`,
              color: color,
            }}
          >
            <i className="bx bx-git-branch" />
          </div>
          <div>
            <h2 className={styles.stationName}>{selectedLineObj.name}</h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {selectedLineObj.desc || "استعراض مسار المحطات، المعالم القريبة ومحطات التبديل"}
            </p>
          </div>
        </div>

        {/* Line 3 sub-branches tabs */}
        {explorerLine === "line3" && (
          <div className={styles.branchTabs}>
            {[
              { id: "trunk", name: "الفرع الرئيسي" },
              { id: "branchA", name: "روض الفرج" },
              { id: "branchB", name: "جامعة القاهرة" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectBranch(tab.id as any)}
                className={`${styles.branchTab} ${line3ActiveBranch === tab.id ? styles.branchTabActive : ""}`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Grid (From, To, Count) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>محطة البداية</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {currentExplorerStations[0]?.name || selectedLineObj.from}
          </span>
        </div>

        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>محطة النهاية</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {currentExplorerStations[currentExplorerStations.length - 1]?.name || selectedLineObj.to}
          </span>
        </div>

        <div className={styles.metricTile} style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>إجمالي المحطات</span>
          <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)" }}>
            {currentExplorerStations.length > 0 ? `${currentExplorerStations.length} محطة` : "تحت الإنشاء"}
          </span>
        </div>
      </div>

      {/* Detailed stops vertical timeline */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "14px",
          padding: "18px 16px",
        }}
      >
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
              color: "var(--text-primary)",
              fontFamily: "var(--font-sub, inherit)",
            }}
          >
            المحطات المسجلة على هذا الخط ({currentExplorerStations.length})
          </h3>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
            انقر على اسم المحطة لاستعراض المعالم والأماكن الحيوية
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {currentExplorerStations.length > 0 ? (
            currentExplorerStations.map((stationObj, idx) => {
              const station = stationObj.name;
              const landmarks = stationObj.landmarks || [];
              const status = stationObj.status || "تشغيل فعلي";
              const isUnderConstruction = status === "تحت الإنشاء";

              const isFirst = idx === 0;
              const isLast = idx === currentExplorerStations.length - 1;

              const allLinesForStation = Array.from(stationLinesMap.get(station) || []);
              const isTransfer = allLinesForStation.length > 1;

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
                            ? `2px solid var(--bgPrimary, #18181b)`
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
                          color: isUnderConstruction
                            ? "#ef4444"
                            : isFirst || isLast
                            ? "var(--text-primary)"
                            : "var(--text-primary)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        {station}
                        <i
                          className={`bx ${
                            expandedStation === station ? "bx-chevron-up" : "bx-chevron-down"
                          }`}
                          style={{
                            fontSize: "0.95rem",
                            color:
                              expandedStation === station
                                ? "var(--color-secondary, #3b82f6)"
                                : "var(--text-muted)",
                            transition: "all 0.2s ease",
                          }}
                        />
                        {isUnderConstruction && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            تحت الإنشاء 🚧
                          </span>
                        )}
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

                      {/* Transfer switcher buttons */}
                      {isTransfer && (
                        <div style={{ display: "flex", gap: "6px", marginRight: "auto" }}>
                          {allLinesForStation
                            .filter((l) => l !== explorerLine)
                            .map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => onSwitchLine(l)}
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: "700",
                                  color: LINE_COLORS[l] || "#3b82f6",
                                  background: (LINE_COLORS[l] || "#3b82f6") + "1a",
                                  border: `1px solid ${(LINE_COLORS[l] || "#3b82f6")}40`,
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                title={`انقر للانتقال إلى ${LINE_NAMES[l]}`}
                              >
                                تبادل مع{" "}
                                {l === "line1"
                                  ? "الخط الأول"
                                  : l === "line2"
                                  ? "الخط الثاني"
                                  : "الخط الثالث"}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Landmarks / Status details */}
                  {expandedStation === station && (
                    <div
                      style={{
                        margin: "6px 16px 14px 28px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: isUnderConstruction
                          ? "1px dashed rgba(239, 68, 68, 0.3)"
                          : "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                      }}
                    >
                      {isUnderConstruction && (
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
                                color: "var(--text-primary)",
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
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "8px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReportModal(station);
                          }}
                          className={styles.actionButton}
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                          }}
                        >
                          <i className="fa-solid fa-flag" style={{ color: "#f59e0b" }}></i>
                          <span>الإبلاغ عن تصحيح في محطة {station}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connective Line */}
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
