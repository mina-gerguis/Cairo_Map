"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import { ReportScope } from "./types";
import { PROBLEM_TYPE_LABELS } from "./constants";
import { useRailwaysData } from "./hooks/useRailwaysData";

import RailwaysHero from "./components/RailwaysHero";
import RailwaysSlider from "./components/RailwaysSlider";
import RailwaysRouteDetails from "./components/RailwaysRouteDetails";
import RailwaysBookingSection from "./components/RailwaysBookingSection";
import RailwaysReportBanner from "./components/RailwaysReportBanner";
import RailwaysReportModal from "./components/RailwaysReportModal";
import RailwaysPaywall from "./components/RailwaysPaywall";
import RailwaysLoading from "./components/RailwaysLoading";
import styles from "./railways.module.css";

export default function RailwaysPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification (Silver, Gold, Mishwar, Admin, or Active Promotion)
  const promoStatus = isPageOpen("/railways");
  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
    promoStatus.isOpen ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired)
  );

  // Core Data & State Hook
  const {
    routes,
    loading: dataLoading,
    selectedRouteId,
    setSelectedRouteId,
    activeRoutesList,
    currentRoute,
    color,
    allStationsList,
    totalStationsCount,
  } = useRailwaysData(user, hasAccess);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<ReportScope>("general");
  const [reportSelectedStation, setReportSelectedStation] = useState("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState("");
  const [reportProblemType, setReportProblemType] = useState("schedule_error");
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const paywallRef = useRef<HTMLDivElement>(null);
  const paywallCardRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Entrance Animations
  useEffect(() => {
    if (!hasAccess) {
      const ctx = gsap.context(() => {
        if (paywallRef.current) {
          gsap.fromTo(
            paywallRef.current,
            { opacity: 0, y: -16 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );
        }
        if (paywallCardRef.current) {
          gsap.fromTo(
            paywallCardRef.current,
            { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)", delay: 0.08 }
          );
        }
      });
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const elements = [sliderRef.current, detailsPanelRef.current, bookingRef.current].filter(Boolean);
      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.08 }
        );
      }
    });

    return () => ctx.revert();
  }, [hasAccess, dataLoading]);

  // Route switch transition animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (detailsPanelRef.current) {
      gsap.fromTo(
        detailsPanelRef.current,
        { opacity: 0.45, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [selectedRouteId]);

  // Modal GSAP Animation
  useEffect(() => {
    if (reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [reportModalOpen]);

  // Image Selection Handler
  const handleReportImageSelect = (file: File | null) => {
    if (!file) {
      if (reportImagePreview) {
        URL.revokeObjectURL(reportImagePreview);
      }
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReportError("حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setReportError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportError("");
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  };

  // Open Report Modal Handler
  const handleOpenReportModal = async (stationName: string | null = null, fromRoute: boolean = false) => {
    setReportError("");
    setReportSuccess(false);
    setReportDetails("");
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    setReportImageFile(null);
    setReportImagePreview(null);

    if (stationName) {
      setReportTargetScope("station");
      setReportSelectedStation(stationName);
      setReportStationSearchQuery(stationName);
      setReportProblemType("station_info");
    } else if (fromRoute && currentRoute) {
      setReportTargetScope("route");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("schedule_error");
    } else {
      setReportTargetScope("general");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("schedule_error");
    }

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

  // Submit Report Handler
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (reportTargetScope === "station" && !reportSelectedStation) {
      setReportError("يرجى اختيار وتحديد المحطة المعنية أولاً.");
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أو الخطأ.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `railways_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const typeLabel = PROBLEM_TYPE_LABELS[reportProblemType] || "مشكلة في سكك حديد مصر";

      let scopeInfo = "";
      if (reportTargetScope === "route" && currentRoute) {
        scopeInfo = `📍 الخط المعني: ${currentRoute.name}\n⏱️ المدة المقدرة: ${currentRoute.duration}\n🚉 عدد المحطات الرئيسية: ${currentRoute.stops?.length || 0}`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في صفحة سكك حديد مصر (القطارات):\n${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}\n\n📝 تفاصيل المشكلة المبلغ عنها:\n${reportDetails.trim()}`;

      const reportTitle =
        reportTargetScope === "route" && currentRoute
          ? `مشكلة خط قطار: ${currentRoute.name}`
          : reportTargetScope === "station" && reportSelectedStation
          ? `مشكلة محطة قطار: ${reportSelectedStation}`
          : `مشكلة في سكك حديد مصر (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "سكك حديد مصر",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Send confirmation notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🚆",
            message: `شكراً لمساعدتنا في تدقيق وتحديث جدول رحلات سكك حديد مصر. تم استلام تقريرك بخصوص "${reportTitle}".`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to send notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        if (reportImagePreview) {
          URL.revokeObjectURL(reportImagePreview);
        }
        setReportImageFile(null);
        setReportImagePreview(null);
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting railway report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  // Loading Screen
  if (authLoading) {
    return <RailwaysLoading />;
  }

  // Paywall Screen for Non-Subscribers
  if (!hasAccess) {
    return (
      <RailwaysPaywall
        user={user}
        paywallRef={paywallRef}
        paywallCardRef={paywallCardRef}
      />
    );
  }

  // Main Page
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer}>
        {/* Back Link */}
        <div className={styles.backLinkNav}>
          <Link href="/" className={styles.backLink}>
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.2rem" }} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Hero Section */}
        <RailwaysHero
          headerRef={headerRef}
          routesCount={activeRoutesList.length}
          stationsCount={totalStationsCount}
        />

        {/* Promotional Banner */}
        {promoStatus.isOpen && promoStatus.offer && (
          <PromotionalPageBanner
            offer={promoStatus.offer}
            remainingDays={promoStatus.remainingDays}
          />
        )}

        {/* Bento Slider for Routes */}
        <RailwaysSlider
          sliderRef={sliderRef}
          routes={activeRoutesList}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
        />

        {/* Selected Route Details */}
        {currentRoute && (
          <RailwaysRouteDetails
            detailsPanelRef={detailsPanelRef}
            route={currentRoute}
            color={color}
            onOpenReport={() => handleOpenReportModal(null, true)}
          />
        )}

        {/* How to Book Tickets Section */}
        <RailwaysBookingSection
          bookingRef={bookingRef}
          themeColor={color}
        />

        {/* Report Problem Callout Banner */}
        <RailwaysReportBanner
          onOpenReport={() => handleOpenReportModal(null, false)}
        />
      </div>

      {/* Report Modal */}
      <RailwaysReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          if (!reportLoading) {
            setReportModalOpen(false);
            handleReportImageSelect(null);
          }
        }}
        modalBoxRef={modalBoxRef}
        user={user}
        currentRoute={currentRoute}
        allStationsList={allStationsList}
        targetScope={reportTargetScope}
        setTargetScope={setReportTargetScope}
        selectedStation={reportSelectedStation}
        setSelectedStation={setReportSelectedStation}
        stationQuery={reportStationSearchQuery}
        setStationQuery={setReportStationSearchQuery}
        problemType={reportProblemType}
        setProblemType={setReportProblemType}
        details={reportDetails}
        setDetails={setReportDetails}
        imageFile={reportImageFile}
        imagePreview={reportImagePreview}
        onImageSelect={handleReportImageSelect}
        error={reportError}
        loading={reportLoading}
        uploading={reportUploading}
        success={reportSuccess}
        limitChecking={limitChecking}
        limitReached={limitReached}
        onSubmit={handleSubmitReport}
      />

      <Footer />
    </div>
  );
}
