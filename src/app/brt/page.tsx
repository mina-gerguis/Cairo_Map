"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { isPageOpenByPromotion } from "@/lib/promotions";
import { supabase } from "@/lib/supabase";
import { RouteInteraction } from "./types";

import { useBrtData } from "./hooks/useBrtData";
import BrtHero from "./components/BrtHero";
import BrtStationsSlider from "./components/BrtStationsSlider";
import BrtSearchCard from "./components/BrtSearchCard";
import BrtResultsSection from "./components/BrtResultsSection";
import BrtBottomBanner from "./components/BrtBottomBanner";
import BrtReportModal from "./components/BrtReportModal";
import BrtMissingModal from "./components/BrtMissingModal";
import BrtSuccessModal from "./components/BrtSuccessModal";
import BrtPaywall from "./components/BrtPaywall";
import BrtLoading from "./components/BrtLoading";
import styles from "./brt.module.css";
import Footer from "@/components/Footer/Footer";

export default function BrtPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification (Public/Open access by default)
  const promoStatus = isPageOpen ? isPageOpen("/brt") : { isOpen: true };
  const hasAccess = true;

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
  } = useBrtData(user, hasAccess);

  // Accordion UI State
  const [expandedStationId, setExpandedStationId] = useState<string | null>(null);
  const [expandedRouteKey, setExpandedRouteKey] = useState<string | null>(null);

  // Report Modal State (Alike Metro, Monorail, LRT)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<import("./types").BrtReportScope>("general");
  const [reportSelectedStation, setReportSelectedStation] = useState("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState("");
  const [showReportStationList, setShowReportStationList] = useState(false);
  const [reportRouteDestination, setReportRouteDestination] = useState("");
  const [reportProblemType, setReportProblemType] = useState("fare");
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
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
  const bannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const missingModalBoxRef = useRef<HTMLDivElement>(null);

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

    setTimeout(() => {
      const targetId = stationName === "all" ? "stations-results-section" : `station-${stationName}`;
      const targetEl = document.getElementById(targetId) || resultsPanelRef.current;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const filteredReportStations = React.useMemo(() => {
    const q = (reportStationSearchQuery || "").trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.landmarks && s.landmarks.some((l) => l.toLowerCase().includes(q)))
    );
  }, [reportStationSearchQuery, stations]);

  const handleReportImageSelect = React.useCallback((file: File | null) => {
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    if (!file) {
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  }, [reportImagePreview]);

  // Handler: Open Report Modal (Matching Metro, Monorail, LRT)
  const handleOpenReportModal = async (stationName: string = "", destination: string = "") => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً للإبلاغ عن مشكلة.");
      return;
    }

    const defaultStation = stationName || (selectedStation !== "all" ? selectedStation : "");
    if (destination) {
      setReportTargetScope("route");
    } else if (defaultStation) {
      setReportTargetScope("station");
    } else {
      setReportTargetScope("general");
    }

    setReportSelectedStation(defaultStation);
    setReportStationSearchQuery(defaultStation);
    setShowReportStationList(false);
    setReportRouteDestination(destination || "");
    setReportProblemType("fare");
    setShowProblemTypeDropdown(false);
    setReportDetails("");
    setReportImageFile(null);
    setReportImagePreview(null);
    setReportSuccess(false);
    setReportError("");
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

  // Handler: Submit Problem Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أولاً.");
      return;
    }

    if (reportTargetScope === "station" && !reportSelectedStation) {
      setReportError("يرجى تحديد المحطة المعنية بالبلاغ.");
      return;
    }

    try {
      const reached = await isFeedbackLimitReached(user.id);
      if (reached) {
        setLimitReached(true);
        setReportError("لقد وصلت للحد الأقصى المسموح به (5 بلاغات معلقة).");
        return;
      }
    } catch (err) {
      console.error("Error checking feedback limit:", err);
    }

    setReportLoading(true);
    setReportError("");

    try {
      let uploadedImageUrl: string | null = null;

      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop();
        const fileName = `brt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("feedback-images")
          .upload(filePath, reportImageFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("feedback-images")
            .getPublicUrl(filePath);
          uploadedImageUrl = publicUrlData?.publicUrl || null;
        }
        setReportUploading(false);
      }

      const problemOpt = (await import("./constants")).BRT_PROBLEM_OPTIONS.find((o) => o.id === reportProblemType);
      const categoryLabel = problemOpt?.title || reportProblemType;

      const payload = {
        user_id: user.id,
        station_name:
          reportTargetScope === "general"
            ? "عام / شبكة BRT"
            : reportSelectedStation || "غير محدد",
        route_destination:
          reportTargetScope === "route"
            ? reportRouteDestination || "مسار BRT"
            : "محطة الأتوبيس الترددي",
        interaction_type: "report",
        report_reason: reportProblemType,
        comment: `[الأتوبيس الترددي BRT - ${categoryLabel}] ${reportDetails}${
          uploadedImageUrl ? `\n[مرفق صورة]: ${uploadedImageUrl}` : ""
        }`,
      };

      const { data, error: insertError } = await supabase
        .from("route_interactions")
        .insert([payload])
        .select();

      if (insertError) {
        setReportError("فشل إرسال البلاغ، يرجى المحاولة مرة أخرى.");
      } else {
        if (data && data.length > 0) {
          setInteractions((prev) => [...prev, data[0] as RouteInteraction]);
        }
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
        }, 2200);
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
      setReportError("حدث خطأ غير متوقع أثناء إرسال البلاغ.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  // Handler: Submit Missing Route
  const handleMissingRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) {
      alert("يرجى تسجيل الدخول أولاً لاقتراح مسار جديد.");
      return;
    }
    if (!missingStationName.trim() || !missingDestination.trim()) {
      alert("يرجى إدخال اسم المحطة والوجهة المطلوبة.");
      return;
    }

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
        comment: `[محطة/مسار BRT مقترح] الأجرة المقترحة: ${missingFare.trim() || "غير محددة"} | التفاصيل/الملاحظات: ${missingNotes.trim() || "لا يوجد"}`,
      };

      const { data, error } = await supabase
        .from("route_interactions")
        .insert([payload])
        .select();

      if (error) {
        alert("فشل إرسال الاقتراح، يرجى المحاولة مرة أخرى.");
      } else {
        if (data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
        setMissingRouteModalOpen(false);
        setMissingStationName("");
        setMissingDestination("");
        setMissingFare("");
        setMissingNotes("");
        setSuccessMessage("شكراً لك! تم إرسال معلومات المحطة بنجاح للإدارة وجاري مراجعتها وإضافتها للدليل.");
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
  if (authLoading || (dataLoading && stations.length === 0)) {
    return <BrtLoading />;
  }

  // 2. Main Dashboard Screen
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer}>
        {/* Hero Banner */}
        <BrtHero
          headerRef={headerRef}
          stationsCount={stations.length}
          linesCount={totalLines.length}
        />

        {/* Bento Quick Slider */}
        <BrtStationsSlider
          sliderRef={sliderRef}
          stations={stations}
          totalLinesCount={totalLines.length}
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
        />

        {/* Spotlight Search & Filter Panel */}
        <BrtSearchCard
          searchPanelRef={searchPanelRef}
          stations={stations}
          selectedStation={selectedStation}
          onStationChange={handleSelectStation}
          destinationQuery={destinationQuery}
          onDestinationChange={setDestinationQuery}
        />

        {/* Stations & Routes Results Section */}
        <BrtResultsSection
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

        {/* Problem Report Callout Banner */}
        <BrtBottomBanner
          bannerRef={bannerRef}
          onOpenReportModal={() => handleOpenReportModal()}
        />
      </div>

      {/* Problem Report Modal (Matching Metro, Monorail, LRT) */}
      <BrtReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        modalBoxRef={modalBoxRef}
        user={user}
        targetScope={reportTargetScope}
        setTargetScope={setReportTargetScope}
        selectedStation={reportSelectedStation}
        setSelectedStation={setReportSelectedStation}
        stationSearchQuery={reportStationSearchQuery}
        setStationSearchQuery={setReportStationSearchQuery}
        showStationList={showReportStationList}
        setShowStationList={setShowReportStationList}
        filteredStations={filteredReportStations}
        reportingRouteDestination={reportRouteDestination}
        setReportingRouteDestination={setReportRouteDestination}
        problemType={reportProblemType}
        setProblemType={setReportProblemType}
        showProblemTypeDropdown={showProblemTypeDropdown}
        setShowProblemTypeDropdown={setShowProblemTypeDropdown}
        details={reportDetails}
        setDetails={setReportDetails}
        imageFile={reportImageFile}
        imagePreview={reportImagePreview}
        isDraggingImage={isDraggingImage}
        setIsDraggingImage={setIsDraggingImage}
        onImageSelect={handleReportImageSelect}
        loading={reportLoading}
        uploading={reportUploading}
        success={reportSuccess}
        error={reportError}
        limitChecking={limitChecking}
        limitReached={limitReached}
        color="#e11d48"
        onSubmit={handleReportSubmit}
      />

      {/* Missing Route Modal */}
      <BrtMissingModal
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
      <BrtSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
      />

      <Footer />
    </div>
  );
}
