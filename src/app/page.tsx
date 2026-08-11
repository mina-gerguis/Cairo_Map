"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaSubway, 
  FaRobot, 
  FaCompass, 
  FaPlusCircle, 
  FaArrowLeft,
  FaLightbulb,
  FaChevronLeft
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { initialPlaces, CATEGORIES_STRUCTURE, Place } from "@/data/places";

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

// ── 2. دالة تحويل وتوحيد بيانات المكان من Supabase لضمان التطابق مع دليل الأماكن ──
function mapDbPlaceToPlace(dbPlace: any): Place {
  const rawCategory = dbPlace.category;
  let finalCategory = rawCategory;
  let finalSubCategories = Array.isArray(dbPlace.sub_categories) ? [...dbPlace.sub_categories] : [];

  if (rawCategory === 'restaurant' || rawCategory === 'cafe') {
    finalCategory = 'food_drinks';
    if (!finalSubCategories.includes(rawCategory)) finalSubCategories.push(rawCategory);
  } else if (rawCategory === 'garden' || rawCategory === 'outings') {
    finalCategory = 'public_places';
    if (!finalSubCategories.includes('park')) finalSubCategories.push('park');
  } else if (rawCategory === 'medicalCenter' || rawCategory === 'hospital' || rawCategory === 'pharmacy') {
    finalCategory = 'health';
    const mappedSub = rawCategory === 'medicalCenter' ? 'clinic' : rawCategory;
    if (!finalSubCategories.includes(mappedSub)) finalSubCategories.push(mappedSub);
  } else if (rawCategory === 'health_beauty') {
    finalCategory = 'services';
    if (!finalSubCategories.includes('beauty_salon')) finalSubCategories.push('beauty_salon');
  } else if (rawCategory === 'family' || rawCategory === 'kids' || rawCategory === 'amusement_aqua' || rawCategory === 'cinema') {
    finalCategory = 'entertainment';
  } else if (rawCategory === 'quiet_places') {
    finalCategory = 'public_places';
  } else if (rawCategory === 'work') {
    finalCategory = 'business';
  } else if (rawCategory === 'courses_study') {
    finalCategory = 'education';
  } else if (rawCategory === 'hotel') {
    finalCategory = 'tourism';
  } else if (rawCategory === 'mall') {
    finalCategory = 'shopping';
  }

  return {
    id: dbPlace.id,
    name: dbPlace.name,
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

// ── 3. دالة تنسيق عدد الأماكن المسجلة باللغة العربية ──
function formatPlacesCount(count: number): string {
  if (!count || count === 0) return "0 مكان مسجل";
  if (count === 1) return "مكان واحد مسجل";
  if (count === 2) return "مكانين مسجلين";
  if (count >= 3 && count <= 10) return `${count} أماكن مسجلة`;
  return `${count} مكان مسجل`;
}

// ── 4. فهرس خدمات وصفحات الموقع المباشرة (Site Services Index) ──
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
    label: "خريطة مترو القاهرة والأنفاق",
    subtitle: "خطوط المترو الـ 4، محطات المترو والمواقف القريبة",
    href: "/metro",
    icon: "🚇",
    badge: "مواصلات المترو",
    keywords: ["مترو", "المترو", "انفاق", "الانفاق", "محطات المترو", "خط المترو", "تذكرة المترو", "مترو القاهرة", "metro"]
  },
  {
    id: "monorail",
    label: "قطار المنورايل (العاصمة الإدارية / 6 أكتوبر)",
    subtitle: "مسارات، محطات وأسعار تذاكر المنورايل المعلق",
    href: "/monorail",
    icon: "🚝",
    badge: "قطار معلق",
    keywords: ["منورايل", "المنورايل", "قطار العاصمة", "العاصمة الادارية", "اكتوبر", "monorail"]
  },
  {
    id: "lrt",
    label: "القطار الكهربائي الخفيف (LRT)",
    subtitle: "محطات ومواعيد القطار الكهربائي الخفيف",
    href: "/lrt",
    icon: "⚡",
    badge: "القطار الكهربائي",
    keywords: ["lrt", "القطار الكهربائي", "كهربائي", "القطار الخفيف", "قطار العاشر"]
  },
  {
    id: "railways",
    label: "سكك حديد مصر ومحطة رمسيس",
    subtitle: "مواعيد وأسعار قطارات القاهرة والصعيد والوجه البحري",
    href: "/railways",
    icon: "🚂",
    badge: "قطارات مصر",
    keywords: ["قطار", "قطارات", "سكك حديد", "سكك حديد مصر", "محطة رمسيس", "رمسيس", "قطار الصعيد", "قطار اسكندرية"]
  },
  {
    id: "directory",
    label: "دليل التليفونات والأكواد المختصرة",
    subtitle: "أرقام الطوارئ، الخدمات الحكومية، وأكواد شبكات المحمول",
    href: "/directory",
    icon: "📞",
    badge: "دليل الهواتف",
    keywords: ["تليفون", "تليفونات", "هاتف", "اكواد", "أكواد", "طوارئ", "فودافون", "اورنج", "اتصالات", "وي", "ارقام", "خدمة العملاء"]
  },
  {
    id: "directions",
    label: "خدمة ازاي اروح؟ (دليل الطرق والمواصلات)",
    subtitle: "دليل طرق الوصول والتنقل لأي مكان في مصر بسهولة",
    href: "/directions",
    icon: "🧭",
    badge: "اتجاهات ومسارات",
    keywords: ["ازاي اروح", "ازاي اوصل", "اروح ازاي", "مواصلات", "طريق", "مسار", "اتجاهات"]
  },
  {
    id: "ai-planner",
    label: "مخطط الرحلات الذكي (AI Travel Planner)",
    subtitle: "برنامج خروجة مخصص وتخطيط يومك بالذكاء الاصطناعي",
    href: "/ai-planner",
    icon: "🤖",
    badge: "ذكاء اصطناعي",
    keywords: ["خروجة", "تخطيط", "مخطط", "رحلات", "برنامج", "ذكاء", "ذكاء اصطناعي", "ai", "افكار خروج"]
  },
  {
    id: "bus-stations",
    label: "مواقف الأتوبيسات وهيئة النقل العام",
    subtitle: "أماكن محطات ومواقف الأتوبيسات بالقاهرة والجيزة",
    href: "/bus-stations",
    icon: "🚌",
    badge: "مواقف أتوبيس",
    keywords: ["اتوبيس", "أتوبيس", "موقف اتوبيس", "نقل عام", "مواقف الأتوبيس"]
  },
  {
    id: "microbus-stations",
    label: "مواقف الميكروباص والسرفيس",
    subtitle: "مواقف خطوط السرفيس والميكروباص بين المحافظات",
    href: "/microbus-stations",
    icon: "🚐",
    badge: "مواقف ميكروباص",
    keywords: ["ميكروباص", "موقف ميكروباص", "سرفيس", "موقف سرفيس", "مواقف"]
  },
  {
    id: "airports",
    label: "المطارات والموانئ المصرية",
    subtitle: "معلومات مطار القاهرة، مطار سفنكس، والموانئ",
    href: "/airports",
    icon: "✈️",
    badge: "مطارات وموانئ",
    keywords: ["مطار", "مطارات", "مطار القاهرة", "سفنكس", "موانئ", "ميناء"]
  }
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ── حساب الإحصائيات الحقيقية والديناميكية للموقع ──
  const [activePlaces, setActivePlaces] = useState<Place[]>(initialPlaces);
  const [placesCount, setPlacesCount] = useState<number>(initialPlaces.length);
  const [phonesCount, setPhonesCount] = useState<number>(() => {
    return initialPlaces.reduce((sum, p) => sum + (p.phones?.length || 0), 0);
  });
  const [transitCount] = useState<number>(4);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchDynamicStats() {
      try {
        let currentPlaces: Place[] = [...initialPlaces];

        if (supabase) {
          // جلب الأماكن الحية المباشرة من جدول places بـ Supabase لموافق الدليل رسمياً
          const { data: dbPlaces, error } = await supabase.from("places").select("*, branches(*)");
          if (!error && dbPlaces) {
            if (dbPlaces.length > 0) {
              currentPlaces = dbPlaces.map(mapDbPlaceToPlace);
            } else {
              currentPlaces = [];
            }
          }

          // جلب عدد هواتف وأكواد التليفون من Supabase
          const { count: phoneDirCount } = await supabase
            .from("phone_directory")
            .select("id", { count: "exact", head: true });

          const { count: telecomCount } = await supabase
            .from("telecom_codes")
            .select("id", { count: "exact", head: true });

          let totalPhones = currentPlaces.reduce((sum, p) => sum + (p.phones?.length || 0), 0);
          totalPhones += (phoneDirCount || 0) + (telecomCount || 0);

          if (isMounted) {
            setPhonesCount(totalPhones);
          }
        }

        // حساب عدد الأماكن الفعلي الدقيق المسجل لكل فئة
        const counts: Record<string, number> = {};
        CATEGORIES_STRUCTURE.forEach(mainCat => {
          const subCatNames = new Set(mainCat.subCategories.map(s => s.name));
          const matchCount = currentPlaces.filter(place => {
            if (place.category === mainCat.name) return true;
            if (subCatNames.has(place.category)) return true;
            if (place.subCategories?.some(sub => subCatNames.has(sub))) return true;
            if (place.categoryLabel === mainCat.label) return true;
            return false;
          }).length;

          counts[mainCat.name] = matchCount;
        });

        if (isMounted) {
          setActivePlaces(currentPlaces);
          setPlacesCount(currentPlaces.length);
          setCategoryCounts(counts);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    fetchDynamicStats();
    return () => { isMounted = false; };
  }, []);

  // ── إغلاق القائمة المنسدلة عند النقر خارج شريط البحث ──
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizedQuery = normalizeArabic(searchQuery);

  // ── 5. فلترة خدمات الموقع المطابقة للبحث ──
  const matchedServices = searchQuery.trim()
    ? SITE_SERVICES.filter(service => {
        const normLabel = normalizeArabic(service.label);
        const normSubtitle = normalizeArabic(service.subtitle);
        const normKeywords = service.keywords.map(k => normalizeArabic(k));
        
        return normLabel.includes(normalizedQuery) ||
               normSubtitle.includes(normalizedQuery) ||
               normKeywords.some(k => k.includes(normalizedQuery) || normalizedQuery.includes(k));
      })
    : [];

  // ── 6. فلترة الأماكن والمحلات الحية في دليل الأماكن ──
  const matchedPlaces: Place[] = searchQuery.trim()
    ? activePlaces.filter(place => {
        const normName = normalizeArabic(place.name);
        const normLoc = normalizeArabic(place.briefLocation || "");
        const normAddr = normalizeArabic(place.fullAddress || "");
        const normCat = normalizeArabic(place.categoryLabel || "");

        return normName.includes(normalizedQuery) ||
               normLoc.includes(normalizedQuery) ||
               normAddr.includes(normalizedQuery) ||
               normCat.includes(normalizedQuery);
      }).slice(0, 5)
    : [];

  // ── 7. فلترة الفئات الرئيسية والفرعية ──
  const matchedCategories = searchQuery.trim()
    ? CATEGORIES_STRUCTURE.filter(cat => {
        const normLabel = normalizeArabic(cat.label);
        const normSub = cat.subCategories.some(sub => normalizeArabic(sub.label).includes(normalizedQuery));
        return normLabel.includes(normalizedQuery) || normSub;
      }).slice(0, 3)
    : [];

  const hasResults = matchedServices.length > 0 || matchedPlaces.length > 0 || matchedCategories.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    if (searchQuery.trim()) {
      router.push(`/places?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/places");
    }
  };

  const quickSearchTags = [
    { label: "مطاعم", category: "food_drinks", icon: "🍔" },
    { label: "كافيهات", category: "food_drinks", icon: "☕" },
    { label: "مستشفيات وطوارئ", category: "health", icon: "🏥" },
    { label: "مولات وتسوق", category: "shopping", icon: "🛍️" },
    { label: "خريطة المترو", route: "/metro", icon: "🚇" },
    { label: "دليل الهواتف", route: "/directory", icon: "📞" },
    { label: "ازاي اروح؟", route: "/directions", icon: "🧭" },
  ];

  const mainServices = [
    {
      id: "places",
      title: "دليل الأماكن والمحلات",
      desc: "استكشف المطاعم، الكافيهات، الأطباء، والمحلات في القاهرة والجيزة مع مواعيد العمل الرسمية، الفروع، وأرقام الهواتف.",
      icon: <FaMapMarkerAlt style={{ fontSize: "1.6rem", color: "#3b82f6" }} />,
      badge: "الأكثر استخداماً",
      link: "/places",
      color: "rgba(59, 130, 246, 0.12)",
      borderColor: "rgba(59, 130, 246, 0.3)",
      iconBg: "rgba(59, 130, 246, 0.15)",
    },
    {
      id: "ai-planner",
      title: "مخطط الرحلات الذكي (AI)",
      desc: "صمّم خطة خروجة أو يوم كامل بالذكاء الاصطناعي بناءً على ميزانيتك، اهتماماتك الشخصية، والمنطقة التي تفضلها.",
      icon: <FaRobot style={{ fontSize: "1.6rem", color: "#a855f7" }} />,
      badge: "ذكاء اصطناعي",
      link: "/ai-planner",
      color: "rgba(168, 85, 247, 0.12)",
      borderColor: "rgba(168, 85, 247, 0.3)",
      iconBg: "rgba(168, 85, 247, 0.15)",
    },
    {
      id: "directory",
      title: "دليل الهواتف والأكواد",
      desc: "دليل شامل لأرقام الطوارئ، الهيئات الخدمية، وأكواد باقات وفليكسات شبكات المحمول (فودافون، أورنج، اتصالات، وي).",
      icon: <FaPhoneAlt style={{ fontSize: "1.6rem", color: "#10b981" }} />,
      badge: "دليل سريع",
      link: "/directory",
      color: "rgba(16, 185, 129, 0.12)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      iconBg: "rgba(16, 185, 129, 0.15)",
    },
    {
      id: "transit",
      title: "شبكات المترو والمنورايل والقطارات",
      desc: "خرائط تفاعلية لخطوط مترو الأنفاق 1 و 2 و 3 و 4، القطار الكهربائي LRT، المنورايل، ومواعيد القطارات.",
      icon: <FaSubway style={{ fontSize: "1.6rem", color: "#f59e0b" }} />,
      badge: "مواصلات",
      link: "/metro",
      color: "rgba(245, 158, 11, 0.12)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      iconBg: "rgba(245, 158, 11, 0.15)",
    },
    {
      id: "directions",
      title: "دليل ازاي اروح والمواقف",
      desc: "اعثر على طريقة الوصول لأي مكان في مصر بسهولة مع مواقف الأتوبيس، الميكروباص، المطارات، والموانئ.",
      icon: <FaCompass style={{ fontSize: "1.6rem", color: "#f43f5e" }} />,
      badge: "اتجاهات",
      link: "/directions",
      color: "rgba(244, 63, 94, 0.12)",
      borderColor: "rgba(244, 63, 94, 0.3)",
      iconBg: "rgba(244, 63, 94, 0.15)",
    },
    {
      id: "propose",
      title: "إضافة واقتراح مكان جديد",
      desc: "هل تملك نشاطاً تجارياً أو تريد إضافة مكان جديد على دليل القاهرة ماب؟ أضفه مجاناً ليصل لملايين الزوار.",
      icon: <FaPlusCircle style={{ fontSize: "1.6rem", color: "#06b6d4" }} />,
      badge: "مجاني",
      link: "/propose-place",
      color: "rgba(6, 182, 212, 0.12)",
      borderColor: "rgba(6, 182, 212, 0.3)",
      iconBg: "rgba(6, 182, 212, 0.15)",
    },
  ];

  const stats = [
    { label: "مكان ومحل مفصّل", value: placesCount > 0 ? `+${placesCount}` : "0", icon: "📍" },
    { label: "شبكة مواصلات ومترو", value: `${transitCount} شبكات`, icon: "🚇" },
    { label: "رقم تليفون وكود طوارئ", value: `+${phonesCount}`, icon: "📞" },
    { label: "تنسيق ذكي للرحلات", value: "100% AI", icon: "🤖" },
  ];

  const categoryCards = CATEGORIES_STRUCTURE;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
      {/* ── 1. HERO SECTION ── */}
      <section style={{
        position: "relative",
        padding: "60px 20px 80px 20px",
        overflow: "visible",
        background: "radial-gradient(circle at 50% 0%, rgba(0, 111, 238, 0.15) 0%, rgba(0,0,0,0) 70%)",
        borderBottom: "1px solid var(--border-glass)"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "999px",
            backgroundColor: "var(--bg-glass-card)",
            border: "1px solid var(--border-glass-bright)",
            fontSize: "0.9rem",
            color: "var(--accent-primary)",
            marginBottom: "24px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <span>✨</span>
            <span>دليلك الذكي الشامل لشوارع وأماكن القاهرة والمحافظات</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "800",
            lineHeight: "1.25",
            marginBottom: "20px",
            letterSpacing: "-0.5px"
          }}>
            استكشف القاهرة وتنقّل بذكاء وسرعة ودقة متناهية
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            maxWidth: "780px",
            margin: "0 auto 36px auto",
            lineHeight: "1.7"
          }}>
            منصتك المتكاملة لاستكشاف أماكن المطاعم، الكافيهات، العيادات، شبكات المترو والمنورايل، خطوط المواصلات، ودليل الهواتف والأكواد المختصرة.
          </p>

          {/* Hero Universal Live Search Box Container */}
          <div ref={searchContainerRef} style={{
            maxWidth: "720px",
            margin: "0 auto 28px auto",
            position: "relative"
          }}>
            <form onSubmit={handleSearchSubmit}>
              <div style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--bg-glass-card)",
                border: isDropdownOpen && searchQuery.trim() ? "1.5px solid var(--accent-primary)" : "1.5px solid var(--border-glass-bright)",
                borderRadius: "var(--radius-xl)",
                padding: "8px 12px 8px 18px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.2s ease"
              }}>
                <FaSearch style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginLeft: "12px" }} />
                <input
                  type="text"
                  placeholder="ابحث عن مكان، مطعم، كافيه، أو وسيلة مواصلات (مثال: مترو، رمسيس)..."
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
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    fontFamily: "var(--font-heading)"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    padding: "12px 24px",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <span>بحث</span>
                  <FaArrowLeft style={{ fontSize: "0.85rem" }} />
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
                backgroundColor: "var(--card-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--border-glass-bright)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                zIndex: 100,
                maxHeight: "450px",
                overflowY: "auto",
                textAlign: "right",
                padding: "12px"
              }}>

                {/* 1. MATCHED SITE SERVICES (هل تقصد؟) */}
                {matchedServices.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--accent-primary)",
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
                          backgroundColor: "var(--bg-glass-hover)",
                          border: "1px solid var(--border-glass)",
                          marginBottom: "6px",
                          textDecoration: "none",
                          color: "var(--text-primary)",
                          transition: "var(--transition-fast)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "1.4rem" }}>{service.icon}</span>
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
                          color: "var(--accent-primary)",
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
                      color: "var(--accent-secondary)",
                      padding: "6px 12px",
                      marginBottom: "6px"
                    }}>
                      <FaMapMarkerAlt />
                      <span>الأماكن والمحلات ذات الصلة ({matchedPlaces.length})</span>
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
                          backgroundColor: "var(--bg-glass-hover)",
                          border: "1px solid var(--border-glass)",
                          marginBottom: "6px",
                          textDecoration: "none",
                          color: "var(--text-primary)",
                          transition: "var(--transition-fast)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.2rem" }}>📍</span>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{place.name}</div>
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
                            backgroundColor: "var(--bg-glass-hover)",
                            border: "1px solid var(--border-glass)",
                            textDecoration: "none",
                            color: "var(--text-primary)",
                            fontSize: "0.85rem"
                          }}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* NO RESULTS FALLBACK */}
                {!hasResults && (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>🔍</div>
                    <div>لا توجد نتائج مطابقة مباشرة لـ &quot;{searchQuery}&quot;</div>
                    <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>اضغط بحث للاستكشاف الكامل في دليل الأماكن</div>
                  </div>
                )}

                {/* 4. FULL SEARCH BUTTON AT BOTTOM */}
                <button
                  type="button"
                  onClick={(e) => handleSearchSubmit(e)}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--accent-primary)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <FaSearch style={{ fontSize: "0.85rem" }} />
                  <span>عرض كافة النتائج في دليل الأماكن لـ &quot;{searchQuery}&quot;</span>
                </button>

              </div>
            )}
          </div>

          {/* Quick tags */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            maxWidth: "800px",
            margin: "0 auto 40px auto"
          }}>
            {quickSearchTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (tag.route) {
                    router.push(tag.route);
                  } else {
                    router.push(`/places?category=${tag.category}`);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--bg-glass-hover)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "var(--transition-fast)"
                }}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

          {/* CTA Action Buttons */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px"
          }}>
            <Link
              href="/places"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 8px 20px rgba(0, 111, 238, 0.35)",
                transition: "var(--transition-smooth)"
              }}
            >
              <FaMapMarkerAlt style={{ fontSize: "1.1rem" }} />
              <span>دليل الأماكن (دليل القاهرة)</span>
            </Link>

            <Link
              href="/ai-planner"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 8px 20px rgba(139, 92, 246, 0.35)",
                transition: "var(--transition-smooth)"
              }}
            >
              <FaRobot style={{ fontSize: "1.2rem" }} />
              <span>مخطط الرحلات بالذكاء الاصطناعي</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── 2. DYNAMIC STATS STRIP ── */}
      <section style={{
        padding: "30px 20px",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-glass)"
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          textAlign: "center"
        }}>
          {stats.map((st, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-glass-card)",
                border: "1px solid var(--border-glass)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{st.icon}</span>
              <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>{st.value}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. MAIN SERVICES GRID ── */}
      <section style={{ padding: "70px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "12px" }}>
            جميع خدمات القاهرة ماب بين يديك
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
            اختر الخدمة التي تحتاجها للوصول السريع إلى أدق التفاصيل والمؤشرات الحية.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px"
        }}>
          {mainServices.map((service) => (
            <Link
              key={service.id}
              href={service.link}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "28px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--bg-glass-card)",
                border: `1.5px solid ${service.borderColor}`,
                background: service.color,
                boxShadow: "var(--shadow-md)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div>
                {/* Header icon & badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: service.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {service.icon}
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    backgroundColor: "var(--bg-glass-active)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-glass-bright)"
                  }}>
                    {service.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px" }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                  {service.desc}
                </p>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "var(--accent-primary)"
              }}>
                <span>الانتقال للخدمة</span>
                <FaArrowLeft style={{ fontSize: "0.8rem" }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. BROWSE BY CATEGORY PREVIEW ── */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-glass)",
        borderBottom: "1px solid var(--border-glass)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>
                تصفّح حسب الفئة في دليل الأماكن
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                اختر الفئة للاطلاع على كافة الفروع، المواعيد، وتقييمات الزوار
              </p>
            </div>

            <Link
              href="/places"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--accent-primary)",
                fontWeight: "700",
                fontSize: "0.95rem",
                textDecoration: "none"
              }}
            >
              <span>عرض الدليل الكامل (الكل)</span>
              <FaArrowLeft style={{ fontSize: "0.85rem" }} />
            </Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px"
          }}>
            {categoryCards.map((cat) => (
              <Link
                key={cat.name}
                href={`/places?category=${cat.name}`}
                style={{
                  textDecoration: "none",
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-glass-card)",
                  border: "1px solid var(--border-glass)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  transition: "var(--transition-fast)"
                }}
              >
                <div style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: `${cat.color}22`,
                  border: `1px solid ${cat.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem"
                }}>
                  {cat.emoji}
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {cat.label}
                  </h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {formatPlacesCount(categoryCounts[cat.name] || 0)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. AI PLANNER BANNER ── */}
      <section style={{ padding: "70px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
          border: "1.5px solid rgba(139, 92, 246, 0.4)",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(139, 92, 246, 0.3)",
            marginBottom: "20px"
          }}>
            <FaRobot style={{ fontSize: "2rem", color: "#c084fc" }} />
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
            محتار تخرج فين النهاردة؟ اترك التخطيط للذكاء الاصطناعي!
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "650px", margin: "0 auto 28px auto", lineHeight: "1.7" }}>
            حدد ميزانيتك، عدد الأفراد، والمنطقة المفضلة، وسيقوم المساعد الذكي بتنسيق برنامج يومك بالكامل مع أماكن الأكل والكافيهات والمواصلات المناسبة.
          </p>

          <Link
            href="/ai-planner"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 32px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "#8b5cf6",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)"
            }}
          >
            <span>جرب مخطط الرحلات الذكي الآن</span>
            <FaArrowLeft style={{ fontSize: "0.9rem" }} />
          </Link>
        </div>
      </section>

      {/* ── 6. PROPOSE PLACE CTA ── */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-glass)",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "12px" }}>
            هل تملك نشاطاً تجارياً أو تريد إضافة مكان جديد؟
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>
            ساهم معنا في تحديث دليل القاهرة ماب وأضف محلّك أو مكانك المفضّل مجاناً ليصل إلى آلاف الزوار.
          </p>
          <Link
            href="/propose-place"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-glass-card)",
              border: "1.5px solid var(--accent-primary)",
              color: "var(--accent-primary)",
              fontWeight: "700",
              fontSize: "0.95rem",
              textDecoration: "none"
            }}
          >
            <FaPlusCircle />
            <span>اقتراح أو إضافة مكان جديد</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
