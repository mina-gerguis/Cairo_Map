"use client";

import React from "react";
import Link from "next/link";
import styles from "../reports.module.css";
import { UnifiedReport, DeletePlaceDbData } from "../types";
import { getItemSection, getPlaceProblemLabel } from "../utils";

interface IncomingReportsCardProps {
  item: UnifiedReport;
  isOpen: boolean;
  onToggle: () => void;
  replyText: string;
  setReplyText: (text: string) => void;
  replyingId: string | null;
  updatingStatusId: string | null;
  onUpdateStatus: (item: UnifiedReport, status: string) => void;
  onSendReply: (item: UnifiedReport) => void;
  onOpenAddToDirectory: (item: UnifiedReport) => void;
  onOpenAddToParking: (item: UnifiedReport) => void;
  onOpenDeleteModal: (item: UnifiedReport) => void;
  onOpenDeletePlaceDbModal: (data: DeletePlaceDbData) => void;
  onPreviewImage: (url: string) => void;
}

export function IncomingReportsCard({
  item,
  isOpen,
  onToggle,
  replyText,
  setReplyText,
  replyingId,
  updatingStatusId,
  onUpdateStatus,
  onSendReply,
  onOpenAddToDirectory,
  onOpenAddToParking,
  onOpenDeleteModal,
  onOpenDeletePlaceDbModal,
  onPreviewImage,
}: IncomingReportsCardProps) {
  const isDirectoryItem = getItemSection(item) === "directory";
  const isParkingSuggestion = getItemSection(item) === "parking" && item.feedback_type === "suggestion";
  const isPlaceReport = item.source === "place";
  const isContactMsg = item.source === "contact";

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              color: "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
            قيد الانتظار
          </span>
        );
      case "reviewed":
        return (
          <span
            style={{
              background: "rgba(59, 130, 246, 0.12)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa" }} />
            تمت المراجعة
          </span>
        );
      case "action_taken":
      case "accepted":
      case "replied":
        return (
          <span
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            {status === "replied" ? "تم الرد" : status === "accepted" ? "تم القبول والتعديل" : "تم اتخاذ إجراء"}
          </span>
        );
      case "rejected":
        return (
          <span
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
            مرفوض
          </span>
        );
      case "retracted":
        return (
          <span
            style={{
              background: "rgba(142, 142, 147, 0.12)",
              color: "#8e8e93",
              border: "1px solid rgba(142, 142, 147, 0.25)",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: "700",
            }}
          >
            متراجع عنه
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Category Tag Badge Helper
  const renderCategoryBadge = () => {
    const sec = getItemSection(item);
    if (sec === "places") {
      return (
        <span
          style={{
            background: "rgba(236, 72, 153, 0.12)",
            color: "#ec4899",
            border: "1px solid rgba(236, 72, 153, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-map-pin"></i>
          بلاغ مكان
        </span>
      );
    }
    if (sec === "contacts") {
      return (
        <span
          style={{
            background: "rgba(99, 102, 241, 0.12)",
            color: "#818cf8",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-envelope"></i>
          تواصل معنا
        </span>
      );
    }
    if (sec === "microbus") {
      return (
        <span
          style={{
            background: "rgba(168, 85, 247, 0.12)",
            color: "#c084fc",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-bus"></i>
          سرفيس ومواقف
        </span>
      );
    }
    if (sec === "bus_stations") {
      return (
        <span
          style={{
            background: "rgba(59, 130, 246, 0.12)",
            color: "#60a5fa",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-bus"></i>
          مواقف الأتوبيسات
        </span>
      );
    }
    if (sec === "brt") {
      return (
        <span
          style={{
            background: "rgba(234, 88, 12, 0.12)",
            color: "#f97316",
            border: "1px solid rgba(234, 88, 12, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-bus"></i>
          الأتوبيس الترددي BRT
        </span>
      );
    }
    if (sec === "metro") {
      return (
        <span
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-train"></i>
          المترو
        </span>
      );
    }
    if (sec === "monorail") {
      return (
        <span
          style={{
            background: "rgba(59, 130, 246, 0.12)",
            color: "#60a5fa",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-train"></i>
          المونوريل
        </span>
      );
    }
    if (sec === "lrt") {
      return (
        <span
          style={{
            background: "rgba(6, 182, 212, 0.12)",
            color: "#22d3ee",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-train"></i>
          القطار LRT
        </span>
      );
    }
    if (sec === "railways") {
      return (
        <span
          style={{
            background: "rgba(249, 115, 22, 0.12)",
            color: "#fb923c",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-train"></i>
          سكك حديد مصر
        </span>
      );
    }
    if (sec === "airports") {
      return (
        <span
          style={{
            background: "rgba(14, 165, 233, 0.12)",
            color: "#38bdf8",
            border: "1px solid rgba(14, 165, 233, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-plane"></i>
          المطارات
        </span>
      );
    }
    if (sec === "ports") {
      return (
        <span
          style={{
            background: "rgba(20, 184, 166, 0.12)",
            color: "#2dd4bf",
            border: "1px solid rgba(20, 184, 166, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-anchor"></i>
          الموانئ البحرية
        </span>
      );
    }
    if (sec === "parking") {
      return (
        <span
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            color: "#fbbf24",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-parking"></i>
          الجراجات والمواقف
        </span>
      );
    }
    if (sec === "directory") {
      return (
        <span
          style={{
            background: "rgba(6, 182, 212, 0.12)",
            color: "#22d3ee",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-phone-call"></i>
          دليل الأرقام
        </span>
      );
    }
    if (sec === "routes") {
      return (
        <span
          style={{
            background: "rgba(139, 92, 246, 0.12)",
            color: "#c084fc",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-compass"></i>
          خطوط المواصلات
        </span>
      );
    }
    if (sec === "bugs") {
      return (
        <span
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="bx bx-bug"></i>
          بلاغ / خطأ بالنظام
        </span>
      );
    }
    return (
      <span
        style={{
          background: "rgba(245, 158, 11, 0.12)",
          color: "#fbbf24",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          padding: "3px 9px",
          borderRadius: "6px",
          fontSize: "0.74rem",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <i className="bx bx-bulb"></i>
        اقتراح عام وميزات
      </span>
    );
  };

  return (
    <div className={`${styles.reportCard} ${isOpen ? styles.reportCardActive : ""}`}>
      {/* Item Header */}
      <div onClick={onToggle} className={styles.cardTopHeader}>
        <div className={styles.cardMainInfo}>
          {/* Badges row */}
          <div className={styles.badgeRow}>
            {renderCategoryBadge()}
            {renderStatusBadge(item.status)}
            <span className={styles.timeTag}>
              <i className="bx bx-time"></i>
              {new Date(item.created_at).toLocaleString("ar-EG", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

          {/* Title */}
          <h3 className={styles.cardTitle}>{item.title}</h3>

          {/* User Mini Bar */}
          <div className={styles.userInfoRow}>
            <span className={styles.userItem}>
              <strong>
                {item.user_profile?.full_name ||
                  (isContactMsg ? `${item.first_name || ""} ${item.last_name || ""}`.trim() : null) ||
                  "مستخدم مسجل"}
              </strong>
              <i className="bx bx-user" style={{ color: "#60a5fa" }}></i>
            </span>

            {(item.user_profile?.phone || item.sender_phone) && (
              <a
                href={`tel:${item.user_profile?.phone || item.sender_phone}`}
                onClick={(e) => e.stopPropagation()}
                className={styles.userPhoneLink}
              >
                <i className="bx bx-phone"></i>
                {item.user_profile?.phone || item.sender_phone}
              </a>
            )}

            {(item.user_profile?.email || item.sender_email) && (
              <span className={styles.userItem}>
                <i className="bx bx-envelope" style={{ color: "var(--text-secondary)" }}></i>
                {item.user_profile?.email || item.sender_email}
              </span>
            )}
          </div>
        </div>

        <div className={styles.cardActionsTop}>
          {/* Add to Parking Button on Card Header */}
          {isParkingSuggestion && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddToParking(item);
              }}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "800",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
              }}
            >
              <i className="bx bx-parking" style={{ fontSize: "1rem" }}></i>
              <span>إضافة الجراج للدليل 🅿️</span>
            </button>
          )}

          {isDirectoryItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddToDirectory(item);
              }}
              style={{
                background: "rgba(6, 182, 212, 0.12)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#22d3ee",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <i className="bx bx-plus-circle" style={{ fontSize: "1rem" }}></i>
              <span>إضافة في الدليل</span>
            </button>
          )}

          {isPlaceReport && item.place_id && (
            <Link
              href={`/places/${item.place_id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                color: "#60a5fa",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>عرض المكان</span>
              <i className="bx bx-link-external"></i>
            </Link>
          )}

          <button
            type="button"
            className={`${styles.expandBtn} ${isOpen ? styles.expandBtnActive : ""}`}
          >
            {isOpen ? "إخفاء التفاصيل" : "معالجة ورد"}
            <i className={`bx bx-chevron-${isOpen ? "up" : "down"}`}></i>
          </button>
        </div>
      </div>

      {/* Main Content Box */}
      <div className={styles.cardContentBox}>
        {/* Structured details for Place Reports */}
        {isPlaceReport && item.details && (
          <div className={styles.structuredDetailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>نوع المشكلة:</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {getPlaceProblemLabel(item.problem_type || "", item.details)}
              </span>
            </div>

            {item.details.newName && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>الاسم المقترح:</span>
                <strong style={{ color: "#10b981" }}>{item.details.newName}</strong>
              </div>
            )}

            {item.details.newAddress && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>العنوان المقترح:</span>
                <strong>{item.details.newAddress}</strong>
              </div>
            )}

            {item.details.newMapsUrl && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>رابط الخريطة المقترح:</span>
                <a
                  href={item.details.newMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#60a5fa", wordBreak: "break-all" }}
                >
                  {item.details.newMapsUrl}
                </a>
              </div>
            )}

            {item.details.newPhones && item.details.newPhones.length > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>الهاتف المقترح:</span>
                <strong style={{ direction: "ltr", display: "inline-block" }}>
                  {item.details.newPhones.join(" - ")}
                </strong>
              </div>
            )}

            {item.details.newWebsite && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>الموقع المقترح:</span>
                <a
                  href={item.details.newWebsite}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#60a5fa" }}
                >
                  {item.details.newWebsite}
                </a>
              </div>
            )}
          </div>
        )}

        <p className={styles.contentText}>{item.content}</p>

        {item.image_url && (
          <div style={{ marginTop: "12px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.76rem",
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              مرفق مع البلاغ:
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt="مرفق"
              onClick={() => onPreviewImage(item.image_url!)}
              style={{
                maxWidth: "180px",
                maxHeight: "120px",
                borderRadius: "10px",
                border: "1px solid var(--border-glass)",
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>

      {/* Existing Admin Reply If Any */}
      {item.admin_reply && (
        <div className={styles.replyHistoryBox}>
          <div className={styles.replyHistoryHeader}>
            <i className="bx bx-check-circle"></i>
            <span>الرد السابق:</span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: "var(--text-primary)",
              lineHeight: "1.5",
              whiteSpace: "pre-line",
            }}
          >
            {item.admin_reply}
          </p>
        </div>
      )}

      {/* Expanded Action Panel */}
      {isOpen && (
        <div className={styles.expandedDrawer}>
          {/* Place Report Actions */}
          {isPlaceReport && (
            <div
              style={{
                background: "rgba(236, 72, 153, 0.05)",
                border: "1px solid rgba(236, 72, 153, 0.18)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--text-primary)" }}>
                إجراءات مكان « {item.place_name} »:
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {item.place_id && (
                  <Link
                    href={`/places/${item.place_id}`}
                    target="_blank"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="bx bx-link-external"></i>
                    معاينة صفحة المكان
                  </Link>
                )}
                {item.place_id && item.place_name !== "مكان محذوف أو غير معروف" && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenDeletePlaceDbModal({
                        placeId: item.place_id!,
                        placeName: item.place_name || "المكان",
                        reportId: item.id,
                      })
                    }
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      color: "#ef4444",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="bx bx-trash"></i>
                    حذف المكان من الموقع نهائياً
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status Changer Buttons */}
          <div className={styles.statusChangeRow}>
            <div className={styles.statusButtonsList}>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginLeft: "4px" }}>
                تغيير الحالة:
              </span>

              <button
                type="button"
                disabled={updatingStatusId === item.id}
                onClick={() => onUpdateStatus(item, "pending")}
                className={styles.actionBtnMini}
                style={{
                  border: item.status === "pending" ? "1px solid #f59e0b" : "1px solid var(--border-glass)",
                  background: item.status === "pending" ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  color: item.status === "pending" ? "#f59e0b" : "var(--text-secondary)",
                }}
              >
                ⏳ قيد الانتظار
              </button>

              <button
                type="button"
                disabled={updatingStatusId === item.id}
                onClick={() => onUpdateStatus(item, "reviewed")}
                className={styles.actionBtnMini}
                style={{
                  border: item.status === "reviewed" ? "1px solid #3b82f6" : "1px solid var(--border-glass)",
                  background: item.status === "reviewed" ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  color: item.status === "reviewed" ? "#60a5fa" : "var(--text-secondary)",
                }}
              >
                🔎 تمت المراجعة
              </button>

              <button
                type="button"
                disabled={updatingStatusId === item.id}
                onClick={() => onUpdateStatus(item, isPlaceReport ? "accepted" : "action_taken")}
                className={styles.actionBtnMini}
                style={{
                  border:
                    item.status === "action_taken" || item.status === "accepted"
                      ? "1px solid #10b981"
                      : "1px solid var(--border-glass)",
                  background:
                    item.status === "action_taken" || item.status === "accepted"
                      ? "rgba(16, 185, 129, 0.2)"
                      : "rgba(255, 255, 255, 0.03)",
                  color:
                    item.status === "action_taken" || item.status === "accepted"
                      ? "#10b981"
                      : "var(--text-secondary)",
                }}
              >
                ✅ {isPlaceReport ? "مقبول وتم التعديل" : "تم اتخاذ إجراء"}
              </button>

              {isPlaceReport && (
                <button
                  type="button"
                  disabled={updatingStatusId === item.id}
                  onClick={() => onUpdateStatus(item, "rejected")}
                  className={styles.actionBtnMini}
                  style={{
                    border: item.status === "rejected" ? "1px solid #ef4444" : "1px solid var(--border-glass)",
                    background: item.status === "rejected" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    color: item.status === "rejected" ? "#ef4444" : "var(--text-secondary)",
                  }}
                >
                  ❌ رفض البلاغ
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenDeleteModal(item)}
              className={styles.deleteReportBtn}
            >
              <i className="bx bx-trash"></i>
              حذف البلاغ
            </button>
          </div>

          {/* Reply Input Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-secondary)" }}>
              {isContactMsg
                ? "كتابة رد عبر البريد الإلكتروني (SMTP):"
                : "كتابة رد للمستخدم (سيصل كإشعار في حسابه):"}
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isContactMsg
                    ? "اكتب الرد هنا لإرساله إلى بريد المستخدم..."
                    : "اكتب الرد أو سبب قبول/رفض التعديل..."
                }
                style={{
                  flex: 1,
                  minWidth: "260px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.15)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)",
                  fontSize: "0.86rem",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <button
                type="button"
                disabled={replyingId === item.id || !replyText.trim()}
                onClick={() => onSendReply(item)}
                style={{
                  padding: "0 20px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: replyingId === item.id || !replyText.trim() ? "not-allowed" : "pointer",
                  opacity: replyingId === item.id || !replyText.trim() ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  alignSelf: "flex-end",
                  height: "42px",
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                }}
              >
                {replyingId === item.id ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #fff",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <i className={isContactMsg ? "bx bx-send" : "bx bx-bell"}></i>
                    <span>{isContactMsg ? "إرسال الإيميل" : "إرسال الرد والإشعار"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
