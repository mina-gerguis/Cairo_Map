"use client";
import React, { useEffect, useState } from "react";

interface AlertItem {
  id: string;
  title: string;
  content: string;
  type: "info" | "success" | "warning" | "danger";
  show_type: "first_time" | "every_time";
  target_page: string;
  expiry_date: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface SiteAlertModalProps {
  alert: AlertItem;
  onClose: (dontShowAgain: boolean) => void;
}

export default function SiteAlertModal({ alert, onClose }: SiteAlertModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small timeout to trigger scale-in animation
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getTypeStyles = () => {
    switch (alert.type) {
      case "success":
        return {
          icon: "bx-check-circle",
          color: "#4ade80",
          bg: "rgba(34, 197, 94, 0.1)",
          border: "rgba(34, 197, 94, 0.2)",
          gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.05))",
          glow: "rgba(34, 197, 94, 0.25)",
        };
      case "warning":
        return {
          icon: "bx-error",
          color: "#fbbf24",
          bg: "rgba(245, 158, 11, 0.1)",
          border: "rgba(245, 158, 11, 0.2)",
          gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))",
          glow: "rgba(245, 158, 11, 0.25)",
        };
      case "danger":
        return {
          icon: "bx-error-circle",
          color: "#f87171",
          bg: "rgba(239, 68, 68, 0.1)",
          border: "rgba(239, 68, 68, 0.2)",
          gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.05))",
          glow: "rgba(239, 68, 68, 0.25)",
        };
      case "info":
      default:
        return {
          icon: "bx-info-circle",
          color: "#60a5fa",
          bg: "rgba(59, 130, 246, 0.1)",
          border: "rgba(59, 130, 246, 0.2)",
          gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.05))",
          glow: "rgba(59, 130, 246, 0.25)",
        };
    }
  };

  const style = getTypeStyles();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(11, 15, 25, 0.7)",
        backdropFilter: mounted ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: mounted ? "blur(12px)" : "blur(0px)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "rgba(17, 24, 39, 0.9)",
          border: `1px solid ${style.border}`,
          borderRadius: "24px",
          padding: "28px",
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px ${style.glow}`,
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
          opacity: mounted ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-almarai), var(--font-cairo), system-ui, sans-serif",
          direction: "rtl",
        }}
      >
        {/* Header Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: style.color,
              overflow: "hidden",
            }}
          >
            {alert.image_url ? (
              <img
                src={alert.image_url}
                alt={alert.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <i className={`bx ${style.icon}`} style={{ fontSize: "2.4rem" }} />
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            textAlign: "center",
            marginBottom: "14px",
            color: "#ffffff",
             fontFamily: "var(--font-heading)",
          }}
        >
          {alert.title}
        </h3>

        {/* Content */}
        <div
          style={{
            fontSize: "0.98rem",
            lineHeight: "1.65",
            color: "#cbd5e1",
            textAlign: "center",
            fontFamily: "var(--font-heading)",
            marginBottom: "28px",
            whiteSpace: "pre-wrap",
            maxHeight: "220px",
            overflowY: "auto",
            padding: "0 4px",
          }}
          className="alert-content-scroll"
        >
          {alert.content}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => onClose(false)}
            style={{
              width: "100%",
              padding: "12px 24px",
              borderRadius: "14px",
              border: "none",
              fontSize: "0.95rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              cursor: "pointer",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
              transition: "transform 0.2s ease, filter 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.filter = "none";
            }}
          >
            حسناً، فهمت
          </button>

          <button
            onClick={() => onClose(true)}
            style={{
              width: "100%",
              padding: "10px 24px",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "0.85rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              cursor: "pointer",
              background: "transparent",
              color: "#94a3b8",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }}
          >
            لا تظهر هذا التنبيه مرة أخرى
          </button>
        </div>
      </div>

      <style jsx>{`
        .alert-content-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .alert-content-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .alert-content-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
