"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReviewSection from "@/components/ReviewSection";
import ReportProblemModal from "@/components/ReportProblemModal";
import PlaceNoteModal from "@/components/PlaceNoteModal";

// Custom Hook
import { usePlaceDetails } from "./hooks/usePlaceDetails";

// Constants
import { CATEGORY_ICONS, CATEGORY_LABELS, getCategoryColor } from "./constants";

// Sub-components
import {
  PlaceDetailsLoading,
  PlaceNotFound,
  PlaceDetailsHeader,
  PlaceCoverImage,
  PlaceTitleSection,
  PlaceActionButtons,
  PlaceQuickInfo,
  PlaceBranchSelector,
  PlaceMediaSlider,
  PlaceDescriptionCard,
  PlaceGoodToKnowCard,
  PlaceContactDetailsCard,
  PlaceWorkingHoursCard,
  PlaceBottomActions,
  PlacePhotoGallery,
  PlaceMediaLightbox,
} from "./components";

export default function PlaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Business logic & data hook
  const {
    place,
    loading,
    selectedBranchId,
    setSelectedBranchId,
    displayBranch,
    currentDistance,
    isFavorite,
    togglingFav,
    toggleFavorite,
    activeMenuIndex,
    setActiveMenuIndex,
    mediaList,
    nextMedia,
    prevMedia,
    handleShare,
    handleRatingUpdate,
    hasAccess,
    user,
  } = usePlaceDetails(id);

  if (loading) {
    return <PlaceDetailsLoading />;
  }

  if (!place) {
    return <PlaceNotFound onBackHome={() => router.push("/")} />;
  }

  return (
    <div
      className="app-container"
      style={{ maxWidth: "800px", paddingBottom: "100px" }}
    >
      {/* Navigation Header */}
      <PlaceDetailsHeader
        place={place}
        onShare={handleShare}
        onClose={() => router.push("/")}
      />

      {/* Main Glass Details Box */}
      <div className="glass-panel" style={{ overflow: "hidden", padding: "0" }}>
        {/* Cover Image & Category Badge */}
        <PlaceCoverImage
          place={place}
          categoryColor={getCategoryColor(place.category)}
          categoryIcon={CATEGORY_ICONS[place.category]}
          categoryLabel={
            place.categoryLabel || CATEGORY_LABELS[place.category]
          }
        />

        {/* Content Box */}
        <div style={{ padding: "20px" }}>
          {/* Title & English Name & Distance */}
          <PlaceTitleSection
            place={place}
            displayBranch={displayBranch}
            currentDistance={currentDistance}
          />

          {/* Action Row - 3 Buttons (Directions, Call, Favorite) */}
          <PlaceActionButtons
            displayBranch={displayBranch}
            isFavorite={isFavorite}
            togglingFav={togglingFav}
            toggleFavorite={toggleFavorite}
          />

          {/* Quick Info Box (Status, Ratings) */}
          <PlaceQuickInfo
            displayBranch={displayBranch}
            rating={place.rating}
            reviewsCount={place.reviewsCount}
            onReviewsClick={() => {
              const el = document.getElementById("reviews-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Branch Selector Chips */}
          <PlaceBranchSelector
            branches={place.branches || []}
            selectedBranchId={selectedBranchId}
            onSelectBranch={setSelectedBranchId}
          />

          {/* Media / Menu Images Slider */}
          <PlaceMediaSlider
            mediaList={mediaList}
            onMediaClick={(idx) => setActiveMenuIndex(idx)}
          />

          {/* Description Section */}
          <PlaceDescriptionCard description={place.description} />

          {/* Good to Know Card */}
          <PlaceGoodToKnowCard place={place} displayBranch={displayBranch} />

          {/* Details Card (Phone, Website, Address) */}
          <PlaceContactDetailsCard
            place={place}
            displayBranch={displayBranch}
          />

          {/* Working Hours Card */}
          <PlaceWorkingHoursCard workingHours={displayBranch.workingHours} />

          {/* Bottom Dock / Report & Note & Share Actions */}
          <PlaceBottomActions
            onReportClick={() => setIsReportModalOpen(true)}
            onNoteClick={() => {
              if (!user) {
                alert("يرجى تسجيل الدخول أولاً لإضافة ملاحظة.");
                return;
              }
              setIsNoteModalOpen(true);
            }}
            onShareClick={handleShare}
            hasAccess={hasAccess}
            placeCode={selectedBranchId || place.id}
          />

          {/* Photo Gallery */}
          <PlacePhotoGallery
            images={place.images || []}
            placeName={place.name}
          />

          {/* Reviews Section */}
          <ReviewSection
            place={place}
            selectedBranchId={selectedBranchId}
            onRatingUpdate={handleRatingUpdate}
          />
        </div>
      </div>

      {/* Lightbox / Zoom component */}
      <PlaceMediaLightbox
        images={mediaList}
        activeIndex={activeMenuIndex}
        onClose={() => setActiveMenuIndex(null)}
        onNext={nextMedia}
        onPrev={prevMedia}
      />

      {/* Modals */}
      {isReportModalOpen && place && (
        <ReportProblemModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          place={place}
        />
      )}

      {isNoteModalOpen && place && (
        <PlaceNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          placeId={place.id}
          placeName={place.name}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />
    </div>
  );
}
