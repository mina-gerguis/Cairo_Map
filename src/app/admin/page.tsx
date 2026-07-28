"use client";
import { LuReplaceAll } from "react-icons/lu";
import { RiEditFill } from "react-icons/ri";


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
import styles from "./admin.module.css";
import { useAuth } from "@/context/AuthContext";
import { PlaceCategory, initialPlaces, CategoryItem, DEFAULT_CATEGORIES } from "@/data/places";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { ScheduleDay, WorkingHoursData, DAYS_OF_WEEK, generateTimeOptions } from "@/lib/workingHours";

interface AdminProfile {
  is_admin: boolean;
}

interface DBPlace {
  id: string;
  name: string;
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
}

const CATEGORY_MAP: Record<string, string> = {
  restaurant: "مطاعم",
  cafe: "كافيهات",
  garden: "حدائق",
  medicalCenter: "مراكز طبية",
  health_beauty: "الصحة والجمال",
  family: "اماكن عائلية",
  quiet_places: "اماكن هادئه",
  kids: "اماكن للاطفال",
  amusement_aqua: "ملاهي وأكوابارك",
  work: "مكاتب عمل",
  courses_study: "كورسات ودراسة",
  hotel: "فنادق",
  cinema: "سينما",
  mall: "مولات",
  outings: "أماكن للخروجات"
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<DBPlace[]>([]);
  const [error, setError] = useState("");

  // Add Place Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", category: "restaurant", category_label: "مطاعم",
    sub_categories: [] as string[],
    governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
    full_address: "", phones: "", google_maps_url: "", image_url: "",
    menu_images: "", description: "",
    latitude: "", longitude: ""
  });

  const [scheduleType, setScheduleType] = useState<"24/7" | "custom">("24/7");
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      isWorking: true,
      openTime: "09:00",
      openPeriod: "ص",
      closeTime: "11:00",
      closePeriod: "م"
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      day, isWorking: true, openTime: "09:00", openPeriod: "ص", closeTime: "11:00", closePeriod: "م"
    }))
  );
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

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
      openPeriod: "ص",
      closeTime: "11:00",
      closePeriod: "م"
    }))
  );
  const [editPlaceFormData, setEditPlaceFormData] = useState({
    id: "",
    name: "",
    category: "restaurant",
    category_label: "مطاعم",
    sub_categories: [] as string[],
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
      category: place.category || "restaurant",
      category_label: place.category_label || CATEGORY_MAP[place.category] || "مطاعم",
      sub_categories: Array.isArray(place.sub_categories) ? place.sub_categories : [],
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
    });
  };

  // Proposals Moderation State
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsFilter, setProposalsFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejectingProposal, setRejectingProposal] = useState<any | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [isProcessingProposal, setIsProcessingProposal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
  const [proposalsError, setProposalsError] = useState<string | null>(null);

  const [showProposalsSection, setShowProposalsSection] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const fetchProposals = async () => {
    if (!supabase) return;
    setProposalsError(null);
    try {
      const { data, error } = await supabase
        .from("place_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Proposals fetch error:", error);
        setProposalsError("خطأ من Supabase: " + error.message);
      } else if (data) {
        const userIds = Array.from(new Set(data.map(p => p.user_id).filter(Boolean)));
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          const profilesMap = new Map((profilesData || []).map(pr => [pr.id, pr]));
          const proposalsWithProfiles = data.map(p => ({
            ...p,
            user_profile: profilesMap.get(p.user_id) || null
          }));
          setProposals(proposalsWithProfiles);
        } else {
          setProposals(data);
        }
      }
    } catch (err: any) {
      console.error("Proposals fetch exception:", err);
      setProposalsError("خطأ في الاتصال: " + (err.message || "حدث خطأ غير معروف"));
    }
  };


  // Close dropdown menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

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
      const phonesArray = formData.phones.split(",").map(p => p.trim()).filter(Boolean);
      const imagesArray = formData.image_url ? [formData.image_url.trim()] : [];
      const menuImagesArray = formData.menu_images.split(",").map(m => m.trim()).filter(Boolean);

      const newPlace = {
        name: formData.name,
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
      };

      let { data, error: insertError } = await supabase
        .from("places")
        .insert([newPlace])
        .select()
        .single();

      if (insertError && (insertError.message?.includes("sub_categories") || insertError.message?.includes("schema cache") || (insertError as any).code === "PGRST204")) {
        console.warn("sub_categories column missing on Supabase places table, retrying without sub_categories...");
        const { sub_categories, ...placeWithoutSubCats } = newPlace;
        const retryResult = await supabase
          .from("places")
          .insert([placeWithoutSubCats])
          .select()
          .single();
        data = retryResult.data;
        insertError = retryResult.error;
      }

      if (insertError) throw insertError;

      if (data) {
        // Create initial main branch
        const { error: branchError } = await supabase
          .from("branches")
          .insert([{
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
            is_main: true
          }]);

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
          is_main: true
        };

        const placeWithBranch = { ...data, branches: [newBranch] };
        setPlaces([placeWithBranch, ...places]);
        setShowAddForm(false);
        // Reset form
        setFormData({
          name: "", category: "restaurant", category_label: "مطاعم",
          sub_categories: [],
          governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
          full_address: "", phones: "", google_maps_url: "", image_url: "",
          menu_images: "", description: "",
          latitude: "", longitude: ""
        });
      }
    } catch (err: any) {
      setError("فشل إضافة المكان: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
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


  // Proposal Handlers
  const handleApproveProposal = async (proposal: any) => {
    if (!supabase) return;
    setIsProcessingProposal(true);
    try {
      const imagesArr = (proposal.images && proposal.images.length > 0)
        ? proposal.images
        : (proposal.image_url ? [proposal.image_url] : []);

      const phonesArr = proposal.phone ? [proposal.phone] : [];

      const newPlaceObj = {
        name: proposal.name,
        category: proposal.category,
        category_label: proposal.category_label || proposal.category,
        governorate: proposal.governorate,
        city: proposal.city,
        short_description: proposal.description ? proposal.description.substring(0, 80) : "",
        full_address: proposal.address || "",
        phones: phonesArr,
        google_maps_url: proposal.location_url || "",
        images: imagesArr,
        menu_images: [],
        description: proposal.description || "",
        working_hours: JSON.stringify({ type: "24/7" })
      };

      const { data: insertedPlace, error: insertError } = await supabase
        .from("places")
        .insert([newPlaceObj])
        .select()
        .single();

      if (insertError) throw insertError;

      if (insertedPlace) {
        await supabase.from("branches").insert([{
          place_id: insertedPlace.id,
          name: "الفرع الرئيسي",
          governorate: insertedPlace.governorate,
          city: insertedPlace.city,
          full_address: insertedPlace.full_address || "",
          phones: insertedPlace.phones || [],
          google_maps_url: insertedPlace.google_maps_url || "",
          working_hours: insertedPlace.working_hours || JSON.stringify({ type: "24/7" })
        }]);
      }

      const { error: updateError } = await supabase
        .from("place_proposals")
        .update({ status: "approved", rejection_reason: null, updated_at: new Date().toISOString() })
        .eq("id", proposal.id);

      if (updateError) throw updateError;

      const newPlaceId = insertedPlace?.id || "";
      await supabase.from("notifications").insert([{
        user_id: proposal.user_id,
        title: "🎉 تهانينا! تم قبول مكانك المقترح",
        message: `تهانينا! تمت مراجعة واعتماد إدراج المكان "${proposal.name}" ونشره رسمياً على التطبيق.`,
        type: "system",
        is_read: false,
        link: newPlaceId ? `/places/${newPlaceId}` : "/profile"
      }]);

      setError(`تمت الموافقة ونشر المكان "${proposal.name}" بنجاح!`);
      if (insertedPlace) setPlaces(prev => [insertedPlace, ...prev]);
      fetchProposals();
    } catch (err: any) {
      setError("حدث خطأ أثناء اعتماد المكان: " + (err.message || ""));
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!supabase || !rejectingProposal) return;
    if (!rejectionReasonInput.trim()) {
      alert("يرجى كتابة سبب الرفض لتوضيحه للمستخدم.");
      return;
    }

    setIsProcessingProposal(true);
    try {
      const { error: updateError } = await supabase
        .from("place_proposals")
        .update({
          status: "rejected",
          rejection_reason: rejectionReasonInput.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", rejectingProposal.id);

      if (updateError) throw updateError;

      await supabase.from("notifications").insert([{
        user_id: rejectingProposal.user_id,
        title: "⚠️ تم رفض اقتراح المكان",
        message: `نأسف، لم نتمكن من إدراج المكان "${rejectingProposal.name}". السبب: ${rejectionReasonInput.trim()}. اضغط هنا للتعديل وإعادة الإرسال.`,
        type: "system",
        is_read: false,
        link: `/propose-place?edit=${rejectingProposal.id}`
      }]);

      setError(`تم رفض المقترح وإبلاغ المستخدم بطلب التعديل.`);
      setRejectingProposal(null);
      setRejectionReasonInput("");
      fetchProposals();
    } catch (err: any) {
      setError("حدث خطأ أثناء رفض الطلب: " + (err.message || ""));
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المكان؟")) return;
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase.from("places").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setPlaces(places.filter(p => p.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
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
      };

      let { data, error } = await supabase
        .from("places")
        .update(updatedFields)
        .eq("id", editingPlace.id)
        .select()
        .single();

      if (error && (error.message?.includes("sub_categories") || error.message?.includes("schema cache") || (error as any).code === "PGRST204")) {
        console.warn("sub_categories column missing on Supabase places table, retrying without sub_categories...");
        const { sub_categories, ...fieldsWithoutSubCats } = updatedFields;
        const retryResult = await supabase
          .from("places")
          .update(fieldsWithoutSubCats)
          .eq("id", editingPlace.id)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) throw error;

      // Synchronize updated phones, address & working hours with the main branch in branches table
      await supabase
        .from("branches")
        .update({
          name: editPlaceFormData.name.trim(),
          governorate: editPlaceFormData.governorate,
          city: editPlaceFormData.city,
          full_address: editPlaceFormData.full_address,
          phones: phonesArray,
          google_maps_url: editPlaceFormData.google_maps_url,
          working_hours: finalWorkingHours,
        })
        .eq("place_id", editingPlace.id)
        .eq("is_main", true);

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
          <p style={{ color: "var(--text-secondary)" }}>عذراً، هذه الصفحة مخصصة للمشرفين فقط.</p>
        </div>
        {/* ── نافذة إضافة تصنيف جديد وتحديد الأيقونة من Boxicons ── */}
        {showAddCategoryModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.3s ease" }}>
            <div style={{ background: "rgba(18, 24, 52, 0.95)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "520px", border: "1px solid rgba(108, 99, 255, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🏷️</span> إضافة تصنيف جديد
                </h3>
                <button onClick={() => setShowAddCategoryModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleAddCategorySubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="help-label" style={{ fontWeight: "700" }}>اسم التصنيف (بالعربية)</label>
                  <input
                    required
                    className="ios-input"
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
                    className="ios-input"
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
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.4rem" }}>
                      <i className={newCatIcon}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)" }}>الأيقونة المحددة:</div>
                      <code style={{ fontSize: "0.8rem", color: "var(--accent-primary)", direction: "ltr" }}>{newCatIcon}</code>
                    </div>
                  </div>

                  {/* Popular Presets Picker */}
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600" }}>أيقونات شائعة للاختيار السريع:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px", maxHeight: "180px", overflowY: "auto", padding: "6px", background: "rgba(108, 99, 255, 0.08)", borderRadius: "14px", border: "1px solid var(--border-glass)", marginBottom: "14px" }}>
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
                          border: newCatIcon === item.icon ? "2px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                          background: newCatIcon === item.icon ? "rgba(108, 99, 255, 0.2)" : "rgba(255,255,255,0.03)",
                          color: "var(--text-primary)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <i className={item.icon} style={{ fontSize: "1.1rem", color: "var(--accent-primary)" }}></i>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Boxicon Class Input */}
                  <label className="help-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>أو اكتب كلاس أي أيقونة من Boxicons مباشرة:</label>
                  <input
                    className="ios-input"
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    placeholder="bx bx-store"
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                  <button type="submit" disabled={isAddingCategory || !newCatLabel.trim()} className="ios-btn ios-btn-primary" style={{ flex: 1, padding: "14px", fontSize: "1rem" }}>
                    {isAddingCategory ? "جاري الحفظ..." : "حفظ التصنيف"}
                  </button>
                  <button type="button" onClick={() => setShowAddCategoryModal(false)} className="ios-btn" style={{ flex: 1, padding: "14px", fontSize: "1rem" }}>
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
    <div className="app-container" style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "100%", width: "100%", paddingLeft: "10px", paddingRight: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
        <div>
          <h1 className="title-ios">🛠️ Admin dashboard </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <a href="/" className="ios-btn" style={{ padding: "4px 12px", fontSize: "0.8rem", background: "rgba(52,199,89,0.1)", color: "#34c759", border: "1px solid rgba(52,199,89,0.2)" }}>
              🌍 Go to website
            </a>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {places.length === 0 && (
            <button className="ios-btn" onClick={handleSeedData} disabled={isSubmitting} style={{ background: "rgba(255, 159, 10, 0.15)", color: "#ff9f0a", border: "1px solid rgba(255, 159, 10, 0.3)" }}>
              تفعيل بيانات تجريبية
            </button>
          )}
          <button className="ios-btn ios-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "إلغاء الإضافة" : "+ إضافة مكان جديد"}
          </button>
        </div>
      </div>


      {/* ─── PROPOSALS MODERATION SECTION ─── */}
      {showProposalsSection && (
        <div className="glass-panel" style={{ padding: "28px 20px", borderRadius: "15px", marginBottom: "32px", border: "1px solid rgba(108, 99, 255, 0.3)", animation: "slide-down 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <i className="bx bx-map-pin" style={{ color: "var(--accent-primary)" }}></i> مراجعة اقتراحات الأماكن
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={fetchProposals}
                className="ios-btn"
                style={{ padding: "6px 14px", fontSize: "0.82rem", background: "rgba(108, 99, 255, 0.15)", color: "var(--accent-primary)" }}
              >
                🔄 تحديث
              </button>
              <button onClick={() => setShowProposalsSection(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
            </div>
          </div>

          {proposalsError && (
            <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "12px 16px", borderRadius: "14px", color: "#ff3b30", fontSize: "0.85rem", marginBottom: "16px" }}>
              ⚠️ {proposalsError}
            </div>
          )}

          {/* Proposal Filters */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { id: "pending", label: "المعلقة", count: proposals.filter(p => p.status === "pending").length },
              { id: "approved", label: "المقبولة", count: proposals.filter(p => p.status === "approved").length },
              { id: "rejected", label: "المرفوضة", count: proposals.filter(p => p.status === "rejected").length },
              { id: "all", label: "الكل", count: proposals.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProposalsFilter(tab.id as any)}
                className="ios-btn"
                style={{
                  padding: "7px 14px",
                  fontSize: "0.85rem",
                  background: proposalsFilter === tab.id ? "rgba(108, 99, 255, 0.25)" : "var(--bg-glass-card)",
                  color: proposalsFilter === tab.id ? "var(--accent-primary)" : "var(--text-secondary)",
                  border: proposalsFilter === tab.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-glass)"
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Proposals Grid */}
          {proposals.filter(p => proposalsFilter === "all" || p.status === proposalsFilter).length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              لا توجد اقتراحات أصلية في قسم ({proposalsFilter}) حالياً.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
              {proposals
                .filter(p => proposalsFilter === "all" || p.status === proposalsFilter)
                .map((prop) => (
                  <div key={prop.id} style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-glass)", borderRadius: "18px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "10px", background: prop.status === 'approved' ? "rgba(52, 199, 89, 0.2)" : prop.status === 'rejected' ? "rgba(255, 59, 48, 0.2)" : "rgba(255, 149, 0, 0.2)", color: prop.status === 'approved' ? "#34c759" : prop.status === 'rejected' ? "#ff3b30" : "#ff9500", fontWeight: "700" }}>
                          {prop.status === 'approved' ? "معتمد ومقبول" : prop.status === 'rejected' ? "مرفوض" : "قيد المراجعة"}
                        </span>
                        <h3 style={{ margin: "8px 0 2px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>{prop.name}</h3>

                        {/* Proposer Info Badge */}
                        <div style={{ background: "rgba(108, 99, 255, 0.08)", border: "1px solid rgba(108, 99, 255, 0.2)", borderRadius: "12px", padding: "8px 12px", margin: "8px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={prop.user_profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"}
                              alt="proposer avatar"
                              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                            />
                            <div>
                              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)" }}>
                                {prop.user_profile?.full_name || prop.user_profile?.username || "مستخدم دفتري"}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                {prop.created_at ? new Date(prop.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : ""}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedUserProfile(prop.user_profile || { id: prop.user_id })}
                            className="ios-btn"
                            style={{ padding: "4px 10px", fontSize: "0.75rem", background: "rgba(108, 99, 255, 0.2)", color: "var(--accent-primary)", border: "none", fontWeight: "700" }}
                          >
                            👤 البروفايل
                          </button>
                        </div>
                        <span style={{ fontSize: "0.82rem", color: "var(--accent-primary)" }}>{prop.category_label || prop.category} • {prop.governorate} ({prop.city})</span>
                      </div>
                    </div>

                    {prop.image_url && (
                      <div style={{ width: "100%", height: "130px", borderRadius: "12px", overflow: "hidden" }}>
                        <img src={prop.image_url} alt={prop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ fontSize: "0.83rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "5px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", padding: "10px 12px", borderRadius: "10px" }}>
                      {prop.address && <div>📍 <strong>العنوان:</strong> {prop.address}</div>}
                      {prop.phone && <div>📞 <strong>الهاتف:</strong> {prop.phone}</div>}
                      {prop.working_hours && <div>⏰ <strong>المواعيد:</strong> {prop.working_hours}</div>}
                      {prop.description && <div>📝 <strong>الوصف:</strong> {prop.description}</div>}
                      {prop.rejection_reason && <div style={{ color: "#ff3b30" }}>⚠️ <strong>سبب الرفض:</strong> {prop.rejection_reason}</div>}
                    </div>

                    {prop.status === "pending" && (
                      <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "8px" }}>
                        <button
                          onClick={() => handleApproveProposal(prop)}
                          disabled={isProcessingProposal}
                          className="ios-btn"
                          style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #34c759, #00d4aa)", color: "#fff", fontWeight: "700", border: "none" }}
                        >
                          ✓ نشر
                        </button>
                        <button
                          onClick={() => { setRejectingProposal(prop); setRejectionReasonInput(""); }}
                          disabled={isProcessingProposal}
                          className="ios-btn"
                          style={{ flex: 1, padding: "10px", background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", fontWeight: "700", border: "1px solid rgba(255, 59, 48, 0.3)" }}
                        >
                          ✕ رفض
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}


      {/* Modal for Proposer Full Profile */}
      {selectedUserProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.2s ease" }}>
          <div className="glass-panel" style={{ maxWidth: "480px", width: "100%", padding: "10px 28px", borderRadius: "24px", background: "var(--bg-glass-card, #ffffff)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", border: "1px solid var(--accent-primary)", animation: "slide-up 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            </div>

            {/* Profile Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "16px", marginBottom: "20px", border: "1px solid var(--border-glass)" }}>
              <img
                src={selectedUserProfile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                alt="Profile Avatar"
                style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-primary)" }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {selectedUserProfile.full_name || "غير محدد"}
                </h4>
                <div style={{ fontSize: "0.85rem", color: "var(--accent-primary)", direction: "ltr", textAlign: "right" }}>
                  @{selectedUserProfile.username || "بدون_اسم_مستخدم"}
                </div>
              </div>
            </div>

            {/* Profile Details List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "10px" }}>
                <span>📧 البريد الإلكتروني:</span>
                <strong style={{ color: "var(--text-primary)" }}>{selectedUserProfile.email || "غير متوفر"}</strong>
              </div>

              {selectedUserProfile.phone && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "10px" }}>
                  <span>📞 رقم الهاتف:</span>
                  <strong style={{ color: "var(--text-primary)", direction: "ltr" }}>{selectedUserProfile.phone}</strong>
                </div>
              )}

              {(selectedUserProfile.governorate || selectedUserProfile.city) && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "10px" }}>
                  <span>📍 المحافظة / المدينة:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedUserProfile.governorate || ""} {selectedUserProfile.city ? `(${selectedUserProfile.city})` : ""}</strong>
                </div>
              )}

              {selectedUserProfile.dob && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "10px" }}>
                  <span>🎂 تاريخ الميلاد:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedUserProfile.dob}</strong>
                </div>
              )}

              {selectedUserProfile.interests && selectedUserProfile.interests.length > 0 && (
                <div style={{ padding: "10px 14px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                  <div style={{ marginBottom: "8px", fontWeight: "700", color: "var(--text-primary)", fontSize: "0.88rem" }}>🎯 الاهتمامات:</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedUserProfile.interests.map((intKey: string, i: number) => {
                      const item = getInterestObj(intKey);
                      return (
                        <span
                          key={i}
                          style={{
                            fontSize: "0.82rem",
                            background: "rgba(108, 99, 255, 0.15)",
                            color: "var(--accent-primary)",
                            border: "1px solid rgba(108, 99, 255, 0.3)",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600"
                          }}
                        >
                          <i className={item.icon} style={{ fontSize: "1rem" }}></i>
                          <span>{item.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedUserProfile.bio && (
                <div style={{ padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "10px" }}>
                  <div style={{ marginBottom: "4px" }}>📝 نبذة شخصية:</div>
                  <div style={{ color: "var(--text-primary)", fontStyle: "italic" }}>"{selectedUserProfile.bio}"</div>
                </div>
              )}

              {selectedUserProfile.created_at && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--border-glass)", borderRadius: "10px" }}>
                  <span>📅 تاريخ الانضمام:</span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {new Date(selectedUserProfile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUserProfile(null)}
              className="ios-btn ios-btn-primary"
              style={{ width: "100%", padding: "12px", fontWeight: "700" }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}


      {/* Modal for Rejection Reason */}
      {rejectingProposal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade-in 0.2s ease" }}>
          <div className="glass-panel" style={{ maxWidth: "460px", width: "100%", padding: "28px", borderRadius: "24px", background: "var(--bg-glass-card, #ffffff)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", border: "1px solid rgba(255, 59, 48, 0.4)", animation: "slide-up 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ff3b30", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.6rem" }}>⚠️</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>
                سبب رفض المكان: {rejectingProposal.name}
              </h3>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.5 }}>
              يرجى توضيح سبب الرفض بالتفصيل للمستخدم. سيتم منحه إشعاراً يحتوي على هذا السبب ورابطاً يحول البيانات السابقة تلقائياً في النموذج ليتمكن من تعديل الخطأ فقط وإعادة التقديم.
            </p>

            <textarea
              rows={4}
              required
              placeholder="اكتب سبب الرفض هنا..."
              className="ios-input"
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              style={{ width: "100%", marginBottom: "20px", resize: "vertical", direction: "rtl" }}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="ios-btn"
                onClick={() => setRejectingProposal(null)}
                style={{ flex: 1, padding: "12px" }}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="ios-btn"
                onClick={handleConfirmRejection}
                disabled={isProcessingProposal || !rejectionReasonInput.trim()}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #ff3b30, #ff6eb4)", color: "#fff", fontWeight: "700", border: "none" }}
              >
                {isProcessingProposal ? "جاري الحفظ..." : "تأكيد الرفض"}
              </button>
            </div>
          </div>
        </div>
      )}


      {error && (
        <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "16px", borderRadius: "16px", color: "#ff3b30", marginBottom: "30px", fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      {/* Add Place Form */}
      {showAddForm && (
        <div className="ios-sheet" style={{ position: "static", height: "auto", marginBottom: "40px", animation: "slide-in-section 0.4s ease" }}>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>إضافة مكان جديد</h2>
          <form onSubmit={handleAddPlace} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div><label className="help-label">اسم المكان</label><input required className="ios-input" value={formData.name} onChange={e => updateForm("name", e.target.value)} /></div>
            <div>
              <label className="help-label">التصنيف الرئيسي (يظهر للمستخدم على كارت المكان)</label>
              <select required className="ios-input help-select" value={formData.category} onChange={e => {
                const val = e.target.value;
                updateForm("category", val);
                updateForm("category_label", CATEGORY_MAP[val] || val);
              }}>
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border-glass)" }}>
              <label className="help-label" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", color: "var(--text-primary)", display: "block" }}>
                التصنيفات الفرعية (تتيح ظهور المكان عند تصفية التبويبات وتظهر بتفاصيل المكان)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {DEFAULT_CATEGORIES.filter(c => c.name !== formData.category).map(cat => {
                  const isSelected = formData.sub_categories?.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        const current = formData.sub_categories || [];
                        const next = isSelected ? current.filter(s => s !== cat.name) : [...current, cat.name];
                        updateForm("sub_categories", next);
                      }}
                      style={{
                        background: isSelected ? "var(--accent-primary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                        color: isSelected ? "#fff" : "var(--text-primary)",
                        border: isSelected ? "none" : "1px solid var(--border-glass)",
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
            <div>
              <label className="help-label">المحافظة</label>
              <select className="ios-input help-select" value={formData.governorate} onChange={e => {
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
              <select className="ios-input help-select" value={formData.city} onChange={e => updateForm("city", e.target.value)}>
                {(egyptLocations[formData.governorate] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label className="help-label">العنوان بالتفصيل</label><input required className="ios-input" value={formData.full_address} onChange={e => updateForm("full_address", e.target.value)} /></div>

            <div><label className="help-label">أرقام الهاتف (مفصولة بفاصلة)</label><input className="ios-input" value={formData.phones} onChange={e => updateForm("phones", e.target.value)} placeholder="012.., 010.." style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div>
              <label className="help-label">رابط خرائط جوجل (سيتم استخراج الإحداثيات تلقائياً)</label>
              <input
                className="ios-input"
                value={formData.google_maps_url}
                onChange={e => updateForm("google_maps_url", e.target.value)}
                onBlur={e => extractCoordinates(e.target.value)}
                style={{ direction: "ltr", textAlign: "right" }}
              />
            </div>

            {/* Image URLs */}
            <div><label className="help-label">رابط الصورة الرئيسية (URL)</label><input className="ios-input" type="url" value={formData.image_url} onChange={e => updateForm("image_url", e.target.value)} placeholder="https://..." style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label className="help-label">روابط الميديا (صور، قائمة طعام) - مفصولة بفاصلة</label><textarea className="ios-input" rows={2} value={formData.menu_images} onChange={e => updateForm("menu_images", e.target.value)} placeholder="https://..., https://..." style={{ direction: "ltr", textAlign: "left" }}></textarea></div>

            {/* Working Hours UI */}
            <div style={{ gridColumn: "1 / -1", background: "rgba(120, 120, 120, 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
              <label className="help-label" style={{ fontSize: "1.1rem", marginBottom: "12px", color: "var(--text-primary)" }}>ساعات العمل</label>

              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button type="button" onClick={() => setScheduleType("24/7")} className={`ios-btn ${scheduleType === "24/7" ? "ios-btn-primary" : ""}`} style={{ flex: 1 }}>مفتوح 24 ساعة</button>
                <button type="button" onClick={() => setScheduleType("custom")} className={`ios-btn ${scheduleType === "custom" ? "ios-btn-primary" : ""}`} style={{ flex: 1, background: scheduleType === "custom" ? "#ff9f0a" : undefined }}>مواعيد متغيرة</button>
              </div>

              {scheduleType === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {scheduleData.map((dayData, index) => (
                    <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                      <div style={{ width: "80px", fontWeight: "bold" }}>{dayData.day}</div>

                      <select
                        className="ios-input help-select"
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
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>من</span>
                          <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...scheduleData]; newData[index].openTime = e.target.value; setScheduleData(newData); }}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...scheduleData]; newData[index].openPeriod = e.target.value as "ص" | "م"; setScheduleData(newData); }}>
                            <option value="ص">ص</option><option value="م">م</option>
                          </select>

                          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 5px" }}>حتي</span>
                          <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...scheduleData]; newData[index].closeTime = e.target.value; setScheduleData(newData); }}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...scheduleData]; newData[index].closePeriod = e.target.value as "ص" | "م"; setScheduleData(newData); }}>
                            <option value="ص">ص</option><option value="م">م</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div><label className="help-label">خط العرض (Latitude)</label><input className="ios-input" type="number" step="any" value={formData.latitude} onChange={e => updateForm("latitude", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div><label className="help-label">خط الطول (Longitude)</label><input className="ios-input" type="number" step="any" value={formData.longitude} onChange={e => updateForm("longitude", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="help-label">وصف قصير (يظهر تحت اسم المكان)</label>
              <input required className="ios-input" value={formData.short_description} onChange={e => updateForm("short_description", e.target.value)} placeholder="وصف جذاب من سطر واحد..." />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="help-label">وصف المكان التفصيلي</label>
              <textarea className="ios-input" rows={3} value={formData.description} onChange={e => updateForm("description", e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" className="ios-btn" onClick={() => setShowAddForm(false)}><i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i><i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء</button>
              <button type="submit" className="ios-btn ios-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإضافة..." : "حفظ المكان"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Places List */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderBar}>
          <div className={styles.tableTitleGroup}>
            <div className={styles.tableIcon}>
              <LuReplaceAll />
            </div>
            <div>
              <h2 className={styles.tableTitle}>الأماكن المسجلة ({places.length})</h2>
            </div>
          </div>
        </div>

        {places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 40px", color: "#94a3b8" }}>
            <i className="bx bx-map-alt" style={{ fontSize: "3rem", marginBottom: "12px", display: "block", color: "#475569" }} />
            لا يوجد أماكن حالياً. قم بإضافة بيانات تجريبية أو أضف مكاناً جديداً.
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.adminTable}>
              <thead className={styles.adminThead}>
                <tr>
                  <th className={styles.adminTh}>الصورة</th>
                  <th className={styles.adminTh}>الاسم</th>
                  <th className={styles.adminTh}>التصنيف</th>
                  <th className={styles.adminTh}>المنطقة</th>
                  <th className={styles.adminTh}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {places.map(place => (
                  <tr key={place.id} className={styles.adminTr}>
                    <td className={styles.adminTd}>
                      {place.images && place.images.length > 0 ? (
                        <img src={place.images[0]} alt={place.name} style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🖼️</div>
                      )}
                    </td>
                    <td className={styles.adminTd} style={{ fontWeight: "700", color: "#f1f5f9" }}>{place.name}</td>
                    <td className={styles.adminTd}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className={`${styles.badge} ${styles.badgePrimary}`}>
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
                      <div style={{ color: "#cbd5e1", fontSize: "0.88rem" }}>{place.city} / {place.governorate}</div>
                      <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginTop: "4px", fontSize: "0.72rem" }}>
                        <i className="bx bx-buildings" /> {place.branches ? place.branches.length : 1} فروع
                      </span>
                    </td>
                    <td className={styles.adminTd}>
                      <div className={styles.actionMenuWrapper}>
                        {/* Trigger Button */}
                        <button
                          className={`${styles.actionMenuTrigger} ${openMenuId === place.id ? styles.actionMenuTriggerOpen : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openMenuId === place.id) {
                              setOpenMenuId(null);
                            } else {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setMenuPos({ top: rect.bottom + 6, left: rect.left });
                              setOpenMenuId(place.id);
                            }
                          }}
                        >
                          <span>إجراءات</span>
                          <i className="bx bx-chevron-down chevron" style={{ fontSize: "1rem", transition: "transform 0.2s ease", transform: openMenuId === place.id ? "rotate(180deg)" : "rotate(0deg)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Floating Action Dropdown (rendered outside table to avoid overflow clipping) ── */}
      {openMenuId && (
        <div
          className={styles.actionDropdown}
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const place = places.find(p => p.id === openMenuId);
            if (!place) return null;
            return (
              <>
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemEdit}`}
                  onClick={() => { handleStartEditPlace(place); setOpenMenuId(null); }}
                >
                  <i className="bx bx-edit" style={{ fontSize: "1.1rem", color: "#4ade80" }} />
                  تعديل المكان
                </button>
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemBranch}`}
                  onClick={() => { setSelectedPlaceForBranch(place); setOpenMenuId(null); }}
                >
                  <i className="bx bx-buildings" style={{ fontSize: "1.1rem", color: "#818cf8" }} />
                  إدارة الفروع
                </button>
                <div className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`}
                  onClick={() => { handleDeletePlace(place.id); setOpenMenuId(null); }}
                >
                  <i className="bx bx-trash" style={{ fontSize: "1.1rem", color: "#f87171" }} />
                  حذف المكان
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Full Comprehensive Edit Place Modal */}
      {editingPlace && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", animation: "fade-in 0.2s ease" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "940px", maxHeight: "100vh", overflowY: "auto", borderRadius: "1px", padding: "30px", background: "var(--bg-glass-card, #000000ff)", border: "2px solid var(--accent-primary)"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-cairo)", fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <RiEditFill />
                  تعديل بيانات : {editingPlace.name}
                </h2>
              </div>
            </div>

            <form onSubmit={handleUpdatePlace} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>اسم المكان</label>
                <input required className="ios-input" value={editPlaceFormData.name} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, name: e.target.value })} />
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>وصف قصير (يظهر تحت اسم المكان مباشرة)</label>
                <input className="ios-input" value={editPlaceFormData.short_description} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, short_description: e.target.value })} placeholder="مثال: أشهى المأكولات الإيطالية والبيتزا..." />
              </div>

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>التصنيف الرئيسي (يظهر للمستخدم على كارت المكان)</label>
                <select required className="ios-input help-select" value={editPlaceFormData.category} onChange={e => {
                  const val = e.target.value;
                  setEditPlaceFormData({ ...editPlaceFormData, category: val, category_label: CATEGORY_MAP[val] || val });
                }}>
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border-glass)" }}>
                <label className="help-label" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", color: "var(--text-primary)", display: "block" }}>
                  التصنيفات الفرعية (تتيح ظهور المكان عند تصفية التبويبات وتظهر بتفاصيل المكان)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {DEFAULT_CATEGORIES.filter(c => c.name !== editPlaceFormData.category).map(cat => {
                    const isSelected = editPlaceFormData.sub_categories?.includes(cat.name);
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          const current = editPlaceFormData.sub_categories || [];
                          const next = isSelected ? current.filter(s => s !== cat.name) : [...current, cat.name];
                          setEditPlaceFormData({ ...editPlaceFormData, sub_categories: next });
                        }}
                        style={{
                          background: isSelected ? "var(--accent-primary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                          color: isSelected ? "#fff" : "var(--text-primary)",
                          border: isSelected ? "none" : "1px solid var(--border-glass)",
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

              <div>
                <label className="help-label" style={{ fontWeight: "700" }}>المحافظة</label>
                <select className="ios-input help-select" value={editPlaceFormData.governorate} onChange={e => {
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
                <select className="ios-input help-select" value={editPlaceFormData.city} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, city: e.target.value })}>
                  {(egyptLocations[editPlaceFormData.governorate] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="help-label" style={{ fontWeight: "700" }}>العنوان بالتفصيل</label>
                <input required className="ios-input" value={editPlaceFormData.full_address} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, full_address: e.target.value })} />
              </div>

              <div>
                <label className="help-label">أرقام الهاتف (مفصولة بفاصلة)</label>
                <input className="ios-input" value={editPlaceFormData.phones} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, phones: e.target.value })} placeholder="012.., 010.." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label">رابط خريطة جوجل m.maps</label>
                <input className="ios-input" type="url" value={editPlaceFormData.google_maps_url} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, google_maps_url: e.target.value })} placeholder="https://maps.app.goo.gl/..." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label">رابط الصورة الرئيسية (URL)</label>
                <input className="ios-input" type="url" value={editPlaceFormData.image_url} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, image_url: e.target.value })} placeholder="https://..." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div>
                <label className="help-label">صور المنيو (روابط مفصولة بفاصلة)</label>
                <input className="ios-input" value={editPlaceFormData.menu_images} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, menu_images: e.target.value })} placeholder="https://img1..., https://img2..." style={{ direction: "ltr", textAlign: "right" }} />
              </div>

              <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.06)", padding: "20px", borderRadius: "18px", border: "1px solid var(--border-glass)" }}>
                <label className="help-label" style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "12px", color: "var(--text-primary)", display: "block" }}>⏰ مواعيد وساعات العمل (يوم بيوم)</label>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button type="button" onClick={() => setEditScheduleType("24/7")} className={`ios-btn ${editScheduleType === "24/7" ? "ios-btn-primary" : ""}`} style={{ flex: 1, padding: "10px" }}>مفتوح 24 ساعة</button>
                  <button type="button" onClick={() => setEditScheduleType("custom")} className={`ios-btn ${editScheduleType === "custom" ? "ios-btn-primary" : ""}`} style={{ flex: 1, padding: "10px", background: editScheduleType === "custom" ? "#ff9f0a" : undefined }}>مواعيد متغيرة لكل يوم</button>
                </div>

                {editScheduleType === "custom" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {editScheduleData.map((dayData, index) => (
                      <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                        <div style={{ width: "80px", fontWeight: "bold", color: "var(--text-primary)" }}>{dayData.day}</div>

                        <select
                          className="ios-input help-select"
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
                            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>من</span>
                            <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...editScheduleData]; newData[index].openTime = e.target.value; setEditScheduleData(newData); }}>
                              {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...editScheduleData]; newData[index].openPeriod = e.target.value as "ص" | "م"; setEditScheduleData(newData); }}>
                              <option value="ص">ص</option><option value="م">م</option>
                            </select>

                            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 4px" }}>حتي</span>
                            <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...editScheduleData]; newData[index].closeTime = e.target.value; setEditScheduleData(newData); }}>
                              {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...editScheduleData]; newData[index].closePeriod = e.target.value as "ص" | "م"; setEditScheduleData(newData); }}>
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
                <textarea rows={3} className="ios-input" value={editPlaceFormData.description} onChange={e => setEditPlaceFormData({ ...editPlaceFormData, description: e.target.value })} placeholder="اكتب وصفاً جذاباً ومفصلاً للخدمات والأجواء..." />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "14px", marginTop: "10px" }}>
                <button type="submit" disabled={isUpdatingPlace || !editPlaceFormData.name.trim()} className="ios-btn ios-btn-primary" style={{ flex: 2, padding: "14px", fontSize: "1rem", fontWeight: "700" }}>
                  {isUpdatingPlace ? "جاري التحديث..." : "💾 حفظ التعديلات الشاملة"}
                </button>
                <button type="button" onClick={() => setEditingPlace(null)} className="ios-btn" style={{ flex: 1, padding: "14px" }}>
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
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button
              onClick={() => setSelectedPlaceForBranch(null)}
              style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(120,120,120,0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>إدارة فروع: {selectedPlaceForBranch.name}</h2>

            {/* Existing Branches List */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "14px", color: "var(--text-secondary)" }}>الفروع الحالية ({selectedPlaceForBranch.branches?.length || 0})</h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {(selectedPlaceForBranch.branches || []).map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(120,120,120,0.05)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{b.name} {b.is_main ? <span style={{ color: "var(--accent-success)", fontSize: "0.8rem", marginLeft: "8px" }}>(فرع رئيسي)</span> : ""}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{b.city} / {b.governorate}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditBranch(b)}
                        style={{ background: "none", border: "none", color: "var(--accent-ios)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}><i className="bx bx-edit" style={{ fontSize: "1.2rem" }}></i><i className="bx bx-edit" style={{ fontSize: "1.2rem" }}></i> تعديل</button>
                      {!b.is_main && (
                        <button onClick={() => handleDeleteBranch(b.id, selectedPlaceForBranch.id, b.is_main)} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}><i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i><i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i> حذف</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Branch Form */}
            <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{editingBranchId ? "تعديل الفرع" : "إضافة فرع جديد"}</h3>
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
                    style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "0.9rem" }}>
                    إلغاء التعديل
                  </button>
                )}
              </div>
              <form onSubmit={handleAddBranch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div><label className="help-label">اسم الفرع</label><input required className="ios-input" value={branchFormData.name} onChange={e => setBranchFormData(p => ({ ...p, name: e.target.value }))} placeholder="مثال: فرع مدينة نصر" /></div>
                <div><label className="help-label">المحافظة</label>
                  <select required className="ios-input" value={branchFormData.governorate} onChange={e => setBranchFormData(p => ({ ...p, governorate: e.target.value, city: "" }))}>
                    {governoratesList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="help-label">المدينة / المنطقة</label>
                  <select required className="ios-input" value={branchFormData.city} onChange={e => setBranchFormData(p => ({ ...p, city: e.target.value }))}>
                    <option value="">اختر المدينة</option>
                    {(egyptLocations[branchFormData.governorate as keyof typeof egyptLocations] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="help-label">العنوان التفصيلي</label><input required className="ios-input" value={branchFormData.full_address} onChange={e => setBranchFormData(p => ({ ...p, full_address: e.target.value }))} /></div>
                <div><label className="help-label">أرقام التليفون (مفصولين بفاصلة)</label><input className="ios-input" value={branchFormData.phones} onChange={e => setBranchFormData(p => ({ ...p, phones: e.target.value }))} style={{ direction: "ltr", textAlign: "right" }} /></div>
                <div>
                  <label className="help-label">رابط خرائط جوجل</label>
                  <input className="ios-input" value={branchFormData.google_maps_url}
                    onChange={e => setBranchFormData(p => ({ ...p, google_maps_url: e.target.value }))}
                    onBlur={e => extractBranchCoordinates(e.target.value)}
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                </div>
                <div><label className="help-label">خط العرض</label><input className="ios-input" type="number" step="any" value={branchFormData.latitude} onChange={e => setBranchFormData(p => ({ ...p, latitude: e.target.value }))} /></div>
                <div><label className="help-label">خط الطول</label><input className="ios-input" type="number" step="any" value={branchFormData.longitude} onChange={e => setBranchFormData(p => ({ ...p, longitude: e.target.value }))} /></div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">الميديا الخاصة بالفرع (روابط مفصولة بفاصلة)</label>
                  <textarea className="ios-input" rows={2} value={branchFormData.media} onChange={e => setBranchFormData(p => ({ ...p, media: e.target.value }))} placeholder="https://..., https://..." style={{ direction: "ltr", textAlign: "left" }}></textarea>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">ساعات العمل</label>
                  <select className="ios-input" value={branchScheduleType} onChange={e => setBranchScheduleType(e.target.value as any)} style={{ marginBottom: "10px" }}>
                    <option value="24/7">مفتوح طول أيام الأسبوع 24 ساعة</option>
                    <option value="custom">مواعيد مخصصة</option>
                  </select>
                  {branchScheduleType === "custom" && (
                    <div style={{ background: "rgba(120,120,120,0.05)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border-glass)" }}>
                      {branchScheduleData.map((dayData, index) => (
                        <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: index < branchScheduleData.length - 1 ? "1px solid rgba(120,120,120,0.1)" : "none", flexWrap: "wrap" }}>
                          <div style={{ width: "80px", fontWeight: "bold" }}>{dayData.day}</div>

                          <select
                            className="ios-input help-select"
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
                              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>من</span>
                              <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...branchScheduleData]; newData[index].openTime = e.target.value; setBranchScheduleData(newData); }}>
                                {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...branchScheduleData]; newData[index].openPeriod = e.target.value as "ص" | "م"; setBranchScheduleData(newData); }}>
                                <option value="ص">ص</option><option value="م">م</option>
                              </select>

                              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 5px" }}>حتي</span>
                              <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...branchScheduleData]; newData[index].closeTime = e.target.value; setBranchScheduleData(newData); }}>
                                {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...branchScheduleData]; newData[index].closePeriod = e.target.value as "ص" | "م"; setBranchScheduleData(newData); }}>
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
                  <button type="submit" disabled={isSubmittingBranch} className="ios-btn ios-btn-primary" style={{ marginTop: "10px" }}>
                    {isSubmittingBranch ? "جاري الحفظ..." : (editingBranchId ? "حفظ التعديلات" : "إضافة الفرع")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
