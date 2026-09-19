import React from "react";
import styles from "../microbus.module.css";

interface MicrobusSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function MicrobusSuccessModal({
  isOpen,
  onClose,
  message,
}: MicrobusSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1100,
      padding: "20px",
      direction: "rtl"
    }}>
      <div
        className={styles.stationCard}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "2px solid #10b981",
          color: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          marginBottom: "16px",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.35)"
        }}>
          <i className="bx bx-check" />
        </div>

        <h3 style={{ margin: "0 0 10px 0", fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sub)" }}>
          تم الإرسال بنجاح! 🎉
        </h3>

        <p style={{ margin: "0 0 22px 0", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={styles.spotlightBtn}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
          }}
        >
          تم بنجاح 👍
        </button>
      </div>
    </div>
  );
}
