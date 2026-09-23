import React from "react";
import { CityLandmark, FamousCity } from "@/data/cities";

export interface FavoriteItem {
  id: string | number;
  name: string;
  category: string;
  categoryLabel?: string;
  briefLocation?: string;
  fullAddress?: string;
  images?: string[];
  isLandmark?: boolean;
  landmarkObj?: CityLandmark;
  cityObj?: FamousCity;
}

export interface ActiveLandmarkModalState {
  landmark: CityLandmark;
  city: FamousCity;
}

export interface FavoritesHeaderProps {
  onBack: () => void;
  title?: string;
}

export interface FavoritesLockStateProps {
  onLogin: () => void;
}

export interface FavoritesEmptyProps {
  title?: string;
  description?: string;
}

export interface FavoritesTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
  getCategoryCount: (category: string) => number;
}

export interface FavoriteCardProps {
  item: FavoriteItem;
  onRemove: (e: React.MouseEvent, item: FavoriteItem) => void;
  onClick: (item: FavoriteItem) => void;
}

export interface FavoritesListProps {
  items: FavoriteItem[];
  onRemove: (e: React.MouseEvent, item: FavoriteItem) => void;
  onItemClick: (item: FavoriteItem) => void;
}

export interface FavoritesLoadingProps {
  message?: string;
}
