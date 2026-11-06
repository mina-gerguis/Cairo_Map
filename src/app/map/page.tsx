"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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
import SaveLocationModal from "@/components/saveLocation/SaveLocationModal";
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
      <span>جاري تحميل الخريطة ...</span>
    </div>
  ),
});

function MapPageContent() {
  const { user, profile, isPageOpen } = useAuth();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || searchParams.get("cat") || "";
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
  } = useMapData(user, handleRequireAuth, searchParam, categoryParam || "all");

  // Sync Search & Category from URL query params
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
      if (typeof window !== "undefined" && window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    }
  }, [searchParam, setSearchQuery]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam, setSelectedCategory]);

  // UI States (Permanently locked to Light Mode per user request)
  const [isSidebarOpen, setIsSidebarOpen] = useState(Boolean(searchParam));
  const [mapLayer, setMapLayer] = useState<MapLayerType>("light");
  const isLight = true;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Full Details Modal Sheet States
  const [fullDetailPoint, setFullDetailPoint] = useState<MapPlacePoint | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSaveLocModalOpen, setIsSaveLocModalOpen] = useState(false);

  // Force Light Mode on Map Page per user specification
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');
    root.classList.add('light');
    return () => {
      if (hadDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    };
  }, []);

  // Fullscreen Management
  const handleToggleFullscreen = () => {
    if (typeof document === "undefined") return;

    if (!document.fullscreenElement && !isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
      document.documentElement.setAttribute("data-map-fullscreen", "true");
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      document.documentElement.removeAttribute("data-map-fullscreen");
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  };

  // Sync fullscreen change events & keyboard shortcut
  useEffect(() => {
    if (typeof document === "undefined") return;

    const onFullscreenChange = () => {
      const isNowFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isNowFull);
      if (isNowFull) {
        document.documentElement.setAttribute("data-map-fullscreen", "true");
      } else {
        document.documentElement.removeAttribute("data-map-fullscreen");
      }
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      // 'f' or 'F' toggles fullscreen
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.removeAttribute("data-map-fullscreen");
    };
  }, [isFullscreen]);

  // Theme is locked to Light Mode for Cairo Map
  // (No dark mode switching)

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
    <div className={`${styles.mapPageWrapper} ${styles.alwaysLight} light`}>
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

        {/* Left Floating Tools (Fullscreen, Zoom, Layer, GPS, Center, District Picker) */}
        <MapFloatingTools
          mapInstanceRef={mapInstanceRef}
          mapLayer={mapLayer}
          setMapLayer={setMapLayer}
          onLocateUser={handleLocateUser}
          locationLoading={locationLoading}
          userHasLocation={Boolean(userLocation)}
          onSelectDistrict={setUserLocationManual}
          onSaveLocation={() => setIsSaveLocModalOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          totalPlacesCount={filteredMapPoints.length}
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

      {/* ── Save My Location Modal ── */}
      <SaveLocationModal
        isOpen={isSaveLocModalOpen}
        onClose={() => setIsSaveLocModalOpen(false)}
        initialCoords={
          userLocation
            ? { lat: userLocation.lat, lng: userLocation.lng }
            : null
        }
      />

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
