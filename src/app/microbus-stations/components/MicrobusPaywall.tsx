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
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/microbus.png"
              alt="Cairo Microbus"
              loading="lazy"
              decoding="async"
              className="h-auto"
              style={{ width: "60px", height: "42px", objectFit: "contain" }}
            />
            <span className={styles.heroTitleGradient}>مواقف الميكروباص</span>
          </h1>
          <p className={styles.heroSubtitle}>
            تقدر دلوقتي تعرف خطوط السير والأجرات الرسمية وزمن الرحلة في جميع المواقف و نقط التحميل في جمهورية مصر العربية.
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
              >
                ترقية إلى الباقة الذهبية الآن
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
