"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  governorate: string | null;
  city: string | null;
  points: number;
  balance: number;
  promo_balance: number;
  created_at: string;
  is_admin: boolean;
}

export default function AdminPointsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<"deposit" | "withdraw">("deposit");
  const [assetType, setAssetType] = useState<"points" | "balance" | "promo_balance">("points");
  const [transactionAmount, setTransactionAmount] = useState<string>("");

  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deposit/Withdraw requests states
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>("pending"); // default to pending requests
  const [requestFilterType, setRequestFilterType] = useState<string>("all");
  
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null); // For rejection notes modal
  const [rejectNotes, setRejectNotes] = useState("");
  const [savedReasons, setSavedReasons] = useState<string[]>([]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rejected_balance_reasons");
      if (saved) {
        try {
          setSavedReasons(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved rejection reasons:", e);
        }
      }
    }
  }, []);

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
          fetchRequests();
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
        .select("id, full_name, username, email, phone, governorate, city, points, balance, promo_balance, created_at, is_admin")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setUsersList(data as UserProfile[]);
      }
    } catch (err: any) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRequests = async () => {
    if (!supabase) return;
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from("balance_transactions")
        .select(`
          id,
          user_id,
          type,
          amount,
          method,
          provider_number,
          recipient_name,
          transaction_id,
          image_url,
          status,
          admin_notes,
          created_at,
          updated_at,
          profiles:user_id (
            full_name,
            username,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequestsList(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (request: any) => {
    if (!supabase) return;
    if (!window.confirm("هل أنت متأكد من الموافقة على هذا الطلب؟ سيتم شحن/سحب الرصيد وتحديث محفظة المستخدم تلقائياً.")) return;
    
    try {
      const { error } = await supabase
        .from("balance_transactions")
        .update({
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;

      // Send notification to the user
      try {
        const notifTitle = request.type === "deposit" ? "💰 تم قبول طلب الإيداع" : "💸 تم قبول طلب السحب";
        const notifMessage = request.type === "deposit"
          ? `تمت الموافقة على طلب شحن الرصيد الخاص بك بقيمة ${request.amount} ج.م وإضافتها إلى حسابك.`
          : `تمت الموافقة على طلب سحب الرصيد الخاص بك بقيمة ${request.amount} ج.م وتحويلها إلى حسابك.`;

        await supabase.from("notifications").insert([{
          user_id: request.user_id,
          title: notifTitle,
          message: notifMessage,
          type: "success",
          link: "/profile"
        }]);
      } catch (errNotif) {
        console.error("Failed to send approval notification:", errNotif);
      }

      // Update state locally
      setRequestsList((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: "approved" } : r))
      );
      
      // Also refresh the users list
      fetchUsers();
    } catch (err: any) {
      alert("فشل في قبول الطلب: " + err.message);
    }
  };

  const handleRejectRequest = async () => {
    if (!supabase || !selectedRequest) return;
    if (!rejectNotes.trim()) {
      alert("يرجى إدخال سبب الرفض أولاً.");
      return;
    }

    try {
      const { error } = await supabase
        .from("balance_transactions")
        .update({
          status: "rejected",
          admin_notes: rejectNotes,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Save reason to history (localStorage)
      const trimmedReason = rejectNotes.trim();
      if (trimmedReason) {
        setSavedReasons((prev) => {
          const updated = [trimmedReason, ...prev.filter((r) => r !== trimmedReason)].slice(0, 15);
          localStorage.setItem("rejected_balance_reasons", JSON.stringify(updated));
          return updated;
        });
      }

      // Send notification to the user
      try {
        const notifTitle = selectedRequest.type === "deposit" ? "❌ تم رفض طلب الإيداع" : "❌ تم رفض طلب السحب";
        const notifMessage = selectedRequest.type === "deposit"
          ? `تم رفض طلب شحن الرصيد الخاص بك بقيمة ${selectedRequest.amount} ج.م. سبب الرفض: ${rejectNotes}`
          : `تم رفض طلب سحب الرصيد الخاص بك بقيمة ${selectedRequest.amount} ج.م وتمت إعادة المبلغ لمحفظتك. سبب الرفض: ${rejectNotes}`;

        await supabase.from("notifications").insert([{
          user_id: selectedRequest.user_id,
          title: notifTitle,
          message: notifMessage,
          type: "warning",
          link: "/profile"
        }]);
      } catch (errNotif) {
        console.error("Failed to send rejection notification:", errNotif);
      }

      // Update state locally
      setRequestsList((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "rejected", admin_notes: rejectNotes } : r))
      );
      
      setSelectedRequest(null);
      setRejectNotes("");
      
      // Also refresh the users list
      fetchUsers();
    } catch (err: any) {
      alert("فشل في رفض الطلب: " + err.message);
    }
  };

  const handleOpenEditModal = (targetUser: UserProfile) => {
    setSelectedUser(targetUser);
    setActionType("deposit");
    setAssetType("points");
    setTransactionAmount("");
    setStatusMessage(null);
  };

  const handleSave = async () => {
    if (!supabase || !selectedUser) return;
    setUpdating(true);
    setStatusMessage(null);

    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatusMessage({ type: "error", text: "يرجى إدخال مبلغ أو عدد نقاط صحيح أكبر من الصفر." });
      setUpdating(false);
      return;
    }

    let finalPoints = selectedUser.points || 0;
    let finalBalance = selectedUser.balance || 0;
    let finalPromoBalance = selectedUser.promo_balance || 0;

    if (assetType === "points") {
      const amountInt = Math.floor(amount);
      if (amountInt !== amount) {
        setStatusMessage({ type: "error", text: "النقاط يجب أن تكون عدداً صحيحاً." });
        setUpdating(false);
        return;
      }

      if (actionType === "deposit") {
        finalPoints += amountInt;
      } else {
        if (finalPoints < amountInt) {
          setStatusMessage({ type: "error", text: `رصيد نقاط المستخدم غير كافٍ للخصم (الرصيد الحالي: ${finalPoints} نقطة).` });
          setUpdating(false);
          return;
        }
        finalPoints -= amountInt;
      }
    } else if (assetType === "balance") {
      const amountFixed = parseFloat(amount.toFixed(2));
      if (actionType === "deposit") {
        finalBalance += amountFixed;
      } else {
        if (finalBalance < amountFixed) {
          setStatusMessage({ type: "error", text: `الرصيد الأساسي للمستخدم غير كافٍ للخصم (الرصيد الحالي: ${finalBalance} ج.م).` });
          setUpdating(false);
          return;
        }
        finalBalance -= amountFixed;
      }
    } else if (assetType === "promo_balance") {
      const amountFixed = parseFloat(amount.toFixed(2));
      if (actionType === "deposit") {
        finalPromoBalance += amountFixed;
      } else {
        if (finalPromoBalance < amountFixed) {
          setStatusMessage({ type: "error", text: `الرصيد الإضافي للمستخدم غير كافٍ للخصم (الرصيد الحالي: ${finalPromoBalance} ج.م).` });
          setUpdating(false);
          return;
        }
        finalPromoBalance -= amountFixed;
      }
    }

    try {
      const { data, error } = await supabase.rpc("admin_update_user_assets", {
        p_user_id: selectedUser.id,
        p_points: finalPoints,
        p_balance: parseFloat(finalBalance.toFixed(2)),
        p_promo_balance: parseFloat(finalPromoBalance.toFixed(2)),
      });

      if (error) throw error;
      if (data && !data.success) {
        throw new Error(data.message || "حدث خطأ أثناء تحديث البيانات");
      }

      // Update state locally
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, points: finalPoints, balance: finalBalance, promo_balance: finalPromoBalance }
            : u
        )
      );

      setStatusMessage({ type: "success", text: "تم تنفيذ العملية وتحديث البيانات بنجاح!" });
      setTransactionAmount("");

      setSelectedUser({
        ...selectedUser,
        points: finalPoints,
        balance: finalBalance,
        promo_balance: finalPromoBalance
      });

      setTimeout(() => {
        setSelectedUser(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "فشل تنفيذ العملية: " + (err.message || "خطأ غير معروف") });
    } finally {
      setUpdating(false);
    }
  };
  // Filter users by search query
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username || "").toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  // Filter deposit/withdraw requests
  const filteredRequests = requestsList.filter((r) => {
    // Search query
    const q = requestSearchQuery.toLowerCase().trim();
    const userMatch = !q || (
      (r.profiles?.username || "").toLowerCase().includes(q) ||
      (r.profiles?.full_name || "").toLowerCase().includes(q) ||
      (r.profiles?.email || "").toLowerCase().includes(q)
    );

    // Status filter
    const statusMatch = requestFilterStatus === "all" || r.status === requestFilterStatus;

    // Type filter
    const typeMatch = requestFilterType === "all" || r.type === requestFilterType;

    return userMatch && statusMatch && typeMatch;
  });

  if (authLoading || authChecking) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--border-glass)",
            borderTop: "3px solid var(--accent-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}
        ></div>
        <p style={{ color: "var(--text-secondary)" }}>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px", maxWidth: "400px", margin: "100px auto" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(255, 59, 48, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <i className="bx bxs-error-circle" style={{ fontSize: "3rem", color: "#ff3b30" }}></i>
        </div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-primary)" }}>صلاحيات غير كافية</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: "1.6" }}>
          عفواً، حسابك لا يمتلك صلاحيات المسؤول للوصول إلى هذه الصفحة. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.
        </p>
      </div>
    );
  }

  return (
    <div style={{ direction: "rtl", animation: "fade-in 0.3s ease" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            إدارة النقاط والأرصدة والعمليات المالية
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            شحن وتعديل النقاط وأرصدة المستخدمين، ومراجعة طلبات السحب والإيداع المعلقة
          </p>
        </div>
      </div>

      {/* Tab Control */}
      <div
        className="glass-panel"
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          padding: "8px 12px",
          borderRadius: "14px",
          border: "1px solid var(--border-glass)"
        }}
      >
        <button
          onClick={() => setActiveTab("users")}
          className="ios-btn"
          style={{
            background: activeTab === "users" ? "var(--accent-primary)" : "transparent",
            color: activeTab === "users" ? "#fff" : "var(--text-secondary)",
            border: activeTab === "users" ? "1px solid var(--accent-primary)" : "1px solid transparent",
            fontWeight: "bold",
            padding: "8px 16px",
            fontSize: "0.88rem",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <i className="bx bx-group" style={{ fontSize: "1.1rem" }}></i>
          إدارة حسابات المستخدمين
        </button>
        <button
          onClick={() => {
            setActiveTab("requests");
            fetchRequests();
          }}
          className="ios-btn"
          style={{
            background: activeTab === "requests" ? "var(--accent-primary)" : "transparent",
            color: activeTab === "requests" ? "#fff" : "var(--text-secondary)",
            border: activeTab === "requests" ? "1px solid var(--accent-primary)" : "1px solid transparent",
            fontWeight: "bold",
            padding: "8px 16px",
            fontSize: "0.88rem",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <i className="bx bx-receipt" style={{ fontSize: "1.1rem" }}></i>
          طلبات الإيداع والسحب
          {requestsList.filter((r) => r.status === "pending").length > 0 && (
            <span
              style={{
                background: "#ff3b30",
                color: "#fff",
                borderRadius: "10px",
                padding: "2px 8px",
                fontSize: "0.75rem",
                fontWeight: "bold"
              }}
            >
              {requestsList.filter((r) => r.status === "pending").length} معلق
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: USERS LIST MANAGEMENT */}
      {activeTab === "users" && (
        <>
          {/* Control Bar (Search) */}
          <div
            className="glass-panel"
            style={{
              padding: "16px 20px",
              borderRadius: "16px",
              marginBottom: "24px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <i
                className="bx bx-search"
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontSize: "1.2rem",
                }}
              ></i>
              <input
                type="text"
                className="ios-input"
                placeholder="ابحث باسم المستخدم، الاسم بالكامل، أو البريد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: "42px", width: "100%" }}
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="ios-btn"
                style={{ padding: "10px 16px", fontSize: "0.85rem" }}
              >
                إعادة تعيين
              </button>
            )}
            <button
              onClick={fetchUsers}
              className="ios-btn"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
              disabled={loadingUsers}
            >
              <i className={`bx bx-refresh ${loadingUsers ? "bx-spin" : ""}`} style={{ fontSize: "1.1rem" }}></i>
              تحديث البيانات
            </button>
          </div>

          {/* Users Table Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeaderBar}>
              <div className={styles.tableTitleGroup}>
                <div className={styles.tableIcon}>
                  <i className="bx bx-coin-stack"></i>
                </div>
                <div>
                  <h3 className={styles.tableTitle}>قائمة المستخدمين</h3>
                  <p className={styles.tableSubtitle}>مجموع حسابات المستخدمين: {filteredUsers.length} مستخدم</p>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "2.5px solid var(--border-glass)",
                    borderTop: "2.5px solid var(--accent-primary)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px",
                  }}
                ></div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>جاري تحميل حسابات المستخدمين...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <i className="bx bx-ghost" style={{ fontSize: "3.5rem", color: "var(--text-muted)", marginBottom: "16px" }}></i>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>لم يتم العثور على مستخدمين يطابقون البحث.</p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead className={styles.adminThead}>
                    <tr>
                      <th className={styles.adminTh}>اسم المستخدم</th>
                      <th className={styles.adminTh}>الاسم الكامل</th>
                      <th className={styles.adminTh}>البريد الإلكتروني</th>
                      <th className={styles.adminTh}>الرصيد الأساسي</th>
                      <th className={styles.adminTh}>الرصيد الإضافي</th>
                      <th className={styles.adminTh}>النقاط</th>
                      <th className={styles.adminTh} style={{ textAlign: "center" }}>
                        خيارات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className={styles.adminTr}
                        onClick={() => handleOpenEditModal(u)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className={styles.adminTd} style={{ fontWeight: "700", color: "var(--accent-primary)" }}>
                          @{u.username || "بدون_يوزر"}
                          {u.is_admin && (
                            <span
                              className={`${styles.badge} ${styles.badgePrimary}`}
                              style={{ marginRight: "8px", fontSize: "0.7rem", padding: "2px 6px" }}
                            >
                              مسؤول
                            </span>
                          )}
                        </td>
                        <td className={styles.adminTd}>{u.full_name || "—"}</td>
                        <td className={styles.adminTd} style={{ direction: "ltr", textAlign: "right" }}>
                          {u.email}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", color: "#10b981" }}>
                          {u.balance?.toFixed(2)} ج.م
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", color: "#3b82f6" }}>
                          {u.promo_balance?.toFixed(2)} ج.م
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", color: "#fbbf24" }}>
                          <i className="bx bxs-coin" style={{ color: "#fbbf24", marginLeft: "4px" }}></i>
                          {u.points || 0}
                        </td>
                        <td className={styles.adminTd} style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                          >
                            <i className="bx bx-edit-alt"></i> تعديل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: PENDING DEPOSIT/WITHDRAW REQUESTS */}
      {activeTab === "requests" && (
        <>
          {/* Requests Filter Bar */}
          <div
            className="glass-panel"
            style={{
              padding: "16px 20px",
              borderRadius: "16px",
              marginBottom: "24px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
              <i
                className="bx bx-search"
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontSize: "1.1rem",
                }}
              ></i>
              <input
                type="text"
                className="ios-input"
                placeholder="ابحث باسم المستخدم، الاسم، أو الإيميل..."
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                style={{ paddingRight: "38px", width: "100%", fontSize: "0.85rem" }}
              />
            </div>

            {/* Type Filter */}
            <div style={{ minWidth: "130px" }}>
              <select
                className="ios-input"
                value={requestFilterType}
                onChange={(e) => setRequestFilterType(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              >
                <option value="all">كل العمليات</option>
                <option value="deposit">إيداع فقط</option>
                <option value="withdrawal">سحب فقط</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: "130px" }}>
              <select
                className="ios-input"
                value={requestFilterStatus}
                onChange={(e) => setRequestFilterStatus(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              >
                <option value="pending">المعلقة فقط</option>
                <option value="approved">المقبولة</option>
                <option value="rejected">المرفوضة</option>
                <option value="all">الكل</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchRequests}
              className="ios-btn"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
              disabled={loadingRequests}
            >
              <i className={`bx bx-refresh ${loadingRequests ? "bx-spin" : ""}`} style={{ fontSize: "1.1rem" }}></i>
              تحديث
            </button>
          </div>

          {/* Requests Table Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeaderBar}>
              <div className={styles.tableTitleGroup}>
                <div className={styles.tableIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  <i className="bx bx-receipt"></i>
                </div>
                <div>
                  <h3 className={styles.tableTitle}>طلبات الإيداع والسحب للمراجعة</h3>
                  <p className={styles.tableSubtitle}>إجمالي الطلبات المطابقة للفلاتر: {filteredRequests.length} طلب</p>
                </div>
              </div>
            </div>

            {loadingRequests ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "2.5px solid var(--border-glass)",
                    borderTop: "2.5px solid var(--accent-primary)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px",
                  }}
                ></div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>جاري تحميل طلبات المعاملات...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <i className="bx bx-receipt" style={{ fontSize: "3.5rem", color: "var(--text-muted)", marginBottom: "16px" }}></i>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>لا توجد طلبات معاملات تطابق الفلاتر المحددة.</p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead className={styles.adminThead}>
                    <tr>
                      <th className={styles.adminTh}>المستخدم</th>
                      <th className={styles.adminTh}>النوع</th>
                      <th className={styles.adminTh}>المبلغ</th>
                      <th className={styles.adminTh}>بيانات التحويل</th>
                      <th className={styles.adminTh}>الإيصال</th>
                      <th className={styles.adminTh}>التاريخ</th>
                      <th className={styles.adminTh}>الحالة</th>
                      <th className={styles.adminTh} style={{ textAlign: "center" }}>
                        خيارات الإدارة
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className={styles.adminTr}>
                        <td className={styles.adminTd}>
                          <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                            {req.profiles?.full_name || "اسم غير متوفر"}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", display: "block" }}>
                            @{req.profiles?.username || "بدون_يوزر"}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                            {req.profiles?.phone || "لا يوجد رقم"}
                          </span>
                        </td>
                        <td className={styles.adminTd}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              background: req.type === "deposit" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                              color: req.type === "deposit" ? "#10b981" : "#f87171"
                            }}
                          >
                            {req.type === "deposit" ? "إيداع" : "سحب"}
                          </span>
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "900", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                          {req.amount?.toFixed(2)} ج.م
                        </td>
                        <td className={styles.adminTd} style={{ fontSize: "0.78rem", lineHeight: "1.5" }}>
                          <div>الوسيلة: <strong>{
                            req.method === "instapay" ? "انستا باي" :
                            req.method === "vodafone_cash" ? "محفظة كاش" : "تحويل بنكي"
                          }</strong></div>
                          <div>رقم/حساب: <span style={{ direction: "ltr", display: "inline-block" }}><strong>{req.provider_number}</strong></span></div>
                          {req.recipient_name && <div>الاسم: <strong>{req.recipient_name}</strong></div>}
                          {req.transaction_id && <div>العملية: <span style={{ color: "#fbbf24" }}><strong>{req.transaction_id}</strong></span></div>}
                        </td>
                        <td className={styles.adminTd}>
                          {req.image_url ? (
                            <a
                              href={req.image_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "var(--accent-primary)",
                                textDecoration: "underline",
                                fontWeight: "bold",
                                fontSize: "0.78rem"
                              }}
                            >
                              <i className="bx bx-show-alt" style={{ fontSize: "1rem" }}></i>
                              عرض الإيصال
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>لا يوجد</span>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {new Date(req.created_at).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className={styles.adminTd}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              background:
                                req.status === "approved" ? "rgba(16, 185, 129, 0.1)" :
                                req.status === "rejected" ? "rgba(239, 68, 68, 0.1)" :
                                "rgba(251, 191, 36, 0.1)",
                              color:
                                req.status === "approved" ? "#10b981" :
                                req.status === "rejected" ? "#f87171" :
                                "#fbbf24"
                            }}
                          >
                            {req.status === "pending" && "قيد الانتظار"}
                            {req.status === "approved" && "مقبول"}
                            {req.status === "rejected" && "مرفوض"}
                          </span>
                        </td>
                        <td className={styles.adminTd} style={{ textAlign: "center" }}>
                          {req.status === "pending" ? (
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="ios-btn"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "0.75rem",
                                  background: "#10b981",
                                  color: "#fff",
                                  borderColor: "#10b981",
                                  fontWeight: "bold"
                                }}
                              >
                                <i className="bx bx-check"></i> موافقة
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setRejectNotes("");
                                }}
                                className="ios-btn"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "0.75rem",
                                  background: "#ff3b30",
                                  color: "#fff",
                                  borderColor: "#ff3b30",
                                  fontWeight: "bold"
                                }}
                              >
                                <i className="bx bx-x"></i> رفض
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {req.status === "approved" && "تمت الموافقة"}
                              {req.status === "rejected" && (
                                <div style={{ maxWidth: "160px", wordBreak: "break-word" }}>
                                  <strong>السبب:</strong> {req.admin_notes || "لا يوجد سبب"}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Points & Balance Modal */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fade-in 0.2s ease",
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "520px",
              width: "100%",
              padding: "24px 28px",
              borderRadius: "24px",
              background: "var(--bg-glass-card, #ffffff)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              border: "1px solid var(--accent-primary)",
              animation: "slide-up 0.3s ease",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تحديث النقاط والأرصدة
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  color: "var(--text-muted)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Profile Info Summary */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "12px 16px",
                borderRadius: "16px",
                marginBottom: "20px",
                border: "1px solid var(--border-glass)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--border-glass-bright)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--accent-primary)",
                  fontSize: "1.4rem",
                  color: "var(--accent-primary)",
                }}
              >
                <i className="bx bx-user"></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {selectedUser.full_name || "بدون اسم"}
                </h4>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", direction: "ltr", textAlign: "right" }}>
                  @{selectedUser.username || "بدون_يوزر"}
                </div>
              </div>
            </div>

            {/* Current Values Indicators (3 columns) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.15)", borderRadius: "14px", padding: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#fbbf24", display: "block", marginBottom: "4px", fontWeight: "bold" }}>🪙 النقاط</span>
                <strong style={{ fontSize: "1.1rem", color: "#fbbf24", fontWeight: "800" }}>{selectedUser.points || 0}</strong>
              </div>
              <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "14px", padding: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#10b981", display: "block", marginBottom: "4px", fontWeight: "bold" }}>💵 الأساسي</span>
                <strong style={{ fontSize: "1.1rem", color: "#10b981", fontWeight: "800" }}>{(selectedUser.balance || 0).toFixed(2)}</strong>
              </div>
              <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.15)", borderRadius: "14px", padding: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#3b82f6", display: "block", marginBottom: "4px", fontWeight: "bold" }}>🎁 الترويجي</span>
                <strong style={{ fontSize: "1.1rem", color: "#3b82f6", fontWeight: "800" }}>{(selectedUser.promo_balance || 0).toFixed(2)}</strong>
              </div>
            </div>

            {/* Transaction Editor Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Row 1: Action Type */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold", marginBottom: "8px" }}>
                  نوع العملية:
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setActionType("deposit")}
                    className="ios-btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: actionType === "deposit" ? "#10b981" : "transparent",
                      borderColor: actionType === "deposit" ? "#10b981" : "var(--border-glass)",
                      color: actionType === "deposit" ? "#fff" : "var(--text-secondary)",
                      fontWeight: "bold",
                      padding: "10px"
                    }}
                  >
                    📥 إيداع / إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("withdraw")}
                    className="ios-btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: actionType === "withdraw" ? "#ef4444" : "transparent",
                      borderColor: actionType === "withdraw" ? "#ef4444" : "var(--border-glass)",
                      color: actionType === "withdraw" ? "#fff" : "var(--text-secondary)",
                      fontWeight: "bold",
                      padding: "10px"
                    }}
                  >
                    📤 سحب / خصم
                  </button>
                </div>
              </div>

              {/* Row 2: Target Asset */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold", marginBottom: "8px" }}>
                  الرصيد المستهدف:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setAssetType("points")}
                    className="ios-btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: assetType === "points" ? "rgba(251, 191, 36, 0.15)" : "transparent",
                      borderColor: assetType === "points" ? "#fbbf24" : "var(--border-glass)",
                      color: assetType === "points" ? "#fbbf24" : "var(--text-secondary)",
                      fontWeight: "bold",
                      padding: "10px",
                      fontSize: "0.82rem"
                    }}
                  >
                    🪙 النقاط
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetType("balance")}
                    className="ios-btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: assetType === "balance" ? "rgba(16, 185, 129, 0.15)" : "transparent",
                      borderColor: assetType === "balance" ? "#10b981" : "var(--border-glass)",
                      color: assetType === "balance" ? "#10b981" : "var(--text-secondary)",
                      fontWeight: "bold",
                      padding: "10px",
                      fontSize: "0.82rem"
                    }}
                  >
                    💵 أساسي
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetType("promo_balance")}
                    className="ios-btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: assetType === "promo_balance" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      borderColor: assetType === "promo_balance" ? "#3b82f6" : "var(--border-glass)",
                      color: assetType === "promo_balance" ? "#3b82f6" : "var(--text-secondary)",
                      fontWeight: "bold",
                      padding: "10px",
                      fontSize: "0.82rem"
                    }}
                  >
                    🎁 ترويجي
                  </button>
                </div>
              </div>

              {/* Row 3: Transaction Amount */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold", marginBottom: "8px" }}>
                  القيمة / الكمية المراد {actionType === "deposit" ? "إضافتها" : "خصمها"}:
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    min="0.01"
                    step={assetType === "points" ? "1" : "0.01"}
                    className="ios-input"
                    placeholder={assetType === "points" ? "مثال: 500 نقطة" : "مثال: 150.50 ج.م"}
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    style={{ width: "100%", fontSize: "1.1rem", fontWeight: "bold", textAlign: "center" }}
                  />
                  {assetType !== "points" && (
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: "bold" }}>
                      ج.م
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  background: statusMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: statusMessage.type === "success" ? "#10b981" : "#f87171",
                  border: statusMessage.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={updating}
                className="ios-btn ios-btn-primary"
                style={{ flex: 2, padding: "12px", justifyContent: "center", fontSize: "0.95rem" }}
              >
                {updating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                disabled={updating}
                className="ios-btn"
                style={{ flex: 1, padding: "12px", justifyContent: "center", fontSize: "0.95rem" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reject Request Notes Modal */}
      {selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fade-in 0.2s ease",
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "24px 28px",
              borderRadius: "20px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-glass)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              direction: "rtl",
              textAlign: "right"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <button
                onClick={() => setSelectedRequest(null)}
                className="closeBut"
              >
                <i className="bx bx-x"></i>
              </button>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-cairo)" }}>
                تحديد سبب رفض العملية
              </h3>
              <div style={{ width: "38px" }}></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", borderRadius: "12px", padding: "12px 16px", fontSize: "0.85rem" }}>
                <span>أنت بصدد رفض طلب <strong>{selectedRequest.type === "deposit" ? "الإيداع" : "السحب"}</strong> بقيمة <strong>{selectedRequest.amount?.toFixed(2)} ج.م</strong> للمستخدم <strong>@{selectedRequest.profiles?.username}</strong>.</span>
                {selectedRequest.type === "withdrawal" && <p style={{ margin: "6px 0 0 0", color: "#f87171", fontSize: "0.8rem" }}>* سيتم إعادة الرصيد المحجوز بالكامل لمحفظة المستخدم فور الحفظ.</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold", marginBottom: "8px" }}>
                  سبب الرفض (سيظهر للمستخدم في كشف الحساب):
                </label>
                <textarea
                  className="ios-input"
                  rows={4}
                  required
                  placeholder="مثال: إيصال التحويل غير واضح، أو لم نتوصل بالمبلغ على حساباتنا البنكية، يرجى إعادة المحاولة."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  style={{ width: "100%", padding: "12px", fontSize: "0.88rem", fontFamily: "var(--font-cairo)", resize: "none" }}
                />
              </div>

              {savedReasons.length > 0 && (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "bold", marginBottom: "8px" }}>
                    أسباب رفض سابقة (اضغط للاختيار السريع):
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "120px", overflowY: "auto", padding: "4px" }}>
                    {savedReasons.map((reason, index) => (
                      <div
                        key={index}
                        onClick={() => setRejectNotes(reason)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          background: "var(--bg-secondary, rgba(255,255,255,0.05))",
                          border: "1px solid var(--border-glass, rgba(255,255,255,0.1))",
                          fontSize: "0.8rem",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          maxWidth: "100%",
                          whiteSpace: "normal",
                          wordBreak: "break-word"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg-secondary, rgba(255,255,255,0.05))";
                          e.currentTarget.style.borderColor = "var(--border-glass, rgba(255,255,255,0.1))";
                        }}
                      >
                        <span style={{ flex: 1 }}>{reason}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSavedReasons((prev) => {
                              const updated = prev.filter((r) => r !== reason);
                              localStorage.setItem("rejected_balance_reasons", JSON.stringify(updated));
                              return updated;
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#ff3b30";
                            e.currentTarget.style.backgroundColor = "rgba(255, 59, 48, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-secondary)";
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <i className="bx bx-x" style={{ fontSize: "1rem" }}></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={handleRejectRequest}
                className="ios-btn"
                style={{ flex: 2, padding: "12px", justifyContent: "center", fontSize: "0.95rem", background: "#ff3b30", color: "#fff", borderColor: "#ff3b30", fontWeight: "bold" }}
              >
                تأكيد الرفض وإعادة الرصيد
              </button>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="ios-btn"
                style={{ flex: 1, padding: "12px", justifyContent: "center", fontSize: "0.95rem" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
