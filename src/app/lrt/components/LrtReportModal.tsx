import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LrtReportModalProps } from "../types";
import { LRT_PROBLEM_OPTIONS, STATION_DETAILS } from "../constants";

export default function LrtReportModal({
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
  onSubmit,
  selectedFrom,
  selectedTo,
  routeResult,
  color = "#06b6d4",
}: LrtReportModalProps) {
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
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        direction: "rtl",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && !uploading) {
          onClose();
        }
      }}
    >
      <div
        ref={modalBoxRef}
        style={{
          backgroundColor: "var(--color-bg)",
          borderRadius: "var(--radius-card, 16px)",
          border: "1px solid var(--border-glass)",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "92vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-cairo, inherit)",
        }}
        onClick={(e) => e.stopPropagation()}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "800",
                  color: "var(--color-fg)",
                }}
              >
                الإبلاغ عن مشكلة في القطار الكهربائي LRT
              </h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                ساعدنا في تحسين وتدقيق مسارات ومحطات القطار الخفيف
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-close"
            disabled={loading || uploading}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1.4rem",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "80vh" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 16px",
                }}
              >
                <i className="bx bx-check" />
              </div>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  color: "var(--color-fg)",
                }}
              >
                تم استلام بلاغك بنجاح!
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                شكراً لمساهمتك في تدقيق وتطوير بيانات شبكة القطار الكهربائي الخفيف LRT. سنقوم بمراجعة الملاحظة وتحديثها فوراً.
              </p>
            </div>
          ) : limitChecking ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: color,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                جاري التحقق من الصلاحيات...
              </span>
            </div>
          ) : limitReached ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  color: "var(--accent-warning, #f59e0b)",
                  marginBottom: "12px",
                }}
              >
                ⏳
              </div>
              <h4 style={{ margin: "0 0 8px", fontWeight: "800", color: "var(--color-fg)" }}>
                لقد تجاوزت الحد اليومي للبلاغات
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
                يمكنك إرسال 3 بلاغات كحد أقصى يومياً للمحافظة على جودة البيانات. يرجى المحاولة غداً أو التواصل معنا مباشرة.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-cancel"
                style={{ marginTop: "14px", width: "100%" }}
              >
                إغلاق النافذة
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Scope Segmented Control */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                  نطاق المشكلة أو البلاغ:
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: routeResult ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
                    gap: "6px",
                    background: "var(--bg-secondary)",
                    padding: "4px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setTargetScope("general")}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: targetScope === "general" ? "var(--color-bg)" : "transparent",
                      color: targetScope === "general" ? "var(--color-fg)" : "var(--text-muted)",
                      boxShadow: targetScope === "general" ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    عام / المنظومة
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetScope("station")}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: targetScope === "station" ? "var(--color-bg)" : "transparent",
                      color: targetScope === "station" ? "var(--color-fg)" : "var(--text-muted)",
                      boxShadow: targetScope === "station" ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    محطة محددة
                  </button>

                  {routeResult && (
                    <button
                      type="button"
                      onClick={() => setTargetScope("route")}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: targetScope === "route" ? "var(--color-bg)" : "transparent",
                        color: targetScope === "route" ? "var(--color-fg)" : "var(--text-muted)",
                        boxShadow: targetScope === "route" ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      مسار الرحلة
                    </button>
                  )}
                </div>
              </div>

              {/* Station Selection if Scope is station */}
              {targetScope === "station" && (
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                    اختر المحطة المعنية:
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    placeholder="ابحث عن المحطة (مثال: عدلي منصور، الشروق...)"
                    value={stationSearchQuery}
                    onChange={(e) => {
                      setStationSearchQuery(e.target.value);
                      setShowStationList(true);
                    }}
                    onFocus={() => setShowStationList(true)}
                    style={{
                      height: "42px",
                      fontSize: "0.88rem",
                      borderRadius: "10px",
                      width: "100%",
                      padding: "0 12px",
                    }}
                  />

                  {showStationList && filteredStations.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        left: 0,
                        zIndex: 20,
                        background: "var(--color-bg)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "10px",
                        maxHeight: "180px",
                        overflowY: "auto",
                        marginTop: "4px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      }}
                    >
                      {filteredStations.map((st) => (
                        <div
                          key={st.name}
                          onClick={() => {
                            setSelectedStation(st.name);
                            setStationSearchQuery(st.name);
                            setShowStationList(false);
                          }}
                          style={{
                            padding: "9px 12px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            borderBottom: "1px solid var(--border-glass)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: "700", color: "var(--color-fg)" }}>
                            {st.name}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {st.line_type === "trunk" ? "الجذع الرئيسي" : st.line_type === "capital" ? "العاصمة" : "العاشر"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Route Summary if Scope is route */}
              {targetScope === "route" && routeResult && (
                <div
                  style={{
                    background: "rgba(6, 182, 212, 0.08)",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.82rem",
                    color: "var(--color-fg)",
                  }}
                >
                  <div style={{ fontWeight: "800", color: "#06b6d4", marginBottom: "4px" }}>
                    مسار الرحلة المحددة:
                  </div>
                  <div>
                    من <strong>{selectedFrom}</strong> إلى <strong>{selectedTo}</strong> • {routeResult.count} محطات • {routeResult.price} ج.م
                  </div>
                </div>
              )}

              {/* Problem Type Selector */}
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                  نوع الملاحظة أو المشكلة:
                </label>

                {/* Dropdown trigger */}
                {(() => {
                  const currentOpt =
                    LRT_PROBLEM_OPTIONS.find((o) => o.id === problemType) ||
                    LRT_PROBLEM_OPTIONS[0];

                  return (
                    <button
                      type="button"
                      onClick={() => setShowProblemTypeDropdown?.((prev: boolean) => !prev)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        color: "var(--color-fg)",
                        border: "1px solid var(--border-glass)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "right",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className={currentOpt.icon} style={{ color: currentOpt.badgeColor }} />
                        <span style={{ fontSize: "0.88rem", fontWeight: "700" }}>{currentOpt.title}</span>
                      </div>
                      <i className={`bx bx-chevron-${showProblemTypeDropdown ? "up" : "down"}`} style={{ fontSize: "1.2rem" }} />
                    </button>
                  );
                })()}

                {/* Dropdown Menu */}
                {showProblemTypeDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      left: 0,
                      zIndex: 30,
                      background: "var(--color-bg)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "10px",
                      marginTop: "4px",
                      maxHeight: "240px",
                      overflowY: "auto",
                      boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
                      padding: "6px",
                    }}
                  >
                    {LRT_PROBLEM_OPTIONS.map((opt) => {
                      const isSel = opt.id === problemType;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setProblemType(opt.id);
                            setShowProblemTypeDropdown?.(false);
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            background: isSel ? "rgba(255, 255, 255, 0.08)" : "transparent",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={opt.icon} style={{ color: opt.badgeColor, fontSize: "0.95rem" }} />
                            <div>
                              <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--color-fg)" }}>
                                {opt.title}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              color: opt.badgeColor,
                              background: `${opt.badgeColor}15`,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {opt.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details Textarea */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                  تفاصيل الملاحظة أو التصحيح المطلوب:
                </label>
                <textarea
                  className="input-fields"
                  placeholder="صف المشكلة بدقة لمساعدتنا في تحديث البيانات..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "0.85rem",
                    resize: "vertical",
                    minHeight: "85px",
                  }}
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                  إرفاق صورة توضيحية (اختياري):
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
                      const file = e.dataTransfer.files?.[0];
                      if (file) onImageSelect(file);
                    }}
                    style={{
                      border: isDraggingImage ? `2px dashed ${color}` : "2px dashed var(--border-glass)",
                      borderRadius: "10px",
                      padding: "18px 12px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: isDraggingImage ? "rgba(6, 182, 212, 0.08)" : "var(--bg-secondary)",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => {
                      const input = document.getElementById("lrt-report-file-input");
                      input?.click();
                    }}
                  >
                    <i className="bx bx-cloud-upload" style={{ fontSize: "1.8rem", color: color }} />
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      اسحب وأفلت الصورة هنا أو اضغط للاختيار من جهازك
                    </p>
                    <input
                      id="lrt-report-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageSelect(file);
                      }}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-glass)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--color-fg)", fontWeight: "700" }}>
                        {imageFile?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onImageSelect(null)}
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "none",
                        color: "#ef4444",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                      }}
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Actions Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    height: "44px",
                    fontSize: "0.92rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {loading || uploading ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <>
                      <i className="bx bx-send" />
                      <span>إرسال البلاغ</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || uploading}
                  className="btn btn-cancel"
                  style={{
                    width: "90px",
                    height: "44px",
                    fontSize: "0.92rem",
                    fontWeight: "700",
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
