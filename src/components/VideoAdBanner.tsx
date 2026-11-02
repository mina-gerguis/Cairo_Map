"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export interface VideoAdSlot {
  id: string; // e.g. "[ heroTop#1 ]", "[ homeMid#2 ]", etc.
  title: string; // Admin reference name
  videoUrl: string; // URL to MP4, GIF, or YouTube
  targetUrl: string; // Target page inside or outside website
  placement?: string; // Optional legacy placement
  slots?: string[]; // Array of assigned slot IDs e.g. ["[ heroTop#1 ]", "[ placesTop#4 ]"] or ["all"]
  isExternal?: boolean; // Open in new tab
  isActive: boolean; // Active toggle
}

export const STORAGE_KEY_VIDEO_ADS = "cairo_map_video_ads";
export const EVENT_VIDEO_ADS_UPDATED = "cairo_map_video_ads_updated";

// ── CANONICAL 7 AD SLOTS DEFINITIONS ──
export const ALL_DEFINED_SLOTS = [
  { id: "[ heroTop#1 ]", label: "الرئيسية 1 - الموضع العلوي (Hero)", shortName: "heroTop#1", page: "home", num: "1" },
  { id: "[ homeMid#2 ]", label: "الرئيسية 2 - الموضع الأوسط (بين الأقسام)", shortName: "homeMid#2", page: "home", num: "2" },
  { id: "[ homeBottom#3 ]", label: "الرئيسية 3 - الموضع السفلي (قبل الفوتر)", shortName: "homeBottom#3", page: "home", num: "3" },
  { id: "[ placesTop#4 ]", label: "الأماكن 1 - أعلى الصفحة (قبل الفلاتر)", shortName: "placesTop#4", page: "places", num: "4" },
  { id: "[ placesFilter#5 ]", label: "الأماكن 2 - بعد الفلاتر (قبل الأماكن)", shortName: "placesFilter#5", page: "places", num: "5" },
  { id: "[ placesMiddle#6 ]", label: "الأماكن 3 - منتصف الأقسام (بين الأماكن)", shortName: "placesMiddle#6", page: "places", num: "6" },
  { id: "[ placesBottom#7 ]", label: "الأماكن 4 - أسفل الصفحة (قبل الفوتر)", shortName: "placesBottom#7", page: "places", num: "7" },
] as const;

export const DEFAULT_VIDEO_ADS: VideoAdSlot[] = [
  // ── HOME TOP AD (Slot 1) ──
  {
    id: "[ heroTop#1 ]",
    title: "الرئيسية 1 - الموضع العلوي (Hero)",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    targetUrl: "/places",
    slots: ["[ heroTop#1 ]"],
    isExternal: false,
    isActive: true,
  },
  // ── PLACES TOP AD (Slot 4) ──
  {
    id: "[ placesTop#4 ]",
    title: "الأماكن 1 - أعلى الصفحة (قبل الفلاتر)",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    targetUrl: "/propose-place",
    slots: ["[ placesTop#4 ]"],
    isExternal: false,
    isActive: true,
  },
];

interface VideoAdBannerProps {
  slotId?: string; // e.g. "[ heroTop#1 ]", "[ homeMid#2 ]", "[ placesTop#4 ]", etc.
  className?: string;
  style?: React.CSSProperties;
  customAd?: VideoAdSlot; // For admin live preview
}

/**
 * Normalizes any slot string format (e.g. "[ heroTop#1 ]", "heroTop#1", "1", "home_1")
 * into a canonical lowercase identifier.
 */
export function normalizeSlotId(slotId?: string): string {
  if (!slotId) return "";
  const clean = slotId.replace(/[\[\]]/g, "").trim().toLowerCase();

  // If already contains #, normalize around it
  if (clean.includes("#")) {
    const [name, num] = clean.split("#");
    return `${name.trim()}#${num.trim()}`;
  }

  // Number or alias maps
  if (clean === "1" || clean === "home_1" || clean === "home_top" || clean === "herotop") return "herotop#1";
  if (clean === "2" || clean === "home_2" || clean === "home_mid" || clean === "homemiddle") return "homemid#2";
  if (clean === "3" || clean === "home_3" || clean === "home_bottom") return "homebottom#3";
  if (clean === "4" || clean === "places_1" || clean === "places_top" || clean === "places") return "placestop#4";
  if (clean === "5" || clean === "places_2" || clean === "places_filter") return "placesfilter#5";
  if (clean === "6" || clean === "places_3" || clean === "places_middle") return "placesmiddle#6";
  if (clean === "7" || clean === "places_4" || clean === "places_bottom") return "placesbottom#7";

  return clean;
}

/**
 * Check if the URL points to a GIF file or image
 */
function isGifUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".gif") || cleanUrl.includes("format=gif");
}

/**
 * Extract YouTube embed URL if the video URL is from YouTube.
 * Keeps URL static with enablejsapi=1 so mute/unmute is handled via postMessage
 * without destroying or restarting the iframe!
 */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  }
  return null;
}

export default function VideoAdBanner({
  slotId = "[ heroTop#1 ]",
  className,
  style,
  customAd,
}: VideoAdBannerProps) {
  const [ad, setAd] = useState<VideoAdSlot | null>(customAd || null);
  const [isReady, setIsReady] = useState(Boolean(customAd));
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isSoundPressed, setIsSoundPressed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Load ad data from storage and check slot assignment / synchronization
  const loadAd = useCallback(() => {
    if (customAd) {
      setAd(customAd.isActive && customAd.videoUrl?.trim() ? customAd : null);
      setHasError(false);
      setIsReady(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_VIDEO_ADS);
      let list: VideoAdSlot[] = DEFAULT_VIDEO_ADS;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch {}
      }

      const targetNorm = normalizeSlotId(slotId);

      // Find matching active ad for this specific slot or synchronized "all"
      const matched = list.find((item) => {
        if (item.isActive === false || !item.videoUrl?.trim()) return false;

        // 1. Check if synchronized to ALL spaces
        if (item.slots?.includes("all") || item.slots?.includes("ALL")) {
          return true;
        }

        // 2. Check if this slot is selected in the ad's synchronized slots array
        if (Array.isArray(item.slots) && item.slots.some((s) => normalizeSlotId(s) === targetNorm)) {
          return true;
        }

        // 3. Check direct ID match
        if (normalizeSlotId(item.id) === targetNorm) {
          return true;
        }

        // 4. Check placement alias
        if (item.placement && normalizeSlotId(item.placement) === targetNorm) {
          return true;
        }

        return false;
      });

      if (matched) {
        setAd(matched);
        setHasError(false);
      } else {
        // NO ad exists or inactive: Collapse completely (0px space)!
        setAd(null);
      }
    } catch (e) {
      setAd(null);
    } finally {
      setIsReady(true);
    }
  }, [slotId, customAd]);

  useEffect(() => {
    loadAd();

    const handleUpdate = () => loadAd();
    window.addEventListener(EVENT_VIDEO_ADS_UPDATED, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(EVENT_VIDEO_ADS_UPDATED, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadAd]);

  // Performance Optimization: Intersection Observer
  // Only play the video when it is scrolled near the viewport!
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { rootMargin: "250px 0px" } // Preload 250px before entering view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ad]);

  const isGif = ad?.videoUrl ? isGifUrl(ad.videoUrl) : false;
  const ytEmbedUrl = ad?.videoUrl ? getYouTubeEmbedUrl(ad.videoUrl) : null;

  // Initial video setup: start muted for autoplay compliance without triggering resets later
  useEffect(() => {
    if (videoRef.current && !isGif && !ytEmbedUrl) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, [ad?.videoUrl, isGif, ytEmbedUrl]);

  // Handle play/pause with visibility (independent of isMuted so sound toggle doesn't restart video!)
  useEffect(() => {
    if (!videoRef.current || isGif || ytEmbedUrl) return;

    if (isInView) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isInView, isGif, ytEmbedUrl, ad?.videoUrl]);

  // ── Seamless Sound toggle handler: Continues video smoothly without restarting ──
  const handleToggleSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    // 1. HTML5 Video: Directly set the muted property on the element
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }

    // 2. YouTube Iframe: Send command via postMessage without reloading the iframe
    if (iframeRef.current?.contentWindow) {
      const func = nextMuted ? "mute" : "unMute";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func }),
        "*"
      );
    }
  };

  // ── KEY REQUIREMENT: If there is no ad, completely collapse and take 0 space! ──
  if (!isReady || !ad || !ad.videoUrl?.trim() || hasError) {
    return null;
  }

  const targetUrl = ad.targetUrl?.trim() || "#";
  const isExternal =
    Boolean(ad.isExternal) ||
    targetUrl.startsWith("http://") ||
    targetUrl.startsWith("https://");

  const mediaContent = (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "inherit",
        maxHeight: "inherit",
        overflow: "hidden",
      }}
    >
      {/* YouTube Embed */}
      {ytEmbedUrl ? (
        <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
          <iframe
            ref={iframeRef}
            src={ytEmbedUrl}
            title={ad.title || "Video Ad"}
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : isGif ? (
        /* GIF Image */
        <img
          src={ad.videoUrl}
          alt={ad.title || "إعلان"}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            transition: "transform 0.4s cubic-bezier(0.2, 0, 0, 1), filter 0.4s ease",
            transform: isHovered ? "scale(1.01)" : "scale(1)",
            filter: isHovered ? "brightness(1.02)" : "brightness(1)",
          }}
        />
      ) : (
        /* HTML5 Video (MP4 / WebM): Statically muted initially, controlled imperatively */
        <video
          ref={videoRef}
          src={ad.videoUrl}
          autoPlay
          loop
          playsInline
          preload="metadata"
          onError={() => {
            console.warn("Video failed to play from source:", ad.videoUrl);
            setHasError(true);
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            transition: "transform 0.4s cubic-bezier(0.2, 0, 0, 1), filter 0.4s ease",
            transform: isHovered ? "scale(1.01)" : "scale(1)",
            filter: isHovered ? "brightness(1.02)" : "brightness(1)",
          }}
        />
      )}

      {/* ── iOS Class Glass Sound Toggle Button ── */}
      {!isGif && (
        <button
          type="button"
          onClick={handleToggleSound}
          onTouchStart={() => setIsSoundPressed(true)}
          onTouchEnd={() => setIsSoundPressed(false)}
          onMouseDown={() => setIsSoundPressed(true)}
          onMouseUp={() => setIsSoundPressed(false)}
          aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          style={{
            position: "absolute",
            bottom: "14px",
            left: "14px",
            zIndex: 15,
            width: "38px",
            height: "38px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow:
              "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
            color: "#ffffff",
            fontSize: "14px",
            transition: "all 0.25s cubic-bezier(0.2, 0, 0, 1)",
            transform: isSoundPressed
              ? "scale(0.88)"
              : isHovered
              ? "scale(1.05)"
              : "scale(1)",
            userSelect: "none",
          }}
        >
          {isMuted ? (
            <FaVolumeMute
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                marginRight: "1px",
              }}
            />
          ) : (
            <FaVolumeUp
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                marginLeft: "1px",
              }}
            />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1100px",
        margin: "24px auto",
        padding: "0 16px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.12))",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          backgroundColor: "var(--color-bg, #0b1120)",
          minHeight: "160px",
          maxHeight: "320px",
          aspectRatio: "21 / 9",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {isExternal ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {mediaContent}
          </a>
        ) : (
          <Link
            href={targetUrl}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {mediaContent}
          </Link>
        )}
      </div>
    </div>
  );
}
