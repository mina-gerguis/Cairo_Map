import React from "react";
import { Place, PlaceCategory } from "@/data/places";

export type PlaceWithDist = Place & {
  distanceKm?: number;
  closestBranchName?: string;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
} | null;

export interface PlacesFilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedSubCategory: string | null;
  selectedType: string | null;
  minRating: number;
  activeFeatures: string[];
}

export interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export interface PlaceCardProps {
  place: PlaceWithDist;
  getCategoryColor: (cat: string) => string;
  showRating?: boolean;
  toggleFavorite?: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds?: Set<string>;
}

export interface PaginatedSectionProps {
  title: React.ReactNode;
  places: PlaceWithDist[];
  setSelectedPlace: (place: Place) => void;
  getCategoryColor: (cat: string) => string;
  toggleFavorite: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds: Set<string>;
  showRating?: boolean;
  emptyMessage?: React.ReactNode;
  itemsPerPage?: number;
  forceThreeColumns?: boolean;
}

export interface PlacesHeroProps {
  placesCount: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  suggestions: PlaceWithDist[];
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  activeSuggestionIndex: number;
  setActiveSuggestionIndex: React.Dispatch<React.SetStateAction<number>>;
  onSelectSuggestion: (place: PlaceWithDist) => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
  isLight: boolean;
  isProximityEnabled: boolean;
  locationLoading: boolean;
  onToggleProximity: () => void;
  onExploreClick: () => void;
}

export interface PlacesCategoryFilterProps {
  selectedCategory: string;
  selectedSubCategory: string | null;
  selectedType: string | null;
  onSelectCategory: (cat: string) => void;
  onSelectSubCategory: (sub: string | null) => void;
  onSelectType: (type: string | null) => void;
  places: Place[];
  isProximityEnabled: boolean;
  locationLoading: boolean;
  onToggleProximity: () => void;
}

export interface PlacesFilterBarProps {
  minRating: number;
  setMinRating: (val: number) => void;
  activeFeature: string;
  setActiveFeature: (val: string) => void;
}

export interface PlacesSectionsViewProps {
  isProximityEnabled: boolean;
  nearbyPlaces: PlaceWithDist[];
  enrichedPlaces: PlaceWithDist[];
  topRatedPlaces: PlaceWithDist[];
  familyPlaces: PlaceWithDist[];
  entertainmentPlaces: PlaceWithDist[];
  setSelectedPlace: (place: Place) => void;
  getCategoryColor: (cat: string) => string;
  toggleFavorite: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds: Set<string>;
}

export interface PlacesSearchResultsViewProps {
  filteredPlaces: PlaceWithDist[];
  searchQuery: string;
  selectedCategory: string;
  selectedSubCategory: string | null;
  selectedType: string | null;
  minRating: number;
  activeFeatures: string[];
  setSelectedPlace: (place: Place) => void;
  getCategoryColor: (cat: string) => string;
  toggleFavorite: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds: Set<string>;
}

export interface PlaceDetailSheetProps {
  selectedPlace: Place;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  onClose: () => void;
  favoriteIds: Set<string>;
  toggleFavorite: (e: React.MouseEvent, placeId: string) => void;
  onShare: (place: Place) => void;
  onOpenReportModal: () => void;
  onOpenNoteModal: () => void;
  onMediaClick: (index: number) => void;
  hasAccess: boolean;
  onRatingUpdate: (rating: number, count: number) => void;
}

export interface MediaLightboxProps {
  images: string[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlace: (newPlace: Place) => void;
}
