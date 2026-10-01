"use client";

import React, { RefObject } from "react";
import Link from "next/link";
import PageHero from "@/components/common/PageHero";
import { ParkingLockStateProps } from "../types";
import styles from "../parking.module.css";

export function ParkingLoading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingSpinner} />
      <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
        جاري تحميل وتجهيز دليل الجراجات...
      </span>
    </div>
  );
}

interface ModernParkingLockStateProps extends ParkingLockStateProps {
  headerRef?: RefObject<HTMLDivElement | null>;
  cardRef?: RefObject<HTMLDivElement | null>;
}

export function ParkingLockState({ user, headerRef, cardRef }: ModernParkingLockStateProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <PageHero
        headerRef={headerRef}
        title="دليل الجراجات"
        icon={{
          src: "/images/icons2d/parking.webp",
          alt: "Cairo Parking",
          width: 60,
          height: 42,
        }}
        subtitle="خريطة تفاعلية ودليل جراجات وسط البلد، روكسي، ومحطات المترو التبادلية."
      />

      <div className={styles.contentContainer} style={{ paddingTop: "10px" }}>
        <div
          ref={cardRef}
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            textAlign: "center",
            padding: "36px 28px",
            background: "var(--bg-glass)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Lock Icon */}
          <div style={{ marginBottom: "20px" }}>
            <img
              src="/images/icons3d/lockPage.webp"
              alt="Lock"
              loading="lazy"
              decoding="async"
              style={{
                width: "130px",
                height: "100px",
                objectFit: "contain",
                margin: "0 auto",
              }}
            />
          </div>

          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              marginBottom: "12px",
              fontFamily: "var(--font-sub)",
            }}
          >
            دليل الجراجات يتطلب اشتراك في الباقة الفضية أو الذهبية
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              lineHeight: "1.7",
              margin: "0 auto 20px",
              fontFamily: "var(--font-body)",
            }}
          >
            تصفح الدليل الكامل وتفاصيل مواقع الجراجات المتعددة الطوابق والذكية وخدمة
            اركن واركب متاح للمشتركين بالباقة الفضية أو الذهبية.
          </p>

          {/* Perks list */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "16px",
              textAlign: "right",
              margin: "0 auto 24px",
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
                gap: "6px",
              }}
            >
              <i className="bx bxs-car" style={{ color: "#3b82f6" }} />
              <span>ميزات الباقة الفضية للجراجات:</span>
            </div>
            <ul
              style={{
                paddingRight: "16px",
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: "1.7",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                listStyleType: "none",
              }}
            >
              <li>✨ عرض مواقع وتفاصيل الجراجات المتعددة الطوابق والذكية.</li>
              <li>✨ معرفة أقرب محطات المترو التبادلية والخدمية لكل جراج.</li>
              <li>✨ التوجيه المباشر بالخرائط لمعرفة الاتجاهات وحساب المسافة.</li>
              <li>✨ توفير الوقت والجهد وتفادي زحام الانتظار وركن سيارتك بأمان.</li>
            </ul>
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "340px",
              margin: "0 auto",
            }}
          >
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-primary"
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "0.92rem",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                اشترك الآن في الباقة الفضية
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "0.92rem",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                سجل دخولك لتفعيل الاشتراك
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-cancel"
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.88rem",
                textAlign: "center",
                textDecoration: "none",
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
