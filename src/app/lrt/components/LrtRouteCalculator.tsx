import React from "react";
import { LrtRouteCalculatorProps } from "../types";
import styles from "../lrt.module.css";

export default function LrtRouteCalculator({
  panelRef,
  selectedFrom,
  selectedTo,
  fromQuery,
  toQuery,
  showFromList,
  showToList,
  filteredFrom,
  filteredTo,
  onSelectFrom,
  onSelectTo,
  onFromQueryChange,
  onToQueryChange,
  onFromFocus,
  onFromBlur,
  onToFocus,
  onToBlur,
  onSwapStations,
  onFindRoute,
  result,
  isTripActive,
  currentStepIndex,
  onStartTrip,
  onEndTrip,
  onNextStep,
  onOpenReportModal,
}: LrtRouteCalculatorProps) {
  return (
    <>
      {/* Route Calculator Form Card */}
      <div ref={panelRef} className={styles.calculatorBentoCard}>
        <div className={styles.calculatorHeader}>
          <h2 className={styles.calculatorTitle}>
            <i
              className="fa-solid fa-route"
              style={{ color: "#06b6d4" }}
            />
            مخطط الرحلة وحساب التذاكر
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            حساب فوري للمسار والتعريفة
          </span>
        </div>

        <div className={styles.inputsGroup}>
          {/* FROM STATION INPUT */}
          <div style={{ position: "relative", zIndex: showFromList ? 10 : 1 }}>
            <label className={styles.inputFieldLabel}>
              <i className="fa-solid fa-circle-dot" style={{ color: "#06b6d4", fontSize: "0.75rem" }} />
              من محطة:
            </label>
            <div className={styles.searchInputWrapper}>
              <input
                className={styles.searchInput}
                placeholder="اكتب أو اختر محطة البداية..."
                value={fromQuery}
                onChange={(e) => onFromQueryChange(e.target.value)}
                onFocus={onFromFocus}
                onBlur={() => setTimeout(onFromBlur, 250)}
              />
              {selectedFrom && (
                <span className={styles.stationSelectedBadge}>
                  تم الاختيار ✔
                </span>
              )}
            </div>

            {showFromList && filteredFrom.length > 0 && (
              <div className={styles.searchDropdown}>
                {filteredFrom.map((s) => (
                  <div
                    key={s}
                    onMouseDown={() => onSelectFrom(s)}
                    className={styles.searchDropdownItem}
                  >
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      {s}
                    </span>
                    <i className="bx bx-chevron-left" style={{ color: "var(--text-secondary)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className={styles.swapBtnRow}>
            <button
              type="button"
              onClick={onSwapStations}
              aria-label="تبديل المحطات"
              className={styles.swapBtn}
            >
              ⇅
            </button>
          </div>

          {/* TO STATION INPUT */}
          <div style={{ position: "relative", zIndex: showToList ? 10 : 1 }}>
            <label className={styles.inputFieldLabel}>
              <i className="fa-solid fa-location-dot" style={{ color: "#a855f7", fontSize: "0.75rem" }} />
              إلى محطة:
            </label>
            <div className={styles.searchInputWrapper}>
              <input
                className={styles.searchInput}
                placeholder="اكتب أو اختر محطة الوصول..."
                value={toQuery}
                onChange={(e) => onToQueryChange(e.target.value)}
                onFocus={onToFocus}
                onBlur={() => setTimeout(onToBlur, 250)}
              />
              {selectedTo && (
                <span className={styles.stationSelectedBadge} style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.15)" }}>
                  تم الاختيار ✔
                </span>
              )}
            </div>

            {showToList && filteredTo.length > 0 && (
              <div className={styles.searchDropdown}>
                {filteredTo.map((s) => (
                  <div
                    key={s}
                    onMouseDown={() => onSelectTo(s)}
                    className={styles.searchDropdownItem}
                  >
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      {s}
                    </span>
                    <i className="bx bx-chevron-left" style={{ color: "var(--text-secondary)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onFindRoute}
          disabled={!selectedFrom || !selectedTo}
          className={styles.calculateBtn}
        >
          <i className="fa-solid fa-compass" />
          <span>احسب المسار والتكلفة</span>
        </button>
      </div>

      {/* Calculation results display */}
      {result && (
        <div className={styles.resultsBentoCard}>
          <div className={styles.resultsHeader}>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="fa-solid fa-signs-post" style={{ color: "#06b6d4" }} />
              تفاصيل الرحلة والمسار
            </h3>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: "8px",
                background: "rgba(6, 182, 212, 0.12)",
                color: "#06b6d4",
                fontWeight: "700",
              }}
            >
              {result.count} محطة في المسار
            </span>
          </div>

          {/* Grid Summary Cards */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricTile}>
              <div
                className={styles.metricTileValue}
                style={{ color: "#10b981" }}
              >
                {result.price} <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>ج.م</span>
              </div>
              <div className={styles.metricTileLabel}>سعر التذكرة المعتمد</div>
            </div>

            <div className={styles.metricTile}>
              <div
                className={styles.metricTileValue}
                style={{ color: "#06b6d4" }}
              >
                {result.estimatedTime} <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>د</span>
              </div>
              <div className={styles.metricTileLabel}>الوقت التقريبي</div>
            </div>

            <div className={styles.metricTile}>
              <div
                className={styles.metricTileValue}
                style={{ color: "var(--text-primary)" }}
              >
                {result.count}
              </div>
              <div className={styles.metricTileLabel}>إجمالي المحطات</div>
            </div>
          </div>

          {/* Start Trip Button */}
          {!isTripActive && (
            <button
              type="button"
              onClick={onStartTrip}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "18px",
                background: "rgba(6, 182, 212, 0.12)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#06b6d4",
                cursor: "pointer",
                fontSize: "0.92rem",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(6, 182, 212, 0.12)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <i className="fa-solid fa-play" />
              <span>بدء تتبع الرحلة المباشر</span>
            </button>
          )}

          {/* Active Trip Tracker Card */}
          {isTripActive && (
            <div className={styles.tripTrackerCard}>
              <div className={styles.tripTrackerHeader}>
                <span className={styles.tripBadge}>
                  <span className={styles.tripPulseDot} />
                  رحلة نشطة ومباشرة الآن
                </span>
                <button
                  type="button"
                  onClick={onEndTrip}
                  className={styles.cancelTripBtn}
                >
                  <i className="bx bx-trash" />
                  <span>إلغاء التتبع</span>
                </button>
              </div>

              <div className={styles.currentStationBanner}>
                أنت الآن في محطة:{" "}
                <span className={styles.currentStationName}>
                  {result.stations[currentStepIndex]}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginRight: "8px",
                  }}
                >
                  ({currentStepIndex + 1} من {result.stations.length})
                </span>
              </div>

              {(() => {
                const remainingStops = result.stations.length - 1 - currentStepIndex;
                const remainingTime = Math.max(0, remainingStops * 4);
                return (
                  <div className={styles.tripRemainingInfo}>
                    ⏱️ الوقت المتبقي للوصول:{" "}
                    <span
                      style={{
                        color: "#06b6d4",
                        fontSize: "1rem",
                        fontWeight: "800",
                      }}
                    >
                      {remainingTime} دقيقة ({remainingStops} محطة متبقية)
                    </span>
                  </div>
                );
              })()}

              {/* Controls */}
              {currentStepIndex < result.stations.length - 1 ? (
                <button
                  type="button"
                  onClick={onNextStep}
                  className={styles.nextStepBtn}
                >
                  <span>وصلت محطة {result.stations[currentStepIndex + 1]}</span>
                  <i className="fa-solid fa-arrow-left" />
                </button>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "12px",
                    padding: "18px",
                  }}
                >
                  <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>🎉</div>
                  <h4
                    style={{
                      color: "#10b981",
                      fontWeight: "800",
                      margin: "0 0 6px",
                      fontSize: "1.1rem",
                    }}
                  >
                    حمد لله على السلامة!
                  </h4>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text-secondary)",
                      margin: "0 0 14px",
                    }}
                  >
                    لقد وصلت بنجاح إلى وجهتك محطة{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {result.stations[currentStepIndex]}
                    </strong>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={onEndTrip}
                    style={{
                      background: "#10b981",
                      color: "#ffffff",
                      padding: "8px 24px",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "800",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontFamily: "inherit",
                    }}
                  >
                    إنهاء الرحلة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Station sequence timeline */}
          <div className={styles.routeTimelineWrapper}>
            {result.stations.map((s: string, idx: number) => {
              const isFirst = idx === 0;
              const isLast = idx === result.stations.length - 1;
              const isPassed = isTripActive && idx < currentStepIndex;
              const isCurrent = isTripActive && idx === currentStepIndex;

              let bg = "var(--bgPrimary)";
              let color = "var(--text-primary)";
              let border = "1px solid var(--border-glass)";
              let boxShadow = "none";
              let icon: string | null = null;

              if (isTripActive) {
                if (isPassed) {
                  bg = "rgba(16, 185, 129, 0.15)";
                  color = "#10b981";
                  border = "1px solid rgba(16, 185, 129, 0.4)";
                  icon = "✓";
                } else if (isCurrent) {
                  bg = "#06b6d4";
                  color = "#ffffff";
                  border = "2px solid #06b6d4";
                  boxShadow = "0 0 12px rgba(6, 182, 212, 0.6)";
                  icon = "📍";
                } else if (isLast) {
                  bg = "rgba(168, 85, 247, 0.2)";
                  color = "#a855f7";
                  border = "1px solid rgba(168, 85, 247, 0.5)";
                  icon = "🎯";
                }
              } else {
                if (isFirst) {
                  bg = "#06b6d4";
                  color = "#ffffff";
                  border = "none";
                  icon = "🚩";
                } else if (isLast) {
                  bg = "#a855f7";
                  color = "#ffffff";
                  border = "none";
                  icon = "🎯";
                }
              }

              return (
                <React.Fragment key={s}>
                  <span
                    className={styles.stationChip}
                    style={{
                      background: bg,
                      color,
                      border,
                      boxShadow,
                    }}
                  >
                    {icon && <span style={{ fontSize: "0.8rem" }}>{icon}</span>}
                    {s}
                  </span>
                  {idx < result.stations.length - 1 && (
                    <span
                      className={styles.chipArrow}
                      style={{
                        color:
                          isTripActive && idx < currentStepIndex ? "#10b981" : "#06b6d4",
                      }}
                    >
                      ←
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Route Report Problem Button */}
          <div
            style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={() => onOpenReportModal(null, true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ef4444",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 8px",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              <i className="fa-solid fa-triangle-exclamation" />
              <span>الإبلاغ عن مشكلة في هذا المسار</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
