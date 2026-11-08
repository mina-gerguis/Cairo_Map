import React from "react";
import { LrtPricingCardProps } from "../types";
import { LRT_FARE_TIERS } from "../constants";
import styles from "../lrt.module.css";

export default function LrtPricingCard({ cardRef }: LrtPricingCardProps) {
  return (
    <div ref={cardRef} className={styles.stationCard}>
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(6, 182, 212, 0.12)",
              color: "#06b6d4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
            }}
          >
            <i className="fa-solid fa-ticket" />
          </div>
          <div>
            <h3 className={styles.stationName} style={{ fontSize: "1.1rem" }}>
              تسعير تذاكر القطار الكهربائي LRT المعتمد
            </h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              الأسعار الرسمية المعتمدة وفقاً لعدد المحطات من وزارة النقل
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
        {LRT_FARE_TIERS.map((tier, idx) => {
          let tierColor = "#10b981";
          if (idx === 1) tierColor = "#06b6d4";
          if (idx === 2) tierColor = "#f59e0b";
          if (idx === 3) tierColor = "#ef4444";

          return (
            <div
              key={idx}
              className={styles.metricTile}
              style={{
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "4px",
                padding: "14px 10px",
              }}
            >
              <div
                style={{
                  fontSize: "1.35rem",
                  fontWeight: "900",
                  color: tierColor,
                  lineHeight: "1.2",
                }}
              >
                {tier.price}{" "}
                <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>
                {tier.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
