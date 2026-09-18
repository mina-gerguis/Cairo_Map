import React, { RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

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
    <div className="main-container">
      {/* Header Banner */}
      <div
        ref={paywallRef}
        className="header-banner"
        style={{ borderBottom: "1px solid var(--border-glass)", direction: "rtl", textAlign: "center" }}
      >
        <div>
          <h1 className="header-title" style={{ justifyContent: "center" }}>
            <img
              src="/images/icons2d/bus.png"
              alt="Cairo Directions"
              loading="lazy"
              decoding="async"
              style={{ width: "35px", height: "35px", marginLeft: "10px" }}
            />
            ازاي اروح ؟
          </h1>
          <p className="header-sub-title" style={{ margin: "0 auto 10px" }}>
            دليل السفر والانتقال الذكي لمختلف وسائل المواصلات والطرق المختصرة.
          </p>
        </div>
      </div>

      {/* Lock Panel */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
        <div
          ref={paywallCardRef}
          style={{
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-card)",
            padding: "35px 25px",
            textAlign: "center",
            marginTop: "32px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Lock Icon */}
          <div style={{ marginBottom: "24px" }}>
            <img
              src="/images/icons3d/CairoSilver.png"
              alt="Lock"
              loading="lazy"
              decoding="async"
              style={{ width: "150px", objectFit: "contain" }}
            />
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "14px" }}>
            دليل خطوط ومسارات المواصلات يتطلب أشتراك في الباقة الفضية
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              lineHeight: "1.7",
              maxWidth: "460px",
              margin: "0 auto 28px",
              fontFamily: "var(--font-body)"
            }}
          >
            محرك البحث المتقدم عن خطوط المواصلات والطرق المختصرة (ميكروباص، أتوبيسات، مترو، ومونوريل) متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية أو المشوار.
          </p>

          {/* Perks list */}
          <div
            style={{
              background: "rgba(128, 128, 128, 0.04)",
              padding: "18px 20px",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border-glass)",
              textAlign: "right",
              margin: "0 auto 28px",
              maxWidth: "420px"
            }}
          >
            <div
              style={{
                fontWeight: "800",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>ما الذي يميز الباقة الفضية ؟</span>
            </div>
            <ul
              style={{
                paddingRight: "16px",
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontFamily: "var(--font-body)"
              }}
            >
              <li>✨ البحث عن مسارات مواصلات بين أي منطقتين بالتفصيل</li>
              <li>✨ حساب تكلفة الرحلة والمدة المتوقعة بدقة لكل مرحلة</li>
              <li>✨ خيارات متعددة للتنقل (مباشر، مترو + ميكروباص، إلخ)</li>
              <li>✨ تشمل أيضاً دليل القطارات والمونوريل والقطار الكهربائي</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-silver"
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  display: "block"
                }}
              >
                اشترك الآن في الباقة الفضية
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  display: "block"
                }}
              >
                سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-cancel"
              style={{
                color: "var(--text-primary)",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.9rem",
                display: "block"
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
