import React, { RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import styles from "../microbus.module.css";

interface MicrobusPaywallProps {
  user: User | null;
  paywallRef: RefObject<HTMLDivElement | null>;
  paywallCardRef: RefObject<HTMLDivElement | null>;
}

export default function MicrobusPaywall({
  user,
  paywallRef,
  paywallCardRef,
}: MicrobusPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />
      <div className={styles.contentContainer} style={{ paddingTop: "40px" }}>
        <div ref={paywallRef} style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className={styles.livePill}>
            <i className="bx bxs-lock-alt" style={{ color: "#fbbf24" }} />
            <span>ميزة الباقة الذهبية الحصرية</span>
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleGradient}>دليل مواقف الميكروباص</span>
          </h1>
          <p className={styles.heroSubtitle}>
            تصفح كامل مواقف السرفيس، والتعرفة الرسمية لخطوط القاهرة والجيزة، متاح حصرياً للباقة الذهبية.
          </p>
        </div>

        <div
          ref={paywallCardRef}
          className={styles.stationCard}
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            textAlign: "center",
            padding: "36px 28px",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            boxShadow: "0 20px 50px -10px rgba(251, 191, 36, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)"
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <img
              src="/images/icons3d/CairoGold.png"
              alt="Gold Access"
              loading="lazy"
              decoding="async"
              style={{ width: "130px", height: "auto", objectFit: "contain", margin: "0 auto" }}
            />
          </div>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-sub)" }}>
            اشترك في الباقة الذهبية للوصول الكامل
          </h2>

          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "16px",
            padding: "16px",
            textAlign: "right",
            margin: "18px 0 24px"
          }}>
            <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.88rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="bx bxs-award" style={{ color: "#fbbf24" }} />
              <span>ماذا ستحصل في الباقة الذهبية؟</span>
            </div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.8", listStyleType: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ مواقف السرفيس والميكروباص الرئيسية ونقاط الركوب.</li>
              <li>✨ التعرفة الرسمية التقريبية وخط السير التفصيلي.</li>
              <li>✨ أنواع المركبات (سقف عالي، ميني باص) وزمن الرحلة.</li>
              <li>✨ يشمل أيضاً مخطط الرحلات الذكي والمطارات والموانئ.</li>
            </ul>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-gold"
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  textDecoration: "none"
                }}
              >
                ترقية إلى الباقة الذهبية الآن
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  textDecoration: "none"
                }}
              >
                تسجيل الدخول لتفعيل الاشتراك
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-cancel"
              style={{
                padding: "12px",
                borderRadius: "12px",
                fontSize: "0.88rem",
                textDecoration: "none"
              }}
            >
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
