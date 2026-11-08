"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer/Footer";
import { useLrtData, useLrtCalculator, useLrtReportModal } from "./hooks";
import {
  LrtLoading,
  LrtPaywall,
  LrtHeader,
  LrtLinesSlider,
  LrtRouteCalculator,
  LrtLineExplorer,
  LrtPricingCard,
  LrtMapSection,
  LrtReportBanner,
  LrtReportModal,
} from "./components";
import { normalizeArabic } from "./utils";
import styles from "./lrt.module.css";
import { LRT_LINE_TABS } from "./constants";

export type {
  LrtLineType,
  LrtExplorerTab,
  LrtStation,
  LrtStationDetail,
  LrtLineTabConfig,
  LrtRouteResult,
  ReportScope,
} from "./types";

export default function LrtPage() {
  // Core Data & State Hook
  const data = useLrtData();

  // Route Calculator & Trip Tracker Hook
  const calculator = useLrtCalculator(
    data.stations,
    data.ALL_LRT_STATIONS,
    data.LRT_MAIN_TRUNK,
    data.LRT_BRANCH_CAPITAL,
    data.LRT_BRANCH_RAMADAN
  );

  // Problem Reporting Modal Hook
  const reportModal = useLrtReportModal(
    data.user,
    data.allStationsList,
    calculator.result,
    calculator.selectedFrom,
    calculator.selectedTo
  );

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const lineExplorerRef = useRef<HTMLDivElement>(null);
  const pricingCardRef = useRef<HTMLDivElement>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const reportBannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Initial Entrance Animation matching Metro & Monorail
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const sections = [
        calculatorRef.current,
        sliderRef.current,
        lineExplorerRef.current,
        pricingCardRef.current,
        mapPanelRef.current,
        reportBannerRef.current,
      ].filter(Boolean);

      if (sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.1,
            clearProps: "transform",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [data.hasAccess, data.loading]);

  // Tab switch animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (lineExplorerRef.current) {
      gsap.fromTo(
        lineExplorerRef.current,
        { opacity: 0.45, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    }
  }, [data.activeLine]);

  // Modal Entrance Animation
  useEffect(() => {
    if (reportModal.reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [reportModal.reportModalOpen]);

  // Handler for tab select with smooth scroll
  const handleSelectTab = (tabId: typeof data.activeLine) => {
    data.setActiveLine(tabId);
    data.setExpandedStation(null);
    if (lineExplorerRef.current) {
      lineExplorerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. Auth Loading State
  if (data.authLoading) {
    return <LrtLoading message="جاري التحقق من التفاصيل ..." />;
  }

  // 2. Paywall State
  if (!data.hasAccess) {
    return <LrtPaywall user={data.user} />;
  }

  // 3. Data Loading State
  if (data.loading) {
    return <LrtLoading message="جاري تحميل البيانات..." />;
  }

  // 4. Main Page View
  return (
    <div className={styles.pageWrapper}>
      {/* Electric Ambient Glow */}
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer}>
        {/* Modern Page Hero Banner */}
        <LrtHeader
          headerRef={headerRef}
          linesCount={LRT_LINE_TABS.length}
          stationsCount={data.allStationsList.length}
        />

        {/* Promotional Page Banner */}
        {data.promoStatus.isOpen && data.promoStatus.offer && (
          <div style={{ maxWidth: "780px", margin: "16px auto 0", padding: "0 16px" }}>
            <PromotionalPageBanner
              offer={data.promoStatus.offer}
              remainingDays={data.promoStatus.remainingDays}
            />
          </div>
        )}

        {/* Route Calculator & Active Trip Tracker */}
        <LrtRouteCalculator
          panelRef={calculatorRef}
          selectedFrom={calculator.selectedFrom}
          selectedTo={calculator.selectedTo}
          fromQuery={calculator.fromQuery}
          toQuery={calculator.toQuery}
          showFromList={calculator.showFromList}
          showToList={calculator.showToList}
          filteredFrom={calculator.filteredFrom}
          filteredTo={calculator.filteredTo}
          stations={data.allStationsList}
          onSelectFrom={(name) => {
            calculator.setSelectedFrom(name || null);
            calculator.setFromQuery(name || "");
            calculator.setShowFromList(false);
          }}
          onSelectTo={(name) => {
            calculator.setSelectedTo(name || null);
            calculator.setToQuery(name || "");
            calculator.setShowToList(false);
          }}
          onFromQueryChange={(val) => {
            calculator.setFromQuery(val);
            const trimmed = val.trim();
            const matched = trimmed
              ? data.allStationsList.find(
                  (s) => normalizeArabic(s.name) === normalizeArabic(trimmed)
                )
              : null;
            calculator.setSelectedFrom(matched ? matched.name : null);
            calculator.setShowFromList(true);
            calculator.setResult(null);
          }}
          onToQueryChange={(val) => {
            calculator.setToQuery(val);
            const trimmed = val.trim();
            const matched = trimmed
              ? data.allStationsList.find(
                  (s) => normalizeArabic(s.name) === normalizeArabic(trimmed)
                )
              : null;
            calculator.setSelectedTo(matched ? matched.name : null);
            calculator.setShowToList(true);
            calculator.setResult(null);
          }}
          onFromFocus={() => calculator.setShowFromList(true)}
          onFromBlur={() => calculator.setShowFromList(false)}
          onToFocus={() => calculator.setShowToList(true)}
          onToBlur={() => calculator.setShowToList(false)}
          onSwapStations={calculator.swapStations}
          onFindRoute={calculator.handleFind}
          result={calculator.result}
          isTripActive={calculator.isTripActive}
          currentStepIndex={calculator.currentStepIndex}
          copiedRoute={calculator.copiedRoute}
          whatsappShareUrl={calculator.whatsappShareUrl}
          onStartTrip={calculator.startTrip}
          onEndTrip={calculator.endTrip}
          onPrevStep={calculator.prevStep}
          onNextStep={calculator.nextStep}
          onShareRoute={calculator.handleShareRoute}
          onOpenReportModal={(stationName, fromRoute) =>
            reportModal.handleOpenReportModal(stationName, fromRoute)
          }
        />

        {/* Lines / Branches Bento Slider
        <LrtLinesSlider
          sliderRef={sliderRef}
          tabs={LRT_LINE_TABS}
          selectedTab={data.activeLine}
          onSelectTab={handleSelectTab}
          stations={data.allStationsList}
        /> */}

        {/* Line Explorer & Station Timeline */}
        <LrtLineExplorer
          panelRef={lineExplorerRef}
          activeLine={data.activeLine}
          onSelectTab={(tab) => {
            data.setActiveLine(tab);
            data.setExpandedStation(null);
          }}
          stations={data.allStationsList}
          expandedStation={data.expandedStation}
          onToggleStation={data.toggleStation}
          onOpenReportModal={(stationName) =>
            reportModal.handleOpenReportModal(stationName)
          }
        />

        {/* Official Approved Fares Legend */}
        <LrtPricingCard cardRef={pricingCardRef} />

        {/* Official Cairo LRT Map Section */}
        <LrtMapSection mapPanelRef={mapPanelRef} />

        {/* Bottom Alert Banner to Report Issues
        <LrtReportBanner
          bannerRef={reportBannerRef}
          onOpenReportModal={() => reportModal.handleOpenReportModal()}
        /> */}
      </div>

      {/* Report Problem Modal */}
      <LrtReportModal
        isOpen={reportModal.reportModalOpen}
        onClose={reportModal.handleCloseReportModal}
        modalBoxRef={modalBoxRef}
        user={data.user}
        targetScope={reportModal.reportTargetScope}
        setTargetScope={reportModal.setReportTargetScope}
        selectedStation={reportModal.reportSelectedStation}
        setSelectedStation={reportModal.setReportSelectedStation}
        stationSearchQuery={reportModal.reportStationSearchQuery}
        setStationSearchQuery={reportModal.setReportStationSearchQuery}
        showStationList={reportModal.showReportStationList}
        setShowStationList={reportModal.setShowReportStationList}
        filteredStations={reportModal.filteredReportStations}
        problemType={reportModal.reportProblemType}
        setProblemType={reportModal.setReportProblemType}
        showProblemTypeDropdown={reportModal.showProblemTypeDropdown}
        setShowProblemTypeDropdown={reportModal.setShowProblemTypeDropdown}
        details={reportModal.reportDetails}
        setDetails={reportModal.setReportDetails}
        imageFile={reportModal.reportImageFile}
        imagePreview={reportModal.reportImagePreview}
        isDraggingImage={reportModal.isDraggingImage}
        setIsDraggingImage={reportModal.setIsDraggingImage}
        onImageSelect={reportModal.handleReportImageSelect}
        loading={reportModal.reportLoading}
        uploading={reportModal.reportUploading}
        success={reportModal.reportSuccess}
        error={reportModal.reportError}
        limitChecking={reportModal.limitChecking}
        limitReached={reportModal.limitReached}
        onSubmit={reportModal.handleSubmitReport}
        selectedFrom={calculator.selectedFrom}
        selectedTo={calculator.selectedTo}
        routeResult={calculator.result}
        color="#06b6d4"
      />

      <Footer />
    </div>
  );
}
