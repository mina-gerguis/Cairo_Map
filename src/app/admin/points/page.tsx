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
      const { error } = await supabase
        .from("profiles")
        .update({
          points: finalPoints,
          balance: parseFloat(finalBalance.toFixed(2)),
          promo_balance: parseFloat(finalPromoBalance.toFixed(2)),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            إدارة النقاط والأرصدة
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            شحن وتعديل نقاط ورصيد المستخدمين في النظام
          </p>
        </div>
      </div>

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
    </div>
  );
}
