"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ONBOARDING_SLIDES } from "../constants";
import styles from "../signup.module.css";

interface OnboardingSliderProps {
  onStartSignup: () => void;
}

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({ onStartSignup }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
