import React from "react";
import Image from "next/image";
import styles from "../microbus.module.css";

interface MicrobusBottomBannerProps {
  onOpenMissingRouteModal: () => void;
}

export default function MicrobusBottomBanner({
  onOpenMissingRouteModal,
}: MicrobusBottomBannerProps) {
  return (
    <div
      className={styles.calloutBanner}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenMissingRouteModal();
        }
      }}
      aria-label="إضافة أو تعديل موقف أو خط سير ميكروباص"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "620px" }}>
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
            عايز تضيف موقف أو خط سير مش موجود؟
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            تقدر تشاركنا تفاصيل الموقف، خط السير، أو الأجرة اللي تعرفها علشان نضيفها ونساعد آلاف الركاب يومياً.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={(e) => {
          e.stopPropagation();
          onOpenMissingRouteModal();
        }}
      >
        <i className="bx bx-plus-circle" style={{ fontSize: "1.1rem" }} />
        <span>إضافة أو إبلاغ عن خط</span>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.1rem" }} />
      </button>
    </div>
  );
}
