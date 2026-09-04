"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { initialPlaces, Place, FEATURES_LIST, normalizePlaceCategory, CATEGORIES_STRUCTURE } from "@/data/places";
import { egyptLocations } from "@/data/egypt_locations";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import VoiceInputButton from "@/components/VoiceInputButton";
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

function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "");
}

// Helper to filter out utility / non-leisure places (health, gas stations, government, banks, etc.)
const NON_OUTING_CATEGORIES = ["health", "automotive", "government", "finance", "services"];
const NON_OUTING_SUBCATS = [
  "hospital", "clinic", "pharmacy", "dental_clinic", "eye_center", "lab", "radiology", "ambulance",
  "gas_station", "car_service", "car_dealer", "tire_shop", "car_wash", "parking",
  "government_office", "police_station", "fire_station", "court", "post_office", "registry_office",
  "bank", "atm", "exchange",
  "laundry", "locksmith", "plumber", "electrician", "ac_service", "shipping", "moving_service"
];

export function isOutingPlace(place: Place): boolean {
  if (!place) return false;
  if (NON_OUTING_CATEGORIES.includes(place.category)) return false;
  if (place.subCategories?.some(sub => NON_OUTING_SUBCATS.includes(sub))) return false;
  return true;
}

interface StartingZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const STARTING_ZONES: StartingZone[] = [
  { id: "center", name: "وسط البلد / القاهرة", lat: 30.0444, lng: 31.2357 },
  { id: "tagamoa", name: "التجمع الخامس / القاهرة الجديدة", lat: 30.0298, lng: 31.4082 },
  { id: "heliopolis", name: "مصر الجديدة / الكوربة", lat: 30.0911, lng: 31.3235 },
  { id: "maadi", name: "المعادي", lat: 29.9602, lng: 31.2618 },
  { id: "zayed", name: "الشيخ زايد / 6 أكتوبر", lat: 30.0458, lng: 30.9782 },
  { id: "zamalek", name: "الزمالك", lat: 30.0571, lng: 31.2223 },
  { id: "nasrcity", name: "مدينة نصر", lat: 30.0566, lng: 31.3301 },
  { id: "dokki", name: "الدقي / المهندسين", lat: 30.0406, lng: 31.2069 },
  { id: "shorouk", name: "الشروق / الرحاب", lat: 30.1189, lng: 31.6045 },
  { id: "embaba", name: "إمبابة / الجيزة", lat: 30.0762, lng: 31.2081 },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isPlaceWithinZone(place: Place, startLat: number, startLng: number, maxDriveMins: number): boolean {
  if (!place) return false;
  const pLat = typeof place.latitude === "number" && !isNaN(place.latitude) && place.latitude !== 0 ? place.latitude : 30.0444;
  const pLng = typeof place.longitude === "number" && !isNaN(place.longitude) && place.longitude !== 0 ? place.longitude : 31.2357;

  const distKm = haversineDistance(startLat, startLng, pLat, pLng);
  // Average city driving speed ~30 km/h -> 0.5 km per min (~2 mins per km)
  const estDriveMins = Math.round(distKm * 2);
  return estDriveMins <= maxDriveMins;
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

const AI_QUICK_PROMPTS = [
  { emoji: "☕", label: "مذاكرة وشغل هادئ", prompt: "مكان هادئ للمذاكرة والعمل فيه واي فاي سريع وكافيه لطيف" },
  { emoji: "❤️", label: "خروجة كابلز وعشاء رومانسي", prompt: "خروجة كابلز رومانسية مكان هادئ ومطعم راقي على النيل" },
  { emoji: "👨‍👩‍👧", label: "يوم عائلي وملاهي أطفال", prompt: "خروجة عائلية ممتعة مع الأطفال فيها ملاهي أو حديقة ومطعم مناسب" },
  { emoji: "🍕", label: "جولة فود وتذوق", prompt: "جولة طعام وأكلات شرقية أو برجر ومطاعم مشهورة ومميزة" },
  { emoji: "🛍️", label: "شوبينج ومول وسينما", prompt: "يوم تسوق في مول كبير مع سينما وكافيه للاستراحة" },
  { emoji: "🕌", label: "جولة تاريخية وتراثية", prompt: "رحلة أثرية وتاريخية بين المعالم والمساجد القديمة وشارع المعز" },
  { emoji: "💰", label: "خروجة شبابية اقتصادية", prompt: "خروجة شبابية لطيفة بميزانية اقتصادية وتوفير في التنقل" }
];

const AI_VIBES = [
  { id: "all", label: "الكل 🌟" },
  { id: "quiet", label: "هدوء واسترخاء 🌿" },
  { id: "romantic", label: "رومانسي ❤️" },
  { id: "family", label: "عائلي 👨‍👩‍👧" },
  { id: "active", label: "حيوية ومغامرة ⚡" },
  { id: "luxury", label: "راقي وفاخر ✨" },
  { id: "budget", label: "اقتصادي 💰" }
];

const AI_TIME_SLOTS = [
  { id: "all", label: "أي وقت ⏱️" },
  { id: "morning", label: "فطار وصباح ☀️" },
  { id: "afternoon", label: "غداء وبعد الظهر 🌤️" },
  { id: "evening", label: "سهرة وعشاء 🌙" }
];

export default function PlannerPage() {
  const { user, profile, loading: authLoading } = useAuth();

  // ── DYNAMIC PLACES STATE FROM DATABASE ──
  const [allPlaces, setAllPlaces] = useState<Place[]>(initialPlaces);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [manualSearchTerm, setManualSearchTerm] = useState<string>("");

  // ── START LOCATION & DRIVE TIME ZONE STATES (MANDATORY GPS) ──
  const [selectedStartZone, setSelectedStartZone] = useState<string>("gps");
  const [customGpsLocation, setCustomGpsLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [maxDriveMinutes, setMaxDriveMinutes] = useState<number>(60); // Default max 60 mins drive (~30 km radius)
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showGpsModal, setShowGpsModal] = useState<boolean>(false);

  // ── ADVANCED SEARCH FILTERS STATE ──
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<string>("all");
  const [searchRatingFilter, setSearchRatingFilter] = useState<number>(0);
  const [searchZoneOnly, setSearchZoneOnly] = useState<boolean>(true);

  const getPlacesCountInActiveZone = (driveMins: number = maxDriveMinutes): number => {
    const activeStart = getActiveStartLocation();
    return allPlaces
      .filter(isOutingPlace)
      .filter(p => isPlaceWithinZone(p, activeStart.lat, activeStart.lng, driveMins)).length;
  };

  const getActiveStartLocation = (): { lat: number; lng: number; name: string } => {
    if (customGpsLocation) {
      return customGpsLocation;
    }
    const found = STARTING_ZONES.find(z => z.id === selectedStartZone);
    if (found) return { lat: found.lat, lng: found.lng, name: found.name };
    return { lat: STARTING_ZONES[0].lat, lng: STARTING_ZONES[0].lng, name: STARTING_ZONES[0].name };
  };

  const handleGetGpsLocation = (showSuccessAlert = true) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("خاصية تحديد الموقع غير مدعومة في جهازك أو متصفحك.");
      if (showSuccessAlert) triggerAlert("⚠️ خاصية تحديد الموقع غير مدعومة في متصفحك.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCustomGpsLocation({
          lat: latitude,
          lng: longitude,
          name: "موقعي الحالي المباشر (GPS)"
        });
        setSelectedStartZone("gps");
        setGpsLoading(false);
        setShowGpsModal(false);
        if (showSuccessAlert) {
          triggerAlert("📍 تم تحديد موقعك الحالي المباشر (GPS) بنجاح ورسم الرحلة حوله!");
        }
      },
      (error) => {
        console.error("GPS location error:", error);
        setGpsLoading(false);
        setGpsError("يرجى السماح بالحصول على موقعك (GPS) من إعدادات المتصفح للاستمرار.");
        if (showSuccessAlert) {
          triggerAlert("🔴 يلزم تفعيل موقع الـ GPS لتخطيط الرحلة حول مكانك المباشر.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Auto-request GPS on page load
  useEffect(() => {
    handleGetGpsLocation(false);
  }, []);

  // ── STATES ──
  const [nlpInput, setNlpInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [budget, setBudget] = useState<number>(1000);
  const [transitMode, setTransitMode] = useState<string>("car");
  const [startTime, setStartTime] = useState<string>("14:00");
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [optimized, setOptimized] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // ── AI ASSISTANT STATES ──
  const [aiIsGenerating, setAiIsGenerating] = useState<boolean>(false);
  const [aiThinkingStep, setAiThinkingStep] = useState<string>("");
  const [selectedVibe, setSelectedVibe] = useState<string>("all");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("all");
  const [aiExplanation, setAiExplanation] = useState<{
    summary: string;
    matchedTags: string[];
    tips: string[];
  } | null>(null);

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

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  // ── 1. FETCH LIVE PLACES FROM SUPABASE ON MOUNT ──
  useEffect(() => {
    const fetchLivePlaces = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("places")
          .select("*, branches(*)")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching places for AI planner:", error);
          return;
        }

        if (data && data.length > 0) {
          const mappedPlaces: Place[] = data.map((dbPlace: any) => {
            const rawCategory = dbPlace.category;
            const initialSubCats = Array.isArray(dbPlace.sub_categories) ? [...dbPlace.sub_categories] : [];
            const { category: finalCategory, categoryLabel: defaultLabel, subCategories: finalSubCategories } = normalizePlaceCategory(rawCategory, initialSubCats);

            let briefLoc = dbPlace.brief_location || "";
            if (!briefLoc) {
              if (dbPlace.governorate && dbPlace.city) {
                briefLoc = `${dbPlace.city} / ${dbPlace.governorate}`;
              } else if (dbPlace.city) {
                briefLoc = dbPlace.city;
              } else if (dbPlace.governorate) {
                briefLoc = dbPlace.governorate;
              } else if (dbPlace.full_address) {
                briefLoc = dbPlace.full_address;
              }
            }

            return {
              id: dbPlace.id,
              name: dbPlace.name,
              name_en: dbPlace.name_en || "",
              category: finalCategory,
              categoryLabel: dbPlace.category_label || defaultLabel || finalCategory,
              subCategories: finalSubCategories,
              place_type: dbPlace.place_type || "",
              place_type_icon: dbPlace.place_type_icon || "",
              governorate: dbPlace.governorate,
              city: dbPlace.city,
              briefLocation: briefLoc,
              shortDescription: dbPlace.short_description || "",
              fullAddress: dbPlace.full_address || "",
              phones: Array.isArray(dbPlace.phones) ? dbPlace.phones : (dbPlace.phones ? [dbPlace.phones] : []),
              googleMapsUrl: dbPlace.google_maps_url || "",
              images: Array.isArray(dbPlace.images) ? dbPlace.images : (dbPlace.images ? [dbPlace.images] : []),
              menuImages: Array.isArray(dbPlace.menu_images) ? dbPlace.menu_images : [],
              workingHours: dbPlace.working_hours || "",
              rating: typeof dbPlace.rating === "number" ? dbPlace.rating : 4.5,
              reviewsCount: dbPlace.reviews_count || 0,
              description: dbPlace.description || dbPlace.short_description || "",
              latitude: typeof dbPlace.latitude === "number" && !isNaN(dbPlace.latitude) ? dbPlace.latitude : 30.0444,
              longitude: typeof dbPlace.longitude === "number" && !isNaN(dbPlace.longitude) ? dbPlace.longitude : 31.2357,
              features: Array.isArray(dbPlace.features) ? dbPlace.features : [],
              services: Array.isArray(dbPlace.services) ? dbPlace.services : [],
              branches: Array.isArray(dbPlace.branches) ? dbPlace.branches : []
            };
          });

          // Merge DB places with initialPlaces (without duplication)
          const existingIds = new Set(mappedPlaces.map(p => p.id));
          const existingNames = new Set(mappedPlaces.map(p => normalizeArabic(p.name).trim().toLowerCase()));
          const combined = [...mappedPlaces];

          initialPlaces.forEach(p => {
            if (!existingIds.has(p.id) && !existingNames.has(normalizeArabic(p.name).trim().toLowerCase())) {
              combined.push(p);
            }
          });

          setAllPlaces(combined);
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.error("Failed to load live admin places for planner:", err);
      }
    };

    fetchLivePlaces();
  }, []);

  // ── 2. LOAD SAVED TRIPS & SHARED LINKS ON MOUNT / DATA CHANGE ──
  useEffect(() => {
    // Read saved trips & prefs from localStorage
    const saved = localStorage.getItem("cairo_saved_trips");
    if (saved) {
      try { setSavedTrips(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    const savedPrefs = localStorage.getItem("cairo_user_prefs");
    if (savedPrefs) {
      try { setUserPrefs(JSON.parse(savedPrefs)); } catch (e) { console.error(e); }
    }

    // Read query parameters
    const params = new URLSearchParams(window.location.search);
    const placeIdsParam = params.get("places");

    if (placeIdsParam) {
      const ids = placeIdsParam.split(",");
      const loadedPlaces = ids
        .map(id => allPlaces.find(p => p.id === id))
        .filter((p): p is Place => p !== undefined);
      if (loadedPlaces.length > 0) {
        setSelectedPlaces(loadedPlaces);
        const mode = params.get("transit") || "car";
        setTransitMode(mode);
        const time = params.get("start") || "14:00";
        setStartTime(time);
        const budgetParam = params.get("budget");
        if (budgetParam) setBudget(parseInt(budgetParam) || 1000);
        triggerAlert("تم تحميل مسار الرحلة بنجاح! 🎉");
        return;
      }
    }

    // Default preset plan
    if (selectedPlaces.length === 0) {
      handlePresetSelect("family", allPlaces);
    }
  }, [allPlaces]);

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
      .map(id => allPlaces.find(p => p.id === id))
      .filter((p): p is Place => p !== undefined);
    if (loadedPlaces.length > 0) {
      setSelectedPlaces(loadedPlaces);
      triggerAlert(`تم تحميل: ${trip.title}`);
    } else {
      triggerAlert("⚠️ بعض الأماكن في هذه الرحلة لم تعد متوفرة.");
    }
  };

  // ── DYNAMIC PRESETS GENERATOR BASED ON ALL PLACES & ZONE CONSTRAINT ──
  const handlePresetSelect = (presetId: string, placesSource: Place[] = allPlaces) => {
    if (!customGpsLocation && selectedStartZone === "gps") {
      setShowGpsModal(true);
      handleGetGpsLocation(true);
      return;
    }
    setSelectedPreset(presetId);
    const rawPool = placesSource.length > 0 ? placesSource : initialPlaces;
    const activeStart = getActiveStartLocation();

    // 1. Strict filter for genuine leisure places
    // 2. Filter within maximum drive time zone (e.g. <= 60 mins drive)
    let pool = rawPool
      .filter(isOutingPlace)
      .filter(p => isPlaceWithinZone(p, activeStart.lat, activeStart.lng, maxDriveMinutes));

    // Fallback: If strict drive limit yields empty pool, expand zone up to 60 mins
    if (pool.length < 2) {
      pool = rawPool
        .filter(isOutingPlace)
        .filter(p => isPlaceWithinZone(p, activeStart.lat, activeStart.lng, 60));
    }

    if (pool.length === 0) pool = rawPool.filter(isOutingPlace);

    let result: Place[] = [];

    const quietPlaces = pool.filter(p => p.features?.includes("quiet_place") || p.subCategories?.includes("cafe") || p.subCategories?.includes("park"));
    const familyPlaces = pool.filter(p => p.features?.includes("family_friendly") || p.category === "public_places" || p.category === "shopping" || p.category === "entertainment");
    const kidsPlaces = pool.filter(p => p.features?.includes("kids_friendly") || p.category === "entertainment" || p.subCategories?.includes("park") || p.subCategories?.includes("toy_store"));
    const shoppingPlaces = pool.filter(p => p.category === "shopping" || p.subCategories?.includes("mall"));
    const foodPlaces = pool.filter(p => p.category === "food_drinks" || p.subCategories?.includes("restaurant"));
    const studyPlaces = pool.filter(p => p.features?.includes("free_wifi") || p.features?.includes("quiet_place") || p.subCategories?.includes("cafe"));
    const tourismPlaces = pool.filter(p => p.category === "tourism" || p.category === "religion" || p.subCategories?.includes("museum"));
    const luxuryPlaces = pool.filter(p => (p.rating || 0) >= 4.5 || p.category === "tourism" || p.category === "shopping");
    const budgetPlaces = pool.filter(p => (p.rating || 0) >= 4.0);

    if (presetId === "romantic") {
      result = quietPlaces.length >= 2 ? quietPlaces.slice(0, 2) : [foodPlaces[0], quietPlaces[0]].filter((p): p is Place => p !== undefined);
    } else if (presetId === "family") {
      const mainAttraction = familyPlaces.find(p => p.category === "public_places" || p.category === "shopping" || p.category === "entertainment") || familyPlaces[0] || pool[0];
      const food = foodPlaces.find(p => p.id !== mainAttraction?.id) || pool.find(p => p.id !== mainAttraction?.id) || pool[0];
      const cafe = quietPlaces.find(p => p.id !== mainAttraction?.id && p.id !== food?.id) || pool.find(p => p.id !== mainAttraction?.id && p.id !== food?.id) || pool[1];
      result = [mainAttraction, food, cafe].filter((p): p is Place => p !== undefined);
    } else if (presetId === "kids") {
      result = kidsPlaces.length >= 2 ? kidsPlaces.slice(0, 2) : [familyPlaces[0], foodPlaces[0]].filter((p): p is Place => p !== undefined);
    } else if (presetId === "shopping") {
      const mall = shoppingPlaces[0] || pool[0];
      const cafe = quietPlaces.find(p => p.id !== mall?.id) || pool.find(p => p.id !== mall?.id) || pool[1];
      result = [mall, cafe].filter((p): p is Place => p !== undefined);
    } else if (presetId === "food") {
      const rest = foodPlaces[0] || pool[0];
      const dessertOrCafe = foodPlaces.find(p => p.id !== rest?.id && (p.subCategories?.includes("bakery") || p.subCategories?.includes("cafe"))) || foodPlaces.find(p => p.id !== rest?.id) || pool[1];
      result = [rest, dessertOrCafe].filter((p): p is Place => p !== undefined);
    } else if (presetId === "study" || presetId === "business") {
      result = studyPlaces.length >= 2 ? studyPlaces.slice(0, 2) : [quietPlaces[0], foodPlaces[0]].filter((p): p is Place => p !== undefined);
    } else if (presetId === "tourism" || presetId === "history") {
      const site = tourismPlaces[0] || pool[0];
      const food = foodPlaces.find(p => p.id !== site?.id) || pool.find(p => p.id !== site?.id) || pool[1];
      result = [site, food].filter((p): p is Place => p !== undefined);
    } else if (presetId === "luxury") {
      result = luxuryPlaces.slice(0, 3);
    } else if (presetId === "budget") {
      result = budgetPlaces.slice(0, 3);
    } else {
      result = pool.slice(0, 3);
    }

    const uniqueResult = Array.from(new Set(result));
    if (uniqueResult.length < 2) {
      const remaining = pool.filter(p => !uniqueResult.some(r => r.id === p.id));
      result = [...uniqueResult, ...remaining.slice(0, 3 - uniqueResult.length)];
    } else {
      result = uniqueResult;
    }

    setSelectedPlaces(result);
    setOptimized(false);
    triggerAlert(`📍 تم تحميل خطة "${PLAN_PRESETS.find(p => p.id === presetId)?.label || presetId}" في زون ${activeStart.name} (حتى ${maxDriveMinutes} دقيقة قيادة)!`);
  };

  // ── ADVANCED AI PLANNER ENGINE & MULTI-STEP REASONING ──
  const executeAiPlanner = async (customPrompt?: string, customVibe?: string, customTimeSlot?: string) => {
    if (!customGpsLocation && selectedStartZone === "gps") {
      setShowGpsModal(true);
      handleGetGpsLocation(true);
      return;
    }

    const queryText = (customPrompt !== undefined ? customPrompt : nlpInput).trim();
    const activeVibe = customVibe !== undefined ? customVibe : selectedVibe;
    const activeSlot = customTimeSlot !== undefined ? customTimeSlot : selectedTimeSlot;

    if (!queryText && activeVibe === "all" && activeSlot === "all") {
      triggerAlert("يرجى كتابة رغبتك أو اختيار إحدى الكبسولات المقترحة أولاً! 💡");
      return;
    }

    setAiIsGenerating(true);
    setAiThinkingStep("🧠 جاري تحليل رغباتك والبحث في قاعدة بيانات الأماكن...");

    // Simulated thinking step 1
    await new Promise((res) => setTimeout(res, 350));
    setAiThinkingStep("📍 مطابقة الأماكن الحية المتوافقة مع نطاق القيادة والمنطقة...");

    const normInput = normalizeArabic(queryText).toLowerCase();

    // 1. Time Slot Adjustments
    let targetStartTime = startTime;
    if (activeSlot === "morning" || normInput.includes("صباح") || normInput.includes("فطار") || normInput.includes("روقان")) {
      targetStartTime = "09:30";
      setStartTime("09:30");
    } else if (activeSlot === "afternoon" || normInput.includes("عصر") || normInput.includes("غدا") || normInput.includes("نهار")) {
      targetStartTime = "14:00";
      setStartTime("14:00");
    } else if (activeSlot === "evening" || normInput.includes("سهرة") || normInput.includes("عشا") || normInput.includes("ليل")) {
      targetStartTime = "19:00";
      setStartTime("19:00");
    }

    // 2. Budget extraction from text
    let targetBudget = budget;
    const budgetMatch = queryText.match(/\b(\d{3,5})\b/);
    if (budgetMatch) {
      const parsedBudget = parseInt(budgetMatch[1]);
      if (parsedBudget >= 100 && parsedBudget <= 20000) {
        targetBudget = parsedBudget;
        setBudget(parsedBudget);
      }
    }

    // 3. Location Detection across major areas
    const knownAreas = [
      "التجمع", "القاهرة الجديدة", "مصر الجديدة", "الكوربة", "الزمالك", "المعادي", "الشيخ زايد",
      "اكتوبر", "إمبابة", "وسط البلد", "الدقي", "المهندسين", "مدينة نصر", "الهرم", "شبرا", "المقطم",
      "الرحاب", "الشروق", "مدينتي", "العاصمة الإدارية", "المعز", "الحسين", "المنيل", "جاردن سيتي",
      "شيراتون", "النزهة", "حدائق الأهرام", "العباسية", "روكسي"
    ];

    let detectedArea = "";
    for (const loc of knownAreas) {
      if (normInput.includes(normalizeArabic(loc).toLowerCase())) {
        detectedArea = loc;
        break;
      }
    }

    // 4. Filter Candidates by Outing & Active Zone
    const activeStart = getActiveStartLocation();
    let pool = allPlaces
      .filter(isOutingPlace)
      .filter(p => isPlaceWithinZone(p, activeStart.lat, activeStart.lng, maxDriveMinutes));

    if (pool.length < 3) {
      pool = allPlaces
        .filter(isOutingPlace)
        .filter(p => isPlaceWithinZone(p, activeStart.lat, activeStart.lng, 60));
    }
    if (pool.length === 0) pool = allPlaces.filter(isOutingPlace);

    if (detectedArea) {
      const normLoc = normalizeArabic(detectedArea).toLowerCase();
      const locFiltered = pool.filter(p => {
        const fullLocText = normalizeArabic(`${p.governorate || ''} ${p.city || ''} ${p.briefLocation || ''} ${p.fullAddress || ''}`).toLowerCase();
        return fullLocText.includes(normLoc);
      });
      if (locFiltered.length >= 2) {
        pool = locFiltered;
      }
    }

    // Step 2: Scoring and Selection
    await new Promise((res) => setTimeout(res, 350));
    setAiThinkingStep("🗺️ ترتيب مسار الرحلة الذكي وحساب المواعيد والتكلفة...");

    // Vibe & Intent Classification
    const isRomantic = activeVibe === "romantic" || normInput.includes("رومانس") || normInput.includes("كابلز") || normInput.includes("هدوء");
    const isFamily = activeVibe === "family" || normInput.includes("عائل") || normInput.includes("عيله") || normInput.includes("اهل") || normInput.includes("اطفال") || normInput.includes("العاب");
    const isStudy = activeVibe === "quiet" || normInput.includes("مذاكر") || normInput.includes("دراسه") || normInput.includes("واي فاي") || normInput.includes("شغل") || normInput.includes("عمل");
    const isFood = normInput.includes("اكل") || normInput.includes("مطعم") || normInput.includes("مشويات") || normInput.includes("وجبه") || normInput.includes("برجر");
    const isShopping = normInput.includes("تسوق") || normInput.includes("شوبينج") || normInput.includes("مول") || normInput.includes("سينما");
    const isHistory = normInput.includes("تاريخ") || normInput.includes("اسلامي") || normInput.includes("مسجد") || normInput.includes("اثر") || normInput.includes("متحف");
    const isLuxury = activeVibe === "luxury" || normInput.includes("فاخر") || normInput.includes("راقي") || targetBudget >= 2500;
    const isBudgetTier = activeVibe === "budget" || normInput.includes("اقتصادي") || normInput.includes("توفير") || targetBudget <= 400;

    let selected: Place[] = [];

    if (isRomantic) {
      const quietCafes = pool.filter(p => p.features?.includes("quiet_place") || p.subCategories?.includes("cafe"));
      const romanticRestaurants = pool.filter(p => p.category === "food_drinks" || p.subCategories?.includes("restaurant"));
      const scenicPlaces = pool.filter(p => p.features?.includes("outdoor_seating") || p.category === "public_places");

      const p1 = romanticRestaurants[0] || pool[0];
      const p2 = quietCafes.find(p => p.id !== p1?.id) || scenicPlaces.find(p => p.id !== p1?.id) || pool[1];
      selected = [p1, p2].filter((p): p is Place => p !== undefined);
      setSelectedPreset("romantic");
    } else if (isFamily) {
      const attractions = pool.filter(p => p.features?.includes("family_friendly") || p.features?.includes("kids_friendly") || p.category === "entertainment" || p.category === "public_places" || p.category === "shopping");
      const familyFood = pool.filter(p => p.category === "food_drinks" || p.subCategories?.includes("restaurant"));
      const dessertOrCafe = pool.filter(p => p.subCategories?.includes("cafe") || p.subCategories?.includes("bakery"));

      const p1 = attractions[0] || pool[0];
      const p2 = familyFood.find(p => p.id !== p1?.id) || pool.find(p => p.id !== p1?.id) || pool[1];
      const p3 = dessertOrCafe.find(p => p.id !== p1?.id && p.id !== p2?.id) || pool.find(p => p.id !== p1?.id && p.id !== p2?.id) || pool[2];
      selected = [p1, p2, p3].filter((p): p is Place => p !== undefined);
      setSelectedPreset("family");
    } else if (isStudy) {
      const wifiPlaces = pool.filter(p => p.features?.includes("free_wifi") || p.features?.includes("quiet_place") || p.subCategories?.includes("cafe"));
      const snackPlace = pool.filter(p => p.category === "food_drinks");
      const p1 = wifiPlaces[0] || pool[0];
      const p2 = wifiPlaces.find(p => p.id !== p1?.id) || snackPlace.find(p => p.id !== p1?.id) || pool[1];
      selected = [p1, p2].filter((p): p is Place => p !== undefined);
      setSelectedPreset("study");
    } else if (isShopping) {
      const malls = pool.filter(p => p.category === "shopping" || p.subCategories?.includes("mall"));
      const cafe = pool.filter(p => p.subCategories?.includes("cafe") || p.features?.includes("quiet_place"));
      const food = pool.filter(p => p.category === "food_drinks");
      const p1 = malls[0] || pool[0];
      const p2 = food.find(p => p.id !== p1?.id) || pool[1];
      const p3 = cafe.find(p => p.id !== p1?.id && p.id !== p2?.id) || pool[2];
      selected = [p1, p2, p3].filter((p): p is Place => p !== undefined);
      setSelectedPreset("shopping");
    } else if (isFood) {
      const mainRest = pool.filter(p => p.category === "food_drinks" || p.subCategories?.includes("restaurant"));
      const sweetCafe = pool.filter(p => p.subCategories?.includes("bakery") || p.subCategories?.includes("cafe"));
      const p1 = mainRest[0] || pool[0];
      const p2 = sweetCafe.find(p => p.id !== p1?.id) || mainRest.find(p => p.id !== p1?.id) || pool[1];
      selected = [p1, p2].filter((p): p is Place => p !== undefined);
      setSelectedPreset("food");
    } else if (isHistory) {
      const heritage = pool.filter(p => p.category === "tourism" || p.category === "religion" || p.subCategories?.includes("museum"));
      const localFood = pool.filter(p => p.category === "food_drinks");
      const p1 = heritage[0] || pool[0];
      const p2 = localFood.find(p => p.id !== p1?.id) || pool[1];
      selected = [p1, p2].filter((p): p is Place => p !== undefined);
      setSelectedPreset("history");
    } else {
      const topRated = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      const p1 = topRated.find(p => p.category === "public_places" || p.category === "shopping" || p.category === "entertainment") || topRated[0];
      const p2 = topRated.find(p => p.id !== p1?.id && p.category === "food_drinks") || topRated[1];
      const p3 = topRated.find(p => p.id !== p1?.id && p.id !== p2?.id && (p.subCategories?.includes("cafe") || p.features?.includes("quiet_place"))) || topRated[2];
      selected = [p1, p2, p3].filter((p): p is Place => p !== undefined);
      setSelectedPreset("family");
    }

    if (selected.length < 2) {
      const remainder = pool.filter(p => !selected.some(s => s.id === p.id));
      selected = [...selected, ...remainder.slice(0, 3 - selected.length)];
    }

    await new Promise((res) => setTimeout(res, 250));

    setSelectedPlaces(selected);
    setOptimized(false);
    setAiIsGenerating(false);

    // Build intelligent AI Explanation
    const areaMention = detectedArea ? `في منطقة ${detectedArea}` : `في محيط ${activeStart.name}`;
    const placesNames = selected.map(p => `"${p.name}"`).join(" ثم ");

    setAiExplanation({
      summary: `قام الذكاء الاصطناعي بتحليل طلبك ونسق لك خطة متكاملة ${areaMention} تشمل ${placesNames}، متوافقة مع الميزانية والوقت المحدد بدقة.`,
      matchedTags: [
        `📍 ${areaMention}`,
        `💰 ميزانية ~${targetBudget} جنيه`,
        `⭐ تقييمات موثوقة (${selected.map(p => p.rating || 4.5).join("، ")})`,
        `⏱️ البدء الساعة ${targetStartTime}`,
        `🚗 ضمن ${maxDriveMinutes} دقيقة قيادة`
      ],
      tips: [
        `🚗 أفضل وسيلة تنقل مقترحة: ${transitMode === "car" ? "السيارة الخاصة أو أوبر لسرعة وسلاسة الوصول" : "المترو والمواصلات العامة لتوفير التكلفة"}.`,
        `⏰ يفضل الوصول إلى ${selected[0]?.name || "المحطة الأولى"} في الموعد لتجنب أوقات الذروة وازدحام الطرق.`,
        `💳 التكلفة الإجمالية التقديرية محسوبة لتناسب ميزانية ${targetBudget} جنيه المحددة لليوم بالكامل.`
      ]
    });

    triggerAlert(`✨ تم توليد خطة ذكية مخصصة بنجاح بواسطة AI Planner! 🎉`);
  };

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAiPlanner();
  };

  // ── ROUTE OPTIMIZATION ALGORITHM ──
  const optimizeRoute = () => {
    if (selectedPlaces.length <= 1) return;

    const places = [...selectedPlaces];
    const optimizedList: Place[] = [];

    let current = places.shift()!;
    optimizedList.push(current);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
      let totalMins = (h || 0) * 60 + (m || 0) + mins;
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
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const activeMode = TRANSIT_MODES.find(m => m.id === transitMode) || TRANSIT_MODES[0];

    selectedPlaces.forEach((place, index) => {
      let spentTime = 120; // Default 2 hours
      if (place.subCategories?.includes("cafe")) spentTime = 90;
      if (place.subCategories?.includes("pharmacy") || place.subCategories?.includes("supermarket")) spentTime = 20;
      if (place.category === "shopping") spentTime = 150;
      if (place.subCategories?.includes("cinema")) spentTime = 180;

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

      if (index < selectedPlaces.length - 1) {
        const nextPlace = selectedPlaces[index + 1];
        const distKm = getDistanceBetweenStops(place, nextPlace);

        const legDuration = Math.round((distKm / activeMode.speedKmH) * 60) + 5;
        const legCost = Math.round(activeMode.baseCost + distKm * activeMode.costFactor * 10);
        const legWalk = activeMode.id === "walking" ? Math.round(distKm * 1000) : Math.round(distKm * 80);
        const transfers = activeMode.id === "metro" && distKm > 10 ? 1 : 0;

        transitLegs.push({
          mode: activeMode.label,
          duration: legDuration,
          cost: legCost,
          walkingDistance: legWalk,
          transfers
        });

        currentTime = addMinutes(departure, legDuration);
      }
    });

    return { timeline, transitLegs };
  };

  const { timeline, transitLegs } = calculateTimelineAndTransit();

  const totalTransitCost = transitLegs.reduce((sum, leg) => sum + leg.cost, 0);
  const totalPlacesCost = timeline.reduce((sum, stop) => sum + stop.costEstimate, 0);
  const totalCostEst = totalTransitCost + totalPlacesCost;
  const remainingBudget = budget - totalCostEst;

  // ── DYNAMIC MAP CANVAS DRAWING BASED ON REAL GEOGRAPHIC COORDINATES ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Dark Map Aesthetic
    ctx.fillStyle = "#18181c";
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines (Subtle coordinate grid)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (selectedPlaces.length === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "14px Tajawal, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📍 اختر أو ولد رحلة لعرض النقاط الحقيقية على الخريطة", width / 2, height / 2);
      return;
    }

    // Extract valid lat/lng for selected places (defaulting to Cairo Center if missing)
    const validPlaces = selectedPlaces.map(p => ({
      ...p,
      lat: typeof p.latitude === "number" && !isNaN(p.latitude) && p.latitude !== 0 ? p.latitude : 30.0444,
      lng: typeof p.longitude === "number" && !isNaN(p.longitude) && p.longitude !== 0 ? p.longitude : 31.2357
    }));

    const lats = validPlaces.map(p => p.lat);
    const lngs = validPlaces.map(p => p.lng);

    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);

    // Ensure minimum bounding box size (~4 km margin minimum) so single/close points fit nicely
    const minSpan = 0.04;
    if (maxLat - minLat < minSpan) {
      const midLat = (maxLat + minLat) / 2;
      minLat = midLat - minSpan / 2;
      maxLat = midLat + minSpan / 2;
    }
    if (maxLng - minLng < minSpan) {
      const midLng = (maxLng + minLng) / 2;
      minLng = midLng - minSpan / 2;
      maxLng = midLng + minSpan / 2;
    }

    // Add 15% padding margin to bounding box
    const latPadding = (maxLat - minLat) * 0.15;
    const lngPadding = (maxLng - minLng) * 0.15;

    const paddedMinLat = minLat - latPadding;
    const paddedMaxLat = maxLat + latPadding;
    const paddedMinLng = minLng - lngPadding;
    const paddedMaxLng = maxLng + lngPadding;

    const padding = 50; // Canvas pixel margin from edges

    // Project real geographic coordinates (Lat/Lng) to Canvas (X/Y)
    const mapCoords = validPlaces.map((place, idx) => {
      // Longitude (West to East) -> X axis (Left to Right)
      const x = padding + ((place.lng - paddedMinLng) / (paddedMaxLng - paddedMinLng)) * (width - 2 * padding);
      // Latitude (South to North) -> Y axis (Bottom to Top, inverted for canvas Y)
      const y = (height - padding) - ((place.lat - paddedMinLat) / (paddedMaxLat - paddedMinLat)) * (height - 2 * padding);

      return {
        x,
        y,
        lat: place.lat,
        lng: place.lng,
        label: place.name,
        briefLoc: place.briefLocation || place.governorate || "",
        categoryLabel: place.categoryLabel,
        index: idx + 1,
        place
      };
    });

    // Draw Nile River ribbon if longitude range covers Cairo (approx 31.23° E)
    const nileLng = 31.23;
    if (nileLng >= paddedMinLng && nileLng <= paddedMaxLng) {
      const nileX = padding + ((nileLng - paddedMinLng) / (paddedMaxLng - paddedMinLng)) * (width - 2 * padding);
      ctx.strokeStyle = "rgba(0, 111, 238, 0.25)";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(nileX, 0);
      ctx.bezierCurveTo(nileX - 15, height * 0.35, nileX + 20, height * 0.65, nileX - 10, height);
      ctx.stroke();

      ctx.fillStyle = "rgba(0, 150, 255, 0.4)";
      ctx.font = "10px Alexandria, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("نهر النيل", nileX, 24);
    }

    // Draw Compass & Coordinates Scale Bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "bold 10px Tajawal, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🧭 N (الشمال)", 14, 20);

    // Latitude / Longitude boundary indicators
    ctx.font = "9px Tajawal, monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillText(`${paddedMaxLat.toFixed(3)}° N`, 14, 34);
    ctx.fillText(`${paddedMinLat.toFixed(3)}° N`, 14, height - 12);
    ctx.textAlign = "right";
    ctx.fillText(`${paddedMaxLng.toFixed(3)}° E`, width - 14, height - 12);

    // Draw Route Path Lines between points
    if (mapCoords.length > 1) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      mapCoords.forEach((coord, idx) => {
        if (idx === 0) ctx.moveTo(coord.x, coord.y);
        else ctx.lineTo(coord.x, coord.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Point Markers with Exact Coordinates & Labels
    mapCoords.forEach((coord) => {
      // Glow Outer Circle
      const grad = ctx.createRadialGradient(coord.x, coord.y, 2, coord.x, coord.y, 18);
      grad.addColorStop(0, "rgba(59, 130, 246, 0.7)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // Core Marker Pin
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Number inside Marker
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Tajawal, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(coord.index.toString(), coord.x, coord.y);

      // Label Box above Marker
      ctx.font = "bold 11px Tajawal, sans-serif";
      const nameText = coord.label.split(" - ")[0];
      const coordsText = `${coord.lat.toFixed(4)}°, ${coord.lng.toFixed(4)}°`;

      const boxWidth = Math.max(ctx.measureText(nameText).width, ctx.measureText(coordsText).width) + 16;
      const boxHeight = 32;
      const boxX = Math.max(8, Math.min(width - boxWidth - 8, coord.x - boxWidth / 2));
      const boxY = coord.y - 44;

      // Card Background
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Text Title
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(nameText, boxX + boxWidth / 2, boxY + 4);

      // Coordinates Subtitle
      ctx.fillStyle = "#60a5fa";
      ctx.font = "9px Tajawal, monospace";
      ctx.fillText(`📍 ${coordsText}`, boxX + boxWidth / 2, boxY + 18);
    });

  }, [selectedPlaces, optimized]);

  // ── SMART ALTERNATIVES SWAPPER USING DATABASE PLACES ──
  const swapWithAlternative = (indexToSwap: number) => {
    const targetPlace = selectedPlaces[indexToSwap];

    const usedIds = selectedPlaces.map(p => p.id);
    const alternatives = allPlaces.filter(
      p => isOutingPlace(p) && (p.category === targetPlace.category || p.subCategories?.some(sub => targetPlace.subCategories?.includes(sub))) && !usedIds.includes(p.id)
    );

    if (alternatives.length > 0) {
      // Select a random alternative from matched list
      const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
      const updated = [...selectedPlaces];
      updated[indexToSwap] = randomAlt;
      setSelectedPlaces(updated);
      triggerAlert(`🔄 تم استبدال "${targetPlace.name}" بـ البديل الذكي "${randomAlt.name}" من قاعدة البيانات!`);
    } else {
      triggerAlert("⚠️ عذراً، لا تتوفر أماكن بديلة في نفس الفئة حالياً في الداتا بيز.");
    }
  };

  // Add Place Manual Selector handler
  const handleAddManualPlace = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const placeId = e.target.value;
    if (!placeId) return;

    const place = allPlaces.find(p => p.id === placeId);
    if (place) {
      if (selectedPlaces.some(p => p.id === placeId)) {
        triggerAlert("المكان مضاف بالفعل للرحلة! ⚠️");
        return;
      }
      setSelectedPlaces([...selectedPlaces, place]);
      setOptimized(false);
      triggerAlert(`تمت إضافة "${place.name}" للرحلة 📍`);
    }
    e.target.value = "";
  };

  // Remove Stop from Itinerary
  const handleRemoveStop = (index: number) => {
    const updated = selectedPlaces.filter((_, i) => i !== index);
    setSelectedPlaces(updated);
    setOptimized(false);
    triggerAlert("تمت إزالة الوجهة من جدول الرحلة.");
  };

  // Save Preferences
  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cairo_user_prefs", JSON.stringify(userPrefs));
    setShowProfileModal(false);

    setTransitMode(userPrefs.transit);
    setStartTime(userPrefs.outingTime);
    triggerAlert("تم حفظ وتخصيص تفضيلاتك بنجاح! 👤💾");
  };

  // Advanced Filter places for manual dropdown & search list
  const filteredManualPlaces = allPlaces.filter(p => {
    if (!isOutingPlace(p)) return false;

    // Filter within selected drive zone if active
    if (searchZoneOnly) {
      const startLoc = getActiveStartLocation();
      if (!isPlaceWithinZone(p, startLoc.lat, startLoc.lng, maxDriveMinutes)) return false;
    }

    // Filter by Category
    if (searchCategoryFilter !== "all" && p.category !== searchCategoryFilter) return false;

    // Filter by Minimum Rating
    if (searchRatingFilter > 0 && (p.rating || 0) < searchRatingFilter) return false;

    // Filter by Text Term
    if (!manualSearchTerm.trim()) return true;
    const term = normalizeArabic(manualSearchTerm).toLowerCase();
    const nameNorm = normalizeArabic(p.name).toLowerCase();
    const catNorm = normalizeArabic(p.categoryLabel || "").toLowerCase();
    const locNorm = normalizeArabic(`${p.governorate || ''} ${p.city || ''} ${p.briefLocation || ''} ${p.fullAddress || ''}`).toLowerCase();
    const descNorm = normalizeArabic(p.shortDescription || p.description || "").toLowerCase();

    return nameNorm.includes(term) || catNorm.includes(term) || locNorm.includes(term) || descNorm.includes(term);
  });

  if (authLoading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1rem" }}>جاري التحقق من تفاصيل الاشتراك...</p>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="app-container" style={{ maxWidth: "600px", paddingTop: "60px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--colorSecondary, #3b82f6)",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "0.95rem"
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(234, 179, 8, 0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />

          <div style={{
            marginBottom: "24px",
          }}>
            <img src="images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--textPrimary)", marginBottom: "14px" }}>
            ميزة البحث عن خطوط المواصلات تتطلب اشتراك في الباقة الذهبية
          </h2>

          <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "460px", margin: "0 auto 24px" }}>
            استخدم الذكاء الاصطناعي لتخطيط رحلاتك وجولاتك الترفيهية وحساب التكلفة والمسارات بدقة. هذه الميزة متاحة حصرياً لمشتركي الباقة الذهبية.
          </p>

          <div style={{
            background: "var(--bgSecondary)",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid var(--borderGlass)",
            textAlign: "right",
            margin: "0 auto 24px",
            maxWidth: "420px"
          }}>
            <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.9rem", marginBottom: "8px" }}>ميزات الباقة الذهبية :</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ توليد خطط رحلات متكاملة بناءً على الميزانية واهتماماتك</li>
              <li>✨ ربط حي ومباشر بكافة الأماكن المضافة من الإدارة في الموقع</li>
              <li>✨ تصدير وحفظ الرحلات وحساب تكلفة المواصلات والتنقل والوقت بدقة</li>
              <li>✨ تصويت جماعي ومشاركة الخطط مع أصدقائك في نفس الوقت</li>
            </ul>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
            {user ? (
              <Link
                href="/profile?expand=subscription"
                style={{
                  padding: "var(--paddingBtn)",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--bg-subscribe-button-gold)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  border: "1px solid var(--br-subscribe-button-gold)",
                  display: "block"
                }}
              >
                اشترك الآن في الباقة الذهبية
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
                background: "var(--cancelBtn)",
                color: "var(--textPrimary)",
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
    );
  }

  return (
    <div className="planner-container">
      {/* Dynamic Alerts */}
      {showNotification && (
        <div className="planner-notification-toast">
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

        {/* Database Connectivity Status Badge */}
        <div
          className="planner-status-badge"
          style={{
            background: isLiveConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(234, 179, 8, 0.1)",
            border: `1px solid ${isLiveConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(234, 179, 8, 0.3)"}`,
            color: isLiveConnected ? "#10b981" : "#eab308"
          }}
        >
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isLiveConnected ? "#10b981" : "#eab308",
            boxShadow: `0 0 8px ${isLiveConnected ? "#10b981" : "#eab308"}`
          }} />
          <span>
            {isLiveConnected
              ? `مربوط حياً بقاعدة بيانات القاهرة (${allPlaces.length} مكان متاح من الإدارة)`
              : `الأماكن الافتراضية (${allPlaces.length} مكان)`}
          </span>
        </div>
      </header>

      {/* MAIN LAYOUT GRID */}
      <div className="planner-grid">

        {/* LEFT COLUMN: SETTINGS & CONTROLS */}
        <div className="planner-col">

          {/* Starting Location & Drive Zone Card */}
          <div className="glass-panel-luxury" style={{ border: "1px solid rgba(59, 130, 246, 0.35)" }}>
            <h2 className="card-section-title" style={{ color: "var(--colorSecondary, #3b82f6)" }}>
              <i className="bx bx-map-pin" />
              نقطة الانطلاق ونطاق الزون 📍
            </h2>

            {/* Start Location Dropdown + GPS button */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                📍 موقع الانطلاق (نقطة البداية)
              </label>

              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  className="input-fields"
                  value={selectedStartZone}
                  onChange={(e) => setSelectedStartZone(e.target.value)}
                  style={{ flex: 1, height: "42px", padding: "0 10px" }}
                >
                  {customGpsLocation && (
                    <option value="gps">📍 موقعي الحالي (GPS)</option>
                  )}
                  {STARTING_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleGetGpsLocation(true)}
                  className="btn"
                  disabled={gpsLoading}
                  style={{ height: "42px", padding: "0 14px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", background: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.3)", color: "var(--colorPrimary)" }}
                  title="تحديد موقعك الحالي عبر الـ GPS"
                >
                  <i className={`bx ${gpsLoading ? "bx-loader-alt bx-spin" : "bx-target-lock"}`} style={{ fontSize: "1.1rem" }} />
                  <span>{gpsLoading ? "جاري..." : "GPS"}</span>
                </button>
              </div>
            </div>

            {/* Max Drive Time Range Slider (15 mins to 60 mins max) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                <span style={{ color: "var(--textSecondary)" }}>أقصى وقت قيادة بالسيارة</span>
                <span style={{ fontWeight: "800", color: "var(--colorPrimary)" }}>{maxDriveMinutes} دقيقة (~{Math.round(maxDriveMinutes * 0.5)} كم)</span>
              </div>

              <input
                type="range"
                min="15"
                max="60"
                step="15"
                value={maxDriveMinutes}
                onChange={(e) => setMaxDriveMinutes(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--colorPrimary)" }}
              />

              <div className="planner-slider-labels">
                <span>15 دقيقة</span>
                <span>30 دقيقة</span>
                <span>45 دقيقة</span>
                <span>60 دقيقة (ساعة)</span>
              </div>
            </div>

            {/* Active Zone Information Badge */}
            <div style={{
              marginTop: "14px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              fontSize: "0.78rem",
              color: "var(--textPrimary)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <i className="bx bx-radar" style={{ color: "var(--colorPrimary)", fontSize: "1.2rem" }} />
              <span>
                محيط الرحلة: محصورة في زون لا يتعدى <strong>{maxDriveMinutes} دقيقة قيادة</strong> من <strong>{getActiveStartLocation().name}</strong> ({getPlacesCountInActiveZone()} مكان ترفيهي متوفر).
              </span>
            </div>

            {/* EMPTY / LOW PLACES IN ZONE WARNING BANNER */}
            {getPlacesCountInActiveZone() < 2 && (
              <div style={{
                marginTop: "12px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                color: "var(--textPrimary)",
                fontSize: "0.82rem",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-orange)", fontWeight: "800" }}>
                  <i className="bx bx-error-circle" style={{ fontSize: "1.3rem" }} />
                  <span>⚠️ لا توجد أماكن كافية في نطاق {maxDriveMinutes} دقيقة!</span>
                </div>
                <p style={{ color: "var(--textSecondary)", fontSize: "0.8rem", lineHeight: "1.5" }}>
                  المسافة المختارة صغيرة جداً بالنسبة لموقع الانطلاق. يرجى زيادة وقت القيادة أو اختيار مسافة أكبر (مثلاً 45 أو 60 دقيقة) لتوسيع نطاق البحث وإتاحة خيارات أفضل.
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setMaxDriveMinutes(45)}
                    className="btn"
                    style={{ flex: 1, height: "34px", fontSize: "0.78rem", background: "rgba(245, 158, 11, 0.18)", borderColor: "rgba(245, 158, 11, 0.4)", color: "var(--accent-orange)", fontWeight: "bold" }}
                  >
                    45 دقيقة
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxDriveMinutes(60)}
                    className="btn"
                    style={{ flex: 1, height: "34px", fontSize: "0.78rem", background: "var(--colorPrimary)", color: "#fff", border: "none", fontWeight: "bold" }}
                  >
                    60 دقيقة (ساعة)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced AI Assistant Panel */}
          <div className="ai-assistant-panel">
            {/* Header with AI Badge & Engine indicator */}
            <div className="ai-badge-header">
              <h2 className="card-section-title" style={{ margin: 0, padding: 0, border: "none" }}>
                <i className="bx bx-bot" style={{ color: "var(--colorPrimary)", fontSize: "1.4rem" }} />
                <span>اسأل الذكاء الاصطناعي 🤖</span>
              </h2>
              <div className="ai-engine-pill">
                <span className="ai-dot-pulse" />
                <span>Cairo AI Engine v2.5</span>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <div className="ai-quick-prompts-title">
                <i className="bx bx-bulb" style={{ color: "var(--accent-orange)" }} />
                <span>كبسولات اقتراحات ذكية وسريعة:</span>
              </div>
              <div className="ai-chips-wrapper">
                {AI_QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ai-prompt-chip"
                    onClick={() => {
                      setNlpInput(item.prompt);
                      executeAiPlanner(item.prompt);
                    }}
                    title="اضغط للتوليد الفوري لهذه الخطة"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe Selection Filter */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "0.76rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>
                🎭 اختر جو الخروجة المطلوب (Vibe):
              </label>
              <div className="ai-vibes-row">
                {AI_VIBES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`ai-vibe-btn ${selectedVibe === v.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedVibe(v.id);
                      if (nlpInput.trim()) executeAiPlanner(undefined, v.id);
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "0.76rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>
                ⏰ التوقيت المفضل لبدء اليوم:
              </label>
              <div className="ai-vibes-row">
                {AI_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`ai-vibe-btn ${selectedTimeSlot === slot.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTimeSlot(slot.id);
                      if (slot.id === "morning") setStartTime("09:30");
                      if (slot.id === "afternoon") setStartTime("14:00");
                      if (slot.id === "evening") setStartTime("19:00");
                    }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Text Input & Voice Input Form */}
            <form onSubmit={handleNlpSubmit}>
              <div style={{ position: "relative" }}>
                <textarea
                  className="ios-textarea"
                  style={{ minHeight: "110px", paddingBottom: "40px" }}
                  placeholder="اكتب كل ما في بالك بلغة طبيعية أو تحدث صوتياً، مثلاً:
- عايز خروجة رومانسية هادية في الزمالك على النيل بميزانية 1000 جنيه.
- مكان مناسب للمذاكرة والشغل في مصر الجديدة مع كافيه فيه واي فاي سريع.
- خروجة عائلية مع الأطفال نهاراً في المعادي فيها ألعاب وغداء."
                  value={nlpInput}
                  onChange={(e) => setNlpInput(e.target.value)}
                />

                {/* Embedded Voice Button */}
                <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 5 }}>
                  <VoiceInputButton onTranscript={(text) => {
                    setNlpInput(prev => (prev ? `${prev} ${text}` : text));
                  }} />
                </div>
              </div>

              {/* Submit / Generate Button */}
              <button
                type="submit"
                disabled={aiIsGenerating}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginTop: "12px",
                  background: aiIsGenerating ? "rgba(0, 111, 238, 0.6)" : "var(--colorPrimary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontWeight: "700",
                  height: "46px"
                }}
              >
                {aiIsGenerating ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.2rem" }} />
                    <span>جاري التفكير والتخطيط الذكي...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-sparkles" style={{ fontSize: "1.2rem" }} />
                    <span>خطط ليومي بالذكاء الاصطناعي 🤖</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Thinking Step Visual Card */}
            {aiIsGenerating && (
              <div className="ai-thinking-card">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--colorPrimary)", fontWeight: "700", fontSize: "0.85rem" }}>
                  <i className="bx bx-chip bx-spin" style={{ fontSize: "1.2rem" }} />
                  <span>معالجة الطلب الذكي:</span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--textPrimary)", paddingRight: "8px" }}>
                  {aiThinkingStep}
                </div>
              </div>
            )}

            {/* AI Insights & Reasoning Breakdown Card */}
            {aiExplanation && !aiIsGenerating && (
              <div className="ai-insights-box">
                <div className="ai-insights-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--colorPrimary)", fontWeight: "800", fontSize: "0.88rem" }}>
                    <i className="bx bx-brain" style={{ fontSize: "1.2rem" }} />
                    <span>تقرير وتحليل المساعد الذكي:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => executeAiPlanner()}
                    className="btn"
                    style={{ height: "28px", padding: "0 8px", fontSize: "0.72rem", gap: "4px" }}
                    title="توليد خيارات وأماكن بديلة"
                  >
                    <i className="bx bx-refresh" />
                    <span>توليد بدائل</span>
                  </button>
                </div>

                <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--textPrimary)", lineHeight: "1.6" }}>
                  {aiExplanation.summary}
                </p>

                {/* Matched Criteria Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  {aiExplanation.matchedTags.map((tag, i) => (
                    <span key={i} style={{
                      background: "rgba(0, 111, 238, 0.1)",
                      border: "1px solid rgba(0, 111, 238, 0.2)",
                      borderRadius: "12px",
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      color: "var(--colorPrimary)",
                      fontWeight: "600"
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Personalized Travel Tips */}
                <div style={{ borderTop: "1px solid var(--borderGlass)", paddingTop: "8px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px" }}>
                    💡 إرشادات ونصائح مخصصة للرحلة:
                  </div>
                  <ul className="ai-tips-list">
                    {aiExplanation.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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

            {/* Advanced Search & Manual Place Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.82rem", color: "var(--textSecondary)", display: "block", marginBottom: "8px", fontWeight: "700" }}>
                🔍 بحث وتصفية متقدمة للأماكن
              </label>

              {/* Text Search Input */}
              <input
                type="text"
                placeholder="🔍 ابحث بالاسم، الوصف، الكاتيجوري، أو المنطقة..."
                value={manualSearchTerm}
                onChange={(e) => setManualSearchTerm(e.target.value)}
                className="input-fields"
                style={{ width: "100%", height: "38px", padding: "0 12px", fontSize: "0.85rem", marginBottom: "8px" }}
              />

              {/* Multi-filter row: Category & Rating */}
              <div className="planner-filter-grid">
                <select
                  className="input-fields"
                  value={searchCategoryFilter}
                  onChange={(e) => setSearchCategoryFilter(e.target.value)}
                  style={{ height: "38px", padding: "0 8px", fontSize: "0.82rem" }}
                >
                  <option value="all">كل الفئات والتصنيفات</option>
                  <option value="food_drinks">مطاعم وكافيهات 🍽️</option>
                  <option value="shopping">مولات وتسوق 🛍️</option>
                  <option value="entertainment">ملاهي وترفيه 🎡</option>
                  <option value="public_places">متنزهات وحدائق 🌿</option>
                  <option value="tourism">متاحف وسياحة 🏛️</option>
                </select>

                <select
                  className="input-fields"
                  value={searchRatingFilter}
                  onChange={(e) => setSearchRatingFilter(parseFloat(e.target.value))}
                  style={{ height: "38px", padding: "0 8px", fontSize: "0.82rem" }}
                >
                  <option value={0}>كل التقييمات</option>
                  <option value={4.5}>⭐ 4.5+ الممتازة</option>
                  <option value={4.0}>⭐ 4.0+ الجيدة جداً</option>
                </select>
              </div>

              {/* Zone Filter Checkbox Toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "var(--textSecondary)", marginBottom: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={searchZoneOnly}
                  onChange={(e) => setSearchZoneOnly(e.target.checked)}
                  style={{ accentColor: "var(--colorPrimary)" }}
                />
                <span>📍 تقييد نتائج البحث بأماكن زون ({maxDriveMinutes} دقيقة) فقط</span>
              </label>

              {/* Results Dropdown Selector */}
              <select className="input-fields" onChange={handleAddManualPlace} style={{ width: "100%", height: "42px", padding: "0 10px" }}>
                <option value="">-- اختر مكان للإضافة ({filteredManualPlaces.length} مكان مطابق) --</option>
                {filteredManualPlaces.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.briefLocation ? `(${p.briefLocation})` : `(${p.categoryLabel})`} - ⭐ {p.rating || "4.5"}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget range slider */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                <span style={{ color: "var(--textSecondary)" }}>الميزانية المقدرة اليوم</span>
                <span style={{ fontWeight: "700", color: "var(--colorPrimary)" }}>{budget} جنيه</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--colorPrimary)" }}
              />
            </div>

            <div className="input-row">
              {/* Transport mode selector */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>🚇 وسيلة المواصلات</label>
                <select
                  className="input-fields"
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
                <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>⏰ وقت التحرك</label>
                <input
                  type="time"
                  className="input-fields"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: "100%", height: "42px", padding: "0 12px" }}
                />
              </div>
            </div>

            {/* Personalization Profiles Button */}
            <button
              className="btn"
              onClick={() => setShowProfileModal(true)}
              style={{ width: "100%", marginTop: "14px", border: "1px solid var(--borderGlass)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
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
                    style={{ padding: "12px", cursor: "pointer", border: "1px solid var(--borderGlass)" }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{trip.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", marginTop: "4px" }}>
                        🗓️ {trip.date} • 📍 {trip.stopsCount} محطات • 💵 {trip.totalCost} ج.م
                      </div>
                    </div>
                    <button
                      className="closeBtn"
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
        <div className="planner-col">

          {/* MAP CANVAS */}
          <div className="glass-panel-luxury" style={{ padding: "16px" }}>
            <div className="map-canvas-container">
              <div className="map-canvas-overlay">خريطة القاهرة الكبرى التفاعلية 📍</div>
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
            </div>

            {/* Optimization Button and indicators */}
            <div className="map-actions-row">
              <div style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="bx bx-info-circle" style={{ fontSize: "1.1rem", color: "var(--colorPrimary)" }} />
                <span>الخطوط المنقطة تمثل مسارات التنقل الموصى بها.</span>
              </div>

              <button
                onClick={optimizeRoute}
                disabled={selectedPlaces.length <= 1}
                className={`btn ${optimized ? "btn-primary" : ""}`}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: optimized ? "rgba(16, 185, 129, 0.15)" : undefined,
                  borderColor: optimized ? "var(--colorSuccess)" : undefined,
                  color: optimized ? "var(--colorSuccess)" : undefined
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
                <i className="bx bx-info-square" style={{ color: "var(--colorSuccess)" }} />
                توصيات وقرارات ذكية 💡
              </h2>

              {/* Recommendation Banner */}
              <div className="recommendation-banner">
                <span className="recommendation-icon">🌤️</span>
                <div className="recommendation-content">
                  <strong>تنبيه الطقس اليوم:</strong> درجة الحرارة اليوم مناسبة للخروج. ننصح بتصفح مواعيد العمل والعناوين الرسمية المدونة في كروت الأماكن بالأسفل.
                </div>
              </div>

              {/* Transit & Delay Alert */}
              {transitMode === "car" && (
                <div className="recommendation-banner" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <span className="recommendation-icon" style={{ color: "var(--accent-danger)" }}>🚗</span>
                  <div className="recommendation-content">
                    <strong>تنبيه الزحام:</strong> هناك ازدحام متوقع في أوقات الذروة. ينصح باستخدام <strong>مترو الأنفاق</strong> أو التخطيط المسبق لتوفير الوقت.
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
              <div className="budget-progress-container" style={{ borderTop: "1px solid var(--borderGlass)", paddingTop: "14px", marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: "700" }}>مؤشر استهلاك الميزانية:</span>
                  <span style={{ fontWeight: "800", color: remainingBudget < 0 ? "var(--accent-red)" : "var(--colorSuccess)" }}>
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
                    <div className="budget-item-value" style={{ color: remainingBudget < 0 ? "var(--accent-red)" : "var(--colorSuccess)" }}>
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
              <i className="bx bx-time-five" style={{ color: "var(--colorPrimary)" }} />
              الجدول الزمني للرحلة
            </h2>

            {selectedPlaces.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--textSecondary)" }}>
                <i className="bx bx-map-pin" style={{ fontSize: "3rem", color: "var(--borderGlass-bright)", marginBottom: "12px", display: "block" }} />
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
                  <React.Fragment key={`${stop.place.id}-${idx}`}>

                    {/* Transit Connector before this stop */}
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
                          <div className="timeline-card-title" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <Link href={`/places/${stop.place.id}`} target="_blank" style={{ color: "var(--textPrimary)", textDecoration: "none", fontWeight: "bold" }}>
                              {stop.place.name}
                            </Link>
                            <span className="meta-pill meta-pill-accent">{stop.place.categoryLabel}</span>
                          </div>

                          <p className="timeline-card-desc">{stop.place.description || stop.place.shortDescription}</p>

                          <div className="timeline-card-meta">
                            <span className="meta-pill">📍 {stop.place.briefLocation || stop.place.fullAddress}</span>
                            <span className="meta-pill">⭐ {stop.place.rating || "4.5"}</span>
                            <span className="meta-pill">⏱️ البقاء: {stop.duration} دقيقة</span>
                            <span className="meta-pill">💵 التكلفة المقدرة: {stop.costEstimate} ج.م</span>
                          </div>
                        </div>

                        {/* Interactive alternative swap */}
                        <div className="timeline-card-actions">
                          <button
                            className="alternative-btn"
                            onClick={() => swapWithAlternative(idx)}
                            title="عرض مكان بديل في نفس الفئة"
                          >
                            <i className="bx bx-refresh" /> بديل ذكي
                          </button>

                          <button
                            className="closeBtn"
                            onClick={() => handleRemoveStop(idx)}
                            title="إزالة المكان"
                          >
                            <i className="bx bx-trash" style={{ color: "var(--accent-red)", fontSize: "1rem" }} />
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
                <button onClick={handleSaveTrip} className="btn" style={{ borderColor: "var(--borderGlass-bright)" }}>
                  <i className="bx bx-save" /> حفظ في رحلاتي
                </button>
                <button onClick={handleCopyLink} className="btn" style={{ borderColor: "var(--borderGlass-bright)" }}>
                  <i className="bx bx-share-alt" /> مشاركة الرحلة
                </button>
                <button onClick={() => window.print()} className="btn btn-primary" style={{ background: "var(--colorPrimary)", color: "#fff" }}>
                  <i className="bx bx-printer" /> طباعة / تحميل PDF
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── PERSONALIZATION PROFILE DIALOG ── */}
      {showProfileModal && (
        <div className="planner-modal-overlay">
          <div className="glass-panel-luxury planner-modal-content" style={{ border: "1px solid rgba(0, 111, 238, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--colorPrimary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-user-circle" /> الملف الشخصي لتخصيص الرحلات
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", marginBottom: "20px", lineHeight: "1.5" }}>
              يتعلم النظام من تفضيلاتك الشخصية ليقترح عليك كافيهات ومطاعم وأماكن خروج تناسب ميزانيتك وذوقك المفضل تلقائياً.
            </p>

            <form onSubmit={handleSavePrefs}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>نوع الأكل المفضل</label>
                  <select
                    className="input-fields"
                    value={userPrefs.foodType}
                    onChange={(e) => setUserPrefs({ ...userPrefs, foodType: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 10px" }}
                  >
                    <option value="شرقي">أكل شرقي ومشويات 🥩</option>
                    <option value="ايطالي">بيتزا وباستا إيطالي 🍕</option>
                    <option value="سريع">برجر وفاست فود 🍔</option>
                    <option value="دايت">خيارات صحية ونباتية 🥗</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>المواصلات المفضلة</label>
                  <select
                    className="input-fields"
                    value={userPrefs.transit}
                    onChange={(e) => setUserPrefs({ ...userPrefs, transit: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 10px" }}
                  >
                    <option value="car">سيارتي الخاصة 🚗</option>
                    <option value="metro">مترو الأنفاق 🚇</option>
                    <option value="uber">تاكسي / أوبر 🚕</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>أقصى مسافة للمشي (متر)</label>
                  <input
                    type="number"
                    className="input-fields"
                    value={userPrefs.maxWalk}
                    onChange={(e) => setUserPrefs({ ...userPrefs, maxWalk: parseInt(e.target.value) || 500 })}
                    style={{ width: "100%", height: "42px", padding: "0 12px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>الوقت المعتاد للخروج</label>
                  <input
                    type="time"
                    className="input-fields"
                    value={userPrefs.outingTime}
                    onChange={(e) => setUserPrefs({ ...userPrefs, outingTime: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn" onClick={() => setShowProfileModal(false)} style={{ flex: 1, height: "44px" }}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: "44px", background: "var(--colorPrimary)", color: "#fff" }}>
                  حفظ التفضيلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY GPS ACTIVATION MODAL */}
      {showGpsModal && !customGpsLocation && (
        <div className="planner-modal-overlay">
          <div className="glass-panel-luxury planner-modal-content" style={{
            textAlign: "center",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.15)",
              border: "2px solid var(--colorPrimary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "2rem",
              color: "var(--colorPrimary)"
            }}>
              <i className={`bx ${gpsLoading ? "bx-loader-alt bx-spin" : "bx-current-location"}`} />
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "10px", color: "var(--textPrimary)" }}>
              تفعيل موقع الـ GPS إجباري 📍
            </h2>

            <p style={{ fontSize: "0.9rem", color: "var(--textSecondary)", lineHeight: "1.6", marginBottom: "20px" }}>
              لتخطيط رحلة دقيقة ومحصورة في زون قيادة لا يتعدى ساعة من مكانك الفعلي، يرجى السماح بالوصول لموقعك المباشر.
            </p>

            {gpsError && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--accent-red)",
                fontSize: "0.82rem",
                marginBottom: "18px"
              }}>
                ⚠️ {gpsError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => handleGetGpsLocation(true)}
                className="btn btn-primary"
                disabled={gpsLoading}
                style={{
                  width: "100%",
                  height: "46px",
                  background: "var(--colorPrimary)",
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <i className={`bx ${gpsLoading ? "bx-loader-alt bx-spin" : "bx-target-lock"}`} />
                {gpsLoading ? "جاري تحديد الموقع..." : "📍 تفعيل ومشاركة موقعي الآن (GPS)"}
              </button>

              <button
                onClick={() => setShowGpsModal(false)}
                className="btn"
                style={{ width: "100%", height: "40px", fontSize: "0.85rem", color: "var(--textSecondary)" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
