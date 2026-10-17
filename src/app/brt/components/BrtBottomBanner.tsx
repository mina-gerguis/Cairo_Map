import React from "react";
import styles from "../brt.module.css";

interface BrtBottomBannerProps {
  onOpenReportModal: () => void;
}

export default function BrtBottomBanner({
  onOpenReportModal,
}: BrtBottomBannerProps) {
  return (
    <div
      onClick={onOpenReportModal}
      className={styles.bottomCallout}
      style={{ cursor: "pointer" }}
    >
      <div style={{ flex: "1 1 300px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <img
            src="/images/icons3d/alert.webp"
            alt="Alert"
            loading="lazy"
            decoding="async"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sub)",
            }}
          >
            الإبلاغ عن مشكلة في بيانات الأتوبيس الترددي BRT
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}
        >
          هل لاحظت أي خطأ في مسارات الأتوبيس الترددي، أسعار التذاكر، أو محطات التبديل؟ شاركنا ملاحظتك لمساعدتنا في تدقيق وتحديث البيانات باستمرار.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-report"
        onClick={(e) => {
          e.stopPropagation();
          onOpenReportModal();
        }}
        style={{
          padding: "8px 16px",
          fontSize: "0.85rem",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "10px",
          flexShrink: 0,
        }}
      >
        <i className="fa-solid fa-flag" />
        <span>تقديم بلاغ عن خطأ</span>
      </button>
    </div>
  );
}
