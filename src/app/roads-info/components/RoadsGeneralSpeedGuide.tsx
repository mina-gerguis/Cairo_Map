"use client";

import React from "react";
import styles from "../roads-info.module.css";
import { EMERGENCY_NUMBERS } from "../constants";
import { HighwayItem } from "@/data/roads_info";
import { RoadTripCalculator } from "./RoadTripCalculator";

interface RoadsGeneralSpeedGuideProps {
  roads: HighwayItem[];
}

export function RoadsGeneralSpeedGuide({ roads }: RoadsGeneralSpeedGuideProps) {
  return (
    <div className={styles.guideContainer}>
      <div className={styles.guideGrid}>
        {/* General Egyptian Speed Limits Guide */}
        <div className={styles.guideCard}>
          <div className={styles.guideCardTitle}>
            <i className="bx bx-shield-quarter" style={{ color: "#3b82f6" }} />
            <span>الحدود القانونية العامة للسرعة في مصر</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ background: "var(--bg-secondary, rgba(15,23,42,0.5))", border: "1px solid var(--border-glass)", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontWeight: "700", color: "#60a5fa", marginBottom: "4px" }}>
                1. الطرق الحرة والصحراوية (مثل السويس، الصحراوي، الإسماعيلية):
              </div>
              <ul style={{ margin: 0, paddingRight: "18px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                <li>ملاكي: <strong>120 كم/س</strong></li>
                <li>ميني باص وأتوبيس: <strong>100 كم/س</strong></li>
                <li>ميكروباص: <strong>100 كم/س</strong></li>
                <li>ربع نقل (بيك أب): <strong>90 كم/س</strong></li>
                <li>نقل ثقيل ومقطورات: <strong>70 - 80 كم/س</strong></li>
              </ul>
            </div>

            <div style={{ background: "var(--bg-secondary, rgba(15,23,42,0.5))", border: "1px solid var(--border-glass)", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontWeight: "700", color: "#34d399", marginBottom: "4px" }}>
                2. الطرق الدائرية والمحاور الكبرى (مثل الدائري ومحور 26 يوليو):
              </div>
              <ul style={{ margin: 0, paddingRight: "18px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                <li>ملاكي: <strong>90 كم/س</strong></li>
                <li>أتوبيس وميكروباص: <strong>80 كم/س</strong></li>
                <li>نقل خفيف ومتوسط: <strong>70 كم/س</strong></li>
                <li>نقل ثقيل: <strong>60 كم/س</strong></li>
              </ul>
            </div>

            <div style={{ background: "var(--bg-secondary, rgba(15,23,42,0.5))", border: "1px solid var(--border-glass)", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontWeight: "700", color: "#fbbf24", marginBottom: "4px" }}>
                3. الطرق الزراعية والداخلية:
              </div>
              <ul style={{ margin: 0, paddingRight: "18px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                <li>الزراعي السريع: <strong>90 كم/س</strong> للملاكي</li>
                <li>داخل المدن والتجمعات السكنية: <strong>60 كم/س</strong> للملاكي</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Hotlines */}
        <div className={styles.guideCard}>
          <div className={styles.guideCardTitle}>
            <i className="bx bx-phone-call" style={{ color: "#ef4444" }} />
            <span>أرقام طوارئ وإغاثة الطرق السريعة</span>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.5" }}>
            في حالة حدوث عطل مفاجئ أو حادث أو تعذر الرؤية بسبب الشبورة، اتصل فوراً بغرف العمليات الموحدة لطلب ونش الإنقاذ أو الإسعاف:
          </p>

          <div className={styles.emergencyNumbersList}>
            {EMERGENCY_NUMBERS.map((em, idx) => (
              <div key={idx} className={styles.emergencyItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className={em.icon} style={{ fontSize: "1.2rem", color: em.color }} />
                  <span style={{ fontSize: "0.86rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {em.name}
                  </span>
                </div>
                <a href={`tel:${em.number}`} className={styles.emergencyNumberLink}>
                  {em.number}
                </a>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.78rem",
              color: "#fca5a5",
              lineHeight: "1.5",
            }}
          >
            <i className="bx bx-info-circle" style={{ marginLeft: "4px" }} />
            عند التوقف الاضطراري على الطريق السريع، اركن سيارتك في الحارة اليمنى لأقصى اليمين (الطبان)، وأشعل أضواء الانتظار الرباعية وضع مثلث التحذير العاكس على بعد 50 متراً.
          </div>
        </div>
      </div>

      {/* Trip Duration & Fuel Calculator */}
      <RoadTripCalculator roads={roads} />
    </div>
  );
}
