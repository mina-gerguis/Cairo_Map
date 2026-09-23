import React from "react";
import { MonorailReportBannerProps } from "../types";

export default function MonorailReportBanner({
  bannerRef,
  onOpenReportModal,
}: MonorailReportBannerProps) {
  return (
    <div
      ref={bannerRef}
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
            الإبلاغ عن مشكلة فى بيانات المونوريل
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
          هل لاحظت أي خطأ في مسارات المونوريل، أسعار التذاكر، أو محطات التبديل؟ شاركنا
          ملاحظتك لمساعدتنا في تدقيق وتحديث الشبكة.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-report"
        onClick={onOpenReportModal}
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
        <i className="fa-solid fa-flag" />
        <span>تقديم بلاغ عن خطأ</span>
      </button>
    </div>
  );
}
