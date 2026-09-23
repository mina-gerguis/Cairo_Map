import React from "react";
import VoiceInputButton from "@/components/VoiceInputButton";
import { MetroRouteCalculatorProps } from "../types";
import { LINE_COLORS, LINE_NAMES } from "../constants";
import { normalizeArabic } from "../utils";

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
    <div ref={panelRef} className="details-panel">
      {/* Title & Nearest Station GPS Button */}
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
          رايح فين كدا .؟
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
          title="تحديد أقرب محطة مترو لموقعي الحالي عبر الـ GPS"
        >
          <i className={locatingNearest ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-location-crosshairs"}></i>
          {locatingNearest ? "جاري التحديد..." : "أقرب محطة فين"}
        </button>
      </div>

      {/* Search Inputs Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
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
              <i className="fa-solid fa-circle-dot" style={{ marginLeft: "6px", color: "var(--colorSuccess)" }}></i> من محطة:
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
          {showFromList && filteredFrom.length > 0 && (
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
              {filteredFrom.map((s) => {
                const q = normalizeArabic(fromQuery.trim());
                const matchedLandmark = q
                  ? (s.landmarks || []).find((l) => normalizeArabic(l).includes(q))
                  : null;
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hoverBtn)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)", fontWeight: "bold" }}>
                          📍 قريب من: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                      {s.lines.map((l) => (
                        <span
                          key={l}
                          style={{
                            width: "6px",
                            height: "6px",
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
                          fontSize: "0.72rem",
                          background: "var(--border-glass)",
                          color: "var(--text-secondary)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        تبادلية
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SWAP BUTTON */}
        <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
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
              <i className="fa-solid fa-circle-dot" style={{ marginLeft: "6px", color: "#ff0000" }}></i> إلى محطة:
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
          {showToList && filteredTo.length > 0 && (
            <div
              style={{
                position: "relative",
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
                fontFamily: "var(--font-sub)",
              }}
            >
              {filteredTo.map((s) => {
                const q = normalizeArabic(toQuery.trim());
                const matchedLandmark = q
                  ? (s.landmarks || []).find((l) => normalizeArabic(l).includes(q))
                  : null;
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
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hoverBtn)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        {s.name}
                      </span>
                      {matchedLandmark && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-secondary)", fontWeight: "bold" }}>
                          📍 قريب من: {matchedLandmark}
                        </span>
                      )}
                    </div>
                    <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                      {s.lines.map((l) => (
                        <span
                          key={l}
                          style={{
                            width: "6px",
                            height: "6px",
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
                          fontSize: "0.72rem",
                          background: "var(--border-glass)",
                          color: "var(--text-secondary)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        تبادلية
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SEARCH BUTTON */}
      <button
        type="button"
        onClick={onFindRoute}
        disabled={!selectedFrom || !selectedTo}
        className="btn btn-primary"
        style={{
          width: "100%",
          marginTop: "4px",
          fontSize: "0.95rem",
          fontWeight: "700",
          cursor: !selectedFrom || !selectedTo ? "not-allowed" : "pointer",
          opacity: !selectedFrom || !selectedTo ? 0.6 : 1,
        }}
      >
        <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "6px" }}></i>
        اعرض مسار وتفاصيل الرحلة
      </button>

      {/* TRIP RESULTS */}
      {result && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
              {/* Results Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
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
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-secondary)" }}>
                    {result.stationCount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>
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
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--colorSuccess)" }}>
                    {result.price} ج.م
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>
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
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-secondary)" }}>
                    {result.estimatedTime} د
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>
                    وقت الوصول
                  </div>
                </div>
                {/* Number of Transfers */}
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
                      color: result.needsTransfer ? "var(--colorWarning, #f59e0b)" : "var(--colorSuccess)",
                    }}
                  >
                    {result.needsTransfer ? `${result.transfers.length} تبديل` : "مباشر"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>
                    نوع الرحلة
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
                    ></i>
                    {result.description}
                  </p>
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
                    <i className="fa-solid fa-play"></i>
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
                    <i className={copiedRoute ? "fa-solid fa-check" : "fa-solid fa-share-nodes"}></i>
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
                      color: "#ffffffff",
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }}></i>
                    شارك مباشرا علي الواتساب
                  </a>
                </div>
              )}

              {/* Active Trip Tracker */}
              {isTripActive && (
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
                      <i className="fa-solid fa-trash" style={{ marginLeft: "6px" }}></i>
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
                    <strong style={{ color: "var(--text-primary)", fontSize: "1.05rem" }}>
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
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          marginBottom: "14px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        الوقت المتبقي المقدر:{" "}
                        <strong style={{ color: "var(--color-secondary)" }}>{remainingTime} دقيقة</strong>
                      </div>
                    );
                  })()}

                  {result.detailedPath[currentStepIndex]?.isTransferPoint && (
                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.08)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "14px",
                        fontSize: "0.84rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <div style={{ fontWeight: "800", color: "#f59e0b", marginBottom: "4px" }}>
                        ⚠️ تنبيه: محطة تبديل وتحويل خط!
                      </div>
                      انزل هنا من القطار وابحث عن اليافطة الإرشادية المكتوب عليها{" "}
                      <strong
                        style={{
                          color:
                            LINE_COLORS[result.detailedPath[currentStepIndex]?.targetLine!] || "#10b981",
                        }}
                      >
                        {LINE_NAMES[result.detailedPath[currentStepIndex]?.targetLine!]}
                      </strong>{" "}
                      واتبع الأسهم للتوجه نحو الرصيف وركوب القطار التالي.
                    </div>
                  )}

                  {currentStepIndex < result.detailedPath.length - 1 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={onStepNext}
                      style={{
                        width: "100%",
                        fontSize: "0.92rem",
                        fontWeight: "700",
                      }}
                    >
                      وصلت لمحطة {result.detailedPath[currentStepIndex + 1]?.station} ←
                    </button>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: "8px",
                        padding: "14px",
                      }}
                    >
                      <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>🎉</div>
                      <h4 style={{ color: "var(--colorSuccess)", fontWeight: "800", margin: "0 0 4px" }}>
                        حمدلله على السلامة!
                      </h4>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: "0 0 10px" }}>
                        لقد وصلت إلى وجهتك محطة {result.detailedPath[currentStepIndex]?.station}.
                      </p>
                      <button type="button" onClick={onEndTrip} className="btn btn-primary">
                        إنهاء الرحلة
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Stops Timeline */}
              <div
                style={{
                  background: "var(--bg-glass)",
                  padding: "20px 16px",
                  borderRadius: "var(--ra-8)",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <h2 className="text-md fw-bold mb-4">المحطات وترتيب مسار الرحلة</h2>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {result.detailedPath.map((node, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === result.detailedPath.length - 1;
                    const isTransfer = node.isTransferPoint;
                    const activeColor = LINE_COLORS[node.line] || "#ef4444";
                    const isPassed = isTripActive && idx < currentStepIndex;
                    const isCurrent = isTripActive && idx === currentStepIndex;

                    const stationObj = stations.find((s) => s.name === node.station);
                    const isUnderConstruction = stationObj?.status === "تحت الإنشاء";

                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>
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
                            {isPassed ? (
                              <div
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "50%",
                                  backgroundColor: "var(--colorSuccess)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
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
                                    ? "var(--colorWarning, #f59e0b)"
                                    : activeColor,
                                  border: isUnderConstruction
                                    ? `2px dashed var(--colorDanger)`
                                    : isFirst || isLast
                                    ? `2px solid var(--bgPrimary)`
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

                          {/* Text & Badges */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexGrow: 1,
                              opacity: isPassed ? 0.5 : 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.88rem",
                                fontWeight: isFirst || isLast || isTransfer || isCurrent ? "700" : "500",
                                color: isUnderConstruction
                                  ? "#ef4444"
                                  : isCurrent
                                  ? "var(--color-secondary)"
                                  : isFirst || isLast
                                  ? "var(--text-primary)"
                                  : "var(--text-secondary)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {node.station}
                              {isFirst && (
                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                  (محطة الركوب)
                                </span>
                              )}
                              {isLast && (
                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                  (محطة الوصول)
                                </span>
                              )}
                            </span>

                            <span
                              style={{
                                fontSize: "0.68rem",
                                color: "#ffffff",
                                background: activeColor + "cc",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                marginRight: "auto",
                              }}
                            >
                              {LINE_NAMES[node.line].split(" ")[0] + " " + LINE_NAMES[node.line].split(" ")[1]}
                            </span>
                          </div>
                        </div>

                        {/* Connective Line */}
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
                                  opacity: 0.4,
                                }}
                              />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                              {isTransfer && (
                                <div
                                  style={{
                                    background: "rgba(245, 158, 11, 0.06)",
                                    border: "1px solid rgba(245, 158, 11, 0.2)",
                                    borderRadius: "6px",
                                    padding: "6px 10px",
                                    margin: "4px 0",
                                    fontSize: "0.76rem",
                                    color: "var(--colorWarning, #f59e0b)",
                                    fontWeight: "600",
                                  }}
                                >
                                  🔄 محطة تبديل: التوجه إلى {LINE_NAMES[node.targetLine!]}
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
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  type="button"
                  className="btn btn-report"
                  onClick={() => onOpenReportModal(null, true)}
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>الإبلاغ عن خطأ في حساب مسار هذه الرحلة</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
