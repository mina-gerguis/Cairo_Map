"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import VoiceInputButton from "@/components/VoiceInputButton";

/* ============================================================
   Cairo Monorail Data — East & West Lines
   ============================================================ */
export type MonorailLineId = "east" | "west";

export interface MonorailStation {
  name: string;
  line_type: MonorailLineId;
  station_order: number;
  landmarks?: string[];
  status?: "تشغيل تجريبي" | "تحت الإنشاء";
  type?: string;
  timeFromStart?: number;
}

export const MONORAIL_LINES_CONFIG: {
  id: MonorailLineId;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  from: string;
  to: string;
  desc: string;
  length: string;
  time: string;
}[] = [
    {
      id: "east",
      name: "مونوريل شرق النيل (العاصمة الإدارية)",
      shortName: "شرق النيل (العاصمة)",
      color: "#3b82f6",
      icon: "fa-solid fa-train",
      from: "الاستاد",
      to: "مدينة الفنون والثقافة",
      desc: "يربط محطة الاستاد بمدينة نصر بالعاصمة الإدارية الجديدة، مروراً بالقاهرة الجديدة والتجمع الخامس وبيت الوطن، بطول 56.5 كم ويضم 22 محطة.",
      length: "56.5 كم",
      time: "60 دقيقة",
    },
    {
      id: "west",
      name: "مونوريل غرب النيل (السادس من أكتوبر)",
      shortName: "غرب النيل (أكتوبر)",
      color: "#10b981",
      icon: "fa-solid fa-train",
      from: "وادي النيل",
      to: "أكتوبر الجديدة",
      desc: "يربط محطة وادي النيل بالمهندسين بمدينة السادس من أكتوبر والشيخ زايد والمنطقة الصناعية، بطول 42 كم ويضم 16 محطة.",
      length: "42 كم",
      time: "45 دقيقة",
    },
  ];

export const MONORAIL_STATION_DETAILS: Record<
  string,
  {
    landmarks: string[];
    type: string;
    timeFromStart: number;
    status: "تشغيل تجريبي" | "تحت الإنشاء";
  }
> = {
  // East Line
  "الاستاد": {
    landmarks: ["ستاد القاهرة الدولي", "مسجد آل رشدان", "نادي الزهور الرياضي", "شارع الفنجري"],
    type: "تبادلية مع الخط الثالث للمترو",
    timeFromStart: 0,
    status: "تشغيل تجريبي",
  },
  "هشام بركات": {
    landmarks: ["شارع الطيران", "سوق السيارات الجديد", "محور شينزو آبي", "مستشفى السلام التخصصي"],
    type: "تبادلية مع الأتوبيس الترددي BRT",
    timeFromStart: 4,
    status: "تشغيل تجريبي",
  },
  "نوري خطاب": {
    landmarks: ["حي الواحة بمدينة نصر", "عمارات الفتح", "محور المشير طنطاوي", "موقف الحي العاشر"],
    type: "عادية",
    timeFromStart: 8,
    status: "تشغيل تجريبي",
  },
  "الحي السابع": {
    landmarks: ["المنطقة الحرة بمدينة نصر", "عمارات عثمان", "شارع مصطفى النحاس", "سوق السيارات"],
    type: "عادية",
    timeFromStart: 11,
    status: "تشغيل تجريبي",
  },
  "ذاكر حسين": {
    landmarks: ["شارع ذاكر حسين الرئيسي", "سوق السيارات القديم", "طريق الوفاء والأمل", "ميدان إنبي"],
    type: "عادية",
    timeFromStart: 15,
    status: "تشغيل تجريبي",
  },
  "المنطقة الحرة": {
    landmarks: ["المنطقة الاستثمارية الحرة بمصر الجديدة", "محور المشير طنطاوي", "بوابات الاستثمار"],
    type: "عادية",
    timeFromStart: 18,
    status: "تشغيل تجريبي",
  },
  "المشير طنطاوي": {
    landmarks: ["مركز مصر للمعارض الدولية (EIEC)", "مسجد المشير طنطاوي", "استاد الدفاع الجوي", "فندق التوليب"],
    type: "تبادلية مع الأتوبيس الترددي BRT",
    timeFromStart: 22,
    status: "تشغيل تجريبي",
  },
  "وان قطامية": {
    landmarks: ["الطريق الدائري بمحيط المعادي", "مجمع وان قطامية الإداري", "توكيل مرسيدس", "كارفور المعادي"],
    type: "عادية",
    timeFromStart: 27,
    status: "تشغيل تجريبي",
  },
  "المستثمرين": {
    landmarks: ["منطقة المستثمرين الشمالية بالتجمع", "شارع التسعين الشمالي", "مجمع البنوك بالتجمع"],
    type: "عادية",
    timeFromStart: 32,
    status: "تحت الإنشاء",
  },
  "النسيم": {
    landmarks: ["محيط كمبوند ديار والتسعين الجنوبي", "المنطقة التجارية بالتجمع الخامس", "مستشفى الجوي التخصصي"],
    type: "عادية",
    timeFromStart: 36,
    status: "تحت الإنشاء",
  },
  "الجامعة الأمريكية": {
    landmarks: ["حرم الجامعة الأمريكية الجديد بالتجمع (AUC)", "بوينت 90 مول", "شارع التسعين الجنوبي", "ميدان الجامعة"],
    type: "تبادلية",
    timeFromStart: 40,
    status: "تحت الإنشاء",
  },
  "إعمار": {
    landmarks: ["كمبوند إعمار ميفيدا", "كمبوند هايد بارك التجمع", "شارع التسعين الجنوبي"],
    type: "عادية",
    timeFromStart: 44,
    status: "تحت الإنشاء",
  },
  "ميدان النافورة": {
    landmarks: ["ميدان النافورة الشهير بالتجمع", "منطقة البنوك والأعمال بالمستثمرين", "مجمع المطاعم"],
    type: "عادية",
    timeFromStart: 48,
    status: "تحت الإنشاء",
  },
  "البروة": {
    landmarks: ["محور محمد بن زايد الشمالي", "النادي الأهلي بالتجمع الخامس", "مشروع البروة العقاري"],
    type: "عادية",
    timeFromStart: 52,
    status: "تحت الإنشاء",
  },
  "بيت الوطن": {
    landmarks: ["مدخل منطقة بيت الوطن بالتجمع", "طريق السويس الصحراوي", "كمبوندات شمال بيت الوطن"],
    type: "عادية",
    timeFromStart: 56,
    status: "تحت الإنشاء",
  },
  "مسجد الفتاح العليم": {
    landmarks: ["مسجد الفتاح العليم الشهير", "مدخل العاصمة الإدارية الجديد من طريق السويس", "البوابة الغربية للعاصمة"],
    type: "عادية",
    timeFromStart: 60,
    status: "تحت الإنشاء",
  },
  "الحي السكني R2": {
    landmarks: ["الحي السكني الثاني R2 بالعاصمة", "المدينة الرياضية بالعاصمة الإدارية", "كمبوند المقصد"],
    type: "عادية",
    timeFromStart: 65,
    status: "تحت الإنشاء",
  },
  "الدائري الإقليمي": {
    landmarks: ["الطريق الدائري الإقليمي بمحيط العاصمة", "بوابات العاصمة الإدارية الرئيسية", "تقاطع طريق السخنة"],
    type: "عادية",
    timeFromStart: 69,
    status: "تحت الإنشاء",
  },
  "فندق الماسة": {
    landmarks: ["فندق الماسة كابيتال الشهير", "منطقة حي المال والأعمال (CBD)", "البرج الأيقوني بالعاصمة"],
    type: "عادية",
    timeFromStart: 73,
    status: "تحت الإنشاء",
  },
  "الحي الحكومي": {
    landmarks: ["مجلس النواب ومجلس الوزراء بالعاصمة", "الحي الوزاري", "ساحة الشعب", "مبنى البنك المركزي"],
    type: "عادية",
    timeFromStart: 77,
    status: "تحت الإنشاء",
  },
  "حي السفارات": {
    landmarks: ["حي السفارات والبعثات الدبلوماسية", "الكاتدرائية الكبرى بالعاصمة (ميلاد المسيح)", "الحي الدبلوماسي"],
    type: "عادية",
    timeFromStart: 80,
    status: "تحت الإنشاء",
  },
  "مدينة الفنون والثقافة": {
    landmarks: ["مدينة الفنون والثقافة بالعاصمة", "محطة القطار الكهربائي الخفيف LRT", "دار الأوبرا الجديدة", "النهر الأخضر الكبير"],
    type: "تبادلية مع القطار الكهربائي الخفيف LRT",
    timeFromStart: 84,
    status: "تشغيل تجريبي",
  },

  // West Line
  "أكتوبر الجديدة": {
    landmarks: ["منطقة حدائق أكتوبر الجديدة", "أحياء أكتوبر السكنية الغربية", "المنطقة الصناعية بأكتوبر"],
    type: "نهائية",
    timeFromStart: 0,
    status: "تحت الإنشاء",
  },
  "المنطقة الصناعية": {
    landmarks: ["المنطقة الصناعية الكبرى بالسادس من أكتوبر", "مجمع المصانع والمعارض", "طريق الواحات"],
    type: "عادية",
    timeFromStart: 5,
    status: "تحت الإنشاء",
  },
  "السادات": {
    landmarks: ["محور السادات الرئيسي بأكتوبر", "محيط الأحياء السكنية (الثاني والثالث)", "ميدان الحصري القريب"],
    type: "عادية",
    timeFromStart: 10,
    status: "تحت الإنشاء",
  },
  "جهاز مدينة 6 أكتوبر": {
    landmarks: ["مقر جهاز مدينة 6 أكتوبر", "أكتوبر سيتي سنتر", "شارع المحور المركزي", "مستشفى 6 أكتوبر الجامعي"],
    type: "عادية",
    timeFromStart: 14,
    status: "تحت الإنشاء",
  },
  "نقابة المهندسين": {
    landmarks: ["كمبوند جمعية المهندسين بأكتوبر", "محور جمال عبد الناصر الرئيسي", "نادي نقابة المهندسين"],
    type: "تبادلية مع القطار الكهربائي السريع (HSR)",
    timeFromStart: 18,
    status: "تحت الإنشاء",
  },
  "جامعة النيل": {
    landmarks: ["جامعة النيل الأهلية", "مول العرب الشهير", "ميدان جهينة محور 26 يوليو", "مستشفى دار الفؤاد"],
    type: "عادية",
    timeFromStart: 22,
    status: "تحت الإنشاء",
  },
  "هايبر وان": {
    landmarks: ["هايبر وان الشيخ زايد", "المدخل الرئيسي للشيخ زايد", "جامعة القاهرة فرع زايد", "محور 26 يوليو"],
    type: "عادية",
    timeFromStart: 26,
    status: "تحت الإنشاء",
  },
  "الصحراوي": {
    landmarks: ["طريق مصر إسكندرية الصحراوي", "القرية الذكية (Smart Village)", "داندي مول"],
    type: "عادية",
    timeFromStart: 30,
    status: "تحت الإنشاء",
  },
  "المنصورية": {
    landmarks: ["طريق المنصورية الريفي والسياحي", "منطقة أبو رواش الأثرية", "مزارع المنصورية"],
    type: "عادية",
    timeFromStart: 35,
    status: "تحت الإنشاء",
  },
  "المريوطية": {
    landmarks: ["ترعة المريوطية السياحية", "منطقة الهرم السياحية", "فنادق المريوطية", "طريق سقارة السياحي"],
    type: "عادية",
    timeFromStart: 39,
    status: "تحت الإنشاء",
  },
  "الطريق الدائري": {
    landmarks: ["الطريق الدائري الغربي حول الجيزة", "منطقة المنيب والمريوطية", "محور صفط اللبن"],
    type: "تبادلية مع الأتوبيس الترددي BRT",
    timeFromStart: 43,
    status: "تحت الإنشاء",
  },
  "العريش": {
    landmarks: ["شارع الهرم الرئيسي (تقاطع العريش)", "سينما رادوبيس والمنطقة التجارية", "مستشفى الهرم"],
    type: "عادية",
    timeFromStart: 47,
    status: "تحت الإنشاء",
  },
  "المطبغة": {
    landmarks: ["شارع الملك فيصل الرئيسي (منطقة المطبغة)", "حي بولاق الدكرور الجنوبي", "سوق فيصل"],
    type: "عادية",
    timeFromStart: 51,
    status: "تحت الإنشاء",
  },
  "بولاق الدكرور": {
    landmarks: ["شارع همفرس بولاق الدكرور", "محطة مترو بولاق الدكرور (الخط الثالث)", "جامعة القاهرة فرع الدقي"],
    type: "تبادلية مع الخط الثالث للمترو",
    timeFromStart: 55,
    status: "تحت الإنشاء",
  },
  "جامعة الدول العربية": {
    landmarks: ["شارع جامعة الدول العربية بالمهندسين", "ميدان مصطفى محمود", "نادي الصيد المصري", "شارع البطل أحمد عبد العزيز"],
    type: "عادية",
    timeFromStart: 59,
    status: "تحت الإنشاء",
  },
  "وادي النيل": {
    landmarks: ["شارع وادي النيل بالمهندسين", "محطة مترو وادي النيل (الخط الثالث)", "تقاطع المهندسين والعجوزة", "مستشفى ابن سينا"],
    type: "تبادلية مع الخط الثالث للمترو",
    timeFromStart: 63,
    status: "تشغيل تجريبي",
  },
};

export const STATION_DETAILS = MONORAIL_STATION_DETAILS;

const DEFAULT_MONORAIL_STATIONS: MonorailStation[] = [
  // East Line
  { name: "الاستاد", line_type: "east", station_order: 1 },
  { name: "هشام بركات", line_type: "east", station_order: 2 },
  { name: "نوري خطاب", line_type: "east", station_order: 3 },
  { name: "الحي السابع", line_type: "east", station_order: 4 },
  { name: "ذاكر حسين", line_type: "east", station_order: 5 },
  { name: "المنطقة الحرة", line_type: "east", station_order: 6 },
  { name: "المشير طنطاوي", line_type: "east", station_order: 7 },
  { name: "وان قطامية", line_type: "east", station_order: 8 },
  { name: "المستثمرين", line_type: "east", station_order: 9 },
  { name: "النسيم", line_type: "east", station_order: 10 },
  { name: "الجامعة الأمريكية", line_type: "east", station_order: 11 },
  { name: "إعمار", line_type: "east", station_order: 12 },
  { name: "ميدان النافورة", line_type: "east", station_order: 13 },
  { name: "البروة", line_type: "east", station_order: 14 },
  { name: "بيت الوطن", line_type: "east", station_order: 15 },
  { name: "مسجد الفتاح العليم", line_type: "east", station_order: 16 },
  { name: "الحي السكني R2", line_type: "east", station_order: 17 },
  { name: "الدائري الإقليمي", line_type: "east", station_order: 18 },
  { name: "فندق الماسة", line_type: "east", station_order: 19 },
  { name: "الحي الحكومي", line_type: "east", station_order: 20 },
  { name: "حي السفارات", line_type: "east", station_order: 21 },
  { name: "مدينة الفنون والثقافة", line_type: "east", station_order: 22 },

  // West Line
  { name: "أكتوبر الجديدة", line_type: "west", station_order: 1 },
  { name: "المنطقة الصناعية", line_type: "west", station_order: 2 },
  { name: "السادات", line_type: "west", station_order: 3 },
  { name: "جهاز مدينة 6 أكتوبر", line_type: "west", station_order: 4 },
  { name: "نقابة المهندسين", line_type: "west", station_order: 5 },
  { name: "جامعة النيل", line_type: "west", station_order: 6 },
  { name: "هايبر وان", line_type: "west", station_order: 7 },
  { name: "الصحراوي", line_type: "west", station_order: 8 },
  { name: "المنصورية", line_type: "west", station_order: 9 },
  { name: "المريوطية", line_type: "west", station_order: 10 },
  { name: "الطريق الدائري", line_type: "west", station_order: 11 },
  { name: "العريش", line_type: "west", station_order: 12 },
  { name: "المطبغة", line_type: "west", station_order: 13 },
  { name: "بولاق الدكرور", line_type: "west", station_order: 14 },
  { name: "جامعة الدول العربية", line_type: "west", station_order: 15 },
  { name: "وادي النيل", line_type: "west", station_order: 16 },
];

const MONORAIL_STATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // East Line key stations
  "الاستاد": { lat: 30.0694, lng: 31.3122 },
  "هشام بركات": { lat: 30.0612, lng: 31.3325 },
  "المشير طنطاوي": { lat: 30.0162, lng: 31.3789 },
  "الجامعة الأمريكية": { lat: 30.0187, lng: 31.4983 },
  "مسجد الفتاح العليم": { lat: 30.0125, lng: 31.6214 },
  "مدينة الفنون والثقافة": { lat: 29.9856, lng: 31.7345 },
  // West Line key stations
  "وادي النيل": { lat: 30.0615, lng: 31.2005 },
  "جامعة الدول العربية": { lat: 30.0525, lng: 31.1985 },
  "هايبر وان": { lat: 30.0425, lng: 31.0256 },
  "جامعة النيل": { lat: 30.0125, lng: 30.9754 },
  "جهاز مدينة 6 أكتوبر": { lat: 29.9756, lng: 30.9425 },
  "أكتوبر الجديدة": { lat: 29.8956, lng: 30.8654 },
};

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "");
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MonorailPage() {
  const { user } = useAuth();

  // State
  const [stations, setStations] = useState<MonorailStation[]>(DEFAULT_MONORAIL_STATIONS);
  const [selectedLine, setSelectedLine] = useState<MonorailLineId>("east");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [lineSearchQuery, setLineSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  // GPS Nearest Station State
  const [locatingNearest, setLocatingNearest] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<string | null>(null);

  // Trip tracking state
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copiedRoute, setCopiedRoute] = useState(false);

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

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const reportBannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Load stations from Supabase or LocalStorage
  useEffect(() => {
    document.title = "ماب القاهرة - مونوريل العاصمة وأكتوبر";
    loadStations();
  }, []);

  const loadStations = async () => {
    if (!supabase) {
      setStations(getLocalStations());
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monorail_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error || !data || data.length === 0) {
        setStations(getLocalStations());
      } else {
        setStations(data);
      }
    } catch {
      setStations(getLocalStations());
    }
  };

  const getLocalStations = (): MonorailStation[] => {
    if (typeof window === "undefined") return DEFAULT_MONORAIL_STATIONS;
    const local = localStorage.getItem("local_monorail");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MONORAIL_STATIONS;
      }
    }
    localStorage.setItem("local_monorail", JSON.stringify(DEFAULT_MONORAIL_STATIONS));
    return DEFAULT_MONORAIL_STATIONS;
  };

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });

      if (headerRef.current) {
        tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0 });
      }
      if (sliderRef.current) {
        tl.fromTo(sliderRef.current.children, { opacity: 0, y: 15, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, stagger: 0.08 }, "-=0.2");
      }
      if (searchPanelRef.current) {
        tl.fromTo(searchPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (detailsPanelRef.current) {
        tl.fromTo(detailsPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (mapPanelRef.current) {
        tl.fromTo(mapPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (reportBannerRef.current) {
        tl.fromTo(reportBannerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
    });

    return () => ctx.revert();
  }, []);

  // Animate Modal Open
  useEffect(() => {
    if (reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [reportModalOpen]);

  // Unique list of all stations for search
  const allStationsList = useMemo(() => {
    const map = new Map<string, MonorailStation>();
    stations.forEach((s) => {
      if (!map.has(s.name)) {
        map.set(s.name, s);
      }
    });
    return Array.from(map.values());
  }, [stations]);

  // Filtered station list for inputs
  const filteredFromStations = useMemo(() => {
    if (!fromQuery.trim()) return allStationsList;
    const q = normalizeArabic(fromQuery.trim());
    return allStationsList.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [allStationsList, fromQuery]);

  const filteredToStations = useMemo(() => {
    if (!toQuery.trim()) return allStationsList;
    const q = normalizeArabic(toQuery.trim());
    return allStationsList.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [allStationsList, toQuery]);

  const filteredReportStations = useMemo(() => {
    if (!reportStationSearchQuery.trim()) return allStationsList;
    const q = normalizeArabic(reportStationSearchQuery.trim());
    return allStationsList.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [allStationsList, reportStationSearchQuery]);

  // Trip calculation result
  const routeResult = useMemo(() => {
    if (!selectedFrom || !selectedTo || selectedFrom === selectedTo) return null;

    const fromObj = stations.find((s) => s.name === selectedFrom);
    const toObj = stations.find((s) => s.name === selectedTo);

    if (!fromObj || !toObj) return null;

    // Helper for Monorail Fare
    const getFare = (count: number) => {
      if (count <= 5) return { price: 20, discountPrice: 10, zone: "منطقة واحدة (حتى 5 محطات)" };
      if (count <= 10) return { price: 40, discountPrice: 20, zone: "منطقتان (من 6 إلى 10 محطات)" };
      if (count <= 15) return { price: 55, discountPrice: 27.5, zone: "ثلاث مناطق (من 11 إلى 15 محطة)" };
      return { price: 80, discountPrice: 40, zone: "أربع مناطق (أكثر من 15 محطة)" };
    };

    // Case 1: Same Line
    if (fromObj.line_type === toObj.line_type) {
      const lineStations = stations
        .filter((s) => s.line_type === fromObj.line_type)
        .sort((a, b) => a.station_order - b.station_order);

      const fromIndex = lineStations.findIndex((s) => s.name === selectedFrom);
      const toIndex = lineStations.findIndex((s) => s.name === selectedTo);

      if (fromIndex === -1 || toIndex === -1) return null;

      const count = Math.abs(fromObj.station_order - toObj.station_order);
      const min = Math.min(fromIndex, toIndex);
      const max = Math.max(fromIndex, toIndex);
      const path = lineStations.slice(min, max + 1).map((s) => s.name);
      const pathOrdered = fromIndex <= toIndex ? path : [...path].reverse();

      const fare = getFare(count);
      const fromDetails = MONORAIL_STATION_DETAILS[selectedFrom];
      const toDetails = MONORAIL_STATION_DETAILS[selectedTo];
      const time = fromDetails && toDetails ? Math.abs(fromDetails.timeFromStart - toDetails.timeFromStart) : count * 2.5;

      const lineConfig = MONORAIL_LINES_CONFIG.find((l) => l.id === fromObj.line_type);

      return {
        sameLine: true,
        count,
        price: fare.price,
        discountPrice: fare.discountPrice,
        zoneName: fare.zone,
        time: Math.max(2, Math.round(time)),
        stations: pathOrdered,
        lineType: fromObj.line_type,
        lineName: lineConfig?.name || "",
        lineColor: lineConfig?.color || "#3b82f6",
        description: `رحلة مباشرة على ${lineConfig?.name}، تمر عبر ${count} محطات في زمن تقديري حوالي ${Math.max(2, Math.round(time))} دقيقة.`,
      };
    }

    // Case 2: Multi-leg transfer between East and West Lines via Metro Line 3
    const fromConnector = fromObj.line_type === "east" ? "الاستاد" : "وادي النيل";
    const toConnector = toObj.line_type === "east" ? "الاستاد" : "وادي النيل";

    // Leg 1: From Station -> FromConnector
    const lineStationsFrom = stations
      .filter((s) => s.line_type === fromObj.line_type)
      .sort((a, b) => a.station_order - b.station_order);
    const fromIndex = lineStationsFrom.findIndex((s) => s.name === selectedFrom);
    const fromConnIndex = lineStationsFrom.findIndex((s) => s.name === fromConnector);
    const leg1Count = Math.abs(fromIndex - fromConnIndex);
    const min1 = Math.min(fromIndex, fromConnIndex);
    const max1 = Math.max(fromIndex, fromConnIndex);
    const path1 = lineStationsFrom.slice(min1, max1 + 1).map((s) => s.name);
    const path1Ordered = fromIndex <= fromConnIndex ? path1 : [...path1].reverse();
    const leg1Fare = getFare(leg1Count);
    const fromDetails = MONORAIL_STATION_DETAILS[selectedFrom];
    const fromConnDetails = MONORAIL_STATION_DETAILS[fromConnector];
    const leg1Time = fromDetails && fromConnDetails ? Math.abs(fromDetails.timeFromStart - fromConnDetails.timeFromStart) : leg1Count * 2.5;

    // Leg 2: Metro Line 3 Transfer (الاستاد ⇆ وادي النيل)
    const metroPrice = 12;
    const metroTime = 25; // Approx 25 mins

    // Leg 3: ToConnector -> To Station
    const lineStationsTo = stations
      .filter((s) => s.line_type === toObj.line_type)
      .sort((a, b) => a.station_order - b.station_order);
    const toConnIndex = lineStationsTo.findIndex((s) => s.name === toConnector);
    const toIndex = lineStationsTo.findIndex((s) => s.name === selectedTo);
    const leg3Count = Math.abs(toConnIndex - toIndex);
    const min3 = Math.min(toConnIndex, toIndex);
    const max3 = Math.max(toConnIndex, toIndex);
    const path3 = lineStationsTo.slice(min3, max3 + 1).map((s) => s.name);
    const path3Ordered = toConnIndex <= toIndex ? path3 : [...path3].reverse();
    const leg3Fare = getFare(leg3Count);
    const toConnDetails = MONORAIL_STATION_DETAILS[toConnector];
    const toDetails = MONORAIL_STATION_DETAILS[selectedTo];
    const leg3Time = toConnDetails && toDetails ? Math.abs(toConnDetails.timeFromStart - toDetails.timeFromStart) : leg3Count * 2.5;

    const totalStationsCount = leg1Count + leg3Count;
    const totalPrice = leg1Fare.price + metroPrice + leg3Fare.price;
    const totalDiscount = leg1Fare.discountPrice + metroPrice + leg3Fare.discountPrice;
    const totalTime = Math.round(leg1Time + metroTime + leg3Time);

    const fromLineConfig = MONORAIL_LINES_CONFIG.find((l) => l.id === fromObj.line_type);
    const toLineConfig = MONORAIL_LINES_CONFIG.find((l) => l.id === toObj.line_type);

    return {
      sameLine: false,
      count: totalStationsCount,
      price: totalPrice,
      discountPrice: totalDiscount,
      time: totalTime,
      leg1: {
        from: selectedFrom,
        to: fromConnector,
        count: leg1Count,
        price: leg1Fare.price,
        discountPrice: leg1Fare.discountPrice,
        time: Math.round(leg1Time),
        stations: path1Ordered,
        lineType: fromObj.line_type,
        lineName: fromLineConfig?.name || "",
        lineColor: fromLineConfig?.color || "#3b82f6",
      },
      leg2: {
        from: fromConnector,
        to: toConnector,
        price: metroPrice,
        time: metroTime,
        description: `التبديل عبر الخط الثالث لمترو الأنفاق من محطة [${fromConnector}] إلى محطة [${toConnector}].`,
      },
      leg3: {
        from: toConnector,
        to: selectedTo,
        count: leg3Count,
        price: leg3Fare.price,
        discountPrice: leg3Fare.discountPrice,
        time: Math.round(leg3Time),
        stations: path3Ordered,
        lineType: toObj.line_type,
        lineName: toLineConfig?.name || "",
        lineColor: toLineConfig?.color || "#10b981",
      },
      description: `رحلة تبادلية تربط ${fromLineConfig?.shortName} بـ ${toLineConfig?.shortName} عبر الخط الثالث للمترو.`,
    };
  }, [selectedFrom, selectedTo, stations]);

  // Combined path stations for step tracking
  const trackerStationsList = useMemo(() => {
    if (!routeResult) return [];
    if (routeResult.sameLine && routeResult.stations) {
      return routeResult.stations.map((name) => ({
        name,
        lineColor: routeResult.lineColor,
        isTransfer: false,
      }));
    }
    if (!routeResult.sameLine && routeResult.leg1 && routeResult.leg3) {
      const leg1Items = routeResult.leg1.stations.map((name) => ({
        name,
        lineColor: routeResult.leg1.lineColor,
        isTransfer: name === routeResult.leg1.to,
      }));
      const leg3Items = routeResult.leg3.stations.slice(1).map((name) => ({
        name,
        lineColor: routeResult.leg3.lineColor,
        isTransfer: false,
      }));
      return [...leg1Items, ...leg3Items];
    }
    return [];
  }, [routeResult]);

  // Swap Stations
  const swapStations = () => {
    const tempFrom = selectedFrom;
    const tempTo = selectedTo;
    setSelectedFrom(tempTo);
    setSelectedTo(tempFrom);
    setFromQuery(tempTo || "");
    setToQuery(tempFrom || "");
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  // GPS Nearest Station
  const findNearestStation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك");
      return;
    }
    setLocatingNearest(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        let closestStation: string | null = null;
        let minDistance = Infinity;

        for (const [name, coords] of Object.entries(MONORAIL_STATION_COORDINATES)) {
          const dist = getDistanceInKm(userLat, userLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestStation = name;
          }
        }

        if (closestStation) {
          setSelectedFrom(closestStation);
          setFromQuery(closestStation);
          setShowFromList(false);
          setNearestDistance(
            minDistance < 1
              ? `${Math.round(minDistance * 1000)} متر`
              : `${minDistance.toFixed(1)} كم`
          );
        }
        setLocatingNearest(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("تعذر تحديد موقعك الحالي. يرجى التأكد من تشغيل الـ GPS والسماح للخرائط.");
        setLocatingNearest(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Share Route
  const handleShareRoute = async () => {
    if (!routeResult || !selectedFrom || !selectedTo) return;

    const shareText = `🚝 مسار رحلة المونوريل عبر تطبيق ماب القاهرة:
من: ${selectedFrom}
إلى: ${selectedTo}
⏱️ زمن الرحلة التقريبي: ${routeResult.time} دقيقة
💰 سعر التذكرة: ${routeResult.price} ج.م
🚉 عدد المحطات: ${routeResult.count}
${routeResult.description}

تصفح المزيد واحسب رحلتك عبر:
${typeof window !== "undefined" ? window.location.href : "https://cairomap.vercel.app/monorail"}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedRoute(true);
        setTimeout(() => setCopiedRoute(false), 2500);
      } catch {
        // fallback
      }
    }
  };

  // WhatsApp Share URL
  const whatsappShareUrl = useMemo(() => {
    if (!routeResult || !selectedFrom || !selectedTo) return "";
    const text = encodeURIComponent(`🚝 مسار رحلة المونوريل عبر ماب القاهرة:
من: ${selectedFrom}
إلى: ${selectedTo}
⏱️ الزمن: ${routeResult.time} دقيقة
💰 التذكرة: ${routeResult.price} ج.م
${routeResult.description}`);
    return `https://api.whatsapp.com/send?text=${text}`;
  }, [routeResult, selectedFrom, selectedTo]);

  // Report Modal Handlers
  const handleReportImageSelect = (file: File | null) => {
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    if (!file) {
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
    } else if (fromRoute && routeResult && selectedFrom && selectedTo) {
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
        throw new Error("تعذر الاتصال بقاعدة البيانات.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `monorail_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const problemTypeLabels: Record<string, string> = {
        route_error: "خطأ في حساب مسار الرحلة أو زمن الوصول",
        price: "سعر التذكرة غير صحيح أو عدد المحطات غير دقيق",
        transfer: "خطأ في محطة التبديل أو تعليمات التحويل مع المترو/القطار",
        station_info: "اسم المحطة أو المعالم القريبة غير دقيقة",
        construction: "محطة مغلقة أو قيد الإنشاء أو تغيرت حالة تشغيلها",
        app_bug: "مشكلة تقنية أو زر لا يستجيب في الصفحة",
        other: "ملاحظة أو مشكلة أخرى",
      };

      const typeLabel = problemTypeLabels[reportProblemType] || "مشكلة في المونوريل";

      let scopeInfo = "";
      if (reportTargetScope === "route" && selectedFrom && selectedTo) {
        scopeInfo = `📍 المسار المعني: من ${selectedFrom} إلى ${selectedTo}
💰 السعر المحسوب: ${routeResult?.price || "غير محدد"} ج.م
⏱️ الوقت المقدر: ${routeResult?.time || "غير محدد"} دقيقة
🚉 عدد المحطات: ${routeResult?.count || "غير محدد"}`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في خدمة قطار المونوريل:
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle =
        reportTargetScope === "route" && selectedFrom && selectedTo
          ? `مشكلة مسار مونوريل: من ${selectedFrom} إلى ${selectedTo}`
          : reportTargetScope === "station" && reportSelectedStation
            ? `مشكلة محطة مونوريل: ${reportSelectedStation}`
            : `مشكلة في المونوريل (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "مونوريل",
          title: reportTitle,
          content: contentText,
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
            title: "تم استلام بلاغك بنجاح 🚝",
            message: `شكراً لمساعدتنا في تدقيق شبكة المونوريل. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
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
      console.error("Error submitting monorail report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  // Selected Line Object and Station list for explorer
  const selectedLineObj = MONORAIL_LINES_CONFIG.find((l) => l.id === selectedLine) || MONORAIL_LINES_CONFIG[0];
  const currentLineStations = useMemo(() => {
    return stations
      .filter((s) => s.line_type === selectedLine)
      .sort((a, b) => a.station_order - b.station_order);
  }, [stations, selectedLine]);

  const filteredCurrentLineStations = useMemo(() => {
    if (!lineSearchQuery.trim()) return currentLineStations;
    const q = normalizeArabic(lineSearchQuery.trim());
    return currentLineStations.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [currentLineStations, lineSearchQuery]);

  return (
    //================================== START MAIN CONTAINER =================================
    <div className="main-container">
      {/* Header Banner */}
      <div ref={headerRef} className="header-banner">
        <div>
          {/* Title */}
          <h1 className="header-title">قطار المونوريل الكهربائي المعلق</h1>
          {/* Sub Title */}
          <p className="header-sub-title">
            احسب مسار وتكلفة رحلتك في ثوانٍ، تصفح خطوط شرق وغرب النيل، واعرف محطات التبادل والمعالم الحيوية وأحدث حالات التشغيل.
          </p>
        </div>
      </div>

      {/* Container */}
      <div className="container">
        {/* Top Lines Slider */}
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
          {MONORAIL_LINES_CONFIG.map((line) => {
            const active = selectedLine === line.id;
            const lineStatsCount = stations.filter((s) => s.line_type === line.id).length;

            return (
              <button
                key={line.id}
                type="button"
                onClick={() => {
                  setSelectedLine(line.id);
                  if (detailsPanelRef.current) {
                    detailsPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${line.color}98 20%, transparent 65%), var(--bgPrimary)`,
                  border: active ? `2px solid ${line.color}` : "1px solid var(--borderSecondary)",
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
                    {line.shortName}
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
                    {lineStatsCount > 0 ? `${lineStatsCount} محطة (${line.length})` : "تحت الإنشاء"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Trip Route Calculator Panel */}
        <div ref={searchPanelRef} className="details-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <h5 className="text-lg fw-bold" style={{ margin: 0 }}>
              احسب تذكرتك وظبط رحلتك
            </h5>

            <button
              type="button"
              onClick={findNearestStation}
              disabled={locatingNearest}
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "var(--colorSecondary)",
                cursor: locatingNearest ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s ease",
              }}
              title="تحديد أقرب محطة مونوريل لموقعي الحالي عبر الـ GPS"
            >
              <i className={locatingNearest ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-location-crosshairs"}></i>
              {locatingNearest ? "جاري التحديد..." : "أقرب محطة فين"}
            </button>
          </div>

          {/* Search Inputs Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            {/* FROM STATION INPUT */}
            <div style={{ position: "relative", zIndex: showFromList ? 20 : 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0, fontFamily: "var(--font-heading)" }}>
                  <i className="fa-solid fa-circle-dot" style={{ marginLeft: "6px", color: "var(--colorSuccess)" }}></i> من محطة:
                  {nearestDistance && selectedFrom && (
                    <span style={{ fontSize: "0.74rem", color: "var(--colorSuccess)", fontWeight: "700", marginRight: "8px", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "6px" }}>
                      أقرب محطة: {nearestDistance}
                    </span>
                  )}
                </label>
                <VoiceInputButton
                  onTranscript={(text) => {
                    setFromQuery(text);
                    setSelectedFrom(null);
                    setShowFromList(true);
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: الاستاد، المشير طنطاوي، هايبر وان)"
                  value={fromQuery}
                  onChange={(e) => {
                    setFromQuery(e.target.value);
                    setSelectedFrom(null);
                    setShowFromList(true);
                  }}
                  onFocus={() => setShowFromList(true)}
                  onBlur={() => setTimeout(() => setShowFromList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                  }}
                />
                {selectedFrom && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>
                    تم الاختيار ✔
                  </span>
                )}
              </div>
              {showFromList && filteredFromStations.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "var(--radius-card)",
                    overflow: "hidden",
                    zIndex: 100,
                    maxHeight: "220px",
                    overflowY: "auto",
                    marginTop: "4px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                >
                  {filteredFromStations.map((s) => {
                    const details = MONORAIL_STATION_DETAILS[s.name];
                    const q = normalizeArabic(fromQuery.trim());
                    const matchedLandmark = q ? details?.landmarks?.find((l) => normalizeArabic(l).includes(q)) : null;
                    const lineCfg = MONORAIL_LINES_CONFIG.find((l) => l.id === s.line_type);

                    return (
                      <div
                        key={s.name}
                        onMouseDown={() => {
                          setSelectedFrom(s.name);
                          setFromQuery(s.name);
                          setShowFromList(false);
                        }}
                        style={{
                          padding: "10px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          transition: "background 0.2s",
                          fontFamily: "var(--font-sub)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hoverBtn)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s.name}</span>
                          {matchedLandmark && (
                            <span style={{ fontSize: "0.72rem", color: "var(--colorSecondary)", fontWeight: "bold" }}>
                              📍 قريب من: {matchedLandmark}
                            </span>
                          )}
                        </div>
                        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: lineCfg?.color || "#3b82f6",
                              background: (lineCfg?.color || "#3b82f6") + "15",
                              border: `1px solid ${(lineCfg?.color || "#3b82f6")}33`,
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {lineCfg?.shortName}
                          </span>
                          {details?.status === "تحت الإنشاء" && (
                            <span style={{ fontSize: "0.68rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "1px 5px", borderRadius: "4px" }}>
                              قيد الإنشاء
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
              <button
                type="button"
                onClick={swapStations}
                style={{
                  background: "var(--bgSecondary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--textSecondary)",
                  fontSize: "1.15rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "rotate(180deg)";
                  e.currentTarget.style.background = "var(--hoverBtn)";
                  e.currentTarget.style.color = "var(--colorSecondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "rotate(0deg)";
                  e.currentTarget.style.background = "var(--bgSecondary)";
                  e.currentTarget.style.color = "var(--textSecondary)";
                }}
                title="تبديل محطة القيام والوصول"
              >
                ⇅
              </button>
            </div>

            {/* TO STATION INPUT */}
            <div style={{ position: "relative", zIndex: showToList ? 20 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0, fontFamily: "var(--font-heading)" }}>
                  <i className="fa-solid fa-circle-dot" style={{ marginLeft: "6px", color: "#ff0000" }}></i> إلى محطة:
                </label>
                <VoiceInputButton
                  onTranscript={(text) => {
                    setToQuery(text);
                    setSelectedTo(null);
                    setShowToList(true);
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: مدينة الفنون، الجامعة الأمريكية، أكتوبر)"
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value);
                    setSelectedTo(null);
                    setShowToList(true);
                  }}
                  onFocus={() => setShowToList(true)}
                  onBlur={() => setTimeout(() => setShowToList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                  }}
                />
                {selectedTo && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>
                    تم الاختيار ✔
                  </span>
                )}
              </div>
              {showToList && filteredToStations.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "var(--radius-card)",
                    overflow: "hidden",
                    zIndex: 100,
                    maxHeight: "220px",
                    overflowY: "auto",
                    marginTop: "4px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                >
                  {filteredToStations.map((s) => {
                    const details = MONORAIL_STATION_DETAILS[s.name];
                    const q = normalizeArabic(toQuery.trim());
                    const matchedLandmark = q ? details?.landmarks?.find((l) => normalizeArabic(l).includes(q)) : null;
                    const lineCfg = MONORAIL_LINES_CONFIG.find((l) => l.id === s.line_type);

                    return (
                      <div
                        key={s.name}
                        onMouseDown={() => {
                          setSelectedTo(s.name);
                          setToQuery(s.name);
                          setShowToList(false);
                        }}
                        style={{
                          padding: "10px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          transition: "background 0.2s",
                          fontFamily: "var(--font-sub)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hoverBtn)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s.name}</span>
                          {matchedLandmark && (
                            <span style={{ fontSize: "0.72rem", color: "var(--colorSecondary)", fontWeight: "bold" }}>
                              📍 قريب من: {matchedLandmark}
                            </span>
                          )}
                        </div>
                        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: lineCfg?.color || "#3b82f6",
                              background: (lineCfg?.color || "#3b82f6") + "15",
                              border: `1px solid ${(lineCfg?.color || "#3b82f6")}33`,
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {lineCfg?.shortName}
                          </span>
                          {details?.status === "تحت الإنشاء" && (
                            <span style={{ fontSize: "0.68rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "1px 5px", borderRadius: "4px" }}>
                              قيد الإنشاء
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action / Search Button */}
          <button
            type="button"
            onClick={() => {
              if (selectedFrom && selectedTo) {
                setIsTripActive(false);
                setCurrentStepIndex(0);
              }
            }}
            disabled={!selectedFrom || !selectedTo || selectedFrom === selectedTo}
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: "4px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: !selectedFrom || !selectedTo || selectedFrom === selectedTo ? "not-allowed" : "pointer",
              opacity: !selectedFrom || !selectedTo || selectedFrom === selectedTo ? 0.6 : 1,
            }}
          >
            <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "6px" }}></i>
            اعرض مسار وتفاصيل الرحلة
          </button>

          {/* TRIP RESULTS */}
          {routeResult && (
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Results Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {/* Number of Stations */}
                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--colorSecondary)" }}>{routeResult.count}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>عدد المحطات</div>
                </div>
                {/* Price */}
                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--colorSuccess)" }}>{routeResult.price} ج.م</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>سعر التذكرة</div>
                </div>
                {/* Estimated Time */}
                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--colorSecondary)" }}>{routeResult.time} د</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>زمن الرحلة</div>
                </div>
                {/* Multi-leg / Transfer Status */}
                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: !routeResult.sameLine ? "var(--colorWarning, #f59e0b)" : "var(--colorSuccess)" }}>
                    {!routeResult.sameLine ? "تبديل (مترو L3)" : "مباشر"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>نوع المسار</div>
                </div>
              </div>

              {/* Informative Guidance Box */}
              {!isTripActive && (
                <div
                  style={{
                    background: "var(--bgGlass)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "var(--ra-8)",
                    padding: "14px 16px",
                  }}
                >
                  <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.88rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                    <i className="bx bxs-info-circle" style={{ marginLeft: "6px", color: "var(--colorSecondary)", fontSize: "1.1rem", verticalAlign: "middle" }}></i>
                    {routeResult.description}
                  </p>
                  {routeResult.discountPrice && (
                    <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "var(--textMuted)" }}>
                      💡 تخفيض كبار السن وذوي الهمم: <strong>{routeResult.discountPrice} ج.م</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Actions Grid: Start Trip + Share Route */}
              {!isTripActive && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {/* Start Trip Button */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsTripActive(true);
                      setCurrentStepIndex(0);
                    }}
                    style={{
                      flex: "1 1 140px",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="fa-solid fa-play"></i>
                    بدء تتبع الرحلة
                  </button>

                  {/* Share Route Button */}
                  <button
                    type="button"
                    className="btn"
                    onClick={handleShareRoute}
                    style={{
                      flex: "1 1 140px",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "var(--bgSecondary)",
                      border: "1px solid var(--borderGlass)",
                      color: "var(--textPrimary)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className={copiedRoute ? "fa-solid fa-check" : "fa-solid fa-share-nodes"}></i>
                    {copiedRoute ? "تم النسخ بنجاح ✔" : "مشاركة التفاصيل"}
                  </button>

                  {/* WhatsApp Share Button */}
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    className="btn"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "rgba(0, 119, 44, 1)",
                      border: "1px solid rgba(37, 211, 102, 0.3)",
                      color: "#ffffffff",
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }}></i>
                    شارك مباشرا علي الواتساب
                  </a>
                </div>
              )}

              {/* Active Trip Tracker */}
              {isTripActive && trackerStationsList.length > 0 && (
                <div
                  style={{
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "var(--ra-8)",
                    padding: "16px",
                  }}
                >
                  {/* Active Trip Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--colorSecondary)", background: "rgba(59, 130, 246, 0.12)", padding: "4px 10px", borderRadius: "8px" }}>
                      رحلة نشطة حالياً
                    </span>
                    <button
                      onClick={() => {
                        setIsTripActive(false);
                        setCurrentStepIndex(0);
                      }}
                      style={{
                        border: "none",
                        color: "var(--accent-red, #ef4444)",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: "rgba(246, 59, 59, 0.12)",
                        padding: "4px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="fa-solid fa-trash" style={{ marginLeft: "6px" }}></i>
                      إنهاء التتبع
                    </button>
                  </div>

                  {/* Current Station Info */}
                  <div style={{ fontSize: "0.92rem", fontWeight: "600", marginBottom: "6px", color: "var(--textSecondary)" }}>
                    أنت الآن في محطة:{" "}
                    <strong style={{ color: "var(--textPrimary)", fontSize: "1.05rem" }}>
                      {trackerStationsList[currentStepIndex]?.name}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--textMuted)", marginRight: "8px" }}>
                      ({currentStepIndex + 1} من {trackerStationsList.length})
                    </span>
                  </div>

                  {/* Remaining Stations Counter */}
                  {(() => {
                    const remainingCount = trackerStationsList.length - 1 - currentStepIndex;
                    const remainingMins = Math.max(0, remainingCount * 2.5);
                    return (
                      <div style={{ fontSize: "0.82rem", color: "var(--textMuted)", marginBottom: "12px" }}>
                        متبقي {remainingCount} محطة للوصول إلى الوجهة (~{Math.round(remainingMins)} دقيقة)
                      </div>
                    );
                  })()}

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: "6px",
                      background: "var(--borderGlass)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "var(--colorSecondary)",
                        width: `${((currentStepIndex + 1) / trackerStationsList.length) * 100}%`,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  {/* Station Progress Controller */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "var(--ra-8)",
                        border: "1px solid var(--borderGlass)",
                        background: "var(--bgPrimary)",
                        color: "var(--textPrimary)",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: currentStepIndex === 0 ? "not-allowed" : "pointer",
                        opacity: currentStepIndex === 0 ? 0.5 : 1,
                      }}
                    >
                      <i className="fa-solid fa-chevron-right" style={{ marginLeft: "4px" }}></i> المحطة السابقة
                    </button>

                    <button
                      type="button"
                      disabled={currentStepIndex >= trackerStationsList.length - 1}
                      onClick={() => setCurrentStepIndex((prev) => Math.min(trackerStationsList.length - 1, prev + 1))}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        cursor: currentStepIndex >= trackerStationsList.length - 1 ? "not-allowed" : "pointer",
                        opacity: currentStepIndex >= trackerStationsList.length - 1 ? 0.5 : 1,
                      }}
                    >
                      وصلت المحطة التالية <i className="fa-solid fa-chevron-left" style={{ marginRight: "4px" }}></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed Path Timeline for Route */}
              <div
                style={{
                  background: "var(--bgSecondary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "var(--ra-8)",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "0.92rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "12px" }}>
                  تفاصيل ومسار محطات الرحلة ({routeResult.count} محطة):
                </div>

                {/* Single Line Path */}
                {routeResult.sameLine && routeResult.stations && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {routeResult.stations.map((stName, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === routeResult.stations.length - 1;
                      const stDetails = MONORAIL_STATION_DETAILS[stName];

                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: isFirst || isLast ? "12px" : "8px",
                              height: isFirst || isLast ? "12px" : "8px",
                              borderRadius: "50%",
                              background: isFirst ? "var(--colorSuccess)" : isLast ? "var(--accent-red, #ef4444)" : routeResult.lineColor,
                              border: isFirst || isLast ? "2px solid var(--bgPrimary)" : "none",
                              boxShadow: isFirst || isLast ? `0 0 0 2px ${routeResult.lineColor}` : "none",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "0.85rem", fontWeight: isFirst || isLast ? "700" : "500", color: "var(--textPrimary)" }}>
                            {stName}
                            {isFirst && <span style={{ fontSize: "0.72rem", color: "var(--textMuted)", marginRight: "6px" }}>(محطة الركوب)</span>}
                            {isLast && <span style={{ fontSize: "0.72rem", color: "var(--textMuted)", marginRight: "6px" }}>(محطة الوصول)</span>}
                          </span>
                          {stDetails?.status === "تحت الإنشاء" && (
                            <span style={{ fontSize: "0.68rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "1px 5px", borderRadius: "4px", marginRight: "auto" }}>
                              تحت الإنشاء 🚧
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Multi-Leg Path */}
                {!routeResult.sameLine && routeResult.leg1 && routeResult.leg3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Leg 1 */}
                    <div style={{ borderRight: `3px solid ${routeResult.leg1.lineColor}`, paddingRight: "10px" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: routeResult.leg1.lineColor, marginBottom: "6px" }}>
                        المرحلة الأولى: {routeResult.leg1.lineName} ({routeResult.leg1.count} محطات - {routeResult.leg1.price} ج.م)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>
                        من <strong>{routeResult.leg1.from}</strong> إلى محطة التحويل <strong>{routeResult.leg1.to}</strong>
                      </div>
                    </div>

                    {/* Leg 2 - Metro Transfer */}
                    <div style={{ borderRight: "3px dashed var(--colorWarning, #f59e0b)", paddingRight: "10px", background: "rgba(245, 158, 11, 0.05)", padding: "8px 10px", borderRadius: "6px" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--colorWarning, #f59e0b)", marginBottom: "4px" }}>
                        المرحلة الثانية: التحويل عبر الخط الثالث لمترو الأنفاق (~25 دقيقة - 12 ج.م)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>
                        {routeResult.leg2.description}
                      </div>
                    </div>

                    {/* Leg 3 */}
                    <div style={{ borderRight: `3px solid ${routeResult.leg3.lineColor}`, paddingRight: "10px" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: routeResult.leg3.lineColor, marginBottom: "6px" }}>
                        المرحلة الثالثة: {routeResult.leg3.lineName} ({routeResult.leg3.count} محطات - {routeResult.leg3.price} ج.م)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>
                        من محطة التحويل <strong>{routeResult.leg3.from}</strong> إلى الوجهة النهائية <strong>{routeResult.leg3.to}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Route Issue Button */}
                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--borderGlass)", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-reportProblem"
                    onClick={() => handleOpenReportModal(null, true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.76rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    الإبلاغ عن خطأ في حساب هذا المسار
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Line Explorer & Timeline Panel */}
        <div ref={detailsPanelRef} className="details-panel">
          {/* Header of explorer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: `${selectedLineObj.color}18`,
                  border: `1px solid ${selectedLineObj.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: selectedLineObj.color,
                  fontSize: "1.1rem",
                }}
              >
                <i className={selectedLineObj.icon} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
                  {selectedLineObj.name}
                </h2>
                <span style={{ fontSize: "0.75rem", color: "var(--textMuted)" }}>
                  {currentLineStations.length} محطة — الطول: {selectedLineObj.length} — زمن الرحلة: {selectedLineObj.time}
                </span>
              </div>
            </div>

            {/* Line Switch Tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              {MONORAIL_LINES_CONFIG.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => setSelectedLine(line.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background: selectedLine === line.id ? line.color : "var(--bgSecondary)",
                    color: selectedLine === line.id ? "#ffffff" : "var(--textSecondary)",
                    border: selectedLine === line.id ? `1px solid ${line.color}` : "1px solid var(--borderGlass)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {line.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Line Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--textSecondary)", fontWeight: "600" }}>بداية الخط</div>
              <div style={{ fontSize: "0.92rem", fontWeight: "800", color: selectedLineObj.color, marginTop: "2px" }}>{selectedLineObj.from}</div>
            </div>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--textSecondary)", fontWeight: "600" }}>نهاية الخط</div>
              <div style={{ fontSize: "0.92rem", fontWeight: "800", color: selectedLineObj.color, marginTop: "2px" }}>{selectedLineObj.to}</div>
            </div>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--textSecondary)", fontWeight: "600" }}>طول المسار</div>
              <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--textPrimary)", marginTop: "2px" }}>{selectedLineObj.length}</div>
            </div>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--textSecondary)", fontWeight: "600" }}>زمن المسار كاملاً</div>
              <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--textPrimary)", marginTop: "2px" }}>{selectedLineObj.time}</div>
            </div>
          </div>

          {/* Search inside line stations */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              className="input-fields"
              placeholder={`ابحث في محطات ${selectedLineObj.shortName}...`}
              value={lineSearchQuery}
              onChange={(e) => setLineSearchQuery(e.target.value)}
              style={{ width: "100%", direction: "rtl", fontSize: "0.85rem" }}
            />
            {lineSearchQuery && (
              <button
                type="button"
                onClick={() => setLineSearchQuery("")}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--textMuted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Stations Timeline */}
          <div style={{ background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", borderRadius: "var(--radius-card)", padding: "18px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredCurrentLineStations.length > 0 ? (
                filteredCurrentLineStations.map((stationObj, idx) => {
                  const station = stationObj.name;
                  const isFirst = idx === 0 && !lineSearchQuery;
                  const isLast = idx === filteredCurrentLineStations.length - 1 && !lineSearchQuery;
                  const details = MONORAIL_STATION_DETAILS[station];
                  const landmarks = details?.landmarks || [];
                  const isUnderConstruction = details?.status === "تحت الإنشاء";
                  const isTransfer = details?.type?.includes("تبادلية");

                  return (
                    <div key={idx} id={`station-${station}`} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "34px" }}>
                        {/* Timeline Dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                          <div
                            style={{
                              width: isTransfer || isFirst || isLast ? "12px" : "8px",
                              height: isTransfer || isFirst || isLast ? "12px" : "8px",
                              borderRadius: "50%",
                              backgroundColor: isUnderConstruction ? "transparent" : isTransfer ? "var(--colorWarning, #f59e0b)" : selectedLineObj.color,
                              border: isUnderConstruction ? "2px dashed var(--colorDanger)" : isFirst || isLast ? "2px solid var(--bgPrimary)" : "none",
                              boxShadow: isUnderConstruction ? "none" : isFirst || isLast ? `0 0 0 2px ${selectedLineObj.color}` : "none",
                            }}
                          />
                        </div>

                        {/* Station Name and Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexGrow: 1, flexWrap: "wrap" }}>
                          <span
                            onClick={() => setExpandedStation(expandedStation === station ? null : station)}
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: isFirst || isLast || isTransfer ? "700" : "500",
                              color: isUnderConstruction ? "#ef4444" : "var(--textPrimary)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              cursor: "pointer",
                            }}
                          >
                            {station}
                            <i
                              className={`bx ${expandedStation === station ? "bx-chevron-up" : "bx-chevron-down"}`}
                              style={{
                                fontSize: "0.95rem",
                                color: expandedStation === station ? "var(--colorSecondary)" : "var(--textMuted)",
                                transition: "all 0.2s ease",
                              }}
                            />
                            {isUnderConstruction && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  background: "rgba(239, 68, 68, 0.12)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.25)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "bold",
                                }}
                              >
                                تحت الإنشاء 🚧
                              </span>
                            )}
                            {details?.status === "تشغيل تجريبي" && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  background: "rgba(59, 130, 246, 0.12)",
                                  color: "var(--colorSecondary)",
                                  border: "1px solid rgba(59, 130, 246, 0.25)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "bold",
                                }}
                              >
                                تشغيل تجريبي ⚡
                              </span>
                            )}
                            {isFirst && <span style={{ fontSize: "0.72rem", color: "var(--textMuted)", marginRight: "6px" }}>(بدايــة الخط)</span>}
                            {isLast && <span style={{ fontSize: "0.72rem", color: "var(--textMuted)", marginRight: "6px" }}>(نهـاية الخط)</span>}
                          </span>

                          {/* Transfer badge */}
                          {isTransfer && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                color: "var(--colorWarning, #f59e0b)",
                                background: "rgba(245, 158, 11, 0.1)",
                                border: "1px solid rgba(245, 158, 11, 0.25)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                marginRight: "auto",
                              }}
                            >
                              {details.type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded Landmarks / Status details */}
                      {expandedStation === station && (
                        <div
                          style={{
                            margin: "4px 16px 12px 28px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "var(--bgSecondary)",
                            border: isUnderConstruction ? "1px dashed rgba(239, 68, 68, 0.3)" : "1px solid var(--borderGlass)",
                          }}
                        >
                          {isUnderConstruction && (
                            <div style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                              <span>⚠️ هذه المحطة قيد الإنشاء والتشطيب وليست في الخدمة للجمهور حالياً.</span>
                            </div>
                          )}
                          <div style={{ fontSize: "0.75rem", color: "var(--textPrimary)", marginBottom: "6px", fontWeight: "bold" }}>
                            المعالم والأماكن الحيوية القريبة من المحطة:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {landmarks.length > 0 ? (
                              landmarks.map((landmark: string, lIdx: number) => (
                                <span
                                  key={lIdx}
                                  style={{
                                    fontSize: "0.72rem",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "var(--textPrimary)",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--borderGlass)",
                                  }}
                                >
                                  {landmark}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: "0.72rem", color: "var(--textMuted)", fontStyle: "italic" }}>
                                لم يتم تسجيل معالم قريبة لهذه المحطة بعد.
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--borderGlass)", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="btn btn-reportProblem"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReportModal(station);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.74rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.75rem" }}></i>
                              الإبلاغ عن خطأ في محطة {station}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Connective Line */}
                      {!isLast && (
                        <div style={{ display: "flex", gap: "12px", minHeight: "14px" }}>
                          <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                            <div
                              style={{
                                width: "2px",
                                backgroundColor: selectedLineObj.color,
                                minHeight: "14px",
                                opacity: 0.4,
                              }}
                            />
                          </div>
                          <div style={{ flexGrow: 1 }} />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "var(--textSecondary)", fontSize: "0.88rem", textAlign: "center", padding: "12px" }}>
                  لا توجد محطات مطابقة لبحثك في هذا الخط.
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div
            style={{
              marginTop: "12px",
              background: "var(--bgGlass)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-card)",
              padding: "16px",
            }}
          >
            <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.88rem" }}>
              <i className="bx bxs-info-circle" style={{ marginLeft: "6px", color: selectedLineObj.color, fontSize: "1.1rem", verticalAlign: "middle" }}></i>
              <strong>معلومات الخط: </strong>
              <span style={{ color: "var(--textMuted)" }}>{selectedLineObj.desc}</span>
            </p>
          </div>
        </div>

        {/* Project Overview Panel */}
        <div ref={mapPanelRef} className="details-panel">
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "800",
              color: "var(--textPrimary)",
              margin: "0 0 8px",
            }}
          >
            عن مشروع مونوريل القاهرة الكبرى
          </h2>
          <p style={{ color: "var(--textSecondary)", fontSize: "0.85rem", lineHeight: "1.7", margin: "0 0 14px" }}>
            يعد مونوريل القاهرة أطول شبكة مونوريل بدون سائق في العالم بطول إجمالي يقارب 100 كم لخطيه (شرق وغرب النيل)، حيث ينقل ما يقارب 500 ألف راكب يومياً بوسيلة مواصلات حضارية صديقة للبيئة تعمل بقطارات Alstom Innovia 300 فائقة التطور.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "12px" }}>
              <div style={{ fontWeight: "700", color: "var(--colorSecondary)", fontSize: "0.88rem", marginBottom: "4px" }}>
                ⚡ سرعة تشغيلية عالية
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--textMuted)", lineHeight: "1.6" }}>
                سرعة تصميمية تصل إلى 80 كم/ساعة، مما يختصر زمن الرحلة بين نصر والعاصمة إلى نحو 60 دقيقة فقط.
              </div>
            </div>

            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "var(--ra-8)", padding: "12px" }}>
              <div style={{ fontWeight: "700", color: "var(--colorSuccess)", fontSize: "0.88rem", marginBottom: "4px" }}>
                🔄 تكامل ذكي مع المترو والـ LRT
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--textMuted)", lineHeight: "1.6" }}>
                محطات تبادلية كبرى في الاستاد ووادي النيل مع الخط الثالث، ومدينة الفنون مع القطار الخفيف LRT.
              </div>
            </div>
          </div>
        </div>

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
                الإبلاغ عن مشكلة فى بيانات المونوريل
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
              هل لاحظت أي خطأ في مسارات المونوريل، أسعار التذاكر، أو محطات التبديل؟ شاركنا ملاحظتك لمساعدتنا في تدقيق وتحديث الشبكة.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-reportProblem"
            onClick={() => handleOpenReportModal()}
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
            <span>تقديم بلاغ عن خطأ</span>
          </button>
        </div>
      </div>

      {/* Report Problem Modal */}
      {reportModalOpen && (
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
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
                <span>مشكلة في بيانات قطار المونوريل</span>
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
                  <h4 style={{ margin: "0 0 8px", fontWeight: "800", color: "var(--textPrimary)" }}>تم إرسال بلاغك بنجاح!</h4>
                  <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.88rem", lineHeight: "1.6" }}>
                    شكراً جزيلاً لمساعدتك في تدقيق وتطوير شبكة المونوريل. سيقوم فريقنا بمراجعة ملاحظاتك في أقرب وقت.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                      <span>يرجى تسجيل الدخول بحسابك أولاً لتتمكن من إرسال البلاغ.</span>
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
                      <span>لقد بلغت الحد الأقصى للبلاغات اليومية (3 بلاغات). يرجى المحاولة غداً.</span>
                    </div>
                  )}

                  {/* Error Alert */}
                  {reportError && (
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
                      {reportError}
                    </div>
                  )}

                  {/* Scope Selector */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px", display: "block" }}>
                      نطاق المشكلة:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("general");
                          setReportSelectedStation("");
                        }}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: reportTargetScope === "general" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                          color: reportTargetScope === "general" ? "#ffffff" : "var(--textSecondary)",
                          border: reportTargetScope === "general" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                        }}
                      >
                        مشكلة عامة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("station");
                        }}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: reportTargetScope === "station" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                          color: reportTargetScope === "station" ? "#ffffff" : "var(--textSecondary)",
                          border: reportTargetScope === "station" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                        }}
                      >
                        محطة معينة
                      </button>
                      <button
                        type="button"
                        disabled={!routeResult}
                        onClick={() => {
                          setReportTargetScope("route");
                        }}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: !routeResult ? "not-allowed" : "pointer",
                          opacity: !routeResult ? 0.5 : 1,
                          background: reportTargetScope === "route" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                          color: reportTargetScope === "route" ? "#ffffff" : "var(--textSecondary)",
                          border: reportTargetScope === "route" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                        }}
                      >
                        المسار الحالي
                      </button>
                    </div>
                  </div>

                  {/* Station Picker if Scope is Station */}
                  {reportTargetScope === "station" && (
                    <div style={{ position: "relative" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px", display: "block" }}>
                        اختر المحطة المعنية:
                      </label>
                      <input
                        className="input-fields"
                        placeholder="ابحث باسم المحطة..."
                        value={reportStationSearchQuery}
                        onChange={(e) => {
                          setReportStationSearchQuery(e.target.value);
                          setReportSelectedStation("");
                          setShowReportStationList(true);
                        }}
                        onFocus={() => setShowReportStationList(true)}
                        style={{ width: "100%", direction: "rtl", fontSize: "0.85rem" }}
                      />
                      {reportSelectedStation && (
                        <span style={{ position: "absolute", left: "10px", top: "34px", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>
                          تم التحديد ✔
                        </span>
                      )}
                      {showReportStationList && filteredReportStations.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "var(--bgSecondary)",
                            border: "1px solid var(--borderGlass)",
                            borderRadius: "var(--radius-card)",
                            overflow: "hidden",
                            zIndex: 100,
                            maxHeight: "160px",
                            overflowY: "auto",
                            marginTop: "4px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                          }}
                        >
                          {filteredReportStations.map((s) => (
                            <div
                              key={s.name}
                              onMouseDown={() => {
                                setReportSelectedStation(s.name);
                                setReportStationSearchQuery(s.name);
                                setShowReportStationList(false);
                              }}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                color: "var(--textPrimary)",
                                borderBottom: "1px solid rgba(255,255,255,0.03)",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hoverBtn)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              {s.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Problem Type Select */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px", display: "block" }}>
                      نوع المشكلة:
                    </label>
                    <select
                      className="input-fields"
                      value={reportProblemType}
                      onChange={(e) => setReportProblemType(e.target.value)}
                      style={{ width: "100%", direction: "rtl", fontSize: "0.85rem" }}
                    >
                      <option value="route_error">خطأ في حساب مسار الرحلة أو زمن الوصول</option>
                      <option value="price">سعر التذكرة غير صحيح أو عدد المحطات غير دقيق</option>
                      <option value="transfer">خطأ في محطة التبديل أو تعليمات التحويل مع المترو/القطار</option>
                      <option value="station_info">اسم المحطة أو المعالم القريبة غير دقيقة</option>
                      <option value="construction">محطة مغلقة أو قيد الإنشاء أو تغيرت حالة تشغيلها</option>
                      <option value="app_bug">مشكلة تقنية أو زر لا يستجيب في الصفحة</option>
                      <option value="other">ملاحظة أو مشكلة أخرى</option>
                    </select>
                  </div>

                  {/* Details Textarea */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px", display: "block" }}>
                      تفاصيل البلاغ:
                    </label>
                    <textarea
                      className="input-fields"
                      rows={3}
                      placeholder="اشرح المشكلة بالتفصيل لمساعدتنا في إصلاحها..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      style={{ width: "100%", direction: "rtl", fontSize: "0.85rem", resize: "vertical" }}
                      required
                    />
                  </div>

                  {/* Image Attachment Dropzone */}
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px", display: "block" }}>
                      إرفاق صورة توضيحية (اختياري):
                    </label>
                    {reportImagePreview ? (
                      <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--borderGlass)" }}>
                        <img src={reportImagePreview} alt="Preview" style={{ width: "100%", maxHeight: "140px", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => handleReportImageSelect(null)}
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            background: "rgba(239, 68, 68, 0.8)",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
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
                          if (e.dataTransfer.files?.[0]) {
                            handleReportImageSelect(e.dataTransfer.files[0]);
                          }
                        }}
                        style={{
                          border: isDraggingImage ? "2px dashed var(--colorSecondary)" : "2px dashed var(--borderGlass)",
                          borderRadius: "8px",
                          padding: "16px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: isDraggingImage ? "rgba(59, 130, 246, 0.05)" : "transparent",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                          const input = document.getElementById("monorail-report-img-input");
                          if (input) input.click();
                        }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "1.4rem", color: "var(--textMuted)", marginBottom: "4px" }}></i>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>اسحب الصورة هنا أو اضغط للاختيار من جهازك</div>
                        <div style={{ fontSize: "0.68rem", color: "var(--textMuted)", marginTop: "2px" }}>PNG, JPG, WEBP بحد أقصى 5 ميجابايت</div>
                        <input
                          id="monorail-report-img-input"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleReportImageSelect(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Form Action Buttons */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setReportModalOpen(false);
                        handleReportImageSelect(null);
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
                      disabled={reportLoading || !user || limitReached}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        cursor: reportLoading || !user || limitReached ? "not-allowed" : "pointer",
                        opacity: reportLoading || !user || limitReached ? 0.6 : 1,
                      }}
                    >
                      {reportLoading ? (
                        <span>
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: "6px" }}></i>
                          {reportUploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}
                        </span>
                      ) : (
                        <span>
                          <i className="fa-solid fa-paper-plane" style={{ marginLeft: "6px" }}></i>
                          إرسال البلاغ
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
