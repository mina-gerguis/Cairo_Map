"use client";

import React, { useState, useEffect } from "react";
import VideoAdBanner from "./VideoAdBanner";

interface AdBannerProps {
  type?: "adsense" | "sponsor" | "auto";
  slotId?: string; // Google AdSense Slot ID or Custom Video Slot ID
  placement?: "places_top" | "places_middle" | "places_bottom";
}

export default function AdBanner({
  type = "auto",
  slotId,
  placement = "places_top",
}: AdBannerProps) {
  const [adType, setAdType] = useState<"adsense" | "sponsor">(
    type === "auto" ? "sponsor" : type
  );

  // Map placements to slot IDs (Slot 4 for places_top)
  const resolvedSlotId = slotId || (placement === "places_top" ? "4" : "places");

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

  if (adType === "adsense") {
    return (
      <div
        className="glass-panel"
        style={{
          width: "100%",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "24px",
          background: "var(--bg-glass-card, rgba(255, 255, 255, 0.03))",
          border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted, #94a3b8)",
            display: "block",
            marginBottom: "8px",
          }}
        >
          مساحة إعلانية
        </span>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slotId || "1234567890"}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Render Video Ad Banner (Full Rectangle Video with iOS Glass Sound Button)
  return <VideoAdBanner slotId={resolvedSlotId} />;
}
