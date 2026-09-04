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
  FaChevronLeft,
  FaChevronRight,
  FaInbox
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { initialPlaces, CATEGORIES_STRUCTURE, Place, normalizePlaceCategory, getMainCategoryImage } from "@/data/places";
import dynamic from "next/dynamic";
import AdSlider from "@/components/AdSlider";
const TextLoop = dynamic(() => import("@/components/ui/TextLoop"), { ssr: false });
const WeatherComfortWidget = dynamic(() => import("@/components/WeatherComfortWidget"), { ssr: false });
import { FamousCity, INITIAL_FAMOUS_CITIES, getStoredCities, saveStoredCities } from "@/data/cities";
import CityDetailModal from "@/components/cities/CityDetailModal";

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
    subtitle: "تخطيط يومك بالذكاء الاصطناعي",
    href: "/ai-planner",
    icon: "ai.webp",
    badge: "ذكاء اصطناعي",
    keywords: ["خروجة", "تخطيط", "مخطط", "رحلات", "برنامج", "ذكاء", "ذكاء اصطناعي", "ai", "افكار خروج"]
  },
  {
    id: "bus-stations",
    label: "مواقف الأتوبيسات",
    subtitle: "محطات الأتوبيسات بالقاهرة والجيزة",
    href: "/bus-stations",
    icon: "bus.png",
    badge: "مواقف أتوبيس",
    keywords: ["اتوبيس", "أتوبيس", "موقف اتوبيس", "نقل عام", "مواقف الأتوبيس"]
  },
  {
    id: "microbus-stations",
    label: "مواقف السرفيس",
    subtitle: "خطوط السرفيس بين المحافظات",
    href: "/microbus-stations",
    icon: "microbus.png",
    badge: "مواقف ميكروباص",
    keywords: ["ميكروباص", "موقف ميكروباص", "سرفيس", "موقف سرفيس", "مواقف"]
  },
  {
    id: "airports",
    label: "المطارات المصرية",
    subtitle: "معلومات مطار القاهرة ",
    href: "/airports",
    icon: "airport.png",
    badge: "مطارات وموانئ",
    keywords: ["مطار", "مطارات", "مطار القاهرة", "سفنكس", "موانئ", "ميناء"]
  },
  {
    id: "ports",
    label: "الموانئ المصرية",
    subtitle: "معلومات ميناء السخنة ",
    href: "/ports",
    icon: "arab_republice.png",
    badge: "الموانئ",
    keywords: ["ميناء", "الميناء", "ميناء السخنة"]
  },
  {
    id: "blog",
    label: "مدونة ومقالات خريطة القاهرة",
    subtitle: "أدلة الترانزيت، النصائح، والأماكن",
    href: "/blog",
    icon: "Cairo_directory.png",
    badge: "مقالات وأدلة",
    keywords: ["مدونة", "مقالات", "مقال", "اخبار", "أخبار", "دليل", "blog", "نصائح", "مقاله"]
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

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

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

  // Global Ctrl+K / Cmd+K listener to focus the homepage search input
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
        setIsDropdownOpen(true);
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
      if (matchedCategories && matchedCategories.length > 0) {
        setIsDropdownOpen(false);
        router.push(`/places?category=${encodeURIComponent(matchedCategories[0].name)}`);
        return;
      }
    }

    // Keep dropdown open instead of redirecting to /places
    setIsDropdownOpen(true);
  };

  const quickSearchTags = [
    { label: "موناريل", route: "/monorail", icon: "Cairo_monorail_east.png" },
    { label: "القطار الكهربي", route: "/lrt", icon: "Cairo_lrt.png" },
    { label: "موقف الميكروباصات", route: "/microbus-stations", icon: "microbus.png" },
    { label: "موقف الأتوبيسات", route: "/bus-stations", icon: "bus.png" },
    { label: "مدونة المقالات", route: "/blog", icon: "Cairo_logo.png" },
    { label: "خريطة المترو", route: "/metro", icon: "metro.svg" },
    { label: "دليل الهواتف", route: "/directory", icon: "Cairo_directory.png" },
    { label: "ازاي اروح؟", route: "/directions", icon: "Cairo_directions.svg" },
  ];

  const mainServices = [
    {
      id: "places",
      title: "دليل الأماكن",
      desc: "استكشف المطاعم، الكافيهات، الأطباء، والمحلات في القاهرة والجيزة مع مواعيد العمل الرسمية، الفروع، وأرقام الهواتف.",
      icon: "restaurant",
      link: "/places",
    },
    {
      id: "blog",
      title: "مدونة ومقالات خريطة القاهرة",
      desc: "أحدث النصائح، خطوط السفر، وأدلة التنقل الذكي وأماكن الخروج في القاهرة والجيزة المحدثة باستمرار.",
      icon: "book",
      link: "/blog",
    },
    {
      id: "ai-planner",
      title: "مخطط الرحلات الذكي (AI)",
      desc: "صمّم خطة خروجة أو يوم كامل بالذكاء الاصطناعي بناءً على ميزانيتك، اهتماماتك الشخصية، والمنطقة التي تفضلها.",
      icon: "robot",
      link: "/ai-planner",
    },
    {
      id: "directory",
      title: "دليل الهواتف والأكواد",
      desc: "دليل شامل لأرقام الطوارئ، الهيئات الخدمية، وأكواد باقات وفليكسات شبكات المحمول (فودافون، أورنج، اتصالات، وي).",
      icon: "phone",
      link: "/directory",
    },
    {
      id: "transit",
      title: "شبكات مترو القاهرة الكبري",
      desc: "خرائط تفاعلية لخطوط مترو الأنفاق الخط الأول و الثاني و الثالث.",
      icon: "metro",
      link: "/metro",
    },
    {
      id: "directions",
      title: "دليل ازاي اروح والمواقف",
      desc: "اعثر على طريقة الوصول لأي مكان في مصر بسهولة مع مواقف الأتوبيس، الميكروباص، المطارات، والموانئ.",
      icon: "egypt",
      link: "/directions",
    },
    {
      id: "microbus-stations",
      title: "مواقف الميكروباص",
      desc: "دليل مواقف الميكروباص في القاهرة الكبري و الجيزة  وجميع المحافظات المصرية",
      icon: "microbus",
      link: "/microbus-stations",
    },
    {
      id: "propose",
      title: "إضافة واقتراح مكان جديد",
      desc: "هل تملك نشاطاً تجارياً أو تريد إضافة مكان جديد على دليل ماب القاهرة؟ أضفه مجاناً ليصل لملايين الزوار.",
      icon: "store",
      link: "/propose-place",
    },
  ];


  const categoryCards = CATEGORIES_STRUCTURE;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)", fontFamily: "var(--font-heading)" }}>
      {/* ── 1. HERO SECTION ── */}
      <section style={{
        position: "relative",
        padding: "60px 20px 80px 20px",
        paddingBottom: "20px",
        overflow: "visible",
        background: "radial-gradient(circle at 50% 0%, rgba(0, 111, 238, 0.15) 0%, rgba(0,0,0,0) 70%)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "999px",
            backgroundColor: "var(--bgGlass-card)",
            border: "1px solid var(--borderGlass-bright)",
            fontSize: "0.9rem",
            color: "var(--colorPrimary)",
            marginBottom: "24px",
            fontFamily: "var(--font-display)",
            fontWeight: "500"
          }}>
            <span>✨</span>
            <span>دليلك الذكي الشامل لشوارع وأماكن القاهرة</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "700",
            lineHeight: "1.25",
            marginBottom: "20px",
            letterSpacing: "-0.5px",
          }}>
            استكشف مصر  وتنقّل بذكاء وسرعة ودقة متناهية
          </h1>

          {/* Subtitle */}
          <p
            className="sub-title"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "var(--textSecondary)",
              maxWidth: "780px",
              margin: "0 auto 36px auto",
              lineHeight: "1.7",
              fontWeight: "400",
            }}>
            منصتك المتكاملة لاستكشاف أماكن المطاعم، الكافيهات، العيادات، شبكات المترو والمنورايل، خطوط المواصلات، ودليل الهواتف والأكواد المختصرة.
          </p>

          {/* Hero Universal Live Search Box Container */}
          <div ref={searchContainerRef} style={{
            maxWidth: "720px",
            margin: "0 auto 28px auto",
            position: "relative"
          }}>
            <form onSubmit={(e) => handleSearchSubmit(e, false)}>
              <div style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--bgGlass)",
                border: isDropdownOpen && searchQuery.trim() ? "1.5px solid var(--colorPrimary)" : "1.5px solid var(--borderPrimary)",
                borderRadius: "var(--radius-xl)",
                padding: "8px 15px 8px 15px",
                boxShadow: "0 10px 30px var(--shadow-card)",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.2s ease"
              }}>
                <FaSearch style={{ fontSize: "1.2rem", color: "var(--textMuted)", marginLeft: "12px" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="ابحث عن الخدمة المطلوبة "
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
                    fontFamily: "var(--font-heading)"
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
                  <span style={{ color: "var(--textMuted)", fontSize: "0.75rem", fontWeight: "bold" }}>+</span>
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
                backgroundColor: "var(--cardGlassBg)",
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

                {/* 1. MATCHED SITE SERVICES (هل تقصد؟) */}
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
                          backgroundColor: "var(--hoverBtn)",
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
                      color: "var(--accent-secondary)",
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
                          backgroundColor: "var(--hoverBtn)",
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
                            backgroundColor: "var(--hoverBtn)",
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
                          backgroundColor: "var(--hoverBtn)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-sub)"
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
                          fontWeight: "700",
                          fontFamily: "var(--font-sub)"
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
                          backgroundColor: "var(--hoverBtn)",
                          border: "1px solid var(--colorPrimary)",
                          color: "var(--colorPrimary)",
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          fontWeight: "700",
                          fontFamily: "var(--font-sub)"
                        }}
                      >
                        ➕ اقتراح مكان
                      </Link>
                    </div>
                  </div>
                )}

                {/* 4. FULL SEARCH BUTTON AT BOTTOM */}
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
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--hoverBtn)",
                  border: "1px solid var(--borderGlass)",
                  color: "var(--textSecondary)",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)"
                }}
              >
                <img src={`/images/icons2d/${tag.icon}`} alt={tag.label} loading="lazy" decoding="async" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

          {/* Cairo Weather & Comfort Tip Widget */}
          <div style={{ maxWidth: "720px", margin: "0 auto 30px auto" }}>
            <WeatherComfortWidget />
          </div>

          {/* ── SPONSORED AD SLIDER BANNER ── */}
          <div style={{ marginTop: "50px" }}>
            <AdSlider />
          </div>
        </div>
      </section>

      {/* ── 2. FAMOUS CITIES SECTION (المدن الشهيرة - سلايدر بنقط تنقل) ── */}
      <section style={{ padding: "60px 20px 40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>

          <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", color: "var(--textPrimary)" }}>
            المدن الشهيرة
          </h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "1rem", maxWidth: "650px", margin: "0 auto", lineHeight: "1.6" }}>
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
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
            gap: "16px",
            marginTop: "16px"
          }}>
            {/* Right/Prev Arrow (in RTL, Right arrow scrolls right) */}
            <button
              onClick={scrollPrev}
              type="button"
              disabled={!canScrollPrev}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--bgGlass-card)",
                border: "1px solid var(--borderGlass-bright)",
                color: "var(--textPrimary)",
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

            {/* Dots */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                      width: idx === activeIndex ? "20px" : "8px",
                      height: "8px",
                      borderRadius: "999px",
                      backgroundColor: idx === activeIndex ? "var(--colorPrimary)" : "var(--text-muted)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      padding: 0
                    }}
                    aria-label={`الذهاب إلى المدينة ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Left/Next Arrow (in RTL, Left arrow scrolls left) */}
            <button
              onClick={scrollNext}
              type="button"
              disabled={!canScrollNext}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--bgGlass-card)",
                border: "1px solid var(--borderGlass-bright)",
                color: "var(--textPrimary)",
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

      {/* ── 3. MAIN SERVICES GRID ── */}
      <section
        style={{
          padding: "10px 20px 70px 20px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px"
          }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "500", marginBottom: "12px" }}>
            جميع خدمات ماب القاهرة بين يديك
          </h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
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
              className="glass-card"
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "28px",
                backgroundColor: "var(--bgGlass-card)",
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <img
                      src={`/images/icons3d/${service.icon}.png`}
                      alt={service.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "80px" }}
                    />
                  </div>
                </div>

                <h2 style={{ fontSize: "1.3rem", fontWeight: "600", color: "var(--textPrimary)", marginBottom: "10px" }}>
                  {service.title}
                </h2>
                <p style={{ fontSize: "0.95rem", color: "var(--textSecondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                  {service.desc}
                </p>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "var(--colorPrimary)",
              }}>
                <span style={{ fontFamily: "var(--font-display)" }}>الانتقال للخدمة</span>
                <FaArrowLeft style={{ fontSize: "0.8rem" }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. BROWSE BY CATEGORY PREVIEW ── */}
      <section style={{
        padding: "60px 20px",
        paddingTop: "20px",
        backgroundColor: "var(--bgSecondary)",
        borderTop: "1px solid var(--borderGlass)",
        borderBottom: "1px solid var(--borderGlass)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "500", marginBottom: "8px", textAlign: "center" }}>
                تصفّح حسب الفئة في دليل الأماكن و المرافق
              </h2>
              <p className="sub-title" style={{ fontSize: "0.95rem", color: "var(--textSecondary)", textAlign: "center" }}>
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
                  <img src={`/images/icons3d/${cat.image}`} alt={cat.label} loading="lazy" decoding="async" width={"40px"} />
                </div>
                <div>
                  <h5 className="home-category-card-title">
                    {cat.label}
                  </h5>
                  <span style={{ fontFamily: "var(--font-sub)" }} className="home-category-card-count">
                    {categoryCounts[cat.name] || 0} مكان
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. BLOG & ARTICLES PREVIEW SECTION ── */}
      <section style={{ padding: "60px 20px", paddingTop: "0", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "20px",
          padding: "36px 28px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: "700", margin: "0 0 6px 0", color: "var(--textPrimary)", textAlign: "center" }}>
                مدونة ومقالات خريطة القاهرة
              </h2>
              <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", margin: 0 }}>
                استكشف نصائح الترانزيت، خطوط السفر اليومية، وأفضل أماكن الخروج المحدثة.
              </p>
            </div>

            <Link
              href="/blog"
              className="btn-primary "
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--colorSecondary)",
                color: "#ffffffff",
                fontWeight: "700",
                fontSize: "0.9rem",
                fontFamily: "var(--font-body)",
                textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
            >
              <span style={{ fontFamily: "var(--font-display)" }}>تصفح جميع المقالات والمدونة</span>
              <FaArrowLeft style={{ fontSize: "0.8rem" }} />
            </Link>
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
                style={{
                  textDecoration: "none",
                  backgroundColor: "var(--bgPrimary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "var(--cardGlassRadius)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  boxShadow: "var(--cardGlassShadow)"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.78rem", color: "var(--colorSecondary)", fontWeight: "700", display: "block", marginBottom: "6px", fontFamily: "var(--font-body)" }}>
                    {post.category || "مقالات خريطة القاهرة"}
                  </span>
                  <h2 style={{ fontSize: "0.98rem", fontWeight: "700", color: "var(--textPrimary)", margin: "0 0 8px 0", lineHeight: "1.45" }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ fontSize: "0.83rem", color: "var(--textSecondary)", margin: "0 0 8px 0", lineHeight: "1.5", opacity: 0.9, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <span className="sub-title" style={{ fontSize: "0.82rem", color: "var(--colorSecondary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginTop: "12px" }}>
                  <span>قراءة المقال</span>
                  <FaChevronLeft style={{ fontSize: "0.7rem" }} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. AI PLANNER BANNER ── */}
      <section style={{ maxWidth: "100%", margin: "0 auto", backgroundColor: "var(--bgSecondary)", borderBottom: "1px solid var(--borderGlass)", }}>
        <div style={{
          borderTop: "1px solid var(--borderGlass)",
          padding: "48px 2px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <img src="/images/icons3d/robot.png" alt="Robot" loading="lazy" decoding="async" width={80} />
          </div>

          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "8px 16px", color: "var(--textPrimary)" }}>
            محتار تخرج فين النهاردة؟ اترك التخطيط للذكاء الاصطناعي!
          </h2>
          <p className="sub-title" style={{ fontSize: "1rem", color: "var(--textSecondary)", margin: "0 8px 28px 8px", lineHeight: "1.7", textAlign: "center" }}>
            حدد ميزانيتك، عدد الأفراد، والمنطقة المفضلة، وسيقوم المساعد الذكي بتنسيق برنامج يومك بالكامل مع أماكن الأكل والكافيهات والمواصلات المناسبة.
          </p>

          <Link
            href="/ai-planner"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "700",
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            <span className="sub-title">جرب مخطط الرحلات الذكي </span>
            <FaArrowLeft style={{ fontSize: "0.9rem" }} />
          </Link>
        </div>
      </section>

      {/* ── 6. PROPOSE PLACE CTA ── */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "var(--bgPrimary)",
        borderTop: "1px solid var(--borderGlass)",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "12px" }}>
            هل تملك نشاطاً تجارياً أو تريد إضافة مكان جديد؟
          </h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", marginBottom: "24px" }}>
            ساهم معنا في تحديث دليل ماب القاهرة وأضف محلّك أو مكانك المفضّل مجاناً ليصل إلى آلاف الزوار.
          </p>
          <Link
            href="/propose-place"
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "700",
              fontSize: "0.95rem",
              textDecoration: "none"
            }}
          >
            <FaPlusCircle />
            <span className="sub-title">اقتراح أو إضافة مكان جديد</span>
          </Link>
        </div>
      </section>

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
