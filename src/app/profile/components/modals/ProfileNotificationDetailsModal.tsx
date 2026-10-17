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
          : "var(--text-primary)"
      }
      borderColor={
        notification?.type === "warning"
          ? "rgba(255, 149, 0, 0.3)"
          : notification?.type === "error"
          ? "rgba(255, 59, 48, 0.3)"
          : "var(--modelCardBorder)"
      }
      iconNode={
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              notification?.type === "warning"
                ? "linear-gradient(135deg, rgba(255, 149, 0, 0.2) 0%, rgba(255, 149, 0, 0.05) 100%)"
                : notification?.type === "error"
                ? "linear-gradient(135deg, rgba(255, 59, 48, 0.2) 0%, rgba(255, 59, 48, 0.05) 100%)"
                : notification?.type === "success"
                ? "linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(52, 199, 89, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(0, 111, 238, 0.2) 0%, rgba(0, 111, 238, 0.05) 100%)",
            border:
              notification?.type === "warning"
                ? "2px solid rgba(255, 149, 0, 0.4)"
                : notification?.type === "error"
                ? "2px solid rgba(255, 59, 48, 0.4)"
                : notification?.type === "success"
                ? "2px solid rgba(52, 199, 89, 0.4)"
                : "2px solid rgba(0, 111, 238, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color:
              notification?.type === "warning"
                ? "#ff9500"
                : notification?.type === "error"
                ? "#ff3b30"
                : notification?.type === "success"
                ? "#34c759"
                : "var(--color-primary)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          <i
            className={`bx ${
              notification?.type === "warning"
                ? "bx-error"
                : notification?.type === "error"
                ? "bx-error-circle"
                : notification?.type === "success"
                ? "bx-check-circle"
                : "bxs-bell-ring"
            }`}
            style={{ fontSize: "2.3rem" }}
          />
        </div>
      }
      primaryButton={
        notification?.link
          ? {
              label: "فتح الرابط",
              onClick: () => {
                const link = notification.link;
                onClose();
                router.push(link);
              },
              bgColor: "var(--mainBtn)",
              icon: <i className="bx bx-link-external" style={{ fontSize: "1.2rem" }} />,
            }
          : {
              label: "إغلاق",
              onClick: onClose,
              bgColor: "var(--mainBtn)",
              icon: <i className="bx bx-check" style={{ fontSize: "1.2rem" }} />,
            }
      }
      secondaryButton={
        notification?.link
          ? {
              label: "إلغاء",
              onClick: onClose,
              bgColor: "var(--btn-cancel)",
              icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />,
            }
          : undefined
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
              color: "var(--text-primary)",
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
