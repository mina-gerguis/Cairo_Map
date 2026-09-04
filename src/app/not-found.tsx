"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaCompass,
  FaSearch,
  FaHome,
  FaSubway,
  FaBus,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaRobot,
  FaParking,
  FaPlane,
  FaExclamationTriangle,
  FaRoute,
  FaLightbulb,
  FaChevronLeft,
  FaInbox,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import {
  initialPlaces,
  CATEGORIES_STRUCTURE,
  Place,
  normalizePlaceCategory,
  getMainCategoryImage,
} from "@/data/places";

// ── 1. دالة توحيد وتنظيف النصوص العربية لبحث دقيق ──
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .trim();
}

// ── دالة إزالة السوابق والتعريفات العربية (الـ، للـ، بالـ، والـ) لضمان تطابق مرن ──
function cleanArabicWord(word: string): string {
  let w = word.trim();
  if (w.length <= 3) return w;

  if (w.startsWith("وال") && w.length > 4) {
    w = w.substring(3);
  } else if (w.startsWith("ال") && w.length > 3) {
    w = w.substring(2);
  } else if (w.startsWith("بال") && w.length > 4) {
    w = w.substring(3);
  } else if (w.startsWith("لل") && w.length > 3) {
    w = w.substring(2);
  }

  return w;
}

// ── دالة تقسيم نص البحث إلى كلمات نظيفة مفلترة ──
function getSearchWords(text: string): string[] {
  const normalized = normalizeArabic(text);
  const stopWords = ["في", "من", "ب", "بـ", "بمنطقة", "بمحافظة", "مدينة", "حي", "علي", "الي", "التي", "الذي", "مع"];

  return normalized
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0 && !stopWords.includes(w))
    .map(cleanArabicWord);
}

// ── دالة تنظيف الكلمات في النص الكامل للمقارنة ──
function getSearchCleanedText(text: string): string {
  if (!text) return "";
  return normalizeArabic(text)
    .split(/\s+/)
    .map(w => w.trim())
    .map(cleanArabicWord)
    .filter(Boolean)
    .join(" ");
}

// ── دالة تحويل وتوحيد بيانات المكان من Supabase لضمان التطابق مع دليل الأماكن ──
function mapDbPlaceToPlace(dbPlace: any): Place {
  const rawCategory = dbPlace.category;
  const initialSubCats = Array.isArray(dbPlace.sub_categories) ? [...dbPlace.sub_categories] : [];
  const { category: finalCategory, categoryLabel: defaultLabel, subCategories: finalSubCategories } = normalizePlaceCategory(rawCategory, initialSubCats);

  return {
    id: dbPlace.id,
    name: dbPlace.name,
    name_en: dbPlace.name_en || "",
    category: finalCategory,
    categoryLabel: dbPlace.category_label || finalCategory,
    subCategories: finalSubCategories,
    place_type: dbPlace.place_type || "",
    governorate: dbPlace.governorate || "",
    city: dbPlace.city || "",
    briefLocation: dbPlace.brief_location || dbPlace.address || "",
    fullAddress: dbPlace.full_address || dbPlace.address || "",
    phones: Array.isArray(dbPlace.phones) ? dbPlace.phones : (dbPlace.phone ? [dbPlace.phone] : []),
    googleMapsUrl: dbPlace.google_maps_url || "",
    images: Array.isArray(dbPlace.images) ? dbPlace.images : (dbPlace.image_url ? [dbPlace.image_url] : []),
    workingHours: dbPlace.working_hours || "",
    rating: dbPlace.rating || 4.5,
    description: dbPlace.description || "",
    branches: Array.isArray(dbPlace.branches) ? dbPlace.branches.map((b: any) => ({
      id: b.id,
      place_id: b.place_id,
      name: b.name,
      governorate: b.governorate,
      city: b.city,
      fullAddress: b.full_address,
      latitude: b.latitude,
      longitude: b.longitude,
      phones: b.phones || [],
      googleMapsUrl: b.google_maps_url,
      workingHours: b.working_hours,
      isMain: b.is_main,
    })) : []
  };
}

// ── فهرس خدمات وصفحات الموقع المباشرة (Site Services Index) ──
interface SiteServiceItem {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  icon: string;
  badge: string;
  keywords: string[];
}

const SITE_SERVICES: SiteServiceItem[] = [
  {
    id: "metro",
    label: "خريطة مترو الأنفاق",
    subtitle: "خطوط مترو القاهرة الكبري.",
    href: "/metro",
    icon: "metro.svg",
    badge: "مواصلات المترو",
    keywords: ["مترو", "المترو", "انفاق", "الانفاق", "محطات المترو", "خط المترو", "تذكرة المترو", "مترو القاهرة", "metro"]
  },
  {
    id: "monorail",
    label: "قطار المونوريل",
    subtitle: "محطات وأسعار تذاكر المونوريل",
    href: "/monorail",
    icon: "Cairo_monorail_east.png",
    badge: "قطار معلق",
    keywords: ["منورايل", "المنورايل", "قطار العاصمة", "العاصمة الادارية", "اكتوبر", "monorail"]
  },
  {
    id: "lrt",
    label: "القطار الكهربائي الخفيف",
    subtitle: "محطات ومواعيد القطار الكهربائي",
    href: "/lrt",
    icon: "Cairo_lrt.png",
    badge: "القطار الكهربائي",
    keywords: ["lrt", "القطار الكهربائي", "كهربائي", "القطار الخفيف", "قطار العاشر"]
  },
  {
    id: "railways",
    label: "قطارات السكك الحديدية",
    subtitle: "قطارات القاهرة والصعيد",
    href: "/railways",
    icon: "Cairo_train.png",
    badge: "قطارات مصر",
    keywords: ["قطار", "قطارات", "سكك حديد", "سكك حديد مصر", "محطة رمسيس", "رمسيس", "قطار الصعيد", "قطار اسكندرية"]
  },
  {
    id: "directory",
    label: "دليل الهاتف والأكواد",
    subtitle: "أرقام الخدمات، وأكواد الشبكات",
    href: "/directory",
    icon: "Cairo_directory.png",
    badge: "دليل الهواتف",
    keywords: ["تليفون", "تليفونات", "هاتف", "اكواد", "أكواد", "طوارئ", "فودافون", "اورنج", "اتصالات", "وي", "ارقام", "خدمة العملاء"]
  },
  {
    id: "directions",
    label: "ازاي اروح؟",
    subtitle: "دليل الوصول لأي مكان في مصر",
    href: "/directions",
    icon: "Cairo_directions.svg",
    badge: "اتجاهات ومسارات",
    keywords: ["ازاي اروح", "ازاي اوصل", "اروح ازاي", "مواصلات", "طريق", "مسار", "اتجاهات"]
  },
  {
    id: "ai-planner",
    label: "مخطط الرحلات الذكي",
    subtitle: "تخطيط رحلتك بالذكاء الاصطناعي",
    href: "/ai-planner",
    icon: "Cairo_planner.svg",
    badge: "تخطيط ذكي",
    keywords: ["ذكاء اصطناعي", "مخطط", "رحلة", "رحلات", "مسارات", "تخطيط", "AI"]
  }
];

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMac, setIsMac] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePlaces, setActivePlaces] = useState<Place[]>(initialPlaces);

  const needleRef = useRef<SVGSVGElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Detect platform for shortcut key rendering
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener to focus the search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't focus if user is typing in other inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Fetch live places from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPlaces = async () => {
      try {
        if (!supabase) return;
        const { data: dbPlaces, error } = await supabase
          .from("places")
          .select("*, branches(*)");
        if (!error && dbPlaces && dbPlaces.length > 0 && isMounted) {
          setActivePlaces(dbPlaces.map(mapDbPlaceToPlace));
        }
      } catch (err) {
        console.warn("Could not fetch places in 404 page:", err);
      }
    };
    fetchPlaces();
    return () => {
      isMounted = false;
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Compass mouse tracking logic
  useEffect(() => {
    let angle = 0;
    let isMouseActive = false;
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      if (!needleRef.current) return;
      isMouseActive = true;
      const rect = needleRef.current.getBoundingClientRect();
      const needleCenterX = rect.left + rect.width / 2;
      const needleCenterY = rect.top + rect.height / 2;
      const deltaX = e.clientX - needleCenterX;
      const deltaY = e.clientY - needleCenterY;
      const rad = Math.atan2(deltaY, deltaX);
      const deg = rad * (180 / Math.PI) + 90; // +90 to align with vertical SVG pointer

      needleRef.current.style.transform = `rotate(${deg}deg)`;

      // Reset to idle animation after 3 seconds of inactivity
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        isMouseActive = false;
      }, 3000);
    };

    const animateDefault = () => {
      if (!isMouseActive && needleRef.current) {
        angle = (angle + 0.6) % 360;
        needleRef.current.style.transform = `rotate(${angle}deg)`;
      }
      animationFrameId = requestAnimationFrame(animateDefault);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(animateDefault);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Live filter query words
  const queryWords = getSearchWords(searchQuery);

  // ── 5. فلترة خدمات الموقع المطابقة للبحث ──
  const matchedServices = searchQuery.trim() && queryWords.length > 0
    ? SITE_SERVICES.filter(service => {
      const serviceText = getSearchCleanedText([
        service.label,
        service.subtitle,
        ...service.keywords
      ].join(" "));

      return queryWords.every(word => serviceText.includes(word));
    })
    : [];

  // ── 6. فلترة الأماكن والمحلات الحية في دليل الأماكن ──
  const matchedPlaces = searchQuery.trim() && queryWords.length > 0
    ? activePlaces.filter(place => {
      const categoryLabels: Record<string, string> = {};
      CATEGORIES_STRUCTURE.forEach(main => {
        categoryLabels[main.name] = main.label;
        main.subCategories.forEach(sub => {
          categoryLabels[sub.name] = sub.label;
        });
      });

      const rawSearchableText = [
        place.name,
        place.name_en || "",
        place.categoryLabel,
        categoryLabels[place.category] || place.category,
        ...(place.subCategories || []).map(sc => categoryLabels[sc] || sc),
        place.place_type || "",
        place.city || "",
        place.governorate || "",
        place.briefLocation || "",
        place.fullAddress || "",
        place.description || "",
        place.category === "food_drinks" ? "اكل مشروبات مطعم مطاعم كافيه كافيهات مقهى قهاوي" : "",
        place.subCategories?.includes("restaurant") ? "مطعم مطاعم اكل" : "",
        place.subCategories?.includes("cafe") ? "كافيه كافيهات مقهى قهاوي مشروبات" : "",
        place.subCategories?.includes("pharmacy") ? "صيدلية صيدليات علاج دواء" : "",
        place.subCategories?.includes("hospital") ? "مستشفى مستشفيات عيادة مركز طبي صحة" : "",
        place.subCategories?.includes("park") ? "حديقة حدائق منتزه ملاهي اماكن عامة" : "",
      ].filter(Boolean).join(" ");

      const searchableText = getSearchCleanedText(rawSearchableText);

      return queryWords.every(word => searchableText.includes(word));
    }).slice(0, 5)
    : [];

  // ── 7. فلترة الفئات الرئيسية والفرعية ──
  const matchedCategories = searchQuery.trim() && queryWords.length > 0
    ? CATEGORIES_STRUCTURE.filter(cat => {
      const categorySearchable = getSearchCleanedText([
        cat.label,
        ...cat.subCategories.map(sub => sub.label)
      ].join(" "));

      return queryWords.every(word => categorySearchable.includes(word));
    }).slice(0, 3)
    : [];

  const hasResults = matchedServices.length > 0 || matchedPlaces.length > 0 || matchedCategories.length > 0;

  const handleSearchSubmit = (e: React.FormEvent, forceFullSearch: boolean = false) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!forceFullSearch) {
      if (matchedServices && matchedServices.length > 0) {
        setIsDropdownOpen(false);
        router.push(matchedServices[0].href);
        return;
      }
      if (matchedPlaces && matchedPlaces.length === 1) {
        setIsDropdownOpen(false);
        router.push(`/places/${matchedPlaces[0].id}`);
        return;
      }
    }
    setIsDropdownOpen(false);
    router.push(`/places?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem 4rem",
        background: "var(--bgPrimary)",
        color: "var(--textPrimary)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* CSS Stylesheet Inject for custom page animations and hovers */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 111, 238, 0.15); }
            50% { transform: scale(1.05); box-shadow: 0 10px 35px rgba(0, 111, 238, 0.3); }
            100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 111, 238, 0.15); }
          }
          @keyframes glow {
            0% { text-shadow: 0 0 15px rgba(0, 111, 238, 0.3); }
            50% { text-shadow: 0 0 35px rgba(0, 111, 238, 0.75), 0 0 50px rgba(59, 130, 246, 0.3); }
            100% { text-shadow: 0 0 15px rgba(0, 111, 238, 0.3); }
          }
          .glow-text {
            animation: glow 3s infinite ease-in-out;
          }
          .compass-container {
            animation: pulse 4s infinite ease-in-out;
            transition: border-color 0.3s;
          }
          .compass-container:hover {
            border-color: var(--colorPrimary) !important;
          }
          .shortcut-card {
            transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.25s, background-color 0.25s, box-shadow 0.25s;
          }
          .shortcut-card:hover {
            border-color: var(--colorPrimary) !important;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
          }
          html.light .shortcut-card {
            background: rgba(0, 0, 0, 0.02) !important;
          }
          html.light .shortcut-card:hover {
            background: rgba(0, 111, 238, 0.04) !important;
            box-shadow: 0 12px 24px rgba(0, 111, 238, 0.06);
          }
          .search-form {
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .search-form:focus-within {
            border-color: var(--colorPrimary) !important;
            box-shadow: 0 10px 30px var(--shadow-card), 0 0 0 3px rgba(0, 111, 238, 0.15) !important;
          }
          .action-btn {
            transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s, border-color 0.2s;
          }
          .action-btn:hover {
            transform: translateY(-2px);
          }
          .action-btn:active {
            transform: translateY(0) scale(0.97);
          }
        `
      }} />

      {/* Decorative Radial Background Lights */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 111, 238, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "840px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Interactive Custom Compass Widget */}
        <div
          className="compass-container"
          style={{
            position: "relative",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "var(--bgGlass, rgba(0, 0, 0, 0.5))",
            border: "2px solid var(--borderGlass-bright, rgba(255, 255, 255, 0.12))",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
            userSelect: "none",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Compass cardinal points (Arabic layout) */}
          <span style={{ position: "absolute", top: "8px", left: "50%", transform: "translateX(-50%)", fontSize: "0.8rem", fontWeight: 800, color: "var(--colorPrimary)" }}>ش</span>
          <span style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", fontSize: "0.8rem", fontWeight: 800, color: "var(--textSecondary)" }}>ج</span>
          <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", fontWeight: 800, color: "var(--textSecondary)" }}>ق</span>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", fontWeight: 800, color: "var(--textSecondary)" }}>غ</span>

          {/* Inside grid circles */}
          <div style={{
            position: "absolute",
            width: "86px",
            height: "86px",
            borderRadius: "50%",
            border: "1px dashed var(--borderGlass, rgba(255,255,255,0.06))",
            pointerEvents: "none"
          }} />

          {/* Compass Needle */}
          <svg
            ref={needleRef}
            width="24"
            height="64"
            viewBox="0 0 24 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "relative",
              zIndex: 2,
              transformOrigin: "center center",
              transition: "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {/* Top Blue-gradient Pointer */}
            <path d="M12 2L20 32H12V2Z" fill="var(--colorPrimary)" />
            <path d="M12 2L4 32H12V2Z" fill="#3b82f6" />
            {/* Bottom Grey Pointer */}
            <path d="M12 62L20 32H12V62Z" fill="#a1a1aa" />
            <path d="M12 62L4 32H12V62Z" fill="#71717a" />
            {/* Center Pivot Point */}
            <circle cx="12" cy="32" r="3.5" fill="#ffffff" stroke="var(--colorPrimary)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Heading & Subtitle */}
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 850,
            marginBottom: "0.75rem",
            lineHeight: 1.3,
            letterSpacing: "-0.5px",
          }}
        >
          توهت في شوارع المدينة ؟ 🗺️
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--textSecondary)",
            maxWidth: "600px",
            margin: "0 auto 2.25rem",
            lineHeight: 1.6,
          }}
        >
          عذراً، الصفحة أو المحطة التي تحاول الوصول إليها غير موجودة على الخريطة حالياً أو تم تغيير مسارها.
        </p>

        {/* Quick Search Section (Matching Homepage style + suggestions dropdown) */}
        <div
          ref={searchContainerRef}
          style={{
            maxWidth: "720px",
            width: "100%",
            margin: "0 auto 2.5rem auto",
            position: "relative"
          }}
        >
          <form onSubmit={(e) => handleSearchSubmit(e, false)}>
            <div
              className="search-form"
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--bgGlass)",
                border: isDropdownOpen && searchQuery.trim() ? "1.5px solid var(--colorPrimary)" : "1.5px solid var(--borderPrimary)",
                borderRadius: "var(--radius-xl)",
                padding: "8px 15px 8px 15px",
                boxShadow: "0 10px 30px var(--shadow-card)",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.2s ease"
              }}
            >
              <FaSearch style={{ fontSize: "1.2rem", color: "var(--textMuted)", marginLeft: "12px" }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث عن الخدمة..."
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--textPrimary)",
                  fontSize: "1rem",
                  fontFamily: "var(--font-heading)",
                  textAlign: "right"
                }}
              />
              <button
                type="button"
                onClick={() => {
                  searchInputRef.current?.focus();
                  setIsDropdownOpen(true);
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                  border: "1px solid var(--borderGlass)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "var(--radius-sm)",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  transition: "var(--transition-smooth)",
                  userSelect: "none",
                  outline: "none",
                  height: "36px",
                }}
              >
                <kbd style={{
                  fontFamily: "inherit",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "var(--textPrimary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "20px"
                }}>K</kbd>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "bold" }}>+</span>
                <kbd style={{
                  fontFamily: "inherit",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "var(--textPrimary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "20px"
                }}>{isMac ? "⌘" : "Ctrl"}</kbd>
              </button>
            </div>
          </form>

          {/* ── UNIVERSAL LIVE SEARCH DROPDOWN ── */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              backgroundColor: "var(--card-glass, rgba(17, 17, 17, 0.986))",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--borderGlass-bright)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              zIndex: 100,
              maxHeight: "450px",
              overflowY: "auto",
              textAlign: "right",
              padding: "12px"
            }}>

              {/* 1. MATCHED SITE SERVICES */}
              {matchedServices.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--colorPrimary)",
                    padding: "6px 12px",
                    marginBottom: "6px"
                  }}>
                    <FaLightbulb />
                    <span>هل تقصد صفحة أو خدمة بالموقع؟</span>
                  </div>

                  {matchedServices.map((service) => (
                    <Link
                      key={service.id}
                      href={service.href}
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--hoverBtn, rgba(39, 39, 42, 0.8))",
                        border: "1px solid var(--borderGlass)",
                        marginBottom: "6px",
                        textDecoration: "none",
                        color: "var(--textPrimary)",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={`/images/icons2d/${service.icon}`}
                          alt={service.label}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "30px", height: "30px", objectFit: "contain" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{service.label}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{service.subtitle}</div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(0, 111, 238, 0.15)",
                        color: "var(--colorPrimary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>انتقال</span>
                        <FaChevronLeft style={{ fontSize: "0.65rem" }} />
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* 2. MATCHED PLACES */}
              {matchedPlaces.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--accent-secondary, #10b981)",
                    padding: "6px 12px",
                    marginBottom: "6px"
                  }}>
                    <FaMapMarkerAlt />
                    <span>الأماكن ذات الصلة ({matchedPlaces.length})</span>
                  </div>

                  {matchedPlaces.map((place) => (
                    <Link
                      key={place.id}
                      href={`/places/${place.id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--hoverBtn, rgba(39, 39, 42, 0.8))",
                        border: "1px solid var(--borderGlass)",
                        marginBottom: "6px",
                        textDecoration: "none",
                        color: "var(--textPrimary)",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={getMainCategoryImage(place.category, place.subCategories)}
                          alt={place.name}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "30px", height: "30px", objectFit: "contain" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                            {place.name}
                            {place.name_en && (
                              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "6px", fontWeight: "normal" }}>
                                ({place.name_en})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {place.categoryLabel} {place.briefLocation ? `• ${place.briefLocation}` : ""}
                          </div>
                        </div>
                      </div>
                      <FaChevronLeft style={{ fontSize: "0.75rem", color: "var(--text-muted)" }} />
                    </Link>
                  ))}
                </div>
              )}

              {/* 3. MATCHED CATEGORIES */}
              {matchedCategories.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "#eab308",
                    padding: "6px 12px",
                    marginBottom: "6px"
                  }}>
                    <span>🗂️</span>
                    <span>الفئات والأنشطة</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "0 6px" }}>
                    {matchedCategories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={`/places?category=${cat.name}`}
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: "var(--hoverBtn, rgba(39, 39, 42, 0.8))",
                          border: "1px solid var(--borderGlass)",
                          textDecoration: "none",
                          color: "var(--textPrimary)",
                          fontSize: "0.85rem"
                        }}
                      >
                        <img src={`/images/icons3d/${cat.image}`} alt={cat.name} loading="lazy" decoding="async" style={{ width: "20px" }} />
                        <span>{cat.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* NO RESULTS FALLBACK */}
              {!hasResults && (
                <div style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  color: "var(--textSecondary)",
                  fontFamily: "var(--font-body)"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "6px" }}>
                    <FaInbox style={{ fontSize: "2rem", marginBottom: "6px" }} />
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "1rem", color: "var(--textPrimary)", marginBottom: "4px" }}>
                    عفواً، لا توجد نتائج مطابقة لـ &quot;{searchQuery}&quot;
                  </div>
                  <div style={{ fontSize: "0.82rem", marginBottom: "14px", color: "var(--textSecondary)" }}>
                    لم نجد نتائج مطابقة مباشرة في الدليل. يمكنك تجربة التالي:
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        backgroundColor: "var(--hoverBtn, rgba(39, 39, 42, 0.8))",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textPrimary)",
                        fontSize: "0.82rem",
                        cursor: "pointer"
                      }}
                    >
                      🔄 مسح البحث
                    </button>
                    <Link
                      href="/ai-planner"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#8b5cf6",
                        color: "#ffffff",
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        fontWeight: "700"
                      }}
                    >
                      مخطط الرحلات الذكي
                    </Link>
                    <Link
                      href="/propose-place"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        backgroundColor: "var(--hoverBtn, rgba(39, 39, 42, 0.8))",
                        border: "1px solid var(--colorPrimary)",
                        color: "var(--colorPrimary)",
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        fontWeight: "700"
                      }}
                    >
                      ➕ اقتراح مكان
                    </Link>
                  </div>
                </div>
              )}

              {/* FULL SEARCH BUTTON AT BOTTOM */}
              <button
                type="button"
                onClick={(e) => handleSearchSubmit(e, true)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "var(--paddingBtn)",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--colorPrimary)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-sub)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <FaSearch style={{ fontSize: "0.85rem" }} />
                <span>عرض كافة النتائج لـ &quot;{searchQuery}&quot;</span>
              </button>

            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            justifyContent: "center",
            marginBottom: "3.5rem",
            width: "100%",
          }}
        >
          <Link
            href="/"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--colorPrimary)",
              color: "#ffffff",
              padding: "var(--paddingBtn)",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <FaHome size={16} />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/ai-planner"
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.95rem",
              backdropFilter: "blur(8px)",
            }}
          >
            <FaRobot size={16} />
            <span>المخطط الذكي</span>
          </Link>

          <button
            onClick={() => router.back()}
            className="btn btn-cancel"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <FaArrowRight size={14} />
            <span>الرجوع للخلف</span>
          </button>
        </div>

        {/* Shortcut Grid to Popular Sections */}
        <div
          style={{
            background: "var(--bgGlass)",
            border: "1px solid var(--borderPrimary)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem",
            backdropFilter: "blur(16px)",
            width: "100%",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "var(--textSecondary)",
              marginBottom: "1.5rem",
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaRoute style={{ color: "var(--colorPrimary)" }} />
            <span>ربما تكون تبحث عن إحدى هذه الوجهات:</span>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              width: "100%",
            }}
          >
            {/* Metro */}
            <Link
              href="/metro"
              className="shortcut-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))",
                borderRadius: "var(--radius-sm, 14px)",
                border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.08))",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img src="/images/icons2d/metro.svg" alt=" metro " width="42" />
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: "0.95rem" }}>خريطة المترو</div>
                <p style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "2px" }}>المحطات والاشتراكات</p>
              </div>
            </Link>

            {/* Bus Stations */}
            <Link
              href="/bus-stations"
              className="shortcut-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))",
                borderRadius: "var(--radius-sm, 14px)",
                border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.08))",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img src="/images/icons2d/bus.png" alt=" bus " width="42" />
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: "0.95rem" }}>مواقف الأتوبيس</div>
                <p style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "2px" }}>خطوط الأتوبيس والسرفيس</p>
              </div>
            </Link>

            {/* Services Directory */}
            <Link
              href="/directory"
              className="shortcut-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))",
                borderRadius: "var(--radius-sm, 14px)",
                border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.08))",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img src="/images/icons2d/shop.png" alt=" directory " width="42" />
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: "0.95rem" }}>دليل الخدمـات</div>
                <p style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "2px" }}>مطاعم، مستشفيات، بنوك</p>
              </div>
            </Link>

            {/* Parking */}
            <Link
              href="/parking"
              className="shortcut-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))",
                borderRadius: "var(--radius-sm, 14px)",
                border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.08))",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img src="/images/icons2d/parking.png" alt=" parking " width="42" />
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: "0.95rem" }}>أماكن الانتظار</div>
                <p style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "2px" }}>جراجات ومواقف السيارات</p>
              </div>
            </Link>

            {/* Airports */}
            <Link
              href="/airports"
              className="shortcut-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))",
                borderRadius: "var(--radius-sm, 14px)",
                border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.08))",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img src="/images/icons2d/airport.png" alt=" airport " width="42" />
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: "0.95rem" }}>المطارات والموانئ</div>
                <p style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "2px" }}>مطار القاهرة والسفر</p>
              </div>
            </Link>

            {/* Help and Support */}
            <Link
              href="/profile?expand=help#help-section"
              className="shortcut-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))",
                borderRadius: "var(--radius-sm, 14px)",
                border: "1px solid var(--borderGlass, rgba(255, 255, 255, 0.08))",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img src="/images/icons2d/Cairo_logo.png" alt=" add " width="42" />
              </div>
              <div>
                <div style={{ fontWeight: 750, fontSize: "0.95rem" }}>المساعدة</div>
                <p style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "2px" }}>التواصل والمساعدة</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
