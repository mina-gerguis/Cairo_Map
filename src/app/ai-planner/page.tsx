"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { initialPlaces, Place, FEATURES_LIST } from "@/data/places";
import { egyptLocations } from "@/data/egypt_locations";
import "./planner.css";

// ── TYPES & INTERFACES ──
interface ItineraryStop {
  place: Place;
  duration: number; // in minutes
  arrivalTime: string;
  departureTime: string;
  costEstimate: number;
}

interface TransitLeg {
  mode: string;
  duration: number; // in minutes
  cost: number;
  walkingDistance: number; // in meters
  transfers: number;
}

interface SavedTrip {
  id: string;
  title: string;
  date: string;
  stopsCount: number;
  totalCost: number;
  places: string[]; // place IDs
}

// Preset outing options
const PLAN_PRESETS = [
  { id: "romantic", label: "خروجة رومانسية ❤️", emoji: "❤️", desc: "مكان هادئ، إضاءة لطيفة، أجواء مريحة للكابلز" },
  { id: "family", label: "خروجة عائلية 👨‍👩‍👧‍👦", emoji: "👨‍👩‍👧‍👦", desc: "أماكن تناسب الكبار والصغار، ومريحة للعائلات" },
  { id: "kids", label: "مع الأطفال 🎠", emoji: "🎠", desc: "ملاهي، حدائق، أنشطة حركية للأطفال" },
  { id: "shopping", label: "يوم تسوق 🛍️", emoji: "🛍️", desc: "مولات ومحلات تجارية مميزة" },
  { id: "food", label: "جولة مطاعم 🍽️", emoji: "🍽️", desc: "أكلات شعبية أو شرقية مميزة ومطاعم مشهورة" },
  { id: "study", label: "للمذاكرة 📚", emoji: "📚", desc: "أماكن هادئة تحتوي على Wi-Fi سريع وقريب من الخدمات" },
  { id: "business", label: "اجتماع عمل 💼", emoji: "💼", desc: "أماكن فاخرة، هادئة، ومناسبة للنقاشات الرسمية" },
  { id: "quiet", label: "أماكن هادئة 🌿", emoji: "🌿", desc: "حدائق عامة ومسطحات خضراء للاستجمام" },
  { id: "luxury", label: "أماكن فاخرة ✨", emoji: "✨", desc: "تجربة راقية ومطاعم وفنادق ذات تقييم عالٍ" },
  { id: "budget", label: "خروجة اقتصادية 💰", emoji: "💰", desc: "أماكن ترفيهية بتكلفة بسيطة ومناسبة للجميع" },
  { id: "tourism", label: "جولة سياحية 🏛️", emoji: "🏛️", desc: "متاحف، معالم أثرية، ومزارات سياحية رئيسية" },
  { id: "history", label: "رحلة تاريخية 🕌", emoji: "🕌", desc: "مساجد أثرية، شوارع تاريخية، بيوت أثرية" },
  { id: "entertainment", label: "رحلة ترفيهية 🎡", emoji: "🎡", desc: "سينما، بولينج، ومراكز ترفيهية منوعة" }
];

const TRANSIT_MODES = [
  { id: "car", label: "سيارة", icon: "bx-car", costFactor: 1.5, baseCost: 30, speedKmH: 30 },
  { id: "metro", label: "مترو الأنفاق", icon: "bx-train", costFactor: 0.1, baseCost: 8, speedKmH: 45 },
  { id: "monorail", label: "المونورايل", icon: "bx-navigation", costFactor: 0.4, baseCost: 15, speedKmH: 55 },
  { id: "lrt", label: "القطار LRT", icon: "bx-train", costFactor: 0.5, baseCost: 20, speedKmH: 60 },
  { id: "uber", label: "أوبر / كريم", icon: "bx-taxi", costFactor: 3.5, baseCost: 45, speedKmH: 30 },
  { id: "microbus", label: "ميكروباص", icon: "bx-car", costFactor: 0.15, baseCost: 7, speedKmH: 25 },
  { id: "bus", label: "أتوبيس", icon: "bx-bus", costFactor: 0.12, baseCost: 10, speedKmH: 20 },
  { id: "walking", label: "مشياً على الأقدام", icon: "bx-walk", costFactor: 0, baseCost: 0, speedKmH: 4.5 }
];

export default function PlannerPage() {
  // ── STATES ──
  const [nlpInput, setNlpInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [budget, setBudget] = useState<number>(1000);
  const [transitMode, setTransitMode] = useState<string>("car");
  const [startTime, setStartTime] = useState<string>("14:00");
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [optimized, setOptimized] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Group collaboration simulator states
  const [groupVoting, setGroupVoting] = useState<Record<string, { up: number; down: number; userVote: "up" | "down" | null }>>({});
  const [groupMembers] = useState([
    { name: "أحمد", color: "#FF9500", initials: "أ" },
    { name: "منى", color: "#34C759", initials: "م" },
    { name: "سليم", color: "#007AFF", initials: "س" },
    { name: "يوسف", color: "#AF52DE", initials: "ي" }
  ]);

  // Personalization settings state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userPrefs, setUserPrefs] = useState({
    foodType: "شرقي",
    transit: "car",
    maxWalk: 800,
    outingTime: "15:00",
    categories: ["restaurant", "cafe", "park"]
  });

  // Saved trips from localStorage
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  // Canvas map ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto notification helper
  const triggerAlert = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 5000);
  };

  // Load saved trips & query parameters on mount
  useEffect(() => {
    // 1. Get from localStorage
    const saved = localStorage.getItem("cairo_saved_trips");
    if (saved) {
      try { setSavedTrips(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    const savedPrefs = localStorage.getItem("cairo_user_prefs");
    if (savedPrefs) {
      try { setUserPrefs(JSON.parse(savedPrefs)); } catch (e) { console.error(e); }
    }

    // 2. Read query string to support shared links!
    const params = new URLSearchParams(window.location.search);
    const placeIdsParam = params.get("places");
    if (placeIdsParam) {
      const ids = placeIdsParam.split(",");
      const loadedPlaces = ids
        .map(id => initialPlaces.find(p => p.id === id))
        .filter((p): p is Place => p !== undefined);
      if (loadedPlaces.length > 0) {
        setSelectedPlaces(loadedPlaces);
        const mode = params.get("transit") || "car";
        setTransitMode(mode);
        const time = params.get("start") || "14:00";
        setStartTime(time);
        const budgetParam = params.get("budget");
        if (budgetParam) setBudget(parseInt(budgetParam) || 1000);
        triggerAlert("تم تحميل الرحلة المشتركة بنجاح! 🎉");
      }
    } else {
      // Load preset default plan to show something cool on first load
      handlePresetSelect("family");
    }
  }, []);

  // Update URL for sharing
  const getShareLink = () => {
    if (selectedPlaces.length === 0) return "";
    const ids = selectedPlaces.map(p => p.id).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("places", ids);
    url.searchParams.set("transit", transitMode);
    url.searchParams.set("start", startTime);
    url.searchParams.set("budget", budget.toString());
    return url.toString();
  };

  const handleCopyLink = () => {
    const link = getShareLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    triggerAlert("تم نسخ رابط الرحلة! شاركه مع أصدقائك 🔗");
  };

  // Save Trip to localStorage
  const handleSaveTrip = () => {
    if (selectedPlaces.length === 0) {
      triggerAlert("يرجى إضافة أماكن للرحلة أولاً ⚠️");
      return;
    }
    const newTrip: SavedTrip = {
      id: Math.random().toString(36).substr(2, 9),
      title: `رحلة يوم ${new Date().toLocaleDateString("ar-EG")}`,
      date: new Date().toLocaleDateString("ar-EG"),
      stopsCount: selectedPlaces.length,
      totalCost: totalCostEst,
      places: selectedPlaces.map(p => p.id)
    };

    const updated = [newTrip, ...savedTrips];
    setSavedTrips(updated);
    localStorage.setItem("cairo_saved_trips", JSON.stringify(updated));
    triggerAlert("تم حفظ الرحلة بنجاح في ملفك! 💾");
  };

  const handleDeleteSavedTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    localStorage.setItem("cairo_saved_trips", JSON.stringify(updated));
    triggerAlert("تم حذف الرحلة المحفوظة.");
  };

  const handleLoadSavedTrip = (trip: SavedTrip) => {
    const loadedPlaces = trip.places
      .map(id => initialPlaces.find(p => p.id === id))
      .filter((p): p is Place => p !== undefined);
    setSelectedPlaces(loadedPlaces);
    triggerAlert(`تم تحميل: ${trip.title}`);
  };

  // ── NLP GENERATION LOGIC ──
  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;

    const inputLower = nlpInput.toLowerCase();
    let detectedPreset = "";
    let detectedLocation = "";

    // Preset classification
    if (inputLower.includes("رومانس") || inputLower.includes("كابلز") || inputLower.includes("رومانسيه") || inputLower.includes("رومانسية")) {
      detectedPreset = "romantic";
    } else if (inputLower.includes("عائل") || inputLower.includes("عيله") || inputLower.includes("عيلة") || inputLower.includes("بيت") || inputLower.includes("اهل")) {
      detectedPreset = "family";
    } else if (inputLower.includes("طفل") || inputLower.includes("أطفال") || inputLower.includes("اطفال") || inputLower.includes("العاب") || inputLower.includes("ملاهي")) {
      detectedPreset = "kids";
    } else if (inputLower.includes("مذاكر") || inputLower.includes("دراسه") || inputLower.includes("دراسة") || inputLower.includes("واي فاي") || inputLower.includes("هدوء")) {
      detectedPreset = "study";
    } else if (inputLower.includes("تسوق") || inputLower.includes("شوبينج") || inputLower.includes("مول") || inputLower.includes("شراء")) {
      detectedPreset = "shopping";
    } else if (inputLower.includes("تاريخ") || inputLower.includes("اسلامي") || inputLower.includes("مسجد") || inputLower.includes("أثر")) {
      detectedPreset = "history";
    } else if (inputLower.includes("سياح") || inputLower.includes("متحف")) {
      detectedPreset = "tourism";
    }

    // Location parsing
    if (inputLower.includes("التجمع") || inputLower.includes("الخامس")) {
      detectedLocation = "التجمع الخامس";
    } else if (inputLower.includes("مصر الجديده") || inputLower.includes("مصر الجديدة") || inputLower.includes("الكوربة")) {
      detectedLocation = "مصر الجديدة";
    } else if (inputLower.includes("إمبابة") || inputLower.includes("امبابه")) {
      detectedLocation = "إمبابة";
    } else if (inputLower.includes("الزمالك")) {
      detectedLocation = "الزمالك";
    } else if (inputLower.includes("المعادي") || inputLower.includes("معادي")) {
      detectedLocation = "المعادي";
    } else if (inputLower.includes("زايد") || inputLower.includes("أكتوبر") || inputLower.includes("اكتوبر")) {
      detectedLocation = "الشيخ زايد";
    } else if (inputLower.includes("إسكندرية") || inputLower.includes("اسكندرية") || inputLower.includes("الاسكندرية")) {
      detectedLocation = "الإسكندرية";
    }

    // Budget parsing
    const budgetMatch = inputLower.match(/\b(\d{3,4})\b/);
    if (budgetMatch) {
      const parsedBudget = parseInt(budgetMatch[1]);
      if (parsedBudget >= 100 && parsedBudget <= 10000) {
        setBudget(parsedBudget);
      }
    }

    // Smart generator
    let pool = [...initialPlaces];
    
    // Add extra mock locations if database is small to yield rich variations
    const extraMocks: Place[] = [
      {
        id: "mock-1",
        name: "ووترواي مول - التجمع الخامس",
        category: "shopping",
        categoryLabel: "تسوق",
        subCategories: ["mall", "cafe"],
        briefLocation: "التجمع الخامس / القاهرة",
        fullAddress: "محور محمد نجيب، التجمع الخامس",
        phones: ["01012345678"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80"],
        workingHours: "09:00 ص - 01:00 ص",
        rating: 4.5,
        description: "مجمع تجاري مفتوح يضم مطاعم وكافيهات راقية ممتازة للمشي والتسوق.",
        latitude: 30.0335, longitude: 31.4811,
        features: ["suitable_for_groups", "family_friendly", "wheelchair_accessible"]
      },
      {
        id: "mock-2",
        name: "متحف الحضارة المصرية (NMEC)",
        category: "entertainment",
        categoryLabel: "ترفيه",
        subCategories: ["museum"],
        briefLocation: "الفسطاط / القاهرة",
        fullAddress: "عين الصيرة، الفسطاط، القاهرة",
        phones: ["19800"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80"],
        workingHours: "09:00 ص - 05:00 م",
        rating: 4.8,
        description: "متحف عملاق يعرض الحضارة المصرية عبر العصور ويحتوي على قاعة المومياوات الملكية.",
        latitude: 30.0076, longitude: 31.2512,
        features: ["suitable_for_all_ages", "wheelchair_accessible"]
      },
      {
        id: "mock-3",
        name: "حديقة الأسرة (Family Park)",
        category: "public_places",
        categoryLabel: "أماكن عامة",
        subCategories: ["park"],
        briefLocation: "طريق السويس / القاهرة",
        fullAddress: "الكيلو 26 طريق القاهرة السويس الصحراوي",
        phones: ["0224119999"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80"],
        workingHours: "09:00 ص - 10:00 م",
        rating: 4.6,
        description: "حديقة عملاقة للأطفال تحتوي على ملاهي ونهر سحري وسينما 3D ومساحات خضراء شاسعة.",
        latitude: 30.1583, longitude: 31.6214,
        features: ["kids_friendly", "family_friendly"]
      },
      {
        id: "mock-4",
        name: "بين باج كافيه - المعادي",
        category: "food_drinks",
        categoryLabel: "أكل ومشروبات",
        subCategories: ["cafe"],
        briefLocation: "المعادي / القاهرة",
        fullAddress: "شارع 9، المعادي",
        phones: ["01112223334"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80"],
        workingHours: "08:00 ص - 02:00 ص",
        rating: 4.4,
        description: "كافيه مريح للغاية يوفر جلسات بين باجز وWi-Fi سريع ومناسب للدراسة والعمل الجماعي.",
        latitude: 29.9602, longitude: 31.2618,
        features: ["free_wifi", "quiet_place", "accepts_credit_cards"]
      },
      {
        id: "mock-5",
        name: "مول كايرو فيستيفال سيتي",
        category: "shopping",
        categoryLabel: "تسوق",
        subCategories: ["mall"],
        briefLocation: "التجمع الخامس / القاهرة",
        fullAddress: "الطريق الدائري، التجمع الخامس",
        phones: ["16367"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80"],
        workingHours: "10:00 ص - 12:00 ص",
        rating: 4.7,
        description: "أكبر مولات القاهرة الجديدة، يتميز بالنافورة الراقصة ومجموعة ضخمة من المتاجر والمطاعم والسينمات.",
        latitude: 30.0298, longitude: 31.4082,
        features: ["suitable_for_groups", "family_friendly", "wheelchair_accessible"]
      }
    ];

    pool = [...pool, ...extraMocks];

    // Filter by detected location if present
    if (detectedLocation) {
      pool = pool.filter(p => p.briefLocation?.includes(detectedLocation) || p.fullAddress?.includes(detectedLocation));
    }

    // Filter by preset preferences
    let selected: Place[] = [];
    if (detectedPreset === "romantic") {
      selected = pool.filter(p => p.features?.includes("quiet_place") || p.features?.includes("family_friendly")).slice(0, 3);
    } else if (detectedPreset === "family" || detectedPreset === "kids") {
      selected = pool.filter(p => p.features?.includes("family_friendly") || p.features?.includes("kids_friendly") || p.features?.includes("suitable_for_all_ages")).slice(0, 3);
    } else if (detectedPreset === "study") {
      selected = pool.filter(p => p.features?.includes("free_wifi") || p.features?.includes("quiet_place")).slice(0, 2);
    } else if (detectedPreset === "shopping") {
      selected = pool.filter(p => p.category === "shopping" || p.subCategories?.includes("mall")).slice(0, 3);
    } else {
      // Default smart mix of restaurant, cafe, and public park/mall
      const restaurant = pool.find(p => p.subCategories?.includes("restaurant"));
      const cafe = pool.find(p => p.subCategories?.includes("cafe"));
      const park = pool.find(p => p.category === "public_places" || p.category === "shopping");
      if (park) selected.push(park);
      if (restaurant) selected.push(restaurant);
      if (cafe) selected.push(cafe);
    }

    // If still empty, grab any 3 random places
    if (selected.length === 0) {
      selected = pool.slice(0, 3);
    }

    setSelectedPlaces(selected);
    setOptimized(false);
    setSelectedPreset(detectedPreset || "family");
    
    // Give AI feedback
    triggerAlert(`تم تخطيط يومك بنجاح بناءً على ذكاء ماب القاهرة! 🤖 (${detectedLocation || "القاهرة الكبرى"})`);
  };

  // Handle Preset Select
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    
    // Filter and pick 3 matching preset places
    let pool = [...initialPlaces];
    const extraMocks: Place[] = [
      {
        id: "mock-1",
        name: "ووترواي مول - التجمع الخامس",
        category: "shopping",
        categoryLabel: "تسوق",
        subCategories: ["mall", "cafe"],
        briefLocation: "التجمع الخامس / القاهرة",
        fullAddress: "محور محمد نجيب، التجمع الخامس",
        phones: ["01012345678"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80"],
        workingHours: "09:00 ص - 01:00 ص",
        rating: 4.5,
        description: "مجمع تجاري مفتوح يضم مطاعم وكافيهات راقية ممتازة للمشي والتسوق.",
        latitude: 30.0335, longitude: 31.4811,
        features: ["suitable_for_groups", "family_friendly", "wheelchair_accessible"]
      },
      {
        id: "mock-2",
        name: "متحف الحضارة المصرية (NMEC)",
        category: "entertainment",
        categoryLabel: "ترفيه",
        subCategories: ["museum"],
        briefLocation: "الفسطاط / القاهرة",
        fullAddress: "عين الصيرة، الفسطاط، القاهرة",
        phones: ["19800"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80"],
        workingHours: "09:00 ص - 05:00 م",
        rating: 4.8,
        description: "متحف عملاق يعرض الحضارة المصرية عبر العصور ويحتوي على قاعة المومياوات الملكية.",
        latitude: 30.0076, longitude: 31.2512,
        features: ["suitable_for_all_ages", "wheelchair_accessible"]
      },
      {
        id: "mock-3",
        name: "حديقة الأسرة (Family Park)",
        category: "public_places",
        categoryLabel: "أماكن عامة",
        subCategories: ["park"],
        briefLocation: "طريق السويس / القاهرة",
        fullAddress: "الكيلو 26 طريق القاهرة السويس الصحراوي",
        phones: ["0224119999"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80"],
        workingHours: "09:00 ص - 10:00 م",
        rating: 4.6,
        description: "حديقة عملاقة للأطفال تحتوي على ملاهي ونهر سحري وسينما 3D ومساحات خضراء شاسعة.",
        latitude: 30.1583, longitude: 31.6214,
        features: ["kids_friendly", "family_friendly"]
      },
      {
        id: "mock-4",
        name: "بين باج كافيه - المعادي",
        category: "food_drinks",
        categoryLabel: "أكل ومشروبات",
        subCategories: ["cafe"],
        briefLocation: "المعادي / القاهرة",
        fullAddress: "شارع 9، المعادي",
        phones: ["01112223334"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80"],
        workingHours: "08:00 ص - 02:00 ص",
        rating: 4.4,
        description: "كافيه مريح للغاية يوفر جلسات بين باجز وWi-Fi سريع ومناسب للدراسة والعمل الجماعي.",
        latitude: 29.9602, longitude: 31.2618,
        features: ["free_wifi", "quiet_place", "accepts_credit_cards"]
      },
      {
        id: "mock-5",
        name: "مول كايرو فيستيفال سيتي",
        category: "shopping",
        categoryLabel: "تسوق",
        subCategories: ["mall"],
        briefLocation: "التجمع الخامس / القاهرة",
        fullAddress: "الطريق الدائري، التجمع الخامس",
        phones: ["16367"],
        googleMapsUrl: "#",
        images: ["https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80"],
        workingHours: "10:00 ص - 12:00 ص",
        rating: 4.7,
        description: "أكبر مولات القاهرة الجديدة، يتميز بالنافورة الراقصة ومجموعة ضخمة من المتاجر والمطاعم والسينمات.",
        latitude: 30.0298, longitude: 31.4082,
        features: ["suitable_for_groups", "family_friendly", "wheelchair_accessible"]
      }
    ];
    pool = [...pool, ...extraMocks];

    let result: Place[] = [];
    if (presetId === "romantic") {
      result = [pool[1], pool[3]]; // Cilantro (Quiet cafe) & Bean bag cafe
    } else if (presetId === "family") {
      result = [pool[4], pool[0], pool[2]]; // Mall -> El Prince -> Azhar Park
    } else if (presetId === "kids") {
      result = [pool[2], pool[0]]; // Family Park -> El Prince
    } else if (presetId === "shopping") {
      result = [pool[4], pool[0]]; // CFC Mall -> Cilantro Cafe
    } else if (presetId === "study") {
      result = [pool[1], pool[3]]; // Cilantro & Bean bag cafe
    } else if (presetId === "tourism" || presetId === "history") {
      result = [pool[2], pool[4]]; // NMEC (Museum) -> Al Azhar Park
    } else {
      result = [pool[0], pool[1], pool[4]]; // El Prince -> Cilantro -> Mall
    }

    setSelectedPlaces(result);
    setOptimized(false);
    triggerAlert(`تم تحميل خطة "${PLAN_PRESETS.find(p => p.id === presetId)?.label}" 🚀`);
  };

  // ── ROUTE OPTIMIZATION ALGORITHM ──
  // Reorders places to minimize total route distance
  const optimizeRoute = () => {
    if (selectedPlaces.length <= 1) return;

    // Nearest Neighbor TSP heuristic based on Lat/Lng
    const places = [...selectedPlaces];
    const optimizedList: Place[] = [];
    
    // Start with the first place in the original list
    let current = places.shift()!;
    optimizedList.push(current);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      // Haversine formula
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    while (places.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < places.length; i++) {
        const dist = getDistance(
          current.latitude || 30.0444, current.longitude || 31.2357,
          places[i].latitude || 30.0444, places[i].longitude || 31.2357
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      current = places.splice(nearestIdx, 1)[0];
      optimizedList.push(current);
    }

    setSelectedPlaces(optimizedList);
    setOptimized(true);
    triggerAlert("تم إعادة ترتيب مسار الرحلة ذكياً لتقليل وقت ومسافة التنقل! 🗺️⚡");
  };

  // ── RECALCULATE DYNAMIC TIMELINE & TRANSIT ──
  const calculateTimelineAndTransit = (): { timeline: ItineraryStop[]; transitLegs: TransitLeg[] } => {
    const timeline: ItineraryStop[] = [];
    const transitLegs: TransitLeg[] = [];

    if (selectedPlaces.length === 0) return { timeline, transitLegs };

    let currentTime = startTime; // "HH:MM"
    
    const addMinutes = (timeStr: string, mins: number): string => {
      const [h, m] = timeStr.split(":").map(Number);
      let totalMins = h * 60 + m + mins;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    const getDistanceBetweenStops = (p1: Place, p2: Place): number => {
      const lat1 = p1.latitude || 30.04, lon1 = p1.longitude || 31.23;
      const lat2 = p2.latitude || 30.04, lon2 = p2.longitude || 31.23;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const activeMode = TRANSIT_MODES.find(m => m.id === transitMode) || TRANSIT_MODES[0];

    selectedPlaces.forEach((place, index) => {
      // 1. Calculate duration spent based on place category
      let spentTime = 120; // Default 2 hours
      if (place.subCategories?.includes("cafe")) spentTime = 90;
      if (place.subCategories?.includes("pharmacy") || place.subCategories?.includes("supermarket")) spentTime = 20;
      if (place.category === "shopping") spentTime = 150;
      if (place.subCategories?.includes("cinema")) spentTime = 180;

      // 2. Base entry/outings costs
      let stopCost = 0;
      if (place.category === "food_drinks") stopCost = 150;
      if (place.subCategories?.includes("restaurant")) stopCost = 250;
      if (place.subCategories?.includes("cafe")) stopCost = 90;
      if (place.subCategories?.includes("cinema")) stopCost = 180;
      if (place.subCategories?.includes("museum")) stopCost = 80;

      const arrival = currentTime;
      const departure = addMinutes(currentTime, spentTime);
      
      timeline.push({
        place,
        duration: spentTime,
        arrivalTime: arrival,
        departureTime: departure,
        costEstimate: stopCost
      });

      // 3. Calculate Transit Leg to the next stop if not last
      if (index < selectedPlaces.length - 1) {
        const nextPlace = selectedPlaces[index + 1];
        const distKm = getDistanceBetweenStops(place, nextPlace);
        
        const legDuration = Math.round((distKm / activeMode.speedKmH) * 60) + 5; // adding 5 mins margin
        const legCost = Math.round(activeMode.baseCost + distKm * activeMode.costFactor * 10);
        const legWalk = activeMode.id === "walking" ? Math.round(distKm * 1000) : Math.round(distKm * 80); // meters to stations
        const transfers = activeMode.id === "metro" && distKm > 10 ? 1 : 0;

        transitLegs.push({
          mode: activeMode.label,
          duration: legDuration,
          cost: legCost,
          walkingDistance: legWalk,
          transfers
        });

        // Set current time for the next place arrival (departure + transit time)
        currentTime = addMinutes(departure, legDuration);
      }
    });

    return { timeline, transitLegs };
  };

  const { timeline, transitLegs } = calculateTimelineAndTransit();

  // Total Cost Calculation
  const totalTransitCost = transitLegs.reduce((sum, leg) => sum + leg.cost, 0);
  const totalPlacesCost = timeline.reduce((sum, stop) => sum + stop.costEstimate, 0);
  const totalCostEst = totalTransitCost + totalPlacesCost;
  const remainingBudget = budget - totalCostEst;

  // ── MOCK INTERACTIVE MAP CANVAS DRAWING ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset Canvas dimension for crisp rendering on high-DPI displays
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Clear background (Cairo-themed map aesthetic)
    ctx.fillStyle = "#1e1e24";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Nile River (Stylized Blue Ribbon across Cairo)
    ctx.strokeStyle = "rgba(0, 111, 238, 0.25)";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(width * 0.45, 0);
    ctx.bezierCurveTo(width * 0.4, height * 0.3, width * 0.5, height * 0.6, width * 0.4, height);
    ctx.stroke();

    // Draw main bridges
    ctx.strokeStyle = "rgba(131, 131, 131, 0.2)";
    ctx.lineWidth = 6;
    // 6th October Bridge
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.4);
    ctx.lineTo(width * 0.9, height * 0.45);
    ctx.stroke();

    // Zamalek Island Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "bold 11px Alexandria";
    ctx.fillText("جزيرة الزمالك", width * 0.36, height * 0.36);
    ctx.fillText("نهر النيل", width * 0.48, height * 0.15);

    // If no places, show central marker
    if (selectedPlaces.length === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "14px Tajawal";
      ctx.textAlign = "center";
      ctx.fillText("حدد الأماكن لعرض مسار الرحلة على الخريطة", width / 2, height / 2);
      return;
    }

    // Map place coordinates onto canvas coordinates
    // We map real Cairo latitudes (29.9 to 30.2) and longitudes (31.1 to 31.5) to canvas coordinates
    const mapCoords = selectedPlaces.map((place, idx) => {
      const lat = place.latitude || 30.0444;
      const lng = place.longitude || 31.2357;

      // Projection mapping (very simple bounding box representation)
      // Min/Max Cairo bounding box
      const minLat = 29.95;
      const maxLat = 30.16;
      const minLng = 31.18;
      const maxLng = 31.5;

      const x = width - ((lng - minLng) / (maxLng - minLng)) * width; // Flip X because of RTL/projection
      const y = height - ((lat - minLat) / (maxLat - minLat)) * height;

      return { x, y, label: place.name, index: idx + 1 };
    });

    // Draw route path between markers
    ctx.strokeStyle = "var(--accent-primary)";
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    mapCoords.forEach((coord, idx) => {
      if (idx === 0) ctx.moveTo(coord.x, coord.y);
      else ctx.lineTo(coord.x, coord.y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw markers
    mapCoords.forEach((coord) => {
      // Glow effect
      const grad = ctx.createRadialGradient(coord.x, coord.y, 2, coord.x, coord.y, 16);
      grad.addColorStop(0, "rgba(0, 111, 238, 0.8)");
      grad.addColorStop(1, "rgba(0, 111, 238, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "var(--accent-primary)";
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw index number
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Tajawal";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(coord.index.toString(), coord.x, coord.y);

      // Label text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Tajawal";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.fillText(coord.label.split(" - ")[0], coord.x, coord.y - 14);
      ctx.shadowBlur = 0; // reset
    });

  }, [selectedPlaces, optimized]);

  // ── SMART ALTERNATIVES SWAPPER ──
  const swapWithAlternative = (indexToSwap: number) => {
    const targetPlace = selectedPlaces[indexToSwap];
    
    // Find alternatives in initialPlaces that match the category but are not already in the list
    const usedIds = selectedPlaces.map(p => p.id);
    const alternatives = initialPlaces.filter(
      p => p.category === targetPlace.category && !usedIds.includes(p.id)
    );

    if (alternatives.length > 0) {
      // Select the first alternative and swap it
      const updated = [...selectedPlaces];
      const selectedAlt = alternatives[0];
      updated[indexToSwap] = selectedAlt;
      setSelectedPlaces(updated);
      triggerAlert(`🔄 تم استبدال "${targetPlace.name}" بـ البديل الذكي "${selectedAlt.name}"!`);
    } else {
      triggerAlert("⚠️ عذراً، لا تتوفر أماكن بديلة في نفس الفئة حالياً.");
    }
  };

  // Add Place Manual Selector handler
  const handleAddManualPlace = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const placeId = e.target.value;
    if (!placeId) return;

    const place = initialPlaces.find(p => p.id === placeId);
    if (place) {
      if (selectedPlaces.some(p => p.id === placeId)) {
        triggerAlert("المكان مضاف بالفعل للرحلة! ⚠️");
        return;
      }
      setSelectedPlaces([...selectedPlaces, place]);
      setOptimized(false);
      triggerAlert(`تمت إضافة "${place.name}" للرحلة 📍`);
    }
    e.target.value = ""; // Reset
  };

  // Remove Stop from Itinerary
  const handleRemoveStop = (index: number) => {
    const updated = selectedPlaces.filter((_, i) => i !== index);
    setSelectedPlaces(updated);
    setOptimized(false);
    triggerAlert("تمت إزالة الوجهة من جدول الرحلة.");
  };

  // Simulate group voting interaction
  const handleVote = (stopId: string, type: "up" | "down") => {
    setGroupVoting(prev => {
      const current = prev[stopId] || { up: Math.floor(Math.random() * 4), down: Math.floor(Math.random() * 2), userVote: null };
      
      let upDiff = 0;
      let downDiff = 0;
      let newVote: "up" | "down" | null = type;

      if (current.userVote === type) {
        // Undo vote
        if (type === "up") upDiff = -1;
        if (type === "down") downDiff = -1;
        newVote = null;
      } else {
        // Shift vote or new vote
        if (current.userVote === "up") upDiff = -1;
        if (current.userVote === "down") downDiff = -1;
        
        if (type === "up") upDiff += 1;
        if (type === "down") downDiff += 1;
      }

      return {
        ...prev,
        [stopId]: {
          up: current.up + upDiff,
          down: current.down + downDiff,
          userVote: newVote
        }
      };
    });

    if (navigator.vibrate) navigator.vibrate(8);
  };

  // Save Preferences
  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cairo_user_prefs", JSON.stringify(userPrefs));
    setShowProfileModal(false);
    
    // Apply preferences dynamic values
    setTransitMode(userPrefs.transit);
    setStartTime(userPrefs.outingTime);
    triggerAlert("تم حفظ وتخصيص تفضيلاتك بنجاح! 👤💾");
  };

  return (
    <div className="planner-container">
      {/* Dynamic Alerts */}
      {showNotification && (
        <div style={{
          position: "fixed",
          top: "84px",
          right: "20px",
          background: "rgba(16, 185, 129, 0.95)",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "14px",
          zIndex: 99999,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontWeight: "700",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "fade-in 0.3s ease"
        }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }} />
          <span>{showNotification}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="planner-header">
        <h1 className="planner-title">مخطط الرحلات الذكي</h1>
        <p className="planner-subtitle">
          حوّل بحثك إلى تجربة متكاملة. خطط ليوم خروج كامل بنفسك أو دع مساعدنا الذكي ينظم لك المسار الأمثل والأوقات والميزانية بلمسة واحدة.
        </p>
      </header>

      {/* MAIN LAYOUT GRID */}
      <div className="planner-grid">
        
        {/* LEFT COLUMN: SETTINGS & CONTROLS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* AI Generation Box */}
          <div className="glass-panel-luxury">
            <h2 className="card-section-title">
              <i className="bx bx-bot" style={{ color: "var(--accent-primary)" }} />
              اسأل الذكاء الاصطناعي 🤖
            </h2>
            <form onSubmit={handleNlpSubmit}>
              <textarea
                className="ios-textarea"
                placeholder="اكتب ما تريده بلغة طبيعية، مثل:
- أريد خروجة رومانسية في التجمع الخامس بميزانية 1000 جنيه.
- مكان هادئ للمذاكرة في مصر الجديدة فيه واي فاي.
- خروجة عائلية مع الأطفال نهاراً."
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="ios-btn ios-btn-primary" 
                style={{ width: "100%", marginTop: "12px", background: "var(--accent-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <i className="bx bx-sparkles" /> خطط ليومي بالكامل
              </button>
            </form>
          </div>

          {/* Preset options */}
          <div className="glass-panel-luxury">
            <h2 className="card-section-title">
              <i className="bx bx-category" style={{ color: "var(--accent-secondary)" }} />
              خطط جاهزة حسب نوع الخروجة
            </h2>
            <div className="presets-grid">
              {PLAN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`preset-pill ${selectedPreset === preset.id ? "active" : ""}`}
                  onClick={() => handlePresetSelect(preset.id)}
                  title={preset.desc}
                >
                  <span className="preset-emoji">{preset.emoji}</span>
                  <span className="preset-label">{preset.label.split(" ")[1] || preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Outing Preferences */}
          <div className="glass-panel-luxury">
            <h2 className="card-section-title">
              <i className="bx bx-slider-alt" style={{ color: "var(--accent-orange)" }} />
              تفضيلات الرحلة
            </h2>

            {/* Manual Place Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>📍 إضافة أماكن يدوياً</label>
              <select className="ios-input" onChange={handleAddManualPlace} style={{ width: "100%", height: "42px", padding: "0 10px" }}>
                <option value="">-- اختر مكان للإضافة --</option>
                {initialPlaces.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.categoryLabel})</option>
                ))}
              </select>
            </div>

            {/* Budget range slider */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>الميزانية المقدرة اليوم</span>
                <span style={{ fontWeight: "700", color: "var(--accent-primary)" }}>{budget} جنيه</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-primary)" }}
              />
            </div>

            <div className="input-row">
              {/* Transport mode selector */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>🚇 وسيلة المواصلات</label>
                <select 
                  className="ios-input" 
                  value={transitMode} 
                  onChange={(e) => setTransitMode(e.target.value)}
                  style={{ width: "100%", height: "42px", padding: "0 10px" }}
                >
                  {TRANSIT_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                  ))}
                </select>
              </div>

              {/* Start Outing time */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>⏰ وقت التحرك</label>
                <input 
                  type="time" 
                  className="ios-input" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: "100%", height: "42px", padding: "0 12px" }}
                />
              </div>
            </div>

            {/* Personalization Profiles Button */}
            <button 
              className="ios-btn"
              onClick={() => setShowProfileModal(true)}
              style={{ width: "100%", marginTop: "14px", border: "1px solid var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <i className="bx bx-user" /> تخصيص حسب اهتماماتك
            </button>
          </div>

          {/* Saved Outings Panel */}
          {savedTrips.length > 0 && (
            <div className="glass-panel-luxury">
              <h2 className="card-section-title">
                <i className="bx bx-bookmark" style={{ color: "var(--accent-pink)" }} />
                رحلاتي المحفوظة 💾
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    onClick={() => handleLoadSavedTrip(trip)}
                    className="timeline-card" 
                    style={{ padding: "12px", cursor: "pointer", border: "1px solid var(--border-glass)" }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{trip.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                        🗓️ {trip.date} • 📍 {trip.stopsCount} محطات • 💵 {trip.totalCost} ج.م
                      </div>
                    </div>
                    <button 
                      className="closeBut"
                      onClick={(e) => handleDeleteSavedTrip(trip.id, e)}
                      style={{ padding: "4px", fontSize: "0.95rem" }}
                      title="حذف الرحلة"
                    >
                      <i className="bx bx-trash" style={{ color: "var(--accent-red)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INTERACTIVE TIMELINE & MAP */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* MAP CANVAS */}
          <div className="glass-panel-luxury" style={{ padding: "16px" }}>
            <div className="map-canvas-container">
              <div className="map-canvas-overlay">خريطة القاهرة الكبرى التفاعلية 📍</div>
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
            </div>

            {/* Optimization Button and indicators */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="bx bx-info-circle" style={{ fontSize: "1.1rem", color: "var(--accent-primary)" }} />
                <span>الخطوط المنقطة تمثل مسارات التنقل الموصى بها.</span>
              </div>
              
              <button 
                onClick={optimizeRoute}
                disabled={selectedPlaces.length <= 1}
                className={`ios-btn ${optimized ? "ios-btn-primary" : ""}`}
                style={{ 
                  padding: "8px 16px", 
                  fontSize: "0.85rem", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  background: optimized ? "rgba(16, 185, 129, 0.15)" : undefined,
                  borderColor: optimized ? "var(--accent-success)" : undefined,
                  color: optimized ? "var(--accent-success)" : undefined
                }}
              >
                <i className="bx bx-directions" /> {optimized ? "تم الترتيب الذكي للأماكن" : "الترتيب التلقائي للمسار ⚡"}
              </button>
            </div>
          </div>

          {/* BUDGET & WEATHER / ALERTS */}
          {selectedPlaces.length > 0 && (
            <div className="glass-panel-luxury">
              <h2 className="card-section-title">
                <i className="bx bx-info-square" style={{ color: "var(--accent-success)" }} />
                توصيات وقرارات ذكية 💡
              </h2>

              {/* Recommendation Banner */}
              <div className="recommendation-banner">
                <span className="recommendation-icon">🌤️</span>
                <div className="recommendation-content">
                  <strong>تنبيه الطقس اليوم:</strong> درجة الحرارة اليوم مرتفعة وتصل لـ 38 درجة مئوية. ننصح بزيارة الأماكن المغلقة (مثل المول) أولاً ثم الأماكن المفتوحة والحدائق (مثل حديقة الأزهر) مساءً للاستمتاع بالهواء الجميل.
                </div>
              </div>

              {/* Transit & Delay Alert */}
              {transitMode === "car" && (
                <div className="recommendation-banner" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <span className="recommendation-icon" style={{ color: "var(--accent-danger)" }}>🚗</span>
                  <div className="recommendation-content">
                    <strong>تنبيه الزحام:</strong> هناك ازدحام شديد على كوبري أكتوبر وطريق صلاح سالم حالياً. ننصح باستخدام <strong>مترو الأنفاق</strong> لأنه سيوفر لك حوالي 25 دقيقة من وقت التنقل.
                  </div>
                </div>
              )}

              {/* Live indicators */}
              <div className="live-details-grid">
                <div className="live-indicator">
                  <span className="live-indicator-icon">🅿️</span>
                  <span>متوفر جراج سيارات</span>
                </div>
                <div className="live-indicator">
                  <span className="live-indicator-icon">📶</span>
                  <span>واي فاي مجاني متوفر</span>
                </div>
                <div className="live-indicator">
                  <span className="live-indicator-icon">👨‍👩‍👧‍👦</span>
                  <span>عائلي بالكامل</span>
                </div>
                <div className="live-indicator">
                  <span className="live-indicator-icon">💳</span>
                  <span>يقبل الدفع الإلكتروني</span>
                </div>
              </div>

              {/* BUDGET COUNTER */}
              <div className="budget-progress-container" style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: "700" }}>مؤشر استهلاك الميزانية:</span>
                  <span style={{ fontWeight: "800", color: remainingBudget < 0 ? "var(--accent-red)" : "var(--accent-success)" }}>
                    {totalCostEst} جنيه من أصل {budget} جنيه
                  </span>
                </div>
                
                <div className="budget-bar-bg">
                  <div 
                    className={`budget-bar-fill ${remainingBudget < 0 ? "overlimit" : ""}`} 
                    style={{ width: `${Math.min(100, (totalCostEst / budget) * 100)}%` }}
                  />
                </div>

                {remainingBudget < 0 && (
                  <p style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginTop: "8px", fontWeight: "700" }}>
                    ⚠️ انتبه: لقد تجاوزت ميزانيتك المحددة بـ {Math.abs(remainingBudget)} جنيه.
                  </p>
                )}

                {/* Budget Breakdown items */}
                <div className="budget-breakdown">
                  <div className="budget-item">
                    <div className="budget-item-title">🚇 الانتقالات</div>
                    <div className="budget-item-value">{totalTransitCost} ج.م</div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-item-title">🍽️ الغداء/المشروبات</div>
                    <div className="budget-item-value">{totalPlacesCost} ج.م</div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-item-title">💵 المتبقي</div>
                    <div className="budget-item-value" style={{ color: remainingBudget < 0 ? "var(--accent-red)" : "var(--accent-success)" }}>
                      {remainingBudget} ج.م
                    </div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-item-title">⏱️ إجمالي الوقت</div>
                    <div className="budget-item-value">~ {selectedPlaces.length * 2} ساعات</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TIMELINE DISPLAY */}
          <div className="glass-panel-luxury">
            <h2 className="card-section-title">
              <i className="bx bx-time-five" style={{ color: "var(--accent-primary)" }} />
              الجدول الزمني للرحلة
            </h2>

            {selectedPlaces.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
                <i className="bx bx-map-pin" style={{ fontSize: "3rem", color: "var(--border-glass-bright)", marginBottom: "12px", display: "block" }} />
                <span>يرجى اختيار أماكن للرحلة بالبحث بالذكاء الاصطناعي أو تحديد الأماكن من القوائم لبناء جدولك الزمني.</span>
              </div>
            ) : (
              <div className="timeline-container">
                
                {/* START OF DAY */}
                <div className="timeline-item">
                  <div className="timeline-badge" />
                  <div className="timeline-time">
                    <i className="bx bx-home-alt" /> {startTime}
                  </div>
                  <div className="timeline-card" style={{ background: "rgba(0, 111, 238, 0.05)" }}>
                    <div className="timeline-card-content">
                      <div className="timeline-card-title">الخروج من المنزل 🚶</div>
                      <div className="timeline-card-desc">بداية الرحلة والتحرك نحو الوجهة الأولى.</div>
                    </div>
                  </div>
                </div>

                {/* STOPS LOOP */}
                {timeline.map((stop, idx) => (
                  <React.Fragment key={stop.place.id}>
                    
                    {/* Transit Connector before this stop (except first transition from home which we keep basic) */}
                    {idx > 0 && transitLegs[idx - 1] && (
                      <div className="transit-connector">
                        <div className="transit-line" />
                        <div className="transit-details">
                          <i className={`bx ${TRANSIT_MODES.find(m => m.label === transitLegs[idx - 1].mode)?.icon || "bx-car"}`} />
                          <span>{transitLegs[idx - 1].mode} ({transitLegs[idx - 1].duration} دقيقة • {transitLegs[idx - 1].cost} جنيه)</span>
                          {transitLegs[idx - 1].walkingDistance > 100 && (
                            <span className="meta-pill">🚶 {transitLegs[idx - 1].walkingDistance} متر مشي</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STOP CARD */}
                    <div className="timeline-item">
                      <div className="timeline-badge" style={{ borderColor: "var(--accent-secondary)" }} />
                      <div className="timeline-time">
                        <i className="bx bx-time" /> {stop.arrivalTime} - {stop.departureTime}
                      </div>
                      
                      <div className="timeline-card">
                        <div className="timeline-card-content">
                          <div className="timeline-card-title">
                            <span>{stop.place.name}</span>
                            <span className="meta-pill meta-pill-accent">{stop.place.categoryLabel}</span>
                          </div>
                          <p className="timeline-card-desc">{stop.place.description}</p>
                          
                          <div className="timeline-card-meta">
                            <span className="meta-pill">📍 {stop.place.briefLocation}</span>
                            <span className="meta-pill">⭐ {stop.place.rating || "4.5"}</span>
                            <span className="meta-pill">⏱️ البقاء: {stop.duration} دقيقة</span>
                            <span className="meta-pill">💵 التكلفة المقدرة: {stop.costEstimate} ج.م</span>
                          </div>
                        </div>

                        {/* Interactive alternative swap */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                          <button 
                            className="closeBut" 
                            onClick={() => handleRemoveStop(idx)}
                            style={{ padding: "4px" }}
                            title="إزالة المكان"
                          >
                            <i className="bx bx-trash" style={{ color: "var(--accent-red)", fontSize: "1rem" }} />
                          </button>
                          
                          <button 
                            className="alternative-btn"
                            onClick={() => swapWithAlternative(idx)}
                            title="عرض مكان بديل في نفس الفئة"
                          >
                            <i className="bx bx-refresh" /> بديل ذكي
                          </button>
                        </div>
                      </div>
                    </div>

                  </React.Fragment>
                ))}

                {/* END OF DAY */}
                <div className="timeline-item">
                  <div className="timeline-badge" />
                  <div className="timeline-time">
                    <i className="bx bx-log-out" /> {timeline[timeline.length - 1]?.departureTime || startTime}
                  </div>
                  <div className="timeline-card" style={{ background: "rgba(0, 0, 0, 0.25)" }}>
                    <div className="timeline-card-content">
                      <div className="timeline-card-title">العودة إلى المنزل 🏡</div>
                      <div className="timeline-card-desc">نهاية يوم رائع والعودة سالماً إلى المنزل.</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ACTION FOOTER */}
            {selectedPlaces.length > 0 && (
              <div className="action-row">
                <button onClick={handleSaveTrip} className="ios-btn" style={{ borderColor: "var(--border-glass-bright)" }}>
                  <i className="bx bx-save" /> حفظ في رحلاتي
                </button>
                <button onClick={handleCopyLink} className="ios-btn" style={{ borderColor: "var(--border-glass-bright)" }}>
                  <i className="bx bx-share-alt" /> مشاركة الرحلة
                </button>
                <button onClick={() => window.print()} className="ios-btn ios-btn-primary" style={{ background: "var(--accent-primary)", color: "#fff" }}>
                  <i className="bx bx-printer" /> طباعة / تحميل PDF
                </button>
              </div>
            )}
          </div>

          {/* GROUP TRIP / COLLABORATION PANEL */}
          {selectedPlaces.length > 0 && (
            <div className="group-collaboration">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px", color: "#af52de", marginBottom: "12px" }}>
                <i className="bx bx-group" /> رحلة جماعية (التعاون والتعليق) 👥
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
                شارك هذه الرحلة مع أصدقائك. يمكن للجميع التصويت على الأماكن المقترحة لإعداد الخطة النهائية معاً.
              </p>

              {/* Members mock */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>المشاركون حالياً:</span>
                <div className="group-member-list">
                  {groupMembers.map((m, idx) => (
                    <div key={idx} className="group-member-avatar" style={{ backgroundColor: m.color, color: "#fff" }} title={m.name}>
                      {m.initials}
                    </div>
                  ))}
                  <div className="group-member-avatar" style={{ border: "1px dashed var(--border-glass)", color: "var(--text-secondary)" }} title="دعوة صديق">
                    +
                  </div>
                </div>
              </div>

              {/* Voting Mockup for each place */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedPlaces.map((place) => {
                  const voteState = groupVoting[place.id] || { up: Math.floor(Math.random() * 3) + 1, down: 0, userVote: null };
                  return (
                    <div key={place.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{place.name.split(" - ")[0]}</span>
                      
                      <div className="group-votes-row">
                        <button 
                          className={`vote-btn ${voteState.userVote === "up" ? "upvoted" : ""}`}
                          onClick={() => handleVote(place.id, "up")}
                        >
                          👍 {voteState.up}
                        </button>
                        <button 
                          className={`vote-btn ${voteState.userVote === "down" ? "downvoted" : ""}`}
                          onClick={() => handleVote(place.id, "down")}
                        >
                          👎 {voteState.down}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ── PERSONALIZATION PROFILE DIALOG ── */}
      {showProfileModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="glass-panel-luxury" style={{ maxWidth: "480px", width: "100%", animation: "fade-in 0.3s ease", border: "1px solid rgba(0, 111, 238, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--accent-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-user-circle" /> الملف الشخصي لتخصيص الرحلات
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
              يتعلم النظام من تفضيلاتك الشخصية ليقترح عليك كافيهات ومطاعم وأماكن خروج تناسب ميزانيتك وذوقك المفضل تلقائياً.
            </p>

            <form onSubmit={handleSavePrefs}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>نوع الأكل المفضل</label>
                  <select 
                    className="ios-input" 
                    value={userPrefs.foodType}
                    onChange={(e) => setUserPrefs({ ...userPrefs, foodType: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 10px" }}
                  >
                    <option value="شرقي">أكل شرقي ومشويات 🥩</option>
                    <option value="ايطالي">بيتزا وباستا إيطالي 🍕</option>
                    <option value="سريع">برجر وفاست فود 🍔</option>
                    <option value="دايت">خيارات صحية ونباتية 🥗</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>المواصلات المفضلة</label>
                  <select 
                    className="ios-input" 
                    value={userPrefs.transit}
                    onChange={(e) => setUserPrefs({ ...userPrefs, transit: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 10px" }}
                  >
                    <option value="car">سيارتي الخاصة 🚗</option>
                    <option value="metro">مترو الأنفاق 🚇</option>
                    <option value="uber">تاكسي / أوبر 🚕</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>أقصى مسافة للمشي (متر)</label>
                  <input 
                    type="number" 
                    className="ios-input" 
                    value={userPrefs.maxWalk}
                    onChange={(e) => setUserPrefs({ ...userPrefs, maxWalk: parseInt(e.target.value) || 500 })}
                    style={{ width: "100%", height: "40px", padding: "0 12px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>الوقت المعتاد للخروج</label>
                  <input 
                    type="time" 
                    className="ios-input" 
                    value={userPrefs.outingTime}
                    onChange={(e) => setUserPrefs({ ...userPrefs, outingTime: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="ios-btn" onClick={() => setShowProfileModal(false)} style={{ flex: 1 }}>
                  إلغاء
                </button>
                <button type="submit" className="ios-btn ios-btn-primary" style={{ flex: 1, background: "var(--accent-primary)", color: "#fff" }}>
                  حفظ التفضيلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
