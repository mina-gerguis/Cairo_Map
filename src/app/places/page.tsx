"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Place } from "@/data/places";
import AdBanner from "@/components/AdBanner";
import ReportProblemModal from "@/components/ReportProblemModal";
import PlaceNoteModal from "@/components/PlaceNoteModal";
import LocationHelperModal from "@/components/LocationHelperModal";
import RequireAuthModal from "@/components/common/RequireAuthModal";

// Custom Hooks
import { usePlacesData } from "./hooks/usePlacesData";
import { useGeolocation } from "./hooks/useGeolocation";
import { usePlacesFilter } from "./hooks/usePlacesFilter";

// Sub-components
import PlacesHero from "./components/PlacesHero";
import PlacesCategoryFilter from "./components/PlacesCategoryFilter";
import PlacesFilterBar from "./components/PlacesFilterBar";
import PlacesSectionsView from "./components/PlacesSectionsView";
import PlacesSearchResultsView from "./components/PlacesSearchResultsView";
import PlaceDetailSheet from "./components/PlaceDetailSheet";
import MediaLightbox from "./components/MediaLightbox";
import AddPlaceModal from "./components/AddPlaceModal";

// Constants & Helpers
import { getCategoryColor } from "./constants";
import { handleSharePlace } from "./utils";

function PlacesContent() {
  const { user, profile, isPageOpen } = useAuth();

  // صلاحيات الوصول والاشتراكات
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

  // حالات النوافذ المنبثقة وحساب المستخدم
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    "يرجى تسجيل الدخول أولاً لإضافة الأماكن المفضلة."
  );
  const handleRequireAuth = (message?: string) => {
    if (message) setAuthModalMessage(message);
    setShowAuthModal(true);
  };

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // فحص الثيم الفاتح / الداكن
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // خطاف البيانات والمفضلة
  const { places, favoriteIds, toggleFavorite, handleAddPlace } =
    usePlacesData(user, handleRequireAuth);

  // خطاف الموقع الجغرافي
  const {
    userLocation,
    isProximityEnabled,
    locationLoading,
    isLocationHelperOpen,
    setIsLocationHelperOpen,
    handleLocationSuccess,
    handleToggleProximity,
  } = useGeolocation();

  // خطاف الفلترة والبحث
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    selectedType,
    setSelectedType,
    minRating,
    setMinRating,
    activeFeatures,
    setActiveFeatures,
    enrichedPlaces,
    suggestions,
    filteredPlaces,
    nearbyPlaces,
    topRatedPlaces,
    familyPlaces,
    entertainmentPlaces,
    showSections,
  } = usePlacesFilter(
    places,
    userLocation,
    isProximityEnabled,
    handleToggleProximity
  );

  // حالات واقتراحات البحث الفوري
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // قائمة صور اللايت بوكس للفرع أو المكان المحدد
  const displayBranch =
    selectedBranchId && selectedPlace
      ? selectedPlace.branches?.find((b) => b.id === selectedBranchId) ||
      selectedPlace
      : selectedPlace;

  const lightboxImages =
    displayBranch?.media && displayBranch.media.length > 0
      ? displayBranch.media
      : selectedPlace?.menuImages || [];

  return (
    <>
      {/* ══════════════ HERO SECTION ══════════════ */}
      <PlacesHero
        placesCount={places.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        activeSuggestionIndex={activeSuggestionIndex}
        setActiveSuggestionIndex={setActiveSuggestionIndex}
        onSelectSuggestion={(place) => {
          setSelectedPlace(place);
          setShowSuggestions(false);
        }}
        searchRef={searchRef}
        isLight={isLight}
        isProximityEnabled={isProximityEnabled}
        locationLoading={locationLoading}
        onToggleProximity={handleToggleProximity}
        onExploreClick={() =>
          document
            .getElementById("places-section")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      />

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="app-container" id="places-section">
        {/* Ad Space Banner (Top) */}
        <AdBanner placement="places_top" />
        {/* Categories, Subcategories & Place Types */}
        <PlacesCategoryFilter
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          selectedType={selectedType}
          onSelectCategory={setSelectedCategory}
          onSelectSubCategory={setSelectedSubCategory}
          onSelectType={setSelectedType}
          places={places}
          isProximityEnabled={isProximityEnabled}
          locationLoading={locationLoading}
          onToggleProximity={handleToggleProximity}
        />

        {/* Filters Bar (Rating & Classification) */}
        <PlacesFilterBar
          minRating={minRating}
          setMinRating={setMinRating}
          activeFeature={activeFeatures[0] || ""}
          setActiveFeature={(val) => setActiveFeatures(val ? [val] : [])}
        />

        {/* Sections Mode vs Search Results Mode */}
        {showSections ? (
          <PlacesSectionsView
            isProximityEnabled={isProximityEnabled}
            nearbyPlaces={nearbyPlaces}
            enrichedPlaces={enrichedPlaces}
            topRatedPlaces={topRatedPlaces}
            familyPlaces={familyPlaces}
            entertainmentPlaces={entertainmentPlaces}
            setSelectedPlace={setSelectedPlace}
            getCategoryColor={getCategoryColor}
            toggleFavorite={toggleFavorite}
            favoriteIds={favoriteIds}
          />
        ) : (
          <PlacesSearchResultsView
            filteredPlaces={filteredPlaces}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            selectedType={selectedType}
            minRating={minRating}
            activeFeatures={activeFeatures}
            setSelectedPlace={setSelectedPlace}
            getCategoryColor={getCategoryColor}
            toggleFavorite={toggleFavorite}
            favoriteIds={favoriteIds}
          />
        )}
      </div>

      {/* ══════════════ DETAIL SHEET (MODAL) ══════════════ */}
      {selectedPlace && (
        <PlaceDetailSheet
          selectedPlace={selectedPlace}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          onClose={() => {
            setSelectedPlace(null);
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
          onMediaClick={(index) => setActiveMenuIndex(index)}
          hasAccess={hasAccess}
          onRatingUpdate={(r, c) =>
            setSelectedPlace((prev) =>
              prev ? { ...prev, rating: r, reviewsCount: c } : null
            )
          }
        />
      )}

      {/* ══════════════ MEDIA LIGHTBOX ══════════════ */}
      {activeMenuIndex !== null && lightboxImages.length > 0 && (
        <MediaLightbox
          images={lightboxImages}
          activeIndex={activeMenuIndex}
          onClose={() => setActiveMenuIndex(null)}
          onChangeIndex={setActiveMenuIndex}
        />
      )}

      {/* ══════════════ ADD PLACE MODAL ══════════════ */}
      <AddPlaceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddPlace={handleAddPlace}
      />

      {/* ══════════════ REPORT PROBLEM MODAL ══════════════ */}
      {isReportModalOpen && selectedPlace && (
        <ReportProblemModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          place={selectedPlace}
        />
      )}

      {/* ══════════════ PLACE NOTE MODAL ══════════════ */}
      {isNoteModalOpen && selectedPlace && (
        <PlaceNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          placeId={selectedPlace.id.toString()}
          placeName={selectedPlace.name}
        />
      )}

      {/* ══════════════ LOCATION HELPER MODAL ══════════════ */}
      <LocationHelperModal
        isOpen={isLocationHelperOpen}
        onClose={() => setIsLocationHelperOpen(false)}
        onSuccess={handleLocationSuccess}
      />

      {/* ══════════════ REQUIRE AUTH MODAL ══════════════ */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authModalMessage}
      />
    </>
  );
}

export default function PlacesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          جاري التحميل...
        </div>
      }
    >
      <PlacesContent />
    </Suspense>
  );
}
