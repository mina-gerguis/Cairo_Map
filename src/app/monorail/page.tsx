"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import {
  useMonorailData,
  useMonorailCalculator,
  useMonorailReportModal,
} from "./hooks";
import {
  MonorailHeader,
  MonorailLinesSlider,
  MonorailRouteCalculator,
  MonorailLineExplorer,
  MonorailOverviewPanel,
  MonorailReportBanner,
  MonorailReportModal,
} from "./components";

export type {
  MonorailLineId,
  MonorailStation,
  MonorailStationDetail,
  MonorailLineConfig,
  MonorailRouteResult,
  MonorailRouteLeg,
  TrackerStationItem,
  ReportScope,
} from "./types";

export default function MonorailPage() {
  const { user } = useAuth();

  // Core Data & State Hook
  const data = useMonorailData();

  // Trip Route Calculator & GPS & Sharing Hook
  const calculator = useMonorailCalculator(data.allStationsList, data.stations);

  // Problem Reporting Modal Hook
  const reportModal = useMonorailReportModal(
    user,
    data.allStationsList,
    calculator.routeResult,
    calculator.selectedFrom,
    calculator.selectedTo
  );

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const reportBannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Entrance Animations
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
          { opacity: 1, y: 0, scale: 1, stagger: 0.08 },
          "-=0.2"
        );
      }
      if (searchPanelRef.current) {
        tl.fromTo(searchPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (detailsPanelRef.current) {
        tl.fromTo(detailsPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (mapPanelRef.current) {
        tl.fromTo(mapPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (reportBannerRef.current) {
        tl.fromTo(reportBannerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
    });

    return () => ctx.revert();
  }, []);

  // Modal Animation on Open
  useEffect(() => {
    if (reportModal.reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [reportModal.reportModalOpen]);

  // Handler for line selection with smooth scroll
  const handleSelectLine = (lineId: typeof data.selectedLine) => {
    data.setSelectedLine(lineId);
    if (detailsPanelRef.current) {
      detailsPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="main-container">
      {/* Header Banner */}
      <MonorailHeader headerRef={headerRef} />

      {/* Main Content Container */}
      <div className="container">
        {/* Top Lines Slider */}
        <MonorailLinesSlider
          sliderRef={sliderRef}
          lines={data.allLines}
          selectedLine={data.selectedLine}
          onSelectLine={handleSelectLine}
          stations={data.stations}
        />

        {/* Trip Route Calculator Panel */}
        <MonorailRouteCalculator
          panelRef={searchPanelRef}
          selectedFrom={calculator.selectedFrom}
          selectedTo={calculator.selectedTo}
          fromQuery={calculator.fromQuery}
          toQuery={calculator.toQuery}
          showFromList={calculator.showFromList}
          showToList={calculator.showToList}
          filteredFromStations={calculator.filteredFromStations}
          filteredToStations={calculator.filteredToStations}
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
          onFromQueryChange={(q) => {
            calculator.setFromQuery(q);
            calculator.setSelectedFrom(null);
          }}
          onToQueryChange={(q) => {
            calculator.setToQuery(q);
            calculator.setSelectedTo(null);
          }}
          onFromFocus={() => calculator.setShowFromList(true)}
          onFromBlur={() => calculator.setShowFromList(false)}
          onToFocus={() => calculator.setShowToList(true)}
          onToBlur={() => calculator.setShowToList(false)}
          onSwapStations={calculator.swapStations}
          onFindNearest={calculator.findNearestStation}
          locatingNearest={calculator.locatingNearest}
          nearestDistance={calculator.nearestDistance}
          routeResult={calculator.routeResult}
          isTripActive={calculator.isTripActive}
          currentStepIndex={calculator.currentStepIndex}
          trackerStationsList={calculator.trackerStationsList}
          copiedRoute={calculator.copiedRoute}
          whatsappShareUrl={calculator.whatsappShareUrl}
          onStartTrip={calculator.startTrip}
          onEndTrip={calculator.endTrip}
          onPrevStep={calculator.prevStep}
          onNextStep={calculator.nextStep}
          onShareRoute={calculator.handleShareRoute}
          onOpenReportModal={reportModal.handleOpenReportModal}
        />

        {/* Selected Line Explorer & Timeline Panel */}
        <MonorailLineExplorer
          panelRef={detailsPanelRef}
          selectedLineObj={data.selectedLineObj}
          allLines={data.allLines}
          selectedLine={data.selectedLine}
          onSelectLine={data.setSelectedLine}
          currentLineStations={data.currentLineStations}
          filteredCurrentLineStations={data.filteredCurrentLineStations}
          lineSearchQuery={data.lineSearchQuery}
          onSearchQueryChange={data.setLineSearchQuery}
          expandedStation={data.expandedStation}
          onToggleStation={data.toggleStationLandmarks}
          onOpenReportModal={(stationName) => reportModal.handleOpenReportModal(stationName)}
        />

        {/* Project Overview Panel */}
        <MonorailOverviewPanel panelRef={mapPanelRef} />

        {/* Bottom Report Problem Alert Box */}
        <MonorailReportBanner
          bannerRef={reportBannerRef}
          onOpenReportModal={() => reportModal.handleOpenReportModal()}
        />
      </div>

      {/* Report Problem Modal */}
      <MonorailReportModal
        isOpen={reportModal.reportModalOpen}
        onClose={reportModal.handleCloseReportModal}
        modalBoxRef={modalBoxRef}
        user={user}
        targetScope={reportModal.reportTargetScope}
        setTargetScope={reportModal.setReportTargetScope}
        selectedStation={reportModal.reportSelectedStation}
        setSelectedStation={reportModal.setReportSelectedStation}
        stationQuery={reportModal.reportStationSearchQuery}
        setStationQuery={reportModal.setReportStationSearchQuery}
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
        error={reportModal.reportError}
        loading={reportModal.reportLoading}
        uploading={reportModal.reportUploading}
        success={reportModal.reportSuccess}
        limitChecking={reportModal.limitChecking}
        limitReached={reportModal.limitReached}
        onSubmit={reportModal.handleSubmitReport}
        hasRouteResult={Boolean(calculator.routeResult)}
      />
    </div>
  );
}
