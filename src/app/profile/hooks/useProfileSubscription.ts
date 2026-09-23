"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile, SubscriptionPlan, SubscriptionPeriod, ProfileAlertMessage } from "../types";
import { calculatePlanPrice, getPlanRank, findPlan } from "../utils";

interface UseProfileSubscriptionProps {
  user: any;
  profile: UserProfile | null;
  dbPlans: SubscriptionPlan[];
  fetchProfileData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfileSubscription = ({
  user,
  profile,
  dbPlans,
  fetchProfileData,
  refreshProfile,
}: UseProfileSubscriptionProps) => {
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("silver");
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<"monthly" | "yearly">("monthly");
  const [subscribing, setSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState<ProfileAlertMessage | null>(null);

  const [showSubConfirmModal, setShowSubConfirmModal] = useState(false);
  const [subConfirmData, setSubConfirmData] = useState<{
    planId: string;
    period: SubscriptionPeriod | null;
    message: string;
  } | null>(null);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const profileExpired = Boolean(
    profile?.subscription_end && new Date(profile.subscription_end) < new Date()
  );

  const hasRemindersAccess = Boolean(
    profile?.is_admin ||
      ((profile?.subscription_tier === "mishwar" ||
        profile?.subscription_tier === "silver" ||
        profile?.subscription_tier === "gold") &&
        !profileExpired)
  );

  // Check URL query and hash on load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSubscriptionParam = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expand") === "subscription" || window.location.hash === "#subscription") {
        setShowSubModal(true);
      }
    };

    checkSubscriptionParam();
    const timer = setTimeout(checkSubscriptionParam, 300);
    window.addEventListener("hashchange", checkSubscriptionParam);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", checkSubscriptionParam);
    };
  }, []);

  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = Array.from(container.children).filter((el) => el.tagName === "DIV");
    if (cards && cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveCardIndex(index);
    }
  };

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = Array.from(container.children).filter((el) => el.tagName === "DIV");
    if (cards.length === 0) return;

    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (activeCardIndex !== closestIndex) {
      setActiveCardIndex(closestIndex);
    }
  };

  const getPlanPrice = (planId: string, period: SubscriptionPeriod | null) => {
    return calculatePlanPrice(planId, period, profile, dbPlans);
  };

  const handleConfirmSubscribe = async (planId: string, period: SubscriptionPeriod | null) => {
    if (!supabase || !user || !profile) return;

    const currentRank = getPlanRank(profile.subscription_tier);
    const newRank = getPlanRank(planId);

    // Prevent downgrade while subscription is active
    if (planId !== "free" && !profileExpired && currentRank > newRank) {
      const planLabel =
        planId === "mishwar" ? "باقة المشوار" : planId === "silver" ? "الباقة الفضية" : "الباقة الذهبية";
      setSubMessage({
        type: "error",
        text: `أنت على باقة أعلى حالياً ولا يمكن تخفيض اشتراكك. لا تقلق، عند انتهاء المدة لن يتجدد الاشتراك تلقائياً. يمكنك بعد انتهاء مدة باقتك الحالية التي ستنتهي في ${new Date(
          profile.subscription_end!
        ).toLocaleDateString("ar-EG")} الاشتراك في ${planLabel}.`,
      });
      return;
    }

    const price = getPlanPrice(planId, period);

    if (planId !== "free" && (profile.balance ?? 0) < price) {
      setSubMessage({
        type: "error",
        text: `رصيد محفظتك غير كافٍ للاشتراك (مطلوب ${price} ج.م، رصيدك الحالي ${(
          profile.balance ?? 0
        ).toFixed(2)} ج.م). يرجى شحن الرصيد أولاً.`,
      });
      return;
    }

    const planLabel =
      planId === "mishwar"
        ? "باقة المشوار"
        : planId === "silver"
        ? "الباقة الفضية"
        : planId === "gold"
        ? "الباقة الذهبية"
        : "الباقة المجانية";
    const periodLabel =
      period === "monthly" ? "شهرياً" : period === "yearly" ? "سنوياً" : period === "daily" ? "يومياً" : "";

    let confirmMessage = "";
    if (planId === "free") {
      confirmMessage =
        "هل أنت متأكد من إلغاء تجديد الاشتراك والرجوع للباقة المجانية؟ ستظل مميزات باقتك الحالية مفعلة بالكامل حتى تاريخ انتهاء صلاحيتها.";
    } else {
      const isUpgrade =
        (profile.subscription_tier === "silver" || profile.subscription_tier === "mishwar") &&
        !profileExpired &&
        currentRank < newRank;

      confirmMessage = isUpgrade
        ? `هل أنت متأكد من ترقية اشتراكك إلى ${planLabel} ${periodLabel} بقيمة فرق الترقية فقط البالغ ${price} ج.م؟ سيتم الخصم من رصيد محفظتك مباشرة.`
        : `هل أنت متأكد من الاشتراك في ${planLabel} ${periodLabel} بقيمة ${price} ج.م؟ سيتم الخصم من رصيد محفظتك مباشرة.`;
    }

    setSubConfirmData({
      planId,
      period,
      message: confirmMessage,
    });
    setShowSubConfirmModal(true);
  };

  const executeSubscribe = async (planId: string, period: SubscriptionPeriod | null) => {
    if (!supabase || !user || !profile) return;

    setSubscribing(true);
    setSubMessage(null);
    setSelectedPlanId(planId);
    setShowSubConfirmModal(false);

    try {
      const { data, error } = await supabase.rpc("subscribe_to_plan", {
        p_plan_id: planId,
        p_period: period,
      });

      if (error) {
        setSubMessage({ type: "error", text: error.message });
      } else if (data) {
        if (data.success) {
          setSubMessage({ type: "success", text: data.message });
          await fetchProfileData();
          await refreshProfile();
        } else {
          setSubMessage({ type: "error", text: data.message });
        }
      }
    } catch (err: any) {
      setSubMessage({
        type: "error",
        text: "حدث خطأ أثناء معالجة الطلب: " + (err.message || err),
      });
    } finally {
      setSubscribing(false);
    }
  };

  return {
    showSubModal,
    setShowSubModal,
    selectedPlanId,
    setSelectedPlanId,
    subscriptionPeriod,
    setSubscriptionPeriod,
    subscribing,
    subMessage,
    setSubMessage,
    showSubConfirmModal,
    setShowSubConfirmModal,
    subConfirmData,
    activeCardIndex,
    carouselRef,
    profileExpired,
    hasRemindersAccess,
    scrollToCard,
    handleCarouselScroll,
    getPlanPrice,
    handleConfirmSubscribe,
    executeSubscribe,
    findPlan: (planId: string) => findPlan(planId, dbPlans),
  };
};
