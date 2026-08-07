"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import styles from "./page.module.css";

// Icons
import { TbMessageCircleStar, TbMessageReportFilled } from "react-icons/tb";
import { BsStars } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { CiShop } from "react-icons/ci";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import { SiConvertio } from "react-icons/si";
import clsx from "clsx";


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

const formatNumber = (num: number, decimals = 0) => {
  if (num < 1000) return num.toFixed(decimals).replace(/\.0+$/, "");
  if (num >= 1000 && num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num >= 1000000 && num < 1000000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "b";
};

/* ─── صفحة الملف الشخصي والإعدادات (Profile Page Component) ─── */
export default function ProfilePage() {
  const router = useRouter();
  const { user, session, loading: authLoading, refreshProfile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteAll } = useNotifications();

  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [devicesList, setDevicesList] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const fetchDevices = async () => {
    if (!supabase || !user) return;
    setLoadingDevices(true);
    try {
      const { data, error } = await supabase
        .from("user_devices")
        .select("*")
        .order("logged_in_at", { ascending: false });
      if (data) {
        setDevicesList(data);
      }
    } catch (e) {
      console.error("Error fetching devices:", e);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleDeactivateDevice = async (deviceId: string, sessionId: string) => {
    if (!supabase) return;
    const isCurrentDevice = sessionId === localStorage.getItem("dftry_device_session_id");

    if (isCurrentDevice) {
      if (!confirm("هل أنت متأكد من تسجيل الخروج من جهازك الحالي؟")) return;
    } else {
      if (!confirm("هل أنت متأكد من إنهاء جلسة هذا الجهاز؟ سيتم تسجيل الخروج منه فوراً.")) return;
    }

    try {
      const { error } = await supabase
        .from("user_devices")
        .update({
          is_active: false,
          logged_out_at: new Date().toISOString()
        })
        .eq("id", deviceId);

      if (!error) {
        setDevicesList(prev => prev.map(d => d.id === deviceId ? { ...d, is_active: false, logged_out_at: new Date().toISOString() } : d));

        if (isCurrentDevice) {
          setShowDevicesModal(false);
          handleLogout();
        }
      } else {
        alert("فشل تسجيل خروج الجهاز: " + error.message);
      }
    } catch (err: any) {
      console.error(err);
    }
  };
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [selectedFavCategory, setSelectedFavCategory] = useState<string>("الكل");

  const [editMode, setEditMode] = useState(false);

  // States for user proposals and reports
  const [userProposals, setUserProposals] = useState<any[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [userAppFeedbacks, setUserAppFeedbacks] = useState<any[]>([]);
  const pendingCount =
    userProposals.filter(p => p.status === "pending").length +
    userReports.filter(r => r.status === "pending" || r.status === "reviewed").length +
    userAppFeedbacks.filter(f => f.status === "pending" || f.status === "reviewed").length;
  const isLimitReached = pendingCount >= 5;
  const [isRequestsExpanded, setIsRequestsExpanded] = useState(false);
  const [activeRequestsTab, setActiveRequestsTab] = useState<"proposals" | "reports" | "app_feedback">("proposals");
  const [loadingRequests, setLoadingRequests] = useState(false);

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

  // Points & Rewards Modal States
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showConvertSection, setShowConvertSection] = useState(false);
  const [convertPointsAmount, setConvertPointsAmount] = useState<string>("");
  const [convertingPoints, setConvertingPoints] = useState(false);
  const [convertStatus, setConvertStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Wallet Modal States
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showConvertBalanceSection, setShowConvertBalanceSection] = useState(false);
  const [convertBalanceAmount, setConvertBalanceAmount] = useState<string>("");
  const [convertingBalance, setConvertingBalance] = useState(false);
  const [convertBalanceStatus, setConvertBalanceStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Wallet Deposit & Withdrawal States
  const [walletTab, setWalletTab] = useState<"main" | "deposit" | "withdraw" | "history">("main");

  // Deposit state
  const [depositMethod, setDepositMethod] = useState<string>("instapay");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositSender, setDepositSender] = useState<string>("");
  const [depositTxId, setDepositTxId] = useState<string>("");
  const [depositImageFile, setDepositImageFile] = useState<File | null>(null);
  const [depositImageUrl, setDepositImageUrl] = useState<string>("");
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [depositStatus, setDepositStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Withdraw state
  const [withdrawMethod, setWithdrawMethod] = useState<string>("instapay");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawRecipient, setWithdrawRecipient] = useState<string>("");
  const [withdrawName, setWithdrawName] = useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Transactions History State
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);


  // Suggestions & Bug Reports State
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionType, setSuggestionType] = useState("اقتراح لتحسين الشكل");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const isSuggestionFormValid = suggestionMessage.trim().length > 0;

  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [bugType, setBugType] = useState("");
  const [bugDetails, setBugDetails] = useState("");
  const [bugImage, setBugImage] = useState("");
  const [bugImageFile, setBugImageFile] = useState<File | null>(null);
  const [bugLoading, setBugLoading] = useState(false);
  const [bugUploading, setBugUploading] = useState(false);
  const isBugFormValid = bugType.trim().length > 0 && bugDetails.trim().length > 0;
  const [feedbackToDelete, setFeedbackToDelete] = useState<any | null>(null);
  const [proposalToRetract, setProposalToRetract] = useState<string | null>(null);
  const [reportToRetract, setReportToRetract] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  // Subscription States
  const [showSubModal, setShowSubModal] = useState(false);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("silver");
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<"monthly" | "yearly">("monthly");
  const [subscribing, setSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSubConfirmModal, setShowSubConfirmModal] = useState(false);
  const [subConfirmData, setSubConfirmData] = useState<{
    planId: string;
    period: "daily" | "monthly" | "yearly" | null;
    message: string;
  } | null>(null);

  // Subscription Carousel State & Ref
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = Array.from(container.children).filter(el => el.tagName === 'DIV');
    if (cards && cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
      setActiveCardIndex(index);
    }
  };

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = Array.from(container.children).filter(el => el.tagName === 'DIV');
    if (cards.length === 0) return;

    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (activeCardIndex !== closestIndex) {
      setActiveCardIndex(closestIndex);
    }
  };

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

  useEffect(() => {
    if (profile) {
      const nameParts = (profile.full_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setContactForm(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || "",
        governorate: prev.governorate || profile.governorate || "",
        city: prev.city || profile.city || ""
      }));
    }
  }, [profile]);

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
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("تعذر الاتصال بقاعدة البيانات.");
      return;
    }
    setContactLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          first_name: contactForm.firstName,
          last_name: contactForm.lastName,
          phone: contactForm.phone,
          email: contactForm.email,
          contact_type: contactForm.contactType,
          message: contactForm.message,
          user_id: user ? user.id : null,
        },
      ]);

      if (error) throw error;

      setContactSubmitted(true);
      setContactForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        governorate: "",
        city: "",
        contactType: "",
        message: "",
      });
    } catch (err: any) {
      console.error("Error submitting contact message:", err);
      alert("فشل إرسال الرسالة: " + err.message);
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteReminder = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("place_notes")
        .delete()
        .eq("id", noteId);
      if (!error) {
        setReminders(prev => prev.filter(r => r.id !== noteId));
      }
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
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

    // Fetch subscription plans
    try {
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*');
      if (plansData && plansData.length > 0) {
        setDbPlans(plansData);
      }
    } catch (e) {
      console.error("Error fetching subscription plans:", e);
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

    // Fetch reminders/notes
    try {
      setLoadingReminders(true);
      const { data: notes } = await supabase
        .from("place_notes")
        .select("*, places(name)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (notes) {
        setReminders(notes.map((n: any) => ({
          id: n.id,
          placeId: n.place_id,
          note: n.note,
          updatedAt: n.updated_at,
          placeName: n.places?.name || "مكان غير معروف"
        })));
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error("Error fetching notes:", e);
    } finally {
      setLoadingReminders(false);
    }

    await fetchUserRequestsAndReports();

    setLoading(false);
  };

  const getPlanPrice = (planId: string, period: "daily" | "monthly" | "yearly" | null) => {
    if (planId === "free") return 0;
    if (planId === "mishwar") return 9;

    let basePrice = 0;
    if (planId === "silver") {
      basePrice = period === "monthly" ? 40 : 450;
    } else if (planId === "gold") {
      basePrice = period === "monthly" ? 60 : 700;
    }

    const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
    const hasActiveSilver = profile?.subscription_tier === "silver" && !isExpired;
    const hasActiveMishwar = profile?.subscription_tier === "mishwar" && !isExpired;

    // ترقية من الفضية للذهبية: خصم سعر الباقة الفضية الحالية
    if (hasActiveSilver && planId === "gold") {
      const silverPrice = profile.subscription_period === "yearly" ? 450 : 40;
      const diff = basePrice - silverPrice;
      return diff > 0 ? diff : 0;
    }

    // ترقية من باقة المشوار للفضية أو الذهبية: خصم قيمة باقة المشوار الحالية
    if (hasActiveMishwar && (planId === "silver" || planId === "gold")) {
      const diff = basePrice - 9;
      return diff > 0 ? diff : 0;
    }

    return basePrice;
  };

  const handleConfirmSubscribe = async (planId: string, period: "daily" | "monthly" | "yearly" | null) => {
    if (!supabase || !user || !profile) return;

    const isExpired = profile.subscription_end && new Date(profile.subscription_end) < new Date();

    // رتب الباقات: free (1) < mishwar (2) < silver (3) < gold (4)
    const getRank = (tier: string | undefined) => {
      if (tier === "mishwar") return 2;
      if (tier === "silver") return 3;
      if (tier === "gold") return 4;
      return 1;
    };

    const currentRank = getRank(profile.subscription_tier);
    const newRank = getRank(planId);

    // رفض تخفيض الاشتراك للباقات الأقل للمشتركين النشطين
    if (planId !== "free" && !isExpired && currentRank > newRank) {
      const planLabel = planId === "mishwar" ? "باقة المشوار" : planId === "silver" ? "الباقة الفضية" : "الباقة الذهبية";
      setSubMessage({
        type: "error",
        text: `أنت على باقة أعلى حالياً ولا يمكن تخفيض اشتراكك. لا تقلق، عند انتهاء المدة لن يتجدد الاشتراك تلقائياً. يمكنك بعد انتهاء مدة باقتك الحالية التي ستنتهي في ${new Date(profile.subscription_end!).toLocaleDateString('ar-EG')} الاشتراك في ${planLabel}.`
      });
      return;
    }

    // Check pricing using helper
    const price = getPlanPrice(planId, period);

    if (planId !== "free" && (profile.balance ?? 0) < price) {
      setSubMessage({
        type: "error",
        text: `رصيد محفظتك غير كافٍ للاشتراك (مطلوب ${price} ج.م، رصيدك الحالي ${(profile.balance ?? 0).toFixed(2)} ج.م). يرجى شحن الرصيد أولاً.`
      });
      return;
    }

    const planLabel = planId === "mishwar" ? "باقة المشوار" : planId === "silver" ? "الباقة الفضية" : planId === "gold" ? "الباقة الذهبية" : "الباقة المجانية";
    const periodLabel = period === "monthly" ? "شهرياً" : period === "yearly" ? "سنوياً" : period === "daily" ? "يومياً" : "";

    let confirmMessage = "";
    if (planId === "free") {
      confirmMessage = "هل أنت متأكد من إلغاء تجديد الاشتراك والرجوع للباقة المجانية؟ ستظل مميزات باقتك الحالية مفعلة بالكامل حتى تاريخ انتهاء صلاحيتها.";
    } else {
      const isUpgrade = (profile.subscription_tier === "silver" || profile.subscription_tier === "mishwar") && !isExpired && currentRank < newRank;

      confirmMessage = isUpgrade
        ? `هل أنت متأكد من ترقية اشتراكك إلى ${planLabel} ${periodLabel} بقيمة فرق الترقية فقط البالغ ${price} ج.م؟ سيتم الخصم من رصيد محفظتك مباشرة.`
        : `هل أنت متأكد من الاشتراك في ${planLabel} ${periodLabel} بقيمة ${price} ج.م؟ سيتم الخصم من رصيد محفظتك مباشرة.`;
    }

    setSubConfirmData({
      planId,
      period,
      message: confirmMessage
    });
    setShowSubConfirmModal(true);
  };

  const executeSubscribe = async (planId: string, period: "daily" | "monthly" | "yearly" | null) => {
    if (!supabase || !user || !profile) return;

    setSubscribing(true);
    setSubMessage(null);
    setSelectedPlanId(planId);
    setShowSubConfirmModal(false);

    try {
      const { data, error } = await supabase.rpc("subscribe_to_plan", {
        p_plan_id: planId,
        p_period: period
      });

      if (error) {
        setSubMessage({ type: "error", text: error.message });
      } else if (data) {
        if (data.success) {
          setSubMessage({ type: "success", text: data.message });
          // Refresh profile data to sync new tier/expiry/balance
          await fetchProfileData();
          await refreshProfile();
        } else {
          setSubMessage({ type: "error", text: data.message });
        }
      }
    } catch (err: any) {
      setSubMessage({ type: "error", text: "حدث خطأ أثناء معالجة الطلب: " + (err.message || err) });
    } finally {
      setSubscribing(false);
    }
  };

  const fetchUserRequestsAndReports = async () => {
    if (!supabase || !user) return;
    setLoadingRequests(true);
    try {
      // 1. Fetch place proposals
      const { data: propData, error: propErr } = await supabase
        .from("place_proposals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (propErr) console.error("Error fetching user proposals:", propErr);
      else setUserProposals(propData || []);

      // 2. Fetch place reports
      const { data: repData, error: repErr } = await supabase
        .from("place_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (repErr) {
        console.error("Error fetching user reports:", repErr);
        setUserReports([]);
      } else if (repData && repData.length > 0) {
        // Resolve place names
        const placeIds = Array.from(new Set(repData.map(r => r.place_id).filter(Boolean)));
        let placesMap = new Map();
        if (placeIds.length > 0) {
          const { data: placesData, error: placesErr } = await supabase
            .from("places")
            .select("id, name")
            .in("id", placeIds);

          if (placesErr) console.error("Error resolving place names for reports:", placesErr);
          if (placesData) {
            placesMap = new Map(placesData.map(p => [p.id, p.name]));
          }
        }

        const resolvedReports = repData.map(report => ({
          ...report,
          place_name: placesMap.get(report.place_id) || "مكان محذوف أو غير معروف"
        }));
        setUserReports(resolvedReports);
      } else {
        setUserReports([]);
      }

      // 3. Fetch app suggestions and bug reports
      const { data: feedbackData, error: feedbackErr } = await supabase
        .from("app_feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (feedbackErr) {
        console.error("Error fetching user app feedback:", feedbackErr);
        setUserAppFeedbacks([]);
      } else {
        setUserAppFeedbacks(feedbackData || []);
      }
    } catch (e) {
      console.error("Error fetching user requests and reports:", e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRetractProposal = async (proposalId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("place_proposals")
        .update({ status: "retracted", updated_at: new Date().toISOString() })
        .eq("id", proposalId)
        .eq("user_id", user.id);

      if (error) throw error;
      alert("تم التراجع عن اقتراح المكان بنجاح.");
      fetchUserRequestsAndReports();
    } catch (err: any) {
      alert("فشل التراجع عن الاقتراح: " + err.message);
    }
  };

  const handleRetractReport = async (reportId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("place_reports")
        .update({ status: "retracted" })
        .eq("id", reportId)
        .eq("user_id", user.id);

      if (error) throw error;
      alert("تم التراجع عن البلاغ بنجاح.");
      fetchUserRequestsAndReports();
    } catch (err: any) {
      alert("فشل التراجع عن البلاغ: " + err.message);
    }
  };

  const getProblemLabelAr = (type: string) => {
    switch (type) {
      case "name": return "الاسم غير صحيح ✏️";
      case "address": return "العنوان أو الموقع غير صحيح 📍";
      case "phone_website": return "الهاتف أو موقع الويب غير صحيح 📞";
      case "working_hours": return "ساعات العمل غير صحيحة 🕐";
      case "closed": return "المكان مغلق 🔴";
      case "category": return "الفئة غير صحيحة 🗂️";
      default: return "تفاصيل أخرى ⚠️";
    }
  };

  const getProposalStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span style={{ background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>قيد المراجعة</span>;
      case "approved":
        return <span style={{ background: "rgba(52, 199, 89, 0.15)", color: "#34c759", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>مقبول ومضاف</span>;
      case "rejected":
        return <span style={{ background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>مرفوض</span>;
      case "retracted":
        return <span style={{ background: "rgba(142, 142, 147, 0.15)", color: "#8e8e93", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>متراجع عنه</span>;
      default:
        return <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem" }}>{status}</span>;
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span style={{ background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>قيد المراجعة</span>;
      case "reviewed":
        return <span style={{ background: "rgba(0, 122, 255, 0.15)", color: "#007aff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>تحت النظر</span>;
      case "accepted":
        return <span style={{ background: "rgba(52, 199, 89, 0.15)", color: "#34c759", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>مقبول ومعدل</span>;
      case "rejected":
        return <span style={{ background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>مرفوض</span>;
      case "retracted":
        return <span style={{ background: "rgba(142, 142, 147, 0.15)", color: "#8e8e93", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold" }}>متراجع عنه</span>;
      default:
        return <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem" }}>{status}</span>;
    }
  };

  const handleConvertPoints = async () => {
    if (!supabase || !user || !profile) return;
    setConvertingPoints(true);
    setConvertStatus(null);

    const pointsToConvert = parseInt(convertPointsAmount);
    if (isNaN(pointsToConvert) || pointsToConvert < 1000) {
      setConvertStatus({ type: "error", text: "عفواً، الحد الأدنى لتحويل النقاط هو 1000 نقطة." });
      setConvertingPoints(false);
      return;
    }

    if (pointsToConvert > (profile.points || 0)) {
      setConvertStatus({ type: "error", text: "عفواً، رصيد النقاط لديك غير كافٍ لإجراء هذه العملية." });
      setConvertingPoints(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("convert_user_points", {
        points_to_convert: pointsToConvert,
      });

      if (error) throw error;

      if (data && data.success) {
        setConvertStatus({ type: "success", text: data.message });
        setConvertPointsAmount("");

        // Sync state locally
        setProfile((prev: any) => ({
          ...prev,
          points: data.new_points,
          balance: data.new_balance,
        }));

        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        setConvertStatus({ type: "error", text: data?.message || "فشلت عملية التحويل." });
      }
    } catch (err: any) {
      console.error(err);
      setConvertStatus({ type: "error", text: "حدث خطأ غير متوقع: " + (err.message || "فشلت العملية") });
    } finally {
      setConvertingPoints(false);
    }
  };

  const handleConvertBalanceToPoints = async () => {
    if (!supabase || !user || !profile) return;
    setConvertingBalance(true);
    setConvertBalanceStatus(null);

    const balanceToConvert = parseFloat(convertBalanceAmount);
    if (isNaN(balanceToConvert) || balanceToConvert < 10) {
      setConvertBalanceStatus({ type: "error", text: "عفواً، الحد الأدنى لتحويل الرصيد هو 10 جنيهات مصري." });
      setConvertingBalance(false);
      return;
    }

    if (balanceToConvert > (profile.balance || 0)) {
      setConvertBalanceStatus({ type: "error", text: "عفواً، رصيد المحفظة لديك غير كافٍ لإجراء هذه العملية." });
      setConvertingBalance(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("convert_user_balance", {
        balance_to_convert: balanceToConvert,
      });

      if (error) throw error;

      if (data && data.success) {
        setConvertBalanceStatus({ type: "success", text: data.message });
        setConvertBalanceAmount("");

        // Sync state locally
        setProfile((prev: any) => ({
          ...prev,
          points: data.new_points,
          balance: data.new_balance,
        }));

        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        setConvertBalanceStatus({ type: "error", text: data?.message || "فشلت عملية التحويل." });
      }
    } catch (err: any) {
      console.error(err);
      setConvertBalanceStatus({ type: "error", text: "حدث خطأ غير متوقع: " + (err.message || "فشلت العملية") });
    } finally {
      setConvertingBalance(false);
    }
  };

  const fetchUserTransactions = async () => {
    if (!supabase || !user) return;
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("balance_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserTransactions(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleOpenWalletModal = () => {
    setShowWalletModal(true);
    setWalletTab("main");
    setShowConvertBalanceSection(false);
    setConvertBalanceStatus(null);
    setDepositAmount("");
    setDepositSender("");
    setDepositTxId("");
    setDepositImageFile(null);
    setDepositImageUrl("");
    setDepositStatus(null);
    setWithdrawAmount("");
    setWithdrawRecipient("");
    setWithdrawName("");
    setWithdrawStatus(null);
    fetchUserTransactions();
  };

  const handleTransactionReceiptUpload = async (file: File): Promise<string> => {
    if (!supabase) return "";
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error("فشل رفع صورة الإيصال: " + uploadError.message);
    }

    const { data: pub } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return pub.publicUrl;
  };

  const handleDepositImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDepositImageFile(file);
      setDepositImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setIsSubmittingDeposit(true);
    setDepositStatus(null);

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositStatus({ type: "error", text: "يرجى إدخال مبلغ صحيح أكبر من الصفر." });
      setIsSubmittingDeposit(false);
      return;
    }

    if (!depositSender.trim()) {
      setDepositStatus({ type: "error", text: "يرجى إدخال الرقم أو الحساب المحول منه." });
      setIsSubmittingDeposit(false);
      return;
    }

    // if (!depositTxId.trim()) {
    //   setDepositStatus({ type: "error", text: "يرجى إدخال رقم العملية (Transaction ID)." });
    //   setIsSubmittingDeposit(false);
    //   return;
    // }

    try {
      let uploadedUrl = "";
      if (depositImageFile) {
        uploadedUrl = await handleTransactionReceiptUpload(depositImageFile);
      }

      const { error } = await supabase
        .from("balance_transactions")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount: amount,
          method: depositMethod,
          provider_number: depositSender,
          transaction_id: depositTxId,
          image_url: uploadedUrl || null,
          status: "pending"
        });

      if (error) throw error;

      setDepositStatus({ type: "success", text: "تم إرسال طلب الإيداع بنجاح، وهو قيد المراجعة الآن." });
      setDepositAmount("");
      setDepositSender("");
      setDepositTxId("");
      setDepositImageFile(null);
      setDepositImageUrl("");

      // Refresh transactions
      fetchUserTransactions();

      setTimeout(() => {
        setWalletTab("main");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setDepositStatus({ type: "error", text: err.message || "حدث خطأ أثناء إرسال الطلب." });
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setIsSubmittingWithdraw(true);
    setWithdrawStatus(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      setWithdrawStatus({ type: "error", text: "عفواً، الحد الأدنى للسحب هو 100 ج.م." });
      setIsSubmittingWithdraw(false);
      return;
    }

    if (amount > (profile?.balance ?? 0)) {
      setWithdrawStatus({ type: "error", text: "رصيد المحفظة لديك غير كافٍ لإجراء هذه العملية." });
      setIsSubmittingWithdraw(false);
      return;
    }

    if (!withdrawRecipient.trim()) {
      setWithdrawStatus({ type: "error", text: "يرجى إدخال الحساب أو الرقم المراد التحويل إليه." });
      setIsSubmittingWithdraw(false);
      return;
    }

    if (withdrawMethod !== "vodafone_cash" && !withdrawName.trim()) {
      setWithdrawStatus({ type: "error", text: "يرجى إدخال اسم المستلم بالكامل." });
      setIsSubmittingWithdraw(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("balance_transactions")
        .insert({
          user_id: user.id,
          type: "withdrawal",
          amount: amount,
          method: withdrawMethod,
          provider_number: withdrawRecipient,
          recipient_name: withdrawName || null,
          status: "pending"
        });

      if (error) throw error;

      setWithdrawStatus({ type: "success", text: "تم تقديم طلب السحب بنجاح وخصم المبلغ مؤقتاً." });
      setWithdrawAmount("");
      setWithdrawRecipient("");
      setWithdrawName("");

      // Refresh profile
      if (refreshProfile) {
        await refreshProfile();
      }

      // Refresh transactions
      fetchUserTransactions();

      setTimeout(() => {
        setWalletTab("main");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setWithdrawStatus({ type: "error", text: err.message || "حدث خطأ أثناء إرسال الطلب." });
    } finally {
      setIsSubmittingWithdraw(false);
    }
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
      if (refreshProfile) {
        await refreshProfile();
      }
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

  const handleSendSuggestion = async () => {
    if (!supabase || !user) return;
    if (!suggestionMessage.trim()) {
      setMessage({ type: 'error', text: "يرجى كتابة رسالة الاقتراح" });
      return;
    }
    setSuggestionLoading(true);
    try {
      const { error } = await supabase.from('app_feedback').insert([{
        user_id: user.id,
        type: 'suggestion',
        category: suggestionType,
        content: suggestionMessage.trim(),
        status: 'pending'
      }]);
      if (error) throw error;

      // Send notification to the user in their list
      await supabase.from("notifications").insert([{
        user_id: user.id,
        title: "تم استلام اقتراحك بنجاح 💡",
        message: `شكراً لمشاركتنا اقتراحك بخصوص: "${suggestionType}". تم تسجيله وجاري مراجعته من قبل الإدارة.`,
        type: "success",
        link: "/profile"
      }]);

      setMessage({ type: 'success', text: "تم إرسال اقتراحك بنجاح! شكراً لك." });
      setShowSuggestionModal(false);
      setSuggestionMessage("");
      fetchUserRequestsAndReports();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "حدث خطأ أثناء إرسال الاقتراح: " + (err.message || "") });
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleSendBugReport = async () => {
    if (!supabase || !user) return;
    if (!bugType.trim()) {
      return;
    }
    if (!bugDetails.trim()) {
      return;
    }
    setBugLoading(true);
    let uploadedImageUrl = null;
    try {
      if (bugImageFile) {
        setBugUploading(true);
        const fileExt = bugImageFile.name.split('.').pop();
        const filePath = `feedback_bugs/${user.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage.from('avatars').upload(filePath, bugImageFile, { upsert: true });
        if (uploadError) {
          throw new Error("فشل رفع الصورة: " + uploadError.message);
        }
        if (data) {
          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
          uploadedImageUrl = pub.publicUrl;
        }
        setBugUploading(false);
      }

      const { error } = await supabase.from('app_feedback').insert([{
        user_id: user.id,
        type: 'bug',
        title: bugType.trim(),
        content: bugDetails.trim(),
        image_url: uploadedImageUrl || bugImage || null,
        status: 'pending'
      }]);
      if (error) throw error;

      // Send notification to the user in their list
      await supabase.from("notifications").insert([{
        user_id: user.id,
        title: "تم تسجيل بلاغ المشكلة ⚠️",
        message: `تم استلام بلاغك بخصوص المشكلة: "${bugType}". سنقوم بمراجعتها وحلها في أقرب وقت.`,
        type: "success",
        link: "/profile"
      }]);

      setMessage({ type: 'success', text: "تم إرسال بلاغك بنجاح! سنقوم بمراجعته قريباً." });
      setShowBugReportModal(false);
      setBugType("");
      setBugDetails("");
      setBugImage("");
      setBugImageFile(null);
      fetchUserRequestsAndReports();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "حدث خطأ أثناء إرسال البلاغ: " + (err.message || "") });
    } finally {
      setBugLoading(false);
      setBugUploading(false);
    }
  };

  const handleBugImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBugImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBugImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
      {message && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fade-in 0.25s ease-out",
            direction: "rtl",
            padding: "20px"
          }}
          onClick={() => setMessage(null)}
        >
          <div
            style={{
              background: "rgba(30, 30, 45, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
              borderRadius: "24px",
              padding: "32px 24px",
              width: "100%",
              maxWidth: "380px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              animation: "scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Status Icon */}
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: message.type === 'error'
                ? "linear-gradient(135deg, rgba(255, 59, 48, 0.2) 0%, rgba(255, 59, 48, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(52, 199, 89, 0.05) 100%)",
              border: message.type === 'error'
                ? "2px solid rgba(255, 59, 48, 0.4)"
                : "2px solid rgba(52, 199, 89, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <i
                className={`bx ${message.type === 'error' ? 'bx-error-circle' : 'bx-check-circle'}`}
                style={{
                  fontSize: "2.2rem",
                  color: message.type === 'error' ? "#ff3b30" : "#34c759"
                }}
              ></i>
            </div>

            {/* Title / Status Text */}
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#fff", fontFamily: "var(--font-cairo)" }}>
              {message.type === 'error' ? "تنبيه" : "عملية ناجحة"}
            </h3>

            {/* Message Text */}
            <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.6", fontFamily: "var(--font-cairo)" }}>
              {message.text}
            </p>

            {/* Close/OK button */}
            <button
              onClick={() => setMessage(null)}
              className="ios-btn"
              style={{
                width: "100%",
                background: message.type === 'error' ? "#ff3b30" : "var(--accent-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                padding: "12px",
                fontWeight: "bold",
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-cairo)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
              }}
            >
              موافق
            </button>
          </div>
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scale-up {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}} />
        </div>
      )}
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
                  <button className={`ios-btn ${styles.flex1}`} onClick={() => setEditMode(false)} style={{ border: "1px solid var(--border-glass)", borderRadius: "16px", width: "50%", alignItems: "center", justifyContent: "center" }}>إلغاء</button>
                  <button className={`ios-btn ios-btn-primary ${styles.flex1}`} onClick={handleSave} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
                </div>
              </div>
            ) : (
              <div className={styles.formGap}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>اسم المستخدم</span>
                  <div className={styles.usernameWrapper}>
                    <span className={styles.infoValue}>@{profile?.username}</span>
                    <button
                      className={styles.copyButton}
                      onClick={() => {
                        if (profile?.username) {
                          navigator.clipboard.writeText(profile.username);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      title="نسخ اسم المستخدم"
                    >
                      <i className={`bx ${copied ? 'bx-check' : 'bx-copy'} ${copied ? styles.copiedIcon : ''}`} />
                    </button>
                  </div>
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

      {/* User Points and Balances Badges Container */}
      {user && (
        <div className={styles.userBadgesContainer} style={{ justifyContent: "center", marginBottom: "24px", marginTop: "8px", fontFamily: "var(--font-heading)" }}>
          {/* Points Badge */}
          <div
            className={`${styles.badgePill} ${styles.badgePoints}`}
            title="النقاط"
            onClick={(e) => {
              e.stopPropagation();
              setShowPointsModal(true);
              setShowConvertSection(false);
              setConvertStatus(null);
            }}
            style={{ cursor: "pointer" }}
          >
            <i className="bx bxs-coin"></i>
            <span>{formatNumber(profile?.points ?? 0)} نقطة</span>
          </div>
          {/* Primary Wallet Balance Badge */}
          <div
            className={`${styles.badgePill} ${styles.badgeWallet}`}
            title="الرصيد الأساسي"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenWalletModal();
            }}
            style={{ cursor: "pointer" }}
          >
            <i className="bx bxs-wallet"></i>
            <span>{formatNumber(profile?.balance ?? 0, 2)} ج.م</span>
          </div>
          {/* Promo Balance Badge */}
          <div className={`${styles.badgePill} ${styles.badgePromo}`} title="الرصيد الترويجي">
            <i className="bx bxs-gift"></i>
            <span>{formatNumber(profile?.promo_balance ?? 0, 2)} ترويجي</span>
          </div>
        </div>
      )}

      {/* ─── Section 2 (Theme, Favorites, Notifications, Add Places) ─── */}
      <div className={styles.sectionCard}>

        {/* ─── Start Subscription Card ─── */}
        <div
          className={styles.cardContainer}
          onClick={() => {
            setSubMessage(null);
            setShowSubModal(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className={styles.cardContent}>
            {/* Icon */}
            <div style={{ color: "var(--accent-gold, #eab308)" }}>
              <i className={`bx bxs-crown ${styles.cardIcon}`}></i>
            </div>
            {/* Title */}
            <div>
              <h3 className={styles.cardTitle}>ترقية الاشتراك</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                {profile?.subscription_tier === 'mishwar'
                  ? (profile?.subscription_status === 'cancelled' ? 'باقة المشوار' : 'باقة المشوار ')
                  : profile?.subscription_tier === 'silver'
                    ? (profile?.subscription_status === 'cancelled' ? 'الباقة الفضية ' : 'الباقة الفضية')
                    : profile?.subscription_tier === 'gold'
                      ? (profile?.subscription_status === 'cancelled' ? 'الباقة الذهبية' : 'الباقة الذهبية')
                      : 'الباقة المجانية'}
                {profile?.subscription_tier !== 'free' && profile?.subscription_end && ` (${profile?.subscription_status === 'cancelled' ? 'ستنتهي في' : 'ينتهي في'} ${new Date(profile.subscription_end).toLocaleDateString('ar-EG')})`}
              </p>
            </div>
          </div>
          <div className={styles.badgeRight}>
            <span className={styles.favBadge} style={{ background: "none", color: "var(--accent-ios)", fontWeight: "bold", fontSize: "0.8rem" }}>
              {profile?.subscription_tier === 'mishwar' ? 'المشوار' : profile?.subscription_tier === 'silver' ? 'الفضية' : profile?.subscription_tier === 'gold' ? 'الذهبية' : 'ترقية'}
            </span>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </div>
        {/* End Subscription Card */}

        <hr className={styles.dividerDashed} />

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

        {/* Start Reminders Card */}
        <div
          className={styles.cardContainer}
          onClick={() => {
            fetchProfileData();
            setIsRemindersModalOpen(true);
          }}
        >
          <div className={styles.cardContent}>
            {/* Icon */}
            <div style={{ color: "#34c759" }}>
              <i className={`bx bx-notepad ${styles.cardIcon}`}></i>
            </div>
            {/* Title */}
            <div>
              <h3 className={styles.cardTitle}>التذكيرات والملاحظات</h3>
            </div>
          </div>
          <div className={styles.badgeRight}>
            {reminders.length > 0 && (
              <span className={styles.favBadge} style={{ background: "none" }}>
                {reminders.length}
              </span>
            )}
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
        </div>
        {/* End Reminders Card */}

        <hr className={styles.dividerDashed} />
        {/* Start Notifications Card */}
        <div
          className={styles.cardContainer}
          style={{ flexDirection: "column", alignItems: "stretch" }}
          onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
        >
          <div className={styles.cardContent}
            style={{ justifyContent: "space-between" }}>
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
                <h4 className={styles.notifExpandedTitle}>السجل</h4>
                <div className={styles.notifActions}>
                  {unreadCount > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className={`ios-btn ${styles.notifBtnSmall}`}>
                      قراءة الكل
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
        {/*End Notifications Card */}
        <hr className={styles.dividerDashed} />
        {/*Start Propose Place Card */}
        {user && (
          <div
            className={styles.cardContainer}
            onClick={() => {
              if (isLimitReached) {
                setMessage({ type: 'error', text: "لقد وصلت للحد الأقصى (5 طلبات معلقة). يرجى الانتظار حتى تقوم الإدارة بمراجعة طلباتك السابقة قبل تقديم اقتراحات جديدة." });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                router.push('/propose-place');
              }
            }}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "var(--accent-secondary)" }}>
                <i className={`bx bx-map-pin ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>اقتراحات الأماكن</h3>
              </div>
            </div>
            <div className={styles.badgeRight}>
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            </div>
          </div>
        )}
        {/*End Propose Place Card */}

        {/*Start My Requests Card */}
        {user && (
          <>
            <hr className={styles.dividerDashed} />
            <div
              className={styles.cardContainer}
              style={{ flexDirection: "column", alignItems: "stretch" }}
              onClick={() => setIsRequestsExpanded(!isRequestsExpanded)}
            >
              <div className={styles.cardContent} style={{ justifyContent: "space-between" }}>
                <div className={styles.notifHeaderLeft}>
                  <div style={{ color: "var(--accent-primary)" }}>
                    <i className={`bx bx-history ${styles.cardIcon}`}></i>
                  </div>
                  <div>
                    <h3 className={styles.cardTitle}>سجل الإجراءات</h3>
                  </div>
                </div>
                <div className={styles.badgeRight}>
                  {(userProposals.filter(p => p.status === "pending").length + userReports.filter(r => r.status === "pending").length + userAppFeedbacks.filter(f => f.status === "pending").length) > 0 && (
                    <span className={styles.notifBadgeRed} style={{ background: "var(--accent-primary)" }}>
                      {userProposals.filter(p => p.status === "pending").length + userReports.filter(r => r.status === "pending").length + userAppFeedbacks.filter(f => f.status === "pending").length}
                    </span>
                  )}
                  <i className={`bx bx-chevron-${isRequestsExpanded ? "down" : "left"} ${styles.chevronIcon}`}></i>
                </div>
              </div>

              {/* Collapsible Content */}
              {isRequestsExpanded && (
                <div className={styles.notifExpandedContent} onClick={(e) => e.stopPropagation()}>
                  {/* Segment control/tabs */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                    <button
                      type="button"
                      onClick={() => setActiveRequestsTab("proposals")}
                      className="ios-btn"
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background: activeRequestsTab === "proposals" ? "var(--accent-primary)" : "transparent",
                        color: activeRequestsTab === "proposals" ? "#fff" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      الأماكن ({userProposals.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRequestsTab("reports")}
                      className="ios-btn"
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background: activeRequestsTab === "reports" ? "var(--accent-primary)" : "transparent",
                        color: activeRequestsTab === "reports" ? "#fff" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      البلاغات ({userReports.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRequestsTab("app_feedback")}
                      className="ios-btn"
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background: activeRequestsTab === "app_feedback" ? "var(--accent-primary)" : "transparent",
                        color: activeRequestsTab === "app_feedback" ? "#fff" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      اقتراحات ({userAppFeedbacks.length})
                    </button>
                  </div>

                  {loadingRequests ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      جاري تحميل البيانات...
                    </div>
                  ) : activeRequestsTab === "proposals" ? (
                    userProposals.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        لم تقم باقتراح أي أماكن بعد.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingLeft: "4px" }}>
                        {userProposals.map((prop) => (
                          <div key={prop.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{prop.name}</strong>
                              {getProposalStatusBadge(prop.status)}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>{prop.governorate} • {prop.city}</span>
                              <span>{new Date(prop.created_at).toLocaleDateString("ar-EG", { dateStyle: "short" })}</span>
                            </div>
                            {prop.rejection_reason && (
                              <div style={{ fontSize: "0.78rem", color: "#ff3b30", background: "rgba(255, 59, 48, 0.08)", padding: "6px 10px", borderRadius: "8px" }}>
                                <strong>سبب الرفض:</strong> {prop.rejection_reason}
                              </div>
                            )}
                            {prop.status === "pending" && (
                              <button
                                type="button"
                                onClick={() => setProposalToRetract(prop.id)}
                                className="ios-btn"
                                style={{
                                  alignSelf: "flex-end",
                                  padding: "4px 10px",
                                  fontSize: "0.78rem",
                                  background: "rgba(255, 59, 48, 0.12)",
                                  color: "#ff3b30",
                                  border: "1px solid rgba(255, 59, 48, 0.2)",
                                  borderRadius: "6px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i> حذف الطلب
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ) : activeRequestsTab === "reports" ? (
                    userReports.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        لم تقم بتقديم أي بلاغات بعد.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingLeft: "4px" }}>
                        {userReports.map((report) => (
                          <div key={report.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{report.place_name}</strong>
                              {getReportStatusBadge(report.status)}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              المشكلة: {getProblemLabelAr(report.problem_type)}
                            </div>
                            {report.admin_reply && (
                              <div style={{ fontSize: "0.78rem", color: "var(--accent-primary)", background: "rgba(108, 99, 255, 0.08)", padding: "6px 10px", borderRadius: "8px" }}>
                                <TbMessageCircleStar /> {report.admin_reply}
                              </div>
                            )}
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>{new Date(report.created_at).toLocaleDateString("ar-EG", { dateStyle: "short" })}</span>
                              {report.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => setReportToRetract(report.id)}
                                  className="ios-btn"
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.78rem",
                                    background: "rgba(255, 59, 48, 0.12)",
                                    color: "#ff3b30",
                                    border: "1px solid rgba(255, 59, 48, 0.2)",
                                    borderRadius: "6px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    maxWidth: "140px"
                                  }}
                                >
                                  <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i> حذف
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    userAppFeedbacks.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        لم تقم بتقديم أي اقتراحات أو شكاوى للتطبيق بعد.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingLeft: "4px" }}>
                        {userAppFeedbacks.map((fb) => (
                          <div key={fb.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                {fb.type === "suggestion" ? (
                                  <>
                                    <BsStars size={20} style={{ color: "var(--accent-primary)" }} />
                                    <span>{fb.category}</span>
                                  </>
                                ) : (
                                  <>
                                    <TbMessageReportFilled size={20} style={{ color: "var(--accent-warning)" }} />
                                    <span>{fb.title}</span>
                                  </>
                                )}
                              </strong>


                              {fb.status === "pending" && <span style={{ background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", padding: "2px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "bold" }}>قيد النظر</span>}
                              {fb.status === "reviewed" && <span style={{ background: "rgba(0, 122, 255, 0.15)", color: "#007aff", padding: "2px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "bold" }}>تمت المراجعة</span>}
                              {fb.status === "action_taken" && <span style={{ background: "rgba(52, 199, 89, 0.15)", color: "#34c759", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "bold" }}>تم اتخاذ إجراء</span>}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                              {fb.content}
                            </p>
                            {fb.image_url && (
                              <a href={fb.image_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent-primary)", textDecoration: "underline", alignSelf: "flex-start" }}>
                                🖼️ عرض الصورة المرفقة
                              </a>
                            )}
                            {fb.admin_reply && (
                              <div style={{ fontSize: "0.78rem", color: "var(--accent-primary)", background: "rgba(108, 99, 255, 0.08)", padding: "6px 10px", borderRadius: "8px" }}>
                                <TbMessageCircleStar /> {fb.admin_reply}
                              </div>
                            )}
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>{new Date(fb.created_at).toLocaleDateString("ar-EG", { dateStyle: "short" })}</span>
                              {fb.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => setFeedbackToDelete(fb)}
                                  className="ios-btn"
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.78rem",
                                    background: "rgba(255, 59, 48, 0.12)",
                                    color: "#ff3b30",
                                    border: "1px solid rgba(255, 59, 48, 0.2)",
                                    borderRadius: "6px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    maxWidth: "120px"
                                  }}
                                >
                                  <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i> حذف
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {/*End My Requests Card */}
      </div>

      {/* ─── Section 3: Security & 2FA (For logged in users) ─── */}
      {user && (
        <div className={styles.sectionCard}>
          {/* Start Change password Card */}
          <div
            className={styles.cardContainer}
            onClick={() => setShowPasswordModal(true)}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "var(--accent-ios)" }}>
                <i className={`bx bx-lock-alt ${styles.securityIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تغيير كلمة المرور</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
          {/*End Change password Card */}
          <hr className={styles.dividerDashed} />
          {/*Start 2FA Card */}
          <div
            className={styles.cardContainer}
            onClick={() => setShow2FAModal(true)}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "var(--accent-secondary)" }}>
                <i className={`bx bx-key ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>
                  المصادقة الثنائية ({activeCount} من 3)
                </h3>

              </div>

            </div>
            {activeCount > 0 ? (
              <i className={`bx bxs-check-circle ${styles.mfaCheckIcon}`}></i>
            ) : (
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            )}

          </div>
          <hr className={styles.dividerDashed} />
          {/*Start Device Management Card */}
          <div
            className={styles.cardContainer}
            onClick={() => {
              fetchDevices();
              setShowDevicesModal(true);
            }}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "#30b0c7" }}>
                <i className={`bx bx-devices ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>إدارة الأجهزة</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
          {/*End Device Management Card */}
        </div>
      )}

      {/* ─── Section 3.5: Suggestions & Bug Reports (For logged in users) ─── */}
      {user && (
        <div className={styles.sectionCard}>
          {/* Start Suggestion Card */}
          <div
            className={styles.cardContainer}
            onClick={() => {
              if (isLimitReached) {
                setMessage({ type: 'error', text: "لقد وصلت للحد الأقصى (5 طلبات معلقة). يرجى الانتظار حتى تقوم الإدارة بمراجعة طلباتك السابقة قبل تقديم اقتراحات جديدة." });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setShowSuggestionModal(true);
              }
            }}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "var(--accent-primary)" }}>
                <i className={`bx bx-message-square-detail ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>تقديم اقتراح لتحسين التطبيق</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
          {/* End Suggestion Card */}
          <hr className={styles.dividerDashed} />
          {/* Start Bug Report Card */}
          <div
            className={styles.cardContainer}
            onClick={() => {
              if (isLimitReached) {
                setMessage({ type: 'error', text: "لقد وصلت للحد الأقصى (5 طلبات معلقة). يرجى الانتظار حتى تقوم الإدارة بمراجعة طلباتك السابقة قبل الإبلاغ عن مشكلات جديدة." });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setShowBugReportModal(true);
              }
            }}
          >
            <div className={styles.cardContent}>
              <div style={{ color: "#ff3b30" }}>
                <i className={`bx bx-bug ${styles.cardIcon}`}></i>
              </div>
              <div>
                <h3 className={styles.cardTitle}>الإبلاغ عن مشكلة في التطبيق</h3>
              </div>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
          {/* End Bug Report Card */}
        </div>
      )}

      {/* ─── Section 4: Help & Support (For logged in users) ─── */}
      <div className={styles.sectionCard}>
        <div
          className={`${styles.cardContainer} ${isHelpExpanded ? styles.helpCardExpanded : ''}`}
          style={{ flexDirection: "column", alignItems: "normal" }}
          onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        >
          <div className={styles.cardContent} style={{ justifyContent: "space-between", }}>
            <div className={styles.helpHeaderLeft}>
              <div style={{ color: "var(--accent-primary)" }}>
                <i className={`bx bx-help-circle ${styles.cardIcon}`}></i>
              </div>
              <h3 className={styles.cardTitle}>التواصل والمساعدة</h3>
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
                  الأسئلة
                </button>
                <button
                  onClick={() => setHelpTab("social")}
                  className={`${styles.tabBtn} ${helpTab === "social" ? styles.tabBtnActive : ''}`}
                >
                  السوشيال
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
                        <i className={`bx bx-bulb ${styles.adminFaqIcon}`}></i> إضافة سؤال  جديد
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
        {/*End Help Center */}
        <hr className={styles.dividerDashed} />
        {/*Start Information Privacy*/}
        <Link href="/privacy" style={{ textDecoration: "none" }}>
          <div className={styles.cardContainer}>
            <div className={styles.cardContent}>
              <div style={{ color: "#00d2ff" }} className={styles.iconWrapper}>
                <i className={`bx bx-shield-quarter ${styles.cardIcon}`}></i>
              </div>
              <h3 className={styles.cardTitle}>سياسة الخصوصية</h3>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
          {/*End Information Privacy*/}
        </Link>
        <hr className={styles.dividerDashed} />
        {/*Start Terms of Use*/}
        <Link href="/terms" style={{ textDecoration: "none" }}>
          <div className={styles.cardContainer}>
            <div className={styles.cardContent}>
              <div style={{ color: "#a51c87ff" }}>
                <i className={`bx bx-file ${styles.cardIcon}`}></i>
              </div>
              <h3 className={styles.cardTitle}>شروط الاستخدام</h3>
            </div>
            <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
          </div>
          {/*End Terms of Use*/}
        </Link>
      </div>

      {/* ─── Section 5: Advanced Settings & Logout ─── */}
      {user && (
        <>
          <div className={styles.sectionCard}>
            {/* Start Logout */}
            <div
              className={styles.cardContainer}
              onClick={() => setShowLogoutModal(true)}
            >
              <div className={styles.cardContent}>
                <div style={{ color: "#ff3b30" }}>
                  <i className={`bx bx-log-out ${styles.cardIcon}`}></i>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>تسجيل الخروج</h3>
                </div>
              </div>
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            </div>
            {/* End Logout */}
            <hr className={styles.dividerDashed} />
            {/* Start Delete Account */}
            <div
              className={styles.cardContainer}
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmation(""); }}
            >
              <div className={styles.cardContent}>
                <div style={{ color: "#ff3b30" }}>
                  <i className={`bx bx-user-minus ${styles.cardIcon}`}></i>
                </div>
                <div>
                  <h3 className={styles.cardTitle} style={{ color: "#ff3b30" }}>حذف الحساب</h3>
                </div>
              </div>
              <i className={`bx bx-chevron-left ${styles.chevronIcon}`}></i>
            </div>
          </div>
        </>
      )}

      {/* ─── Footer Card (Noon Style) ─── */}
      <div className={styles.footerCard} style={{ marginBottom: "100px" }}>
        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>
            سياسة الخصوصية
          </Link>
          <Link href="/terms" className={styles.footerLink}>
            شروط الاستخدام
          </Link>
        </div>

        <hr className={styles.footerDivider} />

        <div className={styles.socialRow}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconWrapper} title="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconWrapper} title="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconWrapper} title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconWrapper} title="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        <div className={styles.versionText}>
          الإصدار v0.1.0 (260802)
        </div>

        <div className={styles.copyrightText}>
          © 2026 القاهرة ماب. جميع الحقوق محفوظة
        </div>
      </div>

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
                  {loading ? "جاري الحذف..." : "حذف "}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`}>
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

      {/* ─── Device Management Modal ─── */}
      {showDevicesModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`}>
          <div className={`glass-panel ${styles.devicesModalPanel}`}>
            <div className={styles.modalCloseHeader}>
              <h3 className={styles.devicesModalTitle}>إدارة الأجهزة النشطة</h3>
              <button onClick={() => setShowDevicesModal(false)} className={styles.modalCloseIconBtn}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }}></i>
              </button>
            </div>
            <p className={styles.devicesModalSubtitle}>
              الأجهزة المسجلة حالياً بحسابك. يمكنك تسجيل الخروج من أي جهاز عن بُعد.
            </p>

            <div className={styles.devicesListContainer}>
              {loadingDevices ? (
                <div className={styles.devicesSpinnerContainer}>
                  <div className="spinner" />
                  <p>جاري تحميل الأجهزة...</p>
                </div>
              ) : devicesList.length === 0 ? (
                <p className={styles.noDevicesText}>لا توجد أجهزة مسجلة حالياً.</p>
              ) : (
                <div className={styles.devicesListGap}>
                  {devicesList.map((device) => {
                    const isCurrent = typeof window !== "undefined" && device.session_id === localStorage.getItem("dftry_device_session_id");
                    return (
                      <div key={device.id} className={`${styles.deviceItem} ${isCurrent ? styles.currentDeviceItem : ''}`}>
                        <div className={styles.deviceItemLeft}>
                          <div className={styles.deviceIconBox}>
                            <i className={`bx ${device.device_name.includes("iOS") || device.device_name.includes("Android") ? "bx-mobile-alt" : "bx-laptop"} ${styles.deviceIcon}`}></i>
                          </div>
                          <div className={styles.deviceInfoTexts}>
                            <div className={styles.deviceNameRow}>
                              <span className={styles.deviceName}>{device.device_name}</span>
                              {isCurrent && <span className={styles.currentDeviceBadge}>هذا الجهاز</span>}
                              {device.is_active && !isCurrent && <span className={styles.activeDeviceBadge}>نشط</span>}
                            </div>
                            <div className={styles.deviceMetaRow}>
                              <span>📍 {device.location || "موقع غير معروف"}</span>
                              <span className={styles.metaDivider}>•</span>
                              <span>📅 {new Date(device.logged_in_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            {!device.is_active && device.logged_out_at && (
                              <div className={styles.loggedOutTimeText}>
                                تم تسجيل الخروج في: {new Date(device.logged_out_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            )}
                          </div>
                        </div>

                        {device.is_active && (
                          <button
                            onClick={() => handleDeactivateDevice(device.id, device.session_id)}
                            className={styles.deactivateDeviceBtn}
                            title="تسجيل الخروج وإنهاء الجلسة"
                          >
                            <i className="bx bx-log-out"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button className="ios-btn" onClick={() => setShowDevicesModal(false)} style={{ width: "100%", marginTop: "16px" }}>
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`}>
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
                {passwordLoading ? "جاري التغيير..." : "تأكيد"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`}>
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

      {/* Delete Feedback Confirmation Modal */}
      {feedbackToDelete && (
        <div
          className={`modal-backdrop ${styles.modalBackdrop}`}
          onClick={() => setFeedbackToDelete(null)}
        >
          <div
            className={`glass-panel alert-dialog ${styles.deleteModalDialog}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteModalIconWrapper}>
                <i className={`bx bx-trash ${styles.deleteModalHeaderIcon}`}></i>
              </div>
              <h3 className={styles.deleteModalHeaderTitle}>تأكيد الحذف</h3>
              <p className={styles.deleteModalHeaderSub}>
                هل أنت متأكد من حذف هذا الاقتراح/البلاغ؟
              </p>
            </div>

            {/* Body */}
            <div className={styles.deleteModalBody}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "20px", textAlign: "center", lineHeight: "1.6" }}>
                سيتم حذف هذا الطلب نهائياً من سجلاتك ولا يمكن التراجع عن هذه الخطوة.
              </p>

              {/* Actions */}
              <div className={styles.deleteModalActions}>
                <button
                  className={`ios-btn ${styles.deleteBtnCancel}`}
                  onClick={() => setFeedbackToDelete(null)}
                >
                  <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
                </button>
                <button
                  className={`ios-btn ${styles.deleteBtnConfirm}`}
                  onClick={async () => {
                    if (!supabase || !user || !feedbackToDelete) return;
                    try {
                      const { error } = await supabase
                        .from("app_feedback")
                        .delete()
                        .eq("id", feedbackToDelete.id)
                        .eq("user_id", user.id);
                      if (error) throw error;
                      alert("تم حذف الطلب بنجاح.");
                      setFeedbackToDelete(null);
                      fetchUserRequestsAndReports();
                    } catch (err: any) {
                      alert("فشل حذف الطلب: " + err.message);
                    }
                  }}
                >
                  <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i> تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retract Proposal Confirmation Modal */}
      {proposalToRetract && (
        <div
          className={`modal-backdrop ${styles.modalBackdrop}`}
          onClick={() => setProposalToRetract(null)}
        >
          <div
            className={`glass-panel alert-dialog ${styles.deleteModalDialog}`}
            style={{ border: "1px solid rgba(255, 149, 0, 0.25)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.deleteModalHeader} style={{ background: "rgba(255, 149, 0, 0.08)", borderBottom: "1px solid rgba(255, 149, 0, 0.15)" }}>
              <div className={styles.deleteModalIconWrapper} style={{ background: "rgba(255, 149, 0, 0.15)" }}>
                <i className={`bx bx-undo ${styles.deleteModalHeaderIcon}`} style={{ color: "#ff9500" }}></i>
              </div>
              <h3 className={styles.deleteModalHeaderTitle} style={{ color: "#ff9500" }}>تأكيد التراجع</h3>
              <p className={styles.deleteModalHeaderSub}>
                هل أنت متأكد من التراجع عن هذا الاقتراح؟
              </p>
            </div>

            {/* Body */}
            <div className={styles.deleteModalBody}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "20px", textAlign: "center", lineHeight: "1.6" }}>
                سيتم سحب اقتراح هذا المكان ولن يعود معروضاً للمراجعة من قِبل المشرفين.
              </p>

              {/* Actions */}
              <div className={styles.deleteModalActions}>
                <button
                  className={`ios-btn ${styles.deleteBtnCancel}`}
                  onClick={() => setProposalToRetract(null)}
                >
                  <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
                </button>
                <button
                  className={`ios-btn`}
                  style={{ flex: 1, background: "#ff9500", color: "#fff" }}
                  onClick={async () => {
                    const pid = proposalToRetract;
                    setProposalToRetract(null);
                    await handleRetractProposal(pid);
                  }}
                >
                  <i className="bx bx-check" style={{ fontSize: "1.2rem" }}></i> تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retract Report Confirmation Modal */}
      {reportToRetract && (
        <div
          className={`modal-backdrop ${styles.modalBackdrop}`}
          onClick={() => setReportToRetract(null)}
        >
          <div
            className={`glass-panel alert-dialog ${styles.deleteModalDialog}`}
            style={{ border: "1px solid rgba(255, 149, 0, 0.25)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteModalIconWrapper}>
                <i className={`bx bx-undo ${styles.deleteModalHeaderIcon}`}></i>
              </div>
              <h3 className={styles.deleteModalHeaderTitle}>تأكيد التراجع</h3>
              <p className={styles.deleteModalHeaderSub}>
                هل أنت متأكد من حذف هذا البلاغ؟
              </p>
            </div>

            {/* Body */}
            <div className={styles.deleteModalBody}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "20px", textAlign: "center", lineHeight: "1.6" }}>
                سيتم إغلاق وسحب هذا البلاغ ولن تتخذه الإدارة بعين الاعتبار.
              </p>

              {/* Actions */}
              <div className={styles.deleteModalActions}>
                <button
                  className={`ios-btn ${styles.deleteBtnCancel}`}
                  onClick={() => setReportToRetract(null)}
                >
                  <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
                </button>
                <button
                  className={`ios-btn ${styles.deleteBtnConfirm}`}
                  onClick={async () => {
                    const rid = reportToRetract;
                    setReportToRetract(null);
                    await handleRetractReport(rid);
                  }}
                >
                  <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i> تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {isRemindersModalOpen && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => setIsRemindersModalOpen(false)}>
          <div className={`glass-panel ${styles.devicesModalPanel}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalCloseHeader}>
              <h3 className={styles.devicesModalTitle}>تذكيراتي وملاحظاتي</h3>
              <button onClick={() => setIsRemindersModalOpen(false)} className={styles.modalCloseIconBtn}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }}></i>
              </button>
            </div>
            <p className={styles.devicesModalSubtitle}>
              إجمالي الملاحظات والتذكيرات المضافة للأماكن: {reminders.length}
            </p>

            <div className={styles.devicesListContainer}>
              {loadingReminders ? (
                <div className={styles.devicesSpinnerContainer}>
                  <div className="spinner" />
                  <p>جاري تحميل التذكيرات...</p>
                </div>
              ) : reminders.length === 0 ? (
                <p className={styles.noDevicesText}>لا يوجد أي ملاحظات أو تذكيرات مضافة بعد.</p>
              ) : (
                <div className={styles.devicesListGap}>
                  {reminders.map((rem) => (
                    <div
                      key={rem.id}
                      onClick={() => { setIsRemindersModalOpen(false); router.push(`/places/${rem.placeId}`); }}
                      className={styles.deviceItem}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.deviceItemLeft}>
                        <div className={styles.deviceIconBox} style={{ color: "#34c759", background: "rgba(52, 199, 89, 0.1)" }}>
                          <i className={`bx bx-notepad ${styles.deviceIcon}`}></i>
                        </div>
                        <div className={styles.deviceInfoTexts}>
                          <div className={styles.deviceNameRow}>
                            <span className={styles.deviceName}>{rem.placeName}</span>
                          </div>
                          <p style={{ margin: "4px 0", fontSize: "0.88rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                            {rem.note}
                          </p>
                          <div className={styles.deviceMetaRow}>
                            <span>📅 {new Date(rem.updatedAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteReminder(e, rem.id)}
                        className={styles.deactivateDeviceBtn}
                        title="حذف الملاحظة"
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="ios-btn" onClick={() => setIsRemindersModalOpen(false)} style={{ width: "100%", marginTop: "16px" }}>
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {selectedNotification && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => setSelectedNotification(null)}>
          <div className={`glass-panel ${styles.devicesModalPanel}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalCloseHeader}>
              <h3 className={styles.devicesModalTitle}>{selectedNotification.title}</h3>
              <button onClick={() => setSelectedNotification(null)} className={styles.modalCloseIconBtn}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }}></i>
              </button>
            </div>

            <p className={styles.devicesModalSubtitle}>
              📅 {new Date(selectedNotification.created_at).toLocaleString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>

            <div className={styles.devicesListContainer}>
              <div
                className={styles.deviceItem}
                style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-glass)", padding: "16px" }}
              >
                <div className={styles.deviceItemLeft} style={{ alignItems: "flex-start" }}>
                  <div
                    className={styles.deviceIconBox}
                    style={{
                      color: selectedNotification.type === "success" ? "#34c759" : selectedNotification.type === "warning" ? "#ff9500" : "var(--accent-primary)",
                      background: selectedNotification.type === "success" ? "rgba(52, 199, 89, 0.1)" : selectedNotification.type === "warning" ? "rgba(255, 149, 0, 0.1)" : "rgba(0, 111, 238, 0.1)"
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>
                      {selectedNotification.type === "success" ? "✅" : selectedNotification.type === "warning" ? "⚠️" : "🔔"}
                    </span>
                  </div>
                  <div className={styles.deviceInfoTexts}>
                    <p style={{ margin: "0", fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {selectedNotification.link && (
                <button
                  onClick={() => { setSelectedNotification(null); router.push(selectedNotification.link); }}
                  className="ios-btn ios-btn-primary"
                  style={{ flex: 1 }}
                >
                  الرابط  <i className="bx bx-link-external" style={{ marginRight: "6px" }}></i>
                </button>
              )}
              <button className="ios-btn" onClick={() => setSelectedNotification(null)} style={{ flex: 1 }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Modal */}
      {showSuggestionModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => setShowSuggestionModal(false)}>
          <div className={`glass-panel ${styles.passwordModalPanel}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalCloseHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handleSendSuggestion}
                disabled={suggestionLoading || !isSuggestionFormValid}
                className={styles.modalCloseIconBtn}
                style={{
                  background: isSuggestionFormValid ? "var(--accent-ios)" : "rgba(120, 120, 128, 0.12)",
                  border: "1px solid var(--border-glass)",
                  color: isSuggestionFormValid ? "#fff" : "var(--text-muted)",
                  cursor: (suggestionLoading || !isSuggestionFormValid) ? "not-allowed" : "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  fontWeight: "bold",
                  transition: "all 0.2s ease"
                }}
              >
                <i className="bx bx-paper-plane" style={{ fontSize: "1.5rem" }}></i>

              </button>
              <h3 className={styles.passwordModalTitle} style={{ margin: 0, fontSize: "1rem", fontWeight: "700" }}>تقديم اقتراح</h3>
              <button onClick={() => setShowSuggestionModal(false)} className={styles.modalCloseIconBtn} style={{ background: "rgba(109, 107, 107, 0.12)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", cursor: "pointer", padding: "8px", borderRadius: "50%", fontWeight: "bold", height: "fit-content", width: "fit-content" }}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }}></i>
              </button>
            </div>
            <p className={styles.passwordModalSubtitle}>
              ساعدنا في تحسين الخدمة.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold" }}>نوع الاقتراح</label>
              <select
                value={suggestionType}
                onChange={e => setSuggestionType(e.target.value)}
                className="ios-input help-select"
                style={{ fontFamily: "var(--font-cairo)" }}
              >
                <option value="اقتراح لتحسين الشكل">اقتراح لتحسين الشكل</option>
                <option value="اقتراح إضافة ميزة جديدة">اقتراح إضافة ميزة جديدة</option>
                <option value="اقتراح آخر">اقتراح آخر</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold" }}>رسالة الاقتراح</label>
              <textarea
                className="ios-input"
                style={{ width: "100%", minHeight: "120px", padding: "12px", resize: "vertical", fontFamily: "var(--font-cairo)" }}
                placeholder="اكتب تفاصيل اقتراحك هنا..."
                value={suggestionMessage}
                onChange={e => setSuggestionMessage(e.target.value)}
              />
            </div>


          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {showBugReportModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => {
          if (!bugLoading && !bugUploading) {
            setShowBugReportModal(false);
            setBugType("");
            setBugDetails("");
            setBugImage("");
            setBugImageFile(null);
          }
        }}>
          <div className={`glass-panel ${styles.passwordModalPanel}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalCloseHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handleSendBugReport}
                disabled={bugLoading || bugUploading}
                className={styles.modalCloseIconBtn}
                style={{
                  background: isBugFormValid ? "var(--accent-ios)" : "rgba(120, 120, 128, 0.12)",
                  border: "1px solid var(--border-glass)",
                  color: isBugFormValid ? "#fff" : "var(--text-muted)",
                  cursor: bugLoading || bugUploading ? "not-allowed" : "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  fontWeight: "bold",
                  transition: "all 0.2s ease"
                }}
              >
                <i className="bx bx-paper-plane" style={{ fontSize: "1.5rem" }}></i>

              </button>
              <h3 className={styles.passwordModalTitle} style={{ margin: 0, fontSize: "1rem", fontWeight: "700" }}>الإبلاغ عن مشكلة</h3>
              <button
                onClick={() => {
                  setShowBugReportModal(false);
                  setBugType("");
                  setBugDetails("");
                  setBugImage("");
                  setBugImageFile(null);
                }}
                className={styles.modalCloseIconBtn}
                style={{ background: "rgba(109, 107, 107, 0.12)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", cursor: "pointer", padding: "8px", borderRadius: "50%", fontWeight: "bold", height: "fit-content", width: "fit-content" }}
                disabled={bugLoading || bugUploading}
              >
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }}></i>
              </button>
            </div>
            <p className={styles.passwordModalSubtitle}>
              يرجى تزويدنا بتفاصيل المشكلة لحلها.
            </p>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold" }}>نوع المشكلة</label>
              <input
                type="text"
                className="ios-input"
                placeholder="مثال: مشكلة في تسجيل الدخول، بطء الصفحة، إلخ."
                value={bugType}
                onChange={e => setBugType(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold" }}>تفاصيل المشكلة</label>
              <textarea
                className="ios-input"
                style={{ width: "100%", minHeight: "100px", padding: "12px", resize: "vertical", fontFamily: "var(--font-cairo)" }}
                placeholder="يرجى كتابة تفاصيل ما حدث..."
                value={bugDetails}
                onChange={e => setBugDetails(e.target.value)}
              />
            </div>

            {/* Upload Image Section */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold" }}>إرفاق صورة للمشكلة (اختياري)</label>
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px dashed var(--border-glass)",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                position: "relative",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                height: "120px"
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBugImageChange}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer", width: "100%" }}
                  disabled={bugLoading || bugUploading}
                />
                {bugImage ? (
                  <div style={{ position: "relative", width: "100%", height: "100px" }}>
                    <img src={bugImage} alt="معاينة الصورة" style={{ width: "100%", height: "100px", objectFit: "contain", borderRadius: "8px" }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setBugImage(""); setBugImageFile(null); }}
                      style={{ position: "absolute", top: "0px", left: "0px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <i className="bx bx-camera" style={{ fontSize: "1.8rem", color: "var(--text-muted)" }}></i>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                      اضغط لاختيار صورة، رفع ملف، أو التقاط صورة جديدة
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points & Rewards Wallet Modal */}
      {showPointsModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => setShowPointsModal(false)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "24px 28px",
              borderRadius: "16px",
              background: "var(--bg-primary)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border-glass)",
              animation: "slide-up 0.3s ease",
              maxHeight: "90vh",
              overflowY: "auto",
              direction: "rtl",
              textAlign: "right"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <button
                onClick={() => setShowPointsModal(false)}
                className="closeBut"
              >
                <i className="bx bx-x"></i>
              </button>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-cairo)" }}>
                عملة ماب القاهرة
              </h3>
              <div style={{ width: "38px" }}></div>
            </div>

            {/* Wallet Dashboard Section */}
            <div style={{ textAlign: "center", padding: "12px 0 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Image src="/image/profile/coin3dMapCairo.png"
                  alt="عملة ماب القاهرة"
                  draggable={false}
                  width={100}
                  height={100}
                  style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }} />
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700", fontFamily: "var(--font-cairo)" }}>
                الرصيد الحالي
              </span>
              <h2 style={{ fontSize: "2.4rem", fontWeight: "700", color: "#cc9303c4", margin: "4px 0", fontFamily: "var(--font-tenor-sans)" }}>
                {formatNumber(profile?.points ?? 0)}
              </h2>
              <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "bold", background: "rgba(16, 185, 129, 0.08)", padding: "2px 10px", borderRadius: "10px" }}>
                تساوي {formatNumber((profile?.points ?? 0) / 100, 2)} ج.م
              </span>
            </div>

            {/* Actions Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowConvertSection(!showConvertSection);
                  setConvertStatus(null);
                }}
                className="ios-btn ios-btn-primary"
                style={{ flex: 1, padding: "8px 4px", justifyContent: "center", fontSize: "0.9rem" }}
              >
                <IoWalletOutline style={{ fontSize: "1rem" }} />
                التحويل لرصيد
              </button>
              <button
                type="button"
                disabled
                className="ios-btn"
                style={{
                  flex: 1,
                  padding: "12px",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  opacity: 0.5,
                  cursor: "not-allowed",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(77, 77, 77, 0.38)"
                }}
              >
                <CiShop style={{ fontSize: "1rem" }} />
                استخدام العملة
              </button>
            </div>

            {/* Convert Section */}
            {showConvertSection && (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "24px",
                  animation: "slide-up 0.2s ease"
                }}
              >
                <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontFamily: "var(--font-cairo)", fontWeight: "700", color: "var(--text-primary)" }}>
                  تحويل النقاط إلى رصيد محفظة كاش
                </h4>
                <p style={{ margin: "0 0 14px", fontSize: "0.78rem", fontFamily: "var(--font-cairo)", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  الحد الأدنى للتحويل هو 1000 نقطة. كل 100 نقطة تساوي 1.00 جنيه مصري. سيتم إضافة الرصيد مباشرة إلى رصيدك الأساسي.
                </p>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
                  <input
                    type="number"
                    min="1000"
                    step="1"
                    className="ios-input"
                    placeholder="أدخل عدد النقاط (1000 كحد أدنى)"
                    value={convertPointsAmount}
                    onChange={(e) => setConvertPointsAmount(e.target.value)}
                    style={{ flex: 1, fontSize: "0.8rem", textAlign: "center", fontWeight: "700", padding: "8px 6px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setConvertPointsAmount((profile?.points ?? 0).toString())}
                    className="ios-btn"
                    style={{ padding: "8px 6px", fontSize: "0.82rem", whiteSpace: "nowrap", fontWeight: "bold", width: "25%", border: "1px solid var(--border-glass)" }}
                  >
                    الأقصي
                  </button>
                </div>

                {convertPointsAmount && !isNaN(parseInt(convertPointsAmount)) && parseInt(convertPointsAmount) >= 1000 && (
                  <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "bold", textAlign: "center", marginBottom: "14px" }}>
                    ستحصل على: {formatNumber(parseInt(convertPointsAmount) / 100, 2)} ج.م
                  </div>
                )}

                {convertStatus && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "14px",
                      background: convertStatus.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: convertStatus.type === "success" ? "#10b981" : "#f87171",
                      border: convertStatus.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                    }}
                  >
                    {convertStatus.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConvertPoints}
                  disabled={convertingPoints}
                  className="ios-btn ios-btn-primary"
                  style={{ width: "100%", padding: "10px", justifyContent: "center", fontSize: "0.85rem", background: "var(--accent-primary)", borderColor: "var(--accent-primary)" }}
                >
                  <IoWalletOutline style={{ fontSize: "1rem" }} />
                  {convertingPoints ? "جاري التحويل..." : "تأكيد عملية التحويل"}
                </button>
              </div>
            )}

            {/* Explanation Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
              {/* What is Cairo Map Coin */}
              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: "0.92rem", fontWeight: "800", color: "#9e7100ff", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="bx bx-info-circle" style={{ fontSize: "1.1rem" }}></i>
                  ما هي عملة ماب القاهرة؟
                </h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  هي عملة رقمية تكافئية خاصة بمجتمع ماب القاهرة، صُممت لتشجيع المستخدمين على إثراء محتوى الدليل وتحسين جودة البيانات ومساعدة الآخرين، ويمكن الاستفادة منها عبر تحويلها مباشرة إلى كاش أو استخدامها في خدمات الموقع المختلفة.
                </p>
              </div>

              {/* How to Earn */}
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.92rem", fontWeight: "800", color: "#002a9eff", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="bx bx-plus-circle" style={{ fontSize: "1.1rem" }}></i>
                  كيف تكسب النقاط؟
                </h4>
                <ul style={{ margin: 0, paddingRight: "0", listStyle: "none", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-plus-circle" style={{ color: "#0025f7ff", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <Link href="/propose-place" onClick={() => setShowPointsModal(false)} style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>
                        إضافة الأماكن:
                      </Link>{" "}
                      عند اقتراح إضافة مكان جديد للدليل.
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-error-alt" style={{ color: "#ff3b30", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <Link href="/directory" onClick={() => setShowPointsModal(false)} style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>
                        الإبلاغ عن المشاكل:
                      </Link>{" "}
                      عند الإبلاغ عن بيانات خاطئة أو مكان مغلق ويتم اتخاذ إجراء لتعديله.
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-edit-alt" style={{ color: "#10b981", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <Link href="/directory" onClick={() => setShowPointsModal(false)} style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>
                        تحسين وتدقيق البيانات:
                      </Link>{" "}
                      المساعدة في جعل ماب القاهرة أكثر دقة وتحديثاً.
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-gift" style={{ color: "#3b82f6", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>الهدايا والمكافآت:</span> الجوائز اليومية والمسابقات والفعاليات المنظمة.
                    </div>
                  </li>
                </ul>
              </div>

              {/* How to Use */}
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.92rem", fontWeight: "800", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="bx bx-help-circle" style={{ fontSize: "1.1rem" }}></i>
                  كيف تستخدم النقاط؟
                </h4>
                <ul style={{ margin: "0 0 30px 0", paddingRight: "0", listStyle: "none", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-transfer-alt" style={{ color: "#10b981", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <strong>التحويل لرصيد كاش:</strong> تحويلها مباشرة إلى رصيد مالي في محفظتك الشخصية (كل 100 نقطة = 1 جنيه مصري).
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-purchase-tag-alt" style={{ color: "#3b82f6", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <strong>اشتراكات الموقع والمشتريات:</strong> دفع قيمة الاشتراكات المميزة أو شراء السلع من متجر الموقع.
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-calendar-event" style={{ color: "#8b5cf6", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <strong>حجوزات وفواتير:</strong> دفع قيمة كشوفات الأطباء، حجوزات الأماكن، وفواتير الأكل والخدمات.
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-cycling" style={{ color: "#fbbf24", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <strong>إكرامية وتوصيل:</strong> دفع قيمة فواتير الديلفري أو تقديم إكرامية (Tips) لسائقي التوصيل.
                    </div>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <i className="bx bx-heart" style={{ color: "#ef4444", fontSize: "1.05rem", marginTop: "3px" }}></i>
                    <div>
                      <strong>التبرع والمساعدة:</strong> إمكانية التبرع بالنقاط للمؤسسات الخيرية مباشرة.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Subscription Modal ─── */}
      {showSubModal && (() => {
        const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
        return (
          <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => setShowSubModal(false)}>
            <div
              className="glass-panel"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "960px",
                width: "100%",
                padding: "24px 28px",
                borderRadius: "16px",
                background: "var(--bg-primary)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                border: "1px solid var(--border-glass)",
                animation: "slide-up 0.3s ease",
                maxHeight: "90vh",
                overflowY: "auto",
                direction: "rtl",
                textAlign: "right"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", fontFamily: "var(--font-heading)" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bx bxs-crown" style={{ color: "#fbbf24" }}></i>
                  باقات ماب القاهرة
                </h3>
                <button
                  onClick={() => setShowSubModal(false)}
                  className="closeBut"
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>

              {/* Current Tier Info & Wallet Info Summary */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-secondary)",
                padding: "14px 20px",
                borderRadius: "12px",
                marginBottom: "24px",
                border: "1px solid rgba(255,255,255,0.05)",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>باقيتك الحالية:</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-primary)", marginTop: "2px" }}>
                    {profile?.subscription_tier === 'mishwar'
                      ? (profile?.subscription_status === 'cancelled' ? ' باقة المشوار (بانتظار الإلغاء)' : ' باقة المشوار (نشط)')
                      : profile?.subscription_tier === 'silver'
                        ? (profile?.subscription_status === 'cancelled' ? ' الباقة الفضية (بانتظار الإلغاء)' : ' الباقة الفضية (نشط)')
                        : profile?.subscription_tier === 'gold'
                          ? (profile?.subscription_status === 'cancelled' ? ' الباقة الذهبية (بانتظار الإلغاء)' : ' الباقة الذهبية (نشط)')
                          : 'الباقة المجانية'}
                  </div>
                  {profile?.subscription_tier !== 'free' && profile?.subscription_end && (
                    <div style={{ fontSize: "0.78rem", color: profile?.subscription_status === 'cancelled' ? '#ef4444' : 'var(--accent-gold, #eab308)', marginTop: "2px" }}>
                      {profile?.subscription_status === 'cancelled'
                        ? `تم إلغاء التجديد التلقائي. ستنتهي في: ${new Date(profile.subscription_end).toLocaleDateString('ar-EG')}`
                        : `تاريخ انتهاء الصلاحية: ${new Date(profile.subscription_end).toLocaleDateString('ar-EG')}`}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>رصيد محفظتك الحالي:</div>
                  <strong style={{ color: "#22c55e", fontSize: "1.15rem", marginTop: "2px", display: "block" }}>
                    {(profile?.balance ?? 0).toFixed(2)} ج.م
                  </strong>
                </div>
              </div>

              {/* Status Messages */}
              {subMessage && (
                <div style={{
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  background: subMessage.type === "success" ? "rgba(52, 199, 89, 0.15)" : "rgba(255, 59, 48, 0.15)",
                  color: subMessage.type === "success" ? "#34c759" : "#ff3b30",
                  fontSize: "0.88rem",
                  border: subMessage.type === "success" ? "1px solid rgba(52, 199, 89, 0.3)" : "1px solid rgba(255, 59, 48, 0.3)"
                }}>
                  {subMessage.text}
                </div>
              )}

              {/* Toggle Billing Period */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
                <div style={{ display: "inline-flex", background: "var(--bg-muted)", padding: "4px", borderRadius: "30px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionPeriod("monthly");
                      setSubMessage(null);
                    }}
                    style={{
                      padding: "6px 24px",
                      borderRadius: "20px",
                      background: subscriptionPeriod === "monthly" ? "linear-gradient(135deg, #cac7ffff 0%, #84b3ffff 100%)" : "none",
                      border: "none",
                      color: "var(--text-prmiry)",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "var(--font-heading)",
                      transition: "all 0.2s"
                    }}
                  >
                    شهري
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionPeriod("yearly");
                      setSubMessage(null);
                    }}
                    style={{
                      padding: "6px 24px",
                      borderRadius: "20px",
                      background: subscriptionPeriod === "yearly" ? "linear-gradient(135deg, #cac7ffff 0%, #84b3ffff 100%)" : "none",
                      border: "none",
                      color: "var(--text-prmiry)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    سنوي (توفير 15%+)
                  </button>
                </div>
              </div>

              {/* Carousel Container */}
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="sub-carousel"
                style={{
                  display: "flex",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  gap: "20px",
                  padding: "10px 4px 20px",
                  marginBottom: "10px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollBehavior: "smooth"
                }}
              >
                <style dangerouslySetInnerHTML={{
                  __html: `
                .sub-carousel::-webkit-scrollbar {
                  display: none;
                }
              `}} />

                {/* Card 1: Free */}
                <div style={{
                  background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
                  border: (!profile?.subscription_tier || profile?.subscription_tier === "free") ? "2px solid var(--border-glass)" : "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  transition: "all 0.3s",
                  width: "280px",
                  flexShrink: 0,
                  scrollSnapAlign: "center"
                }}>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 8px" }}>الباقة المجانية</h4>
                    <div style={{fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "16px" }}>0 ج.م</div>

                    <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: "16px 0" }} />

                    <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.5", listStyleType: "disc" }}>
                      <li>تصفح خطوط المترو الأساسية والبحث</li>
                      <li>عرض جداول المواعيد والمحطات التبادلية</li>
                      <li style={{ textDecoration: "line-through", opacity: 0.5 }}>خريطة المونوريل التفاعلية الكاملة</li>
                      <li style={{ textDecoration: "line-through", opacity: 0.5 }}>دليل &quot;ازاي اروح&quot; للمواصلات</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={subscribing || !profile?.subscription_tier || profile?.subscription_tier === "free"}
                    onClick={() => handleConfirmSubscribe("free", null)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: (!profile?.subscription_tier || profile?.subscription_tier === "free") ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
                      color: (!profile?.subscription_tier || profile?.subscription_tier === "free") ? "#64748b" : "#fff",
                      border: "none",
                      fontWeight: "bold",
                      marginTop: "24px",
                      cursor: (!profile?.subscription_tier || profile?.subscription_tier === "free") ? "default" : "pointer",
                      fontSize: "0.88rem"
                    }}
                  >
                    {(!profile?.subscription_tier || profile?.subscription_tier === "free") ? "باقتك الحالية" : "الرجوع للمجانية"}
                  </button>
                </div>

                {/* Card 1.5: Mishwar */}
                <div style={{
                  background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
                  border: profile?.subscription_tier === "mishwar" ? "2px solid #10b981" : "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  boxShadow: profile?.subscription_tier === "mishwar" ? "0 8px 24px rgba(16, 185, 129, 0.15)" : "none",
                  transition: "all 0.3s",
                  width: "280px",
                  flexShrink: 0,
                  scrollSnapAlign: "center"
                }}>
                  <div>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚡</div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 8px" }}>باقة المشوار</h4>
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "16px" }}>
                      9 ج.م
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                        {" "} / 24 ساعة
                      </span>
                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: "16px 0" }} />

                    <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.5", listStyleType: "disc" }}>
                      <li style={{ color: "#10b981", fontWeight: "bold" }}>صلاحية كاملة لمدة 24 ساعة ⏱️</li>
                      <li>تصفح خطوط المترو الأساسية والبحث</li>
                      <li>خريطة المونوريل التفاعلية الكاملة 🚄</li>
                      <li style={{ color: "#fbbf24", fontWeight: "bold" }}>محرك البحث المتقدم &quot;ازاي اروح&quot; للمواصلات 🗺️</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={subscribing || (profile?.subscription_tier === "mishwar" && !isExpired)}
                    onClick={() => handleConfirmSubscribe("mishwar", "daily")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: (profile?.subscription_tier === "mishwar" && !isExpired) ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: (profile?.subscription_tier === "mishwar" && !isExpired) ? "#64748b" : "#fff",
                      border: "none",
                      fontWeight: "bold",
                      marginTop: "24px",
                      cursor: (profile?.subscription_tier === "mishwar" && !isExpired) ? "default" : "pointer",
                      fontSize: "0.88rem"
                    }}
                  >
                    {subscribing && selectedPlanId === "mishwar" ? "جاري التفعيل..." :
                      (profile?.subscription_tier === "mishwar" && !isExpired) ? "باقتك الحالية" : "اشترك الآن"}
                  </button>
                </div>

                {/* Card 2: Silver */}
                <div style={{
                  background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
                  border: profile?.subscription_tier === "silver" ? "2px solid #6366f1" : "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  boxShadow: profile?.subscription_tier === "silver" ? "0 8px 24px rgba(99, 102, 241, 0.15)" : "none",
                  transition: "all 0.3s",
                  width: "280px",
                  flexShrink: 0,
                  scrollSnapAlign: "center"
                }}>
                  <div>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🥈</div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 8px" }}>الباقة الفضية</h4>
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "16px" }}>
                      {subscriptionPeriod === "monthly" ? "40 ج.م" : "450 ج.م"}
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                        {subscriptionPeriod === "monthly" ? " / شهرياً" : " / سنوياً"}
                      </span>
                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: "16px 0" }} />

                    <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.5", listStyleType: "disc" }}>
                      <li>تصفح خطوط المترو الأساسية والبحث</li>
                      <li>عرض جداول المواعيد والمحطات التبادلية</li>
                      <li style={{ color: "var(--text-primary)", fontWeight: "bold" }}>خريطة المونوريل التفاعلية الكاملة 🚄</li>
                      <li style={{ textDecoration: "line-through", opacity: 0.5 }}>دليل &quot;ازاي اروح&quot; للمواصلات</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={subscribing || (profile?.subscription_tier === "silver" && profile?.subscription_period === subscriptionPeriod)}
                    onClick={() => handleConfirmSubscribe("silver", subscriptionPeriod)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: (profile?.subscription_tier === "silver" && profile?.subscription_period === subscriptionPeriod) ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                      color: (profile?.subscription_tier === "silver" && profile?.subscription_period === subscriptionPeriod) ? "#64748b" : "#fff",
                      border: "none",
                      fontWeight: "bold",
                      marginTop: "24px",
                      cursor: (profile?.subscription_tier === "silver" && profile?.subscription_period === subscriptionPeriod) ? "default" : "pointer",
                      fontSize: "0.88rem"
                    }}
                  >
                    {subscribing && selectedPlanId === "silver" ? "جاري التفعيل..." :
                      (profile?.subscription_tier === "silver" && profile?.subscription_period === subscriptionPeriod) ? "باقتك الحالية" : "اشترك الآن"}
                  </button>
                </div>

                {/* Card 3: Gold */}
                <div style={{
                  background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
                  border: profile?.subscription_tier === "gold" ? "2px solid #eab308" : "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  boxShadow: profile?.subscription_tier === "gold" ? "0 8px 24px rgba(234, 179, 8, 0.15)" : "none",
                  transition: "all 0.3s",
                  width: "280px",
                  flexShrink: 0,
                  scrollSnapAlign: "center"
                }}>
                  <div style={{ position: "absolute", top: "-12px", right: "20px", background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", color: "#000", fontSize: "0.68rem", fontWeight: "900", padding: "3px 12px", borderRadius: "20px", border: "1px solid #fbbf24" }}>
                    الأكثر تميزاً ⭐
                  </div>
                  <div>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🥇</div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 8px" }}>الباقة الذهبية</h4>
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "16px" }}>
                      {subscriptionPeriod === "monthly" ? "60 ج.م" : "700 ج.م"}
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                        {subscriptionPeriod === "monthly" ? " / شهرياً" : " / سنوياً"}
                      </span>
                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: "16px 0" }} />

                    <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.5", listStyleType: "disc" }}>
                      <li>تصفح خطوط المترو الأساسية والبحث</li>
                      <li>عرض جداول المواعيد والمحطات التبادلية</li>
                      <li>خريطة المونوريل التفاعلية الكاملة 🚄</li>
                      <li style={{ color: "#fbbf24", fontWeight: "bold" }}>محرك البحث المتقدم &quot;ازاي اروح&quot; للمواصلات 🗺️</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={subscribing || (profile?.subscription_tier === "gold" && profile?.subscription_period === subscriptionPeriod)}
                    onClick={() => handleConfirmSubscribe("gold", subscriptionPeriod)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: (profile?.subscription_tier === "gold" && profile?.subscription_period === subscriptionPeriod) ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                      color: (profile?.subscription_tier === "gold" && profile?.subscription_period === subscriptionPeriod) ? "#64748b" : "#000",
                      border: "none",
                      fontWeight: "bold",
                      marginTop: "24px",
                      cursor: (profile?.subscription_tier === "gold" && profile?.subscription_period === subscriptionPeriod) ? "default" : "pointer",
                      fontSize: "0.88rem"
                    }}
                  >
                    {subscribing && selectedPlanId === "gold" ? "جاري التفعيل..." :
                      (profile?.subscription_tier === "gold" && profile?.subscription_period === subscriptionPeriod) ? "باقتك الحالية" : "اشترك الآن"}
                  </button>
                </div>

              </div>

              {/* Pagination Controls */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                marginTop: "16px",
                marginBottom: "10px"
              }}>
                {/* Right/Prev Arrow (RTL back) */}
                <button
                  type="button"
                  onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
                  disabled={activeCardIndex === 0}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activeCardIndex === 0 ? "#475569" : "#fff",
                    cursor: activeCardIndex === 0 ? "default" : "pointer",
                    fontSize: "1.2rem",
                    transition: "all 0.2s"
                  }}
                >
                  <i className="bx bx-chevron-right"></i>
                </button>

                {/* Dots */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToCard(idx)}
                      style={{
                        width: activeCardIndex === idx ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: activeCardIndex === idx ? "var(--accent-ios, #3b82f6)" : "rgba(255,255,255,0.2)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "all 0.25s ease"
                      }}
                    />
                  ))}
                </div>

                {/* Left/Next Arrow (RTL forward) */}
                <button
                  type="button"
                  onClick={() => scrollToCard(Math.min(3, activeCardIndex + 1))}
                  disabled={activeCardIndex === 3}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activeCardIndex === 3 ? "#475569" : "#fff",
                    cursor: activeCardIndex === 3 ? "default" : "pointer",
                    fontSize: "1.2rem",
                    transition: "all 0.2s"
                  }}
                >
                  <i className="bx bx-chevron-left"></i>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showSubConfirmModal && subConfirmData && (
        <div
          className={`modal-backdrop ${styles.modalBackdropSlow}`}
          onClick={() => setShowSubConfirmModal(false)}
          style={{ zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "420px",
              width: "90%",
              padding: "28px 24px",
              borderRadius: "20px",
              background: "var(--bg-primary)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              border: "1px solid var(--border-glass)",
              animation: "slide-up 0.25s ease",
              direction: "rtl",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            {/* Confirmation Icon */}
            <div style={{
              fontSize: "3.2rem",
              marginBottom: "16px",
              color: "var(--accent-gold, #eab308)",
              background: "rgba(234, 179, 8, 0.1)",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <i className="bx bx-help-circle"></i>
            </div>

            {/* Title */}
            <h3 style={{ margin: "0 0 12px", fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-cairo)" }}>
              تأكيد عملية الاشتراك
            </h3>

            {/* Message */}
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: "0 0 28px", fontFamily: "var(--font-cairo)" }}>
              {subConfirmData.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button
                type="button"
                onClick={() => executeSubscribe(subConfirmData.planId, subConfirmData.period)}
                className="ios-btn ios-btn-primary"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-cairo)"
                }}
              >
                تأكيد ومتابعة
              </button>
              <button
                type="button"
                onClick={() => setShowSubConfirmModal(false)}
                className="ios-btn"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-glass)",
                  cursor: "pointer",
                  fontFamily: "var(--font-cairo)"
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={() => setShowWalletModal(false)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "24px 28px",
              borderRadius: "16px",
              background: "var(--bg-primary)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              border: "1px solid var(--border-glass)",
              animation: "slide-up 0.3s ease",
              maxHeight: "90vh",
              overflowY: "auto",
              direction: "rtl",
              textAlign: "right"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              {walletTab !== "main" ? (
                <button
                  onClick={() => setWalletTab("main")}
                  className="closeBut"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <i className="bx bx-arrow-back" style={{ fontSize: "1.2rem", transform: "scaleX(-1)" }}></i>
                </button>
              ) : (
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="closeBut"
                >
                  <i className="bx bx-x"></i>
                </button>
              )}
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-cairo)" }}>
                {walletTab === "main" && "المحفظة المالية"}
                {walletTab === "deposit" && "طلب إيداع رصيد"}
                {walletTab === "withdraw" && "طلب سحب رصيد"}
                {walletTab === "history" && "سجل المعاملات"}
              </h3>
              <div style={{ width: "38px" }}></div>
            </div>

            {/* TAB 1: MAIN WALLET DASHBOARD */}
            {walletTab === "main" && (
              <>
                <div style={{ textAlign: "center", padding: "12px 0 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "160px",
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px"
                    }}
                  >
                    <Image src="/image/profile/egyptianPounds3d.png"
                      alt="رصيد المحفظة"
                      draggable={false}
                      width={100}
                      height={100}
                      style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }} />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700", fontFamily: "var(--font-cairo)" }}>
                    رصيد المحفظة الحالي
                  </span>
                  <h2 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#10b981", margin: "4px 0" }}>
                    {formatNumber(profile?.balance ?? 0, 2)} ج.م
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "#3224fbff", fontWeight: "bold", background: "rgba(88, 88, 88, 0.08)", padding: "2px 10px", borderRadius: "10px" }}>
                    تساوي {formatNumber((profile?.balance ?? 0) * 100)} نقطة
                  </span>
                </div>

                {/* Actions Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button
                      type="button"
                      onClick={() => setWalletTab("deposit")}
                      className={clsx("ios-btn", styles.actionsButton)}
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10b981",
                        border: "1px solid rgba(16, 185, 129, 0.2)"
                      }}
                    >
                      <PiHandWithdrawBold style={{ fontSize: "1.1rem" }} />
                      إيداع
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletTab("withdraw")}
                      className={clsx("ios-btn", styles.actionsButton)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <PiHandDepositBold style={{ fontSize: "1.1rem" }} />
                      سحب
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWalletTab("history")}
                    className="ios-btn"
                    style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: "0.9rem", border: "1px solid var(--border-glass)" }}
                  >
                    <i className="bx bx-history" style={{ fontSize: "1.1rem" }}></i>
                    سجل المعاملات المالية
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConvertBalanceSection(!showConvertBalanceSection);
                      setConvertBalanceStatus(null);
                    }}
                    className="ios-btn ios-btn-primary"
                    style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: "0.9rem" }}
                  >
                    <SiConvertio />
                    التحويل إلى عملة ماب القاهرة
                  </button>
                </div>
              </>
            )}

            {/* TAB 2: DEPOSIT FORM */}
            {walletTab === "deposit" && (
              <form onSubmit={handleDepositSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>طريقة الإيداع</label>
                  <select
                    className="ios-input"
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  >
                    <option value="instapay">انستا باي (InstaPay)</option>
                    <option value="telda">بطاقة تيلدا (Telda)</option>
                    <option value="vodafone_cash">محفظة إلكترونية (فودافون كاش أو غيرها)</option>
                    <option value="bank_transfer">تحويل بنكي مباشر</option>
                  </select>
                </div>

                {/* Instructions */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px 16px", fontSize: "0.8rem" }}>
                  <h5 style={{ margin: "0 0 8px", color: "var(--accent-ios)", fontWeight: "bold" }}>تعليمات التحويل:</h5>
                  {depositMethod === "instapay" && (
                    <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                      قم بالتحويل عبر تطبيق انستا باي إلى الحساب التالي: <br />
                      العنوان: <strong style={{ color: "var(--text-primary)" }}>cairomap@instapay</strong>
                      <br />
                      الاسم: <strong style={{ color: "var(--text-primary)" }}>Mina G***** A</strong>
                      <br />
                      الرابط السريع : <a href="https://instapay.app/cairomap" target="_blank" rel="noopener noreferrer"><strong style={{ color: "var(--accent-ios)" }}>https://instapay.app/cairomap</strong></a>
                    </p>
                  )}
                  {depositMethod === "telda" && (
                    <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                      قم بالتحويل عبر تطبيق تيلدا إلى التاج (Tag) التالي:<br />
                      التاج: <strong style={{ color: "var(--text-primary)" }}>@minagerguis</strong><br />
                      الاسم: <strong style={{ color: "var(--text-primary)" }}>Mina Gerguis</strong>
                    </p>
                  )}
                  {depositMethod === "vodafone_cash" && (
                    <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                      قم بتحويل رصيد كاش إلى رقم المحفظة التالي:<br />
                      الرقم: <strong style={{ color: "var(--text-primary)" }}>01020372317</strong><br />
                      الاسم: <strong style={{ color: "var(--text-primary)" }}>مينا جرجس</strong>
                    </p>
                  )}
                  {depositMethod === "bank_transfer" && (
                    <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                      قم بالتحويل البنكي المباشر للحساب التالي:<br />
                      البنك: <strong style={{ color: "var(--text-primary)" }}>بنك قطر الوطني الأهلي (QNB)</strong><br />
                      رقم الحساب: <strong style={{ color: "var(--text-primary)" }}>1020670700235</strong><br />
                      الاسم: <strong style={{ color: "var(--text-primary)" }}>مينا جرجس</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>المبلغ المراد شحنه (بالجنيه المصري)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="مثال: 100"
                    className="ios-input"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>الرقم/الحساب الذي قمت بالتحويل منه</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رقم محفظتك أو اسم حسابك البنكي"
                    className="ios-input"
                    value={depositSender}
                    onChange={(e) => setDepositSender(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  />
                </div>

                {/* <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>رقم العملية (Transaction ID / Reference)</label>
                  <input
                    type="text"
                    placeholder="أدخل رقم التحويل المميز للعملية"
                    className="ios-input"
                    value={depositTxId}
                    onChange={(e) => setDepositTxId(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  />
                </div> */}

                {/* Screenshot upload */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>إرفاق صورة إيصال التحويل</label>
                  <label className={`ios-btn`} style={{ width: "100%", justifyContent: "center", cursor: "pointer", border: "2px dashed var(--bg-muted)", padding: "12px", background: "rgba(255,255,255,0.01)" }}>
                    <i className="bx bx-image-add" style={{ fontSize: "1.2rem", marginLeft: "6px" }}></i>
                    {depositImageFile ? "تغيير الإيصال المرفق" : "اختر صورة الإيصال"}
                    <input type="file" accept="image/*" onChange={handleDepositImageChange} className={styles.hiddenInput} />
                  </label>

                  {depositImageUrl && (
                    <div style={{ marginTop: "10px", textAlign: "center" }}>
                      <img src={depositImageUrl} alt="إيصال التحويل" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px", border: "1px solid var(--border-glass)" }} />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "16px" }}>

                  <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    لتسريع عملية الشحن، يرجى إرفاق صورة إيصال التحويل. <br />
                    سيتم مراجعة طلب الشحن الخاص بك من قبل الإدارة وسيتم شحن رصيدك في أقرب وقت ممكن.
                  </p>
                </div>

                {depositStatus && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      background: depositStatus.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: depositStatus.type === "success" ? "#10b981" : "#f87171",
                      border: depositStatus.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                    }}
                  >
                    {depositStatus.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingDeposit}
                  className="ios-btn ios-btn-primary"
                  style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: "0.9rem" }}
                >
                  {isSubmittingDeposit ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" style={{ marginLeft: "8px" }}></i>
                      جاري إرسال طلب الشحن...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: "6px" }}></i>
                      تأكيد
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: WITHDRAW FORM */}
            {walletTab === "withdraw" && (
              <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px 16px", fontSize: "0.8rem", textAlign: "center" }}>
                  <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>الرصيد المتاح للسحب</span>
                  <h4 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#10b981" }}>{formatNumber(profile?.balance ?? 0, 2)} ج.م</h4>
                  <p style={{ margin: "6px 0 0 0", color: "var(--text-muted)", fontSize: "0.72rem" }}>* الحد الأدنى لأي عملية سحب هو 100 ج.م</p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>طريقة استلام الرصيد</label>
                  <select
                    className="ios-input"
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  >
                    <option value="instapay">انستا باي (InstaPay)</option>
                    <option value="telda">بطاقة تيلدا (Telda)</option>
                    <option value="vodafone_cash">محفظة إلكترونية (فودافون كاش أو غيرها)</option>
                    <option value="bank_transfer">تحويل بنكي مباشر</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>المبلغ المراد سحبه (بالجنيه المصري)</label>
                  <input
                    type="number"
                    min="100"
                    step="0.01"
                    required
                    placeholder="مثال: 100 كحد أدنى"
                    className="ios-input"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>
                    {withdrawMethod === "instapay" && "عنوان انستا باي المستلم (IPA)"}
                    {withdrawMethod === "telda" && "التاج الخاص بك على تيلدا (Telda Tag)"}
                    {withdrawMethod === "vodafone_cash" && "رقم محفظة المحمول المراد التحويل إليها"}
                    {withdrawMethod === "bank_transfer" && "رقم الحساب البنكي (IBAN)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      withdrawMethod === "instapay" ? "مثال: name@instapay" :
                        withdrawMethod === "telda" ? "مثال: @username" :
                          withdrawMethod === "vodafone_cash" ? "مثال: 010xxxxxxxx" :
                            "أدخل رقم الحساب أو الآيبان كامل"
                    }
                    className="ios-input"
                    value={withdrawRecipient}
                    onChange={(e) => setWithdrawRecipient(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  />
                </div>

                {withdrawMethod !== "vodafone_cash" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px", color: "var(--text-primary)" }}>اسم المستلم بالكامل (ثلاثي على الأقل)</label>
                    <input
                      type="text"
                      required={withdrawMethod !== "vodafone_cash"}
                      placeholder="أدخل اسم صاحب الحساب"
                      className="ios-input"
                      value={withdrawName}
                      onChange={(e) => setWithdrawName(e.target.value)}
                      style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                    />
                  </div>
                )}

                {withdrawStatus && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      background: withdrawStatus.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: withdrawStatus.type === "success" ? "#10b981" : "#f87171",
                      border: withdrawStatus.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                    }}
                  >
                    {withdrawStatus.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="ios-btn ios-btn-primary"
                  style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: "0.9rem", background: "var(--accent-primary)", borderColor: "var(--accent-primary)" }}
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" style={{ marginLeft: "8px" }}></i>
                      جاري إرسال طلب السحب...
                    </>
                  ) : (
                    "تأكيد وإرسال طلب السحب"
                  )}
                </button>
              </form>
            )}

            {/* TAB 4: TRANSACTION HISTORY */}
            {walletTab === "history" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", maxHeight: "50vh", overflowY: "auto", paddingLeft: "4px" }}>
                {loadingTransactions ? (
                  <div style={{ textAlign: "center", padding: "30px 0" }}>
                    <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.8rem", color: "var(--accent-primary)" }}></i>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "8px" }}>جاري تحميل كشف الحساب...</p>
                  </div>
                ) : userTransactions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", border: "1px dashed var(--border-glass)", borderRadius: "12px" }}>
                    <i className="bx bx-receipt" style={{ fontSize: "2.4rem", color: "var(--text-muted)", marginBottom: "8px" }}></i>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0 }}>لا توجد معاملات سابقة حالياً.</p>
                  </div>
                ) : (
                  userTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: tx.type === "deposit" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                              color: tx.type === "deposit" ? "#10b981" : "#f87171"
                            }}
                          >
                            <i className={tx.type === "deposit" ? "bx bx-plus-circle" : "bx bx-minus-circle"} style={{ fontSize: "1.1rem" }}></i>
                          </span>
                          <div>
                            <span style={{ fontSize: "0.82rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                              {tx.type === "deposit" ? "إيداع رصيد" : "سحب رصيد"}
                            </span>
                            <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                              {new Date(tx.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: "left" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: "900", color: tx.type === "deposit" ? "#10b981" : "#f87171" }}>
                            {tx.type === "deposit" ? "+" : "-"} {formatNumber(tx.amount, 2)} ج.م
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.68rem",
                              fontWeight: "bold",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              textAlign: "center",
                              marginTop: "4px",
                              background:
                                tx.status === "approved" ? "rgba(16, 185, 129, 0.1)" :
                                  tx.status === "rejected" ? "rgba(239, 68, 68, 0.1)" :
                                    "rgba(251, 191, 36, 0.1)",
                              color:
                                tx.status === "approved" ? "#10b981" :
                                  tx.status === "rejected" ? "#f87171" :
                                    "#fbbf24"
                            }}
                          >
                            {tx.status === "pending" && "معلقة"}
                            {tx.status === "approved" && "مقبولة"}
                            {tx.status === "rejected" && "مرفوضة"}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "8px", display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                        <span>وسيلة الدفع: <strong>
                          {tx.method === "instapay" && "انستا باي"}
                          {tx.method === "vodafone_cash" && "محفظة كاش"}
                          {tx.method === "bank_transfer" && "تحويل بنكي"}
                        </strong></span>
                        {tx.provider_number && <span>الحساب/الرقم: <strong>{tx.provider_number}</strong></span>}
                        {tx.transaction_id && <span>رقم العملية: <strong>{tx.transaction_id}</strong></span>}
                      </div>

                      {tx.admin_notes && (
                        <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", borderRadius: "8px", padding: "8px 10px", fontSize: "0.72rem", color: "#f87171" }}>
                          <strong>ملاحظة الإدارة:</strong> {tx.admin_notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Convert Section */}
            {walletTab === "main" && showConvertBalanceSection && (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "24px",
                  animation: "slide-up 0.2s ease"
                }}
              >
                <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  تحويل الرصيد المالي إلى نقاط (عملات ماب القاهرة)
                </h4>
                <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  الحد الأدنى للتحويل هو 10 جنيهات مصري. كل 1 جنيه مصري يعطيك 100 نقطة. سيتم إضافة النقاط مباشرة إلى رصيد نقاطك.
                </p>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    className="ios-input"
                    placeholder="أدخل المبلغ بالجنيه (10 كحد أدنى)"
                    value={convertBalanceAmount}
                    onChange={(e) => setConvertBalanceAmount(e.target.value)}
                    style={{ flex: 1, fontSize: "0.8rem", textAlign: "center", fontWeight: "700", padding: "8px 6px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setConvertBalanceAmount((profile?.balance ?? 0).toString())}
                    className="ios-btn"
                    style={{ padding: "8px 6px", fontSize: "0.82rem", whiteSpace: "nowrap", fontWeight: "bold", width: "25%", border: "1px solid var(--border-glass)" }}
                  >
                    الأقصي
                  </button>
                </div>

                {convertBalanceAmount && !isNaN(parseFloat(convertBalanceAmount)) && parseFloat(convertBalanceAmount) >= 10 && (
                  <div style={{ fontSize: "0.85rem", color: "#fbbf24", fontWeight: "bold", textAlign: "center", marginBottom: "14px" }}>
                    ستحصل على: {formatNumber(parseFloat(convertBalanceAmount) * 100)} نقطة
                  </div>
                )}

                {convertBalanceStatus && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "14px",
                      background: convertBalanceStatus.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: convertBalanceStatus.type === "success" ? "#10b981" : "#f87171",
                      border: convertBalanceStatus.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                    }}
                  >
                    {convertBalanceStatus.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConvertBalanceToPoints}
                  disabled={convertingBalance}
                  className="ios-btn ios-btn-primary"
                  style={{ width: "100%", padding: "10px", justifyContent: "center", fontSize: "0.85rem", background: "var(--accent-primary)", borderColor: "var(--accent-primary)" }}
                >
                  <IoWalletOutline style={{ fontSize: "1rem" }} />
                  {convertingBalance ? "جاري التحويل..." : "تأكيد عملية التحويل"}
                </button>
              </div>
            )}

            {/* Explanation Sections */}
            {walletTab === "main" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
                {/* What is Cash Wallet */}
                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "0.92rem", fontWeight: "800", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="bx bx-info-circle" style={{ fontSize: "1.1rem" }}></i>
                    ما هو رصيد المحفظة؟
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    هو رصيد مالي حقيقي بالجنيه المصري (EGP) يتم شحنه في حسابك، أو تحويل النقاط المكتسبة إليه. يمكنك استخدامه في شراء المنتجات المميزة، دفع اشتراكات الدليل، أو سحبه نقداً.
                  </p>
                </div>

                {/* Supported Payment & Withdrawal Methods */}
                <div>
                  <h4 style={{ margin: "0 0 12px", fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="bx bx-credit-card-front" style={{ fontSize: "1.1rem" }}></i>
                    طرق الشحن والسحب المدعومة
                  </h4>
                  <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    يمكنك استخدام الطرق التالية للشحن أو سحب مستحقاتك وأرصدتك المالية:
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "16px", border: "1px solid var(--border-glass)" }}>
                    {[
                      { name: "vodafone cash", title: "فودافون كاش", icon: "/image/telCompany/vodafone-logo.png" },
                      { name: "instapay", title: "انستاباي", icon: "/image/payment/instapay.png" },
                      { name: "meeza", title: "ميزة", icon: "/image/payment/meeza.png" },
                      { name: "fawry", title: "فوري", icon: "/image/payment/fawry.png" },
                      { name: "visa", title: "فيزا", icon: "/image/payment/visa.png" },
                      { name: "mastercard", title: "ماستركارد", icon: "/image/payment/mastercard.png" },
                      { name: "applepay", title: "ابل باي", icon: "/image/payment/applepay.png" },
                      { name: "telda", title: "تيلدا", icon: "/image/payment/telda.jpg" }
                    ].map((pay) => (
                      <div
                        key={pay.name}
                        title={pay.title}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        <Image
                          src={pay.icon}
                          alt={pay.title}
                          width={20}
                          height={20}
                          style={{ objectFit: "contain", borderRadius: "4px" }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "bold" }}>{pay.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  );
}
