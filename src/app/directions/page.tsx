"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

import TransitFAQ from "@/components/TransitFAQ";

import { useDirectionsData } from "./hooks/useDirectionsData";
import { RouteData, RouteOption } from "./types";

import DirectionsLoading from "./components/DirectionsLoading";
import DirectionsPaywall from "./components/DirectionsPaywall";
import PopularRoutesSlider from "./components/PopularRoutesSlider";
import RouteSearchCard from "./components/RouteSearchCard";
import RouteResultsSection from "./components/RouteResultsSection";
import BottomReportBanner from "./components/BottomReportBanner";
import DirectionsReportModal from "./components/DirectionsReportModal";
import { isPageOpenByPromotion } from "@/lib/promotions";

const WeatherComfortWidget = dynamic(() => import("@/components/WeatherComfortWidget"), { ssr: false });

export default function DirectionsPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();
  const {
    loading: dataLoading,
    popularRoutes,
    uniqueCitiesList,
    searchRoute,
    trackSearch
  } = useDirectionsData();

  // Search input and result states
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [matchedRoute, setMatchedRoute] = useState<RouteData | null>(null);
  const [resolvedFromLabel, setResolvedFromLabel] = useState("");
  const [resolvedToLabel, setResolvedToLabel] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Problem Reporting Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingOption, setReportingOption] = useState<RouteOption | null>(null);
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // GSAP animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const paywallRef = useRef<HTMLDivElement>(null);
  const paywallCardRef = useRef<HTMLDivElement>(null);

  // Initial page entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const sections = [sliderRef.current, searchPanelRef.current, resultsPanelRef.current].filter(Boolean);
      if (sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.1 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Modal entrance animation
  useEffect(() => {
    if (reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [reportModalOpen]);

  // Paywall entrance animation
  useEffect(() => {
    if (paywallRef.current) {
      gsap.fromTo(
        paywallRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
    if (paywallCardRef.current) {
      gsap.fromTo(
        paywallCardRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: 0.1, ease: "power2.out" }
      );
    }
  }, [user, profile]);

  // Perform route search and log search analytics
  const handlePerformSearch = (fromVal = fromInput, toVal = toInput) => {
    if (!fromVal.trim() || !toVal.trim()) return;

    // Track search to dynamically promote popular searches
    trackSearch(fromVal, toVal);

    const result = searchRoute(fromVal, toVal);
    setMatchedRoute(result.matchedRoute);
    setResolvedFromLabel(result.resolvedFrom);
    setResolvedToLabel(result.resolvedTo);
    setSearchTriggered(true);
  };

  // Swap locations
  const handleSwap = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
    if (searchTriggered) {
      handlePerformSearch(toInput, temp);
    }
  };

  // Quick preset search handler
  const handlePresetSearch = (fromPreset: string, toPreset: string) => {
    setFromInput(fromPreset);
    setToInput(toPreset);
    handlePerformSearch(fromPreset, toPreset);
  };

  // GPS Current Location handler
  const handleUseGPSLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("خاصية تحديد الموقع غير مدعومة في متصفحك.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        setFromInput("القاهرة (رمسيس)");
      },
      () => {
        setIsLocating(false);
        alert("تعذر تحديد الموقع. يرجى تفعيل خدمة GPS والتأكد من إعطاء الصلاحية للمتصفح.");
      }
    );
  };

  // Open Problem Report Modal with limits checking
  const handleOpenReportModal = async (opt: RouteOption | null = null) => {
    setReportingOption(opt || matchedRoute?.options?.[0] || null);
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

  // Check user subscription / access or promotional open access
  const promoStatus = isPageOpen("/directions");
  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    promoStatus.isOpen ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  // Loading screen
  if (authLoading || dataLoading) {
    return <DirectionsLoading />;
  }

  // Paywall / Lock screen
  if (!hasAccess) {
    return (
      <DirectionsPaywall
        user={user}
        paywallRef={paywallRef}
        paywallCardRef={paywallCardRef}
      />
    );
  }

  return (
    //================================== START MAIN CONTAINER =================================
    <div className="main-container">
      {/* Header Banner */}
      <div ref={headerRef} className="header-banner">
        <div>
          <h1 className="header-title">
            <img
              src="/images/icons2d/arab_republic _of_egypt.png"
              alt="Egypt"
              loading="lazy"
              decoding="async"
              style={{ width: "38px", marginLeft: "10px" }}
            />
            ازاي اروح ..؟
          </h1>
          <p className="header-sub-title">
            دليل السفر والانتقال الذكي لمختلف وسائل المواصلات بالقاهرة والمحافظات. ابحث عن أي مكان وسنوجهك لأفضل طريق بدقة.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container">
        {/* Dynamic Popular Searches Slider (Ranked by user search counts) */}
        <div>
          <h2 className="slider-title">أشهر المسارات</h2>
          <PopularRoutesSlider
            sliderRef={sliderRef}
            routes={popularRoutes}
            onSelectRoute={handlePresetSearch}
          />
        </div>

        {/* Weather comfort widget */}
        <div style={{ marginBottom: "16px" }}>
          <WeatherComfortWidget />
        </div>

        {/* Search Panel Card */}
        <RouteSearchCard
          searchPanelRef={searchPanelRef}
          fromInput={fromInput}
          toInput={toInput}
          setFromInput={(val) => {
            setFromInput(val);
            setSearchTriggered(false);
          }}
          setToInput={(val) => {
            setToInput(val);
            setSearchTriggered(false);
          }}
          uniqueCitiesList={uniqueCitiesList}
          onSearch={() => handlePerformSearch()}
          onSwap={handleSwap}
          isLocating={isLocating}
          onUseGPS={handleUseGPSLocation}
        />

        {/* Results Section */}
        <RouteResultsSection
          resultsPanelRef={resultsPanelRef}
          searchTriggered={searchTriggered}
          matchedRoute={matchedRoute}
          fromInput={fromInput}
          toInput={toInput}
          resolvedFrom={resolvedFromLabel}
          resolvedTo={resolvedToLabel}
          user={user}
          onOpenReportModal={handleOpenReportModal}
        />

        {/* Emergency Quick Bar & FAQ */}
        {/* <TransitFAQ /> */}

        {/* Bottom Report Problem Banner */}
        <BottomReportBanner
          onOpenReportModal={() => handleOpenReportModal(null)}
        />
      </div>

      {/* Problem Report Modal */}
      <DirectionsReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        modalBoxRef={modalBoxRef}
        user={user}
        limitChecking={limitChecking}
        limitReached={limitReached}
        reportingOption={reportingOption}
        resolvedFrom={resolvedFromLabel || fromInput}
        resolvedTo={resolvedToLabel || toInput}
      />
    </div>
    //================================== END MAIN CONTAINER =================================
  );
}
