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
    </div>
  );
}
