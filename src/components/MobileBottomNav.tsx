"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { supabase } from "@/lib/supabase";
import { initialPlaces, CATEGORIES_STRUCTURE, Place, normalizePlaceCategory } from "@/data/places";

import { MdOutlineClose } from "react-icons/md";
import { GoHome, GoHomeFill } from "react-icons/go";
import { IoSearchOutline, IoSearch, IoSunnyOutline, IoMoonOutline, IoChevronBack } from "react-icons/io5";
import { RiNewspaperLine, RiNewspaperFill } from "react-icons/ri";
import { FaLightbulb, FaMapMarkerAlt } from "react-icons/fa";

const BUBBLE_W = 60;
const BUBBLE_W_DRAG = 76;
const NAV_ROUTES = ["/", "/blog", null, null, "/profile"] as const;

// ── Arabic Normalization & Cleaning Helpers ──
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

function getSearchWords(text: string): string[] {
  const normalized = normalizeArabic(text);
  const stopWords = ["في", "من", "ب", "بـ", "بمنطقة", "بمحافظة", "مدينة", "حي", "علي", "الي", "التي", "الذي", "مع"];

  return normalized
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !stopWords.includes(w))
    .map(cleanArabicWord);
}

function getSearchCleanedText(text: string): string {
  if (!text) return "";
  return normalizeArabic(text)
    .split(/\s+/)
    .map((w) => w.trim())
    .map(cleanArabicWord)
    .filter(Boolean)
    .join(" ");
}

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
    subtitle: "خطوط مترو القاهرة الكبري",
    href: "/metro",
    icon: "metro.svg",
    badge: "مواصلات المترو",
    keywords: ["مترو", "المترو", "انفاق", "الانفاق", "محطات المترو", "خط المترو", "تذكرة المترو", "مترو القاهرة", "metro"],
  },
  {
    id: "monorail",
    label: "قطار المونوريل",
    subtitle: "محطات وأسعار تذاكر المونوريل",
    href: "/monorail",
    icon: "Cairo_monorail_east.png",
    badge: "قطار معلق",
    keywords: ["منورايل", "المنورايل", "قطار العاصمة", "العاصمة الادارية", "اكتوبر", "monorail"],
  },
  {
    id: "lrt",
    label: "القطار الكهربائي الخفيف",
    subtitle: "محطات ومواعيد القطار الكهربائي",
    href: "/lrt",
    icon: "Cairo_lrt.png",
    badge: "القطار الكهربائي",
    keywords: ["lrt", "القطار الكهربائي", "كهربائي", "القطار الخفيف", "قطار العاشر"],
  },
  {
    id: "railways",
    label: "قطارات السكك الحديدية",
    subtitle: "قطارات القاهرة والصعيد",
    href: "/railways",
    icon: "Cairo_train.png",
    badge: "قطارات مصر",
    keywords: ["قطار", "قطارات", "سكك حديد", "سكك حديد مصر", "محطة رمسيس", "رمسيس", "قطار الصعيد", "قطار اسكندرية"],
  },
  {
    id: "directory",
    label: "دليل الهاتف والأكواد",
    subtitle: "أرقام الخدمات، وأكواد الشبكات",
    href: "/directory",
    icon: "Cairo_directory.png",
    badge: "دليل الهواتف",
    keywords: ["تليفون", "تليفونات", "هاتف", "اكواد", "أكواد", "طوارئ", "فودافون", "اورنج", "اتصالات", "وي", "ارقام", "خدمة العملاء"],
  },
  {
    id: "directions",
    label: "ازاي اروح؟",
    subtitle: "دليل الوصول لأي مكان في مصر",
    href: "/directions",
    icon: "Cairo_directions.svg",
    badge: "اتجاهات ومسارات",
    keywords: ["ازاي اروح", "ازاي اوصل", "اروح ازاي", "مواصلات", "طريق", "مسار", "اتجاهات"],
  },
  {
    id: "ai-planner",
    label: "مخطط الرحلات الذكي",
    subtitle: "تخطيط يومك بالذكاء الاصطناعي",
    href: "/ai-planner",
    icon: "ai.webp",
    badge: "ذكاء اصطناعي",
    keywords: ["خروجة", "تخطيط", "مخطط", "رحلات", "برنامج", "ذكاء", "ذكاء اصطناعي", "ai", "افكار خروج"],
  },
  {
    id: "bus-stations",
    label: "مواقف الأتوبيسات",
    subtitle: "محطات الأتوبيسات بالقاهرة والجيزة",
    href: "/bus-stations",
    icon: "bus.png",
    badge: "مواقف أتوبيس",
    keywords: ["اتوبيس", "أتوبيس", "موقف اتوبيس", "نقل عام", "مواقف الأتوبيس"],
  },
  {
    id: "microbus-stations",
    label: "مواقف السرفيس",
    subtitle: "خطوط السرفيس بين المحافظات",
    href: "/microbus-stations",
    icon: "microbus.png",
    badge: "مواقف ميكروباص",
    keywords: ["ميكروباص", "موقف ميكروباص", "سرفيس", "موقف سرفيس", "مواقف"],
  },
  {
    id: "airports",
    label: "المطارات والموانئ المصرية",
    subtitle: "معلومات مطار القاهرة والموانئ",
    href: "/airports",
    icon: "airport.png",
    badge: "مطارات وموانئ",
    keywords: ["مطار", "مطارات", "مطار القاهرة", "سفنكس", "موانئ", "ميناء"],
  },
  {
    id: "blog",
    label: "مدونة ومقالات خريطة القاهرة",
    subtitle: "أدلة الترانزيت، النصائح، والأماكن",
    href: "/blog",
    icon: "Cairo_directory.png",
    badge: "مقالات وأدلة",
    keywords: ["مدونة", "مقالات", "مقال", "اخبار", "أخبار", "دليل", "blog", "نصائح", "مقاله"],
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShrunk, setIsShrunk] = useState(false);
  const lastScrollY = useRef(0);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Dynamic places for search
  const [activePlaces, setActivePlaces] = useState<Place[]>(initialPlaces);

  // Refs
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([null, null, null, null, null]);

  // Bubble position
  const [bubbleLeft, setBubbleLeft] = useState<number | null>(null);

  // Check modal active state
  const [isModalActive, setIsModalActive] = useState(false);

  // Theme Sync
  useEffect(() => {
    const saved = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
    const initial = saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");

    const handleGlobalThemeChange = (e: any) => {
      setTheme(e.detail);
    };
    window.addEventListener("themechange", handleGlobalThemeChange);
    return () => window.removeEventListener("themechange", handleGlobalThemeChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  // Fetch places from Supabase if available
  useEffect(() => {
    async function loadPlaces() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from("places").select("*").order("rating", { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: Place[] = data.map((p: any) => {
            const rawCategory = p.category;
            const initialSubCats = Array.isArray(p.sub_categories) ? [...p.sub_categories] : [];
            const { category: finalCategory, subCategories: finalSubCategories } = normalizePlaceCategory(rawCategory, initialSubCats);

            return {
              id: p.id,
              name: p.name,
              name_en: p.name_en || "",
              category: finalCategory,
              categoryLabel: p.category_label || finalCategory,
              subCategories: finalSubCategories,
              place_type: p.place_type || "",
              governorate: p.governorate || "",
              city: p.city || "",
              briefLocation: p.brief_location || p.address || "",
              fullAddress: p.full_address || p.address || "",
              phones: Array.isArray(p.phones) ? p.phones : (p.phone ? [p.phone] : []),
              googleMapsUrl: p.google_maps_url || "",
              images: Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []),
              workingHours: p.working_hours || "",
              rating: p.rating || 4.5,
              description: p.description || "",
              branches: []
            };
          });

          // Merge with initialPlaces
          const combined: Place[] = [...mapped];
          initialPlaces.forEach((initP) => {
            if (!combined.some((cp) => cp.id === initP.id)) {
              combined.push(initP);
            }
          });
          setActivePlaces(combined);
        }
      } catch (err) {
        console.warn("Could not load dynamic places for mobile search:", err);
      }
    }

    loadPlaces();
  }, []);

  useEffect(() => {
    const checkModals = () => {
      const modalExists = document.querySelector(".ios-sheet-overlay, .modal-backdrop, [class*=\"modalBackdrop\"], .navbar-mobile-menu") !== null;
      setIsModalActive(modalExists);
    };

    checkModals();

    const observer = new MutationObserver(() => {
      checkModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragLeft, setDragLeft] = useState(0);
  const [dragHoverIdx, setDragHoverIdx] = useState(-1);
  const isDragActive = useRef(false);
  const capturedPointer = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route change → reset search
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsSearchOpen(false);
  }

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname?.startsWith(path + "/");

  const isHomeActive = isActive("/");
  const isBlogActive = isActive("/blog");
  const isProfileActive = isActive("/profile");

  const getActiveIndex = () => {
    if (isSearchOpen) return 2;
    if (isHomeActive) return 0;
    if (isBlogActive) return 1;
    if (isProfileActive) return 4;
    return -1;
  };

  const activeIndex = getActiveIndex();
  const displayActiveIndex = isDragging ? dragHoverIdx : activeIndex;

  // ── Measure static bubble position ──────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (activeIndex === -1) { setBubbleLeft(null); return; }
      const item = itemRefs.current[activeIndex] as HTMLElement | null;
      if (!item) return;
      setBubbleLeft(Math.round(item.offsetLeft + item.offsetWidth / 2 - BUBBLE_W / 2));
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [activeIndex]);

  // ── Drag helpers ─────────────────────────────────────────────────────────────
  const getItemCenter = (idx: number) => {
    const el = itemRefs.current[idx] as HTMLElement | null;
    return el ? el.offsetLeft + el.offsetWidth / 2 : 0;
  };

  const getNearestIdx = (relX: number) => {
    let nearest = 0, minDist = Infinity;
    for (let i = 0; i < 5; i++) {
      const d = Math.abs(relX - getItemCenter(i));
      if (d < minDist) { minDist = d; nearest = i; }
    }
    return nearest;
  };

  const getMagneticLeft = (rawLeft: number, nearestIdx: number): number => {
    const nearestLeft = getItemCenter(nearestIdx) - BUBBLE_W_DRAG / 2;
    const dist = Math.abs(rawLeft - nearestLeft);
    const threshold = 40;
    if (dist < threshold) {
      const pull = ((1 - dist / threshold) ** 2) * 0.6;
      return rawLeft + (nearestLeft - rawLeft) * pull;
    }
    return rawLeft;
  };

  // ── Pointer event handlers ────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startClientX = e.clientX;
    const pid = e.pointerId;
    isDragActive.current = false;

    longPressTimer.current = setTimeout(() => {
      isDragActive.current = true;
      setIsDragging(true);
      if (navigator.vibrate) navigator.vibrate(14);

      if (pillRef.current) {
        try { pillRef.current.setPointerCapture(pid); } catch { /* ignore */ }
        capturedPointer.current = pid;

        const relX = startClientX - pillRef.current.getBoundingClientRect().left;
        const nearestIdx = getNearestIdx(relX);
        const raw = Math.max(0, Math.min(pillRef.current.offsetWidth - BUBBLE_W_DRAG, relX - BUBBLE_W_DRAG / 2));
        setDragLeft(getMagneticLeft(raw, nearestIdx));
        setDragHoverIdx(nearestIdx);
      }
    }, 190);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragActive.current || !pillRef.current) return;
    const pillRect = pillRef.current.getBoundingClientRect();
    const relX = e.clientX - pillRect.left;
    const nearestIdx = getNearestIdx(relX);
    const raw = Math.max(0, Math.min(pillRef.current.offsetWidth - BUBBLE_W_DRAG, relX - BUBBLE_W_DRAG / 2));
    setDragLeft(getMagneticLeft(raw, nearestIdx));
    setDragHoverIdx(nearestIdx);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (!isDragActive.current) return;
    isDragActive.current = false;

    if (pillRef.current && capturedPointer.current !== null) {
      try { pillRef.current.releasePointerCapture(capturedPointer.current); } catch { /* ignore */ }
      capturedPointer.current = null;
    }

    const finalIdx = dragHoverIdx;
    setIsDragging(false);
    setDragHoverIdx(-1);

    if (finalIdx === 2) {
      setIsSearchOpen(true);
    } else if (finalIdx === 3) {
      toggleTheme();
    } else {
      const route = NAV_ROUTES[finalIdx];
      if (route && route !== pathname) router.push(route);
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    isDragActive.current = false;
    setIsDragging(false);
    setDragHoverIdx(-1);
  };

  // ── Scroll hide ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) setIsShrunk(false);
      else if (y > lastScrollY.current + 8) setIsShrunk(true);
      else if (y < lastScrollY.current - 8) setIsShrunk(false);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname?.startsWith("/admin");
  if (isAuthPage || isAdminPage) return null;

  // ── Bubble position & size ────────────────────────────────────────────────────
  const showBubble = isDragging || (bubbleLeft !== null && activeIndex !== -1);
  const computedLeft = isDragging ? dragLeft : (bubbleLeft ?? 0);
  const computedWidth = isDragging ? BUBBLE_W_DRAG : BUBBLE_W;

  const trendingSearches = [
    "مدونة المقالات", "مترو الأنفاق", "طوارئ",
    "مطاعم مصر الجديدة", "مطاعم التجمع الخامس", "كافيهات على النيل",
    "صيدلية العزبي", "مستشفى دار الفؤاد", "ازاي اروح", "المونوريل"
  ];

  // ── Universal Live Search Matching for Mobile Search Modal ──
  const queryWords = getSearchWords(searchQuery);

  const matchedServices = searchQuery.trim() && queryWords.length > 0
    ? SITE_SERVICES.filter((service) => {
      const serviceText = getSearchCleanedText([service.label, service.subtitle, ...service.keywords].join(" "));
      return queryWords.every((word) => serviceText.includes(word));
    })
    : [];

  const matchedPlaces: Place[] = searchQuery.trim() && queryWords.length > 0
    ? activePlaces.filter((place) => {
      const categoryLabels: Record<string, string> = {};
      CATEGORIES_STRUCTURE.forEach((main) => {
        categoryLabels[main.name] = main.label;
        main.subCategories.forEach((sub) => {
          categoryLabels[sub.name] = sub.label;
        });
      });

      const rawSearchableText = [
        place.name,
        place.name_en || "",
        place.categoryLabel,
        categoryLabels[place.category] || place.category,
        ...(place.subCategories || []).map((sc) => categoryLabels[sc] || sc),
        place.place_type || "",
        place.city || "",
        place.governorate || "",
        place.briefLocation || "",
        place.fullAddress || "",
        place.description || "",
      ].filter(Boolean).join(" ");

      const searchableText = getSearchCleanedText(rawSearchableText);
      return queryWords.every((word) => searchableText.includes(word));
    }).slice(0, 5)
    : [];

  const matchedCategories = searchQuery.trim() && queryWords.length > 0
    ? CATEGORIES_STRUCTURE.filter((cat) => {
      const categorySearchable = getSearchCleanedText([cat.label, ...cat.subCategories.map((sub) => sub.label)].join(" "));
      return queryWords.every((word) => categorySearchable.includes(word));
    }).slice(0, 3)
    : [];

  const hasResults = matchedServices.length > 0 || matchedPlaces.length > 0 || matchedCategories.length > 0;

  const handleSearchSubmit = (e: React.FormEvent, forceFullSearch: boolean = false) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!forceFullSearch) {
      if (matchedServices && matchedServices.length > 0) {
        setIsSearchOpen(false);
        router.push(matchedServices[0].href);
        return;
      }
      if (matchedPlaces && matchedPlaces.length === 1) {
        setIsSearchOpen(false);
        router.push(`/places/${matchedPlaces[0].id}`);
        return;
      }
      if (matchedCategories && matchedCategories.length > 0) {
        setIsSearchOpen(false);
        router.push(`/places?category=${encodeURIComponent(matchedCategories[0].name)}`);
        return;
      }
    }

    // Keep modal open instead of redirecting to /places
    setIsSearchOpen(true);
  };

  const handleTrendingClick = (term: string) => {
    setIsSearchOpen(false);
    setSearchQuery(term);

    const termWords = getSearchWords(term);
    if (termWords.length > 0) {
      // 1. Check if term matches a site service (Metro, Monorail, Blog, Directory, etc.)
      const matchedService = SITE_SERVICES.find((service) => {
        const serviceText = getSearchCleanedText([service.label, service.subtitle, ...service.keywords].join(" "));
        return termWords.every((w) => serviceText.includes(w));
      });

      if (matchedService) {
        router.push(matchedService.href);
        return;
      }

      // 2. Check if term matches a category
      const matchedCat = CATEGORIES_STRUCTURE.find((cat) => {
        const catText = getSearchCleanedText([cat.label, ...cat.subCategories.map((sc) => sc.label)].join(" "));
        return termWords.every((w) => catText.includes(w));
      });

      if (matchedCat) {
        router.push(`/places?category=${encodeURIComponent(matchedCat.name)}`);
        return;
      }
    }

    router.push(`/places?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <div className={`mobile-bottom-nav ${isShrunk && !isDragging ? "shrunk" : ""} ${isModalActive ? "hidden-by-modal" : ""}`}>
        <div
          className="mobile-nav-pill"
          ref={pillRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{ touchAction: isDragging ? "none" : undefined, userSelect: "none" }}
        >
          {/* Sliding glassmorphic active bubble */}
          {showBubble && (
            <div
              className={`mobile-nav-active-bubble${isDragging ? " dragging" : ""}`}
              style={{ left: computedLeft, width: computedWidth }}
            />
          )}

          {/* 1. الصفحة الرئيسية */}
          <Link href="/" className={`mobile-nav-item ${displayActiveIndex === 0 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[0] = el; }}>
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 0 ? <GoHomeFill size={26} /> : <GoHome size={26} />}
            </div>
          </Link>

          {/* 2. المدونة */}
          <Link href="/blog" className={`mobile-nav-item ${displayActiveIndex === 1 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[1] = el; }}>
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 1 ? <RiNewspaperFill size={24} /> : <RiNewspaperLine size={24} />}
            </div>
          </Link>

          {/* 3. مربع البحث */}
          <button
            className={`mobile-nav-item ${displayActiveIndex === 2 ? "active" : ""}`}
            onClick={() => { if (!isDragActive.current) setIsSearchOpen(true); }}
            style={{ background: "none", border: "none", padding: 0, outline: "none", cursor: "pointer" }}
            ref={(el) => { itemRefs.current[2] = el; }}
          >
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 2 ? <IoSearch size={25} /> : <IoSearchOutline size={25} />}
            </div>
          </button>

          {/* 4. تبديل الوضع الفاتح والداكن */}
          <button
            className={`mobile-nav-item ${displayActiveIndex === 3 ? "active" : ""}`}
            onClick={() => { if (!isDragActive.current) toggleTheme(); }}
            style={{ background: "none", border: "none", padding: 0, outline: "none", cursor: "pointer" }}
            ref={(el) => { itemRefs.current[3] = el; }}
            title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            <div className="mobile-nav-item-wrapper">
              {theme === "dark" ? <IoSunnyOutline size={25} /> : <IoMoonOutline size={25} />}
            </div>
          </button>

          {/* 5. البروفايل */}
          <Link href="/profile" className={`mobile-nav-item ${displayActiveIndex === 4 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[4] = el; }}>
            <div className="mobile-nav-item-wrapper" style={{ position: "relative" }}>
              {user && (profile?.avatar_url || user.user_metadata?.avatar_url) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile?.avatar_url || user.user_metadata.avatar_url} alt="Profile"
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "25px", height: "25px", borderRadius: "50%", objectFit: "cover",
                    border: displayActiveIndex === 4 ? "2px solid var(--textPrimary)" : "1px solid transparent",
                    transition: "border-color 0.2s",
                  }}
                />
              ) : (
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              )}
              {unreadCount > 0 && <span className="mobile-nav-badge" />}
            </div>
          </Link>
        </div>
      </div>

      {/* Full-Screen Search Modal - Enhanced Universal Search matching Home Page */}
      {isSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-modal">
            <div className="mobile-search-handle" onClick={() => setIsSearchOpen(false)} />
            <div className="mobile-search-header">
              <form onSubmit={(e) => handleSearchSubmit(e, false)} style={{ flexGrow: 1, position: "relative" }}>
                <input
                  autoFocus
                  type="text"
                  className="input-fields"
                  placeholder="ابحث عن مكان، فئة، أو خدمة بالموقع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingRight: "40px", fontFamily: "var(--font-body)" }}
                />
                <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </form>
              <button
                className="btn"
                onClick={() => setIsSearchOpen(false)}
                style={{ width: "50px", padding: "15px 14px", fontSize: "0.9rem", border: "1px solid var(--borderGlass)" }}
              >
                <MdOutlineClose />
              </button>
            </div>

            {/* LIVE UNIVERSAL SEARCH RESULTS OR TRENDING TAGS */}
            <div className="mobile-search-trending" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {searchQuery.trim().length > 0 ? (
                <div>
                  {/* 1. MATCHED SITE SERVICES (هل تقصد صفحة؟) */}
                  {matchedServices.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: "var(--colorSecondary)",
                        padding: "6px 4px",
                        marginBottom: "6px",
                        fontFamily: "var(--font-body)"
                      }}>
                        <FaLightbulb />
                        <span>صفحات وخدمات الموقع ذات الصلة</span>
                      </div>

                      {matchedServices.map((service) => (
                        <Link
                          key={service.id}
                          href={service.href}
                          onClick={() => setIsSearchOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            backgroundColor: "var(--bgGlass-card)",
                            border: "1px solid var(--borderGlass)",
                            marginBottom: "8px",
                            textDecoration: "none",
                            color: "var(--textPrimary)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={`/images/icons2d/${service.icon}`}
                              alt={service.label}
                              loading="lazy"
                              decoding="async"
                              style={{ width: "28px", height: "28px", objectFit: "contain" }}
                            />
                            <div>
                              <div style={{ fontWeight: "700", fontSize: "0.9rem", fontFamily: "var(--font-body)" }}>{service.label}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", fontFamily: "var(--font-body)" }}>{service.subtitle}</div>
                            </div>
                          </div>

                          <span style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            backgroundColor: "rgba(59, 130, 246, 0.15)",
                            color: "var(--colorSecondary)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span>انتقال</span>
                            <IoChevronBack style={{ fontSize: "0.75rem" }} />
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
                        color: "var(--textPrimary)",
                        padding: "6px 4px",
                        marginBottom: "6px",
                        fontFamily: "var(--font-body)"
                      }}>
                        <FaMapMarkerAlt style={{ color: "var(--colorSecondary)" }} />
                        <span>الأماكن والمحلات ذات الصلة ({matchedPlaces.length})</span>
                      </div>

                      {matchedPlaces.map((place) => (
                        <Link
                          key={place.id}
                          href={`/places/${place.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            backgroundColor: "var(--bgGlass-card)",
                            border: "1px solid var(--borderGlass)",
                            marginBottom: "8px",
                            textDecoration: "none",
                            color: "var(--textPrimary)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src="/images/icons2d/shop.png"
                              alt={place.name}
                              loading="lazy"
                              decoding="async"
                              style={{ width: "26px", height: "26px", objectFit: "contain" }}
                            />
                            <div>
                              <div style={{ fontWeight: "700", fontSize: "0.9rem", fontFamily: "var(--font-body)" }}>
                                {place.name}
                                {place.name_en && (
                                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginRight: "6px", fontWeight: "normal" }}>
                                    ({place.name_en})
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.76rem", color: "var(--textSecondary)", fontFamily: "var(--font-body)" }}>
                                {place.categoryLabel} {place.briefLocation ? `• ${place.briefLocation}` : ""}
                              </div>
                            </div>
                          </div>
                          <IoChevronBack style={{ fontSize: "0.75rem", color: "var(--textSecondary)" }} />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* 3. MATCHED CATEGORIES */}
                  {matchedCategories.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: "#eab308",
                        padding: "6px 4px",
                        marginBottom: "6px",
                        fontFamily: "var(--font-body)"
                      }}>
                        <span>🗂️</span>
                        <span>الفئات والأنشطة</span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {matchedCategories.map((cat) => (
                          <Link
                            key={cat.name}
                            href={`/places?category=${cat.name}`}
                            onClick={() => setIsSearchOpen(false)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              backgroundColor: "var(--bgGlass-card)",
                              border: "1px solid var(--borderGlass)",
                              textDecoration: "none",
                              color: "var(--textPrimary)",
                              fontSize: "0.84rem",
                              fontFamily: "var(--font-body)"
                            }}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NO MATCH FALLBACK - STAY IN MODAL WITH RICH OPTIONS */}
                  {!hasResults && (
                    <div style={{
                      padding: "24px 16px",
                      textAlign: "center",
                      backgroundColor: "var(--bgGlass-card)",
                      border: "1px solid var(--borderGlass)",
                      borderRadius: "16px",
                      marginTop: "12px"
                    }}>
                      <div style={{ fontSize: "2.4rem", marginBottom: "8px" }}>🔍</div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px", fontFamily: "var(--font-display)" }}>
                        عفواً، لا توجد نتائج مطابقة لـ &quot;{searchQuery}&quot;
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", maxWidth: "320px", margin: "0 auto 16px auto", lineHeight: "1.6", fontFamily: "var(--font-body)" }}>
                        لم نجد أي مكان أو خدمة بهذا الاسم في الدليل حالياً. يمكنك مسح البحث أو تجربة الاقتراحات التفاعلية التالية:
                      </p>

                      {/* In-Modal Action Options */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px", margin: "0 auto 20px auto" }}>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          style={{
                            padding: "10px 16px",
                            borderRadius: "10px",
                            backgroundColor: "var(--bgSecondary)",
                            border: "1px solid var(--borderGlass)",
                            color: "var(--textPrimary)",
                            fontWeight: "700",
                            fontSize: "0.86rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          <span>🔄 مسح وتجربة كلمة أخرى</span>
                        </button>

                        <Link
                          href="/ai-planner"
                          onClick={() => setIsSearchOpen(false)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: "10px",
                            backgroundColor: "#8b5cf6",
                            color: "#ffffff",
                            fontWeight: "700",
                            fontSize: "0.86rem",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          <span>🤖 مخطط الرحلات بالذكاء الاصطناعي</span>
                        </Link>

                        <Link
                          href="/propose-place"
                          onClick={() => setIsSearchOpen(false)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: "10px",
                            backgroundColor: "var(--bgSecondary)",
                            border: "1px solid var(--colorSecondary)",
                            color: "var(--colorSecondary)",
                            fontWeight: "700",
                            fontSize: "0.86rem",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          <span>➕ اقتراح أو إضافة هذا المكان</span>
                        </Link>
                      </div>

                      {/* Trending Suggestions */}
                      <div style={{ borderTop: "1px dashed var(--borderGlass)", paddingTop: "14px", textAlign: "right" }}>
                        <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "10px", fontFamily: "var(--font-display)" }}>
                          📈 عمليات بحث شائعة قد تهمك:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {trendingSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => handleTrendingClick(term)}
                              className="category-pill"
                              style={{ fontSize: "0.82rem", padding: "6px 12px", fontFamily: "var(--font-body)" }}
                            >
                              🔍 {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TRENDING SEARCHES */
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "var(--textPrimary)" }}>
                    📈 عمليات بحث شائعة
                  </h3>
                  <div className="trending-tags" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTrendingClick(term)}
                        className="category-pill"
                        style={{ fontSize: "0.86rem", padding: "6px 14px", fontFamily: "var(--font-body)" }}
                      >
                        🔍 {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
