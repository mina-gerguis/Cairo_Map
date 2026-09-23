import React from "react";

export type GarageType =
  | "مغطى ومتعدد الطوابق"
  | "جراج ذكي إلكتروني"
  | "جراج سطحي مفتوح"
  | string;

export interface ParkingSpot {
  id: string;
  name: string;
  area: string;
  address: string;
  nearestMetro: string;
  hourlyRate: number;
  maxDailyRate?: number;
  capacity: number;
  type: GarageType;
  hours: string;
  features: string[];
  mapLocationLink?: string;
}

export type ReportScope = "general" | "parking";

export interface ParkingLoadingProps {}

export interface ParkingLockStateProps {
  user: any;
}

export interface ParkingHeaderProps {}

export interface ParkingActionsProps {
  onOpenSuggestModal: () => void;
  onOpenReportModal: () => void;
}

export interface ParkingSearchFilterProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedArea: string;
  onSelectedAreaChange: (value: string) => void;
  areas: string[];
}

export interface ParkingGarageCardProps {
  parking: ParkingSpot;
  isExpanded: boolean;
  onToggle: () => void;
  onReportParking: (parkingName: string) => void;
}

export interface ParkingGarageListProps {
  parkings: ParkingSpot[];
  expandedParkingId: string | null;
  onToggleParking: (id: string) => void;
  onReportParking: (parkingName: string) => void;
  searchTerm: string;
  onOpenSuggestModal: (initialName?: string) => void;
}

export interface ParkingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  reportTargetScope: ReportScope;
  setReportTargetScope: (scope: ReportScope) => void;
  reportSelectedParking: string;
  setReportSelectedParking: (name: string) => void;
  reportParkingSearchQuery: string;
  setReportParkingSearchQuery: (query: string) => void;
  showReportParkingList: boolean;
  setShowReportParkingList: (show: boolean) => void;
  filteredReportParking: ParkingSpot[];
  reportProblemType: string;
  setReportProblemType: (type: string) => void;
  reportDetails: string;
  setReportDetails: (details: string) => void;
  reportImageFile: File | null;
  reportImagePreview: string | null;
  isDraggingImage: boolean;
  setIsDraggingImage: (isDragging: boolean) => void;
  onImageSelect: (file: File | null) => void;
  reportLoading: boolean;
  reportUploading: boolean;
  reportSuccess: boolean;
  reportError: string;
  limitChecking: boolean;
  limitReached: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface ParkingSuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  areas: string[];
  suggestName: string;
  setSuggestName: (name: string) => void;
  suggestArea: string;
  setSuggestArea: (area: string) => void;
  suggestAddress: string;
  setSuggestAddress: (address: string) => void;
  suggestNearestMetro: string;
  setSuggestNearestMetro: (metro: string) => void;
  suggestType: string;
  setSuggestType: (type: string) => void;
  suggestHourlyRate: string;
  setSuggestHourlyRate: (rate: string) => void;
  suggestCapacity: string;
  setSuggestCapacity: (capacity: string) => void;
  suggestMapLink: string;
  setSuggestMapLink: (link: string) => void;
  suggestFeatures: string[];
  onToggleFeature: (feature: string) => void;
  suggestNotes: string;
  setSuggestNotes: (notes: string) => void;
  suggestImageFile: File | null;
  suggestImagePreview: string | null;
  isDraggingSuggestImage: boolean;
  setIsDraggingSuggestImage: (isDragging: boolean) => void;
  onImageSelect: (file: File | null) => void;
  suggestLoading: boolean;
  suggestUploading: boolean;
  suggestSuccess: boolean;
  suggestError: string;
  suggestLimitChecking: boolean;
  suggestLimitReached: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}
