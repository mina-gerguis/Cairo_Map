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
    <div className="min-h-screen relative overflow-x-hidden pb-16">
      <div className="ambient-glow" />
      <div className="max-w-3xl mx-auto px-4 pt-10 relative z-10">
        {/* Paywall Header */}
        <div ref={paywallRef} className="text-center mb-7">
          <h1 className="flex items-center justify-center gap-3 font-extrabold font-sub text-3xl sm:text-4xl m-0 mb-2.5">
            <img
              src="/images/transit/arab_republic _of_egypt.png"
              alt="Cairo Directions"
              loading="lazy"
              decoding="async"
              className="w-10 h-auto object-contain"
            />
            <span className="text-gradient-title">ازاي اروح ..؟</span>
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-lg mx-auto m-0 leading-relaxed font-body">
            دليل السفر والانتقال الذكي لمختلف وسائل المواصلات والطرق المختصرة.
          </p>
        </div>

        {/* Paywall Card */}
        <div
          ref={paywallCardRef}
          className="bg-glass border border-glass rounded-2xl shadow-xl max-w-lg mx-auto text-center px-7 py-9 flex flex-col items-center overflow-hidden relative"
        >
          {/* Badge Icon */}
          <div className="mb-4">
            <img
              src="/images/icons3d/CairoSilver.png"
              alt="Silver Access"
              loading="lazy"
              decoding="async"
              className="w-28 sm:w-32 h-auto object-contain mx-auto"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-primary font-sub m-0 mb-2.5 leading-snug">
            دليل مسارات المواصلات يتطلب الاشتراك في الباقة الفضية
          </h2>

          <p className="text-sm text-secondary leading-relaxed m-0 mb-4">
            محرك البحث المتقدم عن خطوط المواصلات والطرق المختصرة (ميكروباص، أتوبيسات، مترو، ومونوريل) متاح للمشتركين في الباقة الفضية أو الذهبية أو المشوار.
          </p>

          {/* Perks list */}
          <div className="bg-subtle border border-subtle rounded-2xl p-4 text-right m-0 mb-6 w-full">
            <div className="font-extrabold text-primary text-sm mb-2.5 flex items-center gap-1.5">
              <i className="bx bxs-award text-muted" />
              <span>ما الذي يميز الباقة الفضية؟</span>
            </div>
            <ul className="list-none p-0 pr-4 m-0 text-xs sm:text-sm text-secondary leading-loose flex flex-col gap-1.5">
              <li>✨ البحث عن مسارات مواصلات بين أي منطقتين بالتفصيل</li>
              <li>✨ حساب تكلفة الرحلة والمدة المتوقعة بدقة لكل مرحلة</li>
              <li>✨ خيارات متعددة للتنقل (مباشر، مترو + ميكروباص، إلخ)</li>
              <li>✨ تشمل أيضاً دليل القطارات والمونوريل والقطار الكهربائي</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 w-full">
            {user ? (
              <Link
                href="/profile?expand=subscription"
                className="btn btn-silver w-full"
              >
                اشترك الآن في الباقة الفضية
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary w-full"
              >
                سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}

            <Link
              href="/"
              className="btn btn-cancel w-full"
            >
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
