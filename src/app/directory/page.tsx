"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useDirectoryData, useDirectoryModal } from "./hooks";
import {
  DirectoryHero,
  DirectorySlider,
  EmergencyRibbon,
  DirectorySearchPanel,
  PhonesSection,
  TelecomSection,
  ReportAlertBanner,
  DirectoryModal,
} from "./components";
import { DirectoryTopCard } from "./types";

export type { PhoneEntry, TelecomCodeEntry } from "./types";
export { COMPANY_META } from "./constants";

export default function PhoneDirectoryPage() {
  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const emergencyRibbonRef = useRef<HTMLDivElement>(null);
  const phonesPanelRef = useRef<HTMLDivElement>(null);
  const telecomPanelRef = useRef<HTMLDivElement>(null);
  const reportBannerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Core Data & Filter Hook
  const data = useDirectoryData();

  // Modal (Suggest / Report) Hook
  const modal = useDirectoryModal(data.searchQuery, data.activeCompany);

  // Set Page Title
  useEffect(() => {
    document.title = "ماب القاهرة - دليل الهاتف والخدمات";
  }, []);

  // GSAP Entrance Animations
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
      if (emergencyRibbonRef.current) {
        tl.fromTo(emergencyRibbonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (phonesPanelRef.current) {
        tl.fromTo(phonesPanelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
      if (reportBannerRef.current) {
        tl.fromTo(reportBannerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.2");
      }
    });

    return () => ctx.revert();
  }, []);

  // Animate Modal Open
  useEffect(() => {
    if (modal.modalOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [modal.modalOpen]);

  // Handle category selection from slider
  const handleSelectCategory = (card: DirectoryTopCard) => {
    if (card.id === "telecom") {
      data.setActiveMainTab("telecom");
      if (telecomPanelRef.current) {
        telecomPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      data.setActiveMainTab("phones");
      data.setSelectedSpecialty(card.specialtyFilter);
      if (phonesPanelRef.current) {
        phonesPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="main-container">
      {/* Header Banner */}
      <DirectoryHero headerRef={headerRef} />

      {/* Main Content Container */}
      <div className="container">
        {/* Top Cards Slider */}
        <DirectorySlider
          sliderRef={sliderRef}
          activeMainTab={data.activeMainTab}
          selectedSpecialty={data.selectedSpecialty}
          onSelectCategory={handleSelectCategory}
        />

        {/* Emergency Fast Dial Ribbon */}
        <EmergencyRibbon ribbonRef={emergencyRibbonRef} />

        {/* Search Panel Card */}
        <DirectorySearchPanel
          searchPanelRef={searchPanelRef}
          searchQuery={data.searchQuery}
          setSearchQuery={data.setSearchQuery}
          isFocused={data.isFocused}
          setIsFocused={data.setIsFocused}
          activeMainTab={data.activeMainTab}
          setActiveMainTab={data.setActiveMainTab}
          telecomCodesCount={data.codes.length}
          recentSearches={data.recentSearches}
          searchSuggestions={data.searchSuggestions}
          onSaveSearch={data.handleSaveSearch}
          onClearRecentSearches={data.clearRecentSearches}
        />

        {/* Phones Section */}
        {data.activeMainTab === "phones" && (
          <PhonesSection
            phonesPanelRef={phonesPanelRef}
            entries={data.entries}
            filteredEntries={data.filteredEntries}
            slicedEntries={data.slicedEntries}
            specialties={data.specialties}
            specialtyIcons={data.specialtyIcons}
            selectedSpecialty={data.selectedSpecialty}
            setSelectedSpecialty={data.setSelectedSpecialty}
            visibleCount={data.visibleCount}
            setVisibleCount={data.setVisibleCount}
            copiedId={data.copiedId}
            onCopy={data.handleCopyCode}
            onOpenSuggestModal={(query) => modal.handleOpenModal("suggest", "phone", query || data.searchQuery)}
            onOpenReportModal={(name, phone) => modal.handleOpenModal("report", "phone", name, phone)}
          />
        )}

        {/* Telecom Codes Section */}
        {data.activeMainTab === "telecom" && (
          <TelecomSection
            telecomPanelRef={telecomPanelRef}
            codes={data.codes}
            activeCompany={data.activeCompany}
            setActiveCompany={data.setActiveCompany}
            groupedCodes={data.groupedCodes}
            expandedSections={data.expandedSections}
            onToggleSection={data.toggleSection}
            codeInputs={data.codeInputs}
            onInputChange={(id, value) =>
              data.setCodeInputs((prev) => ({ ...prev, [id]: value }))
            }
            copiedId={data.copiedId}
            onCopy={data.handleCopyCode}
            searchQuery={data.searchQuery}
            sectionIcons={data.sectionIcons}
            onOpenSuggestModal={(query) => modal.handleOpenModal("suggest", "code", query || data.searchQuery)}
          />
        )}

        {/* Bottom Report Problem Alert Banner */}
        <ReportAlertBanner
          reportBannerRef={reportBannerRef}
          onOpenModal={() => modal.handleOpenModal("suggest", "phone")}
        />
      </div>

      {/* Suggest / Report Modal */}
      <DirectoryModal
        modalBoxRef={modalBoxRef}
        modalState={modal}
        specialties={data.specialties}
      />
    </div>
  );
}