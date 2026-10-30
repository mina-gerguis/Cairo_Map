import React from "react";
import { calculateAge } from "../utils";
import styles from "../signup.module.css";
import { MdError } from "react-icons/md";

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
        <h3 className="text-black font-sub mb-2">
          تأكيد تاريخ الميلاد
        </h3>

        <p style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.6, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
          تاريخ الميلاد المدخل هو: <strong style={{ color: "#0f172a", direction: "ltr", display: "inline-block" }}>{dob}</strong>
          <br />
          <span className="text-info fw-bold">
            (العمر: {age} سنة)
          </span>
        </p>

        <div className="error-alert mb-2">
          <MdError size={16} className="error-alert-icon" />
          <span className="error-alert-message"> <strong>تنبيه هام:</strong> لن تتمكن من تغيير تاريخ الميلاد لاحقاً بعد إتمام التسجيل.</span>
         
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
