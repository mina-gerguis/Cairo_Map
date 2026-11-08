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
  MonorailMapSection,
  MonorailReportBanner,
  MonorailReportModal,
} from "./components";
import { normalizeArabic } from "./utils";
import styles from "./monorail.module.css";
import Footer from "@/components/Footer/Footer";

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
  const isFirstRender = useRef(true);

  // Initial page entrance animation matching Metro page
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
        searchPanelRef.current,
        sliderRef.current,
        detailsPanelRef.current,
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
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    }
  }, [data.selectedLine]);

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

  // Handler for line selection with smooth scroll
  const handleSelectLine = (lineId: typeof data.selectedLine) => {
    data.setSelectedLine(lineId);
    if (detailsPanelRef.current) {
      detailsPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Radial Glow */}
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer}>
        {/* Header Hero Banner */}
        <MonorailHeader
          headerRef={headerRef}
          linesCount={data.allLines.length}
          stationsCount={data.allStationsList.length}
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
          stations={data.stations}
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
          onFromQueryChange={(q) => {
            calculator.setFromQuery(q);
            const trimmed = q.trim();
            const matched = trimmed
              ? data.allStationsList.find(
                  (s) => normalizeArabic(s.name) === normalizeArabic(trimmed)
                )
              : null;
            calculator.setSelectedFrom(matched ? matched.name : null);
            calculator.setShowFromList(true);
          }}
          onToQueryChange={(q) => {
            calculator.setToQuery(q);
            const trimmed = q.trim();
            const matched = trimmed
              ? data.allStationsList.find(
                  (s) => normalizeArabic(s.name) === normalizeArabic(trimmed)
                )
              : null;
            calculator.setSelectedTo(matched ? matched.name : null);
            calculator.setShowToList(true);
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
          onOpenReportModal={(stationName, fromRoute) =>
            reportModal.handleOpenReportModal(stationName, fromRoute)
          }
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

        {/* Official Transit & Monorail Map Section */}
        <MonorailMapSection mapPanelRef={mapPanelRef} />

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
        showProblemTypeDropdown={reportModal.showProblemTypeDropdown}
        setShowProblemTypeDropdown={reportModal.setShowProblemTypeDropdown}
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
        selectedFrom={calculator.selectedFrom}
        selectedTo={calculator.selectedTo}
        routeResult={calculator.routeResult}
        color={data.selectedLineObj?.color || "#3b82f6"}
      />

      <Footer />
    </div>
  );
}
