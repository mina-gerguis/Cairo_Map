"use client";

import React from "react";
import { useParams } from "next/navigation";
import { usePlaceReviews } from "./hooks/usePlaceReviews";
import {
  PlaceReviewsLoading,
  PlaceReviewsNotFound,
  PlaceReviewsHeader,
  PlaceReviewsSummary,
  PlaceReviewsFilters,
  PlaceReviewsList,
} from "./components";

export default function PlaceReviewsPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    place,
    loading,
    currentUserId,
    branchFilter,
    setBranchFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,
    filteredAndSortedReviews,
    deleteReview,
    handleBackToPlace,
    handleBackHome,
  } = usePlaceReviews(id);

  if (loading) {
    return <PlaceReviewsLoading />;
  }

  if (!place) {
    return <PlaceReviewsNotFound onBackHome={handleBackHome} />;
  }

  return (
    <div
      className="app-container"
      style={{ maxWidth: "800px", paddingBottom: "100px" }}
    >
      <PlaceReviewsHeader onBack={handleBackToPlace} />

      <PlaceReviewsSummary place={place} />

      <PlaceReviewsFilters
        branches={place.branches}
        branchFilter={branchFilter}
        onBranchFilterChange={setBranchFilter}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <PlaceReviewsList
        reviews={filteredAndSortedReviews}
        currentUserId={currentUserId}
        onDeleteReview={deleteReview}
      />
    </div>
  );
}
