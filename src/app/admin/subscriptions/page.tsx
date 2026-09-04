"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

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
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

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

  // Active Tab: users or plans
  const [activeTab, setActiveTab] = useState<"users" | "plans">("users");
  const [updating, setUpdating] = useState(false);
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
          fetchPlans();
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
            <span>👑</span> إدارة الباقات والاشتراكات
          </h1>
          <p className={styles.tableSubtitle} style={{ marginTop: "4px", fontSize: "0.9rem" }}>
            قم بإدارة أسعار ومزايا الباقات، متابعة اشتراكات الأعضاء، وتحديث التجديدات والتراخيص الفعالة.
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
            <i className="bx bx-diamond" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{paidSubscribersCount}</span>
            <span className={styles.subStatLabel}>اشتراكات مدفوعة 💎</span>
          </div>
        </div>

        <div className={styles.subStatCard}>
          <div className={`${styles.subStatIcon} ${styles.subStatIconDanger}`}>
            <i className="bx bx-time-five" />
          </div>
          <div className={styles.subStatContent}>
            <span className={styles.subStatValue}>{expiredSubscribersCount}</span>
            <span className={styles.subStatLabel}>اشتراكات منتهية 🔴</span>
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
              <p style={{ color: "var(--textSecondary)", fontWeight: "600" }}>جاري تحميل قائمة المشتركين...</p>
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
                                background: "var(--bgSecondary)",
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
              <p style={{ color: "var(--textSecondary)", fontWeight: "600" }}>جاري تحميل تفاصيل الباقات...</p>
            </div>
          ) : (
            <div className={styles.planCardGrid}>
              {plans.map((p) => (
                <div key={p.id} className={styles.planCard}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 className={styles.planCardTitle}>{p.name}</h4>
                      <span className={styles.badge} style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--colorSecondary)" }}>
                        ID: {p.id}
                      </span>
                    </div>

                    <div style={{ margin: "16px 0" }}>
                      <div style={{ marginBottom: "8px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--textSecondary)" }}>السعر الشهري:</span>
                        <strong className={styles.planPriceTag}>{p.price_monthly} ج.م</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--textSecondary)" }}>السعر السنوي:</span>
                        <strong style={{ fontSize: "1.2rem", fontWeight: "900", color: "#3b82f6" }}>{p.price_yearly} ج.م</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--borderGlass)", paddingTop: "14px", marginTop: "14px" }}>
                      <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.88rem", marginBottom: "10px" }}>
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

              <div style={{ background: "var(--bgGlass-card)", padding: "12px 16px", borderRadius: "12px", fontSize: "0.85rem", border: "1px solid var(--borderGlass)", color: "var(--textPrimary)" }}>
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
    </div>
  );
}
