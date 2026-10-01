"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import { useAirportsData, useAirportsReportModal } from "./hooks";
import {
  AirportsHero,
  AirportsLoading,
  AirportsPaywall,
  AirportsTabs,
  AirportsSearchCard,
  AirportsResultsSection,
  AirportsTravelGuide,
  AirportsReportBanner,
  AirportsReportModal
} from "./components";
import styles from "./airports.module.css";

export type {
  Airport,
  AirportTab,
  AirportCategoryFilter,
  AirportsStats,
  AirportReportProblemType,
  AirportReportScope
} from "./types";

export default function AirportsPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification (Gold tier, Mishwar tier, Promo, or Admin)
  const promoStatus = isPageOpen("/airports");
  const isExpired =
    profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
      promoStatus.isOpen ||
      ((profile?.subscription_tier === "gold" ||
        profile?.subscription_tier === "mishwar") &&
        !isExpired)
  );

  // Core Data & State Hook
  const {
    airports,
    filteredAirports,
    loading: dataLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categoryCounts,
    expandedId,
    toggleExpand,
    activeTab,
    setActiveTab,
    stats
  } = useAirportsData(user, hasAccess);

  // Error & Feedback Reporting Hook
  const {
    reportModalOpen,
    openReportModal,
    closeReportModal,
    targetScope,
    setTargetScope,
    selectedAirportForReport,
    setSelectedAirportForReport,
    customAirportName,
    setCustomAirportName,
    airportQuery,
    setAirportQuery,
    reportProblemType,
    setReportProblemType,
    reportDetails,
    setReportDetails,
    reportImageFile,
    reportImagePreview,
    handleImageSelect,
    reportUploading,
    reportLoading,
    reportError,
    reportSuccess,
    limitReached,
    limitChecking,
    handleSubmitReport
  } = useAirportsReportModal(user, airports);

  // 1. Initial Authentication Loading State
  if (authLoading) {
    return <AirportsLoading />;
  }

  // 2. Paywall Gate for Non-Subscribers
  if (!hasAccess) {
    return <AirportsPaywall user={user} />;
  }

  // 3. Authorized Airports Main Directory
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Radial Top Glow */}
      <div className={styles.ambientGlow} />

      {/* Hero Header with Navigation and Statistics */}
      <AirportsHero
        totalAirports={stats.totalAirports}
        internationalCount={stats.internationalCount}
        domesticCount={stats.domesticCount}
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

        {/* Directory View vs. Travel Guide Tabs */}
        <AirportsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          airportsCount={stats.totalAirports}
        />

        {/* Callout Banner for Error / Data Reporting */}
        <AirportsReportBanner onOpenReport={() => openReportModal(null)} />

        {activeTab === "list" && (
          <>
            {/* Live Search & Category Filters */}
            <AirportsSearchCard
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categoryCounts={categoryCounts}
            />

            {/* Airports Accordion Results Section */}
            <AirportsResultsSection
              loading={dataLoading}
              airports={filteredAirports}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              onReport={airport => openReportModal(airport)}
            />
          </>
        )}

        {activeTab === "guide" && (
          /* Comprehensive Travel & Airport Guide Cards */
          <AirportsTravelGuide />
        )}
      </div>

      {/* Error / Problem Reporting Modal */}
      <AirportsReportModal
        isOpen={reportModalOpen}
        onClose={closeReportModal}
        user={user}
        airports={airports}
        targetScope={targetScope}
        setTargetScope={setTargetScope}
        selectedAirport={selectedAirportForReport}
        setSelectedAirport={setSelectedAirportForReport}
        customAirportName={customAirportName}
        setCustomAirportName={setCustomAirportName}
        airportQuery={airportQuery}
        setAirportQuery={setAirportQuery}
        problemType={reportProblemType}
        setProblemType={setReportProblemType}
        details={reportDetails}
        setDetails={setReportDetails}
        imageFile={reportImageFile}
        imagePreview={reportImagePreview}
        onImageSelect={handleImageSelect}
        error={reportError}
        loading={reportLoading}
        uploading={reportUploading}
        success={reportSuccess}
        limitChecking={limitChecking}
        limitReached={limitReached}
        onSubmit={handleSubmitReport}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
