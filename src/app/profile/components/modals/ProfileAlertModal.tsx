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
      titleColor={message.type === "error" ? "#ff3b30" : "var(--color-foreground)"}
      message={message.text}
      borderColor={message.type === "error" ? "rgba(255, 59, 48, 0.25)" : "var(--modelCardBorder)"}
      primaryButton={{
        label: "موافق",
        onClick: onClose,
        bgColor: message.type === "error" ? "#ff3b30" : "var(--mainBtn)",
      }}
    />
  );
};
