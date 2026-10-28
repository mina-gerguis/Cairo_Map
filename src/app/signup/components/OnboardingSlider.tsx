"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ONBOARDING_SLIDES } from "../constants";
import styles from "../signup.module.css";

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </svg>
);

interface OnboardingSliderProps {
  onStartSignup: () => void;
}

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({ onStartSignup }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (!supabase) return;
    try {
      setGoogleLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (e) {
      console.error("Google sign in error:", e);
      setGoogleLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    if (!supabase) return;
    try {
      setFacebookLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "email,public_profile",
        },
      });
    } catch (e) {
      console.error("Facebook sign in error:", e);
      setFacebookLoading(false);
    }
  };

  useEffect(() => {
    if (currentSlide === ONBOARDING_SLIDES.length - 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className={styles.onboardingWrapper}>
      {/* Background Images Crossfade */}
      {ONBOARDING_SLIDES.map((slide, idx) => (
        <img
          key={idx}
          src={`/${slide.imageUrl}`}
          alt={slide.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: currentSlide === idx ? 1 : 0,
            transform: currentSlide === idx ? "scale(1)" : "scale(1.05)",
            transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
            zIndex: 0,
          }}
        />
      ))}

      {/* Gradient Overlay */}
      <div className={styles.slideOverlay} />

      {/* Content Overlaid on Bottom Half */}
      <div className={styles.slideContent}>
        {/* Title & Description */}
        <div style={{ minHeight: "5px", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "16px", width: "100%" }}>
          <h2 className={styles.slideTitle}>
            {ONBOARDING_SLIDES[currentSlide].title}
          </h2>
          <p className={styles.slideDesc}>
            {ONBOARDING_SLIDES[currentSlide].desc}
          </p>
        </div>

        {/* Dots Indicators */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              aria-label={`الشريحة ${i + 1}`}
              className={styles.sliderDotBtn}
              style={{
                width: currentSlide === i ? "24px" : "8px",
                background: currentSlide === i ? "#ffffff" : "rgba(255, 255, 255, 0.35)",
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          {currentSlide < ONBOARDING_SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => prev + 1)}
              className={styles.actionBtnWhite}
            >
              التالي <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }}></i>
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <button
                type="button"
                onClick={onStartSignup}
                className={styles.actionBtnWhite}
              >
                <i className="bx bx-user-plus" style={{ fontSize: "1.2rem" }}></i> إنشاء حساب جديد
              </button>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || facebookLoading}
                className={styles.actionBtnGoogle}
              >
                <GoogleIcon /> {googleLoading ? "جاري التحويل إلى Google..." : "متابعة باستخدام Google"}
              </button>

              <button
                type="button"
                onClick={handleFacebookAuth}
                disabled={googleLoading || facebookLoading}
                className={styles.actionBtnFacebook}
              >
                <FacebookIcon /> {facebookLoading ? "جاري التحويل إلى Facebook..." : "متابعة باستخدام Facebook"}
              </button>

              <Link
                href="/login"
                className={styles.actionBtnOutline}
              >
                <i className="bx bx-log-in" style={{ fontSize: "1.2rem" }}></i> لدي حساب بالفعل
              </Link>
            </div>
          )}

          <Link href="/" className={styles.guestLink}>
            <i className="bx bx-walk" style={{ fontSize: "1.1rem" }}></i>{" "}
            <span style={{ textDecoration: "underline" }}>دخول كزائر</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
