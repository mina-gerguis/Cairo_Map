import React from "react";
import { MonorailReportModalProps } from "../types";
import { PROBLEM_OPTIONS } from "../constants";

export default function MonorailReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  user,
  targetScope,
  setTargetScope,
  selectedStation,
  setSelectedStation,
  stationQuery,
  setStationQuery,
  showStationList,
  setShowStationList,
  filteredStations,
  problemType,
  setProblemType,
  details,
  setDetails,
  imagePreview,
  isDraggingImage,
  setIsDraggingImage,
  onImageSelect,
  error,
  loading,
  uploading,
  success,
  limitReached,
  onSubmit,
  hasRouteResult,
}: MonorailReportModalProps) {
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
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{ color: "#ef4444", fontSize: "1.1rem" }}
            />
            <span>مشكلة في بيانات قطار المونوريل</span>
          </h5>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
          >
            <i className="bx bx-x" />
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
                <i className="bx bx-check" />
              </div>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                تم إرسال بلاغك بنجاح!
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                  lineHeight: "1.6",
                }}
              >
                شكراً جزيلاً لمساعدتك في تدقيق وتطوير شبكة المونوريل. سيقوم فريقنا
                بمراجعة ملاحظاتك في أقرب وقت.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Auth Warning */}
              {!user && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i
                    className="bx bx-error-circle"
                    style={{ fontSize: "1.1rem" }}
                  />
                  <span>يرجى تسجيل الدخول بحسابك أولاً لتتمكن من إرسال البلاغ.</span>
                </div>
              )}

              {/* Limit Warning */}
              {limitReached && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    color: "var(--colorWarning, #f59e0b)",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i
                    className="bx bx-error-circle"
                    style={{ fontSize: "1.1rem" }}
                  />
                  <span>
                    لقد بلغت الحد الأقصى للبلاغات اليومية (3 بلاغات). يرجى المحاولة
                    غداً.
                  </span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Scope Selector */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  نطاق المشكلة:
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("general");
                      setSelectedStation("");
                    }}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background:
                        targetScope === "general"
                          ? "var(--color-secondary)"
                          : "var(--bg-secondary)",
                      color:
                        targetScope === "general"
                          ? "#ffffff"
                          : "var(--text-secondary)",
                      border:
                        targetScope === "general"
                          ? "1px solid var(--color-secondary)"
                          : "1px solid var(--border-glass)",
                    }}
                  >
                    مشكلة عامة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("station");
                    }}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background:
                        targetScope === "station"
                          ? "var(--color-secondary)"
                          : "var(--bg-secondary)",
                      color:
                        targetScope === "station"
                          ? "#ffffff"
                          : "var(--text-secondary)",
                      border:
                        targetScope === "station"
                          ? "1px solid var(--color-secondary)"
                          : "1px solid var(--border-glass)",
                    }}
                  >
                    محطة معينة
                  </button>
                  <button
                    type="button"
                    disabled={!hasRouteResult}
                    onClick={() => {
                      setTargetScope("route");
                    }}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: !hasRouteResult ? "not-allowed" : "pointer",
                      opacity: !hasRouteResult ? 0.5 : 1,
                      background:
                        targetScope === "route"
                          ? "var(--color-secondary)"
                          : "var(--bg-secondary)",
                      color:
                        targetScope === "route"
                          ? "#ffffff"
                          : "var(--text-secondary)",
                      border:
                        targetScope === "route"
                          ? "1px solid var(--color-secondary)"
                          : "1px solid var(--border-glass)",
                    }}
                  >
                    المسار الحالي
                  </button>
                </div>
              </div>

              {/* Station Picker if Scope is Station */}
              {targetScope === "station" && (
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    اختر المحطة المعنية:
                  </label>
                  <input
                    className="input-fields"
                    placeholder="ابحث باسم المحطة..."
                    value={stationQuery}
                    onChange={(e) => {
                      setStationQuery(e.target.value);
                      setSelectedStation("");
                      setShowStationList(true);
                    }}
                    onFocus={() => setShowStationList(true)}
                    style={{
                      width: "100%",
                      direction: "rtl",
                      fontSize: "0.85rem",
                    }}
                  />
                  {selectedStation && (
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "34px",
                        fontSize: "0.72rem",
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "var(--color-secondary)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: "600",
                      }}
                    >
                      تم التحديد ✔
                    </span>
                  )}
                  {showStationList && filteredStations.length > 0 && (
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
                        maxHeight: "160px",
                        overflowY: "auto",
                        marginTop: "4px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      }}
                    >
                      {filteredStations.map((s) => (
                        <div
                          key={s.name}
                          onMouseDown={() => {
                            setSelectedStation(s.name);
                            setStationQuery(s.name);
                            setShowStationList(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            color: "var(--text-primary)",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--hoverBtn)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Problem Type Select */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  نوع المشكلة:
                </label>
                <select
                  className="input-fields"
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontSize: "0.85rem",
                  }}
                >
                  {PROBLEM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details Textarea */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  تفاصيل البلاغ:
                </label>
                <textarea
                  className="input-fields"
                  rows={3}
                  placeholder="اشرح المشكلة بالتفصيل لمساعدتنا في إصلاحها..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontSize: "0.85rem",
                    resize: "vertical",
                  }}
                  required
                />
              </div>

              {/* Image Attachment Dropzone */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  إرفاق صورة توضيحية (اختياري):
                </label>
                {imagePreview ? (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "140px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onImageSelect(null)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background: "rgba(239, 68, 68, 0.8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        color: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      if (e.dataTransfer.files?.[0]) {
                        onImageSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: isDraggingImage
                        ? "2px dashed var(--color-secondary)"
                        : "2px dashed var(--border-glass)",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: isDraggingImage
                        ? "rgba(59, 130, 246, 0.05)"
                        : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => {
                      const input = document.getElementById(
                        "monorail-report-img-input"
                      );
                      if (input) input.click();
                    }}
                  >
                    <i
                      className="fa-solid fa-cloud-arrow-up"
                      style={{
                        fontSize: "1.4rem",
                        color: "var(--text-muted)",
                        marginBottom: "4px",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      اسحب الصورة هنا أو اضغط للاختيار من جهازك
                    </div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      PNG, JPG, WEBP بحد أقصى 5 ميجابايت
                    </div>
                    <input
                      id="monorail-report-img-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onImageSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn"
                  style={{
                    flex: 1,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !user || limitReached}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor:
                      loading || !user || limitReached
                        ? "not-allowed"
                        : "pointer",
                    opacity: loading || !user || limitReached ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <span>
                      <i
                        className="fa-solid fa-spinner fa-spin"
                        style={{ marginLeft: "6px" }}
                      />
                      {uploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}
                    </span>
                  ) : (
                    <span>
                      <i
                        className="fa-solid fa-paper-plane"
                        style={{ marginLeft: "6px" }}
                      />
                      إرسال البلاغ
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
