import React from "react";

interface BottomReportBannerProps {
  onOpenReportModal: () => void;
}

export default function BottomReportBanner({ onOpenReportModal }: BottomReportBannerProps) {
  return (
    <div
      style={{
        background: "var(--bgLinearAlert)",
        border: "1px solid var(--borderSecondary)",
        borderRadius: "var(--ra-8)",
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "14px",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div style={{ flex: "1 1 300px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: "row-reverse" }}>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "1rem",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            الإبلاغ عن مشكلة أو تحديث في خطوط المواصلات
          </h2>
          <img src="/images/icons3d/alert.png" alt="" style={{ width: "35px" }} />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--textSecondary)",
            lineHeight: "1.6"
          }}
        >
          هل لاحظت أي خطأ في الأسعار، خطوات الطريق، أو وسائل المواصلات؟ شاركنا ملاحظتك لمساعدتنا في تدقيق الدليل وتحديثه باستمرار.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-reportProblem"
        onClick={onOpenReportModal}
        style={{
          padding: "6px 12px",
          fontSize: "0.84rem",
          fontWeight: "700",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.15s ease",
          flexShrink: 0
        }}
      >
        <i className="fa-solid fa-flag"></i>
        <span>تقديم بلاغ عن خطأ</span>
      </button>
    </div>
  );
}
