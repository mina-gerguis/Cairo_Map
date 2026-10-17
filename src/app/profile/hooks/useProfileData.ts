"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  UserProfile,
  ProfileFormData,
  SubscriptionPlan,
  FavoritePlaceItem,
  ReminderItem,
  FaqItem,
  ProfileAlertMessage,
} from "../types";
import { INITIAL_PROFILE_FORM, FALLBACK_PLANS } from "../constants";
import { getFavoritedLandmarksAsItems } from "../utils";

export const useProfileData = () => {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_PROFILE_FORM);
  const [dbPlans, setDbPlans] = useState<SubscriptionPlan[]>(FALLBACK_PLANS);
  const [favorites, setFavorites] = useState<FavoritePlaceItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  const [greetingPrefix, setGreetingPrefix] = useState<string>("مساء الخير");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [message, setMessage] = useState<ProfileAlertMessage | null>(null);

  const isOwnProfile = Boolean(!profileUserId || (user && profileUserId === user.id));

  // Time-based greeting calculation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreetingPrefix("صباح الخير");
    } else {
      setGreetingPrefix("مساء الخير");
    }
  }, []);

  // Theme synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
      const initial = saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      setTheme(initial);
      document.body.style.setProperty("background-color", initial === "light" ? "#ededed" : "var(--bgPrimary)", "important");

      const handleThemeChange = (e: any) => {
        setTheme(e.detail);
        document.body.style.setProperty("background-color", e.detail === "light" ? "#ededed" : "var(--bgPrimary)", "important");
      };
      window.addEventListener("themechange", handleThemeChange);
      return () => {
        window.removeEventListener("themechange", handleThemeChange);
        document.body.style.removeProperty("background-color");
      };
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  // Message auto-dismiss
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchFAQs = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) {
        setFaqs(data);
      }
    } catch (e) {
      console.error("Error fetching FAQs:", e);
    }
  };

  const fetchProfileData = useCallback(async (targetId?: string) => {
    if (!supabase || !user) return;
    setLoading(true);

    const queryUserId =
      targetId ||
      (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null) ||
      user.id;

    // Auto-check and reset expired subscription in DB
    try {
      await supabase.rpc("check_user_subscription_status", { p_user_id: queryUserId });
    } catch (e) {
      // Fallback silently if RPC does not exist yet
    }

    // Fetch profile
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", queryUserId)
        .single();

      if (profileData) {
        const isExpired =
          profileData.subscription_tier !== "free" &&
          profileData.subscription_end &&
          new Date(profileData.subscription_end) < new Date();

        const updatedProfileData = isExpired
          ? {
              ...profileData,
              subscription_tier: "free",
              subscription_status: "expired",
              subscription_period: null,
            }
          : profileData;

        setProfile({ ...updatedProfileData, email: updatedProfileData.email || user.email });
        setFormData({
          fullName: updatedProfileData.full_name || "",
          username: updatedProfileData.username || "",
          phone: updatedProfileData.phone?.replace("+20", "") || "",
          email: updatedProfileData.email || user.email || "",
          governorate: updatedProfileData.governorate || "",
          city: updatedProfileData.city || "",
          dob: updatedProfileData.dob || "",
          avatarUrl: updatedProfileData.avatar_url || "",
          interests: updatedProfileData.interests || [],
        });
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }

    // Fetch subscription plans
    try {
      const { data: plansData } = await supabase.from("subscription_plans").select("*");
      if (plansData && plansData.length > 0) {
        setDbPlans(plansData);
      }
    } catch (e) {
      console.error("Error fetching subscription plans:", e);
    }

    // Fetch favorites
    let dbMappedFavs: FavoritePlaceItem[] = [];
    if (supabase && queryUserId) {
      try {
        const { data: favs } = await supabase
          .from("favorite_places")
          .select("place_id")
          .eq("user_id", queryUserId);

        if (favs && favs.length > 0) {
          const placeIds = favs.map((f: any) => f.place_id);
          const { data: favPlaces } = await supabase.from("places").select("*").in("id", placeIds);

          if (favPlaces) {
            dbMappedFavs = favPlaces.map((dbPlace) => ({
              id: dbPlace.id,
              name: dbPlace.name,
              category: dbPlace.category,
              categoryLabel: dbPlace.category_label,
              briefLocation: dbPlace.brief_location,
              fullAddress: dbPlace.full_address,
              phones: dbPlace.phones || [],
              googleMapsUrl: dbPlace.google_maps_url || "",
              images: dbPlace.images || [],
              menuImages: dbPlace.menu_images || [],
              workingHours: dbPlace.working_hours || "",
              rating: dbPlace.rating || 0,
              description: dbPlace.description || "",
              latitude: dbPlace.latitude || undefined,
              longitude: dbPlace.longitude || undefined,
            }));
          }
        }
      } catch (e) {
        console.error("Error fetching favorites:", e);
      }
    }

    const landmarkFavs = getFavoritedLandmarksAsItems();
    setFavorites([...landmarkFavs, ...dbMappedFavs]);

    // Fetch reminders/notes
    try {
      setLoadingReminders(true);
      const { data: notes } = await supabase
        .from("place_notes")
        .select("*, places(name)")
        .eq("user_id", queryUserId)
        .order("updated_at", { ascending: false });

      if (notes) {
        setReminders(
          notes.map((n: any) => ({
            id: n.id,
            placeId: n.place_id,
            note: n.note,
            updatedAt: n.updated_at,
            placeName: n.places?.name || "مكان غير معروف",
          }))
        );
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error("Error fetching notes:", e);
    } finally {
      setLoadingReminders(false);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    fetchFAQs();

    let queryUserId = user?.id || null;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlUserId = params.get("id");
      if (urlUserId) {
        queryUserId = urlUserId;
      }
    }
    setProfileUserId(queryUserId);

    if (!user) {
      setLoading(false);
      return;
    }

    fetchProfileData(queryUserId || undefined);

    const handleFavsUpdated = () => {
      fetchProfileData(queryUserId || undefined);
    };
    window.addEventListener("favorites_updated", handleFavsUpdated);

    return () => {
      window.removeEventListener("favorites_updated", handleFavsUpdated);
    };
  }, [user, authLoading, fetchProfileData]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user || !isOwnProfile) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setMessage({ type: "error", text: "فشل رفع الصورة: " + uploadError.message });
      } else if (data) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
        setFormData((prev) => ({ ...prev, avatarUrl: pub.publicUrl }));
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "حدث خطأ أثناء رفع الصورة." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!supabase || !user || !profile || !isOwnProfile) return;
    setSaving(true);
    setMessage(null);

    const now = new Date();
    const lastChange = profile.last_username_change ? new Date(profile.last_username_change) : null;
    const isUsernameChanged = formData.username !== profile.username;

    if (isUsernameChanged) {
      if (formData.username.length < 3) {
        setMessage({ type: "error", text: "اسم المستخدم يجب أن يكون 3 حروف على الأقل." });
        setSaving(false);
        return;
      }
      if (/^\d+$/.test(formData.username) || !/[a-z]/i.test(formData.username)) {
        setMessage({
          type: "error",
          text: "اسم المستخدم لا يمكن أن يتكون من أرقام فقط (يجب أن يحتوي على حروف إنجليزية).",
        });
        setSaving(false);
        return;
      }
      if (!/^[a-z0-9_]{3,30}$/.test(formData.username)) {
        setMessage({
          type: "error",
          text: "اسم المستخدم يجب أن يتكون من أحرف إنجليزية صغيرة وأرقام والشرطة السفلية (_) فقط بدون مسافات.",
        });
        setSaving(false);
        return;
      }
      if (lastChange) {
        const daysSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 3600 * 24);
        if (daysSinceChange < 30) {
          setMessage({
            type: "error",
            text: `لا يمكنك تغيير اسم المستخدم إلا مرة واحدة كل 30 يوم. متبقي ${Math.ceil(
              30 - daysSinceChange
            )} يوم.`,
          });
          setSaving(false);
          return;
        }
      }

      // Check if username is taken
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", formData.username)
        .neq("id", user.id);

      if (existing && existing.length > 0) {
        setMessage({ type: "error", text: "اسم المستخدم هذا مأخوذ مسبقاً." });
        setSaving(false);
        return;
      }
    }

    // Check phone uniqueness if changed
    const newPhone = `+20${formData.phone}`;
    if (newPhone !== profile.phone) {
      const { data: existingPhone } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", newPhone)
        .neq("id", user.id);

      if (existingPhone && existingPhone.length > 0) {
        setMessage({ type: "error", text: "رقم الهاتف هذا مسجل لحساب آخر." });
        setSaving(false);
        return;
      }
    }

    // Update Email in Auth if changed
    let emailChanged = false;
    if (formData.email !== profile.email) {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { error: emailError } = await supabase.auth.updateUser(
        { email: formData.email },
        { emailRedirectTo: `${siteUrl}/profile` }
      );
      if (emailError) {
        setMessage({ type: "error", text: "حدث خطأ أثناء طلب تغيير البريد. قد يكون مسجلاً مسبقاً." });
        setSaving(false);
        return;
      }
      emailChanged = true;
    }

    // Update Profile
    const updatePayload: any = {
      full_name: formData.fullName,
      phone: newPhone,
      governorate: formData.governorate,
      city: formData.city,
      dob: formData.dob || null,
      interests: formData.interests,
      avatar_url: formData.avatarUrl,
    };

    if (isUsernameChanged) {
      updatePayload.username = formData.username;
      updatePayload.last_username_change = now.toISOString();
    }

    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء حفظ البيانات." });
    } else {
      if (refreshProfile) {
        await refreshProfile();
      }
      setMessage({
        type: "success",
        text: emailChanged
          ? "تم حفظ البيانات. راجع بريدك الإلكتروني لتأكيد العنوان الجديد."
          : "تم تحديث البيانات بنجاح!",
      });
      setEditMode(false);
      fetchProfileData();
    }
    setSaving(false);
  };

  const handleDeleteReminder = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!supabase) return;
    try {
      const { error } = await supabase.from("place_notes").delete().eq("id", noteId);
      if (!error) {
        setReminders((prev) => prev.filter((r) => r.id !== noteId));
      }
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  return {
    user,
    profile,
    setProfile,
    formData,
    setFormData,
    dbPlans,
    favorites,
    reminders,
    faqs,
    setFaqs,
    loading,
    authLoading,
    saving,
    editMode,
    setEditMode,
    uploadingAvatar,
    loadingReminders,
    isOwnProfile,
    greetingPrefix,
    theme,
    toggleTheme,
    message,
    setMessage,
    fetchProfileData,
    fetchFAQs,
    handleAvatarFileUpload,
    handleSaveProfile,
    handleDeleteReminder,
  };
};
