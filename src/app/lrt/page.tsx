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

      if (sliderRef.current) {
        tl.fromTo(
          sliderRef.current.children,
          { opacity: 0, y: 15, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.06 },
          "-=0.2"
        );
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
    <div className={styles.pageWrapper}>
      {/* Electric Ambient Glow */}
      <div className={styles.ambientGlow} />

      {/* Modern Page Hero Banner */}
      <LrtHeader
        headerRef={headerRef}
        onOpenReportModal={() => reportModal.handleOpenReportModal()}
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

      {/* Main Content Container */}
      <div className={styles.contentContainer}>
        {/* Branch Quick Switcher Bento Cards */}
        <div className={styles.branchSliderSection}>
          <div ref={sliderRef} className={styles.branchSliderTrack}>
            {LRT_LINE_TABS.map((tab) => {
              const active = data.activeLine === tab.id;
              let icon = "🚄";
              let countText = "الشبكة كاملة";

              if (tab.id === "trunk") {
                icon = "🚊";
                countText = "6 محطات";
              } else if (tab.id === "capital") {
                icon = "🏛️";
                countText = "4 محطات";
              } else if (tab.id === "ramadan") {
                icon = "🏭";
                countText = "2 محطات";
              }

              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    data.setActiveLine(tab.id);
                    data.setExpandedStation(null);
                    // Scroll to explorer
                    if (lineExplorerRef.current) {
                      lineExplorerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`${styles.branchBentoCard} ${
                    active ? styles.branchBentoCardActive : ""
                  }`}
                  style={
                    {
                      "--card-accent": tab.color,
                      "--card-accent-glow": `${tab.color}40`,
                      "--card-accent-bg": `${tab.color}14`,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.branchCardHeader}>
                    <div className={styles.branchIconBadge}>
                      <span>{icon}</span>
                    </div>
                    <span className={styles.branchCardTag}>{countText}</span>
                  </div>
                  <h4 className={styles.branchCardTitle}>{tab.label}</h4>
                  <p className={styles.branchCardSubtitle}>{tab.title.split("(")[0].trim()}</p>
                </div>
              );
            })}
          </div>
        </div>

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
