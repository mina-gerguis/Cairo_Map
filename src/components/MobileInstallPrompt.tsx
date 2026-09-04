"use client";

import React, { useEffect, useState } from "react";

type Platform = "ios" | "android" | null;

export default function MobileInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    // Ensure code runs only on client browser
    if (typeof window === "undefined") return;

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem("mobile_install_prompt_dismissed");
    if (dismissed === "true") return;

    const ua = window.navigator.userAgent;

    // Detect iOS devices (iPhone, iPad, iPod, or iPad on iOS 13+ desktop mode)
    const isIos =
      /iPhone|iPad|iPod/.test(ua) ||
      (window.navigator.maxTouchPoints &&
        window.navigator.maxTouchPoints > 2 &&
        /Macintosh/.test(ua));

    // Detect Android devices
    const isAndroid = /Android/.test(ua);

    if (!isIos && !isAndroid) return;

    // Check if the site is already launched in standalone mode (PWA installed)
    const isStandalone =
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return;

    const detectedPlatform: Platform = isIos ? "ios" : "android";
    setPlatform(detectedPlatform);

    // Show prompt after a short delay so page loads smoothly
    const timer = setTimeout(() => {
      setShowPrompt(true);
      setTimeout(() => setMounted(true), 50);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (permanent: boolean) => {
    setMounted(false);
    setTimeout(() => {
      setShowPrompt(false);
      if (permanent) {
        localStorage.setItem("mobile_install_prompt_dismissed", "true");
      }
    }, 300);
  };

  if (!showPrompt || !platform) return null;

  const isIos = platform === "ios";

  const title = isIos
    ? 'ثبّت التطبيق على تليفونك '
    : 'ثبّت التطبيق على موبايلك ';

  const steps = isIos
    ? [
      {
        text: (
          <>
            اضغط على زر <strong style={{ color: "#818cf8" }}>المشاركة</strong>{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "6px",
                padding: "2px 6px",
                margin: "0 2px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </span>{" "}
            أسفل شاشة متصفح Safari.
          </>
        ),
      },
      {
        text: (
          <>
            مرّر لأسفل واختر <strong style={{ color: "#ffffff" }}>&quot;إضافة إلى الشاشة الرئيسية&quot;</strong>{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "6px",
                padding: "2px 6px",
                margin: "0 2px",
              }}
            >
              ➕
            </span>
          </>
        ),
      },
      {
        text: (
          <>
            اضغط على <strong style={{ color: "#34d399" }}>&quot;إضافة&quot; (Add)</strong> في أعلى اليمين.
          </>
        ),
      },
    ]
    : [
      {
        text: (
          <>
            اضغط على{" "}
            <strong style={{ color: "#818cf8" }}>القائمة</strong>{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "6px",
                padding: "2px 6px",
                margin: "0 2px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="5" r="1.5" fill="#38bdf8" />
                <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
                <circle cx="12" cy="19" r="1.5" fill="#38bdf8" />
              </svg>
            </span>{" "}
            (النقاط الثلاثة) أعلى متصفح Chrome.
          </>
        ),
      },
      {
        text: (
          <>
            اختر <strong style={{ color: "#ffffff" }}>&quot;إضافة إلى الشاشة الرئيسية&quot;</strong>{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "6px",
                padding: "2px 6px",
                margin: "0 2px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v10M12 2l-4 4M12 2l4 4" />
                <rect x="3" y="14" width="18" height="8" rx="2" />
              </svg>
            </span>{" "}
            من القائمة.
          </>
        ),
      },
      {
        text: (
          <>
            اضغط على <strong style={{ color: "#34d399" }}>&quot;إضافة&quot; (Add)</strong> لتأكيد التثبيت.
          </>
        ),
      },
    ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "16px",
        background: mounted ? "rgba(11, 15, 25, 0.75)" : "rgba(11, 15, 25, 0)",
        backdropFilter: mounted ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: mounted ? "blur(10px)" : "blur(0px)",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss(false);
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "linear-gradient(145deg, rgba(26, 31, 55, 0.96), rgba(15, 20, 38, 0.98))",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "15px",
          padding: "24px 20px 20px 20px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)",
          transform: mounted ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
          opacity: mounted ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-almarai), system-ui, sans-serif",
          direction: "rtl" as const,
          position: "relative" as const,
          overflow: "hidden" as const,
        }}
      >
        {/* Top Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "50%",
            transform: "translateX(50%)",
            width: "180px",
            height: "100px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="/apple-touch-icon.png"
                alt="ماب القاهرة"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontFamily: "var(--font-main)",
                  fontWeight: "800",
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: "1.3",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#94a3b8",
                  margin: "3px 0 0 0",
                }}
              >
                لتصفح أسرع ودخول بنقرة واحدة من شاشتك الرئيسية
              </p>
            </div>
          </div>
        </div>

        {/* Steps Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            margin: "18px 0",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#e2e8f0", lineHeight: "1.4" }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
          <button
            onClick={() => handleDismiss(false)}
            style={{
              width: "100%",
              padding: "var(--paddingBtn)",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.92rem",
              fontWeight: "700",
              cursor: "pointer",
              background: "var(--colorPrimary)",
              color: "#ffffff",
              transition: "transform 0.2s ease, filter 0.2s ease",
            }}
          >
            فهمت
          </button>

          <button
            onClick={() => handleDismiss(true)}
            style={{
              width: "100%",
              padding: "9px 20px",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
              background: "transparent",
              color: "#94a3b8",
              transition: "all 0.2s ease",
            }}
          >
            عدم إظهار هذه الرسالة مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
}
