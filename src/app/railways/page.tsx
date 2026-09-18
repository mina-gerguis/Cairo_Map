"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import TrainTypesSection from "@/components/railways/TrainTypesSection";

interface TrainClass {
  name: string;
  price: string;
  features: string;
}

interface RailwayStop {
  id?: string;
  name: string;
  status: "تعمل" | "تشغيل فعلي" | "تحت الإنشاء";
}

interface RailwayRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  duration: string;
  stops: RailwayStop[];
  classes: TrainClass[];
  tips: string;
}

const RAILWAY_ROUTES: RailwayRoute[] = [
  {
    id: "cairo-alex",
    name: "القاهرة ⇆ الإسكندرية (خط بحري)",
    from: "القاهرة (محطة رمسيس)",
    to: "الإسكندرية (محطة سيدي جابر / مصر)",
    duration: "ساعتين إلى 3 ساعات ونصف (حسب نوع القطار)",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "طنطا", status: "تشغيل فعلي" },
      { name: "دمنهور", status: "تشغيل فعلي" },
      { name: "سيدي جابر", status: "تشغيل فعلي" },
      { name: "الإسكندرية", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطار تالجو (Talgo) الفاخر", price: "درجة أولى: 225 ج.م | درجة ثانية: 150 ج.م", features: "شاشات عرض، واي فاي، عربة بوفيه فاخرة، تكييف متطور، هدوء تام وسرعة عالية." },
      { name: "قطارات VIP السريعة", price: "درجة أولى: 145 ج.م | درجة ثانية: 115 ج.م", features: "تكييف ممتاز، مقاعد مريحة قابلة للتعديل، بوفيه، خدمة جيدة." },
      { name: "قطارات إسباني مطور / فرنسي", price: "درجة أولى: 80 ج.م | درجة ثانية: 65 ج.م", features: "تكييف، مقاعد مريحة، قطارات سريعة كلاسيكية." },
      { name: "قطار روسي مكيف", price: "تذكرة موحدة: 60 ج.م", features: "تكييف، عربات جديدة، سعر اقتصادي وسرعة متوسطة." }
    ],
    tips: "قطارات تالجو هي الخيار الأفضل والأسرع على هذا الخط. يفضل الحجز قبل موعد الرحلة بـ 24 ساعة على الأقل."
  },
  {
    id: "cairo-aswan",
    name: "القاهرة ⇆ أسوان (خط قبلي الصعيد)",
    from: "القاهرة (محطة رمسيس / الجيزة)",
    to: "أسوان",
    duration: "10 إلى 13 ساعة",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "الجيزة", status: "تشغيل فعلي" },
      { name: "بني سويف", status: "تشغيل فعلي" },
      { name: "المنيا", status: "تشغيل فعلي" },
      { name: "أسيوط", status: "تشغيل فعلي" },
      { name: "سوهاج", status: "تشغيل فعلي" },
      { name: "قنا", status: "تشغيل فعلي" },
      { name: "الأقصر", status: "تشغيل فعلي" },
      { name: "إدفو", status: "تشغيل فعلي" },
      { name: "كوم أمبو", status: "تشغيل فعلي" },
      { name: "أسوان", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات النوم الفاخرة (Wagon-Lits)", price: "كابينة فردية: 1200+ ج.م | كابينة مزدوجة: 850 ج.م (للمصريين)", features: "وجبة عشاء وإفطار مجانية، سرير مريح في كابينة مغلقة، هدوء وخدمة فندقية." },
      { name: "قطار تالجو (Talgo) الصعيد", price: "درجة أولى: 700 ج.م | درجة ثانية: 550 ج.م", features: "القطار الأحدث والأكثر راحة بالصعيد، هادئ وسريع ومكيف بالكامل." },
      { name: "قطارات VIP الصعيد", price: "درجة أولى: 335 ج.م | درجة ثانية: 220 ج.م", features: "تكييف ممتاز، مقاعد مريحة للمسافات الطويلة، عربة بوفيه متكاملة." },
      { name: "قطارات إسباني مكيفة", price: "درجة أولى: 175 ج.م | درجة ثانية: 125 ج.م", features: "خيار اقتصادي ممتاز للمسافات الطويلة، تكييف ومقاعد جيدة." }
    ],
    tips: "لرحلات النوم، يفضل الحجز قبل السفر بأسبوع على الأقل نظراً للإقبال الشديد خصوصاً في مواسم الشتاء والسياحة."
  },
  {
    id: "cairo-portsaid",
    name: "القاهرة ⇆ بورسعيد (خط القناة)",
    from: "القاهرة (محطة رمسيس)",
    to: "بورسعيد",
    duration: "3 إلى 4 ساعات",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "الزقازيق", status: "تشغيل فعلي" },
      { name: "الإسماعيلية", status: "تشغيل فعلي" },
      { name: "القنطرة غرب", status: "تشغيل فعلي" },
      { name: "بورسعيد", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات مكيفة إسباني/فرنسي", price: "درجة أولى: 80 ج.م | درجة ثانية: 65 ج.م", features: "مكيفة، كراسي مريحة، تقف في المراكز والمحافظات الرئيسية." },
      { name: "قطار روسي مكيف الجديد", price: "تذكرة موحدة: 55 ج.م", features: "تكييف، عربات جديدة مريحة واقتصادية." },
      { name: "قطارات تحيا مصر (عادية)", price: "تذكرة موحدة: 25 ج.م", features: "غير مكيفة، اقتصادية جداً وتتوقف في معظم المحطات الفرعية." }
    ],
    tips: "الرحلة تمر بمدن القناة وتوفر مناظر جميلة ومحطات ممتعة على طول قناة السويس."
  },
  {
    id: "cairo-mansoura",
    name: "القاهرة ⇆ المنصورة (خط الدلتا)",
    from: "القاهرة (محطة رمسيس)",
    to: "المنصورة",
    duration: "ساعتين إلى ساعتين ونصف",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "قويسنا", status: "تشغيل فعلي" },
      { name: "بركة السبع", status: "تشغيل فعلي" },
      { name: "طنطا", status: "تشغيل فعلي" },
      { name: "المحلة الكبرى", status: "تشغيل فعلي" },
      { name: "سمنود", status: "تشغيل فعلي" },
      { name: "طلخا", status: "تشغيل فعلي" },
      { name: "المنصورة", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات VIP السريعة", price: "درجة أولى: 100 ج.م | درجة ثانية: 80 ج.م", features: "قطارات سريعة ومكيفة بالكامل ومريحة جداً." },
      { name: "قطارات مكيفة إسباني", price: "درجة أولى: 60 ج.م | درجة ثانية: 50 ج.م", features: "مكيفة ومناسبة جداً للسفر اليومي والدراسي." },
      { name: "قطار روسي مكيف", price: "تذكرة موحدة: 45 ج.م", features: "عربات مكيفة اقتصادية حديثة." }
    ],
    tips: "العديد من طلاب الجامعات يستخدمون هذا الخط يومياً، لذا ينصح بتجنب أوقات الذروة الصباحية وبعد الظهر."
  }
];

const ROUTE_COLORS: Record<string, string> = {
  "cairo-alex": "#ef4444",
  "cairo-aswan": "#f59e0b",
  "cairo-portsaid": "#3b82f6",
  "cairo-mansoura": "#10b981",
};

const COLOR_PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#6366f1",
];

function getRouteColor(routeId: string, index: number): string {
  if (ROUTE_COLORS[routeId]) {
    return ROUTE_COLORS[routeId];
  }
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

function getRouteShortName(route: RailwayRoute): string {
  if (route.id === "cairo-alex") return "خط الإسكندرية";
  if (route.id === "cairo-aswan") return "خط الصعيد";
  if (route.id === "cairo-portsaid") return "خط القناة";
  if (route.id === "cairo-mansoura") return "خط الدلتا";

  const match = route.name.match(/\((خط [^)]+)\)/);
  if (match) {
    return match[1];
  }

  if (route.name.includes("⇆")) {
    const parts = route.name.split("⇆");
    return `خط ${parts[1].trim()}`;
  }

  if (route.name.includes("-")) {
    const parts = route.name.split("-");
    return `خط ${parts[parts.length - 1].trim()}`;
  }

  return route.name;
}

function getRouteIconData(routeId: string, index: number, routeColor: string) {
  if (routeId === "cairo-alex") {
    return {
      icon: "fa-solid fa-train",
      bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      glowColor: "#ef4444"
    };
  }
  if (routeId === "cairo-aswan") {
    return {
      icon: "fa-solid fa-mountain-sun",
      bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      glowColor: "#f59e0b"
    };
  }
  if (routeId === "cairo-portsaid") {
    return {
      icon: "fa-solid fa-anchor",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      glowColor: "#3b82f6"
    };
  }
  if (routeId === "cairo-mansoura") {
    return {
      icon: "fa-solid fa-leaf",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      glowColor: "#10b981"
    };
  }

  const defaultIcons = ["fa-solid fa-train-subway", "fa-solid fa-train", "fa-solid fa-compass", "fa-solid fa-route"];
  return {
    icon: defaultIcons[index % defaultIcons.length],
    bgGradient: `linear-gradient(135deg, ${routeColor} 0%, ${routeColor}cc 100%)`,
    glowColor: routeColor
  };
}

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .trim()
    .toLowerCase();
}

export const REPORT_PROBLEM_OPTIONS = [
  {
    id: "schedule_error",
    title: "خطأ في مواعيد تحرك القطارات أو مدة الرحلة",
    desc: "أوقات القيام أو الوصول غير مطابقة للجدول الفعلي",
    icon: "fa-regular fa-clock",
    badge: "مواعيد",
    badgeColor: "#3b82f6"
  },
  {
    id: "price",
    title: "أسعار التذاكر غير صحيحة أو تم تعديلها",
    desc: "تغيير في أسعار الدرجة الأولى، الثانية أو التذاكر الموحدة",
    icon: "fa-solid fa-tags",
    badge: "أسعار",
    badgeColor: "#10b981"
  },
  {
    id: "train_class",
    title: "خطأ في فئات ودرجات القطارات المتاحة",
    desc: "نوع القطار الموضح (تالجو، VIP، إسباني، روسي) غير دقيق",
    icon: "fa-solid fa-train",
    badge: "قطارات",
    badgeColor: "#f59e0b"
  },
  {
    id: "stops_info",
    title: "خطأ في محطات الوقوف أو مسار الخط",
    desc: "محطة توقف مفقودة أو مدرجة بالخطأ في جدول الخط",
    icon: "fa-solid fa-route",
    badge: "محطات",
    badgeColor: "#8b5cf6"
  },
  {
    id: "station_info",
    title: "بيانات محطة قطار غير دقيقة",
    desc: "موقع أو اسم أو حالة تطوير المحطة غير صحيحة",
    icon: "fa-regular fa-building",
    badge: "بيانات",
    badgeColor: "#06b6d4"
  },
  {
    id: "app_bug",
    title: "مشكلة تقنية أو خلل في الصفحة",
    desc: "أزرار أو فلاتر أو جداول لا تستجيب بالشكل المطلوب",
    icon: "fa-solid fa-bug",
    badge: "تقني",
    badgeColor: "#ef4444"
  },
  {
    id: "other",
    title: "ملاحظة أو اقتراح آخر",
    desc: "أي استفسار أو اقتراح لتحسين وتدقيق دليل القطارات",
    icon: "fa-regular fa-comment-dots",
    badge: "عام",
    badgeColor: "#64748b"
  }
];

export default function RailwaysPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [selectedRouteId, setSelectedRouteId] = useState<string>("cairo-alex");
  const [routes, setRoutes] = useState<RailwayRoute[]>([]);

  // Report Problem State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<"general" | "route" | "station">("general");
  const [reportSelectedStation, setReportSelectedStation] = useState<string>("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState<string>("");
  const [showReportStationList, setShowReportStationList] = useState<boolean>(false);
  const [reportProblemType, setReportProblemType] = useState<string>("schedule_error");
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState<boolean>(false);
  const [reportDetails, setReportDetails] = useState<string>("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string>("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // GSAP animation refs for all page elements
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const trainTypesRef = useRef<HTMLDivElement>(null);
  const howToBookRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const paywallRef = useRef<HTMLDivElement>(null);
  const paywallCardRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Initial page entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const sections = [sliderRef.current, detailsPanelRef.current, trainTypesRef.current, howToBookRef.current].filter(Boolean);
      if (sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out", delay: 0.1 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Route switch animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (detailsPanelRef.current) {
      gsap.fromTo(
        detailsPanelRef.current,
        { opacity: 0.45, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [selectedRouteId]);

  // Modal entrance animation
  useEffect(() => {
    if (reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [reportModalOpen]);

  // Paywall screen entrance animation
  useEffect(() => {
    if (paywallRef.current) {
      gsap.fromTo(
        paywallRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
    if (paywallCardRef.current) {
      gsap.fromTo(
        paywallCardRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: 0.1, ease: "power2.out" }
      );
    }
  }, [user, profile]);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!supabase) {
        loadLocalRoutes();
        return;
      }

      try {
        const { data: routesData, error: routesErr } = await supabase
          .from("railway_routes")
          .select("*");

        if (routesErr) throw routesErr;

        const { data: stationsData, error: stationsErr } = await supabase
          .from("railway_stations")
          .select("*")
          .order("station_order", { ascending: true });

        if (stationsErr) throw stationsErr;

        const combined: RailwayRoute[] = (routesData || []).map((route: any) => {
          const stops: RailwayStop[] = (stationsData || [])
            .filter((s: any) => s.route_id === route.id)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              status: (s.status === "تحت الإنشاء" ? "تحت الإنشاء" : "تعمل") as "تعمل" | "تحت الإنشاء"
            }));

          return {
            id: route.id,
            name: route.name,
            from: route.from_location,
            to: route.to_location,
            duration: route.duration,
            stops: stops,
            classes: route.classes || [
              { name: "درجة أولى مكيفة", price: "تحدد لاحقاً", features: "تكييف، مقاعد مريحة" },
              { name: "درجة ثانية مكيفة", price: "تحدد لاحقاً", features: "تكييف واقتصادي" }
            ],
            tips: route.tips || ""
          };
        });

        if (combined.length > 0) {
          setRoutes(combined);
          setSelectedRouteId(prev => (combined.some(r => r.id === prev) ? prev : combined[0].id));
        } else {
          loadLocalRoutes();
        }
      } catch (err) {
        console.warn("Failed to load railways from Supabase, using localStorage", err);
        loadLocalRoutes();
      }
    };

    const loadLocalRoutes = () => {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("local_railways_routes");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const mapped = parsed.map((route: any) => {
              if (Array.isArray(route.stops)) {
                route.stops = route.stops.map((stop: any) => {
                  if (typeof stop === "string") {
                    return { name: stop, status: "تشغيل فعلي" };
                  }
                  return { name: stop.name, status: stop.status || "تشغيل فعلي" };
                });
              } else {
                route.stops = [];
              }
              return route;
            });
            setRoutes(mapped);
            if (mapped.length > 0) {
              setSelectedRouteId(prev => (mapped.some((r: any) => r.id === prev) ? prev : mapped[0].id));
            }
          } catch {
            setRoutes(RAILWAY_ROUTES);
          }
        } else {
          localStorage.setItem("local_railways_routes", JSON.stringify(RAILWAY_ROUTES));
          setRoutes(RAILWAY_ROUTES);
        }
      } else {
        setRoutes(RAILWAY_ROUTES);
      }
    };

    fetchRoutes();
  }, []);

  const activeRoutesList = routes.length > 0 ? routes : RAILWAY_ROUTES;
  const currentRoute = activeRoutesList.find(r => r.id === selectedRouteId) || activeRoutesList[0];

  const allStationsList = useMemo(() => {
    const list: { name: string; routeName: string; routeId: string }[] = [];
    const seen = new Set<string>();
    activeRoutesList.forEach(r => {
      if (Array.isArray(r.stops)) {
        r.stops.forEach(s => {
          const key = `${r.id}-${s.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({ name: s.name, routeName: getRouteShortName(r), routeId: r.id });
          }
        });
      }
    });
    return list;
  }, [activeRoutesList]);

  const filteredReportStations = useMemo(() => {
    const q = normalizeArabic(reportStationSearchQuery.trim());
    if (!q) return allStationsList;
    return allStationsList.filter(s => normalizeArabic(s.name).includes(q) || normalizeArabic(s.routeName).includes(q));
  }, [reportStationSearchQuery, allStationsList]);

  const handleReportImageSelect = (file: File | null) => {
    if (!file) {
      if (reportImagePreview) {
        URL.revokeObjectURL(reportImagePreview);
      }
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReportError("حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setReportError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportError("");
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  };

  const handleOpenReportModal = async (stationName: string | null = null, fromRoute: boolean = false) => {
    setReportError("");
    setReportSuccess(false);
    setReportDetails("");
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    setReportImageFile(null);
    setReportImagePreview(null);
    setIsDraggingImage(false);

    if (stationName) {
      setReportTargetScope("station");
      setReportSelectedStation(stationName);
      setReportStationSearchQuery(stationName);
      setReportProblemType("station_info");
    } else if (fromRoute && currentRoute) {
      setReportTargetScope("route");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("schedule_error");
    } else {
      setReportTargetScope("general");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("schedule_error");
    }

    setReportModalOpen(true);

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

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (reportTargetScope === "station" && !reportSelectedStation) {
      setReportError("يرجى اختيار وتحديد المحطة المراد الإبلاغ عنها أولاً.");
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أو الخطأ.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split('.').pop() || 'jpg';
        const fileName = `railways_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const problemTypeLabels: Record<string, string> = {
        schedule_error: "خطأ في مواعيد تحرك القطارات أو مدة الرحلة",
        price: "أسعار التذاكر غير صحيحة أو تم تعديلها",
        train_class: "خطأ في فئات ودرجات القطارات المتاحة (تالجو، VIP، إسباني، روسي)",
        stops_info: "خطأ في محطات الوقوف أو مسار الخط",
        station_info: "معلومات المحطة غير دقيقة أو مغلقة للتطوير",
        app_bug: "مشكلة تقنية أو زر لا يستجيب في الصفحة",
        other: "ملاحظة أو مشكلة أخرى",
      };

      const typeLabel = problemTypeLabels[reportProblemType] || "مشكلة في سكك حديد مصر";

      let scopeInfo = "";
      if (reportTargetScope === "route" && currentRoute) {
        scopeInfo = `📍 الخط المعني: ${currentRoute.name}
⏱️ المدة المقدرة: ${currentRoute.duration}
🚉 عدد المحطات الرئيسية: ${currentRoute.stops?.length || 0}`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في صفحة سكك حديد مصر (القطارات):
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle = reportTargetScope === "route" && currentRoute
        ? `مشكلة خط قطار: ${currentRoute.name}`
        : reportTargetScope === "station" && reportSelectedStation
          ? `مشكلة محطة قطار: ${reportSelectedStation}`
          : `مشكلة في سكك حديد مصر (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "سكك حديد مصر",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🚆",
            message: `شكراً لمساعدتنا في تحسين وتدقيق دليل سكك حديد مصر. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        if (reportImagePreview) {
          URL.revokeObjectURL(reportImagePreview);
        }
        setReportImageFile(null);
        setReportImagePreview(null);
      }, 2200);
    } catch (err: any) {
      console.error("Error submitting railway report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);
  // ========================= Loading screen
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--color-secondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontFamily: "var(--font-sub)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // ========================= Lock screen
  if (!user || !hasAccess) {
    return (
      <div className="main-container">
        {/* Banner */}
        <div ref={paywallRef} style={{
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--border-glass)",
          direction: "rtl"
        }}>
          {/* Cover Image Banner */}
          <div>
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--text-primary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/Cairo_train.png" alt="Cairo Train" loading="lazy" decoding="async" style={{ width: "35px", height: "35px", marginLeft: "10px" }} />
              سكك حديد مصر</h1>
            <p className="sub-title" style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              مواعيد وأسعار قطارات السفر بين المحافظات.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
          <div ref={paywallCardRef} style={{
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-card)",
            padding: "35px 25px",
            textAlign: "center",
            marginTop: "32px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Lock Icon */}
            <div style={{
              marginBottom: "24px",
            }}>
              <img src="/images/icons3d/CairoSilver.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "14px" }}>
              دليل سكك حديد مصر يتطلب أشتراك في الباقة الفضية
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح مواعيد وأسعار قطارات السفر بين المحافظات المختلفة متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
            </p>

            {/* Perks list */}
            <div style={{
              background: "rgba(128, 128, 128, 0.04)",
              padding: "18px 20px",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border-glass)",
              textAlign: "right",
              margin: "0 auto 28px",
              maxWidth: "420px"
            }}>
              <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>ما الذي يميز الباقة الفضية ؟</span>
              </div>
              <ul style={{
                paddingRight: "16px",
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontFamily: "var(--font-body)"
              }}>
                <li>✨ خطوط ومحطات القطارات</li>
                <li>✨ نقاط التبديل بين القطارات</li>
                <li>✨ البحث عن أنواع القطارات</li>
                <li>✨ كيفية الحجز ونصائح السفر</li>
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  className="btn btn-silver"
                  style={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الفضية
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    display: "block"
                  }}
                >
                  سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}

              <Link
                href="/"
                className="btn btn-cancel"
                style={{
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  display: "block"
                }}
              >
                الرجوع للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = activeRoutesList.findIndex(r => r.id === selectedRouteId);
  const color = getRouteColor(selectedRouteId, activeIndex >= 0 ? activeIndex : 0);
  // ================== Main Container 
  return (
    //================================== START MAIN CONTAINER =================================
    <div className="main-container">
      {/* Header Banner */}
      <div ref={headerRef} className="header-banner">
        <div>
          {/* Title */}
          <h1 className="header-title">سكك حديد مصر</h1>
          {/* Sub Title */}
          <p className="header-sub-title">
            استكشف شبكة قطارات سكك حديد مصر، اعرف أسعار التذاكر وفئات القطارات، ومسارات الرحلات والمدد الزمنية للخطوط الرئيسية ومحطات التوقف.
          </p>
        </div>
      </div>

      {/* Container */}
      <div className="container">
        {/* Cards Slider */}
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
          {activeRoutesList.map((route, idx) => {
            const active = selectedRouteId === route.id;
            const routeColor = getRouteColor(route.id, idx);
            const shortName = getRouteShortName(route);
            const iconData = getRouteIconData(route.id, idx, routeColor);

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${iconData.glowColor}98 20%, transparent 65%), var(--bgPrimary)`,
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "var(--ra-8)",
                  padding: "16px 16px 14px 16px",
                  cursor: "pointer",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                  textAlign: "right",
                  flex: "0 0 auto",
                  minWidth: "175px",
                  maxWidth: "200px",
                  height: "85px",
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
                      color: "var(--text-primary)",
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
                    {shortName}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontWeight: "500",
                      marginTop: "3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {route.stops ? route.stops.length : 0} محطات
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Details Panel */}
        <div ref={detailsPanelRef} className="details-panel">
          <h5 className="text-lg fw-bold">
            تفاصيل خط {currentRoute?.name || ""}
          </h5>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute?.stops?.[0]?.name?.replace(" (رمسيس)", "")?.replace(" (محطة رمسيس)", "") || currentRoute?.from || "القاهرة"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>البداية</div>
            </div>

            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute?.stops?.[currentRoute.stops.length - 1]?.name?.replace(" (محطة سيدي جابر / مصر)", "") || currentRoute?.to || "الوصول"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>النهاية</div>
            </div>

            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute?.duration || "غير معددة"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>وقت السفر</div>
            </div>
          </div>

          {/* Detailed stops vertical timeline */}
          <div style={{
            background: "var(--bg-glass)",
            padding: "20px 16px",
            borderRadius: "var(--ra-8)",
            border: "1px solid var(--border-glass)"
          }}>
            <h2 className="text-md fw-bold mb-4">
              📌 المحطات الرئيسية على هذا الخط
            </h2>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {currentRoute?.stops && currentRoute.stops.length > 0 ? (
                currentRoute.stops.map((stop, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === currentRoute.stops.length - 1;
                  const isUnderConstruction = stop.status === "تحت الإنشاء";
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>
                        {/* Dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                          <div style={{
                            width: isFirst || isLast ? "12px" : "8px",
                            height: isFirst || isLast ? "12px" : "8px",
                            borderRadius: "50%",
                            backgroundColor: isUnderConstruction ? "transparent" : color,
                            border: isUnderConstruction ? `2px dashed var(--colorDanger)` : (isFirst || isLast ? `2px solid var(--bgPrimary)` : "none"),
                            boxShadow: isUnderConstruction ? "none" : (isFirst || isLast ? `0 0 0 2px ${color}` : "none")
                          }} />
                        </div>

                        {/* Text */}
                        <span style={{
                          fontSize: "0.88rem",
                          fontWeight: isFirst || isLast ? "700" : "500",
                          color: isUnderConstruction ? "#ef4444" : (isFirst || isLast ? "var(--text-primary)" : "var(--text-secondary)"),
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {stop.name}
                          {isUnderConstruction && (
                            <span style={{
                              fontSize: "0.68rem",
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: "bold"
                            }}>
                              تحت الإنشاء 🚧
                            </span>
                          )}
                          {isFirst && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "8px" }}>(بدايــة الخط)</span>}
                          {isLast && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "8px" }}>(نهـاية الخط)</span>}
                        </span>
                      </div>

                      {/* Connective Line */}
                      {!isLast && (
                        <div style={{ display: "flex", gap: "12px", minHeight: "14px" }}>
                          <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{
                              width: "2px",
                              backgroundColor: color,
                              minHeight: "14px",
                              opacity: 0.4,
                            }} />
                          </div>
                          <div style={{ flexGrow: 1 }} />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="sub-title" style={{ color: "var(--text-secondary)", fontSize: "0.88rem", textAlign: "center", padding: "12px" }}>
                  لا توجد محطات مضافة لهذا الخط بعد.
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div style={{
            marginTop: "12px",
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "16px"
          }}>
            <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.88rem" }}>
              <i className="bx bxs-info-circle" style={{ marginLeft: "6px", color: color, fontSize: "1.1rem", verticalAlign: "middle" }}></i>
              <strong>نصيحة السفر: </strong>
              <span style={{ color: "var(--text-muted)" }}>{currentRoute.tips}</span>
            </p>
          </div>

          {/* Route Report Problem Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
            <button
              type="button"
              className="btn btn-report"
              onClick={() => handleOpenReportModal(null, true)}
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>الإبلاغ عن خطأ في مواعيد أو تفاصيل هذا الخط</span>
            </button>
          </div>

        </div>

        {/* Train Types & Features Section */}
        {/* <TrainTypesSection
          sectionRef={trainTypesRef}
          themeColor={color}
          onJumpToBooking={() => {
            if (howToBookRef.current) {
              howToBookRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        /> */}

        {/* How to book section */}
        <div ref={howToBookRef} className="details-panel">
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "var(--text-primary)",
            margin: "0 0 8px"
          }}>
            <i className="bx bxs-book-open" style={{ marginLeft: "8px", color: color, fontSize: "1.3rem", verticalAlign: "middle" }}></i>
            كيف يمكنني حجز التذاكر ؟
          </h2>
          <p className="sub-title" style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.7", margin: "0" }}>
            يمكنك الحجز بسهولة عبر عدة طرق معتمدة رسمياً من الهيئة القومية لسكك حديد مصر لمنع التكدس أمام شبابيك التذاكر:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {([
              {
                title: "الموقع الإلكتروني الرسمي",
                desc: "يمكنك حجز التذاكر والدفع ببطاقة الائتمان عبر البوابة الرسمية للهيئة عبر الإنترنت.",
                links: [
                  {
                    name: "الموقع الرسمي",
                    url: "https://enr.gov.eg/o-city/obs/enr/railway/ar/booktickets",
                    icon: "bx bx-globe",
                    iconColor: color || "#3b82f6"
                  }
                ]
              },
              {
                title: "التطبيق الهاتفي الرسمي",
                desc: "حمل تطبيق الهواتف الذكية المعتمد لحجز التذاكر والاستعلام عن مواعيد رحلات القطار بكل سهولة عبر الأندرويد والآيفون.",
                links: [
                  {
                    name: "Google Play",
                    url: "https://play.google.com/store/apps/details?id=enr.transit.maf",
                    icon: "bx bxl-android",
                    iconColor: "#10b981"
                  },
                  {
                    name: "App Store",
                    url: "https://apps.apple.com/eg/app/سكك-حديد-مصر-التطبيق-الرسمى/id1486815902?l=ar",
                    icon: "bx bxl-apple",
                    iconColor: "var(--text-primary)"
                  }
                ]
              }
            ] as { title: string; desc: string; links: { name: string; url: string; icon: string; iconColor?: string }[] }[]).map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(128,128,128,0.03)",
                  border: "1px solid var(--border-glass)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                  gap: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <h3 className="sub-title" style={{ margin: "0 0 6px 0", color: "var(--text-primary)", fontWeight: "700", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    {item.title}
                  </h3>
                  <p className="sub-title" style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {item.desc}
                  </p>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "left",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  {item.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: "rgba(128, 128, 128, 0.06)",
                        border: "1px solid var(--border-glass)",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(128, 128, 128, 0.12)";
                        e.currentTarget.style.borderColor = color || "#3b82f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(128, 128, 128, 0.06)";
                        e.currentTarget.style.borderColor = "var(--border-glass)";
                      }}
                    >
                      <i className={link.icon} style={{ fontSize: "1.15rem", color: link.iconColor || color || "#3b82f6" }}></i>
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Problem Section */}
        <div style={{
          background: "var(--bg-linear-alert)",
          border: "1px solid var(--border-secondary)",
          borderRadius: "var(--ra-8)",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "14px",
          overflow: "hidden",
          position: "relative"
        }}>
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: "row-reverse" }}>
              <h2 style={{
                margin: "0 0 6px",
                fontSize: "1rem",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                الإبلاغ عن مشكلة أو تحديث في بيانات القطارات
              </h2>
              <img src="/images/icons3d/alert.png" alt="" style={{ width: "35px" }} />
            </div>

            <p style={{
              margin: 0,
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6"
            }}>
              هل لاحظت أي خطأ في المواعيد، الأسعار، أو محطات التوقف؟ شاركنا ملاحظتك لمساعدتنا في تدقيق وتحديث جدول الرحلات باستمرار.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-report"
            onClick={() => handleOpenReportModal()}
            style={{
              padding: "6px 10px",
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-flag"></i>
            <span>تقديم بلاغ عن خطأ</span>
          </button>
        </div>

      </div>

      {/* Report Problem Modal */}
      {reportModalOpen && (
        <div style={{
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
          direction: "rtl"
        }}>
          <div ref={modalBoxRef} style={{
            backgroundColor: "var(--bgPrimary)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border-glass)",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "var(--font-cairo)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-glass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.02)"
            }}>
              <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
                <span>مشكلة في خدمة سكك حديد مصر</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  if (!reportLoading) {
                    setReportModalOpen(false);
                    handleReportImageSelect(null);
                  }
                }}
                className="btn-close"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              {reportSuccess ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(52, 199, 89, 0.15)",
                    color: "#34c759",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    margin: "0 auto 16px"
                  }}>
                    <i className="bx bx-check"></i>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    تم استلام بلاغك بنجاح!
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    شكراً لمساهمتك في تحسين وتدقيق مواعيد وبيانات قطارات سكك حديد مصر. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
                  </p>
                </div>
              ) : limitChecking ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--color-secondary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري التحقق...</span>
                </div>
              ) : limitReached ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px"
                  }}>
                    <img src="/images/icons3d/error.png" alt="error" style={{ width: "100%", height: "100%", objectFit: "contain" }} loading="lazy" />
                  </div>
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    تم الوصول للحد الأقصى من البلاغات المعلقة
                  </h5>
                  <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setReportModalOpen(false)}
                    style={{ width: "100%" }}
                  >
                    حسناً، فهمت
                  </button>
                </div>
              ) : !user ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    color: "var(--color-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 14px"
                  }}>
                    <i className="bx bx-user"></i>
                  </div>
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    تسجيل الدخول مطلوب
                  </h5>
                  <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة في قطارات سكك حديد مصر ومتابعة حالته وكسب نقاط المساهمة.
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link
                      href="/login"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Scope Segmented Control */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                      نطاق المشكلة:
                    </label>
                    <div className="tabs" style={{ display: "grid", gridTemplateColumns: currentRoute ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("general");
                          setReportSelectedStation("");
                          setReportStationSearchQuery("");
                          setShowReportStationList(false);
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "8px",
                          border: "none",
                          background: reportTargetScope === "general" ? "var(--text-primary)" : "transparent",
                          color: reportTargetScope === "general" ? "var(--bgMode)" : "var(--text-primary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        مشكلة عامة
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("station");
                          setShowReportStationList(true);
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "8px",
                          border: "none",
                          background: reportTargetScope === "station" ? "var(--text-primary)" : "transparent",
                          color: reportTargetScope === "station" ? "var(--bgMode)" : "var(--text-primary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        محطة معينة
                      </button>

                      {currentRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            setReportTargetScope("route");
                            setReportSelectedStation("");
                            setReportStationSearchQuery("");
                            setShowReportStationList(false);
                          }}
                          style={{
                            padding: "8px 4px",
                            borderRadius: "8px",
                            border: "none",
                            background: reportTargetScope === "route" ? "var(--text-primary)" : "transparent",
                            color: reportTargetScope === "route" ? "var(--bgMode)" : "var(--text-primary)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          الخط الحالي
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If Scope is Station: Searchable station autocomplete selector */}
                  {reportTargetScope === "station" && (
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                        <span>اختر أو ابحث عن المحطة:</span>
                        {reportSelectedStation && (
                          <span style={{ fontSize: "0.74rem", color: color, fontWeight: "700" }}>
                            تم تحديد: {reportSelectedStation} ✔
                          </span>
                        )}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          className="input-fields"
                          placeholder="ابحث باسم المحطة أو الخط..."
                          value={reportStationSearchQuery}
                          onChange={e => {
                            const val = e.target.value;
                            setReportStationSearchQuery(val);
                            setShowReportStationList(true);
                            if (reportSelectedStation && val !== reportSelectedStation) {
                              setReportSelectedStation("");
                            }
                          }}
                          onFocus={() => setShowReportStationList(true)}
                          onBlur={() => setTimeout(() => setShowReportStationList(false), 250)}
                          style={{
                            width: "100%",
                            padding: "10px 36px 10px 36px",
                            borderRadius: "10px",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            border: reportSelectedStation ? `1px solid var(--text-primary)` : "1px solid var(--border-glass)",
                            fontSize: "0.9rem",
                            direction: "rtl"
                          }}
                        />
                        <div style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--text-secondary)",
                          pointerEvents: "none",
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <i className="bx bx-search" style={{ fontSize: "1rem" }}></i>
                        </div>

                        {reportStationSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportSelectedStation("");
                              setReportStationSearchQuery("");
                              setShowReportStationList(true);
                            }}
                            title="مسح"
                            style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(255, 255, 255, 0.08)",
                              border: "none",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Station suggestions list popup */}
                      {showReportStationList && (
                        <div style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "var(--radius-card)",
                          overflow: "hidden",
                          zIndex: 1100,
                          maxHeight: "220px",
                          overflowY: "auto",
                          marginTop: "6px",
                          padding: "4px"
                        }}>
                          {filteredReportStations.length === 0 ? (
                            <div style={{ padding: "14px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                              <i className="bx bx-search" style={{ fontSize: "1.2rem", display: "block", marginBottom: "4px" }} />
                              لا توجد محطة مطابقة لبحثك "{reportStationSearchQuery}"
                            </div>
                          ) : (
                            filteredReportStations.map((st: any) => {
                              const isSelected = reportSelectedStation === st.name;
                              return (
                                <div
                                  key={`${st.routeId}-${st.name}`}
                                  onMouseDown={() => {
                                    setReportSelectedStation(st.name);
                                    setReportStationSearchQuery(st.name);
                                    setShowReportStationList(false);
                                  }}
                                  style={{
                                    padding: "9px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                    border: isSelected ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                                    transition: "all 0.15s ease",
                                    marginBottom: "2px"
                                  }}
                                  onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = "var(--hoverBtn)";
                                  }}
                                  onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <i className="bx bx-map-pin" style={{ color: isSelected ? "var(--color-secondary)" : "var(--text-secondary)", fontSize: "1rem" }} />
                                    <span style={{ fontSize: "0.88rem", fontWeight: isSelected ? "700" : "600", color: isSelected ? "var(--color-secondary)" : "var(--text-primary)" }}>
                                      {st.name}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{
                                      fontSize: "0.68rem",
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                      background: "rgba(128, 128, 128, 0.1)",
                                      color: "var(--text-secondary)",
                                      fontWeight: "bold",
                                      border: "1px solid var(--border-glass)"
                                    }}>
                                      {st.routeName}
                                    </span>
                                    {isSelected && (
                                      <span style={{ fontSize: "0.78rem", color: "var(--colorSuccess)", fontWeight: "700" }}>✔</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Scope is Route: display current route preview card */}
                  {reportTargetScope === "route" && currentRoute && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(59, 130, 246, 0.06)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      lineHeight: "1.6"
                    }}>
                      <div><strong>الخط:</strong> {currentRoute.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                        من: {currentRoute.from} ← إلى: {currentRoute.to} • المدة: {currentRoute.duration}
                      </div>
                    </div>
                  )}

                  {/* Custom Problem Type Dropdown Selector */}
                  <div style={{ position: "relative" }}>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                      <span>نوع المشكلة:</span>
                    </label>

                    {/* Dropdown Trigger Box */}
                    {(() => {
                      const curOpt = REPORT_PROBLEM_OPTIONS.find(o => o.id === reportProblemType) || REPORT_PROBLEM_OPTIONS[0];
                      return (
                        <button
                          type="button"
                          onClick={() => setShowProblemTypeDropdown(prev => !prev)}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: "var(--radius-card)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            border: showProblemTypeDropdown ? `1px solid var(--text-primary)` : "1px solid var(--border-glass)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            textAlign: "right",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            <div style={{ minWidth: 0, textAlign: "right" }}>
                              <div style={{ fontSize: "0.86rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {curOpt.title}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {curOpt.desc}
                              </div>
                            </div>
                          </div>

                          <i className={showProblemTypeDropdown ? "bx bx-chevron-up" : "bx bx-chevron-down"} style={{ fontSize: "1.25rem", color: "var(--text-secondary)", marginRight: "8px", flexShrink: 0 }} />
                        </button>
                      );
                    })()}

                    {/* Problem Types Floating Popup Menu */}
                    {showProblemTypeDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "var(--radius-card)",
                          zIndex: 1200,
                          maxHeight: "360px",
                          overflowY: "auto",
                          marginTop: "6px",
                          padding: "6px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}
                      >
                        {REPORT_PROBLEM_OPTIONS.map((opt) => {
                          const isSelected = opt.id === reportProblemType;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => {
                                setReportProblemType(opt.id);
                                setShowProblemTypeDropdown(false);
                              }}
                              style={{
                                padding: "8px 10px",
                                borderRadius: "var(--radius-card)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                background: isSelected ? "var(--bgPrimary)" : "transparent",
                                border: isSelected ? `1px solid var(--borderPrimary)` : "1px solid transparent",
                                transition: "all 0.15s ease"
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                <div style={{ minWidth: 0, textAlign: "right" }}>
                                  <div style={{ fontSize: "0.84rem", fontWeight: isSelected ? "800" : "600", color: isSelected ? "var(--text-primary)" : "var(--text-primary)" }}>
                                    {opt.title}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                    {opt.desc}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Details Textarea */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                      تفاصيل المشكلة : <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: سعر تذكرة تالجو تغيرت إلى كذا، أو القطار يقف أيضاً في محطة كذا)..."
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      className="input-fields"
                      required
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-glass)",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Enhanced Image File Upload */}
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                      <span>صورة توضيحية (اختياري):</span>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", fontWeight: "normal", fontFamily: "var(--font-body)" }}>
                        JPG, PNG, WEBP (Max~5MB)
                      </span>
                    </label>

                    {!reportImagePreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(false);
                          const droppedFile = e.dataTransfer.files?.[0];
                          if (droppedFile) handleReportImageSelect(droppedFile);
                        }}
                        style={{
                          position: "relative",
                          border: isDraggingImage ? "2px dashed var(--color-secondary)" : "2px dashed var(--borderDashed)",
                          borderRadius: "12px",
                          background: isDraggingImage ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          padding: "20px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDraggingImage) e.currentTarget.style.background = "var(--hoverBtn)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isDraggingImage) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReportImageSelect(file);
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />

                        <div style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          background: "rgba(59, 130, 246, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: color || "var(--color-secondary)",
                          fontSize: "1.4rem"
                        }}>
                          <i className="bx bx-cloud-upload"></i>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "3px" }}>
                            اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                            أرسل صورة الخطأ إن وُجد لتوضيح المشكلة بدقة
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        position: "relative",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "12px",
                        background: "var(--bg-secondary)",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}>
                        {/* Thumbnail */}
                        <div style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#000",
                          border: "1px solid var(--border-glass)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}>
                          <img
                            src={reportImagePreview}
                            alt="معاينة الصورة المرفقة"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        </div>

                        {/* File details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "0.86rem",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {reportImageFile?.name || "صورة توضيحية"}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>
                              {reportImageFile
                                ? reportImageFile.size < 1024 * 1024
                                  ? `${(reportImageFile.size / 1024).toFixed(0)} KB`
                                  : `${(reportImageFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : ""}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleReportImageSelect(null)}
                            title="حذف الصورة"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#ef4444",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <i className="bx bx-trash"></i>
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {reportError && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      fontSize: "0.85rem"
                    }}>
                      {reportError}
                    </div>
                  )}

                  {/* Submit and Cancel Buttons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="submit"
                      className="btn actionBtnDelete"
                      disabled={reportLoading || reportUploading}
                      style={{
                        flex: 1,
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        cursor: reportLoading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "50%",
                      }}
                    >
                      {reportLoading ? (
                        <>
                          <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          <span>{reportUploading ? "يتم الرفع..." : "جاري الإرسال..."}</span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-send"></i>
                          <span>إرسال البلاغ</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancle"
                      disabled={reportLoading}
                      onClick={() => {
                        setReportModalOpen(false);
                        handleReportImageSelect(null);
                      }}
                      style={{
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        width: "50%",
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
