import { Place } from "@/data/places";
import { Review } from "@/components/ReviewSection";

export type SortOption = "newest" | "oldest" | "highest" | "lowest";

export interface PlaceReviewsNotFoundProps {
  onBackHome: () => void;
}

export interface PlaceReviewsHeaderProps {
  onBack: () => void;
}

export interface PlaceReviewsSummaryProps {
  place: Place;
}

export interface PlaceReviewsFiltersProps {
  branches?: Place["branches"];
  branchFilter: string;
  onBranchFilterChange: (branchId: string) => void;
  ratingFilter: string;
  onRatingFilterChange: (rating: string) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
}

export interface PlaceReviewCardProps {
  review: Review;
  currentUserId?: string;
  onDeleteReview: (reviewId: string, ratingScore: number) => void;
}

export interface PlaceReviewsListProps {
  reviews: Review[];
  currentUserId?: string;
  onDeleteReview: (reviewId: string, ratingScore: number) => void;
}
