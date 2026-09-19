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
    <div className="lock-panel">
      {/* Lock Header */}
      <div
        ref={paywallRef}
        className="lock-header"
      >
        <div>
          <h1 className="lock-title">
            <img
              src="/images/icons2d/arab_republic _of_egypt.png"
              alt="Cairo Directions"
              loading="lazy"
              decoding="async"
              className="lock-header-icon"
            />
            ازاي اروح .؟
          </h1>
          <p className="lock-sub-title">
            دليل السفر والانتقال الذكي لمختلف وسائل المواصلات والطرق المختصرة.
          </p>
        </div>
      </div>

      {/* Lock Panel */}
      <div className="lock-content">
        <div
          ref={paywallCardRef}
          className="lock-card"
        >
          {/* Lock Icon */}
          <div className="lock-icon">
            <img
              src="/images/icons3d/CairoSilver.png"
              alt="Lock"
              loading="lazy"
              decoding="async"
              className="lock-icon-subscribe"
            />
          </div>

          <h2 className="lock-title-subscribe">
            دليل خطوط ومسارات المواصلات يتطلب أشتراك في الباقة الفضية
          </h2>

          <p
            className="lock-description"
          >
            محرك البحث المتقدم عن خطوط المواصلات والطرق المختصرة (ميكروباص، أتوبيسات، مترو، ومونوريل) متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية أو المشوار.
          </p>

          {/* Perks list */}
          <div
            className="lock-perks"
          >
            <div
              className="lock-perks-title"
            >
              <span>ما الذي يميز الباقة الفضية ؟</span>
            </div>
            <ul
              className="lock-perks-list"
            >
              <li>✨ البحث عن مسارات مواصلات بين أي منطقتين بالتفصيل</li>
              <li>✨ حساب تكلفة الرحلة والمدة المتوقعة بدقة لكل مرحلة</li>
              <li>✨ خيارات متعددة للتنقل (مباشر، مترو + ميكروباص، إلخ)</li>
              <li>✨ تشمل أيضاً دليل القطارات والمونوريل والقطار الكهربائي</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div
            className="lock-cta-buttons"
          >
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
