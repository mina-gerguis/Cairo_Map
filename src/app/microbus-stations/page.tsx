"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { isPageOpenByPromotion } from "@/lib/promotions";
import { supabase } from "@/lib/supabase";
import { RouteInteraction } from "./types";

import { useMicrobusData } from "./hooks/useMicrobusData";
import MicrobusHero from "./components/MicrobusHero";
import MicrobusStationsSlider from "./components/MicrobusStationsSlider";
import MicrobusSearchCard from "./components/MicrobusSearchCard";
import MicrobusResultsSection from "./components/MicrobusResultsSection";
import MicrobusBottomBanner from "./components/MicrobusBottomBanner";
import MicrobusReportModal from "./components/MicrobusReportModal";
import MicrobusMissingModal from "./components/MicrobusMissingModal";
import MicrobusSuccessModal from "./components/MicrobusSuccessModal";
import MicrobusPaywall from "./components/MicrobusPaywall";
import MicrobusLoading from "./components/MicrobusLoading";
import styles from "./microbus.module.css";
import Footer from "@/components/Footer";

export default function MicrobusStationsPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification
  const promoStatus = isPageOpen("/microbus-stations");
  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
    promoStatus.isOpen ||
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired)
  );

  // Core Data & State Hook
  const {
    stations,
    loading: dataLoading,
    totalLines,
    filteredStations,
    selectedStation,
    setSelectedStation,
    destinationQuery,
    setDestinationQuery,
    voteOnRoute,
    getRouteVotes,
    setInteractions,
  } = useMicrobusData(user, hasAccess);

  // Accordion UI State
  const [expandedStationId, setExpandedStationId] = useState<string | null>(null);
  const [expandedRouteKey, setExpandedRouteKey] = useState<string | null>(null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingStationName, setReportingStationName] = useState("");
  const [reportingRouteDestination, setReportingRouteDestination] = useState("");
  const [reportReason, setReportReason] = useState<"fare" | "via" | "location" | "other">("fare");
  const [reportComment, setReportComment] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Missing Route Report Modal State
  const [missingRouteModalOpen, setMissingRouteModalOpen] = useState(false);
  const [missingStationName, setMissingStationName] = useState("");
  const [missingDestination, setMissingDestination] = useState("");
  const [missingFare, setMissingFare] = useState("");
  const [missingNotes, setMissingNotes] = useState("");
  const [submittingMissingRoute, setSubmittingMissingRoute] = useState(false);

  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const missingModalBoxRef = useRef<HTMLDivElement>(null);
  const paywallRef = useRef<HTMLDivElement>(null);
  const paywallCardRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const elements = [sliderRef.current, searchPanelRef.current, resultsPanelRef.current].filter(Boolean);
      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.08 }
        );
      }
    });

    return () => ctx.revert();
  }, [dataLoading]);

  // Modal GSAP Pop Animations
  useEffect(() => {
    if (reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [reportModalOpen]);

  useEffect(() => {
    if (missingRouteModalOpen && missingModalBoxRef.current) {
      gsap.fromTo(
        missingModalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [missingRouteModalOpen]);

  // Reset expanded route on filter changes
  useEffect(() => {
    setExpandedRouteKey(null);
  }, [destinationQuery, selectedStation]);

  // Handler: Station selection from slider or dropdown
  const handleSelectStation = (stationName: string) => {
    setSelectedStation(stationName);
    setDestinationQuery("");
    if (stationName && stationName !== "all") {
      setExpandedStationId(stationName);
    } else {
      setExpandedStationId(null);
    }
  };

  // Handler: Open Report Modal
  const handleOpenReportModal = async (stationName: string, destination: string) => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً للإبلاغ عن مشكلة.");
      return;
    }
    setReportingStationName(stationName);
    setReportingRouteDestination(destination);
    setReportReason("fare");
    setReportComment("");
    setReportModalOpen(true);

    setLimitChecking(true);
    try {
      const reached = await isFeedbackLimitReached(user.id);
      setLimitReached(reached);
    } catch (e) {
      console.error("Error checking feedback limit:", e);
    } finally {
      setLimitChecking(false);
    }
  };

  // Handler: Open Missing Route Modal
  const handleOpenMissingRouteModal = async () => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً للإبلاغ عن خط غير مدرج.");
      return;
    }
    setMissingStationName(selectedStation && selectedStation !== "all" ? selectedStation : "");
    setMissingDestination("");
    setMissingFare("");
    setMissingNotes("");
    setMissingRouteModalOpen(true);

    setLimitChecking(true);
    try {
      const reached = await isFeedbackLimitReached(user.id);
      setLimitReached(reached);
    } catch (e) {
      console.error("Error checking feedback limit:", e);
    } finally {
      setLimitChecking(false);
    }
  };

  // Handler: Submit Problem Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    // Check limit dynamically before submitting to prevent bypassing
    try {
      const reached = await isFeedbackLimitReached(user.id);
      if (reached) {
        setLimitReached(true);
        alert("لقد وصلت للحد الأقصى المسموح به (5 بلاغات معلقة). يرجى انتظار رد الإدارة على بلاغاتك السابقة قبل تقديم بلاغات جديدة.");
        return;
      }
    } catch (err) {
      console.error("Error checking feedback limit:", err);
    }

    setSubmittingReport(true);
    try {
      const payload = {
        user_id: user.id,
        station_name: reportingStationName,
        route_destination: reportingRouteDestination,
        interaction_type: "report",
        report_reason: reportReason,
        comment: reportComment,
      };

      const { data, error } = await supabase
        .from("route_interactions")
        .insert([payload])
        .select();

      if (error) {
        alert("فشل إرسال البلاغ، يرجى المحاولة مرة أخرى.");
      } else {
        if (data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
        setReportModalOpen(false);
        setSuccessMessage("شكراً لك! تم إرسال البلاغ بنجاح وجاري مراجعته من قبل الإدارة لتصحيح البيانات.");
        setSuccessModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handler: Submit Missing Route
  const handleMissingRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) {
      alert("يرجى تسجيل الدخول أولاً للإبلاغ عن خط غير موجود.");
      return;
    }
    if (!missingStationName.trim() || !missingDestination.trim()) {
      alert("يرجى إدخال اسم الموقف والوجهة المطلوبة.");
      return;
    }

    // Check limit dynamically before submitting to prevent bypassing
    try {
      const reached = await isFeedbackLimitReached(user.id);
      if (reached) {
        setLimitReached(true);
        alert("لقد وصلت للحد الأقصى المسموح به (5 بلاغات معلقة). يرجى انتظار رد الإدارة على بلاغاتك السابقة قبل تقديم بلاغات جديدة.");
        return;
      }
    } catch (err) {
      console.error("Error checking feedback limit:", err);
    }

    setSubmittingMissingRoute(true);
    try {
      const payload = {
        user_id: user.id,
        station_name: missingStationName.trim(),
        route_destination: missingDestination.trim(),
        interaction_type: "report",
        report_reason: "other",
        comment: `[خط غير موجود في الدليل] الأجرة المقترحة: ${missingFare.trim() || "غير محددة"} | التفاصيل/الملاحظات: ${missingNotes.trim() || "لا يوجد"}`,
      };

      const { data, error } = await supabase
        .from("route_interactions")
        .insert([payload])
        .select();

      if (error) {
        alert("فشل إرسال البلاغ، يرجى المحاولة مرة أخرى.");
      } else {
        if (data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
        setMissingRouteModalOpen(false);
        setMissingStationName("");
        setMissingDestination("");
        setMissingFare("");
        setMissingNotes("");
        setSuccessMessage("شكراً لك! تم إرسال معلومات الخط بنجاح للإدارة وجاري مراجعته وإضافته للدليل.");
        setSuccessModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to submit missing route report:", err);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setSubmittingMissingRoute(false);
    }
  };

  // 1. Loading Screen
  if (authLoading) {
    return <MicrobusLoading />;
  }

  // 2. Paywall Screen
  if (!hasAccess) {
    return (
      <MicrobusPaywall
        user={user}
        paywallRef={paywallRef}
        paywallCardRef={paywallCardRef}
      />
    );
  }

  // 3. Main Dashboard Screen
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer}>
        {/* Hero Banner */}
        <MicrobusHero
          headerRef={headerRef}
          stationsCount={stations.length}
          linesCount={totalLines.length}
        />

        {/* Bento Quick Slider */}
        <MicrobusStationsSlider
          sliderRef={sliderRef}
          stations={stations}
          totalLinesCount={totalLines.length}
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
        />

        {/* Spotlight Search & Filter Panel */}
        <MicrobusSearchCard
          searchPanelRef={searchPanelRef}
          stations={stations}
          selectedStation={selectedStation}
          onStationChange={handleSelectStation}
          destinationQuery={destinationQuery}
          onDestinationChange={setDestinationQuery}
        />

        {/* Stations & Routes Results Section */}
        <MicrobusResultsSection
          resultsPanelRef={resultsPanelRef}
          loading={dataLoading}
          stations={stations}
          filteredStations={filteredStations}
          selectedStation={selectedStation}
          destinationQuery={destinationQuery}
          expandedStationId={expandedStationId}
          onToggleStation={id => setExpandedStationId(prev => (prev === id ? null : id))}
          expandedRouteKey={expandedRouteKey}
          onToggleRoute={key => setExpandedRouteKey(prev => (prev === key ? null : key))}
          getRouteVotes={getRouteVotes}
          onVoteRoute={(stationName, dest, type) => {
            if (!user) {
              alert("يرجى تسجيل الدخول أولاً للتمكن من تقييم الخطوط.");
              return;
            }
            voteOnRoute(stationName, dest, type);
          }}
          onOpenReport={handleOpenReportModal}
        />

        {/* Missing Route Callout Banner */}
        <MicrobusBottomBanner
          onOpenMissingRouteModal={handleOpenMissingRouteModal}
        />
      </div>

      {/* Problem Report Modal */}
      <MicrobusReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        modalBoxRef={modalBoxRef}
        reportingStationName={reportingStationName}
        reportingRouteDestination={reportingRouteDestination}
        reportReason={reportReason}
        setReportReason={setReportReason}
        reportComment={reportComment}
        setReportComment={setReportComment}
        onSubmit={handleReportSubmit}
        submitting={submittingReport}
        limitReached={limitReached}
        limitChecking={limitChecking}
      />

      {/* Missing Route Modal */}
      <MicrobusMissingModal
        isOpen={missingRouteModalOpen}
        onClose={() => setMissingRouteModalOpen(false)}
        missingModalBoxRef={missingModalBoxRef}
        missingStationName={missingStationName}
        setMissingStationName={setMissingStationName}
        missingDestination={missingDestination}
        setMissingDestination={setMissingDestination}
        missingFare={missingFare}
        setMissingFare={setMissingFare}
        missingNotes={missingNotes}
        setMissingNotes={setMissingNotes}
        onSubmit={handleMissingRouteSubmit}
        submitting={submittingMissingRoute}
        limitReached={limitReached}
        limitChecking={limitChecking}
      />

      {/* Success Notification Modal */}
      <MicrobusSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
      />
      
      <Footer />
    </div>

  );
}
