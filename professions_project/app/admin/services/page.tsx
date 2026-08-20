"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

interface WorkerAdminItem {
  id: string;
  specialty: string;
  experience_years: number;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_available: boolean;
  is_emergency_available?: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
    avatar_url: string;
  };
}

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [workers, setWorkers] = useState<WorkerAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!profileData?.is_admin) {
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_workers")
        .select(`
          *,
          profiles:id (
            full_name,
            phone,
            email,
            governorate,
            city,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setWorkers(data as any[]);
      }
    } catch (err) {
      console.error("Error fetching workers for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Blue Verification Badge (Admin Exclusive Action)
  const handleToggleVerified = async (workerId: string, currentVerified: boolean) => {
    if (!supabase || !isAdmin) return;
    setUpdatingId(workerId);
    try {
      const newStatus = !currentVerified;
      const { error } = await supabase
        .from("service_workers")
        .update({ is_verified: newStatus })
        .eq("id", workerId);

      if (error) {
        alert("فشل تحديث شارة التوثيق: " + error.message);
      } else {
        setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, is_verified: newStatus } : w));
        
        // Notify worker about their verification status change
        await supabase.from("notifications").insert({
          user_id: workerId,
          title: newStatus ? "🎉 تم توثيق حسابك المهني!" : "ℹ️ تم تحديث حالة التوثيق",
          message: newStatus 
            ? "مبروك! قامت إدارة Cairo Map بمنح حسابك المهني شارة التوثيق الزرقاء رسمياً." 
            : "تم تغيير حالة توثيق حسابك من قِبل الإدارة.",
          type: newStatus ? "success" : "info",
          link: "/services/dashboard"
        });
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء التحديث: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredWorkers = workers.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = w.profiles?.full_name?.toLowerCase() || "";
    const spec = w.specialty?.toLowerCase() || "";
    const phone = w.profiles?.phone || "";
    return name.includes(q) || spec.includes(q) || phone.includes(q);
  });

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
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-primary)" }}>صلاحيات غير كافية</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>عفواً، هذه الصفحة مخصصة لمدراء النظام فقط.</p>
        <Link href="/" style={{ color: "var(--accent-ios)" }}>العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1100px", margin: "0 auto", direction: "rtl" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            🛠️ إدارة مقدمي الخدمات والشارة الزرقاء
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "4px 0 0" }}>
            لوحة الإدارة الحصرية لتوثيق الفنيين والتحكم بشارة التوثيق الزرقاء ومتابعة مقدمي الخدمات.
          </p>
        </div>

        <Link href="/admin" style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-glass)",
          color: "var(--text-primary)",
          padding: "8px 16px",
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "0.85rem",
          textDecoration: "none"
        }}>
          ⬅️ لوحة الإدارة الرئيسية
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="ابحث باسم مقدم الخدمة، التخصص، أو الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ios-input"
          style={{
            width: "100%",
            height: "46px",
            padding: "0 16px",
            fontSize: "0.9rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            color: "var(--text-primary)"
          }}
        />
      </div>

      {/* Workers Admin Grid / Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-ios)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "12px" }}>جاري تحميل الحرفيين...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-primary)", border: "1px solid var(--border-glass)", borderRadius: "16px" }}>
          <p style={{ color: "var(--text-secondary)" }}>لا يوجد مقدمو خدمات مطابقون للبحث.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredWorkers.map((w) => (
            <div
              key={w.id}
              style={{
                background: "var(--bg-primary)",
                border: `1px solid ${w.is_verified ? "rgba(59, 130, 246, 0.4)" : "var(--border-glass)"}`,
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {w.profiles?.avatar_url ? (
                  <img src={w.profiles.avatar_url} alt="" style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #10b981)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: "700" }}>
                    {w.profiles?.full_name?.charAt(0) || "🛠️"}
                  </div>
                )}

                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    {w.profiles?.full_name || "بدون اسم"}
                    {w.is_verified && (
                      <span style={{ color: "var(--accent-ios)", fontSize: "1.1rem" }} title="حساب موثق من الإدارة">
                        ✔️
                      </span>
                    )}
                  </h3>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--accent-ios)", fontWeight: "700" }}>💼 {w.specialty}</span>
                    <span>📍 {w.profiles?.governorate}، {w.profiles?.city}</span>
                    <span>📞 {w.profiles?.phone || "غير متوفر"}</span>
                    <span>⭐ {w.rating_avg ? w.rating_avg.toFixed(2) : "0"} ({w.rating_count} تقييم)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Grant / Revoke Blue Verification Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => handleToggleVerified(w.id, w.is_verified)}
                  disabled={updatingId === w.id}
                  style={{
                    background: w.is_verified ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.12)",
                    border: `1px solid ${w.is_verified ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                    color: w.is_verified ? "var(--accent-danger, #ef4444)" : "var(--accent-ios, #3b82f6)",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s"
                  }}
                >
                  {updatingId === w.id ? (
                    <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  ) : w.is_verified ? (
                    "❌ إلغاء شارة التوثيق الزرقاء"
                  ) : (
                    "✔️ منح شارة التوثيق الزرقاء"
                  )}
                </button>

                <Link
                  href={`/services/workers/${w.id}`}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    borderRadius: "10px",
                    padding: "8px 14px",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                    textDecoration: "none"
                  }}
                >
                  🔍 معاينة
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
