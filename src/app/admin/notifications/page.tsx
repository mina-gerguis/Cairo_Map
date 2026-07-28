"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

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
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return;
    setLoading(true);
    setStatus("");

    try {
      const { error } = await supabase.from("notifications").insert([{
        user_id: null,
        title,
        message,
        type,
        link: link || null,
      }]);

      if (error) throw error;
      
      setStatus("تم إرسال الإشعار لجميع المستخدمين بنجاح!");
      setTitle("");
      setMessage("");
      setLink("");
    } catch (err: any) {
      setStatus(`خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || authChecking) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid var(--border-glass)", borderTop: "3px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
        <p style={{ color: "var(--text-secondary)" }}>جاري التحقق من الصلاحيات...</p>
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
          عفواً، حسابك لا يمتلك صلاحيات المسؤول للوصول إلى هذه الصفحة. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.
        </p>
        <Link href="/" className="ios-btn ios-btn-primary" style={{ padding: "14px 24px" }}><i className="bx bx-home" style={{ fontSize: "1.2rem" }}></i><i className="bx bx-home" style={{ fontSize: "1.2rem" }}></i> العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", padding: "0" }}>
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderBar}>
          <div className={styles.tableTitleGroup}>
            <div className={styles.tableIcon}>
              <i className="bx bx-bell" />
            </div>
            <div>
              <h1 className={styles.tableTitle} style={{ fontSize: "1.3rem" }}>إرسال إشعارات جماعية</h1>
              <p className={styles.tableSubtitle}>ستصل هذه الرسالة فوراً لجميع المستخدمين المسجلين في الموقع.</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px" }}>
          {status && (
            <div style={{
              padding: "14px 18px",
              marginBottom: "24px",
              borderRadius: "12px",
              background: status.includes("خطأ") ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              color: status.includes("خطأ") ? "#f87171" : "#4ade80",
              border: `1px solid ${status.includes("خطأ") ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "700"
            }}>
              <i className={`bx ${status.includes("خطأ") ? "bx-error-circle" : "bx-check-circle"}`} style={{ fontSize: "1.3rem" }} />
              {status}
            </div>
          )}

          <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>عنوان الإشعار</label>
              <input
                type="text"
                className="ios-input"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: تحديث جديد!"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>محتوى الإشعار</label>
              <textarea
                className="ios-input"
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="أدخل رسالتك هنا..."
                style={{ minHeight: "130px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>نوع الإشعار</label>
                <select className="ios-input" value={type} onChange={e => setType(e.target.value)}>
                  <option value="info">🔔 عادي</option>
                  <option value="success">✅ نجاح</option>
                  <option value="warning">⚠️ تنبيه</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>الرابط (اختياري)</label>
                <input
                  type="text"
                  className="ios-input"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="/profile"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                padding: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                fontFamily: "var(--font-cairo)",
                borderRadius: "25px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s ease",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
              }}
            >
              <i className="bx bx-send" style={{ fontSize: "1.3rem" }} />
              {loading ? "جاري الإرسال..." : "إرسال الإشعار للجميع"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
