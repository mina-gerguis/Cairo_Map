"use client";
import { LuReplaceAll } from "react-icons/lu";
import { RiEditFill } from "react-icons/ri";
import { MdFolderDelete } from "react-icons/md";
import { TbCashEdit } from "react-icons/tb";

import { AiOutlineBranches } from "react-icons/ai";
import { FaMapPin, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { BiSolidMapPin } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { MdOutlineIosShare } from "react-icons/md";

const AVAILABLE_INTERESTS_MAP: Record<string, { label: string; icon: string }> = {
  restaurants: { label: "مطاعم", icon: "bx bx-restaurant" },
  drinks: { label: "مشروبات", icon: "bx bx-coffee" },
  family: { label: "اماكن عائلية", icon: "bx bx-home-heart" },
  kids: { label: "اماكن للأطفال", icon: "bx bx-child" },
  hotels_aqua: { label: "فنادق واكوا بارك", icon: "bx bx-building-house" },
  activities: { label: "أنشطة وترفيه", icon: "bx bx-party" },
  offers: { label: "اقوي العروض", icon: "bx bxs-discount" },
  cinema: { label: "السينما", icon: "bx bx-camera-movie" },
  medical: { label: "خدمات طبية", icon: "bx bx-plus-medical" },
  health_beauty: { label: "الصحة والجمال", icon: "bx bx-spa" },
  parks: { label: "الحدائق", icon: "bx bx-tree" },
  work: { label: "شغل", icon: "bx bx-briefcase" },
  courses_study: { label: "كورسات ودراسة", icon: "bx bx-book-reader" },
  quiet_places: { label: "اماكن هادئه", icon: "bx bx-moon" }
};

const getInterestObj = (intKey: string) => {
  if (AVAILABLE_INTERESTS_MAP[intKey]) return AVAILABLE_INTERESTS_MAP[intKey];
  const found = Object.values(AVAILABLE_INTERESTS_MAP).find(item => item.label === intKey);
  if (found) return found;
  return { label: intKey, icon: "bx bx-star" };
};

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "../admin.module.css";
import { useAuth } from "@/context/AuthContext";
import { PlaceCategory, initialPlaces, CategoryItem, DEFAULT_CATEGORIES, FEATURES_LIST, CATEGORIES_STRUCTURE, formatBoxIcon, normalizePlaceCategory } from "@/data/places";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { ScheduleDay, WorkingHoursData, DAYS_OF_WEEK, generateTimeOptions, getTodayWorkingHoursText } from "@/lib/workingHours";
import { MultiSelectSearch } from "@/components/ui/MultiSelectSearch";
import { SERVICES_LIST } from "@/data/services";
import CustomModal from "@/components/common/Modals";

const CATEGORY_ICONS: Record<string, string> = {
  all: "bx-grid-alt",
};

CATEGORIES_STRUCTURE.forEach(main => {
  CATEGORY_ICONS[main.name] = main.icon;
  main.subCategories.forEach(sub => {
    CATEGORY_ICONS[sub.name] = sub.icon;
  });
});

function getCategoryColor(cat: string) {
  const mainCat = CATEGORIES_STRUCTURE.find(m => m.name === cat || m.subCategories.some(s => s.name === cat));
  return mainCat?.color ?? "var(--colorPrimary, #6c63ff)";
}

const CATEGORY_MAP: Record<string, string> = {};
CATEGORIES_STRUCTURE.forEach(main => {
  CATEGORY_MAP[main.name] = main.label;
  main.subCategories.forEach(sub => {
    CATEGORY_MAP[sub.name] = sub.label;
  });
});


function ImageWithSkeleton({ src, alt, style, className, onClick, onError }: any) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", ...style, overflow: "hidden" }} className={className} onClick={onClick}>
      {!loaded && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bgGlass-card)", animation: "pulse 1.5s infinite" }} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: style?.objectFit || "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)}
        onError={(e: any) => {
          setLoaded(true);
          if (onError) onError(e);
        }}
      />
    </div>
  );
}

interface AdminProfile {
  is_admin: boolean;
}

interface DBPlace {
  id: string;
  name: string;
  name_en?: string;
  category: string;
  category_label: string;
  sub_categories?: string[];
  governorate?: string;
  city?: string;
  short_description?: string;
  full_address: string;
  phones: string[];
  google_maps_url: string;
  images: string[];
  menu_images: string[];
  working_hours: string;
  rating: number;
  reviews_count?: number;
  description: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  branches?: any[];
  features?: string[];
  services?: string[];
  place_type?: string;
  place_type_icon?: string;
  website_url?: string | null;
}


export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<DBPlace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Add Place Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", name_en: "", category: "food_drinks", category_label: "أكل ومشروبات",
    sub_categories: [] as string[],
    place_type: "",
    place_type_icon: "",
    governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
    full_address: "", phones: "", google_maps_url: "", image_url: "",
    menu_images: "", description: "",
    latitude: "", longitude: "",
    website_url: "",
    features: [] as string[],
    services: [] as string[]
  });

  const [scheduleType, setScheduleType] = useState<"24/7" | "custom">("24/7");
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      isWorking: true,
      openTime: "09:00",
      openPeriod: "ص" as "ص" | "م",
      closeTime: "11:00",
      closePeriod: "م" as "ص" | "م"
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Excel Import States
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedPlaces, setParsedPlaces] = useState<any[]>([]);
  const [selectedParsedIndices, setSelectedParsedIndices] = useState<Set<number>>(new Set());
  const [parsedPlacesSearch, setParsedPlacesSearch] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isDeletingDuplicates, setIsDeletingDuplicates] = useState(false);

  // Custom Categories States
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatKey, setNewCatKey] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("bx bx-store");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const PRESET_BOXICONS = [
    { name: "مطعم / أكل", icon: "bx bx-utensils" },
    { name: "كافيه / قهوة", icon: "bx bx-coffee-togo" },
    { name: "صيدلية", icon: "bx bx-first-aid" },
    { name: "مستشفى", icon: "bx bx-plus-medical" },
    { name: "حديقة", icon: "bx bx-tree" },
    { name: "عائلية", icon: "bx bx-group" },
    { name: "ترفيه / ألعاب", icon: "bx bx-game" },
    { name: "جيم / رياضة", icon: "bx bx-dumbbell" },
    { name: "سيارات / خدمات", icon: "bx bx-car" },
    { name: "مكتبة / تعليم", icon: "bx bx-book" },
    { name: "صالون / حلاقة", icon: "bx bx-cut" },
    { name: "سوبرماركت / تسوق", icon: "bx bx-cart" },
    { name: "فندق / إقامة", icon: "bx bx-hotel" },
    { name: "سينما / مسرح", icon: "bx bx-film" },
    { name: "صيانة / كهرومكانيك", icon: "bx bx-wrench" },
    { name: "محطة بنزين", icon: "bx bx-gas-pump" },
    { name: "متجر / محل", icon: "bx bx-store" },
    { name: "صحة / عناية", icon: "bx bx-heart" },
    { name: "شركات / مكاتب", icon: "bx bx-building" },
    { name: "ملابس / موضة", icon: "bx bx-t-shirt" },
    { name: "إلكترونيات", icon: "bx bx-mobile-alt" },
    { name: "كمبيوتر / تقنية", icon: "bx bx-laptop" },
    { name: "ديكور / دهانات", icon: "bx bx-paint" },
    { name: "سباحة / شاطئ", icon: "bx bx-swim" }
  ];

  // Branch Management States
  const [selectedPlaceForBranch, setSelectedPlaceForBranch] = useState<DBPlace | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchFormData, setBranchFormData] = useState({
    name: "", governorate: governoratesList[0] || "القاهرة", city: "",
    full_address: "", phones: "", google_maps_url: "", latitude: "", longitude: "", media: ""
  });
  const [branchScheduleType, setBranchScheduleType] = useState<"24/7" | "custom">("24/7");
  const [branchScheduleData, setBranchScheduleData] = useState<ScheduleDay[]>(
    DAYS_OF_WEEK.map(day => ({
      day, isWorking: true, openTime: "09:00", openPeriod: "ص" as "ص" | "م", closeTime: "11:00", closePeriod: "م" as "ص" | "م"
    }))
  );
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  // Custom Delete Place Confirmation Modal State
  const [placeToDeleteId, setPlaceToDeleteId] = useState<string | null>(null);
  const [isDeletingPlace, setIsDeletingPlace] = useState(false);

  // Bulk Selection & Delete States
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Delete Alert / Feedback Modal in Center of Screen
  const [deleteAlertModal, setDeleteAlertModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    placeName?: string;
  } | null>(null);

  useEffect(() => {
    if (deleteAlertModal?.type === "success") {
      const timer = setTimeout(() => {
        setDeleteAlertModal(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [deleteAlertModal]);

  // Edit Category State
  const [editingCategoryPlace, setEditingCategoryPlace] = useState<DBPlace | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Unified Edit Place State (name + category)
  const [editingPlace, setEditingPlace] = useState<DBPlace | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPlaceCategory, setEditingPlaceCategory] = useState("");
  const [isUpdatingPlace, setIsUpdatingPlace] = useState(false);
  const [editScheduleType, setEditScheduleType] = useState<"24/7" | "custom">("24/7");
  const [editScheduleData, setEditScheduleData] = useState<ScheduleDay[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      isWorking: true,
      openTime: "09:00",
      openPeriod: "ص" as "ص" | "م",
      closeTime: "11:00",
      closePeriod: "م" as "ص" | "م"
    }))
  );
  const [editPlaceFormData, setEditPlaceFormData] = useState({
    id: "",
    name: "",
    name_en: "",
    category: "food_drinks",
    category_label: "أكل ومشروبات",
    sub_categories: [] as string[],
    place_type: "",
    place_type_icon: "",
    governorate: "القاهرة",
    city: "مدينة نصر",
    short_description: "",
    full_address: "",
    phones: "",
    google_maps_url: "",
    image_url: "",
    menu_images: "",
    working_hours: "",
    description: "",
    latitude: "",
    longitude: "",
    website_url: "",
    features: [] as string[],
    services: [] as string[]
  });

  const handleStartEditPlace = (place: DBPlace) => {
    setEditingPlace(place);
    const mainImage = place.images && place.images.length > 0 ? place.images[0] : "";
    const menuImgs = place.menu_images ? (Array.isArray(place.menu_images) ? place.menu_images.join(", ") : place.menu_images) : "";
    const phonesStr = place.phones ? (Array.isArray(place.phones) ? place.phones.join(", ") : place.phones) : "";

    // Parse Working Hours JSON
    try {
      if (typeof place.working_hours === 'string' && place.working_hours.startsWith('{')) {
        const parsed = JSON.parse(place.working_hours);
        if (parsed.type === "custom" && Array.isArray(parsed.schedule)) {
          setEditScheduleType("custom");
          setEditScheduleData(parsed.schedule);
        } else {
          setEditScheduleType("24/7");
        }
      } else {
        setEditScheduleType("24/7");
      }
    } catch {
      setEditScheduleType("24/7");
    }

    setEditPlaceFormData({
      id: place.id,
      name: place.name || "",
      name_en: place.name_en || "",
      category: place.category || "food_drinks",
      category_label: place.category_label || CATEGORY_MAP[place.category] || "أكل ومشروبات",
      sub_categories: Array.isArray(place.sub_categories) ? place.sub_categories : [],
      place_type: place.place_type || "",
      place_type_icon: place.place_type_icon || "",
      governorate: place.governorate || "القاهرة",
      city: place.city || "مدينة نصر",
      short_description: place.short_description || "",
      full_address: place.full_address || "",
      phones: phonesStr,
      google_maps_url: place.google_maps_url || "",
      image_url: mainImage,
      menu_images: menuImgs,
      working_hours: typeof place.working_hours === 'object' ? JSON.stringify(place.working_hours) : (place.working_hours || ""),
      description: place.description || "",
      latitude: place.latitude ? place.latitude.toString() : "",
      longitude: place.longitude ? place.longitude.toString() : "",
      website_url: (place as any).website_url || "",
      features: Array.isArray(place.features) ? place.features : [],
      services: Array.isArray(place.services) ? place.services : [],
    });
  };


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdminAndFetchPlaces = async () => {
      if (!supabase) return;

      try {
        // Check if admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.is_admin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        // Fetch places
        const { data: placesData, error: placesError } = await supabase
          .from("places")
          .select("*, branches(*)")
          .order("created_at", { ascending: false });

        if (placesError) throw placesError;
        if (placesData) setPlaces(placesData);

      } catch (err: any) {
        setError(err.message || "حدث خطأ غير معروف.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchPlaces();
  }, [user, authLoading, router]);

  const fetchCategories = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (e) {
      console.warn("Categories fetch fallback", e);
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const key = newCatKey.trim()
      ? newCatKey.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      : `cat_${Date.now()}`;
    const iconClass = newCatIcon.trim() || "bx bx-category";

    setIsAddingCategory(true);
    try {
      const newCatObj: CategoryItem = {
        name: key,
        label: newCatLabel.trim(),
        icon: iconClass
      };

      if (supabase) {
        const { data } = await supabase.from("categories").insert([newCatObj]).select().single();
        if (data) {
          setCategories(prev => [...prev.filter(c => c.name !== data.name), data]);
        } else {
          setCategories(prev => [...prev.filter(c => c.name !== key), newCatObj]);
        }
      } else {
        setCategories(prev => [...prev.filter(c => c.name !== key), newCatObj]);
      }

      setFormData(prev => ({
        ...prev,
        category: key,
        category_label: newCatLabel.trim()
      }));

      setNewCatLabel("");
      setNewCatKey("");
      setNewCatIcon("bx bx-store");
      setShowAddCategoryModal(false);
      alert("تمت إضافة التصنيف الجديد بنجاح!");
    } catch (err: any) {
      alert("حدث خطأ أثناء إضافة التصنيف: " + (err.message || ""));
    } finally {
      setIsAddingCategory(false);
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Check if place already exists manually (Duplicate check)
      const isManualDuplicate = places.some(p =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        p.category.trim().toLowerCase() === formData.category.trim().toLowerCase() &&
        (p.governorate || "").trim().toLowerCase() === formData.governorate.trim().toLowerCase() &&
        (p.city || "").trim().toLowerCase() === formData.city.trim().toLowerCase()
      );

      if (isManualDuplicate) {
        setError(`عفواً، المكان "${formData.name}" مسجل بالفعل مسبقاً بنفس التصنيف في ${formData.city}، ${formData.governorate}.`);
        setIsSubmitting(false);
        return;
      }

      const phonesArray = formData.phones.split(",").map(p => p.trim()).filter(Boolean);
      const imagesArray = formData.image_url ? [formData.image_url.trim()] : [];
      const menuImagesArray = formData.menu_images.split(",").map(m => m.trim()).filter(Boolean);

      const newPlace = {
        name: formData.name.trim(),
        name_en: formData.name_en.trim() || null,
        category: formData.category,
        category_label: formData.category_label || CATEGORY_MAP[formData.category] || formData.category,
        sub_categories: formData.sub_categories || [],
        governorate: formData.governorate,
        city: formData.city,
        short_description: formData.short_description,
        full_address: formData.full_address,
        phones: phonesArray,
        google_maps_url: formData.google_maps_url,
        images: imagesArray,
        menu_images: menuImagesArray,
        working_hours: JSON.stringify({
          type: scheduleType,
          schedule: scheduleType === "custom" ? scheduleData : undefined
        }),
        description: formData.description,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        website_url: formData.website_url.trim() || null,
        features: formData.features || [],
        services: formData.services || [],
        place_type: formData.place_type.trim() || null,
        place_type_icon: formData.place_type.trim() ? (formatBoxIcon(formData.place_type_icon).trim() || "bx bx-tag") : null
      };

      let { data, error: insertError } = await supabase
        .from("places")
        .insert([newPlace])
        .select()
        .single();

      if (insertError) {
        console.warn("Place insert failed, trying fallbacks...");
        const fallbackPlace = { ...newPlace };
        // @ts-ignore
        delete fallbackPlace.features;
        let retryResult = await supabase
          .from("places")
          .insert([fallbackPlace])
          .select()
          .single();

        if (retryResult.error) {
          // @ts-ignore
          delete fallbackPlace.website_url;
          retryResult = await supabase
            .from("places")
            .insert([fallbackPlace])
            .select()
            .single();

          if (retryResult.error) {
            // @ts-ignore
            delete fallbackPlace.sub_categories;
            retryResult = await supabase
              .from("places")
              .insert([fallbackPlace])
              .select()
              .single();
          }
        }
        data = retryResult.data;
        insertError = retryResult.error;
      }

      if (insertError) throw insertError;

      if (data) {
        // Create initial main branch
        const branchPayload = {
          place_id: data.id,
          name: "الفرع الرئيسي",
          governorate: data.governorate,
          city: data.city,
          full_address: data.full_address,
          phones: data.phones,
          google_maps_url: data.google_maps_url,
          working_hours: data.working_hours,
          latitude: data.latitude,
          longitude: data.longitude,
          is_main: true,
          website_url: data.website_url || null,
          features: data.features || [],
          services: data.services || []
        };

        let { error: branchError } = await supabase
          .from("branches")
          .insert([branchPayload]);

        if (branchError) {
          console.warn("Branch insert failed with features/website_url, trying fallback...");
          const fallbackBranch = { ...branchPayload };
          // @ts-ignore
          delete fallbackBranch.features;
          let retryBranch = await supabase
            .from("branches")
            .insert([fallbackBranch]);

          if (retryBranch.error) {
            // @ts-ignore
            delete fallbackBranch.website_url;
            retryBranch = await supabase
              .from("branches")
              .insert([fallbackBranch]);
          }
          branchError = retryBranch.error;
        }

        if (branchError) {
          console.error("Failed to create main branch:", branchError);
        }

        const newBranch = {
          id: branchError ? undefined : "temp-id",
          place_id: data.id,
          name: "الفرع الرئيسي",
          governorate: data.governorate,
          city: data.city,
          full_address: data.full_address,
          phones: data.phones,
          google_maps_url: data.google_maps_url,
          working_hours: data.working_hours,
          latitude: data.latitude,
          longitude: data.longitude,
          is_main: true,
          website_url: data.website_url || null,
          features: data.features || [],
          services: data.services || []
        };

        const placeWithBranch = { ...data, branches: [newBranch] };
        setPlaces([placeWithBranch, ...places]);
        setShowAddForm(false);
        // Reset form
        setFormData({
          name: "", name_en: "", category: "food_drinks", category_label: "أكل ومشروبات",
          sub_categories: [] as string[],
          place_type: "",
          place_type_icon: "",
          governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
          full_address: "", phones: "", google_maps_url: "", image_url: "",
          menu_images: "", description: "",
          latitude: "", longitude: "",
          website_url: "",
          features: [] as string[],
          services: [] as string[]
        });
      }
    } catch (err: any) {
      setError("فشل إضافة المكان: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for parsing variable working hours from Excel
  const parseExcelTimePart = (rawPart: string, defaultPeriod: "ص" | "م"): { time: string; period: "ص" | "م" } => {
    let period: "ص" | "م" = defaultPeriod;
    const lower = rawPart.toLowerCase();

    if (lower.includes("م") || lower.includes("مساء") || lower.includes("pm")) {
      period = "م";
    } else if (lower.includes("ص") || lower.includes("صباح") || lower.includes("am")) {
      period = "ص";
    }

    const match = rawPart.match(/(\d{1,2})(?:[:.](\d{2}))?/);
    if (!match) {
      return { time: defaultPeriod === "ص" ? "09:00" : "11:00", period };
    }

    let hour = parseInt(match[1], 10);
    let minStr = match[2] || "00";

    if (hour > 12) {
      hour = hour - 12;
      period = "م";
    } else if (hour === 0) {
      hour = 12;
      period = "ص";
    }

    const hourStr = hour.toString().padStart(2, "0");
    return { time: `${hourStr}:${minStr}`, period };
  };

  const parseExcelSingleDayTime = (dayName: string, str: string): ScheduleDay => {
    const defaultOpen: ScheduleDay = {
      day: dayName,
      isWorking: true,
      openTime: "09:00",
      openPeriod: "ص",
      closeTime: "11:00",
      closePeriod: "م"
    };

    if (!str || !str.trim()) return defaultOpen;
    const s = str.trim().toLowerCase();

    if (s.includes("مغلق") || s.includes("إجازة") || s.includes("اجازة") || s.includes("عطلة") || s.includes("closed") || s.includes("off")) {
      return { day: dayName, isWorking: false, openTime: "09:00", openPeriod: "ص", closeTime: "11:00", closePeriod: "م" };
    }

    if (s.includes("24/7") || s.includes("24 ساعة") || s.includes("24ساعة") || s.includes("مفتوح 24")) {
      return { day: dayName, isWorking: true, openTime: "12:00", openPeriod: "ص", closeTime: "11:59", closePeriod: "م" };
    }

    const parts = str.split(/[-–—|/|الى|إلى|حتى|حتي|to]+/i).map(p => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      const openParsed = parseExcelTimePart(parts[0], "ص");
      const closeParsed = parseExcelTimePart(parts[1], "م");
      return {
        day: dayName,
        isWorking: true,
        openTime: openParsed.time,
        openPeriod: openParsed.period,
        closeTime: closeParsed.time,
        closePeriod: closeParsed.period
      };
    } else if (parts.length === 1) {
      const timeParsed = parseExcelTimePart(parts[0], "ص");
      return {
        day: dayName,
        isWorking: true,
        openTime: timeParsed.time,
        openPeriod: timeParsed.period,
        closeTime: "11:00",
        closePeriod: "م"
      };
    }

    return defaultOpen;
  };

  const resolveExcelDaysFromText = (daysStr: string): string[] => {
    const norm = daysStr.trim().toLowerCase();
    if (norm.includes("يوميا") || norm.includes("يومياً") || norm.includes("كل يوم") || norm.includes("جميع الايام") || norm.includes("جميع الأيام")) {
      return DAYS_OF_WEEK;
    }

    const rangeMatch = daysStr.split(/[-–—|الى|إلى|حتى|حتي|to]/).map(d => d.trim()).filter(Boolean);
    if (rangeMatch.length === 2) {
      const normalizeDay = (raw: string): string | null => {
        const s = raw.trim().toLowerCase();
        if (s.includes("احد") || s.includes("أحد") || s.includes("sun")) return "الأحد";
        if (s.includes("اتنين") || s.includes("إثنين") || s.includes("اثنين") || s.includes("mon")) return "الإثنين";
        if (s.includes("ثلاثاء") || s.includes("تلات") || s.includes("tue")) return "الثلاثاء";
        if (s.includes("اربعاء") || s.includes("أربعاء") || s.includes("wed")) return "الأربعاء";
        if (s.includes("خميس") || s.includes("thu")) return "الخميس";
        if (s.includes("جمعة") || s.includes("جمعه") || s.includes("fri")) return "الجمعة";
        if (s.includes("سبت") || s.includes("sat")) return "السبت";
        return null;
      };

      const startDay = normalizeDay(rangeMatch[0]);
      const endDay = normalizeDay(rangeMatch[1]);
      if (startDay && endDay) {
        const WEEK_ORDER = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
        const sIdx = WEEK_ORDER.indexOf(startDay);
        const eIdx = WEEK_ORDER.indexOf(endDay);
        if (sIdx !== -1 && eIdx !== -1) {
          const result: string[] = [];
          let curr = sIdx;
          while (curr !== eIdx) {
            result.push(WEEK_ORDER[curr]);
            curr = (curr + 1) % 7;
          }
          result.push(WEEK_ORDER[eIdx]);
          return result;
        }
      }
    }

    const matchedDays: string[] = [];
    DAYS_OF_WEEK.forEach(day => {
      if (daysStr.includes(day) || daysStr.includes(day.replace("أ", "ا").replace("إ", "ا"))) {
        matchedDays.push(day);
      }
    });

    return matchedDays.length > 0 ? matchedDays : DAYS_OF_WEEK;
  };

  const parseExcelWorkingHours = (row: any): string => {
    const dayColumnNames: Record<string, string[]> = {
      "الأحد": ["مواعيد الأحد", "الأحد", "يوم الأحد", "Sunday"],
      "الإثنين": ["مواعيد الإثنين", "مواعيد الاثنين", "الإثنين", "الاثنين", "Monday"],
      "الثلاثاء": ["مواعيد الثلاثاء", "الثلاثاء", "Tuesday"],
      "الأربعاء": ["مواعيد الأربعاء", "مواعيد الاربعاء", "الأربعاء", "الاربعاء", "Wednesday"],
      "الخميس": ["مواعيد الخميس", "الخميس", "Thursday"],
      "الجمعة": ["مواعيد الجمعة", "مواعيد الجمعه", "الجمعة", "الجمعه", "Friday"],
      "السبت": ["مواعيد السبت", "السبت", "Saturday"]
    };

    let hasPerDayCols = false;
    for (const day of DAYS_OF_WEEK) {
      const colKeys = dayColumnNames[day];
      if (colKeys.some(k => row[k] !== undefined && row[k] !== null && row[k].toString().trim() !== "")) {
        hasPerDayCols = true;
        break;
      }
    }

    if (hasPerDayCols) {
      const schedule: ScheduleDay[] = DAYS_OF_WEEK.map(day => {
        const colKeys = dayColumnNames[day];
        let val = "";
        for (const k of colKeys) {
          if (row[k] !== undefined && row[k] !== null && row[k].toString().trim() !== "") {
            val = row[k].toString().trim();
            break;
          }
        }
        return parseExcelSingleDayTime(day, val);
      });
      return JSON.stringify({ type: "custom", schedule });
    }

    const rawWH = row["مواعيد العمل"]?.toString().trim() || "";
    if (!rawWH) {
      return JSON.stringify({ type: "24/7" });
    }

    const lowerWH = rawWH.toLowerCase();
    if (lowerWH === "24/7" || lowerWH === "مفتوح 24 ساعة" || lowerWH === "24 ساعة" || lowerWH === "24/7 🟢") {
      return JSON.stringify({ type: "24/7" });
    }

    const scheduleMap: Record<string, ScheduleDay> = {};
    DAYS_OF_WEEK.forEach(day => {
      scheduleMap[day] = {
        day,
        isWorking: true,
        openTime: "09:00",
        openPeriod: "ص",
        closeTime: "11:00",
        closePeriod: "م"
      };
    });

    const segments = rawWH.split(/[|\n\r;]/).map((s: string) => s.trim()).filter(Boolean);
    let parsedAnySegment = false;

    for (const seg of segments) {
      if (seg.includes(":")) {
        const colonIdx = seg.indexOf(":");
        const daysPart = seg.substring(0, colonIdx);
        const timePart = seg.substring(colonIdx + 1);

        const targetDays = resolveExcelDaysFromText(daysPart);
        if (targetDays.length > 0) {
          targetDays.forEach(day => {
            scheduleMap[day] = parseExcelSingleDayTime(day, timePart);
          });
          parsedAnySegment = true;
        }
      }
    }

    if (parsedAnySegment) {
      const schedule = DAYS_OF_WEEK.map(day => scheduleMap[day]);
      return JSON.stringify({ type: "custom", schedule });
    }

    const singleParsed = parseExcelSingleDayTime("يومي", rawWH);
    if (singleParsed.isWorking) {
      const schedule = DAYS_OF_WEEK.map(day => ({
        ...singleParsed,
        day
      }));
      return JSON.stringify({ type: "custom", schedule });
    }

    return rawWH;
  };

  const areWorkingHoursEqual = (wh1: any, wh2: any): boolean => {
    const s1 = (wh1 || "").toString().trim();
    const s2 = (wh2 || "").toString().trim();
    if (!s1 && !s2) return true;
    if (!s1 || !s2) return false;
    if (s1 === s2) return true;

    let obj1: any = null;
    let obj2: any = null;
    try { obj1 = JSON.parse(s1); } catch {}
    try { obj2 = JSON.parse(s2); } catch {}

    if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
      if (obj1.type !== obj2.type) return false;
      if (obj1.type === "24/7") return true;
      if (obj1.type === "custom") {
        const sched1 = Array.isArray(obj1.schedule) ? obj1.schedule : [];
        const sched2 = Array.isArray(obj2.schedule) ? obj2.schedule : [];
        for (const day of DAYS_OF_WEEK) {
          const d1 = sched1.find((x: any) => x.day === day);
          const d2 = sched2.find((x: any) => x.day === day);
          if (!d1 && !d2) continue;
          if (!d1 || !d2) return false;
          if (Boolean(d1.isWorking) !== Boolean(d2.isWorking)) return false;
          if (d1.isWorking) {
            if ((d1.openTime || "").trim() !== (d2.openTime || "").trim()) return false;
            if ((d1.closeTime || "").trim() !== (d2.closeTime || "").trim()) return false;
            if ((d1.openPeriod || "").trim() !== (d2.openPeriod || "").trim()) return false;
            if ((d1.closePeriod || "").trim() !== (d2.closePeriod || "").trim()) return false;
          }
        }
        return true;
      }
    }

    return s1.toLowerCase().replace(/\s+/g, " ") === s2.toLowerCase().replace(/\s+/g, " ");
  };

  const comparePlaceData = (dbPlace: DBPlace, excelPlace: any): { isModified: boolean; changedFields: string[] } => {
    const changedFields: string[] = [];

    const normStr = (val?: string | null): string => (val || "").toString().trim().replace(/\s+/g, " ");

    const normPhones = (phones?: string[] | null): string[] => {
      if (!phones || !Array.isArray(phones)) return [];
      return phones
        .map(p => (p || "").toString().replace(/[\s\-\(\)\+]/g, "").trim())
        .filter(Boolean)
        .sort();
    };

    const normArray = (arr?: string[] | null): string[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr
        .map(s => (s || "").toString().trim())
        .filter(Boolean)
        .sort();
    };

    // 1. Phone numbers
    const dbPhones = normPhones(dbPlace.phones);
    const excelPhones = normPhones(excelPlace.phones);
    if (dbPhones.join(",") !== excelPhones.join(",")) {
      changedFields.push("أرقام الهواتف");
    }

    // 2. Working hours
    if (!areWorkingHoursEqual(dbPlace.working_hours, excelPlace.working_hours)) {
      changedFields.push("مواعيد العمل");
    }

    // 3. Website
    const dbWebsite = normStr((dbPlace as any).website_url).toLowerCase().replace(/\/+$/, "");
    const excelWebsite = normStr(excelPlace.website_url).toLowerCase().replace(/\/+$/, "");
    if (dbWebsite !== excelWebsite) {
      changedFields.push("موقع الويب");
    }

    // 4. Images
    const dbImages = normArray(dbPlace.images);
    const excelImages = normArray(excelPlace.images);
    if (dbImages.join(",") !== excelImages.join(",")) {
      changedFields.push("الصور");
    }

    // 5. Menu Images
    const dbMenu = normArray(dbPlace.menu_images);
    const excelMenu = normArray(excelPlace.menu_images);
    if (dbMenu.join(",") !== excelMenu.join(",")) {
      changedFields.push("صور المنيو");
    }

    // 6. English Name
    if (normStr(dbPlace.name_en).toLowerCase() !== normStr(excelPlace.name_en).toLowerCase()) {
      changedFields.push("الاسم بالإنجليزية");
    }

    // 7. Full Address
    if (normStr(dbPlace.full_address) !== normStr(excelPlace.full_address)) {
      changedFields.push("العنوان");
    }

    // 8. Google Maps URL
    if (normStr(dbPlace.google_maps_url) !== normStr(excelPlace.google_maps_url)) {
      changedFields.push("رابط الخريطة");
    }

    // 9. Short description
    if (normStr(dbPlace.short_description) !== normStr(excelPlace.short_description)) {
      changedFields.push("الوصف المختصر");
    }

    // 10. Detailed description
    if (normStr(dbPlace.description) !== normStr(excelPlace.description)) {
      changedFields.push("الوصف التفصيلي");
    }

    // 11. Sub-categories
    const dbSubCats = normArray(dbPlace.sub_categories);
    const excelSubCats = normArray(excelPlace.sub_categories);
    if (dbSubCats.join(",") !== excelSubCats.join(",")) {
      changedFields.push("الأقسام الفرعية");
    }

    // 12. Coordinates
    const dbLat = dbPlace.latitude != null ? Number(Number(dbPlace.latitude).toFixed(5)) : null;
    const dbLng = dbPlace.longitude != null ? Number(Number(dbPlace.longitude).toFixed(5)) : null;
    const exLat = excelPlace.latitude != null ? Number(Number(excelPlace.latitude).toFixed(5)) : null;
    const exLng = excelPlace.longitude != null ? Number(Number(excelPlace.longitude).toFixed(5)) : null;
    if (dbLat !== exLat || dbLng !== exLng) {
      if (exLat !== null || exLng !== null) {
        changedFields.push("الإحداثيات");
      }
    }

    // 13. Features
    const dbFeats = normArray(dbPlace.features);
    const excelFeats = normArray(excelPlace.features);
    if (dbFeats.join(",") !== excelFeats.join(",")) {
      changedFields.push("المميزات والخدمات");
    }

    // 14. Services
    const dbServ = normArray(dbPlace.services);
    const excelServ = normArray(excelPlace.services);
    if (dbServ.join(",") !== excelServ.join(",")) {
      changedFields.push("الخدمات");
    }

    // 15. Place Type
    if (normStr(dbPlace.place_type) !== normStr(excelPlace.place_type)) {
      changedFields.push("نوع المكان");
    }

    // 16. Place Type Icon
    if (normStr(dbPlace.place_type_icon) !== normStr(excelPlace.place_type_icon)) {
      changedFields.push("أيقونة النوع");
    }

    return {
      isModified: changedFields.length > 0,
      changedFields
    };
  };

  const handleDownloadTemplate = async () => {
    if (typeof window === "undefined") return;
    try {
      const XLSX = await import("xlsx");
      const headers = [
        "الاسم", "الاسم (بالإنجليزية)", "القسم الرئيسي", "الأقسام الفرعية", "المدينة / المنطقة", "العنوان بالتفصيل", "رابط جوجل ماب", "المحافظة", "الهواتف",
        "مواعيد الأحد", "مواعيد الإثنين", "مواعيد الثلاثاء", "مواعيد الأربعاء", "مواعيد الخميس", "مواعيد الجمعة", "مواعيد السبت",
        "مواعيد العمل",
        "معلومات مفيدة (المميزات)",
        "خط العرض", "خط الطول", "وصف قصير", "الوصف التفصيلي", "رابط الصورة الرئيسية", "روابط المنيو",
        "موقع الويب", "الخدمات", "نوع المكان", "أيقونة النوع"
      ];

      const sampleData = [
        {
          "الاسم": "مطعم البركة",
          "الاسم (بالإنجليزية)": "Al Baraka Restaurant",
          "القسم الرئيسي": "أكل ومشروبات",
          "الأقسام الفرعية": "مطاعم, فاست فود",
          "المدينة / المنطقة": "مصر الجديدة",
          "العنوان بالتفصيل": "15 شارع الثورة، بجوار مسجد جمال",
          "رابط جوجل ماب": "https://maps.google.com/?q=30.0815,31.3256",
          "المحافظة": "القاهرة",
          "الهواتف": "01012345678, 0224150000",
          "مواعيد الأحد": "09:00 ص - 11:00 م",
          "مواعيد الإثنين": "09:00 ص - 11:00 م",
          "مواعيد الثلاثاء": "09:00 ص - 11:00 م",
          "مواعيد الأربعاء": "09:00 ص - 11:00 م",
          "مواعيد الخميس": "09:00 ص - 12:00 م",
          "مواعيد الجمعة": "02:00 م - 12:00 م",
          "مواعيد السبت": "09:00 ص - 11:00 م",
          "مواعيد العمل": "",
          "معلومات مفيدة (المميزات)": "خيارات نباتية متوفرة, شبكة واي فاي مجانية, يقبل الدفع بالبطاقات الائتمانية, مناسب للمجموعات والعائلات",
          "خط العرض": 30.0815,
          "خط الطول": 31.3256,
          "وصف قصير": "أفضل مطعم مشويات في مصر الجديدة",
          "الوصف التفصيلي": "يقدم مطعم البركة أشهى المأكولات والمشويات الطازجة يومياً مع صالة مخصصة للعائلات.",
          "رابط الصورة الرئيسية": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
          "روابط المنيو": "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae",
          "موقع الويب": "https://albaraka-restaurant.com",
          "الخدمات": "توصيل طلبات, دفع بالفيزا, ساحة انتظار",
          "نوع المكان": "مطعم مشويات",
          "أيقونة النوع": "bx-utensils"
        },
        {
          "الاسم": "كافيه تريانون",
          "الاسم (بالإنجليزية)": "Trianon Cafe",
          "القسم الرئيسي": "أكل ومشروبات",
          "الأقسام الفرعية": "كافيهات, عصائر",
          "المدينة / المنطقة": "وسط البلد",
          "العنوان بالتفصيل": "ميدان طلعت حرب",
          "رابط جوجل ماب": "https://maps.google.com/?q=30.0444,31.2357",
          "المحافظة": "القاهرة",
          "الهواتف": "01234567890",
          "مواعيد الأحد": "08:00 ص - 11:00 م",
          "مواعيد الإثنين": "08:00 ص - 11:00 م",
          "مواعيد الثلاثاء": "08:00 ص - 11:00 م",
          "مواعيد الأربعاء": "08:00 ص - 11:00 م",
          "مواعيد الخميس": "08:00 ص - 12:00 م",
          "مواعيد الجمعة": "إجازة",
          "مواعيد السبت": "09:00 ص - 11:00 م",
          "مواعيد العمل": "",
          "معلومات مفيدة (المميزات)": "أماكن عائلية وكابلز, شبكة واي فاي مجانية, أماكن هادئة",
          "خط العرض": 30.0444,
          "خط الطول": 31.2357,
          "وصف قصير": "مقهى ومشروبات طازجة",
          "الوصف التفصيلي": "جلسات متميزة ومشروبات ساخنة وباردة يومياً.",
          "رابط الصورة الرئيسية": "",
          "روابط المنيو": "",
          "موقع الويب": "",
          "الخدمات": "دفع بالفيزا",
          "نوع المكان": "كافيه",
          "أيقونة النوع": "bx-coffee"
        },
        {
          "الاسم": "صيدلية مصر",
          "الاسم (بالإنجليزية)": "Misr Pharmacy",
          "القسم الرئيسي": "صحة",
          "الأقسام الفرعية": "صيدليات",
          "المدينة / المنطقة": "مدينة نصر",
          "العنوان بالتفصيل": "شارع عباس العقاد",
          "رابط جوجل ماب": "https://maps.google.com/?q=30.0560,31.3300",
          "المحافظة": "القاهرة",
          "الهواتف": "19999",
          "مواعيد الأحد": "24/7",
          "مواعيد الإثنين": "24/7",
          "مواعيد الثلاثاء": "24/7",
          "مواعيد الأربعاء": "24/7",
          "مواعيد الخميس": "24/7",
          "مواعيد الجمعة": "24/7",
          "مواعيد السبت": "24/7",
          "مواعيد العمل": "",
          "معلومات مفيدة (المميزات)": "مداخل سهلة للكراسي المتحركة, مرافق مريحة للزوار, مناسب لجميع الأعمار",
          "خط العرض": 30.0560,
          "خط الطول": 31.3300,
          "وصف قصير": "صيدلية خدمة 24 ساعة",
          "الوصف التفصيلي": "جميع الأدوية والمستلزمات الطبية والتوصيل للمنازل.",
          "رابط الصورة الرئيسية": "",
          "روابط المنيو": "",
          "موقع الويب": "",
          "الخدمات": "صيدلية",
          "نوع المكان": "صيدلية",
          "أيقونة النوع": "bx-first-aid"
        }
      ];

      const guideHeaders = ["القسم الرئيسي", "التصنيفات الفرعية المتاحة (يفصل بينها بفصلة)"];
      const guideData = CATEGORIES_STRUCTURE.map(main => ({
        "القسم الرئيسي": main.label,
        "التصنيفات الفرعية المتاحة (يفصل بينها بفصلة)": main.subCategories.map(s => s.label).join(" ، ")
      }));

      const whGuideHeaders = ["اسم عمود اليوم في Excel", "مثال التوقيت المدخل في الخلية", "شرح النتيجة"];
      const whGuideData = [
        { "اسم عمود اليوم في Excel": "مواعيد الأحد (أو الأحد)", "مثال التوقيت المدخل في الخلية": "09:00 ص - 11:00 م", "شرح النتيجة": "يفتح الساعة 9 صباحاً ويغلق 11 مساءً يوم الأحد" },
        { "اسم عمود اليوم في Excel": "مواعيد الخميس (أو الخميس)", "مثال التوقيت المدخل في الخلية": "09:00 ص - 12:00 م", "شرح النتيجة": "يفتح الساعة 9 صباحاً ويغلق 12 منتصف الليل يوم الخميس" },
        { "اسم عمود اليوم في Excel": "مواعيد الجمعة (أو الجمعة)", "مثال التوقيت المدخل في الخلية": "إجازة (أو مغلق)", "شرح النتيجة": "يوم الجمعة عطلة رسمية للمكان" },
        { "اسم عمود اليوم في Excel": "مواعيد الأحد إلى السبت", "مثال التوقيت المدخل في الخلية": "24/7", "شرح النتيجة": "المكان يعمل 24 ساعة طوال اليوم" }
      ];

      const featGuideHeaders = ["الأيقونة", "معلومات مفيدة / الميزة", "طريقة الكتابة في Excel (يمكن اختيار أكثر من ميزة بفصلة)"];
      const featGuideData = FEATURES_LIST.map(f => ({
        "الأيقونة": f.icon,
        "معلومات مفيدة / الميزة": f.label,
        "طريقة الكتابة في Excel (يمكن اختيار أكثر من ميزة بفصلة)": `${f.label} (أو ${f.key})`
      }));

      const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      const guideWorksheet = XLSX.utils.json_to_sheet(guideData, { header: guideHeaders });
      const whGuideWorksheet = XLSX.utils.json_to_sheet(whGuideData, { header: whGuideHeaders });
      const featGuideWorksheet = XLSX.utils.json_to_sheet(featGuideData, { header: featGuideHeaders });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "الأماكن");
      XLSX.utils.book_append_sheet(workbook, guideWorksheet, "دليل التصنيفات الفرعية");
      XLSX.utils.book_append_sheet(workbook, whGuideWorksheet, "دليل مواعيد العمل اليومية");
      XLSX.utils.book_append_sheet(workbook, featGuideWorksheet, "دليل المميزات والمعلومات");

      XLSX.writeFile(workbook, "places_template.xlsx");
    } catch (err: any) {
      alert("حدث خطأ أثناء تحميل الملف: " + err.message);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");
    setParsedPlaces([]);
    setSelectedParsedIndices(new Set());
    setParsedPlacesSearch("");
    setDuplicates([]);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setImportError("الملف المرفوع فارغ أو يحتوي على بيانات غير صالحة.");
          return;
        }

        // Map categories from labels and names to internal keys
        const categoryMapByLabel: Record<string, string> = {};
        CATEGORIES_STRUCTURE.forEach(main => {
          categoryMapByLabel[main.label.trim().toLowerCase()] = main.name;
          categoryMapByLabel[main.name.trim().toLowerCase()] = main.name;
          main.subCategories.forEach(sub => {
            categoryMapByLabel[sub.label.trim().toLowerCase()] = sub.name;
            categoryMapByLabel[sub.name.trim().toLowerCase()] = sub.name;
          });
        });

        const normalizeKeyPart = (val?: string | null): string => {
          return (val || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
        };

        const getPlaceIdentityKey = (pName: string, pCategory: string, pGov?: string | null, pCity?: string | null): string => {
          return `${normalizeKeyPart(pName)}_${normalizeKeyPart(pCategory)}_${normalizeKeyPart(pGov || "القاهرة")}_${normalizeKeyPart(pCity)}`;
        };

        // Create a map of keys for existing database places
        const dbPlacesMap = new Map<string, DBPlace>();
        places.forEach(p => {
          const key = getPlaceIdentityKey(p.name, p.category, p.governorate, p.city);
          dbPlacesMap.set(key, p);
        });

        const seenKeys = new Set<string>();
        const duplicatesList: any[] = [];

        // Map and validate columns
        const mapped: any[] = [];
        for (let i = 0; i < data.length; i++) {
          const row: any = data[i];

          const name = (row["الاسم"] || row["اسم المكان (بالعربية)"] || row["الاسم بالعربية"] || row["name_ar"] || row["Name"] || "")?.toString().trim();
          const name_en = (row["الاسم (بالإنجليزية)"] || row["الاسم (بالانجليزية)"] || row["اسم المكان (بالإنجليزية)"] || row["الاسم بالإنجليزية"] || row["الاسم بالانجليزية"] || row["الاسم بالانكليزية"] || row["name_en"] || row["Name (EN)"] || row["English Name"] || "")?.toString().trim();
          let category = (row["القسم الرئيسي"] || row["التصنيف الرئيسي"] || row["category"] || "")?.toString().trim();
          const city = (row["المدينة / المنطقة"] || row["المدينة"] || row["المنطقة / الحي"] || row["city"] || "")?.toString().trim();
          const full_address = (row["العنوان بالتفصيل"] || row["العنوان"] || row["address"] || "")?.toString().trim();
          const google_maps_url = (row["رابط جوجل ماب"] || row["رابط خرائط جوجل (Google Maps)"] || row["google_maps_url"] || "")?.toString().trim();

          if (!name || !category || !city || !full_address || !google_maps_url) {
            setImportError(`السطر رقم ${i + 2}: يحتوي على حقول مطلوبة مفقودة (الاسم، القسم الرئيسي، المدينة / المنطقة، العنوان بالتفصيل، ورابط جوجل ماب مطلوبة جميعها).`);
            setParsedPlaces([]);
            setDuplicates([]);
            return;
          }

          // Support multi-separator splitting for subcategories: English comma, Arabic comma, slash, semicolon, pipe, newlines
          const rawSubCats = row["الأقسام الفرعية"]?.toString() || "";
          const parsedSubCats = rawSubCats
            ? rawSubCats.split(/[,\u060C\n\r\/;|]+/).map((s: string) => {
              const trimmed = s.trim();
              if (!trimmed) return "";
              const lower = trimmed.toLowerCase();
              return categoryMapByLabel[lower] || trimmed;
            }).filter(Boolean)
            : [];

          const governorate = row["المحافظة"]?.toString().trim() || "القاهرة";

          // Use normalizePlaceCategory to resolve main category & subcategories cleanly
          const normalizedCat = normalizePlaceCategory(category, parsedSubCats);
          category = normalizedCat.category;
          const category_label = CATEGORY_MAP[category] || normalizedCat.categoryLabel;
          const sub_categories = Array.from(new Set(normalizedCat.subCategories));
          const rawPhones = (
            row["الهواتف"] ||
            row["الهاتف"] ||
            row["التليفون"] ||
            row["أرقام الهواتف"] ||
            row["phones"] ||
            ""
          ).toString();
          const phones = rawPhones
            ? rawPhones.split(/[,;\n\r]+/).map((p: string) => p.trim()).filter(Boolean)
            : [];

          const finalWorkingHours = parseExcelWorkingHours(row);

          const latitude = parseFloat(row["خط العرض"]) || null;
          const longitude = parseFloat(row["خط الظول"]) || parseFloat(row["خط الطول"]) || null;
          const short_description = (row["وصف قصير"] || row["الوصف القصير"] || "")?.toString().trim() || "";
          const description = (row["الوصف التفصيلي"] || row["الوصف"] || "")?.toString().trim() || "";
          const image_url = (row["رابط الصورة الرئيسية"] || row["رابط الصورة"] || row["الصورة"] || row["الصور"] || "")?.toString().trim();
          const rawMenu = (row["روابط المنيو"] || row["رابط المنيو"] || row["المنيو"] || "")?.toString();
          const menu_images = rawMenu
            ? rawMenu.split(/[,;\n\r]+/).map((m: string) => m.trim()).filter(Boolean)
            : [];
          const website_url = (row["موقع الويب"] || row["الموقع الإلكتروني"] || row["الموقع"] || row["الويب"] || row["website"] || "")?.toString().trim() || null;
          const rawFeatsStr = (
            row["معلومات مفيدة (المميزات)"] ||
            row["الميزات"] ||
            row["معلومات مفيدة"] ||
            row["المميزات"] ||
            row["المميزات والخدمات"] ||
            row["الميزات والخدمات"] ||
            ""
          ).toString();

          const parsedFeats: string[] = [];

          if (rawFeatsStr) {
            const items = rawFeatsStr.split(/[,\u060C\n\r\/;|]+/).map((s: string) => s.trim()).filter(Boolean);
            items.forEach((item: string) => {
              const cleanItem = item.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/g, "").trim().toLowerCase();
              const foundFeat = FEATURES_LIST.find(f =>
                f.key.toLowerCase() === item.toLowerCase() ||
                f.label.trim().toLowerCase() === item.trim().toLowerCase() ||
                (cleanItem && f.label.trim().toLowerCase().includes(cleanItem)) ||
                item.includes(f.label)
              );

              if (foundFeat) {
                if (!parsedFeats.includes(foundFeat.key)) parsedFeats.push(foundFeat.key);
              } else {
                if (cleanItem.includes("نباتي") || cleanItem.includes("نباتيه")) {
                  if (!parsedFeats.includes("vegetarian_options")) parsedFeats.push("vegetarian_options");
                } else if (cleanItem.includes("مجموعات") || cleanItem.includes("جروب")) {
                  if (!parsedFeats.includes("suitable_for_groups")) parsedFeats.push("suitable_for_groups");
                } else if (cleanItem.includes("بطاق") || cleanItem.includes("فيزا") || cleanItem.includes("ائتمان") || cleanItem.includes("كارت")) {
                  if (!parsedFeats.includes("accepts_credit_cards")) parsedFeats.push("accepts_credit_cards");
                } else if (cleanItem.includes("واي فاي") || cleanItem.includes("نت") || cleanItem.includes("wifi")) {
                  if (!parsedFeats.includes("free_wifi")) parsedFeats.push("free_wifi");
                } else if (cleanItem.includes("مرافق") || cleanItem.includes("مريحة")) {
                  if (!parsedFeats.includes("comfortable_facilities")) parsedFeats.push("comfortable_facilities");
                } else if (cleanItem.includes("كراسي") || cleanItem.includes("متحرك") || cleanItem.includes("ذوي")) {
                  if (!parsedFeats.includes("wheelchair_accessible")) parsedFeats.push("wheelchair_accessible");
                } else if (cleanItem.includes("جميع الاعمار") || cleanItem.includes("جميع الأعمار")) {
                  if (!parsedFeats.includes("suitable_for_all_ages")) parsedFeats.push("suitable_for_all_ages");
                } else if (cleanItem.includes("هادئ") || cleanItem.includes("هادئه") || cleanItem.includes("هدوء")) {
                  if (!parsedFeats.includes("quiet_place")) parsedFeats.push("quiet_place");
                } else if (cleanItem.includes("اطفال") || cleanItem.includes("أطفال") || cleanItem.includes("العاب")) {
                  if (!parsedFeats.includes("kids_friendly")) parsedFeats.push("kids_friendly");
                } else if (cleanItem.includes("عائل") || cleanItem.includes("كابلز") || cleanItem.includes("عائلات")) {
                  if (!parsedFeats.includes("family_friendly")) parsedFeats.push("family_friendly");
                } else if (item.trim()) {
                  if (!parsedFeats.includes(item.trim())) parsedFeats.push(item.trim());
                }
              }
            });
          }

          const features = parsedFeats;
          const services = row["الخدمات"]
            ? row["الخدمات"].toString().split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];
          const place_type = row["نوع المكان"]?.toString().trim() || null;
          const place_type_icon = row["أيقونة النوع"]?.toString().trim() || null;

          const key = getPlaceIdentityKey(name, category, governorate, city);

          let duplicateType: "db" | "internal" | null = null;
          let isUpdate = false;
          let existingId: string | null = null;
          let changedFields: string[] = [];

          const existingDbPlace = dbPlacesMap.get(key);

          const candidatePlace = {
            name,
            name_en: name_en || null,
            category,
            category_label: CATEGORY_MAP[category] || category,
            sub_categories,
            governorate,
            city,
            short_description: short_description || (description ? description.substring(0, 80) : ""),
            full_address,
            phones,
            google_maps_url,
            images: image_url ? [image_url] : [],
            menu_images,
            working_hours: finalWorkingHours,
            description,
            latitude,
            longitude,
            website_url,
            features,
            services,
            place_type,
            place_type_icon: place_type ? (formatBoxIcon(place_type_icon || "").trim() || "bx bx-tag") : null
          };

          if (seenKeys.has(key)) {
            // Duplicate row within the Excel file itself
            duplicateType = "internal";
          } else if (existingDbPlace) {
            // Place exists in database: check if any data was modified
            const comparison = comparePlaceData(existingDbPlace, candidatePlace);
            if (comparison.isModified) {
              isUpdate = true;
              existingId = existingDbPlace.id;
              changedFields = comparison.changedFields;
              duplicateType = null;
              seenKeys.add(key);
            } else {
              // 100% identical data with database
              duplicateType = "db";
            }
          } else {
            // Completely new place
            seenKeys.add(key);
          }

          const item = {
            rowNum: i + 2,
            ...candidatePlace,
            duplicateType,
            isUpdate,
            existingId,
            changedFields
          };

          if (duplicateType) {
            duplicatesList.push(item);
          }

          mapped.push(item);
        }

        setParsedPlaces(mapped);
        setDuplicates(duplicatesList);
      } catch (err: any) {
        setImportError("حدث خطأ أثناء قراءة الملف: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleRemoveDuplicates = () => {
    const cleanPlaces = parsedPlaces.filter(p => p.duplicateType === null);
    setParsedPlaces(cleanPlaces);
    setDuplicates([]);
    setSelectedParsedIndices(new Set());
    setImportSuccess("تم حذف الأماكن المتكررة بنجاح! الأماكن الباقية جاهزة للاستيراد.");
  };

  const handleDeleteParsedPlace = (indexToDelete: number) => {
    setParsedPlaces(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      const remainingDuplicates = updated.filter(p => p.duplicateType !== null);
      setDuplicates(remainingDuplicates);
      return updated;
    });
    setSelectedParsedIndices(prev => {
      const next = new Set<number>();
      prev.forEach(i => {
        if (i < indexToDelete) next.add(i);
        else if (i > indexToDelete) next.add(i - 1);
      });
      return next;
    });
  };

  const handleDeleteSelectedParsedPlaces = () => {
    if (selectedParsedIndices.size === 0) return;
    const count = selectedParsedIndices.size;
    setParsedPlaces(prev => {
      const updated = prev.filter((_, idx) => !selectedParsedIndices.has(idx));
      const remainingDuplicates = updated.filter(p => p.duplicateType !== null);
      setDuplicates(remainingDuplicates);
      return updated;
    });
    setSelectedParsedIndices(new Set());
    setImportSuccess(`تم حذف ${count} مكان من قائمة المعاينة بنجاح.`);
  };

  const toggleSelectParsedPlace = (idx: number) => {
    setSelectedParsedIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSelectAllParsedPlaces = (indices: number[]) => {
    setSelectedParsedIndices(prev => {
      const allSelected = indices.length > 0 && indices.every(i => prev.has(i));
      const next = new Set(prev);
      if (allSelected) {
        indices.forEach(i => next.delete(i));
      } else {
        indices.forEach(i => next.add(i));
      }
      return next;
    });
  };

  const dbDuplicatesList = React.useMemo(() => {
    const seen = new Map<string, string>(); // key -> id of first seen
    const dups: { originalId: string; duplicateId: string; place: DBPlace }[] = [];
    places.forEach(p => {
      const key = `${p.name.trim().toLowerCase()}_${p.category.trim().toLowerCase()}_${(p.governorate || "").trim().toLowerCase()}_${(p.city || "").trim().toLowerCase()}`;
      if (seen.has(key)) {
        const originalId = seen.get(key)!;
        dups.push({ originalId, duplicateId: p.id, place: p });
      } else {
        seen.set(key, p.id);
      }
    });
    return dups;
  }, [places]);

  const filteredPlaces = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return places;
    return places.filter(place =>
      (place.id || "").toLowerCase().includes(q) ||
      (place.name || "").toLowerCase().includes(q) ||
      (place.name_en || "").toLowerCase().includes(q)
    );
  }, [places, searchQuery]);

  const isAllSelected = filteredPlaces.length > 0 && filteredPlaces.every(p => selectedPlaceIds.includes(p.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = new Set(filteredPlaces.map(p => p.id));
      setSelectedPlaceIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const allFilteredIds = filteredPlaces.map(p => p.id);
      setSelectedPlaceIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleToggleSelectPlace = (id: string) => {
    setSelectedPlaceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const deletePlacesAndRelations = async (ids: string[]) => {
    if (!supabase || ids.length === 0) return;
    const CHUNK_SIZE = 40;
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE);

      // 1. Delete associated data from tables referencing place_id
      await Promise.allSettled([
        supabase.from("branches").delete().in("place_id", chunk),
        supabase.from("favorite_places").delete().in("place_id", chunk),
        supabase.from("place_notes").delete().in("place_id", chunk),
        supabase.from("place_reports").delete().in("place_id", chunk),
        supabase.from("reviews").delete().in("place_id", chunk),
      ]);

      // 2. Delete the actual places
      const { error: placesError } = await supabase
        .from("places")
        .delete()
        .in("id", chunk);

      if (placesError) throw placesError;
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedPlaceIds.length === 0 || !supabase) return;
    setIsBulkDeleting(true);
    try {
      await deletePlacesAndRelations(selectedPlaceIds);

      // Update local state
      setPlaces(prev => prev.filter(p => !selectedPlaceIds.includes(p.id)));
      const count = selectedPlaceIds.length;
      setSelectedPlaceIds([]);
      setShowBulkDeleteModal(false);
      setDeleteAlertModal({
        isOpen: true,
        type: "success",
        title: "تم الحذف بنجاح",
        message: `تم بنجاح حذف ${count} مكان من قاعدة البيانات!`,
      });
    } catch (err: any) {
      setDeleteAlertModal({
        isOpen: true,
        type: "error",
        title: "خطأ أثناء الحذف",
        message: "حدث خطأ أثناء حذف الأماكن المحددة: " + (err.message || err.error_description || "Bad Request"),
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCleanDbDuplicates = async () => {
    if (dbDuplicatesList.length === 0 || !supabase) return;

    const confirmClean = window.confirm(`هل أنت متأكد من رغبتك في حذف ${dbDuplicatesList.length} مكان مكرر من قاعدة البيانات نهائياً؟ لا يمكن التراجع عن هذه الخطوة.`);
    if (!confirmClean) return;

    setIsDeletingDuplicates(true);
    setError("");

    try {
      const idsToDelete = dbDuplicatesList.map(d => d.duplicateId);
      await deletePlacesAndRelations(idsToDelete);

      // Update local state
      setPlaces(prev => prev.filter(p => !idsToDelete.includes(p.id)));
      setDeleteAlertModal({
        isOpen: true,
        type: "success",
        title: "تم التنظيف بنجاح",
        message: `تم بنجاح تنظيف قاعدة البيانات وحذف ${idsToDelete.length} مكان مكرر!`,
      });
    } catch (err: any) {
      setError("حدث خطأ أثناء تنظيف المكررات من قاعدة البيانات: " + (err.message || ""));
      setDeleteAlertModal({
        isOpen: true,
        type: "error",
        title: "خطأ أثناء التنظيف",
        message: "حدث خطأ أثناء تنظيف المكررات من قاعدة البيانات: " + (err.message || ""),
      });
    } finally {
      setIsDeletingDuplicates(false);
    }
  };

  const handleImportSubmit = async () => {
    if (parsedPlaces.length === 0 || !supabase) return;

    if (duplicates.length > 0) {
      setImportError("يرجى إزالة الأماكن المتكررة أولاً بالضغط على زر 'حذف المتكرر' قبل الحفظ.");
      return;
    }

    setImporting(true);
    setImportError("");
    setImportSuccess("");

    try {
      const newPlaces = parsedPlaces.filter(p => !p.isUpdate);
      const updatePlaces = parsedPlaces.filter(p => p.isUpdate && p.existingId);

      let insertedCount = 0;
      let updatedCount = 0;
      let newlyInsertedWithBranches: any[] = [];
      const updatedPlacesMap: Record<string, any> = {};

      // 1. Process New Places
      if (newPlaces.length > 0) {
        // Clean UI-only fields
        const cleanData = newPlaces.map(({ duplicateType, rowNum, isUpdate, existingId, changedFields, ...rest }) => rest);

        // Bulk insert places
        const { data: insertedPlaces, error: insertError } = await supabase
          .from("places")
          .insert(cleanData)
          .select();

        if (insertError) throw insertError;

        if (insertedPlaces && insertedPlaces.length > 0) {
          insertedCount = insertedPlaces.length;

          // Generate main branches payload
          const branchesPayload = insertedPlaces.map(place => ({
            place_id: place.id,
            name: "الفرع الرئيسي",
            governorate: place.governorate,
            city: place.city,
            full_address: place.full_address || "",
            phones: place.phones || [],
            google_maps_url: place.google_maps_url || "",
            working_hours: place.working_hours || JSON.stringify({ type: "24/7" }),
            latitude: place.latitude,
            longitude: place.longitude,
            is_main: true,
            website_url: place.website_url || null,
            features: place.features || [],
            services: place.services || []
          }));

          // Bulk insert branches
          const { error: branchesError } = await supabase
            .from("branches")
            .insert(branchesPayload);

          if (branchesError) {
            console.warn("Branches bulk insert failed:", branchesError);
          }

          // Fetch inserted places with branch info (matching standard places format in state)
          newlyInsertedWithBranches = insertedPlaces.map((place, idx) => {
            const mainBranch = branchesPayload[idx];
            return {
              ...place,
              branches: mainBranch ? [{ ...mainBranch, id: `temp-branch-${idx}` }] : []
            };
          });
        }
      }

      // 2. Process Update Places
      if (updatePlaces.length > 0) {
        for (const p of updatePlaces) {
          if (!p.existingId) continue;

          const updatedFields: any = {
            name: p.name,
            name_en: p.name_en || null,
            category: p.category,
            category_label: p.category_label || CATEGORY_MAP[p.category] || p.category,
            sub_categories: p.sub_categories || [],
            governorate: p.governorate,
            city: p.city,
            short_description: p.short_description || "",
            full_address: p.full_address || "",
            phones: p.phones || [],
            google_maps_url: p.google_maps_url || "",
            images: p.images || [],
            menu_images: p.menu_images || [],
            working_hours: p.working_hours || JSON.stringify({ type: "24/7" }),
            description: p.description || "",
            latitude: p.latitude,
            longitude: p.longitude,
            website_url: p.website_url || null,
            features: p.features || [],
            services: p.services || [],
            place_type: p.place_type || null,
            place_type_icon: p.place_type_icon || null
          };

          let { data: updatedData, error: updateError } = await supabase
            .from("places")
            .update(updatedFields)
            .eq("id", p.existingId)
            .select()
            .single();

          if (updateError) {
            console.warn(`Place update failed for ${p.name}, trying fallbacks...`, updateError);
            const fallbackFields = { ...updatedFields };
            delete fallbackFields.features;
            let retryResult = await supabase
              .from("places")
              .update(fallbackFields)
              .eq("id", p.existingId)
              .select()
              .single();

            if (retryResult.error) {
              delete fallbackFields.website_url;
              retryResult = await supabase
                .from("places")
                .update(fallbackFields)
                .eq("id", p.existingId)
                .select()
                .single();

              if (retryResult.error) {
                delete fallbackFields.sub_categories;
                retryResult = await supabase
                  .from("places")
                  .update(fallbackFields)
                  .eq("id", p.existingId)
                  .select()
                  .single();
              }
            }
            updatedData = retryResult.data;
          }

          if (updatedData) {
            updatedCount++;
            updatedPlacesMap[p.existingId] = updatedData;

            // Synchronize main branch in branches table
            const branchPayload: any = {
              name: p.name,
              governorate: p.governorate,
              city: p.city,
              full_address: p.full_address || "",
              phones: p.phones || [],
              google_maps_url: p.google_maps_url || "",
              working_hours: p.working_hours || JSON.stringify({ type: "24/7" }),
              website_url: p.website_url || null,
              features: p.features || [],
              services: p.services || []
            };

            let { error: branchErr } = await supabase
              .from("branches")
              .update(branchPayload)
              .eq("place_id", p.existingId)
              .eq("is_main", true);

            if (branchErr) {
              const fallbackBranch = { ...branchPayload };
              delete fallbackBranch.features;
              let retryB = await supabase
                .from("branches")
                .update(fallbackBranch)
                .eq("place_id", p.existingId)
                .eq("is_main", true);

              if (retryB.error) {
                delete fallbackBranch.website_url;
                await supabase
                  .from("branches")
                  .update(fallbackBranch)
                  .eq("place_id", p.existingId)
                  .eq("is_main", true);
              }
            }
          }
        }
      }

      // 3. Update local state
      setPlaces(prev => {
        let next = prev.map(p => {
          if (updatedPlacesMap[p.id]) {
            return {
              ...p,
              ...updatedPlacesMap[p.id],
              branches: p.branches
            };
          }
          return p;
        });
        if (newlyInsertedWithBranches.length > 0) {
          next = [...newlyInsertedWithBranches, ...next];
        }
        return next;
      });

      const successParts: string[] = [];
      if (insertedCount > 0) successParts.push(`إضافة ${insertedCount} مكان جديد وإنشاء فروعها الرئيسية`);
      if (updatedCount > 0) successParts.push(`تحديث بيانات ${updatedCount} مكان مسجل مسبقاً`);
      setImportSuccess(`تم بنجاح ${successParts.join(" و ")}!`);

      setParsedPlaces([]);
      setDuplicates([]);

      const fileInput = document.getElementById("excel-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setImportError("حدث خطأ أثناء حفظ الأماكن: " + (err.message || ""));
    } finally {
      setImporting(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedPlaceForBranch) return;

    setIsSubmittingBranch(true);
    setError("");

    try {
      const phonesArray = branchFormData.phones.split(",").map(p => p.trim()).filter(Boolean);
      const mediaArray = branchFormData.media.split(",").map(m => m.trim()).filter(Boolean);

      let savedData, insertOrUpdateError;

      if (editingBranchId) {
        const { data, error } = await supabase
          .from("branches")
          .update({
            name: branchFormData.name,
            governorate: branchFormData.governorate,
            city: branchFormData.city,
            full_address: branchFormData.full_address,
            phones: phonesArray,
            google_maps_url: branchFormData.google_maps_url,
            working_hours: branchScheduleType === "24/7" ? "24/7" : JSON.stringify({ type: "custom", schedule: branchScheduleData }),
            latitude: parseFloat(branchFormData.latitude) || null,
            longitude: parseFloat(branchFormData.longitude) || null,
            media: mediaArray
          })
          .eq("id", editingBranchId)
          .select()
          .single();
        savedData = data;
        insertOrUpdateError = error;
      } else {
        const newBranch = {
          place_id: selectedPlaceForBranch.id,
          name: branchFormData.name,
          governorate: branchFormData.governorate,
          city: branchFormData.city,
          full_address: branchFormData.full_address,
          phones: phonesArray,
          google_maps_url: branchFormData.google_maps_url,
          working_hours: branchScheduleType === "24/7" ? "24/7" : JSON.stringify({ type: "custom", schedule: branchScheduleData }),
          latitude: parseFloat(branchFormData.latitude) || null,
          longitude: parseFloat(branchFormData.longitude) || null,
          media: mediaArray,
          is_main: false
        };

        const { data, error } = await supabase
          .from("branches")
          .insert([newBranch])
          .select()
          .single();
        savedData = data;
        insertOrUpdateError = error;
      }

      if (insertOrUpdateError) throw insertOrUpdateError;

      if (savedData) {
        // Update local state
        const updatedPlaces = places.map(p => {
          if (p.id === selectedPlaceForBranch.id) {
            const branches = p.branches || [];
            if (editingBranchId) {
              return { ...p, branches: branches.map(b => b.id === editingBranchId ? savedData : b) };
            } else {
              return { ...p, branches: [...branches, savedData] };
            }
          }
          return p;
        });
        setPlaces(updatedPlaces);

        // Reset form but keep modal open
        setEditingBranchId(null);
        setBranchFormData({
          name: "", governorate: selectedPlaceForBranch.governorate || "القاهرة", city: "",
          full_address: "", phones: "", google_maps_url: "", latitude: "", longitude: "", media: ""
        });

        alert(editingBranchId ? "تم تعديل الفرع بنجاح!" : "تم إضافة الفرع بنجاح!");
      }
    } catch (err: any) {
      alert((editingBranchId ? "فشل تعديل الفرع: " : "فشل إضافة الفرع: ") + (err.message || ""));
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const handleEditBranch = (b: any) => {
    setEditingBranchId(b.id);
    setBranchFormData({
      name: b.name || "",
      governorate: b.governorate || selectedPlaceForBranch?.governorate || "القاهرة",
      city: b.city || "",
      full_address: b.full_address || "",
      phones: (b.phones || []).join(", "),
      google_maps_url: b.google_maps_url || "",
      latitude: b.latitude?.toString() || "",
      longitude: b.longitude?.toString() || "",
      media: (b.media || []).join(", ")
    });

    const hw = b.working_hours;
    if (!hw || hw === "24/7") {
      setBranchScheduleType("24/7");
    } else {
      try {
        const parsed = JSON.parse(hw);
        if (parsed.type === "custom" && parsed.schedule) {
          setBranchScheduleType("custom");
          setBranchScheduleData(parsed.schedule);
        } else {
          setBranchScheduleType("24/7");
        }
      } catch (e) {
        setBranchScheduleType("24/7");
      }
    }
  };

  const handleDeleteBranch = async (branchId: string, placeId: string, isMain: boolean) => {
    if (isMain) {
      alert("لا يمكن حذف الفرع الرئيسي مباشرة. يمكنك حذف المكان بالكامل.");
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟")) return;
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase.from("branches").delete().eq("id", branchId);
      if (deleteError) throw deleteError;

      const updatedPlaces = places.map(p => {
        if (p.id === placeId) {
          return { ...p, branches: (p.branches || []).filter(b => b.id !== branchId) };
        }
        return p;
      });
      setPlaces(updatedPlaces);
    } catch (err: any) {
      alert("فشل حذف الفرع: " + err.message);
    }
  };

  const extractCoordinates = async (url: string) => {
    if (!url || !url.includes("maps")) return;
    try {
      const res = await fetch(`/api/extract-location?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          updateForm("latitude", data.latitude.toString());
          updateForm("longitude", data.longitude.toString());
        }
      }
    } catch (err) {
      console.error("Failed to extract coordinates", err);
    }
  };

  const extractBranchCoordinates = async (url: string) => {
    if (!url || !url.includes("maps")) return;
    try {
      const res = await fetch(`/api/extract-location?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setBranchFormData(p => ({ ...p, latitude: data.latitude.toString(), longitude: data.longitude.toString() }));
        }
      }
    } catch (err) {
      console.error("Failed to extract branch coordinates", err);
    }
  };




  const handleDeletePlace = (id: string) => {
    setPlaceToDeleteId(id);
  };

  const confirmDeletePlace = async () => {
    if (!placeToDeleteId || !supabase) return;
    setIsDeletingPlace(true);
    const targetPlace = places.find(p => p.id === placeToDeleteId);
    const deletedPlaceName = targetPlace?.name;
    try {
      await deletePlacesAndRelations([placeToDeleteId]);
      setPlaces(places.filter(p => p.id !== placeToDeleteId));
      setSelectedPlaceIds(prev => prev.filter(id => id !== placeToDeleteId));
      setPlaceToDeleteId(null);
      setDeleteAlertModal({
        isOpen: true,
        type: "success",
        title: "تم الحذف بنجاح",
        message: "تم بنجاح حذف 1 مكان من قاعدة البيانات!",
        placeName: deletedPlaceName,
      });
    } catch (err: any) {
      setDeleteAlertModal({
        isOpen: true,
        type: "error",
        title: "فشل الحذف",
        message: "فشل الحذف: " + (err.message || "Bad Request"),
      });
    } finally {
      setIsDeletingPlace(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryPlace || !supabase) return;
    setIsUpdatingCategory(true);
    const labels: any = { restaurant: "مطعم", cafe: "كافيه", pharmacy: "صيدلية", medicalCenter: "مركز طبي", garden: "حديقة", family: "عائلية", entertainment: "ترفيهية", work: "مكاتب" };
    try {
      const { error } = await supabase
        .from("places")
        .update({ category: editingCategory, category_label: labels[editingCategory] || editingCategory })
        .eq("id", editingCategoryPlace.id);
      if (error) throw error;
      setPlaces(places.map(p =>
        p.id === editingCategoryPlace.id
          ? { ...p, category: editingCategory, category_label: labels[editingCategory] || editingCategory }
          : p
      ));
      setEditingCategoryPlace(null);
    } catch (err: any) {
      alert("فشل تحديث التصنيف: " + err.message);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleUpdatePlace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPlace || !supabase || !editPlaceFormData.name.trim()) return;
    setIsUpdatingPlace(true);

    try {
      const phonesArray = editPlaceFormData.phones.split(",").map(p => p.trim()).filter(Boolean);
      const imagesArray = editPlaceFormData.image_url ? [editPlaceFormData.image_url.trim()] : [];
      const menuImagesArray = editPlaceFormData.menu_images.split(",").map(m => m.trim()).filter(Boolean);

      const finalWorkingHours = JSON.stringify({
        type: editScheduleType,
        schedule: editScheduleType === "custom" ? editScheduleData : undefined
      });

      const updatedFields = {
        name: editPlaceFormData.name.trim(),
        name_en: editPlaceFormData.name_en.trim() || null,
        category: editPlaceFormData.category,
        category_label: editPlaceFormData.category_label || CATEGORY_MAP[editPlaceFormData.category] || editPlaceFormData.category,
        sub_categories: editPlaceFormData.sub_categories || [],
        governorate: editPlaceFormData.governorate,
        city: editPlaceFormData.city,
        short_description: editPlaceFormData.short_description,
        full_address: editPlaceFormData.full_address,
        phones: phonesArray,
        google_maps_url: editPlaceFormData.google_maps_url,
        images: imagesArray,
        menu_images: menuImagesArray,
        working_hours: finalWorkingHours,
        description: editPlaceFormData.description,
        latitude: parseFloat(editPlaceFormData.latitude) || null,
        longitude: parseFloat(editPlaceFormData.longitude) || null,
        website_url: editPlaceFormData.website_url.trim() || null,
        features: editPlaceFormData.features || [],
        services: editPlaceFormData.services || [],
        place_type: editPlaceFormData.place_type.trim() || null,
        place_type_icon: editPlaceFormData.place_type.trim() ? (formatBoxIcon(editPlaceFormData.place_type_icon).trim() || "bx bx-tag") : null
      };

      let { data, error } = await supabase
        .from("places")
        .update(updatedFields)
        .eq("id", editingPlace.id)
        .select()
        .single();

      if (error) {
        console.warn("Place update failed, trying fallbacks...");
        const fallbackFields = { ...updatedFields };
        // @ts-ignore
        delete fallbackFields.features;
        let retryResult = await supabase
          .from("places")
          .update(fallbackFields)
          .eq("id", editingPlace.id)
          .select()
          .single();

        if (retryResult.error) {
          // @ts-ignore
          delete fallbackFields.website_url;
          retryResult = await supabase
            .from("places")
            .update(fallbackFields)
            .eq("id", editingPlace.id)
            .select()
            .single();

          if (retryResult.error) {
            // @ts-ignore
            delete fallbackFields.sub_categories;
            retryResult = await supabase
              .from("places")
              .update(fallbackFields)
              .eq("id", editingPlace.id)
              .select()
              .single();
          }
        }
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) throw error;

      // Synchronize updated phones, address, working hours, website_url & features with the main branch in branches table
      const branchUpdatePayload = {
        name: editPlaceFormData.name.trim(),
        governorate: editPlaceFormData.governorate,
        city: editPlaceFormData.city,
        full_address: editPlaceFormData.full_address,
        phones: phonesArray,
        google_maps_url: editPlaceFormData.google_maps_url,
        working_hours: finalWorkingHours,
        website_url: editPlaceFormData.website_url.trim() || null,
        features: editPlaceFormData.features || [],
        services: editPlaceFormData.services || []
      };

      let { error: branchUpdateError } = await supabase
        .from("branches")
        .update(branchUpdatePayload)
        .eq("place_id", editingPlace.id)
        .eq("is_main", true);

      if (branchUpdateError) {
        console.warn("Branch update failed with website_url/features, trying fallback...");
        const fallbackBranchUpdate = { ...branchUpdatePayload };
        // @ts-ignore
        delete fallbackBranchUpdate.features;
        let retryBranch = await supabase
          .from("branches")
          .update(fallbackBranchUpdate)
          .eq("place_id", editingPlace.id)
          .eq("is_main", true);

        if (retryBranch.error) {
          // @ts-ignore
          delete fallbackBranchUpdate.website_url;
          await supabase
            .from("branches")
            .update(fallbackBranchUpdate)
            .eq("place_id", editingPlace.id)
            .eq("is_main", true);
        }
      }

      setPlaces(prev => prev.map(p => p.id === editingPlace.id ? { ...p, ...(data || updatedFields) } : p));
      alert(`تم تحديث كافة بيانات المكان "${editPlaceFormData.name}" بنجاح!`);
      setEditingPlace(null);
    } catch (err: any) {
      alert("فشل تحديث بيانات المكان: " + err.message);
    } finally {
      setIsUpdatingPlace(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("هل تريد إضافة البيانات التجريبية الأولية؟")) return;
    if (!supabase) return;

    setIsSubmitting(true);
    try {
      const formattedInitialPlaces = initialPlaces.map(p => {
        // Parse briefLocation to governorate and city as a fallback for seed data
        const parts = (p.briefLocation || "").split("/").map(s => s.trim());
        const city = parts[0] || "غير محدد";
        const gov = parts[1] || parts[0] || "غير محدد";

        return {
          name: p.name,
          category: p.category,
          category_label: p.categoryLabel,
          governorate: gov,
          city: city,
          short_description: p.shortDescription || p.description?.substring(0, 50) || "",
          full_address: p.fullAddress,
          phones: p.phones || [],
          google_maps_url: p.googleMapsUrl || "",
          images: p.images || [],
          menu_images: p.menuImages || [],
          working_hours: JSON.stringify({ type: "24/7" }), // Default legacy seed to 24/7 or custom

          rating: p.rating || 0,
          description: p.description || "",
          latitude: p.latitude || null,
          longitude: p.longitude || null,
        };
      });

      const { data, error: insertError } = await supabase
        .from("places")
        .insert(formattedInitialPlaces)
        .select();

      if (insertError) throw insertError;
      if (data) {
        setPlaces([...data, ...places]);
        alert("تم إضافة البيانات بنجاح!");
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء الإضافة: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: "40px", height: "40px" }} /></div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
        <div>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🚫</h1>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#ff3b30", marginBottom: "10px" }}>صلاحيات غير كافية</h2>
          <p style={{ color: "var(--textSecondary)" }}>عذراً، هذه الصفحة مخصصة للمشرفين فقط.</p>
        </div>
        {/* ── نافذة إضافة تصنيف جديد وتحديد الأيقونة من Boxicons ── */}
        {showAddCategoryModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.3s ease" }}>
            <div style={{ background: "rgba(18, 24, 52, 0.95)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "520px", border: "1px solid rgba(108, 99, 255, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🏷️</span> إضافة تصنيف جديد
                </h3>
                <button onClick={() => setShowAddCategoryModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleAddCategorySubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="help-label" style={{ fontWeight: "700" }}>اسم التصنيف (بالعربية)</label>
                  <input
                    required
                    className="input-fields"
                    value={newCatLabel}
                    onChange={e => {
                      setNewCatLabel(e.target.value);
                      if (!newCatKey) {
                        setNewCatKey(e.target.value.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
                      }
                    }}
                    placeholder="مثال: جيم ورئاضة، مغسلة سيارات، سينما..."
                  />
                </div>

                <div>
                  <label className="help-label">معرّف التصنيف الإنجليزي (اختياري)</label>
                  <input
                    className="input-fields"
                    value={newCatKey}
                    onChange={e => setNewCatKey(e.target.value)}
                    placeholder="مثال: gym, car_wash, cinema..."
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                </div>

                <div>
                  <label className="help-label" style={{ fontWeight: "700" }}>اختر أيقونة من Boxicons</label>

                  {/* Live Icon Preview */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(108, 99, 255, 0.1)", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(108, 99, 255, 0.2)", marginBottom: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--colorPrimary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.4rem" }}>
                      <i className={newCatIcon}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--textPrimary)" }}>الأيقونة المحددة:</div>
                      <code style={{ fontSize: "0.8rem", color: "var(--colorPrimary)", direction: "ltr" }}>{newCatIcon}</code>
                    </div>
                  </div>

                  {/* Popular Presets Picker */}
                  <div style={{ fontSize: "0.82rem", color: "var(--textSecondary)", marginBottom: "8px", fontWeight: "600" }}>أيقونات شائعة للاختيار السريع:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px", maxHeight: "180px", overflowY: "auto", padding: "6px", background: "rgba(108, 99, 255, 0.08)", borderRadius: "14px", border: "1px solid var(--borderGlass)", marginBottom: "14px" }}>
                    {PRESET_BOXICONS.map((item) => (
                      <button
                        key={item.icon}
                        type="button"
                        onClick={() => setNewCatIcon(item.icon)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: newCatIcon === item.icon ? "2px solid var(--colorPrimary)" : "1px solid var(--borderGlass)",
                          background: newCatIcon === item.icon ? "rgba(108, 99, 255, 0.2)" : "rgba(255,255,255,0.03)",
                          color: "var(--textPrimary)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <i className={item.icon} style={{ fontSize: "1.1rem", color: "var(--colorPrimary)" }}></i>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Boxicon Class Input */}
                  <label className="help-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>أو اكتب كلاس أي أيقونة من Boxicons مباشرة:</label>
                  <input
                    className="input-fields"
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    placeholder="bx bx-store"
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                  <button type="submit" disabled={isAddingCategory || !newCatLabel.trim()} className="btn btn-primary" style={{ flex: 1, padding: "14px", fontSize: "1rem" }}>
                    {isAddingCategory ? "جاري الحفظ..." : "حفظ التصنيف"}
                  </button>
                  <button type="button" onClick={() => setShowAddCategoryModal(false)} className="btn btn-cancel" style={{ flex: 1, padding: "14px", fontSize: "1rem" }}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }


  return (
    <div className="app-container" style={{ padding: "16px 0", maxWidth: "100%", width: "100%" }}>

      <div style={{ marginBottom: "24px", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--textPrimary, #fff)", marginBottom: "6px" }}>
            إدارة الأماكن
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            إضافة وتعديل وحذف الأماكن وتعديل بياناتها.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "100%", marginTop: "20px" }}>
          {places.length === 0 && (
            <button className="btn" onClick={handleSeedData} disabled={isSubmitting} style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
              تفعيل بيانات تجريبية
            </button>
          )}
          <button className="btn btn-cancel" onClick={() => { setShowExcelImport(!showExcelImport); setShowAddForm(false); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {showExcelImport ? "إلغاء الاستيراد" : <><i className="bx bx-download"></i> استيراد من Excel</>}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setShowExcelImport(false); }} >
            {showAddForm ? "إلغاء الإضافة" : <><i className="bx bx-plus-circle"></i> إضافة مكان جديد</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "16px", borderRadius: "16px", color: "#ff3b30", marginBottom: "30px", fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      {/* Excel Import Panel */}
      {showExcelImport && (
        <div className="ios-sheet" style={{ maxWidth: "100%", padding: "18px 24px", marginBottom: "40px", borderRadius: "15px", border: "1px solid rgba(52, 199, 89, 0.3)", animation: "slide-in-section 0.4s ease", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
            <h5 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <i className="bx bx-file" style={{ color: "#34c759", fontSize: "1.6rem" }}></i> استيراد الأماكن من ملف Excel / CSV
            </h5>
          </div>

          <details style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px", border: "1px solid var(--borderGlass)", padding: "12px 16px", marginBottom: "20px" }}>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadTemplate}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", marginTop: "20px" }}
            >
              <i className="bx bx-download"></i> تحميل نموذج Excel التجريبي
            </button>

            <summary style={{ cursor: "pointer", fontWeight: "700", fontSize: "0.92rem", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-help-circle" style={{ color: "#007aff", fontSize: "1.2rem" }}></i>
              دليل أسماء التصنيفات الفرعية وطرق كتابة مواعيد العمل (اضغط للعرض)
            </summary>
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h4 style={{ fontSize: "0.88rem", color: "var(--colorPrimary)", marginBottom: "8px", fontWeight: "700" }}>⏰ طرق إدخال مواعيد العمل المتغيرة في Excel:</h4>
                <ul style={{ paddingRight: "20px", margin: 0, color: "var(--textSecondary)", fontSize: "0.85rem", lineHeight: "1.6", backgroundColor: "var(--secondBtn)", padding: "6px 14px", borderRadius: "8px" }}>
                  <li style={{ paddingTop: "5px" }}><strong>خيار 1 (24/7):</strong> اكتب <code>24/7</code> في عمود <i>مواعيد العمل</i>.</li>
                  <li style={{ paddingTop: "5px" }}><strong>خيار 2 (مواعيد متغيرة لكل يوم في عمود واحد):</strong> اكتب <code>السبت - الأربعاء: 09:00 ص - 11:00 م | الخميس: 09:00 ص - 12:00 م | الجمعة: إجازة</code></li>
                  <li style={{ paddingTop: "5px" }}><strong>خيار 3 (أعمدة يومية مستقلة في الشيت):</strong> أضف أعمدة باسم <code>مواعيد الأحد</code>، <code>مواعيد الإثنين</code>، ... <code>مواعيد الجمعة</code> واكتب الوقت (مثال: <code>09:00 ص - 11:00 م</code> أو <code>إجازة</code>).</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: "0.88rem", color: "var(--colorPrimary)", marginBottom: "8px", fontWeight: "700" }}>📂 أسماء التصنيفات الفرعية المتاحة لكل قسم رئيسي:</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", fontSize: "0.85rem" }}>
                  {CATEGORIES_STRUCTURE.map(main => (
                    <div key={main.name} style={{ background: "var(--secondBtn)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--borderPrimary)" }}>
                      <div style={{ fontWeight: "700", color: "var(--colorPrimary)", marginBottom: "6px" }}>{main.emoji} {main.label}</div>
                      <div style={{ color: "var(--textSecondary)", lineHeight: "1.5" }}>
                        {main.subCategories.map(s => s.label).join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <div style={{ border: "2px dashed rgba(52, 199, 89, 0.25)", borderRadius: "12px", padding: "30px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", background: "rgba(52, 199, 89, 0.02)", marginBottom: "20px", cursor: "pointer", transition: "all 0.2s" }}>
            <i className="bx bx-cloud-upload" style={{ fontSize: "3rem", color: "#34c759" }}></i>
            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>اختر ملف Excel أو اسحبه إلى هنا</span>
            <span style={{ fontSize: "0.8rem", color: "var(--textSecondary)" }}>يدعم الملفات بصيغة .xlsx, .xls, .csv</span>
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
              style={{ display: "block", marginTop: "10px", fontSize: "0.85rem", backgroundColor: "var(--secondBtn)", color: "var(--textPrimary)", borderRadius: "8px", border: "1px solid var(--borderPrimary)", padding: "6px 14px", fontFamily: "var(--font-body)" }}
            />
          </div>

          {importError && (
            <div style={{ background: "rgba(255, 59, 48, 0.12)", border: "1px solid rgba(255, 59, 48, 0.25)", padding: "14px 18px", borderRadius: "10px", color: "#ff3b30", marginBottom: "20px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }}></i>
              <div>{importError}</div>
            </div>
          )}

          {importSuccess && (
            <div style={{ background: "rgba(52, 199, 89, 0.12)", border: "1px solid rgba(52, 199, 89, 0.25)", padding: "14px 18px", borderRadius: "10px", color: "#34c759", marginBottom: "20px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }}></i>
              <div>{importSuccess}</div>
            </div>
          )}

          {parsedPlaces.length > 0 && (() => {
            const q = parsedPlacesSearch.trim().toLowerCase();
            const visiblePlacesWithIdx = parsedPlaces
              .map((p, originalIdx) => ({ p, originalIdx }))
              .filter(({ p }) => {
                if (!q) return true;
                return (
                  (p.name || "").toLowerCase().includes(q) ||
                  (p.name_en || "").toLowerCase().includes(q) ||
                  (p.category_label || "").toLowerCase().includes(q) ||
                  (p.city || "").toLowerCase().includes(q) ||
                  (p.full_address || "").toLowerCase().includes(q) ||
                  (p.phones || []).some((ph: string) => ph.includes(q))
                );
              });

            const visibleIndices = visiblePlacesWithIdx.map(item => item.originalIdx);
            const allVisibleSelected = visibleIndices.length > 0 && visibleIndices.every(i => selectedParsedIndices.has(i));

            const newPlacesCount = parsedPlaces.filter(p => !p.isUpdate && p.duplicateType === null).length;
            const updatePlacesCount = parsedPlaces.filter(p => p.isUpdate).length;
            const duplicatePlacesCount = duplicates.length;

            return (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h5 style={{ fontSize: "1rem", fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      🎯 معاينة البيانات ({parsedPlaces.length} مكان مستخرج):
                    </h5>
                    {newPlacesCount > 0 && (
                      <span className="sub-title" style={{ background: "rgba(52, 199, 89, 0.09)", color: "#34c759", fontWeight: "bold" }}>
                        ✨ {newPlacesCount} جديد
                      </span>
                    )}
                    {updatePlacesCount > 0 && (
                      <span className="sub-title" style={{ background: "rgba(0, 122, 255, 0.09)", color: "#007aff", fontWeight: "bold" }}>
                        🔄 {updatePlacesCount} تعديل بيانات
                      </span>
                    )}
                    {duplicatePlacesCount > 0 && (
                      <span className="sub-title" style={{ background: "rgba(255, 0, 0, 0.07)", color: "#ff0000ff", fontWeight: "bold" }}>
                        ❌ {duplicatePlacesCount} متكرر
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {selectedParsedIndices.size > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedParsedPlaces}
                        className="btn btn-danger"
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: "bold",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <i className="bx bx-trash" style={{ fontSize: "1rem" }}></i>
                        حذف المحدد ({selectedParsedIndices.size})
                      </button>
                    )}

                    <button
                      type="button"
                      title="نشر الأماكن في قاعدة البيانات"
                      aria-label="نشر الأماكن"
                      disabled={importing}
                      onClick={handleImportSubmit}
                      className="btn btn-primary"
                      style={{
                        width: "36px",
                        height: "36px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: importing ? "not-allowed" : "pointer",
                        opacity: importing ? 0.7 : 1,
                        fontSize: "1.3rem",
                        transition: "all 0.2s"
                      }}
                    >
                      {importing ? <i className="bx bx-loader-alt bx-spin"></i> : <i className="bx bx-send"></i>}
                    </button>
                    <button
                      type="button"
                      title="إلغاء المعاينة"
                      aria-label="إلغاء المعاينة"
                      disabled={importing}
                      onClick={() => {
                        setParsedPlaces([]);
                        setSelectedParsedIndices(new Set());
                        setParsedPlacesSearch("");
                        const fileInput = document.getElementById("excel-file-input") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="btn btn-cancel"
                      style={{
                        width: "36px",
                        height: "36px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: importing ? "not-allowed" : "pointer",
                        opacity: importing ? 0.7 : 1,
                        fontSize: "1.3rem",
                        transition: "all 0.2s"
                      }}
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  </div>
                </div>

                {/* Filter and Search within Parsed Places */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", flex: "1", minWidth: "220px" }}>
                    <i className="bx bx-search" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "1.1rem" }}></i>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="ابحث في الأماكن المستخرجة (الاسم، التصنيف، المدينة، الهاتف)..."
                      value={parsedPlacesSearch}
                      onChange={(e) => setParsedPlacesSearch(e.target.value)}
                      style={{ paddingRight: "36px", fontSize: "0.85rem", height: "36px" }}
                    />
                    {parsedPlacesSearch && (
                      <button
                        type="button"
                        onClick={() => setParsedPlacesSearch("")}
                        style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    )}
                  </div>
                  {parsedPlacesSearch && (
                    <span style={{ fontSize: "0.8rem", color: "var(--textSecondary)" }}>
                      نتائج البحث: <strong>{visiblePlacesWithIdx.length}</strong> من {parsedPlaces.length}
                    </span>
                  )}
                </div>

                {updatePlacesCount > 0 && (
                  <div style={{ background: "rgba(0, 122, 255, 0.09)", border: "1px solid rgba(0, 122, 255, 0.25)", padding: "12px 18px", borderRadius: "10px", color: "#007aff", marginBottom: "16px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="bx bx-sync" style={{ fontSize: "1.4rem", flexShrink: 0 }}></i>
                    <div>
                      <strong>تحديث بيانات: تم العثور على {updatePlacesCount} مكان مسجل مسبقاً مع وجود بيانات معدلة.</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--textSecondary)", marginTop: "2px" }}>
                        سيتم تحديث هذه الأماكن تلقائياً في قاعدة البيانات (بما في ذلك مواعيد العمل، الهواتف، الصور، موقع الويب... إلخ) عند حفظ الأماكن بدلاً من اعتبارها مكررة.
                      </div>
                    </div>
                  </div>
                )}

                {duplicates.length > 0 && (
                  <div style={{ background: "rgba(255, 149, 0, 0.12)", border: "1px solid rgba(255, 149, 0, 0.25)", padding: "14px 18px", borderRadius: "10px", color: "#ff9500", marginBottom: "20px", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="bx bx-error" style={{ fontSize: "1.3rem" }}></i>
                      <strong>تحذير: تم اكتشاف {duplicates.length} مكان مكرر دون أي تعديل في البيانات!</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                      تم العثور على أسطر مكررة داخل ملف الإكسل نفسه أو أنها متطابقة تماماً وبكافة تفاصيلها مع أماكن مسجلة مسبقاً بالموقع دون أي تغيير. يمكنك النقر على زر "حذف المتكرر" لتصفيتها تلقائياً.
                    </p>
                    <div>
                      <button
                        type="button"
                        className="btn"
                        onClick={handleRemoveDuplicates}
                        style={{ background: "#ff9500", color: "#fff", border: "none", fontSize: "0.82rem", padding: "6px 14px", fontWeight: "bold" }}
                      >
                        🧹 حذف المتكرر ({duplicates.length})
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid var(--border-color, rgba(255,255,255,0.1))", maxHeight: "600px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "right" }}>
                    <thead>
                      <tr style={{ background: "var(--bgSecondary, rgba(255,255,255,0.05))", borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.1))", position: "sticky", top: 0, zIndex: 2 }}>
                        <th style={{ padding: "10px 10px", width: "40px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={() => toggleSelectAllParsedPlaces(visibleIndices)}
                            title="تحديد الكل"
                            style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--colorPrimary, #6c63ff)" }}
                          />
                        </th>
                        <th style={{ padding: "10px 14px" }}>الاسم</th>
                        <th style={{ padding: "10px 14px" }}>القسم </th>
                        <th style={{ padding: "10px 14px" }}>المدينة</th>
                        <th style={{ padding: "10px 14px" }}>الهواتف</th>
                        <th style={{ padding: "10px 14px", textAlign: "center", width: "60px" }}>حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePlacesWithIdx.map(({ p, originalIdx }) => {
                        const isSelected = selectedParsedIndices.has(originalIdx);
                        return (
                          <tr key={originalIdx} style={{
                            borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))",
                            background: isSelected
                              ? "rgba(108, 99, 255, 0.12)"
                              : p.duplicateType === "db"
                                ? "rgba(255, 59, 48, 0.08)"
                                : p.duplicateType === "internal"
                                  ? "rgba(255, 149, 0, 0.08)"
                                  : p.isUpdate
                                    ? "rgba(0, 122, 255, 0.08)"
                                    : "transparent",
                            transition: "background 0.15s"
                          }}>
                            <td style={{ padding: "8px 10px", textAlign: "center", width: "5%" }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectParsedPlace(originalIdx)}
                                style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--colorPrimary, #6c63ff)" }}
                              />
                            </td>
                            <td style={{ padding: "8px 14px", fontWeight: "600", width: "70%" }}>
                              <div>{p.name}</div>
                              {p.name_en && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal", direction: "ltr", textAlign: "right" }}>
                                  {p.name_en}
                                </div>
                              )}
                              {p.isUpdate && (
                                <div style={{ marginTop: "4px" }}>
                                  <span style={{ fontSize: "0.72rem", color: "#007aff", background: "rgba(0, 122, 255, 0.15)", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    🔄 سيتم تحديث البيانات
                                  </span>
                                  {p.changedFields && p.changedFields.length > 0 && (
                                    <div style={{ fontSize: "0.72rem", color: "var(--textSecondary)", marginTop: "2px", fontWeight: "normal" }}>
                                      تعديل في: <span style={{ color: "var(--textPrimary)", fontWeight: "600" }}>{p.changedFields.join("، ")}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {p.duplicateType === "db" && (
                                <span style={{ fontSize: "0.68rem", color: "#ff3b30", marginRight: "4px", background: "rgba(255, 59, 48, 0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "4px" }}>
                                  ⚠️ مسجل مسبقاً
                                </span>
                              )}
                              {p.duplicateType === "internal" && (
                                <span style={{ fontSize: "0.7rem", color: "#ff9500", marginRight: "4px", background: "rgba(255, 149, 0, 0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "4px" }}>
                                  ⚠️ مكرر بالملف (السطر {p.rowNum})
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "8px 14px", width: "5%" }}><span className="badge-ios" style={{ background: "rgba(108, 99, 255, 0.15)", color: "var(--colorPrimary)" }}>{p.category_label}</span></td>
                            <td style={{ padding: "8px 14px", width: "10%" }}>{p.city}</td>
                            <td style={{ padding: "8px 14px", width: "5%" }}>{p.phones.join(", ") || "-"}</td>
                            <td style={{ padding: "8px 14px", textAlign: "center", width: "5%" }}>
                              <button
                                type="button"
                                title="حذف هذا المكان من قائمة الاستيراد"
                                aria-label="حذف المكان"
                                onClick={() => handleDeleteParsedPlace(originalIdx)}
                                style={{
                                  background: "rgba(255, 59, 48, 0.12)",
                                  color: "#ff3b30",
                                  border: "1px solid rgba(255, 59, 48, 0.25)",
                                  borderRadius: "var(--radius-full)",
                                  padding: "6px",
                                  fontSize: "0.95rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#ff3b30";
                                  e.currentTarget.style.color = "#fff";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "rgba(255, 59, 48, 0.12)";
                                  e.currentTarget.style.color = "#ff3b30";
                                }}
                              >
                                <i className="bx bx-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", gap: "12px", margin: "14px 0", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={importing}
                    onClick={handleImportSubmit}
                    style={{ background: "#34c759", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    {importing ? (
                      <>🔄 جاري حفظ الأماكن والتعديلات...</>
                    ) : (
                      <>
                        📥 حفظ الأماكن في قاعدة البيانات
                        {" ("}
                        {newPlacesCount > 0 && `${newPlacesCount} جديد`}
                        {newPlacesCount > 0 && updatePlacesCount > 0 && " + "}
                        {updatePlacesCount > 0 && `${updatePlacesCount} تحديث`}
                        {newPlacesCount === 0 && updatePlacesCount === 0 && `${parsedPlaces.length}`}
                        {")"}
                      </>
                    )}
                  </button>
                  {selectedParsedIndices.size > 0 && (
                    <button
                      type="button"
                      className="btn"
                      onClick={handleDeleteSelectedParsedPlaces}
                      style={{ background: "#ff3b30", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <i className="bx bx-trash"></i>
                      حذف الأماكن المحددة ({selectedParsedIndices.size})
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Place Form */}
      {showAddForm && (
        <div className="ios-sheet" style={{ position: "sticky", maxWidth: "100%", padding: "20px", height: "auto", marginBottom: "40px", borderRadius: "15px", animation: "slide-in-section 0.4s ease" }}>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>إضافة مكان جديد</h2>
          <form onSubmit={handleAddPlace} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div><label className="help-label">اسم المكان (بالعربية)</label><input required className="input-fields" value={formData.name} onChange={e => updateForm("name", e.target.value)} placeholder="مثال: كوستا كافيه" /></div>
            <div><label className="help-label">اسم المكان (بالإنجليزية - للبحث)</label><input className="input-fields" value={formData.name_en} onChange={e => updateForm("name_en", e.target.value)} placeholder="مثال: Costa Coffee" style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div>
              <label className="help-label">التصنيف الرئيسي (الأساسي)</label>
              <select required className="input-fields help-select" value={formData.category} onChange={e => {
                const val = e.target.value;
                updateForm("category", val);
                updateForm("category_label", CATEGORY_MAP[val] || val);
                // Reset subcategories to first subcategory of new main category
                const subs = CATEGORIES_STRUCTURE.find(m => m.name === val)?.subCategories || [];
                if (subs.length > 0) {
                  updateForm("sub_categories", [subs[0].name]);
                } else {
                  updateForm("sub_categories", []);
                }
                updateForm("place_type", "");
                updateForm("place_type_icon", "");
              }}>
                {CATEGORIES_STRUCTURE.map(main => (
                  <option key={main.name} value={main.name}>{main.emoji} {main.label}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
              <label className="help-label" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", color: "var(--textPrimary)", display: "block" }}>
                التصنيفات الفرعية التابعة للقسم الرئيسي (تحدد نوع ومكان ظهور المحتوى بالتفصيل)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(CATEGORIES_STRUCTURE.find(m => m.name === formData.category)?.subCategories || []).map(cat => {
                  const isSelected = formData.sub_categories?.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        const current = formData.sub_categories || [];
                        const next = isSelected ? current.filter(s => s !== cat.name) : [...current, cat.name];
                        updateForm("sub_categories", next);
                        // Reset place type if we change first subcategory
                        if (current[0] !== next[0]) {
                          updateForm("place_type", "");
                          updateForm("place_type_icon", "");
                        }
                      }}
                      style={{
                        background: isSelected ? "var(--colorPrimary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                        color: isSelected ? "#fff" : "var(--textPrimary)",
                        border: isSelected ? "none" : "1px solid var(--borderGlass)",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: isSelected ? "700" : "500",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s"
                      }}
                    >
                      <i className={`bx ${cat.icon}`}></i> {cat.label} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Place Type Section */}
            <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="help-label" style={{ fontWeight: "700" }}>النوع الفرعي المخصص للمكان (مثال: صيني، سوري، مصري للمطاعم - عربي، فرنسي للكافيهات)</label>
                {(() => {
                  const subCat = formData.sub_categories?.[0] || "";
                  const existingTypes = Array.from(new Set(
                    places
                      .filter(p => p.sub_categories?.includes(subCat) && p.place_type?.trim())
                      .map(p => p.place_type!.trim())
                  )).filter(Boolean);

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                      {existingTypes.length > 0 && (
                        <div>
                          <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>اختر من الأنواع المضافة مسبقاً لهذا التصنيف:</label>
                          <select
                            className="input-fields help-select"
                            value={formData.place_type}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === "__new__") {
                                updateForm("place_type", "");
                                updateForm("place_type_icon", "bx bx-tag");
                              } else {
                                updateForm("place_type", val);
                                const found = places.find(p => p.place_type === val);
                                updateForm("place_type_icon", found?.place_type_icon || "bx bx-tag");
                              }
                            }}
                          >
                            <option value="">لا يوجد (بدون تحديد نوع مخصص)</option>
                            {existingTypes.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="__new__">+ إضافة نوع جديد للنشاط...</option>
                          </select>
                        </div>
                      )}

                      {/* If no existing types or admin chose to write a new one */}
                      {(existingTypes.length === 0 || !existingTypes.includes(formData.place_type)) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>اسم النوع الجديد:</label>
                            <input
                              className="input-fields"
                              placeholder="مثال: سوري، صيني، إيطالي..."
                              value={formData.place_type}
                              onChange={e => updateForm("place_type", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>أيقونة Boxicon مناسبة:</label>
                            <input
                              className="input-fields"
                              placeholder="مثال: bx bx-dish أو bx bx-coffee"
                              value={formData.place_type_icon}
                              onChange={e => updateForm("place_type_icon", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1", background: "rgba(46, 204, 113, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
              <label className="help-label" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", color: "var(--textPrimary)", display: "block" }}>
                معلومات مفيدة (المميزات والخدمات المتاحة بالمكان)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {FEATURES_LIST.map(feat => {
                  const isSelected = formData.features?.includes(feat.key);
                  return (
                    <button
                      key={feat.key}
                      type="button"
                      onClick={() => {
                        const current = formData.features || [];
                        const next = isSelected ? current.filter(f => f !== feat.key) : [...current, feat.key];
                        updateForm("features", next);
                      }}
                      style={{
                        background: isSelected ? "#2ecc71" : "rgba(255, 255, 255, 0.06)",
                        color: isSelected ? "#fff" : "var(--textPrimary)",
                        border: isSelected ? "none" : "1px solid var(--borderGlass)",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: isSelected ? "700" : "500",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>{feat.icon}</span> {feat.label} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Services Selection */}
            <div style={{ gridColumn: "1 / -1", background: "rgba(46, 204, 113, 0.03)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)", marginTop: "10px" }}>
              <MultiSelectSearch
                label="الخدمات المتاحة بالمكان"
                options={SERVICES_LIST}
                selected={formData.services || []}
                onChange={(selected) => updateForm("services", selected)}
                placeholder="اختر الخدمات مثل: قاعة أفراح، شركة شحن، كهربائي سيارات..."
              />
            </div>
            <div>
              <label className="help-label">المحافظة</label>
              <select className="input-fields help-select" value={formData.governorate} onChange={e => {
                updateForm("governorate", e.target.value);
                const firstCity = egyptLocations[e.target.value]?.[0] || "";
                updateForm("city", firstCity);
              }}>
                {governoratesList.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="help-label">المدينة / المنطقة</label>
              <select className="input-fields help-select" value={formData.city} onChange={e => updateForm("city", e.target.value)}>
                {(egyptLocations[formData.governorate] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label className="help-label">العنوان بالتفصيل</label><input required className="input-fields" value={formData.full_address} onChange={e => updateForm("full_address", e.target.value)} /></div>

            <div><label className="help-label">أرقام الهاتف (مفصولة بفاصلة)</label><input className="input-fields" value={formData.phones} onChange={e => updateForm("phones", e.target.value)} placeholder="012.., 010.." style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div>
              <label className="help-label">رابط خرائط جوجل (سيتم استخراج الإحداثيات تلقائياً)</label>
              <input
                className="input-fields"
                value={formData.google_maps_url}
                onChange={e => updateForm("google_maps_url", e.target.value)}
                onBlur={e => extractCoordinates(e.target.value)}
                style={{ direction: "ltr", textAlign: "right" }}
              />
            </div>

            <div>
              <label className="help-label">رابط موقع المكان الإلكتروني (إن وجد)</label>
              <input
                className="input-fields"
                type="url"
                value={formData.website_url || ""}
                onChange={e => updateForm("website_url", e.target.value)}
                placeholder="https://example.com"
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </div>

            {/* Image URLs */}
            <div><label className="help-label">رابط الصورة الرئيسية (URL)</label><input className="input-fields" type="url" value={formData.image_url} onChange={e => updateForm("image_url", e.target.value)} placeholder="https://..." style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label className="help-label">روابط الميديا (صور، قائمة طعام) - مفصولة بفاصلة</label><textarea className="input-fields" rows={2} value={formData.menu_images} onChange={e => updateForm("menu_images", e.target.value)} placeholder="https://..., https://..." style={{ direction: "ltr", textAlign: "left" }}></textarea></div>

            {/* Working Hours UI */}
            <div style={{ gridColumn: "1 / -1", background: "rgba(120, 120, 120, 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
              <label className="help-label" style={{ fontSize: "1.1rem", marginBottom: "12px", color: "var(--textPrimary)" }}>ساعات العمل</label>

              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button type="button" onClick={() => setScheduleType("24/7")} className={`btn ${scheduleType === "24/7" ? "btn-primary" : "var(--cancelBtn)"}`} style={{ flex: 1, background: scheduleType === "24/7" ? "var(--colorSecondary)" : "var(--cancelBtn)" }}>مفتوح 24 ساعة</button>
                <button type="button" onClick={() => setScheduleType("custom")} className={`btn ${scheduleType === "custom" ? "btn-primary" : "var(--cancelBtn)"}`} style={{ flex: 1, background: scheduleType === "custom" ? "var(--colorSecondary)" : "var(--cancelBtn)" }}>مواعيد متغيرة</button>
              </div>

              {scheduleType === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {scheduleData.map((dayData, index) => (
                    <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--borderGlass)" }}>
                      <div style={{ width: "80px", fontWeight: "bold" }}>{dayData.day}</div>

                      <select
                        className="input-fields help-select"
                        style={{ width: "100px", padding: "6px" }}
                        value={dayData.isWorking ? "working" : "off"}
                        onChange={e => {
                          const newData = [...scheduleData];
                          newData[index].isWorking = e.target.value === "working";
                          setScheduleData(newData);
                        }}
                      >
                        <option value="working">شغل</option>
                        <option value="off">إجازة</option>
                      </select>

                      {dayData.isWorking && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                          <span style={{ color: "var(--textSecondary)", fontSize: "0.9rem" }}>من</span>
                          <select className="input-fields help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...scheduleData]; newData[index].openTime = e.target.value; setScheduleData(newData); }}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="input-fields help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...scheduleData]; newData[index].openPeriod = e.target.value as "ص" | "م"; setScheduleData(newData); }}>
                            <option value="ص">ص</option><option value="م">م</option>
                          </select>

                          <span style={{ color: "var(--textSecondary)", fontSize: "0.9rem", margin: "0 5px" }}>حتي</span>
                          <select className="input-fields help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...scheduleData]; newData[index].closeTime = e.target.value; setScheduleData(newData); }}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="input-fields help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...scheduleData]; newData[index].closePeriod = e.target.value as "ص" | "م"; setScheduleData(newData); }}>
                            <option value="ص">ص</option><option value="م">م</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div><label className="help-label">خط العرض (Latitude)</label><input className="input-fields" type="number" step="any" value={formData.latitude} onChange={e => updateForm("latitude", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div><label className="help-label">خط الطول (Longitude)</label><input className="input-fields" type="number" step="any" value={formData.longitude} onChange={e => updateForm("longitude", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="help-label">وصف قصير (يظهر تحت اسم المكان)</label>
              <input required className="input-fields" value={formData.short_description} onChange={e => updateForm("short_description", e.target.value)} placeholder="وصف جذاب من سطر واحد..." />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="help-label">وصف المكان التفصيلي</label>
              <textarea className="input-fields" rows={3} value={formData.description} onChange={e => updateForm("description", e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" className="btn btn-cancel" onClick={() => setShowAddForm(false)}> إلغاء</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإضافة..." : "حفظ المكان"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Search Box and Stats */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "16px"
      }} >

        {/* Search Box */}
        <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
          <input
            type="text"
            placeholder="البحث بكود المكان (ID) أو الاسم..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "44px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textSecondary)"
            }}
          />
          <i className="bx bx-search" style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted, #94a3b8)",
            fontSize: "1.2rem"
          }} />
        </div>

        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          إجمالي الأماكن: ({searchQuery.trim() ? `${filteredPlaces.length} من ${places.length}` : places.length})
        </div>
      </div>
      {/* Places List */}
      <div className={styles.tableCard}>

        {dbDuplicatesList.length > 0 && (
          <div style={{ background: "rgba(255, 149, 0, 0.12)", borderBottom: "1px solid rgba(255, 149, 0, 0.25)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff9500", fontSize: "0.88rem" }}>
              <i className="bx bx-error" style={{ fontSize: "1.2rem" }}></i>
              <span>تنبيه: تم اكتشاف <strong>{dbDuplicatesList.length}</strong> مكان مكرر مسجل في قاعدة البيانات!</span>
            </div>
            <button
              type="button"
              className="btn"
              disabled={isDeletingDuplicates}
              onClick={handleCleanDbDuplicates}
              style={{ background: "#ff9500", color: "#fff", border: "none", fontSize: "0.8rem", padding: "6px 14px", fontWeight: "bold" }}
            >
              {isDeletingDuplicates ? "🔄 جاري تنظيف المتكرر..." : "🧹 حذف الأماكن المكررة"}
            </button>
          </div>
        )}

        {/* Bulk Selection Actions Bar */}
        {selectedPlaceIds.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(108, 99, 255, 0.12))",
            borderBottom: "1px solid rgba(255, 59, 48, 0.25)",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            animation: "fadeIn 0.2s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--textPrimary)", fontSize: "0.92rem", fontWeight: "600" }}>
              <i className="bx bx-check-square" style={{ fontSize: "1.3rem", color: "var(--colorPrimary)" }} />
              <span>تم تحديد <strong>{selectedPlaceIds.length}</strong> {selectedPlaceIds.length === 1 ? "مكان" : "أماكن"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", minWidth: 0 }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowBulkDeleteModal(true)}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                <i className="bx bx-trash" style={{ fontSize: "1.1rem" }} />
                حذف المحدد ({selectedPlaceIds.length})
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setSelectedPlaceIds([])}
                style={{
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}

        {places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 40px", color: "#94a3b8" }}>
            <i className="bx bx-map-alt" style={{ fontSize: "3rem", marginBottom: "12px", display: "block", color: "#475569" }} />
            لا يوجد أماكن حالياً. قم بإضافة بيانات تجريبية أو أضف مكاناً جديداً.
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 40px", color: "#94a3b8" }}>
            <i className="bx bx-search" style={{ fontSize: "3rem", marginBottom: "12px", display: "block", color: "#475569" }} />
            لا توجد نتائج تطابق بحثك. جرب البحث بكلمة أخرى أو كود مكان آخر.
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead className={styles.adminThead}>
                <tr>
                  <th className={styles.adminTh} style={{ width: "45px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                        accentColor: "var(--colorPrimary, #6c63ff)"
                      }}
                      title={isAllSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                    />
                  </th>
                  <th className={styles.adminTh}>الصورة</th>
                  <th className={styles.adminTh}>الاسم</th>
                  <th className={styles.adminTh}>التصنيف</th>
                  <th className={styles.adminTh}>المنطقة</th>
                  <th className={styles.adminTh}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlaces.map(place => {
                  const isDbDuplicate = dbDuplicatesList.some(d => d.duplicateId === place.id);
                  const isSelected = selectedPlaceIds.includes(place.id);
                  return (
                    <tr
                      key={place.id}
                      className={styles.adminTr}
                      style={{
                        background: isSelected
                          ? "rgba(108, 99, 255, 0.12)"
                          : isDbDuplicate
                            ? "rgba(255, 149, 0, 0.04)"
                            : undefined
                      }}
                    >
                      <td className={styles.adminTd} style={{ width: "45px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectPlace(place.id)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: "var(--colorPrimary, #6c63ff)"
                          }}
                          title="تحديد المكان"
                        />
                      </td>
                      <td className={styles.adminTd}>
                        {place.images && place.images.length > 0 ? (
                          <img src={place.images[0]} alt={place.name} loading="lazy" decoding="async" style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🖼️</div>
                        )}
                      </td>
                      <td className={styles.adminTd} style={{ fontWeight: "700", color: "var(--textPrimary)" }}>
                        <div style={{ fontSize: "0.95rem" }}>{place.name}</div>
                        {place.name_en && (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px", direction: "ltr", textAlign: "right" }}>
                            {place.name_en}
                          </div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "normal", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ color: "#64748b" }}>الكود (ID):</span>
                          <span style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: "4px", userSelect: "all", fontSize: "0.7rem" }}>
                            {place.id}
                          </span>
                        </div>
                        {isDbDuplicate && (
                          <span style={{ fontSize: "0.72rem", color: "#ff9500", marginRight: "8px", background: "rgba(255, 149, 0, 0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-block", fontWeight: "bold" }}>
                            ⚠️ مكرر
                          </span>
                        )}
                      </td>
                      <td className={styles.adminTd}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className={styles.badge} style={{ color: "var(--colorSecondary)", fontWeight: "900" }}>
                            {place.category_label || CATEGORY_MAP[place.category] || place.category}
                          </span>
                          {place.sub_categories && place.sub_categories.length > 0 && (
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {place.sub_categories.map(sc => (
                                <span key={sc} className={`${styles.badge} ${styles.badgeNeutral}`} style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                                  {CATEGORY_MAP[sc] || sc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.adminTd}>
                        <div style={{ color: "var(--textPrimary)", fontSize: "0.88rem" }}>{place.city} / {place.governorate}</div>
                        <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginTop: "4px", fontSize: "0.72rem" }}>
                          <i className="bx bx-buildings" /> {place.branches ? place.branches.length : 1} فروع
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ paddingRight: "0" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
                          <button
                            onClick={() => handleStartEditPlace(place)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            title="تعديل المكان"
                            style={{
                              padding: "5px 5px",
                              borderRadius: "50%",
                              background: "var(--bgSecondary)",
                            }}
                          >
                            <i className="bx bx-edit-alt" />
                          </button>
                          <button
                            onClick={() => setSelectedPlaceForBranch(place)}
                            className={`${styles.actionBtn} ${styles.actionBtnBranch}`}
                            title="إدارة الفروع"
                            style={{
                              padding: "5px 5px",
                              borderRadius: "50%",
                              background: "var(--bgSecondary)",
                            }}
                          >
                            <i className="bx bx-buildings" />
                          </button>
                          <button
                            onClick={() => handleDeletePlace(place.id)}
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            title="حذف المكان"
                            style={{
                              padding: "5px 5px",
                              borderRadius: "50%",
                              background: "#ff000025",
                              color: "#ff0000f5",
                              border: "#ff000025",
                            }}
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Full Comprehensive Edit Place Modal */}
      {editingPlace && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", animation: "fade-in 0.2s ease" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "940px", maxHeight: "90vh", overflowY: "auto", padding: "30px", background: "var(--bgGlass)", border: "1px solid var(--borderGlass)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "14px" }}>
              <div>
                <h5 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--textPrimary)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <RiEditFill />
                  تعديل بيانات : {editingPlace.name}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlace(null)}
                title="إغلاق"
                aria-label="إغلاق النافذة"
                className="closeBtn"
              >
                <IoMdClose />
              </button>
            </div>

            <form onSubmit={handleUpdatePlace} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>اسم المكان (بالعربية)</label>
                <input required className="input-fields" value={editPlaceFormData.name} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, name: e.target.value })} />
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>اسم المكان (بالإنجليزية - للبحث)</label>
                <input className="input-fields" value={editPlaceFormData.name_en} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, name_en: e.target.value })} placeholder="مثال: Costa Coffee" style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>وصف قصير (يظهر تحت اسم المكان مباشرة)</label>
                <input className="input-fields" value={editPlaceFormData.short_description} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, short_description: e.target.value })} placeholder="مثال: أشهى المأكولات الإيطالية والبيتزا..." />
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>التصنيف الرئيسي (الأساسي)</label>
                <select required className="input-fields help-select" value={editPlaceFormData.category} onChange={e => {
                  const val = e.target.value;
                  const subs = CATEGORIES_STRUCTURE.find(m => m.name === val)?.subCategories || [];
                  const newSubCats = subs.length > 0 ? [subs[0].name] : [];
                  setEditPlaceFormData({
                    ...editPlaceFormData,
                    category: val,
                    category_label: CATEGORY_MAP[val] || val,
                    sub_categories: newSubCats,
                    place_type: "",
                    place_type_icon: ""
                  });
                }}>
                  {CATEGORIES_STRUCTURE.map(main => (
                    <option key={main.name} value={main.name}>{main.emoji} {main.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
                <label className="help-label" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", color: "var(--textSecondary)", display: "block" }}>
                  التصنيفات الفرعية التابعة للقسم الرئيسي (تحدد نوع ومكان ظهور المحتوى بالتفصيل)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(CATEGORIES_STRUCTURE.find(m => m.name === editPlaceFormData.category)?.subCategories || []).map(cat => {
                    const isSelected = editPlaceFormData.sub_categories?.includes(cat.name);
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          const current = editPlaceFormData.sub_categories || [];
                          const next = isSelected ? current.filter(s => s !== cat.name) : [...current, cat.name];
                          const shouldResetType = current[0] !== next[0];
                          setEditPlaceFormData({
                            ...editPlaceFormData,
                            sub_categories: next,
                            ...(shouldResetType ? { place_type: "", place_type_icon: "" } : {})
                          });
                        }}
                        style={{
                          background: isSelected ? "var(--colorPrimary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                          color: isSelected ? "#fff" : "var(--textPrimary)",
                          border: isSelected ? "none" : "1px solid var(--borderGlass)",
                          padding: "6px 14px",
                          borderRadius: "10px",
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.85rem",
                          fontWeight: isSelected ? "700" : "500",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                      >
                        <i className={`bx ${cat.icon}`}></i> {cat.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Place Type Section (Edit Mode) */}
              <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label" style={{ fontWeight: "700" }}>النوع الفرعي المخصص للمكان (مثال: صيني، سوري، مصري للمطاعم - عربي، فرنسي للكافيهات)</label>
                  {(() => {
                    const subCat = editPlaceFormData.sub_categories?.[0] || "";
                    const existingTypes = Array.from(new Set(
                      places
                        .filter(p => p.sub_categories?.includes(subCat) && p.place_type?.trim() && p.id !== editPlaceFormData.id)
                        .map(p => p.place_type!.trim())
                    )).filter(Boolean);

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                        {existingTypes.length > 0 && (
                          <div>
                            <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>اختر من الأنواع المضافة مسبقاً لهذا التصنيف:</label>
                            <select
                              className="input-fields help-select"
                              value={editPlaceFormData.place_type}
                              onChange={e => {
                                const val = e.target.value;
                                if (val === "__new__") {
                                  setEditPlaceFormData({ ...editPlaceFormData, place_type: "", place_type_icon: "bx bx-tag" });
                                } else {
                                  const found = places.find(p => p.place_type === val);
                                  setEditPlaceFormData({ ...editPlaceFormData, place_type: val, place_type_icon: found?.place_type_icon || "bx bx-tag" });
                                }
                              }}
                            >
                              <option value="">لا يوجد (بدون تحديد نوع مخصص)</option>
                              {existingTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                              <option value="__new__">+ إضافة نوع جديد للنشاط...</option>
                            </select>
                          </div>
                        )}

                        {/* If no existing types or admin chose to write a new one */}
                        {(existingTypes.length === 0 || !existingTypes.includes(editPlaceFormData.place_type)) && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                              <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>اسم النوع الجديد:</label>
                              <input
                                className="input-fields"
                                placeholder="مثال: سوري، صيني، إيطالي..."
                                value={editPlaceFormData.place_type}
                                onChange={e => setEditPlaceFormData({ ...editPlaceFormData, place_type: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>أيقونة Boxicon مناسبة:</label>
                              <input
                                className="input-fields"
                                placeholder="مثال: bx bx-dish أو bx bx-coffee"
                                value={editPlaceFormData.place_type_icon}
                                onChange={e => setEditPlaceFormData({ ...editPlaceFormData, place_type_icon: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", background: "rgba(46, 204, 113, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
                <label className="help-label" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", color: "var(--textSecondary)", display: "block" }}>
                  معلومات مفيدة (المميزات والخدمات المتاحة بالمكان)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {FEATURES_LIST.map(feat => {
                    const isSelected = editPlaceFormData.features?.includes(feat.key);
                    return (
                      <button
                        key={feat.key}
                        type="button"
                        onClick={() => {
                          const current = editPlaceFormData.features || [];
                          const next = isSelected ? current.filter(f => f !== feat.key) : [...current, feat.key];
                          setEditPlaceFormData({ ...editPlaceFormData, features: next });
                        }}
                        style={{
                          background: isSelected ? "#2ecc71" : "rgba(255, 255, 255, 0.06)",
                          color: isSelected ? "#fff" : "var(--textPrimary)",
                          border: isSelected ? "none" : "1px solid var(--borderGlass)",
                          padding: "6px 14px",
                          borderRadius: "10px",
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.85rem",
                          fontWeight: isSelected ? "700" : "500",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>{feat.icon}</span> {feat.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Services Selection */}
              <div style={{ gridColumn: "1 / -1", background: "rgba(46, 204, 113, 0.03)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)", marginTop: "10px" }}>
                <MultiSelectSearch
                  label="الخدمات المتاحة بالمكان"
                  options={SERVICES_LIST}
                  selected={editPlaceFormData.services || []}
                  onChange={(selected) => setEditPlaceFormData({ ...editPlaceFormData, services: selected })}
                  placeholder="اختر الخدمات مثل: قاعة أفراح، شركة شحن، كهربائي سيارات..."
                />
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>المحافظة</label>
                <select className="input-fields help-select" value={editPlaceFormData.governorate} onChange={e => {
                  const gov = e.target.value;
                  const firstCity = egyptLocations[gov]?.[0] || "";
                  setEditPlaceFormData({ ...editPlaceFormData, governorate: gov, city: firstCity });
                }}>
                  {governoratesList.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>المدينة / المنطقة</label>
                <select className="input-fields help-select" value={editPlaceFormData.city} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, city: e.target.value })}>
                  {(egyptLocations[editPlaceFormData.governorate] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="help-label" style={{ fontWeight: "700" }}>العنوان بالتفصيل</label>
                <input required className="input-fields" value={editPlaceFormData.full_address} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, full_address: e.target.value })} />
              </div>

              <div>
                <label className="help-label">أرقام الهاتف (مفصولة بفاصلة)</label>
                <input className="input-fields" value={editPlaceFormData.phones} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, phones: e.target.value })} placeholder="012.., 010.." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label">رابط خريطة جوجل</label>
                <input className="input-fields" type="url" value={editPlaceFormData.google_maps_url} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, google_maps_url: e.target.value })} placeholder="https://maps.app.goo.gl/..." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label">رابط موقع المكان الإلكتروني (إن وجد)</label>
                <input className="input-fields" type="url" value={editPlaceFormData.website_url || ""} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, website_url: e.target.value })} placeholder="https://example.com" style={{ direction: "ltr", textAlign: "left" }} />
              </div>

              <div>
                <label className="help-label">رابط الصورة الرئيسية (URL)</label>
                <input className="input-fields" type="url" value={editPlaceFormData.image_url} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, image_url: e.target.value })} placeholder="https://..." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label">صور المنيو (روابط مفصولة بفاصلة)</label>
                <input className="input-fields" value={editPlaceFormData.menu_images} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, menu_images: e.target.value })} placeholder="https://img1..., https://img2..." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.06)", padding: "20px", borderRadius: "18px", border: "1px solid var(--borderGlass)" }}>
                <label className="help-label" style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "12px", color: "var(--textPrimary)", display: "block" }}>⏰ مواعيد العمل</label>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button type="button" onClick={() => setEditScheduleType("24/7")} className={`btn ${editScheduleType === "24/7" ? "btn-primary" : ""}`} style={{ flex: 1, padding: "10px" }}>مفتوح 24 ساعة</button>
                  <button type="button" onClick={() => setEditScheduleType("custom")} className={`btn ${editScheduleType === "custom" ? "btn-primary" : ""}`} style={{ flex: 1, padding: "10px", background: editScheduleType === "custom" ? "#ff9f0a" : undefined }}>مواعيد متغيرة </button>
                </div>

                {editScheduleType === "custom" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {editScheduleData.map((dayData, index) => (
                      <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
                        <div style={{ width: "80px", fontWeight: "bold", color: "var(--textPrimary)" }}>{dayData.day}</div>
                        <select
                          className="input-fields help-select"
                          style={{ width: "100px", padding: "6px 10px" }}
                          value={dayData.isWorking ? "working" : "off"}
                          onChange={e => {
                            const newData = [...editScheduleData];
                            newData[index].isWorking = e.target.value === "working";
                            setEditScheduleData(newData);
                          }}
                        >
                          <option value="working">عمل</option>
                          <option value="off">إجازة</option>
                        </select>
                        {dayData.isWorking && (
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                            <span style={{ color: "var(--textSecondary)", fontSize: "0.85rem" }}>من</span>
                            <select className="input-fields help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...editScheduleData]; newData[index].openTime = e.target.value; setEditScheduleData(newData); }}>
                              {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="input-fields help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...editScheduleData]; newData[index].openPeriod = e.target.value as "ص" | "م"; setEditScheduleData(newData); }}>
                              <option value="ص">ص</option><option value="م">م</option>
                            </select>

                            <span style={{ color: "var(--textSecondary)", fontSize: "0.85rem", margin: "0 4px" }}>حتي</span>
                            <select className="input-fields help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...editScheduleData]; newData[index].closeTime = e.target.value; setEditScheduleData(newData); }}>
                              {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="input-fields help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...editScheduleData]; newData[index].closePeriod = e.target.value as "ص" | "م"; setEditScheduleData(newData); }}>
                              <option value="ص">ص</option><option value="م">م</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="help-label">الوصف والشرح المفصل للمكان</label>
                <textarea rows={3} className="input-fields" value={editPlaceFormData.description} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, description: e.target.value })} placeholder="اكتب وصفاً جذاباً ومفصلاً للخدمات والأجواء..." />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "14px", marginTop: "10px" }}>
                <button type="submit" disabled={isUpdatingPlace || !editPlaceFormData.name.trim()} className="btn btn-primary" style={{ flex: 2, fontSize: "1rem", fontWeight: "700" }}>
                  {isUpdatingPlace ? "جاري التحديث..." : " حفظ التعديلات "}
                </button>
                <button type="button" onClick={() => setEditingPlace(null)} className="btn btn-cancel" style={{ flex: 1 }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branches Modal */}
      {selectedPlaceForBranch && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "var(--bgGlass-card, #000000ff)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", position: "relative", padding: "20px" }}>
            <button
              onClick={() => setSelectedPlaceForBranch(null)}
              style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(120,120,120,0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", color: "var(--textPrimary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "1.2rem", marginBottom: "10px" }}>إدارة فروع: {selectedPlaceForBranch.name}</h2>

            {/* Existing Branches List */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "1rem", marginBottom: "14px", color: "var(--textSecondary)" }}>الفروع الحالية ({selectedPlaceForBranch.branches?.length || 0})</h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {(selectedPlaceForBranch.branches || []).map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(120,120,120,0.05)", borderRadius: "8px", border: "1px solid var(--borderGlass)" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{b.name} {b.is_main ? <span style={{ color: "var(--colorSuccess)", fontSize: "0.8rem", marginLeft: "8px" }}>(فرع رئيسي)</span> : ""}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>{b.city} / {b.governorate}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditBranch(b)}
                        style={{ fontFamily: "var(--font-heading)", fontWeight: "600", background: "none", border: "none", color: "var(--colorSecondary)", cursor: "pointer", fontSize: "0.85rem" }}>  <TbCashEdit size={23} /></button>
                      {!b.is_main && (
                        <button onClick={() => handleDeleteBranch(b.id, selectedPlaceForBranch.id, b.is_main)} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}><MdFolderDelete size={24} /> </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Branch Form */}
            <div style={{ borderTop: "1px solid var(--borderGlass)", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--textPrimary)" }}>{editingBranchId ? "تعديل الفرع" : "إضافة فرع جديد"}</h3>
                {editingBranchId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBranchId(null);
                      setBranchFormData({
                        name: "", governorate: selectedPlaceForBranch.governorate || "القاهرة", city: "",
                        full_address: "", phones: "", google_maps_url: "", latitude: "", longitude: "", media: ""
                      });
                      setBranchScheduleType("24/7");
                    }}
                    style={{ fontFamily: "var(--font-heading)", fontWeight: "600", background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "0.9rem" }}>
                    إلغاء التعديل
                  </button>
                )}
              </div>
              <form onSubmit={handleAddBranch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div><label className="help-label">اسم الفرع</label><input required className="input-fields" value={branchFormData.name} onChange={e => setBranchFormData(p => ({ ...p, name: e.target.value }))} placeholder="مثال: فرع مدينة نصر" /></div>
                <div><label className="help-label">المحافظة</label>
                  <select
                    required className="input-fields" value={branchFormData.governorate} onChange={e => setBranchFormData(p => ({ ...p, governorate: e.target.value, city: "" }))}>
                    {governoratesList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="help-label">المدينة / المنطقة</label>
                  <select required className="input-fields" value={branchFormData.city} onChange={e => setBranchFormData(p => ({ ...p, city: e.target.value }))}>
                    <option value="">اختر المدينة</option>
                    {(egyptLocations[branchFormData.governorate as keyof typeof egyptLocations] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="help-label">العنوان التفصيلي</label><input required className="input-fields" value={branchFormData.full_address} onChange={e => setBranchFormData(p => ({ ...p, full_address: e.target.value }))} /></div>
                <div><label className="help-label">أرقام هاتف ( بفاصلة)</label><input className="input-fields" value={branchFormData.phones} onChange={e => setBranchFormData(p => ({ ...p, phones: e.target.value }))} style={{ direction: "ltr", textAlign: "right" }} /></div>
                <div>
                  <label className="help-label">رابط خرائط جوجل</label>
                  <input className="input-fields" value={branchFormData.google_maps_url}
                    onChange={e => setBranchFormData(p => ({ ...p, google_maps_url: e.target.value }))}
                    onBlur={e => extractBranchCoordinates(e.target.value)}
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                </div>
                <div><label className="help-label">خط العرض</label><input className="input-fields" type="number" step="any" value={branchFormData.latitude} onChange={e => setBranchFormData(p => ({ ...p, latitude: e.target.value }))} /></div>
                <div><label className="help-label">خط الطول</label><input className="input-fields" type="number" step="any" value={branchFormData.longitude} onChange={e => setBranchFormData(p => ({ ...p, longitude: e.target.value }))} /></div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">الميديا الخاصة بالفرع (روابط مفصولة بفاصلة)</label>
                  <input className="input-fields" value={branchFormData.media} onChange={e => setBranchFormData(p => ({ ...p, media: e.target.value }))} placeholder="https://..., https://..." style={{ direction: "ltr", textAlign: "left" }} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">ساعات العمل</label>
                  <select className="input-fields" value={branchScheduleType} onChange={e => setBranchScheduleType(e.target.value as any)} style={{ marginBottom: "10px" }}>
                    <option value="24/7">مفتوح طول أيام الأسبوع 24 ساعة</option>
                    <option value="custom">مواعيد مخصصة</option>
                  </select>
                  {branchScheduleType === "custom" && (
                    <div style={{ background: "rgba(120,120,120,0.05)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--borderGlass)" }}>
                      {branchScheduleData.map((dayData, index) => (
                        <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: index < branchScheduleData.length - 1 ? "1px solid rgba(120,120,120,0.1)" : "none", flexWrap: "wrap" }}>
                          <div style={{ width: "80px", fontWeight: "bold" }}>{dayData.day}</div>

                          <select
                            className="input-fields help-select"
                            style={{ width: "100px", padding: "6px" }}
                            value={dayData.isWorking ? "working" : "off"}
                            onChange={e => {
                              const newData = [...branchScheduleData];
                              newData[index].isWorking = e.target.value === "working";
                              setBranchScheduleData(newData);
                            }}
                          >
                            <option value="working">شغل</option>
                            <option value="off">إجازة</option>
                          </select>

                          {dayData.isWorking && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                              <span style={{ color: "var(--textSecondary)", fontSize: "0.9rem" }}>من</span>
                              <select className="input-fields help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...branchScheduleData]; newData[index].openTime = e.target.value; setBranchScheduleData(newData); }}>
                                {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <select className="input-fields help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...branchScheduleData]; newData[index].openPeriod = e.target.value as "ص" | "م"; setBranchScheduleData(newData); }}>
                                <option value="ص">ص</option><option value="م">م</option>
                              </select>

                              <span style={{ color: "var(--textSecondary)", fontSize: "0.9rem", margin: "0 5px" }}>حتي</span>
                              <select className="input-fields help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...branchScheduleData]; newData[index].closeTime = e.target.value; setBranchScheduleData(newData); }}>
                                {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <select className="input-fields help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...branchScheduleData]; newData[index].closePeriod = e.target.value as "ص" | "م"; setBranchScheduleData(newData); }}>
                                <option value="ص">ص</option><option value="م">م</option>
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmittingBranch} className="btn btn-primary" style={{ marginTop: "10px" }}>
                    {isSubmittingBranch ? "جاري الحفظ..." : (editingBranchId ? "حفظ التعديلات" : "إضافة الفرع")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(placeToDeleteId)}
        onClose={() => !isDeletingPlace && setPlaceToDeleteId(null)}
        title="تأكيد الحذف"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message="هل أنت متأكد من حذف هذا المكان؟"
        primaryButton={{
          label: isDeletingPlace ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDeletePlace,
          bgColor: "#ff3b30",
          disabled: isDeletingPlace,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setPlaceToDeleteId(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeletingPlace,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        {places.find(p => p.id === placeToDeleteId) && (
          <p style={{ margin: "0", color: "#ff4d4d", fontSize: "1.05rem", fontWeight: "bold", textAlign: "center" }}>
            « {places.find(p => p.id === placeToDeleteId)?.name} »
          </p>
        )}
      </CustomModal>

      {/* Bulk Delete Confirmation Modal */}
      <CustomModal
        isOpen={showBulkDeleteModal}
        onClose={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
        title="تأكيد حذف الأماكن المحددة"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message={`هل أنت متأكد من رغبتك في حذف (${selectedPlaceIds.length}) مكان محدد نهائياً من قاعدة البيانات مع كافة فروعها وبياناتها؟ لا يمكن التراجع عن هذا الإجراء.`}
        primaryButton={{
          label: isBulkDeleting ? "جاري الحذف..." : `نعم، احذف (${selectedPlaceIds.length})`,
          onClick: handleConfirmBulkDelete,
          bgColor: "#ff3b30",
          disabled: isBulkDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setShowBulkDeleteModal(false),
          bgColor: "var(--cancelBtn)",
          disabled: isBulkDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      />

      {/* Center Delete Success / Feedback Modal */}
      {deleteAlertModal && (
        <CustomModal
          isOpen={deleteAlertModal.isOpen}
          onClose={() => setDeleteAlertModal(null)}
          title={deleteAlertModal.title}
          titleColor={deleteAlertModal.type === "success" ? "var(--colorPrimary)" : "var(--colorDanger)"}
          borderColor={deleteAlertModal.type === "success" ? "var(--colorPrimary)" : "var(--colorDanger)"}
          iconNode={
            deleteAlertModal.type === "success" ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.4rem",
                }}
              >
                <img src="/images/icons3d/trash.png" alt="check-double" style={{ width: "100%", height: "100%" }} />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255, 59, 48, 0.25) 0%, rgba(220, 38, 38, 0.1) 100%)",
                  border: "2px solid rgba(255, 59, 48, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff3b30",
                  fontSize: "2.4rem",
                  boxShadow: "0 0 25px rgba(255, 59, 48, 0.35)",
                }}
              >
                <i className="bx bx-error-circle" />
              </div>
            )
          }
          message={deleteAlertModal.message}
          primaryButton={{
            label: "حسناً",
            onClick: () => setDeleteAlertModal(null),
            bgColor: deleteAlertModal.type === "success" ? "var(--colorPrimary)" : "var(--colorDanger)",
            icon: <i className={deleteAlertModal.type === "success" ? "bx bx-check" : "bx bx-x"} style={{ fontSize: "1.2rem" }} />,
          }}
        >
          {deleteAlertModal.placeName && (
            <p style={{ margin: "-8px 0 16px 0", color: "var(--colorPrimary)", fontSize: "1.05rem", fontWeight: "bold", textAlign: "center" }}>
              « {deleteAlertModal.placeName} »
            </p>
          )}
        </CustomModal>
      )}
    </div>
  );
}


