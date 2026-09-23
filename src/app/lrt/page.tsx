"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import { useLrtData, useLrtCalculator, useLrtReportModal } from "./hooks";
import {
  LrtLoading,
  LrtPaywall,
  LrtHeader,
  LrtSearchCard,
  LrtRouteCalculator,
  LrtLineExplorer,
  LrtPricingCard,
  LrtReportBanner,
  LrtReportModal,
} from "./components";

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
  const searchCardRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const lineExplorerRef = useRef<HTMLDivElement>(null);
  const pricingCardRef = useRef<HTMLDivElement>(null);
  const reportBannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Initial Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });

      if (headerRef.current) {
        tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0 });
      }

      const sections = [
        searchCardRef.current,
        calculatorRef.current,
        lineExplorerRef.current,
        pricingCardRef.current,
        reportBannerRef.current,
      ].filter(Boolean);

      if (sections.length > 0) {
        tl.fromTo(
          sections,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1 },
          "-=0.2"
        );
      }
    });

    return () => ctx.revert();
  }, [data.hasAccess, data.loading]);

  // Modal Entrance Animation
  useEffect(() => {
    if (reportModal.reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [reportModal.reportModalOpen]);

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
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "40px",
        backgroundColor: "var(--bgPrimary)",
      }}
    >
      {/* Header Banner */}
      <LrtHeader
        headerRef={headerRef}
        onOpenReportModal={() => reportModal.handleOpenReportModal()}
      />

      {/* Promotional Page Banner */}
      {data.promoStatus.isOpen && data.promoStatus.offer && (
        <div style={{ maxWidth: "600px", margin: "16px auto 0", padding: "0 20px" }}>
          <PromotionalPageBanner
            offer={data.promoStatus.offer}
            remainingDays={data.promoStatus.remainingDays}
          />
        </div>
      )}

      {/* Main Content Container */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "0 20px",
          direction: "rtl",
          textAlign: "right",
        }}
      >
        {/* Instant Search Card */}
        <LrtSearchCard
          panelRef={searchCardRef}
          searchContainerRef={data.searchContainerRef}
          searchQuery={data.searchQuery}
          onSearchQueryChange={data.setSearchQuery}
          isDropdownOpen={data.isDropdownOpen}
          setIsDropdownOpen={data.setIsDropdownOpen}
          searchResults={data.searchResults}
          onSelectStation={data.handleSelectSearchStation}
        />

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
          onSelectFrom={(name) => {
            calculator.setSelectedFrom(name);
            calculator.setFromQuery(name);
            calculator.setShowFromList(false);
          }}
          onSelectTo={(name) => {
            calculator.setSelectedTo(name);
            calculator.setToQuery(name);
            calculator.setShowToList(false);
          }}
          onFromQueryChange={(val) => {
            calculator.setFromQuery(val);
            calculator.setSelectedFrom(null);
            calculator.setShowFromList(true);
            calculator.setResult(null);
          }}
          onToQueryChange={(val) => {
            calculator.setToQuery(val);
            calculator.setSelectedTo(null);
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
          onStartTrip={calculator.startTrip}
          onEndTrip={calculator.endTrip}
          onNextStep={calculator.nextStep}
          onOpenReportModal={(stationName, fromRoute) =>
            reportModal.handleOpenReportModal(stationName, fromRoute)
          }
        />

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

        {/* Bottom Alert Banner to Report Issues */}
        <LrtReportBanner
          bannerRef={reportBannerRef}
          onOpenReportModal={() => reportModal.handleOpenReportModal()}
        />
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
      />
    </div>
  );
}
