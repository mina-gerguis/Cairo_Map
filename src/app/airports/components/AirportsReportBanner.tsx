import React, { RefObject } from "react";
import Image from "next/image";
import styles from "../airports.module.css";

interface AirportsReportBannerProps {
  bannerRef?: RefObject<HTMLDivElement | null>;
  onOpenReport: () => void;
}

export default function AirportsReportBanner({
  bannerRef,
  onOpenReport,
}: AirportsReportBannerProps) {
  return (
    <div
      ref={bannerRef}
      className={styles.calloutBanner}
      onClick={onOpenReport}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenReport();
        }
      }}
      aria-label="الإبلاغ عن خطأ أو تحديث في بيانات المطارات"
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
            الإبلاغ عن خطأ أو تحديث في بيانات المطارات
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            هل لاحظت أي خطأ في أرقام الهواتف، بيانات الصالات، شركات الطيران أو ترغب في اقتراح مطار جديد؟ شاركنا ملاحظتك لمساعدتنا في تدقيق البيانات.
          </p>
        </div>
      </div>

      <button
        type="button"
        className={styles.calloutBtn}
        onClick={(e) => {
          e.stopPropagation();
          onOpenReport();
        }}
      >
        <i className="bx bx-flag" style={{ fontSize: "1.1rem" }} />
        <span>تقديم بلاغ عن خطأ</span>
      </button>
    </div>
  );
}
