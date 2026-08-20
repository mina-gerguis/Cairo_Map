"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

interface ServiceWorkerItem {
  id: string;
  specialty: string;
  experience_years: number;
  age: number | null;
  bio: string | null;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_available: boolean;
  status?: string;
  status_note?: string;
  created_at: string;
  profile?: {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    governorate?: string;
    city?: string;
    is_blocked?: boolean;
    is_suspended?: boolean;
    status_note?: string;
    points?: number;
    balance?: number;
    created_at?: string;
  } | null;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  created_at: string;
}

interface WorkerReviewItem {
  id: string;
  rating_quality: number;
  rating_time: number;
  rating_price: number;
  comment: string | null;
  created_at: string;
  client_profile?: {
    full_name?: string;
  };
}

const SPECIALTIES_LIST = [
  "الكل",
  "سباك",
  "كهربائي",
  "ميكانيكي",
  "طبيب",
  "نجار",
  "نقاش",
  "بناء",
  "فني تكييف",
  "فني دش",
  "خياط"
];

export default function AdminServiceProvidersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Data state
  const [workers, setWorkers] = useState<ServiceWorkerItem[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "blocked" | "unverified">("all");

  // Selected Worker & Modals
  const [selectedWorker, setSelectedWorker] = useState<ServiceWorkerItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Worker Extra Details (Portfolio & Reviews)
  const [workerPortfolio, setWorkerPortfolio] = useState<PortfolioItem[]>([]);
  const [workerReviews, setWorkerReviews] = useState<WorkerReviewItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status Action Form State
  const [statusAction, setStatusAction] = useState<"suspend" | "block" | "activate">("suspend");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Send Notification Form State
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"reward" | "instruction" | "info" | "warning">("reward");
  const [notifLink, setNotifLink] = useState("/services/dashboard");
  const [rewardPoints, setRewardPoints] = useState<string>("0");
  const [rewardBalance, setRewardBalance] = useState<string>("100");
  const [sendingNotif, setSendingNotif] = useState(false);

  // Action Status Message
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deletingWorker, setDeletingWorker] = useState(false);

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
          fetchWorkers();
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const fetchWorkers = async () => {
    if (!supabase) return;
    setLoadingWorkers(true);
    try {
      // 1. Fetch service workers
      const { data: workersData, error: workersErr } = await supabase
        .from("service_workers")
        .select("*")
        .order("created_at", { ascending: false });

      if (workersErr) throw workersErr;

      if (!workersData || workersData.length === 0) {
        setWorkers([]);
        return;
      }

      // 2. Fetch corresponding profiles
      const workerIds = workersData.map((w) => w.id);
      const { data: profilesData, error: profilesErr } = await supabase
        .from("profiles")
        .select("*")
        .in("id", workerIds);

      if (profilesErr) console.error("Error fetching profiles:", profilesErr);

      const profilesMap = new Map<string, any>();
      (profilesData || []).forEach((p) => profilesMap.set(p.id, p));

      const combined: ServiceWorkerItem[] = workersData.map((w) => ({
        ...w,
        profile: profilesMap.get(w.id) || null
      }));

      setWorkers(combined);
    } catch (err: any) {
      console.error("Error fetching service workers:", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Fetch portfolio & reviews for selected worker
  const handleOpenDetails = async (worker: ServiceWorkerItem) => {
    setSelectedWorker(worker);
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);

    if (!supabase) return;
    try {
      const [portRes, revRes] = await Promise.all([
        supabase
          .from("worker_portfolio")
          .select("*")
          .eq("worker_id", worker.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("worker_reviews")
          .select(`
            *,
            client_profile:profiles!worker_reviews_client_id_fkey (
              full_name
            )
          `)
          .eq("worker_id", worker.id)
          .order("created_at", { ascending: false })
      ]);

      setWorkerPortfolio(portRes.data || []);
      setWorkerReviews(revRes.data as any[] || []);
    } catch (err) {
      console.error("Error loading worker extra details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Toggle verification status (is_verified)
  const handleToggleVerification = async (worker: ServiceWorkerItem) => {
    if (!supabase) return;
    const newVerified = !worker.is_verified;

    try {
      const { error } = await supabase
        .from("service_workers")
        .update({ is_verified: newVerified })
        .eq("id", worker.id);

      if (error) throw error;

      setWorkers((prev) =>
        prev.map((w) => (w.id === worker.id ? { ...w, is_verified: newVerified } : w))
      );
      if (selectedWorker?.id === worker.id) {
        setSelectedWorker({ ...selectedWorker, is_verified: newVerified });
      }
      showFeedback("success", `تم ${newVerified ? "توثيق" : "إلغاء توثيق"} حساب المقدم بنجاح.`);
    } catch (err: any) {
      showFeedback("error", `فشل تحديث حالة التوثيق: ${err.message}`);
    }
  };

  // Handle status update (Suspend, Block, Activate)
  const handleOpenStatusModal = (worker: ServiceWorkerItem, defaultAction: "suspend" | "block" | "activate" = "suspend") => {
    setSelectedWorker(worker);
    setStatusAction(defaultAction);
    setStatusNote(worker.status_note || worker.profile?.status_note || "");
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedWorker) return;
    setUpdatingStatus(true);

    const isBlocked = statusAction === "block";
    const isSuspended = statusAction === "suspend";
    const newStatus = isBlocked ? "blocked" : isSuspended ? "suspended" : "active";

    try {
      // 1. Try RPC update_worker_status_by_admin first (bypasses RLS with SECURITY DEFINER)
      let rpcSuccess = false;
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc("update_worker_status_by_admin", {
          p_worker_id: selectedWorker.id,
          p_is_blocked: isBlocked,
          p_is_suspended: isSuspended,
          p_status_note: statusNote || null
        });
        if (!rpcErr) {
          rpcSuccess = true;
        }
      } catch (e) {
        // Fallback to client-side updates if RPC not present in DB
      }

      if (!rpcSuccess) {
        // Direct update profiles
        const { error: profErr } = await supabase
          .from("profiles")
          .update({
            is_blocked: isBlocked,
            is_suspended: isSuspended,
            status_note: statusNote || null
          })
          .eq("id", selectedWorker.id);

        if (profErr) console.warn("Profiles update warn:", profErr.message);

        // Direct update service_workers
        const { error: wErr } = await supabase
          .from("service_workers")
          .update({
            status: newStatus,
            status_note: statusNote || null,
            is_available: !isBlocked && !isSuspended
          })
          .eq("id", selectedWorker.id);

        if (wErr) {
          // Fallback if status column not present
          await supabase
            .from("service_workers")
            .update({
              is_available: !isBlocked && !isSuspended
            })
            .eq("id", selectedWorker.id);
        }
      }

      // 3. Send notification to the provider informing them of status update
      const statusTitles = {
        block: "🛑 تم حظر حسابك في منصة مقدمي الخدمات",
        suspend: "⚠️ تم تعليق/إيقاف حسابك مؤقتاً",
        activate: "✅ تم إعادة تفعيل حسابك بنجاح"
      };

      const statusMsgs = {
        block: `تم حظر حسابك من قِبل إدارة الموقع. ${statusNote ? `السبب: ${statusNote}` : "يرجى التواصل مع الدعم الفني لمزيد من المعلومات."}`,
        suspend: `تم إيقاف حسابك مؤقتاً. ${statusNote ? `السبب: ${statusNote}` : "يرجى مراجعة التعليمات والتواصل مع الإدارة."}`,
        activate: "يسرنا إعلامك بإعادة تفعيل حسابك كـ مقدم خدمة. يمكنك الآن استلام الطلبات والعمل كالمعتاد."
      };

      await supabase.from("notifications").insert([{
        user_id: selectedWorker.id,
        title: statusTitles[statusAction],
        message: statusMsgs[statusAction],
        type: statusAction === "activate" ? "info" : "warning",
        link: "/services/dashboard"
      }]);

      // Refresh state
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === selectedWorker.id) {
            return {
              ...w,
              status: newStatus,
              status_note: statusNote,
              profile: w.profile
                ? {
                  ...w.profile,
                  is_blocked: isBlocked,
                  is_suspended: isSuspended,
                  status_note: statusNote
                }
                : null
            };
          }
          return w;
        })
      );

      setIsStatusModalOpen(false);
      showFeedback(
        "success",
        `تم ${statusAction === "block" ? "حظر" : statusAction === "suspend" ? "إيقاف مؤقت لـ" : "تفعيل"} حساب المقدم بنجاح!`
      );
    } catch (err: any) {
      showFeedback("error", `حدث خطأ أثناء تعديل حالة الحساب: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Notification & Reward Modal Open
  const handleOpenNotifModal = (worker: ServiceWorkerItem, defaultType: "reward" | "instruction" = "reward") => {
    setSelectedWorker(worker);
    setNotifType(defaultType);
    if (defaultType === "reward") {
      setNotifTitle("🎁 مكافأة وتقدير من إدارة المنصة!");
      setNotifMessage("يسعدنا إعلامك بمنحك مكافأة مالية تقديرية لتميزك وجدارتك في تقديم الخدمات للعملاء. استمر في التألق!");
      setRewardBalance("100");
      setRewardPoints("50");
    } else {
      setNotifTitle("📋 تعليمات وإرشادات مهمة لمقدمي الخدمات");
      setNotifMessage("يرجى الالتزام بمواعيد تقديم الخدمة والجودة المطلوبة للعملاء لضمان الحفاظ على تقييمك المرتفع.");
      setRewardBalance("0");
      setRewardPoints("0");
    }
    setNotifLink("/services/dashboard");
    setIsNotifModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedWorker) return;
    if (!notifTitle.trim() || !notifMessage.trim()) {
      showFeedback("error", "يرجى كتابة عنوان الإشعار ونصه.");
      return;
    }

    setSendingNotif(true);
    try {
      const pVal = parseInt(rewardPoints, 10) || 0;
      const bVal = parseFloat(rewardBalance) || 0;

      // 1. Insert direct notification to this worker
      let notifMsg = notifMessage.trim();
      if (bVal > 0 || pVal > 0) {
        const rewardDetails = [];
        if (bVal > 0) rewardDetails.push(`💰 رصيد مالي: +${bVal} ج.م`);
        if (pVal > 0) rewardDetails.push(`⭐ نقاط: +${pVal} نقطة`);
        notifMsg += `\n\n[تفاصيل المكافأة المضافة لرصيدك: ${rewardDetails.join(" | ")}]`;
      }

      const { error: notifErr } = await supabase.from("notifications").insert([{
        user_id: selectedWorker.id,
        title: notifTitle.trim(),
        message: notifMsg,
        type: notifType,
        link: notifLink || "/services/dashboard"
      }]);

      if (notifErr) throw notifErr;

      // 2. Update profiles balance and points if reward provided
      if ((pVal > 0 || bVal > 0) && selectedWorker.profile) {
        const currentPoints = selectedWorker.profile.points || 0;
        const currentBalance = Number(selectedWorker.profile.balance || 0);
        const newPoints = currentPoints + pVal;
        const newBalance = currentBalance + bVal;

        const updateData: any = {};
        if (pVal > 0) updateData.points = newPoints;
        if (bVal > 0) updateData.balance = newBalance;

        const { error: pErr } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", selectedWorker.id);

        if (pErr) console.warn("Reward update profile error:", pErr.message);

        // Record balance transaction for financial auditing
        if (bVal > 0) {
          try {
            await (supabase.from("balance_transactions").insert([{
              user_id: selectedWorker.id,
              amount: bVal,
              type: "deposit",
              method: "admin_reward",
              provider_number: "system_admin",
              recipient_name: selectedWorker.profile.full_name || "مقدم خدمة",
              transaction_id: "REWARD_" + Date.now(),
              status: "approved",
              admin_notes: `مكافأة مالية إدارية: ${notifTitle}`
            }]) as any);
          } catch (tErr) {
            // ignore if table schema differs
          }
        }

        // Update state locally
        setWorkers((prev) =>
          prev.map((w) => {
            if (w.id === selectedWorker.id && w.profile) {
              return {
                ...w,
                profile: {
                  ...w.profile,
                  points: pVal > 0 ? newPoints : w.profile.points,
                  balance: bVal > 0 ? newBalance : w.profile.balance
                }
              };
            }
            return w;
          })
        );
      }

      setIsNotifModalOpen(false);
      showFeedback(
        "success",
        `تم إرسال الإشعار${bVal > 0 ? ` ومكافأة ${bVal} ج.م` : ""}${pVal > 0 ? ` و ${pVal} نقطة` : ""} إلى ${selectedWorker.profile?.full_name || "مقدم الخدمة"} بنجاح!`
      );
    } catch (err: any) {
      showFeedback("error", `فشل إرسال الإشعار: ${err.message}`);
    } finally {
      setSendingNotif(false);
    }
  };

  // Handle Permanent Delete Worker
  const handleConfirmDelete = async () => {
    if (!supabase || !selectedWorker) return;
    setDeletingWorker(true);

    try {
      // Try delete_user_by_admin RPC first
      let deleted = false;
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc("delete_user_by_admin", {
          p_user_id: selectedWorker.id
        });
        if (!rpcErr && rpcRes) {
          deleted = true;
        }
      } catch (e) {
        // Fallback to table deletes
      }

      if (!deleted) {
        // Delete from service_workers & profiles directly
        await supabase.from("service_workers").delete().eq("id", selectedWorker.id);
        await supabase.from("profiles").delete().eq("id", selectedWorker.id);
      }

      setWorkers((prev) => prev.filter((w) => w.id !== selectedWorker.id));
      setIsDeleteModalOpen(false);
      setIsDetailsModalOpen(false);
      showFeedback("success", `تم حذف حساب مقدم الخدمة (${selectedWorker.profile?.full_name || "المستخدم"}) نهائياً.`);
    } catch (err: any) {
      showFeedback("error", `فشل حذف حساب المقدم: ${err.message}`);
    } finally {
      setDeletingWorker(false);
    }
  };

  const showFeedback = (type: "success" | "error", msg: string) => {
    setActionFeedback({ type, msg });
    setTimeout(() => {
      setActionFeedback(null);
    }, 5000);
  };

  // Filtered workers list computation
  const filteredWorkers = workers.filter((worker) => {
    const p = worker.profile;
    const name = p?.full_name?.toLowerCase() || "";
    const email = p?.email?.toLowerCase() || "";
    const phone = p?.phone?.toLowerCase() || "";
    const spec = worker.specialty?.toLowerCase() || "";
    const term = searchQuery.toLowerCase().trim();

    const matchesSearch = !term || name.includes(term) || email.includes(term) || phone.includes(term) || spec.includes(term);

    const matchesSpecialty = specialtyFilter === "الكل" || worker.specialty === specialtyFilter;

    const isBlocked = p?.is_blocked || worker.status === "blocked";
    const isSuspended = p?.is_suspended || worker.status === "suspended";

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = !isBlocked && !isSuspended;
    else if (statusFilter === "suspended") matchesStatus = isSuspended && !isBlocked;
    else if (statusFilter === "blocked") matchesStatus = isBlocked;
    else if (statusFilter === "unverified") matchesStatus = !worker.is_verified;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  // Calculate statistics
  const totalCount = workers.length;
  const verifiedCount = workers.filter((w) => w.is_verified).length;
  const suspendedBlockedCount = workers.filter((w) => w.profile?.is_blocked || w.profile?.is_suspended || w.status === "blocked" || w.status === "suspended").length;
  const avgRatingOverall = totalCount > 0 ? (workers.reduce((acc, w) => acc + (w.rating_avg || 0), 0) / totalCount).toFixed(1) : "0.0";

  if (authLoading || authChecking) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid var(--border-glass)", borderTop: "3px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
        <p style={{ color: "var(--text-secondary)" }}>جاري التحقق من صلاحيات الأدمن...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px", maxWidth: "400px", margin: "100px auto" }}>
        <div style={{ width: "80px", height: "80px", background: "rgba(255, 59, 48, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <i className="bx bxs-error-circle" style={{ fontSize: "3rem", color: "#ff3b30" }}></i>
        </div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-primary)" }}>صلاحيات غير كافية</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: "1.6" }}>
          عفواً، حسابك لا يمتلك صلاحيات المسؤول للوصول إلى لوحة إدارة مقدمي الخدمات.
        </p>
        <Link href="/" className="ios-btn ios-btn-primary" style={{ padding: "14px 24px" }}>
          <i className="bx bx-home" style={{ fontSize: "1.2rem" }}></i> العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      {/* ── Feedback Notification Toast ── */}
      {actionFeedback && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: actionFeedback.type === "success" ? "#10b981" : "#ef4444",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "0.95rem"
        }}>
          <i className={`bx ${actionFeedback.type === "success" ? "bx-check-circle" : "bx-error-circle"}`} style={{ fontSize: "1.3rem" }} />
          {actionFeedback.msg}
        </div>
      )}

      {/* ── Page Header Bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="bx bx-id-card" style={{ color: "#3b82f6" }} /> إدارة مقدمي الخدمات
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
            إدارة حسابات المهنيين ومقدمي الخدمات، التقييمات، التحكم بالحظر والإيقاف المؤقت وإرسال المكافآت والتعليمات.
          </p>
        </div>
        <button
          onClick={fetchWorkers}
          className="ios-btn ios-btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "0.88rem" }}
        >
          <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }} /> تحديث البيانات
        </button>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div className={styles.tableCard} style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem" }}>
            <i className="bx bx-group" />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>إجمالي المقدمين</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{totalCount}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem" }}>
            <i className="bx bx-badge-check" />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>المقدمين الموثقين</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>{verifiedCount}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem" }}>
            <i className="bx bx-block" />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>الحسابات الموقوفة/المحظورة</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ef4444", marginTop: "2px" }}>{suspendedBlockedCount}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem" }}>
            <i className="bx bxs-star" />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>متوسط التقييم العام</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b", marginTop: "2px" }}>
              {avgRatingOverall} <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>/ 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Controls Card ── */}
      <div className={styles.tableCard} style={{ padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Text Search input */}
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <i className="bx bx-search" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontSize: "1.2rem" }} />
            <input
              type="text"
              placeholder="ابحث بالاسم، التخصص، البريد، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 42px 11px 16px",
                borderRadius: "12px",
                border: "1px solid var(--border-glass)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
              </button>
            )}
          </div>

          {/* Specialty Filter Dropdown */}
          <div style={{ minWidth: "160px" }}>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1px solid var(--border-glass)",
                background: "var(--bg-glass)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {SPECIALTIES_LIST.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === "الكل" ? "جميع التخصصات" : spec}
                </option>
              ))}
            </select>
          </div>

          {/* Account Status Tabs */}
          <div style={{ display: "flex", gap: "6px", background: "rgba(0, 0, 0, 0.2)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border-glass)", flexWrap: "wrap" }}>
            <button
              onClick={() => setStatusFilter("all")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === "all" ? "var(--accent-primary)" : "transparent",
                color: statusFilter === "all" ? "#fff" : "var(--text-secondary)"
              }}
            >
              الكل ({workers.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === "active" ? "#10b981" : "transparent",
                color: statusFilter === "active" ? "#fff" : "var(--text-secondary)"
              }}
            >
              نشط
            </button>
            <button
              onClick={() => setStatusFilter("suspended")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === "suspended" ? "#f59e0b" : "transparent",
                color: statusFilter === "suspended" ? "#fff" : "var(--text-secondary)"
              }}
            >
              موقوف مؤقتاً
            </button>
            <button
              onClick={() => setStatusFilter("blocked")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === "blocked" ? "#ef4444" : "transparent",
                color: statusFilter === "blocked" ? "#fff" : "var(--text-secondary)"
              }}
            >
              محظور
            </button>
            <button
              onClick={() => setStatusFilter("unverified")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === "unverified" ? "#6b7280" : "transparent",
                color: statusFilter === "unverified" ? "#fff" : "var(--text-secondary)"
              }}
            >
              غير موثق
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Card / Main Data Grid ── */}
      <div className={styles.tableCard}>
        {loadingWorkers ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid var(--border-glass)", borderTop: "3px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
            <p style={{ color: "var(--text-secondary)" }}>جاري تحميل قائمة مقدمي الخدمات...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <i className="bx bx-user-x" style={{ fontSize: "3.5rem", color: "var(--text-secondary)", opacity: 0.4, marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: "0 0 6px 0" }}>لا يوجد مقدمين مطابقين</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              {searchQuery || specialtyFilter !== "الكل" || statusFilter !== "all"
                ? "تأكد من شروط البحث والتصفية المحددة أعلاه."
                : "لم يقم أي مستخدم بالتسجيل كمقدم خدمة بعد."}
            </p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>مقدم الخدمة</th>
                  <th>التخصص / الوظيفة</th>
                  <th>الخبرة والسن</th>
                  <th>التقييم</th>
                  <th>التوثيق</th>
                  <th>حالة الحساب</th>
                  <th style={{ textAlign: "center" }}>إجراءات الأدمن</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => {
                  const prof = worker.profile;
                  const name = prof?.full_name || "مقدم خدمة بدون اسم";
                  const avatar = prof?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                  const isBlocked = prof?.is_blocked || worker.status === "blocked";
                  const isSuspended = prof?.is_suspended || worker.status === "suspended";

                  return (
                    <tr key={worker.id}>
                      {/* Worker Profile Info */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={avatar}
                            alt={name}
                            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)" }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                              {name}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                              {prof?.email || prof?.phone || "بدون بريد/هاتف"}
                            </div>
                            {(prof?.governorate || prof?.city) && (
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                <i className="bx bx-map-pin" style={{ color: "#3b82f6" }} />
                                {prof?.governorate} {prof?.city ? `- ${prof.city}` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Specialty / Profession */}
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: "rgba(59, 130, 246, 0.15)",
                          color: "#60a5fa",
                          fontSize: "0.85rem",
                          fontWeight: 600
                        }}>
                          🛠️ {worker.specialty}
                        </span>
                      </td>

                      {/* Exp & Age */}
                      <td>
                        <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600 }}>
                          {worker.experience_years} {worker.experience_years === 1 ? "سنة" : worker.experience_years === 2 ? "سنتان" : "سنوات"} خبرة
                        </div>
                        {worker.age && (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                            السن: {worker.age} سنة
                          </div>
                        )}
                      </td>

                      {/* Rating */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: "0.95rem" }}>
                            {(worker.rating_avg || 0).toFixed(1)}
                          </span>
                          <i className="bx bxs-star" style={{ color: "#f59e0b", fontSize: "1rem" }} />
                          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                            ({worker.rating_count || 0})
                          </span>
                        </div>
                      </td>

                      {/* Verification Status Toggle */}
                      <td>
                        <button
                          onClick={() => handleToggleVerification(worker)}
                          title="اضغط لتغيير حالة التوثيق"
                          style={{
                            border: "none",
                            background: worker.is_verified ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                            color: worker.is_verified ? "#10b981" : "#9ca3af",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <i className={`bx ${worker.is_verified ? "bx-badge-check" : "bx-time-five"}`} />
                          {worker.is_verified ? "موثق" : "غير موثق"}
                        </button>
                      </td>

                      {/* Account Status Badge */}
                      <td>
                        {isBlocked ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", fontSize: "0.8rem", fontWeight: 700 }}>
                            <i className="bx bx-block" /> محظور
                          </span>
                        ) : isSuspended ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 700 }}>
                            <i className="bx bx-pause-circle" /> موقوف مؤقتاً
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.8rem", fontWeight: 700 }}>
                            <i className="bx bx-check-circle" /> نشط
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                          {/* 1. Full Details */}
                          <button
                            onClick={() => handleOpenDetails(worker)}
                            className="ios-btn ios-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            title="عرض كامل تفاصيل المقدم والتقييمات والأعمال"
                          >
                            <i className="bx bx-show" style={{ fontSize: "1.1rem" }} /> التفاصيل
                          </button>

                          {/* 2. Send Notification / Reward */}
                          <button
                            onClick={() => handleOpenNotifModal(worker, "reward")}
                            style={{
                              padding: "6px 10px",
                              fontSize: "0.8rem",
                              borderRadius: "8px",
                              border: "none",
                              background: "rgba(139, 92, 246, 0.15)",
                              color: "#a78bfa",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="إرسال إشعار أو مكافأة إلى حسابه"
                          >
                            <i className="bx bx-bell" style={{ fontSize: "1.1rem" }} /> إشعار/مكافأة
                          </button>

                          {/* 3. Change Account Status (Block / Suspend / Restore) */}
                          <button
                            onClick={() => handleOpenStatusModal(worker, isBlocked || isSuspended ? "activate" : "suspend")}
                            style={{
                              padding: "6px 10px",
                              fontSize: "0.8rem",
                              borderRadius: "8px",
                              border: "none",
                              background: isBlocked || isSuspended ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                              color: isBlocked || isSuspended ? "#10b981" : "#f59e0b",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="التحكم بالحظر والإيقاف المؤقت"
                          >
                            <i className={`bx ${isBlocked ? "bx-lock-open-alt" : isSuspended ? "bx-play-circle" : "bx-slider-alt"}`} style={{ fontSize: "1.1rem" }} />
                            {isBlocked || isSuspended ? "تفعيل الحساب" : "إدارة الحالة"}
                          </button>

                          {/* 4. Permanent Delete */}
                          <button
                            onClick={() => {
                              setSelectedWorker(worker);
                              setIsDeleteModalOpen(true);
                            }}
                            style={{
                              padding: "6px 8px",
                              fontSize: "0.8rem",
                              borderRadius: "8px",
                              border: "none",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center"
                            }}
                            title="حذف حساب المقدم نهائياً"
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
      </div>

      {/* ========================================================= */}
      {/* ── MODAL 1: Full Worker Details & Portfolio ── */}
      {/* ========================================================= */}
      {isDetailsModalOpen && selectedWorker && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#0e1322",
            border: "1px solid var(--border-glass)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "750px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            position: "relative"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={selectedWorker.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedWorker.profile?.full_name || "")}`}
                  alt=""
                  style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }}
                />
                <div>
                  <h2 style={{ fontSize: "1.3rem", margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                    {selectedWorker.profile?.full_name || "تفاصيل مقدم الخدمة"}
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "#60a5fa", background: "rgba(59,130,246,0.15)", padding: "2px 10px", borderRadius: "12px", fontWeight: 600 }}>
                    🛠️ {selectedWorker.specialty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {/* Profile Info Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>البريد الإلكتروني</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "2px" }}>{selectedWorker.profile?.email || "غير محدد"}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>رقم الهاتف</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "2px" }}>{selectedWorker.profile?.phone || "غير محدد"}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>الموقع / المحافظة</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "2px" }}>
                  {selectedWorker.profile?.governorate || "غير مخصص"} {selectedWorker.profile?.city ? `(${selectedWorker.profile.city})` : ""}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>خبرة وسن</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "2px" }}>
                  {selectedWorker.experience_years} سنوات خبرة {selectedWorker.age ? `• السن: ${selectedWorker.age}` : ""}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>النقاط والرصيد الحقيقي</div>
                <div style={{ fontSize: "0.9rem", color: "#10b981", fontWeight: 700, marginTop: "2px" }}>
                  {selectedWorker.profile?.points || 0} نقطة | {selectedWorker.profile?.balance || 0} ج.م
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>تاريخ الانضمام</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "2px" }}>
                  {new Date(selectedWorker.created_at).toLocaleDateString("ar-EG")}
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedWorker.bio && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", margin: "0 0 8px 0" }}>نبذة عن مقدم الخدمة:</h4>
                <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "12px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  {selectedWorker.bio}
                </div>
              </div>
            )}

            {/* Portfolio Section */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1rem", color: "var(--text-primary)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-images" style={{ color: "#3b82f6" }} /> معرض الأعمال والأنشطة ({workerPortfolio.length})
              </h4>
              {loadingDetails ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>جاري تحميل معرض الأعمال والتقييمات...</p>
              ) : workerPortfolio.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  لم يقم هذا المقدم برفع صور أعمال سابقة حتى الآن.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                  {workerPortfolio.map((item) => (
                    <div key={item.id} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-glass)", background: "rgba(0,0,0,0.3)" }}>
                      <img src={item.image_url} alt={item.title || "عمل سابق"} style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                      {item.title && (
                        <div style={{ padding: "6px", fontSize: "0.75rem", color: "var(--text-primary)", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h4 style={{ fontSize: "1rem", color: "var(--text-primary)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-star" style={{ color: "#f59e0b" }} /> تقييمات العملاء ({workerReviews.length})
              </h4>
              {loadingDetails ? null : workerReviews.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  لا توجد تقييمات مسجلة لهذا المقدم بعد.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                  {workerReviews.map((rev) => (
                    <div key={rev.id} style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                          {rev.client_profile?.full_name || "عميل"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {new Date(rev.created_at).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      {rev.comment && <p style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>"{rev.comment}"</p>}
                      <div style={{ fontSize: "0.78rem", color: "#f59e0b" }}>
                        الجودة: {rev.rating_quality}★ | السرعة: {rev.rating_time}★ | السعر: {rev.rating_price}★
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-glass)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => handleOpenNotifModal(selectedWorker, "reward")}
                className="ios-btn"
                style={{ background: "#8b5cf6", color: "#fff", padding: "10px 18px", fontSize: "0.88rem" }}
              >
                <i className="bx bx-gift" style={{ fontSize: "1.1rem" }} /> إرسال مكافأة/إشعار
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="ios-btn ios-btn-secondary"
                style={{ padding: "10px 18px", fontSize: "0.88rem" }}
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ── MODAL 2: Change Account Status (Block / Suspend / Restore) ── */}
      {/* ========================================================= */}
      {isStatusModalOpen && selectedWorker && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#0e1322",
            border: "1px solid var(--border-glass)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "500px",
            padding: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-slider-alt" style={{ color: "#f59e0b" }} /> إدارة حالة حساب مقدم الخدمة
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              المستخدم: <strong>{selectedWorker.profile?.full_name || "مقدم الخدمة"}</strong>
            </p>

            <form onSubmit={handleSaveStatus}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>
                  اختر إجراء الحالة المطلوب:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: statusAction === "suspend" ? "rgba(245, 158, 11, 0.15)" : "rgba(255,255,255,0.03)",
                    border: statusAction === "suspend" ? "1px solid #f59e0b" : "1px solid var(--border-glass)",
                    cursor: "pointer"
                  }}>
                    <input
                      type="radio"
                      name="statusAction"
                      value="suspend"
                      checked={statusAction === "suspend"}
                      onChange={() => setStatusAction("suspend")}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#f59e0b", fontSize: "0.9rem" }}>⏸️ إيقاف مؤقت / قفل الحساب</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>منع الحساب من استقبال طلبات جديدة مؤقتاً مع إمكانية إلغائه بأي وقت.</div>
                    </div>
                  </label>

                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: statusAction === "block" ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)",
                    border: statusAction === "block" ? "1px solid #ef4444" : "1px solid var(--border-glass)",
                    cursor: "pointer"
                  }}>
                    <input
                      type="radio"
                      name="statusAction"
                      value="block"
                      checked={statusAction === "block"}
                      onChange={() => setStatusAction("block")}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#ef4444", fontSize: "0.9rem" }}>🛑 حظر الحساب كلياً</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>حظر الحساب نهائياً ومنع صاحبه من استخدام منصة الخدمة.</div>
                    </div>
                  </label>

                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: statusAction === "activate" ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.03)",
                    border: statusAction === "activate" ? "1px solid #10b981" : "1px solid var(--border-glass)",
                    cursor: "pointer"
                  }}>
                    <input
                      type="radio"
                      name="statusAction"
                      value="activate"
                      checked={statusAction === "activate"}
                      onChange={() => setStatusAction("activate")}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#10b981", fontSize: "0.9rem" }}>✅ تفعيل / إلغاء الحظر والتجميد</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>إعادة الحساب للوضع النشط الطبيعي.</div>
                    </div>
                  </label>
                </div>
              </div>

              {statusAction !== "activate" && (
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                    ملاحظات أو سبب الإيقاف/الحظر (ستصل للمستخدم):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="مثال: مخالفة شروط الخدمة أو عدم الالتزام بالتقييمات..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-glass)",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none"
                    }}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="ios-btn ios-btn-secondary"
                  style={{ padding: "10px 18px", fontSize: "0.88rem" }}
                  disabled={updatingStatus}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="ios-btn ios-btn-primary"
                  style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ── MODAL 3: Send Custom Notification & Bonus Points ── */}
      {/* ========================================================= */}
      {isNotifModalOpen && selectedWorker && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#0e1322",
            border: "1px solid var(--border-glass)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "540px",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-paper-plane" style={{ color: "#a78bfa" }} /> إرسال إشعار أو مكافأة لمقدم الخدمة
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              المستلم: <strong>{selectedWorker.profile?.full_name || "مقدم الخدمة"}</strong>
            </p>

            <form onSubmit={handleSendNotification}>
              {/* Notif Type Select */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                  نوع الرسالة والإشعار:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifType("reward");
                      setNotifTitle("🎁 مكافأة وتقدير من إدارة المنصة!");
                      setRewardPoints("50");
                    }}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: notifType === "reward" ? "2px solid #8b5cf6" : "1px solid var(--border-glass)",
                      background: notifType === "reward" ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                      color: notifType === "reward" ? "#a78bfa" : "var(--text-secondary)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    🎁 مكافأة تقديرية
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNotifType("instruction");
                      setNotifTitle("📋 تعليمات وإرشادات مهمة لمقدمي الخدمات");
                      setRewardPoints("0");
                    }}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: notifType === "instruction" ? "2px solid #3b82f6" : "1px solid var(--border-glass)",
                      background: notifType === "instruction" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.03)",
                      color: notifType === "instruction" ? "#60a5fa" : "var(--text-secondary)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    📋 تعليمات وإرشادات
                  </button>
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                  عنوان الإشعار:
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="مثال: تعليمات جديدة بشأن مواعيد العمل..."
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-glass)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                  نص الإشعار والرسالة:
                </label>
                <textarea
                  rows={4}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="اكتب تفاصيل الرسالة هنا..."
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-glass)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none",
                    lineHeight: "1.5"
                  }}
                />
              </div>

              {/* Optional Reward Inputs (Financial Balance & Points) */}
              <div style={{ marginBottom: "20px", background: "rgba(16, 185, 129, 0.08)", padding: "14px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                <div style={{ fontWeight: 700, color: "#10b981", fontSize: "0.92rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="bx bx-wallet" style={{ fontSize: "1.2rem" }} /> مكافأة مالية ونقاط تشجيعية (تُضاف لرصيد الحساب فوراً):
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Cash Reward Balance (EGP) */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>
                      💰 رصيد مالي (ج.م):
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={rewardBalance}
                      onChange={(e) => setRewardBalance(e.target.value)}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-glass)",
                        background: "rgba(0,0,0,0.3)",
                        color: "#10b981",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Bonus Reward Points */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>
                      ⭐ نقاط مكافأة:
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(e.target.value)}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-glass)",
                        background: "rgba(0,0,0,0.3)",
                        color: "#f59e0b",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.4" }}>
                  * المبالغ والنقاط المدخلة هنا ستسمع وتضاف مباشرة إلى الرصيد المالي والنقاط الخاص بمقدم الخدمة في حسابه.
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(false)}
                  className="ios-btn ios-btn-secondary"
                  style={{ padding: "10px 18px", fontSize: "0.88rem" }}
                  disabled={sendingNotif}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="ios-btn ios-btn-primary"
                  style={{ padding: "10px 20px", fontSize: "0.88rem", background: "#8b5cf6" }}
                  disabled={sendingNotif}
                >
                  {sendingNotif ? "جاري الإرسال..." : "إرسال الإشعار الآن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ── MODAL 4: Delete Confirmation Modal ── */}
      {/* ========================================================= */}
      {isDeleteModalOpen && selectedWorker && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#0e1322",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "460px",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            textAlign: "center"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", margin: "0 auto 16px" }}>
              <i className="bx bx-trash" />
            </div>

            <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", margin: "0 0 8px 0" }}>
              تأكيد حذف الحساب نهائياً؟
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "20px" }}>
              أنت على وشك حذف حساب <strong>{selectedWorker.profile?.full_name || "مقدم الخدمة"}</strong> بشكل كامل من النظام. وسيتم مسح كافة أعماله وطلباته وتقييماته. هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="ios-btn ios-btn-secondary"
                style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                disabled={deletingWorker}
              >
                إلغاء الأمر
              </button>
              <button
                onClick={handleConfirmDelete}
                className="ios-btn"
                style={{ background: "#ef4444", color: "#fff", padding: "10px 20px", fontSize: "0.88rem" }}
                disabled={deletingWorker}
              >
                {deletingWorker ? "جاري الحذف..." : "نعم، احذف الحساب نهائياً"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
