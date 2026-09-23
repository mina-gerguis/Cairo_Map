import React, { RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import styles from "../ports.module.css";

interface PortsPaywallProps {
  user: User | null;
  paywallRef: RefObject<HTMLDivElement | null>;
  paywallCardRef: RefObject<HTMLDivElement | null>;
}

export default function PortsPaywall({
  user,
  paywallRef,
  paywallCardRef,
}: PortsPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer} style={{ paddingTop: "40px" }}>
        {/* Back Link */}
        <div className={styles.backLinkNav}>
          <Link href="/" className={styles.backLink}>
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.3rem" }} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Hero Area */}
        <div ref={paywallRef} style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/arab_republice.png"
              alt="جمهورية مصر العربية"
              loading="lazy"
              decoding="async"
              style={{ width: "48px", height: "48px", objectFit: "contain" }}
            />
            <span className={styles.heroTitleGradient}>دليل الموانئ البحرية</span>
          </h1>
          <p className={styles.heroSubtitle}>
            استكشف الموانئ المصرية على البحرين المتوسط والأحمر وقناة السويس.
          </p>
        </div>

        {/* Lock Panel */}
        <div ref={paywallCardRef} className={styles.paywallCard}>
          <div className={styles.paywallGlowOrb} />

          <div style={{ marginBottom: "20px" }}>
            <img
              src="/images/icons3d/CairoGold.png"
              alt="Gold Subscription"
              loading="lazy"
              decoding="async"
              style={{ width: "130px", height: "auto", objectFit: "contain", margin: "0 auto" }}
            />
          </div>

          <h2 className={styles.paywallTitle}>
            دليل الموانئ يتطلب اشتراك في الباقة الذهبية
          </h2>

          <p className={styles.paywallDescription}>
            تصفح دليل الموانئ البحرية التجارية، اللوجستية، وموانئ الركاب وطاقتها الاستيعابية وأرصفتها متاح حصرياً لمشتركي الباقة الذهبية المميزة.
          </p>

          <div className={styles.paywallFeaturesBox}>
            <div className={styles.paywallFeaturesTitle}>
              <i className="bx bxs-award" style={{ color: "#fbbf24", fontSize: "1.2rem" }} />
              <span>ماذا ستحصل في الباقة الذهبية؟</span>
            </div>
            <ul className={styles.paywallFeaturesList}>
              <li>✨ دليل الموانئ البحرية (الإسكندرية، دمياط، السخنة، بورسعيد، سفاجا، إلخ).</li>
              <li>✨ الطاقة الاستيعابية والقدرة التشغيلية وأرصفة التداول والملاحة.</li>
              <li>✨ شبكات الربط المباشرة مع الطرق السريعة وسكك حديد مصر والقطار السريع.</li>
              <li>✨ تشمل أيضاً مواقف الميكروباص، المطارات، ومخطط الرحلات الذكي بالكامل.</li>
            </ul>
          </div>

          <div className={styles.paywallActions}>
            {user ? (
              <Link href="/profile?expand=subscription" className="btn btn-gold">
                ترقية إلى الباقة الذهبية الآن
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary">
                تسجيل الدخول لتفعيل الاشتراك
              </Link>
            )}

            <Link href="/" className="btn btn-cancel">
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
