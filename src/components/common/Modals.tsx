"use client";

import React from "react";

export interface ModalButtonProps {
  label: string;
  onClick: () => void;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleColor?: string;
  message?: string;
  iconSrc?: string;
  iconNode?: React.ReactNode;
  borderColor?: string;
  primaryButton?: ModalButtonProps;
  secondaryButton?: ModalButtonProps;
  children?: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  titleColor,
  message,
  iconSrc,
  iconNode,
  borderColor = "rgba(255, 255, 255, 0.15)",
  primaryButton,
  secondaryButton,
  children,
  closeOnOverlayClick = true,
}: CustomModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes customModalFadeIn {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes customModalPop {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--overlay, rgba(0, 0, 0, 0.75))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 21000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "customModalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={() => closeOnOverlayClick && onClose()}
      >
        <div
          style={{
            backgroundColor: "var(--bgPrimary)",
            color: "var(--textPrimary)",
            border: `1px solid ${borderColor}`,
            borderRadius: "var(--modelCardRadius)",
            padding: "32px 24px 24px 24px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            boxShadow: "var(--modelCardShadow)",
            position: "relative",
            animation: "customModalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon / Badge */}
          {(iconSrc || iconNode) && (
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                fontSize: "2rem",
              }}
            >
              {iconSrc ? (
                <img src={iconSrc} alt="Modal Icon" loading="lazy" width="80px" />
              ) : (
                iconNode
              )}
            </div>
          )}

          <h2 style={{ fontSize: "1.25rem", fontWeight: "800", margin: "0 0 10px 0", color: titleColor || "var(--textPrimary)" }}>
            {title}
          </h2>

          {message && (
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                color: "var(--textSecondary)",
                margin: "0 0 24px 0",
              }}
            >
              {message}
            </p>
          )}

          {children && (
            <div style={{ marginBottom: "24px", width: "100%" }}>
              {children}
            </div>
          )}

          {/* Action Buttons */}
          {(primaryButton || secondaryButton) && (
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              {primaryButton && (
                <button
                  onClick={primaryButton.onClick}
                  disabled={primaryButton.disabled}
                  style={{
                    flex: 1,
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    border: primaryButton.borderColor ? `1px solid ${primaryButton.borderColor}` : "none",
                    backgroundColor: primaryButton.bgColor || "var(--mainBtn)",
                    color: primaryButton.textColor || "#ffffff",
                    fontWeight: "700",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.95rem",
                    cursor: primaryButton.disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    opacity: primaryButton.disabled ? 0.7 : 1,
                  }}
                >
                  {primaryButton.icon}
                  {primaryButton.label}
                </button>
              )}

              {secondaryButton && (
                <button
                  onClick={secondaryButton.onClick}
                  disabled={secondaryButton.disabled}
                  style={{
                    flex: 1,
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    border: secondaryButton.borderColor || "1px solid var(--cancelBtn)",
                    backgroundColor: secondaryButton.bgColor || "var(--cancelBtn)",
                    color: secondaryButton.textColor || "var(--textPrimary)",
                    fontWeight: "600",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.95rem",
                    cursor: secondaryButton.disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    opacity: secondaryButton.disabled ? 0.7 : 1,
                  }}
                >
                  {secondaryButton.icon}
                  {secondaryButton.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
