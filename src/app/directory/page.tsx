"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatBoxIcon } from "@/data/places";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import VoiceInputButton from "@/components/VoiceInputButton";

/* ============================================================
   Directory Data Interfaces & Config
   ============================================================ */
export interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url?: string;
  icon?: string;
  description?: string;
}

export interface TelecomCodeEntry {
  id: string;
  company: string;
  section_name: string;
  title: string;
  code: string;
  icon?: string;
}

export const COMPANY_META: Record<
  string,
  { label: string; logo: string; color: string; border: string; bg: string }
> = {
  vodafone: {
    label: "فودافون",
    logo: "vodafone.png",
    color: "#ef4444",
    border: "rgba(239, 68, 68, 0.3)",
    bg: "rgba(239, 68, 68, 0.08)",
  },
  orange: {
    label: "اورنج",
    logo: "orange.png",
    color: "#f97316",
    border: "rgba(249, 115, 22, 0.3)",
    bg: "rgba(249, 115, 22, 0.08)",
  },
  etisalat: {
    label: "اتصالات",
    logo: "etisalat.png",
    color: "#10b981",
    border: "rgba(16, 185, 129, 0.3)",
    bg: "rgba(16, 185, 129, 0.08)",
  },
  we: {
    label: "وي",
    logo: "we.png",
    color: "#8b5cf6",
    border: "rgba(139, 92, 246, 0.3)",
    bg: "rgba(139, 92, 246, 0.08)",
  },
};

const DIRECTORY_TOP_CARDS = [
  {
    id: "emergency",
    title: "طوارئ وخدمات عاجلة",
    subtitle: "شرطة، إسعاف، مطافئ، غاز، كهرباء",
    icon: "fa-solid fa-truck-medical",
    color: "#ef4444",
    specialtyFilter: "طوارئ",
  },
  {
    id: "government",
    title: "جهات حكومية ومرافق",
    subtitle: "المرور، السكة الحديد، حماية المستهلك",
    icon: "fa-solid fa-building-columns",
    color: "#3b82f6",
    specialtyFilter: "حكومي",
  },
  {
    id: "banks",
    title: "بنوك ومحافظ إلكترونية",
    subtitle: "الأهلي، مصر، CIB، فودافون كاش",
    icon: "fa-solid fa-credit-card",
    color: "#f59e0b",
    specialtyFilter: "بنوك",
  },
  {
    id: "health",
    title: "صحة ومستشفيات",
    subtitle: "مستشفيات، بنك الدم، صيدليات كبرى",
    icon: "fa-solid fa-heart-pulse",
    color: "#10b981",
    specialtyFilter: "صحة",
  },
  {
    id: "telecom",
    title: "أكواد شبكات المحمول",
    subtitle: "فودافون، أورنج، اتصالات، وي",
    icon: "fa-solid fa-sim-card",
    color: "#8b5cf6",
    specialtyFilter: "telecom_codes",
  },
];

// Quick national emergencies
const TOP_EMERGENCY_NUMBERS = [
  { name: "شرطة النجدة", number: "122", icon: "fa-solid fa-shield-halved", color: "#3b82f6" },
  { name: "الإسعاف المصري", number: "123", icon: "fa-solid fa-truck-medical", color: "#ef4444" },
  { name: "المطافئ والدفاع المدني", number: "180", icon: "fa-solid fa-fire-extinguisher", color: "#f97316" },
  { name: "طوارئ الغاز الطبيعي", number: "129", icon: "fa-solid fa-fire-flame-simple", color: "#eab308" },
  { name: "طوارئ الكهرباء", number: "121", icon: "fa-solid fa-bolt", color: "#06b6d4" },
  { name: "طوارئ مياه الشرب", number: "125", icon: "fa-solid fa-faucet-drip", color: "#3b82f6" },
];

const DEFAULT_PHONE_SEED: PhoneEntry[] = [
  { id: "em-1", name: "شرطة النجدة", specialty: "طوارئ", phone_number: "122", description: "بلاغات النجدة والأمن العام على مدار 24 ساعة في جميع المحافظات." },
  { id: "em-2", name: "هيئة الإسعاف المصرية", specialty: "طوارئ", phone_number: "123", description: "طلب سيارات الإسعاف للحالات الحرجة والحوادث مجاناً." },
  { id: "em-3", name: "المطافئ والحماية المدنية", specialty: "طوارئ", phone_number: "180", description: "بلاغات الحرائق وحوادث الانهيار والإنقاذ السريع." },
  { id: "em-4", name: "طوارئ الغاز الطبيعي", specialty: "طوارئ", phone_number: "129", description: "الإبلاغ الفوري عن تسريب الغاز الطبيعي أو أعطال الشبكات." },
  { id: "em-5", name: "طوارئ الكهرباء", specialty: "طوارئ", phone_number: "121", description: "أعطال شبكة الكهرباء وانقطاع التيار والشكاوى الفنية." },
  { id: "em-6", name: "طوارئ مياه الشرب والصرف", specialty: "طوارئ", phone_number: "125", description: "بلاغات كسر مواسير المياه وانقطاع الخدمة وطفح الصرف." },
  { id: "em-7", name: "الإدارة العامة للمرور", specialty: "حكومي", phone_number: "128", description: "الإغاثة المرورية على الطرق السريعة والمحاور الرئيسية." },
  { id: "em-8", name: "الهيئة القومية لسكك حديد مصر", specialty: "حكومي", phone_number: "15047", description: "استعلامات مواعيد القطارات وأسعار التذاكر والشكاوى." },
  { id: "em-9", name: "جهاز حماية المستهلك", specialty: "حكومي", phone_number: "19588", description: "تقديم شكاوى الغش التجاري وعيوب السلع والخدمات." },
  { id: "em-10", name: "المركز القومي لخدمات نقل الدم", specialty: "صحة", phone_number: "15366", description: "الاستعلام عن أكياس الدم وفصائله والتبرع بالدم." },
  { id: "em-11", name: "خدمات وزارة الصحة (105)", specialty: "صحة", phone_number: "105", description: "الخط الساخن لوزارة الصحة المصرية واستشارات الأمراض واللقاحات." },
  { id: "em-12", name: "دليل التليفون المصري", specialty: "حكومي", phone_number: "140", description: "الاستعلام عن أرقام الهواتف الأرضية والمؤسسات." },
  { id: "em-13", name: "مباحث الإنترنت والجرائم الإلكترونية", specialty: "حكومي", phone_number: "108", description: "الإبلاغ عن جرائم الابتزاز والقرصنة والنصب الإلكتروني." },
  { id: "em-14", name: "خدمة عملاء البنك الأهلي المصري", specialty: "بنوك", phone_number: "19623", description: "استعلامات الحسابات، كروت الائتمان والخدمات المصرفية." },
  { id: "em-15", name: "خدمة عملاء بنك مصر", specialty: "بنوك", phone_number: "19888", description: "الدعم الفني والخدمات المصرفية للأفراد والشركات." },
  { id: "em-16", name: "خدمة عملاء البنك التجاري الدولي (CIB)", specialty: "بنوك", phone_number: "19666", description: "خدمة عملاء CIB على مدار 24 ساعة." },
  { id: "em-17", name: "خدمة عملاء فودافون كاش", specialty: "بنوك", phone_number: "7001", description: "استعلامات محفظة فودافون كاش والمعاملات المالية." },
];

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .toLowerCase();
}

export default function PhoneDirectoryPage() {
  const { user } = useAuth();

  // State
  const [entries, setEntries] = useState<PhoneEntry[]>(DEFAULT_PHONE_SEED);
  const [codes, setCodes] = useState<TelecomCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active view section (phones vs telecom codes)
  const [activeMainTab, setActiveMainTab] = useState<"phones" | "telecom">("phones");

  // Public Telecom Codes UI State
  const [activeCompany, setActiveCompany] = useState<string>("vodafone");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("recent_phone_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal State (Report / Suggest)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"suggest" | "report">("suggest");
  const [modalType, setModalType] = useState<"phone" | "code">("phone");
  const [itemName, setItemName] = useState("");
  const [itemNumberOrCode, setItemNumberOrCode] = useState("");
  const [itemSpecialty, setItemSpecialty] = useState("");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [itemCompany, setItemCompany] = useState("vodafone");
  const [modalNotes, setModalNotes] = useState("");
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // GSAP Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const emergencyRibbonRef = useRef<HTMLDivElement>(null);
  const phonesPanelRef = useRef<HTMLDivElement>(null);
  const telecomPanelRef = useRef<HTMLDivElement>(null);
  const reportBannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Fetch Data from Supabase
  useEffect(() => {
    document.title = "ماب القاهرة - دليل الهاتف والخدمات";
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: phonesData } = await supabase
          .from("phone_directory")
          .select("*")
          .order("name", { ascending: true });

        if (phonesData && phonesData.length > 0) {
          setEntries(phonesData);
        }

        const { data: codesData } = await supabase.from("telecom_codes").select("*");
        if (codesData && codesData.length > 0) {
          setCodes(codesData);
        }
      } catch (err) {
        console.error("Error fetching directory data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });

      if (headerRef.current) {
        tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0 });
      }
      if (sliderRef.current) {
        tl.fromTo(
          sliderRef.current.children,
          { opacity: 0, y: 15, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.08 },
          "-=0.2"
        );
      }
      if (searchPanelRef.current) {
        tl.fromTo(searchPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (emergencyRibbonRef.current) {
        tl.fromTo(emergencyRibbonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (phonesPanelRef.current) {
        tl.fromTo(phonesPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (reportBannerRef.current) {
        tl.fromTo(reportBannerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
    });

    return () => ctx.revert();
  }, []);

  // Animate Modal Open
  useEffect(() => {
    if (modalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [modalOpen]);

  // Handle saving recent search
  const handleSaveSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 6);
      if (typeof window !== "undefined") {
        localStorage.setItem("recent_phone_searches", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Specialties extraction
  const specialties = useMemo(() => {
    const specs = entries.map((e) => e.specialty?.trim()).filter(Boolean);
    return Array.from(new Set(specs));
  }, [entries]);

  // Specialty Icons map
  const specialtyIcons = useMemo(() => {
    const map: Record<string, string> = {};
    entries.forEach((e) => {
      if (e.specialty && e.icon && !map[e.specialty]) {
        map[e.specialty] = e.icon;
      }
    });
    return map;
  }, [entries]);

  // Section Icons map for telecom
  const sectionIcons = useMemo(() => {
    const map: Record<string, string> = {};
    codes.forEach((c) => {
      if (c.section_name && c.icon && !map[c.section_name]) {
        map[c.section_name] = c.icon;
      }
    });
    return map;
  }, [codes]);

  // Auto-complete suggestions
  const searchSuggestions = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return entries
      .filter((entry) => {
        const searchable = normalizeArabic(
          `${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`
        );
        return searchable.includes(q);
      })
      .slice(0, 5);
  }, [entries, searchQuery]);

  // Filtered phone entries
  const filteredEntries = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    let result = entries;

    if (selectedSpecialty !== "all") {
      if (selectedSpecialty === "other") {
        result = entries.filter((e) => !e.specialty || e.specialty.trim() === "");
      } else {
        result = entries.filter((e) => e.specialty === selectedSpecialty);
      }
    }

    if (q) {
      result = result.filter((entry) => {
        const searchable = normalizeArabic(
          `${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`
        );
        return searchable.includes(q);
      });
    }

    return result;
  }, [entries, searchQuery, selectedSpecialty]);

  const slicedEntries = useMemo(() => {
    return filteredEntries.slice(0, visibleCount);
  }, [filteredEntries, visibleCount]);

  // Telecom codes for active company
  const activeCompanyCodes = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    const companyCodes = codes.filter((c) => c.company === activeCompany);
    if (!q) return companyCodes;
    return companyCodes.filter((c) => {
      const searchable = normalizeArabic(
        `${c.title} ${c.code} ${c.section_name} ${COMPANY_META[c.company]?.label || ""}`
      );
      return searchable.includes(q);
    });
  }, [codes, activeCompany, searchQuery]);

  // Group codes by section_name
  const groupedCodes: Record<string, TelecomCodeEntry[]> = useMemo(() => {
    const grouped: Record<string, TelecomCodeEntry[]> = {};
    activeCompanyCodes.forEach((code) => {
      if (!grouped[code.section_name]) {
        grouped[code.section_name] = [];
      }
      grouped[code.section_name].push(code);
    });
    return grouped;
  }, [activeCompanyCodes]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const getDialUrl = (code: string) => {
    return `tel:${code.replace(/#/g, "%23")}`;
  };

  const handleCopyCode = async (code: string, id: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Open Modal Handler
  const handleOpenModal = async (
    mode: "suggest" | "report" = "suggest",
    type: "phone" | "code" = "phone",
    presetName: string = "",
    presetNumberOrCode: string = ""
  ) => {
    setModalError("");
    setModalSuccess(false);
    setModalMode(mode);
    setModalType(type);
    setItemName(presetName || (type === "phone" && searchQuery ? searchQuery : ""));
    setItemNumberOrCode(presetNumberOrCode);
    setItemSpecialty("");
    setCustomSpecialty("");
    setItemCompany(activeCompany);
    setModalNotes("");
    if (modalImagePreview) URL.revokeObjectURL(modalImagePreview);
    setModalImageFile(null);
    setModalImagePreview(null);
    setIsDraggingImage(false);

    setModalOpen(true);

    if (user) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (e) {
        console.error("Error checking feedback limit:", e);
      } finally {
        setLimitChecking(false);
      }
    }
  };

  const handleModalImageSelect = (file: File | null) => {
    if (modalImagePreview) URL.revokeObjectURL(modalImagePreview);
    if (!file) {
      setModalImageFile(null);
      setModalImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModalError("حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setModalError("يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).");
      return;
    }
    setModalError("");
    setModalImageFile(file);
    setModalImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setModalError("يرجى تسجيل الدخول أولاً لتتمكن من إرسال طلبك.");
      return;
    }
    if (!itemName.trim() || !itemNumberOrCode.trim()) {
      setModalError("يرجى إدخال اسم الجهة / الخدمة ورقم الهاتف أو الكود.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      let finalImageUrl = "";
      if (modalImageFile) {
        setModalUploading(true);
        const fileExt = modalImageFile.name.split(".").pop() || "jpg";
        const fileName = `dir_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, modalImageFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (publicUrl) finalImageUrl = publicUrl;
        }
        setModalUploading(false);
      }

      const finalSpec =
        customSpecialty.trim() || (itemSpecialty !== "other" && itemSpecialty) || "عام / غير محدد";
      const companyLabel = COMPANY_META[itemCompany]?.label || itemCompany;

      const isSuggest = modalMode === "suggest";
      const category =
        modalType === "phone"
          ? isSuggest
            ? "اقتراح رقم هاتف جديد"
            : "إبلاغ عن خطأ في رقم هاتف"
          : isSuggest
            ? "اقتراح كود شبكة جديد"
            : "إبلاغ عن خطأ في كود شبكة";

      const title =
        modalType === "phone"
          ? `${isSuggest ? "اقتراح رقم" : "بلاغ رقم"}: ${itemName.trim()} (${itemNumberOrCode.trim()})`
          : `${isSuggest ? "اقتراح كود" : "بلاغ كود"} (${companyLabel}): ${itemName.trim()} (${itemNumberOrCode.trim()})`;

      const content = `نوع الطلب: ${isSuggest ? "اقتراح إضافة جديد" : "بلاغ عن خطأ"} في دليل الهاتف
الاسم / الخدمة: ${itemName.trim()}
الرقم أو الكود: ${itemNumberOrCode.trim()}
${modalType === "phone" ? `التخصص: ${finalSpec}` : `الشركة: ${companyLabel}`}
ملاحظات إضافية: ${modalNotes.trim() || "لا توجد ملاحظات إضافية"}`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: isSuggest ? "suggestion" : "bug",
          category,
          title,
          content,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Insert notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: isSuggest ? "تم استلام اقتراحك بنجاح 💡" : "تم استلام بلاغك بنجاح ☎️",
            message: `شكراً لمساهمتك في تدقيق وتطوير دليل الهاتف! تم تسجيل طلبك بخصوص "${title}" وسيتم مراجعته قريباً.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setModalSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setModalSuccess(false);
      }, 2200);
    } catch (err: any) {
      console.error(err);
      setModalError(err?.message || "حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setModalLoading(false);
      setModalUploading(false);
    }
  };

  return (
    //================================== START MAIN CONTAINER =================================
    <div className="main-container">
      {/* Header Banner */}
      <div ref={headerRef} className="header-banner">
        <div>
          {/* Title */}
          <h1 className="header-title">دليل الهاتف والخدمات العامة</h1>
          {/* Sub Title */}
          <p className="header-sub-title">
            دليلك الشامل لأرقام الطوارئ، الخطوط الساخنة للجهات الحكومية والبنوك، وأكواد شبكات المحمول في مصر.
          </p>
        </div>
      </div>

      {/* Container */}
      <div className="container">
        {/* Top Cards Slider */}
        <div
          ref={sliderRef}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: "14px",
            overflowX: "auto",
            padding: "6px 4px 16px 4px",
            marginBottom: "20px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {DIRECTORY_TOP_CARDS.map((card) => {
            const isTelecom = card.id === "telecom";
            const active = isTelecom
              ? activeMainTab === "telecom"
              : activeMainTab === "phones" && selectedSpecialty === card.specialtyFilter;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (isTelecom) {
                    setActiveMainTab("telecom");
                    if (telecomPanelRef.current) {
                      telecomPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  } else {
                    setActiveMainTab("phones");
                    setSelectedSpecialty(card.specialtyFilter);
                    if (phonesPanelRef.current) {
                      phonesPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                }}
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${card.color}98 20%, transparent 65%), var(--bgPrimary)`,
                  border: active ? `2px solid ${card.color}` : "1px solid var(--borderSecondary)",
                  borderRadius: "var(--ra-8)",
                  padding: "16px 16px 14px 16px",
                  cursor: "pointer",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                  textAlign: "right",
                  flex: "0 0 auto",
                  minWidth: "185px",
                  maxWidth: "220px",
                  height: "88px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  scrollSnapAlign: "start",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Bottom Title & Subtitle */}
                <div style={{ textAlign: "right", width: "100%", marginTop: "auto", position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      color: "var(--textPrimary)",
                      fontFamily: "var(--font-display)",
                      fontWeight: "700",
                      fontSize: "0.92rem",
                      lineHeight: "1.3",
                      letterSpacing: "-0.2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--textMuted)",
                      fontWeight: "500",
                      marginTop: "3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Emergency Fast Dial Ribbon */}
        <div
          ref={emergencyRibbonRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {TOP_EMERGENCY_NUMBERS.map((em, idx) => (
            <a
              key={idx}
              href={getDialUrl(em.number)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--ra-8)",
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = em.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--borderGlass)";
              }}
            >
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                  {em.name}
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: "800", color: em.color, direction: "ltr", textAlign: "right" }}>
                  {em.number}
                </div>
              </div>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: `${em.color}18`,
                  color: em.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                }}
              >
                <i className={em.icon}></i>
              </div>
            </a>
          ))}
        </div>

        {/* Search Panel Card */}
        <div ref={searchPanelRef} className="details-panel" style={{ position: "relative", zIndex: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <h5 className="text-lg fw-bold" style={{ margin: 0 }}>
              ابحث في دليل الأرقام والخدمات
            </h5>

            {/* Quick Section Tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setActiveMainTab("phones")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activeMainTab === "phones" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                  color: activeMainTab === "phones" ? "#ffffff" : "var(--textSecondary)",
                  border: activeMainTab === "phones" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="fa-solid fa-phone" style={{ marginLeft: "4px" }}></i>
                أرقام وخطوط ساخنة
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("telecom")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activeMainTab === "telecom" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                  color: activeMainTab === "telecom" ? "#ffffff" : "var(--textSecondary)",
                  border: activeMainTab === "telecom" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="fa-solid fa-hashtag" style={{ marginLeft: "4px" }}></i>
                أكواد المحمول ({codes.length})
              </button>
            </div>
          </div>

          {/* Search Input Container */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0 }}>
                <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "6px", color: "var(--colorSecondary)" }}></i>
                ابحث بالاسم، الرقم، التخصص، أو الخدمة:
              </label>
              <VoiceInputButton
                onTranscript={(text) => {
                  setSearchQuery(text);
                  handleSaveSearch(text);
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <input
                className="input-fields"
                type="text"
                placeholder="مثال: البنك الأهلي، الإسعاف، تحويل فودافون كاش، طوارئ الغاز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveSearch(searchQuery);
                    setIsFocused(false);
                  }
                }}
                style={{
                  width: "100%",
                  direction: "rtl",
                  fontFamily: "var(--font-body)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--textMuted)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Instant Suggestions Dropdown */}
            {isFocused && searchQuery.trim() !== "" && searchSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 2000,
                  backgroundColor: "var(--bgSecondary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  maxHeight: "280px",
                  overflowY: "auto",
                  direction: "rtl",
                }}
              >
                {searchSuggestions.map((entry) => (
                  <div
                    key={entry.id}
                    onMouseDown={() => {
                      setSearchQuery(entry.name);
                      handleSaveSearch(entry.name);
                      setIsFocused(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hoverBtn)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                        {entry.name}
                      </span>
                      {entry.specialty && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            background: "var(--borderGlass)",
                            color: "var(--textSecondary)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {entry.specialty}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onMouseDown={(e) => e.stopPropagation()}>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: "800",
                          color: "var(--colorSuccess)",
                          background: "rgba(16, 185, 129, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          direction: "ltr",
                        }}
                      >
                        {entry.phone_number}
                      </span>
                      <a
                        href={getDialUrl(entry.phone_number)}
                        style={{
                          color: "var(--colorSecondary)",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                        }}
                        title="اتصال مباشر"
                      >
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches Row */}
          {recentSearches.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginTop: "-4px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--textSecondary)", fontWeight: "600" }}>آخر عمليات البحث:</span>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSaveSearch(term);
                  }}
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--borderGlass)",
                    background: "var(--bgSecondary)",
                    color: "var(--textPrimary)",
                    cursor: "pointer",
                  }}
                >
                  🔍 {term}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRecentSearches([]);
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("recent_phone_searches");
                  }
                }}
                className="actionBtn actionBtnDelete"
                style={{ cursor: "pointer", padding: "2px 6px", fontSize: "0.75rem" }}
                title="مسح سجل البحث"
              >
                <i className="bx bx-trash"></i>
              </button>
            </div>
          )}
        </div>

        {/* ==================== PHONES SECTION PANEL ==================== */}
        {activeMainTab === "phones" && (
          <div ref={phonesPanelRef} className="details-panel">
            {/* Header with Title and Specialty Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
                  أرقام خدمة العملاء والخطوط الساخنة
                </h2>
                <span style={{ fontSize: "0.75rem", color: "var(--textMuted)" }}>
                  عرض {slicedEntries.length} من أصل {filteredEntries.length} جهة مسجلة
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenModal("suggest", "phone")}
                className="btn btn-primary"
                style={{
                  fontSize: "0.78rem",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-plus"></i>
                اقتراح إضافة رقم جديد
              </button>
            </div>

            {/* Specialty Filter Badges Slider */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setSelectedSpecialty("all")}
                style={{
                  background: selectedSpecialty === "all" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                  border: `1px solid ${selectedSpecialty === "all" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                  color: selectedSpecialty === "all" ? "#ffffff" : "var(--textSecondary)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                🌐 الكل ({entries.length})
              </button>
              {specialties.map((spec) => {
                const count = entries.filter((e) => e.specialty === spec).length;
                const active = selectedSpecialty === spec;
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    style={{
                      background: active ? "var(--colorSecondary)" : "var(--bgSecondary)",
                      border: `1px solid ${active ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                      color: active ? "#ffffff" : "var(--textSecondary)",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className={formatBoxIcon(specialtyIcons[spec] || "bx-building")}></i>
                    {spec} ({count})
                  </button>
                );
              })}
            </div>

            {/* Phone Cards Grid */}
            {slicedEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", background: "var(--bgGlass)", borderRadius: "var(--radius-card)", border: "1px solid var(--borderGlass)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
                <h4 style={{ fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px" }}>
                  لم يتم العثور على أرقام مطابقة لبحثك
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--textSecondary)", margin: "0 0 14px" }}>
                  إذا كنت تعرف رقم هذه الجهة أو الخدمة، ساعدنا في إضافتها ليستفيد الجميع!
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenModal("suggest", "phone", searchQuery)}
                  className="btn btn-primary"
                  style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                >
                  <i className="fa-solid fa-plus" style={{ marginLeft: "6px" }}></i>
                  اقترح إضافة هذا الرقم الآن
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {slicedEntries.map((entry) => {
                  const isCopied = copiedId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      style={{
                        backgroundColor: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "var(--ra-8)",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "10px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Top row: Icon/Logo + Name & Specialty */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        {entry.logo_url ? (
                          <img
                            src={entry.logo_url}
                            alt={entry.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              flexShrink: 0,
                              background: "#fff",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background: "rgba(59, 130, 246, 0.12)",
                              border: "1px solid rgba(59, 130, 246, 0.2)",
                              color: "var(--colorSecondary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.1rem",
                              flexShrink: 0,
                            }}
                          >
                            <i className="fa-solid fa-headset"></i>
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", flexWrap: "wrap" }}>
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "0.92rem",
                                fontWeight: "700",
                                color: "var(--textPrimary)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {entry.name}
                            </h4>
                            {entry.specialty && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  background: "var(--borderGlass)",
                                  color: "var(--textSecondary)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "600",
                                }}
                              >
                                {entry.specialty}
                              </span>
                            )}
                          </div>

                          {entry.description && (
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: "0.75rem",
                                color: "var(--textMuted)",
                                lineHeight: "1.4",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: Number, Copy and Call actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "8px",
                          borderTop: "1px solid var(--borderGlass)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "800",
                              color: "var(--colorSuccess)",
                              direction: "ltr",
                            }}
                          >
                            {entry.phone_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(entry.phone_number, entry.id)}
                            style={{
                              background: isCopied ? "rgba(16, 185, 129, 0.15)" : "transparent",
                              border: "none",
                              color: isCopied ? "var(--colorSuccess)" : "var(--textMuted)",
                              cursor: "pointer",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                            title="نسخ الرقم"
                          >
                            <i className={isCopied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenModal("report", "phone", entry.name, entry.phone_number)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--textMuted)",
                              cursor: "pointer",
                              padding: "4px",
                              fontSize: "0.78rem",
                            }}
                            title="الإبلاغ عن خطأ في هذا الرقم"
                          >
                            <i className="fa-solid fa-triangle-exclamation"></i>
                          </button>

                          <a
                            href={getDialUrl(entry.phone_number)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              background: "var(--colorSuccess)",
                              color: "#ffffff",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              textDecoration: "none",
                              fontSize: "0.78rem",
                              fontWeight: "700",
                            }}
                          >
                            <i className="fa-solid fa-phone"></i>
                            اتصال
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {filteredEntries.length > visibleCount && (
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="btn"
                  style={{
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    color: "var(--textPrimary)",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    padding: "8px 24px",
                  }}
                >
                  عرض المزيد (+8 أرقام)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TELECOM CODES SECTION PANEL ==================== */}
        {activeMainTab === "telecom" && (
          <div ref={telecomPanelRef} className="details-panel">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
                  دليل أكواد وخدمات شبكات المحمول
                </h2>
                <span style={{ fontSize: "0.75rem", color: "var(--textMuted)" }}>
                  أكواد باقات الإنترنت، الرصيد، الكاش، وخدمات المكالمات
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenModal("suggest", "code")}
                className="btn btn-primary"
                style={{
                  fontSize: "0.78rem",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-plus"></i>
                اقتراح كود جديد
              </button>
            </div>

            {/* Company Tabs */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px" }}>
              {Object.entries(COMPANY_META).map(([key, meta]) => {
                const count = codes.filter((c) => c.company === key).length;
                const active = activeCompany === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCompany(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: active ? meta.bg : "var(--bgSecondary)",
                      border: active ? `2px solid ${meta.color}` : "1px solid var(--borderGlass)",
                      color: active ? "var(--textPrimary)" : "var(--textSecondary)",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Image
                      src={`/images/company/${meta.logo}`}
                      alt={meta.label}
                      width={20}
                      height={20}
                      style={{ borderRadius: "50%" }}
                    />
                    <span>{meta.label}</span>
                    <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Accordions of codes */}
            {Object.keys(groupedCodes).length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", background: "var(--bgGlass)", borderRadius: "var(--radius-card)", border: "1px solid var(--borderGlass)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
                <h4 style={{ fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px" }}>
                  لا توجد أكواد مطابقة لبحثك في شبكة {COMPANY_META[activeCompany]?.label}
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--textSecondary)", margin: "0 0 14px" }}>
                  إذا كنت تعرف كود هذه الخدمة، اقترحه الآن على الإدارة لإضافته للدليل!
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenModal("suggest", "code", searchQuery)}
                  className="btn btn-primary"
                  style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                >
                  <i className="fa-solid fa-plus" style={{ marginLeft: "6px" }}></i>
                  اقترح إضافة هذا الكود
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(groupedCodes).map(([sectionName, codeList]) => {
                  const isExpanded = searchQuery.trim() !== "" || !!expandedSections[sectionName];

                  return (
                    <div
                      key={sectionName}
                      style={{
                        backgroundColor: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "var(--ra-8)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleSection(sectionName)}
                        style={{
                          padding: "12px 16px",
                          background: "var(--bgGlass)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          userSelect: "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i
                            className={formatBoxIcon(sectionIcons[sectionName] || "bx-folder")}
                            style={{ fontSize: "1.1rem", color: COMPANY_META[activeCompany]?.color || "var(--colorSecondary)" }}
                          ></i>
                          <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                            {sectionName}
                          </h4>
                          <span style={{ fontSize: "0.72rem", color: "var(--textMuted)" }}>
                            ({codeList.length} كود)
                          </span>
                        </div>
                        <span style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>
                          {isExpanded ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}
                        </span>
                      </div>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div style={{ padding: "8px 16px", background: "var(--bgPrimary)", borderTop: "1px solid var(--borderGlass)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {codeList.map((item) => {
                              const codeParts = item.code.split(" | ");
                              const displayCode = codeParts[0];
                              const displayNote = codeParts[1];

                              const placeholderMatch = displayCode.match(/\[(.*?)\]/);
                              const placeholder = placeholderMatch ? placeholderMatch[1] : null;

                              const userVal = codeInputs[item.id] || "";
                              const finalCode = userVal ? displayCode.replace(/\[.*?\]/, userVal) : displayCode;
                              const isCopied = copiedId === item.id;

                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    padding: "10px 0",
                                    borderBottom: "1px solid var(--borderGlass)",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      gap: "8px",
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.88rem" }}>
                                        {item.title}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.98rem",
                                          color: COMPANY_META[activeCompany]?.color || "var(--colorSecondary)",
                                          marginTop: "2px",
                                          direction: "ltr",
                                          textAlign: "right",
                                          fontWeight: "800",
                                        }}
                                      >
                                        {finalCode}
                                      </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCode(finalCode, item.id)}
                                        style={{
                                          background: isCopied ? "rgba(16, 185, 129, 0.15)" : "var(--bgSecondary)",
                                          border: isCopied ? "1px solid var(--colorSuccess)" : "1px solid var(--borderGlass)",
                                          color: isCopied ? "var(--colorSuccess)" : "var(--textPrimary)",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          fontSize: "0.78rem",
                                          fontWeight: "700",
                                          cursor: "pointer",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                        }}
                                        title="نسخ الكود"
                                      >
                                        <i className={isCopied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                                        {isCopied ? "تم النسخ" : "نسخ"}
                                      </button>

                                      <a
                                        href={getDialUrl(finalCode)}
                                        style={{
                                          background: COMPANY_META[activeCompany]?.color || "var(--colorSecondary)",
                                          color: "#ffffff",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          fontSize: "0.78rem",
                                          fontWeight: "700",
                                          textDecoration: "none",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                        }}
                                      >
                                        <i className="fa-solid fa-phone"></i>
                                        طلب الكود
                                      </a>
                                    </div>
                                  </div>

                                  {/* Dynamic Placeholder Input */}
                                  {placeholder && (
                                    <div style={{ marginTop: "4px" }}>
                                      <input
                                        type="text"
                                        className="input-fields"
                                        placeholder={`أدخل ${placeholder} هنا ثم اضغط طلب الكود...`}
                                        value={codeInputs[item.id] || ""}
                                        onChange={(e) => setCodeInputs({ ...codeInputs, [item.id]: e.target.value })}
                                        style={{
                                          height: "34px",
                                          fontSize: "0.82rem",
                                          borderRadius: "6px",
                                          width: "100%",
                                          direction: "ltr",
                                          textAlign: "right",
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Helper Note */}
                                  {displayNote && (
                                    <div style={{ fontSize: "0.74rem", color: "var(--textMuted)", display: "flex", alignItems: "center", gap: "5px" }}>
                                      <i className="bx bx-info-circle" />
                                      <span>{displayNote}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Report Problem Alert Box */}
        <div
          ref={reportBannerRef}
          style={{
            background: "var(--bgLinearAlert)",
            border: "1px solid var(--borderSecondary)",
            borderRadius: "var(--ra-8)",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "14px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: "row-reverse", justifyContent: "flex-end" }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "1rem",
                  fontWeight: "800",
                  gap: "8px",
                }}
              >
                الإبلاغ عن رقم خاطئ أو اقتراح إضافة رقم جديد
              </h2>
              <img src="/images/icons3d/alert.png" alt="" style={{ width: "35px" }} />
            </div>

            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--textSecondary)",
                lineHeight: "1.6",
              }}
            >
              هل لاحظت أي رقم غير صالح أو خطأ في أكواد الشبكات؟ أو تود إضافة رقم جهة خدمية يستفيد منها الجميع؟
            </p>
          </div>

          <button
            type="button"
            className="btn btn-reportProblem"
            onClick={() => handleOpenModal("suggest", "phone")}
            style={{
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-flag"></i>
            <span>تقديم بلاغ أو اقتراح</span>
          </button>
        </div>
      </div>

      {/* Suggest / Report Problem Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            direction: "rtl",
          }}
        >
          <div
            ref={modalBoxRef}
            style={{
              backgroundColor: "var(--bgPrimary)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--borderGlass)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              fontFamily: "var(--font-cairo)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--borderGlass)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <i
                  className={modalMode === "suggest" ? "fa-solid fa-lightbulb" : "fa-solid fa-triangle-exclamation"}
                  style={{ color: modalMode === "suggest" ? "#f59e0b" : "#ef4444", fontSize: "1.1rem" }}
                ></i>
                <span>{modalMode === "suggest" ? "اقتراح إضافة رقم أو كود جديد" : "الإبلاغ عن خطأ في دليل الهاتف"}</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  if (!modalLoading) {
                    setModalOpen(false);
                    handleModalImageSelect(null);
                  }
                }}
                className="closeBtn"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              {modalSuccess ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(52, 199, 89, 0.15)",
                      color: "#34c759",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      margin: "0 auto 16px",
                    }}
                  >
                    <i className="bx bx-check"></i>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontWeight: "800", color: "var(--textPrimary)" }}>تم إرسال طلبك بنجاح!</h4>
                  <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.88rem", lineHeight: "1.6" }}>
                    شكراً جزيلاً لمساعدتك في إثراء وتدقيق دليل الهاتف. سيقوم فريقنا بمراجعته وإضافته قريباً.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitModal} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Auth Warning */}
                  {!user && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#ef4444",
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }}></i>
                      <span>يرجى تسجيل الدخول بحسابك أولاً لتتمكن من إرسال طلبك.</span>
                    </div>
                  )}

                  {/* Limit Warning */}
                  {limitReached && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        color: "var(--colorWarning, #f59e0b)",
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }}></i>
                      <span>لقد بلغت الحد الأقصى للبلاغات اليومية (3 طلبات). يرجى المحاولة غداً.</span>
                    </div>
                  )}

                  {/* Error Alert */}
                  {modalError && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#ef4444",
                        fontSize: "0.82rem",
                      }}
                    >
                      {modalError}
                    </div>
                  )}

                  {/* Mode Selector */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setModalMode("suggest")}
                      style={{
                        padding: "7px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: modalMode === "suggest" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                        color: modalMode === "suggest" ? "#ffffff" : "var(--textSecondary)",
                        border: modalMode === "suggest" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                      }}
                    >
                      💡 اقتراح رقم / كود جديد
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalMode("report")}
                      style={{
                        padding: "7px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: modalMode === "report" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                        color: modalMode === "report" ? "#ffffff" : "var(--textSecondary)",
                        border: modalMode === "report" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                      }}
                    >
                      ⚠️ إبلاغ عن خطأ موجود
                    </button>
                  </div>

                  {/* Type Selector (Phone vs Code) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setModalType("phone")}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: modalType === "phone" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                        color: modalType === "phone" ? "var(--colorSecondary)" : "var(--textSecondary)",
                        border: modalType === "phone" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                      }}
                    >
                      <i className="fa-solid fa-phone" style={{ marginLeft: "4px" }}></i>
                      رقم هاتف / خط ساخن
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalType("code")}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: modalType === "code" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                        color: modalType === "code" ? "var(--colorSecondary)" : "var(--textSecondary)",
                        border: modalType === "code" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                      }}
                    >
                      <i className="fa-solid fa-hashtag" style={{ marginLeft: "4px" }}></i>
                      كود شبكة محمول
                    </button>
                  </div>

                  {/* Item Name */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px", display: "block" }}>
                      {modalType === "phone" ? "اسم الجهة أو الخدمة:" : "اسم الخدمة أو الغرض من الكود:"}
                    </label>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder={modalType === "phone" ? "مثال: بنك مصر، طوارئ الغاز، مستشفى..." : "مثال: معرفة الرصيد، باقة فليكس..."}
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                      style={{ width: "100%", fontSize: "0.85rem" }}
                    />
                  </div>

                  {/* Item Number or Code */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px", display: "block" }}>
                      {modalType === "phone" ? "رقم الهاتف / الخط الساخن:" : "الكود المطلوب:"}
                    </label>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder={modalType === "phone" ? "مثال: 19888 أو 0233333333" : "مثال: *888# أو *86*..."}
                      value={itemNumberOrCode}
                      onChange={(e) => setItemNumberOrCode(e.target.value)}
                      required
                      style={{ width: "100%", direction: "ltr", textAlign: "right", fontSize: "0.85rem" }}
                    />
                  </div>

                  {/* Specialty / Company Picker */}
                  {modalType === "phone" ? (
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px", display: "block" }}>
                        التخصص أو الفئة:
                      </label>
                      <select
                        className="input-fields"
                        value={itemSpecialty}
                        onChange={(e) => setItemSpecialty(e.target.value)}
                        style={{ width: "100%", fontSize: "0.85rem" }}
                      >
                        <option value="">اختر التخصص (اختياري)...</option>
                        {specialties.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                        <option value="other">تخصص آخر...</option>
                      </select>
                      {itemSpecialty === "other" && (
                        <input
                          type="text"
                          className="input-fields"
                          placeholder="اكتب التخصص هنا..."
                          value={customSpecialty}
                          onChange={(e) => setCustomSpecialty(e.target.value)}
                          style={{ width: "100%", marginTop: "6px", fontSize: "0.85rem" }}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px", display: "block" }}>
                        شركة الاتصالات:
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                        {Object.entries(COMPANY_META).map(([key, meta]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setItemCompany(key)}
                            style={{
                              padding: "6px",
                              borderRadius: "6px",
                              border: itemCompany === key ? `2px solid ${meta.color}` : "1px solid var(--borderGlass)",
                              background: itemCompany === key ? meta.bg : "var(--bgSecondary)",
                              color: "var(--textPrimary)",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Image src={`/images/company/${meta.logo}`} alt={meta.label} width={18} height={18} style={{ borderRadius: "50%" }} />
                            {meta.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Textarea */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px", display: "block" }}>
                      ملاحظات أو تفاصيل إضافية:
                    </label>
                    <textarea
                      className="input-fields"
                      rows={2}
                      placeholder="أوقات العمل، طريقة الاستخدام، أو تفاصيل الخطأ..."
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      style={{ width: "100%", fontSize: "0.85rem", resize: "vertical" }}
                    />
                  </div>

                  {/* Image Attachment Dropzone */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px", display: "block" }}>
                      إرفاق صورة توضيحية (اختياري):
                    </label>
                    {modalImagePreview ? (
                      <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--borderGlass)" }}>
                        <img src={modalImagePreview} alt="Preview" style={{ width: "100%", maxHeight: "120px", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => handleModalImageSelect(null)}
                          style={{
                            position: "absolute",
                            top: "6px",
                            left: "6px",
                            background: "rgba(239, 68, 68, 0.8)",
                            border: "none",
                            borderRadius: "50%",
                            width: "26px",
                            height: "26px",
                            color: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(false);
                          if (e.dataTransfer.files?.[0]) handleModalImageSelect(e.dataTransfer.files[0]);
                        }}
                        style={{
                          border: isDraggingImage ? "2px dashed var(--colorSecondary)" : "2px dashed var(--borderGlass)",
                          borderRadius: "8px",
                          padding: "14px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: isDraggingImage ? "rgba(59, 130, 246, 0.05)" : "transparent",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                          const input = document.getElementById("directory-modal-img-input");
                          if (input) input.click();
                        }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "1.3rem", color: "var(--textMuted)", marginBottom: "2px" }}></i>
                        <div style={{ fontSize: "0.76rem", color: "var(--textSecondary)" }}>اسحب الصورة هنا أو اضغط للاختيار من جهازك</div>
                        <input
                          id="directory-modal-img-input"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleModalImageSelect(e.target.files[0]);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Form Action Buttons */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        handleModalImageSelect(null);
                      }}
                      className="btn"
                      style={{
                        flex: 1,
                        background: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textPrimary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading || !user || limitReached}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        cursor: modalLoading || !user || limitReached ? "not-allowed" : "pointer",
                        opacity: modalLoading || !user || limitReached ? 0.6 : 1,
                      }}
                    >
                      {modalLoading ? (
                        <span>
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: "6px" }}></i>
                          {modalUploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}
                        </span>
                      ) : (
                        <span>
                          <i className="fa-solid fa-paper-plane" style={{ marginLeft: "6px" }}></i>
                          إرسال الطلب للإدارة
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    //================================== END MAIN CONTAINER =================================
  );
}