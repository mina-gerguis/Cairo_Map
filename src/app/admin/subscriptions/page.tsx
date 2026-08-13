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
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState({
    subscription_tier: "free",
    subscription_period: "",
    subscription_status: "active",
    subscription_start: "",
    subscription_end: "",
  });

  // Active Tab: plans or users
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

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "free":
        return "المجانية";
      case "mishwar":
        return "المشوار ⚡";
      case "silver":
        return "الفضية 🥈";
      case "gold":
        return "الذهبية 🥇";
      default:
        return tier;
    }
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case "free":
        return { background: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" };
      case "mishwar":
        return { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)" };
      case "silver":
        return { background: "rgba(226, 232, 240, 0.2)", color: "#e2e8f0", border: "1px solid rgba(226, 232, 240, 0.4)" };
      case "gold":
        return { background: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.4)" };
      default:
        return { background: "rgba(255, 255, 255, 0.1)", color: "#fff" };
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q)
    );
  });

  if (authChecking) {
    return (
      <div className={styles.adminLoadingContainer}>
        <div className={styles.spinner} />
        <p>جاري التحقق من الصلاحيات والمزامنة...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.adminAccessDenied}>
        <i className="bx bx-lock-alt" style={{ fontSize: "4rem", color: "var(--accent-red)" }}></i>
        <h2>عفواً، الدخول غير مصرح به</h2>
        <p>هذه الصفحة مخصصة لمديري النظام فقط.</p>
        <button onClick={() => router.push("/")} className={styles.backBtn}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer} style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      
      {/* Title Header */}
      <div className={styles.dashboardHeader} style={{ marginBottom: "28px" }}>
        <div>
          <h1 className={styles.dashboardTitle}>👑 إدارة الباقات والاشتراكات</h1>
          <p className={styles.dashboardSubtitle}>قم بتعديل أسعار ومميزات الباقات، أو ترقية وإدارة فترات اشتراك المستخدمين وتجديدها.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabButtonsContainer} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => {
            setActiveTab("users");
            setStatusMessage(null);
          }}
          className={`${styles.tabBtn} ${activeTab === "users" ? styles.tabBtnActive : ""}`}
          style={{ padding: "10px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: 700 }}
        >
          👤 اشتراكات الأعضاء ({users.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("plans");
            setStatusMessage(null);
          }}
          className={`${styles.tabBtn} ${activeTab === "plans" ? styles.tabBtnActive : ""}`}
          style={{ padding: "10px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: 700 }}
        >
          💎 تحرير أسعار ومميزات الباقات
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`${styles.alert} ${statusMessage.type === "success" ? styles.alertSuccess : styles.alertError}`}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            background: statusMessage.type === "success" ? "rgba(52, 199, 89, 0.15)" : "rgba(255, 59, 48, 0.15)",
            color: statusMessage.type === "success" ? "#34c759" : "#ff3b30",
            border: statusMessage.type === "success" ? "1px solid rgba(52, 199, 89, 0.3)" : "1px solid rgba(255, 59, 48, 0.3)",
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* ── Tab 1: Users Subscriptions Management ── */}
      {activeTab === "users" && (
        <div className="glass-panel" style={{ padding: "24px", borderRadius: "20px", background: "var(--bg-glass-card)", border: "1px solid var(--border-glass)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>قائمة اشتراكات المستخدمين</h3>
            
            {/* Search query */}
            <div style={{ position: "relative", minWidth: "300px" }}>
              <input
                type="text"
                placeholder="ابحث بالاسم، اسم المستخدم، البريد أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              <i className="bx bx-search" style={{ position: "absolute", left: "14px", top: "12px", color: "#94a3b8", fontSize: "1.2rem" }} />
            </div>
          </div>

          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className={styles.spinner} style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8" }}>جاري تحميل قائمة المشتركين...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              لا يوجد مستخدمون يطابقون خيارات البحث الحالية.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.customTable} style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <th style={{ padding: "12px 8px", color: "#94a3b8", fontWeight: "700" }}>المستخدم</th>
                    <th style={{ padding: "12px 8px", color: "#94a3b8", fontWeight: "700" }}>الباقة الحالية</th>
                    <th style={{ padding: "12px 8px", color: "#94a3b8", fontWeight: "700" }}>فترة الاشتراك</th>
                    <th style={{ padding: "12px 8px", color: "#94a3b8", fontWeight: "700" }}>تاريخ الانتهاء (التجديد)</th>
                    <th style={{ padding: "12px 8px", color: "#94a3b8", fontWeight: "700" }}>حالة الاشتراك</th>
                    <th style={{ padding: "12px 8px", color: "#94a3b8", fontWeight: "700", textAlign: "center" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isExpired = u.subscription_end && new Date(u.subscription_end) < new Date();
                    const statusText = isExpired ? "منتهي 🔴" : u.subscription_status === "active" ? "نشط 🟢" : u.subscription_status === "cancelled" ? "ملغي 🟡" : "مجاني";
                    
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "16px 8px" }}>
                          <div style={{ fontWeight: 700, color: "#fff" }}>{u.full_name || "مستخدم بدون اسم"}</div>
                          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>@{u.username || "بدون_يوزر"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>{u.email || u.phone || ""}</div>
                        </td>
                        <td style={{ padding: "16px 8px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.78rem",
                            fontWeight: "bold",
                            ...getTierStyle(u.subscription_tier)
                          }}>
                            {getTierLabel(u.subscription_tier)}
                          </span>
                        </td>
                        <td style={{ padding: "16px 8px", color: "#e2e8f0", fontSize: "0.88rem" }}>
                          {u.subscription_period === "monthly" ? "شهري" : u.subscription_period === "yearly" ? "سنوي" : "—"}
                        </td>
                        <td style={{ padding: "16px 8px", color: isExpired ? "#ef4444" : "#e2e8f0", fontSize: "0.88rem", fontWeight: isExpired ? "bold" : "normal" }}>
                          {u.subscription_end ? new Date(u.subscription_end).toLocaleDateString("ar-EG") : "—"}
                        </td>
                        <td style={{ padding: "16px 8px" }}>
                          <span style={{
                            color: isExpired ? "#ef4444" : u.subscription_status === "active" ? "#34c759" : "#eab308",
                            fontWeight: "bold",
                            fontSize: "0.85rem"
                          }}>
                            {statusText}
                          </span>
                        </td>
                        <td style={{ padding: "16px 8px", textAlign: "center" }}>
                          <button
                            onClick={() => handleEditUserSubscription(u)}
                            className={styles.actionBtn}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              background: "rgba(99, 102, 241, 0.15)",
                              color: "#a5b4fc",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "0.8rem",
                            }}
                          >
                            ⚙️ تعديل الاشتراك
                          </button>
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

      {/* ── Tab 2: Subscription Plans Manager ── */}
      {activeTab === "plans" && (
        <div className="glass-panel" style={{ padding: "24px", borderRadius: "20px", background: "var(--bg-glass-card)", border: "1px solid var(--border-glass)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", marginBottom: "20px" }}>باقات الاشتراك النشطة على النظام</h3>

          {loadingPlans ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className={styles.spinner} style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8" }}>جاري تحميل الباقات...</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {plans.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "24px",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#fff", margin: 0 }}>{p.name}</h4>
                      <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px", color: "#94a3b8" }}>
                        معرف: {p.id}
                      </span>
                    </div>

                    <div style={{ margin: "16px 0", fontSize: "0.95rem" }}>
                      <div style={{ marginBottom: "6px" }}>
                        💵 السعر الشهري: <strong style={{ color: "#22c55e", fontSize: "1.1rem" }}>{p.price_monthly} ج.م</strong>
                      </div>
                      <div>
                        📅 السعر السنوي: <strong style={{ color: "#10b981", fontSize: "1.1rem" }}>{p.price_yearly} ج.م</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px", marginTop: "14px" }}>
                      <div style={{ fontWeight: "700", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "8px" }}>الميزات والمميزات:</div>
                      <ul style={{ paddingRight: "18px", margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.6" }}>
                        {p.features && p.features.map((feat, i) => (
                          <li key={i} style={{ marginBottom: "4px" }}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditPlan(p)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginTop: "20px",
                      fontSize: "0.88rem",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    ✏️ تعديل الباقة
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: Edit Subscription Plan ── */}
      {selectedPlan && (
        <div
          className={styles.modalOverlay}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
            direction: "rtl",
          }}
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "28px",
              borderRadius: "24px",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#fff", margin: 0 }}>⚙️ تعديل باقة: {selectedPlan.name}</h3>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>اسم الباقة</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>السعر الشهري (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    disabled={selectedPlan.id === "free"}
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: selectedPlan.id === "free" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: selectedPlan.id === "free" ? "#64748b" : "#fff",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>السعر السنوي (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    disabled={selectedPlan.id === "free"}
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: selectedPlan.id === "free" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: selectedPlan.id === "free" ? "#64748b" : "#fff",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>المميزات (ميزة واحدة في كل سطر)</label>
                <textarea
                  rows={5}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                  }}
                  placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                  }}
                >
                  {updating ? "جاري التحديث..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
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
        <div
          className={styles.modalOverlay}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
            direction: "rtl",
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "28px",
              borderRadius: "24px",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#fff", margin: 0 }}>⚙️ تعديل اشتراك: {selectedUser.full_name || selectedUser.username}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUserSubscription} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <div>اسم المستخدم: <strong>@{selectedUser.username}</strong></div>
                <div>الهاتف: <strong>{selectedUser.phone || "غير متوفر"}</strong></div>
                <div>البريد: <strong>{selectedUser.email || "غير متوفر"}</strong></div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>باقة الاشتراك</label>
                <select
                  value={userForm.subscription_tier}
                  onChange={(e) => {
                    const tier = e.target.value;
                    setUserForm({
                      ...userForm,
                      subscription_tier: tier,
                      // clear period if free, set to daily if mishwar
                      subscription_period: tier === "free" ? "" : (tier === "mishwar" ? "daily" : (userForm.subscription_period === "daily" ? "monthly" : userForm.subscription_period || "monthly")),
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="free">المجانية</option>
                  <option value="mishwar">باقة المشوار (9 ج.م)</option>
                  <option value="silver">الباقة الفضية (40 ج.م)</option>
                  <option value="gold">الباقة الذهبية (60 ج.م)</option>
                </select>
              </div>

              {userForm.subscription_tier !== "free" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>فترة الاشتراك</label>
                  <select
                    value={userForm.subscription_period || ""}
                    onChange={(e) => setUserForm({ ...userForm, subscription_period: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      outline: "none",
                    }}
                  >
                    <option value="daily">يومياً (24 ساعة)</option>
                    <option value="monthly">شهرياً</option>
                    <option value="yearly">سنوياً</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>حالة الاشتراك</label>
                <select
                  value={userForm.subscription_status}
                  onChange={(e) => setUserForm({ ...userForm, subscription_status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="active">نشط (فعال)</option>
                  <option value="expired">منتهي الصلاحية</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>تاريخ البدء</label>
                  <input
                    type="date"
                    value={userForm.subscription_start}
                    onChange={(e) => setUserForm({ ...userForm, subscription_start: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required={userForm.subscription_tier !== "free"}
                    value={userForm.subscription_end}
                    onChange={(e) => setUserForm({ ...userForm, subscription_end: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                  }}
                >
                  {updating ? "جاري التحديث..." : "ترقية وحفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
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

