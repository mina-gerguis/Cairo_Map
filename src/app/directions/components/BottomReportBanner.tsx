import React from "react";

interface BottomReportBannerProps {
  onOpenReportModal: () => void;
}

export default function BottomReportBanner({ onOpenReportModal }: BottomReportBannerProps) {
  return (
    <div
      onClick={onOpenReportModal}
      style={{
        background: "var(--bg-linear-alert)",
        border: "1px solid var(--border-secondary)",
        borderRadius: "var(--ra-8)",
        padding: "var(--pd-20)",
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
    </div>
  );
}
