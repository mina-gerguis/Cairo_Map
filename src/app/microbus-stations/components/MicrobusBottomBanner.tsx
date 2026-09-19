import React from "react";
import styles from "../microbus.module.css";

interface MicrobusBottomBannerProps {
  onOpenMissingRouteModal: () => void;
}

export default function MicrobusBottomBanner({
  onOpenMissingRouteModal,
}: MicrobusBottomBannerProps) {
  return (
    <div onClick={onOpenMissingRouteModal} className={styles.calloutBanner}>
      <div style={{ flex: "1 1 300px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(59, 130, 246, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3b82f6",
            fontSize: "1.25rem"
          }}>
            <i className="bx bx-plus-circle" />
          </div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sub)" }}>
            عارف خط موجود في موقف ومش موجود بالدليل؟
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          شاركنا به لمساعدة بقية الركاب! سنقوم بمراجعة بيانات الخط وإدراجه في الدليل فوراً.
        </p>
      </div>

      <button type="button" className={styles.spotlightBtn}>
        <i className="bx bx-send" />
        <span>إضافة خط جديد</span>
      </button>
    </div>
  );
}
