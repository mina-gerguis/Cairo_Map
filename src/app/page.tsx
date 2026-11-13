"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/constants/assets";
import {
  FaPlusCircle,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaInbox
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { initialPlaces, CATEGORIES_STRUCTURE, Place, normalizePlaceCategory, getMainCategoryImage } from "@/data/places";
import dynamic from "next/dynamic";
import VideoAdBanner from "@/components/VideoAdBanner";
const WeatherComfortWidget = dynamic(() => import("@/components/WeatherComfortWidget"), { ssr: false });
const MetroMapGallery = dynamic(() => import("@/components/ui/MetroMapGallery"), { ssr: false });
const HomeGlassFolders = dynamic(() => import("@/components/home/HomeGlassFolders"), { ssr: false });
import { CAIRO_METRO_LINES, CAIRO_METRO_STATIONS, CAIRO_METRO_LABELS } from "@/data/cairoMetroGalleryData";
import { FamousCity, INITIAL_FAMOUS_CITIES, getStoredCities, saveStoredCities } from "@/data/cities";
import CityDetailModal from "@/components/cities/CityDetailModal";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
import CommunityOrbit, { OrbitItem, OrbitStat, OrbitTag } from "@/components/ui/CommunityOrbit";
import { AppleSpotlight, SearchResult, SpotlightPlaceholder } from "@/components/ui/AppleSpotlight";
import { IconBookmarkPlus, IconMoodSadDizzy, IconRefresh } from "@tabler/icons-react";
import Footer from "@/components/Footer/Footer";
import HomeBentoGrid from "@/components/home/HomeBentoGrid";

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

// ── 2. دالة تحويل وتوحيد بيانات المكان من Supabase لضمان التطابق مع دليل الأماكن ──
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

// ── دالة التحقق من صحة مسارات الصور لمنع أخطاء Invalid URL ──
function getValidImageSrc(icon?: string): string {
  if (!icon) return "/images/brand/qareeb_touch.webp";
  if (icon.startsWith("/") || icon.startsWith("http://") || icon.startsWith("https://")) {
    return icon;
  }
  const filename = icon.includes(".") ? icon : `${icon}.webp`;
  return `/images/icons2d/${filename}`;
}

const SITE_SERVICES: SiteServiceItem[] = [
  {
    id: "save-location",
    label: "أحفظ مكاني",
    subtitle: "حفظ موقعك الحالي بدقة 100% ورابط خرائط جوجل",
    href: "/save-location",
    icon: ASSETS.threeD.street,
    badge: "ميزة جديدة 🎯",
    keywords: ["احفظ مكاني", "احفظ مكاني الحالي", "مكان ركنتي", "ركنة عربيتي", "موقعي", "حفظ الموقع", "google maps", "خرائط جوجل", "احفظ مكان", "gps", "save location"]
  },
  {
    id: "metro",
    label: "خريطة مترو الأنفاق",
    subtitle: "خطوط مترو القاهرة الكبري.",
    href: "/metro",
    icon: ASSETS.transit.metro,
    badge: "مواصلات المترو",
    keywords: ["مترو", "المترو", "انفاق", "الانفاق", "محطات المترو", "خط المترو", "تذكرة المترو", "مترو القاهرة", "metro"]
  },
  {
    id: "monorail",
    label: "قطار المونوريل",
    subtitle: "محطات وأسعار تذاكر المونوريل",
    href: "/monorail",
    icon: ASSETS.transit.monorail,
    badge: "قطار معلق",
    keywords: ["منورايل", "المنورايل", "قطار العاصمة", "العاصمة الادارية", "اكتوبر", "monorail"]
  },
  {
    id: "lrt",
    label: "القطار الكهربائي الخفيف",
    subtitle: "محطات ومواعيد القطار الكهربائي",
    href: "/lrt",
    icon: ASSETS.transit.lrt,
    badge: "القطار الكهربائي",
    keywords: ["lrt", "القطار الكهربائي", "كهربائي", "القطار الخفيف", "قطار العاشر"]
  },
  {
    id: "brt",
    label: "الأتوبيس الترددي السريع (BRT)",
    subtitle: "محطات ومسار الأتوبيس على الطريق الدائري",
    href: "/brt",
    icon: ASSETS.transit.brt,
    badge: "أتوبيس ترددي",
    keywords: ["brt", "ترددي", "الترددي", "اتوبيس ترددي", "الأتوبيس الترددي", "الدائري", "الطريق الدائري", "حافلات سريعة"]
  },
  {
    id: "railways",
    label: "قطارات السكك الحديدية",
    subtitle: "قطارات القاهرة والصعيد",
    href: "/railways",
    icon: ASSETS.transit.train,
    badge: "قطارات مصر",
    keywords: ["قطار", "قطارات", "سكك حديد", "سكك حديد مصر", "محطة رمسيس", "رمسيس", "قطار الصعيد", "قطار اسكندرية"]
  },
  {
    id: "directory",
    label: "دليل الهاتف والأكواد",
    subtitle: "أرقام الخدمات، وأكواد الشبكات",
    href: "/directory",
    icon: ASSETS.company.vodafone,
    badge: "دليل الهواتف",
    keywords: ["تليفون", "تليفونات", "هاتف", "اكواد", "أكواد", "طوارئ", "فودافون", "اورنج", "اتصالات", "وي", "ارقام", "خدمة العملاء"]
  },
  {
    id: "directions",
    label: "ازاي اروح؟",
    subtitle: "دليل الوصول لأي مكان في مصر",
    href: "/directions",
    icon: ASSETS.locations.governorates.flagEgypt,
    badge: "اتجاهات ومسارات",
    keywords: ["ازاي اروح", "ازاي اوصل", "اروح ازاي", "مواصلات", "طريق", "مسار", "اتجاهات"]
  },
  {
    id: "ai-planner",
    label: "مخطط الرحلات الذكي",
    subtitle: "تخطيط يومك بالذكاء الاصطناعي",
    href: "/ai-planner",
    icon: ASSETS.threeD.robot,
    badge: "ذكاء اصطناعي",
    keywords: ["خروجة", "تخطيط", "مخطط", "رحلات", "برنامج", "ذكاء", "ذكاء اصطناعي", "ai", "افكار خروج"]
  },
  {
    id: "bus-stations",
    label: "مواقف الأتوبيسات",
    subtitle: "محطات الأتوبيسات بالقاهرة والجيزة",
    href: "/bus-stations",
    icon: ASSETS.transit.bus,
    badge: "مواقف أتوبيس",
    keywords: ["اتوبيس", "أتوبيس", "موقف اتوبيس", "نقل عام", "مواقف الأتوبيس"]
  },
  {
    id: "microbus-stations",
    label: "مواقف السرفيس",
    subtitle: "خطوط السرفيس بين المحافظات",
    href: "/microbus-stations",
    icon: ASSETS.transit.microbus,
    badge: "مواقف ميكروباص",
    keywords: ["ميكروباص", "موقف ميكروباص", "سرفيس", "موقف سرفيس", "مواقف"]
  },
  {
    id: "airports",
    label: "المطارات المصرية",
    subtitle: "معلومات مطار القاهرة ",
    href: "/airports",
    icon: ASSETS.transit.airport,
    badge: "مطارات وموانئ",
    keywords: ["مطار", "مطارات", "مطار القاهرة", "سفنكس", "موانئ", "ميناء"]
  },
  {
    id: "ports",
    label: "الموانئ المصرية",
    subtitle: "معلومات ميناء السخنة ",
    href: "/ports",
    icon: ASSETS.transit.ports,
    badge: "الموانئ",
    keywords: ["ميناء", "الميناء", "ميناء السخنة"]
  },
  {
    id: "blog",
    label: "مدونة ومقالات قريب",
    subtitle: "أدلة الترانزيت، النصائح، والأماكن",
    href: "/blog",
    icon: ASSETS.branding.qareebNoBgBlue,
    badge: "مقالات وأدلة",
    keywords: ["مدونة", "مقالات", "مقال", "اخبار", "أخبار", "دليل", "blog", "نصائح", "مقاله"]
  },
  {
    id: "had-yaaraf",
    label: "حد يعرف؟ (مجتمع قريب)",
    subtitle: "اسأل الشارع واستفسر عن المواصلات والأماكن وتجارب الناس",
    href: "/had-yaaraf",
    icon: ASSETS.transit.metro,
    badge: "مجتمع وتجارب 🔥",
    keywords: ["حد يعرف", "سؤال", "اسأل", "استفسار", "مجتمع", "تجارب", "اسئله", "اجابات", "شات", "community", "had yaaraf"]
  },
  {
    id: "parking",
    label: "دليل الجراجات وأماكن الركنة",
    subtitle: "أقرب جراج وموقف سيارات بجوار المترو والمرافق الحيوية",
    href: "/parking",
    icon: ASSETS.transit.parking,
    badge: "ركنات وجراجات 🚗",
    keywords: ["جراج", "جراجات", "باركينج", "ركنة", "ركنات", "مكان ركنة", "parking", "عربيات", "سيارات", "موقف سيارات"]
  },
  {
    id: "roads-info",
    label: "معلومات الطرق والسرعات والرادار",
    subtitle: "السرعات المقررة، رادارات الطرق، والطقس على المحاور الرئيسية",
    href: "/roads-info",
    icon: ASSETS.transit.car,
    badge: "طرق ورادارات 🚦",
    keywords: ["طريق", "طرق", "رادار", "رادارات", "سرعة", "سرعات", "مخالفات", "الدائري", "طريق السويس", "الأوتوستراد", "roads", "كاميرات"]
  }
];

interface HomeBlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  created_at?: string;
}

const DEFAULT_HOME_BLOGS: HomeBlogItem[] = [
  {
    id: "sample-1",
    title: "دليل المواصلات الشامل في القاهرة والجيزة: الوسيلة الأسرع والأوفر",
    slug: "cairo-transportation-guide",
    category: "المواصلات والحركة",
    excerpt: "تعرف على أحدث الخطوط والأسعار في مترو الأنفاق والقطار الكهربائي LRT والمنوريل.",
  },
  {
    id: "sample-2",
    title: "أفضل 10 أماكن للخروج والتنزه في القاهرة بعيداً عن صخب المدينة",
    slug: "top-10-places-cairo",
    category: "دليل القاهرة والجيزة",
    excerpt: "استكشف حدائق ومقاهي ومتاحف هادئة توفر لك تجربة ممتعة مع العائلة أو الأصدقاء.",
  },
  {
    id: "sample-3",
    title: "كيف تستخدم محطة القطار الكهربائي LRT بالكامل مع أسعار التذاكر",
    slug: "lrt-train-full-guide",
    category: "مترو ومنوريل",
    excerpt: "كل ما تحتاج معرفته عن محطات القطار الكهربائي LRT من عدلي منصور حتى العاصمة الإدارية.",
  },
];

const HERO_PLACEHOLDERS = [
  "ابحث عن الخدمة، المكان، أو المحطة المطلوبة...",
  "خطوط ومحطات مترو القاهرة الكبرى ومواعيدها...",
  "قطار المونوريل والقطار الكهربائي الخفيف LRT...",
  "ازاي اروح أي مكان في مصر بأسرع وسيلة مواصلات...",
  "أحفظ مكانك الحالي بدقة أو مكان ركنة سيارتك...",
  "مخطط الرحلات والخروجات بالذكاء الاصطناعي..."
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [heroPlaceholderIndex, setHeroPlaceholderIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPlaceholderIndex((prev) => (prev + 1) % HERO_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // ── حساب الإحصائيات الحقيقية والديناميكية للموقع ──
  const [activePlaces, setActivePlaces] = useState<Place[]>(initialPlaces);
  const [placesCount, setPlacesCount] = useState<number>(initialPlaces.length);
  const [phonesCount, setPhonesCount] = useState<number>(() => {
    return initialPlaces.reduce((sum, p) => sum + (p.phones?.length || 0), 0);
  });
  const [transitCount] = useState<number>(4);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [homeBlogs, setHomeBlogs] = useState<HomeBlogItem[]>(DEFAULT_HOME_BLOGS);
  const [famousCities, setFamousCities] = useState<FamousCity[]>([]);
  const [selectedCityModal, setSelectedCityModal] = useState<FamousCity | null>(null);
  const [citiesScrollProgress, setCitiesScrollProgress] = useState(0);
  const [isDraggingMicroTrack, setIsDraggingMicroTrack] = useState(false);
  const citiesScrollRef = useRef<HTMLDivElement>(null);
  const microTrackRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const citiesSectionRef = useRef<HTMLElement>(null);
  const metroSectionRef = useRef<HTMLElement>(null);
  const servicesSectionRef = useRef<HTMLElement>(null);
  const categoriesSectionRef = useRef<HTMLElement>(null);
  const blogsSectionRef = useRef<HTMLElement>(null);
  const aiPlannerSectionRef = useRef<HTMLElement>(null);
  const aiRobotRef = useRef<HTMLDivElement>(null);
  const proposePlaceSectionRef = useRef<HTMLElement>(null);

  // ── GSAP Orchestrated Animations across Home Page ──
  useGSAP(() => {
    // 1. Hero entrance sequence
    const runHeroEntrance = () => {
      if (heroSectionRef.current) {
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        const badge = heroSectionRef.current.querySelector(".hero-badge-item");
        const title = heroSectionRef.current.querySelector(".hero-title-item");
        const subtitle = heroSectionRef.current.querySelector(".hero-subtitle-item");
        const searchBox = searchContainerRef.current;
        const tags = heroSectionRef.current.querySelectorAll(".hero-tag-item");
        const weatherWidget = heroSectionRef.current.querySelector(".hero-weather-item");

        if (badge) heroTl.fromTo(badge, { autoAlpha: 0, y: -15, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, clearProps: "transform" });
        if (title) heroTl.fromTo(title, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.55, clearProps: "transform" }, "-=0.25");
        if (subtitle) heroTl.fromTo(subtitle, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, clearProps: "transform" }, "-=0.35");
        if (searchBox) heroTl.fromTo(searchBox, { autoAlpha: 0, y: 20, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, clearProps: "transform" }, "-=0.3");
        if (tags && tags.length > 0) {
          heroTl.fromTo(tags, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.4, clearProps: "transform" }, "-=0.25");
        }
        if (weatherWidget) heroTl.fromTo(weatherWidget, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.45, clearProps: "transform" }, "-=0.2");
      }
      ScrollTrigger.refresh();
    };

    const isPreloading =
      typeof window !== "undefined" &&
      (document.documentElement.classList.contains("is-preloading") ||
        (window as any).__SITE_READY__ === false);

    if (isPreloading) {
      // Hold hero elements in hidden state until preloader completes and dissolves
      if (heroSectionRef.current) {
        const badge = heroSectionRef.current.querySelector(".hero-badge-item");
        const title = heroSectionRef.current.querySelector(".hero-title-item");
        const subtitle = heroSectionRef.current.querySelector(".hero-subtitle-item");
        const searchBox = searchContainerRef.current;
        const tags = heroSectionRef.current.querySelectorAll(".hero-tag-item");
        const weatherWidget = heroSectionRef.current.querySelector(".hero-weather-item");
        const heroElements = [badge, title, subtitle, searchBox, ...(tags ? Array.from(tags) : []), weatherWidget].filter(Boolean);
        gsap.set(heroElements, { autoAlpha: 0 });
      }

      window.addEventListener("siteready", runHeroEntrance, { once: true });
    } else {
      runHeroEntrance();
    }

    // 2. Famous Cities Section
    if (citiesSectionRef.current) {
      const cityCards = citiesSectionRef.current.querySelectorAll(".home-city-card");
      if (cityCards.length > 0) {
        ScrollTrigger.batch(cityCards, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 25, scale: 0.95 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: "power2.out", clearProps: "transform,opacity,visibility" }
            );
          },
        });
      }
    }

    // 3. Main Services Section
    if (servicesSectionRef.current) {
      const serviceCards = servicesSectionRef.current.querySelectorAll(".glass-card, [class*='bentoCard']");
      if (serviceCards.length > 0) {
        ScrollTrigger.batch(serviceCards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 30 },
              { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out", clearProps: "transform,opacity,visibility" }
            );
          },
        });
      }
    }

    // 4. Categories Section
    if (categoriesSectionRef.current) {
      const catCards = categoriesSectionRef.current.querySelectorAll(".home-category-card");
      if (catCards.length > 0) {
        ScrollTrigger.batch(catCards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { autoAlpha: 0, scale: 0.9, y: 18 },
              { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.035, ease: "back.out(1.2)", clearProps: "transform,opacity,visibility" }
            );
          },
        });
      }
    }

    // 5. Blog Section
    if (blogsSectionRef.current) {
      const blogCards = blogsSectionRef.current.querySelectorAll(".home-blog-card");
      if (blogCards.length > 0) {
        ScrollTrigger.batch(blogCards, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", clearProps: "transform,opacity,visibility" }
            );
          },
        });
      }
    }

    // 6. AI Planner Banner
    if (aiPlannerSectionRef.current) {
      gsap.fromTo(
        aiPlannerSectionRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: aiPlannerSectionRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );

      // Continuous subtle floating animation for AI robot
      if (aiRobotRef.current) {
        gsap.to(aiRobotRef.current, {
          y: -8,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }

    // 7. Propose Place Section
    if (proposePlaceSectionRef.current) {
      gsap.fromTo(
        proposePlaceSectionRef.current,
        { autoAlpha: 0, y: 25 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: proposePlaceSectionRef.current,
            start: "top 90%",
            once: true,
          },
        }
      );
    }
  }, []);

  // Mouse drag to scroll states for cities section
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const handleCitiesScroll = () => {
    if (citiesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = citiesScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const progress = Math.min(1, Math.max(0, Math.abs(scrollLeft) / maxScroll));
        setCitiesScrollProgress(progress);
      }
      const absScroll = Math.abs(scrollLeft);
      setCanScrollPrev(absScroll > 5);
      setCanScrollNext(absScroll < maxScroll - 5);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!citiesScrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - citiesScrollRef.current.offsetLeft);
    setDragScrollLeft(citiesScrollRef.current.scrollLeft);
    setDragMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !citiesScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - citiesScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
    citiesScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const scrollPrev = () => {
    if (citiesScrollRef.current) {
      const container = citiesScrollRef.current;
      const isRtl = getComputedStyle(container).direction === "rtl";
      const scrollAmount = 280; // card width (260px) + gap (20px)
      container.scrollBy({
        left: isRtl ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollNext = () => {
    if (citiesScrollRef.current) {
      const container = citiesScrollRef.current;
      const isRtl = getComputedStyle(container).direction === "rtl";
      const scrollAmount = 280; // card width (260px) + gap (20px)
      container.scrollBy({
        left: isRtl ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToCity = (index: number) => {
    if (citiesScrollRef.current) {
      const container = citiesScrollRef.current;
      const cards = container.querySelectorAll(":scope > div");
      if (cards && cards[index]) {
        const card = cards[index] as HTMLElement;
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    }
  };

  const handleTrackPointerMove = (clientX: number) => {
    if (!microTrackRef.current || !citiesScrollRef.current) return;
    const rect = microTrackRef.current.getBoundingClientRect();
    const ratioFromRight = Math.min(1, Math.max(0, (rect.right - clientX) / rect.width));

    const container = citiesScrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll > 0) {
      const targetScroll = ratioFromRight * maxScroll;
      // In RTL (Arabic) Chrome/Edge/Firefox, scrollLeft goes negative when scrolling left
      container.scrollLeft = -targetScroll;
      if (Math.abs(container.scrollLeft) === 0 && targetScroll > 0) {
        container.scrollLeft = targetScroll;
      }
      setCitiesScrollProgress(ratioFromRight);
    }
  };

  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMicroTrack(true);
    handleTrackPointerMove(e.clientX);
  };

  const handleTrackTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleTrackPointerMove(e.touches[0].clientX);
    }
  };

  const handleTrackTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleTrackPointerMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingMicroTrack) {
        handleTrackPointerMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      if (isDraggingMicroTrack) {
        setIsDraggingMicroTrack(false);
      }
    };

    if (isDraggingMicroTrack) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingMicroTrack]);

  useEffect(() => {
    // Run initial check and when famousCities updates
    const timer = setTimeout(() => {
      handleCitiesScroll();
    }, 150);

    const handleResize = () => {
      handleCitiesScroll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [famousCities]);

  useEffect(() => {
    let isMounted = true;

    // Refresh local cities on cities_updated event
    const handleCitiesUpdated = () => {
      if (isMounted) {
        setFamousCities(getStoredCities());
      }
    };
    window.addEventListener("cities_updated", handleCitiesUpdated);

    async function fetchDynamicStats() {
      try {
        let currentPlaces: Place[] = [...initialPlaces];

        // 1. Fetch cities locally first
        if (isMounted) {
          setFamousCities(getStoredCities());
        }

        if (supabase) {
          // جلب المدن الشهيرة والمعالم السياحية بشكل منفصل ثم دمجهما برمجياً لتجنب مشاكل الـ Foreign Key cache في Supabase
          const { data: dbCities, error: citiesErr } = await supabase
            .from("famous_cities")
            .select("*")
            .order("order_index", { ascending: true });

          const { data: dbLandmarks } = await supabase
            .from("city_landmarks")
            .select("*");

          if (!citiesErr && dbCities && dbCities.length > 0) {
            // تجميع المعالم السياحية حسب معرّف المدينة
            const landmarksByCity: Record<string, any[]> = {};
            if (dbLandmarks) {
              dbLandmarks.forEach((lm: any) => {
                const cid = lm.city_id;
                if (!landmarksByCity[cid]) {
                  landmarksByCity[cid] = [];
                }
                landmarksByCity[cid].push(lm);
              });
            }

            const mappedCities: FamousCity[] = dbCities.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              cover_image: c.cover_image,
              population: c.population || "",
              area: c.area || "",
              density: c.density || "",
              temperature: c.temperature || "",
              overview: c.overview || "",
              order_index: c.order_index || 0,
              landmarks: Array.isArray(landmarksByCity[c.id])
                ? landmarksByCity[c.id].map((l: any) => ({
                  id: l.id,
                  city_id: l.city_id,
                  name: l.name,
                  cover_image: l.cover_image,
                  description: l.description || "",
                  type: l.type || "معلم سياحي",
                  is_popular: !!l.is_popular,
                  nearby_stations: Array.isArray(l.nearby_stations) ? l.nearby_stations : [],
                  images: Array.isArray(l.images) ? l.images : [l.cover_image],
                  activities: Array.isArray(l.activities) ? l.activities : [],
                }))
                : [],
            }));
            if (isMounted) {
              setFamousCities(mappedCities);
              saveStoredCities(mappedCities);
            }
          }

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

          // جلب أحدث 3 مقالات منشورة من Supabase (أي مقال جديد يضاف يظهر فوراً في الرئيسية)
          const { data: dbBlogs, error: blogsErr } = await supabase
            .from("blogs")
            .select("id, title, slug, excerpt, category, created_at")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(3);

          if (!blogsErr && dbBlogs && dbBlogs.length > 0) {
            const existingSlugs = new Set(dbBlogs.map((b: any) => b.slug || b.id));
            const remainingFallbacks = DEFAULT_HOME_BLOGS.filter(
              (b) => !existingSlugs.has(b.slug) && !existingSlugs.has(b.id)
            );
            const mergedBlogs = [...dbBlogs, ...remainingFallbacks].slice(0, 3);
            if (isMounted) {
              setHomeBlogs(mergedBlogs);
            }
          }

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
    return () => {
      isMounted = false;
      window.removeEventListener("cities_updated", handleCitiesUpdated);
    };
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

  // Detect if user is on macOS
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener to focus the homepage search input in place
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Do not override shortcut if focused on another text input/textarea
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable) &&
        target !== searchInputRef.current
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
  const matchedPlaces: Place[] = searchQuery.trim() && queryWords.length > 0
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

  // ── 8. نتائج بحث Apple Spotlight المنسقة ──
  const spotlightResults = useMemo<SearchResult[] | undefined>(() => {
    if (!searchQuery.trim() || queryWords.length === 0) return undefined;

    const list: SearchResult[] = [];

    // 1. خدمات وصفحات الموقع
    matchedServices.forEach((service) => {
      list.push({
        label: service.label,
        description: service.subtitle,
        link: service.href,
        image: getValidImageSrc(service.icon),
        badge: service.badge || "خدمة بالموقع",
      });
    });

    // 2. الأماكن المسجلة
    matchedPlaces.forEach((place) => {
      list.push({
        label: place.name + (place.name_en ? ` (${place.name_en})` : ""),
        description: `${place.categoryLabel || ""} ${place.briefLocation ? `• ${place.briefLocation}` : ""}`.trim(),
        link: `/places/${place.id}`,
        image: getMainCategoryImage(place.category, place.subCategories),
        badge: place.categoryLabel || "مكان مسجل",
      });
    });

    // 3. الفئات والأنشطة
    matchedCategories.forEach((cat) => {
      list.push({
        label: cat.label,
        description: `تصفح كل أماكن ومحلات ${cat.label}`,
        link: `/places?category=${encodeURIComponent(cat.name)}`,
        image: `/images/threeD/${cat.image}`,
        badge: "تصنيف",
      });
    });

    return list;
  }, [searchQuery, queryWords, matchedServices, matchedPlaces, matchedCategories]);

  const handleOpenMapSearch = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchSubmit = (e: React.FormEvent, forceMapSearch: boolean = false) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (forceMapSearch) {
      handleOpenMapSearch(e);
      return;
    }

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
    if (matchedCategories && matchedCategories.length > 0) {
      setIsDropdownOpen(false);
      router.push(`/places?category=${encodeURIComponent(matchedCategories[0].name)}`);
      return;
    }

    setIsDropdownOpen(false);
    router.push(`/places?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const quickSearchTags = [
    { label: "حد يعرف؟", route: "/had-yaaraf", icon: ASSETS.threeD.lamp },
    { label: "دليل الجراجات", route: "/parking", icon: ASSETS.transit.parking },
    { label: "موناريل", route: "/monorail", icon: ASSETS.transit.monorail },
    { label: "الأتوبيس الترددي", route: "/brt", icon: ASSETS.transit.brt },
    { label: "القطار الكهربي", route: "/lrt", icon: ASSETS.transit.lrt },
    { label: "موقف الميكروباصات", route: "/microbus-stations", icon: ASSETS.transit.microbus },
    { label: "موقف الأتوبيسات", route: "/bus-stations", icon: ASSETS.transit.bus },
    { label: "مدونة المقالات", route: "/blog", icon: ASSETS.branding.qareebNoBgBlue },
    { label: "خريطة المترو", route: "/metro", icon: ASSETS.transit.metro },
    { label: "دليل الهواتف", route: "/directory", icon: ASSETS.company.vodafone },
    { label: "ازاي اروح؟", route: "/directions", icon: ASSETS.locations.governorates.flagEgypt },
  ];

  const orbitItems: OrbitItem[] = [
    // ── Outer Ring (Radius: 492) ──
    {
      kind: "card",
      ring: "outer",
      angle: 158,
      emoji: "🚀",
      badge: "12",
    },
    {
      kind: "avatar",
      ring: "outer",
      angle: 135,
      src: "/images/transit/metro.webp",
      alt: "مترو القاهرة",
      color: "#ffffff",
      size: 66,
    },
    {
      kind: "pill",
      ring: "outer",
      angle: 112,
      icon: "🐻",
      label: "8 مسارات جديدة",
    },
    {
      kind: "avatar",
      ring: "outer",
      angle: 90,
      src: "/images/locations/governorates/egypt.webp",
      alt: "شعار جمهورية مصر العربية",
      color: "#ffffff",
      size: 72,
    },
    {
      kind: "card",
      ring: "outer",
      angle: 68,
      emoji: "⭐",
      badge: "240",
    },
    {
      kind: "avatar",
      ring: "outer",
      angle: 42,
      src: "/images/memoji/memo_1.webp",
      alt: "مسافرة قريبة",
      color: "#ede9fe",
      size: 74,
      hasHalo: true,
      haloColor: "rgba(214, 205, 252, 0.7)",
    },
    {
      kind: "avatar",
      ring: "outer",
      angle: 20,
      src: "/images/transit/monorail_west.webp",
      alt: "مونوريل غرب النيل",
      color: "#ffffff",
      size: 66,
    },

    // ── Inner Ring (Radius: 404) ──
    {
      kind: "status",
      ring: "inner",
      angle: 155,
      label: "دليلك الشامل جاهز",
    },
    {
      kind: "avatar",
      ring: "inner",
      angle: 130,
      src: "/images/memoji/memo_3.webp",
      alt: "مستكشفة القاهرة",
      color: "#fef3c7",
      size: 70,
    },
    {
      kind: "pill",
      ring: "inner",
      angle: 110,
      icon: "🔥",
      label: "18 خدمة",
    },
    {
      kind: "avatar",
      ring: "inner",
      angle: 90,
      src: "/images/memoji/memo_2.webp",
      alt: "مستخدم جديد",
      color: "#dbeafe",
      size: 58,
    },
    {
      kind: "card",
      ring: "inner",
      angle: 70,
      emoji: "📦",
    },
    {
      kind: "check",
      ring: "inner",
      angle: 45,
    },
    {
      kind: "pill",
      ring: "inner",
      angle: 22,
      icon: "💬",
      label: "36 تحديث",
    },
  ];

  const orbitStats: OrbitStat[] = [
    {
      value: placesCount > 0 ? `${placesCount.toLocaleString("en-US")}+` : "2,500+",
      label: "مكان مسجل ومُوثّق",
    },
    {
      value: phonesCount > 0 ? `${phonesCount.toLocaleString("en-US")}+` : "1,200+",
      label: "رقم هاتف وكود سريع",
    },
    {
      value: `${SITE_SERVICES.length}+`,
      label: "عدد خدمات الموقع",
    },
  ];

  const orbitTags: OrbitTag[] = quickSearchTags.map((tag) => ({
    label: tag.label,
    icon: (
      <Image
        src={getValidImageSrc(tag.icon)}
        alt={tag.label}
        width={16}
        height={16}
        style={{ width: "16px", height: "16px", objectFit: "contain" }}
      />
    ),
    onClick: () => {
      if (tag.route) {
        router.push(tag.route);
      }
    },
  }));


  const categoryCards = CATEGORIES_STRUCTURE;

  return (
    <main style={{ minHeight: "100vh",  color: "var(--color-fg)", fontFamily: "var(--font-heading)" }}>
      {/* ── 1. HERO SECTION (COMMUNITY ORBIT) ── */}
      <section  ref={heroSectionRef} style={{ position: "relative", overflow: "visible", zIndex: 10 }}>
        <CommunityOrbit
          items={orbitItems}
          stats={orbitStats}
          headline="استكشف المدينة وتنقل بسرعة وسهولة تامة"
          subheadline="منصتك المتكاملة لاستكشاف أماكن المطاعم، الكافيهات، العيادات، شبكات المترو والمنورايل، خطوط المواصلات، ودليل الهواتف والأكواد المختصرة."
          tags={orbitTags}
        >
          {/* Hero Universal Live Search Box Container — Inline Apple Spotlight */}
          <div ref={searchContainerRef} className="w-full">
            <AppleSpotlight
              inputRef={searchInputRef}
              searchValue={searchQuery}
              onSearchChange={(val) => setSearchQuery(val)}
              onSubmit={(e) => handleSearchSubmit(e, false)}
              searchResults={spotlightResults}
              isMac={isMac}
              placeholder={HERO_PLACEHOLDERS[heroPlaceholderIndex]}
              emptyState={
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
                    <FaInbox style={{ fontSize: "1.8rem", margin: "0 auto 6px auto", opacity: 0.5 }} />
                  </div>
                  <div style={{ fontWeight: "600", fontSize: "1rem", color: "var(--color-fg)", marginBottom: "4px" }} className="font-sub">
                    أنت بتبحث عن&nbsp;<strong>&quot;{searchQuery}&quot;</strong>
                  </div>
                  <div style={{ fontSize: "0.82rem", marginBottom: "14px", color: "var(--text-secondary)" }} className=" flex items-center justify-center font-sub">
                    <p>دورنا كتير بس للاسف ملقناش اللي أنت بدور عليه،
                      لكن جرب تبحث من تاني أو أضف المكان بنفسك </p><IconMoodSadDizzy stroke={2} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="btn btn-primary fs-sm py-0"
                    >
                      جرب أبحث من جديد <IconRefresh stroke={2} />
                    </button>
                    <Link
                      href="/propose-place"
                      className="btn btn-blue fs-sm py-0"
                    >
                      ده مكان ؟ تعاله نضيفة
                      <IconBookmarkPlus stroke={2} />
                    </Link>
                  </div>
                </div>
              }
              footer={
                <div
                  style={{
                    padding: "16px 18px",
                    borderTop: "1px solid rgba(120, 120, 128, 0.15)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ gap: "12px", alignItems: "center" }} className="flex media-max-sm">
                    <span><kbd className="apple-spotlight-kbd">↵</kbd> للانتقال</span>
                    <span><kbd className="apple-spotlight-kbd">↑↓</kbd> للتنقل</span>
                    <span><kbd className="apple-spotlight-kbd">ESC</kbd> للمسح</span>
                  </div>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={handleOpenMapSearch}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-primary, #006fee)",
                        fontWeight: "700",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>عرض كل النتائج في الخريطة</span>
                      <span>←</span>
                    </button>
                  )}
                </div>
              }
            />
          </div>
        </CommunityOrbit>

        {/* Cairo Weather & Comfort Tip Widget */}
        <div style={{ maxWidth: "900px", margin: "0px auto 30px auto", padding: "0 20px" }}>
          <WeatherComfortWidget />
        </div>

        {/* ── HOME VIDEO AD BANNER: SLOT 1 (TOP / HERO) ── */}
        <VideoAdBanner slotId="[ heroTop#1 ]" />
      </section>

      {/* ── 2. FAMOUS CITIES SECTION (المدن الشهيرة - سلايدر بنقط تنقل) ── */}
      <section ref={citiesSectionRef} style={{ padding: "60px 20px 40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>

          <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", color: "var(--color-fg)", textWrap: "balance" }}>
            المدن الشهيرة
          </h2>
          <p className="sub-title" style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "650px", margin: "0 auto", lineHeight: "1.6", textWrap: "pretty" }}>
            اسحب أفقياً أو انقر على النقط بالأسفل لاستكشاف المدن ومعالمها السياحية القريبة.
          </p>
        </div>

        {/* Horizontal Slider Track */}
        <div
          ref={citiesScrollRef}
          onScroll={handleCitiesScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            scrollSnapType: isMouseDown ? "none" : "x mandatory",
            padding: "8px 4px 16px 4px",
            scrollBehavior: isMouseDown ? "auto" : "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            cursor: isMouseDown ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {famousCities.map((city) => (
            <div
              key={city.id}
              className="home-city-card active:scale-[0.96] transition-transform"
              onClick={() => {
                if (!dragMoved) {
                  setSelectedCityModal(city);
                }
              }}
              style={{
                flex: "0 0 210px",
                minWidth: "260px",
                height: "150px",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.15), var(--shadow-card)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                scrollSnapAlign: "start",
                position: "relative",
                userSelect: "none",
              }}
            >
              {/* Cover image */}
              <img
                src={city.cover_image}
                alt={city.name}
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }}
              />

              {/* Gradient dark overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)",
                }}
              />

              {/* City Name centered on top of image */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "20px",
                  zIndex: 2,
                }}
              >
                <h2
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: "900",
                    color: "#ffffff",
                    margin: 0,
                    textShadow: "0 4px 15px rgba(0, 0, 0, 0.9)",
                    letterSpacing: "-0.5px",
                    textWrap: "balance",
                  }}
                >
                  {city.name}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Dot Indicators & Arrow Buttons */}
        {famousCities.length > 1 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "16px"
          }}>
            {/* Right/Prev Arrow (in RTL, Right arrow scrolls right) */}
            <button
              onClick={scrollPrev}
              type="button"
              disabled={!canScrollPrev}
              className="active:scale-[0.96] transition-transform"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-glass-card)",
                border: "1px solid var(--border-glass-bright)",
                color: "var(--color-fg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollPrev ? "pointer" : "not-allowed",
                opacity: canScrollPrev ? 1 : 0.4,
                pointerEvents: canScrollPrev ? "auto" : "none",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                outline: "none"
              }}
              onMouseEnter={(e) => { if (canScrollPrev) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (canScrollPrev) e.currentTarget.style.opacity = "1"; }}
              aria-label="السابق"
            >
              <FaChevronRight style={{ fontSize: "0.85rem" }} />
            </button>

            {/* Dots with accessible 40px hit area */}
            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
              {famousCities.map((_, idx) => {
                const activeIndex = Math.min(
                  famousCities.length - 1,
                  Math.max(0, Math.round(citiesScrollProgress * (famousCities.length - 1)))
                );
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToCity(idx)}
                    type="button"
                    style={{
                      width: "36px",
                      height: "36px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none"
                    }}
                    aria-label={`الذهاب إلى المدينة ${idx + 1}`}
                  >
                    <span
                      style={{
                        width: idx === activeIndex ? "22px" : "8px",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: idx === activeIndex ? "var(--color-primary)" : "var(--text-muted)",
                        transitionProperty: "width, background-color",
                        transitionDuration: "250ms",
                        transitionTimingFunction: "ease",
                        display: "block"
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Left/Next Arrow (in RTL, Left arrow scrolls left) */}
            <button
              onClick={scrollNext}
              type="button"
              disabled={!canScrollNext}
              className="active:scale-[0.96] transition-transform"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-glass-card)",
                border: "1px solid var(--border-glass-bright)",
                color: "var(--color-fg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollNext ? "pointer" : "default",
                opacity: canScrollNext ? 1 : 0.4,
                pointerEvents: canScrollNext ? "auto" : "none",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                outline: "none"
              }}
              onMouseEnter={(e) => { if (canScrollNext) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (canScrollNext) e.currentTarget.style.opacity = "1"; }}
              aria-label="التالي"
            >
              <FaChevronLeft style={{ fontSize: "0.85rem" }} />
            </button>
          </div>
        )}
      </section>

      {/* ── CAIRO METRO INTERACTIVE GALLERY (شبكة مترو أنفاق القاهرة الكبرى) ── */}
      <section
        ref={metroSectionRef}
        style={{
          padding: "10px 20px 40px 20px",
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <MetroMapGallery
          items={CAIRO_METRO_STATIONS}
          lines={CAIRO_METRO_LINES}
          labels={CAIRO_METRO_LABELS}
          trainSpeed={65}
          dwell={1200}
          autoplay={true}
          interval={3000}
        />
      </section>

      {/* ── INTERACTIVE GLASS FOLDERS (حقيبة خدمات قريب الذكية) ── */}
      <HomeGlassFolders />

      {/* ── 3. MAIN SERVICES BENTO GRID (21ST.DEV STYLE) ── */}
      <section ref={servicesSectionRef}>
        <HomeBentoGrid />
      </section>

      {/* ── 4. BROWSE BY CATEGORY PREVIEW ── */}
      <section ref={categoriesSectionRef} style={{
        padding: "60px 20px",
        paddingTop: "20px",
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-glass)",
        borderBottom: "1px solid var(--border-glass)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", marginBottom: "10px", textAlign: "center", textWrap: "balance" }} className="mt-2 fw-700">
                دور علي حسب التصنيف
              </h2>
              <p className="sub-title" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", textAlign: "center", textWrap: "pretty" }}>
                اختر الفئة للاطلاع على كافة الفروع، المواعيد، وتقييمات الزوار
              </p>
            </div>
          </div>

          <div className="home-category-grid">
            {categoryCards.map((cat) => (
              <Link
                key={cat.name}
                href={`/places?category=${cat.name}`}
                className="home-category-card"
              >
                <div
                  className="home-category-card-icon"
                  style={{
                  }}
                >
                  <Image src={`/images/threeD/${cat.image}`} alt={cat.label} width={40} height={40} style={{ width: "40px", height: "auto" }} />
                </div>
                <div>
                  <h5 className="home-category-card-title">
                    {cat.label}
                  </h5>
                  <span style={{ fontFamily: "var(--font-sub)", fontVariantNumeric: "tabular-nums" }} className="home-category-card-count tabular-nums">
                    {categoryCounts[cat.name] || 0} مكان
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOME VIDEO AD BANNER: SLOT 2 (MIDDLE) ── */}
      <VideoAdBanner slotId="[ homeMid#2 ]" />

      {/* ── 5. BLOG & ARTICLES PREVIEW SECTION ── */}
      <section ref={blogsSectionRef} style={{ padding: "60px 20px", paddingTop: "0", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "20px",
          padding: "36px 28px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: "700", margin: "0 0 6px 0", color: "var(--color-fg)", textAlign: "center", textWrap: "balance" }}>
                مدونة ومقالات قريب
              </h2>
              <p className="text-center" style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0, textWrap: "pretty" }}>
                استكشف نصائح الترانزيت، خطوط السفر اليومية، وأفضل أماكن الخروج المحدثة.
              </p>
            </div>

            <button
              onClick={() => router.push("/blog")}
              className="btn btn-primary active:scale-[0.96] transition-transform"

            >
              <span style={{ fontFamily: "var(--font-display)" }}>تصفح جميع المقالات والمدونة</span>
              <FaArrowLeft style={{ fontSize: "0.8rem" }} />
            </button>
          </div>

          {/* Quick featured article cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginTop: "20px"
          }}>
            {homeBlogs.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${encodeURIComponent(post.slug || post.id)}`}
                className="home-blog-card active:scale-[0.96] transition-transform"
                style={{
                  textDecoration: "none",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "var(--cardGlassRadius)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: "var(--cardGlassShadow)"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-secondary)", fontWeight: "700", display: "block", marginBottom: "6px", fontFamily: "var(--font-body)" }}>
                    {post.category || "مقالات قريب"}
                  </span>
                  <h2 style={{ fontSize: "0.98rem", fontWeight: "700", color: "var(--color-fg)", margin: "0 0 8px 0", lineHeight: "1.45", textWrap: "balance" }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", margin: "0 0 8px 0", lineHeight: "1.5", opacity: 0.9, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textWrap: "pretty" }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <span className="sub-title" style={{ fontSize: "0.82rem", color: "var(--color-secondary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginTop: "12px" }}>
                  <span>قراءة المقال</span>
                  <FaChevronLeft style={{ fontSize: "0.7rem" }} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. AI PLANNER BANNER ── */}
      <section ref={aiPlannerSectionRef} style={{ maxWidth: "100%", margin: "0 auto", backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-glass)", }}>
        <div style={{
          borderTop: "1px solid var(--border-glass)",
          padding: "48px 2px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div
            ref={aiRobotRef}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px"
            }}>
            <Image src="/images/threeD/robot.webp" alt="الذكاء الاصطناعي لقريب" width={80} height={80} style={{ width: "80px", height: "auto" }} />
          </div>

          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "8px 16px", color: "var(--color-fg)", textWrap: "balance" }}>
            محتار تخرج فين النهاردة؟ اترك التخطيط للذكاء الاصطناعي!
          </h2>
          <p className="sub-title" style={{ fontSize: "1rem", color: "var(--text-secondary)", margin: "0 8px 28px 8px", lineHeight: "1.7", textAlign: "center", textWrap: "pretty" }}>
            حدد ميزانيتك، عدد الأفراد، والمنطقة المفضلة، وسيقوم المساعد الذكي بتنسيق برنامج يومك بالكامل مع أماكن الأكل والكافيهات والمواصلات المناسبة.
          </p>

          <Link
            href="/ai-planner"
            className="btn btn-primary"
          >
            <span className="sub-title">جرب مخطط الرحلات الذكي </span>
            <FaArrowLeft style={{ fontSize: "0.9rem" }} />
          </Link>
        </div>
      </section>

      {/* ── HOME VIDEO AD BANNER: SLOT 3 (BOTTOM) ── */}
      <VideoAdBanner slotId="[ homeBottom#3 ]" />

      {/* ── 6. PROPOSE PLACE CTA ── */}
      <section ref={proposePlaceSectionRef} style={{
        padding: "60px 20px",
        backgroundColor: "var(--color-bg)",
        borderTop: "1px solid var(--border-glass)",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "12px", textWrap: "balance" }}>
            هل تملك نشاطاً تجارياً أو تريد إضافة مكان جديد؟
          </h2>
          <p className="sub-title" style={{ color: "var(--text-secondary)", marginBottom: "24px", textWrap: "pretty" }}>
            ساهم معنا في تحديث دليل قريب وأضف محلّك أو مكانك المفضّل مجاناً ليصل إلى آلاف الزوار.
          </p>
          <Link
            href="/propose-place"
            className="btn btn-blue"
          >
            <FaPlusCircle />
            <span className="sub-title">اقتراح أو إضافة مكان جديد</span>
          </Link>
        </div>
      </section>

      <Footer />

      {/* Render City Detail Modal when a city card is clicked */}
      {selectedCityModal && (
        <CityDetailModal
          city={selectedCityModal}
          onClose={() => setSelectedCityModal(null)}
        />
      )}
    </main>
  );
}
