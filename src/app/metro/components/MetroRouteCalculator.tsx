import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import VoiceInputButton from "@/components/VoiceInputButton";
import { MetroRouteCalculatorProps } from "../types";
import { LINE_COLORS, LINE_NAMES } from "../constants";
import { normalizeArabic } from "../utils";
import styles from "../metro.module.css";
import searchStyles from "@/components/common/RouteSearchCard/RouteSearchCard.module.css";

const POPULAR_METRO_PRESETS = [
  "الشهداء",
  "السادات",
  "العتبة",
  "جامعة القاهرة",
  "كلية البنات",
  "حلوان",
  "شبرا الخيمة",
  "الأوبرا",
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
    <div ref={panelRef} className={styles.searchBentoCard}>
      {/* Title & Nearest Station GPS Button */}
      <div className={searchStyles.header}>
        <h2 className={searchStyles.title}>
          <i
            className="fa-solid fa-train-subway"
            style={{ color: "var(--color-secondary, #3b82f6)" }}
          />
          <span>علي فين كدا .؟</span>
        </h2>

        <button
          type="button"
          onClick={onFindNearest}
          disabled={locatingNearest}
          className={styles.gpsBtn}
          title="تحديد أقرب محطة مترو لموقعي الحالي عبر الـ GPS"
        >
          <i
            className={
              locatingNearest
                ? "fa-solid fa-spinner fa-spin"
                : "fa-solid fa-location-crosshairs"
            }
          />
          <span>{locatingNearest ? "جاري التحديد..." : "أقرب محطة مني"}</span>
        </button>
      </div>

      {/* Search Boxes Container (Styled just like 'إزاي أروح' page) */}
      <div ref={searchContainerRef} className={searchStyles.searchBoxContainer}>
        {/* FROM STATION INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: showFromList ? 100 : 2 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Origin Icon (Clickable to trigger GPS) */}
            <div className={searchStyles.inputStartIcon}>
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
                      color: "var(--color-secondary, #3b82f6)",
                    }}
                  />
                ) : (
                  <DefaultOriginIcon />
                )}
              </button>
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
                {filteredFrom.slice(0, 10).map((s) => {
                  const q = normalizeArabic(fromQuery.trim());
                  const matchedLandmark = q
                    ? (s.landmarks || []).find((l) =>
                        normalizeArabic(l).includes(q)
                      )
                    : null;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onMouseDown={() => onSelectFrom(s.name)}
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
                            color: "var(--color-foreground)",
                          }}
                        >
                          {s.name}
                        </span>
                        {matchedLandmark && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-secondary, #3b82f6)",
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
                        <div style={{ display: "flex", gap: "4px" }}>
                          {s.lines.map((l) => (
                            <span
                              key={l}
                              title={`الخط ${l.replace("line", "")}`}
                              style={{
                                width: "8px",
                                height: "8px",
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

        {/* SWAP BUTTON - Right Junction centered between inputs */}
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
                {filteredTo.slice(0, 10).map((s) => {
                  const q = normalizeArabic(toQuery.trim());
                  const matchedLandmark = q
                    ? (s.landmarks || []).find((l) =>
                        normalizeArabic(l).includes(q)
                      )
                    : null;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onMouseDown={() => onSelectTo(s.name)}
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
                            color: "var(--color-foreground)",
                          }}
                        >
                          {s.name}
                        </span>
                        {matchedLandmark && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-secondary, #3b82f6)",
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
                        <div style={{ display: "flex", gap: "4px" }}>
                          {s.lines.map((l) => (
                            <span
                              key={l}
                              title={`الخط ${l.replace("line", "")}`}
                              style={{
                                width: "8px",
                                height: "8px",
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
            <span className={searchStyles.presetLabel}>محطات شائعة:</span>
            {POPULAR_METRO_PRESETS.map((dest) => (
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
            أقرب محطة مترو لموقعك: <strong>{selectedFrom}</strong> (
            {nearestDistance})
          </span>
        </div>
      )}

      {/* SEARCH ACTION BUTTON */}
      <button
        type="button"
        onClick={onFindRoute}
        disabled={isSearchDisabled}
        className={`btn btn-primary w-full ${searchStyles.submitBtn} ${
          isSearchDisabled ? searchStyles.submitBtnDisabled : ""
        }`}
      >
        <i className="bx bx-search-alt" style={{ fontSize: "1.25rem" }} />
        <span>اعرض مسار وتفاصيل الرحلة</span>
      </button>

      {/* TRIP RESULTS */}
      {result && (
        <div className={styles.routeResultCard}>
          {/* Not Found State */}
          {!result.found ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px 0" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>😕</div>
              <h4 style={{ fontWeight: "700", color: "var(--color-foreground)", marginBottom: "6px" }}>
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
                  <div>
                    <p className={styles.metricTileLabel}>عدد المحطات</p>
                    <p className={styles.metricTileVal}>{result.stationCount} محطة</p>
                  </div>
                </div>

                {/* Ticket Price */}
                <div className={styles.metricTile}>
                  <div>
                    <p className={styles.metricTileLabel}>سعر التذكرة</p>
                    <p className={styles.metricTileVal} style={{ color: "#10b981" }}>{result.price} ج.م</p>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className={styles.metricTile}>
                  <div>
                    <p className={styles.metricTileLabel}>زمن الرحلة</p>
                    <p className={styles.metricTileVal}>{result.estimatedTime} دقيقة</p>
                  </div>
                </div>

                {/* Transfers */}
                <div className={styles.metricTile}>
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
                    <span>بدء تتبع الرحلة</span>
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
                    <strong style={{ color: "var(--color-foreground)", fontSize: "1.1rem" }}>
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
                      className="btn btn-primary-gradient w-full"
                      onClick={onStepNext}
                    >
                      <span>وصلت لمحطة {result.detailedPath[currentStepIndex + 1]?.station} ←</span>
                    </button>
                  ) : (
                    <div
                      className="pt-5 text-center"
                    >
                      <h4 className="font-sub text-primary fs-6 fw-bold">حمدلله على السلامة!</h4>
                      <p className="text-secondary mb-4 fs-sm">
                        لقد وصلت إلى محطة {result.detailedPath[currentStepIndex]?.station}.
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
              )}

              {/* Detailed Path Steps List */}
              <div className="bg-secondary border border-glass rounded-lg p-4 "
              >
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    color: "var(--color-foreground)",
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
                                      ? "var(--color-secondary, #3b82f6)"
                                      : isFirst || isLast
                                        ? "var(--color-foreground)"
                                        : "var(--text-secondary)",
                                }}
                              >
                                {node.station}
                              </span>
                              {isFirst && (
                                <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  ركبت من
                                </span>
                              )}
                              {isLast && (
                                <span style={{ fontSize: "0.7rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
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
                                  محطة تبديل: التحويل إلى {LINE_NAMES[node.targetLine!]}
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
                  className="btn btn-report"
                >
                  <span>الإبلاغ عن خطأ في هذا المسار</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
