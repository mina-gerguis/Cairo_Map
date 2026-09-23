import React from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { MonorailRouteCalculatorProps } from "../types";
import { MONORAIL_LINES_CONFIG, MONORAIL_STATION_DETAILS } from "../constants";
import { normalizeArabic } from "../utils";

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
    <div ref={panelRef} className="details-panel">
      {/* Panel Header */}
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
          احسب تذكرتك وظبط رحلتك
        </h5>

        <button
          type="button"
          onClick={onFindNearest}
          disabled={locatingNearest}
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "4px",
            padding: "4px 10px",
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "var(--color-secondary)",
            cursor: locatingNearest ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.2s ease",
          }}
          title="تحديد أقرب محطة مونوريل لموقعي الحالي عبر الـ GPS"
        >
          <i
            className={
              locatingNearest
                ? "fa-solid fa-spinner fa-spin"
                : "fa-solid fa-location-crosshairs"
            }
          />
          {locatingNearest ? "جاري التحديد..." : "أقرب محطة فين"}
        </button>
      </div>

      {/* Search Inputs Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
        }}
      >
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
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "var(--text-secondary)",
                margin: 0,
                fontFamily: "var(--font-heading)",
              }}
            >
              <i
                className="fa-solid fa-circle-dot"
                style={{ marginLeft: "6px", color: "var(--colorSuccess)" }}
              />{" "}
              من محطة:
              {nearestDistance && selectedFrom && (
                <span
                  style={{
                    fontSize: "0.74rem",
                    color: "var(--colorSuccess)",
                    fontWeight: "700",
                    marginRight: "8px",
                    background: "rgba(16, 185, 129, 0.1)",
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
          <div style={{ position: "relative" }}>
            <input
              className="input-fields"
              placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: الاستاد، المشير طنطاوي، هايبر وان)"
              value={fromQuery}
              onChange={(e) => {
                onFromQueryChange(e.target.value);
                onFromFocus();
              }}
              onFocus={onFromFocus}
              onBlur={() => setTimeout(onFromBlur, 250)}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-body)",
              }}
            />
            {selectedFrom && (
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.72rem",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary)",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                تم الاختيار ✔
              </span>
            )}
          </div>
          {showFromList && filteredFromStations.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                zIndex: 100,
                maxHeight: "220px",
                overflowY: "auto",
                marginTop: "4px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
            >
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
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                      fontFamily: "var(--font-sub)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--hoverBtn)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--color-secondary)",
                            fontWeight: "bold",
                          }}
                        >
                          📍 قريب من: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginRight: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: lineCfg?.color || "#3b82f6",
                          background: (lineCfg?.color || "#3b82f6") + "15",
                          border: `1px solid ${lineCfg?.color || "#3b82f6"}33`,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {lineCfg?.shortName}
                      </span>
                      {details?.status === "تحت الإنشاء" && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ef4444",
                            padding: "1px 5px",
                            borderRadius: "4px",
                          }}
                        >
                          قيد الإنشاء
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "-8px 0",
          }}
        >
          <button
            type="button"
            onClick={onSwapStations}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              fontSize: "1.15rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(180deg)";
              e.currentTarget.style.background = "var(--hoverBtn)";
              e.currentTarget.style.color = "var(--color-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(0deg)";
              e.currentTarget.style.background = "var(--bg-secondary)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            title="تبديل محطة القيام والوصول"
          >
            ⇅
          </button>
        </div>

        {/* TO STATION INPUT */}
        <div style={{ position: "relative", zIndex: showToList ? 20 : 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "var(--text-secondary)",
                margin: 0,
                fontFamily: "var(--font-heading)",
              }}
            >
              <i
                className="fa-solid fa-circle-dot"
                style={{ marginLeft: "6px", color: "#ff0000" }}
              />{" "}
              إلى محطة:
            </label>
            <VoiceInputButton
              onTranscript={(text) => {
                onToQueryChange(text);
                onToFocus();
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <input
              className="input-fields"
              placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: مدينة الفنون، الجامعة الأمريكية، أكتوبر)"
              value={toQuery}
              onChange={(e) => {
                onToQueryChange(e.target.value);
                onToFocus();
              }}
              onFocus={onToFocus}
              onBlur={() => setTimeout(onToBlur, 250)}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-body)",
              }}
            />
            {selectedTo && (
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.72rem",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary)",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                تم الاختيار ✔
              </span>
            )}
          </div>
          {showToList && filteredToStations.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                zIndex: 100,
                maxHeight: "220px",
                overflowY: "auto",
                marginTop: "4px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
            >
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
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                      fontFamily: "var(--font-sub)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--hoverBtn)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--color-secondary)",
                            fontWeight: "bold",
                          }}
                        >
                          📍 قريب من: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginRight: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: lineCfg?.color || "#3b82f6",
                          background: (lineCfg?.color || "#3b82f6") + "15",
                          border: `1px solid ${lineCfg?.color || "#3b82f6"}33`,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {lineCfg?.shortName}
                      </span>
                      {details?.status === "تحت الإنشاء" && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ef4444",
                            padding: "1px 5px",
                            borderRadius: "4px",
                          }}
                        >
                          قيد الإنشاء
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

      {/* Action / Search Button */}
      <button
        type="button"
        disabled={!selectedFrom || !selectedTo || selectedFrom === selectedTo}
        className="btn btn-primary"
        style={{
          width: "100%",
          marginTop: "4px",
          fontSize: "0.95rem",
          fontWeight: "700",
          cursor:
            !selectedFrom || !selectedTo || selectedFrom === selectedTo
              ? "not-allowed"
              : "pointer",
          opacity:
            !selectedFrom || !selectedTo || selectedFrom === selectedTo
              ? 0.6
              : 1,
        }}
      >
        <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "6px" }} />
        اعرض مسار وتفاصيل الرحلة
      </button>

      {/* TRIP RESULTS */}
      {routeResult && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Results Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {/* Number of Stations */}
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
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  color: "var(--color-secondary)",
                }}
              >
                {routeResult.count}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                عدد المحطات
              </div>
            </div>

            {/* Price */}
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
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  color: "var(--colorSuccess)",
                }}
              >
                {routeResult.price} ج.م
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                سعر التذكرة
              </div>
            </div>

            {/* Estimated Time */}
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
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  color: "var(--color-secondary)",
                }}
              >
                {routeResult.time} د
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                زمن الرحلة
              </div>
            </div>

            {/* Multi-leg / Transfer Status */}
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
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: !routeResult.sameLine
                    ? "var(--colorWarning, #f59e0b)"
                    : "var(--colorSuccess)",
                }}
              >
                {!routeResult.sameLine ? "تبديل (مترو L3)" : "مباشر"}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                نوع المسار
              </div>
            </div>
          </div>

          {/* Informative Guidance Box */}
          {!isTripActive && (
            <div
              style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--ra-8)",
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  lineHeight: "1.7",
                  fontSize: "0.88rem",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                <i
                  className="bx bxs-info-circle"
                  style={{
                    marginLeft: "6px",
                    color: "var(--color-secondary)",
                    fontSize: "1.1rem",
                    verticalAlign: "middle",
                  }}
                />
                {routeResult.description}
              </p>
              {routeResult.discountPrice && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                  }}
                >
                  💡 تخفيض كبار السن وذوي الهمم:{" "}
                  <strong>{routeResult.discountPrice} ج.م</strong>
                </div>
              )}
            </div>
          )}

          {/* Actions Grid: Start Trip + Share Route */}
          {!isTripActive && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {/* Start Trip Button */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={onStartTrip}
                style={{
                  flex: "1 1 140px",
                  fontSize: "0.88rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <i className="fa-solid fa-play" />
                بدء تتبع الرحلة
              </button>

              {/* Share Route Button */}
              <button
                type="button"
                className="btn"
                onClick={onShareRoute}
                style={{
                  flex: "1 1 140px",
                  fontSize: "0.88rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <i
                  className={
                    copiedRoute ? "fa-solid fa-check" : "fa-solid fa-share-nodes"
                  }
                />
                {copiedRoute ? "تم النسخ بنجاح ✔" : "مشاركة التفاصيل"}
              </button>

              {/* WhatsApp Share Button */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                className="btn"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.88rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: "rgba(0, 119, 44, 1)",
                  border: "1px solid rgba(37, 211, 102, 0.3)",
                  color: "#ffffff",
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }} />
                شارك مباشرا علي الواتساب
              </a>
            </div>
          )}

          {/* Active Trip Tracker */}
          {isTripActive && trackerStationsList.length > 0 && (
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--ra-8)",
                padding: "16px",
              }}
            >
              {/* Active Trip Badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    color: "var(--color-secondary)",
                    background: "rgba(59, 130, 246, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                  }}
                >
                  رحلة نشطة حالياً
                </span>
                <button
                  type="button"
                  onClick={onEndTrip}
                  style={{
                    border: "none",
                    color: "var(--accent-red, #ef4444)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background: "rgba(246, 59, 59, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                  }}
                >
                  <i
                    className="fa-solid fa-trash"
                    style={{ marginLeft: "6px" }}
                  />
                  إنهاء التتبع
                </button>
              </div>

              {/* Current Station Info */}
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                }}
              >
                أنت الآن في محطة:{" "}
                <strong
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "1.05rem",
                  }}
                >
                  {trackerStationsList[currentStepIndex]?.name}
                </strong>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginRight: "8px",
                  }}
                >
                  ({currentStepIndex + 1} من {trackerStationsList.length})
                </span>
              </div>

              {/* Remaining Stations Counter */}
              {(() => {
                const remainingCount =
                  trackerStationsList.length - 1 - currentStepIndex;
                const remainingMins = Math.max(0, remainingCount * 2.5);
                return (
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      marginBottom: "12px",
                    }}
                  >
                    متبقي {remainingCount} محطة للوصول إلى الوجهة (~
                    {Math.round(remainingMins)} دقيقة)
                  </div>
                );
              })()}

              {/* Progress Bar */}
              <div
                style={{
                  height: "6px",
                  background: "var(--border-glass)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--color-secondary)",
                    width: `${
                      ((currentStepIndex + 1) / trackerStationsList.length) * 100
                    }%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Station Progress Controller */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  disabled={currentStepIndex === 0}
                  onClick={onPrevStep}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "var(--ra-8)",
                    border: "1px solid var(--border-glass)",
                    background: "var(--bgPrimary)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: currentStepIndex === 0 ? "not-allowed" : "pointer",
                    opacity: currentStepIndex === 0 ? 0.5 : 1,
                  }}
                >
                  <i
                    className="fa-solid fa-chevron-right"
                    style={{ marginLeft: "4px" }}
                  />{" "}
                  المحطة السابقة
                </button>

                <button
                  type="button"
                  disabled={currentStepIndex >= trackerStationsList.length - 1}
                  onClick={onNextStep}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor:
                      currentStepIndex >= trackerStationsList.length - 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      currentStepIndex >= trackerStationsList.length - 1
                        ? 0.5
                        : 1,
                  }}
                >
                  وصلت المحطة التالية{" "}
                  <i
                    className="fa-solid fa-chevron-left"
                    style={{ marginRight: "4px" }}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Detailed Path Timeline for Route */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--ra-8)",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "0.92rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "12px",
              }}
            >
              تفاصيل ومسار محطات الرحلة ({routeResult.count} محطة):
            </div>

            {/* Single Line Path */}
            {routeResult.sameLine && routeResult.stations && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {routeResult.stations.map((stName, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === (routeResult.stations?.length ?? 0) - 1;
                  const stDetails = MONORAIL_STATION_DETAILS[stName];

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: isFirst || isLast ? "12px" : "8px",
                          height: isFirst || isLast ? "12px" : "8px",
                          borderRadius: "50%",
                          background: isFirst
                            ? "var(--colorSuccess)"
                            : isLast
                            ? "var(--accent-red, #ef4444)"
                            : routeResult.lineColor,
                          border:
                            isFirst || isLast
                              ? "2px solid var(--bgPrimary)"
                              : "none",
                          boxShadow:
                            isFirst || isLast
                              ? `0 0 0 2px ${routeResult.lineColor}`
                              : "none",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: isFirst || isLast ? "700" : "500",
                          color: "var(--text-primary)",
                        }}
                      >
                        {stName}
                        {isFirst && (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                              marginRight: "6px",
                            }}
                          >
                            (محطة الركوب)
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
                            (محطة الوصول)
                          </span>
                        )}
                      </span>
                      {stDetails?.status === "تحت الإنشاء" && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ef4444",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            marginRight: "auto",
                          }}
                        >
                          تحت الإنشاء 🚧
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multi-Leg Path */}
            {!routeResult.sameLine && routeResult.leg1 && routeResult.leg3 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Leg 1 */}
                <div
                  style={{
                    borderRight: `3px solid ${routeResult.leg1.lineColor}`,
                    paddingRight: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: routeResult.leg1.lineColor,
                      marginBottom: "6px",
                    }}
                  >
                    المرحلة الأولى: {routeResult.leg1.lineName} (
                    {routeResult.leg1.count} محطات - {routeResult.leg1.price}{" "}
                    ج.م)
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    من <strong>{routeResult.leg1.from}</strong> إلى محطة
                    التحويل <strong>{routeResult.leg1.to}</strong>
                  </div>
                </div>

                {/* Leg 2 - Metro Transfer */}
                <div
                  style={{
                    borderRight: "3px dashed var(--colorWarning, #f59e0b)",
                    paddingRight: "10px",
                    background: "rgba(245, 158, 11, 0.05)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: "var(--colorWarning, #f59e0b)",
                      marginBottom: "4px",
                    }}
                  >
                    المرحلة الثانية: التحويل عبر الخط الثالث لمترو الأنفاق (~25
                    دقيقة - 12 ج.م)
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {routeResult.leg2?.description}
                  </div>
                </div>

                {/* Leg 3 */}
                <div
                  style={{
                    borderRight: `3px solid ${routeResult.leg3.lineColor}`,
                    paddingRight: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: routeResult.leg3.lineColor,
                      marginBottom: "6px",
                    }}
                  >
                    المرحلة الثالثة: {routeResult.leg3.lineName} (
                    {routeResult.leg3.count} محطات - {routeResult.leg3.price}{" "}
                    ج.م)
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    من محطة التحويل <strong>{routeResult.leg3.from}</strong> إلى
                    الوجهة النهائية <strong>{routeResult.leg3.to}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Report Route Issue Button */}
            <div
              style={{
                marginTop: "14px",
                paddingTop: "10px",
                borderTop: "1px solid var(--border-glass)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn btn-report"
                onClick={() => onOpenReportModal(null, true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.76rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" />
                الإبلاغ عن خطأ في حساب هذا المسار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
