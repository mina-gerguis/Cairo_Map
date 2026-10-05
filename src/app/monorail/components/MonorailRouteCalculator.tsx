import React from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { MonorailRouteCalculatorProps } from "../types";
import { MONORAIL_LINES_CONFIG, MONORAIL_STATION_DETAILS } from "../constants";
import { normalizeArabic } from "../utils";
import styles from "../monorail.module.css";

export default function MonorailRouteCalculator({
  panelRef,
  selectedFrom,
  selectedTo,
  fromQuery,
  toQuery,
  showFromList,
  showToList,
  filteredFromStations,
  filteredToStations,
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
  routeResult,
  isTripActive,
  currentStepIndex,
  trackerStationsList,
  copiedRoute,
  whatsappShareUrl,
  onStartTrip,
  onEndTrip,
  onPrevStep,
  onNextStep,
  onShareRoute,
  onOpenReportModal,
}: MonorailRouteCalculatorProps) {
  return (
    <div ref={panelRef} className={styles.searchBentoCard}>
      {/* Panel Header */}
      <div className={styles.searchBentoHeader}>
        <h2 className={styles.searchTitle}>
          <i className="fa-solid fa-route" style={{ color: "#3b82f6" }} />
          <span>احسب تذكرتك وظبط رحلتك</span>
        </h2>

        <button
          type="button"
          onClick={onFindNearest}
          disabled={locatingNearest}
          className={styles.gpsBtn}
          title="تحديد أقرب محطة مونوريل لموقعي الحالي عبر الـ GPS"
        >
          <i
            className={
              locatingNearest
                ? "fa-solid fa-spinner fa-spin"
                : "fa-solid fa-location-crosshairs"
            }
          />
          <span>{locatingNearest ? "جاري التحديد..." : "أقرب محطة فين"}</span>
        </button>
      </div>

      {/* Search Inputs Container */}
      <div className={styles.inputGroup}>
        {/* FROM STATION INPUT */}
        <div style={{ position: "relative", zIndex: showFromList ? 20 : 2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            <label className={styles.fieldLabel}>
              <i
                className="fa-solid fa-circle-dot"
                style={{ color: "#10b981", fontSize: "0.75rem" }}
              />
              من محطة:
              {nearestDistance && selectedFrom && (
                <span
                  style={{
                    fontSize: "0.74rem",
                    color: "#10b981",
                    fontWeight: "700",
                    marginRight: "8px",
                    background: "rgba(16, 185, 129, 0.12)",
                    padding: "2px 6px",
                    borderRadius: "6px",
                  }}
                >
                  أقرب محطة: {nearestDistance}
                </span>
              )}
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                onFromQueryChange(text);
                onFromFocus();
              }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <input
              className={styles.searchInput}
              placeholder="ابحث باسم المحطة أو المعلم... (مثل: الاستاد، المشير طنطاوي، هايبر وان)"
              value={fromQuery}
              onChange={(e) => {
                onFromQueryChange(e.target.value);
                onFromFocus();
              }}
              onFocus={onFromFocus}
              onBlur={() => setTimeout(onFromBlur, 250)}
            />
            {selectedFrom && (
              <span className={styles.stationSelectedBadge}>
                تم الاختيار ✔
              </span>
            )}
          </div>

          {showFromList && filteredFromStations.length > 0 && (
            <div className={styles.dropdownList}>
              {filteredFromStations.map((s) => {
                const details = MONORAIL_STATION_DETAILS[s.name];
                const q = normalizeArabic(fromQuery.trim());
                const matchedLandmark = q
                  ? details?.landmarks?.find((l) =>
                      normalizeArabic(l).includes(q)
                    )
                  : null;
                const lineCfg = MONORAIL_LINES_CONFIG.find(
                  (l) => l.id === s.line_type
                );

                return (
                  <div
                    key={s.name}
                    onMouseDown={() => onSelectFrom(s.name)}
                    className={styles.dropdownItem}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span style={{ fontSize: "0.74rem", color: "var(--color-secondary)" }}>
                          معلم مطابق: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    {lineCfg && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: `${lineCfg.color}15`,
                          color: lineCfg.color,
                          fontWeight: "700",
                        }}
                      >
                        {lineCfg.shortName}
                      </span>
                    )}
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
            aria-label="تبديل المحطات"
            className={styles.swapBtn}
          >
            ⇅
          </button>
        </div>

        {/* TO STATION INPUT */}
        <div style={{ position: "relative", zIndex: showToList ? 20 : 2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            <label className={styles.fieldLabel}>
              <i
                className="fa-solid fa-location-dot"
                style={{ color: "#ef4444", fontSize: "0.75rem" }}
              />
              إلى محطة:
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                onToQueryChange(text);
                onToFocus();
              }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <input
              className={styles.searchInput}
              placeholder="اكتب اسم محطة النهاية... (مثل: الفنون والثقافة، الحي المالي، وادي النيل)"
              value={toQuery}
              onChange={(e) => {
                onToQueryChange(e.target.value);
                onToFocus();
              }}
              onFocus={onToFocus}
              onBlur={() => setTimeout(onToBlur, 250)}
            />
            {selectedTo && (
              <span className={styles.stationSelectedBadge} style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)" }}>
                تم الاختيار ✔
              </span>
            )}
          </div>

          {showToList && filteredToStations.length > 0 && (
            <div className={styles.dropdownList}>
              {filteredToStations.map((s) => {
                const details = MONORAIL_STATION_DETAILS[s.name];
                const q = normalizeArabic(toQuery.trim());
                const matchedLandmark = q
                  ? details?.landmarks?.find((l) =>
                      normalizeArabic(l).includes(q)
                    )
                  : null;
                const lineCfg = MONORAIL_LINES_CONFIG.find(
                  (l) => l.id === s.line_type
                );

                return (
                  <div
                    key={s.name}
                    onMouseDown={() => onSelectTo(s.name)}
                    className={styles.dropdownItem}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span style={{ fontSize: "0.74rem", color: "var(--color-secondary)" }}>
                          معلم مطابق: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    {lineCfg && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: `${lineCfg.color}15`,
                          color: lineCfg.color,
                          fontWeight: "700",
                        }}
                      >
                        {lineCfg.shortName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Route Result Display */}
      {routeResult && (
        <div className={styles.routeResultCard}>
          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricTile}>
              <div className={styles.metricTileVal} style={{ color: "#10b981" }}>
                {routeResult.price} <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>ج.م</span>
              </div>
              <div className={styles.metricTileLabel}>سعر التذكرة المعتمد</div>
            </div>

            <div className={styles.metricTile}>
              <div className={styles.metricTileVal} style={{ color: "#3b82f6" }}>
                {routeResult.time} <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>د</span>
              </div>
              <div className={styles.metricTileLabel}>الوقت التقريبي</div>
            </div>

            <div className={styles.metricTile}>
              <div className={styles.metricTileVal} style={{ color: "var(--text-primary)" }}>
                {routeResult.count}
              </div>
              <div className={styles.metricTileLabel}>عدد المحطات</div>
            </div>

            <div className={styles.metricTile}>
              <div className={styles.metricTileVal} style={{ fontSize: "0.95rem", color: "#a855f7" }}>
                {routeResult.sameLine ? "مباشر ⚡" : "تبديل خط 🔀"}
              </div>
              <div className={styles.metricTileLabel}>نوع المسار</div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {!isTripActive && (
              <button
                type="button"
                onClick={onStartTrip}
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="fa-solid fa-play" />
                <span>بدء تتبع الرحلة</span>
              </button>
            )}

            <button
              type="button"
              onClick={onShareRoute}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border-glass)",
                borderRadius: "8px",
                padding: "8px 14px",
                color: "var(--text-primary)",
                fontWeight: "700",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="fa-solid fa-share-nodes" />
              <span>{copiedRoute ? "تم النسخ بنجاح!" : "مشاركة المسار"}</span>
            </button>

            {whatsappShareUrl && (
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgba(37, 211, 102, 0.12)",
                  border: "1px solid rgba(37, 211, 102, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  color: "#25d366",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="fa-brands fa-whatsapp" />
                <span>واتساب</span>
              </a>
            )}
          </div>

          {/* Active Tracker Card */}
          {isTripActive && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#3b82f6" }}>
                  📍 المحطة الحالية: {trackerStationsList[currentStepIndex]?.name} ({currentStepIndex + 1} من {trackerStationsList.length})
                </span>
                <button
                  type="button"
                  onClick={onEndTrip}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  إنهاء التتبع
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={onPrevStep}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    السابقة
                  </button>
                )}
                {currentStepIndex < trackerStationsList.length - 1 ? (
                  <button
                    type="button"
                    onClick={onNextStep}
                    style={{
                      flex: 2,
                      padding: "8px",
                      borderRadius: "8px",
                      background: "#3b82f6",
                      border: "none",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    المحطة التالية: {trackerStationsList[currentStepIndex + 1]?.name}
                  </button>
                ) : (
                  <div style={{ color: "#10b981", fontWeight: "800", fontSize: "0.9rem", textAlign: "center", width: "100%" }}>
                    🎉 وصلت لوجهتك بالسلامة!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Chips */}
          <div className={styles.timelineChipsWrapper}>
            {trackerStationsList.map((st, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === trackerStationsList.length - 1;
              const isPassed = isTripActive && idx < currentStepIndex;
              const isCurrent = isTripActive && idx === currentStepIndex;

              let bg = "var(--bgPrimary)";
              let color = "var(--text-primary)";
              let border = "1px solid var(--border-glass)";

              if (isTripActive) {
                if (isPassed) {
                  bg = "rgba(16, 185, 129, 0.15)";
                  color = "#10b981";
                  border = "1px solid rgba(16, 185, 129, 0.4)";
                } else if (isCurrent) {
                  bg = "#3b82f6";
                  color = "#ffffff";
                  border = "2px solid #3b82f6";
                } else if (isLast) {
                  bg = "rgba(168, 85, 247, 0.2)";
                  color = "#a855f7";
                }
              } else {
                if (isFirst) {
                  bg = "#3b82f6";
                  color = "#ffffff";
                  border = "none";
                } else if (isLast) {
                  bg = "#10b981";
                  color = "#ffffff";
                  border = "none";
                }
              }

              return (
                <React.Fragment key={st.name}>
                  <span
                    className={styles.stationChip}
                    style={{ background: bg, color, border }}
                  >
                    {isFirst && "🚩 "}
                    {isLast && "🎯 "}
                    {isCurrent && "📍 "}
                    {st.name}
                  </span>
                  {idx < trackerStationsList.length - 1 && (
                    <span style={{ color: "#3b82f6", fontWeight: "800" }}>←</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Report Problem Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
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
                gap: "5px",
                fontFamily: "inherit",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" />
              <span>الإبلاغ عن مشكلة في هذا المسار</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
