import { Place } from "@/data/places";

export interface PlaceDetailsHeaderProps {
  place: Place;
  onShare: () => void;
  onClose: () => void;
}

export interface PlaceCoverImageProps {
  place: Place;
  categoryColor: string;
  categoryIcon: string;
  categoryLabel: string;
}

export interface PlaceTitleSectionProps {
  place: Place;
  displayBranch: any;
  currentDistance: number | null;
}

export interface PlaceActionButtonsProps {
  displayBranch: any;
  isFavorite: boolean;
  togglingFav: boolean;
  toggleFavorite: () => void;
}

export interface PlaceQuickInfoProps {
  displayBranch: any;
  rating?: number;
  reviewsCount?: number;
  onReviewsClick: () => void;
}

export interface PlaceBranchSelectorProps {
  branches: any[];
  selectedBranchId: string | null;
  onSelectBranch: (branchId: string) => void;
}

export interface PlaceMediaSliderProps {
  mediaList: string[];
  onMediaClick: (index: number) => void;
}

export interface PlaceDescriptionCardProps {
  description?: string;
}

export interface PlaceGoodToKnowCardProps {
  place: Place;
  displayBranch: any;
}

export interface PlaceContactDetailsCardProps {
  place: Place;
  displayBranch: any;
}

export interface PlaceWorkingHoursCardProps {
  workingHours?: string;
}

export interface PlaceBottomActionsProps {
  onReportClick: () => void;
  onNoteClick: () => void;
  onShareClick: () => void;
  hasAccess: boolean;
  placeCode: string;
}

export interface PlacePhotoGalleryProps {
  images: string[];
  placeName: string;
}

export interface PlaceMediaLightboxProps {
  images: string[];
  activeIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export interface PlaceNotFoundProps {
  onBackHome: () => void;
}
