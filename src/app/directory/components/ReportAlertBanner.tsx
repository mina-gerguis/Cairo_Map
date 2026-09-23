import React from "react";
import { ReportAlertBannerProps } from "../types";

export default function ReportAlertBanner({
  reportBannerRef,
  onOpenModal,
}: ReportAlertBannerProps) {
  return (
    <div
      ref={reportBannerRef}
      style={{
        background: "var(--bg-linear-alert)",
        border: "1px solid var(--border-secondary)",
        borderRadius: "var(--ra-8)",
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "14px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexDirection: "row-reverse",
            justifyContent: "flex-end",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "1rem",
              fontWeight: "800",
              gap: "8px",
            }}
          >
            الإبلاغ عن رقم خاطئ أو اقتراح إضافة رقم جديد
          </h2>
          <img src="/images/icons3d/alert.png" alt="" style={{ width: "35px" }} />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}
        >
          هل لاحظت أي رقم غير صالح أو خطأ في أكواد الشبكات؟ أو تود إضافة رقم جهة خدمية يستفيد منها الجميع؟
        </p>
      </div>

      <button
        type="button"
        className="btn btn-report"
        onClick={onOpenModal}
        style={{
          fontSize: "0.84rem",
          fontWeight: "700",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.15s ease",
          flexShrink: 0,
        }}
      >
        <i className="fa-solid fa-flag"></i>
        <span>تقديم بلاغ أو اقتراح</span>
      </button>
    </div>
  );
}
