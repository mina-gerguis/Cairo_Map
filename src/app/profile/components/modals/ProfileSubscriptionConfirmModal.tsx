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
    promoUsed?: number;
    mainUsed?: number;
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
          borderRadius: "var(--radius-card)",
          background: "var(--color-bg)",
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

        {/* Title */}
        <h3
          className="font-sub fs-xl fw-900 mb-2 "
        >
          تأكيد عملية الاشتراك
        </h3>

        {/* Message */}
        <p
          className="text-muted leading-6 mb-4"
        >
          {confirmData.message}
        </p>

        {/* Payment Breakdown (Promo + Main Balance) */}
        {confirmData.planId !== "free" && ((confirmData.promoUsed ?? 0) > 0 || (confirmData.mainUsed ?? 0) > 0) && (
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid var(--border-glass)",
              background: "var(--bg-secondary)",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "0.82rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {(confirmData.promoUsed ?? 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#818cf8", fontWeight: 700 }}>من الرصيد الترويجي:</span>
                <strong style={{ color: "#818cf8" }}>{(confirmData.promoUsed ?? 0).toFixed(2)} ج.م</strong>
              </div>
            )}
            {(confirmData.mainUsed ?? 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>من الرصيد الأساسي:</span>
                <strong style={{ color: "#10b981" }}>{(confirmData.mainUsed ?? 0).toFixed(2)} ج.م</strong>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <button
            type="button"
            onClick={() => onConfirm(confirmData.planId, confirmData.period)}
            className="btn btn-primary flex-1"
          >
            تأكيد
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-cancel flex-1"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
