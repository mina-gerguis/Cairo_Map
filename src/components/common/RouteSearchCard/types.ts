import React, { RefObject } from "react";

export interface SearchSuggestion {
  name: string;
  searchNames?: string[];
  [key: string]: any;
}

export interface RouteSearchCardProps {
  // Container & Ref
  searchPanelRef?: RefObject<HTMLDivElement | null>;
  className?: string;

  // Header
  title?: React.ReactNode;
  titleIcon?: React.ReactNode;
  headerAction?: React.ReactNode;

  // FROM Field
  fromInput: string;
  setFromInput: (val: string) => void;
  fromLabel?: React.ReactNode;
  fromPlaceholder?: string;
  fromIcon?: React.ReactNode;
  showGps?: boolean;
  isLocating?: boolean;
  onUseGPS?: () => void;
  gpsTitle?: string;
  locationBadge?: string | null;
  onClearLocationBadge?: () => void;

  // TO Field
  toInput: string;
  setToInput: (val: string) => void;
  toLabel?: React.ReactNode;
  toPlaceholder?: string;
  toIcon?: React.ReactNode;

  // Controls
  showVoiceInput?: boolean;
  showSwap?: boolean;
  onSwap?: () => void;

  // Autocomplete Suggestions
  suggestions?: (SearchSuggestion | string)[];
  filterSuggestions?: (items: (SearchSuggestion | string)[], query: string) => (SearchSuggestion | string)[];
  maxSuggestions?: number;

  // Quick Preset Destination Chips
  presetsTitle?: React.ReactNode;
  presets?: string[];
  onSelectPreset?: (preset: string) => void;

  // Search Action Button
  searchButtonText?: React.ReactNode;
  searchButtonIcon?: React.ReactNode;
  onSearch: () => void;
  isSearchDisabled?: boolean;
  isLoading?: boolean;
}
