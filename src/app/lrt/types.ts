import React from "react";
import { User } from "@supabase/supabase-js";

export type LrtLineType = "trunk" | "capital" | "ramadan";
export type LrtExplorerTab = "all" | "trunk" | "capital" | "ramadan";

export interface LrtStation {
  id?: string | number;
  name: string;
  line_type: LrtLineType;
  station_order: number;
  landmarks?: string[];
  status?: "تشغيل فعلي" | "تحت الإنشاء";
  type?: string;
}

export interface LrtStationDetail {
  landmarks: string[];
  type: string;
  status: "تشغيل فعلي" | "تحت الإنشاء";
}

export interface LrtLineTabConfig {
  id: LrtExplorerTab;
  label: string;
  color: string;
  title: string;
  description: string;
}

export interface LrtRouteResult {
  stations: string[];
  count: number;
  price: number;
  estimatedTime: number;
}

export type ReportScope = "general" | "route" | "station";

// Component Props
export interface LrtHeaderProps {
  headerRef?: React.RefObject<HTMLDivElement | null>;
  onOpenReportModal: () => void;
}

export interface LrtSearchCardProps {
  panelRef?: React.RefObject<HTMLDivElement | null>;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  searchResults: LrtStation[];
  onSelectStation: (station: LrtStation) => void;
}

export interface LrtRouteCalculatorProps {
  panelRef?: React.RefObject<HTMLDivElement | null>;
  selectedFrom: string | null;
  selectedTo: string | null;
  fromQuery: string;
  toQuery: string;
  showFromList: boolean;
  showToList: boolean;
  filteredFrom: string[];
  filteredTo: string[];
  onSelectFrom: (name: string) => void;
  onSelectTo: (name: string) => void;
  onFromQueryChange: (val: string) => void;
  onToQueryChange: (val: string) => void;
  onFromFocus: () => void;
  onFromBlur: () => void;
  onToFocus: () => void;
  onToBlur: () => void;
  onSwapStations: () => void;
  onFindRoute: () => void;
  result: LrtRouteResult | null;
  isTripActive: boolean;
  currentStepIndex: number;
  onStartTrip: () => void;
  onEndTrip: () => void;
  onNextStep: () => void;
  onOpenReportModal: (stationName?: string | null, fromRoute?: boolean) => void;
}

export interface LrtLineExplorerProps {
  panelRef?: React.RefObject<HTMLDivElement | null>;
  activeLine: LrtExplorerTab;
  onSelectTab: (tab: LrtExplorerTab) => void;
  stations: LrtStation[];
  expandedStation: string | null;
  onToggleStation: (name: string) => void;
  onOpenReportModal: (stationName: string) => void;
}

export interface LrtReportBannerProps {
  bannerRef?: React.RefObject<HTMLDivElement | null>;
  onOpenReportModal: () => void;
}

export interface LrtPricingCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export interface LrtReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef?: React.RefObject<HTMLDivElement | null>;
  user: User | null;
  targetScope: ReportScope;
  setTargetScope: (scope: ReportScope) => void;
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  stationSearchQuery: string;
  setStationSearchQuery: (query: string) => void;
  showStationList: boolean;
  setShowStationList: (show: boolean) => void;
  filteredStations: LrtStation[];
  problemType: string;
  setProblemType: (type: string) => void;
  details: string;
  setDetails: (details: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  isDraggingImage: boolean;
  setIsDraggingImage: (dragging: boolean) => void;
  onImageSelect: (file: File | null) => void;
  loading: boolean;
  uploading: boolean;
  success: boolean;
  error: string;
  limitChecking: boolean;
  limitReached: boolean;
  onSubmit: (e: React.FormEvent) => void;
  selectedFrom?: string | null;
  selectedTo?: string | null;
  routeResult?: LrtRouteResult | null;
}
