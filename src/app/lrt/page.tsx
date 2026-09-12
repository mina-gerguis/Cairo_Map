"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

const DEFAULT_LRT: any[] = [
  { name: "عدلي منصور", line_type: "trunk", station_order: 1 },
  { name: "العبور", line_type: "trunk", station_order: 2 },
  { name: "المستقبل", line_type: "trunk", station_order: 3 },
  { name: "الشروق", line_type: "trunk", station_order: 4 },
  { name: "هليوبوليس الجديدة", line_type: "trunk", station_order: 5 },
  { name: "بدر", line_type: "trunk", station_order: 6 },
  { name: "الروبيكي", line_type: "capital", station_order: 1 },
  { name: "حدائق العاصمة", line_type: "capital", station_order: 2 },
  { name: "مطار العاصمة", line_type: "capital", station_order: 3 },
  { name: "مدينة الفنون والثقافة", line_type: "capital", station_order: 4 },
  { name: "المنطقة الصناعية", line_type: "ramadan", station_order: 1 },
  { name: "مدينة المعرفة", line_type: "ramadan", station_order: 2 }
];

export const STATION_DETAILS: Record<string, { landmarks: string[]; type: string; status: "تشغيل فعلي" | "تحت الإنشاء" }> = {
  "عدلي منصور": {
    landmarks: ["محطة عدلي منصور التبادلية", "موقف سوبر جيت", "طريق مصر الإسماعيلية الصحراوي", "الخط الثالث للمترو"],
    type: "تبادلية مع الخط الثالث للمترو ومحطة السكك الحديدية و الاتوبيس الترددي 🚇",
    status: "تشغيل فعلي"
  },
  "العبور": {
    landmarks: ["مدينة العبور الجولف", "جامعة بنها فرع العبور", "طريق مصر الإسماعيلية", "سوق العبور"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "المستقبل": {
    landmarks: ["مدينة المستقبل السكنية", "طريق الإسماعيلية الصحراوي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "الشروق": {
    landmarks: ["المدخل الرئيسي لمدينة الشروق", "الجامعة البريطانية في مصر (BUE)", "أكاديمية الشروق", "نادي هليوبوليس الرياضي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "هليوبوليس الجديدة": {
    landmarks: ["مدينة هليوبوليس الجديدة", "طريق السويس الصحراوي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "بدر": {
    landmarks: ["محطة بدر التبادلية", "مدينة بدر السكنية", "طريق الروبيكي", "منطقة الصناعات المتوسطة"],
    type: "محطة تفريعة المسارين 🔀",
    status: "تشغيل فعلي"
  },
  "الروبيكي": {
    landmarks: ["مدينة الروبيكي للجلود", "المنطقة الصناعية بالروبيكي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "حدائق العاصمة": {
    landmarks: ["مدينة حدائق العاصمة السكنية", "سكن لكل المصريين"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "مطار العاصمة": {
    landmarks: ["مطار العاصمة الإدارية الدولي", "منطقة المطار الإدارية"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "مدينة الفنون والثقافة": {
    landmarks: ["مدينة الفنون والثقافة بالعاصمة", "النهر الأخضر", "دار الأوبرا الجديدة", "فندق الماسة", "محطة المونوريل"],
    type: "تبادلية مع المونوريل 🚄",
    status: "تشغيل فعلي"
  },
  "المنطقة الصناعية": {
    landmarks: ["المنطقة الصناعية بالعاشر من رمضان", "طريق بلبيس العاشر"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "مدينة المعرفة": {
    landmarks: ["مدينة المعرفة بالعاشر من رمضان", "جامعة سنجور", "مراكز البحوث والابتكار", "المعهد التكنولوجي العالي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "العاصمة المركزية": {
    landmarks: ["العاصمة المركزية"],
    type: "محطة تبادلية مخططة مع القطار الكهربائي السريع (العين السخنة–مطروح) 🚄",
    status: "تشغيل فعلي"
  }
};

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

export default function LrtPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search autocomplete states
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Active Trip States
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // LRT Explorer State
  const [activeLine, setActiveLine] = useState<"all" | "trunk" | "capital" | "ramadan">("all");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Report Problem State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<"general" | "route" | "station">("general");
  const [reportSelectedStation, setReportSelectedStation] = useState<string>("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState<string>("");
  const [showReportStationList, setShowReportStationList] = useState<boolean>(false);
  const [reportProblemType, setReportProblemType] = useState<string>("route_error");
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

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadStations();
    }
  }, [user, hasAccess]);

  useEffect(() => {
    document.title = "ماب القاهرة - القطار الكهربي";
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

  const loadStations = async () => {
    setLoading(true);
    if (!supabase) {
      const local = getLocalStations();
      setStations(local);
      initializeSelectors(local);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lrt_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        const local = getLocalStations();
        setStations(local);
        initializeSelectors(local);
      } else {
        const loaded = data || [];
        setStations(loaded);
        initializeSelectors(loaded);
      }
    } catch (err) {
      const local = getLocalStations();
      setStations(local);
      initializeSelectors(local);
    } finally {
      setLoading(false);
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_LRT;
    const local = localStorage.getItem("local_lrt");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_LRT;
      }
    }
    localStorage.setItem("local_lrt", JSON.stringify(DEFAULT_LRT));
    return DEFAULT_LRT;
  };

  const initializeSelectors = (stationList: any[]) => {
    const main = stationList.filter(s => s.line_type === "trunk").sort((a, b) => a.station_order - b.station_order);
    const cap = stationList.filter(s => s.line_type === "capital").sort((a, b) => a.station_order - b.station_order);
    if (main.length > 0) {
      setSelectedFrom(main[0].name);
      setFromQuery(main[0].name);
    }
    if (cap.length > 0) {
      setSelectedTo(cap[cap.length - 1].name);
      setToQuery(cap[cap.length - 1].name);
    } else if (main.length > 1) {
      setSelectedTo(main[main.length - 1].name);
      setToQuery(main[main.length - 1].name);
    }
  };

  const LRT_MAIN_TRUNK = useMemo(() => {
    return stations
      .filter(s => s.line_type === "trunk")
      .sort((a, b) => a.station_order - b.station_order)
      .map(s => s.name);
  }, [stations]);

  const LRT_BRANCH_CAPITAL = useMemo(() => {
    return stations
      .filter(s => s.line_type === "capital")
      .sort((a, b) => a.station_order - b.station_order)
      .map(s => s.name);
  }, [stations]);

  const LRT_BRANCH_RAMADAN = useMemo(() => {
    return stations
      .filter(s => s.line_type === "ramadan")
      .sort((a, b) => a.station_order - b.station_order)
      .map(s => s.name);
  }, [stations]);

  const ALL_LRT_STATIONS = useMemo(() => {
    return [
      ...LRT_MAIN_TRUNK,
      ...LRT_BRANCH_CAPITAL,
      ...LRT_BRANCH_RAMADAN
    ];
  }, [LRT_MAIN_TRUNK, LRT_BRANCH_CAPITAL, LRT_BRANCH_RAMADAN]);

  const filteredFrom = useMemo(() => {
    const q = normalizeArabic(fromQuery.trim());
    return ALL_LRT_STATIONS.filter(s => normalizeArabic(s).includes(q) && q.length > 0);
  }, [fromQuery, ALL_LRT_STATIONS]);

  const filteredTo = useMemo(() => {
    const q = normalizeArabic(toQuery.trim());
    return ALL_LRT_STATIONS.filter(s => normalizeArabic(s).includes(q) && q.length > 0);
  }, [toQuery, ALL_LRT_STATIONS]);

  const searchResults = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (q.length === 0) return [];
    return (stations.length > 0 ? stations : DEFAULT_LRT).filter(s => normalizeArabic(s.name).includes(q));
  }, [searchQuery, stations]);

  const allStationsList = useMemo(() => {
    return stations.length > 0 ? stations : DEFAULT_LRT;
  }, [stations]);

  const filteredReportStations = useMemo(() => {
    const q = normalizeArabic(reportStationSearchQuery.trim());
    if (!q) return allStationsList;
    return allStationsList.filter((s: any) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l: string) => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
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
    } else if (fromRoute && result && selectedFrom && selectedTo) {
      setReportTargetScope("route");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("route_error");
    } else {
      setReportTargetScope("general");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("route_error");
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
        const fileName = `lrt_${user.id}_${Date.now()}.${fileExt}`;
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
        route_error: "خطأ في حساب مسار الرحلة أو زمن الوصول",
        price: "سعر التذكرة غير صحيح أو عدد المحطات غير دقيق",
        transfer: "خطأ في محطة التبديل (عدلي منصور أو بدر)",
        station_info: "اسم المحطة أو المعالم القريبة غير دقيقة",
        construction: "محطة مغلقة أو قيد الإنشاء أو تغيرت حالة تشغيلها",
        app_bug: "مشكلة تقنية أو زر لا يستجيب في الصفحة",
        other: "ملاحظة أو مشكلة أخرى",
      };

      const typeLabel = problemTypeLabels[reportProblemType] || "مشكلة في القطار الكهربائي LRT";

      let scopeInfo = "";
      if (reportTargetScope === "route" && selectedFrom && selectedTo) {
        scopeInfo = `📍 المسار المعني: من ${selectedFrom} إلى ${selectedTo}
💰 السعر المحسوب: ${result?.price || "غير محدد"} ج.م
⏱️ الوقت المقدر: ${result?.estimatedTime || "غير محدد"} دقيقة
🚉 عدد المحطات: ${result?.count || "غير محدد"}`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في صفحة القطار الكهربائي LRT:
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle = reportTargetScope === "route" && selectedFrom && selectedTo
        ? `مشكلة مسار LRT: من ${selectedFrom} إلى ${selectedTo}`
        : reportTargetScope === "station" && reportSelectedStation
          ? `مشكلة محطة LRT: ${reportSelectedStation}`
          : `مشكلة في القطار الكهربائي LRT (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "القطار الكهربائي LRT",
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
            title: "تم استلام بلاغك بنجاح 🚊",
            message: `شكراً لمساعدتنا في تحسين وتدقيق خدمة القطار الكهربائي LRT. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
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
      console.error("Error submitting LRT report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  const handleSelectSearchStation = (station: any) => {
    setActiveLine(station.line_type);
    setExpandedStation(station.name);
    setSearchQuery("");
    setIsDropdownOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`station-${station.name}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleFind = () => {
    if (!selectedFrom || !selectedTo) return;
    const route = calculateRoute(selectedFrom, selectedTo);
    setResult(route);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const swapStations = () => {
    const tempF = selectedFrom;
    const tempT = selectedTo;
    setSelectedFrom(tempT);
    setSelectedTo(tempF);
    setFromQuery(tempT || "");
    setToQuery(tempF || "");
    setResult(null);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const handleStationClick = (stationName: string) => {
    if (expandedStation === stationName) {
      setExpandedStation(null);
    } else {
      setExpandedStation(stationName);
    }
  };

  // Calculate distance & price
  const calculateRoute = (from: string, to: string) => {
    if (!from || !to || from === to) {
      return { stations: [from], count: 0, price: 0 };
    }

    const getPath = (station: string): { trunkIdx: number; branch: "capital" | "ramadan" | null; branchIdx: number } => {
      const trunkIdx = LRT_MAIN_TRUNK.indexOf(station);
      if (trunkIdx !== -1) {
        return { trunkIdx, branch: null, branchIdx: -1 };
      }
      const capIdx = LRT_BRANCH_CAPITAL.indexOf(station);
      if (capIdx !== -1) {
        return { trunkIdx: LRT_MAIN_TRUNK.length - 1, branch: "capital", branchIdx: capIdx };
      }
      const ramIdx = LRT_BRANCH_RAMADAN.indexOf(station);
      if (ramIdx !== -1) {
        return { trunkIdx: LRT_MAIN_TRUNK.length - 1, branch: "ramadan", branchIdx: ramIdx };
      }
      return { trunkIdx: 0, branch: null, branchIdx: -1 };
    };

    const pFrom = getPath(from);
    const pTo = getPath(to);

    let stationsPath: string[] = [];

    // Case 1: Both on the trunk
    if (!pFrom.branch && !pTo.branch) {
      const min = Math.min(pFrom.trunkIdx, pTo.trunkIdx);
      const max = Math.max(pFrom.trunkIdx, pTo.trunkIdx);
      stationsPath = LRT_MAIN_TRUNK.slice(min, max + 1);
      if (pFrom.trunkIdx > pTo.trunkIdx) stationsPath.reverse();
    }
    // Case 2: One on trunk, one on branch
    else if (!pFrom.branch && pTo.branch) {
      const branchList = pTo.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
      const minTrunk = Math.min(pFrom.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const maxTrunk = Math.max(pFrom.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const trunkPart = LRT_MAIN_TRUNK.slice(minTrunk, maxTrunk + 1);
      if (pFrom.trunkIdx > LRT_MAIN_TRUNK.length - 1) trunkPart.reverse();

      const branchPart = branchList.slice(0, pTo.branchIdx + 1);
      stationsPath = [...trunkPart.slice(0, -1), "بدر", ...branchPart];
    }
    else if (pFrom.branch && !pTo.branch) {
      const branchList = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
      const branchPart = branchList.slice(0, pFrom.branchIdx + 1).reverse();
      const minTrunk = Math.min(pTo.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const maxTrunk = Math.max(pTo.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const trunkPart = LRT_MAIN_TRUNK.slice(minTrunk, maxTrunk + 1);
      if (LRT_MAIN_TRUNK.length - 1 > pTo.trunkIdx) trunkPart.reverse();

      stationsPath = [...branchPart, "بدر", ...trunkPart.slice(1)];
    }
    // Case 3: Both on branches
    else if (pFrom.branch && pTo.branch) {
      if (pFrom.branch === pTo.branch) {
        const branchList = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const min = Math.min(pFrom.branchIdx, pTo.branchIdx);
        const max = Math.max(pFrom.branchIdx, pTo.branchIdx);
        stationsPath = branchList.slice(min, max + 1);
        if (pFrom.branchIdx > pTo.branchIdx) stationsPath.reverse();
      } else {
        const branchListFrom = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const branchListTo = pTo.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const partFrom = branchListFrom.slice(0, pFrom.branchIdx + 1).reverse();
        const partTo = branchListTo.slice(0, pTo.branchIdx + 1);
        stationsPath = [...partFrom, "بدر", ...partTo];
      }
    }

    stationsPath = stationsPath.filter((v, i, a) => a.indexOf(v) === i);

    const count = stationsPath.length;
    let price = 10;
    if (count <= 3) price = 10;
    else if (count <= 7) price = 15;
    else if (count <= 12) price = 20;
    else price = 25;

    // Estimate time (average 4 mins per stop for LRT)
    const estimatedTime = (count - 1) * 4;

    return { stations: stationsPath, count, price, estimatedTime };
  };

  if (authLoading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "120px", textAlign: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <>
        <title>خريطة القطار الكهربائي LRT - دليل شامل لكل المحطات</title>
        <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
          {/* Banner matching Metro Cover Style */}
          <div className="metro-animate-fade" style={{
            backgroundColor: "var(--bgPrimary)",
            padding: "24px 20px 24px",
            textAlign: "center",
            position: "relative",
            borderBottom: "1px solid var(--borderGlass)",
            direction: "rtl"
          }}>
            {/* Back Button */}
            <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--bgGlass)",
                  border: "1px solid var(--borderGlass)",
                  color: "var(--textPrimary)",
                  textDecoration: "none"
                }}
              >
                <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
              </Link>
            </div>

            <div className="metro-animate-slide-up metro-delay-100">
              <h1 style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                fontWeight: "600",
                color: "var(--textPrimary)",
                letterSpacing: "-0.5px",
              }}>
                <img src="/images/icons2d/Cairo_lrt.png" alt="Cairo Lrt" loading="lazy" decoding="async" style={{ width: "35px", marginLeft: "10px" }} />
                القطار الكهربائي
              </h1>
              <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "10px auto", lineHeight: "1.6" }}>
                خريطة تفاعلية تفصيلية لشبكة القطار الكهربائي الخفيف الجديدة.
              </p>
            </div>
          </div>

          {/* Lock Panel centered container */}
          <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
            <div className="metro-animate-slide-up metro-delay-200" style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "35px 25px",
              textAlign: "center",
              marginTop: "32px",
              boxShadow: "var(--shadow-card)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Lock Icon */}
              <div style={{ marginBottom: "24px" }}>
                <img src="/images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
              </div>

              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
                دليل القطار الكهربائي يتطلب أشتراك في الباقة الفضية
              </h2>

              <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
                تصفح الخريطة التفصيلية والمسارات الزمنية وحاسبة التذاكر لخط القطار الكهربائي LRT متاح للمشتركين بالباقة الفضية أو الذهبية.
              </p>

              {/* Perks list */}
              <div style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                padding: "16px 20px",
                textAlign: "right",
                margin: "0 auto 32px",
                maxWidth: "440px"
              }}>
                <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية</div>
                <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>✨ تصفح جميع محطات LRT (التفريعة الرئيسية وتفريعات العاصمة ورمضان)</li>
                  <li>✨ حساب أسعار التذاكر بناء على عدد المحطات تلقائياً</li>
                  <li>✨ مسارات تفصيلية ومواعيد الرحلات الرسمية</li>
                  <li>✨ متاح معها ميزة ازاي اروح وسكك الحديد والمونوريل بالكامل</li>
                </ul>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
                {user ? (
                  <Link
                    href="/profile?expand=subscription"
                    style={{
                      padding: "var(--paddingBtn)",
                      borderRadius: "var(--radiusBtn)",
                      background: "var(--bg-subscribe-button-seliver)",
                      color: "#000",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      boxShadow: "var(--bs-subscribe-button-seliver)",
                      border: "1px solid var(--br-subscribe-button-seliver)",
                      display: "block"
                    }}
                  >
                    اشترك الآن في الباقة الفضية
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    style={{
                      padding: "var(--paddingBtn)",
                      borderRadius: "var(--radiusBtn)",
                      background: "var(--bg-subscribe-button-base)",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      boxShadow: "var(--bs-subscribe-button-base)",
                      display: "block"
                    }}
                  >
                    سجل دخولك أولاً لتفعيل الاشتراك
                  </Link>
                )}

                <Link
                  href="/"
                  style={{
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bgSecondary)",
                    color: "var(--textSecondary)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    border: "1px solid var(--borderGlass)",
                    display: "block"
                  }}
                >
                  الرجوع للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--borderGlass)",
          borderTop: "4px solid var(--colorSecondary, #06b6d4)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1rem" }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "40px", backgroundColor: "var(--bgPrimary)" }}>
      {/* Custom styles definition */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
        direction: "rtl"
      }}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/Cairo_lrt.png" alt="" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginLeft: "10px", objectFit: "contain" }} />
            دليل القطار الكهربائي LRT
          </h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف المحطات والاتجاهات والمعالم الهامة لخط القطار الكهربائي الخفيف.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#06b6d4",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>عدلي منصور - بدر</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#a855f7",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>تفريعة العاصمة</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>تفريعة العاشر</span>
          </div>

          {/* Report Problem Button */}
          <div style={{ marginTop: "14px" }}>
            <button
              type="button"
              onClick={() => handleOpenReportModal()}
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#ef4444",
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-cairo)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>الإبلاغ عن مشكلة في القطار الكهربائي LRT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl", textAlign: "right" }}>

        {/* Search Panel Card */}
        <div ref={searchContainerRef} className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 30,
        }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في محطات القطار الكهربائي LRT
            </label>
            <input
              className="input-fields"
              type="text"
              placeholder="ابحث باسم المحطة..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-heading)",
                height: "50px",
              }}
            />

            {/* Instant Search Results Dropdown */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--bgPrimary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-sm)",
                zIndex: 100,
                marginTop: "6px",
                maxHeight: "260px",
                overflowY: "auto",
                padding: "8px 0"
              }}>
                {searchResults.length === 0 ? (
                  <div style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "var(--textSecondary)",
                    fontSize: "0.9rem"
                  }}>
                    لم يتم العثور على محطات مطابقة
                  </div>
                ) : (
                  searchResults.map((station, index) => {
                    let lineColor = "#06b6d4";
                    let lineName = "الجذع الرئيسي";
                    if (station.line_type === "capital") { lineColor = "#a855f7"; lineName = "تفريعة العاصمة"; }
                    else if (station.line_type === "ramadan") { lineColor = "#10b981"; lineName = "تفريعة العاشر"; }

                    return (
                      <div
                        key={station.id || index}
                        onClick={() => handleSelectSearchStation(station)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 16px",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          borderBottom: index < searchResults.length - 1 ? "1px solid var(--borderGlass)" : "none"
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bgSecondary)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: lineColor
                          }} />
                          <span style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.95rem" }}>
                            {station.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            backgroundColor: lineColor + "1a",
                            color: lineColor
                          }}>
                            {lineName}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Calculator Section Card */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "20px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 20,
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--textPrimary)" }}>
            <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> مخطط الرحلة وحساب التذاكر
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            {/* FROM STATION INPUT */}
            <div style={{ position: "relative", zIndex: showFromList ? 10 : 1 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                من محطة:
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="اكتب اسم محطة البداية..."
                  value={fromQuery}
                  onChange={e => { setFromQuery(e.target.value); setSelectedFrom(null); setShowFromList(true); setResult(null); }}
                  onFocus={() => setShowFromList(true)}
                  onBlur={() => setTimeout(() => setShowFromList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                    height: "50px",
                  }}
                />
                {selectedFrom && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الاختيار ✔</span>
                )}
              </div>
              {showFromList && filteredFrom.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                  borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  boxShadow: "var(--shadow-lg)", marginTop: "6px"
                }}>
                  {filteredFrom.map(s => (
                    <div key={s} onMouseDown={() => { setSelectedFrom(s); setFromQuery(s); setShowFromList(false); }} style={{
                      padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
              <button onClick={swapStations} style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--textSecondary)",
                fontSize: "1.2rem",
                transition: "all 0.2s ease",
                marginTop: "10px",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "rotate(180deg)";
                  e.currentTarget.style.background = "var(--hoverBtn)";
                  e.currentTarget.style.color = "var(--colorSecondary)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "rotate(0deg)";
                  e.currentTarget.style.background = "var(--bgSecondary)";
                  e.currentTarget.style.color = "var(--textSecondary)";
                }}
              >
                ⇅
              </button>
            </div>

            {/* TO STATION INPUT */}
            <div style={{ position: "relative", zIndex: showToList ? 10 : 1 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                إلى محطة:
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="اكتب اسم محطة النهاية..."
                  value={toQuery}
                  onChange={e => { setToQuery(e.target.value); setSelectedTo(null); setShowToList(true); setResult(null); }}
                  onFocus={() => setShowToList(true)}
                  onBlur={() => setTimeout(() => setShowToList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                    height: "50px"
                  }}
                />
                {selectedTo && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الاختيار ✔</span>
                )}
              </div>
              {showToList && filteredTo.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                  borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  boxShadow: "var(--shadow-lg)", marginTop: "6px"
                }}>
                  {filteredTo.map(s => (
                    <div key={s} onMouseDown={() => { setSelectedTo(s); setToQuery(s); setShowToList(false); }} style={{
                      padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleFind}
            disabled={!selectedFrom || !selectedTo}
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: "8px",
              fontSize: "0.95rem",
              fontWeight: "700"
            }}
          >
            وريني الطريق
          </button>
        </div>

        {/* Calculation results display */}
        {result && (
          <div className="metro-animate-slide-up" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "20px",
            marginTop: "20px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <h5 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "var(--textPrimary)" }}>
              <i className="fa-solid fa-signs-post" style={{ marginLeft: "6px", color: "var(--colorSecondary)" }}></i> تفاصيل الرحلة
            </h5>

            {/* Grid Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSuccess)" }}>{result.price} ج.م</div>
                <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>سعر التذكرة</div>
              </div>
              <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSecondary)" }}>{result.estimatedTime} د</div>
                <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>الوقت التقريبي</div>
              </div>
            </div>

            {/* Start Trip Button */}
            {!isTripActive && (
              <button
                onClick={() => {
                  setIsTripActive(true);
                  setCurrentStepIndex(0);
                }}
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "20px"
                }}
              >
                <i className="fa-solid fa-play" style={{ marginLeft: "5px" }}></i>
                ابدأ تتبع الرحلة
              </button>
            )}

            {/* Active Trip Tracker Card */}
            {isTripActive && (
              <div style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "var(--shadow-card)",
                animation: "fadeIn 0.3s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--colorSecondary)", background: "rgba(6, 182, 212, 0.12)", padding: "4px 10px", borderRadius: "8px" }}>
                    رحلة نشطة حالياً
                  </span>
                  <button
                    onClick={() => {
                      setIsTripActive(false);
                      setCurrentStepIndex(0);
                    }}
                    style={{
                      border: "none",
                      color: "var(--accent-red)",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      background: "rgba(246, 59, 59, 0.12)", padding: "4px 10px", borderRadius: "8px"
                    }}
                  >
                    <i className="bx bx-trash" style={{ marginLeft: "5px" }}></i>
                    إلغاء التتبع
                  </button>
                </div>

                <div style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--textSecondary)" }}>
                  أنت الآن في محطة: <span style={{ color: "var(--textPrimary)", fontSize: "1.1rem", fontWeight: "800" }}>{result.stations[currentStepIndex]}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "8px" }}>
                    ({currentStepIndex + 1} من {result.stations.length})
                  </span>
                </div>

                {(() => {
                  const remainingStops = result.stations.length - 1 - currentStepIndex;
                  const remainingTime = Math.max(0, remainingStops * 4);
                  return (
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "16px", color: "var(--textSecondary)" }}>
                      ⏱️ الوقت المتبقي للوصول: <span style={{ color: "var(--colorSecondary)", fontSize: "1rem", fontWeight: "800" }}>{remainingTime} دقيقة</span>
                    </div>
                  );
                })()}

                {/* Controls */}
                {currentStepIndex < result.stations.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    وصلت محطة {result.stations[currentStepIndex + 1]}
                  </button>
                ) : (
                  <div style={{
                    textAlign: "center",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "10px",
                    padding: "16px",
                  }}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
                    <h4 style={{ color: "var(--colorSuccess)", fontWeight: "800", margin: "0 0 6px" }}>حمد لله على السلامة!</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", margin: "0 0 12px" }}>لقد وصلت إلى وجهتك محطة <span style={{ color: "var(--colorSecondary)", fontSize: "1rem", fontWeight: "800" }}>{result.stations[currentStepIndex]}</span>.</p>
                    <button
                      onClick={() => {
                        setIsTripActive(false);
                        setCurrentStepIndex(0);
                      }}
                      style={{
                        background: "var(--colorSecondary)",
                        color: "#ffffff",
                        padding: "8px 24px",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-cairo)"
                      }}
                    >
                      إنهاء الرحلة
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Station sequence timeline */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", background: "var(--bgSecondary)", padding: "14px", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
              {result.stations.map((s: string, idx: number) => {
                const isFirst = idx === 0;
                const isLast = idx === result.stations.length - 1;
                const isPassed = isTripActive && idx < currentStepIndex;
                const isCurrent = isTripActive && idx === currentStepIndex;

                let bg = "var(--bgPrimary)";
                let color = "var(--textPrimary)";
                let border = "1px solid var(--borderGlass)";
                let boxShadow = "none";
                let icon = null;

                if (isTripActive) {
                  if (isPassed) {
                    bg = "rgba(16, 185, 129, 0.15)";
                    color = "#10b981";
                    border = "1px solid rgba(16, 185, 129, 0.4)";
                    icon = "✓";
                  } else if (isCurrent) {
                    bg = "#06b6d4";
                    color = "#ffffff";
                    border = "2px solid #06b6d4";
                    boxShadow = "0 0 10px rgba(6, 182, 212, 0.5)";
                    icon = "📍";
                  } else if (isLast) {
                    bg = "rgba(168, 85, 247, 0.2)";
                    color = "#a855f7";
                    border = "1px solid rgba(168, 85, 247, 0.5)";
                    icon = "🎯";
                  } else {
                    bg = "var(--bgPrimary)";
                    color = "var(--textPrimary)";
                    border = "1px solid var(--borderGlass)";
                  }
                } else {
                  if (isFirst) {
                    bg = "#06b6d4";
                    color = "#ffffff";
                    border = "none";
                    icon = "🚩";
                  } else if (isLast) {
                    bg = "#a855f7";
                    color = "#ffffff";
                    border = "none";
                    icon = "🎯";
                  }
                }

                return (
                  <React.Fragment key={s}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background: bg,
                      color: color,
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      border: border,
                      boxShadow: boxShadow,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.3s ease"
                    }}>
                      {icon && <span style={{ fontSize: "0.8rem" }}>{icon}</span>}
                      {s}
                    </span>
                    {idx < result.stations.length - 1 && (
                      <span style={{
                        color: isTripActive && idx < currentStepIndex ? "#10b981" : "#06b6d4",
                        fontWeight: "bold",
                        transition: "color 0.3s ease"
                      }}>
                        ←
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Route Report Problem Button */}
            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => handleOpenReportModal(null, true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  fontFamily: "var(--font-cairo)"
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>الإبلاغ عن مشكلة في هذا المسار</span>
              </button>
            </div>
          </div>
        )}

        {/* LRT LINES EXPLORER */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "32px" }}>
          <h2 style={{
            fontSize: "1.3rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            marginBottom: "6px",
            textAlign: "center"
          }}>محطات القطار الكهربائي LRT</h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.9rem", textAlign: "center", marginBottom: "20px" }}>
            اختر المسار لاستعراض المحطات والمعالم المحيطة بها تفصيلياً.
          </p>

          {/* Explorer Tab Switcher */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
            {[
              { id: "all", label: "الكل", color: "#818cf8" },
              { id: "trunk", label: "الرئيسي", color: "#06b6d4" },
              { id: "capital", label: "العاصمة", color: "#a855f7" },
              { id: "ramadan", label: "العاشر", color: "#10b981" }
            ].map(tab => {
              const active = activeLine === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveLine(tab.id as any);
                    setExpandedStation(null);
                  }}
                  style={{
                    background: "var(--bgPrimary)",
                    border: active ? `2px solid ${tab.color}` : "1px solid var(--borderGlass)",
                    borderRadius: "12px",
                    padding: "10px 4px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    boxShadow: active ? `0 0 10px ${tab.color}15` : "none",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--hoverBtn)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "var(--bgPrimary)"; }}
                >
                  <div className="sub-title" style={{ color: active ? "var(--textPrimary)" : "var(--textSecondary)", fontWeight: "700", fontSize: "0.8rem" }}>
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stations Explorer Container */}
          <div style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "var(--radius-card)",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "14px", marginBottom: "16px" }}>
              <h3 className="sub-title" style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "4px" }}>
                {activeLine === "all" ? "جميع محطات القطار الكهربائي الخفيف" : activeLine === "trunk" ? "الجذع الرئيسي (عدلي منصور - بدر)" : activeLine === "capital" ? "تفريعة العاصمة الإدارية (بدر - الفنون والثقافة)" : "تفريعة العاشر من رمضان (بدر - مدينة المعرفة)"}
              </h3>
              <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.82rem", margin: 0 }}>
                {activeLine === "all" && "تصفح شبكة القطار بالكامل بجميع تفريعاتها الشمالية والجنوبية"}
                {activeLine === "trunk" && "محطات الجذع الرئيسي لربط القاهرة الكبرى بالمدن الجديدة وصولاً لـ بدر التبادلية"}
                {activeLine === "capital" && "فرعة العاصمة الإدارية الجديدة لربط محطة بدر بمدينة الفنون والثقافة"}
                {activeLine === "ramadan" && "فرعة العاشر من رمضان لربط محطة بدر بالمنطقة الصناعية ومدينة العاشر"}
              </p>
            </div>

            {/* Scrollable station timeline list */}
            <div style={{
              maxHeight: "550px", overflowY: "auto", padding: "16px 5px",
              background: "transparent"
            }}>
              {(() => {
                let stationsList: any[] = [];
                const raw = stations.length > 0 ? stations : DEFAULT_LRT;
                if (activeLine === "trunk") {
                  stationsList = raw.filter(s => s.line_type === "trunk").sort((a, b) => a.station_order - b.station_order);
                } else if (activeLine === "capital") {
                  stationsList = raw.filter(s => s.line_type === "capital").sort((a, b) => a.station_order - b.station_order);
                } else if (activeLine === "ramadan") {
                  stationsList = raw.filter(s => s.line_type === "ramadan").sort((a, b) => a.station_order - b.station_order);
                } else {
                  stationsList = [
                    ...raw.filter(s => s.line_type === "trunk").sort((a, b) => a.station_order - b.station_order),
                    ...raw.filter(s => s.line_type === "capital").sort((a, b) => a.station_order - b.station_order),
                    ...raw.filter(s => s.line_type === "ramadan").sort((a, b) => a.station_order - b.station_order),
                  ];
                }

                return stationsList.map((station, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === stationsList.length - 1;

                  let color = "#06b6d4";
                  if (station.line_type === "capital") color = "#a855f7";
                  else if (station.line_type === "ramadan") color = "#10b981";

                  const isTransfer = station.name === "عدلي منصور" || station.name === "بدر" || station.name === "مدينة الفنون والثقافة";
                  const isExpanded = expandedStation === station.name;
                  const dbLandmarks = Array.isArray(station.landmarks) && station.landmarks.length > 0 ? (station.landmarks as string[]) : null;
                  const staticDetails = STATION_DETAILS[station.name];
                  const details = (staticDetails || dbLandmarks) ? {
                    landmarks: dbLandmarks || staticDetails?.landmarks || [],
                    type: staticDetails?.type || "عادية",
                    status: station.status || staticDetails?.status || "تشغيل فعلي"
                  } : null;

                  return (
                    <div id={`station-${station.name}`} key={idx} style={{ display: "flex", flexDirection: "column", position: "relative" }}>

                      {/* Circle Node on the timeline */}
                      <div
                        style={{
                          position: "absolute",
                          right: "-29px",
                          top: "15px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: details?.status === "تحت الإنشاء" ? "var(--bgPrimary)" : color,
                          border: details?.status === "تحت الإنشاء" ? `3px dashed ${color}` : `4.5px solid var(--bgPrimary, #000)`,
                          zIndex: 2,
                          boxShadow: isExpanded ? `0 0 10px ${color}` : "none",
                          transition: "all 0.3s ease"
                        }}
                      />

                      {/* Content Box */}
                      <div
                        onClick={() => handleStationClick(station.name)}
                        style={{
                          backgroundColor: "var(--bgPrimary)",
                          border: isExpanded ? `1px solid ${color}` : (details?.status === "تحت الإنشاء" ? `1px dashed ${color}50` : "1px solid var(--borderGlass)"),
                          opacity: details?.status === "تحت الإنشاء" ? 0.75 : 1,
                          borderRadius: "var(--radius-card)",
                          padding: "12px 16px",
                          boxShadow: "var(--shadow-sm)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          cursor: "pointer",
                          transition: "transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                          marginBottom: "4px"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{
                              fontSize: "1.02rem",
                              fontWeight: "700",
                              color: details?.status === "تحت الإنشاء" ? "var(--textSecondary)" : "var(--textPrimary)",
                            }}>
                              {station.name}
                            </span>
                            {details?.status === "تحت الإنشاء" && (
                              <span style={{
                                background: "rgba(239, 68, 68, 0.12)",
                                color: "#ef4444",
                                fontSize: "0.68rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}>
                                تحت الإنشاء 🚧
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {isTransfer && (
                              <span style={{
                                background: "rgba(251, 191, 36, 0.12)",
                                color: "#fbbf24",
                                fontSize: "0.68rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "bold"
                              }}>
                                تبادلية
                              </span>
                            )}
                            <i className={`bx bx-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: "var(--textSecondary)", fontSize: "1.3rem" }}></i>
                          </div>
                        </div>

                        {/* Expandable details */}
                        {isExpanded && (
                          <div style={{
                            borderTop: "1px solid var(--borderGlass)",
                            paddingTop: "12px",
                            marginTop: "4px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            animation: "fadeIn 0.25s ease"
                          }}>
                            {details ? (
                              <>
                                {/* Landmarks */}
                                <div>
                                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>
                                    📍 المعالم القريبة:
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {details.landmarks.map((landmark, idx) => (
                                      <span key={idx} style={{
                                        background: "var(--bgSecondary)",
                                        color: "var(--textSecondary)",
                                        fontSize: "0.78rem",
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--borderGlass)"
                                      }}>
                                        {landmark}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Connection Type */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "4px" }}>
                                  <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>
                                    🔗 نوع المحطة: <strong style={{ color: "var(--textPrimary)" }}>{details.type}</strong>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                لم يتم توفير تفاصيل إضافية لهذه المحطة حالياً.
                              </span>
                            )}

                            {/* Report Station Issue Button */}
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", borderTop: "1px dashed var(--borderGlass)", paddingTop: "8px" }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReportModal(station.name);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#ef4444",
                                  fontSize: "0.76rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  fontFamily: "var(--font-cairo)",
                                  padding: "2px 6px"
                                }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                              >
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                <span>الإبلاغ عن مشكلة في هذه المحطة</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rail segment */}
                      {!isLast && (
                        <div style={{ display: "flex", gap: "12px", minHeight: "14px", position: "relative" }}>
                          <div style={{
                            position: "absolute",
                            right: "-22px",
                            top: "0",
                            bottom: "0",
                            width: "2px",
                            backgroundColor: color,
                            opacity: 0.5
                          }} />
                          <div style={{ height: "14px" }} />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Prices Legend Footer */}
        <div style={{
          padding: "12px 16px",
          background: "var(--bgSecondary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "var(--radius-card)",
          fontSize: "0.78rem",
          color: "var(--textSecondary)",
          lineHeight: "1.5",
          marginTop: "16px"
        }}>
          <i className="fa-regular fa-lightbulb" style={{ color: "var(--accent-warning)", marginLeft: "5px" }}></i>
          <strong>تسعير تذاكر القطار الكهربائي LRT المعتمد:</strong> <br />
          البيانات مبنية على الأسعار الرسمية لوزارة النقل
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", marginTop: "8px", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--colorSuccess)" }}>حتى 3 محطات:</strong> 10 جنيهات.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--colorSuccess)" }}>من 4 إلى 7 محطات:</strong> 15 جنيهاً.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--accent-warning)" }}>من 8 إلى 12 محطة:</strong> 20 جنيهاً.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--accent-danger)" }}>13 محطة فأكثر:</strong> 25 جنيهاً.
          </div>
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
          <div style={{
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
            animation: "fadeIn 0.2s ease",
            fontFamily: "var(--font-cairo)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--borderGlass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.02)"
            }}>
              <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
                <span>مشكلة في صفحة القطار الكهربائي LRT</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  if (!reportLoading) {
                    setReportModalOpen(false);
                    handleReportImageSelect(null);
                  }
                }}
                className="closeBtn"
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
                  <h4 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم استلام بلاغك بنجاح!
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    شكراً لمساهمتك في تحسين وتدقيق خدمة القطار الكهربائي LRT. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
                  </p>
                </div>
              ) : limitChecking ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--colorSecondary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
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
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم الوصول للحد الأقصى من البلاغات المعلقة
                  </h5>
                  <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
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
                    color: "var(--colorSecondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 14px"
                  }}>
                    <i className="bx bx-user"></i>
                  </div>
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تسجيل الدخول مطلوب
                  </h5>
                  <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة في القطار الكهربائي LRT ومتابعة حالته وكسب نقاط المساهمة.
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
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "8px" }}>
                      نطاق المشكلة:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: (result && selectedFrom && selectedTo) ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: "6px" }}>
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
                          border: `1px solid ${reportTargetScope === "general" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          background: reportTargetScope === "general" ? "rgba(6, 182, 212, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "general" ? "var(--textPrimary)" : "var(--textSecondary)",
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
                          border: `1px solid ${reportTargetScope === "station" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          background: reportTargetScope === "station" ? "rgba(6, 182, 212, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "station" ? "var(--textPrimary)" : "var(--textSecondary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        محطة معينة
                      </button>

                      {result && selectedFrom && selectedTo && (
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
                            border: `1px solid ${reportTargetScope === "route" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                            background: reportTargetScope === "route" ? "rgba(6, 182, 212, 0.12)" : "var(--bgSecondary)",
                            color: reportTargetScope === "route" ? "var(--textPrimary)" : "var(--textSecondary)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          المسار الحالي
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If Scope is Station: Searchable station autocomplete selector */}
                  {reportTargetScope === "station" && (
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        <span>اختر أو ابحث عن المحطة:</span>
                        {reportSelectedStation && (
                          <span style={{ fontSize: "0.74rem", color: "var(--colorSecondary)", fontWeight: "700" }}>
                            تم تحديد: {reportSelectedStation} ✔
                          </span>
                        )}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          className="input-fields"
                          placeholder="ابحث باسم المحطة أو المعلم القريب..."
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
                            background: "var(--bgSecondary)",
                            color: "var(--textPrimary)",
                            border: reportSelectedStation ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                            fontFamily: "var(--font-cairo)",
                            fontSize: "0.9rem",
                            direction: "rtl"
                          }}
                        />
                        <div style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--textSecondary)",
                          pointerEvents: "none",
                          fontSize: "0.85rem"
                        }}>
                          🔍
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
                              color: "var(--textSecondary)",
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
                          background: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "10px",
                          overflow: "hidden",
                          zIndex: 1100,
                          maxHeight: "200px",
                          overflowY: "auto",
                          boxShadow: "var(--shadow-lg)",
                          marginTop: "4px",
                          fontFamily: "var(--font-cairo)"
                        }}>
                          {filteredReportStations.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", fontSize: "0.82rem", color: "var(--textSecondary)" }}>
                              لا توجد محطة مطابقة لبحثك "{reportStationSearchQuery}"
                            </div>
                          ) : (
                            filteredReportStations.map((st: any) => {
                              const isSelected = reportSelectedStation === st.name;
                              const q = normalizeArabic(reportStationSearchQuery.trim());
                              const details = STATION_DETAILS[st.name];
                              const matchedLandmark = q ? details?.landmarks?.find((l: string) => normalizeArabic(l).includes(q)) : null;
                              const lineLabel = st.line_type === "trunk" ? "الخط الرئيسي" : st.line_type === "capital" ? "تفريعة العاصمة" : "تفريعة العاشر";
                              const lineColor = st.line_type === "trunk" ? "#06b6d4" : st.line_type === "capital" ? "#a855f7" : "#10b981";

                              return (
                                <div
                                  key={`${st.line_type}-${st.name}`}
                                  onMouseDown={() => {
                                    setReportSelectedStation(st.name);
                                    setReportStationSearchQuery(st.name);
                                    setShowReportStationList(false);
                                  }}
                                  style={{
                                    padding: "9px 14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                                    background: isSelected ? "rgba(6, 182, 212, 0.15)" : "transparent",
                                    transition: "background 0.15s ease"
                                  }}
                                  onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = "var(--hoverBtn)";
                                  }}
                                  onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span style={{ fontSize: "0.88rem", fontWeight: isSelected ? "700" : "600", color: isSelected ? "var(--colorSecondary)" : "var(--textPrimary)" }}>
                                      {st.name}
                                    </span>
                                    {matchedLandmark ? (
                                      <span style={{ fontSize: "0.7rem", color: "var(--colorSecondary)", fontWeight: "bold" }}>
                                        📍 قريب من: {matchedLandmark}
                                      </span>
                                    ) : (
                                      details?.landmarks && details.landmarks.length > 0 && (
                                        <span style={{ fontSize: "0.7rem", color: "var(--textSecondary)" }}>
                                          📍 {details.landmarks.slice(0, 2).join("، ")}
                                        </span>
                                      )
                                    )}
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{
                                      fontSize: "0.68rem",
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                      background: `${lineColor}1a`,
                                      color: lineColor,
                                      fontWeight: "bold",
                                      border: "1px solid var(--borderGlass)"
                                    }}>
                                      {lineLabel}
                                    </span>
                                    {isSelected && (
                                      <span style={{ fontSize: "0.75rem", color: "var(--colorSuccess)", fontWeight: "700" }}>✔</span>
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
                  {reportTargetScope === "route" && selectedFrom && selectedTo && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(6, 182, 212, 0.06)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                      fontSize: "0.84rem",
                      color: "var(--textPrimary)",
                      lineHeight: "1.6"
                    }}>
                      <div>📍 <strong>من:</strong> {selectedFrom} ← <strong>إلى:</strong> {selectedTo}</div>
                      {result && (
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "4px" }}>
                          السعر: {result.price} ج.م • المحطات: {result.count} • الوقت المقدر: {result.estimatedTime} د
                        </div>
                      )}
                    </div>
                  )}

                  {/* Problem Type dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      نوع المشكلة:
                    </label>
                    <select
                      value={reportProblemType}
                      onChange={e => setReportProblemType(e.target.value)}
                      className="input-fields"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-cairo)",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      <option value="route_error" style={{ background: "var(--bgSecondary)" }}>خطأ في حساب مسار الرحلة أو زمن الوصول</option>
                      <option value="price" style={{ background: "var(--bgSecondary)" }}>سعر التذكرة غير صحيح أو عدد المحطات غير دقيق</option>
                      <option value="transfer" style={{ background: "var(--bgSecondary)" }}>خطأ في محطة التبديل (عدلي منصور أو بدر)</option>
                      <option value="station_info" style={{ background: "var(--bgSecondary)" }}>اسم المحطة أو المعالم القريبة غير دقيقة</option>
                      <option value="construction" style={{ background: "var(--bgSecondary)" }}>محطة مغلقة أو تغيرت حالة تشغيلها</option>
                      <option value="app_bug" style={{ background: "var(--bgSecondary)" }}>مشكلة تقنية أو زر لا يستجيب في الصفحة</option>
                      <option value="other" style={{ background: "var(--bgSecondary)" }}>ملاحظة أو مشكلة أخرى</option>
                    </select>
                  </div>

                  {/* Details Textarea */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      تفاصيل المشكلة / التصحيح المقترح: <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: محطة كذا أصبح اسمها مختلف، أو سعر التذكرة بين المحطتين كذا)..."
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      className="input-fields"
                      required
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-cairo)",
                        fontSize: "0.9rem",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Enhanced Image File Upload */}
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      <span>صورة توضيحية للمشكلة (اختياري):</span>
                      <span style={{ fontSize: "0.74rem", color: "var(--textSecondary)", fontWeight: "normal" }}>
                        JPG, PNG, WEBP (الحد الأقصى 5MB)
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
                          border: isDraggingImage ? "2px dashed var(--colorSecondary)" : "1.5px dashed var(--borderGlass)",
                          borderRadius: "12px",
                          background: isDraggingImage ? "rgba(6, 182, 212, 0.08)" : "rgba(255, 255, 255, 0.02)",
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
                          background: "rgba(6, 182, 212, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--colorSecondary)",
                          fontSize: "1.4rem"
                        }}>
                          <i className="bx bx-cloud-upload"></i>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "3px" }}>
                            اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--textSecondary)" }}>
                            لقطة شاشة للخطأ، أو صورة للمحطة لتوضيح المشكلة بدقة
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        position: "relative",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "12px",
                        background: "var(--bgSecondary)",
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
                          border: "1px solid var(--borderGlass)",
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
                            color: "var(--textPrimary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {reportImageFile?.name || "صورة توضيحية"}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--textSecondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>
                              {reportImageFile
                                ? reportImageFile.size < 1024 * 1024
                                  ? `${(reportImageFile.size / 1024).toFixed(0)} KB`
                                  : `${(reportImageFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : ""}
                            </span>
                            <span>•</span>
                            <span style={{ color: "var(--colorSuccess)", fontWeight: "600" }}>جاهزة للإرسال ✔</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Change button */}
                          <label style={{
                            cursor: "pointer",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--borderGlass)",
                            color: "var(--textPrimary)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <i className="bx bx-sync"></i>
                            <span>تغيير</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReportImageSelect(file);
                              }}
                              style={{ display: "none" }}
                            />
                          </label>

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
                          <span>{reportUploading ? "جاري الرفع..." : "جاري الإرسال..."}</span>
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
