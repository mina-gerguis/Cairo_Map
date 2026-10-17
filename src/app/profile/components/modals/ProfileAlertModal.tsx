"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { ProfileAlertMessage } from "../../types";

interface ProfileAlertModalProps {
  message: ProfileAlertMessage | null;
  onClose: () => void;
}

export const ProfileAlertModal: React.FC<ProfileAlertModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <CustomModal
      isOpen={message !== null}
      onClose={onClose}
      title={message.type === "error" ? "تنبيه" : "عملية ناجحة"}
      titleColor={message.type === "error" ? "#ff3b30" : "var(--text-primary)"}
      message={message.text}
      iconNode={
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              message.type === "error"
                ? "linear-gradient(135deg, rgba(255, 59, 48, 0.2) 0%, rgba(255, 59, 48, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(52, 199, 89, 0.05) 100%)",
            border:
              message.type === "error"
                ? "2px solid rgba(255, 59, 48, 0.4)"
                : "2px solid rgba(52, 199, 89, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: message.type === "error" ? "#ff3b30" : "#34c759",
          }}
        >
          <i
            className={`bx ${message.type === "error" ? "bx-error-circle" : "bx-check-circle"}`}
            style={{ fontSize: "2.2rem" }}
          ></i>
        </div>
      }
      borderColor={message.type === "error" ? "rgba(255, 59, 48, 0.25)" : "var(--modelCardBorder)"}
      primaryButton={{
        label: "موافق",
        onClick: onClose,
        bgColor: message.type === "error" ? "#ff3b30" : "var(--mainBtn)",
      }}
    />
  );
};
