import React from "react";
import { MonorailReportBannerProps } from "../types";
import styles from "../monorail.module.css";

export default function MonorailReportBanner({
  bannerRef,
  onOpenReportModal,
}: MonorailReportBannerProps) {
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
            الإبلاغ عن مشكلة فى بيانات خطوط المونوريل
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
          هل لاحظت أي محطة غير دقيقة أو خطأ في مسارات خطوط مونوريل شرق أو غرب النيل؟ شاركنا ملاحظتك للمساعدة في تدقيق شبكة النقل.
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
