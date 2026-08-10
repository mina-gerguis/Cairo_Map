"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { useAuth } from "@/context/AuthContext";
import DriftWall from "@/components/ui/ElasticMesh";

export default function LoginPage() {
  const router = useRouter();
  const { user, mfaPending, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [loginStep, setLoginStep] = useState<"credentials" | "mfa">("credentials");
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // Auto redirect if fully authenticated
  React.useEffect(() => {
    if (user && !mfaPending) {
      router.push("/");
    }
  }, [user, mfaPending, router]);

  // Handle pending MFA on page load/refresh
  React.useEffect(() => {
    const initMfaStep = async () => {
      if (!supabase) return;
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totpFactor = factors?.totp?.[0];
          if (totpFactor && totpFactor.status === 'verified') {
            setFactorId(totpFactor.id);
            const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
            if (challenge.data) {
              setChallengeId(challenge.data.id);
              setLoginStep("mfa");
            }
          }
        }
      } catch (err) {
        console.error("MFA init error:", err);
      }
    };
    initMfaStep();
  }, []);

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

  const items = [
  { image: 'https://picsum.photos/id/1015/600/400', title: 'Peaks', href: 'https://example.com/one' },
  { image: 'https://picsum.photos/id/1025/600/400', title: 'Pup', href: 'https://example.com/two' },
  { image: 'https://picsum.photos/id/1039/600/400', title: 'Falls', href: 'https://example.com/three' },
];

  return (
    <>

      <div style={{ height: 600 }}>
        <DriftWall
          items={items}
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
          radius={14}
          roll={0}
          pauseOnHover={false}
          grayscale={false}
        />
      

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
      }}>
        {/* Background orbs */}
        <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0, 68, 120, 0.45) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>

          {/* Logo / Brand Header */}
          <div style={{ textAlign: "center", marginBottom: "40px", animation: "slide-in-section 0.6s ease both" }}>
            <div style={{ margin: "0 auto 20px", display: "flex", justifyContent: "center" }}>
              <img src="/logo/darkMode_logo.png" alt="القاهرة ماب" className="logo-img-dark" style={{ height: "54px", width: "auto", objectFit: "contain" }} />
              <img src="/logo/lightMode_logo.png" alt="القاهرة ماب" className="logo-img-light" style={{ height: "54px", width: "auto", objectFit: "contain" }} />
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
            background: "var(--card-glass)",
            backdropFilter: "blur(100px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid var(--border-glass)",
            borderRadius: "13px",
            padding: "36px 32px",
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
                {/* Email Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="email" style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-heading)",
                  }}>
                    <i className="bx bx-envelope" style={{ fontSize: "1rem" }}></i>
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="example@email.com"
                    className="login-field-input"
                    style={{
                      height: "44px",
                      width: "100%",
                      minWidth: 0,
                      borderRadius: "10px",
                      border: focusedField === "email" ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                      background: "transparent",
                      padding: "0 14px",
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      outline: "none",
                      transition: "all 0.2s ease",
                      boxShadow: focusedField === "email" ? "0 0 0 3px rgba(108, 99, 255, 0.12)" : "none",
                      textAlign: "left",
                      direction: "ltr",
                    }}
                  />
                </div>

                {/* Password Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="password" style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-heading)",
                  }}>
                    <i className="bx bx-lock-alt" style={{ fontSize: "1rem" }}></i>
                    كلمة المرور
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="login-field-input"
                      style={{
                        height: "44px",
                        width: "100%",
                        minWidth: 0,
                        borderRadius: "10px",
                        border: focusedField === "password" ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                        background: "transparent",
                        padding: "0 44px 0 14px",
                        fontSize: "0.9rem",
                        color: "var(--text-primary)",
                        outline: "none",
                        transition: "all 0.2s ease",
                        boxShadow: focusedField === "password" ? "0 0 0 3px rgba(108, 99, 255, 0.12)" : "none",
                        textAlign: "left",
                        direction: "ltr",
                      }}
                    />
                    {/* Toggle Password visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "12px",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        fontSize: "1.15rem",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                      }}
                    >
                      {showPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
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
                  <label htmlFor="keepSignedIn" style={{ color: "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", userSelect: "none", fontFamily: "var(--font-heading)" }}>
                    البقاء مسجل الدخول
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "8px",
                    padding: "6px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    background: "#000",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.3s ease",
                    width: "100%",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: "20px", height: "20px" }} />
                      جاري الدخول...
                    </>
                  ) : (
                    <>
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
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    color: "#fff",
                    cursor: (loading || mfaCode.length !== 6) ? "not-allowed" : "pointer",
                    opacity: (loading || mfaCode.length !== 6) ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 32px rgba(108,99,255,0.25)",
                    width: "100%",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: "20px", height: "20px" }} />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }}></i>
                      تأكيد ومتابعة
                    </>
                  )}
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
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.9rem", cursor: "pointer", marginTop: "8px"
                  }}
                >
                  <i className="bx bx-arrow-back" style={{ fontSize: "1.1rem" }}></i>
                  رجوع وإلغاء
                </button>
              </form>
            )}

            <div style={{ marginTop: "28px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border-glass)" }} />
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>ليس لديك حساب؟</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border-glass)" }} />
              </div>
              <Link href="/signup" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid var(--border-glass)",
                background: "rgba(143, 143, 143, 0.06)",
                color: "var(--text-primary)",
                fontWeight: "700",
                fontSize: "0.95rem",
                fontFamily: "var(--font-heading)",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}>
                <i className="bx bx-user-plus" style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}></i>
                إنشاء حساب جديد
              </Link>

              <Link href="/" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "13px",
                borderRadius: "16px",
                border: "none",
                background: "transparent",
                color: "var(--text-secondary)",
                fontWeight: "700",
                fontSize: "0.92rem",
                textDecoration: "none",
                transition: "all 0.3s ease",
                marginTop: "8px",
              }}>
                <i className="bx bx-walk" style={{ fontSize: "1.3rem" }}></i>
                دخول كزائر
              </Link>
            </div>
          </div>

          {/* Bottom note */}
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "24px", animation: "fade-in 0.8s ease 0.5s both" }}>
            بالدخول أنت توافق على{" "}
            <a href="/terms" style={{ color: "var(--accent-primary)", cursor: "pointer" }}>الشروط والأحكام</a>
            {" "}و{" "}
            <a href="/privacy" style={{ color: "var(--accent-primary)", cursor: "pointer" }}>سياسة الخصوصية</a>
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
