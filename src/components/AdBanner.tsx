"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronLeft, FaExternalLinkAlt } from "react-icons/fa";

interface AdBannerProps {
  type?: "adsense" | "sponsor" | "auto";
  slotId?: string; // Google AdSense Slot ID
  placement?: "places_top" | "places_middle" | "places_bottom";
}

function getAdTheme(ad: any, isLight: boolean) {
  let themeColor = "#3b82f6"; // default blue
  let tagBg = "rgba(59, 130, 246, 0.2)";
  let tagColor = isLight ? "#2563eb" : "#93c5fd";
  let badgeBg = "rgba(59, 130, 246, 0.15)";
  let badgeColor = isLight ? "#2563eb" : "#93c5fd";
  let bgGradient = ad.bgGradient || "var(--bg-glass-card)";
  let borderColor = ad.borderColor || "var(--border-glass)";

  // Support preset themes for default slides
  if (ad.id === "shawarma-sponsor") {
    themeColor = "#ef4444"; // red
    tagBg = isLight ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.25)";
    tagColor = isLight ? "#dc2626" : "#f87171";
    badgeBg = isLight ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.2)";
    badgeColor = isLight ? "#dc2626" : "#f87171";
    bgGradient = isLight 
      ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)" 
      : "linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.15) 100%)";
    borderColor = isLight ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.4)";
  } else if (ad.id === "ai-planner-promo") {
    themeColor = "#a855f7"; // purple
    tagBg = isLight ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.25)";
    tagColor = isLight ? "#7c3aed" : "#c084fc";
    badgeBg = isLight ? "rgba(168, 85, 247, 0.12)" : "rgba(168, 85, 247, 0.2)";
    badgeColor = isLight ? "#7c3aed" : "#c084fc";
    bgGradient = isLight
      ? "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)"
      : "linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(59, 130, 246, 0.15) 100%)";
    borderColor = isLight ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.4)";
  } else if (ad.id === "sponsor-business-space") {
    themeColor = "#10b981"; // green
    tagBg = isLight ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.25)";
    tagColor = isLight ? "#059669" : "#34d399";
    badgeBg = isLight ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.2)";
    badgeColor = isLight ? "#059669" : "#34d399";
    bgGradient = isLight
      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)"
      : "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.15) 100%)";
    borderColor = isLight ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.4)";
  } else if (ad.id === "metro-guide-promo") {
    themeColor = "#f59e0b"; // orange/yellow
    tagBg = isLight ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.25)";
    tagColor = isLight ? "#d97706" : "#fbbf24";
    badgeBg = isLight ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.2)";
    badgeColor = isLight ? "#d97706" : "#fbbf24";
    bgGradient = isLight
      ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%)"
      : "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.15) 100%)";
    borderColor = isLight ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.4)";
  } else {
    if (ad.tagBg) tagBg = ad.tagBg;
    if (ad.tagColor) tagColor = ad.tagColor;
    if (ad.bgGradient) bgGradient = ad.bgGradient;
    if (ad.borderColor) borderColor = ad.borderColor;
  }

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

export default function AdBanner({ type = "auto", slotId, placement = "places_top" }: AdBannerProps) {
  const [adType, setAdType] = useState<"adsense" | "sponsor">(
    type === "auto" ? "sponsor" : type
  );
  const [isLight, setIsLight] = useState(false);
  const [activeAd, setActiveAd] = useState<any>(null);

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

  // ── Load custom ad from storage ──
  useEffect(() => {
    const loadAd = () => {
      try {
        const stored = localStorage.getItem("cairo_map_ad_slides");
        if (stored) {
          const parsed = JSON.parse(stored);
          const match = parsed.find(
            (s: any) => s.isActive !== false && s.placement === placement
          );
          if (match) {
            setActiveAd(match);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load ads for AdBanner:", e);
      }
      setActiveAd(null);
    };

    loadAd();
    
    window.addEventListener("ad_slides_updated", loadAd);
    window.addEventListener("storage", loadAd);
    return () => {
      window.removeEventListener("ad_slides_updated", loadAd);
      window.removeEventListener("storage", loadAd);
    };
  }, [placement]);

  useEffect(() => {
    // If it's AdSense, try to load adsbygoogle
    if (adType === "adsense") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.warn("AdSense script not loaded yet or failed to initialize:", err);
      }
    }
  }, [adType]);

  // Demo Fallback sponsors based on placement
  const getFallbackAd = () => {
    if (placement === "places_middle") {
      return {
        id: "sponsor-business-space",
        title: "صاحب مطعم، كافيه، أو نشاط تجاري؟ 🏢",
        description: "أضف مكانك مجاناً على خريطة القاهرة ليصل لملايين الزوار شهرياً، أو احصل على رعاية مميزة لإعلانك في أعلى دليل الأماكن.",
        ctaText: "أضف مكانك الآن 📍",
        ctaLink: "/propose-place",
        tag: "مساحة رعاية 📢",
        icon: "🏢",
        bgGradient: isLight
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)"
          : "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
        borderColor: isLight ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.25)",
        themeColor: "#10b981"
      };
    } else if (placement === "places_bottom") {
      return {
        id: "metro-guide-promo",
        title: "خريطة خطوط المترو والمنورايل والقطارات 🚇",
        description: "اعثر على أقصر طريق للوصول بين أي محطتين مع أسعار التذاكر المحسوبة والمحطات الانتقالية الحية والدقيقة.",
        ctaText: "استكشف خريطة المترو 🗺️",
        ctaLink: "/metro",
        tag: "دليل المواصلات 🚇",
        icon: "🚆",
        bgGradient: isLight
          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%)"
          : "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)",
        borderColor: isLight ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.25)",
        themeColor: "#f59e0b"
      };
    } else {
      // Default / places_top
      return {
        id: "shawarma-sponsor",
        title: "شاورما وصاج الشام 🌯",
        description: "خصم خاص 15% لجميع مستخدمي تطبيق 'ماب القاهرة' بمناسبة الافتتاح! اضغط لمعرفة موقع الفرع القريب منك.",
        ctaText: "اطلب الآن 🚀",
        ctaLink: "/places",
        tag: "إعلان مميز ✨",
        icon: "🌯",
        bgGradient: isLight
          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)"
          : "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)",
        borderColor: isLight ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.25)",
        themeColor: "#ef4444"
      };
    }
  };

  const adData = activeAd || getFallbackAd();
  const adTheme = getAdTheme(adData, isLight);
  const isImageOnly = Boolean(adData.isImageOnly && adData.image);

  // ── Render Image Only Mode ──
  if (adType === "sponsor" && isImageOnly) {
    return (
      <div
        className="glass-panel"
        style={{
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${adTheme.borderColor}`,
          boxShadow: isLight ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          position: "relative",
          transition: "all 0.3s ease",
          marginBottom: "24px",
          display: "block"
        }}
      >
        {adData.isExternal ? (
          <a
            href={adData.ctaLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", textDecoration: "none", overflow: "hidden" }}
          >
            <img
              src={adData.image}
              alt={adData.title || "إعلان"}
              style={{
                width: "100%",
                minHeight: "110px",
                maxHeight: "220px",
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
            href={adData.ctaLink || "/"}
            style={{ display: "block", textDecoration: "none", overflow: "hidden" }}
          >
            <img
              src={adData.image}
              alt={adData.title || "إعلان"}
              style={{
                width: "100%",
                minHeight: "110px",
                maxHeight: "220px",
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
      </div>
    );
  }

  // ── Render Standard text/gradient/background image mode ──
  return (
    <div
      className="glass-panel"
      style={{
        width: "100%",
        borderRadius: "16px",
        padding: "16px",
        background: adType === "sponsor" 
          ? (adData.image ? "var(--bg-primary, #0f172a)" : adTheme.bgGradient)
          : "var(--bg-glass-card, rgba(255, 255, 255, 0.03))",
        border: `1px solid ${adType === "sponsor" ? adTheme.borderColor : "var(--border-glass, rgba(255, 255, 255, 0.08))"}`,
        boxShadow: isLight ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 0.3s ease",
        marginBottom: "24px",
      }}
    >
      {/* Decorative Orbs */}
      {!adData.image && (
        <div 
          style={{
            position: "absolute",
            top: "-50px",
            left: "-50px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: adType === "sponsor" 
              ? `radial-gradient(circle, ${adTheme.themeColor}15 0%, transparent 70%)`
              : (isLight ? "radial-gradient(circle, rgba(108, 99, 255, 0.04) 0%, transparent 70%)" : "radial-gradient(circle, rgba(108, 99, 255, 0.08) 0%, transparent 70%)"),
            pointerEvents: "none",
            zIndex: 1
          }} 
        />
      )}

      {/* Background Image if present */}
      {adType === "sponsor" && adData.image && (
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src={adData.image}
            alt={adData.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.45)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.6) 100%)" }} />
        </div>
      )}

      {/* Header Row with Badge & Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span 
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              padding: "4px 8px",
              borderRadius: "6px",
              background: adType === "sponsor" ? adTheme.tagBg : "var(--bg-glass-active, rgba(255, 255, 255, 0.08))",
              color: adType === "sponsor" ? adTheme.tagColor : "var(--text-muted, #94a3b8)",
              border: `1px solid ${adType === "sponsor" ? adTheme.borderColor : "var(--border-glass, rgba(255, 255, 255, 0.1)"}`,
            }}
          >
            {adType === "sponsor" ? adData.tag : "مساحة إعلانية تجريبية 📊"}
          </span>
          {adType === "sponsor" && adData.badge && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: "800",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "linear-gradient(90deg, #ef4444, #f59e0b)",
                color: "#fff",
              }}
            >
              {adData.badge}
            </span>
          )}
        </div>

        {/* Small UI Switch to toggle view */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setAdType("sponsor")}
            style={{
              padding: "4px 8px",
              fontSize: "0.7rem",
              borderRadius: "6px",
              cursor: "pointer",
              border: "none",
              background: adType === "sponsor" ? "var(--bg-glass-active, rgba(255,255,255,0.1))" : "transparent",
              color: adType === "sponsor" ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
              transition: "all 0.2s",
            }}
          >
            راعي مباشر
          </button>
          <button
            onClick={() => setAdType("adsense")}
            style={{
              padding: "4px 8px",
              fontSize: "0.7rem",
              borderRadius: "6px",
              cursor: "pointer",
              border: "none",
              background: adType === "adsense" ? "var(--bg-glass-active, rgba(255,255,255,0.1))" : "transparent",
              color: adType === "adsense" ? "var(--text-primary, #fff)" : "var(--text-muted, #94a3b8)",
              transition: "all 0.2s",
            }}
          >
            Google AdSense
          </button>
        </div>
      </div>

      {/* Render Sponsor Ad */}
      {adType === "sponsor" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", zIndex: 2 }}>
          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary, #fff)", display: "flex", alignItems: "center", gap: "6px" }}>
              {adData.icon && <span>{adData.icon}</span>}
              <span>{adData.title}</span>
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", lineHeight: "1.5" }}>
              {adData.description}
            </p>
          </div>
          {adData.isExternal ? (
            <a
              href={adData.ctaLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                background: "linear-gradient(90deg, #ef4444, #f59e0b)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "transform 0.2s, boxShadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.25)";
              }}
            >
              <span>{adData.ctaText || "اضغط للتفاصيل"}</span>
              <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
            </a>
          ) : (
            <Link
              href={adData.ctaLink || "/"}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(90deg, #ef4444, #f59e0b)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "transform 0.2s, boxShadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.25)";
              }}
            >
              <span>{adData.ctaText || "عرض التفاصيل"}</span>
              <FaChevronLeft style={{ fontSize: "0.7rem" }} />
            </Link>
          )}
        </div>
      )}

      {/* Render AdSense Placeholder */}
      {adType === "adsense" && (
        <div style={{ textAlign: "center", padding: "12px 0", zIndex: 2 }}>
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "90px" }}
            data-ad-client="ca-pub-7465662881430123"
            data-ad-slot={slotId || "YYYYYYYYYY"}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          
          <div 
            style={{
              padding: "16px",
              border: "1px dashed var(--border-glass-bright, rgba(255, 255, 255, 0.15))",
              borderRadius: "12px",
              background: "var(--bg-glass-hover, rgba(0, 0, 0, 0.15))",
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📊</div>
            <h4 style={{ margin: "0 0 4px 0", color: "var(--accent-primary, #6c63ff)", fontSize: "0.95rem" }}>
              وحدة إعلانات Google AdSense نشطة
            </h4>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted, #64748b)" }}>
              عند الموافقة على حسابك وتفعيل الإعلانات، سيظهر الإعلان الفعلي هنا تلقائياً بدلاً من هذا المربع التجريبي.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
