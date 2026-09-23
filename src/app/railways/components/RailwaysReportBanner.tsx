import React from "react";
import styles from "../railways.module.css";

interface RailwaysReportBannerProps {
  onOpenReport: () => void;
}

export default function RailwaysReportBanner({ onOpenReport }: RailwaysReportBannerProps) {
  return (
    <div className={styles.calloutBanner}>
      <div className={styles.calloutInfo}>
        <div className={styles.calloutTitleRow}>
          <img
            src="/images/icons3d/alert.png"
            alt="Alert"
            loading="lazy"
            decoding="async"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
          <h3 className={styles.calloutTitle}>
            الإبلاغ عن مشكلة أو تحديث في بيانات القطارات
          </h3>
        </div>

        <p className={styles.calloutDesc}>
          هل لاحظت أي خطأ في المواعيد، الأسعار، أو محطات التوقف؟ شاركنا ملاحظتك لمساعدتنا في تدقيق وتحديث جدول الرحلات باستمرار.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-report"
        onClick={onOpenReport}
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
