import React from "react";
import { LineId, MetroLineExplorerProps } from "../types";
import { LINE_COLORS, LINE_NAMES } from "../constants";

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
    <div ref={panelRef} className="details-panel">
      {/* Line Header & Line 3 Branch Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h5 className="text-lg fw-bold" style={{ margin: 0 }}>
          {selectedLineObj.name}
        </h5>

        {/* Line 3 sub-branches tabs */}
        {explorerLine === "line3" && (
          <div
            className="tabs"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "6px",
              marginBottom: 0,
              padding: "4px",
            }}
          >
            {[
              { id: "trunk", name: "الفرع الرئيسي" },
              { id: "branchA", name: "اتجاه روض الفرج" },
              { id: "branchB", name: "اتجاه جامعة القاهرة" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectBranch(tab.id as any)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: line3ActiveBranch === tab.id ? "var(--text-primary)" : "transparent",
                  color: line3ActiveBranch === tab.id ? "var(--bgMode)" : "var(--text-primary)",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Grid (From, To, Count) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "800",
              color: color,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentExplorerStations[0]?.name || selectedLineObj.from}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "800",
              color: color,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentExplorerStations[currentExplorerStations.length - 1]?.name || selectedLineObj.to}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentExplorerStations.length > 0
              ? `${currentExplorerStations.length} محطة`
              : "تحت الإنشاء"}
          </div>
        </div>
      </div>

      {/* Detailed stops vertical timeline */}
      <div
        style={{
          background: "var(--bg-glass)",
          padding: "20px 16px",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--border-glass)",
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
          <h2 className="text-md fw-bold" style={{ margin: 0 }}>
            المحطات المسجلة على هذا الخط
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            انقر على اسم المحطة لاستعراض المعالم القريبة
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
                      minHeight: "34px",
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
                            ? "var(--colorWarning, #f59e0b)"
                            : color,
                          border: isUnderConstruction
                            ? `2px dashed var(--colorDanger)`
                            : isFirst || isLast
                            ? `2px solid var(--bgPrimary)`
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
                        gap: "8px",
                        flexGrow: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        onClick={() => onToggleStation(station)}
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: isFirst || isLast || isTransfer ? "700" : "500",
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
                                ? "var(--color-secondary)"
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
                            (بدايــة الخط)
                          </span>
                        )}
                        {isLast && (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "6px" }}>
                            (نهـاية الخط)
                          </span>
                        )}
                      </span>

                      {/* Transfer switcher buttons */}
                      {isTransfer && (
                        <div style={{ display: "flex", gap: "4px", marginRight: "auto" }}>
                          {allLinesForStation
                            .filter((l) => l !== explorerLine)
                            .map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => onSwitchLine(l)}
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: "700",
                                  color: LINE_COLORS[l] || "#3b82f6",
                                  background: (LINE_COLORS[l] || "#3b82f6") + "1a",
                                  border: `1px solid ${(LINE_COLORS[l] || "#3b82f6")}33`,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
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
                        margin: "4px 16px 12px 28px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "var(--bg-secondary)",
                        border: isUnderConstruction
                          ? "1px dashed rgba(239, 68, 68, 0.3)"
                          : "1px solid var(--border-glass)",
                      }}
                    >
                      {isUnderConstruction && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <span>⚠️ هذه المحطة قيد الإنشاء وليست في الخدمة الفعلية بعد.</span>
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-primary)",
                          marginBottom: "6px",
                          fontWeight: "bold",
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
                                fontSize: "0.72rem",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "var(--text-primary)",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                border: "1px solid var(--border-glass)",
                              }}
                            >
                              {landmark}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                            لم يتم تسجيل معالم قريبة لهذه المحطة بعد.
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "8px",
                          borderTop: "1px solid var(--border-glass)",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-report"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReportModal(station);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.74rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.75rem" }}></i>
                          الإبلاغ عن خطأ في محطة {station}
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
                            opacity: 0.4,
                          }}
                        />
                      </div>
                      <div style={{ flexGrow: 1 }} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              className="sub-title"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.88rem",
                textAlign: "center",
                padding: "12px",
              }}
            >
              لا توجد محطات مضافة لهذا الخط بعد (المشروع تحت التخطيط والإنشاء).
            </div>
          )}
        </div>
      </div>

      {/* Tips / Info Section */}
      <div
        style={{
          marginTop: "12px",
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card)",
          padding: "16px",
        }}
      >
        <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.88rem" }}>
          <i
            className="bx bxs-info-circle"
            style={{
              marginLeft: "6px",
              color: color,
              fontSize: "1.1rem",
              verticalAlign: "middle",
            }}
          ></i>
          <strong>معلومات الخط: </strong>
          <span style={{ color: "var(--text-muted)" }}>{selectedLineObj.desc}</span>
        </p>
      </div>
    </div>
  );
}
