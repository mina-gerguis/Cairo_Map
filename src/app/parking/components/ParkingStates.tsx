"use client";

import React from "react";
import Link from "next/link";
import { ParkingLockStateProps } from "../types";

export function ParkingLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgPrimary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--border-glass)",
          borderTop: "4px solid var(--color-secondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span>جاري التحقق من التفاصيل...</span>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
        }}
      />
    </div>
  );
}

export function ParkingLockState({ user }: ParkingLockStateProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "50px",
        backgroundColor: "var(--bgPrimary)",
        direction: "rtl",
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
              background: "var(--bg-glass-card)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </div>

        <div className="metro-animate-slide-up metro-delay-100">
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              fontWeight: "600",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            <img
              src="/images/icons2d/parking.png"
              alt="Parking"
              loading="lazy"
              decoding="async"
              style={{ width: "60px", marginLeft: "10px" }}
            />
            دليل الجراجات
          </h1>
          <p
            className="sub-title"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              maxWidth: "600px",
              margin: "5px auto",
              lineHeight: "1.6",
            }}
          >
            خريطة تفاعلية ودليل جراجات وسط البلد، روكسي، ومحطات المترو التبادلية.
          </p>
        </div>
      </div>

      {/* Lock Panel centered container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
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
            دليل الجراجات يتطلب اشتراك في الباقة الفضية
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
            تصفح الدليل الكامل وتفاصيل مواقع الجراجات المتعددة الطوابق والذكية وخدمة
            اركن واركب متاح للمشتركين بالباقة الفضية أو الذهبية.
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
              ميزات الباقة الفضية:
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
              <li>✨ عرض مواقع وتفاصيل الجراجات المتعددة الطوابق والذكية.</li>
              <li>✨ معرفة أقرب محطات المترو التبادلية والخدمية لكل جراج.</li>
              <li>✨ استخدام ميزة التوجيه المباشر بالخرائط لمعرفة الاتجاهات.</li>
              <li>✨ ميزة اركن واركب لتوفير الوقت وتكلفة الوقود بالزحام.</li>
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
                  color: "var(--color-white-50)",
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
  );
}
