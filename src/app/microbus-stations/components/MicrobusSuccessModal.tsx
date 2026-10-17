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
        <h3 style={{ margin: "0 0 10px 0", fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sub)" }}>
          تم الإرسال بنجاح!
        </h3>

        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="btn tab"
          style={{
            width: "100%",
            padding: "12px",
          }}
        >
          تم بنجاح
        </button>
      </div>
    </div>
  );
}
