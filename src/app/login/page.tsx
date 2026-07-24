"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginStep, setLoginStep] = useState<"credentials" | "mfa">("credentials");
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[index] = value.slice(-1);
    setCodeDigits(newDigits);
    setMfaCode(newDigits.join(''));
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...codeDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setCodeDigits(newDigits);
      setMfaCode(newDigits.join(''));
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("لم يتم تكوين إعدادات قاعدة البيانات بعد."); return; }
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) { 
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة."); 
      setLoading(false); 
      return; 
    }
    
    if (data.user) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      
      if (totpFactor && totpFactor.status === 'verified') {
        // MFA required
        setFactorId(totpFactor.id);
        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challenge.data) {
          setChallengeId(challenge.data.id);
          setLoginStep("mfa");
          setLoading(false);
          return;
        }
        setError("حدث خطأ أثناء إعداد المصادقة الثنائية.");
        setLoading(false);
        return;
      }
    }

    // Normal login
    router.push("/");
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !factorId || !challengeId) return;
    setLoading(true);
    setError("");

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: mfaCode
    });

    if (verify.error) {
      setError("كود المصادقة غير صحيح.");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0,212,170,0.2) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>
        
        {/* Logo / Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "40px", animation: "slide-in-section 0.6s ease both" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "22px",
            background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", margin: "0 auto 20px",
            boxShadow: "0 12px 40px rgba(108,99,255,0.4)",
            animation: "float-y 4s ease-in-out infinite"
          }}>
            📋
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.2rem",
            fontWeight: "900",
            background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
          }}>
            أهلاً بك مجدداً
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            سجّل دخولك للوصول لأماكنك المفضلة وتجربة مخصصة
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(12, 16, 40, 0.7)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid rgba(108, 99, 255, 0.2)",
          borderRadius: "28px",
          padding: "40px 36px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 60px rgba(108,99,255,0.1)",
          animation: "slide-in-section 0.7s ease 0.1s both",
        }}>
          {error && (
            <div style={{
              background: "rgba(255, 63, 142, 0.12)",
              border: "1px solid rgba(255, 63, 142, 0.3)",
              borderRadius: "14px",
              padding: "12px 16px",
              color: "#ff6eb4",
              marginBottom: "24px",
              fontSize: "0.88rem",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              animation: "slide-in-section 0.3s ease",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {loginStep === "credentials" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
              <label className="help-label">البريد الإلكتروني</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", pointerEvents: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input
                  type="email"
                  required
                  className="ios-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  style={{ textAlign: "left", direction: "ltr", paddingRight: "48px" }}
                />
              </div>
            </div>

            <div>
              <label className="help-label">كلمة المرور</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="ios-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ textAlign: "left", direction: "ltr", paddingLeft: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input 
                type="checkbox" 
                id="keepSignedIn" 
                checked={keepSignedIn} 
                onChange={(e) => setKeepSignedIn(e.target.checked)} 
                style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="keepSignedIn" style={{ color: "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}>
                البقاء مسجل الدخول
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                padding: "15px",
                fontSize: "1rem",
                fontWeight: "800",
                borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg, #6c63ff, #3b82f6, #00d4aa)",
                backgroundSize: "200%",
                animation: "gradient-move 4s ease infinite",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 32px rgba(108,99,255,0.4)",
                width: "100%",
                fontFamily: "var(--font-body)",
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "20px", height: "20px" }} />
                  جاري الدخول...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                  تسجيل الدخول
                </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMfa} style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fade-in 0.4s ease" }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)", fontSize: "2rem", margin: "0 auto 16px" }}>
                  🛡️
                </div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>التحقق الثنائي</h3>
                <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>يرجى إدخال الكود المكون من 6 أرقام من تطبيق المصادقة الخاص بك</p>
              </div>
              
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", direction: "ltr" }}>
                {codeDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="ios-input"
                    style={{
                      width: "48px",
                      height: "56px",
                      textAlign: "center",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      padding: "0",
                      borderRadius: "12px",
                      border: "2px solid rgba(108, 99, 255, 0.2)",
                      background: "rgba(108, 99, 255, 0.05)",
                      color: "var(--text-primary)"
                    }}
                    maxLength={2}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                style={{
                  marginTop: "8px",
                  padding: "15px",
                  fontSize: "1rem",
                  fontWeight: "800",
                  borderRadius: "16px",
                  border: "none",
                  background: "linear-gradient(135deg, #6c63ff, #3b82f6, #00d4aa)",
                  backgroundSize: "200%",
                  animation: "gradient-move 4s ease infinite",
                  color: "#fff",
                  cursor: (loading || mfaCode.length !== 6) ? "not-allowed" : "pointer",
                  opacity: (loading || mfaCode.length !== 6) ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 32px rgba(108,99,255,0.4)",
                  width: "100%",
                  fontFamily: "var(--font-body)",
                }}
              >
                {loading ? "جاري التحقق..." : "تأكيد ومتابعة"}
              </button>

              <button
                type="button"
                onClick={async () => { 
                  if (supabase) await supabase.auth.signOut();
                  setLoginStep("credentials"); 
                  setMfaCode(""); 
                  setCodeDigits(Array(6).fill(""));
                  setError(""); 
                }}
                style={{
                  background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.9rem", cursor: "pointer", marginTop: "8px"
                }}
              >
                رجوع وإلغاء
              </button>
            </form>
          )}

          <div style={{ marginTop: "28px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(108,99,255,0.15)" }} />
              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>ليس لديك حساب؟</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(108,99,255,0.15)" }} />
            </div>
            <Link href="/signup" style={{
              display: "block",
              padding: "13px",
              borderRadius: "16px",
              border: "1px solid rgba(108,99,255,0.3)",
              background: "rgba(108,99,255,0.08)",
              color: "var(--text-primary)",
              fontWeight: "700",
              fontSize: "0.95rem",
              textDecoration: "none",
              transition: "all 0.3s ease",
              textAlign: "center",
            }}>
              إنشاء حساب جديد مجاناً ✨
            </Link>
          </div>
        </div>

        {/* Bottom note */}
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "24px", animation: "fade-in 0.8s ease 0.5s both" }}>
          بالدخول أنت توافق على{" "}
          <span style={{ color: "var(--accent-primary)", cursor: "pointer" }}>الشروط والأحكام</span>
          {" "}و{" "}
          <span style={{ color: "var(--accent-primary)", cursor: "pointer" }}>سياسة الخصوصية</span>
        </p>
      </div>
    </div>
  );
}
