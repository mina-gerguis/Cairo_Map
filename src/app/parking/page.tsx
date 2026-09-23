"use client";

import React from "react";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import {
  useParkingData,
  useParkingReportModal,
  useParkingSuggestModal,
} from "./hooks";
import {
  ParkingLoading,
  ParkingLockState,
  ParkingHeader,
  ParkingActions,
  ParkingSearchFilter,
  ParkingGarageList,
  ParkingReportModal,
  ParkingSuggestModal,
} from "./components";

export default function ParkingPage() {
  const {
    user,
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

  const reportModal = useParkingReportModal(user, parkingData);
  const suggestModal = useParkingSuggestModal(user, searchTerm, selectedArea);

  if (authLoading || loading) {
    return <ParkingLoading />;
  }

  if (!hasAccess) {
    return <ParkingLockState user={user} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "50px",
        backgroundColor: "var(--bgPrimary)",
        direction: "rtl",
      }}
    >
      {/* Animation Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .metro-animate-fade { animation: fadeIn 0.35s ease forwards; }
          .metro-animate-slide-up { animation: fadeIn 0.45s ease-out forwards; }
          .metro-delay-100 { animation-delay: 0.1s; }
          .metro-delay-150 { animation-delay: 0.15s; }
          .metro-delay-200 { animation-delay: 0.2s; }
          .metro-delay-250 { animation-delay: 0.25s; }
          .metro-delay-300 { animation-delay: 0.3s; }
          .metro-delay-350 { animation-delay: 0.35s; }
          .metro-delay-400 { animation-delay: 0.4s; }
        `,
        }}
      />

      {/* Header Banner */}
      <ParkingHeader>
        <ParkingActions
          onOpenSuggestModal={() => suggestModal.handleOpenSuggestModal()}
          onOpenReportModal={() => reportModal.handleOpenReportModal("general")}
        />
      </ParkingHeader>

      {/* Promotional Banner */}
      {promoStatus.isOpen && promoStatus.offer && (
        <div style={{ maxWidth: "600px", margin: "16px auto 0", padding: "0 20px" }}>
          <PromotionalPageBanner
            offer={promoStatus.offer}
            remainingDays={promoStatus.remainingDays}
          />
        </div>
      )}

      {/* Main Content Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        {/* Search & Area Filter */}
        <ParkingSearchFilter
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedArea={selectedArea}
          onSelectedAreaChange={setSelectedArea}
          areas={areas}
        />

        {/* Garage List or Empty State */}
        <ParkingGarageList
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
    </div>
  );
}
