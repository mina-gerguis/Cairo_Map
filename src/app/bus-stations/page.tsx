"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import { useBusStationsData, useBusStationsReportModal } from "./hooks";
import {
  BusStationsHero,
  BusStationsLoading,
  BusStationsPaywall,
  BusStationsSearchCard,
  BusStationsResultsSection,
  BusStationReportModal
} from "./components";
import styles from "./bus-stations.module.css";

export type { BusCompany, BusStation, ReportProblemType } from "./types";

export default function BusStationsPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification (Gold tier, Mishwar tier, Promo, or Admin)
  const promoStatus = isPageOpen("/bus-stations");
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
    stations,
    filteredStations,
    loading: dataLoading,
    searchQuery,
    setSearchQuery,
    expandedStation,
    toggleStation,
    stats
  } = useBusStationsData(user, hasAccess);

  // Problem Reporting Modal Hook
  const reportModal = useBusStationsReportModal(user, stations);

  // 1. Initial Authentication Loading State
  if (authLoading) {
    return <BusStationsLoading />;
  }

  // 2. Paywall Gate for Non-Subscribers
  if (!hasAccess) {
    return <BusStationsPaywall user={user} />;
  }

  // 3. Authorized Bus Stations Main Directory
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Radial Top Glow */}
      <div className={styles.ambientGlow} />

      {/* Hero Header with Navigation and Stats */}
      <BusStationsHero
        stationsCount={stats.stationsCount}
        companiesCount={stats.companiesCount}
        destinationsCount={stats.destinationsCount}
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

        {/* Live Search Card */}
        <BusStationsSearchCard
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Bus Stations Accordion Directory */}
        <BusStationsResultsSection
          loading={dataLoading}
          stations={filteredStations}
          expandedStation={expandedStation}
          onToggleStation={toggleStation}
          onOpenReport={reportModal.openReportModal}
        />
      </div>

      {/* Report Problem & Data Verification Modal */}
      <BusStationReportModal
        isOpen={reportModal.reportModalOpen}
        onClose={reportModal.closeReportModal}
        user={user}
        stations={stations}
        selectedStation={reportModal.selectedStationForReport}
        onSelectStation={reportModal.setSelectedStationForReport}
        customStationName={reportModal.customStationName}
        onCustomStationNameChange={reportModal.setCustomStationName}
        problemType={reportModal.reportProblemType}
        onProblemTypeChange={reportModal.setReportProblemType}
        details={reportModal.reportDetails}
        onDetailsChange={reportModal.setReportDetails}
        imageFile={reportModal.reportImageFile}
        onImageFileChange={reportModal.setReportImageFile}
        loading={reportModal.reportLoading}
        uploading={reportModal.reportUploading}
        error={reportModal.reportError}
        success={reportModal.reportSuccess}
        limitReached={reportModal.limitReached}
        limitChecking={reportModal.limitChecking}
        onSubmit={reportModal.handleSubmitReport}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
