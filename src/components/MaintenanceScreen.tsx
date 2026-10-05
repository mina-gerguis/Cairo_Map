"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MaintenanceItem, getPageInfo, SITE_PAGES_LIST } from "@/lib/maintenance";

interface MaintenanceScreenProps {
  maintenance: MaintenanceItem;
  pathname?: string;
}

export default function MaintenanceScreen({ maintenance, pathname = "" }: MaintenanceScreenProps) {
  const pageInfo = getPageInfo(maintenance.page_path || pathname);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  } | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

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
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 16px",
        direction: "rtl",
        fontFamily: "var(--font-heading, inherit)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Keyframe styles & Theme overrides for animations ── */}
      <style>{`
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }
        @keyframes beaconPulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
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

        .maintScreenCard {
          background: linear-gradient(145deg, rgba(20, 27, 45, 0.9), rgba(12, 17, 30, 0.95));
          border: 1px solid rgba(245, 158, 11, 0.25);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.65), 0 0 30px rgba(245, 158, 11, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }

        .maintScreenTitle {
          color: #f8fafc;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .maintScreenDescBox {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
        }

        .maintScreenTimerContainer {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85));
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .maintScreenTimerCard {
          background: rgba(10, 15, 28, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
        }

        .maintScreenTimerNumber {
          color: #fbbf24;
        }

        .maintScreenTimerLabel {
          color: #94a3b8;
        }

        .maintScreenRefreshBtn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
        }
        .maintScreenRefreshBtn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .maintScreenQuickLink {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
        }
        .maintScreenQuickLink:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Light mode adaptations */
        :global(html.light) .maintScreenCard,
        :global(.light) .maintScreenCard {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98)) !important;
          border-color: rgba(245, 158, 11, 0.35) !important;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 25px rgba(245, 158, 11, 0.12) !important;
        }

        :global(html.light) .maintScreenTitle,
        :global(.light) .maintScreenTitle {
          color: #0f172a !important;
          background: linear-gradient(180deg, #0f172a 0%, #334155 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }

        :global(html.light) .maintScreenDescBox,
        :global(.light) .maintScreenDescBox {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          color: #475569 !important;
        }

        :global(html.light) .maintScreenTimerContainer,
        :global(.light) .maintScreenTimerContainer {
          background: linear-gradient(135deg, #f8fafc, #fef3c7) !important;
          border-color: rgba(245, 158, 11, 0.3) !important;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.08) !important;
        }

        :global(html.light) .maintScreenTimerCard,
        :global(.light) .maintScreenTimerCard {
          background: #ffffff !important;
          border-color: #fde68a !important;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05) !important;
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
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
        }
        :global(html.light) .maintScreenRefreshBtn:hover,
        :global(.light) .maintScreenRefreshBtn:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }

        :global(html.light) .maintScreenQuickLink,
        :global(.light) .maintScreenQuickLink {
          background: #f1f5f9 !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
        }
        :global(html.light) .maintScreenQuickLink:hover,
        :global(.light) .maintScreenQuickLink:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>

      {/* ── Ambient Background Glows ── */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(700px, 95vw)",
          height: "450px",
          background:
            "radial-gradient(ellipse 65% 50% at 50% 40%, rgba(245, 158, 11, 0.18), rgba(234, 88, 12, 0.1) 45%, rgba(99, 102, 241, 0.05) 75%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(50px)",
          animation: "pulseGlow 6s ease-in-out infinite",
        }}
      />

      {/* ── Main Glassmorphism Maintenance Card ── */}
      <div
        className="maintScreenCard"
        style={{
          width: "100%",
          maxWidth: "720px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "28px",
          padding: "44px 28px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top Decorative Corner Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "220px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #f59e0b, #ea580c, transparent)",
            borderRadius: "3px",
          }}
        />

        {/* ── 3D Floating Illustration & Indicator ── */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "20px",
          }}
        >
          {/* Ambient ring behind icon */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)",
              zIndex: 0,
              filter: "blur(12px)",
            }}
          />

          {/* 3D Image with Floating Animation */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              animation: "floatUpDown 4s ease-in-out infinite",
            }}
          >
            <Image
              src="/images/icons3d/lockPage.webp"
              alt="Page In Maintenance"
              width={130}
              height={130}
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.35)) drop-shadow(0 0 20px rgba(245, 158, 11, 0.2))",
                userSelect: "none",
              }}
              priority
            />
          </div>

          {/* Spinning mini wrench badge */}
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              zIndex: 2,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.5)",
              border: "2px solid #0f172a",
            }}
            title="أعمال صيانة نشطة"
          >
            <i
              className="bx bx-cog"
              style={{ fontSize: "1.25rem", animation: "gearRotate 8s linear infinite" }}
            />
          </div>
        </div>

        {/* ── Status Pill Badge ── */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              color: "#f59e0b",
              fontSize: "0.86rem",
              fontWeight: 700,
              boxShadow: "0 2px 10px rgba(245, 158, 11, 0.15)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#f59e0b",
                display: "inline-block",
                animation: "beaconPulse 2s infinite",
              }}
            />
            <i className={pageInfo.icon} style={{ fontSize: "1rem" }} />
            <span>
              {maintenance.page_path === "all"
                ? "كامل الموقع تحت أعمال الصيانة"
                : `قسم: ${pageInfo.label}`}
            </span>
          </div>
        </div>

        {/* ── Main Title ── */}
        <h1
          className="maintScreenTitle"
          style={{
            fontSize: "clamp(1.5rem, 4.5vw, 2.2rem)",
            fontWeight: 900,
            marginBottom: "14px",
            lineHeight: 1.3,
            letterSpacing: "-0.5px",
          }}
        >
          {maintenance.title || "الصفحة قيد الصيانة والتحديث"}
        </h1>

        {/* ── Description Box ── */}
        <div
          className="maintScreenDescBox"
          style={{
            borderRadius: "16px",
            padding: "16px 20px",
            maxWidth: "540px",
            margin: "0 auto 24px",
          }}
        >
          <p
            style={{
              fontSize: "clamp(0.92rem, 2.5vw, 1.02rem)",
              lineHeight: 1.75,
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
              borderRadius: "20px",
              padding: "20px 16px",
              margin: "0 auto 28px",
              maxWidth: "480px",
            }}
          >
            <div
              style={{
                fontSize: "0.84rem",
                color: "#d97706",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              <i className="bx bx-time-five" style={{ fontSize: "1.1rem", color: "#f59e0b" }} />
              <span>الوقت المتبقي حتى انتهاء الصيانة وإعادة الفتح</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
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
                    borderRadius: "12px",
                    padding: "10px 4px",
                  }}
                >
                  <div
                    className="maintScreenTimerNumber"
                    style={{
                      fontSize: "clamp(1.3rem, 4vw, 1.7rem)",
                      fontWeight: 900,
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
                      fontSize: "0.72rem",
                      marginTop: "4px",
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
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {maintenance.page_path !== "/" && (
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "13px 26px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #006FEE, #0050b3)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.94rem",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(0, 111, 238, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <i className="bx bx-home-alt-2" style={{ fontSize: "1.2rem" }} />
              <span>العودة للرئيسية</span>
            </Link>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="maintScreenRefreshBtn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 24px",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "0.94rem",
              cursor: isRefreshing ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <i
              className="bx bx-refresh"
              style={{
                fontSize: "1.3rem",
                animation: isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            <span>{isRefreshing ? "جاري التحديث..." : "تحديث الصفحة"}</span>
          </button>
        </div>

        {/* ── Quick Discovery Links (استكشف باقي خدمات الموقع) ── */}
        {quickLinks.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border-glass)",
              paddingTop: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              يمكنك متابعة تصفح باقي خدمات ماب القاهرة:
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="maintScreenQuickLink"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <i className={link.icon} style={{ color: "var(--color-primary, #006FEE)" }} />
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
            gap: "10px",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-glass)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="bx bx-shield-quarter" style={{ color: "#f59e0b" }} />
            <span>ماب القاهرة — نسعى دائماً لتقديم أفضل الخدمات بدقة وسرعة</span>
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
            <i className="bx bx-lock-alt" />
            <span>دخول الإدارة</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
