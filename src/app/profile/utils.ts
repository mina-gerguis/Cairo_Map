import { getStoredCities, getFavoriteLandmarkIds } from "@/data/cities";
import { FALLBACK_PLANS } from "./constants";
import { SubscriptionPlan, SubscriptionPeriod, UserProfile, PasswordRules, FavoritePlaceItem } from "./types";

export const formatNumber = (num: number, decimals = 0): string => {
  if (num < 1000) return num.toFixed(decimals).replace(/\.0+$/, "");
  if (num >= 1000 && num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num >= 1000000 && num < 1000000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "b";
};

export const getPlanRank = (tier: string | undefined): number => {
  if (tier === "mishwar") return 2;
  if (tier === "silver") return 3;
  if (tier === "gold") return 4;
  return 1;
};

export const findPlan = (planId: string, dbPlans: SubscriptionPlan[] = []): SubscriptionPlan => {
  return dbPlans.find((p) => p.id === planId) || FALLBACK_PLANS.find((p) => p.id === planId) || FALLBACK_PLANS[0];
};

export const calculatePlanPrice = (
  planId: string,
  period: SubscriptionPeriod | null,
  profile: UserProfile | null,
  dbPlans: SubscriptionPlan[] = []
): number => {
  if (planId === "free") return 0;

  const plan = findPlan(planId, dbPlans);
  let basePrice = 0;

  if (period === "daily") {
    basePrice = Number(plan.price_daily);
  } else if (period === "monthly") {
    basePrice = Number(plan.price_monthly);
  } else if (period === "yearly") {
    basePrice = Number(plan.price_yearly);
  }

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasActiveSilver = profile?.subscription_tier === "silver" && !isExpired;
  const hasActiveMishwar = profile?.subscription_tier === "mishwar" && !isExpired;

  // Upgrade from silver to gold: subtract current silver price
  if (hasActiveSilver && planId === "gold") {
    const silverPlan = findPlan("silver", dbPlans);
    const silverPrice = profile?.subscription_period === "yearly" ? Number(silverPlan.price_yearly) : Number(silverPlan.price_monthly);
    const diff = basePrice - silverPrice;
    return diff > 0 ? diff : 0;
  }

  // Upgrade from mishwar to silver or gold: subtract mishwar daily price
  if (hasActiveMishwar && (planId === "silver" || planId === "gold")) {
    const mishwarPlan = findPlan("mishwar", dbPlans);
    const mishwarPrice = Number(mishwarPlan.price_daily);
    const diff = basePrice - mishwarPrice;
    return diff > 0 ? diff : 0;
  }

  return basePrice;
};

export const checkPasswordRules = (newPwd: string, confirmPwd: string): PasswordRules => {
  return {
    length: newPwd.length >= 8 && newPwd.length <= 32,
    upper: /[A-Z]/.test(newPwd),
    lower: /[a-z]/.test(newPwd),
    number: /[0-9]/.test(newPwd),
    special: /[@$!%*?&#^]/.test(newPwd),
    match: newPwd === confirmPwd && newPwd !== "",
  };
};

export const getProblemLabelAr = (type: string): string => {
  switch (type) {
    case "name":
      return "الاسم غير صحيح ✏️";
    case "address":
      return "العنوان أو الموقع غير صحيح 📍";
    case "phone_website":
      return "الهاتف أو موقع الويب غير صحيح 📞";
    case "working_hours":
      return "ساعات العمل غير صحيحة 🕐";
    case "closed":
      return "المكان مغلق 🔴";
    case "category":
      return "الفئة غير صحيحة 🗂️";
    default:
      return "تفاصيل أخرى ⚠️";
  }
};

export const getFavoritedLandmarksAsItems = (): FavoritePlaceItem[] => {
  if (typeof window === "undefined") return [];
  const favIds = getFavoriteLandmarkIds();
  if (favIds.length === 0) return [];

  const cities = getStoredCities();
  const result: FavoritePlaceItem[] = [];

  cities.forEach((city) => {
    (city.landmarks || []).forEach((lm) => {
      if (favIds.includes(lm.id)) {
        result.push({
          id: lm.id,
          name: lm.name,
          category: "landmark",
          categoryLabel: "معلم سياحي",
          briefLocation: `مدينة ${city.name}`,
          fullAddress: lm.description,
          images: lm.images && lm.images.length > 0 ? lm.images : [lm.cover_image],
          isLandmark: true,
          landmarkObj: lm,
          cityObj: city,
        });
      }
    });
  });

  return result;
};

export const getGreetingTitle = (fullName: string, prefix: string): string => {
  const firstName = fullName.trim().split(/\s+/)[0];
  if (firstName) {
    return `${prefix}، ${firstName}`;
  }
  return prefix;
};
