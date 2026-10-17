"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ShareModal.module.css";
import { ShareModalProps } from "./types";

export default function ShareModal({
  isOpen,
  onClose,
  title = "مشاركة المسار",
  subtitle,
  shareUrl,
  shareText = "",
  extraInfo,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Native share error:", err);
        }
      }
    } else {
      // Desktop / Unsupported browsers fallback: Copy full trip details & URL to clipboard
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      } catch (err) {
        console.warn("Native share fallback error:", err);
      }
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    messenger: `fb-messenger://share/?link=${encodedUrl}`,
  };

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        {/* Modal Header */}
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>
            <i className="bx bx-share-alt" style={{ color: "var(--color-secondary, #3b82f6)" }} />
            <span>{title}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
            aria-label="إغلاق"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {subtitle && (
            <div className={styles.previewSnippet}>
              {subtitle}
            </div>
          )}

          {extraInfo}

          {/* Quick Copy Link Box */}
          <div className={styles.copyBar}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              className={styles.urlInput}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ""}`}
            >
              {copied ? (
                <>
                  <i className="bx bx-check" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <i className="bx bx-copy" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>

          <div className={styles.gridTitle}>المشاركة المباشرة عبر التطبيقات:</div>

          {/* Apps Grid */}
          <div className={styles.appsGrid}>
            {/* WhatsApp */}
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.appItem}
              title="واتساب"
            >
              <div className={`${styles.appIconWrapper} ${styles.whatsapp}`}>
                <i className="bx bxl-whatsapp" />
              </div>
              <span className={styles.appName}>واتساب</span>
            </a>

            {/* Telegram */}
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.appItem}
              title="تليجرام"
            >
              <div className={`${styles.appIconWrapper} ${styles.telegram}`}>
                <i className="bx bxl-telegram" />
              </div>
              <span className={styles.appName}>تليجرام</span>
            </a>

            {/* Facebook */}
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.appItem}
              title="فيسبوك"
            >
              <div className={`${styles.appIconWrapper} ${styles.facebook}`}>
                <i className="bx bxl-facebook" />
              </div>
              <span className={styles.appName}>فيسبوك</span>
            </a>

            {/* Native / More Share for Any Screen */}
            <button
              type="button"
              onClick={handleNativeShare}
              className={styles.appItem}
              title="المزيد من خيارات المشاركة"
            >
              <div className={`${styles.appIconWrapper} ${styles.nativeShare}`}>
                <i className={copied ? "bx bx-check" : "bx bx-dots-horizontal-rounded"} />
              </div>
              <span className={styles.appName}>
                {copied ? "تم النسخ!" : "المزيد..."}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
