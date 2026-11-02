"use client";

import React from "react";
import VideoAdBanner, {
  VideoAdSlot,
  DEFAULT_VIDEO_ADS,
} from "./VideoAdBanner";

// Backward-compatible type definitions
export type AdSlide = VideoAdSlot & {
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
  bgGradient?: string;
  borderColor?: string;
  glowColor?: string;
  icon?: string;
  image?: string;
  isImageOnly?: boolean;
  placement?: "home" | "places" | "custom" | "home_slider" | "places_top" | "places_middle" | "places_bottom" | string;
};

export const DEFAULT_SLIDES: AdSlide[] = DEFAULT_VIDEO_ADS.map((ad) => ({
  ...ad,
  tag: "إعلان فيديو 🎬",
  description: "",
  ctaText: "مشاهدة الآن",
  ctaLink: ad.targetUrl,
  placement: ad.id === "1" ? ("home" as const) : ("places" as const),
}));

interface AdSliderProps {
  slotId?: string;
  slides?: AdSlide[];
  autoPlayInterval?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AdSlider: Now refactored to render a single, high-performance video ad banner
 * without slideshow rotation. Autoplays muted with iOS glass sound toggle button.
 */
export default function AdSlider({
  slotId = "1",
  className,
  style,
}: AdSliderProps) {
  return <VideoAdBanner slotId={slotId} className={className} style={style} />;
}
