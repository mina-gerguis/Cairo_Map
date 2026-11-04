"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassRevealQareeb } from "@/components/ui/glass-icon-reveal";
import { MaintenanceItem, getPageInfo } from "@/lib/maintenance";

interface MaintenanceScreenProps {
  maintenance: MaintenanceItem;
  pathname?: string;
}

export default function MaintenanceScreen({
  maintenance,
  pathname = "",
}: MaintenanceScreenProps) {
  const pageInfo = getPageInfo(maintenance.page_path || pathname);

  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  } | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic theme resolution matching SitePreloader
  useEffect(() => {
    const resolveTheme = () => {
      const isLight =
        document.documentElement.classList.contains("light") ||
        localStorage.getItem("dftry_theme") === "light";
      setCurrentTheme(isLight ? "light" : "dark");
    };

    resolveTheme();
    window.addEventListener("themechange", resolveTheme);
    return () => window.removeEventListener("themechange", resolveTheme);
  }, []);

  const isLight = currentTheme === "light";

  // Countdown timer calculation
  useEffect(() => {
    if (!maintenance.estimated_end) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const target = new Date(maintenance.estimated_end!).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [maintenance.estimated_end]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  // Alternative suggestions for pages to explore
  const quickLinks = [
    { label: "الرئيسية", path: "/", icon: "bx bx-home-alt-2" },
    { label: "الخريطة", path: "/map", icon: "bx bx-map-pin" },
    { label: "إزاي أروح", path: "/directions", icon: "bx bx-compass" },
    { label: "دليل الأماكن", path: "/places", icon: "bx bx-store-alt" },
    { label: "المساعدة", path: "/help", icon: "bx bx-help-circle" },
  ].filter((link) => link.path !== maintenance.page_path && link.path !== pathname);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
        direction: "rtl",
        fontFamily: "var(--font-heading, inherit)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Keyframe styles & Theme overrides for transparent glass ── */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.04);
          }
        }
        @keyframes beaconPulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
        }
        @keyframes gearRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes maintTrackAnim {
          0% { left: -50%; }
          100% { left: 110%; }
        }

        /* ── Glassmorphic Transparent Card ── */
        .maintScreenCard {
          background: transparent;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }

        .maintScreenDescBox {
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
        }

        .maintScreenTimerContainer {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.22);
        }

        .maintScreenTimerCard {
          background: rgba(10, 15, 28, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.06);
        }

        .maintScreenTimerNumber {
          color: #fbbf24;
        }

        .maintScreenTimerLabel {
          color: #94a3b8;
        }

        .maintScreenRefreshBtn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e2e8f0;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .maintScreenRefreshBtn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }

       
        .maintScreenQuickLink:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* ── Progress bar styling from Preloader ── */
        .maintProgressTrack {
          width: 135px;
          height: 3.5px;
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .maintProgressBar {
          position: absolute;
          top: 0;
          left: 0;
          width: 45%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, #38bdf8, #60a5fa, transparent);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.65);
          animation: maintTrackAnim 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* ── Light Mode Adaptations ── */

        :global(html.light) .maintScreenTitle,
        :global(.light) .maintScreenTitle {
          color: #0f172a !important;
          background: linear-gradient(180deg, #0f172a 0%, #334155 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }

        :global(html.light) .maintScreenDescBox,
        :global(.light) .maintScreenDescBox {
          background: rgba(255, 255, 255, 0.5) !important;
          border-color: rgba(0, 0, 0, 0.06) !important;
          color: #334155 !important;
        }

        :global(html.light) .maintScreenTimerContainer,
        :global(.light) .maintScreenTimerContainer {
          background: rgba(254, 243, 199, 0.45) !important;
          border-color: rgba(245, 158, 11, 0.25) !important;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.06) !important;
        }

        :global(html.light) .maintScreenTimerCard,
        :global(.light) .maintScreenTimerCard {
          background: rgba(255, 255, 255, 0.7) !important;
          border-color: rgba(253, 230, 138, 0.6) !important;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04) !important;
        }

        :global(html.light) .maintScreenTimerNumber,
        :global(.light) .maintScreenTimerNumber {
          color: #d97706 !important;
        }

        :global(html.light) .maintScreenTimerLabel,
        :global(.light) .maintScreenTimerLabel {
          color: #64748b !important;
        }

        :global(html.light) .maintScreenRefreshBtn,
        :global(.light) .maintScreenRefreshBtn {
          background: rgba(255, 255, 255, 0.6) !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
          color: #1e293b !important;
        }
        :global(html.light) .maintScreenRefreshBtn:hover,
        :global(.light) .maintScreenRefreshBtn:hover {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #0f172a !important;
        }

        :global(html.light) .maintScreenQuickLink,
        :global(.light) .maintScreenQuickLink {
          background: rgba(255, 255, 255, 0.45) !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
          color: #334155 !important;
        }
        :global(html.light) .maintScreenQuickLink:hover,
        :global(.light) .maintScreenQuickLink:hover {
          background: rgba(255, 255, 255, 0.85) !important;
          color: #0f172a !important;
        }

        :global(html.light) .maintProgressTrack,
        :global(.light) .maintProgressTrack {
          background: rgba(0, 0, 0, 0.06) !important;
          border-color: rgba(0, 0, 0, 0.04) !important;
        }

        :global(html.light) .maintProgressBar,
        :global(.light) .maintProgressBar {
          background: linear-gradient(90deg, transparent, #2563eb, #3b82f6, transparent) !important;
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.4) !important;
        }

        :global(html.light) .maintMiniBadge,
        :global(.light) .maintMiniBadge {
          border-color: #ffffff !important;
        }
      `}</style>

      {/* ── Ambient Background Glows ── */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, 92vw)",
          height: "340px",
          background: isLight
            ? "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.06) 60%, transparent 100%)"
            : "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(245, 158, 11, 0.16), rgba(37, 99, 235, 0.1) 60%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(55px)",
          animation: "pulseGlow 6s ease-in-out infinite",
        }}
      />

      {/* ── Main Compact Glass Card ── */}
      <div
        className="maintScreenCard"
        style={{
          width: "100%",
          maxWidth: "540px",
          padding: "24px 20px 18px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top Decorative Ambient Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "180px",
            height: "2.5px",
            borderRadius: "3px",
          }}
        />

        {/* ── Looping Preloader Brand Logo Stage ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
            position: "relative",
          }}
        >
          {/* Logo container with spinning wrench badge */}
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ambient halo behind logo */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: isLight
                  ? "radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%)",
                zIndex: 0,
                filter: "blur(14px)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                width: 170,
                height: 170,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 10px 24px rgba(0, 0, 0, 0.28))",
              }}
            >
              <GlassRevealQareeb
                look={isLight ? "light" : "dark"}
                tileSize={200}
                logoScale={0.74}
                finalScale={0.86}
                speed={1.05}
                loop={true}
                hold={0.6}
                background="transparent"
                plateColor={isLight ? "rgba(255, 255, 255, 0.04)" : "rgba(8, 14, 30, 0.12)"}
                logoColor={isLight ? "#1d4ed8" : "#38bdf8"}
                className="w-full h-full"
              />
            </div>

            {/* Spinning mini gear badge */}
            <div
              className="maintMiniBadge"
              style={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                zIndex: 3,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 12px rgba(217, 119, 6, 0.5)",
                border: "2px solid rgba(15, 23, 42, 0.8)",
                fontSize: "1.05rem",
              }}
              title="أعمال صيانة وتحديث نشطة"
            >
              <i
                className="bx bx-cog"
                style={{ animation: "gearRotate 8s linear infinite" }}
              />
            </div>
          </div>

          {/* Minimalist Glowing Progress Line from SitePreloader */}
          <div className="maintProgressTrack">
            <div className="maintProgressBar" />
          </div>
        </div>

        {/* ── Status Pill Badge ── */}
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
              fontSize: "0.78rem",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "20%",
                background: "var(--color-primary)",
                display: "inline-block",
                animation: "beaconPulse 2s infinite",
              }}
            />
            <i className={pageInfo.icon} style={{ fontSize: "0.9rem" }} />
            <span>
              {maintenance.page_path === "all"
                ? "كامل الموقع تحت أعمال الصيانة والتحديث"
                : `قسم: ${pageInfo.label}`}
            </span>
          </div>
        </div>

        {/* ── Main Title ── */}
        <h1
          className="maintScreenTitle text-primary"
          style={{
            fontSize: "clamp(1.2rem, 3.2vw, 1.45rem)",
            fontWeight: 800,
            marginBottom: "8px",
            lineHeight: 1.3,
            letterSpacing: "-0.3px",
          }}
        >
          {maintenance.title || "الصفحة قيد الصيانة والتحديث"}
        </h1>

        {/* ── Description Box ── */}
        <div
          className="maintScreenDescBox"
          style={{
            borderRadius: "14px",
            padding: "10px 16px",
            maxWidth: "460px",
            margin: "0 auto 16px",
          }}
        >
          <p
          className="text-primary"
            style={{
              fontSize: "0.88rem",
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {maintenance.message ||
              "نعمل حالياً على تطوير وتحديث هذه الصفحة لتقديم تجربة وخدمة أفضل. سنعود للعمل قريباً!"}
          </p>
        </div>

        {/* ── Countdown Timer (if estimated_end exists) ── */}
        {timeLeft && !timeLeft.isEnded && (
          <div
            className="maintScreenTimerContainer"
            style={{
              borderRadius: "16px",
              padding: "12px 14px",
              margin: "0 auto 16px",
              maxWidth: "420px",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                color: "#d97706",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontWeight: 700,
              }}
            >
              <i className="bx bx-time-five" style={{ fontSize: "0.95rem", color: "#f59e0b" }} />
              <span>الوقت المتبقي حتى انتهاء الصيانة وإعادة الفتح</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {[
                { label: "يوم", val: timeLeft.days },
                { label: "ساعة", val: timeLeft.hours },
                { label: "دقيقة", val: timeLeft.minutes },
                { label: "ثانية", val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="maintScreenTimerCard"
                  style={{
                    borderRadius: "10px",
                    padding: "6px 2px",
                  }}
                >
                  <div
                    className="maintScreenTimerNumber"
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1.1,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {String(item.val).padStart(2, "0")}
                  </div>
                  <div
                    className="maintScreenTimerLabel"
                    style={{
                      fontSize: "0.68rem",
                      marginTop: "2px",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Action Buttons ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {maintenance.page_path !== "/" && (
            <Link
              href="/"
             className="btn btn-primary"
            >
              <i className="bx bx-home-alt-2" style={{ fontSize: "1.05rem" }} />
              <span>العودة للرئيسية</span>
            </Link>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
          >
            <i
              className="bx bx-refresh"
              style={{
                fontSize: "1.15rem",
                animation: isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            <span>{isRefreshing ? "جاري التحديث..." : "تحديث الصفحة"}</span>
          </button>
        </div>

        {/* ── Quick Discovery Links ── */}
        {quickLinks.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "0.74rem",
                color: "var(--text-secondary)",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              يمكنك متابعة تصفح باقي خدمات قريب:
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="maintScreenQuickLink text-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <i
                    className={link.icon}
                    style={{ color: "var(--color-primary, #006FEE)", fontSize: "0.85rem" }}
                  />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer Branding & Admin Access ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            paddingTop: "10px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <i className="bx bx-shield-quarter" style={{ color: "#f59e0b", fontSize: "0.85rem" }} />
            <span>قريب — نسعى دائماً لتقديم أفضل الخدمات</span>
          </div>

          <Link
            href="/login"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600,
            }}
          >
            <i className="bx bx-lock-alt" style={{ fontSize: "0.8rem" }} />
            <span>دخول الإدارة</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
