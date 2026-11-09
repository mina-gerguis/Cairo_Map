"use client";

import React from "react";
import styles from "../parking.module.css";

interface ParkingBottomBannerProps {
  onOpenSuggestModal: () => void;
  onOpenReportModal: () => void;
}

export function ParkingBottomBanner({
  onOpenSuggestModal,
  onOpenReportModal,
}: ParkingBottomBannerProps) {
  return (
    <div
      className={styles.calloutBanner}
      role="button"
      tabIndex={0}
      onClick={onOpenSuggestModal}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenSuggestModal();
        }
      }}
      aria-label="اقتراح جراج جديد أو الإبلاغ عن مشكلة"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "620px" }}>
        <div>
          <h3
            style={{
              margin: "0 0 4px",
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--color-fg)",
              fontFamily: "var(--font-sub, inherit)",
            }}
          >
            تعرف جراج مش موجود في الدليل أو لاحظت معلومة غير دقيقة؟
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            تقدر تشاركنا تفاصيل الجراج، الأسعار، أو المواعيد علشان نضيفه ونساعد آلاف السائقين يومياً.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSuggestModal();
          }}
        >
          <i className="bx bx-plus-circle" style={{ fontSize: "1.1rem" }} />
          <span>اقترح جراج جديد</span>
          <i className="bx bx-chevron-left" style={{ fontSize: "1.1rem" }} />
        </button>

        <button
          type="button"
          className={styles.calloutBtn}
          onClick={(e) => {
            e.stopPropagation();
            onOpenReportModal();
          }}
        >
          <i className="bx bx-error" style={{ fontSize: "1.1rem" }} />
          <span>إبلاغ عن خطأ</span>
        </button>
      </div>
    </div>
  );
}

export default ParkingBottomBanner;
