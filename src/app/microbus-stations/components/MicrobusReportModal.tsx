import React, { RefObject } from "react";
import styles from "../microbus.module.css";

interface MicrobusReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef: RefObject<HTMLDivElement | null>;
  reportingStationName: string;
  reportingRouteDestination: string;
  reportReason: "fare" | "via" | "location" | "other";
  setReportReason: (reason: "fare" | "via" | "location" | "other") => void;
  reportComment: string;
  setReportComment: (comment: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  limitReached: boolean;
  limitChecking: boolean;
}

export default function MicrobusReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  reportingStationName,
  reportingRouteDestination,
  reportReason,
  setReportReason,
  reportComment,
  setReportComment,
  onSubmit,
  submitting,
  limitReached,
  limitChecking,
}: MicrobusReportModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
      direction: "rtl"
    }}>
      <div
        ref={modalBoxRef}
        className={styles.stationCard}
        style={{
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6)",
          padding: "22px"
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "14px"
        }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sub)" }}>
            إبلاغ عن خطأ في خط {reportingRouteDestination}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
          <div style={{
            fontSize: "0.84rem",
            color: "var(--text-secondary)",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)"
          }}>
            <div><strong>الموقف:</strong> {reportingStationName}</div>
            <div style={{ marginTop: "3px" }}><strong>الوجهة:</strong> {reportingRouteDestination}</div>
          </div>

          <div>
            <label className={styles.fieldLabel}>نوع المشكلة الملاحظة:</label>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value as any)}
              className={styles.modernSelect}
              style={{ height: "42px" }}
            >
              <option value="fare">💰 التعرفة / الأجرة غير صحيحة</option>
              <option value="via">🛣️ خط السير / المناطق غير دقيقة</option>
              <option value="location">📍 مكان الموقف أو نقطة التحميل غير صحيحة</option>
              <option value="other">📝 ملاحظة أخرى</option>
            </select>
          </div>

          <div>
            <label className={styles.fieldLabel}>تفاصيل المشكلة (اختياري):</label>
            <textarea
              placeholder="يرجى كتابة التفاصيل هنا لمساعدتنا في تدقيق البيانات (مثال: الأجرة الحقيقية هي 12 ج.م)..."
              value={reportComment}
              onChange={e => setReportComment(e.target.value)}
              className={styles.modernInput}
              style={{ height: "85px", padding: "10px 14px", resize: "none" }}
            />
          </div>

          {limitReached && (
            <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", color: "#ef4444", fontSize: "0.82rem" }}>
              <i className="bx bx-error-circle" style={{ marginLeft: "4px" }} />
              لقد وصلت للحد الأقصى للبلاغات المعلقة قيد المراجعة.
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel"
              style={{ padding: "8px 16px" }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || limitReached || limitChecking}
              className={styles.spotlightBtn}
              style={{ padding: "8px 20px" }}
            >
              {submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
