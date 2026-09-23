import React from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface LrtPaywallProps {
  user: User | null;
}

export default function LrtPaywall({ user }: LrtPaywallProps) {
  return (
    <>
      <title>خريطة القطار الكهربائي LRT - دليل شامل لكل المحطات</title>
      <div
        style={{
          minHeight: "100vh",
          paddingBottom: "50px",
          backgroundColor: "var(--bgPrimary)",
        }}
      >
        {/* Banner matching Metro Cover Style */}
        <div
          className="metro-animate-fade"
          style={{
            backgroundColor: "var(--bgPrimary)",
            padding: "24px 20px 24px",
            textAlign: "center",
            position: "relative",
            borderBottom: "1px solid var(--border-glass)",
            direction: "rtl",
          }}
        >
          {/* Back Button */}
          <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
                textDecoration: "none",
              }}
            >
              <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }} />
            </Link>
          </div>

          <div className="metro-animate-slide-up metro-delay-100">
            <h1
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                fontWeight: "600",
                color: "var(--text-primary)",
                letterSpacing: "-0.5px",
              }}
            >
              <img
                src="/images/icons2d/Cairo_lrt.png"
                alt="Cairo Lrt"
                loading="lazy"
                decoding="async"
                style={{ width: "35px", marginLeft: "10px" }}
              />
              القطار الكهربائي
            </h1>
            <p
              className="sub-title"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.95rem",
                maxWidth: "600px",
                margin: "10px auto",
                lineHeight: "1.6",
              }}
            >
              خريطة تفاعلية تفصيلية لشبكة القطار الكهربائي الخفيف الجديدة.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0 20px",
            direction: "rtl",
          }}
        >
          <div
            className="metro-animate-slide-up metro-delay-200"
            style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "15px",
              padding: "35px 25px",
              textAlign: "center",
              marginTop: "32px",
              boxShadow: "var(--shadow-card)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Lock Icon */}
            <div style={{ marginBottom: "24px" }}>
              <img
                src="/images/icons3d/lockPage.png"
                alt="Lock"
                loading="lazy"
                decoding="async"
                style={{ width: "150px", height: "120px", objectFit: "contain" }}
              />
            </div>

            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                marginBottom: "14px",
              }}
            >
              دليل القطار الكهربائي يتطلب أشتراك في الباقة الفضية
            </h2>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.95rem",
                lineHeight: "1.7",
                maxWidth: "460px",
                margin: "0 auto 28px",
                fontFamily: "var(--font-body)",
              }}
            >
              تصفح الخريطة التفصيلية والمسارات الزمنية وحاسبة التذاكر لخط القطار الكهربائي LRT
              متاح للمشتركين بالباقة الفضية أو الذهبية.
            </p>

            {/* Perks list */}
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "16px 20px",
                textAlign: "right",
                margin: "0 auto 32px",
                maxWidth: "440px",
              }}
            >
              <div
                style={{
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  marginBottom: "10px",
                }}
              >
                ميزات الباقة الفضية
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
                }}
              >
                <li>✨ تصفح جميع محطات LRT (التفريعة الرئيسية وتفريعات العاصمة ورمضان)</li>
                <li>✨ حساب أسعار التذاكر بناء على عدد المحطات تلقائياً</li>
                <li>✨ مسارات تفصيلية ومواعيد الرحلات الرسمية</li>
                <li>✨ متاح معها ميزة ازاي اروح وسكك الحديد والمونوريل بالكامل</li>
              </ul>
            </div>

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxWidth: "340px",
                margin: "0 auto",
              }}
            >
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "var(--padding-btn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-seliver)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-seliver)",
                    border: "1px solid var(--br-subscribe-button-seliver)",
                    display: "block",
                  }}
                >
                  اشترك الآن في الباقة الفضية
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "var(--padding-btn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-base)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-base)",
                    display: "block",
                  }}
                >
                  سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}

              <Link
                href="/"
                style={{
                  padding: "var(--padding-btn)",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--border-glass)",
                  display: "block",
                }}
              >
                الرجوع للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
