"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import styles from "./page.module.css";

const PROFILE_AVATARS = [
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
  { id: "parks", label: "الحدائق", icon: "bx bx-tree" },
  { id: "work", label: "شغل", icon: "bx bx-briefcase" },
  { id: "courses_study", label: "كورسات ودراسة", icon: "bx bx-book-reader" },
  { id: "quiet_places", label: "اماكن هادئه", icon: "bx bx-moon" }
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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) {
        setMessage({ type: 'error', text: "فشل رفع الصورة: " + uploadError.message });
      } else if (data) {
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, avatarUrl: pub.publicUrl }));
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "حدث خطأ أثناء رفع الصورة." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    email: "", // Added email to editable fields
    governorate: "",
    city: "",
    dob: "",
    avatarUrl: "",
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
        avatarUrl: profileData.avatar_url || "",
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
      if (formData.username.length < 3) {
        setMessage({ type: 'error', text: "اسم المستخدم يجب أن يكون 3 حروف على الأقل." });
        setSaving(false);
        return;
      }
      if (/^\d+$/.test(formData.username) || !/[a-z]/i.test(formData.username)) {
        setMessage({ type: 'error', text: "اسم المستخدم لا يمكن أن يتكون من أرقام فقط (يجب أن يحتوي على حروف إنجليزية)." });
        setSaving(false);
        return;
      }
      if (!/^[a-z0-9_]{3,30}$/.test(formData.username)) {
        setMessage({ type: 'error', text: "اسم المستخدم يجب أن يتكون من أحرف إنجليزية صغيرة وأرقام والشرطة السفلية (_) فقط بدون مسافات." });
        setSaving(false);
        return;
      }
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
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { error: emailError } = await supabase.auth.updateUser(
        { email: formData.email },
        { emailRedirectTo: `${siteUrl}/profile` }
      );
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
      avatar_url: formData.avatarUrl,
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
    return <div className={styles.loadingContainer}>جاري تحميل الملف الشخصي...</div>;
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
    <div className={styles.container}>
      {/* ─── 1. PROFILE RECTANGLE CARD ─── */}
      <div
        className={`glass-panel ${styles.profileCard} ${isProfileExpanded ? styles.profileCardExpanded : ''}`}
        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
      >
        {!user ? (
          /* ── Guest: Login Prompt ── */
          <div className={styles.guestContainer}>
            <div className={styles.guestAvatarBg}>
              <i className={`bx bx-user ${styles.guestAvatarIcon}`}></i>
            </div>
            <div className={styles.guestTextWrapper}>
              <h3 className={styles.guestTitle}>أهلاً بك!</h3>
              <p className={styles.guestSubtitle}>سجل دخولك للوصول إلى ملفك الشخصي وكل مزايا التطبيق</p>
            </div>
            <Link href="/login" className={`ios-btn ios-btn-primary ${styles.guestLoginBtn}`}>
              <i className={`bx bx-log-in ${styles.guestLoginIcon}`}></i> تسجيل الدخول
            </Link>
            <Link href="/signup" className={styles.guestSignupLink}>ليس لديك حساب؟ إنشاء حساب جديد</Link>
          </div>
        ) : (
          <div className={styles.profileHeader}>
            <div className={styles.profileHeaderLeft}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className={styles.profileAvatar} />
              ) : (
                <div className={styles.profileAvatarPlaceholder}>
                  <i className={`bx bxs-user ${styles.profileAvatarIcon}`}></i>
                </div>
              )}
              <div className={styles.profileInfoText}>
                <h3 className={styles.profileName}>{profile?.full_name}</h3>
                <p className={styles.profileEmail}>{profile?.email}</p>
              </div>
            </div>
            <i className={`bx ${isProfileExpanded ? "bx-chevron-up" : "bx-chevron-down"} ${styles.profileChevron}`}></i>
          </div>
        )}

        {/* Expanded Profile Info / Form */}
        {user && isProfileExpanded && (
          <div onClick={(e) => e.stopPropagation()} className={styles.profileExpandedContent}>
            {message && (
              <div className={`${styles.messageBanner} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
                {message.text}
              </div>
            )}

            {editMode ? (
              <div className={styles.formGap}>
                {/* Profile Picture / Avatar Selection */}
                <div>
                  <label className="help-label">الصورة الشخصية / الأفتار</label>
                  <div className={styles.avatarSection}>
                    <div className={styles.avatarRelative}>
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" className={styles.formAvatarImg} />
                      ) : (
                        <div className={styles.formAvatarPlaceholder}>
                          <i className={`bx bxs-user ${styles.formAvatarIcon}`}></i>
                        </div>
                      )}
                      {uploadingAvatar && (
                        <div className={styles.avatarOverlay}>
                          <div className={`spinner ${styles.avatarSpinner}`} />
                        </div>
                      )}
                    </div>

                    <label className={`ios-btn ${styles.uploadBtnLabel}`}>
                      <i className={`bx bx-upload ${styles.uploadIcon}`}></i>
                      {uploadingAvatar ? "جاري الرفع..." : "رفع صورة جديدة من جهازك"}
                      <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className={styles.hiddenInput} disabled={uploadingAvatar} />
                    </label>

                    <span className={styles.uploadMutedText}>أو اختر أفتار جاهز:</span>
                    <div className={styles.avatarsGrid}>
                      {PROFILE_AVATARS.map((url, i) => (
                        <div
                          key={i}
                          onClick={() => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                          className={`${styles.avatarPresetItem} ${formData.avatarUrl === url ? styles.avatarPresetItemActive : (formData.avatarUrl ? styles.avatarPresetItemDimmed : '')}`}
                        >
                          <img src={url} alt={`Avatar ${i}`} className={styles.avatarPresetImg} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="help-label">الاسم بالكامل</label>
                  <input type="text" className="ios-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">تاريخ الميلاد</label>
                  <input
                    type="date"
                    disabled
                    readOnly
                    className={`ios-input ${styles.inputDobDisabled}`}
                    value={formData.dob}
                  />
                  <p className={styles.dobWarningText}>
                    لا يمكنك تغير تاريخ ميلادك اذا كنت قد ادخلت تاريخ ميلادك خطا فيرجى <Link href="/help" className={styles.dobWarningLink}>التواصل مع الإدارة للتغير</Link>
                  </p>
                </div>
                <div>
                  <label className="help-label">اسم المستخدم (مرة كل 30 يوم)</label>
                  <input
                    type="text"
                    className={`ios-input ${styles.usernameInput} ${(formData.username.length > 0 && formData.username.length < 3) ? styles.usernameInputInvalid : ''}`}
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  />
                  {formData.username.length > 0 && (
                    formData.username.length < 3 ? (
                      <p className={styles.usernameWarningText}>
                        ⚠️ اسم المستخدم يجب أن يكون 3 حروف على الأقل.
                      </p>
                    ) : /^\d+$/.test(formData.username) || !/[a-z]/i.test(formData.username) ? (
                      <p className={styles.usernameWarningText}>
                        ⚠️ اسم المستخدم لا يمكن أن يتكون من أرقام فقط (يجب أن يحتوي على حروف إنجليزية).
                      </p>
                    ) : null
                  )}
                </div>
                <div>
                  <label className="help-label">البريد الإلكتروني (يتطلب تأكيد)</label>
                  <input type="email" className={`ios-input ${styles.emailInput}`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div>
                  <label className="help-label">رقم الهاتف (بدون صفر البداية)</label>
                  <div className={styles.phoneInputContainer}>
                    <div className={styles.phonePrefix}>
                      <span>🇪🇬</span>
                      <span className={styles.phonePrefixCode}>+20</span>
                      <span className={styles.phonePrefixDivider} />
                    </div>
                    <input type="tel" className={`ios-input ${styles.phoneInput}`} value={formData.phone} onChange={e => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                      if (numbersOnly.length <= 10) setFormData({ ...formData, phone: numbersOnly });
                    }} />
                  </div>
                </div>
                <div>
                  <label className="help-label">المحافظة</label>
                  <select className="ios-input help-select" value={formData.governorate} onChange={(e) => setFormData({ ...formData, governorate: e.target.value, city: "" })}>
                    {governoratesList.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                  </select>
                </div>
                {formData.governorate && (
                  <div>
                    <label className="help-label">المدينة</label>
                    <select className="ios-input help-select" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                      <option value="" disabled>اختر المدينة...</option>
                      {egyptLocations[formData.governorate]?.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Interests Selection */}
                <div className={styles.interestsSection}>
                  <label className="help-label">اهتماماتي (يمكنك اختيار أكثر من خيار)</label>
                  <div className={styles.interestsGrid}>
                    {AVAILABLE_INTERESTS.map(interest => {
                      const isSelected = formData.interests.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          className={`category-pill ${isSelected ? 'active' : ''} ${styles.interestPillBtn}`}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({ ...formData, interests: formData.interests.filter(id => id !== interest.id) });
                            } else {
                              setFormData({ ...formData, interests: [...formData.interests, interest.id] });
                            }
                          }}
                        >
                          <i className={`${interest.icon} ${styles.interestPillIcon}`} /> {interest.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.formButtonsRow}>
                  <button className={`ios-btn ${styles.flex1}`} onClick={() => setEditMode(false)}>إلغاء</button>
                  <button className={`ios-btn ios-btn-primary ${styles.flex1}`} onClick={handleSave} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
                </div>
              </div>
            ) : (
              <div className={styles.formGap}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>اسم المستخدم</span>
                  <span className={styles.infoValue}>@{profile?.username}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>رقم الهاتف</span>
                  <span className={styles.infoValue} dir="ltr">{profile?.phone}</span>
                </div>
                {profile?.dob && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>تاريخ الميلاد</span>
                    <span className={styles.infoValue}>{profile.dob}</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>الجنس</span>
                  <span className={styles.infoValue}>{profile?.gender}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>المنطقة</span>
                  <span className={styles.infoValue}>{profile?.city}، {profile?.governorate}</span>
                </div>

                {/* Interests Display */}
                <div className={styles.interestsDisplaySection}>
                  <div className={styles.interestsDisplayTitle}>اهتماماتي</div>
                  {profile?.interests && profile.interests.length > 0 ? (
                    <div className={styles.interestsGrid}>
                      {profile.interests.map((intId: string) => {
                        const interest = AVAILABLE_INTERESTS.find(i => i.id === intId);
                        if (!interest) return null;
                        return (
                          <div key={intId} className={`category-pill active ${styles.interestPillReadonly}`}>
                            <i className={`${interest.icon} ${styles.interestPillIcon}`} /> {interest.label}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noInterestsCard}>
                      <p className={styles.noInterestsText}>
                        قم بإضافة اهتماماتك الآن لنتمكن من إرسال أقوى العروض والإشعارات التي تناسبك خصيصاً!
                      </p>
                      <button className={`ios-btn ${styles.addInterestsBtn}`} onClick={(e) => { e.stopPropagation(); setEditMode(true); }}>
                        أضف الآن
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.formButtonsRow}>
                  <button className={`ios-btn ios-btn-primary ${styles.flex1}`} onClick={() => setEditMode(true)}>
                    تعديل البيانات
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Section 2 (Theme, Favorites, Notifications, Add Places) ─── */}
      <div className={styles.sectionCard}>

        {/* ─── Start App Theme (Dark / Light Mode) ─── */}
        <div
          className={styles.cardContainer}
          onClick={toggleTheme}
        >
          <div className={styles.cardContent}>
            {/* Icon */}
            <div style={{ color: "var(--accent-primary)" }}>
              <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'} ${styles.cardIcon}`}></i>
            </div>
            {/* Title */}
            <div>
              <h3 className={styles.cardTitle}>
                {theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
              </h3>
            </div>
          </div>
          <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
        </div>
        {/* End Theme (Dark / Light Mode) */}

        <hr className={styles.dividerDashed} />

        {/* Start Favorite Places Card */}
        <div
          className={styles.cardContainer}
          onClick={() => router.push('/favorites')}
        >
          <div className={styles.cardContent}>
            {/* Icon */}
            <div style={{ color: "var(--accent-red)" }}>
              <i className={`bx bxs-heart ${styles.cardIcon}`}></i>
            </div>
            {/* Title */}
            <div>
              <h3 className={styles.cardTitle}>الأماكن المفضلة</h3>
            </div>
          </div>
          <div className={styles.badgeRight}>
            {favorites.length > 0 && (
              <span className={styles.favBadge}>
                {favorites.length}
              </span>
            )}
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </div>
        {/* End Favorites Card */}
        <hr className={styles.dividerDashed} />
        {/* Start Notifications Card */}
        <div
          className= {styles.cardContainer}
          style={{ flexDirection: "column" }}
          onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
        >
          <div className={styles.cardContent}
          style={{justifyContent: "space-between"}}>
            <div className={styles.notifHeaderLeft}>
              <div style={{ color: "var(--accent-ios)" }}>
                <i className={`bx bxs-bell ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>الإشعارات</h3>
              </div>
            </div>
            <div className={styles.badgeRight}>
              {unreadCount > 0 && (
                <span className={styles.notifBadgeRed}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <i className={`bx bx-chevron-${isNotificationsExpanded ? "down" : "left"} ${styles.chevronIcon}`}></i>
            </div>
          </div>

          {/* Notifications Expanded Section */}
          {isNotificationsExpanded && (
            <div className={styles.notifExpandedContent}>
              <div className={styles.notifExpandedHeader}>
                <h4 className={styles.notifExpandedTitle}>سجل الإشعارات</h4>
                <div className={styles.notifActions}>
                  {unreadCount > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className={`ios-btn ${styles.notifBtnSmall}`}>
                      جعل الكل مقروء
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteAll(); }} className={`ios-btn ${styles.notifBtnDeleteAll}`}>
                      حذف الكل
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className={styles.notifEmpty}>
                  <i className={`bx bx-bell-off ${styles.notifEmptyIcon}`}></i>
                  <p className={styles.notifEmptyText}>لا توجد إشعارات حالياً</p>
                </div>
              ) : (
                <div className={styles.notifList}>
                  {notifications.map(notif => (
                    <div key={notif.id} onClick={(e) => { e.stopPropagation(); if (!notif.is_read) markAsRead(notif.id); setSelectedNotification(notif); }} className={`${styles.notifItem} ${notif.is_read ? styles.notifItemRead : styles.notifItemUnread}`}>
                      <div className={styles.notifEmoji}>
                        {notif.type === "success" ? "✅" : notif.type === "warning" ? "⚠️" : "🔔"}
                      </div>
                      <div className={styles.notifItemBody}>
                        <h5 className={`${styles.notifItemTitle} ${notif.is_read ? styles.notifItemTitleRead : styles.notifItemTitleUnread}`}>{notif.title}</h5>
                        <p className={styles.notifItemMsg}>{notif.message}</p>
                        <span className={styles.notifItemDate}>
                          {new Date(notif.created_at).toLocaleDateString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {!notif.is_read && (
                        <div className={styles.notifUnreadDot} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Propose Place Card */}
        {user && (
          <div
            className={`glass-panel ${styles.navCard}`}
            onClick={() => router.push('/propose-place')}
          >
            <div className={styles.themeToggleLeft}>
              <div className={styles.proposeIconWrapper}>
                <i className={`bx bx-map-pin ${styles.proposeIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>اقتراحات الأماكن</h3>
                <p className={styles.proposeSubtitle}>
                  اقترح مكان جديد وساهم في إضافته للموقع بعد مراجعة الإدارة
                </p>
              </div>
            </div>
            <div className={styles.proposeAction}>
              <span>إضافة مكان</span>
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            </div>
          </div>
        )}
      </div>

      {/* ─── القسم الثالث: إعدادات الأمان والمصادقة الثنائية (خاص للمسجلين) ─── */}
      {user && (
        <>
          <div className={styles.sectionHeaderLabel}>الأمان</div>

          <div
            className={`glass-panel ${styles.securityCard}`}
            onClick={() => setShowPasswordModal(true)}
          >
            <div className={styles.themeToggleLeft}>
              <div className={styles.securityIconWrapper}>
                <i className={`bx bx-lock-alt ${styles.securityIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تغيير كلمة المرور</h3>
                <p className={styles.securitySubtitle}>تحديث كلمة المرور الخاصة بحسابك</p>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>

          <div
            className={`glass-panel ${styles.securityCard} ${styles.securityCardMargin} ${activeCount > 0 ? styles.mfaCardActive : styles.mfaCardInactive}`}
            onClick={() => setShow2FAModal(true)}
          >
            <div className={styles.themeToggleLeft}>
              <div className={activeCount > 0 ? styles.mfaIconWrapperActive : styles.mfaIconWrapperInactive}>
                <i className={`bx bx-shield-check ${styles.securityIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>
                  المصادقة الثنائية ({activeCount} من 3)
                </h3>
                <p className={styles.securitySubtitle}>
                  إضافة طبقات حماية إضافية لحسابك
                </p>
              </div>
            </div>
            {activeCount > 0 ? (
              <i className={`bx bxs-check-circle ${styles.mfaCheckIcon}`}></i>
            ) : (
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            )}
          </div>
        </>
      )}

      {/* ─── القسم الرابع: الدعم والروابط الهامة (Support & Links) ─── */}
      <div className={styles.sectionHeaderLabel}>المساعدة</div>
      <div
        className={`glass-panel ${styles.helpCard} ${isHelpExpanded ? styles.helpCardExpanded : ''}`}
        onClick={() => setIsHelpExpanded(!isHelpExpanded)}
      >
        <div className={styles.helpHeader}>
          <div className={styles.helpHeaderLeft}>
            <div className={styles.securityIconWrapper}>
              <i className={`bx bx-help-circle ${styles.securityIcon}`}></i>
            </div>
            <h3 className={styles.helpTitle}>التواصل والمساعدة</h3>
          </div>
          <i className={`bx ${isHelpExpanded ? "bx-chevron-up" : "bx-chevron-down"} ${styles.chevronIcon}`}></i>
        </div>

        {/* Expanded Help Center (Tabs) */}
        {isHelpExpanded && (
          <div onClick={(e) => e.stopPropagation()} className={styles.helpExpandedContent}>
            {/* Tabs Selector */}
            <div className={styles.tabsContainer}>
              <button
                onClick={() => setHelpTab("faq")}
                className={`${styles.tabBtn} ${helpTab === "faq" ? styles.tabBtnActive : ''}`}
              >
                الأسئلة الشائعة
              </button>
              <button
                onClick={() => setHelpTab("social")}
                className={`${styles.tabBtn} ${helpTab === "social" ? styles.tabBtnActive : ''}`}
              >
                مواقع التواصل
              </button>
              <button
                onClick={() => setHelpTab("contact")}
                className={`${styles.tabBtn} ${helpTab === "contact" ? styles.tabBtnActive : ''}`}
              >
                مراسلتنا
              </button>
            </div>

            {/* TAB CONTENT 1: FAQ */}
            {helpTab === "faq" && (
              <div className={styles.faqList}>
                {faqs.length === 0 ? (
                  <p className={styles.faqEmptyText}>لا توجد أسئلة شائعة حالياً.</p>
                ) : (
                  faqs.map((faq, index) => {
                    const isFaqExpanded = expandedFaq === index;
                    return (
                      <div key={faq.id} className={styles.faqItem}>
                        <div
                          onClick={() => setExpandedFaq(isFaqExpanded ? null : index)}
                          className={styles.faqQuestionRow}
                        >
                          <h4 className={styles.faqQuestionTitle}>{faq.question}</h4>
                          <div className={styles.faqActions}>
                            {profile?.is_admin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFAQ(faq.id); }}
                                className={styles.faqDeleteBtn}
                              >
                                <i className={`bx bx-trash ${styles.faqDeleteIcon}`}></i>
                              </button>
                            )}
                            <span className={styles.faqToggleIcon}>
                              {isFaqExpanded ? "−" : "+"}
                            </span>
                          </div>
                        </div>
                        {isFaqExpanded && (
                          <p className={styles.faqAnswerText}>{faq.answer}</p>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Admin Add FAQ Form */}
                {profile?.is_admin && (
                  <form onSubmit={handleAddFAQ} className={styles.adminFaqForm}>
                    <h4 className={styles.adminFaqTitle}>
                      <i className={`bx bx-bulb ${styles.adminFaqIcon}`}></i> إضافة سؤال شائع جديد (المسؤولين فقط)
                    </h4>
                    <input
                      required className="ios-input" placeholder="السؤال..."
                      value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)}
                    />
                    <textarea
                      required className={`ios-input ${styles.adminFaqTextarea}`} placeholder="الإجابة..."
                      value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)}
                    />
                    <button type="submit" disabled={faqLoading} className={`ios-btn ios-btn-primary ${styles.adminFaqSubmitBtn}`}>
                      {faqLoading ? "جاري الإضافة..." : "حفظ السؤال الشائع"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: SOCIAL LINKS */}
            {helpTab === "social" && (
              <div className={styles.socialGrid}>
                <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className={`category-pill ${styles.socialPill}`}>
                  <i className={`bx bxl-whatsapp ${styles.socialIconWhatsapp}`}></i>
                  <span>واتساب</span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`category-pill ${styles.socialPill}`}>
                  <i className={`bx bxl-facebook-circle ${styles.socialIconFacebook}`}></i>
                  <span>فيسبوك</span>
                </a>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className={`category-pill ${styles.socialPill}`}>
                  <i className={`bx bxl-telegram ${styles.socialIconTelegram}`}></i>
                  <span>تلجرام</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={`category-pill ${styles.socialPill}`}>
                  <i className={`bx bxl-instagram ${styles.socialIconInstagram}`}></i>
                  <span>إنستغرام</span>
                </a>
                <a href="https://stagekode.com" target="_blank" rel="noopener noreferrer" className={`category-pill ${styles.socialPill} ${styles.socialPillFull}`}>
                  <i className={`bx bx-globe ${styles.socialIconGlobe}`}></i>
                  <span>الموقع الرسمي (STAGE KODE)</span>
                </a>
              </div>
            )}

            {/* TAB CONTENT 3: CONTACT FORM */}
            {helpTab === "contact" && (
              <div>
                {contactSubmitted ? (
                  <div className={styles.contactSuccess}>
                    <div className={styles.contactSuccessIcon}><i className="bx bxs-check-circle"></i></div>
                    <h4 className={styles.contactSuccessTitle}>تم إرسال رسالتك بنجاح!</h4>
                    <p className={styles.contactSuccessMsg}>شكراً لتواصلك معنا. سيقوم فريق الدعم الفني بالرد عليك في أقرب وقت.</p>
                    <button className="ios-btn" onClick={() => setContactSubmitted(false)}>إرسال رسالة أخرى</button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                    <div className={styles.grid2Col}>
                      <input
                        required className="ios-input" placeholder="الاسم الأول"
                        value={contactForm.firstName} onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })}
                      />
                      <input
                        required className="ios-input" placeholder="الاسم الأخير"
                        value={contactForm.lastName} onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })}
                      />
                    </div>
                    <div className={styles.grid2Col}>
                      <input
                        required className={`ios-input ${styles.inputLtrRight}`} placeholder="رقم الهاتف"
                        value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                      <input
                        required className={`ios-input ${styles.inputLtrRight}`} type="email" placeholder="البريد الإلكتروني"
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
                      required className={`ios-input ${styles.contactTextarea}`} placeholder="اكتب تفاصيل رسالتك هنا..."
                      value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                    <button type="submit" disabled={contactLoading} className={`ios-btn ios-btn-primary ${styles.contactSubmitBtn}`}>
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
      <div className={styles.sectionHeaderLabel}>معلومات</div>
      <Link href="/privacy" style={{ textDecoration: "none" }}>
        <div className={`glass-panel ${styles.infoCard}`}>
          <div className={styles.themeToggleLeft}>
            <div className={styles.infoIconWrapper}>
              <i className={`bx bx-shield-quarter ${styles.infoIcon}`}></i>
            </div>
            <h3 className={styles.cardTitle}>سياسة الخصوصية</h3>
          </div>
          <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
        </div>
      </Link>
      <Link href="/terms" style={{ textDecoration: "none" }}>
        <div className={`glass-panel ${styles.infoCard} ${styles.infoCardMargin}`}>
          <div className={styles.themeToggleLeft}>
            <div className={styles.infoIconWrapper}>
              <i className={`bx bx-file ${styles.infoIcon}`}></i>
            </div>
            <h3 className={styles.cardTitle}>شروط الاستخدام</h3>
          </div>
          <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
        </div>
      </Link>

      {/* ─── القسم الخامس: إعدادات متقدمة وتسجيل الخروج (خاص للمسجلين) ─── */}
      {user && (
        <>
          <div className={styles.sectionHeaderLabel}>متقدم</div>
          <div
            className={`glass-panel ${styles.logoutCard}`}
            onClick={() => setShowLogoutModal(true)}
          >
            <div className={styles.themeToggleLeft}>
              <div className={styles.logoutIconWrapper}>
                <i className={`bx bx-log-out ${styles.logoutIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تسجيل الخروج</h3>
                <p className={styles.logoutSubtitle}>تسجيل الخروج من حسابك الحالي</p>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>

          <div
            className={`glass-panel ${styles.deleteAccountCard}`}
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmation(""); }}
          >
            <div className={styles.themeToggleLeft}>
              <div className={styles.deleteAccountIconWrapper}>
                <i className={`bx bx-user-minus ${styles.deleteAccountIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.deleteAccountTitle}>حذف الحساب نهائياً</h3>
                <p className={styles.securitySubtitle}>حذف كافة البيانات وإلغاء تنشيط الحساب</p>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.deleteChevron}`}></i>
          </div>
        </>
      )}

      {/* Delete Account Modal - HeroUI AlertDialog Style */}
      {showDeleteModal && (
        <div
          className={`modal-backdrop ${styles.modalBackdrop}`}
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }}
        >
          <div
            className={`glass-panel alert-dialog ${styles.deleteModalDialog}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteModalIconWrapper}>
                <i className={`bx bx-error ${styles.deleteModalHeaderIcon}`}></i>
              </div>
              <h3 className={styles.deleteModalHeaderTitle}>تحذير: حذف الحساب</h3>
              <p className={styles.deleteModalHeaderSub}>
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
              </p>
            </div>

            {/* Body */}
            <div className={styles.deleteModalBody}>
              <p className={styles.deleteModalPromptText}>
                يرجى كتابة العبارة التالية للتأكيد:
              </p>
              <div className={styles.deletePhraseBox}>
                {deleteString}
              </div>
              <input
                type="text"
                className={`ios-input ${styles.deleteConfirmInput}`}
                placeholder="اكتب العبارة هنا..."
                value={deleteConfirmation}
                onChange={e => setDeleteConfirmation(e.target.value)}
              />

              {/* Actions */}
              <div className={styles.deleteModalActions}>
                <button
                  className={`ios-btn ${styles.deleteBtnCancel}`}
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }}
                >
                  <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
                </button>
                <button
                  className={`ios-btn ${styles.deleteBtnConfirm} ${deleteConfirmation !== deleteString ? styles.btnDisabled : ''}`}
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== deleteString || loading}
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
        <div className={styles.modalBackdropSlow}>
          <div className={`glass-panel ${styles.mfaModalPanel}`}>
            <h3 className={styles.mfaModalTitle}>المصادقة الثنائية</h3>

            {mfaError && (
              <div className={styles.mfaErrorBanner}>
                {mfaError}
              </div>
            )}

            {mfaStep === "selection" && (
              <>
                <p className={styles.mfaStepText}>
                  اختر الطريقة التي تفضلها لاستلام كود التحقق الإضافي عند تسجيل الدخول.
                </p>

                <div className={styles.mfaListGap}>
                  {/* Email */}
                  <div className={styles.mfaOptionItemDisabled}>
                    <div className={styles.mfaOptionLeft}>
                      <div className={styles.mfaOptionIconDisabled}>
                        <i className={`bx bx-envelope ${styles.securityIcon}`}></i>
                      </div>
                      <div className={styles.profileInfoText}>
                        <h4 className={styles.mfaOptionTitle}>البريد الإلكتروني</h4>
                      </div>
                    </div>
                    <span className={styles.mfaOptionBadgeSoon}>قريباً</span>
                  </div>

                  {/* WhatsApp */}
                  <div className={styles.mfaOptionItemDisabled}>
                    <div className={styles.mfaOptionLeft}>
                      <div className={styles.mfaOptionIconDisabled}>
                        <i className={`bx bxl-whatsapp ${styles.securityIcon}`}></i>
                      </div>
                      <div className={styles.profileInfoText}>
                        <h4 className={styles.mfaOptionTitle}>تطبيق واتساب</h4>
                      </div>
                    </div>
                    <span className={styles.mfaOptionBadgeSoon}>قريباً</span>
                  </div>

                  {/* Authenticator App */}
                  <div
                    onClick={() => activeMfaFactors.totp ? null : handleEnrollTOTP()}
                    className={`${styles.mfaOptionBase} ${activeMfaFactors.totp ? styles.mfaOptionItemActive : styles.mfaOptionItemInactive}`}
                  >
                    <div className={styles.mfaOptionLeft}>
                      <div className={activeMfaFactors.totp ? styles.mfaOptionIconActive : styles.mfaOptionIconInactive}>
                        <i className={`bx bx-check-shield ${styles.securityIcon}`}></i>
                      </div>
                      <div className={styles.profileInfoText}>
                        <h4 className={styles.mfaOptionTitle}>تطبيق مصادقة خارجية</h4>
                        <p className={activeMfaFactors.totp ? styles.mfaOptionSubActive : styles.mfaOptionSubInactive}>
                          {activeMfaFactors.totp ? "مفعل" : "مجاني وموصى به"}
                        </p>
                      </div>
                    </div>
                    {mfaLoading ? (
                      <div className={`spinner ${activeMfaFactors.totp ? styles.mfaSpinnerActive : styles.mfaSpinnerInactive}`} />
                    ) : activeMfaFactors.totp ? (
                      <button onClick={handleUnenrollClick} className={styles.mfaUnenrollBtn}>إلغاء</button>
                    ) : (
                      <i className={`bx bx-chevron-left ${styles.securityIcon}`}></i>
                    )}
                  </div>
                </div>

                <button className="ios-btn" onClick={() => setShow2FAModal(false)} style={{ width: "100%" }}>إغلاق</button>
              </>
            )}

            {mfaStep === "enroll" && (
              <div className={styles.mfaEnrollColumn}>
                <p className={styles.mfaStepText}>
                  1. قم بتحميل تطبيق مصادقة مثل Google Authenticator أو Authy.<br />
                  2. امسح رمز الاستجابة السريعة (QR Code) التالي:
                </p>

                {qrCode ? (
                  <div className={styles.mfaQrBox}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="QR Code" className={styles.mfaQrImg} />
                  </div>
                ) : (
                  <div className={styles.mfaQrPlaceholder}>
                    <div className="spinner" />
                  </div>
                )}

                <p className={styles.mfaSecretText}>
                  أو يمكنك إدخال الرمز السري يدوياً:<br />
                  <code className={styles.mfaSecretCode}>{mfaSecret}</code>
                </p>

                <div className={styles.digitsRow}>
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
                      className={`ios-input ${styles.digitInput}`}
                      maxLength={2}
                    />
                  ))}
                </div>

                <div className={styles.formButtonsRow} style={{ width: "100%" }}>
                  <button className={`ios-btn ${styles.flex1}`} onClick={() => setMfaStep("selection")}>رجوع</button>
                  <button className={`ios-btn ios-btn-primary ${verificationCode.length !== 6 ? styles.btnOpacity60 : ''}`} onClick={handleVerifyTOTP} disabled={mfaLoading || verificationCode.length !== 6} style={{ flex: 2 }}>
                    {mfaLoading ? "جاري التحقق..." : "تأكيد وتفعيل"}
                  </button>
                </div>
              </div>
            )}

            {mfaStep === "unenroll_confirm" && (
              <div className={styles.mfaUnenrollForm}>
                <p className={styles.mfaStepText}>
                  لأسباب أمنية، يرجى إدخال كلمة المرور والكود المكون من 6 أرقام لتأكيد الإلغاء.
                </p>
                <div className={styles.formGap} style={{ width: "100%", marginTop: "8px" }}>
                  <div className={styles.relativeFullWidth}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`ios-input ${styles.passwordInputPaddedRight}`}
                      placeholder="كلمة المرور الحالية"
                      value={mfaPasswordConfirm}
                      onChange={e => setMfaPasswordConfirm(e.target.value)}
                    />
                    <i
                      className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} ${styles.eyeIconToggle}`}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                  <div className={styles.digitsRow}>
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
                        className={`ios-input ${styles.digitInput}`}
                        maxLength={2}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.formButtonsRow}>
                  <button className={`ios-btn ${styles.flex1}`} onClick={() => { setMfaStep("selection"); setVerificationCode(""); setMfaPasswordConfirm(""); setMfaError(""); }}>تراجع</button>
                  <button className={`ios-btn ${styles.unenrollBtnConfirm} ${(verificationCode.length !== 6 || !mfaPasswordConfirm || mfaLoading) ? styles.btnOpacity60 : ''}`} onClick={handleUnenrollTOTP} disabled={mfaLoading || verificationCode.length !== 6 || !mfaPasswordConfirm}>
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
        <div className={styles.modalBackdropSlow}>
          <div className={`glass-panel ${styles.passwordModalPanel}`}>
            <h3 className={styles.passwordModalTitle}>تغيير كلمة المرور</h3>
            <p className={styles.passwordModalSubtitle}>
              الرجاء إدخال كلمة المرور الجديدة.
            </p>

            <div className={styles.passwordInputRelative}>
              <input
                type={showPassword ? "text" : "password"}
                className={`ios-input ${styles.passwordInputLeftPadded}`}
                placeholder="كلمة المرور الجديدة"
                value={passwordForm.new}
                onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.eyeIconBtn}>
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
              </button>
            </div>

            <div className={styles.passwordInputConfirmRelative}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`ios-input ${styles.passwordInputLeftPadded}`}
                placeholder="تأكيد كلمة المرور الجديدة"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.eyeIconBtn}>
                <i className={`bx ${showConfirmPassword ? 'bx-hide' : 'bx-show'}`}></i>
              </button>
            </div>

            <div className={styles.pwdRulesBox}>
              {[
                { ok: pwdRules.length, label: "من 8 إلى 32 حرف" },
                { ok: pwdRules.upper, label: "حرف كبير (A-Z)" },
                { ok: pwdRules.lower, label: "حرف صغير (a-z)" },
                { ok: pwdRules.number, label: "رقم (0-9)" },
                { ok: pwdRules.special, label: "رمز خاص (@$!...)" },
                { ok: pwdRules.match, label: "كلمتا المرور متطابقتان" },
              ].map(({ ok, label }) => (
                <div key={label} className={`${styles.pwdRuleItem} ${ok ? styles.pwdRuleSuccess : styles.pwdRuleMuted}`}>
                  <i className={`bx ${ok ? 'bxs-check-circle' : 'bx-radio-circle'} ${styles.ruleCheckIcon}`}></i> {label}
                </div>
              ))}
            </div>

            <div className={styles.formButtonsRow}>
              <button className={`ios-btn ${styles.flex1}`} onClick={() => { setShowPasswordModal(false); setPasswordForm({ new: "", confirm: "" }); }}>إلغاء</button>
              <button className={`ios-btn ios-btn-primary ${styles.flex1} ${(!isPasswordValid || passwordLoading) ? styles.btnOpacity60 : ''}`} onClick={handleChangePassword} disabled={passwordLoading || !isPasswordValid}>
                {passwordLoading ? "جاري التغيير..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={styles.modalBackdropSlow}>
          <div className={`glass-panel ${styles.logoutModalPanel}`}>
            <h3 className={styles.logoutModalTitle}>تسجيل الخروج</h3>
            <p className={styles.logoutModalPrompt}>
              هل أنت متأكد من تسجيل الخروج؟
            </p>

            <div className={styles.formButtonsRow}>
              <button className={`ios-btn ${styles.flex1}`} onClick={() => setShowLogoutModal(false)}>
                <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
              </button>
              <button className={`ios-btn ${styles.logoutBtnConfirm}`} onClick={handleLogout} disabled={loading}>
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

      {/* Notification Modal */}
      {selectedNotification && (
        <div className={styles.notifModalOverlay} onClick={() => setSelectedNotification(null)}>
          <div className={styles.notifModalPanel} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedNotification(null)} className={styles.notifModalCloseBtn}>
              <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>
            </button>
            <div className={styles.notifModalHeader}>
              <div className={styles.notifModalEmoji}>
                {selectedNotification.type === "success" ? "✅" : selectedNotification.type === "warning" ? "⚠️" : "🔔"}
              </div>
              <h3 className={styles.notifModalTitle}>{selectedNotification.title}</h3>
              <span className={styles.notifModalDate}>
                {new Date(selectedNotification.created_at).toLocaleString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className={styles.notifModalBody}>
              <p className={styles.notifModalMessage}>
                {selectedNotification.message}
              </p>
            </div>
            {selectedNotification.link && (
              <button onClick={() => { setSelectedNotification(null); router.push(selectedNotification.link); }} className={`ios-btn ios-btn-primary ${styles.notifModalActionBtn}`}>
                الذهاب للرابط <i className="bx bx-link-external" style={{ marginRight: "6px" }}></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
