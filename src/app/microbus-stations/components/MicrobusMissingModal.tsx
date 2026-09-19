import React, { RefObject } from "react";
import styles from "../microbus.module.css";

interface MicrobusMissingModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingModalBoxRef: RefObject<HTMLDivElement | null>;
  missingStationName: string;
  setMissingStationName: (val: string) => void;
  missingDestination: string;
  setMissingDestination: (val: string) => void;
  missingFare: string;
  setMissingFare: (val: string) => void;
  missingNotes: string;
  setMissingNotes: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export default function MicrobusMissingModal({
  isOpen,
  onClose,
  missingModalBoxRef,
  missingStationName,
  setMissingStationName,
  missingDestination,
  setMissingDestination,
  missingFare,
  setMissingFare,
  missingNotes,
  setMissingNotes,
  onSubmit,
  submitting,
}: MicrobusMissingModalProps) {
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
        ref={missingModalBoxRef}
        className={styles.stationCard}
        style={{
          width: "100%",
          maxWidth: "480px",
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
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-sub)" }}>
            <i className="bx bx-plus-circle" style={{ color: "#3b82f6" }} />
            إبلاغ الإدارة بخط سرفيس غير مدرج
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
          <div>
            <label className={styles.fieldLabel}>اسم الموقف: <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="text"
              placeholder="مثال: موقف رمسيس، موقف العاشر، موقف المنيب..."
              value={missingStationName}
              onChange={e => setMissingStationName(e.target.value)}
              className={styles.modernInput}
              required
              style={{ height: "42px" }}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>وجهة الخط (إلى فين؟): <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="text"
              placeholder="مثال: 6 أكتوبر، العاصمة الإدارية، التجمع الخامس..."
              value={missingDestination}
              onChange={e => setMissingDestination(e.target.value)}
              className={styles.modernInput}
              required
              style={{ height: "42px" }}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>الأجرة التقديرية (اختياري):</label>
            <input
              type="text"
              placeholder="مثال: 15 ج.م"
              value={missingFare}
              onChange={e => setMissingFare(e.target.value)}
              className={styles.modernInput}
              style={{ height: "42px" }}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>ملاحظات أو نقاط المرور (اختياري):</label>
            <textarea
              placeholder="أي تفاصيل أخرى مثل: بيمشي من المحور، أو ميني باص..."
              value={missingNotes}
              onChange={e => setMissingNotes(e.target.value)}
              className={styles.modernInput}
              style={{ height: "70px", padding: "10px 14px", resize: "none" }}
            />
          </div>

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
              disabled={submitting}
              className={styles.spotlightBtn}
              style={{ padding: "8px 20px" }}
            >
              {submitting ? "جاري الإرسال..." : "إرسال للإدارة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
