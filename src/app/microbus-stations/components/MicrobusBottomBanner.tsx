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
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sub)" }}>
            عايز تضيف خط مش موجود وأنت عارف تفاصيله ..؟
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          شاركنا به لمساعدة بقية الركاب! سنقوم بمراجعة بيانات الخط وإدراجه في الدليل فوراً.
        </p>
      </div>
    </div>
  );
}
