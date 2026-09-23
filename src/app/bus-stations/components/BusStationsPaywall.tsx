import React from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import styles from "../bus-stations.module.css";

interface BusStationsPaywallProps {
  user: User | null;
}

export default function BusStationsPaywall({ user }: BusStationsPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Glow */}
      <div className={styles.ambientGlow} />

      {/* Header Banner */}
      <div className={styles.heroBanner}>
        <Link href="/" className={styles.backBtnCircle} aria-label="الرجوع للرئيسية">
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
        </Link>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/bus.png"
              alt="Cairo Bus"
              loading="lazy"
              decoding="async"
              className={styles.heroIcon}
            />
            <span>مواقف الأتوبيسات</span>
          </h1>
          <p className={styles.heroSubtitle}>
            دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى.
          </p>
        </div>
      </div>

      {/* Lock Card Container */}
      <div className={styles.contentContainer}>
        <div className={styles.paywallCard}>
          {/* 3D Lock Illustration */}
          <div className={styles.lockIconBox}>
            <img
              src="/images/icons3d/lockPage.png"
              alt="Locked"
              loading="lazy"
              decoding="async"
              className={styles.lockImg}
            />
          </div>

          <h2 className={styles.paywallTitle}>
            مواقف الأتوبيسات يتطلب اشتراك في الباقة الذهبية
          </h2>

          <p className={styles.paywallDesc}>
            تصفح دليل مواقف أتوبيسات السفر بين المدن والشركات العاملة بها والوجهات متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
          </p>

          {/* Perks list */}
          <div className={styles.perksBox}>
            <div className={styles.perksTitle}>ميزات الباقة الذهبية:</div>
            <ul className={styles.perksList}>
              <li>✨ تفاصيل مواقف الأتوبيسات الرئيسية (ألماظة، الترجمان، المنيب، عبود، إلخ)</li>
              <li>✨ دليل الشركات المتاحة (السوبر جيت، جو باص، غرب ووسط الدلتا، إلخ)</li>
              <li>✨ أرقام التليفونات والخطوط الساخنة ووجهات السفر</li>
              <li>✨ تشمل أيضاً المطارات والموانئ ومواقف الميكروباص ومخطط الرحلات بالكامل</li>
            </ul>
          </div>

          {/* Call to Actions */}
          <div className={styles.ctaGroup}>
            {user ? (
              <Link href="/profile?expand=subscription" className={styles.goldSubscribeBtn}>
                اشترك في الباقة الذهبية
              </Link>
            ) : (
              <Link href="/login" className={styles.loginCtaBtn}>
                سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}

            <Link href="/" className={styles.homeCancelBtn}>
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
