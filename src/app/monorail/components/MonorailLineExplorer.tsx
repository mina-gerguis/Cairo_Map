import React from "react";
import { MonorailLineExplorerProps } from "../types";
import { MONORAIL_STATION_DETAILS } from "../constants";

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
    <div ref={panelRef} className="details-panel">
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
              width: "36px",
              height: "36px",
              borderRadius: "8px",
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
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
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
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
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
            borderRadius: "var(--ra-8)",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
            }}
          >
            بداية الخط
          </div>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: "800",
              color: selectedLineObj.color,
              marginTop: "2px",
            }}
          >
            {selectedLineObj.from}
          </div>
        </div>
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
            }}
          >
            نهاية الخط
          </div>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: "800",
              color: selectedLineObj.color,
              marginTop: "2px",
            }}
          >
            {selectedLineObj.to}
          </div>
        </div>
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
            }}
          >
            طول المسار
          </div>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginTop: "2px",
            }}
          >
            {selectedLineObj.length}
          </div>
        </div>
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
            }}
          >
            زمن المسار كاملاً
          </div>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginTop: "2px",
            }}
          >
            {selectedLineObj.time}
          </div>
        </div>
      </div>

      {/* Search inside line stations */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <input
          className="input-fields"
          placeholder={`ابحث في محطات ${selectedLineObj.shortName}...`}
          value={lineSearchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          style={{ width: "100%", direction: "rtl", fontSize: "0.85rem" }}
        />
        {lineSearchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange("")}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Stations Timeline */}
      <div
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card)",
          padding: "18px 16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
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

              return (
                <div
                  key={idx}
                  id={`station-${station}`}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minHeight: "34px",
                    }}
                  >
                    {/* Timeline Dot */}
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
                          width:
                            isTransfer || isFirst || isLast ? "12px" : "8px",
                          height:
                            isTransfer || isFirst || isLast ? "12px" : "8px",
                          borderRadius: "50%",
                          backgroundColor: isUnderConstruction
                            ? "transparent"
                            : isTransfer
                            ? "var(--colorWarning, #f59e0b)"
                            : selectedLineObj.color,
                          border: isUnderConstruction
                            ? "2px dashed var(--colorDanger)"
                            : isFirst || isLast
                            ? "2px solid var(--bgPrimary)"
                            : "none",
                          boxShadow: isUnderConstruction
                            ? "none"
                            : isFirst || isLast
                            ? `0 0 0 2px ${selectedLineObj.color}`
                            : "none",
                        }}
                      />
                    </div>

                    {/* Station Name and Badges */}
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
                          fontWeight:
                            isFirst || isLast || isTransfer ? "700" : "500",
                          color: isUnderConstruction
                            ? "#ef4444"
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
                            expandedStation === station
                              ? "bx-chevron-up"
                              : "bx-chevron-down"
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
                        {details?.status === "تشغيل تجريبي" && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              background: "rgba(59, 130, 246, 0.12)",
                              color: "var(--color-secondary)",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            تشغيل تجريبي ⚡
                          </span>
                        )}
                        {isFirst && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                              marginRight: "6px",
                            }}
                          >
                            (بدايــة الخط)
                          </span>
                        )}
                        {isLast && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                              marginRight: "6px",
                            }}
                          >
                            (نهـاية الخط)
                          </span>
                        )}
                      </span>

                      {/* Transfer badge */}
                      {isTransfer && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            color: "var(--colorWarning, #f59e0b)",
                            background: "rgba(245, 158, 11, 0.1)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginRight: "auto",
                          }}
                        >
                          {details.type}
                        </span>
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
                          <span>
                            ⚠️ هذه المحطة قيد الإنشاء والتشطيب وليست في الخدمة
                            للجمهور حالياً.
                          </span>
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
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                      >
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
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                              fontStyle: "italic",
                            }}
                          >
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
                          <i
                            className="fa-solid fa-triangle-exclamation"
                            style={{ fontSize: "0.75rem" }}
                          />
                          الإبلاغ عن خطأ في محطة {station}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connective Line */}
                  {!isLast && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        minHeight: "14px",
                      }}
                    >
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
                            backgroundColor: selectedLineObj.color,
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
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.88rem",
                textAlign: "center",
                padding: "12px",
              }}
            >
              لا توجد محطات مطابقة لبحثك في هذا الخط.
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
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
              color: selectedLineObj.color,
              fontSize: "1.1rem",
              verticalAlign: "middle",
            }}
          />
          <strong>معلومات الخط: </strong>
          <span style={{ color: "var(--text-muted)" }}>
            {selectedLineObj.desc}
          </span>
        </p>
      </div>
    </div>
  );
}
