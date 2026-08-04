"use client";

import React, { useState, useEffect } from "react";

interface AdBannerProps {
  type?: "adsense" | "sponsor" | "auto";
  slotId?: string; // Google AdSense Slot ID
}

export default function AdBanner({ type = "auto", slotId }: AdBannerProps) {
  const [adType, setAdType] = useState<"adsense" | "sponsor">(
    type === "auto" ? "sponsor" : type
  );

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

  // Demo direct sponsorship details
  const sponsorDetails = {
    title: "شاورما وصاج الشام 🌯",
    description: "خصم خاص 15% لجميع مستخدمي تطبيق 'دفتر' بمناسبة الافتتاح! اضغط لمعرفة موقع الفرع القريب منك.",
    ctaText: "اطلب الآن 🚀",
    tag: "إعلان مميز ✨",
    gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)",
    borderColor: "rgba(239, 68, 68, 0.25)",
  };

  return (
    <div
      className="glass-panel"
      style={{
        width: "100%",
        borderRadius: "16px",
        padding: "16px",
        background: adType === "sponsor" 
          ? sponsorDetails.gradient 
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        border: `1px solid ${adType === "sponsor" ? sponsorDetails.borderColor : "var(--border-glass, rgba(255, 255, 255, 0.08))"}`,
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 0.3s ease",
        marginBottom: "24px",
      }}
    >
      {/* Decorative Orbs for premium look */}
      <div 
        style={{
          position: "absolute",
          top: "-50px",
          left: "-50px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: adType === "sponsor" 
            ? "radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(108, 99, 255, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} 
      />

      {/* Header Row with Badge & Toggle for Demo/Testing */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
        <span 
          style={{
            fontSize: "0.75rem",
            fontWeight: "bold",
            padding: "4px 8px",
            borderRadius: "6px",
            background: adType === "sponsor" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
            color: adType === "sponsor" ? "#f87171" : "var(--text-muted, #94a3b8)",
            border: `1px solid ${adType === "sponsor" ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
          }}
        >
          {adType === "sponsor" ? sponsorDetails.tag : "مساحة إعلانية للتجربة 📊"}
        </span>

        {/* Small UI Switch to toggle view in testing mode */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setAdType("sponsor")}
            style={{
              padding: "4px 8px",
              fontSize: "0.7rem",
              borderRadius: "6px",
              cursor: "pointer",
              border: "none",
              background: adType === "sponsor" ? "rgba(255,255,255,0.1)" : "transparent",
              color: adType === "sponsor" ? "#fff" : "var(--text-muted, #94a3b8)",
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
              background: adType === "adsense" ? "rgba(255,255,255,0.1)" : "transparent",
              color: adType === "adsense" ? "#fff" : "var(--text-muted, #94a3b8)",
              transition: "all 0.2s",
            }}
          >
            Google AdSense
          </button>
        </div>
      </div>

      {/* Render Sponsor Ad */}
      {adType === "sponsor" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", zIndex: 1 }}>
          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>
              {sponsorDetails.title}
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", lineHeight: "1.5" }}>
              {sponsorDetails.description}
            </p>
          </div>
          <button
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
            {sponsorDetails.ctaText}
          </button>
        </div>
      )}

      {/* Render AdSense Placeholder (with instructions on how to fill it) */}
      {adType === "adsense" && (
        <div style={{ textAlign: "center", padding: "12px 0", zIndex: 1 }}>
          {/* Real Google AdSense Unit (will render when AdSense code is active and scripts are loaded) */}
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "90px" }}
            data-ad-client="ca-pub-7465662881430123"
            data-ad-slot={slotId || "YYYYYYYYYY"}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          
          {/* Visible Placeholder info for testing when AdSense is empty */}
          <div 
            style={{
              padding: "16px",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📊</div>
            <h4 style={{ margin: "0 0 4px 0", color: "#6c63ff", fontSize: "0.95rem" }}>
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
