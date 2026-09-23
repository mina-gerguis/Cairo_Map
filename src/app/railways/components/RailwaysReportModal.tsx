import React, { useState, useMemo, RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { RailwayRoute, StationListItem, ReportScope } from "../types";
import { REPORT_PROBLEM_OPTIONS } from "../constants";
import { normalizeArabic } from "../utils";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import CancelButton from "@/components/ui/button/CancelButton";
import styles from "../railways.module.css";

interface RailwaysReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef: RefObject<HTMLDivElement | null>;
  user: User | null;
  currentRoute: RailwayRoute | null;
  allStationsList: StationListItem[];
  targetScope: ReportScope;
  setTargetScope: (scope: ReportScope) => void;
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  stationQuery: string;
  setStationQuery: (q: string) => void;
  problemType: string;
  setProblemType: (type: string) => void;
  details: string;
  setDetails: (text: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File | null) => void;
  error: string;
  loading: boolean;
  uploading: boolean;
  success: boolean;
  limitChecking: boolean;
  limitReached: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RailwaysReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  user,
  currentRoute,
  allStationsList,
  targetScope,
  setTargetScope,
  selectedStation,
  setSelectedStation,
  stationQuery,
  setStationQuery,
  problemType,
  setProblemType,
  details,
  setDetails,
  imageFile,
  imagePreview,
  onImageSelect,
  error,
  loading,
  uploading,
  success,
  limitChecking,
  limitReached,
  onSubmit,
}: RailwaysReportModalProps) {
  const [showStationList, setShowStationList] = useState(false);
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const filteredStations = useMemo(() => {
    const q = normalizeArabic(stationQuery.trim());
    if (!q) return allStationsList;
    return allStationsList.filter(
      (s) => normalizeArabic(s.name).includes(q) || normalizeArabic(s.routeName).includes(q)
    );
  }, [stationQuery, allStationsList]);

  if (!isOpen) return null;

  const currentProblemOption =
    REPORT_PROBLEM_OPTIONS.find((o) => o.id === problemType) || REPORT_PROBLEM_OPTIONS[0];

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalBoxRef} className={styles.modalBox}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444" }} />
            <span>الإبلاغ عن مشكلة في قطارات سكك حديد مصر</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
            disabled={loading}
          >
            <i className="bx bx-x" style={{ fontSize: "1.3rem" }} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {success ? (
            <div style={{ textAlign: "center", padding: "28px 10px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  margin: "0 auto 14px",
                }}
              >
                <i className="bx bx-check" />
              </div>
              <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تم استلام بلاغك بنجاح!
              </h5>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                شكراً لمساهمتك في تحسين وتدقيق مواعيد وبيانات قطارات سكك حديد مصر. سيتم مراجعة تقريرك وتحديث البيانات فور التحقق.
              </p>
            </div>
          ) : limitChecking ? (
            <div style={{ textAlign: "center", padding: "36px" }}>
              <div className={styles.spinner} style={{ width: "32px", height: "32px", margin: "0 auto 12px" }} />
              <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>جاري التحقق...</span>
            </div>
          ) : limitReached ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <img
                src="/images/icons3d/error.png"
                alt="error"
                style={{ width: "70px", height: "70px", objectFit: "contain", margin: "0 auto 12px" }}
              />
              <h5 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h5>
              <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                لديك 5 بلاغات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قِبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <PrimaryButton onClick={onClose} style={{ width: "100%" }}>
                حسناً، فهمت
              </PrimaryButton>
            </div>
          ) : !user ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  margin: "0 auto 12px",
                }}
              >
                <i className="bx bx-user" />
              </div>
              <h5 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تسجيل الدخول مطلوب
              </h5>
              <p style={{ margin: "0 0 18px", fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي خطأ ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: "100%", display: "block", textAlign: "center" }}>
                تسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Target Scope Selection */}
              <div>
                <label className={styles.fieldLabel}>نطاق المشكلة:</label>
                <div
                  className={styles.scopeTabs}
                  style={{
                    gridTemplateColumns: currentRoute ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("general");
                      setSelectedStation("");
                      setStationQuery("");
                      setShowStationList(false);
                    }}
                    className={`${styles.scopeBtn} ${targetScope === "general" ? styles.scopeBtnActive : ""}`}
                  >
                    مشكلة عامة
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("station");
                      setShowStationList(true);
                    }}
                    className={`${styles.scopeBtn} ${targetScope === "station" ? styles.scopeBtnActive : ""}`}
                  >
                    محطة معينة
                  </button>

                  {currentRoute && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetScope("route");
                        setSelectedStation("");
                        setStationQuery("");
                        setShowStationList(false);
                      }}
                      className={`${styles.scopeBtn} ${targetScope === "route" ? styles.scopeBtnActive : ""}`}
                    >
                      الخط الحالي
                    </button>
                  )}
                </div>
              </div>

              {/* Station Autocomplete Selector */}
              {targetScope === "station" && (
                <div style={{ position: "relative" }}>
                  <label className={styles.fieldLabel} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>المحطة المعنية:</span>
                    {selectedStation && (
                      <span style={{ fontSize: "0.74rem", color: "#10b981", fontWeight: "700" }}>
                        تم تحديد: {selectedStation} ✔
                      </span>
                    )}
                  </label>

                  <div className={styles.searchWrapper}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="ابحث باسم المحطة أو الخط..."
                      value={stationQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStationQuery(val);
                        setShowStationList(true);
                        if (selectedStation && val !== selectedStation) {
                          setSelectedStation("");
                        }
                      }}
                      onFocus={() => setShowStationList(true)}
                      onBlur={() => setTimeout(() => setShowStationList(false), 250)}
                    />
                    <div className={styles.searchIcon}>
                      <i className="bx bx-search" />
                    </div>

                    {stationQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStation("");
                          setStationQuery("");
                          setShowStationList(true);
                        }}
                        className={styles.clearBtn}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showStationList && (
                    <div className={styles.popupList}>
                      {filteredStations.length === 0 ? (
                        <div style={{ padding: "12px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          لا توجد محطة مطابقة لبحثك "{stationQuery}"
                        </div>
                      ) : (
                        filteredStations.map((st) => {
                          const isSelected = selectedStation === st.name;
                          return (
                            <div
                              key={`${st.routeId}-${st.name}`}
                              onMouseDown={() => {
                                setSelectedStation(st.name);
                                setStationQuery(st.name);
                                setShowStationList(false);
                              }}
                              className={styles.popupItem}
                              style={{
                                background: isSelected ? "rgba(59, 130, 246, 0.15)" : undefined,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="bx bx-map-pin" style={{ color: isSelected ? "#3b82f6" : "var(--text-secondary)" }} />
                                <span style={{ fontSize: "0.85rem", fontWeight: isSelected ? "700" : "600" }}>
                                  {st.name}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                {st.routeName}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Route Summary Card if Scope is Route */}
              {targetScope === "route" && currentRoute && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    fontSize: "0.82rem",
                    lineHeight: "1.6",
                  }}
                >
                  <div><strong>الخط المعني:</strong> {currentRoute.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.76rem" }}>
                    {currentRoute.from} ← {currentRoute.to} • المدة: {currentRoute.duration}
                  </div>
                </div>
              )}

              {/* Problem Type Dropdown Selector */}
              <div style={{ position: "relative" }}>
                <label className={styles.fieldLabel}>نوع المشكلة:</label>

                <button
                  type="button"
                  onClick={() => setShowProblemDropdown((p) => !p)}
                  className={styles.dropdownTrigger}
                >
                  <div>
                    <div style={{ fontSize: "0.86rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      {currentProblemOption.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      {currentProblemOption.desc}
                    </div>
                  </div>
                  <i className={showProblemDropdown ? "bx bx-chevron-up" : "bx bx-chevron-down"} style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }} />
                </button>

                {showProblemDropdown && (
                  <div className={styles.popupList} style={{ maxHeight: "300px" }}>
                    {REPORT_PROBLEM_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setProblemType(opt.id);
                          setShowProblemDropdown(false);
                        }}
                        className={styles.popupItem}
                        style={{
                          background: opt.id === problemType ? "rgba(255, 255, 255, 0.08)" : undefined,
                        }}
                      >
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.84rem", fontWeight: opt.id === problemType ? "800" : "600", color: "var(--text-primary)" }}>
                            {opt.title}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Textarea */}
              <div>
                <label className={styles.fieldLabel}>
                  تفاصيل المشكلة: <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  placeholder="يرجى كتابة تفاصيل المشكلة أو الخطأ بدقة والتصحيح المقترح إن وجد..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className={styles.inputField}
                  required
                  style={{ minHeight: "95px", resize: "vertical" }}
                />
              </div>

              {/* Image Upload Drag & Drop */}
              <div>
                <label className={styles.fieldLabel} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>صورة توضيحية (اختياري):</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>JPG, PNG, WEBP (حتى 5MB)</span>
                </label>

                {!imagePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) onImageSelect(dropped);
                    }}
                    className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onImageSelect(f);
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
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "rgba(59, 130, 246, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-secondary, #3b82f6)",
                        fontSize: "1.3rem",
                      }}
                    >
                      <i className="bx bx-cloud-upload" />
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      اضغط لاختيار صورة أو اسحبها هنا
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      أرسل صورة الخطأ إن وُجدت لتسهيل الفحص
                    </div>
                  </div>
                ) : (
                  <div className={styles.previewBox}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid var(--border-glass)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="معاينة"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {imageFile?.name || "صورة مرفقة"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onImageSelect(null)}
                      className="btn btn-cancel"
                      style={{ padding: "4px 10px", fontSize: "0.75rem", color: "#ef4444" }}
                    >
                      <i className="bx bx-trash" /> حذف
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit & Cancel Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <PrimaryButton
                  type="submit"
                  loading={loading || uploading}
                  loadingText={uploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}
                  style={{ flex: 1 }}
                >
                  <i className="bx bx-send" style={{ marginLeft: "6px" }} />
                  <span>إرسال البلاغ</span>
                </PrimaryButton>

                <CancelButton
                  onClick={onClose}
                  disabled={loading || uploading}
                  style={{ width: "35%" }}
                >
                  إلغاء
                </CancelButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
