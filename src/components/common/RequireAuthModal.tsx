"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomModal from "./Modals";

interface RequireAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function RequireAuthModal({
  isOpen,
  onClose,
  message = "يرجى تسجيل الدخول أولاً لتتمكن من إضافة المعلم السياحي إلى قائمة المفضلة",
}: RequireAuthModalProps) {
  const router = useRouter();

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل الدخول مطلوب"
      message={message}
      iconSrc="/images/icons3d/heart.png"
      primaryButton={{
        label: "تسجيل الدخول",
        onClick: () => {
          onClose();
          router.push("/login");
        },
        bgColor: "var(--mainBtn)",
      }}
      secondaryButton={{
        label: "إلغاء",
        onClick: onClose,
        bgColor: "var(--cancelBtn)",
      }}
    />
  );
}
