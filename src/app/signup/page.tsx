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
    padding: "40px 20px",
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
    background: "var(--bg-glass-card)",
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",
    border: "1px solid var(--border-glass)",
    borderRadius: "24px",
    boxShadow: "var(--shadow-card)",
    ...style,
  }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════
   Onboarding Slider (Full-screen version)
   ═══════════════════════════════════════════ */
const OnboardingSlider = ({ onStartSignup }: { onStartSignup: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: "🌟",
      imageUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1080",
      title: "أنشئ حسابك الآن مجاناً",
      desc: "استمتع بتجربة فريدة ومخصصة لحفظ أماكنك المفضلة وملاحظاتك الشخصية.",
    },
    {
      icon: "🗺️",
      imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5a0af?q=80&w=1080",
      title: "اكتشف أفضل الأماكن حولك",
      desc: "ابحث عن المطاعم، الكافيهات، والوجهات التاريخية القريبة منك بكل سهولة.",
    },
    {
      icon: "❤️",
      imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=1080",
      title: "تذكيرات وملاحظات ذكية للأماكن",
      desc: "أضف ملاحظات وتذكيرات هامة لأي مكان لتعود إليها في أي وقت.",
    },
  ];

  useEffect(() => {
    if (currentSlide === slides.length - 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const slide = slides[currentSlide];

  return (
    <div style={{
      width: "100%", height: "100vh", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "#0a0c23",
    }}>
      {/* Background Images with Crossfade */}
      {slides.map((s, idx) => (
        <div key={idx} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${s.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center",
          opacity: currentSlide === idx ? 1 : 0,
          transform: currentSlide === idx ? "scale(1)" : "scale(1.05)",
          transition: "opacity 1s ease-in-out, transform 1.2s ease-in-out", zIndex: 0,
        }} />
      ))}

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10, 12, 35, 1) 0%, rgba(10, 12, 35, 0.85) 45%, rgba(10, 12, 35, 0.4) 70%, transparent 100%)", zIndex: 1 }} />

      {/* Top bar */}
      <div style={{ position: "absolute", top: "40px", left: "20px", right: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, animation: "slide-in-section 0.5s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo/darkMode_logo.png" alt="القاهرة ماب" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
        </div>
        {currentSlide < slides.length - 1 && (
          <button onClick={() => setCurrentSlide(slides.length - 1)} style={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", padding: "8px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease" }}>
            تخطي
          </button>
        )}
      </div>

      {/* Bottom Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "480px", margin: "0 auto", padding: "0 24px 60px", boxSizing: "border-box" }}>
        <div style={{ background: "rgba(10, 12, 35, 0.55)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1px solid var(--border-glass)", borderRadius: "24px", padding: "28px 24px", boxShadow: "0 20px 45px rgba(0,0,0,0.5)", textAlign: "center", animation: "slide-in-section 0.6s ease both" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(108, 99, 255, 0.15)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(108,99,255,0.2)", animation: "float-y 4s ease-in-out infinite" }}>
            {slide.icon}
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: "900", color: "#fff", marginBottom: "10px" }}>{slide.title}</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.92rem", lineHeight: "1.7", marginBottom: "24px", minHeight: "48px" }}>{slide.desc}</p>
          
          {/* Dot indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: currentSlide === i ? "24px" : "8px", height: "8px", borderRadius: "4px", background: currentSlide === i ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" : "rgba(255,255,255,0.25)", border: "none", transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)", cursor: "pointer", padding: 0, boxShadow: currentSlide === i ? "0 0 8px var(--accent-primary)" : "none" }} />
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            {currentSlide < slides.length - 1 ? (
              <button onClick={() => setCurrentSlide((prev) => prev + 1)} style={{ padding: "14px", fontSize: "1rem", fontWeight: "800", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "transform 0.2s ease, opacity 0.2s ease", boxShadow: "0 6px 20px rgba(108,99,255,0.25)" }}>
                التالي <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }}></i>
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <button onClick={onStartSignup} style={{ padding: "14px", fontSize: "1rem", fontWeight: "800", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s ease", boxShadow: "0 6px 20px rgba(108,99,255,0.25)", fontFamily: "var(--font-body)" }}>
                  <i className="bx bx-user-plus" style={{ fontSize: "1.2rem" }}></i> إنشاء حساب جديد
                </button>
                <Link href="/login" style={{ padding: "13px", fontSize: "0.95rem", fontWeight: "700", borderRadius: "16px", border: "1px solid var(--border-glass)", background: "rgba(255, 255, 255, 0.05)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", transition: "all 0.3s ease" }}>
                  <i className="bx bx-log-in" style={{ fontSize: "1.2rem" }}></i> لدي حساب بالفعل
                </Link>
                <Link href="/" style={{ padding: "13px", fontSize: "0.92rem", fontWeight: "700", borderRadius: "16px", border: "none", background: "transparent", color: "rgba(255, 255, 255, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", transition: "all 0.3s ease", fontFamily: "var(--font-body)" }}>
                  <i className="bx bx-walk" style={{ fontSize: "1.3rem" }}></i> دخول كزائر
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Main Signup Page
   ═══════════════════════════════════════════ */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "", username: "", phone: "", email: "", dob: "",
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
  const [showDobConfirmModal, setShowDobConfirmModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    if (!formData.dob) { setError("يرجى إدخال تاريخ الميلاد."); return; }
    const dobDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
    if (age < 6) { setError("يجب أن يكون العمر 6 سنوات على الأقل للتسجيل."); return; }
    if (formData.username.length < 3) { setError("اسم المستخدم يجب أن يكون 3 حروف على الأقل."); return; }
    if (/^\d+$/.test(formData.username) || !/[a-z]/i.test(formData.username)) { setError("اسم المستخدم لا يمكن أن يتكون من أرقام فقط (يجب أن يحتوي على حروف إنجليزية)."); return; }
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
    setLoading(false);
    setShowDobConfirmModal(true);
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
      options: { data: { full_name: formData.fullName, username: formData.username, phone: `+20${formData.phone}`, gender: formData.gender, governorate: formData.governorate, city: formData.city, avatar_url: formData.avatarUrl, dob: formData.dob } },
    });
    if (signUpError) {
      let msg = signUpError.message;
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      
      // Fallback translations for common Supabase errors
      if (msg && msg.includes("User already registered")) msg = "هذا البريد الإلكتروني مسجل مسبقاً.";
      else if (msg && msg.includes("Database error saving new user")) msg = "حدث خطأ أثناء الحفظ. قد يكون رقم الهاتف أو اسم المستخدم محجوزاً.";
      else if (!msg || msg === "{}") msg = "تفاصيل الخطأ: " + JSON.stringify(signUpError);
      
      setError(msg); 
      setLoading(false); 
    }
    else { setSuccess(true); setLoading(false); setTimeout(() => router.push("/"), 2500); }
  };

  if (step === 0) return <OnboardingSlider onStartSignup={() => setStep(1)} />;

  const maxDobDate = new Date();
  maxDobDate.setFullYear(maxDobDate.getFullYear() - 6);
  const maxDobDateStr = maxDobDate.toISOString().split("T")[0];

  /* ── Step labels & colors ── */
  const stepInfo = [
    null,
    { label: "البيانات الأساسية", icon: "👤", gradient: "linear-gradient(135deg, #6c63ff, #3b82f6)" },
    { label: "الصورة الشخصية", icon: "🖼️", gradient: "linear-gradient(135deg, #00d4aa, #3b82f6)" },
    { label: "حماية الحساب", icon: "🔐", gradient: "linear-gradient(135deg, #ff3f8e, #6c63ff)" },
  ];
  const current = stepInfo[step]!;

  /* ── Reusable shadcn field-group style helpers ── */
  const fieldLabel = (iconClass: string, text: string) => (
    <span style={{
      fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      <i className={iconClass} style={{ fontSize: "1rem", color: "var(--accent-primary)", opacity: 0.8 }}></i>
      {text}
    </span>
  );

  const fieldInputStyle = (name: string, hasError?: boolean): React.CSSProperties => ({
    height: "44px", width: "100%", minWidth: 0, borderRadius: "10px",
    border: hasError ? "1.5px solid rgba(255,63,142,0.6)" : focusedField === name ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-glass)",
    background: "transparent", padding: "0 14px", fontSize: "0.9rem",
    color: "var(--text-primary)", outline: "none", transition: "all 0.2s ease",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(108, 99, 255, 0.12)" : "none",
  });

  const selectStyle = (name: string): React.CSSProperties => ({
    ...fieldInputStyle(name),
    appearance: "auto" as const, cursor: "pointer",
  });

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
                height: "6px", flex: 1, borderRadius: "3px",
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "slide-in-section 0.4s ease" }}>
                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="fullName">{fieldLabel("bx bx-user", "الاسم بالكامل")}</label>
                  <input id="fullName" type="text" required value={formData.fullName} onChange={(e) => updateData("fullName", e.target.value)} onFocus={() => setFocusedField("fullName")} onBlur={() => setFocusedField(null)} placeholder="أحمد محمد" style={fieldInputStyle("fullName", !!fieldErrors.fullName)} />
                  {fieldErrors.fullName && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "-4px", display: "flex", alignItems: "center", gap: "4px" }}><span>⚠</span> {fieldErrors.fullName}</div>}
                </div>

                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="username">{fieldLabel("bx bx-at", "اسم المستخدم (إنجليزي فقط)")}</label>
                  <input id="username" type="text" required minLength={3} value={formData.username} onChange={(e) => updateData("username", e.target.value)} onFocus={() => setFocusedField("username")} onBlur={() => setFocusedField(null)} placeholder="ahmed_mohamed" style={{ ...fieldInputStyle("username", !!fieldErrors.username), textAlign: "left", direction: "ltr" }} />
                  {fieldErrors.username && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "-4px" }}>⚠ {fieldErrors.username}</div>}
                  {suggestions.length > 0 && !fieldErrors.username && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "-2px", flexWrap: "wrap" }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="phone">{fieldLabel("bx bx-phone", "رقم الهاتف")}</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span style={{ position: "absolute", left: "14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>🇪🇬 +20 <span style={{ height: "16px", width: "1px", background: "var(--border-glass)", display: "inline-block" }} /></span>
                    <input id="phone" type="tel" required value={formData.phone} onChange={(e) => updateData("phone", e.target.value)} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} placeholder="1xxxxxxxxx" style={{ ...fieldInputStyle("phone", !!fieldErrors.phone), textAlign: "left", direction: "ltr", paddingLeft: "90px" }} />
                  </div>
                  {fieldErrors.phone && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "-4px" }}>⚠ {fieldErrors.phone}</div>}
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="signupEmail">{fieldLabel("bx bx-envelope", "البريد الإلكتروني")}</label>
                  <input id="signupEmail" type="email" required value={formData.email} onChange={(e) => updateData("email", e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} placeholder="example@email.com" style={{ ...fieldInputStyle("email", !!fieldErrors.email), textAlign: "left", direction: "ltr" }} />
                  {fieldErrors.email && <div style={{ color: "#ff6eb4", fontSize: "0.8rem", marginTop: "-4px" }}>⚠ {fieldErrors.email}</div>}
                </div>

                {/* Date of Birth */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="dob">{fieldLabel("bx bx-calendar", "تاريخ الميلاد")}</label>
                  <input id="dob" type="date" required max={maxDobDateStr} lang="en-US" value={formData.dob} onChange={(e) => updateData("dob", e.target.value)} onFocus={() => setFocusedField("dob")} onBlur={() => setFocusedField(null)} className="date-field-input" style={{ ...fieldInputStyle("dob"), direction: "ltr", fontFamily: "system-ui, -apple-system, sans-serif" }} />
                </div>

                {/* Gender */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="gender">{fieldLabel("bx bx-male-female", "الجنس")}</label>
                  <select id="gender" required value={formData.gender} onChange={(e) => updateData("gender", e.target.value)} style={selectStyle("gender")}>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                {/* Governorate */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="governorate">{fieldLabel("bx bx-map", "المحافظة")}</label>
                  <select id="governorate" required value={formData.governorate} onChange={(e) => { updateData("governorate", e.target.value); updateData("city", ""); }} style={selectStyle("gov")}>
                    <option value="" disabled>اختر المحافظة...</option>
                    {governoratesList.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* City */}
                {formData.governorate && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="city">{fieldLabel("bx bx-buildings", "المدينة")}</label>
                    <select id="city" required value={formData.city} onChange={(e) => updateData("city", e.target.value)} style={selectStyle("city")}>
                      <option value="" disabled>اختر المدينة...</option>
                      {egyptLocations[formData.governorate].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ marginTop: "8px", padding: "15px", fontSize: "1rem", fontWeight: "800", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, var(--accent-primary), #3b82f6)", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 28px rgba(108,99,255,0.25)", width: "100%", fontFamily: "var(--font-body)" }}>
                  {loading ? <><div className="spinner" /> جاري التحقق...</> : <>التالي <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }}></i></>}
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
                  <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1px solid rgba(108,99,255,0.25)", background: "rgba(108,99,255,0.08)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700", fontFamily: "var(--font-body)", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><i className="bx bx-right-arrow-alt" style={{ fontSize: "1.2rem" }}></i> رجوع</button>
                  <button type="button" onClick={() => { updateData("avatarUrl", ""); setStep(3); }} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", cursor: "pointer", fontWeight: "700", fontFamily: "var(--font-body)", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>تخطي <i className="bx bx-fast-forward" style={{ fontSize: "1.2rem" }}></i></button>
                  <button type="submit" style={{ flex: 2, padding: "13px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #00d4aa, #3b82f6)", color: "#fff", cursor: "pointer", fontWeight: "800", fontFamily: "var(--font-body)", fontSize: "0.95rem", boxShadow: "0 6px 20px rgba(0,212,170,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>التالي <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }}></i></button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Password ── */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "slide-in-section 0.4s ease" }}>
                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="signupPassword">{fieldLabel("bx bx-lock-alt", "كلمة المرور")}</label>
                  <div style={{ position: "relative" }}>
                    <input id="signupPassword" type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => updateData("password", e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="••••••••" style={{ ...fieldInputStyle("password"), textAlign: "left", direction: "ltr", paddingRight: "44px" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.15rem", display: "flex", alignItems: "center", padding: "2px" }}>
                      {showPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="confirmPassword">{fieldLabel("bx bx-check-shield", "تأكيد كلمة المرور")}</label>
                  <div style={{ position: "relative" }}>
                    <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={(e) => updateData("confirmPassword", e.target.value)} onFocus={() => setFocusedField("confirmPassword")} onBlur={() => setFocusedField(null)} placeholder="••••••••" style={{ ...fieldInputStyle("confirmPassword"), textAlign: "left", direction: "ltr", paddingRight: "44px" }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.15rem", display: "flex", alignItems: "center", padding: "2px" }}>
                      {showConfirmPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
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
                  <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1px solid rgba(108,99,255,0.25)", background: "rgba(108,99,255,0.08)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700", fontFamily: "var(--font-body)", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><i className="bx bx-right-arrow-alt" style={{ fontSize: "1.2rem" }}></i> رجوع</button>
                  <button type="submit" disabled={loading || !isPasswordValid} style={{ flex: 2, padding: "14px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #ff3f8e, #6c63ff)", color: "#fff", cursor: loading || !isPasswordValid ? "not-allowed" : "pointer", opacity: loading || !isPasswordValid ? 0.6 : 1, fontWeight: "800", fontFamily: "var(--font-body)", fontSize: "0.95rem", boxShadow: isPasswordValid ? "0 6px 24px rgba(255,63,142,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s ease" }}>
                    {loading ? <><div className="spinner" style={{ width: "18px", height: "18px" }} /> جاري الإنشاء...</> : <><i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }}></i> إنهاء وإنشاء حساب</>}
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

      {/* Modal confirmation for Date of Birth */}
      {showDobConfirmModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.85)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", animation: "fade-in 0.2s ease"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "420px", width: "100%", padding: "28px", borderRadius: "24px",
            border: "1px solid rgba(255, 149, 0, 0.3)", background: "rgba(12, 16, 40, 0.95)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)", textAlign: "center", animation: "slide-up 0.3s ease"
          }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 16px" }}>
              ⚠️
            </div>
            
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "12px" }}>
              تأكيد تاريخ الميلاد
            </h3>
            
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
              تاريخ الميلاد المدخل هو: <strong style={{ color: "var(--text-primary)", direction: "ltr", display: "inline-block" }}>{formData.dob}</strong>
              <br />
              <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: "700", marginTop: "4px", display: "block" }}>
                (العمر: {(() => {
                  const dobDate = new Date(formData.dob);
                  const today = new Date();
                  let age = today.getFullYear() - dobDate.getFullYear();
                  const m = today.getMonth() - dobDate.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
                  return age;
                })()} سنة)
              </span>
            </p>

            <div style={{ background: "rgba(255, 63, 142, 0.1)", border: "1px solid rgba(255, 63, 142, 0.25)", borderRadius: "14px", padding: "12px 14px", color: "#ff6eb4", fontSize: "0.83rem", lineHeight: 1.5, marginBottom: "24px", textAlign: "right" }}>
              🛑 <strong>تنبيه هام:</strong> لن تتمكن من تغيير تاريخ الميلاد لاحقاً بعد إتمام التسجيل.
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="ios-btn" onClick={() => setShowDobConfirmModal(false)} style={{ flex: 1, padding: "12px" }}>
                تعديل التاريخ
              </button>
              <button type="button" className="ios-btn" onClick={() => { setShowDobConfirmModal(false); setStep(2); }} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #6c63ff, #00d4aa)", color: "#fff", fontWeight: "700" }}>
                متابعة واستكمال
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
