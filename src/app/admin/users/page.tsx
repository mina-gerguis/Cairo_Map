"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";
import CustomModal from "@/components/common/Modals";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  governorate: string | null;
  city: string | null;
  gender: string | null;
  dob: string | null;
  subscription_tier: string;
  subscription_period: string | null;
  subscription_status: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  balance?: number;
  promo_balance?: number;
  points?: number;
  created_at: string;
  is_admin: boolean;
  is_suspended?: boolean;
  suspended_at?: string | null;
  suspended_reason?: string | null;
}

interface ActivityEvent {
  id: string;
  title: string;
  type: "transaction" | "subscription" | "report" | "feedback" | "contact" | "notification" | "account";
  description: string;
  badgeText?: string;
  badgeColor?: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Suspend User Modal State
  const [suspendTarget, setSuspendTarget] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>("");
  const [suspending, setSuspending] = useState<boolean>(false);

  // Edit User Profile Modal State
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    governorate: "",
    city: "",
    gender: "ذكر",
    dob: "",
    is_admin: false,
    balance: 0,
    promo_balance: 0,
    points: 0,
    is_suspended: false,
    suspended_reason: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Notification Modal State
  const [notifUser, setNotifUser] = useState<UserProfile | null>(null);
  const [notifForm, setNotifForm] = useState({
    title: "",
    message: "",
    type: "info",
    link: "/profile",
  });
  const [sendingNotif, setSendingNotif] = useState(false);

  // Activity Log Modal State
  const [activityUser, setActivityUser] = useState<UserProfile | null>(null);
  const [userTimeline, setUserTimeline] = useState<ActivityEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Delete User Modal State
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.is_admin) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
          fetchUsers();
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    if (!supabase) return;
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch (err: any) {
      console.error("Error fetching user profiles:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Open Edit User Profile Modal with full fields
  const handleOpenEditModal = (targetUser: UserProfile) => {
    setEditUser(targetUser);

    let dobFormatted = "";
    if (targetUser.dob) {
      try {
        dobFormatted = new Date(targetUser.dob).toISOString().split("T")[0];
      } catch (e) {
        dobFormatted = targetUser.dob;
      }
    }

    setEditForm({
      full_name: targetUser.full_name || "",
      username: targetUser.username || "",
      email: targetUser.email || "",
      phone: targetUser.phone || "",
      governorate: targetUser.governorate || "",
      city: targetUser.city || "",
      gender: targetUser.gender || "ذكر",
      dob: dobFormatted,
      is_admin: !!targetUser.is_admin,
      balance: targetUser.balance || 0,
      promo_balance: targetUser.promo_balance || 0,
      points: targetUser.points || 0,
      is_suspended: !!targetUser.is_suspended,
      suspended_reason: targetUser.suspended_reason || "",
    });
    setStatusMessage(null);
  };

  // Save Edit User Profile
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !editUser) return;
    setSavingEdit(true);
    setStatusMessage(null);

    try {
      const isSuspendingNow = editForm.is_suspended;
      const suspendedReasonFinal = isSuspendingNow ? (editForm.suspended_reason.trim() || "تم إيقاف الحساب من قبل الإدارة") : null;
      const suspendedAtFinal = isSuspendingNow ? (editUser.suspended_at || new Date().toISOString()) : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          username: editForm.username,
          email: editForm.email,
          phone: editForm.phone,
          governorate: editForm.governorate,
          city: editForm.city,
          gender: editForm.gender,
          dob: editForm.dob || null,
          is_admin: editForm.is_admin,
          balance: Number(editForm.balance),
          promo_balance: Number(editForm.promo_balance),
          points: Number(editForm.points),
          is_suspended: isSuspendingNow,
          suspended_at: suspendedAtFinal,
          suspended_reason: suspendedReasonFinal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editUser.id);

      if (error) throw error;

      // If set to suspended, deactivate all user devices immediately to force logout
      if (isSuspendingNow) {
        await supabase
          .from("user_devices")
          .update({
            is_active: false,
            logged_out_at: new Date().toISOString(),
          })
          .eq("user_id", editUser.id);
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
              ...u,
              full_name: editForm.full_name,
              username: editForm.username,
              email: editForm.email,
              phone: editForm.phone,
              governorate: editForm.governorate,
              city: editForm.city,
              gender: editForm.gender,
              dob: editForm.dob || null,
              is_admin: editForm.is_admin,
              balance: Number(editForm.balance),
              promo_balance: Number(editForm.promo_balance),
              points: Number(editForm.points),
              is_suspended: isSuspendingNow,
              suspended_at: suspendedAtFinal,
              suspended_reason: suspendedReasonFinal,
            }
            : u
        )
      );

      setStatusMessage({
        type: "success",
        text: `تم تحديث كافة بيانات الحساب الخاص بـ (${editForm.full_name || editForm.username}) بنجاح!`,
      });
      setEditUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل تحديث بيانات الحساب: " + err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle User Suspension (Suspend / Unsuspend)
  const handleConfirmToggleSuspension = async () => {
    if (!supabase || !suspendTarget) return;
    setSuspending(true);
    setStatusMessage(null);

    const willSuspend = !suspendTarget.is_suspended;
    const finalReason = willSuspend ? (suspendReason.trim() || "تم إيقاف الحساب من قبل الإدارة") : null;

    try {
      // 1. Attempt RPC call first
      const { data: rpcData, error: rpcError } = await supabase.rpc("toggle_user_suspension", {
        p_user_id: suspendTarget.id,
        p_suspend: willSuspend,
        p_reason: finalReason,
      });

      if (rpcError) {
        // Fallback: update profiles table directly
        const { error: profileErr } = await supabase
          .from("profiles")
          .update({
            is_suspended: willSuspend,
            suspended_at: willSuspend ? new Date().toISOString() : null,
            suspended_reason: finalReason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", suspendTarget.id);

        if (profileErr) throw profileErr;

        // Invalidate active device sessions if suspending
        if (willSuspend) {
          await supabase
            .from("user_devices")
            .update({
              is_active: false,
              logged_out_at: new Date().toISOString(),
            })
            .eq("user_id", suspendTarget.id);
        }
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendTarget.id
            ? {
                ...u,
                is_suspended: willSuspend,
                suspended_at: willSuspend ? new Date().toISOString() : null,
                suspended_reason: finalReason,
              }
            : u
        )
      );

      setStatusMessage({
        type: "success",
        text: willSuspend
          ? `تم إيقاف وتعليق حساب (${suspendTarget.full_name || suspendTarget.username}) بنجاح وتسجيل خروجه من كافة الأجهزة!`
          : `تم إلغاء إيقاف حساب (${suspendTarget.full_name || suspendTarget.username}) وإعادة تفعيله بنجاح!`,
      });

      setSuspendTarget(null);
      setSuspendReason("");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `فشل ${willSuspend ? "إيقاف" : "إعادة تفعيل"} الحساب: ` + err.message,
      });
    } finally {
      setSuspending(false);
    }
  };

  // Open Notification Modal for a specific user
  const handleOpenNotificationModal = (targetUser: UserProfile) => {
    setNotifUser(targetUser);
    setNotifForm({
      title: "",
      message: "",
      type: "info",
      link: "/profile",
    });
    setStatusMessage(null);
  };

  // Send Personal Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !notifUser) return;
    setSendingNotif(true);
    setStatusMessage(null);

    try {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: notifUser.id,
          title: notifForm.title,
          message: notifForm.message,
          type: notifForm.type,
          link: notifForm.link || "/profile",
        },
      ]);

      if (error) throw error;

      setStatusMessage({
        type: "success",
        text: `تم إرسال الإشعار المخصص إلى (${notifUser.full_name || notifUser.username}) بنجاح!`,
      });
      setNotifUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل إرسال الإشعار: " + err.message });
    } finally {
      setSendingNotif(false);
    }
  };

  // Open Activity Timeline for a specific user
  const handleOpenActivityModal = async (targetUser: UserProfile) => {
    setActivityUser(targetUser);
    setLoadingTimeline(true);
    setUserTimeline([]);

    if (!supabase) return;

    try {
      const events: ActivityEvent[] = [];

      // 1. Registration Account Event
      events.push({
        id: `reg-${targetUser.id}`,
        title: "🎉 إنشاء الحساب والانضمام للموقع",
        type: "account",
        description: `انضمام المستخدم للنظام. المحافظة: ${targetUser.governorate || "غير محددة"} ${targetUser.city ? `(${targetUser.city})` : ""}${targetUser.gender ? ` | الجنس: ${targetUser.gender}` : ""}`,
        badgeText: "تسجيل جديد",
        badgeColor: "#6366f1",
        created_at: targetUser.created_at,
      });

      // 2. Fetch Balance Transactions (Deposits / Withdrawals)
      const { data: txData } = await supabase
        .from("balance_transactions")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (txData && txData.length > 0) {
        txData.forEach((tx) => {
          const isDeposit = tx.type === "deposit";
          events.push({
            id: `tx-${tx.id}`,
            title: isDeposit ? `💵 عملية إيداع رصيد (${tx.amount} ج.م)` : `💸 عملية سحب رصيد (${tx.amount} ج.م)`,
            type: "transaction",
            description: `وسيلة التحويل: ${tx.method} - المعرف/الحساب: ${tx.provider_number || "—"}${tx.admin_notes ? ` | ملاحظات الأدمن: ${tx.admin_notes}` : ""}`,
            badgeText: tx.status === "approved" ? "مكتملة 🟢" : tx.status === "pending" ? "قيد الانتظار ⏳" : "مرفوضة 🔴",
            badgeColor: tx.status === "approved" ? "#10b981" : tx.status === "pending" ? "#f59e0b" : "#ef4444",
            created_at: tx.created_at,
          });
        });
      }

      // 3. Fetch Place Reports
      const { data: reportsData } = await supabase
        .from("place_reports")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (reportsData && reportsData.length > 0) {
        reportsData.forEach((rep) => {
          events.push({
            id: `rep-${rep.id}`,
            title: `⚠️ بلاغ عن مكان: ${rep.problem_type}`,
            type: "report",
            description: `${rep.comment || "بلاغ حول إحدى الخدمات/الأماكن"}${rep.admin_reply ? ` | رد الإدارة: ${rep.admin_reply}` : ""}`,
            badgeText: rep.status === "resolved" ? "تم الحل 🟢" : "معلق ⏳",
            badgeColor: rep.status === "resolved" ? "#10b981" : "#f59e0b",
            created_at: rep.created_at,
          });
        });
      }

      // 4. Fetch App Feedback / Suggestions
      const { data: feedbackData } = await supabase
        .from("app_feedback")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (feedbackData && feedbackData.length > 0) {
        feedbackData.forEach((fb) => {
          events.push({
            id: `fb-${fb.id}`,
            title: fb.type === "bug" ? "🐛 بلاغ عن مشكلة تقنية" : "💡 اقتراح/فكرة جديدة",
            type: "feedback",
            description: `${fb.content}${fb.admin_reply ? ` | رد المشرف: ${fb.admin_reply}` : ""}`,
            badgeText: fb.status === "solved" ? "تم المعالجة 🟢" : "قيد المراجعة ⏳",
            badgeColor: fb.status === "solved" ? "#10b981" : "#3b82f6",
            created_at: fb.created_at,
          });
        });
      }

      // 5. Fetch Notifications sent to user
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (notifData && notifData.length > 0) {
        notifData.forEach((n) => {
          events.push({
            id: `notif-${n.id}`,
            title: `🔔 إشعار مستلم: ${n.title}`,
            type: "notification",
            description: n.message,
            badgeText: "إشعار نظام",
            badgeColor: "#818cf8",
            created_at: n.created_at,
          });
        });
      }

      // Sort timeline events chronologically (newest first)
      events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUserTimeline(events);
    } catch (err) {
      console.error("Error fetching user activity timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Delete User Completely
  const handleDeleteUserCompletely = async () => {
    if (!supabase || !deleteUser) return;
    setDeleting(true);
    setStatusMessage(null);

    try {
      // 1. Try calling the RPC function delete_user_by_admin
      const { data: rpcData, error: rpcError } = await supabase.rpc("delete_user_by_admin", {
        p_user_id: deleteUser.id,
      });

      if (rpcError) {
        // Fallback: Delete directly from profiles table if RPC function is missing
        const { error: profileDeleteErr } = await supabase
          .from("profiles")
          .delete()
          .eq("id", deleteUser.id);

        if (profileDeleteErr) throw profileDeleteErr;
      } else if (rpcData && !rpcData.success && rpcData.message) {
        throw new Error(rpcData.message);
      }

      // Update state locally
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));

      setStatusMessage({
        type: "success",
        text: `تم حذف حساب المستخدم (${deleteUser.full_name || deleteUser.username}) بالكامل من النظام!`,
      });
      setDeleteUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل حذف حساب المستخدم: " + err.message });
    } finally {
      setDeleting(false);
    }
  };

  // Filter users list
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.governorate || "").toLowerCase().includes(q) ||
      (u.gender || "").toLowerCase().includes(q);

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.is_admin) ||
      (roleFilter === "user" && !u.is_admin);

    const matchesTier = tierFilter === "all" || u.subscription_tier === tierFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !u.is_suspended) ||
      (statusFilter === "suspended" && !!u.is_suspended);

    return matchesSearch && matchesRole && matchesTier && matchesStatus;
  });

  // Calculate statistics
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter((u) => u.is_admin).length;
  const paidUsersCount = users.filter((u) => u.subscription_tier && u.subscription_tier !== "free").length;
  const suspendedUsersCount = users.filter((u) => u.is_suspended).length;
  const regularUsersCount = totalUsersCount - adminUsersCount;

  if (authChecking) {
    return (
      <div className={styles.adminLoadingContainer}>
        <div className={styles.spinner} />
        <p style={{ marginTop: "12px", color: "var(--textSecondary)" }}>جاري التحقق من الصلاحيات والبيانات...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.adminAccessDenied}>
        <i className="bx bx-lock-alt" style={{ fontSize: "4rem", color: "var(--accent-red)" }} />
        <h2 style={{ marginTop: "16px", color: "var(--textPrimary)" }}>عفواً، الدخول غير مصرح به</h2>
        <p style={{ color: "var(--textSecondary)" }}>هذه الصفحة مخصصة لمديري النظام فقط.</p>
        <button onClick={() => router.push("/")} className={styles.backBtn} style={{ marginTop: "16px" }}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className={styles.adminContent} style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Title Header */}
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.greetingTitle} style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>👥</span> إدارة الحسابات والمستخدمين
          </h1>
          <p className={styles.tableSubtitle} style={{ marginTop: "4px", fontSize: "0.9rem" }}>
            إدارة كافة حسابات الأعضاء المسجلين بالموقع، إيقاف وتعليق الحسابات أو فك الحظر، تعديل البيانات الشاملة (المحافظة، تاريخ الميلاد، الجنس، الرصيد، الصلاحية)، ومتابعة الأنشطة.
          </p>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className={styles.subStatsGrid}>
        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconPrimary}`}>
            <i className="bx bx-group" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{totalUsersCount}</span>
            <span className={styles.subStatLabel}>إجمالي المستخدمين</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconSuccess}`}>
            <i className="bx bx-user-check" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{regularUsersCount}</span>
            <span className={styles.subStatLabel}>أعضاء عاديون</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconWarning}`}>
            <i className="bx bx-crown" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{paidUsersCount}</span>
            <span className={styles.subStatLabel}>اشتراكات مميزة 💎</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconDanger}`}>
            <i className="bx bx-shield-quarter" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{adminUsersCount}</span>
            <span className={styles.subStatLabel}>مديرو النظام (Admins)</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={styles.subStatIcon} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
            <i className="bx bx-user-x" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue} style={{ color: suspendedUsersCount > 0 ? "#ef4444" : undefined }}>{suspendedUsersCount}</span>
            <span className={styles.subStatLabel}>حسابات معلقة / موقوفة ⛔</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`${styles.alert} ${statusMessage.type === "success" ? styles.alertSuccess : styles.alertError}`}
          style={{
            padding: "14px 20px",
            borderRadius: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.92rem",
            fontWeight: "700",
          }}
        >
          <i className={`bx ${statusMessage.type === "success" ? "bx-check-circle" : "bx-error-circle"}`} style={{ fontSize: "1.3rem" }} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Users Table Panel */}
      <div className={styles.subPanelCard}>
        {/* Filter and Search Toolbar */}
        <div className={styles.subFilterBar}>
          <h3 className={styles.subPanelHeaderTitle}>قائمة أعضاء الموقع</h3>

          <div className={styles.subFilterGroup}>
            {/* Search Input */}
            <div className={styles.subSearchWrapper}>
              <input
                type="text"
                placeholder="ابحث بالاسم، اليوزر، البريد، الهاتف، المحافظة أو الجنس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.subSearchInput}
              />
              <i className="bx bx-search" style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)", fontSize: "1.1rem" }} />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.subSelect}
            >
              <option value="all">كل الحالات 🔄</option>
              <option value="active">حسابات نشطة 🟢</option>
              <option value="suspended">حسابات موقوفة ومعلقة ⛔</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.subSelect}
            >
              <option value="all">كل الرتب</option>
              <option value="user">أعضاء عاديون 👤</option>
              <option value="admin">مسؤولين (Admins) 👑</option>
            </select>

            {/* Subscription Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className={styles.subSelect}
            >
              <option value="all">كل الباقات</option>
              <option value="gold">🥇 الباقة الذهبية</option>
              <option value="silver">🥈 الباقة الفضية</option>
              <option value="mishwar">⚡ باقة المشوار</option>
              <option value="free">⚪ المجانية</option>
            </select>
          </div>
        </div>

        {loadingUsers ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div className={styles.spinner} style={{ margin: "0 auto 14px" }} />
            <p style={{ color: "var(--textSecondary)", fontWeight: "600" }}>جاري تحميل حسابات المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.adsEmptyState}>
            <i className="bx bx-group" style={{ fontSize: "3rem", marginBottom: "8px", opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: "700" }}>لا يوجد مستخدمون يطابقون خيارات البحث الحالية.</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead className={styles.adminThead}>
                <tr>
                  <th className={styles.adminTh}>المستخدم</th>
                  <th className={styles.adminTh}>الرتبة والباقة</th>
                  <th className={styles.adminTh}>المعلومات والشخصية</th>
                  <th className={styles.adminTh}>الرصيد والتاريخ</th>
                  <th className={styles.adminTh} style={{ textAlign: "center" }}>إجراءات التحكم والسجل</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const initial = (u.full_name || u.username || "U").charAt(0).toUpperCase();

                  return (
                    <tr key={u.id} className={styles.adminTr}>
                      {/* User Info */}
                      <td className={styles.adminTd}>
                        <div className={styles.subUserBlock}>
                          <div className={styles.subUserAvatar}>
                            {initial}
                          </div>
                          <div>
                            <div className={styles.subUserName}>{u.full_name || "مستخدم بدون اسم"}</div>
                            <div className={styles.subUserMeta}>@{u.username || "بدون_يوزر"}</div>
                            <div className={styles.subUserMeta} style={{ color: "var(--colorSecondary)", fontWeight: "600" }}>
                              {u.email || u.phone || "بدون وسيلة تواصل"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Subscription Tier */}
                      <td className={styles.adminTd}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span className={styles.badge} style={{
                              background: u.is_admin ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.12)",
                              color: u.is_admin ? "#f87171" : "#818cf8",
                              border: u.is_admin ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(99, 102, 241, 0.3)",
                            }}>
                              {u.is_admin ? "👑 أدمن" : "👤 عضو"}
                            </span>

                            {u.is_suspended ? (
                              <span className={styles.badge} style={{
                                background: "rgba(239, 68, 68, 0.18)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                fontWeight: "800",
                              }}>
                                ⛔ موقوف
                              </span>
                            ) : (
                              <span className={styles.badge} style={{
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#10b981",
                                border: "1px solid rgba(16, 185, 129, 0.25)",
                                fontWeight: "700",
                                fontSize: "0.72rem",
                              }}>
                                🟢 نشط
                              </span>
                            )}
                          </div>

                          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--textSecondary)" }}>
                            باقة: {u.subscription_tier === "gold" ? "🥇 الذهبية" : u.subscription_tier === "silver" ? "🥈 الفضية" : u.subscription_tier === "mishwar" ? "⚡ المشوار" : "⚪ مجانية"}
                          </span>
                        </div>
                      </td>

                      {/* Governorate, City, Dob, Gender */}
                      <td className={styles.adminTd}>
                        <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.88rem" }}>
                          📍 {u.governorate ? `${u.governorate} ${u.city ? `(${u.city})` : ""}` : "غير محددة"}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "3px" }}>
                          {u.gender ? (u.gender === "ذكر" || u.gender === "male" ? "♂️ ذكر" : "♀️ أنثى") : "الجنس غير محدد"}
                          {u.dob ? ` • 🎂 ${new Date(u.dob).toLocaleDateString("ar-EG")}` : ""}
                        </div>
                      </td>

                      {/* Balance & Created At */}
                      <td className={styles.adminTd}>
                        <div style={{ fontWeight: "800", color: "#10b981", fontSize: "0.95rem" }}>
                          💵 {u.balance ? `${u.balance} ج.م` : "0 ج.م"}
                        </div>
                        {u.points ? (
                          <div style={{ fontSize: "0.78rem", color: "#eab308", fontWeight: "700", marginTop: "2px" }}>
                            ⭐ {u.points} نقطة
                          </div>
                        ) : null}
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          انضمام: {new Date(u.created_at).toLocaleDateString("ar-EG")}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className={styles.adminTd} style={{ textAlign: "center" }}>
                        <div className={styles.actionGroup} style={{ justifyContent: "center" }}>

                          {/* Edit User Data Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            style={{
                              background: "rgba(129, 248, 129, 0.15)",
                              color: "#53a353ff",
                              borderColor: "rgba(99, 102, 241, 0.3)",
                              borderRadius: "50%"
                            }}
                            title="تعديل كافة بيانات الحساب والشخصية والمالية"
                          >
                            <i className="bx bx-edit" />

                          </button>

                          {/* Suspend / Unsuspend User Button */}
                          {u.id !== user?.id && (
                            <button
                              onClick={() => {
                                setSuspendTarget(u);
                                setSuspendReason(u.suspended_reason || "");
                              }}
                              className={styles.actionBtn}
                              style={{
                                background: u.is_suspended ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                color: u.is_suspended ? "#10b981" : "#f59e0b",
                                borderColor: u.is_suspended ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)",
                                borderRadius: "50%"
                              }}
                              title={u.is_suspended ? "إلغاء الإيقاف وإعادة تنشيط الحساب" : "إيقاف وتعليق الحساب وتسجيل خروجه فوراً"}
                            >
                              <i className={`bx ${u.is_suspended ? "bx-lock-open-alt" : "bx-lock-alt"}`} />
                            </button>
                          )}

                          {/* Send Notification Button */}
                          <button
                            onClick={() => handleOpenNotificationModal(u)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            style={{
                              background: "rgba(68, 176, 239, 0.15)",
                              color: "#449aef",
                              borderColor: "rgba(68, 176, 239, 0.3)",
                              borderRadius: "50%"
                            }}
                            title="إرسال إشعار مخصص لهذا المستخدم"
                          >
                            <i className="bx bx-bell" />
                          </button>

                          {/* View Activity Timeline Button */}
                          <button
                            onClick={() => handleOpenActivityModal(u)}
                            className={`${styles.actionBtn} ${styles.actionBtnBranch}`}
                            style={{
                              background: "rgba(186, 226, 255, 0.15)",
                              color: "#5896f3ff",
                              borderColor: "rgba(99, 102, 241, 0.3)",
                              borderRadius: "50%"
                            }}
                            title="عرض سجل حركات ومعاملات المستخدم"
                          >
                            <i className="bx bx-history" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setDeleteUser(u)}
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              borderRadius: "50%"
                            }}
                            title="حذف حساب المستخدم نهائياً من النظام"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 0: Edit User Profile Data (FULL FIELDS) ── */}
      {editUser && (
        <div className={styles.subModalOverlay} onClick={() => setEditUser(null)}>
          <div className={styles.subModalBox} style={{ maxWidth: "660px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className={styles.subModalTitle}>
                ✏️ تعديل كامل بيانات حساب: {editUser.full_name || editUser.username}
              </h3>
              <button
                onClick={() => setEditUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* ── Section 1: Personal Info ── */}
              <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--colorSecondary)", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "6px" }}>
                👤 البيانات الشخصية ومعلومات الاتصال
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className={styles.subFormInput}
                    placeholder="مثال: أحمد محمد"
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>اسم المستخدم (Username)</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className={styles.subFormInput}
                    placeholder="مثال: ahmed123"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={styles.subFormInput}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className={styles.subFormInput}
                    placeholder="010xxxxxxxx"
                  />
                </div>
              </div>

              {/* ── Section 2: Demographic & Location ── */}
              <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--colorSecondary)", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "6px", marginTop: "8px" }}>
                📍 العنوان، تاريخ الميلاد، والجنس
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>المحافظة</label>
                  <input
                    type="text"
                    value={editForm.governorate}
                    onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                    className={styles.subFormInput}
                    placeholder="القاهرة، الجيزة، الإسكندرية..."
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>المدينة / المنطقة</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className={styles.subFormInput}
                    placeholder="مدينة نصر، المعادي..."
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>تاريخ الميلاد (Dob)</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>الجنس (Gender)</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    <option value="ذكر">ذكر ♂️</option>
                    <option value="أنثى">أنثى ♀️</option>
                  </select>
                </div>
              </div>

              {/* ── Section 3: Financial Balances & Role ── */}
              <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--colorSecondary)", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "6px", marginTop: "8px" }}>
                💵 الرصيد النقدي والسمات والأذونات
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>رصيد المحفظة (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>الرصيد الترويجي (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm.promo_balance}
                    onChange={(e) => setEditForm({ ...editForm, promo_balance: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>نقاط المكافآت (Points)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.points}
                    onChange={(e) => setEditForm({ ...editForm, points: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div>
                <label className={styles.subFormLabel}>صلاحية رتبة الحساب في لوحة التحكم</label>
                <select
                  value={editForm.is_admin ? "admin" : "user"}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.value === "admin" })}
                  className={styles.subFormSelect}
                >
                  <option value="user">عضو عادي (Regular User)</option>
                  <option value="admin">مسؤول نظام كامل (Admin) 👑</option>
                </select>
              </div>

              {/* ── Section 4: Account Status & Suspension ── */}
              <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--colorSecondary)", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "6px", marginTop: "8px" }}>
                🔒 حالة الحساب والتعليق
              </div>

              <div style={{ display: "grid", gridTemplateColumns: editForm.is_suspended ? "1fr 1fr" : "1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>حالة تنشيط الحساب</label>
                  <select
                    value={editForm.is_suspended ? "suspended" : "active"}
                    onChange={(e) => setEditForm({ ...editForm, is_suspended: e.target.value === "suspended" })}
                    className={styles.subFormSelect}
                  >
                    <option value="active">🟢 حساب نشط ويعمل بصورة طبيعية</option>
                    <option value="suspended">⛔ حساب معلق وموقوف (تسجيل خروج إجباري)</option>
                  </select>
                </div>
                {editForm.is_suspended && (
                  <div>
                    <label className={styles.subFormLabel}>سبب الإيقاف / التعليق</label>
                    <input
                      type="text"
                      value={editForm.suspended_reason}
                      onChange={(e) => setEditForm({ ...editForm, suspended_reason: e.target.value })}
                      className={styles.subFormInput}
                      placeholder="مثال: مخالفة شروط الاستخدام..."
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className={styles.inviteButton}
                  style={{ flex: 1, justifyContent: "center", padding: "12px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                  {savingEdit ? "جاري التحديث..." : "حفظ كافة التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--textSecondary)",
                    border: "1px solid var(--borderGlass)",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Send Targeted Personal Notification ── */}
      {notifUser && (
        <div className={styles.subModalOverlay} onClick={() => setNotifUser(null)}>
          <div className={styles.subModalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className={styles.subModalTitle}>
                🔔 إرسال إشعار مخصص إلى: {notifUser.full_name || notifUser.username}
              </h3>
              <button
                onClick={() => setNotifUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendNotification} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--bgGlass-card)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.85rem", border: "1px solid var(--borderGlass)" }}>
                <div>اسم المستخدم: <strong>@{notifUser.username || "بدون_يوزر"}</strong></div>
                <div>البريد: <strong>{notifUser.email || "غير متوفر"}</strong></div>
              </div>

              <div>
                <label className={styles.subFormLabel}>عنوان الإشعار</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تم إضافة رصيد مكافأة إلى حسابك"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  className={styles.subFormInput}
                />
              </div>

              <div>
                <label className={styles.subFormLabel}>نوع الإشعار</label>
                <select
                  value={notifForm.type}
                  onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                  className={styles.subFormSelect}
                >
                  <option value="info">معلومة / تنبيه عادي (Info) ℹ️</option>
                  <option value="success">نجاح / تأكيد (Success) ✅</option>
                  <option value="warning">تحذير (Warning) ⚠️</option>
                  <option value="error">مهم / عاجل (Error) 🚨</option>
                </select>
              </div>

              <div>
                <label className={styles.subFormLabel}>نص الرسالة والإشعار</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب نص الإشعار الموجه للمستخدم هنا..."
                  value={notifForm.message}
                  onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                  className={styles.subFormInput}
                  style={{ lineHeight: "1.5", resize: "vertical" }}
                />
              </div>

              <div>
                <label className={styles.subFormLabel}>رابط التوجيه (اختياري)</label>
                <input
                  type="text"
                  placeholder="/profile أو /points"
                  value={notifForm.link}
                  onChange={(e) => setNotifForm({ ...notifForm, link: e.target.value })}
                  className={styles.subFormInput}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={sendingNotif}
                  className={styles.inviteButton}
                  style={{ flex: 1, justifyContent: "center", padding: "12px" }}
                >
                  {sendingNotif ? "جاري الإرسال..." : "إرسال الإشعار الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => setNotifUser(null)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--textSecondary)",
                    border: "1px solid var(--borderGlass)",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: User Activity Log Timeline ── */}
      {activityUser && (
        <div className={styles.subModalOverlay} onClick={() => setActivityUser(null)}>
          <div className={styles.subModalBox} style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 className={styles.subModalTitle}>
                  📜 سجل حركات ومعاملات: {activityUser.full_name || activityUser.username}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--textSecondary)" }}>
                  يتضمن الشحن، السحب، البلاغات، والرسائل المسجلة لهذا المستخدم.
                </span>
              </div>
              <button
                onClick={() => setActivityUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            {loadingTimeline ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className={styles.spinner} style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "var(--textSecondary)", fontWeight: "600" }}>جاري تجميع سجل الحركات والتسلسلات...</p>
              </div>
            ) : userTimeline.length === 0 ? (
              <div className={styles.adsEmptyState} style={{ padding: "30px" }}>
                <i className="bx bx-history" style={{ fontSize: "2.5rem", opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: "700" }}>لا توجد حركات أو معاملات مسجلة بعد لهذا المستخدم.</p>
              </div>
            ) : (
              <div className={styles.timelineContainer}>
                {userTimeline.map((ev) => (
                  <div key={ev.id} className={styles.timelineItem}>
                    <div className={styles.timelineBadge} style={{ background: ev.badgeColor || "#6366f1" }}>
                      <i className="bx bx-check" />
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTitle}>
                        <span>{ev.title}</span>
                        {ev.badgeText && (
                          <span className={styles.badge} style={{ background: `${ev.badgeColor}22`, color: ev.badgeColor, border: `1px solid ${ev.badgeColor}44`, fontSize: "0.72rem" }}>
                            {ev.badgeText}
                          </span>
                        )}
                      </div>
                      <div className={styles.timelineDetails}>{ev.description}</div>
                      <div className={styles.timelineTime}>
                        ⏰ {new Date(ev.created_at).toLocaleString("ar-EG")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "24px", textAlign: "left" }}>
              <button
                type="button"
                onClick={() => setActivityUser(null)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  background: "var(--bgGlass-card)",
                  color: "var(--textPrimary)",
                  border: "1px solid var(--borderGlass)",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                إغلاق السجل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Confirm Delete User ── */}
      <CustomModal
        isOpen={Boolean(deleteUser)}
        onClose={() => !deleting && setDeleteUser(null)}
        title="تأكيد حذف حساب المستخدم"
        titleColor="#ef4444"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(239, 68, 68, 0.25)"
        message={deleteUser ? `هل أنت متأكد من رغبتك في حذف حساب (${deleteUser.full_name || deleteUser.username}) نهائياً من الموقع؟` : undefined}
        primaryButton={{
          label: deleting ? "جاري الحذف..." : "تأكيد الحذف النهائي",
          onClick: handleDeleteUserCompletely,
          bgColor: "#ef4444",
          disabled: deleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setDeleteUser(null),
          bgColor: "var(--cancelBtn)",
          disabled: deleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        <p style={{ color: "#ef4444", fontWeight: "bold", fontSize: "0.9rem", margin: 0, textAlign: "center" }}>
          ⚠️ هذا الإجراء لا يمكن التراجع عنه نهائياً وسيتم حذف كافة بياناته ومحفظته.
        </p>
      </CustomModal>

      {/* ── MODAL 4: Confirm Suspend / Unsuspend User ── */}
      <CustomModal
        isOpen={Boolean(suspendTarget)}
        onClose={() => !suspending && setSuspendTarget(null)}
        title={suspendTarget?.is_suspended ? "تأكيد إلغاء إيقاف الحساب" : "تأكيد إيقاف وتعليق الحساب"}
        titleColor={suspendTarget?.is_suspended ? "#10b981" : "#f59e0b"}
        borderColor={suspendTarget?.is_suspended ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}
        message={
          suspendTarget
            ? suspendTarget.is_suspended
              ? `هل تريد إلغاء إيقاف حساب (${suspendTarget.full_name || suspendTarget.username}) والسماح له بتسجيل الدخول واستخدام حسابه مجدداً؟`
              : `هل أنت متأكد من رغبتك في إيقاف وتعليق حساب (${suspendTarget.full_name || suspendTarget.username})؟`
            : undefined
        }
        primaryButton={{
          label: suspending
            ? suspendTarget?.is_suspended ? "جاري التنشيط..." : "جاري الإيقاف..."
            : suspendTarget?.is_suspended ? "تأكيد إعادة التفعيل" : "تأكيد الإيقاف الفوري",
          onClick: handleConfirmToggleSuspension,
          bgColor: suspendTarget?.is_suspended ? "#10b981" : "#f59e0b",
          disabled: suspending,
          icon: <i className={`bx ${suspendTarget?.is_suspended ? "bx-lock-open-alt" : "bx-lock-alt"}`} style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setSuspendTarget(null),
          bgColor: "var(--cancelBtn)",
          disabled: suspending,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        {!suspendTarget?.is_suspended ? (
          <div style={{ marginTop: "12px", width: "100%", textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
              سبب الإيقاف (اختياري، يوضح للمستخدم سبب التعليق):
            </label>
            <input
              type="text"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="مثال: مخالفة شروط الاستخدام أو بناء على قرار الإدارة"
              className={styles.subFormInput}
              style={{ width: "100%", textAlign: "right" }}
            />
            <p style={{ color: "#ef4444", fontWeight: "600", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
              ⚠️ سيتم تسجيل خروج المستخدم فوراً من كافة الأجهزة النشطة، ولن يتمكن من الدخول مجدداً حتى تفعيل حسابه.
            </p>
          </div>
        ) : (
          <p style={{ color: "#10b981", fontWeight: "bold", fontSize: "0.9rem", margin: 0, textAlign: "center" }}>
            ✅ بمجرد التأكيد، سيتمكن المستخدم من تسجيل الدخول إلى حسابه واستخدامه بصورة طبيعية.
          </p>
        )}
      </CustomModal>
    </div>
  );
}
