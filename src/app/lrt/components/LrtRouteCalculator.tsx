import React from "react";
import { LrtRouteCalculatorProps } from "../types";

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
      <div
        ref={panelRef}
        className="metro-animate-slide-up metro-delay-200"
        style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "20px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 20,
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          <i
            className="fa-solid fa-route"
            style={{ marginLeft: "5px", color: "var(--color-secondary)" }}
          />{" "}
          مخطط الرحلة وحساب التذاكر
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
          }}
        >
          {/* FROM STATION INPUT */}
          <div style={{ position: "relative", zIndex: showFromList ? 10 : 1 }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              من محطة:
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="input-fields"
                placeholder="اكتب اسم محطة البداية..."
                value={fromQuery}
                onChange={(e) => onFromQueryChange(e.target.value)}
                onFocus={onFromFocus}
                onBlur={() => setTimeout(onFromBlur, 250)}
                style={{
                  width: "100%",
                  direction: "rtl",
                  fontFamily: "var(--font-body)",
                  height: "50px",
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
                  borderRadius: "12px",
                  overflow: "hidden",
                  zIndex: 100,
                  maxHeight: "220px",
                  overflowY: "auto",
                  boxShadow: "var(--shadow-lg)",
                  marginTop: "6px",
                }}
              >
                {filteredFrom.map((s) => (
                  <div
                    key={s}
                    onMouseDown={() => onSelectFrom(s)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--hoverBtn)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
            <button
              type="button"
              onClick={onSwapStations}
              aria-label="تبديل المحطات"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "1.2rem",
                transition: "all 0.2s ease",
                marginTop: "10px",
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
            >
              ⇅
            </button>
          </div>

          {/* TO STATION INPUT */}
          <div style={{ position: "relative", zIndex: showToList ? 10 : 1 }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              إلى محطة:
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="input-fields"
                placeholder="اكتب اسم محطة النهاية..."
                value={toQuery}
                onChange={(e) => onToQueryChange(e.target.value)}
                onFocus={onToFocus}
                onBlur={() => setTimeout(onToBlur, 250)}
                style={{
                  width: "100%",
                  direction: "rtl",
                  fontFamily: "var(--font-body)",
                  height: "50px",
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
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  zIndex: 100,
                  maxHeight: "220px",
                  overflowY: "auto",
                  boxShadow: "var(--shadow-lg)",
                  marginTop: "6px",
                }}
              >
                {filteredTo.map((s) => (
                  <div
                    key={s}
                    onMouseDown={() => onSelectTo(s)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--hoverBtn)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      {s}
                    </span>
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
          className="btn btn-primary"
          style={{
            width: "100%",
            marginTop: "8px",
            fontSize: "0.95rem",
            fontWeight: "700",
          }}
        >
          وريني الطريق
        </button>
      </div>

      {/* Calculation results display */}
      {result && (
        <div
          className="metro-animate-slide-up"
          style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "15px",
            padding: "20px",
            marginTop: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h5
            style={{
              fontSize: "1.1rem",
              fontWeight: "700",
              marginBottom: "16px",
              color: "var(--text-primary)",
              margin: "0 0 16px",
            }}
          >
            <i
              className="fa-solid fa-signs-post"
              style={{ marginLeft: "6px", color: "var(--color-secondary)" }}
            />{" "}
            تفاصيل الرحلة
          </h5>

          {/* Grid Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "var(--colorSuccess)",
                }}
              >
                {result.price} ج.م
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "2px",
                }}
              >
                سعر التذكرة
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "var(--color-secondary)",
                }}
              >
                {result.estimatedTime} د
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "2px",
                }}
              >
                الوقت التقريبي
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                {result.count}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  marginTop: "2px",
                }}
              >
                عدد المحطات
              </div>
            </div>
          </div>

          {/* Start Trip Button */}
          {!isTripActive && (
            <button
              type="button"
              onClick={onStartTrip}
              className="btn btn-secondary"
              style={{
                width: "100%",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <i className="fa-solid fa-play" style={{ marginLeft: "5px" }} />
              ابدأ تتبع الرحلة
            </button>
          )}

          {/* Active Trip Tracker Card */}
          {isTripActive && (
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "var(--shadow-card)",
                animation: "fadeIn 0.3s ease",
              }}
            >
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
                    background: "rgba(6, 182, 212, 0.12)",
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
                    color: "var(--accent-red)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "var(--font-cairo)",
                    background: "rgba(246, 59, 59, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                  }}
                >
                  <i className="bx bx-trash" style={{ marginLeft: "5px" }} />
                  إلغاء التتبع
                </button>
              </div>

              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--text-secondary)",
                }}
              >
                أنت الآن في محطة:{" "}
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "1.1rem",
                    fontWeight: "800",
                  }}
                >
                  {result.stations[currentStepIndex]}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
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
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      marginBottom: "16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ⏱️ الوقت المتبقي للوصول:{" "}
                    <span
                      style={{
                        color: "var(--color-secondary)",
                        fontSize: "1rem",
                        fontWeight: "800",
                      }}
                    >
                      {remainingTime} دقيقة
                    </span>
                  </div>
                );
              })()}

              {/* Controls */}
              {currentStepIndex < result.stations.length - 1 ? (
                <button
                  type="button"
                  onClick={onNextStep}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  وصلت محطة {result.stations[currentStepIndex + 1]}
                </button>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "10px",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
                  <h4
                    style={{
                      color: "var(--colorSuccess)",
                      fontWeight: "800",
                      margin: "0 0 6px",
                    }}
                  >
                    حمد لله على السلامة!
                  </h4>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      margin: "0 0 12px",
                    }}
                  >
                    لقد وصلت إلى وجهتك محطة{" "}
                    <span
                      style={{
                        color: "var(--color-secondary)",
                        fontSize: "1rem",
                        fontWeight: "800",
                      }}
                    >
                      {result.stations[currentStepIndex]}
                    </span>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={onEndTrip}
                    style={{
                      background: "var(--color-secondary)",
                      color: "#ffffff",
                      padding: "8px 24px",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      fontFamily: "var(--font-cairo)",
                    }}
                  >
                    إنهاء الرحلة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Station sequence timeline */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              background: "var(--bg-secondary)",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--border-glass)",
            }}
          >
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
                  boxShadow = "0 0 10px rgba(6, 182, 212, 0.5)";
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
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background: bg,
                      color,
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      border,
                      boxShadow,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {icon && <span style={{ fontSize: "0.8rem" }}>{icon}</span>}
                    {s}
                  </span>
                  {idx < result.stations.length - 1 && (
                    <span
                      style={{
                        color:
                          isTripActive && idx < currentStepIndex ? "#10b981" : "#06b6d4",
                        fontWeight: "bold",
                        transition: "color 0.3s ease",
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
                fontFamily: "var(--font-cairo)",
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
