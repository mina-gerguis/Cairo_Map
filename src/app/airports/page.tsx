"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import { useAirportsData } from "./hooks";
import {
  AirportsHero,
  AirportsLoading,
  AirportsPaywall,
  AirportsTabs,
  AirportsSearchCard,
  AirportsResultsSection,
  AirportsTravelGuide
} from "./components";
import styles from "./airports.module.css";

export type { Airport, AirportTab, AirportsStats } from "./types";

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
    filteredAirports,
    loading: dataLoading,
    searchQuery,
    setSearchQuery,
    expandedId,
    toggleExpand,
    activeTab,
    setActiveTab,
    stats
  } = useAirportsData(user, hasAccess);

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
        />

        {activeTab === "list" && (
          <>
            {/* Live Search Card */}
            <AirportsSearchCard
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Airports Accordion Results Section */}
            <AirportsResultsSection
              loading={dataLoading}
              airports={filteredAirports}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
            />
          </>
        )}

        {activeTab === "guide" && (
          /* Comprehensive Travel & Airport Guide Cards */
          <AirportsTravelGuide />
        )}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
