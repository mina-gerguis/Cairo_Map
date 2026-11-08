import React from "react";
import Image from "next/image";
import { MonorailReportBannerProps } from "../types";
import styles from "../monorail.module.css";

export default function MonorailReportBanner({
  bannerRef,
  onOpenReportModal,
}: MonorailReportBannerProps) {
  return (
    <div
      ref={bannerRef}
      className={styles.calloutBanner}
      onClick={onOpenReportModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenReportModal();
        }
      }}
      aria-label="الإبلاغ عن مشكلة في بيانات المونوريل"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "580px" }}>
        <Image
          src="/images/threeD/alert.webp"
          alt="تنبيه"
          width={42}
          height={42}
          style={{ objectFit: "contain", flexShrink: 0 }}
        />
        <div>
          <h3
            style={{
              margin: "0 0 4px",
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--color-fg)",
              fontFamily: "var(--font-sub, inherit)",
            }}
          >
            الإبلاغ عن مشكلة في بيانات خطوط المونوريل
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            هل لاحظت أي محطة غير دقيقة أو خطأ في مسارات خطوط مونوريل شرق أو غرب النيل؟ شاركنا ملاحظتك لمساعدتنا في تدقيق البيانات.
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
        <i className="fa-solid fa-triangle-exclamation" style={{ color: "currentColor" }} />
        <span>إبلاغ عن خطأ</span>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.1rem" }} />
      </button>
    </div>
  );
}
