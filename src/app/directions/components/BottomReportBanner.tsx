import React from "react";
import styles from "../page.module.css";

interface BottomReportBannerProps {
  onOpenReportModal: () => void;
}

export default function BottomReportBanner({ onOpenReportModal }: BottomReportBannerProps) {
  return (
    <div onClick={onOpenReportModal} className={styles.calloutBanner}>
      <div style={{ flex: "1 1 300px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <img
            src="/images/icons3d/alert.png"
            alt="Report"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sub)"
            }}
          >
            الإبلاغ عن مشكلة أو تحديث في خطوط المواصلات
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6"
          }}
        >
          هل لاحظت أي خطأ في الأسعار، خطوات الطريق، أو وسائل المواصلات؟ شاركنا ملاحظتك لمساعدتنا في تدقيق الدليل وتحديثه باستمرار.
        </p>
      </div>
      <i className="bx bx-chevron-left" style={{ fontSize: "1.4rem", color: "var(--text-muted)", marginRight: "auto" }} />
    </div>
  );
}
