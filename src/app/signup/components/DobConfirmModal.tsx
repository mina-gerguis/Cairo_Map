import React from "react";
import { calculateAge } from "../utils";
import styles from "../signup.module.css";

interface DobConfirmModalProps {
  dob: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DobConfirmModal: React.FC<DobConfirmModalProps> = ({
  dob,
  onClose,
  onConfirm,
}) => {
  const age = calculateAge(dob);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 16px" }}>
          ⚠️
        </div>

        <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px", fontFamily: "var(--font-heading)" }}>
          تأكيد تاريخ الميلاد
        </h3>

        <p style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.6, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
          تاريخ الميلاد المدخل هو: <strong style={{ color: "#0f172a", direction: "ltr", display: "inline-block" }}>{dob}</strong>
          <br />
          <span style={{ fontSize: "0.85rem", color: "#6c63ff", fontWeight: "700", marginTop: "4px", display: "block" }}>
            (العمر: {age} سنة)
          </span>
        </p>

        <div className={styles.modalWarningAlert}>
          🛑 <strong>تنبيه هام:</strong> لن تتمكن من تغيير تاريخ الميلاد لاحقاً بعد إتمام التسجيل.
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "50px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#334155",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
            }}
          >
            تعديل التاريخ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "50px",
              border: "none",
              background: "#000000",
              color: "#ffffff",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
            }}
          >
            عمري {age} عام
          </button>
        </div>
      </div>
    </div>
  );
};
