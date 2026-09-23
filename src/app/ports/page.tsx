"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import { usePortsData } from "./hooks/usePortsData";
import PortsHero from "./components/PortsHero";
import PortsSlider from "./components/PortsSlider";
import PortsSearchCard from "./components/PortsSearchCard";
import PortsResultsSection from "./components/PortsResultsSection";
import PortsPaywall from "./components/PortsPaywall";
import PortsLoading from "./components/PortsLoading";
import styles from "./ports.module.css";

export default function PortsPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification (Matches Microbus, Metro, Airports)
  const promoStatus = isPageOpen("/ports");
  const isExpired =
    profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
      promoStatus.isOpen ||
      ((profile?.subscription_tier === "gold" ||
        profile?.subscription_tier === "mishwar") &&
        !isExpired)
  );

  // Ports Data Hook
  const {
    ports,
    filteredPorts,
    loading: dataLoading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    expandedPort,
    toggleExpand,
    isDropdownOpen,
    setIsDropdownOpen,
    searchResults,
    handleSelectSearchPort,
    counts,
  } = usePortsData(user, hasAccess);

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const paywallRef = useRef<HTMLDivElement>(null);
  const paywallCardRef = useRef<HTMLDivElement>(null);

  // Entrance Animations
  useEffect(() => {
    if (!hasAccess) {
      const ctx = gsap.context(() => {
        if (paywallRef.current) {
          gsap.fromTo(
            paywallRef.current,
            { opacity: 0, y: -16 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );
        }
        if (paywallCardRef.current) {
          gsap.fromTo(
            paywallCardRef.current,
            { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)", delay: 0.1 }
          );
        }
      });
      return () => ctx.revert();
    }

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
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.08 }
        );
      }
    });

    return () => ctx.revert();
  }, [hasAccess, dataLoading]);

  // Loading Screen
  if (authLoading) {
    return <PortsLoading />;
  }

  // Paywall Screen for Non-Subscribers
  if (!hasAccess) {
    return (
      <PortsPaywall
        user={user}
        paywallRef={paywallRef}
        paywallCardRef={paywallCardRef}
      />
    );
  }

  // Authorized Main Page
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.contentContainer}>
        {/* Back Link */}
        <div className={styles.backLinkNav}>
          <Link href="/" className={styles.backLink}>
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.3rem" }} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Hero Section */}
        <PortsHero
          headerRef={headerRef}
          totalPorts={ports.length}
          mediterraneanCount={counts.mediterranean}
          redSeaCount={counts.redsea}
        />

        {/* Promotional Banner */}
        {promoStatus.isOpen && promoStatus.offer && (
          <div style={{ marginBottom: "20px" }}>
            <PromotionalPageBanner
              offer={promoStatus.offer}
              remainingDays={promoStatus.remainingDays}
            />
          </div>
        )}

        {/* Bento Slider for Quick Category Navigation */}
        <PortsSlider
          sliderRef={sliderRef}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          counts={counts}
        />

        {/* Search Bento Card & Autocomplete */}
        <PortsSearchCard
          searchPanelRef={searchPanelRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={counts}
          searchResults={searchResults}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          onSelectPort={handleSelectSearchPort}
        />

        {/* Filtered Ports Results */}
        <PortsResultsSection
          resultsPanelRef={resultsPanelRef}
          loading={dataLoading}
          ports={filteredPorts}
          searchQuery={searchQuery}
          expandedPort={expandedPort}
          onToggleExpand={toggleExpand}
        />
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
