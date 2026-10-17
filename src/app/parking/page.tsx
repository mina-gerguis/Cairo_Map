"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import {
  useParkingData,
  useParkingReportModal,
  useParkingSuggestModal,
} from "./hooks";

import {
  ParkingHero,
  ParkingAreasSlider,
  ParkingSearchCard,
  ParkingResultsSection,
  ParkingBottomBanner,
  ParkingReportModal,
  ParkingSuggestModal,
  ParkingLoading,
  ParkingLockState,
} from "./components";

import styles from "./parking.module.css";

export default function ParkingPage() {
  const { user } = useAuth();

  // Core Data & State Hook
  const {
    authLoading,
    loading,
    promoStatus,
    hasAccess,
    searchTerm,
    setSearchTerm,
    selectedArea,
    setSelectedArea,
    expandedParkingId,
    handleParkingClick,
    parkingData,
    filteredParking,
    areas,
  } = useParkingData();

  // Modal Hooks
  const reportModal = useParkingReportModal(user, parkingData);
  const suggestModal = useParkingSuggestModal(user, searchTerm, selectedArea);

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    if (loading || authLoading || !hasAccess) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      const elements = [
        sliderRef.current,
        searchPanelRef.current,
        resultsPanelRef.current,
      ].filter(Boolean);

      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.08,
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading, authLoading, hasAccess]);

  // Handle Area selection from slider
  const handleSelectArea = (area: string) => {
    setSelectedArea(area);
  };

  // 1. Loading Screen
  if (authLoading || loading) {
    return <ParkingLoading />;
  }

  // 2. Paywall Gate
  if (!hasAccess) {
    return <ParkingLockState user={user} headerRef={headerRef} />;
  }

  // 3. Authorized Main Dashboard
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Top Glow */}
      <div className={styles.ambientGlow} />

      {/* Hero Header with Navigation and Stats using PageHero */}
      <ParkingHero
        headerRef={headerRef}
        parkingCount={parkingData.length}
        areasCount={areas.length}
      />

      <div className={styles.contentContainer}>
        {/* Promotional Campaign Banner if Active */}
        {promoStatus.isOpen && promoStatus.offer && (
          <div style={{ marginTop: "16px" }}>
            <PromotionalPageBanner
              offer={promoStatus.offer}
              remainingDays={promoStatus.remainingDays}
            />
          </div>
        )}

        {/* Bento Quick Slider of Areas */}
        <ParkingAreasSlider
          sliderRef={sliderRef}
          areas={areas}
          parkingData={parkingData}
          selectedArea={selectedArea}
          onSelectArea={handleSelectArea}
        />

        {/* Spotlight Search & Filter Panel */}
        <ParkingSearchCard
          searchPanelRef={searchPanelRef}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedArea={selectedArea}
          onSelectedAreaChange={setSelectedArea}
          areas={areas}
        />

        {/* Parking Garages Accordion Directory */}
        <ParkingResultsSection
          resultsPanelRef={resultsPanelRef}
          parkings={filteredParking}
          expandedParkingId={expandedParkingId}
          onToggleParking={handleParkingClick}
          onReportParking={(parkingName) =>
            reportModal.handleOpenReportModal("parking", parkingName)
          }
          searchTerm={searchTerm}
          onOpenSuggestModal={(initialName) =>
            suggestModal.handleOpenSuggestModal(initialName)
          }
        />

        {/* Bottom Suggest & Report Callout Banner */}
        <ParkingBottomBanner
          onOpenSuggestModal={() => suggestModal.handleOpenSuggestModal()}
          onOpenReportModal={() => reportModal.handleOpenReportModal("general")}
        />
      </div>

      {/* Report Problem Modal */}
      <ParkingReportModal
        isOpen={reportModal.reportModalOpen}
        onClose={reportModal.handleCloseReportModal}
        user={user}
        reportTargetScope={reportModal.reportTargetScope}
        setReportTargetScope={reportModal.setReportTargetScope}
        reportSelectedParking={reportModal.reportSelectedParking}
        setReportSelectedParking={reportModal.setReportSelectedParking}
        reportParkingSearchQuery={reportModal.reportParkingSearchQuery}
        setReportParkingSearchQuery={reportModal.setReportParkingSearchQuery}
        showReportParkingList={reportModal.showReportParkingList}
        setShowReportParkingList={reportModal.setShowReportParkingList}
        filteredReportParking={reportModal.filteredReportParking}
        reportProblemType={reportModal.reportProblemType}
        setReportProblemType={reportModal.setReportProblemType}
        reportDetails={reportModal.reportDetails}
        setReportDetails={reportModal.setReportDetails}
        reportImageFile={reportModal.reportImageFile}
        reportImagePreview={reportModal.reportImagePreview}
        isDraggingImage={reportModal.isDraggingImage}
        setIsDraggingImage={reportModal.setIsDraggingImage}
        onImageSelect={reportModal.handleReportImageSelect}
        reportLoading={reportModal.reportLoading}
        reportUploading={reportModal.reportUploading}
        reportSuccess={reportModal.reportSuccess}
        reportError={reportModal.reportError}
        limitChecking={reportModal.limitChecking}
        limitReached={reportModal.limitReached}
        onSubmit={reportModal.handleSubmitReport}
      />

      {/* Suggest Garage Modal */}
      <ParkingSuggestModal
        isOpen={suggestModal.suggestModalOpen}
        onClose={suggestModal.handleCloseSuggestModal}
        user={user}
        areas={areas}
        suggestName={suggestModal.suggestName}
        setSuggestName={suggestModal.setSuggestName}
        suggestArea={suggestModal.suggestArea}
        setSuggestArea={suggestModal.setSuggestArea}
        suggestAddress={suggestModal.suggestAddress}
        setSuggestAddress={suggestModal.setSuggestAddress}
        suggestNearestMetro={suggestModal.suggestNearestMetro}
        setSuggestNearestMetro={suggestModal.setSuggestNearestMetro}
        suggestType={suggestModal.suggestType}
        setSuggestType={suggestModal.setSuggestType}
        suggestHourlyRate={suggestModal.suggestHourlyRate}
        setSuggestHourlyRate={suggestModal.setSuggestHourlyRate}
        suggestCapacity={suggestModal.suggestCapacity}
        setSuggestCapacity={suggestModal.setSuggestCapacity}
        suggestMapLink={suggestModal.suggestMapLink}
        setSuggestMapLink={suggestModal.setSuggestMapLink}
        suggestFeatures={suggestModal.suggestFeatures}
        onToggleFeature={suggestModal.toggleSuggestFeature}
        suggestNotes={suggestModal.suggestNotes}
        setSuggestNotes={suggestModal.setSuggestNotes}
        suggestImageFile={suggestModal.suggestImageFile}
        suggestImagePreview={suggestModal.suggestImagePreview}
        isDraggingSuggestImage={suggestModal.isDraggingSuggestImage}
        setIsDraggingSuggestImage={suggestModal.setIsDraggingSuggestImage}
        onImageSelect={suggestModal.handleSuggestImageSelect}
        suggestLoading={suggestModal.suggestLoading}
        suggestUploading={suggestModal.suggestUploading}
        suggestSuccess={suggestModal.suggestSuccess}
        suggestError={suggestModal.suggestError}
        suggestLimitChecking={suggestModal.suggestLimitChecking}
        suggestLimitReached={suggestModal.suggestLimitReached}
        onSubmit={suggestModal.handleSubmitSuggestion}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
