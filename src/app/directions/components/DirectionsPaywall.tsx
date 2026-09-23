import React, { RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import styles from "../page.module.css";

interface DirectionsPaywallProps {
  user: User | null;
  paywallRef: RefObject<HTMLDivElement | null>;
  paywallCardRef: RefObject<HTMLDivElement | null>;
}

export default function DirectionsPaywall({
  user,
  paywallRef,
  paywallCardRef
}: DirectionsPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />
      <div className={styles.contentContainer} style={{ paddingTop: "40px" }}>
        {/* Paywall Header */}
        <div ref={paywallRef} style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/arab_republic _of_egypt.png"
              alt="Cairo Directions"
              loading="lazy"
              decoding="async"
              style={{ width: "42px", height: "auto", objectFit: "contain" }}
            />
            <span className={styles.heroTitleGradient}>ازاي اروح ..؟</span>
          </h1>
          <p className={styles.heroSubtitle}>
            دليل السفر والانتقال الذكي لمختلف وسائل المواصلات والطرق المختصرة.
          </p>
        </div>

        {/* Paywall Card */}
        <div
          ref={paywallCardRef}
          className={styles.routeCard}
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            textAlign: "center",
            padding: "36px 28px",
          }}
        >
          {/* Badge Icon */}
          <div style={{ marginBottom: "18px" }}>
            <img
              src="/images/icons3d/CairoSilver.png"
              alt="Silver Access"
              loading="lazy"
              decoding="async"
              style={{ width: "120px", height: "auto", objectFit: "contain", margin: "0 auto" }}
            />
          </div>

          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginBottom: "10px",
              fontFamily: "var(--font-sub)"
            }}
          >
            دليل مسارات المواصلات يتطلب الاشتراك في الباقة الفضية
          </h2>

          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              margin: "0 0 18px"
            }}
          >
            محرك البحث المتقدم عن خطوط المواصلات والطرق المختصرة (ميكروباص، أتوبيسات، مترو، ومونوريل) متاح للمشتركين في الباقة الفضية أو الذهبية أو المشوار.
          </p>

          {/* Perks list */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "right",
              margin: "0 0 24px"
            }}
          >
            <div
              style={{
                fontWeight: "800",
                color: "var(--text-primary)",
                fontSize: "0.88rem",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <i className="bx bxs-award" style={{ color: "#94a3b8" }} />
              <span>ما الذي يميز الباقة الفضية؟</span>
            </div>
            <ul
              style={{
                paddingRight: "16px",
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: "1.8",
                listStyleType: "none",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <li>✨ البحث عن مسارات مواصلات بين أي منطقتين بالتفصيل</li>
              <li>✨ حساب تكلفة الرحلة والمدة المتوقعة بدقة لكل مرحلة</li>
              <li>✨ خيارات متعددة للتنقل (مباشر، مترو + ميكروباص، إلخ)</li>
              <li>✨ تشمل أيضاً دليل القطارات والمونوريل والقطار الكهربائي</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-silver"
              >
                اشترك الآن في الباقة الفضية
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
              >
                سجل دخولك أولاً لتفعيل الاشتراك
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
