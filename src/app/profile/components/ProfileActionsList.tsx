"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsStars } from "react-icons/bs";
import { TbMessageCircleStar, TbMessageReportFilled } from "react-icons/tb";
import {
  UserProfile,
  FavoritePlaceItem,
  ReminderItem,
  PlaceProposal,
  PlaceReport,
  AppFeedback,
  FaqItem,
  ContactFormData,
} from "../types";
import { getProblemLabelAr } from "../utils";
import styles from "../page.module.css";

interface ProfileActionsListProps {
  user: any;
  profile: UserProfile | null;
  isOwnProfile: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  favorites: FavoritePlaceItem[];
  reminders: ReminderItem[];
  hasRemindersAccess: boolean;
  profileExpired: boolean;
  // Notifications
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteAll: () => void;
  onSelectNotification: (notif: any) => void;
  // Requests & Reports
  userProposals: PlaceProposal[];
  userReports: PlaceReport[];
  userAppFeedbacks: AppFeedback[];
  isLimitReached: boolean;
  isRequestsExpanded: boolean;
  setIsRequestsExpanded: (expanded: boolean) => void;
  activeRequestsTab: "proposals" | "reports" | "app_feedback";
  setActiveRequestsTab: (tab: "proposals" | "reports" | "app_feedback") => void;
  loadingRequests: boolean;
  onRetractProposal: (id: string) => void;
  onRetractReport: (id: string) => void;
  onDeleteFeedback: (fb: AppFeedback) => void;
  // Security
  activeCount: number;
  onOpenPasswordModal: () => void;
  onOpen2FAModal: () => void;
  onOpenDevicesModal: () => void;
  // Suggestions & Bugs
  onOpenSuggestionModal: () => void;
  onOpenBugReportModal: () => void;
  // Help & Support
  isHelpExpanded: boolean;
  setIsHelpExpanded: (expanded: boolean) => void;
  helpTab: "faq" | "social" | "contact";
  setHelpTab: (tab: "faq" | "social" | "contact") => void;
  faqs: FaqItem[];
  expandedFaq: number | null;
  setExpandedFaq: (idx: number | null) => void;
  faqQuestion: string;
  setFaqQuestion: (q: string) => void;
  faqAnswer: string;
  setFaqAnswer: (a: string) => void;
  faqLoading: boolean;
  handleAddFAQ: (e: React.FormEvent) => Promise<void>;
  handleDeleteFAQ: (id: string) => Promise<void>;
  contactForm: ContactFormData;
  setContactForm: React.Dispatch<React.SetStateAction<ContactFormData>>;
  contactSubmitted: boolean;
  setContactSubmitted: (s: boolean) => void;
  contactLoading: boolean;
  handleContactSubmit: (e: React.FormEvent) => Promise<void>;
  // Account
  onOpenSubModal: () => void;
  onOpenRemindersModal: () => void;
  onOpenLogoutModal: () => void;
  onOpenDeleteModal: () => void;
  onShowLimitMessage: () => void;
}

export const ProfileActionsList: React.FC<ProfileActionsListProps> = ({
  user,
  profile,
  isOwnProfile,
  theme,
  toggleTheme,
  favorites,
  reminders,
  hasRemindersAccess,
  profileExpired,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteAll,
  onSelectNotification,
  userProposals,
  userReports,
  userAppFeedbacks,
  isLimitReached,
  isRequestsExpanded,
  setIsRequestsExpanded,
  activeRequestsTab,
  setActiveRequestsTab,
  loadingRequests,
  onRetractProposal,
  onRetractReport,
  onDeleteFeedback,
  activeCount,
  onOpenPasswordModal,
  onOpen2FAModal,
  onOpenDevicesModal,
  onOpenSuggestionModal,
  onOpenBugReportModal,
  isHelpExpanded,
  setIsHelpExpanded,
  helpTab,
  setHelpTab,
  faqs,
  expandedFaq,
  setExpandedFaq,
  faqQuestion,
  setFaqQuestion,
  faqAnswer,
  setFaqAnswer,
  faqLoading,
  handleAddFAQ,
  handleDeleteFAQ,
  contactForm,
  setContactForm,
  contactSubmitted,
  setContactSubmitted,
  contactLoading,
  handleContactSubmit,
  onOpenSubModal,
  onOpenRemindersModal,
  onOpenLogoutModal,
  onOpenDeleteModal,
  onShowLimitMessage,
}) => {
  const router = useRouter();
  const [isNotificationsExpanded, setIsNotificationsExpanded] = React.useState(false);

  const getProposalStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            style={{
              background: "rgba(255, 149, 0, 0.15)",
              color: "#ff9500",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            قيد المراجعة
          </span>
        );
      case "approved":
        return (
          <span
            style={{
              background: "rgba(52, 199, 89, 0.15)",
              color: "#34c759",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            مقبول ومضاف
          </span>
        );
      case "rejected":
        return (
          <span
            style={{
              background: "rgba(255, 59, 48, 0.15)",
              color: "#ff3b30",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            مرفوض
          </span>
        );
      case "retracted":
        return (
          <span
            style={{
              background: "rgba(142, 142, 147, 0.15)",
              color: "#8e8e93",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            متراجع عنه
          </span>
        );
      default:
        return (
          <span
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
            }}
          >
            {status}
          </span>
        );
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            style={{
              background: "rgba(255, 149, 0, 0.15)",
              color: "#ff9500",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            قيد المراجعة
          </span>
        );
      case "reviewed":
        return (
          <span
            style={{
              background: "rgba(0, 122, 255, 0.15)",
              color: "#007aff",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            تحت النظر
          </span>
        );
      case "accepted":
        return (
          <span
            style={{
              background: "rgba(52, 199, 89, 0.15)",
              color: "#34c759",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            مقبول ومعدل
          </span>
        );
      case "rejected":
        return (
          <span
            style={{
              background: "rgba(255, 59, 48, 0.15)",
              color: "#ff3b30",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            مرفوض
          </span>
        );
      case "retracted":
        return (
          <span
            style={{
              background: "rgba(142, 142, 147, 0.15)",
              color: "#8e8e93",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
              fontWeight: "bold",
            }}
          >
            متراجع عنه
          </span>
        );
      default:
        return (
          <span
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.78rem",
            }}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <>
      {/* ─── Theme, Favorites, Notifications, Add Places ─── */}
      <div className={styles.sectionCard}>
        {/* Subscription Upgrade Card */}
        {user && (
          <>
            <div
              className={styles.cardContainer}
              onClick={() => {
                if (!isOwnProfile) return;
                onOpenSubModal();
              }}
              style={{ cursor: isOwnProfile ? "pointer" : "default" }}
            >
              <div className={styles.cardContent}>
                <div style={{ color: "var(--accent-gold, #eab308)" }}>
                  <i className={`bx bxs-crown ${styles.cardIcon}`}></i>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>ترقية الاشتراك</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {profileExpired ||
                    !profile?.subscription_tier ||
                    profile?.subscription_tier === "free"
                      ? "الباقة المجانية"
                      : profile?.subscription_tier === "mishwar"
                      ? profile?.subscription_status === "cancelled"
                        ? "باقة المشوار"
                        : "باقة المشوار "
                      : profile?.subscription_tier === "silver"
                      ? profile?.subscription_status === "cancelled"
                        ? "الباقة الفضية "
                        : "الباقة الفضية"
                      : profile?.subscription_tier === "gold"
                      ? profile?.subscription_status === "cancelled"
                        ? "الباقة الذهبية"
                        : "الباقة الذهبية"
                      : "الباقة المجانية"}
                    {!profileExpired &&
                      profile?.subscription_tier !== "free" &&
                      profile?.subscription_end &&
                      ` (${
                        profile?.subscription_status === "cancelled" ? "ستنتهي في" : "ينتهي في"
                      } ${new Date(profile.subscription_end).toLocaleDateString("ar-EG")})`}
                  </p>
                </div>
              </div>
              <div className={styles.badgeRight}>
                <span
                  className={styles.favBadge}
                  style={{
                    background: "none",
                    color: "var(--color-secondary)",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                  }}
                >
                  {!profileExpired && profile?.subscription_tier === "mishwar"
                    ? "المشوار"
                    : !profileExpired && profile?.subscription_tier === "silver"
                    ? "الفضية"
                    : !profileExpired && profile?.subscription_tier === "gold"
                    ? "الذهبية"
                    : "ترقية"}
                </span>
                {isOwnProfile && <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>}
              </div>
            </div>
            <hr className={styles.dividerDashed} />
          </>
        )}

        {/* Theme (Dark / Light Mode) */}
        <div className={styles.cardContainer} onClick={toggleTheme}>
          <div className={styles.cardContent}>
            <div style={{ color: "var(--color-primary)" }}>
              <i
                className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"} ${styles.cardIcon}`}
              ></i>
            </div>
            <div>
              <h3 className={styles.cardTitle}>
                {theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
              </h3>
            </div>
          </div>
          <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
        </div>

        {/* Favorite Places Card */}
        {isOwnProfile && (
          <>
            <hr className={styles.dividerDashed} />
            <div
              className={styles.cardContainer}
              onClick={() => router.push("/favorites")}
            >
              <div className={styles.cardContent}>
                <div style={{ color: "var(--accent-red)" }}>
                  <i className={`bx bxs-heart ${styles.cardIcon}`}></i>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>الأماكن المفضلة</h3>
                </div>
              </div>
              <div className={styles.badgeRight}>
                {favorites.length > 0 && (
                  <span className={styles.favBadge}>{favorites.length}</span>
                )}
                <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
              </div>
            </div>
          </>
        )}

        {/* Reminders Card */}
        {isOwnProfile && (
          <>
            <hr className={styles.dividerDashed} />
            <div
              className={styles.cardContainer}
              onClick={onOpenRemindersModal}
            >
              <div className={styles.cardContent}>
                <div style={{ color: "#34c759" }}>
                  <i className={`bx bx-notepad ${styles.cardIcon}`}></i>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h3 className={styles.cardTitle}>التذكيرات والملاحظات</h3>
                  {!hasRemindersAccess && (
                    <i
                      className="bx bxs-crown"
                      style={{ fontSize: "1rem", color: "#fbbf24" }}
                    ></i>
                  )}
                </div>
              </div>
              <div className={styles.badgeRight}>
                {reminders.length > 0 && (
                  <span className={styles.favBadge} style={{ background: "none" }}>
                    {reminders.length}
                  </span>
                )}
                <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
              </div>
            </div>
          </>
        )}

        {/* Notifications Card */}
        {isOwnProfile && (
          <>
            <hr className={styles.dividerDashed} />
            <div
              className={styles.cardContainer}
              style={{ flexDirection: "column", alignItems: "stretch" }}
              onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
            >
              <div className={styles.cardContent} style={{ justifyContent: "space-between" }}>
                <div className={styles.notifHeaderLeft}>
                  <div style={{ color: "var(--color-secondary)" }}>
                    <i className={`bx bxs-bell ${styles.cardIcon}`}></i>
                  </div>
                  <div>
                    <h3 className={styles.cardTitle}>الإشعارات</h3>
                  </div>
                </div>
                <div className={styles.badgeRight}>
                  {unreadCount > 0 && (
                    <span className={styles.notifBadgeRed}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  <i
                    className={`bx bx-chevron-${
                      isNotificationsExpanded ? "down" : "left"
                    } ${styles.chevronIcon}`}
                  ></i>
                </div>
              </div>

              {/* Notifications Expanded Section */}
              {isNotificationsExpanded && (
                <div className={styles.notifExpandedContent}>
                  <div className={styles.notifExpandedHeader}>
                    <h4 className={styles.notifExpandedTitle}>السجل</h4>
                    <div className={styles.notifActions}>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          className={`btn btn-ra-24 ${styles.notifBtnSmall}`}
                        >
                          قراءة الكل
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAll();
                          }}
                          className={`btn btn-danger btn-ra-24 ${styles.notifBtnDeleteAll}`}
                        >
                          حذف الكل
                        </button>
                      )}
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>
                      <i className={`bx bx-bell-off ${styles.notifEmptyIcon}`}></i>
                      <p className={styles.notifEmptyText}>لا توجد إشعارات حالياً</p>
                    </div>
                  ) : (
                    <div className={styles.notifList}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!notif.is_read) markAsRead(notif.id);
                            onSelectNotification(notif);
                          }}
                          className={`${styles.notifItem} ${
                            notif.is_read ? styles.notifItemRead : styles.notifItemUnread
                          }`}
                        >
                          <div className={styles.notifEmoji}>
                            {notif.type === "success"
                              ? "✅"
                              : notif.type === "warning"
                              ? "⚠️"
                              : "🔔"}
                          </div>
                          <div className={styles.notifItemBody}>
                            <h5
                              className={`${styles.notifItemTitle} ${
                                notif.is_read
                                  ? styles.notifItemTitleRead
                                  : styles.notifItemTitleUnread
                              }`}
                            >
                              {notif.title}
                            </h5>
                            <p className={styles.notifItemMsg}>{notif.message}</p>
                            <span className={styles.notifItemDate}>
                              {new Date(notif.created_at).toLocaleDateString("ar-EG", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {!notif.is_read && <div className={styles.notifUnreadDot} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Propose Place Card */}
        {isOwnProfile && user && (
          <>
            <hr className={styles.dividerDashed} />
            <div
              className={styles.cardContainer}
              onClick={() => {
                if (isLimitReached) {
                  onShowLimitMessage();
                } else {
                  router.push("/propose-place");
                }
              }}
            >
              <div className={styles.cardContent}>
                <div style={{ color: "var(--accent-secondary)" }}>
                  <i className={`bx bx-map-pin ${styles.cardIcon}`}></i>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>اقتراحات الأماكن</h3>
                </div>
              </div>
              <div className={styles.badgeRight}>
                <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
              </div>
            </div>
          </>
        )}

        {/* My Requests & Actions History Card */}
        {user && (
          <>
            <hr className={styles.dividerDashed} />
            <div
              className={styles.cardContainer}
              style={{ flexDirection: "column", alignItems: "stretch" }}
              onClick={() => setIsRequestsExpanded(!isRequestsExpanded)}
            >
              <div className={styles.cardContent} style={{ justifyContent: "space-between" }}>
                <div className={styles.notifHeaderLeft}>
                  <div style={{ color: "var(--color-primary)" }}>
                    <i className={`bx bx-history ${styles.cardIcon}`}></i>
                  </div>
                  <div>
                    <h3 className={styles.cardTitle}>سجل الإجراءات</h3>
                  </div>
                </div>
                <div className={styles.badgeRight}>
                  {userProposals.filter((p) => p.status === "pending").length +
                    userReports.filter((r) => r.status === "pending").length +
                    userAppFeedbacks.filter((f) => f.status === "pending").length >
                    0 && (
                    <span
                      className={styles.notifBadgeRed}
                      style={{ background: "var(--color-primary)" }}
                    >
                      {userProposals.filter((p) => p.status === "pending").length +
                        userReports.filter((r) => r.status === "pending").length +
                        userAppFeedbacks.filter((f) => f.status === "pending").length}
                    </span>
                  )}
                  <i
                    className={`bx bx-chevron-${
                      isRequestsExpanded ? "down" : "left"
                    } ${styles.chevronIcon}`}
                  ></i>
                </div>
              </div>

              {/* Collapsible Requests Content */}
              {isRequestsExpanded && (
                <div
                  className={styles.notifExpandedContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "16px",
                      background: "rgba(255,255,255,0.03)",
                      padding: "4px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveRequestsTab("proposals")}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background:
                          activeRequestsTab === "proposals"
                            ? "var(--color-primary)"
                            : "transparent",
                        color:
                          activeRequestsTab === "proposals" ? "#fff" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      الأماكن ({userProposals.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRequestsTab("reports")}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background:
                          activeRequestsTab === "reports"
                            ? "var(--color-primary)"
                            : "transparent",
                        color:
                          activeRequestsTab === "reports" ? "#fff" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      البلاغات ({userReports.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRequestsTab("app_feedback")}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background:
                          activeRequestsTab === "app_feedback"
                            ? "var(--color-primary)"
                            : "transparent",
                        color:
                          activeRequestsTab === "app_feedback"
                            ? "#fff"
                            : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      اقتراحات ({userAppFeedbacks.length})
                    </button>
                  </div>

                  {loadingRequests ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      جاري تحميل البيانات...
                    </div>
                  ) : activeRequestsTab === "proposals" ? (
                    userProposals.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        لم تقم باقتراح أي أماكن بعد.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          paddingLeft: "4px",
                        }}
                      >
                        {userProposals.map((prop) => (
                          <div
                            key={prop.id}
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid var(--border-glass)",
                              borderRadius: "12px",
                              padding: "12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <strong
                                style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}
                              >
                                {prop.name}
                              </strong>
                              {getProposalStatusBadge(prop.status)}
                            </div>
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                {prop.governorate} • {prop.city}
                              </span>
                              <span>
                                {new Date(prop.created_at).toLocaleDateString("ar-EG", {
                                  dateStyle: "short",
                                })}
                              </span>
                            </div>
                            {prop.rejection_reason && (
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#ff3b30",
                                  background: "rgba(255, 59, 48, 0.08)",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                }}
                              >
                                <strong>سبب الرفض:</strong> {prop.rejection_reason}
                              </div>
                            )}
                            {prop.status === "pending" && isOwnProfile && (
                              <button
                                type="button"
                                onClick={() => onRetractProposal(prop.id)}
                                className="btn"
                                style={{
                                  alignSelf: "flex-end",
                                  padding: "4px 10px",
                                  fontSize: "0.78rem",
                                  background: "rgba(255, 59, 48, 0.12)",
                                  color: "#ff3b30",
                                  border: "1px solid rgba(255, 59, 48, 0.2)",
                                  borderRadius: "6px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i> حذف
                                الطلب
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ) : activeRequestsTab === "reports" ? (
                    userReports.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        لم تقم بتقديم أي بلاغات بعد.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          paddingLeft: "4px",
                        }}
                      >
                        {userReports.map((report) => (
                          <div
                            key={report.id}
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid var(--border-glass)",
                              borderRadius: "12px",
                              padding: "12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <strong
                                style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}
                              >
                                {report.place_name}
                              </strong>
                              {getReportStatusBadge(report.status)}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              المشكلة: {getProblemLabelAr(report.problem_type)}
                            </div>
                            {report.admin_reply && (
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--color-primary)",
                                  background: "rgba(108, 99, 255, 0.08)",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                }}
                              >
                                <TbMessageCircleStar /> {report.admin_reply}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                {new Date(report.created_at).toLocaleDateString("ar-EG", {
                                  dateStyle: "short",
                                })}
                              </span>
                              {report.status === "pending" && isOwnProfile && (
                                <button
                                  type="button"
                                  onClick={() => onRetractReport(report.id)}
                                  className="btn"
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.78rem",
                                    background: "rgba(255, 59, 48, 0.12)",
                                    color: "#ff3b30",
                                    border: "1px solid rgba(255, 59, 48, 0.2)",
                                    borderRadius: "6px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    maxWidth: "140px",
                                  }}
                                >
                                  <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i> حذف
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : userAppFeedbacks.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      لم تقم بتقديم أي اقتراحات أو شكاوى للتطبيق بعد.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        paddingLeft: "4px",
                      }}
                    >
                      {userAppFeedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "12px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "0.95rem",
                                color: "var(--text-primary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {fb.type === "suggestion" ? (
                                <>
                                  <BsStars size={20} style={{ color: "var(--color-primary)" }} />
                                  <span>{fb.category}</span>
                                </>
                              ) : (
                                <>
                                  <TbMessageReportFilled
                                    size={20}
                                    style={{ color: "var(--accent-warning)" }}
                                  />
                                  <span>{fb.title}</span>
                                </>
                              )}
                            </strong>

                            {fb.status === "pending" && (
                              <span
                                style={{
                                  background: "rgba(255, 149, 0, 0.15)",
                                  color: "#ff9500",
                                  padding: "2px 8px",
                                  borderRadius: "8px",
                                  fontSize: "0.7rem",
                                  fontWeight: "bold",
                                }}
                              >
                                قيد النظر
                              </span>
                            )}
                            {fb.status === "reviewed" && (
                              <span
                                style={{
                                  background: "rgba(0, 122, 255, 0.15)",
                                  color: "#007aff",
                                  padding: "2px 8px",
                                  borderRadius: "8px",
                                  fontSize: "0.7rem",
                                  fontWeight: "bold",
                                }}
                              >
                                تمت المراجعة
                              </span>
                            )}
                            {fb.status === "action_taken" && (
                              <span
                                style={{
                                  background: "rgba(52, 199, 89, 0.15)",
                                  color: "#34c759",
                                  padding: "2px 8px",
                                  borderRadius: "8px",
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                }}
                              >
                                تم اتخاذ إجراء
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.82rem",
                              color: "var(--text-secondary)",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {fb.content}
                          </p>
                          {fb.image_url && (
                            <a
                              href={fb.image_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-primary)",
                                textDecoration: "underline",
                                alignSelf: "flex-start",
                              }}
                            >
                              🖼️ عرض الصورة المرفقة
                            </a>
                          )}
                          {fb.admin_reply && (
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--color-primary)",
                                background: "rgba(108, 99, 255, 0.08)",
                                padding: "6px 10px",
                                borderRadius: "8px",
                              }}
                            >
                              <TbMessageCircleStar /> {fb.admin_reply}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              {new Date(fb.created_at).toLocaleDateString("ar-EG", {
                                dateStyle: "short",
                              })}
                            </span>
                            {fb.status === "pending" && isOwnProfile && (
                              <button
                                type="button"
                                onClick={() => onDeleteFeedback(fb)}
                                className="btn"
                                style={{
                                  padding: "4px 10px",
                                  fontSize: "0.78rem",
                                  background: "rgba(255, 59, 48, 0.12)",
                                  color: "#ff3b30",
                                  border: "1px solid rgba(255, 59, 48, 0.2)",
                                  borderRadius: "6px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  maxWidth: "120px",
                                }}
                              >
                                <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i> حذف
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Security & 2FA ─── */}
      {user && isOwnProfile && (
        <div className={styles.sectionCard}>
          <div className={styles.cardContainer} onClick={onOpenPasswordModal}>
            <div className={styles.cardContent}>
              <div style={{ color: "#30b0c7" }}>
                <i className={`bx bx-lock-alt ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تغيير كلمة المرور</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>

          <hr className={styles.dividerDashed} />

          <div className={styles.cardContainer} onClick={onOpen2FAModal}>
            <div className={styles.cardContent}>
              <div style={{ color: "var(--accent-secondary)" }}>
                <i className={`bx bx-key ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>
                  المصادقة الثنائية ({activeCount} من 3)
                </h3>
              </div>
            </div>
            {activeCount > 0 ? (
              <i className={`bx bxs-check-circle ${styles.mfaCheckIcon}`}></i>
            ) : (
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            )}
          </div>

          <hr className={styles.dividerDashed} />

          <div className={styles.cardContainer} onClick={onOpenDevicesModal}>
            <div className={styles.cardContent}>
              <div style={{ color: "#30b0c7" }}>
                <i className={`bx bx-devices ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>إدارة الأجهزة</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </div>
      )}

      {/* ─── Suggestions & Bug Reports ─── */}
      {user && isOwnProfile && (
        <div className={styles.sectionCard}>
          <div
            className={styles.cardContainer}
            onClick={() => {
              if (isLimitReached) {
                onShowLimitMessage();
              } else {
                onOpenSuggestionModal();
              }
            }}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "var(--color-primary)" }}>
                <i className={`bx bx-message-square-detail ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تقديم اقتراح لتحسين التطبيق</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>

          <hr className={styles.dividerDashed} />

          <div
            className={styles.cardContainer}
            onClick={() => {
              if (isLimitReached) {
                onShowLimitMessage();
              } else {
                onOpenBugReportModal();
              }
            }}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "#ff3b30" }}>
                <i className={`bx bx-bug ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>الإبلاغ عن مشكلة في التطبيق</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </div>
      )}

      {/* ─── Help & Support ─── */}
      <div id="help-section" className={styles.sectionCard}>
        <div
          className={`${styles.cardContainer} ${isHelpExpanded ? styles.helpCardExpanded : ""}`}
          style={{ flexDirection: "column", alignItems: "normal" }}
          onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        >
          <div className={styles.cardContent} style={{ justifyContent: "space-between" }}>
            <div className={styles.helpHeaderLeft}>
              <div style={{ color: "var(--color-primary)" }}>
                <i className={`bx bx-help-circle ${styles.cardIcon}`}></i>
              </div>
              <h3 className={styles.cardTitle}>التواصل والمساعدة</h3>
            </div>
            <i
              className={`bx ${isHelpExpanded ? "bx-chevron-up" : "bx-chevron-down"} ${
                styles.chevronIcon
              }`}
            ></i>
          </div>

          {/* Expanded Help Center (Tabs) */}
          {isHelpExpanded && (
            <div onClick={(e) => e.stopPropagation()} className={styles.helpExpandedContent}>
              <div className={styles.tabsContainer}>
                <button
                  onClick={() => setHelpTab("faq")}
                  className={`${styles.tabBtn} ${helpTab === "faq" ? styles.tabBtnActive : ""}`}
                >
                  الأسئلة
                </button>
                <button
                  onClick={() => setHelpTab("social")}
                  className={`${styles.tabBtn} ${helpTab === "social" ? styles.tabBtnActive : ""}`}
                >
                  السوشيال
                </button>
                <button
                  onClick={() => setHelpTab("contact")}
                  className={`${styles.tabBtn} ${
                    helpTab === "contact" ? styles.tabBtnActive : ""
                  }`}
                >
                  مراسلتنا
                </button>
              </div>

              {/* TAB 1: FAQ */}
              {helpTab === "faq" && (
                <div className={styles.faqList}>
                  {faqs.length === 0 ? (
                    <p className={styles.faqEmptyText}>لا توجد أسئلة شائعة حالياً.</p>
                  ) : (
                    faqs.map((faq, index) => {
                      const isFaqExpanded = expandedFaq === index;
                      return (
                        <div key={faq.id} className={styles.faqItem}>
                          <div
                            onClick={() => setExpandedFaq(isFaqExpanded ? null : index)}
                            className={styles.faqQuestionRow}
                          >
                            <h4 className={styles.faqQuestionTitle}>{faq.question}</h4>
                            <div className={styles.faqActions}>
                              {profile?.is_admin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFAQ(faq.id);
                                  }}
                                  className={styles.faqDeleteBtn}
                                >
                                  <i className={`bx bx-trash ${styles.faqDeleteIcon}`}></i>
                                </button>
                              )}
                              <span className={styles.faqToggleIcon}>
                                {isFaqExpanded ? "−" : "+"}
                              </span>
                            </div>
                          </div>
                          {isFaqExpanded && (
                            <p className={styles.faqAnswerText}>{faq.answer}</p>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Admin Add FAQ Form */}
                  {profile?.is_admin && (
                    <form onSubmit={handleAddFAQ} className={styles.adminFaqForm}>
                      <h4 className={styles.adminFaqTitle}>
                        <i className={`bx bx-bulb ${styles.adminFaqIcon}`}></i> إضافة سؤال جديد
                      </h4>
                      <input
                        required
                        className="input-fields"
                        placeholder="السؤال..."
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                      />
                      <textarea
                        required
                        className={`input-fields ${styles.adminFaqTextarea}`}
                        placeholder="الإجابة..."
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={faqLoading}
                        className={`btn btn-primary ${styles.adminFaqSubmitBtn}`}
                      >
                        {faqLoading ? "جاري الإضافة..." : "حفظ السؤال الشائع"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: SOCIAL */}
              {helpTab === "social" && (
                <div className={styles.socialGrid}>
                  <a
                    href="https://www.whatsapp.com/channel/0029VbE5UzFGpLHIjyTobP3p"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`category-pill ${styles.socialPill}`}
                  >
                    <i className={`bx bxl-whatsapp ${styles.socialIconWhatsapp}`}></i>
                    <span>قناة الواتساب</span>
                  </a>
                  <a
                    href="https://www.facebook.com/share/1LTxiYMaJm/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`category-pill ${styles.socialPill}`}
                  >
                    <i className={`bx bxl-facebook-circle ${styles.socialIconFacebook}`}></i>
                    <span>فيسبوك</span>
                  </a>
                  <a
                    href="https://x.com/cairo_map"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`category-pill ${styles.socialPill}`}
                  >
                    <svg width="20px" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>تويتر</span>
                  </a>
                  <a
                    href="https://instagram.com/map_cairo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`category-pill ${styles.socialPill}`}
                  >
                    <i className={`bx bxl-instagram ${styles.socialIconInstagram}`}></i>
                    <span>إنستغرام</span>
                  </a>
                </div>
              )}

              {/* TAB 3: CONTACT FORM */}
              {helpTab === "contact" && (
                <div>
                  {contactSubmitted ? (
                    <div className={styles.contactSuccess}>
                      <div className={styles.contactSuccessIcon}>
                        <i className="bx bxs-check-circle"></i>
                      </div>
                      <h4 className={styles.contactSuccessTitle}>تم إرسال رسالتك بنجاح!</h4>
                      <p className={styles.contactSuccessMsg}>
                        شكراً لتواصلك معنا. سيقوم فريق الدعم الفني بالرد عليك في أقرب وقت.
                      </p>
                      <button className="btn" onClick={() => setContactSubmitted(false)}>
                        إرسال رسالة أخرى
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                      <div className={styles.grid2Col}>
                        <input
                          required
                          className="input-fields"
                          placeholder="الاسم الأول"
                          value={contactForm.firstName}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, firstName: e.target.value })
                          }
                        />
                        <input
                          required
                          className="input-fields"
                          placeholder="الاسم الأخير"
                          value={contactForm.lastName}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, lastName: e.target.value })
                          }
                        />
                      </div>
                      <div className={styles.grid2Col}>
                        <input
                          required
                          className={`input-fields ${styles.inputLtrRight}`}
                          placeholder="رقم الهاتف"
                          value={contactForm.phone}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, phone: e.target.value })
                          }
                        />
                        <input
                          required
                          className={`input-fields ${styles.inputLtrRight}`}
                          type="email"
                          placeholder="البريد الإلكتروني"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, email: e.target.value })
                          }
                        />
                      </div>
                      <select
                        required
                        className="input-fields help-select"
                        value={contactForm.contactType}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, contactType: e.target.value })
                        }
                      >
                        <option value="">نوع التواصل...</option>
                        <option value="إبلاغ">إبلاغ</option>
                        <option value="شكوى">شكوى</option>
                        <option value="طلب مساعدة">طلب مساعدة</option>
                        <option value="اقتراح تطوير">اقتراح تطوير</option>
                      </select>
                      <textarea
                        required
                        className={`input-fields ${styles.contactTextarea}`}
                        placeholder="اكتب تفاصيل رسالتك هنا..."
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, message: e.target.value })
                        }
                      />
                      <button
                        type="submit"
                        disabled={contactLoading}
                        className={`btn btn-primary ${styles.contactSubmitBtn}`}
                      >
                        {contactLoading ? "جاري الإرسال..." : "إرسال الرسالة"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={styles.dividerDashed} />

        {/* Privacy Policy Link */}
        <Link href="/privacy" style={{ textDecoration: "none" }}>
          <div className={styles.cardContainer}>
            <div className={styles.cardContent}>
              <div style={{ color: "#00d2ff" }} className={styles.iconWrapper}>
                <i className={`bx bx-shield-quarter ${styles.cardIcon}`}></i>
              </div>
              <h3 className={styles.cardTitle}>سياسة الخصوصية</h3>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </Link>

        <hr className={styles.dividerDashed} />

        {/* Terms of Use Link */}
        <Link href="/terms" style={{ textDecoration: "none" }}>
          <div className={styles.cardContainer}>
            <div className={styles.cardContent}>
              <div style={{ color: "#a51c87ff" }}>
                <i className={`bx bx-file ${styles.cardIcon}`}></i>
              </div>
              <h3 className={styles.cardTitle}>شروط الاستخدام</h3>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </Link>
      </div>

      {/* ─── Advanced Settings: Logout & Delete Account ─── */}
      {user && isOwnProfile && (
        <div className={styles.sectionCard}>
          <div className={styles.cardContainer} onClick={onOpenLogoutModal}>
            <div className={styles.cardContent}>
              <div style={{ color: "#ff3b30" }}>
                <i className={`bx bx-log-out ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تسجيل الخروج</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>

          <hr className={styles.dividerDashed} />

          <div className={styles.cardContainer} onClick={onOpenDeleteModal}>
            <div className={styles.cardContent}>
              <div style={{ color: "#ff3b30" }}>
                <i className={`bx bx-user-minus ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle} style={{ color: "#ff3b30" }}>
                  حذف الحساب
                </h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </div>
      )}
    </>
  );
};
