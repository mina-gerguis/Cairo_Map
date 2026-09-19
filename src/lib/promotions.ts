"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

export interface NewUserTrialConfig {
  id: string;
  type: "new_user_trial";
  title: string;
  description: string;
  target_tier: "gold" | "silver" | "mishwar";
  duration_days: number;
  is_active: boolean;
  welcome_message: string;
  updated_at?: string;
}

export interface OpenPageAccessOffer {
  id: string;
  type: "open_page_access";
  title: string;
  target_page: string; // 'all' or specific route like '/directions', '/airports'
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  banner_message: string;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionStatusResult {
  isOpen: boolean;
  offer: OpenPageAccessOffer | null;
  remainingDays: number | null;
  loading: boolean;
}

export const PROTECTED_PAGE_OPTIONS = [
  { value: "all", label: "🌟 كل الخدمات والصفحات المدفوعة معاً" },
  { value: "/directions", label: "🧭 خطوط المواصلات والاتجاهات (ازاي اروح)" },
  { value: "/ai-planner", label: "🤖 المساعد ومخطط الرحلات الذكي" },
  { value: "/airports", label: "✈️ دليل المطارات المصرية والصالات" },
  { value: "/ports", label: "⚓ دليل الموانئ البحرية والسفر" },
  { value: "/bus-stations", label: "🚌 دليل الأتوبيسات وسوبرجيت" },
  { value: "/microbus-stations", label: "🚐 مواقف السرفيس والميكروباص" },
  { value: "/railways", label: "🚆 دليل سكك حديد مصر والقطارات" },
  { value: "/lrt", label: "⚡ القطار الكهربائي الخفيف LRT" },
  { value: "/parking", label: "🚗 دليل الجراجات وخدمة اركن واركب" },
];

export const DEFAULT_TRIAL_CONFIG: NewUserTrialConfig = {
  id: "new_user_trial_config",
  type: "new_user_trial",
  title: "عرض الاشتراك التجريبي التلقائي للمسجلين الجدد",
  description: "تفعيل باقة مجانية تلقائية لكل حساب جديد يتم إنشاؤه في الموقع",
  target_tier: "gold",
  duration_days: 30, // 1 month default
  is_active: false,
  welcome_message: "🎉 تهانينا! تم تفعيل اشتراكك المجاني بنجاح كهدية ترحيبية لتسجيل حسابك الجديد.",
};

const TRIAL_STORAGE_KEY = "dftry_promo_new_user_trial";
const OPEN_PAGES_STORAGE_KEY = "dftry_promo_open_pages";

// Helper to safely get from localStorage
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to safely save to localStorage
function setLocalItem<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Dispatch event so all components / tabs react immediately
function notifyPromotionsUpdated() {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("promotions_updated"));
    } catch {
      // ignore
    }
  }
}

/**
 * Fetch New User Trial Configuration
 */
export async function getNewUserTrialConfig(): Promise<NewUserTrialConfig> {
  const cached = getLocalItem<NewUserTrialConfig>(TRIAL_STORAGE_KEY, DEFAULT_TRIAL_CONFIG);
  if (!supabase) return cached;

  try {
    const { data, error } = await supabase
      .from("subscription_offers")
      .select("*")
      .eq("id", "new_user_trial_config")
      .single();

    if (error || !data) {
      return cached;
    }

    const config: NewUserTrialConfig = {
      id: data.id,
      type: "new_user_trial",
      title: data.title || DEFAULT_TRIAL_CONFIG.title,
      description: data.description || DEFAULT_TRIAL_CONFIG.description,
      target_tier: data.target_tier || DEFAULT_TRIAL_CONFIG.target_tier,
      duration_days: data.duration_days ?? DEFAULT_TRIAL_CONFIG.duration_days,
      is_active: !!data.is_active,
      welcome_message: data.welcome_message || DEFAULT_TRIAL_CONFIG.welcome_message,
      updated_at: data.updated_at,
    };

    setLocalItem(TRIAL_STORAGE_KEY, config);
    return config;
  } catch (err) {
    console.warn("Failed to fetch trial config from DB, using fallback:", err);
    return cached;
  }
}

/**
 * Save New User Trial Configuration
 */
export async function saveNewUserTrialConfig(config: Partial<NewUserTrialConfig>): Promise<{ success: boolean; error?: string }> {
  const updated: NewUserTrialConfig = {
    ...DEFAULT_TRIAL_CONFIG,
    ...getLocalItem<NewUserTrialConfig>(TRIAL_STORAGE_KEY, DEFAULT_TRIAL_CONFIG),
    ...config,
    id: "new_user_trial_config",
    type: "new_user_trial",
    updated_at: new Date().toISOString(),
  };

  setLocalItem(TRIAL_STORAGE_KEY, updated);
  notifyPromotionsUpdated();

  if (!supabase) return { success: true };

  try {
    const { error } = await supabase
      .from("subscription_offers")
      .upsert({
        id: updated.id,
        type: updated.type,
        title: updated.title,
        description: updated.description,
        target_tier: updated.target_tier,
        duration_days: updated.duration_days,
        is_active: updated.is_active,
        welcome_message: updated.welcome_message,
        updated_at: updated.updated_at,
      });

    if (error) {
      console.warn("Could not upsert into subscription_offers table, local saved:", error);
      return { success: true };
    }
    notifyPromotionsUpdated();
    return { success: true };
  } catch (err: any) {
    console.error("Error saving trial config:", err);
    return { success: false, error: err?.message || "Failed to save trial config" };
  }
}

/**
 * Fetch all Open Page Access Offers from Supabase (or fallback)
 */
export async function getOpenPageAccessOffers(): Promise<OpenPageAccessOffer[]> {
  const cached = getLocalItem<OpenPageAccessOffer[]>(OPEN_PAGES_STORAGE_KEY, []);
  if (!supabase) return cached;

  try {
    const { data, error } = await supabase
      .from("subscription_offers")
      .select("*")
      .eq("type", "open_page_access")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return cached;
    }

    const offers: OpenPageAccessOffer[] = data.map((item: any) => ({
      id: item.id,
      type: "open_page_access",
      title: item.title,
      target_page: item.target_page,
      is_active: !!item.is_active,
      start_date: item.start_date || item.created_at || new Date().toISOString(),
      end_date: item.end_date || null,
      banner_message: item.banner_message || "",
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    setLocalItem(OPEN_PAGES_STORAGE_KEY, offers);
    return offers;
  } catch (err) {
    console.warn("Failed to fetch open page offers from DB, using fallback:", err);
    return cached;
  }
}

/**
 * Save or Update an Open Page Access Offer
 */
export async function saveOpenPageAccessOffer(offer: Partial<OpenPageAccessOffer>): Promise<{ success: boolean; data?: OpenPageAccessOffer; error?: string }> {
  const existingList = getLocalItem<OpenPageAccessOffer[]>(OPEN_PAGES_STORAGE_KEY, []);
  const offerId = offer.id || "offer_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

  const fullOffer: OpenPageAccessOffer = {
    id: offerId,
    type: "open_page_access",
    title: offer.title || "عرض فتح مجاني مؤقت",
    target_page: offer.target_page || "all",
    is_active: offer.is_active !== undefined ? offer.is_active : true,
    start_date: offer.start_date || new Date().toISOString(),
    end_date: offer.end_date !== undefined ? offer.end_date : null,
    banner_message: offer.banner_message || "🎉 ميزة مجانية لفترة محدودة لجميع المستخدمين!",
    created_at: offer.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updatedList = existingList.some((o) => o.id === offerId)
    ? existingList.map((o) => (o.id === offerId ? fullOffer : o))
    : [fullOffer, ...existingList];

  setLocalItem(OPEN_PAGES_STORAGE_KEY, updatedList);
  notifyPromotionsUpdated();

  if (!supabase) return { success: true, data: fullOffer };

  try {
    const { error } = await supabase
      .from("subscription_offers")
      .upsert({
        id: fullOffer.id,
        type: fullOffer.type,
        title: fullOffer.title,
        target_page: fullOffer.target_page,
        is_active: fullOffer.is_active,
        start_date: fullOffer.start_date,
        end_date: fullOffer.end_date,
        banner_message: fullOffer.banner_message,
        updated_at: fullOffer.updated_at,
      });

    if (error) {
      console.warn("Could not upsert offer to DB, saved locally:", error);
    }
    notifyPromotionsUpdated();
    return { success: true, data: fullOffer };
  } catch (err: any) {
    console.error("Error saving open page offer:", err);
    notifyPromotionsUpdated();
    return { success: true, data: fullOffer };
  }
}

/**
 * Delete an Open Page Access Offer
 */
export async function deleteOpenPageAccessOffer(id: string): Promise<{ success: boolean; error?: string }> {
  const existingList = getLocalItem<OpenPageAccessOffer[]>(OPEN_PAGES_STORAGE_KEY, []);
  const updatedList = existingList.filter((o) => o.id !== id);
  setLocalItem(OPEN_PAGES_STORAGE_KEY, updatedList);
  notifyPromotionsUpdated();

  if (!supabase) return { success: true };

  try {
    const { error } = await supabase
      .from("subscription_offers")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Could not delete offer from DB:", error);
    }
    notifyPromotionsUpdated();
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting open page offer:", err);
    notifyPromotionsUpdated();
    return { success: false, error: err?.message };
  }
}

/**
 * Pure synchronous checker: matches pathname against an offers list (or localStorage)
 */
export function isPageOpenByPromotion(
  pathname: string,
  offersList?: OpenPageAccessOffer[]
): {
  isOpen: boolean;
  offer: OpenPageAccessOffer | null;
  remainingDays: number | null;
} {
  const offers = (offersList && offersList.length > 0)
    ? offersList
    : getLocalItem<OpenPageAccessOffer[]>(OPEN_PAGES_STORAGE_KEY, []);

  if (!offers || offers.length === 0) {
    return { isOpen: false, offer: null, remainingDays: null };
  }

  const now = new Date();
  const cleanPath = (pathname || "").trim().toLowerCase().split("?")[0].replace(/\/+$/, "") || "/";

  // Find active matching offer
  const activeOffer = offers.find((o) => {
    if (!o.is_active) return false;

    // Check start date (allow small clock skew of 5 minutes)
    if (o.start_date) {
      const start = new Date(o.start_date);
      if (start.getTime() > now.getTime() + 5 * 60 * 1000) return false;
    }

    // Check end date
    if (o.end_date) {
      const end = new Date(o.end_date);
      if (end.getTime() < now.getTime()) return false;
    }

    // Check page match
    const target = (o.target_page || "").trim().toLowerCase().split("?")[0].replace(/\/+$/, "") || "/";
    if (target === "all") return true;
    if (target === cleanPath) return true;
    if (cleanPath.startsWith(target) && (cleanPath.length === target.length || cleanPath[target.length] === "/")) return true;

    return false;
  });

  if (!activeOffer) {
    return { isOpen: false, offer: null, remainingDays: null };
  }

  let remainingDays: number | null = null;
  if (activeOffer.end_date) {
    const diff = new Date(activeOffer.end_date).getTime() - now.getTime();
    remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    isOpen: true,
    offer: activeOffer,
    remainingDays,
  };
}

/**
 * React Hook for any component/page to reactively get promotion status and auto-sync with Supabase
 */
export function usePagePromotion(pathname: string): PromotionStatusResult {
  const [offers, setOffers] = useState<OpenPageAccessOffer[]>(() => {
    return getLocalItem<OpenPageAccessOffer[]>(OPEN_PAGES_STORAGE_KEY, []);
  });
  const [loading, setLoading] = useState(true);

  const syncOffers = useCallback(async () => {
    try {
      const latest = await getOpenPageAccessOffers();
      setOffers(latest);
    } catch {
      // fallback to cached
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch from DB
    syncOffers();

    // Listen to local events
    const handleUpdate = () => {
      const updated = getLocalItem<OpenPageAccessOffer[]>(OPEN_PAGES_STORAGE_KEY, []);
      setOffers(updated);
      syncOffers();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("promotions_updated", handleUpdate);
      window.addEventListener("storage", handleUpdate);
    }

    // Realtime Postgres changes from Supabase
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel("public:sub_offers_realtime_" + pathname.replace(/[^a-zA-Z0-9]/g, "_"))
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "subscription_offers" },
          () => {
            syncOffers();
          }
        )
        .subscribe();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("promotions_updated", handleUpdate);
        window.removeEventListener("storage", handleUpdate);
      }
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [syncOffers, pathname]);

  const status = isPageOpenByPromotion(pathname, offers);

  return {
    ...status,
    loading,
  };
}

/**
 * Automatically apply new user free trial if the offer is active
 */
export async function applyNewUserTrialIfActive(userId: string, userFullName?: string): Promise<{ applied: boolean; tier?: string; days?: number }> {
  try {
    const config = await getNewUserTrialConfig();
    if (!config.is_active || config.duration_days <= 0) {
      return { applied: false };
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + config.duration_days * 24 * 60 * 60 * 1000);
    const tier = config.target_tier || "gold";
    const tierName = tier === "gold" ? "الذهبية" : tier === "silver" ? "الفضية" : "المشوار";

    if (supabase) {
      // 1. Update user profile with the trial subscription
      await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          subscription_period: "trial",
          subscription_status: "active",
          subscription_start: startDate.toISOString(),
          subscription_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // 2. Insert welcome notification to the user
      const customMsg = config.welcome_message || `🎉 أهلاً بك ${userFullName || ""}! تم تفعيل اشتراكك المجاني في الباقة ${tierName} لمدة ${config.duration_days} يوماً بنجاح!`;
      await supabase
        .from("notifications")
        .insert([
          {
            user_id: userId,
            title: `🎁 هدية تسجيل: باقة ${tierName} مجانية`,
            message: customMsg,
            type: "success",
            link: "/profile",
          },
        ]);
    }

    return { applied: true, tier, days: config.duration_days };
  } catch (err) {
    console.error("Failed to apply new user trial promotion:", err);
    return { applied: false };
  }
}
