import React, { useState, useMemo } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Port, PortReportOption, PortReportProblemType, PortReportScope } from "../types";
import { PORT_REPORT_PROBLEM_OPTIONS } from "../constants";
import { normalizeArabic } from "../utils";
import styles from "../ports.module.css";

interface PortsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  ports: Port[];
  targetScope: PortReportScope;
  setTargetScope: (scope: PortReportScope) => void;
  selectedPort: Port | null;
  setSelectedPort: (port: Port | null) => void;
  customPortName: string;
  setCustomPortName: (name: string) => void;
  portQuery: string;
  setPortQuery: (q: string) => void;
  problemType: PortReportProblemType;
  setProblemType: (type: PortReportProblemType) => void;
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

export default function PortsReportModal({
  isOpen,
  onClose,
  user,
  ports,
  targetScope,
  setTargetScope,
  selectedPort,
  setSelectedPort,
  customPortName,
  setCustomPortName,
  portQuery,
  setPortQuery,
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
}: PortsReportModalProps) {
  const [showPortList, setShowPortList] = useState(false);
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const filteredPorts = useMemo(() => {
    const q = normalizeArabic(portQuery.trim());
    if (!q) return ports;
    return ports.filter(
      p =>
        normalizeArabic(p.name).includes(q) ||
        normalizeArabic(p.governorate).includes(q) ||
        normalizeArabic(p.sea).includes(q)
    );
  }, [portQuery, ports]);

  if (!isOpen) return null;

  const currentProblemOption =
    PORT_REPORT_PROBLEM_OPTIONS.find(o => o.id === problemType) ||
    PORT_REPORT_PROBLEM_OPTIONS[0];

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
            <h3 className={styles.modalTitle}>الإبلاغ عن خطأ في دليل الموانئ البحرية</h3>
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
                شكراً لمساهمتك القيمة في تحسين وتدقيق بيانات الموانئ البحرية. سيتم مراجعة تقريرك وتحديث البيانات فور التحقق.
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
                      setSelectedPort(null);
                      setPortQuery("");
                      setShowPortList(false);
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
                      setTargetScope("port");
                      setShowPortList(true);
                    }}
                    className={`${styles.scopeTabBtn} ${
                      targetScope === "port" ? styles.scopeTabBtnActive : ""
                    }`}
                  >
                    <i className="bx bx-anchor" />
                    <span>ميناء محدد</span>
                  </button>
                </div>
              </div>

              {/* Port Autocomplete Selector */}
              {targetScope === "port" && (
                <div style={{ position: "relative" }}>
                  <label
                    className={styles.modalFieldLabel}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>الميناء المعني: <span style={{ color: "#ef4444" }}>*</span></span>
                    {selectedPort && (
                      <span className={styles.selectedConfirmedBadge}>
                        ✔ تم اختيار: {selectedPort.name}
                      </span>
                    )}
                  </label>

                  <div className={styles.modalInputWrapper}>
                    <input
                      type="text"
                      className={styles.modalInputField}
                      placeholder="ابحث باسم الميناء، المحافظة، أو البحر..."
                      value={portQuery}
                      onChange={e => {
                        const val = e.target.value;
                        setPortQuery(val);
                        setShowPortList(true);
                        if (selectedPort && val !== selectedPort.name) {
                          setSelectedPort(null);
                        }
                      }}
                      onFocus={() => setShowPortList(true)}
                      onBlur={() => setTimeout(() => setShowPortList(false), 250)}
                    />
                    <div className={styles.modalInputIconRight}>
                      <i className="bx bx-search" />
                    </div>

                    {portQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPort(null);
                          setPortQuery("");
                          setCustomPortName("");
                          setShowPortList(true);
                        }}
                        className={styles.modalInputClearBtn}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showPortList && (
                    <div className={styles.modalPopupList}>
                      {filteredPorts.length === 0 ? (
                        <div
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)"
                          }}
                        >
                          <div>لم يتم العثور على ميناء مطابق لـ "{portQuery}"</div>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setSelectedPort(null);
                              setCustomPortName(portQuery);
                              setShowPortList(false);
                            }}
                            className={styles.addCustomAirportBtn}
                          >
                            ➕ تحديد "{portQuery}" كميناء جديد غير مسجل
                          </button>
                        </div>
                      ) : (
                        <>
                          {filteredPorts.map((port, idx) => {
                            const isSelected = selectedPort?.name === port.name;
                            return (
                              <div
                                key={port.name || idx}
                                onMouseDown={() => {
                                  setSelectedPort(port);
                                  setPortQuery(port.name);
                                  setCustomPortName("");
                                  setShowPortList(false);
                                }}
                                className={`${styles.modalPopupItem} ${
                                  isSelected ? styles.modalPopupItemSelected : ""
                                }`}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <i
                                    className="bx bx-anchor"
                                    style={{
                                      color: isSelected
                                        ? "var(--color-secondary)"
                                        : "var(--text-muted)"
                                    }}
                                  />
                                  <div>
                                    <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                                      {port.name}
                                    </span>
                                  </div>
                                </div>
                                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                                  {port.governorate} • {port.sea}
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
                    {PORT_REPORT_PROBLEM_OPTIONS.map(opt => (
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
                  placeholder="اكتب تفاصيل الملاحظة أو الخطأ والبيانات الصحيحة (مثال: تم إضافة محطة حاويات جديدة أو تم افتتاح محور ربط مباشر)..."
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
                        أرفق صورة لافتة، خريطة، أو مستند لتسهيل الفحص
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
