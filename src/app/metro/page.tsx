"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import {
  useMetroData,
  useMetroCalculator,
  useMetroReportModal,
} from "./hooks";
import {
  MetroHeader,
  MetroLinesSlider,
  MetroRouteCalculator,
  MetroLineExplorer,
  MetroMapSection,
  MetroReportBanner,
  MetroReportModal,
} from "./components";
import { LineId } from "./types";
import { METRO_LINES_LIST } from "./constants";


export type {
  LineId,
  Line3BranchId,
  StationInfo,
  MetroStation,
  MetroPriceTier,
  MetroLineConfig,
  RouteResult,
  ReportScope,
  MetroProblemOption,
} from "./types";

export default function MetroPage() {
  const { user } = useAuth();

  // Core Data & State Hook
  const data = useMetroData();

  // Trip Route Calculator, GPS & Step-by-step Tracker Hook
  const calculator = useMetroCalculator(
    data.allStations,
    data.adjacencyGraph,
    data.stationLinesMap,
    data.getTicketPrice
  );

  // Problem Reporting Modal Hook
  const reportModal = useMetroReportModal(
    user,
    data.allStations,
    calculator.result,
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
  const isFirstRender = useRef(true);

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

      const sections = [
        sliderRef.current,
        searchPanelRef.current,
        detailsPanelRef.current,
        mapPanelRef.current,
        reportBannerRef.current,
      ].filter(Boolean);

      if (sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out", delay: 0.1 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Line switch animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (detailsPanelRef.current) {
      gsap.fromTo(
        detailsPanelRef.current,
        { opacity: 0.45, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [data.explorerLine, data.line3ActiveBranch]);

  // Modal entrance animation
  useEffect(() => {
    if (reportModal.reportModalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.94, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" }
      );
    }
  }, [reportModal.reportModalOpen]);

  // Handler for line selection with smooth scroll into line explorer
  const handleSelectLine = (lineId: LineId) => {
    data.setExplorerLine(lineId);
    if (lineId === "line3") data.setLine3ActiveBranch("trunk");
    if (detailsPanelRef.current) {
      detailsPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="main-container">
      {/* Header Banner */}
      <MetroHeader headerRef={headerRef} />

      {/* Main Container */}
      <div className="container">
        {/* Top Lines Slider */}
        <MetroLinesSlider
          sliderRef={sliderRef}
          lines={METRO_LINES_LIST}
          selectedLine={data.explorerLine}
          onSelectLine={handleSelectLine}
          stations={data.stations}
        />

        {/* Trip Route Calculator Panel */}
        <MetroRouteCalculator
          panelRef={searchPanelRef}
          selectedFrom={calculator.selectedFrom}
          selectedTo={calculator.selectedTo}
          fromQuery={calculator.fromQuery}
          toQuery={calculator.toQuery}
          showFromList={calculator.showFromList}
          showToList={calculator.showToList}
          filteredFrom={calculator.filteredFrom}
          filteredTo={calculator.filteredTo}
          stations={data.stations}
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
            calculator.setShowFromList(true);
            calculator.setResult(null);
          }}
          onToQueryChange={(q) => {
            calculator.setToQuery(q);
            calculator.setSelectedTo(null);
            calculator.setShowToList(true);
            calculator.setResult(null);
          }}
          onFromFocus={() => calculator.setShowFromList(true)}
          onFromBlur={() => calculator.setShowFromList(false)}
          onToFocus={() => calculator.setShowToList(true)}
          onToBlur={() => calculator.setShowToList(false)}
          onSwapStations={calculator.swapStations}
          onFindNearest={calculator.findNearestStation}
          locatingNearest={calculator.locatingNearest}
          nearestDistance={calculator.nearestDistance}
          result={calculator.result}
          onFindRoute={calculator.handleFindRoute}
          isTripActive={calculator.isTripActive}
          currentStepIndex={calculator.currentStepIndex}
          copiedRoute={calculator.copiedRoute}
          whatsappShareUrl={calculator.whatsappShareUrl}
          onStartTrip={calculator.startTrip}
          onEndTrip={calculator.endTrip}
          onStepNext={calculator.nextStep}
          onShareRoute={calculator.handleShareRoute}
          onOpenReportModal={(stationName, fromRoute) =>
            reportModal.handleOpenReportModal(stationName, fromRoute)
          }
        />

        {/* Selected Line Explorer & Timeline Panel */}
        <MetroLineExplorer
          panelRef={detailsPanelRef}
          selectedLineObj={data.selectedLineObj}
          explorerLine={data.explorerLine}
          line3ActiveBranch={data.line3ActiveBranch}
          onSelectBranch={data.setLine3ActiveBranch}
          currentExplorerStations={data.currentExplorerStations}
          expandedStation={data.expandedStation}
          onToggleStation={data.toggleStation}
          onSwitchLine={(lineId) => {
            data.setExplorerLine(lineId);
            if (lineId === "line3") data.setLine3ActiveBranch("trunk");
          }}
          stationLinesMap={data.stationLinesMap}
          color={data.color}
          onOpenReportModal={(stationName) => reportModal.handleOpenReportModal(stationName)}
        />

        {/* Official Cairo Metro Map Download Section */}
        <MetroMapSection mapPanelRef={mapPanelRef} />

        {/* Bottom Report Problem Alert Box */}
        <MetroReportBanner
          bannerRef={reportBannerRef}
          onOpenReportModal={() => reportModal.handleOpenReportModal()}
        />
      </div>

      {/* Report Problem Modal */}
      <MetroReportModal
        isOpen={reportModal.reportModalOpen}
        onClose={reportModal.handleCloseReportModal}
        modalBoxRef={modalBoxRef}
        user={user}
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
        setProblemType={reportModal.setProblemType}
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
        selectedFrom={calculator.selectedFrom}
        selectedTo={calculator.selectedTo}
        routeResult={calculator.result}
        color={data.color}
        onSubmit={reportModal.handleSubmitReport}
      />
    </div>
  );
}
