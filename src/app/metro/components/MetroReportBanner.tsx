import React from "react";
import { MetroReportBannerProps } from "../types";
import styles from "../metro.module.css";

export default function MetroReportBanner({
  bannerRef,
  onOpenReportModal,
}: MetroReportBannerProps) {
  return (
    <div
      ref={bannerRef}
      className={styles.calloutBanner}
      onClick={onOpenReportModal}
      style={{ cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "560px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "1.4rem",
            color: "var(--color-secondary, #3b82f6)",
          }}
        >
          <i className="bx bx-error-circle" />
        </div>

        <div>
          <h3
            style={{
              margin: "0 0 4px",
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sub, inherit)",
            }}
          >
            الإبلاغ عن مشكلة في بيانات المترو
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            هل لاحظت أي خطأ في أسعار التذاكر، محطات التبديل أو أسماء المحطات؟ شاركنا ملاحظتك لمساعدتنا في تدقيق البيانات.
          </p>
        </div>
      </div>

      <button
        type="button"
        className={styles.calloutBtn}
        onClick={(e) => {
          e.stopPropagation();
          onOpenReportModal();
        }}
      >
        <i className="fa-solid fa-flag" />
        <span>تقديم بلاغ</span>
      </button>
    </div>
  );
}
