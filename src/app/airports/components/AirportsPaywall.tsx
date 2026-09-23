import React from "react";
import Link from "next/link";
import { GOLD_AIRPORT_FEATURES } from "../constants";
import styles from "../airports.module.css";

interface AirportsPaywallProps {
  user: any;
}

export default function AirportsPaywall({ user }: AirportsPaywallProps) {
  return (
    <div className={styles.paywallWrapper}>
      {/* Header Banner */}
      <div className={styles.paywallHeader}>
        <div className="metro-animate-slide-up">
          <h1 className={styles.heroTitle}>
            <img
              src="/images/icons2d/airport.png"
              alt="Airports"
              loading="lazy"
              decoding="async"
              className={styles.heroIcon}
            />
            <span>دليل المطارات المصرية</span>
          </h1>
          <p className={styles.heroSubtitle}>
            دليلك الشامل للمطارات الدولية والمحلية في مصر.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className={styles.paywallContainer}>
        {/* Back Button */}
        <div className={styles.backLinkWrap}>
          <Link href="/" className={styles.backLink}>
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Premium Lock Panel */}
        <div className={styles.paywallCard}>
          <div className={styles.paywallAmbientCircle} />

          {/* Lock Icon */}
          <div className={styles.lockIconWrap}>
            <img
              src="/images/icons3d/lockPage.png"
              alt="Lock"
              loading="lazy"
              decoding="async"
              className={styles.lockImg}
            />
          </div>

          <h2 className={styles.paywallTitle}>
            دليل المطارات ميزة تتطلب اشتراك في الباقة الذهبية
          </h2>

          <p className={styles.paywallDesc}>
            تصفح دليل المطارات المصرية والصالات والخدمات وشركات الطيران العاملة بها متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
          </p>

          {/* Features list */}
          <div className={styles.featuresBox}>
            <div className={styles.featuresTitle}>ميزات الباقة الذهبية:</div>
            <ul className={styles.featuresList}>
              {GOLD_AIRPORT_FEATURES.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Call to Actions */}
          <div className={styles.actionsCol}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className={styles.goldSubscribeBtn}
              >
                اشترك الآن في الباقة الذهبية
              </Link>
            ) : (
              <Link
                href="/login"
                className={styles.loginBtn}
              >
                سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}

            <Link href="/" className={styles.homeReturnBtn}>
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
