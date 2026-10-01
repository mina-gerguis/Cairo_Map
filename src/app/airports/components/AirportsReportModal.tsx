import React, { useState, useMemo } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Airport, AirportReportOption, AirportReportProblemType, AirportReportScope } from "../types";
import { AIRPORT_REPORT_PROBLEM_OPTIONS } from "../constants";
import { normalizeArabic } from "../utils";
import styles from "../airports.module.css";

interface AirportsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  airports: Airport[];
  targetScope: AirportReportScope;
  setTargetScope: (scope: AirportReportScope) => void;
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  customAirportName: string;
  setCustomAirportName: (name: string) => void;
  airportQuery: string;
  setAirportQuery: (q: string) => void;
  problemType: AirportReportProblemType;
  setProblemType: (type: AirportReportProblemType) => void;
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

export default function AirportsReportModal({
  isOpen,
  onClose,
  user,
  airports,
  targetScope,
  setTargetScope,
  selectedAirport,
  setSelectedAirport,
  customAirportName,
  setCustomAirportName,
  airportQuery,
  setAirportQuery,
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
  onSubmit
}: AirportsReportModalProps) {
  const [showAirportList, setShowAirportList] = useState(false);
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const filteredAirports = useMemo(() => {
    const q = normalizeArabic(airportQuery.trim());
    if (!q) return airports;
    return airports.filter(
      a =>
        normalizeArabic(a.name_ar).includes(q) ||
        normalizeArabic(a.city_ar).includes(q) ||
        (a.iata_code && a.iata_code.toLowerCase().includes(q.toLowerCase())) ||
        (a.name_en && a.name_en.toLowerCase().includes(q.toLowerCase()))
    );
  }, [airportQuery, airports]);

  if (!isOpen) return null;

  const currentProblemOption =
    AIRPORT_REPORT_PROBLEM_OPTIONS.find(o => o.id === problemType) ||
    AIRPORT_REPORT_PROBLEM_OPTIONS[0];

  return (
    <div
      className={styles.modalOverlay}
      onClick={e => {
        if (e.target === e.currentTarget && !loading && !uploading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalBox}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={styles.modalHeaderIcon}>
              <i className="bx bx-error-circle" />
            </div>
            <h3 className={styles.modalTitle}>الإبلاغ عن خطأ في دليل المطارات</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.modalCloseBtn}
            disabled={loading || uploading}
            aria-label="إغلاق النافذة"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {success ? (
            <div className={styles.stateCenter}>
              <div className={styles.stateSuccessCircle}>
                <i className="bx bx-check" />
              </div>
              <h4 className={styles.stateTitleText}>تم استلام بلاغك بنجاح!</h4>
              <p className={styles.stateDescText}>
                شكراً لمساهمتك القيمة في تحسين وتدقيق بيانات المطارات المصرية. سيتم مراجعة تقريرك وتحديث البيانات فور التحقق.
              </p>
            </div>
          ) : limitChecking ? (
            <div className={styles.stateCenter}>
              <div className={styles.spinner} />
              <span className={styles.stateDescText}>جاري التحقق من سجل البلاغات...</span>
            </div>
          ) : limitReached ? (
            <div className={styles.stateCenter}>
              <div className={styles.stateIconWarningWrap}>
                <i className="bx bx-time-five" />
              </div>
              <h4 className={styles.stateTitleText}>
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h4>
              <p className={styles.stateDescText}>
                لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قِبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={styles.btnPrimaryFull}
              >
                حسناً، فهمت
              </button>
            </div>
          ) : !user ? (
            <div className={styles.stateCenter}>
              <div className={styles.stateIconUserWrap}>
                <i className="bx bx-user" />
              </div>
              <h4 className={styles.stateTitleText}>تسجيل الدخول مطلوب</h4>
              <p className={styles.stateDescText}>
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي خطأ ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <div className={styles.modalActionsRow}>
                <Link
                  href="/login"
                  className={styles.btnPrimaryFull}
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  تسجيل الدخول
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.btnCancelModal}
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className={styles.modalForm}>
              {/* Target Scope Tabs */}
              <div>
                <label className={styles.modalFieldLabel}>نطاق البلاغ:</label>
                <div className={styles.scopeTabsGrid}>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("general");
                      setSelectedAirport(null);
                      setAirportQuery("");
                      setShowAirportList(false);
                    }}
                    className={`${styles.scopeTabBtn} ${
                      targetScope === "general" ? styles.scopeTabBtnActive : ""
                    }`}
                  >
                    <i className="bx bx-globe" />
                    <span>مشكلة عامة بالدليل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("airport");
                      setShowAirportList(true);
                    }}
                    className={`${styles.scopeTabBtn} ${
                      targetScope === "airport" ? styles.scopeTabBtnActive : ""
                    }`}
                  >
                    <i className="bx bx-buildings" />
                    <span>مطار محدد</span>
                  </button>
                </div>
              </div>

              {/* Airport Autocomplete Selector */}
              {targetScope === "airport" && (
                <div style={{ position: "relative" }}>
                  <label
                    className={styles.modalFieldLabel}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>المطار المعني: <span style={{ color: "#ef4444" }}>*</span></span>
                    {selectedAirport && (
                      <span className={styles.selectedConfirmedBadge}>
                        ✔ تم اختيار: {selectedAirport.name_ar}
                      </span>
                    )}
                  </label>

                  <div className={styles.modalInputWrapper}>
                    <input
                      type="text"
                      className={styles.modalInputField}
                      placeholder="ابحث باسم المطار، المدينة، أو الكود..."
                      value={airportQuery}
                      onChange={e => {
                        const val = e.target.value;
                        setAirportQuery(val);
                        setShowAirportList(true);
                        if (selectedAirport && val !== selectedAirport.name_ar) {
                          setSelectedAirport(null);
                        }
                      }}
                      onFocus={() => setShowAirportList(true)}
                      onBlur={() => setTimeout(() => setShowAirportList(false), 250)}
                    />
                    <div className={styles.modalInputIconRight}>
                      <i className="bx bx-search" />
                    </div>

                    {airportQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAirport(null);
                          setAirportQuery("");
                          setCustomAirportName("");
                          setShowAirportList(true);
                        }}
                        className={styles.modalInputClearBtn}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showAirportList && (
                    <div className={styles.modalPopupList}>
                      {filteredAirports.length === 0 ? (
                        <div
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)"
                          }}
                        >
                          <div>لم يتم العثور على مطار مطابق لـ "{airportQuery}"</div>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setSelectedAirport(null);
                              setCustomAirportName(airportQuery);
                              setShowAirportList(false);
                            }}
                            className={styles.addCustomAirportBtn}
                          >
                            ➕ تحديد "{airportQuery}" كمطار جديد غير مسجل
                          </button>
                        </div>
                      ) : (
                        <>
                          {filteredAirports.map(airport => {
                            const isSelected = selectedAirport?.id === airport.id;
                            return (
                              <div
                                key={airport.id}
                                onMouseDown={() => {
                                  setSelectedAirport(airport);
                                  setAirportQuery(airport.name_ar);
                                  setCustomAirportName("");
                                  setShowAirportList(false);
                                }}
                                className={`${styles.modalPopupItem} ${
                                  isSelected ? styles.modalPopupItemSelected : ""
                                }`}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <i
                                    className="bx bx-map-pin"
                                    style={{
                                      color: isSelected
                                        ? "var(--color-secondary)"
                                        : "var(--text-muted)"
                                    }}
                                  />
                                  <div>
                                    <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                                      {airport.name_ar}
                                    </span>
                                    {airport.iata_code && (
                                      <span className={styles.popupCodeBadge}>
                                        {airport.iata_code}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                                  {airport.city_ar}، {airport.governorate_ar}
                                </span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Problem Type Selector */}
              <div style={{ position: "relative" }}>
                <label className={styles.modalFieldLabel}>نوع المشكلة أو الخطأ:</label>

                <button
                  type="button"
                  onClick={() => setShowProblemDropdown(p => !p)}
                  className={styles.modalDropdownTrigger}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i
                      className={`${currentProblemOption.icon || "bx bx-detail"} ${styles.problemIconAccent}`}
                    />
                    <div style={{ textAlign: "right" }}>
                      <div className={styles.dropdownOptionTitle}>
                        {currentProblemOption.title}
                      </div>
                      <div className={styles.dropdownOptionDesc}>
                        {currentProblemOption.desc}
                      </div>
                    </div>
                  </div>
                  <i
                    className={`bx ${
                      showProblemDropdown ? "bx-chevron-up" : "bx-chevron-down"
                    }`}
                    style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}
                  />
                </button>

                {showProblemDropdown && (
                  <div className={styles.modalPopupList}>
                    {AIRPORT_REPORT_PROBLEM_OPTIONS.map(opt => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setProblemType(opt.id);
                          setShowProblemDropdown(false);
                        }}
                        className={`${styles.modalPopupItem} ${
                          opt.id === problemType ? styles.modalPopupItemSelected : ""
                        }`}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <i
                            className={`${opt.icon || "bx bx-detail"} ${styles.problemIconAccent}`}
                          />
                          <div>
                            <div className={styles.dropdownOptionTitle}>{opt.title}</div>
                            <div className={styles.dropdownOptionDesc}>{opt.desc}</div>
                          </div>
                        </div>
                        {opt.badge && (
                          <span className={styles.problemOptionBadge}>{opt.badge}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Textarea */}
              <div>
                <label className={styles.modalFieldLabel}>
                  تفاصيل المشكلة / التصحيح المقترح: <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  placeholder="اكتب تفاصيل الملاحظة أو الخطأ والبيانات الصحيحة (مثال: رقم هاتف الاستعلامات الصحيح هو... أو تم افتتاح صالة جديدة للمغادرة)..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className={styles.modalTextarea}
                  required
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label
                  className={styles.modalFieldLabel}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>صورة توضيحية (اختياري):</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                    JPG, PNG, WEBP (حتى 5MB)
                  </span>
                </label>

                {!imagePreview ? (
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) onImageSelect(dropped);
                    }}
                    className={`${styles.modalDropzone} ${
                      isDragging ? styles.modalDropzoneActive : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) onImageSelect(f);
                      }}
                      className={styles.modalHiddenFileInput}
                    />
                    <div className={styles.modalUploadIconBox}>
                      <i className="bx bx-cloud-upload" />
                    </div>
                    <div>
                      <div className={styles.modalUploadPromptTitle}>
                        اضغط لاختيار صورة أو اسحبها هنا
                      </div>
                      <div className={styles.modalUploadPromptDesc}>
                        أرفق صورة لافتة، تذكرة، أو مستند لتسهيل الفحص
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.modalPreviewBox}>
                    <div className={styles.modalThumbnail}>
                      <img src={imagePreview} alt="معاينة المرفق" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.modalFileName}>
                        {imageFile?.name || "صورة مرفقة"}
                      </div>
                      <div className={styles.modalFileSize}>
                        {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onImageSelect(null)}
                      className={styles.modalRemoveImgBtn}
                    >
                      <i className="bx bx-trash" />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && <div className={styles.modalErrorAlert}>{error}</div>}

              {/* Actions Row */}
              <div className={styles.modalActionsRow}>
                <button
                  type="submit"
                  disabled={loading || uploading || !details.trim()}
                  className={styles.btnSubmitReport}
                >
                  {loading || uploading ? (
                    <>
                      <div className={styles.btnSpinner} />
                      <span>{uploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}</span>
                    </>
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
                  className={styles.btnCancelModal}
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
