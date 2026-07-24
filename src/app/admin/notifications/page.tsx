"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>إرسال إشعارات للجميع</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        ستصل هذه الرسالة فوراً لجميع المستخدمين المسجلين في الموقع.
      </p>

      {status && (
        <div style={{ 
          padding: "16px", 
          marginBottom: "24px", 
          borderRadius: "12px", 
          background: status.includes("خطأ") ? "rgba(255, 59, 48, 0.1)" : "rgba(52, 199, 89, 0.1)",
          color: status.includes("خطأ") ? "#ff3b30" : "#34c759",
          border: `1px solid ${status.includes("خطأ") ? "rgba(255, 59, 48, 0.3)" : "rgba(52, 199, 89, 0.3)"}`
        }}>
          {status}
        </div>
      )}

      <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>عنوان الإشعار</label>
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
          <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>محتوى الإشعار</label>
          <textarea 
            className="ios-input" 
            required 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            placeholder="أدخل رسالتك هنا..." 
            style={{ minHeight: "120px", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>نوع الإشعار</label>
            <select className="ios-input" value={type} onChange={e => setType(e.target.value)}>
              <option value="info">عادي (🔔)</option>
              <option value="success">نجاح (✅)</option>
              <option value="warning">تنبيه (⚠️)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>الرابط (اختياري)</label>
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
          className="ios-btn ios-btn-primary" 
          style={{ marginTop: "16px", padding: "16px", fontSize: "1.1rem" }}
        >
          {loading ? "جاري الإرسال..." : "إرسال الإشعار للجميع 🚀"}
        </button>
      </form>
    </div>
  );
}
