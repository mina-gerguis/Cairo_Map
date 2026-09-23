import React, { RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import styles from "../railways.module.css";

interface RailwaysPaywallProps {
  user: User | null;
  paywallRef: RefObject<HTMLDivElement | null>;
  paywallCardRef: RefObject<HTMLDivElement | null>;
}

export default function RailwaysPaywall({
  user,
  paywallRef,
  paywallCardRef,
}: RailwaysPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer} style={{ paddingTop: "32px" }}>
        {/* Banner */}
        <div ref={paywallRef} style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/Cairo_train.png"
              alt="Cairo Train"
              loading="lazy"
              decoding="async"
              style={{ width: "42px", height: "42px", objectFit: "contain" }}
            />
            <span className={styles.heroTitleGradient}>سكك حديد مصر</span>
          </h1>

          <p className={styles.heroSubtitle}>
            مواعيد وأسعار قطارات السفر بين المحافظات.
          </p>
        </div>

        {/* Lock Panel Card */}
        <div ref={paywallCardRef} className={styles.paywallCard}>
          <div style={{ marginBottom: "20px" }}>
            <img
              src="/images/icons3d/CairoSilver.png"
              alt="Silver Access"
              loading="lazy"
              decoding="async"
              style={{ width: "130px", height: "auto", objectFit: "contain", margin: "0 auto" }}
            />
          </div>

          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-sub)" }}>
            دليل سكك حديد مصر يتطلب اشتراكاً في الباقة الفضية
          </h2>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 20px" }}>
            تصفح مواعيد وأسعار قطارات السفر بين المحافظات المختلفة متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
          </p>

          {/* Perks list */}
          <div className={styles.perksBox}>
            <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.88rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="bx bxs-award" style={{ color: "#94a3b8" }} />
              <span>ما الذي يميز الباقة الفضية؟</span>
            </div>
            <ul className={styles.perksList}>
              <li>✨ خطوط ومحطات قطارات السفر بين المحافظات.</li>
              <li>✨ تفاصيل فئات القطارات (تالجو، VIP، إسباني، روسي).</li>
              <li>✨ أسعار التذاكر ونقاط التبديل ومحطات التوقف.</li>
              <li>✨ روابط حجز التذاكر المعتمدة إلكترونياً ونصائح السفر.</li>
            </ul>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "340px", margin: "0 auto" }}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-silver"
                style={{ textDecoration: "none", fontWeight: "bold", fontSize: "0.95rem" }}
              >
                اشترك الآن في الباقة الفضية
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
                style={{ textDecoration: "none", fontWeight: "bold", fontSize: "0.95rem" }}
              >
                سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-cancel"
              style={{ textDecoration: "none", fontWeight: "bold", fontSize: "0.88rem" }}
            >
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
