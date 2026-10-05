import React from "react";
import { LrtPricingCardProps } from "../types";
import { LRT_FARE_TIERS } from "../constants";
import styles from "../lrt.module.css";

export default function LrtPricingCard({ cardRef }: LrtPricingCardProps) {
  return (
    <div ref={cardRef} className={styles.pricingBentoCard}>
      <div className={styles.pricingHeader}>
        <i
          className="fa-solid fa-ticket"
          style={{ color: "#06b6d4", fontSize: "1.1rem" }}
        />
        <div>
          <h3 className={styles.pricingTitle}>
            تسعير تذاكر القطار الكهربائي LRT المعتمد
          </h3>
          <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
            الأسعار الرسمية المعتمدة من وزارة النقل
          </span>
        </div>
      </div>

      <div className={styles.pricingTiersGrid}>
        {LRT_FARE_TIERS.map((tier, idx) => {
          let tierColor = "#10b981";
          if (idx === 1) tierColor = "#06b6d4";
          if (idx === 2) tierColor = "#f59e0b";
          if (idx === 3) tierColor = "#ef4444";

          return (
            <div key={idx} className={styles.pricingTierItem}>
              <div
                className={styles.pricingTierPrice}
                style={{ color: tierColor }}
              >
                {tier.price}{" "}
                <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>ج.م</span>
              </div>
              <div className={styles.pricingTierLabel}>
                {tier.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
