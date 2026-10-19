"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/common/Modals";

interface ProfileNotificationDetailsModalProps {
  notification: any | null;
  onClose: () => void;
}

export const ProfileNotificationDetailsModal: React.FC<ProfileNotificationDetailsModalProps> = ({
  notification,
  onClose,
}) => {
  const router = useRouter();

  if (!notification) return null;

  return (
    <CustomModal
      isOpen={Boolean(notification)}
      onClose={onClose}
      title={notification?.title || "تفاصيل الإشعار"}
      titleColor={
        notification?.type === "warning"
          ? "#ff9500"
          : notification?.type === "error"
            ? "#ff3b30"
            : "var(--color-foreground)"
      }
      primaryButton={
        notification?.link
          ? {
            label: "إغلاق",
            onClick: () => {
              const link = notification.link;
              onClose();
              router.push(link);
            },
            bgColor: "var(--mainBtn)",
          }
          : {
            label: "إغلاق",
            onClick: onClose,
            bgColor: "var(--mainBtn)",
          }
      }
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            marginBottom: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-glass)",
            padding: "5px 14px",
            borderRadius: "20px",
          }}
        >
          <i className="bx bx-calendar" style={{ fontSize: "0.95rem" }}></i>
          <span>
            {new Date(notification.created_at).toLocaleString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-secondary, rgba(255, 255, 255, 0.03))",
            border: "1px solid var(--border-glass)",
            borderRadius: "14px",
            padding: "16px",
            textAlign: "right",
            maxHeight: "220px",
            overflowY: "auto",
            direction: "rtl",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              color: "var(--color-foreground)",
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-cairo)",
            }}
          >
            {notification.message}
          </p>
        </div>
      </div>
    </CustomModal>
  );
};
