"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FaChevronLeft,
  FaPause,
  FaPlay,
  FaExternalLinkAlt
} from "react-icons/fa";

export interface AdSlide {
  id: string;
  tag: string;
  tagBg?: string;
  tagColor?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  isExternal?: boolean;
  bgGradient?: string;
  borderColor?: string;
  glowColor?: string;
  icon?: string;
  badge?: string;
  image?: string; // Optional Background/Full Banner Image (URL or Base64)
  isImageOnly?: boolean; // If true, renders image only with whole banner clickable
  isActive?: boolean;
  placement?: "home_slider" | "places_top" | "places_middle" | "places_bottom";
}

export const DEFAULT_SLIDES: AdSlide[] = [
  {
    id: "shawarma-sponsor",
    tag: "إعلان مميز ✨",
    tagBg: "rgba(239, 68, 68, 0.25)",
    tagColor: "#f87171",
    title: "شاورما وصاج الشام 🌯",
    description: "خصم خاص 20% لجميع زوار موقع 'ماب القاهرة' بمناسبة تفعيل خدمة الدليل السريع! اضغط لمعرفة موقع الفرع والفرع الأقرب لك.",
    ctaText: "استفد بالخصم واحصل على الاتجاهات 🚀",
    ctaLink: "/places",
    badge: "خصم 20%",
    bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.15) 100%)",
    borderColor: "rgba(239, 68, 68, 0.4)",
    glowColor: "rgba(239, 68, 68, 0.25)",
    icon: "🌯",
    isActive: true,
  },
  {
    id: "ai-planner-promo",
    tag: "جديد المنظومة 🤖",
    tagBg: "rgba(168, 85, 247, 0.25)",
    tagColor: "#c084fc",
    title: "مخطط الرحلات الذكي بالذكاء الاصطناعي",
    description: "محتار تخرج فين النهاردة؟ حدد ميزانيتك، نوع الفسحة (شباب، عائلات، رومانسية)، والمنطقة وسيقوم الذكاء الاصطناعي بتنظيم يومك بالكامل!",
    ctaText: "خطط خروجتك الآن مجاناً ✨",
    ctaLink: "/ai-planner",
    badge: "تخصيص 100%",
    bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(59, 130, 246, 0.15) 100%)",
    borderColor: "rgba(168, 85, 247, 0.4)",
    glowColor: "rgba(168, 85, 247, 0.25)",
    icon: "⚡",
    isActive: true,
  },
  {
    id: "sponsor-business-space",
    tag: "مساحة إعلانية 📢",
    tagBg: "rgba(16, 185, 129, 0.25)",
    tagColor: "#34d399",
    title: "صاحب مطعم، كافيه، أو نشاط تجاري؟",
    description: "أضف مكانك مجاناً على خريطة القاهرة ليصل لملايين الزوار شهرياً، أو أحصل على رعاية مميزة لإعلانك في أعلى الصفحة الرئيسية.",
    ctaText: "أضف مكانك على الخريطة مجاناً 📍",
    ctaLink: "/propose-place",
    badge: "إضافة مجانية",
    bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.15) 100%)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    glowColor: "rgba(16, 185, 129, 0.25)",
    icon: "🏢",
    isActive: true,
  },
  {
    id: "metro-guide-promo",
    tag: "دليل المواصلات 🚇",
    tagBg: "rgba(245, 158, 11, 0.25)",
    tagColor: "#fbbf24",
    title: "خريطة خطوط المترو والمنورايل والقطارات",
    description: "اعثر على أقصر طريق للوصول بين أي محطتين في القاهرة والجيزة مع أسعار التذاكر المحسوبة والمحطات الانتقالية الحية.",
    ctaText: "استكشف خريطة المترو التفاعلية 🗺️",
    ctaLink: "/metro",
    badge: "مواعيد حية",
    bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.15) 100%)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    glowColor: "rgba(245, 158, 11, 0.25)",
    icon: "🚆",
    isActive: true,
  },
];

interface AdSliderProps {
  slides?: AdSlide[];
  autoPlayInterval?: number;
}

function getSlideTheme(slide: AdSlide, isLight: boolean) {
  let themeColor = slide.tagColor || "#3b82f6";
  let tagBg = slide.tagBg || "rgba(59, 130, 246, 0.2)";
  let tagColor = slide.tagColor || (isLight ? "#2563eb" : "#93c5fd");
  let badgeBg = slide.tagBg || "rgba(59, 130, 246, 0.15)";
  let badgeColor = slide.tagColor || (isLight ? "#2563eb" : "#93c5fd");
  let bgGradient = slide.bgGradient || "var(--bgGlass-card)";
  let borderColor = slide.borderColor || "var(--borderGlass)";

  if (slide.tagBg) tagBg = slide.tagBg;
  if (slide.tagColor) {
    tagColor = slide.tagColor;
    themeColor = slide.tagColor;
    badgeColor = slide.tagColor;
  }
  if (slide.bgGradient) bgGradient = slide.bgGradient;
  if (slide.borderColor) borderColor = slide.borderColor;

  return {
    themeColor,
    tagBg,
    tagColor,
    badgeBg,
    badgeColor,
    bgGradient,
    borderColor
  };
}

export default function AdSlider({
  slides: initialSlides,
  autoPlayInterval = 5000,
}: AdSliderProps) {
  const [activeSlides, setActiveSlides] = useState<AdSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLight, setIsLight] = useState(false);

  // ── Theme Observer: detect light/dark theme ──
  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ── Responsive: detect mobile screen (≤640px) ──
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handleChange(mql); // set initial value
    mql.addEventListener("change", handleChange as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener("change", handleChange as (e: MediaQueryListEvent) => void);
  }, []);

  // Load active slides (from props, localStorage or defaults)
  const loadSlides = useCallback(() => {
    if (initialSlides && initialSlides.length > 0) {
      setActiveSlides(initialSlides.filter(s => s.isActive !== false && (!s.placement || s.placement === "home_slider")));
      return;
    }

    try {
      const stored = localStorage.getItem("cairo_map_ad_slides");
      if (stored) {
        const parsed: AdSlide[] = JSON.parse(stored);
        const filtered = parsed.filter((s) => s.isActive !== false && (!s.placement || s.placement === "home_slider"));
        if (filtered.length > 0) {
          setActiveSlides(filtered);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load ad slides from localStorage:", e);
    }

    // Default Fallback
    setActiveSlides(DEFAULT_SLIDES);
  }, [initialSlides]);

  useEffect(() => {
    loadSlides();

    const handleUpdate = () => loadSlides();
    window.addEventListener("ad_slides_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ad_slides_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadSlides]);

  // Touch Swipe Refs
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = activeSlides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Timer Effect
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const stepMs = 50;
    const progressIncrement = (stepMs / autoPlayInterval) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextSlide, totalSlides]);

  // Adjust current index if totalSlides changes
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [totalSlides, currentIndex]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPaused(false);
  };

  if (!activeSlides || totalSlides === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const isPureImageOnly = Boolean(currentSlide.isImageOnly && currentSlide.image);
  const currentSlideTheme = getSlideTheme(currentSlide, isLight);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: "1100px",
        margin: isMobile ? "0 auto 20px auto" : "0 auto 32px auto",
        padding: isMobile ? "0 8px" : "0 16px",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          borderRadius: isMobile ? "8px" : "8px",
          overflow: "hidden",
          background: currentSlide.image
            ? "var(--bgPrimary, #0f172a)"
            : (currentSlideTheme.bgGradient || "var(--bgGlass-card, rgba(15, 23, 42, 0.6))"),
          border: `1px solid ${currentSlideTheme.borderColor || "var(--borderGlass, rgba(255, 255, 255, 0.08))"}`,
          boxShadow: isLight ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          transition: "all 0.4s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Thin Progress Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: currentSlideTheme.themeColor,
              transition: isPaused ? "none" : "width 0.05s linear",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>

        {/* ── MODE A: IMAGE ONLY ── */}
        {isPureImageOnly ? (
          <div style={{ position: "relative", width: "100%", flex: 1, zIndex: 2 }}>
            {currentSlide.isExternal ? (
              <a
                href={currentSlide.ctaLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none", overflow: "hidden" }}
              >
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title || "إعلان"}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    minHeight: isMobile ? "140px" : "200px",
                    maxHeight: isMobile ? "220px" : "340px",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.01)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              </a>
            ) : (
              <Link
                href={currentSlide.ctaLink || "/"}
                style={{ display: "block", textDecoration: "none", overflow: "hidden" }}
              >
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title || "إعلان"}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    minHeight: isMobile ? "140px" : "200px",
                    maxHeight: isMobile ? "220px" : "340px",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.01)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              </Link>
            )}

            {/* Slide counter overlay */}
            <div
              style={{
                position: "absolute",
                top: isMobile ? "8px" : "12px",
                left: isMobile ? "8px" : "12px",
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(6px)",
                padding: isMobile ? "3px 8px" : "4px 10px",
                borderRadius: "8px",
                fontSize: isMobile ? "0.65rem" : "0.72rem",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPaused(!isPaused); }}
                style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", padding: "1px", fontSize: "0.65rem" }}
              >
                {isPaused ? <FaPlay /> : <FaPause />}
              </button>
              <span>{currentIndex + 1}/{totalSlides}</span>
            </div>
          </div>
        ) : (
          /* ── MODE B: TEXT SLIDE ── */
          <>
            {/* Background image if present */}
            {currentSlide.image && (
              <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: isLight ? "brightness(0.9)" : "brightness(0.6)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isLight
                      ? "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.88) 60%, rgba(255,255,255,0.55) 100%)"
                      : "linear-gradient(90deg, rgba(8,12,22,0.96) 0%, rgba(15,23,42,0.88) 60%, rgba(8,12,22,0.55) 100%)",
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: isMobile ? "14px 14px 12px 14px" : "22px 26px 18px 26px",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "10px" : "14px",
              }}
            >
              {/* Top row: tag + badge */}
              {(currentSlide.tag || currentSlide.badge) && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: isMobile ? "6px" : "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "8px", flexWrap: "wrap" }}>
                    {currentSlide.badge && (
                      <span
                        style={{
                          fontSize: isMobile ? "0.65rem" : "0.72rem",
                          fontWeight: "700",
                          padding: isMobile ? "2px 7px" : "3px 10px",
                          borderRadius: "6px",
                          backgroundColor: "#aaaaaa3f",
                          color: "var(--textPrimary)",
                          backdropFilter: "blur(6px)",
                          border: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255, 255, 255, 0.05)"}`,
                        }}
                      >
                        {currentSlide.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Title + Description + CTA */}
              <div style={{
                display: "flex",
                alignItems: isMobile ? "stretch" : "center",
                justifyContent: "center",
                gap: isMobile ? "12px" : "20px",
                flexDirection: "column",
                flexWrap: isMobile ? "nowrap" : "wrap",
              }}>
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      margin: isMobile ? "0 0 4px 0" : "0 0 6px 0",
                      fontSize: isMobile ? "0.95rem" : "clamp(1.05rem, 2.2vw, 1.3rem)",
                      fontWeight: "700",
                      color: "var(--textPrimary)",
                      lineHeight: "1.4",
                      textShadow: currentSlide.image ? (isLight ? "0 1px 2px rgba(255,255,255,0.9)" : "0 2px 4px rgba(0,0,0,0.8)") : "none",
                    }}
                  >
                    {currentSlide.icon && <span style={{ marginLeft: "5px" }}>{currentSlide.icon}</span>}
                    {currentSlide.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "0.78rem" : "clamp(0.82rem, 1.6vw, 0.92rem)",
                      color: "var(--text-muted)",
                      lineHeight: isMobile ? "1.5" : "1.6",
                      maxWidth: "700px",
                      fontWeight: "600",
                      textShadow: currentSlide.image ? (isLight ? "0 1px 2px rgba(255,255,255,0.9)" : "0 2px 4px rgba(0,0,0,0.8)") : "none",
                    }}
                  >
                    {currentSlide.description}
                  </p>
                </div>

                <div style={{ flexShrink: 0, alignSelf: isMobile ? "stretch" : "auto" }}>
                  {currentSlide.isExternal ? (
                    <a
                      href={currentSlide.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: isMobile ? "9px 14px" : "10px 20px",
                        borderRadius: "10px",
                        backgroundColor: "var(--colorPrimary, #006fee)",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        textDecoration: "none",
                        transition: "opacity 0.2s ease",
                        width: isMobile ? "100%" : "auto",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      <span>{currentSlide.ctaText}</span>
                      <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                    </a>
                  ) : (
                    <Link
                      href={currentSlide.ctaLink || "/"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding:"var(--paddingBtn)",
                        borderRadius: "var(--radiusBtn)",
                        backgroundColor: "var(--colorPrimary)",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        textDecoration: "none",
                        transition: "opacity 0.2s ease",
                        width: isMobile ? "100%" : "auto",
                        textAlign: "center",
                        fontFamily:"var(--font-sub)"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      <span>{currentSlide.ctaText}</span>
                      <FaChevronLeft style={{ fontSize: "0.7rem" }} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Centered Dot Indicators */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? "8px 0 10px 0" : "10px 0 12px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255, 255, 255, 0.05)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "8px" }}>
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                title={`انتقال للسلايد رقم ${idx + 1}`}
                style={{
                  width: idx === currentIndex ? (isMobile ? "20px" : "24px") : (isMobile ? "7px" : "8px"),
                  height: isMobile ? "7px" : "8px",
                  borderRadius: "999px",
                  backgroundColor:
                    idx === currentIndex
                      ? currentSlideTheme.themeColor
                      : (isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.2)"),
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


