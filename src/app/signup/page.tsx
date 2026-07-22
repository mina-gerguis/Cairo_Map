"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

/* ═══════════════════════════════════════════
   Shared wrapper for auth pages
   ═══════════════════════════════════════════ */
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
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
    <div style={{ position: "fixed", top: "-15%", right: "-10%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(108,99,255,0.22) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(0,212,170,0.18) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "fixed", top: "50%", left: "30%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255,63,142,0.12) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ width: "100%", maxWidth: "500px", position: "relative", zIndex: 1 }}>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   Glass Card wrapper
   ═══════════════════════════════════════════ */
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: "rgba(10, 12, 35, 0.72)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    border: "1px solid rgba(108, 99, 255, 0.2)",
    borderRadius: "28px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45), 0 0 60px rgba(108,99,255,0.1)",
    ...style,
  }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════
   Onboarding Slider
   ═══════════════════════════════════════════ */
const OnboardingSlider = ({ onStartSignup }: { onStartSignup: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: "🌟",
      gradient: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)",
      title: "إنشاء حسابك الآن مجاناً",
      desc: "أنشئ حسابك وتمتع بتجربة مخصصة واكتشف أقرب الأماكن إليك.",
    },
    {
      icon: "🗺️",
      gradient: "linear-gradient(135deg, #00d4aa 0%, #3b82f6 100%)",
      title: "اكتشف أفضل الأماكن حولك",
      desc: "ابحث عن المطاعم، الكافيهات، والصيدليات القريبة منك بكل سهولة.",
    },
    {
      icon: "❤️",
      gradient: "linear-gradient(135deg, #ff3f8e 0%, #6c63ff 100%)",
      title: "أضف الأماكن لمفضلتك",
      desc: "احفظ الأماكن المميزة وشارك تجربتك مع الآخرين بكل بساطة.",
    },
  ];

  useEffect(() => {
    if (currentSlide === slides.length - 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const slide = slides[currentSlide];

  return (
    <AuthLayout>
      {/* Brand header */}
      <div style={{ textAlign: "center", marginBottom: "36px", animation: "slide-in-section 0.6s ease both" }}>
        <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: "linear-gradient(135deg, #6c63ff, #00d4aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", margin: "0 auto 16px", boxShadow: "0 12px 40px rgba(108,99,255,0.4)", animation: "float-y 4s ease-in-out infinite" }}>
          📋
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: "900", background: "linear-gradient(135deg, #6c63ff, #00d4aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          مرحباً بك في دفتري
        </h1>
      </div>

      <GlassCard style={{ overflow: "hidden", animation: "slide-in-section 0.7s ease 0.1s both" }}>
        {/* Slide visual area */}
        <div style={{ position: "relative", height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: slide.gradient, transition: "background 0.8s ease" }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-20px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: "5.5rem", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))", animation: "float-y 3s ease-in-out infinite", position: "relative", zIndex: 1 }}>
            {slide.icon}
          </span>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(10,12,35,0.85), transparent)" }} />
        </div>

        {/* Content */}
        <div style={{ padding: "32px 28px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.55rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "12px", animation: "slide-in-section 0.4s ease" }}>
            {slide.title}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "28px" }}>
            {slide.desc}
          </p>

          {/* Dot indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: currentSlide === i ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: currentSlide === i ? "linear-gradient(135deg, #6c63ff, #00d4aa)" : "rgba(255,255,255,0.2)",
                  border: "none",
                  transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow: currentSlide === i ? "0 0 12px rgba(108,99,255,0.5)" : "none",
                }}
              />
            ))}
          </div>

          {/* Action buttons — visible on last slide */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", opacity: currentSlide === slides.length - 1 ? 1 : 0, transform: currentSlide === slides.length - 1 ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s ease", visibility: currentSlide === slides.length - 1 ? "visible" : "hidden" }}>
            <button
              onClick={onStartSignup}
              style={{ padding: "15px", fontSize: "1rem", fontWeight: "800", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, #6c63ff, #3b82f6, #00d4aa)", backgroundSize: "200%", animation: "gradient-move 4s ease infinite", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 32px rgba(108,99,255,0.4)", width: "100%", fontFamily: "var(--font-body)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              مستخدم جديد، أريد إنشاء حساب ✨
            </button>
            <Link href="/login" style={{ padding: "14px", fontSize: "0.95rem", fontWeight: "700", borderRadius: "16px", border: "1px solid rgba(108,99,255,0.3)", background: "rgba(108,99,255,0.08)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", transition: "all 0.3s ease" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              أمتلك حساب، تسجيل الدخول
            </Link>
          </div>
        </div>
      </GlassCard>
    </AuthLayout>
  );
};

/* ═══════════════════════════════════════════
   Main Signup Page
   ═══════════════════════════════════════════ */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "", username: "", phone: "", email: "",
    gender: "ذكر", governorate: "", city: "", avatarUrl: "",
    password: "", confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({ fullName: "", username: "", phone: "", email: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const transliterate = (text: string) => {
    const map: Record<string, string> = {
      'ا': 'a','أ': 'a','إ': 'e','آ': 'a','ب': 'b','ت': 't','ث': 'th','ج': 'g','ح': 'h','خ': 'kh',
      'د': 'd','ذ': 'z','ر': 'r','ز': 'z','س': 's','ش': 'sh','ص': 's','ض': 'd','ط': 't','ظ': 'z',
      'ع': 'a','غ': 'gh','ف': 'f','ق': 'k','ك': 'k','ل': 'l','م': 'm','ن': 'n','ه': 'h','و': 'w','ي': 'y',
      'ة': 'a','ى': 'a','ئ': 'e','ء': 'a','ؤ': 'o'
    };
    return text.split('').map(c => map[c] || c).join('').replace(/[^a-z0-9_]/gi, '');
  };

  useEffect(() => {
    if (formData.fullName.length >= 3) {
      const base = transliterate(formData.fullName.trim().toLowerCase());
      if (base) setSuggestions([base, `${base}${Math.floor(Math.random() * 100)}`, `${base}_eg`]);
      else setSuggestions([]);
    } else setSuggestions([]);

    if (formData.fullName.length > 0) {
      const hasArabic = /[\u0600-\u06FF]/.test(formData.fullName);
      const hasEnglish = /[a-zA-Z]/.test(formData.fullName);
      if (formData.fullName.length < 3) setFieldErrors(p => ({...p, fullName: "الاسم يجب أن يكون 3 حروف على الأقل"}));
      else if (/[0-9]/.test(formData.fullName)) setFieldErrors(p => ({...p, fullName: "لا يسمح باستخدام الأرقام في الاسم"}));
      else if (hasArabic && hasEnglish) setFieldErrors(p => ({...p, fullName: "يجب كتابة الاسم بلغة واحدة فقط"}));
      else setFieldErrors(p => ({...p, fullName: ""}));
    } else setFieldErrors(p => ({...p, fullName: ""}));
  }, [formData.fullName]);

  useEffect(() => {
    if (formData.phone.length > 0) {
      if (!formData.phone.startsWith("1")) {
        setFieldErrors(p => ({...p, phone: "يجب أن يبدأ الرقم بـ 1"}));
      } else if (formData.phone.length !== 10) {
        setFieldErrors(p => ({...p, phone: "يجب أن يتكون الرقم من 10 أرقام"}));
      } else {
        setFieldErrors(p => ({...p, phone: ""}));
      }
    } else {
      setFieldErrors(p => ({...p, phone: ""}));
    }
  }, [formData.phone]);

  useEffect(() => {
    if (formData.email.length > 0) setFieldErrors(p => ({...p, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "" : "صيغة البريد الإلكتروني غير صحيحة"}));
    else setFieldErrors(p => ({...p, email: ""}));
  }, [formData.email]);

  const updateData = (field: string, value: string) => {
    if (field === "phone") {
      const n = value.replace(/[^0-9]/g, '');
      if (n.length <= 10) setFormData(p => ({...p, phone: n}));
    } else if (field === "username") {
      const c = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(p => ({...p, username: c}));
      setFieldErrors(p => ({...p, username: c.length > 0 && c.length < 3 ? "اسم المستخدم يجب أن يكون 3 حروف على الأقل" : ""}));
    } else {
      setFormData(p => ({...p, [field]: value}));
    }
  };

  const avatars = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Omar&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Tarek&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Youssef&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Ali&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Nour&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Layla&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Hala&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Mona&backgroundColor=ffdfbf",
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) setError("فشل رفع الصورة: " + uploadError.message);
    else if (data) { const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath); updateData("avatarUrl", pub.publicUrl); }
    setLoading(false);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldErrors.fullName || fieldErrors.username || fieldErrors.phone || fieldErrors.email) { setError("يرجى تصحيح الأخطاء قبل المتابعة."); return; }
    if (formData.username.length < 3) { setError("اسم المستخدم يجب أن يكون 3 حروف على الأقل."); return; }
    if (formData.phone.length !== 10) { setError("رقم الهاتف يجب أن يتكون من 10 أرقام."); return; }
    if (!supabase) return;
    setLoading(true); setError("");
    const fullPhone = `+20${formData.phone}`;
    const { data: existing } = await supabase.from('profiles').select('username, email, phone').or(`username.eq.${formData.username},email.eq.${formData.email},phone.eq.${fullPhone}`).limit(1);
    if (existing && existing.length > 0) {
      const c = existing[0];
      if (c.username === formData.username) setError("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
      else if (c.email === formData.email) setError("البريد الإلكتروني مسجل مسبقاً.");
      else setError("رقم الهاتف مسجل مسبقاً.");
      setLoading(false); return;
    }
    setLoading(false); setStep(2);
  };

  const pwdRules = {
    length: formData.password.length >= 8 && formData.password.length <= 32,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[@$!%*?&#^]/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.password !== "",
  };
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) { setError("يرجى التأكد من استيفاء جميع شروط كلمة المرور."); return; }
    if (!supabase) { setError("لم يتم تكوين إعدادات قاعدة البيانات بعد."); return; }
    setLoading(true); setError("");
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email, password: formData.password,
      options: { data: { full_name: formData.fullName, username: formData.username, phone: `+20${formData.phone}`, gender: formData.gender, governorate: formData.governorate, city: formData.city, avatar_url: formData.avatarUrl } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); }
    else { setSuccess(true); setLoading(false); setTimeout(() => router.push("/"), 2500); }
  };

  if (step === 0) return <OnboardingSlider onStartSignup={() => setStep(1)} />;

  /* ── Step labels & colors ── */
  const stepInfo = [
    null,
    { label: "البيانات الأساسية", icon: "👤", gradient: "linear-gradient(135deg, #6c63ff, #3b82f6)" },
    { label: "الصورة الشخصية", icon: "🖼️", gradient: "linear-gradient(135deg, #00d4aa, #3b82f6)" },
    { label: "حماية الحساب", icon: "🔐", gradient: "linear-gradient(135deg, #ff3f8e, #6c63ff)" },
  ];
  const current = stepInfo[step]!;

  return (
    <AuthLayout>
      {/* Step Header */}
      <div style={{ textAlign: "center", marginBottom: "28px", animation: "slide-in-section 0.5s ease both" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: current.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", margin: "0 auto 14px", boxShadow: "0 8px 32px rgba(108,99,255,0.35)", animation: "float-y 4s ease-in-out infinite" }}>
          {current.icon}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: "900", background: current.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {current.label}
        </h1>
      </div>

      <GlassCard style={{ padding: "36px 32px", animation: "slide-in-section 0.6s ease 0.1s both" }}>
        {/* Progress indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", alignItems: "center" }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                height: "6px",
                flex: 1,
                borderRadius: "3px",
                background: step >= s ? current.gradient : "rgba(255,255,255,0.1)",
                transition: "all 0.5s ease",
                boxShadow: step >= s ? "0 0 10px rgba(108,99,255,0.4)" : "none",
              }} />
            </React.Fragment>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,63,142,0.12)", border: "1px solid rgba(255,63,142,0.3)", borderRadius: "14px", padding: "12px 16px", color: "#ff6eb4", marginBottom: "20px", fontSize: "0.88rem", textAlign: "center", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", animation: "slide-in-section 0.3s ease" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ background: "rgba(0,212,170,0.12)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: "14px", padding: "16px", color: "#00d4aa", marginBottom: "20px", textAlign: "center", fontSize: "1rem", fontWeight: "700", animation: "pop-in 0.5s ease" }}>
            🎉 تم إنشاء حسابك بنجاح! جاري التحويل...
          </div>
        )}

        {!success && (
          <form onSubmit={step === 3 ? handleFinalSubmit : step === 1 ? handleStep1Submit : (e) => { e.preventDefault(); setStep(step + 1); }}>

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "slide-in-section 0.4s ease" }}>
                {/* Full Name */}
                <div>
                  <label className="help-label">الاسم بالكامل</label>
                  <input type="text" required className="ios-input" value={formData.fullName} onChange={(e) => updateData("fullName", e.target.value)} placeholder="أحمد محمد" style={{ borderColor: fieldErrors.fullName ? "rgba(255,63,142,0.6)" : "" }} />
                  {fieldErrors.fullName && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}><span>⚠</span> {fieldErrors.fullName}</div>}
                </div>

                {/* Username */}
                <div>
                  <label className="help-label">اسم المستخدم (إنجليزي فقط)</label>
                  <input type="text" required minLength={3} className="ios-input" value={formData.username} onChange={(e) => updateData("username", e.target.value)} placeholder="ahmed_mohamed" style={{ textAlign: "left", direction: "ltr", borderColor: fieldErrors.username ? "rgba(255,63,142,0.6)" : "" }} />
                  {fieldErrors.username && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "6px" }}>⚠ {fieldErrors.username}</div>}
                  {suggestions.length > 0 && !fieldErrors.username && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", alignSelf: "center" }}>اقتراحات:</span>
                      {suggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => updateData("username", s)} style={{ fontSize: "0.8rem", background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "20px", padding: "4px 12px", color: "#a78bfa", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "monospace" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="help-label">رقم الهاتف (بدون صفر البداية)</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", zIndex: 1, direction: "ltr" }}>
                      <span>🇪🇬</span>
                      <span style={{ fontSize: "0.88rem", fontWeight: "700" }}>+20</span>
                      <span style={{ height: "18px", width: "1px", background: "rgba(108,99,255,0.3)", margin: "0 2px" }} />
                    </div>
                    <input type="tel" required className="ios-input" value={formData.phone} onChange={(e) => updateData("phone", e.target.value)} placeholder="1xxxxxxxxx" style={{ textAlign: "left", direction: "ltr", paddingLeft: "90px", borderColor: fieldErrors.phone ? "rgba(255,63,142,0.6)" : "" }} />
                  </div>
                  {fieldErrors.phone && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "6px" }}>⚠ {fieldErrors.phone}</div>}
                </div>

                {/* Email */}
                <div>
                  <label className="help-label">البريد الإلكتروني</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", pointerEvents: "none" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input type="email" required className="ios-input" value={formData.email} onChange={(e) => updateData("email", e.target.value)} placeholder="example@email.com" style={{ textAlign: "left", direction: "ltr", paddingRight: "44px", borderColor: fieldErrors.email ? "rgba(255,63,142,0.6)" : "" }} />
                  </div>
                  {fieldErrors.email && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "6px" }}>⚠ {fieldErrors.email}</div>}
                </div>

                {/* Gender */}
                <div>
                  <label className="help-label">الجنس</label>
                  <select required className="ios-input help-select" value={formData.gender} onChange={(e) => updateData("gender", e.target.value)}>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                {/* Governorate */}
                <div>
                  <label className="help-label">المحافظة</label>
                  <select required className="ios-input help-select" value={formData.governorate} onChange={(e) => { updateData("governorate", e.target.value); updateData("city", ""); }}>
                    <option value="" disabled>اختر المحافظة...</option>
                    {governoratesList.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {formData.governorate && (
                  <div>
                    <label className="help-label">المدينة</label>
                    <select required className="ios-input help-select" value={formData.city} onChange={(e) => updateData("city", e.target.value)}>
                      <option value="" disabled>اختر المدينة...</option>
                      {egyptLocations[formData.governorate].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ marginTop: "8px", padding: "15px", fontSize: "1rem", fontWeight: "800", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, #6c63ff, #3b82f6)", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 28px rgba(108,99,255,0.4)", width: "100%", fontFamily: "var(--font-body)" }}>
                  {loading ? <><div className="spinner" /> جاري التحقق...</> : <>التالي <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg></>}
                </button>
              </div>
            )}

            {/* ── STEP 2: Avatar ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "slide-in-section 0.4s ease" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
                  ارفع صورتك الشخصية أو اختر أفاتار جاهز. يمكنك تخطي هذه الخطوة.
                </p>

                {/* File Upload */}
                <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "24px", border: "2px dashed rgba(108,99,255,0.35)", borderRadius: "18px", background: "rgba(108,99,255,0.05)", transition: "all 0.3s ease" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span style={{ color: "#a78bfa", fontWeight: "700", fontSize: "0.9rem" }}>{loading ? "جاري الرفع..." : "ارفع صورة / التقط بكاميرا الهاتف"}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} disabled={loading} />
                </label>

                {/* Preview */}
                {formData.avatarUrl && (
                  <div style={{ textAlign: "center", animation: "pop-in 0.4s ease" }}>
                    <img src={formData.avatarUrl} alt="preview" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(108,99,255,0.5)", boxShadow: "0 0 20px rgba(108,99,255,0.3)" }} />
                  </div>
                )}

                {/* Avatar grid */}
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "12px", fontWeight: "600" }}>أو اختر أفاتار جاهز:</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                    {avatars.map((url, i) => (
                      <div key={i} onClick={() => updateData("avatarUrl", url)} style={{ border: formData.avatarUrl === url ? "3px solid #6c63ff" : "3px solid transparent", borderRadius: "50%", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", opacity: formData.avatarUrl && formData.avatarUrl !== url ? 0.45 : 1, boxShadow: formData.avatarUrl === url ? "0 0 16px rgba(108,99,255,0.5)" : "none" }}>
                        <img src={url} alt={`Avatar ${i}`} style={{ width: "100%", height: "auto", display: "block", aspectRatio: "1" }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1px solid rgba(108,99,255,0.25)", background: "rgba(108,99,255,0.08)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>رجوع</button>
                  <button type="button" onClick={() => { updateData("avatarUrl", ""); setStep(3); }} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", cursor: "pointer", fontWeight: "700", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>تخطي</button>
                  <button type="submit" style={{ flex: 2, padding: "13px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #00d4aa, #3b82f6)", color: "#fff", cursor: "pointer", fontWeight: "800", fontFamily: "var(--font-body)", fontSize: "0.95rem", boxShadow: "0 6px 20px rgba(0,212,170,0.35)" }}>التالي</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Password ── */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "slide-in-section 0.4s ease" }}>
                {/* Password */}
                <div>
                  <label className="help-label">كلمة المرور</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} required className="ios-input" value={formData.password} onChange={(e) => updateData("password", e.target.value)} placeholder="••••••••" style={{ textAlign: "left", direction: "ltr", paddingLeft: "48px" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label className="help-label">تأكيد كلمة المرور</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirmPassword ? "text" : "password"} required className="ios-input" value={formData.confirmPassword} onChange={(e) => updateData("confirmPassword", e.target.value)} placeholder="••••••••" style={{ textAlign: "left", direction: "ltr", paddingLeft: "48px" }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Rules */}
                <div style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "16px", padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem" }}>
                  {[
                    { ok: pwdRules.length, label: "من 8 إلى 32 حرف" },
                    { ok: pwdRules.upper, label: "حرف كبير (A-Z)" },
                    { ok: pwdRules.lower, label: "حرف صغير (a-z)" },
                    { ok: pwdRules.number, label: "رقم (0-9)" },
                    { ok: pwdRules.special, label: "رمز خاص (@$!...)" },
                    { ok: pwdRules.match, label: "كلمتا المرور متطابقتان" },
                  ].map(({ ok, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", color: ok ? "#00d4aa" : "var(--text-muted)", transition: "color 0.3s ease" }}>
                      <span style={{ fontSize: "0.9rem" }}>{ok ? "✅" : "⬜"}</span> {label}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1px solid rgba(108,99,255,0.25)", background: "rgba(108,99,255,0.08)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>رجوع</button>
                  <button type="submit" disabled={loading || !isPasswordValid} style={{ flex: 2, padding: "14px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #ff3f8e, #6c63ff)", color: "#fff", cursor: loading || !isPasswordValid ? "not-allowed" : "pointer", opacity: loading || !isPasswordValid ? 0.6 : 1, fontWeight: "800", fontFamily: "var(--font-body)", fontSize: "0.95rem", boxShadow: isPasswordValid ? "0 6px 24px rgba(255,63,142,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s ease" }}>
                    {loading ? <><div className="spinner" style={{ width: "18px", height: "18px" }} /> جاري الإنشاء...</> : "🎉 إنهاء وإنشاء حساب"}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </GlassCard>

      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "20px", animation: "fade-in 0.8s ease 0.5s both" }}>
        بالتسجيل أنت توافق على{" "}
        <span style={{ color: "var(--accent-primary)", cursor: "pointer" }}>الشروط والأحكام</span>
        {" "}و{" "}
        <span style={{ color: "var(--accent-primary)", cursor: "pointer" }}>سياسة الخصوصية</span>
      </p>
    </AuthLayout>
  );
}
