"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";
import uStyles from "./users.module.css";
import CustomModal from "@/components/common/Modals";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
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

const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الشرقية",
  "الغربية",
  "المنوفية",
  "البحيرة",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "شمال سيناء",
  "جنوب سيناء",
  "بني سويف",
  "الفيوم",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
];

// Helper to format relative time in Arabic
function getRelativeTimeArabic(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffHours < 1) return "منذ لحظات";
    if (diffHours < 24) return `منذ ${diffHours} ${diffHours === 1 ? "ساعة" : diffHours === 2 ? "ساعتين" : diffHours <= 10 ? "ساعات" : "ساعة"}`;
    if (diffDays === 1) return "أمس";
    if (diffDays === 2) return "منذ يومين";
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    if (diffMonths === 1) return "منذ شهر";
    if (diffMonths === 2) return "منذ شهرين";
    if (diffMonths < 12) return `منذ ${diffMonths} أشهر`;
    if (diffYears === 1) return "منذ سنة";
    return `منذ ${diffYears} سنوات`;
  } catch {
    return "";
  }
}

// Helper to calculate age from DOB
function calculateAge(dobStr: string | null): number | null {
  if (!dobStr) return null;
  try {
    const dob = new Date(dobStr);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return isNaN(age) ? null : age;
  } catch {
    return null;
  }
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [govFilter, setGovFilter] = useState<string>("all");
  const [balanceFilter, setBalanceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "balance" | "points">("newest");

  // Selection for Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Tooltip / Feedback States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // View User Profile Card Modal
  const [viewUser, setViewUser] = useState<UserProfile | null>(null);

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
    subscription_tier: "free",
    is_admin: false,
    balance: 0,
    promo_balance: 0,
    points: 0,
    is_suspended: false,
    suspended_reason: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick Adjust Balance & Points Modal State
  const [adjustTargetUser, setAdjustTargetUser] = useState<UserProfile | null>(null);
  const [adjustAsset, setAdjustAsset] = useState<"balance" | "promo_balance" | "points">("balance");
  const [adjustType, setAdjustType] = useState<"deposit" | "withdraw">("deposit");
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [savingAdjust, setSavingAdjust] = useState(false);

  // Notification Modal State (Single User)
  const [notifUser, setNotifUser] = useState<UserProfile | null>(null);
  const [notifForm, setNotifForm] = useState({
    title: "",
    message: "",
    type: "info",
    link: "/profile",
  });
  const [sendingNotif, setSendingNotif] = useState(false);

  // Bulk Notification Modal State
  const [showBulkNotifModal, setShowBulkNotifModal] = useState(false);
  const [bulkNotifForm, setBulkNotifForm] = useState({
    title: "",
    message: "",
    type: "info",
    link: "/profile",
  });
  const [sendingBulkNotif, setSendingBulkNotif] = useState(false);

  // Activity Log Modal State
  const [activityUser, setActivityUser] = useState<UserProfile | null>(null);
  const [userTimeline, setUserTimeline] = useState<ActivityEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<string>("all");

  // Delete User Modal State
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    governorate: "القاهرة",
    city: "",
    gender: "ذكر",
    dob: "",
    subscription_tier: "free",
    is_admin: false,
    balance: 0,
    points: 0,
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // Export State
  const [exportingExcel, setExportingExcel] = useState(false);

  // Auth checking and initial fetch
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
      } catch {
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
      setStatusMessage({ type: "error", text: "فشل تحميل قائمة المستخدمين: " + err.message });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Copy User ID to clipboard
  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Open Edit User Profile Modal with full fields
  const handleOpenEditModal = (targetUser: UserProfile) => {
    setEditUser(targetUser);

    let dobFormatted = "";
    if (targetUser.dob) {
      try {
        dobFormatted = new Date(targetUser.dob).toISOString().split("T")[0];
      } catch {
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
      subscription_tier: targetUser.subscription_tier || "free",
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
      const suspendedReasonFinal = isSuspendingNow
        ? (editForm.suspended_reason.trim() || "تم إيقاف الحساب من قبل الإدارة")
        : null;
      const suspendedAtFinal = isSuspendingNow
        ? (editUser.suspended_at || new Date().toISOString())
        : null;

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
          subscription_tier: editForm.subscription_tier,
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

      if (isSuspendingNow) {
        await supabase
          .from("user_devices")
          .update({
            is_active: false,
            logged_out_at: new Date().toISOString(),
          })
          .eq("user_id", editUser.id);
      }

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
                subscription_tier: editForm.subscription_tier,
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

      // If viewUser modal is currently open for this user, sync it as well
      if (viewUser && viewUser.id === editUser.id) {
        setViewUser((prev) =>
          prev
            ? {
                ...prev,
                full_name: editForm.full_name,
                username: editForm.username,
                email: editForm.email,
                phone: editForm.phone,
                governorate: editForm.governorate,
                city: editForm.city,
                gender: editForm.gender,
                dob: editForm.dob || null,
                subscription_tier: editForm.subscription_tier,
                is_admin: editForm.is_admin,
                balance: Number(editForm.balance),
                promo_balance: Number(editForm.promo_balance),
                points: Number(editForm.points),
                is_suspended: isSuspendingNow,
                suspended_at: suspendedAtFinal,
                suspended_reason: suspendedReasonFinal,
              }
            : null
        );
      }

      setStatusMessage({
        type: "success",
        text: `تم تحديث بيانات (${editForm.full_name || editForm.username}) بنجاح!`,
      });
      setEditUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل تحديث بيانات الحساب: " + err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Quick Balance & Points Modal
  const handleOpenAdjustModal = (targetUser: UserProfile) => {
    setAdjustTargetUser(targetUser);
    setAdjustAsset("balance");
    setAdjustType("deposit");
    setAdjustAmount("");
    setAdjustReason("");
    setStatusMessage(null);
  };

  // Save Quick Balance & Points Adjustment
  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !adjustTargetUser) return;

    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatusMessage({ type: "error", text: "يرجى إدخال مبلغ صحيح أكبر من الصفر." });
      return;
    }

    setSavingAdjust(true);
    try {
      const currentVal = Number(adjustTargetUser[adjustAsset] || 0);
      let newVal = 0;
      if (adjustType === "deposit") {
        newVal = currentVal + amountNum;
      } else {
        newVal = Math.max(0, currentVal - amountNum);
      }

      // Update profile
      const updatePayload: Record<string, any> = {
        [adjustAsset]: newVal,
        updated_at: new Date().toISOString(),
      };

      const { error: profileErr } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", adjustTargetUser.id);

      if (profileErr) throw profileErr;

      // Log to balance_transactions if balance or promo_balance
      if (adjustAsset === "balance" || adjustAsset === "promo_balance") {
        try {
          const isDeposit = adjustType === "deposit";
          await supabase.from("balance_transactions").insert({
            user_id: adjustTargetUser.id,
            type: isDeposit ? "deposit" : "withdrawal",
            method: isDeposit ? "admin_reward" : "admin_deduction",
            amount: parseFloat(amountNum.toFixed(2)),
            provider_number: "system_admin",
            recipient_name: adjustTargetUser.full_name || adjustTargetUser.username || "مستخدم",
            transaction_id: "ADM_" + Date.now(),
            status: "approved",
            admin_notes:
              adjustReason.trim() ||
              `تعديل إداري (${adjustAsset === "promo_balance" ? "رصيد ترويجي" : "رصيد أساسي"}): ${isDeposit ? "إضافة رصيد" : "خصم رصيد"}`,
          });
        } catch (logErr) {
          console.warn("Could not log balance transaction:", logErr);
        }
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === adjustTargetUser.id ? { ...u, [adjustAsset]: newVal } : u
        )
      );

      if (viewUser && viewUser.id === adjustTargetUser.id) {
        setViewUser((prev) => (prev ? { ...prev, [adjustAsset]: newVal } : null));
      }

      const assetLabel =
        adjustAsset === "balance"
          ? "رصيد المحفظة الأساسي"
          : adjustAsset === "promo_balance"
          ? "الرصيد الترويجي"
          : "نقاط المكافآت";

      setStatusMessage({
        type: "success",
        text: `تم ${adjustType === "deposit" ? "إضافة" : "خصم"} ${amountNum} من (${assetLabel}) لحساب (${adjustTargetUser.full_name || adjustTargetUser.username}) بنجاح!`,
      });
      setAdjustTargetUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل تعديل الرصيد: " + err.message });
    } finally {
      setSavingAdjust(false);
    }
  };

  // Create New User
  const handleSaveAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSavingAdd(true);
    setStatusMessage(null);

    try {
      const generatedId = crypto.randomUUID();
      const { error } = await supabase.from("profiles").insert([
        {
          id: generatedId,
          full_name: addForm.full_name,
          username: addForm.username || `user_${Date.now().toString().slice(-6)}`,
          email: addForm.email || null,
          phone: addForm.phone || null,
          governorate: addForm.governorate,
          city: addForm.city || null,
          gender: addForm.gender,
          dob: addForm.dob || null,
          subscription_tier: addForm.subscription_tier,
          is_admin: addForm.is_admin,
          balance: Number(addForm.balance),
          points: Number(addForm.points),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setStatusMessage({
        type: "success",
        text: `تم إنشاء حساب المستخدم (${addForm.full_name || addForm.username}) بنجاح!`,
      });
      setShowAddUserModal(false);
      setAddForm({
        full_name: "",
        username: "",
        email: "",
        phone: "",
        governorate: "القاهرة",
        city: "",
        gender: "ذكر",
        dob: "",
        subscription_tier: "free",
        is_admin: false,
        balance: 0,
        points: 0,
      });
      fetchUsers();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل إنشاء الحساب: " + err.message });
    } finally {
      setSavingAdd(false);
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
      const { error: rpcError } = await supabase.rpc("toggle_user_suspension", {
        p_user_id: suspendTarget.id,
        p_suspend: willSuspend,
        p_reason: finalReason,
      });

      if (rpcError) {
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

      if (viewUser && viewUser.id === suspendTarget.id) {
        setViewUser((prev) =>
          prev
            ? {
                ...prev,
                is_suspended: willSuspend,
                suspended_at: willSuspend ? new Date().toISOString() : null,
                suspended_reason: finalReason,
              }
            : null
        );
      }

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

  // Send Single User Notification
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
        text: `تم إرسال الإشعار بنجاح إلى (${notifUser.full_name || notifUser.username})!`,
      });
      setNotifUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل إرسال الإشعار: " + err.message });
    } finally {
      setSendingNotif(false);
    }
  };

  // Send Bulk Notification to Selected Users
  const handleSendBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || selectedUserIds.length === 0) return;
    setSendingBulkNotif(true);
    setStatusMessage(null);

    try {
      const rows = selectedUserIds.map((uid) => ({
        user_id: uid,
        title: bulkNotifForm.title,
        message: bulkNotifForm.message,
        type: bulkNotifForm.type,
        link: bulkNotifForm.link || "/profile",
      }));

      const { error } = await supabase.from("notifications").insert(rows);
      if (error) throw error;

      setStatusMessage({
        type: "success",
        text: `تم إرسال الإشعار الجماعي بنجاح إلى ${selectedUserIds.length} مستخدم!`,
      });
      setShowBulkNotifModal(false);
      setSelectedUserIds([]);
      setBulkNotifForm({ title: "", message: "", type: "info", link: "/profile" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل إرسال الإشعارات الجماعية: " + err.message });
    } finally {
      setSendingBulkNotif(false);
    }
  };

  // Activity Timeline
  const handleOpenActivityModal = async (targetUser: UserProfile) => {
    setActivityUser(targetUser);
    setLoadingTimeline(true);
    setUserTimeline([]);
    setTimelineFilter("all");

    if (!supabase) return;

    try {
      const events: ActivityEvent[] = [];

      // 1. Account Creation
      events.push({
        id: `reg-${targetUser.id}`,
        title: "🎉 إنشاء الحساب والانضمام",
        type: "account",
        description: `انضمام المستخدم للنظام. المحافظة: ${targetUser.governorate || "غير محددة"} ${targetUser.city ? `(${targetUser.city})` : ""}`,
        badgeText: "تسجيل جديد",
        badgeColor: "#6366f1",
        created_at: targetUser.created_at,
      });

      // 2. Transactions
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
            title: isDeposit ? `💵 إيداع رصيد (${tx.amount} ج.م)` : `💸 سحب رصيد (${tx.amount} ج.م)`,
            type: "transaction",
            description: `وسيلة التحويل: ${tx.method} - المعرف: ${tx.provider_number || "—"}${tx.admin_notes ? ` | ملاحظات: ${tx.admin_notes}` : ""}`,
            badgeText: tx.status === "approved" ? "مكتملة 🟢" : tx.status === "pending" ? "قيد الانتظار ⏳" : "مرفوضة 🔴",
            badgeColor: tx.status === "approved" ? "#10b981" : tx.status === "pending" ? "#f59e0b" : "#ef4444",
            created_at: tx.created_at,
          });
        });
      }

      // 3. Place Reports
      const { data: reportsData } = await supabase
        .from("place_reports")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (reportsData && reportsData.length > 0) {
        reportsData.forEach((rep) => {
          events.push({
            id: `rep-${rep.id}`,
            title: `⚠️ بلاغ: ${rep.problem_type}`,
            type: "report",
            description: `${rep.comment || "بلاغ حول إحدى الخدمات"}${rep.admin_reply ? ` | رد الإدارة: ${rep.admin_reply}` : ""}`,
            badgeText: rep.status === "resolved" ? "تم الحل 🟢" : "معلق ⏳",
            badgeColor: rep.status === "resolved" ? "#10b981" : "#f59e0b",
            created_at: rep.created_at,
          });
        });
      }

      // 4. App Feedback
      const { data: feedbackData } = await supabase
        .from("app_feedback")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (feedbackData && feedbackData.length > 0) {
        feedbackData.forEach((fb) => {
          events.push({
            id: `fb-${fb.id}`,
            title: fb.type === "bug" ? "🐛 بلاغ خطأ تقني" : "💡 اقتراح فكرة",
            type: "feedback",
            description: `${fb.content}${fb.admin_reply ? ` | رد المشرف: ${fb.admin_reply}` : ""}`,
            badgeText: fb.status === "solved" ? "تمت المعالجة 🟢" : "قيد المراجعة ⏳",
            badgeColor: fb.status === "solved" ? "#10b981" : "#3b82f6",
            created_at: fb.created_at,
          });
        });
      }

      // 5. Notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false });

      if (notifData && notifData.length > 0) {
        notifData.forEach((n) => {
          events.push({
            id: `notif-${n.id}`,
            title: `🔔 إشعار: ${n.title}`,
            type: "notification",
            description: n.message,
            badgeText: "إشعار نظام",
            badgeColor: "#818cf8",
            created_at: n.created_at,
          });
        });
      }

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
      const { data: rpcData, error: rpcError } = await supabase.rpc("delete_user_by_admin", {
        p_user_id: deleteUser.id,
      });

      if (rpcError) {
        const { error: profileDeleteErr } = await supabase
          .from("profiles")
          .delete()
          .eq("id", deleteUser.id);

        if (profileDeleteErr) throw profileDeleteErr;
      } else if (rpcData && !rpcData.success && rpcData.message) {
        throw new Error(rpcData.message);
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setSelectedUserIds((prev) => prev.filter((id) => id !== deleteUser.id));

      if (viewUser && viewUser.id === deleteUser.id) {
        setViewUser(null);
      }

      setStatusMessage({
        type: "success",
        text: `تم حذف حساب المستخدم (${deleteUser.full_name || deleteUser.username}) نهائياً من الموقع!`,
      });
      setDeleteUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل حذف حساب المستخدم: " + err.message });
    } finally {
      setDeleting(false);
    }
  };

  // Filtered & Sorted Users List
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return users
      .filter((u) => {
        const matchesSearch =
          !q ||
          (u.full_name || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.phone || "").toLowerCase().includes(q) ||
          (u.id || "").toLowerCase().includes(q) ||
          (u.governorate || "").toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
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

        const matchesGov = govFilter === "all" || u.governorate === govFilter;

        const matchesBalance =
          balanceFilter === "all" ||
          (balanceFilter === "positive" && (u.balance || 0) > 0) ||
          (balanceFilter === "zero" && (u.balance || 0) <= 0);

        return matchesSearch && matchesRole && matchesTier && matchesStatus && matchesGov && matchesBalance;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "name") {
          const nameA = a.full_name || a.username || "";
          const nameB = b.full_name || b.username || "";
          return nameA.localeCompare(nameB, "ar");
        }
        if (sortBy === "balance") {
          return (b.balance || 0) - (a.balance || 0);
        }
        if (sortBy === "points") {
          return (b.points || 0) - (a.points || 0);
        }
        return 0;
      });
  }, [users, searchQuery, roleFilter, tierFilter, statusFilter, govFilter, balanceFilter, sortBy]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.is_suspended).length;
    const suspended = users.filter((u) => !!u.is_suspended).length;
    const admins = users.filter((u) => u.is_admin).length;
    const paidTiers = users.filter((u) => u.subscription_tier && u.subscription_tier !== "free").length;
    const totalBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);
    const totalPoints = users.reduce((sum, u) => sum + (Number(u.points) || 0), 0);

    return { total, active, suspended, admins, paidTiers, totalBalance, totalPoints };
  }, [users]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, tierFilter, statusFilter, govFilter, balanceFilter, sortBy, pageSize]);

  // Check if any filter is active
  const isAnyFilterActive =
    searchQuery.trim() !== "" ||
    roleFilter !== "all" ||
    tierFilter !== "all" ||
    statusFilter !== "all" ||
    govFilter !== "all" ||
    balanceFilter !== "all" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setTierFilter("all");
    setStatusFilter("all");
    setGovFilter("all");
    setBalanceFilter("all");
    setSortBy("newest");
  };

  // Multi-select actions
  const isAllPageSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.includes(u.id));

  const handleToggleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !paginatedUsers.some((u) => u.id === id)));
    } else {
      const pageIds = paginatedUsers.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export to Excel / CSV
  const handleExportExcel = async (onlySelected: boolean = false) => {
    setExportingExcel(true);
    try {
      const XLSX = await import("xlsx");
      const targetUsers = onlySelected
        ? users.filter((u) => selectedUserIds.includes(u.id))
        : filteredUsers;

      const exportRows = targetUsers.map((u, idx) => ({
        "م": idx + 1,
        "المعرف (UUID)": u.id,
        "الاسم الكامل": u.full_name || "غير محدد",
        "اسم المستخدم": u.username ? `@${u.username}` : "بدون_يوزر",
        "البريد الإلكتروني": u.email || "غير متوفر",
        "رقم الهاتف": u.phone || "غير متوفر",
        "المحافظة": u.governorate || "غير محددة",
        "المدينة": u.city || "—",
        "الجنس": u.gender || "—",
        "تاريخ الميلاد": u.dob ? new Date(u.dob).toLocaleDateString("ar-EG") : "—",
        "الرتبة": u.is_admin ? "مسؤول نظام (Admin)" : "عضو عادي",
        "باقة الاشتراك":
          u.subscription_tier === "gold"
            ? "الذهبية 🥇"
            : u.subscription_tier === "silver"
            ? "الفضية 🥈"
            : u.subscription_tier === "mishwar"
            ? "المشوار ⚡"
            : "المجانية ⚪",
        "حالة الحساب": u.is_suspended ? `موقوف (السبب: ${u.suspended_reason || "بدون"})` : "نشط 🟢",
        "رصيد المحفظة (ج.م)": u.balance || 0,
        "الرصيد الترويجي (ج.م)": u.promo_balance || 0,
        "نقاط المكافآت": u.points || 0,
        "تاريخ الانضمام": u.created_at ? new Date(u.created_at).toLocaleDateString("ar-EG") : "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "المستخدمين");

      const dateStamp = new Date().toISOString().split("T")[0];
      const filename = onlySelected
        ? `CairoMap_Selected_Users_${dateStamp}.xlsx`
        : `CairoMap_Users_Report_${dateStamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      setStatusMessage({
        type: "success",
        text: `تم تصدير ملف الإكسيل بنجاح (${targetUsers.length} مستخدم)!`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      setStatusMessage({ type: "error", text: "فشل تصدير الملف: " + err.message });
    } finally {
      setExportingExcel(false);
    }
  };

  // Quick preset balance helper
  const handleAddPresetBalance = (amount: number) => {
    setAdjustAmount(amount.toString());
  };

  if (authChecking) {
    return (
      <div className={styles.adminLoadingContainer}>
        <div className={styles.spinner} />
        <p style={{ marginTop: "12px", color: "var(--textSecondary)" }}>جاري التحقق من الصلاحيات وقاعدة البيانات...</p>
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
    <div className={styles.adminContent} style={{ maxWidth: "1550px", margin: "0 auto", paddingBottom: "80px" }}>
      {/* ── 1. Page Header & Actions ── */}
      <div className={styles.dashboardHeader} style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1
            className={styles.greetingTitle}
            style={{ fontSize: "1.65rem", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span>👥</span> إدارة الحسابات والمستخدمين
          </h1>
          <p className={styles.tableSubtitle} style={{ marginTop: "6px", fontSize: "0.92rem", lineHeight: "1.6" }}>
            لوحة مركزية متقدمة لإدارة أعضاء الموقع: تصفح البيانات الكاملة، شحن وخصم الأرصدة والنقاط، تعليق وفك حظر
            الحسابات، متابعة سجل النشاطات، وتصدير التقارير.
          </p>
        </div>

        <div className={uStyles.headerActions}>
          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            className={uStyles.btnSecondary}
            title="تحديث البيانات فوراً"
          >
            <i className={`bx bx-refresh ${loadingUsers ? "bx-spin" : ""}`} style={{ fontSize: "1.2rem" }} />
            <span>تحديث</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => handleExportExcel(false)}
            disabled={exportingExcel || filteredUsers.length === 0}
            className={uStyles.btnSecondary}
            title="تصدير المستخدمين الحاليين كملف Excel"
          >
            <i className="bx bx-download" style={{ fontSize: "1.15rem", color: "#10b981" }} />
            <span>{exportingExcel ? "جاري التصدير..." : "تصدير Excel"}</span>
          </button>

          {/* Add New User */}
          <button onClick={() => setShowAddUserModal(true)} className={uStyles.btnPrimary}>
            <i className="bx bx-user-plus" style={{ fontSize: "1.2rem" }} />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* ── 2. Clickable Interactive Stat Cards ── */}
      <div className={styles.subStatsGrid}>
        {/* Total Users */}
        <div
          onClick={() => {
            setStatusFilter("all");
            setRoleFilter("all");
            setTierFilter("all");
          }}
          className={`${styles.subStatCard} ${uStyles.clickableStatCard} ${
            statusFilter === "all" && roleFilter === "all" && tierFilter === "all" ? uStyles.statCardActive : ""
          }`}
          title="عرض جميع المستخدمين"
        >
          <div className={`${styles.subStatIcon} ${styles.subStatIconPrimary}`}>
            <i className="bx bx-group" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{stats.total}</span>
            <span className={styles.subStatLabel}>إجمالي المستخدمين</span>
          </div>
        </div>

        {/* Active Users */}
        <div
          onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
          className={`${styles.subStatCard} ${uStyles.clickableStatCard} ${
            statusFilter === "active" ? uStyles.statCardActive : ""
          }`}
          title="تصفية المستخدمين النشطين"
        >
          <div className={`${styles.subStatIcon} ${styles.subStatIconSuccess}`}>
            <i className="bx bx-user-check" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue} style={{ color: "#10b981" }}>
              {stats.active}
            </span>
            <span className={styles.subStatLabel}>حسابات نشطة 🟢</span>
          </div>
        </div>

        {/* Suspended Users */}
        <div
          onClick={() => setStatusFilter(statusFilter === "suspended" ? "all" : "suspended")}
          className={`${styles.subStatCard} ${uStyles.clickableStatCard} ${
            statusFilter === "suspended" ? uStyles.statCardActive : ""
          }`}
          title="تصفية الحسابات المعلقة والموقوفة"
        >
          <div className={styles.subStatIcon} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
            <i className="bx bx-user-x" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue} style={{ color: stats.suspended > 0 ? "#ef4444" : undefined }}>
              {stats.suspended}
            </span>
            <span className={styles.subStatLabel}>حسابات موقوفة ⛔</span>
          </div>
        </div>

        {/* Paid Tier Users */}
        <div
          onClick={() => {
            if (tierFilter !== "all" && tierFilter !== "free") {
              setTierFilter("all");
            } else {
              setTierFilter("gold");
            }
          }}
          className={`${styles.subStatCard} ${uStyles.clickableStatCard} ${
            tierFilter !== "all" && tierFilter !== "free" ? uStyles.statCardActive : ""
          }`}
          title="تصفية المشتركين بالباقات المدفوعة"
        >
          <div className={`${styles.subStatIcon} ${styles.subStatIconWarning}`}>
            <i className="bx bx-crown" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue} style={{ color: "#f59e0b" }}>
              {stats.paidTiers}
            </span>
            <span className={styles.subStatLabel}>اشتراكات مميزة 💎</span>
          </div>
        </div>

        {/* Admins */}
        <div
          onClick={() => setRoleFilter(roleFilter === "admin" ? "all" : "admin")}
          className={`${styles.subStatCard} ${uStyles.clickableStatCard} ${
            roleFilter === "admin" ? uStyles.statCardActive : ""
          }`}
          title="تصفية مسؤولي النظام"
        >
          <div className={`${styles.subStatIcon} ${styles.subStatIconDanger}`}>
            <i className="bx bx-shield-quarter" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{stats.admins}</span>
            <span className={styles.subStatLabel}>مديرو النظام 👑</span>
          </div>
        </div>

        {/* Total Balances */}
        <div
          onClick={() => setBalanceFilter(balanceFilter === "positive" ? "all" : "positive")}
          className={`${styles.subStatCard} ${uStyles.clickableStatCard} ${
            balanceFilter === "positive" ? uStyles.statCardActive : ""
          }`}
          title="عرض من يملكون رصيد في المحفظة"
        >
          <div className={styles.subStatIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <i className="bx bx-wallet" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue} style={{ fontSize: "1.35rem", color: "#10b981" }}>
              {stats.totalBalance.toLocaleString("ar-EG")} ج.م
            </span>
            <span className={styles.subStatLabel}>إجمالي الأرصدة 💵</span>
          </div>
        </div>
      </div>

      {/* ── 3. Toast / Feedback Notification ── */}
      {statusMessage && (
        <div
          className={`${styles.alert} ${statusMessage.type === "success" ? styles.alertSuccess : styles.alertError}`}
          style={{
            padding: "14px 20px",
            borderRadius: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.92rem",
            fontWeight: "700",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i
              className={`bx ${statusMessage.type === "success" ? "bx-check-circle" : "bx-error-circle"}`}
              style={{ fontSize: "1.3rem" }}
            />
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* ── 4. Main Table Panel ── */}
      <div className={styles.subPanelCard} style={{ overflow: "visible" }}>
        {/* Table Filter and Search Toolbar */}
        <div className={styles.subFilterBar} style={{ gap: "14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h3 className={styles.subPanelHeaderTitle} style={{ margin: 0 }}>
              قائمة المستخدمين
            </h3>
            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--textSecondary)",
                background: "rgba(255, 255, 255, 0.06)",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: "700",
              }}
            >
              عرض {filteredUsers.length} من أصل {users.length}
            </span>

            {isAnyFilterActive && (
              <button onClick={handleResetFilters} className={uStyles.resetFilterBtn} title="إلغاء جميع خيارات التصفية">
                <i className="bx bx-x" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}
          </div>

          <div className={styles.subFilterGroup} style={{ flexWrap: "wrap" }}>
            {/* Search Input */}
            <div className={styles.subSearchWrapper} style={{ position: "relative", minWidth: "260px" }}>
              <input
                type="text"
                placeholder="ابحث بالاسم، اليوزر، البريد، الهاتف، أو المعرف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.subSearchInput}
                style={{ paddingLeft: searchQuery ? "65px" : "40px" }}
              />
              <i
                className="bx bx-search"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "12px",
                  color: "var(--text-muted)",
                  fontSize: "1.1rem",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={uStyles.searchClearBtn}
                  title="مسح البحث"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.subSelect}
              title="تصفية حسب حالة الحساب"
            >
              <option value="all">كل الحالات 🔄</option>
              <option value="active">حسابات نشطة 🟢</option>
              <option value="suspended">حسابات موقوفة ⛔</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.subSelect}
              title="تصفية حسب الرتبة"
            >
              <option value="all">كل الرتب 👥</option>
              <option value="user">أعضاء عاديون 👤</option>
              <option value="admin">مسؤولو النظام (Admins) 👑</option>
            </select>

            {/* Subscription Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className={styles.subSelect}
              title="تصفية حسب نوع الاشتراك"
            >
              <option value="all">كل الباقات 💎</option>
              <option value="gold">🥇 الباقة الذهبية</option>
              <option value="silver">🥈 الباقة الفضية</option>
              <option value="mishwar">⚡ باقة المشوار</option>
              <option value="free">⚪ الباقة المجانية</option>
            </select>

            {/* Governorate Filter */}
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className={styles.subSelect}
              title="تصفية حسب المحافظة"
            >
              <option value="all">كل المحافظات 📍</option>
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.subSelect}
              title="ترتيب النتائج"
            >
              <option value="newest">الأحدث تسجيلاً ⏳</option>
              <option value="oldest">الأقدم تسجيلاً 📅</option>
              <option value="name">الاسم أبجدياً (أ-ي) 🔤</option>
              <option value="balance">الأعلى رصيداً 💵</option>
              <option value="points">الأعلى نقاطاً ⭐</option>
            </select>
          </div>
        </div>

        {/* ── Table Content ── */}
        {loadingUsers ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className={styles.spinner} style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--textSecondary)", fontWeight: "600", fontSize: "0.95rem" }}>
              جاري تحميل حسابات المستخدمين...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.adsEmptyState} style={{ padding: "60px 20px" }}>
            <i className="bx bx-group" style={{ fontSize: "3.5rem", marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ margin: "0 0 10px", fontWeight: "800", fontSize: "1.1rem" }}>
              لا يوجد مستخدمون يطابقون خيارات البحث الحالية.
            </p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.88rem" }}>
              جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية.
            </p>
            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className={uStyles.btnSecondary}
                style={{ marginTop: "16px" }}
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead className={styles.adminThead}>
                <tr>
                  {/* Select All Checkbox */}
                  <th className={styles.adminTh} style={{ width: "42px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleToggleSelectAllPage}
                      className={uStyles.tableCheckbox}
                      title="تحديد الكل في هذه الصفحة"
                    />
                  </th>
                  <th className={styles.adminTh}>المستخدم والحساب</th>
                  <th className={styles.adminTh}>الرتبة والاشتراك</th>
                  <th className={styles.adminTh}>الموقع والديموغرافيا</th>
                  <th className={styles.adminTh}>المحفظة والنقاط</th>
                  <th className={styles.adminTh}>تاريخ الانضمام</th>
                  <th className={styles.adminTh} style={{ textAlign: "center" }}>
                    إجراءات التحكم
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const initial = (u.full_name || u.username || "U").charAt(0).toUpperCase();
                  const isSelected = selectedUserIds.includes(u.id);
                  const age = calculateAge(u.dob);

                  return (
                    <tr
                      key={u.id}
                      className={`${styles.adminTr} ${isSelected ? uStyles.tableRowSelected : ""} ${
                        u.is_suspended ? uStyles.tableRowSuspended : ""
                      }`}
                    >
                      {/* Multi-Select Checkbox */}
                      <td className={styles.adminTd} style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className={uStyles.tableCheckbox}
                        />
                      </td>

                      {/* User Identity */}
                      <td className={styles.adminTd}>
                        <div className={uStyles.userCell}>
                          <div className={uStyles.userAvatarWrapper}>
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.full_name || "avatar"}
                                className={uStyles.userAvatarImg}
                              />
                            ) : (
                              <div className={uStyles.userAvatarInitial}>{initial}</div>
                            )}
                            {/* Live Dot Status */}
                            <span
                              className={`${uStyles.statusIndicatorDot} ${
                                u.is_suspended ? uStyles.dotSuspended : uStyles.dotActive
                              }`}
                              title={u.is_suspended ? "حساب موقوف" : "حساب نشط"}
                            />
                          </div>

                          <div className={uStyles.userMetaBox}>
                            <div className={uStyles.userNameRow}>
                              <span className={uStyles.userNameText} title={u.full_name || "بدون اسم"}>
                                {u.full_name || "مستخدم بدون اسم"}
                              </span>
                              {u.is_admin && (
                                <span
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: "800",
                                    color: "#f87171",
                                    background: "rgba(239, 68, 68, 0.15)",
                                    padding: "1px 6px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                  }}
                                >
                                  👑 أدمن
                                </span>
                              )}
                            </div>

                            <div className={uStyles.usernameIdRow}>
                              <span className={uStyles.usernameBadge}>@{u.username || "بدون_يوزر"}</span>
                              <button
                                onClick={() => handleCopyUserId(u.id)}
                                className={uStyles.copyIdBtn}
                                title="نسخ معرف المستخدم (UUID)"
                              >
                                <i className="bx bx-copy" />
                                {copiedId === u.id && (
                                  <span style={{ color: "#10b981", fontWeight: "700" }}>تم!</span>
                                )}
                              </button>
                            </div>

                            <div className={uStyles.contactRow}>
                              {u.email ? (
                                <a
                                  href={`mailto:${u.email}`}
                                  className={uStyles.contactLink}
                                  title={`إرسال بريد: ${u.email}`}
                                >
                                  <i className="bx bx-envelope" />
                                  <span>{u.email}</span>
                                </a>
                              ) : u.phone ? (
                                <a
                                  href={`tel:${u.phone}`}
                                  className={uStyles.contactLink}
                                  title={`اتصال: ${u.phone}`}
                                >
                                  <i className="bx bx-phone" />
                                  <span>{u.phone}</span>
                                </a>
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>لا توجد بيانات اتصال</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Subscription Tier & Status */}
                      <td className={styles.adminTd}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                            {/* Status Badge */}
                            {u.is_suspended ? (
                              <span
                                className={styles.badge}
                                style={{
                                  background: "rgba(239, 68, 68, 0.18)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.4)",
                                  fontWeight: "800",
                                }}
                                title={u.suspended_reason || "تم إيقاف الحساب"}
                              >
                                ⛔ موقوف
                              </span>
                            ) : (
                              <span
                                className={styles.badge}
                                style={{
                                  background: "rgba(16, 185, 129, 0.12)",
                                  color: "#10b981",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                  fontWeight: "700",
                                }}
                              >
                                🟢 نشط
                              </span>
                            )}

                            {/* Tier Badge */}
                            <span
                              className={`${styles.badge} ${
                                u.subscription_tier === "gold"
                                  ? uStyles.tierBadgeGold
                                  : u.subscription_tier === "silver"
                                  ? uStyles.tierBadgeSilver
                                  : u.subscription_tier === "mishwar"
                                  ? uStyles.tierBadgeMishwar
                                  : uStyles.tierBadgeFree
                              }`}
                            >
                              {u.subscription_tier === "gold"
                                ? "🥇 الذهبية"
                                : u.subscription_tier === "silver"
                                ? "🥈 الفضية"
                                : u.subscription_tier === "mishwar"
                                ? "⚡ المشوار"
                                : "⚪ مجانية"}
                            </span>
                          </div>

                          {/* Suspended Reason preview */}
                          {u.is_suspended && u.suspended_reason && (
                            <span className={uStyles.suspendedNotice} title={u.suspended_reason}>
                              <i className="bx bx-info-circle" /> {u.suspended_reason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location & Demographics */}
                      <td className={styles.adminTd}>
                        <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.88rem" }}>
                          📍 {u.governorate ? `${u.governorate} ${u.city ? `• ${u.city}` : ""}` : "غير محددة"}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "4px" }}>
                          {u.gender ? (u.gender === "ذكر" || u.gender === "male" ? "♂️ ذكر" : "♀️ أنثى") : "الجنس: —"}
                          {age !== null ? ` • 🎂 ${age} سنة` : ""}
                        </div>
                      </td>

                      {/* Financial Balances & Points */}
                      <td className={styles.adminTd}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ fontWeight: "800", color: "#10b981", fontSize: "0.95rem" }}>
                            💵 {(u.balance || 0).toLocaleString("ar-EG")} ج.م
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            {(u.promo_balance || 0) > 0 && (
                              <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: "700" }}>
                                🎁 {u.promo_balance} ترويجي
                              </span>
                            )}
                            {(u.points || 0) > 0 && (
                              <span style={{ fontSize: "0.75rem", color: "#eab308", fontWeight: "700" }}>
                                ⭐ {u.points} نقطة
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenAdjustModal(u)}
                            className={uStyles.quickAdjustBtn}
                            title="شحن أو خصم رصيد ونقاط سريع"
                          >
                            <i className="bx bx-plus-circle" />
                            <span>شحن / خصم</span>
                          </button>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className={styles.adminTd}>
                        <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                          {new Date(u.created_at).toLocaleDateString("ar-EG")}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {getRelativeTimeArabic(u.created_at)}
                        </div>
                      </td>

                      {/* Control Actions */}
                      <td className={styles.adminTd} style={{ textAlign: "center" }}>
                        <div className={styles.actionGroup} style={{ justifyContent: "center" }}>
                          {/* Quick View Profile Card */}
                          <button
                            onClick={() => setViewUser(u)}
                            className={styles.actionBtn}
                            style={{
                              background: "rgba(99, 102, 241, 0.12)",
                              color: "#818cf8",
                              borderColor: "rgba(99, 102, 241, 0.3)",
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                              padding: 0,
                              justifyContent: "center",
                            }}
                            title="معاينة الملف الكامل للمستخدم"
                          >
                            <i className="bx bx-show" style={{ fontSize: "1.1rem" }} />
                          </button>

                          {/* Edit User Profile Data */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className={styles.actionBtn}
                            style={{
                              background: "rgba(34, 197, 94, 0.12)",
                              color: "#4ade80",
                              borderColor: "rgba(34, 197, 94, 0.3)",
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                              padding: 0,
                              justifyContent: "center",
                            }}
                            title="تعديل كافة بيانات الحساب والشخصية"
                          >
                            <i className="bx bx-edit" style={{ fontSize: "1.1rem" }} />
                          </button>

                          {/* Suspend / Unsuspend User */}
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
                                borderRadius: "50%",
                                width: "34px",
                                height: "34px",
                                padding: 0,
                                justifyContent: "center",
                              }}
                              title={
                                u.is_suspended
                                  ? "إلغاء الإيقاف وإعادة تنشيط الحساب"
                                  : "إيقاف وتعليق الحساب وتسجيل خروجه فوراً"
                              }
                            >
                              <i
                                className={`bx ${u.is_suspended ? "bx-lock-open-alt" : "bx-lock-alt"}`}
                                style={{ fontSize: "1.1rem" }}
                              />
                            </button>
                          )}

                          {/* Send Targeted Notification */}
                          <button
                            onClick={() => {
                              setNotifUser(u);
                              setNotifForm({
                                title: "",
                                message: "",
                                type: "info",
                                link: "/profile",
                              });
                            }}
                            className={styles.actionBtn}
                            style={{
                              background: "rgba(14, 165, 233, 0.12)",
                              color: "#38bdf8",
                              borderColor: "rgba(14, 165, 233, 0.3)",
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                              padding: 0,
                              justifyContent: "center",
                            }}
                            title="إرسال إشعار فوري لهذا المستخدم"
                          >
                            <i className="bx bx-bell" style={{ fontSize: "1.1rem" }} />
                          </button>

                          {/* View Activity Timeline */}
                          <button
                            onClick={() => handleOpenActivityModal(u)}
                            className={styles.actionBtn}
                            style={{
                              background: "rgba(168, 85, 247, 0.12)",
                              color: "#c084fc",
                              borderColor: "rgba(168, 85, 247, 0.3)",
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                              padding: 0,
                              justifyContent: "center",
                            }}
                            title="عرض سجل حركات ومعاملات المستخدم"
                          >
                            <i className="bx bx-history" style={{ fontSize: "1.1rem" }} />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteUser(u)}
                            className={styles.actionBtn}
                            style={{
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#f87171",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                              padding: 0,
                              justifyContent: "center",
                            }}
                            title="حذف حساب المستخدم نهائياً"
                          >
                            <i className="bx bx-trash" style={{ fontSize: "1.1rem" }} />
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

        {/* ── 5. Modern Pagination Controls ── */}
        {!loadingUsers && filteredUsers.length > 0 && (
          <div className={uStyles.paginationContainer}>
            <div className={uStyles.paginationInfo}>
              <span>
                عرض {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)} -{" "}
                {Math.min(currentPage * pageSize, filteredUsers.length)} من إجمالي {filteredUsers.length} مستخدم
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>لكل صفحة:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={uStyles.pageSizeSelect}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className={uStyles.paginationControls}>
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={uStyles.pageBtn}
                title="الصفحة الأولى"
              >
                <i className="bx bx-chevrons-right" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={uStyles.pageBtn}
                title="الصفحة السابقة"
              >
                <i className="bx bx-chevron-right" />
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const hasGap = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {hasGap && <span style={{ padding: "0 4px", color: "var(--text-muted)" }}>...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`${uStyles.pageBtn} ${currentPage === page ? uStyles.pageBtnActive : ""}`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={uStyles.pageBtn}
                title="الصفحة التالية"
              >
                <i className="bx bx-chevron-left" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={uStyles.pageBtn}
                title="الصفحة الأخيرة"
              >
                <i className="bx bx-chevrons-left" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 6. Bulk Action Floating Toolbar ── */}
      {selectedUserIds.length > 0 && (
        <div className={uStyles.bulkBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className={uStyles.bulkBadge}>{selectedUserIds.length}</span>
            <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "0.88rem" }}>مستخدمين محددين</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Bulk Notification */}
            <button
              onClick={() => setShowBulkNotifModal(true)}
              className={`${uStyles.bulkBtn} ${uStyles.bulkBtnPrimary}`}
            >
              <i className="bx bx-bell" />
              <span>إرسال إشعار جماعي</span>
            </button>

            {/* Export Selected */}
            <button
              onClick={() => handleExportExcel(true)}
              className={`${uStyles.bulkBtn} ${uStyles.bulkBtnSuccess}`}
            >
              <i className="bx bx-download" />
              <span>تصدير المحددين (Excel)</span>
            </button>

            {/* Deselect All */}
            <button
              onClick={() => setSelectedUserIds([])}
              className={`${uStyles.bulkBtn} ${uStyles.bulkBtnDismiss}`}
            >
              <i className="bx bx-x" />
              <span>إلغاء التحديد</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODALS SECTION
         ════════════════════════════════════════════════════════════ */}

      {/* ── MODAL 1: User Profile Quick View Card ── */}
      {viewUser && (
        <div className={styles.subModalOverlay} onClick={() => setViewUser(null)}>
          <div
            className={styles.subModalBox}
            style={{ maxWidth: "680px", borderRadius: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className={uStyles.detailHeader} style={{ border: "none", marginBottom: 0, paddingBottom: 0 }}>
                {viewUser.avatar_url ? (
                  <img src={viewUser.avatar_url} alt="avatar" className={uStyles.detailAvatar} />
                ) : (
                  <div className={uStyles.detailAvatarFallback}>
                    {(viewUser.full_name || viewUser.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                      {viewUser.full_name || "مستخدم بدون اسم"}
                    </h3>
                    {viewUser.is_admin && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          color: "#f87171",
                          background: "rgba(239, 68, 68, 0.15)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        👑 مسؤول نظام
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      @{viewUser.username || "بدون_يوزر"}
                    </span>
                    <button
                      onClick={() => handleCopyUserId(viewUser.id)}
                      className={uStyles.copyIdBtn}
                      title="نسخ المعرف"
                    >
                      <i className="bx bx-copy" />
                      <span>{viewUser.id.substring(0, 8)}...</span>
                      {copiedId === viewUser.id && (
                        <span style={{ color: "#10b981", fontWeight: "700" }}>تم النسخ!</span>
                      )}
                    </button>
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    {viewUser.is_suspended ? (
                      <span
                        className={styles.badge}
                        style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid #ef444455" }}
                      >
                        ⛔ حساب موقوف ومعلق
                      </span>
                    ) : (
                      <span
                        className={styles.badge}
                        style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid #10b98155" }}
                      >
                        🟢 حساب نشط
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "1.6rem",
                }}
              >
                &times;
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div className={uStyles.detailStatsGrid} style={{ marginTop: "20px" }}>
              <div className={uStyles.detailStatBox}>
                <div className={uStyles.detailStatVal} style={{ color: "#10b981" }}>
                  {(viewUser.balance || 0).toLocaleString("ar-EG")} ج.م
                </div>
                <div className={uStyles.detailStatLabel}>رصيد المحفظة النقدي</div>
              </div>
              <div className={uStyles.detailStatBox}>
                <div className={uStyles.detailStatVal} style={{ color: "#818cf8" }}>
                  {(viewUser.promo_balance || 0).toLocaleString("ar-EG")} ج.م
                </div>
                <div className={uStyles.detailStatLabel}>الرصيد الترويجي الإضافي</div>
              </div>
              <div className={uStyles.detailStatBox}>
                <div className={uStyles.detailStatVal} style={{ color: "#eab308" }}>
                  {viewUser.points || 0}
                </div>
                <div className={uStyles.detailStatLabel}>نقاط المكافآت</div>
              </div>
            </div>

            {/* Detailed User Information Grid */}
            <div className={uStyles.detailInfoGrid}>
              <div className={uStyles.detailInfoItem}>
                <div className={uStyles.detailInfoLabel}>البريد الإلكتروني</div>
                <div className={uStyles.detailInfoValue}>
                  {viewUser.email ? (
                    <a href={`mailto:${viewUser.email}`} style={{ color: "#006FEE", textDecoration: "none" }}>
                      {viewUser.email}
                    </a>
                  ) : (
                    "غير متوفر"
                  )}
                </div>
              </div>

              <div className={uStyles.detailInfoItem}>
                <div className={uStyles.detailInfoLabel}>رقم الهاتف</div>
                <div className={uStyles.detailInfoValue}>
                  {viewUser.phone ? (
                    <a href={`tel:${viewUser.phone}`} style={{ color: "#006FEE", textDecoration: "none" }}>
                      {viewUser.phone}
                    </a>
                  ) : (
                    "غير متوفر"
                  )}
                </div>
              </div>

              <div className={uStyles.detailInfoItem}>
                <div className={uStyles.detailInfoLabel}>المحافظة والمدينة</div>
                <div className={uStyles.detailInfoValue}>
                  {viewUser.governorate || "غير محددة"} {viewUser.city ? `(${viewUser.city})` : ""}
                </div>
              </div>

              <div className={uStyles.detailInfoItem}>
                <div className={uStyles.detailInfoLabel}>الجنس والعمر</div>
                <div className={uStyles.detailInfoValue}>
                  {viewUser.gender || "غير محدد"}
                  {calculateAge(viewUser.dob) !== null ? ` • ${calculateAge(viewUser.dob)} سنة` : ""}
                </div>
              </div>

              <div className={uStyles.detailInfoItem}>
                <div className={uStyles.detailInfoLabel}>باقة الاشتراك</div>
                <div className={uStyles.detailInfoValue}>
                  {viewUser.subscription_tier === "gold"
                    ? "🥇 الباقة الذهبية"
                    : viewUser.subscription_tier === "silver"
                    ? "🥈 الباقة الفضية"
                    : viewUser.subscription_tier === "mishwar"
                    ? "⚡ باقة المشوار"
                    : "⚪ المجانية"}
                </div>
              </div>

              <div className={uStyles.detailInfoItem}>
                <div className={uStyles.detailInfoLabel}>تاريخ الانضمام</div>
                <div className={uStyles.detailInfoValue}>
                  {new Date(viewUser.created_at).toLocaleDateString("ar-EG")}{" "}
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    ({getRelativeTimeArabic(viewUser.created_at)})
                  </span>
                </div>
              </div>
            </div>

            {/* Suspended Reason Banner if suspended */}
            {viewUser.is_suspended && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontWeight: "800", color: "#f87171", fontSize: "0.85rem" }}>
                  ⛔ تم إيقاف الحساب
                  {viewUser.suspended_at && ` في: ${new Date(viewUser.suspended_at).toLocaleDateString("ar-EG")}`}
                </div>
                <div style={{ color: "var(--textSecondary)", fontSize: "0.82rem", marginTop: "4px" }}>
                  سبب الإيقاف: {viewUser.suspended_reason || "لم يُحدد سبب"}
                </div>
              </div>
            )}

            {/* Quick Action Buttons in View Modal */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  handleOpenEditModal(viewUser);
                }}
                className={uStyles.btnSecondary}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <i className="bx bx-edit" />
                <span>تعديل البيانات</span>
              </button>

              <button
                onClick={() => {
                  handleOpenAdjustModal(viewUser);
                }}
                className={uStyles.btnSecondary}
                style={{ flex: 1, justifyContent: "center", color: "#10b981" }}
              >
                <i className="bx bx-wallet" />
                <span>شحن / خصم رصيد</span>
              </button>

              <button
                onClick={() => {
                  setNotifUser(viewUser);
                }}
                className={uStyles.btnSecondary}
                style={{ flex: 1, justifyContent: "center", color: "#38bdf8" }}
              >
                <i className="bx bx-bell" />
                <span>إرسال إشعار</span>
              </button>

              <button
                onClick={() => {
                  handleOpenActivityModal(viewUser);
                }}
                className={uStyles.btnSecondary}
                style={{ flex: 1, justifyContent: "center", color: "#c084fc" }}
              >
                <i className="bx bx-history" />
                <span>سجل النشاط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Quick Adjust Balance & Points ── */}
      {adjustTargetUser && (
        <div className={styles.subModalOverlay} onClick={() => setAdjustTargetUser(null)}>
          <div className={styles.subModalBox} style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className={styles.subModalTitle}>
                💰 شحن وخصم الرصيد: {adjustTargetUser.full_name || adjustTargetUser.username}
              </h3>
              <button
                onClick={() => setAdjustTargetUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Target Asset */}
              <div>
                <label className={styles.subFormLabel}>نوع الرصيد / الأصل</label>
                <select
                  value={adjustAsset}
                  onChange={(e) => setAdjustAsset(e.target.value as any)}
                  className={styles.subFormSelect}
                >
                  <option value="balance">💵 رصيد المحفظة الأساسي (الحالي: {adjustTargetUser.balance || 0} ج.م)</option>
                  <option value="promo_balance">🎁 الرصيد الترويجي (الحالي: {adjustTargetUser.promo_balance || 0} ج.م)</option>
                  <option value="points">⭐ نقاط المكافآت (الحالي: {adjustTargetUser.points || 0} نقطة)</option>
                </select>
              </div>

              {/* Action Type: Deposit vs Withdraw */}
              <div>
                <label className={styles.subFormLabel}>نوع العملية</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setAdjustType("deposit")}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: adjustType === "deposit" ? "#10b981" : "rgba(255,255,255,0.1)",
                      background: adjustType === "deposit" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.03)",
                      color: adjustType === "deposit" ? "#4ade80" : "var(--textSecondary)",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bx bx-plus-circle" />
                    <span>إضافة (شحن / مكافأة)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType("withdraw")}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: adjustType === "withdraw" ? "#ef4444" : "rgba(255,255,255,0.1)",
                      background: adjustType === "withdraw" ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.03)",
                      color: adjustType === "withdraw" ? "#f87171" : "var(--textSecondary)",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bx bx-minus-circle" />
                    <span>خصم (سحب / تسوية)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className={styles.subFormLabel}>المبلغ / الكمية</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  placeholder="أدخل المبلغ هنا..."
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className={styles.subFormInput}
                />
              </div>

              {/* Quick Amount Presets */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>مبالغ سريعة:</span>
                {[20, 50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAddPresetBalance(amt)}
                    className={uStyles.presetBtn}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              {/* Reason / Admin Note */}
              <div>
                <label className={styles.subFormLabel}>ملاحظات / سبب التعديل (يُسجل في السجل المالي)</label>
                <input
                  type="text"
                  placeholder="مثال: مكافأة فوز بالمسابقة، تسوية شكوى، إلخ..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className={styles.subFormInput}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className={styles.inviteButton}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: "12px",
                    background:
                      adjustType === "deposit"
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  }}
                >
                  {savingAdjust
                    ? "جاري الحفظ..."
                    : adjustType === "deposit"
                    ? "تأكيد إضافة الرصيد"
                    : "تأكيد خصم الرصيد"}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustTargetUser(null)}
                  className={uStyles.btnSecondary}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Edit User Profile Data (FULL FIELDS) ── */}
      {editUser && (
        <div className={styles.subModalOverlay} onClick={() => setEditUser(null)}>
          <div className={styles.subModalBox} style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className={styles.subModalTitle}>
                ✏️ تعديل كامل بيانات: {editUser.full_name || editUser.username}
              </h3>
              <button
                onClick={() => setEditUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Section 1: Personal Info */}
              <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#818cf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
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

              {/* Section 2: Demographic & Location */}
              <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#818cf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px", marginTop: "6px" }}>
                📍 العنوان، تاريخ الميلاد، والجنس
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>المحافظة</label>
                  <select
                    value={editForm.governorate}
                    onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    <option value="">اختر المحافظة...</option>
                    {EGYPT_GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
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
                  <label className={styles.subFormLabel}>تاريخ الميلاد (DOB)</label>
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

              {/* Section 3: Financial Balances & Role */}
              <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#818cf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px", marginTop: "6px" }}>
                💵 الرصيد النقدي والاشتراك والصلاحيات
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
                  <label className={styles.subFormLabel}>نقاط المكافآت</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.points}
                    onChange={(e) => setEditForm({ ...editForm, points: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>باقة الاشتراك</label>
                  <select
                    value={editForm.subscription_tier}
                    onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    <option value="free">⚪ الباقة المجانية</option>
                    <option value="gold">🥇 الباقة الذهبية</option>
                    <option value="silver">🥈 الباقة الفضية</option>
                    <option value="mishwar">⚡ باقة المشوار</option>
                  </select>
                </div>

                <div>
                  <label className={styles.subFormLabel}>صلاحية رتبة الحساب</label>
                  <select
                    value={editForm.is_admin ? "admin" : "user"}
                    onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.value === "admin" })}
                    className={styles.subFormSelect}
                  >
                    <option value="user">عضو عادي (Regular User) 👤</option>
                    <option value="admin">مسؤول نظام كامل (Admin) 👑</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Account Status & Suspension */}
              <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#818cf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px", marginTop: "6px" }}>
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

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
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
                  className={uStyles.btnSecondary}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Create / Add New User ── */}
      {showAddUserModal && (
        <div className={styles.subModalOverlay} onClick={() => setShowAddUserModal(false)}>
          <div className={styles.subModalBox} style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 className={styles.subModalTitle}>➕ إضافة حساب مستخدم جديد</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAddUser} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد علي"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>اسم المستخدم (Username)</label>
                  <input
                    type="text"
                    placeholder="مثال: mohamed_ali"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="010xxxxxxxx"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>المحافظة</label>
                  <select
                    value={addForm.governorate}
                    onChange={(e) => setAddForm({ ...addForm, governorate: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    {EGYPT_GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.subFormLabel}>المدينة / المنطقة</label>
                  <input
                    type="text"
                    placeholder="مثال: المعادي"
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>الجنس</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    <option value="ذكر">ذكر ♂️</option>
                    <option value="أنثى">أنثى ♀️</option>
                  </select>
                </div>
                <div>
                  <label className={styles.subFormLabel}>باقة الاشتراك</label>
                  <select
                    value={addForm.subscription_tier}
                    onChange={(e) => setAddForm({ ...addForm, subscription_tier: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    <option value="free">مجانية ⚪</option>
                    <option value="gold">ذهبية 🥇</option>
                    <option value="silver">فضية 🥈</option>
                    <option value="mishwar">مشوار ⚡</option>
                  </select>
                </div>
                <div>
                  <label className={styles.subFormLabel}>الرتبة</label>
                  <select
                    value={addForm.is_admin ? "admin" : "user"}
                    onChange={(e) => setAddForm({ ...addForm, is_admin: e.target.value === "admin" })}
                    className={styles.subFormSelect}
                  >
                    <option value="user">عضو عادي 👤</option>
                    <option value="admin">مسؤول 👑</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>رصيد المحفظة الافتتاحي (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.balance}
                    onChange={(e) => setAddForm({ ...addForm, balance: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>النقاط الافتتاحية</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.points}
                    onChange={(e) => setAddForm({ ...addForm, points: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  type="submit"
                  disabled={savingAdd}
                  className={uStyles.btnPrimary}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {savingAdd ? "جاري الإنشاء..." : "إنشاء المستخدم الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className={uStyles.btnSecondary}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: Send Notification to Single User ── */}
      {notifUser && (
        <div className={styles.subModalOverlay} onClick={() => setNotifUser(null)}>
          <div className={styles.subModalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className={styles.subModalTitle}>
                🔔 إرسال إشعار إلى: {notifUser.full_name || notifUser.username}
              </h3>
              <button
                onClick={() => setNotifUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendNotification} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.84rem",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>اسم المستخدم: <strong>@{notifUser.username || "بدون_يوزر"}</strong></div>
                {notifUser.email && <div>البريد: <strong>{notifUser.email}</strong></div>}
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
                  <option value="info">معلومة / تنبيه عادي ℹ️</option>
                  <option value="success">نجاح / تأكيد ✅</option>
                  <option value="warning">تحذير ⚠️</option>
                  <option value="error">مهم / عاجل 🚨</option>
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
                  className={uStyles.btnPrimary}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {sendingNotif ? "جاري الإرسال..." : "إرسال الإشعار الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => setNotifUser(null)}
                  className={uStyles.btnSecondary}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 6: Send Bulk Notification to Selected Users ── */}
      {showBulkNotifModal && (
        <div className={styles.subModalOverlay} onClick={() => setShowBulkNotifModal(false)}>
          <div className={styles.subModalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className={styles.subModalTitle}>
                📢 إرسال إشعار جماعي إلى ({selectedUserIds.length}) مستخدم
              </h3>
              <button
                onClick={() => setShowBulkNotifModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendBulkNotification} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  color: "#a5b4fc",
                }}
              >
                سيتم إرسال هذا الإشعار إلى جميع الحسابات المحددة حالياً ({selectedUserIds.length} مستخدم).
              </div>

              <div>
                <label className={styles.subFormLabel}>عنوان الإشعار الجماعي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تحديث هام في سياسات الموقع أو عروض جديدة"
                  value={bulkNotifForm.title}
                  onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, title: e.target.value })}
                  className={styles.subFormInput}
                />
              </div>

              <div>
                <label className={styles.subFormLabel}>نوع الإشعار</label>
                <select
                  value={bulkNotifForm.type}
                  onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, type: e.target.value })}
                  className={styles.subFormSelect}
                >
                  <option value="info">معلومة / تنبيه عام ℹ️</option>
                  <option value="success">إعلان إيجابي / مكافأة ✅</option>
                  <option value="warning">تنبيه هام ⚠️</option>
                  <option value="error">عاجل 🚨</option>
                </select>
              </div>

              <div>
                <label className={styles.subFormLabel}>نص الإشعار الجماعي</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب الرسالة الموجهة للأعضاء المحددين..."
                  value={bulkNotifForm.message}
                  onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, message: e.target.value })}
                  className={styles.subFormInput}
                  style={{ lineHeight: "1.5", resize: "vertical" }}
                />
              </div>

              <div>
                <label className={styles.subFormLabel}>رابط الإشعار (اختياري)</label>
                <input
                  type="text"
                  placeholder="/profile أو /points"
                  value={bulkNotifForm.link}
                  onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, link: e.target.value })}
                  className={styles.subFormInput}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={sendingBulkNotif}
                  className={uStyles.btnPrimary}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {sendingBulkNotif ? "جاري الإرسال الجماعي..." : `إرسال إلى ${selectedUserIds.length} مستخدم`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkNotifModal(false)}
                  className={uStyles.btnSecondary}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 7: User Activity Timeline ── */}
      {activityUser && (
        <div className={styles.subModalOverlay} onClick={() => setActivityUser(null)}>
          <div className={styles.subModalBox} style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 className={styles.subModalTitle}>
                  📜 سجل نشاط: {activityUser.full_name || activityUser.username}
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

            {/* Timeline Filter */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { key: "all", label: "الكل" },
                { key: "transaction", label: "المعاملات المالية" },
                { key: "report", label: "البلاغات" },
                { key: "feedback", label: "الملاحظات" },
                { key: "notification", label: "الإشعارات" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setTimelineFilter(f.key)}
                  className={uStyles.presetBtn}
                  style={{
                    background: timelineFilter === f.key ? "rgba(99, 102, 241, 0.25)" : undefined,
                    borderColor: timelineFilter === f.key ? "#6366f1" : undefined,
                    color: timelineFilter === f.key ? "#ffffff" : undefined,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loadingTimeline ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className={styles.spinner} style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "var(--textSecondary)", fontWeight: "600" }}>جاري تجميع سجل الحركات...</p>
              </div>
            ) : userTimeline.filter((ev) => timelineFilter === "all" || ev.type === timelineFilter).length === 0 ? (
              <div className={styles.adsEmptyState} style={{ padding: "30px" }}>
                <i className="bx bx-history" style={{ fontSize: "2.5rem", opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: "700" }}>لا توجد حركات مسجلة لهذا النوع.</p>
              </div>
            ) : (
              <div className={styles.timelineContainer} style={{ maxHeight: "420px", overflowY: "auto", paddingLeft: "8px" }}>
                {userTimeline
                  .filter((ev) => timelineFilter === "all" || ev.type === timelineFilter)
                  .map((ev) => (
                    <div key={ev.id} className={styles.timelineItem}>
                      <div className={styles.timelineBadge} style={{ background: ev.badgeColor || "#6366f1" }}>
                        <i className="bx bx-check" />
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineTitle}>
                          <span>{ev.title}</span>
                          {ev.badgeText && (
                            <span
                              className={styles.badge}
                              style={{
                                background: `${ev.badgeColor}22`,
                                color: ev.badgeColor,
                                border: `1px solid ${ev.badgeColor}44`,
                                fontSize: "0.72rem",
                              }}
                            >
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

            <div style={{ marginTop: "20px", textAlign: "left" }}>
              <button
                type="button"
                onClick={() => setActivityUser(null)}
                className={uStyles.btnSecondary}
              >
                إغلاق السجل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 8: Confirm Suspend / Unsuspend User ── */}
      <CustomModal
        isOpen={Boolean(suspendTarget)}
        onClose={() => !suspending && setSuspendTarget(null)}
        title={suspendTarget?.is_suspended ? "تأكيد إلغاء إيقاف الحساب" : "تأكيد إيقاف وتعليق الحساب"}
        titleColor={suspendTarget?.is_suspended ? "#10b981" : "#f59e0b"}
        borderColor={suspendTarget?.is_suspended ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}
        message={
          suspendTarget
            ? suspendTarget.is_suspended
              ? `هل تريد إلغاء إيقاف حساب (${suspendTarget.full_name || suspendTarget.username}) والسماح له بتسجيل الدخول مجدداً؟`
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
          icon: <i className={`bx ${suspendTarget?.is_suspended ? "bx-lock-open-alt" : "bx-lock-alt"}`} style={{ fontSize: "1.2rem" }} />,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setSuspendTarget(null),
          bgColor: "var(--cancelBtn)",
          disabled: suspending,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />,
        }}
      >
        {!suspendTarget?.is_suspended ? (
          <div style={{ marginTop: "12px", width: "100%", textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
              سبب الإيقاف (اختياري، يظهر للمستخدم في شاشة الدخول):
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
              ⚠️ سيتم تسجيل خروج المستخدم فوراً من كافة الأجهزة النشطة.
            </p>
          </div>
        ) : (
          <p style={{ color: "#10b981", fontWeight: "bold", fontSize: "0.9rem", margin: 0, textAlign: "center" }}>
            ✅ بمجرد التأكيد، سيتمكن المستخدم من تسجيل الدخول إلى حسابه واستخدامه بصورة طبيعية.
          </p>
        )}
      </CustomModal>

      {/* ── MODAL 9: Confirm Delete User ── */}
      <CustomModal
        isOpen={Boolean(deleteUser)}
        onClose={() => !deleting && setDeleteUser(null)}
        title="تأكيد حذف حساب المستخدم"
        titleColor="#ef4444"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(239, 68, 68, 0.25)"
        message={
          deleteUser
            ? `هل أنت متأكد من رغبتك في حذف حساب (${deleteUser.full_name || deleteUser.username}) نهائياً من الموقع؟`
            : undefined
        }
        primaryButton={{
          label: deleting ? "جاري الحذف..." : "تأكيد الحذف النهائي",
          onClick: handleDeleteUserCompletely,
          bgColor: "#ef4444",
          disabled: deleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setDeleteUser(null),
          bgColor: "var(--cancelBtn)",
          disabled: deleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />,
        }}
      >
        <p style={{ color: "#ef4444", fontWeight: "bold", fontSize: "0.9rem", margin: 0, textAlign: "center" }}>
          ⚠️ هذا الإجراء لا يمكن التراجع عنه نهائياً وسيتم حذف كافة بياناته ومحفظته.
        </p>
      </CustomModal>
    </div>
  );
}
