import React from "react";
import { EmergencyRibbonProps } from "../types";
import { TOP_EMERGENCY_NUMBERS } from "../constants";
import { getDialUrl } from "../utils";
import styles from "../directory.module.css";

export default function EmergencyRibbon({ ribbonRef }: EmergencyRibbonProps) {
  return (
    <div ref={ribbonRef} className={styles.emergencyRibbon}>
      {TOP_EMERGENCY_NUMBERS.map((em, idx) => (
        <a
          key={idx}
          href={getDialUrl(em.number)}
          className={styles.emergencyCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = em.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border-glass)";
          }}
        >
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {em.name}
            </div>
            <div
              style={{
                fontSize: "1.05rem",
                fontWeight: "800",
                color: em.color,
                direction: "ltr",
                textAlign: "right",
              }}
            >
              {em.number}
            </div>
          </div>
          <div
            className={styles.emergencyIconCircle}
            style={{
              background: `${em.color}18`,
              color: em.color,
            }}
          >
            <i className={em.icon}></i>
          </div>
        </a>
      ))}
    </div>
  );
}
