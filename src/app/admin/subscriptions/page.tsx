"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";
import {
  NewUserTrialConfig,
  OpenPageAccessOffer,
  PROTECTED_PAGE_OPTIONS,
  DEFAULT_TRIAL_CONFIG,
  getNewUserTrialConfig,
  saveNewUserTrialConfig,
  getOpenPageAccessOffers,
  saveOpenPageAccessOffer,
  deleteOpenPageAccessOffer,
} from "@/lib/promotions";

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  created_at?: string;
  updated_at?: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  governorate: string | null;
  city: string | null;
  subscription_tier: string;
  subscription_period: string | null;
  subscription_status: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  created_at: string;
  is_admin: boolean;
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Active Tab: users | plans | promotions
  const [activeTab, setActiveTab] = useState<"users" | "plans" | "promotions">("users");

  // Plans State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    price_monthly: 0,
    price_yearly: 0,
    featuresText: "",
  });

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState({
    subscription_tier: "free",
    subscription_period: "",
    subscription_status: "active",
    subscription_start: "",
    subscription_end: "",
  });

  // Promotions State (New User Trial & Open Page Offers)
  const [trialConfig, setTrialConfig] = useState<NewUserTrialConfig>(DEFAULT_TRIAL_CONFIG);
  const [loadingTrial, setLoadingTrial] = useState(true);
  const [savingTrial, setSavingTrial] = useState(false);
  const [trialPreset, setTrialPreset] = useState<"7" | "30" | "90" | "custom">("30");

  const [openOffers, setOpenOffers] = useState<OpenPageAccessOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OpenPageAccessOffer | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);

  const [offerForm, setOfferForm] = useState({
    title: "",
    target_page: "all",
    duration_type: "preset" as "preset" | "custom",
    duration_preset_days: 7,
    custom_end_date: "",
    is_active: true,
    banner_message: "",
    send_broadcast: false,
  });

  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync tab with URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "promotions" || tabParam === "offers") {
      setActiveTab("promotions");
    } else if (tabParam === "plans") {
      setActiveTab("plans");
    } else if (tabParam === "users") {
      setActiveTab("users");
    }
  }, [searchParams]);

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
          fetchPlans();
          fetchUsers();
          fetchPromotions();
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const fetchPlans = async () => {
    if (!supabase) return;
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      console.error("Error fetching subscription plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchUsers = async () => {
    if (!supabase) return;
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, email, phone, governorate, city, subscription_tier, subscription_period, subscription_status, subscription_start, subscription_end, created_at, is_admin")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (err: any) {
      console.error("Error fetching user profiles:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPromotions = async () => {
    setLoadingTrial(true);
    setLoadingOffers(true);
    try {
      const [trialData, offersData] = await Promise.all([
        getNewUserTrialConfig(),
        getOpenPageAccessOffers(),
      ]);

      setTrialConfig(trialData);
      if (trialData.duration_days === 7) setTrialPreset("7");
      else if (trialData.duration_days === 30) setTrialPreset("30");
      else if (trialData.duration_days === 90) setTrialPreset("90");
      else setTrialPreset("custom");

      setOpenOffers(offersData);
    } catch (err) {
      console.error("Error fetching promotions:", err);
    } finally {
      setLoadingTrial(false);
      setLoadingOffers(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      featuresText: plan.features ? plan.features.join("\n") : "",
    });
    setStatusMessage(null);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedPlan) return;
    setUpdating(true);
    setStatusMessage(null);

    const features = planForm.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          name: planForm.name,
          price_monthly: Number(planForm.price_monthly),
          price_yearly: Number(planForm.price_yearly),
          features: features,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPlan.id);

      if (error) throw error;

      // Update state locally
      setPlans((prev) =>
        prev.map((p) =>
          p.id === selectedPlan.id
            ? {
              ...p,
              name: planForm.name,
              price_monthly: Number(planForm.price_monthly),
              price_yearly: Number(planForm.price_yearly),
              features: features,
            }
            : p
        )
      );

      setStatusMessage({ type: "success", text: "تم تحديث الباقة بنجاح!" });
      setSelectedPlan(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل تحديث الباقة: " + err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleEditUserSubscription = (profile: UserProfile) => {
    setSelectedUser(profile);
    setUserForm({
      subscription_tier: profile.subscription_tier || "free",
      subscription_period: profile.subscription_period || "",
      subscription_status: profile.subscription_status || "active",
      subscription_start: profile.subscription_start ? new Date(profile.subscription_start).toISOString().split("T")[0] : "",
      subscription_end: profile.subscription_end ? new Date(profile.subscription_end).toISOString().split("T")[0] : "",
    });
    setStatusMessage(null);
  };

  const handleQuickExtendUser = async (profile: UserProfile, daysToAdd: number) => {
    if (!supabase) return;
    setUpdating(true);
    setStatusMessage(null);

    const currentEnd = profile.subscription_end ? new Date(profile.subscription_end) : new Date();
    const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
    const newEnd = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const subStart = profile.subscription_start || new Date().toISOString();
    const subEndStr = newEnd.toISOString();

    try {
      const { data, error } = await supabase.rpc("admin_update_user_subscription", {
        p_user_id: profile.id,
        p_tier: profile.subscription_tier === "free" ? "mishwar" : profile.subscription_tier,
        p_period: profile.subscription_period || "monthly",
        p_status: "active",
        p_start: subStart,
        p_end: subEndStr
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      // Send notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: profile.id,
            title: "🎉 تم تمديد اشتراكك بنجاح",
            message: `تم تمديد فترة اشتراكك لمدة ${daysToAdd} يوماً إضافية من قبل الإدارة.`,
            type: "success",
            link: "/profile",
          },
        ]);
      } catch (errNotif) {
        console.error("Failed to send extension notification:", errNotif);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === profile.id
            ? {
              ...u,
              subscription_tier: profile.subscription_tier === "free" ? "mishwar" : profile.subscription_tier,
              subscription_status: "active",
              subscription_end: subEndStr,
            }
            : u
        )
      );

      setStatusMessage({ type: "success", text: `تم تمديد اشتراك ${profile.full_name || profile.username} لمدة ${daysToAdd} يوماً بنجاح!` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل التمديد السريع: " + err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveUserSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedUser) return;
    setUpdating(true);
    setStatusMessage(null);

    const subStart = userForm.subscription_start ? new Date(userForm.subscription_start).toISOString() : null;
    const subEnd = userForm.subscription_end ? new Date(userForm.subscription_end).toISOString() : null;
    const subPeriod = userForm.subscription_period || null;

    try {
      const { data, error } = await supabase.rpc("admin_update_user_subscription", {
        p_user_id: selectedUser.id,
        p_tier: userForm.subscription_tier,
        p_period: subPeriod,
        p_status: userForm.subscription_status,
        p_start: subStart,
        p_end: subEnd
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      // Send a notification to the user
      try {
        const planName = plans.find((p) => p.id === userForm.subscription_tier)?.name || userForm.subscription_tier;
        let notifTitle = "⚙️ تم تعديل اشتراكك من قبل الإدارة";
        let notifMsg = `تم تعديل تفاصيل اشتراكك في باقة (${planName}) من قبل المشرف.`;

        if (userForm.subscription_status === "expired") {
          notifTitle = "⚠️ انتهى اشتراكك";
          notifMsg = `انتهت صلاحية اشتراكك في باقة (${planName}). يرجى التجديد لتفادي توقف الخدمات.`;
        }

        await supabase.from("notifications").insert([
          {
            user_id: selectedUser.id,
            title: notifTitle,
            message: notifMsg,
            type: userForm.subscription_status === "active" ? "success" : "warning",
            link: "/profile",
          },
        ]);
      } catch (errNotif) {
        console.error("Failed to send subscription update notification:", errNotif);
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
              ...u,
              subscription_tier: userForm.subscription_tier,
              subscription_period: subPeriod,
              subscription_status: userForm.subscription_status,
              subscription_start: subStart,
              subscription_end: subEnd,
            }
            : u
        )
      );

      setStatusMessage({ type: "success", text: "تم تحديث اشتراك المستخدم وإرسال الإشعار بنجاح!" });
      setSelectedUser(null);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل تحديث الاشتراك: " + err.message });
    } finally {
      setUpdating(false);
    }
  };

  const addPresetDaysToModalEnd = (days: number) => {
    const currentEnd = userForm.subscription_end ? new Date(userForm.subscription_end) : new Date();
    const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
    const newDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    setUserForm((prev) => ({
      ...prev,
      subscription_end: newDate.toISOString().split("T")[0],
      subscription_status: "active",
      subscription_start: prev.subscription_start || new Date().toISOString().split("T")[0],
    }));
  };

  // --- Handlers: New User Trial Promotion ---
  const handleSaveTrial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingTrial(true);
    setStatusMessage(null);

    let days = trialConfig.duration_days;
    if (trialPreset === "7") days = 7;
    else if (trialPreset === "30") days = 30;
    else if (trialPreset === "90") days = 90;

    const payload = {
      ...trialConfig,
      duration_days: Math.max(1, days),
    };

    try {
      const res = await saveNewUserTrialConfig(payload);
      if (res.success) {
        setTrialConfig(payload);
        setStatusMessage({
          type: "success",
          text: payload.is_active
            ? `🎉 تم تفعيل عرض الاشتراك المجاني للحسابات الجديدة (${days} يوماً - باقة ${payload.target_tier === "gold" ? "الذهبية" : payload.target_tier === "silver" ? "الفضية" : "المشوار"}) بنجاح!`
            : "تم تعطيل عرض الاشتراك التجريبي للحسابات الجديدة.",
        });
      } else {
        throw new Error(res.error || "Failed");
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل حفظ إعدادات العرض الترحيبي: " + err.message });
    } finally {
      setSavingTrial(false);
    }
  };

  // --- Handlers: Open Page Access Offers ---
  const handleOpenAddOfferModal = () => {
    setSelectedOffer(null);
    setOfferForm({
      title: "عرض مجاني خاص لفترة محدودة",
      target_page: "all",
      duration_type: "preset",
      duration_preset_days: 7,
      custom_end_date: "",
      is_active: true,
      banner_message: "🎉 هذه الخدمة مفتوحة الآن مجاناً لجميع المستخدمين والزوار لفترة محدودة!",
      send_broadcast: false,
    });
    setIsOfferModalOpen(true);
  };

  const handleEditOffer = (offer: OpenPageAccessOffer) => {
    setSelectedOffer(offer);
    const hasCustomEnd = !!offer.end_date;
    const endDateStr = offer.end_date ? new Date(offer.end_date).toISOString().split("T")[0] : "";

    setOfferForm({
      title: offer.title || "",
      target_page: offer.target_page || "all",
      duration_type: hasCustomEnd ? "custom" : "preset",
      duration_preset_days: 7,
      custom_end_date: endDateStr,
      is_active: offer.is_active,
      banner_message: offer.banner_message || "",
      send_broadcast: false,
    });
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffer(true);
    setStatusMessage(null);

    let calculatedEndDate: string | null = null;
    const now = new Date();

    if (offerForm.duration_type === "preset") {
      calculatedEndDate = new Date(now.getTime() + offerForm.duration_preset_days * 24 * 60 * 60 * 1000).toISOString();
    } else if (offerForm.custom_end_date) {
      calculatedEndDate = new Date(offerForm.custom_end_date + "T23:59:59").toISOString();
    }

    const payload: Partial<OpenPageAccessOffer> = {
      id: selectedOffer?.id,
      title: offerForm.title.trim(),
      target_page: offerForm.target_page,
      is_active: offerForm.is_active,
      start_date: selectedOffer?.start_date || now.toISOString(),
      end_date: calculatedEndDate,
      banner_message: offerForm.banner_message.trim(),
    };

    try {
      const res = await saveOpenPageAccessOffer(payload);
      if (res.success && res.data) {
        const savedData = res.data;
        setOpenOffers((prev) => {
          const exists = prev.some((o) => o.id === savedData.id);
          return exists ? prev.map((o) => (o.id === savedData.id ? savedData : o)) : [savedData, ...prev];
        });

        if (offerForm.send_broadcast && supabase && offerForm.is_active) {
          try {
            const pageOption = PROTECTED_PAGE_OPTIONS.find((p) => p.value === offerForm.target_page);
            const pageLabel = pageOption ? pageOption.label : offerForm.target_page;
            await supabase.from("notifications").insert([
              {
                user_id: null,
                title: `🎁 ${offerForm.title}`,
                message: `يسرنا إعلامكم بفتح (${pageLabel}) مجاناً لجميع المستخدمين حتى ${new Date(calculatedEndDate || "").toLocaleDateString("ar-EG")}.`,
                type: "info",
                link: offerForm.target_page === "all" ? "/" : offerForm.target_page,
              },
            ]);
          } catch (bErr) {
            console.warn("Failed to send broadcast notification:", bErr);
          }
        }

        setStatusMessage({ type: "success", text: "تم حفظ وتفعيل عرض فتح الصفحة بنجاح!" });
        setIsOfferModalOpen(false);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل حفظ العرض: " + err.message });
    } finally {
      setSavingOffer(false);
    }
  };

  const handleToggleOfferStatus = async (offer: OpenPageAccessOffer) => {
    try {
      const updated = { ...offer, is_active: !offer.is_active };
      await saveOpenPageAccessOffer(updated);
      setOpenOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
      setStatusMessage({
        type: "success",
        text: updated.is_active ? `تم تشغيل عرض "${offer.title}" بنجاح.` : `تم إيقاف عرض "${offer.title}".`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل تعديل حالة العرض: " + err.message });
    }
  };

  const handleDeleteOffer = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف عرض "${title}"؟`)) return;
    try {
      await deleteOpenPageAccessOffer(id);
      setOpenOffers((prev) => prev.filter((o) => o.id !== id));
      setStatusMessage({ type: "success", text: `تم حذف العرض "${title}" بنجاح.` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "فشل حذف العرض: " + err.message });
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "gold":
        return <span className={`${styles.tierBadge} ${styles.tierGold}`}>🥇 الباقة الذهبية</span>;
      case "silver":
        return <span className={`${styles.tierBadge} ${styles.tierSilver}`}>🥈 الباقة الفضية</span>;
      case "mishwar":
        return <span className={`${styles.tierBadge} ${styles.tierMishwar}`}>⚡ باقة المشوار</span>;
      case "free":
      default:
        return <span className={`${styles.tierBadge} ${styles.tierFree}`}>⚪ المجانية</span>;
    }
  };

  const getDaysRemainingInfo = (endDateStr: string | null, status: string | null) => {
    if (!endDateStr) return null;
    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || status === "expired") {
      const absDays = Math.abs(diffDays);
      return (
        <span className={`${styles.daysRemainingPill} ${styles.daysRemainingPillExpired}`}>
          منتهي {absDays > 0 ? `منذ ${absDays} يوم` : "اليوم"}
        </span>
      );
    } else if (diffDays <= 5) {
      return (
        <span className={`${styles.daysRemainingPill} ${styles.daysRemainingPillWarning}`}>
          متبقي {diffDays === 0 ? "اليوم فقط" : `${diffDays} أيام`}
        </span>
      );
    } else {
      return (
        <span className={`${styles.daysRemainingPill} ${styles.daysRemainingPillOk}`}>
          متبقي {diffDays} يوم
        </span>
      );
    }
  };

  // Filter users based on search & filter dropdowns
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);

    const matchesTier = tierFilter === "all" || u.subscription_tier === tierFilter;

    const isExpired = u.subscription_end && new Date(u.subscription_end) < new Date();
    const currentStatus = isExpired ? "expired" : (u.subscription_status || "active");
    const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Calculate statistics
  const totalSubscribersCount = users.length;
  const paidSubscribersCount = users.filter((u) => u.subscription_tier && u.subscription_tier !== "free").length;
  const activeSubscribersCount = users.filter((u) => {
    if (!u.subscription_tier || u.subscription_tier === "free") return false;
    const isExpired = u.subscription_end && new Date(u.subscription_end) < new Date();
    return !isExpired && u.subscription_status === "active";
  }).length;
  const expiredSubscribersCount = users.filter((u) => {
    if (u.subscription_tier === "free") return false;
    const isExpired = u.subscription_end && new Date(u.subscription_end) < new Date();
    return isExpired || u.subscription_status === "expired";
  }).length;

  const activeOpenOffersCount = openOffers.filter((o) => {
    if (!o.is_active) return false;
    if (o.end_date && new Date(o.end_date) < new Date()) return false;
    return true;
  }).length;

  if (authChecking) {
    return (
      <div className={styles.adminLoadingContainer}>
        <div className={styles.spinner} />
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>جاري التحقق من الصلاحيات والبيانات...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.adminAccessDenied}>
        <i className="bx bx-lock-alt" style={{ fontSize: "4rem", color: "var(--accent-red)" }} />
        <h2 style={{ marginTop: "16px", color: "var(--text-primary)" }}>عفواً، الدخول غير مصرح به</h2>
        <p style={{ color: "var(--text-secondary)" }}>هذه الصفحة مخصصة لمديري النظام فقط.</p>
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
            <span>👑</span> إدارة الباقات والاشتراكات
          </h1>
          <p className={styles.tableSubtitle} style={{ marginTop: "4px", fontSize: "0.9rem" }}>
            إدارة أسعار ومزايا الباقات، متابعة اشتراكات الأعضاء، وتفعيل العروض والخصومات والوصول المجاني.
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
            <span className={styles.subStatValue}>{totalSubscribersCount}</span>
            <span className={styles.subStatLabel}>إجمالي المشتركين</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconSuccess}`}>
            <i className="bx bx-check-circle" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{activeSubscribersCount}</span>
            <span className={styles.subStatLabel}>اشتراكات نشطة 🟢</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconWarning}`}>
            <i className="bx bx-gift" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>
              {trialConfig.is_active ? "مفعّل 🎁" : "معطّل ⚪"}
            </span>
            <span className={styles.subStatLabel}>عرض التسجيل الجديد</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconDanger}`}>
            <i className="bx bx-lock-open-alt" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{activeOpenOffersCount}</span>
            <span className={styles.subStatLabel}>صفحات مفتوحة مجاناً</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className={styles.subTabsContainer}>
        <button
          onClick={() => {
            setActiveTab("users");
            setStatusMessage(null);
          }}
          className={`${styles.subTabBtn} ${activeTab === "users" ? styles.subTabBtnActive : ""}`}
        >
          <i className="bx bx-user-check" style={{ fontSize: "1.2rem" }} />
          <span>اشتراكات الأعضاء ({users.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("plans");
            setStatusMessage(null);
          }}
          className={`${styles.subTabBtn} ${activeTab === "plans" ? styles.subTabBtnActive : ""}`}
        >
          <i className="bx bx-layer" style={{ fontSize: "1.2rem" }} />
          <span>تحرير أسعار ومميزات الباقات ({plans.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("promotions");
            setStatusMessage(null);
          }}
          className={`${styles.subTabBtn} ${activeTab === "promotions" ? styles.subTabBtnActive : ""}`}
          style={{ position: "relative" }}
        >
          <i className="bx bx-gift" style={{ fontSize: "1.2rem", color: "#f59e0b" }} />
          <span>العروض والخصومات 🎁</span>
          {(trialConfig.is_active || activeOpenOffersCount > 0) && (
            <span
              style={{
                background: "#10b981",
                color: "#fff",
                fontSize: "0.68rem",
                padding: "2px 6px",
                borderRadius: "10px",
                marginRight: "4px",
                fontWeight: "800",
              }}
            >
              نشط
            </span>
          )}
        </button>
      </div>

      {/* Alert Status Banner */}
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

      {/* ── TAB 1: Users Subscriptions Management ── */}
      {activeTab === "users" && (
        <div className={styles.subPanelCard}>

          {/* Header & Filter Controls */}
          <div className={styles.subFilterBar}>
            <h3 className={styles.subPanelHeaderTitle}>قائمة اشتراكات المستخدمين</h3>

            <div className={styles.subFilterGroup}>
              {/* Search input */}
              <div className={styles.subSearchWrapper}>
                <input
                  type="text"
                  placeholder="ابحث بالاسم، اليوزر، البريد أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.subSearchInput}
                />
                <i className="bx bx-search" style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)", fontSize: "1.1rem" }} />
              </div>

              {/* Tier Filter */}
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.subSelect}
              >
                <option value="all">كل الحالات</option>
                <option value="active">نشط 🟢</option>
                <option value="expired">منتهي الصلاحية 🔴</option>
                <option value="cancelled">ملغي 🟡</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <div className={styles.spinner} style={{ margin: "0 auto 14px" }} />
              <p style={{ color: "var(--text-secondary)", fontWeight: "600" }}>جاري تحميل قائمة المشتركين...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.adsEmptyState}>
              <i className="bx bx-user-x" style={{ fontSize: "3rem", marginBottom: "8px", opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: "700" }}>لا يوجد مستخدمون يطابقون خيارات البحث والفلترة الحالية.</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.adminTable}>
                <thead className={styles.adminThead}>
                  <tr>
                    <th className={styles.adminTh}>المستخدم</th>
                    <th className={styles.adminTh}>الباقة الحالية</th>
                    <th className={styles.adminTh}>فترة الاشتراك</th>
                    <th className={styles.adminTh}>تاريخ الانتهاء والمهلة</th>
                    <th className={styles.adminTh}>الحالة</th>
                    <th className={styles.adminTh} style={{ textAlign: "center" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isExpired = u.subscription_end && new Date(u.subscription_end) < new Date();
                    const statusText = isExpired ? "منتهي 🔴" : u.subscription_status === "active" ? "نشط 🟢" : u.subscription_status === "cancelled" ? "ملغي 🟡" : "مجاني";
                    const initial = (u.full_name || u.username || "U").charAt(0).toUpperCase();

                    return (
                      <tr key={u.id} className={styles.adminTr}>
                        {/* User Profile */}
                        <td className={styles.adminTd}>
                          <div className={styles.subUserBlock}>
                            <div className={styles.subUserAvatar}>
                              {initial}
                            </div>
                            <div>
                              <div className={styles.subUserName}>{u.full_name || "مستخدم بدون اسم"}</div>
                              <div className={styles.subUserMeta}>@{u.username || "بدون_يوزر"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Tier Badge */}
                        <td className={styles.adminTd}>
                          {getTierBadge(u.subscription_tier)}
                        </td>

                        {/* Subscription Period */}
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>
                          {u.subscription_period === "daily" ? "يومي (24س)" : u.subscription_period === "monthly" ? "شهري" : u.subscription_period === "yearly" ? "سنوي" : "—"}
                        </td>

                        {/* Expiry Date & Pill */}
                        <td className={styles.adminTd}>
                          <div style={{ fontWeight: "700" }}>
                            {u.subscription_end ? new Date(u.subscription_end).toLocaleDateString("ar-EG") : "غير محدد"}
                          </div>
                          {getDaysRemainingInfo(u.subscription_end, u.subscription_status)}
                        </td>

                        {/* Status Badge */}
                        <td className={styles.adminTd}>
                          <span className={
                            isExpired || u.subscription_status === "expired"
                              ? styles.statusBadgeExpired
                              : u.subscription_status === "active"
                                ? styles.statusBadgeActive
                                : styles.statusBadgeCancelled
                          }>
                            {statusText}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className={styles.adminTd} style={{ textAlign: "center" }}>
                          <div className={styles.actionGroup} style={{ justifyContent: "center" }}>
                            <button
                              onClick={() => handleEditUserSubscription(u)}
                              className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                              style={{
                                padding: "5px 5px",
                                borderRadius: "50%",
                                background: "var(--bg-secondary)",
                              }}
                            >
                              <i className="bx bx-edit" />
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
      )}

      {/* ── TAB 2: Subscription Plans Manager ── */}
      {activeTab === "plans" && (
        <div className={styles.subPanelCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 className={styles.subPanelHeaderTitle}>باقات الاشتراك المتاحة للنظام</h3>
              <p className={styles.tableSubtitle} style={{ marginTop: "4px" }}>
                يمكنك التعديل مباشرة على الأسعار والمميزات لتحديثها تلقائياً للمستخدمين والموقع.
              </p>
            </div>
          </div>

          {loadingPlans ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <div className={styles.spinner} style={{ margin: "0 auto 14px" }} />
              <p style={{ color: "var(--text-secondary)", fontWeight: "600" }}>جاري تحميل تفاصيل الباقات...</p>
            </div>
          ) : (
            <div className={styles.planCardGrid}>
              {plans.map((p) => (
                <div key={p.id} className={styles.planCard}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 className={styles.planCardTitle}>{p.name}</h4>
                      <span className={styles.badge} style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--color-secondary)" }}>
                        ID: {p.id}
                      </span>
                    </div>

                    <div style={{ margin: "16px 0" }}>
                      <div style={{ marginBottom: "8px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>السعر الشهري:</span>
                        <strong className={styles.planPriceTag}>{p.price_monthly} ج.م</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>السعر السنوي:</span>
                        <strong style={{ fontSize: "1.2rem", fontWeight: "900", color: "#3b82f6" }}>{p.price_yearly} ج.م</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "14px" }}>
                      <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.88rem", marginBottom: "10px" }}>
                        المزايا والمواصفات:
                      </div>
                      {p.features && p.features.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {p.features.map((feat, i) => (
                            <div key={i} className={styles.planFeatureItem}>
                              <i className="bx bx-check-circle" style={{ color: "#10b981", fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }} />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>لا توجد مميزات مسجلة</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditPlan(p)}
                    className={styles.inviteButton}
                    style={{ width: "100%", justifyContent: "center", marginTop: "24px", padding: "12px" }}
                  >
                    <i className="bx bx-edit" style={{ fontSize: "1.1rem" }} />
                    <span>تعديل الباقة والأسعار</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: Promotions & Offers Manager (العروض والخصومات) ── */}
      {activeTab === "promotions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* SECTION A: Automatic Free Trial for New Signups */}
          <div className={styles.subPanelCard} style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: trialConfig.is_active
                  ? "linear-gradient(90deg, #10b981, #3b82f6)"
                  : "rgba(148, 163, 184, 0.3)",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>🎁</span>
                  <h3 className={styles.subPanelHeaderTitle} style={{ margin: 0 }}>
                    العرض الترحيبي: اشتراك مجاني تلقائي للحسابات الجديدة
                  </h3>
                </div>
                <p className={styles.tableSubtitle} style={{ marginTop: "6px", maxWidth: "700px" }}>
                  عند تفعيل هذا العرض، أي مستخدم ينشئ حساباً جديداً في الموقع يحصل تلقائياً وبشكل فوري على باقة اشتراك مجانية للمدة المحددة مع رسالة ترحيبية في حسابه.
                </p>
              </div>

              {/* Status Switch Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: trialConfig.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.15)",
                  padding: "8px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${trialConfig.is_active ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.2)"}`,
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={trialConfig.is_active}
                    onChange={(e) => setTrialConfig({ ...trialConfig, is_active: e.target.checked })}
                    style={{ width: "18px", height: "18px", accentColor: "#10b981", cursor: "pointer" }}
                  />
                  <span>{trialConfig.is_active ? "العرض نشط حالياً 🟢" : "العرض معطّل ⚪"}</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSaveTrial}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  background: "var(--bg-glass-card, rgba(0, 0, 0, 0.15))",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid var(--border-glass)",
                }}
              >
                {/* 1. Select Tier */}
                <div>
                  <label className={styles.subFormLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="bx bx-crown" style={{ color: "#fbbf24" }} />
                    <span>نوع باقة الهدية الترحيبية</span>
                  </label>
                  <select
                    value={trialConfig.target_tier}
                    onChange={(e) => setTrialConfig({ ...trialConfig, target_tier: e.target.value as any })}
                    className={styles.subFormSelect}
                    style={{ fontWeight: "700" }}
                  >
                    <option value="gold">🥇 الباقة الذهبية (كل المميزات والخدمات مفتوحة)</option>
                    <option value="silver">🥈 الباقة الفضية (المميزات المتقدمة)</option>
                    <option value="mishwar">⚡ باقة المشوار (الوصول السريع)</option>
                  </select>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
                    سيتم منح المستخدم الجديد هذه الباقة فور استكمال التسجيل.
                  </span>
                </div>

                {/* 2. Select Duration Presets */}
                <div>
                  <label className={styles.subFormLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="bx bx-time" style={{ color: "#38bdf8" }} />
                    <span>مدة الاشتراك المجاني</span>
                  </label>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setTrialPreset("7");
                        setTrialConfig({ ...trialConfig, duration_days: 7 });
                      }}
                      className={styles.subQuickBtn}
                      style={{
                        flex: 1,
                        background: trialPreset === "7" ? "var(--mainBtn, #3b82f6)" : undefined,
                        color: trialPreset === "7" ? "#fff" : undefined,
                        borderColor: trialPreset === "7" ? "#3b82f6" : undefined,
                        fontWeight: "700",
                      }}
                    >
                      أسبوع (7 أيام)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTrialPreset("30");
                        setTrialConfig({ ...trialConfig, duration_days: 30 });
                      }}
                      className={styles.subQuickBtn}
                      style={{
                        flex: 1,
                        background: trialPreset === "30" ? "var(--mainBtn, #3b82f6)" : undefined,
                        color: trialPreset === "30" ? "#fff" : undefined,
                        borderColor: trialPreset === "30" ? "#3b82f6" : undefined,
                        fontWeight: "700",
                      }}
                    >
                      شهر (30 يوم)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTrialPreset("90");
                        setTrialConfig({ ...trialConfig, duration_days: 90 });
                      }}
                      className={styles.subQuickBtn}
                      style={{
                        flex: 1,
                        background: trialPreset === "90" ? "var(--mainBtn, #3b82f6)" : undefined,
                        color: trialPreset === "90" ? "#fff" : undefined,
                        borderColor: trialPreset === "90" ? "#3b82f6" : undefined,
                        fontWeight: "700",
                      }}
                    >
                      3 شهور (90 يوم)
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrialPreset("custom")}
                      className={styles.subQuickBtn}
                      style={{
                        flex: 1,
                        background: trialPreset === "custom" ? "var(--mainBtn, #3b82f6)" : undefined,
                        color: trialPreset === "custom" ? "#fff" : undefined,
                        borderColor: trialPreset === "custom" ? "#3b82f6" : undefined,
                        fontWeight: "700",
                      }}
                    >
                      مخصص
                    </button>
                  </div>

                  {trialPreset === "custom" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        value={trialConfig.duration_days}
                        onChange={(e) => setTrialConfig({ ...trialConfig, duration_days: Number(e.target.value) })}
                        className={styles.subFormInput}
                        placeholder="عدد الأيام..."
                        style={{ width: "140px" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>يوم</span>
                    </div>
                  )}
                </div>

                {/* 3. Welcome Notification Message */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.subFormLabel}>نص رسالة الإشعار الترحيبي للمستخدمين الجدد</label>
                  <textarea
                    rows={2}
                    value={trialConfig.welcome_message}
                    onChange={(e) => setTrialConfig({ ...trialConfig, welcome_message: e.target.value })}
                    className={styles.subFormInput}
                    style={{ lineHeight: "1.5", resize: "vertical" }}
                    placeholder="🎉 تهانينا! حصلت على اشتراك مجاني كهدية ترحيبية لتسجيل حسابك الجديد."
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="submit"
                  disabled={savingTrial}
                  className={styles.inviteButton}
                  style={{
                    padding: "12px 28px",
                    background: trialConfig.is_active ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : undefined,
                    fontWeight: "800",
                  }}
                >
                  <i className="bx bx-save" style={{ fontSize: "1.15rem" }} />
                  <span>{savingTrial ? "جاري الحفظ..." : "حفظ إعدادات العرض الترحيبي"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION B: Temporary Open Access for Protected Pages */}
          <div className={styles.subPanelCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>🔓</span>
                  <h3 className={styles.subPanelHeaderTitle} style={{ margin: 0 }}>
                    فتح الصفحات والخدمات المدفوعة مجاناً للجميع
                  </h3>
                </div>
                <p className={styles.tableSubtitle} style={{ marginTop: "6px" }}>
                  إتاحة صفحة أو خدمة تتطلب اشتراكاً (مثل ازاي اروح، المساعد الذكي، المطارات) للوصول المجاني لكل الزوار والمستخدمين لفترة زمنية محددة.
                </p>
              </div>

              <button
                onClick={handleOpenAddOfferModal}
                className={styles.inviteButton}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  fontWeight: "700",
                }}
              >
                <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem" }} />
                <span>إضافة عرض فتح صفحة +</span>
              </button>
            </div>

            {loadingOffers ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className={styles.spinner} style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "var(--text-secondary)" }}>جاري تحميل عروض الصفحات...</p>
              </div>
            ) : openOffers.length === 0 ? (
              <div className={styles.adsEmptyState} style={{ padding: "40px 20px" }}>
                <i className="bx bx-lock-open" style={{ fontSize: "3rem", marginBottom: "10px", opacity: 0.4 }} />
                <h4 style={{ margin: "0 0 6px", color: "var(--text-primary)" }}>لا توجد عروض فتح مؤقتة حالياً</h4>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  يمكنك النقر على زر &quot;إضافة عرض فتح صفحة&quot; لإتاحة أي خدمة مجاناً لفترة محددة.
                </p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead className={styles.adminThead}>
                    <tr>
                      <th className={styles.adminTh}>عنوان العرض</th>
                      <th className={styles.adminTh}>الصفحة / الخدمة</th>
                      <th className={styles.adminTh}>فترة الإتاحة والانتهاء</th>
                      <th className={styles.adminTh}>الحالة</th>
                      <th className={styles.adminTh} style={{ textAlign: "center" }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOffers.map((offer) => {
                      const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
                      const pageOption = PROTECTED_PAGE_OPTIONS.find((p) => p.value === offer.target_page);
                      const pageLabel = pageOption ? pageOption.label : offer.target_page;

                      return (
                        <tr key={offer.id} className={styles.adminTr}>
                          <td className={styles.adminTd}>
                            <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{offer.title}</div>
                            {offer.banner_message && (
                              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px", maxWidth: "280px" }}>
                                {offer.banner_message}
                              </div>
                            )}
                          </td>

                          <td className={styles.adminTd}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "10px",
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#60a5fa",
                                fontSize: "0.82rem",
                                fontWeight: "700",
                              }}
                            >
                              {pageLabel}
                            </span>
                          </td>

                          <td className={styles.adminTd}>
                            <div style={{ fontWeight: "700" }}>
                              {offer.end_date ? new Date(offer.end_date).toLocaleDateString("ar-EG") : "مفتوح دائم حتى الإيقاف"}
                            </div>
                            {getDaysRemainingInfo(offer.end_date, offer.is_active ? "active" : "expired")}
                          </td>

                          <td className={styles.adminTd}>
                            <span
                              className={
                                !offer.is_active || isExpired
                                  ? styles.statusBadgeExpired
                                  : styles.statusBadgeActive
                              }
                            >
                              {isExpired ? "منتهي 🔴" : offer.is_active ? "مفتوح للجميع 🟢" : "معطّل ⚪"}
                            </span>
                          </td>

                          <td className={styles.adminTd} style={{ textAlign: "center" }}>
                            <div className={styles.actionGroup} style={{ justifyContent: "center" }}>
                              <button
                                onClick={() => handleToggleOfferStatus(offer)}
                                className={styles.actionBtn}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  background: offer.is_active ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                  color: offer.is_active ? "#f87171" : "#34d399",
                                }}
                                title={offer.is_active ? "تعطيل العرض" : "تفعيل العرض"}
                              >
                                <i className={`bx ${offer.is_active ? "bx-pause" : "bx-play"}`} />
                              </button>

                              <button
                                onClick={() => handleEditOffer(offer)}
                                className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                                style={{ padding: "6px 10px", borderRadius: "8px" }}
                                title="تعديل تفاصيل العرض"
                              >
                                <i className="bx bx-edit" />
                              </button>

                              <button
                                onClick={() => handleDeleteOffer(offer.id, offer.title)}
                                className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                style={{ padding: "6px 10px", borderRadius: "8px" }}
                                title="حذف العرض"
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
        </div>
      )}

      {/* ── MODAL: Add / Edit Open Page Offer ── */}
      {isOfferModalOpen && (
        <div className={styles.subModalOverlay} onClick={() => setIsOfferModalOpen(false)}>
          <div className={styles.subModalBox} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className={styles.subModalTitle}>
                {selectedOffer ? "⚙️ تعديل عرض فتح الصفحة" : "🎁 إضافة عرض فتح صفحة مدفوعة مجاناً"}
              </h3>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveOffer} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className={styles.subFormLabel}>عنوان العرض الترويجي</label>
                <input
                  type="text"
                  required
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className={styles.subFormInput}
                  placeholder="مثال: إتاحة خدمة ازاي اروح مجاناً بمناسبة التحديث"
                />
              </div>

              <div>
                <label className={styles.subFormLabel}>الصفحة أو الخدمة المستهدفة</label>
                <select
                  value={offerForm.target_page}
                  onChange={(e) => setOfferForm({ ...offerForm, target_page: e.target.value })}
                  className={styles.subFormSelect}
                  style={{ fontWeight: "700" }}
                >
                  {PROTECTED_PAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration selection */}
              <div>
                <label className={styles.subFormLabel}>مدة الفتح المجاني</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {[
                    { label: "24 ساعة", days: 1 },
                    { label: "3 أيام", days: 3 },
                    { label: "أسبوع", days: 7 },
                    { label: "أسبوعين", days: 14 },
                    { label: "شهر", days: 30 },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() =>
                        setOfferForm({
                          ...offerForm,
                          duration_type: "preset",
                          duration_preset_days: preset.days,
                        })
                      }
                      className={styles.subQuickBtn}
                      style={{
                        flex: 1,
                        background:
                          offerForm.duration_type === "preset" && offerForm.duration_preset_days === preset.days
                            ? "var(--mainBtn, #3b82f6)"
                            : undefined,
                        color:
                          offerForm.duration_type === "preset" && offerForm.duration_preset_days === preset.days
                            ? "#fff"
                            : undefined,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOfferForm({ ...offerForm, duration_type: "custom" })}
                    className={styles.subQuickBtn}
                    style={{
                      flex: 1,
                      background: offerForm.duration_type === "custom" ? "var(--mainBtn, #3b82f6)" : undefined,
                      color: offerForm.duration_type === "custom" ? "#fff" : undefined,
                    }}
                  >
                    تاريخ مخصص
                  </button>
                </div>

                {offerForm.duration_type === "custom" && (
                  <div>
                    <label className={styles.subFormLabel} style={{ fontSize: "0.8rem" }}>تاريخ انتهاء العرض</label>
                    <input
                      type="date"
                      required
                      value={offerForm.custom_end_date}
                      onChange={(e) => setOfferForm({ ...offerForm, custom_end_date: e.target.value })}
                      className={styles.subFormInput}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={styles.subFormLabel}>رسالة البانر الترويجي في أعلى الصفحة</label>
                <textarea
                  rows={2}
                  value={offerForm.banner_message}
                  onChange={(e) => setOfferForm({ ...offerForm, banner_message: e.target.value })}
                  className={styles.subFormInput}
                  style={{ lineHeight: "1.5" }}
                  placeholder="🎉 هذه الخدمة مفتوحة الآن مجاناً لجميع المستخدمين والزوار لفترة محدودة!"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--bg-secondary)", padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: "700" }}>
                  <input
                    type="checkbox"
                    checked={offerForm.is_active}
                    onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#10b981" }}
                  />
                  <span>تفعيل العرض فور الحفظ</span>
                </label>

                {!selectedOffer && (
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <input
                      type="checkbox"
                      checked={offerForm.send_broadcast}
                      onChange={(e) => setOfferForm({ ...offerForm, send_broadcast: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#3b82f6" }}
                    />
                    <span>إرسال إشعار ترويجي فوري لجميع المستخدمين</span>
                  </label>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={savingOffer}
                  className={styles.inviteButton}
                  style={{ flex: 1, justifyContent: "center", padding: "12px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                >
                  {savingOffer ? "جاري الحفظ..." : "حفظ وتفعيل العرض"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-glass)",
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

      {/* ── MODAL 1: Edit Subscription Plan ── */}
      {selectedPlan && (
        <div className={styles.subModalOverlay} onClick={() => setSelectedPlan(null)}>
          <div className={styles.subModalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className={styles.subModalTitle}>⚙️ تعديل باقة: {selectedPlan.name}</h3>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className={styles.subFormLabel}>اسم الباقة</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className={styles.subFormInput}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>السعر الشهري (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    disabled={selectedPlan.id === "free"}
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>السعر السنوي (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    disabled={selectedPlan.id === "free"}
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: Number(e.target.value) })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div>
                <label className={styles.subFormLabel}>المميزات (ميزة واحدة في كل سطر)</label>
                <textarea
                  rows={5}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  className={styles.subFormInput}
                  style={{ lineHeight: "1.5", resize: "vertical" }}
                  placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={updating}
                  className={styles.inviteButton}
                  style={{ flex: 1, justifyContent: "center", padding: "12px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                  {updating ? "جاري التحديث..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-glass)",
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

      {/* ── MODAL 2: Edit User Subscription Details ── */}
      {selectedUser && (
        <div className={styles.subModalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.subModalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className={styles.subModalTitle}>⚙️ تعديل اشتراك: {selectedUser.full_name || selectedUser.username}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUserSubscription} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div style={{ background: "var(--bg-glass-card)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.85rem", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                <div>اسم المستخدم: <strong>@{selectedUser.username || "بدون_يوزر"}</strong></div>
                <div>الهاتف: <strong>{selectedUser.phone || "غير متوفر"}</strong></div>
                <div>البريد: <strong>{selectedUser.email || "غير متوفر"}</strong></div>
              </div>

              <div>
                <label className={styles.subFormLabel}>باقة الاشتراك</label>
                <select
                  value={userForm.subscription_tier}
                  onChange={(e) => {
                    const tier = e.target.value;
                    setUserForm({
                      ...userForm,
                      subscription_tier: tier,
                      subscription_period: tier === "free" ? "" : (tier === "mishwar" ? "daily" : (userForm.subscription_period === "daily" ? "monthly" : userForm.subscription_period || "monthly")),
                    });
                  }}
                  className={styles.subFormSelect}
                >
                  <option value="free">المجانية</option>
                  <option value="mishwar">باقة المشوار (9 ج.م)</option>
                  <option value="silver">الباقة الفضية (40 ج.م)</option>
                  <option value="gold">الباقة الذهبية (60 ج.م)</option>
                </select>
              </div>

              {userForm.subscription_tier !== "free" && (
                <div>
                  <label className={styles.subFormLabel}>فترة الاشتراك</label>
                  <select
                    value={userForm.subscription_period || ""}
                    onChange={(e) => setUserForm({ ...userForm, subscription_period: e.target.value })}
                    className={styles.subFormSelect}
                  >
                    <option value="daily">يومياً (24 ساعة)</option>
                    <option value="monthly">شهرياً</option>
                    <option value="yearly">سنوياً</option>
                  </select>
                </div>
              )}

              <div>
                <label className={styles.subFormLabel}>حالة الاشتراك</label>
                <select
                  value={userForm.subscription_status}
                  onChange={(e) => setUserForm({ ...userForm, subscription_status: e.target.value })}
                  className={styles.subFormSelect}
                >
                  <option value="active">نشط (فعال)</option>
                  <option value="expired">منتهي الصلاحية</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div>
                <label className={styles.subFormLabel}>اختصارات تمديد المدة السريعة</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => addPresetDaysToModalEnd(7)} className={styles.subQuickBtn}>
                    + 7 أيام
                  </button>
                  <button type="button" onClick={() => addPresetDaysToModalEnd(30)} className={styles.subQuickBtn}>
                    + شهر (30 يوم)
                  </button>
                  <button type="button" onClick={() => addPresetDaysToModalEnd(365)} className={styles.subQuickBtn}>
                    + سنة (365 يوم)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, subscription_status: "expired" })}
                    className={styles.subQuickBtn}
                    style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}
                  >
                    تعيين كمنتهي
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className={styles.subFormLabel}>تاريخ البدء</label>
                  <input
                    type="date"
                    value={userForm.subscription_start}
                    onChange={(e) => setUserForm({ ...userForm, subscription_start: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
                <div>
                  <label className={styles.subFormLabel}>تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required={userForm.subscription_tier !== "free"}
                    value={userForm.subscription_end}
                    onChange={(e) => setUserForm({ ...userForm, subscription_end: e.target.value })}
                    className={styles.subFormInput}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={updating}
                  className={styles.inviteButton}
                  style={{ flex: 1, justifyContent: "center", padding: "12px" }}
                >
                  {updating ? "جاري التحديث..." : "حفظ التعديلات والترقية"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-glass)",
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
    </div>
  );
}
