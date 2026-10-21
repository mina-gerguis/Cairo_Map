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

  const isSuccess = message.type === "success";

  return (
    <>
      <style>{`
        @keyframes alertGlowPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 ${isSuccess ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"};
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 25px 4px ${isSuccess ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"};
          }
        }
      `}</style>
      <CustomModal
        isOpen={message !== null}
        onClose={onClose}
        title={message.title || (isSuccess ? "تمت العملية بنجاح" : "تنبيه")}
        titleColor={isSuccess ? "var(--color-foreground)" : "var(--color-error)"}
        message={message.text}
        borderColor="var(--border-glass)"
        primaryButton={{
          label: "أغلاق",
          onClick: onClose,
          bgColor: "var(--btn-primary)",
          textColor: "var(--btn-primary-text)",
          icon: (
            <i
              className={`bx ${isSuccess ? "bx-check" : "bx-x"}`}
              style={{ fontSize: "1.2rem" }}
            />
          ),
        }}
      />
    </>
  );
};
