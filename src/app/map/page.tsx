"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useAuth } from "@/context/AuthContext";
import { MapPlacePoint, MapLayerType } from "./types";
import { useMapData } from "./hooks/useMapData";
import MapHeaderControls from "./components/MapHeaderControls";
import MapSidebarList from "./components/MapSidebarList";
import MapFloatingTools from "./components/MapFloatingTools";
import PlaceMapDetailCard from "./components/PlaceMapDetailCard";
import PlaceDetailSheet from "@/app/places/components/PlaceDetailSheet";
import MediaLightbox from "@/app/places/components/MediaLightbox";
import ReportProblemModal from "@/components/ReportProblemModal";
import PlaceNoteModal from "@/components/PlaceNoteModal";
import RequireAuthModal from "@/components/common/RequireAuthModal";
import { handleSharePlace } from "@/app/places/utils";
import styles from "./map.module.css";

// Dynamic Import for Leaflet CairoMap component with SSR disabled
const CairoMap = dynamic(() => import("./components/CairoMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--bgMode, #000000)",
        color: "var(--text-secondary)",
        fontSize: "1rem",
        gap: "10px",
      }}
    >
      <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.5rem" }}></i>
      <span>جاري تحميل خريطة القاهرة الذكية...</span>
    </div>
  ),
});

function MapPageContent() {
  const { user, profile, isPageOpen } = useAuth();
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Check Subscription & Permissions
  const promoStatus = isPageOpen("/places")?.isOpen
    ? isPageOpen("/places")
    : isPageOpen("/directions");
  const isExpired =
    profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
    promoStatus.isOpen ||
    ((profile?.subscription_tier === "mishwar" ||
      profile?.subscription_tier === "silver" ||
      profile?.subscription_tier === "gold") &&
      !isExpired)
  );

  // Require Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    "يرجى تسجيل الدخول أولاً لإضافة الأماكن المفضلة."
  );
  const handleRequireAuth = (msg?: string) => {
    if (msg) setAuthModalMessage(msg);
    setShowAuthModal(true);
  };

  // Map Data Hook
  const {
    filteredMapPoints,
    categoryCounts,
    userLocation,
    locationLoading,
    requestUserLocation,
    favoriteIds,
    toggleFavorite,
    setUserLocationManual,
    selectedPoint,
    setSelectedPoint,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    onlyOpenNow,
    setOnlyOpenNow,
    onlyFavorites,
    setOnlyFavorites,
    sortByNearby,
    setSortByNearby,
  } = useMapData(user, handleRequireAuth);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayerType>("dark");
  const [isLight, setIsLight] = useState(false);

  // Full Details Modal Sheet States
  const [fullDetailPoint, setFullDetailPoint] = useState<MapPlacePoint | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Theme Sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTheme = () => {
      const light = document.documentElement.classList.contains("light");
      setIsLight(light);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Sync initial map layer with current theme
  useEffect(() => {
    setMapLayer(isLight ? "light" : "dark");
  }, [isLight]);

  // Handle Point Selection
  const handleSelectPoint = (point: MapPlacePoint | null) => {
    setSelectedPoint(point);
  };

  // Open Full Details Sheet
  const handleOpenFullDetails = (point: MapPlacePoint) => {
    setFullDetailPoint(point);
    setSelectedBranchId(point.branchId || null);
  };

  // Handle User Location Navigation (Fly directly to user)
  const handleLocateUser = () => {
    if (userLocation) {
      mapInstanceRef.current?.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1.0,
      });
    }
    requestUserLocation((loc) => {
      mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 16, {
        duration: 1.0,
      });
    });
  };

  // Reset View to Cairo Center
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([30.0444, 31.2357], 12, { duration: 0.8 });
  };

  // Media lightbox list for selected place
  const lightboxImages =
    fullDetailPoint?.originalBranch?.media && fullDetailPoint.originalBranch.media.length > 0
      ? fullDetailPoint.originalBranch.media
      : fullDetailPoint?.originalPlace.menuImages || fullDetailPoint?.originalPlace.images || [];

  return (
    <div className={styles.mapPageWrapper}>
      {/* ── Top Floating Search & Category Filter Controls ── */}
      <MapHeaderControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        onlyOpenNow={onlyOpenNow}
        setOnlyOpenNow={setOnlyOpenNow}
        onlyFavorites={onlyFavorites}
        setOnlyFavorites={setOnlyFavorites}
        sortByNearby={sortByNearby}
        setSortByNearby={setSortByNearby}
        onLocateUser={handleLocateUser}
        locationLoading={locationLoading}
        userHasLocation={Boolean(userLocation)}
        onResetView={handleResetView}
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        totalFilteredCount={filteredMapPoints.length}
        points={filteredMapPoints}
        onSelectPoint={handleSelectPoint}
      />

      {/* ── Main Map Canvas & Overlays ── */}
      <div className={styles.mapContainerWrapper}>
        <CairoMap
          points={filteredMapPoints}
          selectedPoint={selectedPoint}
          onSelectPoint={handleSelectPoint}
          userLocation={userLocation}
          mapLayer={mapLayer}
          isLight={isLight}
          mapInstanceRef={mapInstanceRef}
          searchQuery={searchQuery}
          onUpdateUserLocation={setUserLocationManual}
        />

        {/* Left Floating Tools (Zoom, Layer, GPS, Center, District Picker) */}
        <MapFloatingTools
          mapInstanceRef={mapInstanceRef}
          mapLayer={mapLayer}
          setMapLayer={setMapLayer}
          onLocateUser={handleLocateUser}
          locationLoading={locationLoading}
          userHasLocation={Boolean(userLocation)}
          onSelectDistrict={setUserLocationManual}
        />

        {/* Right Collapsible Places Sidebar */}
        <MapSidebarList
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          points={filteredMapPoints}
          selectedPoint={selectedPoint}
          onSelectPoint={(point) => {
            setSelectedPoint(point);
            if (window.innerWidth <= 768) {
              setIsSidebarOpen(false);
            }
          }}
        />

        {/* Floating Selected Place Preview Card */}
        {selectedPoint && (
          <PlaceMapDetailCard
            point={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            onOpenDetails={handleOpenFullDetails}
            isFavorite={favoriteIds.has(selectedPoint.placeId)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>

      {/* ── Full Place Details Modal (PlaceDetailSheet) ── */}
      {fullDetailPoint && (
        <PlaceDetailSheet
          selectedPlace={fullDetailPoint.originalPlace}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          onClose={() => {
            setFullDetailPoint(null);
            setSelectedBranchId(null);
          }}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
          onShare={handleSharePlace}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenNoteModal={() => {
            if (!user) {
              handleRequireAuth("يرجى تسجيل الدخول أولاً لإضافة ملاحظة.");
              return;
            }
            setIsNoteModalOpen(true);
          }}
          onMediaClick={(index) => setActiveMediaIndex(index)}
          hasAccess={hasAccess}
          onRatingUpdate={(r, c) => {
            fullDetailPoint.originalPlace.rating = r;
            fullDetailPoint.originalPlace.reviewsCount = c;
          }}
        />
      )}

      {/* ── Media Lightbox ── */}
      {activeMediaIndex !== null && lightboxImages.length > 0 && (
        <MediaLightbox
          images={lightboxImages}
          activeIndex={activeMediaIndex}
          onClose={() => setActiveMediaIndex(null)}
          onChangeIndex={setActiveMediaIndex}
        />
      )}

      {/* ── Report Problem Modal ── */}
      {isReportModalOpen && fullDetailPoint && (
        <ReportProblemModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          place={fullDetailPoint.originalPlace}
        />
      )}

      {/* ── Place Note Modal ── */}
      {isNoteModalOpen && fullDetailPoint && (
        <PlaceNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          placeId={fullDetailPoint.placeId}
          placeName={fullDetailPoint.name}
        />
      )}

      {/* ── Require Auth Modal ── */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authModalMessage}
      />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "1rem",
          }}
        >
          جاري تجهيز الخريطة...
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
