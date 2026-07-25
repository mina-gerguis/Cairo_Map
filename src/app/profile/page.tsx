"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

const AVAILABLE_INTERESTS = [
  { id: "restaurants", label: "مطاعم", icon: "bx bx-restaurant" },
  { id: "drinks", label: "مشروبات", icon: "bx bx-coffee" },
  { id: "family", label: "اماكن عائلية", icon: "bx bx-home-heart" },
  { id: "kids", label: "اماكن للأطفال", icon: "bx bx-child" },
  { id: "hotels_aqua", label: "فنادق واكوا بارك", icon: "bx bx-building-house" },
  { id: "activities", label: "أنشطة وترفيه", icon: "bx bx-party" },
  { id: "offers", label: "اقوي العروض", icon: "bx bxs-discount" },
  { id: "cinema", label: "السينما", icon: "bx bx-camera-movie" },
  { id: "medical", label: "خدمات طبية", icon: "bx bx-plus-medical" },
  { id: "health_beauty", label: "الصحة والجمال", icon: "bx bx-spa" },
  { id: "parks", label: "الحدائق", icon: "bx bx-tree" }
];

/* ─── صفحة الملف الشخصي والإعدادات (Profile Page Component) ─── */
export default function ProfilePage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteAll } = useNotifications();
  
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [selectedFavCategory, setSelectedFavCategory] = useState<string>("الكل");

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    email: "", // Added email to editable fields
    governorate: "",
    city: "",
    dob: "",
    interests: [] as string[],
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const deleteString = `أريد حذف حسابي أنا ${profile?.full_name}`;

  // 2FA State
  const [activeMfaFactors, setActiveMfaFactors] = useState({ totp: false, email: false, whatsapp: false });
  const activeCount = Object.values(activeMfaFactors).filter(Boolean).length;
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [mfaStep, setMfaStep] = useState<"selection" | "enroll" | "unenroll_confirm">("selection");
  const [mfaPasswordConfirm, setMfaPasswordConfirm] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");

  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[index] = value.slice(-1);
    setCodeDigits(newDigits);
    setVerificationCode(newDigits.join(''));
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
      setVerificationCode(newDigits.join(''));
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Folding sections
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  // Help Section: Tabs
  const [helpTab, setHelpTab] = useState<"faq" | "social" | "contact">("faq");

  // FAQ State
  const [faqs, setFaqs] = useState<any[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    governorate: "",
    city: "",
    contactType: "",
    message: ""
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
      const initial = saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      setTheme(initial);
      document.body.style.setProperty("background-color", initial === "light" ? "#ededed" : "var(--bg-primary)", "important");

      const handleThemeChange = (e: any) => {
        setTheme(e.detail);
        document.body.style.setProperty("background-color", e.detail === "light" ? "#ededed" : "var(--bg-primary)", "important");
      };
      window.addEventListener("themechange", handleThemeChange);
      return () => {
        window.removeEventListener("themechange", handleThemeChange);
        document.body.style.removeProperty("background-color");
      };
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Don't redirect - show guest view
      setLoading(false);
      return;
    }
    
    fetchProfileData();
    fetchFAQs();
    fetchMfaStatus();

    // Check for parameter to expand help
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expand") === "help") {
        setIsHelpExpanded(true);
      }
    }
  }, [user, authLoading]);

  const fetchFAQs = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) {
      setFaqs(data);
    }
  };

  const fetchMfaStatus = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data?.totp?.[0];
      setActiveMfaFactors(prev => ({
        ...prev,
        totp: totpFactor && totpFactor.status === "verified" ? true : false
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !faqQuestion.trim() || !faqAnswer.trim()) return;
    setFaqLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert([{ question: faqQuestion.trim(), answer: faqAnswer.trim() }])
        .select();
      if (error) throw error;
      if (data) {
        setFaqs([...faqs, data[0]]);
        setFaqQuestion("");
        setFaqAnswer("");
      }
    } catch (err: any) {
      alert("فشل إضافة السؤال الشائع: " + err.message);
    } finally {
      setFaqLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال الشائع؟")) return;
    if (!supabase) return;
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    // Simulate sending email
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
    }, 1500);
  };

  const fetchProfileData = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile({ ...profileData, email: user.email }); // Combine with auth email
      setFormData({
        fullName: profileData.full_name || "",
        username: profileData.username || "",
        phone: profileData.phone?.replace('+20', '') || "", // Strip +20 for editing
        email: user.email || "",
        governorate: profileData.governorate || "",
        city: profileData.city || "",
        dob: profileData.dob || "",
        interests: profileData.interests || [],
      });
    }

    // Fetch favorites
    const { data: favs } = await supabase
      .from('favorite_places')
      .select('place_id')
      .eq('user_id', user.id);

    if (favs && favs.length > 0) {
      const placeIds = favs.map((f: any) => f.place_id);
      const { data: favPlaces } = await supabase
        .from('places')
        .select('*')
        .in('id', placeIds);
      
      if (favPlaces) {
        const mappedFavs = favPlaces.map(dbPlace => ({
          id: dbPlace.id,
          name: dbPlace.name,
          category: dbPlace.category,
          categoryLabel: dbPlace.category_label,
          briefLocation: dbPlace.brief_location,
          fullAddress: dbPlace.full_address,
          phones: dbPlace.phones || [],
          googleMapsUrl: dbPlace.google_maps_url || "",
          images: dbPlace.images || [],
          menuImages: dbPlace.menu_images || [],
          workingHours: dbPlace.working_hours || "",
          rating: dbPlace.rating || 0,
          description: dbPlace.description || "",
          latitude: dbPlace.latitude || undefined,
          longitude: dbPlace.longitude || undefined,
        }));
        setFavorites(mappedFavs);
      }
    } else {
      setFavorites([]);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!supabase || !user || !profile) return;
    setSaving(true);
    setMessage(null);

    // Validate 30 days username change
    const now = new Date();
    const lastChange = profile.last_username_change ? new Date(profile.last_username_change) : null;
    let isUsernameChanged = formData.username !== profile.username;

    if (isUsernameChanged) {
      if (lastChange) {
        const daysSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 3600 * 24);
        if (daysSinceChange < 30) {
          setMessage({ type: 'error', text: `لا يمكنك تغيير اسم المستخدم إلا مرة واحدة كل 30 يوم. متبقي ${Math.ceil(30 - daysSinceChange)} يوم.` });
          setSaving(false);
          return;
        }
      }

      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', formData.username)
        .neq('id', user.id);
      
      if (existing && existing.length > 0) {
        setMessage({ type: 'error', text: "اسم المستخدم هذا مأخوذ مسبقاً." });
        setSaving(false);
        return;
      }
    }

    // Check phone uniqueness if changed
    const newPhone = `+20${formData.phone}`;
    if (newPhone !== profile.phone) {
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', newPhone)
        .neq('id', user.id);
      if (existingPhone && existingPhone.length > 0) {
        setMessage({ type: 'error', text: "رقم الهاتف هذا مسجل لحساب آخر." });
        setSaving(false);
        return;
      }
    }

    // Update Email in Auth if changed
    let emailChanged = false;
    if (formData.email !== profile.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
      if (emailError) {
        setMessage({ type: 'error', text: "حدث خطأ أثناء طلب تغيير البريد. قد يكون مسجلاً مسبقاً." });
        setSaving(false);
        return;
      }
      emailChanged = true;
    }

    // Update Profile
    const updatePayload: any = {
      full_name: formData.fullName,
      phone: newPhone,
      governorate: formData.governorate,
      city: formData.city,
      dob: formData.dob || null,
      interests: formData.interests,
    };

    if (isUsernameChanged) {
      updatePayload.username = formData.username;
      updatePayload.last_username_change = now.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: "حدث خطأ أثناء حفظ البيانات." });
    } else {
      setMessage({ 
        type: 'success', 
        text: emailChanged 
          ? "تم حفظ البيانات. راجع بريدك الإلكتروني لتأكيد العنوان الجديد." 
          : "تم تحديث البيانات بنجاح!" 
      });
      setEditMode(false);
      fetchProfileData(); // Refresh data
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;
    if (deleteConfirmation !== deleteString) {
      setMessage({ type: 'error', text: "عبارة التأكيد غير متطابقة." });
      return;
    }
    setLoading(true);
    // Call RPC to delete user
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      setMessage({ type: 'error', text: "فشل حذف الحساب. يرجى المحاولة لاحقاً." });
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleChangePassword = async () => {
    if (!supabase) return;
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: "كلمة المرور غير متطابقة" });
      return;
    }
    if (passwordForm.new.length < 6) {
      setMessage({ type: 'error', text: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      setMessage({ type: 'error', text: "حدث خطأ أثناء تغيير كلمة المرور" });
    } else {
      setMessage({ type: 'success', text: "تم تغيير كلمة المرور بنجاح" });
      setShowPasswordModal(false);
      setPasswordForm({ new: "", confirm: "" });
    }
    setPasswordLoading(false);
  };

  const handleEnrollTOTP = async () => {
    if (!supabase) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setMfaSecret(data.totp.secret);
      setCodeDigits(Array(6).fill(""));
      setVerificationCode("");
      setMfaStep("enroll");
    } catch (err: any) {
      setMfaError(err.message || "حدث خطأ أثناء البدء بتفعيل المصادقة");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!supabase || !verificationCode || !factorId) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verificationCode
      });
      if (verify.error) throw verify.error;
      
      setActiveMfaFactors(prev => ({ ...prev, totp: true }));
      setShow2FAModal(false);
      setMfaStep("selection");
      setVerificationCode("");
      setMfaError("");
      setMessage({ type: 'success', text: "تم تفعيل المصادقة الثنائية بنجاح!" });
    } catch (err: any) {
      setMfaError("الكود غير صحيح أو انتهت صلاحيته. تأكد من التطبيق وحاول مجدداً.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleUnenrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMfaStep("unenroll_confirm");
    setMfaError("");
    setVerificationCode("");
    setCodeDigits(Array(6).fill(""));
    setMfaPasswordConfirm("");
  };

  const handleUnenrollTOTP = async () => {
    if (!supabase || !profile) return;
    if (verificationCode.length !== 6 || !mfaPasswordConfirm) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      // 1. Verify password using a temporary client
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        { auth: { persistSession: false } }
      );

      const { error: signInError } = await tempSupabase.auth.signInWithPassword({
        email: profile.email,
        password: mfaPasswordConfirm,
      });

      if (signInError) throw new Error("كلمة المرور غير صحيحة");

      // 2. Setup TOTP unenroll
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data.totp?.[0];
      if (!totpFactor) throw new Error("لا يوجد عامل مصادقة مفعل");

      // 1. Challenge the factor
      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challenge.error) throw challenge.error;

      // 2. Verify with the code to upgrade session to AAL2
      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: verificationCode
      });
      if (verify.error) throw new Error("الكود غير صحيح");

      // 5. Unenroll now that session is verified AAL2
      const unenroll = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
      if (unenroll.error) throw unenroll.error;

      setActiveMfaFactors(prev => ({ ...prev, totp: false }));
      setMfaStep("selection");
      setVerificationCode("");
      setMfaPasswordConfirm("");
      setMessage({ type: 'success', text: "تم تعطيل المصادقة عبر التطبيق بنجاح" });
    } catch (err: any) {
      setMfaError(err.message === "الكود غير صحيح" ? "الكود غير صحيح أو انتهت صلاحيته" : (err.message || "حدث خطأ أثناء إلغاء التفعيل"));
    } finally {
      setMfaLoading(false);
    }
  };

  if (loading || authLoading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>جاري تحميل الملف الشخصي...</div>;
  }

  const pwdRules = {
    length: passwordForm.new.length >= 8 && passwordForm.new.length <= 32,
    upper: /[A-Z]/.test(passwordForm.new),
    lower: /[a-z]/.test(passwordForm.new),
    number: /[0-9]/.test(passwordForm.new),
    special: /[@$!%*?&#^]/.test(passwordForm.new),
    match: passwordForm.new === passwordForm.confirm && passwordForm.new !== "",
  };
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      {/* ─── 1. PROFILE RECTANGLE CARD ─── */}
      <div 
        className="glass-panel" 
        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: isProfileExpanded ? "1px solid var(--accent-ios)" : "1px solid var(--border-glass)"
        }}
      >
        {!user ? (
          /* ── Guest: Login Prompt ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "10px 0" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border-glass-bright)" }}>
              <i className="bx bx-user" style={{ fontSize: "2rem", color: "var(--text-muted)" }}></i>
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>أهلاً بك!</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>سجل دخولك للوصول إلى ملفك الشخصي وكل مزايا التطبيق</p>
            </div>
            <Link href="/login" className="ios-btn ios-btn-primary" style={{ width: "100%", textDecoration: "none", justifyContent: "center" }}>
              <i className="bx bx-log-in" style={{ fontSize: "1.2rem" }}></i> تسجيل الدخول
            </Link>
            <Link href="/signup" style={{ color: "var(--accent-ios)", fontSize: "0.85rem", textDecoration: "none" }}>ليس لديك حساب؟ إنشاء حساب جديد</Link>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-ios)" }} />
              ) : (
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--accent-ios)" }}>
                  <i className="bx bxs-user" style={{ fontSize: "1.8rem", color: "var(--text-secondary)" }}></i>
                </div>
              )}
              <div style={{ textAlign: "right" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>{profile?.full_name}</h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>{profile?.email}</p>
              </div>
            </div>
            <i className={`bx ${isProfileExpanded ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
          </div>
        )}

        {/* Expanded Profile Info / Form */}
        {user && isProfileExpanded && (
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
            {message && (
              <div style={{ background: message.type === 'error' ? "rgba(255, 59, 48, 0.15)" : "rgba(52, 199, 89, 0.15)", border: `1px solid ${message.type === 'error' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(52, 199, 89, 0.3)'}`, padding: "12px", borderRadius: "var(--radius-sm)", color: message.type === 'error' ? "#ff3b30" : "#34c759", marginBottom: "20px", fontSize: "0.85rem", textAlign: "center" }}>
                {message.text}
              </div>
            )}

            {editMode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="help-label">الاسم بالكامل</label>
                  <input type="text" className="ios-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="help-label">اسم المستخدم (مرة كل 30 يوم)</label>
                  <input type="text" className="ios-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} style={{ textAlign: "left", direction: "ltr" }} />
                </div>
                <div>
                  <label className="help-label">البريد الإلكتروني (يتطلب تأكيد)</label>
                  <input type="email" className="ios-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ textAlign: "left", direction: "ltr" }} />
                </div>
                <div>
                  <label className="help-label">تاريخ الميلاد</label>
                  <input type="date" className="ios-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} style={{ textAlign: "left", direction: "ltr" }} />
                </div>
                <div>
                  <label className="help-label">رقم الهاتف (بدون صفر البداية)</label>
                  <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                    <div style={{ position: "absolute", left: "12px", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", zIndex: 1, direction: "ltr" }}>
                      <span>🇪🇬</span>
                      <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>+20</span>
                      <span style={{ height: "20px", width: "1px", background: "var(--border-glass-bright)", margin: "0 4px" }} />
                    </div>
                    <input type="tel" className="ios-input" value={formData.phone} onChange={e => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                      if (numbersOnly.length <= 10) setFormData({...formData, phone: numbersOnly});
                    }} style={{ textAlign: "left", direction: "ltr", paddingLeft: "85px" }} />
                  </div>
                </div>
                <div>
                  <label className="help-label">المحافظة</label>
                  <select className="ios-input help-select" value={formData.governorate} onChange={(e) => setFormData({...formData, governorate: e.target.value, city: ""})}>
                    {governoratesList.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                  </select>
                </div>
                {formData.governorate && (
                  <div>
                    <label className="help-label">المدينة</label>
                    <select className="ios-input help-select" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                      <option value="" disabled>اختر المدينة...</option>
                      {egyptLocations[formData.governorate]?.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                
                {/* Interests Selection */}
                <div style={{ marginTop: "8px" }}>
                  <label className="help-label">اهتماماتي (يمكنك اختيار أكثر من خيار)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {AVAILABLE_INTERESTS.map(interest => {
                      const isSelected = formData.interests.includes(interest.id);
                      return (
                        <button 
                          key={interest.id}
                          className={`category-pill ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({ ...formData, interests: formData.interests.filter(id => id !== interest.id) });
                            } else {
                              setFormData({ ...formData, interests: [...formData.interests, interest.id] });
                            }
                          }}
                          style={{ fontSize: "0.85rem", padding: "6px 12px", cursor: "pointer" }}
                        >
                          <i className={interest.icon} style={{ fontSize: "1.1rem" }} /> {interest.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button className="ios-btn" onClick={() => setEditMode(false)} style={{ flex: 1 }}>إلغاء</button>
                  <button className="ios-btn ios-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>اسم المستخدم</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>@{profile?.username}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>رقم الهاتف</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }} dir="ltr">{profile?.phone}</span>
                </div>
                {profile?.dob && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>تاريخ الميلاد</span>
                    <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile.dob}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>الجنس</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.gender}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>المنطقة</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.city}، {profile?.governorate}</span>
                </div>
                
                {/* Interests Display */}
                <div style={{ marginTop: "4px", borderTop: "1px solid var(--border-glass)", paddingTop: "12px" }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px", fontWeight: "600" }}>اهتماماتي</div>
                  {profile?.interests && profile.interests.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {profile.interests.map((intId: string) => {
                        const interest = AVAILABLE_INTERESTS.find(i => i.id === intId);
                        if (!interest) return null;
                        return (
                          <div key={intId} className="category-pill active" style={{ fontSize: "0.85rem", padding: "6px 12px", pointerEvents: "none" }}>
                            <i className={interest.icon} style={{ fontSize: "1.1rem" }} /> {interest.label}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ background: "var(--bg-glass-card)", padding: "16px", borderRadius: "12px", textAlign: "center", border: "1px dashed var(--border-glass)" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.6" }}>
                        قم بإضافة اهتماماتك الآن لنتمكن من إرسال أقوى العروض والإشعارات التي تناسبك خصيصاً!
                      </p>
                      <button className="ios-btn" onClick={(e) => { e.stopPropagation(); setEditMode(true); }} style={{ padding: "6px 16px", fontSize: "0.85rem", margin: "0 auto" }}>
                        أضف الآن
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button className="ios-btn ios-btn-primary" onClick={() => setEditMode(true)} style={{ flex: 1 }}>
                    تعديل البيانات
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── القسم الثاني: مظهر التطبيق (Dark / Light Mode) ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>العامة</div>
      <div 
        className="glass-panel" 
        onClick={toggleTheme}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
            <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
              {theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              {theme === "dark" ? "الموقع حالياً بالوضع الداكن" : "الموقع حالياً بالوضع الفاتح"}
            </p>
          </div>
        </div>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
      </div>

      {/* Favorite Places Card */}
      <div 
        className="glass-panel" 
        onClick={() => router.push('/favorites')}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255, 59, 48, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff3b30" }}>
            <i className="bx bxs-heart" style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>الأماكن المفضلة</h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              عرض وتعديل قائمة أماكنك المفضلة
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {favorites.length > 0 && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", background: "var(--bg-glass-card)", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>
              {favorites.length}
            </span>
          )}
          <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>
      </div>

      {/* Notifications Card */}
      <div 
        className="glass-panel" 
        onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          flexDirection: "column",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid var(--border-glass)",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bxs-bell" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>الإشعارات</h3>
              <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                عرض جميع الإشعارات الواردة
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadCount > 0 && (
              <span style={{ 
                fontSize: "0.75rem", 
                color: "#fff", 
                background: "#ff3b30", 
                padding: "4px 8px", 
                borderRadius: "12px", 
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(255, 59, 48, 0.4)"
              }}>
                {unreadCount > 99 ? '99+' : unreadCount} جديد
              </span>
            )}
            <i className={`bx bx-chevron-${isNotificationsExpanded ? "down" : "left"}`} style={{ fontSize: "1.5rem", color: "var(--text-secondary)", transition: "transform 0.3s" }}></i>
          </div>
        </div>

        {/* Notifications Expanded Section */}
        {isNotificationsExpanded && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-glass)", animation: "fade-in 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>سجل الإشعارات</h4>
              <div style={{ display: "flex", gap: "8px" }}>
                {unreadCount > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="ios-btn" style={{ padding: "6px 12px", fontSize: "0.8rem", height: "auto" }}>
                    جعل الكل مقروء
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); deleteAll(); }} className="ios-btn" style={{ padding: "6px 12px", fontSize: "0.8rem", height: "auto", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.3)" }}>
                    حذف الكل
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                <i className="bx bx-bell-off" style={{ fontSize: "2.5rem", marginBottom: "8px", opacity: 0.5 }}></i>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                {notifications.map(notif => (
                  <div key={notif.id} onClick={(e) => { e.stopPropagation(); if(!notif.is_read) markAsRead(notif.id); setSelectedNotification(notif); }} style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background: notif.is_read ? "rgba(255,255,255,0.02)" : "rgba(108, 99, 255, 0.08)",
                    border: notif.is_read ? "1px solid transparent" : "1px solid rgba(108, 99, 255, 0.2)",
                    cursor: "pointer",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    transition: "background 0.2s"
                  }}>
                    <div style={{ fontSize: "1.5rem", marginTop: "2px" }}>
                      {notif.type === "success" ? "✅" : notif.type === "warning" ? "⚠️" : "🔔"}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <h5 style={{ margin: "0 0 4px", fontSize: "0.95rem", color: notif.is_read ? "var(--text-secondary)" : "var(--text-primary)" }}>{notif.title}</h5>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "0.85rem", 
                        color: "var(--text-muted)", 
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>{notif.message}</p>
                      <span style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "var(--text-muted)", opacity: 0.7 }}>
                        {new Date(notif.created_at).toLocaleDateString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {!notif.is_read && (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff3b30", marginTop: "8px" }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── القسم الثالث: إعدادات الأمان والمصادقة الثنائية (خوص للمسجلين) ─── */}
      {user && (
      <>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>الأمان</div>
      
      <div 
        className="glass-panel" 
        onClick={() => setShowPasswordModal(true)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "12px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
            <i className="bx bx-lock-alt" style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>تغيير كلمة المرور</h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>تحديث كلمة المرور الخاصة بحسابك</p>
          </div>
        </div>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
      </div>

      <div 
        className="glass-panel" 
        onClick={() => setShow2FAModal(true)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: activeCount > 0 ? "1px solid rgba(52, 199, 89, 0.4)" : "1px solid var(--border-glass)",
          background: activeCount > 0 ? "rgba(52, 199, 89, 0.05)" : "var(--glass-bg)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: activeCount > 0 ? "rgba(52, 199, 89, 0.2)" : "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", color: activeCount > 0 ? "#34c759" : "var(--text-secondary)" }}>
            <i className="bx bx-shield-check" style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
              المصادقة الثنائية ({activeCount} من 3)
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              إضافة طبقات حماية إضافية لحسابك
            </p>
          </div>
        </div>
        {activeCount > 0 ? (
          <i className="bx bxs-check-circle" style={{ fontSize: "1.5rem", color: "#34c759" }}></i>
        ) : (
          <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        )}
      </div>

      </>
      )}

      {/* ─── القسم الرابع: الدعم والروابط الهامة (Support & Links) ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>المساعدة</div>
      <div 
        className="glass-panel" 
        onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: isHelpExpanded ? "1px solid var(--accent-ios)" : "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bx-help-circle" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>التواصل والمساعدة</h3>
          </div>
          <i className={`bx ${isHelpExpanded ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>

        {/* Expanded Help Center (Tabs) */}
        {isHelpExpanded && (
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
            {/* Tabs Selector */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "12px", marginBottom: "20px" }}>
              <button 
                onClick={() => setHelpTab("faq")} 
                style={{ 
                  flex: 1, padding: "8px", border: "none", borderRadius: "10px", 
                  background: helpTab === "faq" ? "var(--accent-ios)" : "transparent",
                  color: helpTab === "faq" ? "#fff" : "var(--text-secondary)",
                  fontWeight: "600", fontSize: "0.88rem", cursor: "pointer"
                }}
              >
                الأسئلة الشائعة
              </button>
              <button 
                onClick={() => setHelpTab("social")} 
                style={{ 
                  flex: 1, padding: "8px", border: "none", borderRadius: "10px", 
                  background: helpTab === "social" ? "var(--accent-ios)" : "transparent",
                  color: helpTab === "social" ? "#fff" : "var(--text-secondary)",
                  fontWeight: "600", fontSize: "0.88rem", cursor: "pointer"
                }}
              >
                مواقع التواصل
              </button>
              <button 
                onClick={() => setHelpTab("contact")} 
                style={{ 
                  flex: 1, padding: "8px", border: "none", borderRadius: "10px", 
                  background: helpTab === "contact" ? "var(--accent-ios)" : "transparent",
                  color: helpTab === "contact" ? "#fff" : "var(--text-secondary)",
                  fontWeight: "600", fontSize: "0.88rem", cursor: "pointer"
                }}
              >
                مراسلتنا
              </button>
            </div>

            {/* TAB CONTENT 1: FAQ */}
            {helpTab === "faq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {faqs.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "12px" }}>لا توجد أسئلة شائعة حالياً.</p>
                ) : (
                  faqs.map((faq, index) => {
                    const isFaqExpanded = expandedFaq === index;
                    return (
                      <div key={faq.id} style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
                        <div 
                          onClick={() => setExpandedFaq(isFaqExpanded ? null : index)}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "4px 0" }}
                        >
                          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>{faq.question}</h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {profile?.is_admin && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteFAQ(faq.id); }}
                                style={{ background: "transparent", border: "none", color: "var(--accent-danger)", cursor: "pointer", fontSize: "0.9rem" }}
                              >
                                <i className="bx bx-trash" style={{ fontSize: "1.1rem" }}></i>
                              </button>
                            )}
                            <span style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                              {isFaqExpanded ? "−" : "+"}
                            </span>
                          </div>
                        </div>
                        {isFaqExpanded && (
                          <p style={{ margin: "8px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{faq.answer}</p>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Admin Add FAQ Form */}
                {profile?.is_admin && (
                  <form onSubmit={handleAddFAQ} style={{ marginTop: "20px", borderTop: "1px dashed var(--border-glass)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-ios)", display: "flex", alignItems: "center", gap: "6px" }}><i className="bx bx-bulb" style={{ fontSize: "1.2rem" }}></i> إضافة سؤال شائع جديد (المسؤولين فقط)</h4>
                    <input 
                      required className="ios-input" placeholder="السؤال..." 
                      value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} 
                    />
                    <textarea 
                      required className="ios-input" placeholder="الإجابة..." 
                      value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} 
                      style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
                    />
                    <button type="submit" disabled={faqLoading} className="ios-btn ios-btn-primary" style={{ height: "40px", fontSize: "0.9rem" }}>
                      {faqLoading ? "جاري الإضافة..." : "حفظ السؤال الشائع"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: SOCIAL LINKS */}
            {helpTab === "social" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-whatsapp" style={{ fontSize: "1.3rem", color: "#25d366" }}></i>
                  <span>واتساب</span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-facebook-circle" style={{ fontSize: "1.3rem", color: "#1877f2" }}></i>
                  <span>فيسبوك</span>
                </a>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-telegram" style={{ fontSize: "1.3rem", color: "#0088cc" }}></i>
                  <span>تلجرام</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-instagram" style={{ fontSize: "1.3rem", color: "#e1306c" }}></i>
                  <span>إنستغرام</span>
                </a>
                <a href="https://stagekode.com" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none", gridColumn: "1 / -1" }}>
                  <i className="bx bx-globe" style={{ fontSize: "1.2rem", color: "var(--accent-ios)" }}></i>
                  <span>الموقع الرسمي (STAGE KODE)</span>
                </a>
              </div>
            )}

            {/* TAB CONTENT 3: CONTACT FORM */}
            {helpTab === "contact" && (
              <div>
                {contactSubmitted ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px", color: "#34c759" }}><i className="bx bxs-check-circle"></i></div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "8px" }}>تم إرسال رسالتك بنجاح!</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 16px" }}>شكراً لتواصلك معنا. سيقوم فريق الدعم الفني بالرد عليك في أقرب وقت.</p>
                    <button className="ios-btn" onClick={() => setContactSubmitted(false)}>إرسال رسالة أخرى</button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input 
                        required className="ios-input" placeholder="الاسم الأول" 
                        value={contactForm.firstName} onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })} 
                      />
                      <input 
                        required className="ios-input" placeholder="الاسم الأخير" 
                        value={contactForm.lastName} onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })} 
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input 
                        required className="ios-input" placeholder="رقم الهاتف" style={{ direction: "ltr", textAlign: "right" }}
                        value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} 
                      />
                      <input 
                        required className="ios-input" type="email" placeholder="البريد الإلكتروني" style={{ direction: "ltr", textAlign: "right" }}
                        value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} 
                      />
                    </div>
                    <select 
                      required className="ios-input help-select" 
                      value={contactForm.contactType} onChange={e => setContactForm({ ...contactForm, contactType: e.target.value })}
                    >
                      <option value="">نوع التواصل...</option>
                      <option value="إبلاغ">إبلاغ</option>
                      <option value="شكوى">شكوى</option>
                      <option value="طلب مساعدة">طلب مساعدة</option>
                      <option value="اقتراح تطوير">اقتراح تطوير</option>
                    </select>
                    <textarea 
                      required className="ios-input" placeholder="اكتب تفاصيل رسالتك هنا..." 
                      value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} 
                      style={{ minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
                    />
                    <button type="submit" disabled={contactLoading} className="ios-btn ios-btn-primary" style={{ height: "45px", fontSize: "0.95rem" }}>
                      {contactLoading ? "جاري الإرسال..." : "إرسال الرسالة"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 4. INFORMATION SECTION ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>معلومات</div>
      <Link href="/privacy" style={{ textDecoration: "none" }}>
        <div 
          className="glass-panel" 
          style={{ 
            borderRadius: "20px", 
            padding: "20px", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "12px",
            transition: "transform 0.2s, background-color 0.2s",
            border: "1px solid var(--border-glass)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bx-shield-quarter" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>سياسة الخصوصية</h3>
          </div>
          <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>
      </Link>
      <Link href="/terms" style={{ textDecoration: "none" }}>
        <div 
          className="glass-panel" 
          style={{ 
            borderRadius: "20px", 
            padding: "20px", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "24px",
            transition: "transform 0.2s, background-color 0.2s",
            border: "1px solid var(--border-glass)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bx-file" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>شروط الاستخدام</h3>
          </div>
          <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>
      </Link>

      {/* ─── القسم الخامس: إعدادات متقدمة وتسجيل الخروج (خوص للمسجلين) ─── */}
      {user && (
      <>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>متقدم</div>
      <div 
        className="glass-panel" 
        onClick={() => setShowLogoutModal(true)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "16px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255, 149, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff9500" }}>
            <i className="bx bx-log-out" style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>تسجيل الخروج</h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>تسجيل الخروج من حسابك الحالي</p>
          </div>
        </div>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
      </div>

      <div 
        className="glass-panel" 
        onClick={() => { setShowDeleteModal(true); setDeleteConfirmation(""); }}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "16px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid rgba(255, 59, 48, 0.2)",
          background: "rgba(255, 59, 48, 0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255, 59, 48, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff3b30" }}>
            <i className="bx bx-user-minus" style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#ff3b30" }}>حذف الحساب نهائياً</h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>حذف كافة البيانات وإلغاء تنشيط الحساب</p>
          </div>
        </div>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "#ff3b30" }}></i>
      </div>


      </>
      )}

      {/* Delete Account Modal - HeroUI AlertDialog Style */}
      {showDeleteModal && (
        <div 
          className="modal-backdrop"
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.2s ease" }}
        >
          <div 
            className="glass-panel alert-dialog"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "440px", width: "100%", padding: "0", animation: "slide-up 0.25s ease", border: "1px solid rgba(255, 59, 48, 0.25)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", borderRadius: "20px", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ background: "rgba(255, 59, 48, 0.08)", borderBottom: "1px solid rgba(255, 59, 48, 0.15)", padding: "24px 28px 20px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255, 59, 48, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <i className="bx bx-error" style={{ fontSize: "1.8rem", color: "#ff3b30" }}></i>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ff3b30", margin: 0 }}>تحذير: حذف الحساب</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: "1.5" }}>
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 28px 24px" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.6", textAlign: "center" }}>
                يرجى كتابة العبارة التالية للتأكيد:
              </p>
              <div style={{ userSelect: "none", color: "var(--text-primary)", padding: "10px 14px", background: "rgba(255,59,48,0.06)", border: "1px dashed rgba(255,59,48,0.3)", borderRadius: "10px", textAlign: "center", fontSize: "0.88rem", fontWeight: "700", marginBottom: "16px" }}>
                {deleteString}
              </div>
              <input 
                type="text" 
                className="ios-input" 
                placeholder="اكتب العبارة هنا..." 
                value={deleteConfirmation} 
                onChange={e => setDeleteConfirmation(e.target.value)} 
                style={{ marginBottom: "20px", textAlign: "center" }}
              />
              
              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="ios-btn" 
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }} 
                  style={{ flex: 1 }}
                >
                  <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
                </button>
                <button 
                  className="ios-btn" 
                  onClick={handleDeleteAccount} 
                  disabled={deleteConfirmation !== deleteString || loading} 
                  style={{ flex: 1, background: "#ff3b30", color: "#fff", opacity: deleteConfirmation !== deleteString ? 0.45 : 1, transition: "opacity 0.2s" }}
                >
                  <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i>
                  {loading ? "جاري الحذف..." : "حذف نهائي"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0, 0, 0, 0.85)", 
          zIndex: 1000, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "20px" 
        }}>
          <div className="glass-panel" style={{ maxWidth: "440px", width: "100%", padding: "30px", animation: "fade-in 0.3s ease", border: "1px solid var(--border-glass)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", borderRadius: "28px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "8px", textAlign: "center" }}>المصادقة الثنائية</h3>
            
            {mfaError && (
              <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "12px", borderRadius: "var(--radius-sm)", color: "#ff3b30", marginBottom: "16px", fontSize: "0.85rem", textAlign: "center", animation: "fade-in 0.3s ease" }}>
                {mfaError}
              </div>
            )}

            {mfaStep === "selection" && (
              <>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "24px", textAlign: "center", lineHeight: "1.6" }}>
                  اختر الطريقة التي تفضلها لاستلام كود التحقق الإضافي عند تسجيل الدخول.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {/* Email */}
                  <div style={{ padding: "16px", borderRadius: "16px", border: "1px solid var(--border-glass)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.5, cursor: "not-allowed" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <i className="bx bx-envelope" style={{ fontSize: "1.4rem" }}></i>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>البريد الإلكتروني</h4>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.8rem", background: "var(--border-glass)", padding: "4px 8px", borderRadius: "8px", color: "var(--text-secondary)" }}>قريباً</span>
                  </div>

                  {/* WhatsApp */}
                  <div style={{ padding: "16px", borderRadius: "16px", border: "1px solid var(--border-glass)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.5, cursor: "not-allowed" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <i className="bx bxl-whatsapp" style={{ fontSize: "1.4rem" }}></i>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>تطبيق واتساب</h4>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.8rem", background: "var(--border-glass)", padding: "4px 8px", borderRadius: "8px", color: "var(--text-secondary)" }}>قريباً</span>
                  </div>

                  {/* Authenticator App */}
                  <div 
                    onClick={() => activeMfaFactors.totp ? null : handleEnrollTOTP()} 
                    style={{ padding: "16px", borderRadius: "16px", border: activeMfaFactors.totp ? "1px solid rgba(52, 199, 89, 0.4)" : "1px solid var(--accent-ios)", background: activeMfaFactors.totp ? "rgba(52, 199, 89, 0.05)" : "rgba(108, 99, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: activeMfaFactors.totp ? "default" : "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: activeMfaFactors.totp ? "rgba(52, 199, 89, 0.15)" : "rgba(108, 99, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: activeMfaFactors.totp ? "#34c759" : "var(--accent-ios)" }}>
                        <i className="bx bx-check-shield" style={{ fontSize: "1.4rem" }}></i>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>تطبيق مصادقة خارجية</h4>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: activeMfaFactors.totp ? "#34c759" : "var(--text-secondary)" }}>
                          {activeMfaFactors.totp ? "مفعل" : "مجاني وموصى به"}
                        </p>
                      </div>
                    </div>
                    {mfaLoading ? (
                      <div className="spinner" style={{ width: "20px", height: "20px", borderTopColor: activeMfaFactors.totp ? "#34c759" : "var(--accent-ios)" }} />
                    ) : activeMfaFactors.totp ? (
                      <button onClick={handleUnenrollClick} style={{ background: "rgba(255, 59, 48, 0.1)", color: "#ff3b30", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>إلغاء</button>
                    ) : (
                      <i className="bx bx-chevron-left" style={{ fontSize: "1.4rem", color: "var(--accent-ios)" }}></i>
                    )}
                  </div>
                </div>

                <button className="ios-btn" onClick={() => setShow2FAModal(false)} style={{ width: "100%" }}>إغلاق</button>
              </>
            )}

            {mfaStep === "enroll" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", textAlign: "center", lineHeight: "1.6" }}>
                  1. قم بتحميل تطبيق مصادقة مثل Google Authenticator أو Authy.<br/>
                  2. امسح رمز الاستجابة السريعة (QR Code) التالي:
                </p>
                
                {qrCode ? (
                  <div style={{ background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-glass-bright)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="QR Code" style={{ width: "200px", height: "200px" }} />
                  </div>
                ) : (
                  <div style={{ width: "200px", height: "200px", background: "var(--border-glass-bright)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="spinner" />
                  </div>
                )}

                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
                  أو يمكنك إدخال الرمز السري يدوياً:<br/>
                  <code style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px", marginTop: "4px", display: "inline-block", letterSpacing: "1px", userSelect: "all" }}>{mfaSecret}</code>
                </p>

                <div style={{ display: "flex", gap: "8px", justifyContent: "center", direction: "ltr", marginTop: "8px", width: "100%" }}>
                  {codeDigits.map((digit, idx) => (
                    <input
                      key={`enroll-${idx}`}
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

                <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
                  <button className="ios-btn" onClick={() => setMfaStep("selection")} style={{ flex: 1 }}>رجوع</button>
                  <button className="ios-btn ios-btn-primary" onClick={handleVerifyTOTP} disabled={mfaLoading || verificationCode.length !== 6} style={{ flex: 2, opacity: verificationCode.length !== 6 ? 0.6 : 1 }}>
                    {mfaLoading ? "جاري التحقق..." : "تأكيد وتفعيل"}
                  </button>
                </div>
              </div>
            )}

            {mfaStep === "unenroll_confirm" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fade-in 0.3s ease", padding: "10px 0" }}>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", textAlign: "center", lineHeight: "1.6" }}>
                  لأسباب أمنية، يرجى إدخال كلمة المرور والكود المكون من 6 أرقام لتأكيد الإلغاء.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "8px" }}>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="ios-input" 
                      placeholder="كلمة المرور الحالية" 
                      value={mfaPasswordConfirm} 
                      onChange={e => setMfaPasswordConfirm(e.target.value)} 
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <i 
                      className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", direction: "ltr", width: "100%" }}>
                    {codeDigits.map((digit, idx) => (
                      <input
                        key={`unenroll-${idx}`}
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
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button className="ios-btn" onClick={() => { setMfaStep("selection"); setVerificationCode(""); setMfaPasswordConfirm(""); setMfaError(""); }} style={{ flex: 1 }}>تراجع</button>
                  <button className="ios-btn" onClick={handleUnenrollTOTP} disabled={mfaLoading || verificationCode.length !== 6 || !mfaPasswordConfirm} style={{ flex: 1, background: "#ff3b30", color: "#fff", opacity: (verificationCode.length !== 6 || !mfaPasswordConfirm || mfaLoading) ? 0.6 : 1 }}>
                    {mfaLoading ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: "rgba(0, 0, 0, 0.85)", 
          zIndex: 1000, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "20px" 
        }}>
          <div className="glass-panel" style={{ maxWidth: "440px", width: "100%", padding: "30px", animation: "fade-in 0.3s ease", border: "1px solid var(--border-glass)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", borderRadius: "28px" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "16px", textAlign: "center" }}>تغيير كلمة المرور</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "20px", textAlign: "center" }}>
              الرجاء إدخال كلمة المرور الجديدة.
            </p>
            
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="ios-input" 
                placeholder="كلمة المرور الجديدة" 
                value={passwordForm.new} 
                onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} 
                style={{ width: "100%", boxSizing: "border-box", textAlign: "left", direction: "ltr", paddingLeft: "48px" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: "24px" }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="ios-input" 
                placeholder="تأكيد كلمة المرور الجديدة" 
                value={passwordForm.confirm} 
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} 
                style={{ width: "100%", boxSizing: "border-box", textAlign: "left", direction: "ltr", paddingLeft: "48px" }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <i className={`bx ${showConfirmPassword ? 'bx-hide' : 'bx-show'}`}></i>
              </button>
            </div>
            
            <div style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "16px", padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem", marginBottom: "24px", direction: "rtl" }}>
              {[
                { ok: pwdRules.length, label: "من 8 إلى 32 حرف" },
                { ok: pwdRules.upper, label: "حرف كبير (A-Z)" },
                { ok: pwdRules.lower, label: "حرف صغير (a-z)" },
                { ok: pwdRules.number, label: "رقم (0-9)" },
                { ok: pwdRules.special, label: "رمز خاص (@$!...)" },
                { ok: pwdRules.match, label: "كلمتا المرور متطابقتان" },
              ].map(({ ok, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", color: ok ? "#00d4aa" : "var(--text-muted)", transition: "color 0.3s ease" }}>
                  <i className={`bx ${ok ? 'bxs-check-circle' : 'bx-radio-circle'}`} style={{ fontSize: "1.1rem" }}></i> {label}
                </div>
              ))}
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="ios-btn" onClick={() => { setShowPasswordModal(false); setPasswordForm({ new: "", confirm: "" }); }} style={{ flex: 1 }}>إلغاء</button>
              <button className="ios-btn ios-btn-primary" onClick={handleChangePassword} disabled={passwordLoading || !isPasswordValid} style={{ flex: 1, opacity: (!isPasswordValid || passwordLoading) ? 0.6 : 1 }}>
                {passwordLoading ? "جاري التغيير..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: "rgba(0, 0, 0, 0.85)", 
          zIndex: 1000, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "20px" 
        }}>
          <div className="glass-panel" style={{ maxWidth: "440px", width: "100%", padding: "30px", animation: "fade-in 0.3s ease", border: "1px solid rgba(255, 149, 0, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", borderRadius: "28px" }}>
            <h3 style={{ fontSize: "1.3rem", color: "#ff9500", marginBottom: "16px", textAlign: "center" }}>تسجيل الخروج</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "24px", lineHeight: "1.6", textAlign: "center" }}>
              هل أنت متأكد من تسجيل الخروج؟
            </p>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="ios-btn" onClick={() => setShowLogoutModal(false)} style={{ flex: 1 }}>
                <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
              </button>
              <button className="ios-btn" onClick={handleLogout} disabled={loading} style={{ flex: 1, background: "#ff9500", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                {loading ? "جاري الخروج..." : (
                  <>
                    <i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i> تأكيد
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Notification Modal ── */}
      {selectedNotification && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.3s ease" }} onClick={() => setSelectedNotification(null)}>
          <div style={{ background: "var(--glass-bg)", border: "1px solid var(--border-glass)", borderRadius: "24px", padding: "30px 24px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", position: "relative", animation: "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedNotification(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", width: "32px", height: "32px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
              <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>
            </button>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                {selectedNotification.type === "success" ? "✅" : selectedNotification.type === "warning" ? "⚠️" : "🔔"}
              </div>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)" }}>{selectedNotification.title}</h3>
              <span style={{ display: "block", marginTop: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {new Date(selectedNotification.created_at).toLocaleString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "16px", padding: "20px", maxHeight: "300px", overflowY: "auto", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ margin: 0, fontSize: "1rem", lineHeight: "1.7", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                {selectedNotification.message}
              </p>
            </div>
            {selectedNotification.link && (
              <button onClick={() => { setSelectedNotification(null); router.push(selectedNotification.link); }} className="ios-btn ios-btn-primary" style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}>
                الذهاب للرابط <i className="bx bx-link-external" style={{ marginRight: "6px" }}></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
