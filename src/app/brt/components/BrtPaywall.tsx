import React, { RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import styles from "../brt.module.css";

interface BrtPaywallProps {
  user: User | null;
  paywallRef: RefObject<HTMLDivElement | null>;
  paywallCardRef: RefObject<HTMLDivElement | null>;
}

export default function BrtPaywall({
  user,
  paywallRef,
  paywallCardRef,
}: BrtPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />
      <div className={styles.contentContainer} style={{ paddingTop: "40px" }}>
        <div ref={paywallRef} style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/brt.png"
              alt="Cairo BRT"
              loading="lazy"
              decoding="async"
              className="h-auto"
              style={{ width: "60px", height: "42px", objectFit: "contain" }}
            />
            <span className={styles.heroTitleGradient}>الأتوبيس الترددي (BRT)</span>
          </h1>
          <p className={styles.heroSubtitle}>
            دليلك الشامل لخطوط ومحطات الأتوبيس الترددي السريع على الطريق الدائري ومواعيد التقاطر والأسعار.
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
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-card)",
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
            اشترك في الباقة للوصول الكامل
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
              <span>ماذا ستحصل في الاشتراك؟</span>
            </div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.8", listStyleType: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ جميع محطات الأتوبيس الترددي على الطريق الدائري بالكامل.</li>
              <li>✨ أسعار التذاكر وخطوط السير والربط التبادلي مع المترو والمونوريل.</li>
              <li>✨ زمن الرحلات التقديري والمعالم الحيوية بجوار كل محطة.</li>
            </ul>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-gold"
              >
                ترقية الاشتراك الآن
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
              >
                تسجيل الدخول لتفعيل الاشتراك
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-cancel"
            >
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
