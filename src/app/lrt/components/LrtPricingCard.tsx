import React from "react";
import { LrtPricingCardProps } from "../types";
import { LRT_FARE_TIERS } from "../constants";

export default function LrtPricingCard({ cardRef }: LrtPricingCardProps) {
  return (
    <div
      ref={cardRef}
      style={{
        padding: "12px 16px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-glass)",
        borderRadius: "var(--radius-card)",
        fontSize: "0.78rem",
        color: "var(--text-secondary)",
        lineHeight: "1.5",
        marginTop: "16px",
      }}
    >
      <div style={{ marginBottom: "6px" }}>
        <i
          className="fa-regular fa-lightbulb"
          style={{ color: "var(--accent-warning)", marginLeft: "5px" }}
        />
        <strong style={{ color: "var(--text-primary)" }}>
          تسعير تذاكر القطار الكهربائي LRT المعتمد:
        </strong>{" "}
        البيانات مبنية على الأسعار الرسمية لوزارة النقل
      </div>

      {LRT_FARE_TIERS.map((tier, idx) => (
        <div
          key={idx}
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            textAlign: "right",
            direction: "rtl",
          }}
        >
          • <strong style={{ color: tier.color }}>{tier.label}:</strong> {tier.price}{" "}
          جنيهاً.
        </div>
      ))}
    </div>
  );
}
