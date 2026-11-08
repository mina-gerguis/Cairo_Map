import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import VoiceInputButton from "@/components/VoiceInputButton";
import { LrtRouteCalculatorProps } from "../types";
import { normalizeArabic } from "../utils";
import styles from "../lrt.module.css";
import searchStyles from "@/components/common/RouteSearchCard/RouteSearchCard.module.css";
import ProjectBanner from "@/components/common/ProjectBanner";
import { ASSETS } from "@/constants/assets";

const POPULAR_LRT_PRESETS = [
  "عدلي منصور",
  "الشروق",
  "بدر",
  "مدينة الفنون والثقافة",
  "مطار العاصمة",
  "مدينة المعرفة",
];

const DefaultOriginIcon = () => (
  <svg
    className={searchStyles.inputIconSvg}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7" />
  </svg>
);

const DefaultDestIcon = () => (
  <svg
    className={searchStyles.inputIconSvg}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

function getTransferLogo(typeStr?: string) {
  if (!typeStr) return null;
  if (typeStr.includes("مترو") || typeStr.includes("المترو")) {
    return {
      logo: ASSETS.transit.metro,
      alt: "مترو الأنفاق",
    };
  }
  if (typeStr.includes("مونوريل") || typeStr.includes("المونوريل")) {
    return {
      logo: ASSETS.transit.monorailEast,
      alt: "مونوريل العاصمة",
    };
  }
  if (typeStr.includes("BRT") || typeStr.includes("الترددي")) {
    return {
      logo: ASSETS.transit.brt,
      alt: "أتوبيس ترددي BRT",
    };
  }
  if (typeStr.includes("السريع") || typeStr.includes("قطار") || typeStr.includes("سكة حديد")) {
    return {
      logo: ASSETS.transit.train,
      alt: "قطار سريع",
    };
  }
  return {
    logo: ASSETS.transit.walk,
    alt: "محطة تبادلية",
  };
}

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
  stations = [],
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
  onFindRoute,
  result,
  isTripActive,
  currentStepIndex,
  copiedRoute = false,
  whatsappShareUrl = "",
  onStartTrip,
  onEndTrip,
  onPrevStep,
  onNextStep,
  onShareRoute,
  onOpenReportModal,
}: LrtRouteCalculatorProps) {
  const swapIconRef = useRef<SVGSVGElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);

  // Entrance animation for preset chips
  useEffect(() => {
    if (presetsRef.current) {
      const chips = presetsRef.current.querySelectorAll(`.${searchStyles.chipTag}`);
      if (chips.length > 0) {
        gsap.fromTo(
          chips,
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
            stagger: 0.03,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          }
        );
      }
    }
  }, []);

  // Click outside to dismiss suggestions dropdowns
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        onFromBlur();
        onToBlur();
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [onFromBlur, onToBlur]);

  const handleSwapClick = () => {
    if (swapIconRef.current) {
      gsap.to(swapIconRef.current, {
        rotation: "+=180",
        duration: 0.35,
        ease: "back.out(1.5)",
      });
    }
    onSwapStations();
  };

  const isSearchDisabled = !selectedFrom || !selectedTo;

  return (
    <div
      id="lrt-route-calculator-panel"
      ref={panelRef}
      className={styles.searchBentoCard}
      style={{ zIndex: showFromList || showToList ? 50 : 20, position: "relative" }}
    >
      {/* Title */}
      <div className={searchStyles.header}>
        <h2 className={searchStyles.title}>
          <span>علي فين كدا .؟</span>
        </h2>
      </div>

      {/* Search Boxes Container */}
      <div
        ref={searchContainerRef}
        className={searchStyles.searchBoxContainer}
        style={{ position: "relative", zIndex: showFromList || showToList ? 40 : 5 }}
      >
        {/* FROM STATION INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: showFromList ? 100 : 2 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Origin Icon (Clickable if onFindNearest provided) */}
            <div className={searchStyles.inputStartIcon}>
              {onFindNearest ? (
                <button
                  type="button"
                  onClick={onFindNearest}
                  disabled={locatingNearest}
                  title="تحديد أقرب محطة بالـ GPS"
                  aria-label="تحديد أقرب محطة بالـ GPS"
                  className={searchStyles.inputStartBtn}
                >
                  {locatingNearest ? (
                    <i
                      className="bx bx-loader-alt bx-spin"
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--color-secondary, #06b6d4)",
                      }}
                    />
                  ) : (
                    <DefaultOriginIcon />
                  )}
                </button>
              ) : (
                <span className={searchStyles.inputStartBtnStatic}>
                  <DefaultOriginIcon />
                </span>
              )}
            </div>

            {/* Input field */}
            <input
              className={`input-fields ${searchStyles.input}`}
              placeholder="هركب من... (محطة الانطلاق أو أقرب معلم)"
              value={fromQuery}
              onChange={(e) => onFromQueryChange(e.target.value)}
              onFocus={onFromFocus}
              onBlur={() => setTimeout(onFromBlur, 250)}
              style={{
                paddingRight: "74px",
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
            />

            {/* End actions: Clear button or Voice Input */}
            <div className={searchStyles.inputEndActions}>
              {fromQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    onFromQueryChange("");
                    onSelectFrom("");
                  }}
                  title="مسح"
                  aria-label="مسح المحطة"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted, #71717a)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              ) : (
                <VoiceInputButton
                  onTranscript={(text) => {
                    onFromQueryChange(text);
                  }}
                />
              )}
            </div>

            {/* From Suggestions Dropdown */}
            {showFromList && filteredFrom.length > 0 && (
              <div className={searchStyles.suggestionsDropdown}>
                {filteredFrom.slice(0, 10).map((name) => {
                  const stationObj = stations.find((s) => s.name === name);
                  const q = normalizeArabic(fromQuery.trim());
                  const matchedLandmark = q
                    ? (stationObj?.landmarks || []).find((l) =>
                        normalizeArabic(l).includes(q)
                      )
                    : null;

                  return (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={() => onSelectFrom(name)}
                      className={searchStyles.suggestionItem}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: "700",
                            color: "var(--color-fg)",
                          }}
                        >
                          {name}
                        </span>
                        {matchedLandmark && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-secondary, #06b6d4)",
                              fontWeight: "bold",
                            }}
                          >
                            📍 قريب من: {matchedLandmark}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {stationObj?.status === "تحت الإنشاء" && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              fontWeight: "700",
                            }}
                          >
                            تحت الإنشاء
                          </span>
                        )}
                        <i
                          className="bx bx-chevron-left"
                          style={{
                            color: "var(--text-muted, #71717a)",
                            fontSize: "1.1rem",
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SWAP BUTTON - Centered between inputs */}
        <div className={searchStyles.swapBtnAnchor} style={{ top: "54px" }}>
          <button
            type="button"
            onClick={handleSwapClick}
            title="تبديل محطة القيام والوصول"
            className={searchStyles.swapBtn}
            aria-label="تبديل محطة القيام والوصول"
          >
            <svg
              ref={swapIconRef}
              className={searchStyles.swapIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20V4M7 4L3 8M7 4L11 8M17 4V20M17 20L21 16M17 20L13 16" />
            </svg>
          </button>
        </div>

        {/* TO STATION INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: showToList ? 100 : 1 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Destination Icon */}
            <span className={searchStyles.inputStartIcon}>
              <DefaultDestIcon />
            </span>

            {/* Input field */}
            <input
              className={`input-fields ${searchStyles.input}`}
              placeholder="هروح لـِ... (محطة الوصول أو أقرب معلم)"
              value={toQuery}
              onChange={(e) => onToQueryChange(e.target.value)}
              onFocus={onToFocus}
              onBlur={() => setTimeout(onToBlur, 250)}
              style={{
                paddingRight: "74px",
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
            />

            {/* End actions: Clear button or Voice Input */}
            <div className={searchStyles.inputEndActions}>
              {toQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    onToQueryChange("");
                    onSelectTo("");
                  }}
                  title="مسح"
                  aria-label="مسح المحطة"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted, #71717a)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              ) : (
                <VoiceInputButton
                  onTranscript={(text) => {
                    onToQueryChange(text);
                  }}
                />
              )}
            </div>

            {/* To Suggestions Dropdown */}
            {showToList && filteredTo.length > 0 && (
              <div className={searchStyles.suggestionsDropdown}>
                {filteredTo.slice(0, 10).map((name) => {
                  const stationObj = stations.find((s) => s.name === name);
                  const q = normalizeArabic(toQuery.trim());
                  const matchedLandmark = q
                    ? (stationObj?.landmarks || []).find((l) =>
                        normalizeArabic(l).includes(q)
                      )
                    : null;

                  return (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={() => onSelectTo(name)}
                      className={searchStyles.suggestionItem}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: "700",
                            color: "var(--color-fg)",
                          }}
                        >
                          {name}
                        </span>
                        {matchedLandmark && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-secondary, #06b6d4)",
                              fontWeight: "bold",
                            }}
                          >
                            📍 قريب من: {matchedLandmark}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {stationObj?.status === "تحت الإنشاء" && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              fontWeight: "700",
                            }}
                          >
                            تحت الإنشاء
                          </span>
                        )}
                        <i
                          className="bx bx-chevron-left"
                          style={{
                            color: "var(--text-muted, #71717a)",
                            fontSize: "1.1rem",
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Preset Destination Chips */}
          <div ref={presetsRef} className={searchStyles.presetChipsWrapper}>
            <span className={searchStyles.presetLabel}>محطات بتكرر كتير:</span>
            {POPULAR_LRT_PRESETS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => onSelectTo(dest)}
                className={`${searchStyles.chipTag} ${
                  selectedTo === dest ? searchStyles.chipTagActive : ""
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Badge (GPS Nearest Station Result) */}
      {nearestDistance && selectedFrom && (
        <div
          className={searchStyles.locationBadge}
          style={{ marginTop: "12px" }}
        >
          <i
            className="fa-solid fa-location-dot"
            style={{ fontSize: "1rem", flexShrink: 0 }}
          />
          <span>
            أقرب محطة LRT لموقعك: <strong>{selectedFrom}</strong> (
            {nearestDistance})
          </span>
        </div>
      )}

      {/* Find Route Action Button */}
      <div style={{ marginTop: "14px" }}>
        <button
          type="button"
          onClick={onFindRoute}
          disabled={isSearchDisabled}
          className={`btn btn-primary w-full ${searchStyles.submitBtn} ${
            isSearchDisabled ? searchStyles.submitBtnDisabled : ""
          }`}
          style={{
            cursor: isSearchDisabled ? "not-allowed" : "pointer",
            opacity: isSearchDisabled ? 0.6 : 1,
            gap: "8px",
            height: "46px",
            fontSize: "0.95rem",
          }}
        >
          <i className="bx bx-search-alt" style={{ fontSize: "1.25rem" }} />
          <span>اعرض مسار الرحلة</span>
        </button>
      </div>

      {/* TRIP RESULTS */}
      {result && (
        <div className={styles.routeResultCard}>
          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            {/* Number of Stations */}
            <div className={styles.metricTile}>
              <div>
                <p className={styles.metricTileLabel}>عدد المحطات</p>
                <p className={styles.metricTileVal}>{result.count} محطة</p>
              </div>
            </div>

            {/* Ticket Price */}
            <div className={styles.metricTile}>
              <div>
                <p className={styles.metricTileLabel}>سعر التذكرة</p>
                <p className={styles.metricTileVal} style={{ color: "#10b981" }}>
                  {result.price} ج.م
                </p>
              </div>
            </div>

            {/* Estimated Time */}
            <div className={styles.metricTile}>
              <div>
                <p className={styles.metricTileLabel}>زمن الرحلة</p>
                <p className={styles.metricTileVal} style={{ color: "var(--color-secondary, #06b6d4)" }}>
                  {result.estimatedTime} دقيقة
                </p>
              </div>
            </div>

            {/* Route Type */}
            <div className={styles.metricTile}>
              <div>
                <p className={styles.metricTileLabel}>الخط / المسار</p>
                <p
                  className={styles.metricTileVal}
                  style={{
                    color: "var(--color-fg)",
                    fontSize: "0.85rem",
                  }}
                >
                  {result.lineName || "مسار القطار الكهربائي"}
                </p>
              </div>
            </div>
          </div>

          {/* Informative Guidance Banner */}
          {!isTripActive && result.description && (
            <div className={styles.routeInstructionsBanner}>
              <i
                className="bx bxs-info-circle"
                style={{
                  color: "var(--color-info)",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              />
              <span>{result.description}</span>
            </div>
          )}

          {/* Action Buttons Row */}
          {!isTripActive && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={onStartTrip}
                className="btn btn-primary flex-auto"
              >
                <i className="fa-solid fa-play"></i>
                <span>بدء تتبع الرحلة</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary flex-auto"
                onClick={onShareRoute}
              >
                <i className={copiedRoute ? "fa-solid fa-check" : "fa-solid fa-share-nodes"}></i>
                <span>{copiedRoute ? "تم النسخ بنجاح ✔" : "مشاركة المسار"}</span>
              </button>

              {whatsappShareUrl && (
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success flex-auto"
                >
                  <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }} />
                  <span>مشاركة عبر واتساب</span>
                </a>
              )}
            </div>
          )}

          {/* Active Trip Live Tracker Box - Exactly matching Metro and Monorail style */}
          {isTripActive && (
            <div className={styles.stepTrackerBox}>
              <div className={styles.stepHeader}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    color: "var(--color-secondary, #06b6d4)",
                    background: "rgba(6, 182, 212, 0.12)",
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
                <strong style={{ color: "var(--color-fg)", fontSize: "1.1rem" }}>
                  {result.detailedPath?.[currentStepIndex]?.station || result.stations[currentStepIndex]}
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginRight: "8px" }}>
                  ({currentStepIndex + 1} من {result.stations.length})
                </span>
              </div>

              {(() => {
                const remainingStationsCount = Math.max(0, result.stations.length - 1 - currentStepIndex);
                const remainingTime = Math.max(0, Math.round(remainingStationsCount * 3.5));
                return (
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    الوقت المتبقي التقديري:{" "}
                    <strong style={{ color: "var(--color-secondary, #06b6d4)" }}>{remainingTime} دقيقة</strong>
                  </div>
                );
              })()}

              {result.detailedPath?.[currentStepIndex]?.isTransferPoint && (
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
                  <div style={{ fontWeight: "800", color: "var(--color-danger)", marginBottom: "4px" }}>
                    ⚠️ محطة تبادلية!
                  </div>
                  انزل هنا للتحويل إلى{" "}
                  <strong style={{ color: "var(--color-info)" }}>
                    {result.detailedPath[currentStepIndex]?.targetLine || "وسيلة النقل التبادلية"}
                  </strong>{" "}
                  واتبع الإرشادات للركوب في الاتجاه المطلوب.
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                {onPrevStep && currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={onPrevStep}
                    className="btn btn-secondary"
                    style={{ padding: "8px 14px" }}
                  >
                    السابق
                  </button>
                )}

                {currentStepIndex < result.stations.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary-gradient w-full"
                    onClick={onNextStep}
                  >
                    <span>
                      وصلت لمحطة{" "}
                      {result.detailedPath?.[currentStepIndex + 1]?.station ||
                        result.stations[currentStepIndex + 1]}{" "}
                      ←
                    </span>
                  </button>
                ) : (
                  <div className="pt-2 text-center w-full">
                    <h4 className="font-sub text-primary fs-6 fw-bold">حمدلله على السلامة!</h4>
                    <p className="text-secondary mb-3 fs-sm">
                      لقد وصلت إلى محطة{" "}
                      {result.detailedPath?.[currentStepIndex]?.station ||
                        result.stations[currentStepIndex]}.
                    </p>
                    <button
                      type="button"
                      onClick={onEndTrip}
                      className="btn btn-cancel w-full"
                    >
                      إنهاء الرحلة
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Path Steps List - Identical to Metro & Monorail Style */}
          <div className="bg-secondary border border-glass rounded-lg p-4">
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: "800",
                color: "var(--color-fg)",
                margin: "0 0 14px",
                fontFamily: "var(--font-sub, inherit)",
              }}
            >
              مسار الرحلة بالتفصيل ({result.stations.length} محطة)
            </h3>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {(result.detailedPath && result.detailedPath.length > 0
                ? result.detailedPath
                : result.stations.map((st): import("../types").LrtPathNode => ({
                    station: st,
                    line: "trunk",
                    lineName: "القطار الكهربائي الخفيف LRT",
                    lineColor: "#06b6d4",
                    isTransferPoint: false,
                    targetLine: undefined,
                  }))
              ).map((node, idx, arr) => {
                const isFirst = idx === 0;
                const isLast = idx === arr.length - 1;
                const isTransfer = node.isTransferPoint;
                const activeColor = node.lineColor || "#06b6d4";
                const isPassed = isTripActive && idx < currentStepIndex;
                const isCurrent = isTripActive && idx === currentStepIndex;

                const stationObj = stations.find((s) => s.name === node.station);
                const isUnderConstruction = stationObj?.status === "تحت الإنشاء";
                const transferLogo = isTransfer ? getTransferLogo(node.targetLine) : null;

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
                                ? `2px solid var(--color-bg, #18181b)`
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
                                ? "var(--color-secondary, #06b6d4)"
                                : isFirst || isLast
                                ? "var(--color-fg)"
                                : "var(--text-secondary)",
                            }}
                          >
                            {node.station}
                          </span>
                          {isFirst && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--color-success)",
                                background: "rgba(16, 185, 129, 0.12)",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontWeight: "700",
                              }}
                            >
                              ركبت من
                            </span>
                          )}
                          {isLast && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--color-danger)",
                                background: "rgba(239, 68, 68, 0.12)",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontWeight: "700",
                              }}
                            >
                              الواجهة النهائية
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
                          {node.lineName}
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
                          {isTransfer && node.targetLine && (
                            <div
                              style={{
                                background: "var(--tab-active-bg)",
                                border: "1px solid var(--tab-active-bg)",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                margin: "4px 0",
                                fontSize: "0.68rem",
                                color: "var(--tab-active-color)",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {transferLogo && (
                                <Image
                                  src={transferLogo.logo}
                                  alt={transferLogo.alt}
                                  width={16}
                                  height={16}
                                  style={{ objectFit: "contain", borderRadius: "2px" }}
                                />
                              )}
                              <span>محطة تبديل: التحويل إلى {node.targetLine}</span>
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

          {/* Route Report Problem Banner with ProjectBanner */}
          <div style={{ marginTop: "16px" }}>
            <ProjectBanner
              variant="error"
              label="هل لاحظت بيانات غير دقيقة في هذا المسار؟"
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
                label: "الإبلاغ عن خطأ في المسار",
                onClick: () => onOpenReportModal(null, true),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
