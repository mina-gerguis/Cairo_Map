"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

/* ═══════════════════════════════════════════
   Shared wrapper for auth pages (White background)
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
    background: "#ffffff",
  }}>
    {/* Soft ambient background accents */}
    <div style={{ position: "fixed", top: "-15%", right: "-10%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "fixed", top: "50%", left: "30%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255,63,142,0.06) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
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
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
    ...style,
  }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════
   Onboarding Slider (Text & buttons overlaid on fixed-size image card)
   ═══════════════════════════════════════════ */
const OnboardingSlider = ({ onStartSignup }: { onStartSignup: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      imageUrl: "images/signUp/welcome1.jpg",
      title: "أنشئ حسابك الآن مجاناً",
      desc: "استمتع بتجربة فريدة ومخصصة لحفظ أماكنك المفضلة وملاحظاتك الشخصية.",
    },
    {
      imageUrl: "images/signUp/welcome2.jpg",
      title: "اكتشف أفضل الأماكن حولك",
      desc: "ابحث عن المطاعم، الكافيهات، والوجهات التاريخية القريبة منك بكل سهولة.",
    },
    {
      imageUrl: "images/signUp/welcome3.jpg",
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

  return (
    <>
      {/* Responsive Fixed Card Container for PC & Mobile */}
      <div style={{
        width: "100%",
        maxWidth: "100%",
        height: "100vh",
        maxHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        padding: "0 !important"
      }}>
        {/* Background Images Crossfade */}
        {slides.map((s, idx) => (
          <img
            key={idx}
            src={`/${s.imageUrl}`}
            alt={s.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? "scale(1)" : "scale(1.05)",
              transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
              zIndex: 0,
            }}
          />
        ))}

        {/* Gradient Overlay over image for text readability */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.1) 35%, rgba(0, 0, 0, 0.75) 70%, rgba(0, 0, 0, 0.92) 100%)",
          zIndex: 1,
        }} />

        {/* Content Overlaid on Image (Bottom half) */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "24px 24px 28px",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxSizing: "border-box",
        }}>
          {/* Title & Description */}
          <div style={{ minHeight: "5px", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "16px", width: "100%" }}>
            <h2 style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "#ffffff",
              marginBottom: "8px",
              fontFamily: "var(--font-heading)",
              lineHeight: 1.4,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}>
              {slides[currentSlide].title}
            </h2>
            <p style={{
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.88)",
              lineHeight: 1.6,
              fontFamily: "var(--font-body)",
              margin: 0,
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.5)",
            }}>
              {slides[currentSlide].desc}
            </p>
          </div>

          {/* Dots Indicators */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`الشريحة ${i + 1}`}
                style={{
                  border: "none",
                  padding: 0,
                  height: "8px",
                  width: currentSlide === i ? "24px" : "8px",
                  borderRadius: "12px",
                  background: currentSlide === i ? "#ffffff" : "rgba(255, 255, 255, 0.35)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Action Buttons overlaid on image */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide((prev) => prev + 1)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  borderRadius: "50px",
                  border: "none",
                  background: "#ffffff",
                  color: "#000000",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-heading)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
                }}
              >
                التالي <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }}></i>
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <button
                  onClick={onStartSignup}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    borderRadius: "50px",
                    border: "none",
                    background: "#ffffff",
                    color: "#000000",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    fontFamily: "var(--font-heading)",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <i className="bx bx-user-plus" style={{ fontSize: "1.2rem" }}></i> إنشاء حساب جديد
                </button>

                <Link
                  href="/login"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    borderRadius: "50px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(10px)",
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    fontFamily: "var(--font-heading)",
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <i className="bx bx-log-in" style={{ fontSize: "1.2rem" }}></i> لدي حساب بالفعل
                </Link>
              </div>
            )}

            <Link
              href="/"
              style={{
                padding: "6px",
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "rgba(255, 255, 255, 0.85)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "var(--font-heading)",
                textDecoration: "none",
                marginTop: "2px",
              }}
            >
              <i className="bx bx-walk" style={{ fontSize: "1.1rem" }}></i> <span style={{ textDecoration: "underline" }}>دخول كزائر</span>
            </Link>
          </div>
        </div>
      </div>
      </>
  );
};

/* ═══════════════════════════════════════════
   Main Signup Page
   ═══════════════════════════════════════════ */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    dob: "",
    gender: "ذكر",
    governorate: "",
    city: "",
    avatarUrl: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDobConfirmModal, setShowDobConfirmModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const transliterate = (text: string) => {
    const map: Record<string, string> = {
      'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
      'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'k', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
      'ة': 'a', 'ى': 'a', 'ئ': 'e', 'ء': 'a', 'ؤ': 'o'
    };
    return text.split('').map(c => map[c] || c).join('').replace(/[^a-z0-9_]/gi, '');
  };

  // Name validation & suggestions
  useEffect(() => {
    if (formData.firstName.length > 0) {
      const hasArabic = /[\u0600-\u06FF]/.test(formData.firstName);
      const hasEnglish = /[a-zA-Z]/.test(formData.firstName);
      if (formData.firstName.length < 2) setFieldErrors(p => ({ ...p, firstName: "الاسم الأول يجب أن يكون حرفين على الأقل" }));
      else if (/[0-9]/.test(formData.firstName)) setFieldErrors(p => ({ ...p, firstName: "لا يسمح باستخدام الأرقام" }));
      else if (hasArabic && hasEnglish) setFieldErrors(p => ({ ...p, firstName: "يجب كتابة الاسم بلغة واحدة فقط" }));
      else setFieldErrors(p => ({ ...p, firstName: "" }));
    } else setFieldErrors(p => ({ ...p, firstName: "" }));

    if (formData.lastName.length > 0) {
      const hasArabic = /[\u0600-\u06FF]/.test(formData.lastName);
      const hasEnglish = /[a-zA-Z]/.test(formData.lastName);
      if (formData.lastName.length < 2) setFieldErrors(p => ({ ...p, lastName: "الاسم الأخير يجب أن يكون حرفين على الأقل" }));
      else if (/[0-9]/.test(formData.lastName)) setFieldErrors(p => ({ ...p, lastName: "لا يسمح باستخدام الأرقام" }));
      else if (hasArabic && hasEnglish) setFieldErrors(p => ({ ...p, lastName: "يجب كتابة الاسم بلغة واحدة فقط" }));
      else setFieldErrors(p => ({ ...p, lastName: "" }));
    } else setFieldErrors(p => ({ ...p, lastName: "" }));

    const combinedName = `${formData.firstName} ${formData.lastName}`.trim();
    if (combinedName.length >= 3) {
      const base = transliterate(combinedName.toLowerCase().replace(/\s+/g, '_'));
      if (base) setSuggestions([base, `${base}${Math.floor(Math.random() * 100)}`, `${base}_eg`]);
      else setSuggestions([]);
    } else setSuggestions([]);
  }, [formData.firstName, formData.lastName]);

  // Phone validation
  useEffect(() => {
    if (formData.phone.length > 0) {
      if (!formData.phone.startsWith("1")) {
        setFieldErrors(p => ({ ...p, phone: "يجب أن يبدأ الرقم بـ 1" }));
      } else if (formData.phone.length !== 10) {
        setFieldErrors(p => ({ ...p, phone: "يجب أن يتكون الرقم من 10 أرقام" }));
      } else {
        setFieldErrors(p => ({ ...p, phone: "" }));
      }
    } else {
      setFieldErrors(p => ({ ...p, phone: "" }));
    }
  }, [formData.phone]);

  // Email validation
  useEffect(() => {
    if (formData.email.length > 0) setFieldErrors(p => ({ ...p, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "" : "صيغة البريد الإلكتروني غير صحيحة" }));
    else setFieldErrors(p => ({ ...p, email: "" }));
  }, [formData.email]);

  const updateData = (field: string, value: string) => {
    if (field === "phone") {
      const n = value.replace(/[^0-9]/g, '');
      if (n.length <= 10) setFormData(p => ({ ...p, phone: n }));
    } else if (field === "username") {
      const c = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(p => ({ ...p, username: c }));
      setFieldErrors(p => ({ ...p, username: c.length > 0 && c.length < 3 ? "اسم المستخدم يجب أن يكون 3 حروف على الأقل" : "" }));
    } else {
      setFormData(p => ({ ...p, [field]: value }));
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

  // Step 3 Submit (Validates location, DOB & DB Uniqueness before moving to Avatar step)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dob) { setError("يرجى إدخال تاريخ الميلاد."); return; }
    const dobDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
    if (age < 6) { setError("يجب أن يكون العمر 6 سنوات على الأقل للتسجيل."); return; }

    if (!supabase) { setShowDobConfirmModal(true); return; }

    setLoading(true); setError("");
    const fullPhone = `+20${formData.phone}`;
    const { data: existing } = await supabase.from('profiles').select('username, email, phone').or(`username.eq.${formData.username},email.eq.${formData.email},phone.eq.${fullPhone}`).limit(1);
    if (existing && existing.length > 0) {
      const c = existing[0];
      if (c.username === formData.username) { setError("اسم المستخدم محجوز، يرجى اختيار اسم آخر."); setStep(1); }
      else if (c.email === formData.email) { setError("البريد الإلكتروني مسجل مسبقاً."); setStep(1); }
      else { setError("رقم الهاتف مسجل مسبقاً."); setStep(2); }
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

    const fullNameCombined = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const formattedPhone = `+20${formData.phone.replace(/^0+/, '')}`;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email, password: formData.password,
      options: {
        data: {
          full_name: fullNameCombined,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          username: formData.username,
          phone: formattedPhone,
          gender: formData.gender,
          governorate: formData.governorate,
          city: formData.city,
          avatar_url: formData.avatarUrl,
          dob: formData.dob
        }
      },
    });

    if (signUpError) {
      let msg = signUpError.message;
      if (typeof msg === 'object') msg = JSON.stringify(msg);

      if (msg && msg.includes("User already registered")) msg = "هذا البريد الإلكتروني مسجل مسبقاً.";
      else if (msg && msg.includes("Database error saving new user")) msg = "حدث خطأ أثناء الحفظ. قد يكون رقم الهاتف أو اسم المستخدم محجوزاً.";
      else if (!msg || msg === "{}") msg = "تفاصيل الخطأ: " + JSON.stringify(signUpError);

      setError(msg);
      setLoading(false);
    }
    else {
      // Save/Update full user profile details into public.profiles table
      if (signUpData?.user) {
        try {
          await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            full_name: fullNameCombined,
            username: formData.username,
            email: formData.email,
            phone: formattedPhone,
            gender: formData.gender,
            governorate: formData.governorate,
            city: formData.city,
            avatar_url: formData.avatarUrl,
            dob: formData.dob,
            updated_at: new Date().toISOString()
          }, { onConflict: "id" });
        } catch (profileErr) {
          console.error("Error updating profile fields on signup:", profileErr);
        }
      }
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push("/"), 2500);
    }
  };

  if (step === 0) return <OnboardingSlider onStartSignup={() => setStep(1)} />;

  const maxDobDate = new Date();
  maxDobDate.setFullYear(maxDobDate.getFullYear() - 6);
  const maxDobDateStr = maxDobDate.toISOString().split("T")[0];

  /* ── Step info array ── */
  const stepInfo = [
    null,
    {
      label: "عرفنا بنفسك",
      headerTitle: "عرفنا بنفسك؟",
      subTitle: "أدخل بياناتك الشخصية الأساسية",
      gradient: "linear-gradient(135deg, #6c63ff, #3b82f6)",
    },
    {
      label: "رقم الهاتف",
      headerTitle: "إيه هو رقم تليفونك؟",
      subTitle: "سنحتاج رقم هاتفك للتحقق والتواصل",
      gradient: "linear-gradient(135deg, #3b82f6, #00d4aa)",
    },
    {
      label: "الإقامة والسِن",
      headerTitle: "منين وعندك كام سنه؟",
      subTitle: "حدد تاريخ ميلادك ومكان إقامتك",
      gradient: "linear-gradient(135deg, #00d4aa, #ffa500)",
    },
    {
      label: "الصورة الشخصية",
      headerTitle: "الصورة الشخصية",
      subTitle: "اختر صورتك المفضلة أو ارفع صورة جديدة",
      gradient: "linear-gradient(135deg, #ff3f8e, #6c63ff)",
    },
    {
      label: "حماية الحساب",
      headerTitle: "حماية الحساب",
      subTitle: "أنشئ كلمة مرور قوية لحماية حسابك",
      gradient: "linear-gradient(135deg, #6c63ff, #10b981)",
    },
  ];
  const current = stepInfo[step]!;

  /* ── Reusable field-group style helpers ── */
  const fieldLabel = (iconClass: string, text: string) => (
    <span style={{
      fontSize: "0.85rem", fontWeight: "600", color: "#1e293b",
      display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-heading)"
    }}>
      <i className={iconClass} style={{ fontSize: "1rem", color: "#000000ff", opacity: 0.9 }}></i>
      {text}
    </span>
  );

  const fieldInputStyle = (name: string, hasError?: boolean): React.CSSProperties => ({
    height: "44px", width: "100%", minWidth: 0, borderRadius: "10px",
    border: hasError ? "1.5px solid #ef4444" : focusedField === name ? "1.5px solid #6c63ff" : "1px solid #cbd5e1",
    background: "#f8fafc", padding: "0 14px", fontSize: "0.9rem", fontFamily: "var(--font-heading)",
    color: "#0f172a", outline: "none", transition: "all 0.2s ease",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(108, 99, 255, 0.15)" : "none",
  });

  const selectStyle = (name: string): React.CSSProperties => ({
    ...fieldInputStyle(name),
    appearance: "auto" as const, cursor: "pointer", background: "#f8fafc", color: "#0f172a",
  });

  /* ── Validation flags per step ── */
  const isStep1Valid = Boolean(
    formData.firstName.trim().length >= 2 &&
    !fieldErrors.firstName &&
    formData.lastName.trim().length >= 2 &&
    !fieldErrors.lastName &&
    formData.username.trim().length >= 3 &&
    !fieldErrors.username &&
    formData.email.trim() !== "" &&
    !fieldErrors.email
  );

  const isStep2Valid = Boolean(
    formData.phone.length === 10 &&
    !fieldErrors.phone
  );

  const isStep3Valid = Boolean(
    formData.dob &&
    formData.governorate &&
    formData.city
  );

  return (
    <AuthLayout>
      <GlassCard style={{ padding: "32px 28px", animation: "slide-in-section 0.6s ease 0.1s both" }}>

        {/* Header Navigation Bar with Back Arrow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((prev) => Math.max(0, prev - 1));
            }}
            aria-label="رجوع للخلف"
            style={{
              padding: "6px 14px",
              border: "none",
              color: "#334155",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: "700",
              fontFamily: "var(--font-heading)",
              transition: "all 0.2s ease",
              backgroundColor: "transparent"
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.2rem" }}></i>
          </button>

          <span style={{
            fontSize: "0.82rem",
            fontWeight: "700",
            color: "#64748b",
            background: "#f8fafc",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            fontFamily: "var(--font-heading)"
          }}>
            الخطوة {step} من 5
          </span>
        </div>

        {/* Step Title Header */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "1.35rem",
            fontWeight: "800",
            color: "#0f172a",
            fontFamily: "Hagrid",
            fontWidth: "800",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {current.headerTitle}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontFamily: "var(--font-heading)" }}>
            {current.subTitle}
          </p>
        </div>

        {/* 5-Step Progress Indicator */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px", alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                height: "5px",
                flex: 1,
                borderRadius: "3px",
                background: step >= s ? current.gradient : "#e2e8f0",
                transition: "all 0.5s ease",
                boxShadow: step >= s ? "0 0 8px rgba(108,99,255,0.25)" : "none",
              }}
            />
          ))}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "10px 14px", color: "#dc2626", marginBottom: "18px", fontSize: "0.85rem", textAlign: "center", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", animation: "slide-in-section 0.3s ease" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Global Success Banner */}
        {success && (
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "14px", padding: "16px", color: "#059669", marginBottom: "20px", textAlign: "center", fontSize: "1rem", fontWeight: "700", animation: "pop-in 0.5s ease" }}>
            🎉 تم إنشاء حسابك بنجاح! جاري التحويل...
          </div>
        )}

        {!success && (
          <form onSubmit={
            step === 5 ? handleFinalSubmit :
              step === 3 ? handleStep3Submit :
                (e) => { e.preventDefault(); setError(""); setStep(step + 1); }
          }>

            {/* ── STEP 1: عرفنا بنفسك؟ ── */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "slide-in-section 0.4s ease", fontFamily: "var(--font-display)" }}>

                {/* First Name & Last Name (Side by side) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* First Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="firstName">{fieldLabel("bx bx-user", "الاسم الأول")}</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => updateData("firstName", e.target.value)}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="أحمد"
                      style={fieldInputStyle("firstName", !!fieldErrors.firstName)}
                    />
                    {fieldErrors.firstName && <div style={{ color: "#dc2626", fontSize: "0.78rem" }}>⚠ {fieldErrors.firstName}</div>}
                  </div>

                  {/* Last Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="lastName">{fieldLabel("bx bx-user", "الاسم الأخير")}</label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => updateData("lastName", e.target.value)}
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="محمود"
                      style={fieldInputStyle("lastName", !!fieldErrors.lastName)}
                    />
                    {fieldErrors.lastName && <div style={{ color: "#dc2626", fontSize: "0.78rem" }}>⚠ {fieldErrors.lastName}</div>}
                  </div>
                </div>

                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="username">{fieldLabel("bx bx-at", "اسم المستخدم")}</label>
                  <input
                    id="username"
                    type="text"
                    required
                    minLength={3}
                    value={formData.username}
                    onChange={(e) => updateData("username", e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="ahmed_mahmoud"
                    style={{ ...fieldInputStyle("username", !!fieldErrors.username), textAlign: "left", direction: "ltr" }}
                  />
                  {fieldErrors.username && <div style={{ color: "#dc2626", fontSize: "0.78rem" }}>⚠ {fieldErrors.username}</div>}
                  {suggestions.length > 0 && !fieldErrors.username && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", alignSelf: "center" }}>مقترحات:</span>
                      {suggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => updateData("username", s)} style={{ fontSize: "0.75rem", background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.25)", borderRadius: "20px", padding: "3px 10px", color: "#6c63ff", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "monospace", fontWeight: "600" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="signupEmail">{fieldLabel("bx bx-envelope", "البريد الإلكتروني")}</label>
                  <input
                    id="signupEmail"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateData("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="example@email.com"
                    style={{ ...fieldInputStyle("email", !!fieldErrors.email), textAlign: "left", direction: "ltr" }}
                  />
                  {fieldErrors.email && <div style={{ color: "#dc2626", fontSize: "0.78rem" }}>⚠ {fieldErrors.email}</div>}
                </div>

                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  style={{
                    marginTop: "8px",
                    padding: "12px 26px",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    borderRadius: "50px",
                    border: "none",
                    background: isStep1Valid ? "var(--ios-blue)" : "#e2e8f0",
                    color: isStep1Valid ? "#ffffff" : "#94a3b8",
                    cursor: isStep1Valid ? "pointer" : "not-allowed",
                    opacity: isStep1Valid ? 1 : 0.65,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.25s ease",
                    fontFamily: "Hagrid",
                  }}
                >
                  التالي
                </button>
              </div>
            )}

            {/* ── STEP 2: إيه هو رقم تليفونك؟ ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "slide-in-section 0.4s ease" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="phone">{fieldLabel("bx bx-phone", "رقم الهاتف")}</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span style={{ position: "absolute", left: "14px", fontSize: "0.85rem", color: "#475569", fontWeight: "700", pointerEvents: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ height: "16px", width: "1px", background: "#cbd5e1", display: "inline-block" }} />
                      +20
                      <Image
                        src="/images/profile/flag-egypt.png"
                        alt="phone"
                        width={20}
                        height={20}
                      />
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => updateData("phone", e.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="1xxxxxxxxx"
                      style={{ ...fieldInputStyle("phone", !!fieldErrors.phone), textAlign: "left", direction: "ltr", paddingLeft: "90px" }}
                    />
                  </div>
                  {fieldErrors.phone && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "-4px" }}>⚠ {fieldErrors.phone}</div>}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    disabled={!isStep2Valid}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "50px",
                      border: "none",
                      background: isStep2Valid ? "var(--ios-blue)" : "#e2e8f0", color: isStep2Valid ? "#ffffff" : "#94a3b8", cursor: isStep2Valid ? "pointer" : "not-allowed", opacity: isStep2Valid ? 1 : 0.65, fontWeight: "800", fontFamily: "Hagrid", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: منين وعندك كام سنه؟ ── */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "slide-in-section 0.4s ease" }}>

                {/* Date of Birth & Gender in 2 columns */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* DOB */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="dob">{fieldLabel("bx bx-calendar", "تاريخ الميلاد")}</label>
                    <input id="dob" type="date" required max={maxDobDateStr} lang="en-US" value={formData.dob} onChange={(e) => updateData("dob", e.target.value)} onFocus={() => setFocusedField("dob")} onBlur={() => setFocusedField(null)} className="date-field-input" style={{ ...fieldInputStyle("dob"), direction: "ltr" }} />
                  </div>

                  {/* Gender */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="gender">{fieldLabel("bx bx-male-female", "الجنس")}</label>
                    <select id="gender" required value={formData.gender} onChange={(e) => updateData("gender", e.target.value)} style={selectStyle("gender")}>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                </div>

                {/* Governorate */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="governorate">{fieldLabel("bx bx-map", "المحافظة")}</label>
                  <select id="governorate" required value={formData.governorate} onChange={(e) => { updateData("governorate", e.target.value); updateData("city", ""); }} style={selectStyle("gov")}>
                    <option value="" disabled>اختر المحافظة...</option>
                    {governoratesList.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* City */}
                {formData.governorate && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="city">{fieldLabel("bx bx-buildings", "المدينة")}</label>
                    <select id="city" required value={formData.city} onChange={(e) => updateData("city", e.target.value)} style={selectStyle("city")}>
                      <option value="" disabled>اختر المدينة...</option>
                      {egyptLocations[formData.governorate].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    disabled={loading || !isStep3Valid}
                    style={{ flex: 1, padding: "12px", borderRadius: "50px", border: "none", background: isStep3Valid && !loading ? "var(--ios-blue)" : "#e2e8f0", color: isStep3Valid && !loading ? "#ffffff" : "#94a3b8", cursor: isStep3Valid && !loading ? "pointer" : "not-allowed", opacity: isStep3Valid && !loading ? 1 : 0.65, fontWeight: "800", fontFamily: "Hagrid", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: isStep3Valid && !loading ? "0 4px 14px rgba(0,0,0,0.15)" : "none" }}
                  >
                    {loading ? <><div className="spinner" style={{ width: "18px", height: "18px" }} /> جاري التحقق...</> : <>التالي</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: الصورة الشخصية ── */}
            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "slide-in-section 0.4s ease" }}>

                {/* File Upload */}
                <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px", border: "2px dashed rgba(108,99,255,0.4)", borderRadius: "18px", background: "rgba(108,99,255,0.03)", transition: "all 0.3s ease" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                  <span style={{ color: "#6c63ff", fontWeight: "700", fontSize: "0.88rem" }}>{loading ? "جاري الرفع..." : "ارفع صورة / التقط بكاميرا الهاتف"}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} disabled={loading} />
                </label>

                {/* Preview */}
                {formData.avatarUrl && (
                  <div style={{ textAlign: "center", animation: "pop-in 0.4s ease" }}>
                    <img src={formData.avatarUrl} alt="preview" style={{ width: "84px", height: "84px", borderRadius: "50%", objectFit: "cover", border: "3px solid #6c63ff", boxShadow: "0 0 20px rgba(108,99,255,0.2)" }} />
                  </div>
                )}

                {/* Avatar grid */}
                <div>
                  <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: "10px", fontWeight: "600" }}>أو اختر أفاتار جاهز:</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                    {avatars.map((url, i) => (
                      <div key={i} onClick={() => updateData("avatarUrl", url)} style={{ border: formData.avatarUrl === url ? "3px solid #6c63ff" : "3px solid transparent", borderRadius: "50%", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", opacity: formData.avatarUrl && formData.avatarUrl !== url ? 0.45 : 1, boxShadow: formData.avatarUrl === url ? "0 0 16px rgba(108,99,255,0.3)" : "none" }}>
                        <img src={url} alt={`Avatar ${i}`} style={{ width: "100%", height: "auto", display: "block", aspectRatio: "1" }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: "50px", border: "none", background: "var(--ios-blue)", color: "#fff", cursor: "pointer", fontWeight: "800", fontFamily: "Hagrid", fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: حماية الحساب ── */}
            {step === 5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "slide-in-section 0.4s ease" }}>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="signupPassword">{fieldLabel("bx bx-lock-alt", "كلمة المرور")}</label>
                  <div style={{ position: "relative" }}>
                    <input id="signupPassword" type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => updateData("password", e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="••••••••" style={{ ...fieldInputStyle("password"), textAlign: "left", direction: "ltr", paddingRight: "44px" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "1.15rem", display: "flex", alignItems: "center", padding: "2px" }}>
                      {showPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="confirmPassword">{fieldLabel("bx bx-check-shield", "تأكيد كلمة المرور")}</label>
                  <div style={{ position: "relative" }}>
                    <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={(e) => updateData("confirmPassword", e.target.value)} onFocus={() => setFocusedField("confirmPassword")} onBlur={() => setFocusedField(null)} placeholder="••••••••" style={{ ...fieldInputStyle("confirmPassword"), textAlign: "left", direction: "ltr", paddingRight: "44px" }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "1.15rem", display: "flex", alignItems: "center", padding: "2px" }}>
                      {showConfirmPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
                    </button>
                  </div>
                </div>

                {/* Rules */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem" }}>
                  {[
                    { ok: pwdRules.length, label: "من 8 إلى 32 حرف" },
                    { ok: pwdRules.upper, label: "حرف كبير (A-Z)" },
                    { ok: pwdRules.lower, label: "حرف صغير (a-z)" },
                    { ok: pwdRules.number, label: "رقم (0-9)" },
                    { ok: pwdRules.special, label: "رمز خاص (@$!...)" },
                    { ok: pwdRules.match, label: "كلمتا المرور متطابقتان" },
                  ].map(({ ok, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", color: ok ? "#059669" : "#64748b", transition: "color 0.3s ease" }}>
                      <span style={{ fontSize: "0.85rem" }}>{ok ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle"></i>}</span> {label}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                  <button type="submit" disabled={loading || !isPasswordValid} style={{ flex: 1, padding: "12px", borderRadius: "50px", border: "none", background: isPasswordValid && !loading ? "var(--ios-blue)" : "#e2e8f0", color: isPasswordValid && !loading ? "#fff" : "#94a3b8", cursor: loading || !isPasswordValid ? "not-allowed" : "pointer", opacity: loading || !isPasswordValid ? 0.65 : 1, fontWeight: "800", fontFamily: "Hagrid", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s ease" }}>
                    {loading ? <><div className="spinner" style={{ width: "18px", height: "18px" }} /> جاري الإنشاء...</> : <>إنشاء الحساب</>}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </GlassCard>

      <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.8rem", marginTop: "12px", animation: "fade-in 0.8s ease 0.5s both" }}>
        بالتسجيل أنت توافق على{" "}
        <Link href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#6c63ff", fontWeight: "600", cursor: "pointer" }}>الشروط والأحكام</Link>
        {" "}و{" "}
        <Link href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#6c63ff", fontWeight: "600", cursor: "pointer" }}>سياسة الخصوصية</Link>
      </p>

      {/* Modal confirmation for Date of Birth */}
      {showDobConfirmModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", animation: "fade-in 0.2s ease"
        }}>
          <div style={{
            maxWidth: "420px", width: "100%", padding: "28px", borderRadius: "24px",
            border: "1px solid #fed7aa", background: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)", textAlign: "center", animation: "slide-up 0.3s ease"
          }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 16px" }}>
              ⚠️
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px", fontFamily: "var(--font-heading)" }}>
              تأكيد تاريخ الميلاد
            </h3>

            <p style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.6, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
              تاريخ الميلاد المدخل هو: <strong style={{ color: "#0f172a", direction: "ltr", display: "inline-block" }}>{formData.dob}</strong>
              <br />
              <span style={{ fontSize: "0.85rem", color: "#6c63ff", fontWeight: "700", marginTop: "4px", display: "block" }}>
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

            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "14px", padding: "12px 14px", color: "#e11d48", fontSize: "0.83rem", lineHeight: 1.5, marginBottom: "24px", textAlign: "right", fontFamily: "var(--font-heading)" }}>
              🛑 <strong>تنبيه هام:</strong> لن تتمكن من تغيير تاريخ الميلاد لاحقاً بعد إتمام التسجيل.
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => setShowDobConfirmModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "50px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: "700", cursor: "pointer", fontFamily: "var(--font-heading)" }}>
                تعديل التاريخ
              </button>
              <button type="button" onClick={() => { setShowDobConfirmModal(false); setStep(4); }} style={{ flex: 1, padding: "10px", borderRadius: "50px", border: "none", background: "#000", color: "#fff", fontWeight: "700", cursor: "pointer", fontFamily: "var(--font-heading)" }}>
                عمري {(() => {
                  const dobDate = new Date(formData.dob);
                  const today = new Date();
                  let age = today.getFullYear() - dobDate.getFullYear();
                  const m = today.getMonth() - dobDate.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
                  return age;
                })()} عام
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
