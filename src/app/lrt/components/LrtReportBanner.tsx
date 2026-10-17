import React from "react";
import { LrtReportBannerProps } from "../types";
import styles from "../lrt.module.css";

export default function LrtReportBanner({
  bannerRef,
  onOpenReportModal,
}: LrtReportBannerProps) {
  return (
    <div ref={bannerRef} className={styles.calloutBanner}>
      <div style={{ flex: "1 1 300px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <img
            src="/images/icons3d/alert.webp"
            alt="Alert"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: "1.02rem",
              fontWeight: "800",
              color: "var(--text-primary)",
            }}
          >
            الإبلاغ عن مشكلة فى بيانات القطار الكهربائي LRT
          </h3>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.84rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}
        >
          هل لاحظت أي خطأ في مسارات القطار، أو أسعار التذاكر، أو محطات التبديل؟ ساعدنا في تدقيق وتحديث البيانات لخدمة الجميع.
        </p>
      </div>

      <button
        type="button"
        className={styles.calloutBtn}
        onClick={onOpenReportModal}
      >
        <i className="fa-solid fa-flag" style={{ color: "#ef4444" }} />
        <span>تقديم بلاغ عن خطأ</span>
      </button>
    </div>
  );
}
