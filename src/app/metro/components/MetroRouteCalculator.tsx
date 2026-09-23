import React from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { MetroRouteCalculatorProps } from "../types";
import { LINE_COLORS, LINE_NAMES } from "../constants";
import { normalizeArabic } from "../utils";
import styles from "../metro.module.css";

export default function MetroRouteCalculator({
  panelRef,
  selectedFrom,
  selectedTo,
  fromQuery,
  toQuery,
  showFromList,
  showToList,
  filteredFrom,
  filteredTo,
  stations,
  onSelectFrom,
  onSelectTo,
  onFromQueryChange,
  onToQueryChange,
  onFromFocus,
  onFromBlur,
  onToFocus,
  onToBlur,
  onSwapStations,
  onFindNearest,
  locatingNearest,
  nearestDistance,
  result,
  onFindRoute,
  isTripActive,
  currentStepIndex,
  copiedRoute,
  whatsappShareUrl,
  onStartTrip,
  onEndTrip,
  onStepNext,
  onShareRoute,
  onOpenReportModal,
}: MetroRouteCalculatorProps) {
  return (
    <div ref={panelRef} className={styles.searchBentoCard}>
      {/* Title & Nearest Station GPS Button */}
      <div className={styles.searchBentoHeader}>
        <h2 className={styles.searchTitle}>
          <i className="bx bx-trip" style={{ color: "var(--color-secondary, #3b82f6)", fontSize: "1.4rem" }} />
          <span>حاسبة ومخطط رحلات المترو</span>
        </h2>

        <button
          type="button"
          onClick={onFindNearest}
          disabled={locatingNearest}
          className={styles.gpsBtn}
          title="تحديد أقرب محطة مترو لموقعي الحالي عبر الـ GPS"
        >
          <i className={locatingNearest ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-location-crosshairs"}></i>
          <span>{locatingNearest ? "جاري التحديد..." : "أقرب محطة مني"}</span>
        </button>
      </div>

      {/* Search Inputs Container */}
      <div className={styles.inputGroup}>
        {/* FROM STATION INPUT */}
        <div className={styles.inputWrapper} style={{ zIndex: showFromList ? 30 : 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label className={styles.fieldLabel} style={{ margin: 0 }}>
              <i className="fa-solid fa-circle-dot" style={{ color: "var(--colorSuccess, #10b981)" }}></i>
              <span>محطة الركوب (من):</span>
              {nearestDistance && selectedFrom && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--colorSuccess, #10b981)",
                    fontWeight: "700",
                    marginRight: "6px",
                    background: "rgba(16, 185, 129, 0.12)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  أقرب محطة ({nearestDistance})
                </span>
              )}
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                onFromQueryChange(text);
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <input
              className="input-fields"
              placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: التحرير، برج القاهرة، جامعة حلوان)"
              value={fromQuery}
              onChange={(e) => onFromQueryChange(e.target.value)}
              onFocus={onFromFocus}
              onBlur={() => setTimeout(onFromBlur, 250)}
              style={{
                width: "100%",
                direction: "rtl",
                paddingLeft: selectedFrom || fromQuery ? "85px" : "16px",
              }}
            />
            {selectedFrom && (
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.72rem",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary, #3b82f6)",
                  padding: "3px 8px",
                  borderRadius: "8px",
                  fontWeight: "700",
                }}
              >
                تم الاختيار ✔
              </span>
            )}
          </div>

          {showFromList && filteredFrom.length > 0 && (
            <div className={styles.dropdownList}>
              {filteredFrom.map((s) => {
                const q = normalizeArabic(fromQuery.trim());
                const matchedLandmark = q
                  ? (s.landmarks || []).find((l) => normalizeArabic(l).includes(q))
                  : null;
                return (
                  <div
                    key={s.name}
                    onMouseDown={() => onSelectFrom(s.name)}
                    className={styles.dropdownItem}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: "700", color: "var(--text-primary)" }}>
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-secondary, #3b82f6)", fontWeight: "bold" }}>
                          📍 قريب من: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {s.lines.map((l) => (
                          <span
                            key={l}
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: LINE_COLORS[l],
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                      {s.isTransfer && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "var(--colorWarning, #f59e0b)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontWeight: "700",
                          }}
                        >
                          تبادلية
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SWAP BUTTON */}
        <div className={styles.swapBtnWrapper}>
          <button
            type="button"
            onClick={onSwapStations}
            className={styles.swapBtn}
            title="تبديل محطة القيام والوصول"
            aria-label="تبديل المحطات"
          >
            ⇅
          </button>
        </div>

        {/* TO STATION INPUT */}
        <div className={styles.inputWrapper} style={{ zIndex: showToList ? 30 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label className={styles.fieldLabel} style={{ margin: 0 }}>
              <i className="fa-solid fa-circle-dot" style={{ color: "#ef4444" }}></i>
              <span>محطة الوصول (إلى):</span>
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                onToQueryChange(text);
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <input
              className="input-fields"
              placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: العباسية، الأوبرا، قصر عابدين)"
              value={toQuery}
              onChange={(e) => onToQueryChange(e.target.value)}
              onFocus={onToFocus}
              onBlur={() => setTimeout(onToBlur, 250)}
              style={{
                width: "100%",
                direction: "rtl",
                paddingLeft: selectedTo || toQuery ? "85px" : "16px",
              }}
            />
            {selectedTo && (
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.72rem",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary, #3b82f6)",
                  padding: "3px 8px",
                  borderRadius: "8px",
                  fontWeight: "700",
                }}
              >
                تم الاختيار ✔
              </span>
            )}
          </div>

          {showToList && filteredTo.length > 0 && (
            <div className={styles.dropdownList}>
              {filteredTo.map((s) => {
                const q = normalizeArabic(toQuery.trim());
                const matchedLandmark = q
                  ? (s.landmarks || []).find((l) => normalizeArabic(l).includes(q))
                  : null;
                return (
                  <div
                    key={s.name}
                    onMouseDown={() => onSelectTo(s.name)}
                    className={styles.dropdownItem}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: "700", color: "var(--text-primary)" }}>
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-secondary, #3b82f6)", fontWeight: "bold" }}>
                          📍 قريب من: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {s.lines.map((l) => (
                          <span
                            key={l}
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: LINE_COLORS[l],
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                      {s.isTransfer && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "var(--colorWarning, #f59e0b)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontWeight: "700",
                          }}
                        >
                          تبادلية
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SEARCH ACTION BUTTON */}
      <button
        type="button"
        onClick={onFindRoute}
        disabled={!selectedFrom || !selectedTo}
        className={styles.calculateActionBtn}
      >
        <i className="fa-solid fa-magnifying-glass" />
        <span>اعرض مسار وتفاصيل الرحلة</span>
      </button>

      {/* TRIP RESULTS */}
      {result && (
        <div className={styles.routeResultCard}>
          {/* Not Found State */}
          {!result.found ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px 0" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>😕</div>
              <h4 style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                عذراً، تعذر العثور على مسار
              </h4>
              <p style={{ fontSize: "0.88rem", margin: 0 }}>{result.description}</p>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className={styles.metricsGrid}>
                {/* Number of Stations */}
                <div className={styles.metricTile}>
                  <div className={styles.metricTileIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                    <i className="bx bx-train" />
                  </div>
                  <div>
                    <p className={styles.metricTileLabel}>عدد المحطات</p>
                    <p className={styles.metricTileVal}>{result.stationCount} محطة</p>
                  </div>
                </div>

                {/* Ticket Price */}
                <div className={styles.metricTile}>
                  <div className={styles.metricTileIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                    <i className="bx bx-purchase-tag-alt" />
                  </div>
                  <div>
                    <p className={styles.metricTileLabel}>سعر التذكرة</p>
                    <p className={styles.metricTileVal} style={{ color: "#10b981" }}>{result.price} ج.م</p>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className={styles.metricTile}>
                  <div className={styles.metricTileIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                    <i className="bx bx-time" />
                  </div>
                  <div>
                    <p className={styles.metricTileLabel}>زمن الرحلة</p>
                    <p className={styles.metricTileVal}>{result.estimatedTime} دقيقة</p>
                  </div>
                </div>

                {/* Transfers */}
                <div className={styles.metricTile}>
                  <div className={styles.metricTileIcon} style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                    <i className="bx bx-transfer" />
                  </div>
                  <div>
                    <p className={styles.metricTileLabel}>التحويلات</p>
                    <p className={styles.metricTileVal} style={{ color: result.needsTransfer ? "#f59e0b" : "#10b981" }}>
                      {result.needsTransfer ? `${result.transfers.length} تبديل` : "خط مباشر"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative Guidance Banner */}
              {!isTripActive && (
                <div className={styles.routeInstructionsBanner}>
                  <i className="bx bxs-info-circle" style={{ color: "var(--color-secondary, #3b82f6)", fontSize: "1.2rem", flexShrink: 0 }} />
                  <span>{result.description}</span>
                </div>
              )}

              {/* Action Buttons Row */}
              {!isTripActive && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                    onClick={onStartTrip}
                    style={{ flex: "1 1 140px", justifyContent: "center", height: "40px" }}
                  >
                    <i className="fa-solid fa-play"></i>
                    <span>بدء تتبع الرحلة (GPS)</span>
                  </button>

                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={onShareRoute}
                    style={{ flex: "1 1 120px", justifyContent: "center", height: "40px" }}
                  >
                    <i className={copiedRoute ? "fa-solid fa-check" : "fa-solid fa-share-nodes"}></i>
                    <span>{copiedRoute ? "تم النسخ بنجاح ✔" : "مشاركة المسار"}</span>
                  </button>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionButton}
                    style={{
                      background: "rgba(37, 211, 102, 0.15)",
                      borderColor: "rgba(37, 211, 102, 0.3)",
                      color: "#25d366",
                      justifyContent: "center",
                      height: "40px",
                      flex: "1 1 140px",
                    }}
                  >
                    <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }} />
                    <span>مشاركة عبر واتساب</span>
                  </a>
                </div>
              )}

              {/* Active Trip Live Tracker Box */}
              {isTripActive && (
                <div className={styles.stepTrackerBox}>
                  <div className={styles.stepHeader}>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        color: "var(--color-secondary, #3b82f6)",
                        background: "rgba(59, 130, 246, 0.12)",
                        padding: "4px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="fa-solid fa-location-arrow" style={{ marginLeft: "4px" }} />
                      تتبع الرحلة نشط
                    </span>

                    <button
                      type="button"
                      onClick={onEndTrip}
                      style={{
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: "rgba(239, 68, 68, 0.12)",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <i className="fa-solid fa-xmark" style={{ marginLeft: "4px" }} />
                      إنهاء التتبع
                    </button>
                  </div>

                  <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    أنت الآن في محطة:{" "}
                    <strong style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>
                      {result.detailedPath[currentStepIndex]?.station}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginRight: "8px" }}>
                      ({currentStepIndex + 1} من {result.detailedPath.length})
                    </span>
                  </div>

                  {(() => {
                    const uniqueRemainingStations = Array.from(
                      new Set(result.detailedPath.slice(currentStepIndex).map((s) => s.station))
                    );
                    const remainingTime = Math.max(0, (uniqueRemainingStations.length - 1) * 2);
                    return (
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                        الوقت المتبقي التقديري:{" "}
                        <strong style={{ color: "var(--color-secondary, #3b82f6)" }}>{remainingTime} دقيقة</strong>
                      </div>
                    );
                  })()}

                  {result.detailedPath[currentStepIndex]?.isTransferPoint && (
                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "10px",
                        padding: "12px",
                        fontSize: "0.85rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <div style={{ fontWeight: "800", color: "#f59e0b", marginBottom: "4px" }}>
                        ⚠️ محطة تبديل خطوط المترو!
                      </div>
                      انزل هنا من القطار وتوجه نحو رصيف{" "}
                      <strong
                        style={{
                          color:
                            LINE_COLORS[result.detailedPath[currentStepIndex]?.targetLine!] || "#10b981",
                        }}
                      >
                        {LINE_NAMES[result.detailedPath[currentStepIndex]?.targetLine!]}
                      </strong>{" "}
                      واتبع الإرشادات للركوب في الاتجاه المطلوب.
                    </div>
                  )}

                  {currentStepIndex < result.detailedPath.length - 1 ? (
                    <button
                      type="button"
                      className={styles.calculateActionBtn}
                      onClick={onStepNext}
                      style={{ height: "42px", marginTop: "4px" }}
                    >
                      <span>وصلت لمحطة {result.detailedPath[currentStepIndex + 1]?.station} ←</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        borderRadius: "10px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "4px" }}>🎉</div>
                      <h4 style={{ color: "#10b981", fontWeight: "800", margin: "0 0 4px" }}>
                        حمدلله على السلامة!
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 12px" }}>
                        لقد وصلت بنجاح إلى وجهتك محطة {result.detailedPath[currentStepIndex]?.station}.
                      </p>
                      <button
                        type="button"
                        onClick={onEndTrip}
                        className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                        style={{ margin: "0 auto", padding: "8px 20px" }}
                      >
                        إنهاء الرحلة
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Path Steps List */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                    margin: "0 0 14px",
                    fontFamily: "var(--font-sub, inherit)",
                  }}
                >
                  مسار الرحلة بالتفصيل ({result.detailedPath.length} محطة)
                </h3>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {result.detailedPath.map((node, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === result.detailedPath.length - 1;
                    const isTransfer = node.isTransferPoint;
                    const activeColor = LINE_COLORS[node.line] || "#3b82f6";
                    const isPassed = isTripActive && idx < currentStepIndex;
                    const isCurrent = isTripActive && idx === currentStepIndex;

                    const stationObj = stations.find((s) => s.name === node.station);
                    const isUnderConstruction = stationObj?.status === "تحت الإنشاء";

                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "34px" }}>
                          {/* Station Dot */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              width: "16px",
                              flexShrink: 0,
                            }}
                          >
                            {isPassed ? (
                              <div
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  borderRadius: "50%",
                                  backgroundColor: "#10b981",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  fontSize: "0.6rem",
                                  fontWeight: "bold",
                                }}
                              >
                                ✓
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: isFirst || isLast || isTransfer ? "12px" : "8px",
                                  height: isFirst || isLast || isTransfer ? "12px" : "8px",
                                  borderRadius: "50%",
                                  backgroundColor: isUnderConstruction
                                    ? "transparent"
                                    : isFirst || isLast
                                    ? activeColor
                                    : isTransfer
                                    ? "#f59e0b"
                                    : activeColor,
                                  border: isUnderConstruction
                                    ? `2px dashed #ef4444`
                                    : isFirst || isLast
                                    ? `2px solid var(--bgPrimary, #18181b)`
                                    : "none",
                                  boxShadow:
                                    isUnderConstruction
                                      ? "none"
                                      : isFirst || isLast
                                      ? `0 0 0 2px ${activeColor}`
                                      : "none",
                                }}
                              />
                            )}
                          </div>

                          {/* Station Name & Badges */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              flexGrow: 1,
                              opacity: isPassed ? 0.5 : 1,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span
                                style={{
                                  fontSize: "0.88rem",
                                  fontWeight: isFirst || isLast || isTransfer || isCurrent ? "800" : "600",
                                  color: isUnderConstruction
                                    ? "#ef4444"
                                    : isCurrent
                                    ? "var(--color-secondary, #3b82f6)"
                                    : isFirst || isLast
                                    ? "var(--text-primary)"
                                    : "var(--text-secondary)",
                                }}
                              >
                                {node.station}
                              </span>
                              {isFirst && (
                                <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  محطة الركوب
                                </span>
                              )}
                              {isLast && (
                                <span style={{ fontSize: "0.7rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  محطة الوصول
                                </span>
                              )}
                            </div>

                            <span
                              style={{
                                fontSize: "0.68rem",
                                color: "#ffffff",
                                background: activeColor,
                                padding: "2px 6px",
                                borderRadius: "6px",
                                fontWeight: "700",
                              }}
                            >
                              {LINE_NAMES[node.line]?.split(" ")[0] + " " + LINE_NAMES[node.line]?.split(" ")[1]}
                            </span>
                          </div>
                        </div>

                        {/* Connective Line Between Stops */}
                        {!isLast && (
                          <div style={{ display: "flex", gap: "12px", minHeight: "16px" }}>
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
                                  backgroundColor: activeColor,
                                  minHeight: "16px",
                                  opacity: 0.35,
                                }}
                              />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                              {isTransfer && (
                                <div
                                  style={{
                                    background: "rgba(245, 158, 11, 0.08)",
                                    border: "1px solid rgba(245, 158, 11, 0.25)",
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    margin: "4px 0",
                                    fontSize: "0.78rem",
                                    color: "#f59e0b",
                                    fontWeight: "700",
                                  }}
                                >
                                  🔄 محطة تبديل: التحويل إلى {LINE_NAMES[node.targetLine!]}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Route Report Problem Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
                <button
                  type="button"
                  onClick={() => onOpenReportModal(null, true)}
                  className={styles.actionButton}
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                >
                  <i className="fa-solid fa-flag" style={{ color: "#f59e0b" }} />
                  <span>الإبلاغ عن خطأ في حساب هذا المسار</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
