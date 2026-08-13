"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function ServicesLoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push("/services");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("لم يتم تكوين إعدادات قاعدة البيانات بعد.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if user is a worker
      const { data: workerData } = await supabase
        .from("service_workers")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (workerData) {
        router.push("/services/dashboard");
      } else {
        router.push("/services");
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "var(--bg-primary)",
      direction: "rtl"
    }}>
      {/* Background Orbs */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0, 212, 170, 0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontFamily: "var(--font-almarai)",
            fontSize: "2rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, var(--accent-ios, #3b82f6), #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
          }}>
            بوابة دليل الخدمات
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            سجّل دخولك للبحث عن مقدم خدمة أو إدارة طلباتك وأعمالك
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "var(--shadow-card)",
        }}>
          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "var(--accent-danger, #ef4444)",
              marginBottom: "20px",
              fontSize: "0.85rem",
              textAlign: "center",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="example@mail.com"
                className="ios-input"
                style={{
                  height: "46px",
                  borderRadius: "10px",
                  border: focusedField === "email" ? "1.5px solid var(--accent-ios, #3b82f6)" : "1px solid var(--border-glass)",
                  background: "var(--bg-secondary)",
                  padding: "0 14px",
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  direction: "ltr"
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  كلمة المرور
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="ios-input"
                  style={{
                    height: "46px",
                    width: "100%",
                    borderRadius: "10px",
                    border: focusedField === "password" ? "1.5px solid var(--accent-ios, #3b82f6)" : "1px solid var(--border-glass)",
                    background: "var(--bg-secondary)",
                    padding: "0 40px 0 14px",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                    direction: "ltr"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "1.1rem"
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: "46px",
                borderRadius: "10px",
                background: "var(--accent-ios, #3b82f6)",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "opacity 0.2s",
                fontFamily: "var(--font-almarai)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              {loading ? (
                <span style={{ display: "inline-block", width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-glass)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>أو</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-glass)" }} />
          </div>

          {/* Links */}
          <div style={{ textAlign: "center", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>ليس لديك حساب؟ </span>
            <Link href="/services/auth/signup" style={{ color: "var(--accent-ios, #3b82f6)", fontWeight: "700", textDecoration: "none" }}>
              إنشاء حساب جديد
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/services" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", textDecoration: "none" }}>
            ⬅️ العودة للدليل بدون تسجيل
          </Link>
        </div>
      </div>
    </div>
  );
}
