"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PromotionalPageBanner from "@/components/PromotionalPageBanner";
import Footer from "@/components/Footer";

import { useRoadsData, useRoadsNews, useRoadsReportModal } from "./hooks";
import {
  RoadsHero,
  RoadsTabs,
  RoadsSearchCard,
  RoadDetailCard,
  RoadsGeneralSpeedGuide,
  RoadsReportBanner,
  RoadsReportModal,
  RoadsLoading,
  RoadsPaywall,
} from "./components";
import { RoadsTabType } from "./types";
import styles from "./roads-info.module.css";

export default function RoadsInfoPage() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();

  // Access Permission Verification (Gold tier, Mishwar tier, Promo, or Admin)
  const promoStatus = isPageOpen("/roads-info");
  const isExpired =
    profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
      promoStatus.isOpen ||
      ((profile?.subscription_tier === "gold" ||
        profile?.subscription_tier === "mishwar") &&
        !isExpired)
  );

  const [activeTab, setActiveTab] = useState<RoadsTabType>("roads");

  // Core Data & State Hooks
  const {
    roads,
    filteredRoads,
    selectedRoad,
    selectedRoadId,
    setSelectedRoadId,
    loading: roadsLoading,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedGovernorate,
    setSelectedGovernorate,
    allGovernorates,
    stats,
  } = useRoadsData();

  const { news } = useRoadsNews();

  // User Reporting Modal Hook
  const {
    reportModalOpen,
    openReportModal,
    closeReportModal,
    targetScope,
    setTargetScope,
    selectedRoadForReport,
    setSelectedRoadForReport,
    customRoadName,
    setCustomRoadName,
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
    handleSubmitReport,
  } = useRoadsReportModal(user, roads);

  // 1. Initial Authentication Loading State
  if (authLoading) {
    return <RoadsLoading />;
  }

  // 2. Paywall Gate for Non-Subscribers
  if (!hasAccess) {
    return <RoadsPaywall user={user} />;
  }

  // 3. Authorized Page Content
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient Top Glow */}
      <div className={styles.ambientGlow} />

      {/* Hero Header with Navigation and Statistics */}
      <RoadsHero stats={stats} />

      <div className={styles.contentContainer}>
        {/* Promotional Campaign Banner if Active */}
        {promoStatus.isOpen && promoStatus.offer && (
          <div style={{ marginTop: "16px", marginBottom: "16px" }}>
            <PromotionalPageBanner
              offer={promoStatus.offer}
              remainingDays={promoStatus.remainingDays}
            />
          </div>
        )}

        {/* Tab Switcher */}
        <RoadsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          roadsCount={roads.length}
        />

        {/* Report / Feedback Banner */}
        <RoadsReportBanner onOpenReport={() => openReportModal(null)} />

        {/* ── TAB 1: Roads & Speed Limits Directory ── */}
        {activeTab === "roads" && (
          <>
            <RoadsSearchCard
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedGovernorate={selectedGovernorate}
              onGovernorateChange={setSelectedGovernorate}
              allGovernorates={allGovernorates}
            />

            {roadsLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", color: "#3b82f6" }} />
                <p style={{ marginTop: "8px" }}>جاري تحميل بيانات وسرعات الطرق...</p>
              </div>
            ) : filteredRoads.length === 0 ? (
              <div
                style={{
                  background: "var(--bg-card)",
                  padding: "40px 20px",
                  borderRadius: "16px",
                  textAlign: "center",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <i className="bx bx-search-alt" style={{ fontSize: "2.5rem", color: "#60a5fa", marginBottom: "8px" }} />
                <h3 style={{ fontSize: "1.1rem", color: "#fff", marginBottom: "4px" }}>
                  لم يتم العثور على طرق مطابقة لبحثك
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  جرب تغيير كلمة البحث أو اختيار "كافة المحافظات".
                </p>
              </div>
            ) : (
              <>
                {/* Master Details, Weather, Speeds & News for the Currently Selected Road */}
                {selectedRoad && (
                  <RoadDetailCard
                    road={selectedRoad}
                    news={news}
                    onReportProblem={(r) => openReportModal(r)}
                  />
                )}

                {/* Quick Selection Grid for All Other Roads */}
                <div style={{ marginTop: "32px", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-list-ul" style={{ color: "#3b82f6" }} />
                    <span>تصفح واختيار طريق آخر ({filteredRoads.length} طريق)</span>
                  </h3>
                </div>

                <div className={styles.roadsGrid}>
                  {filteredRoads.map((r) => {
                    const isSelected = r.id === selectedRoad?.id;
                    const roadHasNews = news.some(
                      (n) =>
                        n.isActive &&
                        n.roadName &&
                        (r.name.toLowerCase().includes(n.roadName.toLowerCase()) ||
                          n.roadName.toLowerCase().includes(r.name.toLowerCase()) ||
                          (r.code && n.roadName.toLowerCase().includes(r.code.toLowerCase())))
                    );

                    return (
                      <div
                        key={r.id}
                        className={`${styles.roadCard} ${isSelected ? styles.roadCardActive : ""}`}
                        onClick={() => {
                          setSelectedRoadId(r.id);
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                      >
                        <div className={styles.roadCardTop}>
                          <div>
                            <div className={styles.roadCardName}>
                              {r.name}
                              {roadHasNews && (
                                <span
                                  style={{
                                    marginRight: "6px",
                                    fontSize: "0.72rem",
                                    color: "#f59e0b",
                                    fontWeight: "600",
                                  }}
                                  title="يوجد أخبار وتنبيهات لهذا الطريق"
                                >
                                  <i className="bx bx-bell" /> تنبيه
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                              {r.startPoint} ← {r.endPoint}
                            </div>
                          </div>
                          <span className={styles.roadTypeBadge}>{r.type}</span>
                        </div>

                        <div className={styles.roadCardSpeedSummary}>
                          <div className={styles.roadCardLength}>
                            <i className="bx bx-ruler" />
                            <span>{r.lengthKm} كم</span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>أقصى سرعة ملاكي:</span>
                            <strong style={{ color: "#38bdf8" }}>{r.speeds.privateCar} كم/س</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── TAB 2: General Speed Guide & Fuel Calculator ── */}
        {activeTab === "guide" && (
          <RoadsGeneralSpeedGuide roads={roads} />
        )}
      </div>

      {/* User Issue & Feedback Reporting Modal */}
      <RoadsReportModal
        isOpen={reportModalOpen}
        onClose={closeReportModal}
        user={user}
        roads={roads}
        targetScope={targetScope}
        setTargetScope={setTargetScope}
        selectedRoad={selectedRoadForReport}
        setSelectedRoad={setSelectedRoadForReport}
        customRoadName={customRoadName}
        setCustomRoadName={setCustomRoadName}
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
        onSubmit={handleSubmitReport}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
