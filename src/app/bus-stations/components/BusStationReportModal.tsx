import React from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { BusStation, ReportProblemType } from "../types";
import { REPORT_PROBLEM_OPTIONS } from "../constants";
import styles from "../bus-stations.module.css";

interface BusStationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  stations: BusStation[];
  selectedStation: BusStation | null;
  onSelectStation: (station: BusStation | null) => void;
  customStationName: string;
  onCustomStationNameChange: (val: string) => void;
  problemType: ReportProblemType;
  onProblemTypeChange: (type: ReportProblemType) => void;
  details: string;
  onDetailsChange: (val: string) => void;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  loading: boolean;
  uploading: boolean;
  error: string;
  success: boolean;
  limitReached: boolean;
  limitChecking: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BusStationReportModal({
  isOpen,
  onClose,
  user,
  stations,
  selectedStation,
  onSelectStation,
  customStationName,
  onCustomStationNameChange,
  problemType,
  onProblemTypeChange,
  details,
  onDetailsChange,
  imageFile,
  onImageFileChange,
  loading,
  uploading,
  error,
  success,
  limitReached,
  limitChecking,
  onSubmit
}: BusStationReportModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h3 id="report-modal-title" className={styles.modalTitle}>
            <i className="bx bx-error-circle" style={{ color: "#ef4444", fontSize: "1.3rem" }} />
            <span>الإبلاغ عن خطأ في بيانات المواقف</span>
          </h3>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            className={styles.modalCloseBtn}
            aria-label="إغلاق النافذة"
            disabled={loading}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.modalBody}>
          {success ? (
            <div className={styles.stateBox}>
              <div className={styles.stateIconSuccess}>
                <i className="bx bx-check" />
              </div>
              <h4 className={styles.stateTitle}>تم استلام بلاغك بنجاح!</h4>
              <p className={styles.stateDesc}>
                شكراً لمساهمتك القيمة في تحسين وتدقيق بيانات مواقف الأتوبيسات. سيتم مراجعة التقرير وتحديث البيانات في أقرب وقت.
              </p>
            </div>
          ) : limitChecking ? (
            <div className={styles.stateBox}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "var(--color-secondary, #3b82f6)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px"
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                جاري التحقق من سجل البلاغات...
              </span>
            </div>
          ) : limitReached ? (
            <div className={styles.stateBox}>
              <div className={styles.stateIconWarning}>
                <i className="bx bx-time-five" />
              </div>
              <h4 className={styles.stateTitle}>تم الوصول للحد الأقصى من البلاغات المعلقة</h4>
              <p className={styles.stateDesc} style={{ marginBottom: "16px" }}>
                لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={styles.modalSubmitBtn}
                style={{ margin: "0 auto" }}
              >
                حسناً، فهمت
              </button>
            </div>
          ) : !user ? (
            <div className={styles.stateBox}>
              <div className={styles.stateIconUser}>
                <i className="bx bx-user" />
              </div>
              <h4 className={styles.stateTitle}>تسجيل الدخول مطلوب</h4>
              <p className={styles.stateDesc} style={{ marginBottom: "20px" }}>
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن خطأ في البيانات وكسب نقاط المساهمة.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link
                  href="/login"
                  className={styles.modalSubmitBtn}
                  style={{ textDecoration: "none" }}
                >
                  تسجيل الدخول
                </Link>
                <button type="button" onClick={onClose} className={styles.modalCancelBtn}>
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              {/* Station selector */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الموقف المعني بالبلاغ:</label>
                <select
                  value={
                    selectedStation
                      ? selectedStation.name
                      : customStationName
                      ? "other_custom"
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "other_custom") {
                      onSelectStation(null);
                      onCustomStationNameChange("موقف آخر / غير مسجل");
                    } else {
                      const found = stations.find((s) => s.name === val) || null;
                      onSelectStation(found);
                      onCustomStationNameChange("");
                    }
                  }}
                  className={styles.formSelect}
                >
                  {stations.map((s, idx) => (
                    <option key={s.id || idx} value={s.name}>
                      {s.name} ({s.governorate})
                    </option>
                  ))}
                  <option value="other_custom">➕ موقف آخر / غير مسجل بالدليل</option>
                </select>
              </div>

              {/* Custom station name if selected other */}
              {(!selectedStation || customStationName) && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    اسم الموقف أو المحطة: <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: موقف السلام، موقف المرج، موقف بنها..."
                    value={customStationName}
                    onChange={(e) => onCustomStationNameChange(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              )}

              {/* Problem Type */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>نوع الخطأ أو المشكلة:</label>
                <select
                  value={problemType}
                  onChange={(e) => onProblemTypeChange(e.target.value as ReportProblemType)}
                  className={styles.formSelect}
                >
                  {REPORT_PROBLEM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details textarea */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  تفاصيل التصحيح / الخطأ: <span className={styles.requiredStar}>*</span>
                </label>
                <textarea
                  placeholder="يرجى كتابة التصحيح أو البيانات الدقيقة هنا (مثال: تم تغيير رقم هاتف جو باص إلى... أو تم إضافة خط جديد متوجه إلى الإسماعيلية)..."
                  value={details}
                  onChange={(e) => onDetailsChange(e.target.value)}
                  className={styles.formTextarea}
                  required
                />
              </div>

              {/* Optional Image Upload */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ color: "var(--text-secondary)" }}>
                  صورة توضيحية (اختياري - جدول مواعيد، لافتة، إلخ):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onImageFileChange(file);
                  }}
                  className={styles.fileInput}
                />
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className={styles.modalCancelBtn}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={loading || uploading || !details.trim()}
                  className={styles.modalSubmitBtn}
                >
                  {loading || uploading ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }}
                      />
                      <span>{uploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send" style={{ fontSize: "1rem" }} />
                      <span>إرسال البلاغ</span>
                    </>
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
