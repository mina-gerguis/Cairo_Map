"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

const DEFAULT_MONORAIL: any[] = [
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
  { name: "أكتوبر الجديدة", line_type: "west", station_order: 1 },
  { name: "المنطقة الصناعية", line_type: "west", station_order: 2 },
  { name: "السادات", line_type: "west", station_order: 3 },
  { name: "جهاز مدينة 6 أكتوبر", line_type: "west", station_order: 4 },
  { name: "جمعية المهندسين", line_type: "west", station_order: 5 },
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
  { name: "وادي النيل", line_type: "west", station_order: 16 }
];

export const STATION_DETAILS: Record<string, { landmarks: string[]; type: string; timeFromStart: number; status: "تشغيل تجريبي" | "تحت الإنشاء" }> = {
  // East Line
  "الاستاد": { landmarks: ["ستاد القاهرة الدولي", "مسجد آل رشدان", "نادي الزهور الرياضي"], type: "تبادلية مع الخط الثالث للمترو", timeFromStart: 0, status: "تشغيل تجريبي" },
  "هشام بركات": { landmarks: ["شارع الطيران", "سوق السيارات الجديد", "محور شينزو آبي"], type: "تبادلية مع الأتوبيس الترددي BRT", timeFromStart: 4, status: "تشغيل تجريبي" },
  "نوري خطاب": { landmarks: ["حي الواحة بمدينة نصر", "عمارات الفتح", "محور المشير طنطاوي"], type: "عادية", timeFromStart: 8, status: "تشغيل تجريبي" },
  "الحي السابع": { landmarks: ["المنطقة الحرة بمدينة نصر", "عمارات عثمان", "شارع مصطفى النحاس"], type: "عادية", timeFromStart: 11, status: "تشغيل تجريبي" },
  "ذاكر حسين": { landmarks: ["شارع ذاكر حسين الرئيسي", "سوق السيارات القديم", "طريق الوفاء والأمل"], type: "عادية", timeFromStart: 15, status: "تشغيل تجريبي" },
  "المنطقة الحرة": { landmarks: ["المنطقة الاستثمارية الحرة بمصر الجديدة", "محور المشير طنطاوي"], type: "عادية", timeFromStart: 18, status: "تشغيل تجريبي" },
  "المشير طنطاوي": { landmarks: ["مركز مصر للمعارض الدولية (EIEC)", "مسجد المشير طنطاوي", "استاد الدفاع الجوي"], type: "تبادلية مع الأتوبيس الترددي BRT", timeFromStart: 22, status: "تشغيل تجريبي" },
  "وان قطامية": { landmarks: ["الطريق الدائري بمحيط المعادي", "مجمع وان قطامية الإداري", "توكيل مرسيدس"], type: "عادية", timeFromStart: 27, status: "تشغيل تجريبي" },
  "المستثمرين": { landmarks: ["منطقة المستثمرين الشمالية بالتجمع", "شارع التسعين الشمالي"], type: "عادية", timeFromStart: 32, status: "تحت الإنشاء" },
  "النسيم": { landmarks: ["محيط كمبوند ديار والتسعين الجنوبي", "المنطقة التجارية بالتجمع الخامس"], type: "عادية", timeFromStart: 36, status: "تحت الإنشاء" },
  "الجامعة الأمريكية": { landmarks: ["حرم الجامعة الأمريكية الجديد بالتجمع", "بوينت 90 مول", "شارع التسعين الجنوبي"], type: "تبادلية", timeFromStart: 40, status: "تحت الإنشاء" },
  "إعمار": { landmarks: ["كمبوند إعمار ميفيدا", "كمبوند هايد بارك التجمع", "شارع التسعين الجنوبي"], type: "عادية", timeFromStart: 44, status: "تحت الإنشاء" },
  "ميدان النافورة": { landmarks: ["ميدان النافورة الشهير بالتجمع", "منطقة البنوك والأعمال بالمستثمرين"], type: "عادية", timeFromStart: 48, status: "تحت الإنشاء" },
  "البروة": { landmarks: ["محور محمد بن زايد الشمالي", "النادي الأهلي بالتجمع الخامس"], type: "عادية", timeFromStart: 52, status: "تحت الإنشاء" },
  "بيت الوطن": { landmarks: ["مدخل منطقة بيت الوطن بالتجمع", "طريق السويس الصحراوي"], type: "عادية", timeFromStart: 56, status: "تحت الإنشاء" },
  "مسجد الفتاح العليم": { landmarks: ["مسجد الفتاح العليم الشهير", "مدخل العاصمة الإدارية الجديد من طريق السويس"], type: "عادية", timeFromStart: 60, status: "تحت الإنشاء" },
  "الحي السكني R2": { landmarks: ["الحي السكني الثاني R2 بالعاصمة", "المدينة الرياضية بالعاصمة الإدارية"], type: "عادية", timeFromStart: 65, status: "تحت الإنشاء" },
  "الدائري الإقليمي": { landmarks: ["الطريق الدائري الإقليمي بمحيط العاصمة", "بوابات العاصمة الإدارية الرئيسية"], type: "عادية", timeFromStart: 69, status: "تحت الإنشاء" },
  "فندق الماسة": { landmarks: ["فندق الماسة كابيتال الشهير", "منطقة السي آي دي (حي المال والأعمال)"], type: "عادية", timeFromStart: 73, status: "تحت الإنشاء" },
  "الحي الحكومي": { landmarks: ["مجلس النواب ومجلس الوزراء بالعاصمة", "الحي الوزاري", "ساحة الشعب"], type: "عادية", timeFromStart: 77, status: "تحت الإنشاء" },
  "حي السفارات": { landmarks: ["حي السفارات والبعثات الدبلوماسية", "الكاتدرائية الكبرى بالعاصمة"], type: "عادية", timeFromStart: 80, status: "تحت الإنشاء" },
  "مدينة الفنون والثقافة": { landmarks: ["مدينة الفنون والثقافة بالعاصمة", "محطة القطار الكهربائي LRT", "النهر الأخضر الكبير"], type: "تبادلية مع القطار الكهربائي الخفيف LRT", timeFromStart: 84, status: "تشغيل تجريبي" },

  // West Line
  "أكتوبر الجديدة": { landmarks: ["منطقة حدائق أكتوبر الجديدة", "أحياء أكتوبر السكنية الغربية", "المنطقة الصناعية"], type: "نهائية", timeFromStart: 0, status: "تحت الإنشاء" },
  "المنطقة الصناعية": { landmarks: ["المنطقة الصناعية الكبرى بالسادس من أكتوبر", "مجمع المصانع والمعارض"], type: "عادية", timeFromStart: 5, status: "تحت الإنشاء" },
  "السادات": { landmarks: ["محور السادات الرئيسي بأكتوبر", "محيط الأحياء السكنية (الثاني والثالث)"], type: "عادية", timeFromStart: 10, status: "تحت الإنشاء" },
  "جهاز مدينة 6 أكتوبر": { landmarks: ["مقر جهاز مدينة 6 أكتوبر", "أكتوبر سيتي سنتر", "شارع المحور المركزي"], type: "عادية", timeFromStart: 14, status: "تحت الإنشاء" },
  "نقابة المهندسين": { landmarks: ["كمبوند جمعية المهندسين بأكتوبر", "محور جمال عبد الناصر الرئيسي"], type: "تبادلية مع القطار الكهربائي السريع (HSR)", timeFromStart: 18, status: "تحت الإنشاء" },
  "جامعة النيل": { landmarks: ["جامعة النيل الأهلية", "مول العرب الشهير", "ميدان جهينة محور 26 يوليو"], type: "عادية", timeFromStart: 22, status: "تحت الإنشاء" },
  "هايبر وان": { landmarks: ["هايبر وان الشيخ زايد", "المدخل الرئيسي للشيخ زايد", "جامعة القاهرة فرع زايد"], type: "عادية", timeFromStart: 26, status: "تحت الإنشاء" },
  "الصحراوي": { landmarks: ["طريق مصر إسكندرية الصحراوي", "القرية الذكية بالتجمع الغربي", "داندي مول"], type: "عادية", timeFromStart: 30, status: "تحت الإنشاء" },
  "المنصورية": { landmarks: ["طريق المنصورية الريفي والسياحي", "منطقة أبو رواش الأثرية"], type: "عادية", timeFromStart: 35, status: "تحت الإنشاء" },
  "المريوطية": { landmarks: ["ترعة المريوطية السياحية", "منطقة الهرم السياحية", "فنادق المريوطية"], type: "عادية", timeFromStart: 39, status: "تحت الإنشاء" },
  "الطريق الدائري": { landmarks: ["الطريق الدائري الغربي حول الجيزة", "منطقة المنيب والمريوطية"], type: "تبادلية مع الأتوبيس الترددي BRT", timeFromStart: 43, status: "تحت الإنشاء" },
  "العريش": { landmarks: ["شارع الهرم الرئيسي (تقاطع العريش)", "سينما رادوبيس والمنطقة التجارية"], type: "عادية", timeFromStart: 47, status: "تحت الإنشاء" },
  "المطبغة": { landmarks: ["شارع الملك فيصل الرئيسي (منطقة المطبغة)", "حي بولاق الدكرور الجنوبي"], type: "عادية", timeFromStart: 51, status: "تحت الإنشاء" },
  "بولاق الدكرور": { landmarks: ["شارع همفرس بولاق الدكرور", "محطة مترو بولاق الدكرور (الخط الثالث)"], type: "تبادلية", timeFromStart: 55, status: "تحت الإنشاء" },
  "جامعة الدول العربية": { landmarks: ["شارع جامعة الدول العربية بالمهندسين", "ميدان مصطفى محمود", "نادي الصيد المصري"], type: "عادية", timeFromStart: 59, status: "تحت الإنشاء" },
  "وادي النيل": { landmarks: ["شارع وادي النيل بالمهندسين", "محطة مترو وادي النيل (الخط الثالث)", "تقاطع المهندسين والعجوزة"], type: "تبادلية مع الخط الثالث للمترو", timeFromStart: 63, status: "تشغيل تجريبي" }
};

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

export default function MonorailPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [activeLine, setActiveLine] = useState<"east" | "west">("east");
  const [loadingStations, setLoadingStations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [calcFrom, setCalcFrom] = useState("");
  const [calcTo, setCalcTo] = useState("");

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

  const allStationsList = stations.length > 0 ? stations : DEFAULT_MONORAIL;
  const eastStations = allStationsList.filter(s => s.line_type === "east").sort((a, b) => a.station_order - b.station_order);
  const westStations = allStationsList.filter(s => s.line_type === "west").sort((a, b) => a.station_order - b.station_order);

  const filteredReportStations = React.useMemo(() => {
    const q = normalizeArabic(reportStationSearchQuery.trim());
    if (!q) return allStationsList;
    return allStationsList.filter((s: any) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l: string) => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [reportStationSearchQuery, allStationsList]);

  const routeResult = React.useMemo(() => {
    if (!calcFrom || !calcTo) return null;
    if (calcFrom === calcTo) return null;

    const fromStationObj = allStationsList.find(s => s.name === calcFrom);
    const toStationObj = allStationsList.find(s => s.name === calcTo);

    if (!fromStationObj || !toStationObj) return null;

    // Check if on the same line
    if (fromStationObj.line_type === toStationObj.line_type) {
      const lineStationsObj = allStationsList
        .filter(s => s.line_type === fromStationObj.line_type)
        .sort((a, b) => a.station_order - b.station_order);

      const fromIndex = lineStationsObj.findIndex(s => s.name === calcFrom);
      const toIndex = lineStationsObj.findIndex(s => s.name === calcTo);

      const count = Math.abs(fromStationObj.station_order - toStationObj.station_order);

      // Calculate path
      const min = Math.min(fromIndex, toIndex);
      const max = Math.max(fromIndex, toIndex);
      const path = lineStationsObj.slice(min, max + 1).map(s => s.name);
      const pathOrdered = fromIndex <= toIndex ? path : [...path].reverse();

      // Fare calculation
      // up to 5: 20 EGP, 6-10: 40 EGP, 11-15: 55 EGP, 16-22: 80 EGP
      let price = 20;
      let discountPrice = 10;
      let zoneName = "منطقة واحدة (حتى 5 محطات)";
      if (count > 15) {
        price = 80;
        discountPrice = 40;
        zoneName = "أربع مناطق (أكثر من 15 محطة)";
      } else if (count > 10) {
        price = 55;
        discountPrice = 27.5;
        zoneName = "ثلاث مناطق (من 11 إلى 15 محطة)";
      } else if (count > 5) {
        price = 40;
        discountPrice = 20;
        zoneName = "منطقتان (من 6 إلى 10 محطات)";
      }

      // Calculate estimated time
      const fromDetails = STATION_DETAILS[calcFrom];
      const toDetails = STATION_DETAILS[calcTo];
      const time = (fromDetails && toDetails) ? Math.abs(fromDetails.timeFromStart - toDetails.timeFromStart) : count * 2.5;

      return {
        sameLine: true,
        count,
        price,
        discountPrice,
        zoneName,
        time,
        stations: pathOrdered,
        lineType: fromStationObj.line_type
      };
    } else {
      // Different lines!
      const fromConnectorName = fromStationObj.line_type === "east" ? "الاستاد" : "وادي النيل";
      const toConnectorName = toStationObj.line_type === "east" ? "الاستاد" : "وادي النيل";

      const lineStationsFrom = allStationsList
        .filter(s => s.line_type === fromStationObj.line_type)
        .sort((a, b) => a.station_order - b.station_order);
      const fromIndex = lineStationsFrom.findIndex(s => s.name === calcFrom);
      const fromConnectorIndex = lineStationsFrom.findIndex(s => s.name === fromConnectorName);
      const leg1Count = Math.abs(fromIndex - fromConnectorIndex);
      const min1 = Math.min(fromIndex, fromConnectorIndex);
      const max1 = Math.max(fromIndex, fromConnectorIndex);
      const path1 = lineStationsFrom.slice(min1, max1 + 1).map(s => s.name);
      const path1Ordered = fromIndex <= fromConnectorIndex ? path1 : [...path1].reverse();

      // Leg 1 price
      let leg1Price = 20;
      let leg1Discount = 10;
      if (leg1Count > 15) { leg1Price = 80; leg1Discount = 40; }
      else if (leg1Count > 10) { leg1Price = 55; leg1Discount = 27.5; }
      else if (leg1Count > 5) { leg1Price = 40; leg1Discount = 20; }

      const fromDetails = STATION_DETAILS[calcFrom];
      const fromConnectorDetails = STATION_DETAILS[fromConnectorName];
      const leg1Time = (fromDetails && fromConnectorDetails) ? Math.abs(fromDetails.timeFromStart - fromConnectorDetails.timeFromStart) : leg1Count * 2.5;

      // Leg 2: Metro Line 3 from fromConnector to toConnector
      const metroPrice = 10;
      const metroTime = 30; // ~30 minutes

      // Leg 3: toConnector to toStation
      const lineStationsTo = allStationsList
        .filter(s => s.line_type === toStationObj.line_type)
        .sort((a, b) => a.station_order - b.station_order);
      const toConnectorIndex = lineStationsTo.findIndex(s => s.name === toConnectorName);
      const toIndex = lineStationsTo.findIndex(s => s.name === calcTo);
      const leg3Count = Math.abs(toConnectorIndex - toIndex);
      const min3 = Math.min(toConnectorIndex, toIndex);
      const max3 = Math.max(toConnectorIndex, toIndex);
      const path3 = lineStationsTo.slice(min3, max3 + 1).map(s => s.name);
      const path3Ordered = toConnectorIndex <= toIndex ? path3 : [...path3].reverse();

      // Leg 3 price
      let leg3Price = 20;
      let leg3Discount = 10;
      if (leg3Count > 15) { leg3Price = 80; leg3Discount = 40; }
      else if (leg3Count > 10) { leg3Price = 55; leg3Discount = 27.5; }
      else if (leg3Count > 5) { leg3Price = 40; leg3Discount = 20; }

      const toConnectorDetails = STATION_DETAILS[toConnectorName];
      const toDetails = STATION_DETAILS[calcTo];
      const leg3Time = (toConnectorDetails && toDetails) ? Math.abs(toConnectorDetails.timeFromStart - toDetails.timeFromStart) : leg3Count * 2.5;

      return {
        sameLine: false,
        leg1: {
          from: calcFrom,
          to: fromConnectorName,
          count: leg1Count,
          price: leg1Price,
          discountPrice: leg1Discount,
          time: leg1Time,
          stations: path1Ordered,
          lineType: fromStationObj.line_type
        },
        leg2: {
          from: fromConnectorName,
          to: toConnectorName,
          price: metroPrice,
          time: metroTime,
        },
        leg3: {
          from: toConnectorName,
          to: calcTo,
          count: leg3Count,
          price: leg3Price,
          discountPrice: leg3Discount,
          time: leg3Time,
          stations: path3Ordered,
          lineType: toStationObj.line_type
        },
        totalPrice: leg1Price + metroPrice + leg3Price,
        totalDiscountPrice: leg1Discount + metroPrice + leg3Discount,
        totalTime: leg1Time + metroTime + leg3Time
      };
    }
  }, [calcFrom, calcTo, allStationsList]);

  useEffect(() => {
    if (user) {
      loadStations();
    }
  }, [user]);

  useEffect(() => {
    document.title = "ماب القاهرة - مونو رايل";
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

  const loadStations = async () => {
    setLoadingStations(true);
    if (!supabase) {
      setStations(getLocalStations());
      setLoadingStations(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monorail_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        setStations(getLocalStations());
      } else {
        setStations(data || []);
      }
    } catch (err) {
      setStations(getLocalStations());
    } finally {
      setLoadingStations(false);
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_MONORAIL;
    const local = localStorage.getItem("local_monorail");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MONORAIL;
      }
    }
    localStorage.setItem("local_monorail", JSON.stringify(DEFAULT_MONORAIL));
    return DEFAULT_MONORAIL;
  };

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
    } else if (fromRoute && routeResult && calcFrom && calcTo) {
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
        const fileName = `monorail_${user.id}_${Date.now()}.${fileExt}`;
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
        transfer: "خطأ في محطة التبديل أو تعليمات التحويل مع المترو/القطار",
        station_info: "اسم المحطة أو المعالم القريبة غير دقيقة",
        construction: "محطة مغلقة أو قيد الإنشاء أو تغيرت حالة تشغيلها",
        app_bug: "مشكلة تقنية أو زر لا يستجيب في الصفحة",
        other: "ملاحظة أو مشكلة أخرى",
      };

      const typeLabel = problemTypeLabels[reportProblemType] || "مشكلة في المونوريل";

      let scopeInfo = "";
      if (reportTargetScope === "route" && calcFrom && calcTo) {
        scopeInfo = `📍 المسار المعني: من ${calcFrom} إلى ${calcTo}
💰 السعر المحسوب: ${routeResult?.price || routeResult?.totalPrice || "غير محدد"} ج.م
⏱️ الوقت المقدر: ${routeResult?.time || routeResult?.totalTime || "غير محدد"} دقيقة
🚉 عدد المحطات: ${routeResult?.count || "غير محدد"}`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في صفحة قطار المونوريل:
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle = reportTargetScope === "route" && calcFrom && calcTo
        ? `مشكلة مسار مونوريل: من ${calcFrom} إلى ${calcTo}`
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

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🚝",
            message: `شكراً لمساعدتنا في تحسين وتدقيق خدمة قطار المونوريل. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
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

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "mishwar" || profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold") && !isExpired);

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
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>جاري التحقق من التفاصيل...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // Paywall / Lock screen matching Metro & Directory premium view style
  if (!user || !hasAccess) {
    return (
      <>
        <title>ماب القاهرة - مونوريل </title>
        <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
          {/* Banner matching Metro */}
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
                  background: "var(--bgGlass-card)",
                  border: "1px solid var(--borderGlass)",
                  color: "var(--textPrimary)",
                  textDecoration: "none"
                }}
              >
                <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
              </Link>
            </div>

            {/* Cover Image Banner */}
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
                <img src="/images/icons2d/Cairo_monorail_east.png" alt="Cairo Monorail" loading="lazy" decoding="async" style={{ width: "35px", marginLeft: "10px" }} />
                قطار المونوريل</h1>
              <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
                خريطة تفاعلية تفصيلية لشبكة المونوريل الجديدة.
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
              <div style={{
                marginBottom: "24px",
              }}>
                <img src="images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
              </div>


              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
                دليل المونوريل يتطلب اشتراك في الباقة الفضية
              </h2>

              <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
                تصفح الخريطة التفصيلية والمسارات الزمنية لخطوط المونوريل (شرق وغرب النيل) متاح للمشتركين بالباقة الفضية أو الذهبية.
              </p>

              {/* Perks list */}
              <div style={{
                background: "rgba(128, 128, 128, 0.04)",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "1px solid var(--borderGlass)",
                textAlign: "right",
                margin: "0 auto 28px",
                maxWidth: "420px"
              }}>
                <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bx bxs-award" style={{ color: "#fbbf24", fontSize: "1.1rem" }}></i>
                  <span>ميزات الباقة الفضية:</span>
                </div>
                <ul style={{
                  paddingRight: "16px",
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "var(--textSecondary)",
                  lineHeight: "1.6",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontFamily: "var(--font-body)"
                }}>
                  <li>✨ عرض تفاصيل ومحطات خطوط المونوريل كاملة.</li>
                  <li>✨ معرفة المحطات التبادلية والاتجاهات ومعالم المحيط.</li>
                  <li>✨ حساب أوقات الرحلات التقديرية بالدقائق.</li>
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
                    background: "var(--bg-metro-base)",
                    color: "var(--text-metro-base)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    border: "1px solid var(--borderGlass)",
                    display: "block"
                  }}
                >
                  العودة للصفحة الرئيسية
                </Link>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
          @keyframes pulse-gold {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.3); }
            50% { transform: scale(1.03); box-shadow: 0 0 15px 8px rgba(251, 191, 36, 0.12); }
          }
        `}} />
        </div>
      </>
    );
  }

  // Filter stations based on active line and search query
  const lineStations = stations
    .filter(s => s.line_type === activeLine)
    .sort((a, b) => a.station_order - b.station_order)
    .filter(s => !searchQuery.trim() || normalizeArabic(s.name).includes(normalizeArabic(searchQuery.trim())));

  // Global search results across both lines for instant search
  const normalizedQuery = normalizeArabic(searchQuery.trim());
  const searchResults = normalizedQuery
    ? stations.filter(s => normalizeArabic(s.name).includes(normalizedQuery))
    : [];

  // Active line statistics
  const lineStats = {
    east: {
      length: "56.5 كم",
      stationsCount: 22,
      designSpeed: "80 كم/س",
      time: "60 دقيقة",
      color: "#3b82f6",
      colorLight: "rgba(59, 130, 246, 0.12)",
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)"
    },
    west: {
      length: "42 كم",
      stationsCount: 16,
      designSpeed: "80 كم/س",
      time: "45 دقيقة",
      color: "#10b981",
      colorLight: "rgba(16, 185, 129, 0.12)",
      gradient: "linear-gradient(135deg, #10b981, #34d399)"
    }
  };

  const currentStats = lineStats[activeLine];

  const handleStationClick = (stationName: string) => {
    if (expandedStation === stationName) {
      setExpandedStation(null);
    } else {
      setExpandedStation(stationName);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
      {/* CSS internal styles definition for custom hover effects and keyframe animation states */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .pulse-node-east {
          animation: pulse-node-east-anim 2.5s infinite;
        }
        .pulse-node-west {
          animation: pulse-node-west-anim 2.5s infinite;
        }

        @keyframes pulse-node-east-anim {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 12px 6px rgba(59, 130, 246, 0.25); }
        }
        @keyframes pulse-node-west-anim {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 12px 6px rgba(16, 185, 129, 0.25); }
        }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
      }}>
        {/* Back Button
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
              background: "var(--bgGlass-card)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              textDecoration: "none",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </div> */}

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
            <img src="/images/icons2d/Cairo_monorail_east.png" alt="" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginLeft: "10px" }} />
            دليل قطار المونوريل</h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف المحطات والاتجاهات والمعالم الهامة لخطوط شرق وغرب النيل.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#3b82f6",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>شرق النيل (العاصمة)</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>غرب النيل (أكتوبر)</span>
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
              <span>الإبلاغ عن مشكلة في المونوريل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        {/* Search Panel Card - Styled matching Metro searchCard & Directory searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
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
          {/* Search Box */}
          <div ref={searchContainerRef} style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في محطات المونوريل
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
                fontFamily: "var(--font-body)",
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
                    const isEast = station.line_type === "east";
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
                            backgroundColor: isEast ? "#3b82f6" : "#10b981"
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
                            backgroundColor: isEast ? "rgba(59, 130, 246, 0.12)" : "rgba(16, 185, 129, 0.12)",
                            color: isEast ? "#3b82f6" : "#10b981"
                          }}>
                            {isEast ? "شرق النيل" : "غرب النيل"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Line Selector Tab Switcher (Matching Directory Categories Tabs style) */}
          <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--borderGlass)", paddingTop: "14px" }}>
            <button
              onClick={() => {
                setActiveLine("east");
                setExpandedStation(null);
              }}
              style={{
                background: activeLine === "east" ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                border: `1px solid ${activeLine === "east" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                color: activeLine === "east" ? "var(--textPrimary)" : "var(--textSecondary)",
                padding: "6px 12px",
                borderRadius: "50px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              شرق النيل (العاصمة)
            </button>

            <button
              onClick={() => {
                setActiveLine("west");
                setExpandedStation(null);
              }}
              style={{
                background: activeLine === "west" ? "rgba(16, 185, 129, 0.15)" : "var(--bgSecondary)",
                border: `1px solid ${activeLine === "west" ? "var(--colorSuccess)" : "var(--borderGlass)"}`,
                color: activeLine === "west" ? "var(--textPrimary)" : "var(--textSecondary)",
                padding: "6px 12px",
                borderRadius: "50px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              غرب النيل (أكتوبر)
            </button>
          </div>
        </div>

        {/* Route Info & Stats - Beautiful clean directory matching rows */}
        <div className="metro-animate-slide-up metro-delay-300" style={{
          marginTop: "20px",
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "var(--radius-card)",
          padding: "16px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
              طول المسار: <strong style={{ color: "var(--textPrimary)" }}>{currentStats.length}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
              عدد المحطات: <strong style={{ color: "var(--textPrimary)" }}>{currentStats.stationsCount} محطة</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
              زمن الرحلة: <strong style={{ color: "var(--textPrimary)" }}>~ {currentStats.time}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
              السرعة: <strong style={{ color: "var(--textPrimary)" }}>{currentStats.designSpeed}</strong>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--borderGlass)", marginTop: "12px", paddingTop: "12px", fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
            ℹ️ {activeLine === "east" ? (
              <span>يربط مدينة نصر (الاستاد) بالعاصمة الإدارية الجديدة لخدمة أحياء شرق القاهرة والتجمع الخامس.</span>
            ) : (
              <span>يربط الجيزة (وادي النيل) بمدينة السادس من أكتوبر لخدمة مواطني الجيزة وضواحي أكتوبر.</span>
            )}
          </div>
        </div>

        {/* Ticket Calculator & Trip Planner */}
        <div className="metro-animate-slide-up metro-delay-350" style={{
          marginTop: "20px",
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            fontSize: "1.1rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <i className="bx bx-card" style={{ color: "var(--colorSecondary, #3b82f6)", fontSize: "1.3rem" }}></i>
            أحسب تذكرتك وظبط رحلتك
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            {/* From Station */}
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                محطة القيام:
              </label>
              <select
                value={calcFrom}
                onChange={(e) => setCalcFrom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bgSecondary)",
                  color: "var(--textPrimary)",
                  border: "1px solid var(--borderGlass)",
                  fontFamily: "var(--font-cairo)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              >
                <option value="">-- اختر محطة القيام --</option>
                <optgroup label="شرق النيل (العاصمة)">
                  {eastStations.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="غرب النيل (أكتوبر)">
                  {westStations.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* To Station */}
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                محطة الوصول:
              </label>
              <select
                value={calcTo}
                onChange={(e) => setCalcTo(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bgSecondary)",
                  color: "var(--textPrimary)",
                  border: "1px solid var(--borderGlass)",
                  fontFamily: "var(--font-cairo)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              >
                <option value="">-- اختر محطة الوصول --</option>
                <optgroup label="شرق النيل (العاصمة)">
                  {eastStations.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="غرب النيل (أكتوبر)">
                  {westStations.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Results display */}
          {routeResult ? (
            <div style={{
              background: "rgba(128, 128, 128, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "12px",
              padding: "16px",
            }}>
              {routeResult.sameLine ? (
                // Same line trip result
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "var(--textSecondary)", fontSize: "0.78rem", display: "block", marginBottom: "4px" }}>سعر تذكرة الرحلة (العادية)</span>
                      <strong style={{ fontSize: "1.6rem", color: "var(--colorSecondary, #3b82f6)" }}>{routeResult.price} ج.م</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--textSecondary)", fontSize: "0.78rem", display: "block", marginBottom: "4px" }}>تذكرة مخفضة (كبار السن / الاحتياجات)</span>
                      <strong style={{ fontSize: "1.4rem", color: "#10b981" }}>{routeResult.discountPrice} ج.م</strong>
                    </div>
                    <div style={{ textAlign: "left", marginRight: "auto" }}>
                      <span style={{ color: "var(--textSecondary)", fontSize: "0.78rem", display: "block", marginBottom: "4px" }}>تفاصيل المسار</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--textPrimary)", fontWeight: "bold" }}>
                        {routeResult.count} محطات ~ {routeResult.time} دقيقة
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", marginTop: "10px" }}>
                    📊 نوع المنطقة: {routeResult.zoneName}
                  </div>

                  {/* Route path stations */}
                  <div style={{ marginTop: "16px", borderTop: "1px solid var(--borderGlass)", paddingTop: "12px" }}>
                    <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "0.82rem", color: "var(--textPrimary)" }}>مسار الرحلة بالتفصيل:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                      {routeResult.stations?.map((sName, idx) => {
                        const isStart = idx === 0;
                        const isEnd = idx === (routeResult.stations?.length ?? 0) - 1;
                        return (
                          <React.Fragment key={sName}>
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              background: isStart || isEnd ? (routeResult.lineType === "east" ? "#3b82f6" : "#10b981") : "rgba(128, 128, 128, 0.08)",
                              color: isStart || isEnd ? "#fff" : "var(--textPrimary)",
                              fontSize: "0.78rem",
                              fontWeight: isStart || isEnd ? "bold" : "normal",
                              border: "1px solid var(--borderGlass)"
                            }}>
                              {sName}
                            </span>
                            {idx < (routeResult.stations?.length ?? 0) - 1 && <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>←</span>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Cross line trip result (different lines!)
                <div>
                  <div style={{
                    padding: "8px 12px",
                    background: "rgba(251, 191, 36, 0.08)",
                    border: "1px solid rgba(251, 191, 36, 0.2)",
                    borderRadius: "8px",
                    color: "#fb2424ff",
                    fontSize: "0.8rem",
                    lineHeight: "1.5",
                    marginBottom: "16px"
                  }}>
                    ⚠️ <strong>خطوط المونوريل غير متصلة مباشرة:</strong> محطة القيام والوصول تقعان في اتجاهين منفصلين (شرق وغرب النيل). يمكنك الانتقال بينهما عن طريق <strong>مترو الخط الثالث</strong>.
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "var(--textSecondary)", fontSize: "0.78rem", display: "block", marginBottom: "4px" }}>إجمالي التذاكر (مونوريل + مترو)</span>
                      <strong style={{ fontSize: "1.6rem", color: "var(--colorSecondary, #3b82f6)" }}>{routeResult.totalPrice} ج.م</strong>
                    </div>

                    <div style={{ textAlign: "right", marginRight: "auto" }}>
                      <span style={{ color: "var(--textSecondary)", fontSize: "0.78rem", display: "block", marginBottom: "4px" }}> زمن الرحلة المقدر</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--textPrimary)", fontWeight: "bold" }}>
                        ~ {routeResult.totalTime} دقيقة
                      </span>
                    </div>
                  </div>

                  {/* Multi-leg route details */}
                  <div style={{ marginTop: "16px", borderTop: "1px solid var(--borderGlass)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontWeight: "700", fontSize: "0.82rem", color: "var(--textPrimary)" }}>خطة السفر :</div>

                    {/* Leg 1 */}
                    <div style={{ padding: "10px", background: "rgba(128, 128, 128, 0.05)", borderRadius: "8px", border: "1px solid var(--borderGlass)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.78rem" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={
                              routeResult.leg1?.lineType === "east"
                                ? "/images/icons2d/Cairo_monorail_east.png"
                                : "/images/icons2d/Cairo_monorail_west.png"
                            }
                            alt="monorail"
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: "20px",
                              height: "20px",
                              marginLeft: "5px",
                            }}
                          />
                          <span style={{ fontWeight: "bold", color: routeResult.leg1?.lineType === "east" ? "#3b82f6" : "#10b981" }}>
                            الخطوة الأولى
                          </span>
                        </div>
                        <span style={{ color: "var(--textSecondary)" }}>{routeResult.leg1?.price} ج.م ~ {routeResult.leg1?.time} دقيقة</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        استخدم مونوريل  ({routeResult.leg1?.lineType === "east" ? "شرق النيل" : "غرب النيل"}) من <strong>{routeResult.leg1?.from}</strong> إلى محطة التبادل <strong>{routeResult.leg1?.to}</strong> ({routeResult.leg1?.count} محطات)
                      </div>
                    </div>

                    {/* Leg 2 */}
                    <div style={{ padding: "10px", background: "rgba(128, 128, 128, 0.05)", borderRadius: "8px", border: "1px solid var(--borderGlass)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.78rem" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src="images/icons2d/metro.svg" alt="cairo_metro" loading="lazy" decoding="async" style={{ width: "20px", height: "20px", marginLeft: "5px" }} />
                          <span style={{ fontWeight: "bold", color: "#007928ff" }}>
                            الخطوة الثانية
                          </span>
                        </div>
                        <span style={{ color: "var(--textSecondary)" }}>{routeResult.leg2?.price} ج.م ~ {routeResult.leg2?.time} دقيقة</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        قم بالتبديل للمترو من محطة <strong>{routeResult.leg2?.from}</strong> إلى محطة <strong>{routeResult.leg2?.to}</strong>
                      </div>
                    </div>

                    {/* Leg 3 */}
                    <div style={{ padding: "10px", background: "rgba(128, 128, 128, 0.05)", borderRadius: "8px", border: "1px solid var(--borderGlass)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.78rem" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={
                              routeResult.leg3?.lineType === "east"
                                ? "/images/icons2d/Cairo_monorail_east.png"
                                : "/images/icons2d/Cairo_monorail_west.png"
                            }
                            alt="monorail"
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: "20px",
                              height: "20px",
                              marginLeft: "5px",
                            }}
                          />
                          <span style={{ fontWeight: "bold", color: routeResult.leg3?.lineType === "east" ? "#3b82f6" : "#10b981" }}>
                            الخطوة الثالثة
                          </span>
                        </div>
                        <span style={{ color: "var(--textSecondary)" }}>{routeResult.leg3?.price} ج.م ~ {routeResult.leg3?.time} دقيقة</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        اركب من محطة التبادل <strong>{routeResult.leg3?.from}</strong> إلى وجهتك النهائية <strong>{routeResult.leg3?.to}</strong> ({routeResult.leg3?.count} محطات)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Report Route Button */}
              <button
                type="button"
                onClick={() => handleOpenReportModal(null, true)}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontFamily: "var(--font-cairo)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>الإبلاغ عن خطأ في حساب هذا المسار</span>
              </button>
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "16px",
              color: "var(--textSecondary)",
              fontSize: "0.8rem",
              background: "rgba(128, 128, 128, 0.02)",
              borderRadius: "10px",
              border: "1px dashed var(--borderGlass)"
            }}>
              💡 اختر محطة القيام والوصول لحساب أسعار التذاكر وتخطيط مسار رحلتك بالكامل.
            </div>
          )}
        </div>

        {/* Timeline list of stations styled matching Directory item cards */}
        <div className="metro-animate-slide-up metro-delay-400" style={{ marginTop: "24px" }}>
          <div style={{
            fontSize: "1.2rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <i style={{ color: currentStats.color }} className="bx bx-station"></i>
            محطات الخط ({lineStations.length})
          </div>

          {loadingStations ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--textSecondary)" }}>
              <span style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--borderGlass)", borderTopColor: currentStats.color, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>جاري تحميل محطات المونوريل...</p>
            </div>
          ) : lineStations.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--textSecondary)",
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px"
            }}>
              <p>لم يتم العثور على محطات مطابقة للبحث</p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingRight: "35px" }}>
              {/* Timeline Vertical Line with Neon Glow */}
              <div style={{
                position: "absolute",
                top: "12px",
                bottom: "12px",
                right: "14px",
                width: "2px",
                background: `linear-gradient(to bottom, ${currentStats.color}, var(--borderGlass))`,
                borderRadius: "4px",
                filter: `drop-shadow(0 0 3px ${currentStats.color})`
              }} />

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {lineStations.map((station, index) => {
                  const dbLandmarks = Array.isArray(station.landmarks) && station.landmarks.length > 0 ? (station.landmarks as string[]) : null;
                  const staticDetails = STATION_DETAILS[station.name];
                  const details = (staticDetails || dbLandmarks) ? {
                    landmarks: dbLandmarks || staticDetails?.landmarks || [],
                    type: staticDetails?.type || "عادية",
                    timeFromStart: staticDetails?.timeFromStart ?? 0,
                    status: station.status || staticDetails?.status || "تحت الإنشاء"
                  } : null;
                  const isExpanded = expandedStation === station.name;
                  const isFirst = station.station_order === 1;
                  const isLast = station.station_order === currentStats.stationsCount;
                  const isTerminal = isFirst || isLast;
                  const isTransfer = station.name.includes("الاستاد") || station.name.includes("هشام بركات") || station.name.includes("مدينة الفنون والثقافة") || station.name.includes("وادي النيل") || station.name.includes("نقابة المهندسين") || station.name.includes("المشير طنطاوي") || station.name.includes("الطريق الدائري");

                  return (
                    <div id={`station-${station.name}`} key={station.id || index} style={{ display: "flex", flexDirection: "column", position: "relative" }}>

                      {/* Circle Node on the timeline */}
                      <div
                        className={`${isTerminal ? (activeLine === "east" ? "pulse-node-east" : "pulse-node-west") : ""}`}
                        style={{
                          position: "absolute",
                          right: "-29px",
                          top: "15px",
                          width: isTerminal ? "20px" : "16px",
                          height: isTerminal ? "20px" : "16px",
                          borderRadius: "50%",
                          background: details?.status === "تحت الإنشاء" ? "var(--bgPrimary)" : (isTerminal ? "#454549ff" : (isTransfer ? "rgba(255,255,255,0.9)" : currentStats.color)),
                          border: details?.status === "تحت الإنشاء" ? `3px dashed ${currentStats.color}` : `4.5px solid var(--bgPrimary, #000)`,
                          boxShadow: isTransfer && details?.status !== "تحت الإنشاء" ? "0 0 8px rgba(255,255,255,0.5)" : "none",
                          zIndex: 2,
                          transform: isTerminal ? "translateY(-3px)" : "none",
                          transition: "all 0.3s ease"
                        }}
                      />

                      {/* Content Box - Styled matching Directory item cards */}
                      <div
                        onClick={() => handleStationClick(station.name)}
                        style={{
                          backgroundColor: "var(--bgPrimary)",
                          border: isExpanded ? `1px solid ${currentStats.color}` : (details?.status === "تحت الإنشاء" ? `1px dashed ${currentStats.color}50` : "1px solid var(--borderGlass)"),
                          opacity: details?.status === "تحت الإنشاء" ? 0.75 : 1,
                          borderRadius: "var(--radius-card)",
                          padding: "12px 16px",
                          marginRight: "10px",
                          boxShadow: "var(--shadow-sm)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          cursor: "pointer",
                          transition: "transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
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

                        {/* Expandable landmarks and details block matching Directory entries expansion */}
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

                                {/* Additional metadata info row */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "4px" }}>
                                  <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>
                                    🔗 الربط والتبادل: <strong style={{ color: "var(--textPrimary)" }}>{details.type}</strong>
                                  </div>
                                </div>

                                {/* Report button for this station */}
                                <div style={{ marginTop: "6px" }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReportModal(station.name);
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      borderRadius: "8px",
                                      background: "rgba(239, 68, 68, 0.08)",
                                      border: "1px solid rgba(239, 68, 68, 0.25)",
                                      color: "#ef4444",
                                      fontSize: "0.76rem",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      fontFamily: "var(--font-cairo)",
                                      transition: "all 0.2s ease"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                                  >
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <span>إبلاغ عن مشكلة في هذه المحطة</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                لا توجد تفاصيل إضافية مسجلة لهذه المحطة.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Problem Modal for Monorail */}
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
                <span>مشكلة في صفحة قطار المونوريل</span>
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
                    شكراً لمساهمتك في تحسين وتدقيق خدمة قطار المونوريل. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
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
                    يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة في المونوريل ومتابعة حالته وكسب نقاط المساهمة.
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
                    <div style={{ display: "grid", gridTemplateColumns: (calcFrom && calcTo) ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: "6px" }}>
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
                          background: reportTargetScope === "general" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
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
                          background: reportTargetScope === "station" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "station" ? "var(--textPrimary)" : "var(--textSecondary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        محطة معينة
                      </button>

                      {calcFrom && calcTo && (
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
                            background: reportTargetScope === "route" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
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
                              const isEast = st.line_type === "east";

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
                                    background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
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
                                      background: isEast ? "rgba(59, 130, 246, 0.12)" : "rgba(16, 185, 129, 0.12)",
                                      color: isEast ? "#3b82f6" : "#10b981",
                                      fontWeight: "bold",
                                      border: "1px solid var(--borderGlass)"
                                    }}>
                                      {isEast ? "شرق النيل" : "غرب النيل"}
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
                  {reportTargetScope === "route" && calcFrom && calcTo && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(59, 130, 246, 0.06)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      fontSize: "0.84rem",
                      color: "var(--textPrimary)",
                      lineHeight: "1.6"
                    }}>
                      <div>📍 <strong>من:</strong> {calcFrom} ← <strong>إلى:</strong> {calcTo}</div>
                      {routeResult && (
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "4px" }}>
                          السعر: {routeResult.price || routeResult.totalPrice} ج.م • المحطات: {routeResult.count || `${routeResult.leg1?.count || 0} + ${routeResult.leg3?.count || 0}`} • الوقت المقدر: {routeResult.time || routeResult.totalTime} د
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
                      <option value="transfer" style={{ background: "var(--bgSecondary)" }}>خطأ في محطة التبديل أو تعليمات التحويل</option>
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
                      placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: محطة كذا أصبح اسمها مختلف، أو التبديل الصحيح للمونوريل يكون كذا)..."
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
