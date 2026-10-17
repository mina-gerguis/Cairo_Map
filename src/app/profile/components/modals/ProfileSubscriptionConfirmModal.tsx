"use client";

import React from "react";
import { SubscriptionPeriod } from "../../types";
import styles from "../../page.module.css";

interface ProfileSubscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmData: {
    planId: string;
    period: SubscriptionPeriod | null;
    message: string;
  } | null;
  onConfirm: (planId: string, period: SubscriptionPeriod | null) => void;
}

export const ProfileSubscriptionConfirmModal: React.FC<ProfileSubscriptionConfirmModalProps> = ({
  isOpen,
  onClose,
  confirmData,
  onConfirm,
}) => {
  if (!isOpen || !confirmData) return null;

  return (
    <div
      className={`modal-backdrop ${styles.modalBackdropSlow}`}
      onClick={onClose}
      style={{ zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "420px",
          width: "90%",
          padding: "28px 24px",
          borderRadius: "20px",
          background: "var(--bgPrimary)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          border: "1px solid var(--border-glass)",
          animation: "slide-up 0.25s ease",
          direction: "rtl",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Confirmation Icon */}
        <div
          style={{
            fontSize: "3.2rem",
            marginBottom: "16px",
            color: "var(--accent-gold, #eab308)",
            background: "rgba(234, 179, 8, 0.1)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="bx bx-help-circle"></i>
        </div>

        {/* Title */}
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            fontFamily: "var(--font-cairo)",
          }}
        >
          تأكيد عملية الاشتراك
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            margin: "0 0 28px",
            fontFamily: "var(--font-cairo)",
          }}
        >
          {confirmData.message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <button
            type="button"
            onClick={() => onConfirm(confirmData.planId, confirmData.period)}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              justifyContent: "center",
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-cairo)",
            }}
          >
            تأكيد ومتابعة
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-glass)",
              cursor: "pointer",
              fontFamily: "var(--font-cairo)",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
