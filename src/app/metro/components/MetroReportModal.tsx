import React from "react";
import Link from "next/link";
import { LineId, MetroReportModalProps } from "../types";
import { LINE_COLORS, METRO_PROBLEM_OPTIONS } from "../constants";

export default function MetroReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  user,
  targetScope,
  setTargetScope,
  selectedStation,
  setSelectedStation,
  stationSearchQuery,
  setStationSearchQuery,
  showStationList,
  setShowStationList,
  filteredStations,
  problemType,
  setProblemType,
  showProblemTypeDropdown,
  setShowProblemTypeDropdown,
  details,
  setDetails,
  imageFile,
  imagePreview,
  isDraggingImage,
  setIsDraggingImage,
  onImageSelect,
  loading,
  uploading,
  success,
  error,
  limitChecking,
  limitReached,
  selectedFrom,
  selectedTo,
  routeResult,
  color,
  onSubmit,
}: MetroReportModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        direction: "rtl",
      }}
    >
      <div
        ref={modalBoxRef}
        style={{
          backgroundColor: "var(--bgPrimary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--border-glass)",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-cairo)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-glass)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <h5
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
            <span>مشكلة في خدمة مترو الأنفاق</span>
          </h5>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-close"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(52, 199, 89, 0.15)",
                  color: "#34c759",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 16px",
                }}
              >
                <i className="bx bx-check"></i>
              </div>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                تم استلام بلاغك بنجاح!
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                شكراً لمساهمتك في تحسين وتدقيق مسارات وبيانات مترو القاهرة. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
              </p>
            </div>
          ) : limitChecking ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: "var(--color-secondary)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري التحقق...</span>
            </div>
          ) : limitReached ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <img
                  src="/images/icons3d/error.png"
                  alt="error"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  loading="lazy"
                />
              </div>
              <h5
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h5>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
                style={{ width: "100%" }}
              >
                حسناً، فهمت
              </button>
            </div>
          ) : !user ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  margin: "0 auto 14px",
                }}
              >
                <i className="bx bx-user"></i>
              </div>
              <h5
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                تسجيل الدخول مطلوب
              </h5>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة في المترو ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Scope Segmented Control */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  نطاق المشكلة:
                </label>
                <div
                  className="tabs"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      selectedFrom && selectedTo ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("general");
                      setSelectedStation("");
                      setStationSearchQuery("");
                      setShowStationList(false);
                    }}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      border: "none",
                      background: targetScope === "general" ? "var(--text-primary)" : "transparent",
                      color: targetScope === "general" ? "var(--bgMode)" : "var(--text-primary)",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    مشكلة عامة
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("station");
                      setShowStationList(true);
                    }}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      border: "none",
                      background: targetScope === "station" ? "var(--text-primary)" : "transparent",
                      color: targetScope === "station" ? "var(--bgMode)" : "var(--text-primary)",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    محطة معينة
                  </button>

                  {selectedFrom && selectedTo && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetScope("route");
                        setSelectedStation("");
                        setStationSearchQuery("");
                        setShowStationList(false);
                      }}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "8px",
                        border: "none",
                        background: targetScope === "route" ? "var(--text-primary)" : "transparent",
                        color: targetScope === "route" ? "var(--bgMode)" : "var(--text-primary)",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      الرحلة الحالية
                    </button>
                  )}
                </div>
              </div>

              {/* If Scope is Station: Searchable station autocomplete selector */}
              {targetScope === "station" && (
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    <span>اختر أو ابحث عن المحطة:</span>
                    {selectedStation && (
                      <span style={{ fontSize: "0.74rem", color: color, fontWeight: "700" }}>
                        تم تحديد: {selectedStation} ✔
                      </span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="ابحث باسم المحطة أو المعلم القريب..."
                      value={stationSearchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStationSearchQuery(val);
                        setShowStationList(true);
                        if (selectedStation && val !== selectedStation) {
                          setSelectedStation("");
                        }
                      }}
                      onFocus={() => setShowStationList(true)}
                      onBlur={() => setTimeout(() => setShowStationList(false), 250)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 36px",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: selectedStation
                          ? `1px solid var(--text-primary)`
                          : "1px solid var(--border-glass)",
                        fontSize: "0.9rem",
                        direction: "rtl",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bx bx-search" style={{ fontSize: "1rem" }}></i>
                    </div>

                    {stationSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStation("");
                          setStationSearchQuery("");
                          setShowStationList(true);
                        }}
                        title="مسح"
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "none",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Station suggestions list popup */}
                  {showStationList && (
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
                        zIndex: 1100,
                        maxHeight: "220px",
                        overflowY: "auto",
                        marginTop: "6px",
                        padding: "4px",
                      }}
                    >
                      {filteredStations.length === 0 ? (
                        <div
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <i
                            className="bx bx-search"
                            style={{ fontSize: "1.2rem", display: "block", marginBottom: "4px" }}
                          />
                          لا توجد محطة مطابقة لبحثك "{stationSearchQuery}"
                        </div>
                      ) : (
                        filteredStations.map((st) => {
                          const isSelected = selectedStation === st.name;
                          return (
                            <div
                              key={st.name}
                              onMouseDown={() => {
                                setSelectedStation(st.name);
                                setStationSearchQuery(st.name);
                                setShowStationList(false);
                              }}
                              style={{
                                padding: "9px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                border: isSelected
                                  ? "1px solid rgba(59, 130, 246, 0.3)"
                                  : "1px solid transparent",
                                transition: "all 0.15s ease",
                                marginBottom: "2px",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "var(--hoverBtn)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <i
                                  className="bx bx-map-pin"
                                  style={{
                                    color: isSelected ? "var(--color-secondary)" : "var(--text-secondary)",
                                    fontSize: "1rem",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: "0.88rem",
                                    fontWeight: isSelected ? "700" : "600",
                                    color: isSelected
                                      ? "var(--color-secondary)"
                                      : "var(--text-primary)",
                                  }}
                                >
                                  {st.name}
                                </span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ display: "flex", gap: "3px" }}>
                                  {st.lines.map((l: LineId) => (
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
                                {st.isTransfer && (
                                  <span
                                    style={{
                                      fontSize: "0.68rem",
                                      background: "rgba(59, 130, 246, 0.15)",
                                      color: "var(--color-secondary)",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    تبادلية
                                  </span>
                                )}
                                {isSelected && (
                                  <span
                                    style={{
                                      fontSize: "0.78rem",
                                      color: "var(--colorSuccess)",
                                      fontWeight: "700",
                                    }}
                                  >
                                    ✔
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* If Scope is Route: display current route preview card */}
              {targetScope === "route" && selectedFrom && selectedTo && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.06)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    fontSize: "0.84rem",
                    color: "var(--text-primary)",
                    lineHeight: "1.6",
                  }}
                >
                  <div>
                    {" "}
                    <strong>من:</strong> {selectedFrom} ← <strong>إلى:</strong> {selectedTo}
                  </div>
                  {routeResult && (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      سعر التذكرة: {routeResult.price} ج.م • المحطات: {routeResult.stationCount} • الوقت:{" "}
                      {routeResult.estimatedTime} د
                    </div>
                  )}
                </div>
              )}

              {/* Custom Problem Type Dropdown Selector */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  <span>نوع المشكلة:</span>
                </label>

                {/* Dropdown Trigger Box */}
                {(() => {
                  const curOpt =
                    METRO_PROBLEM_OPTIONS.find((o) => o.id === problemType) ||
                    METRO_PROBLEM_OPTIONS[0];
                  return (
                    <button
                      type="button"
                      onClick={() => setShowProblemTypeDropdown((prev) => !prev)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "var(--radius-card)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: showProblemTypeDropdown
                          ? `1px solid var(--text-primary)`
                          : "1px solid var(--border-glass)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "right",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div style={{ minWidth: 0, textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "0.86rem",
                              fontWeight: "700",
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {curOpt.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-secondary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {curOpt.desc}
                          </div>
                        </div>
                      </div>

                      <i
                        className={
                          showProblemTypeDropdown ? "bx bx-chevron-up" : "bx bx-chevron-down"
                        }
                        style={{
                          fontSize: "1.25rem",
                          color: "var(--text-secondary)",
                          marginRight: "8px",
                          flexShrink: 0,
                        }}
                      />
                    </button>
                  );
                })()}

                {/* Problem Types Floating Popup Menu */}
                {showProblemTypeDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "var(--radius-card)",
                      zIndex: 1200,
                      maxHeight: "360px",
                      overflowY: "auto",
                      marginTop: "6px",
                      padding: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {METRO_PROBLEM_OPTIONS.map((opt) => {
                      const isSelected = opt.id === problemType;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setProblemType(opt.id);
                            setShowProblemTypeDropdown(false);
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "var(--radius-card)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            background: isSelected ? "var(--bgPrimary)" : "transparent",
                            border: isSelected
                              ? `1px solid var(--border-primary)`
                              : "1px solid transparent",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              minWidth: 0,
                            }}
                          >
                            <div style={{ minWidth: 0, textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "0.84rem",
                                  fontWeight: isSelected ? "800" : "600",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {opt.title}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details Textarea */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  تفاصيل المشكلة / التصحيح المقترح: <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: سعر التذكرة من حلوان للسادات أصبح كذا، أو محطة كذا تفتح في مواعيد مختلفة)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="input-fields"
                  required
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-glass)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Enhanced Image File Upload */}
              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  <span>صورة توضيحية (اختياري):</span>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      color: "var(--text-secondary)",
                      fontWeight: "normal",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    JPG, PNG, WEBP (Max~5MB)
                  </span>
                </label>

                {!imagePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) onImageSelect(droppedFile);
                    }}
                    style={{
                      position: "relative",
                      border: isDraggingImage
                        ? "2px dashed var(--color-secondary)"
                        : "2px dashed var(--borderDashed)",
                      borderRadius: "12px",
                      background: isDraggingImage
                        ? "rgba(59, 130, 246, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                      padding: "20px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isDraggingImage) e.currentTarget.style.background = "var(--hoverBtn)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isDraggingImage)
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageSelect(file);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />

                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: "rgba(59, 130, 246, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: color || "var(--color-secondary)",
                        fontSize: "1.4rem",
                      }}
                    >
                      <i className="bx bx-cloud-upload"></i>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          marginBottom: "3px",
                        }}
                      >
                        اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                        أرسل صورة الخطأ إن وُجد لتوضيح المشكلة بدقة
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#000",
                        border: "1px solid var(--border-glass)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="معاينة الصورة المرفقة"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {imageFile?.name || "صورة توضيحية"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.74rem",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>
                          {imageFile
                            ? imageFile.size < 1024 * 1024
                              ? `${(imageFile.size / 1024).toFixed(0)} KB`
                              : `${(imageFile.size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => onImageSelect(null)}
                        title="حذف الصورة"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#ef4444",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <i className="bx bx-trash"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    fontSize: "0.85rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit and Cancel Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="submit"
                  className="btn actionBtnDelete"
                  disabled={loading || uploading}
                  style={{
                    flex: 1,
                    fontWeight: "700",
                    fontSize: "0.92rem",
                    cursor: loading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    width: "50%",
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #fff",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <span>{uploading ? "جاري الرفع ..." : "جاري الإرسال..."}</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send"></i>
                      <span>إرسال البلاغ</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  disabled={loading}
                  onClick={onClose}
                  style={{
                    fontWeight: "700",
                    fontSize: "0.92rem",
                    width: "50%",
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
