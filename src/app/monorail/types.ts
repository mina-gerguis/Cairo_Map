import React from "react";
import { User } from "@supabase/supabase-js";

export type MonorailLineId = "east" | "west";

export interface MonorailStation {
  name: string;
  line_type: MonorailLineId;
  station_order: number;
  landmarks?: string[];
  status?: "تشغيل تجريبي" | "تحت الإنشاء";
  type?: string;
  timeFromStart?: number;
}

export interface MonorailStationDetail {
  landmarks: string[];
  type: string;
  timeFromStart: number;
  status: "تشغيل تجريبي" | "تحت الإنشاء";
}

export interface MonorailLineConfig {
  id: MonorailLineId;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  from: string;
  to: string;
  desc: string;
  length: string;
  time: string;
}

export interface MonorailRouteLeg {
  from: string;
  to: string;
  count?: number;
  price: number;
  discountPrice?: number;
  time: number;
  stations?: string[];
  lineType?: MonorailLineId;
  lineName?: string;
  lineColor?: string;
  description?: string;
}

export interface MonorailRouteResult {
  sameLine: boolean;
  count: number;
  price: number;
  discountPrice: number;
  zoneName?: string;
  time: number;
  stations?: string[];
  lineType?: MonorailLineId;
  lineName?: string;
  lineColor?: string;
  leg1?: MonorailRouteLeg;
  leg2?: MonorailRouteLeg;
  leg3?: MonorailRouteLeg;
  description: string;
}

export interface TrackerStationItem {
  name: string;
  lineColor?: string;
  isTransfer: boolean;
}

export type ReportScope = "general" | "route" | "station";

// Component Props Interfaces
export interface MonorailHeaderProps {
  headerRef: React.RefObject<HTMLDivElement | null>;
}

export interface MonorailLinesSliderProps {
  sliderRef: React.RefObject<HTMLDivElement | null>;
  lines: MonorailLineConfig[];
  selectedLine: MonorailLineId;
  onSelectLine: (lineId: MonorailLineId) => void;
  stations: MonorailStation[];
}

export interface MonorailRouteCalculatorProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  selectedFrom: string | null;
  selectedTo: string | null;
  fromQuery: string;
  toQuery: string;
  showFromList: boolean;
  showToList: boolean;
  filteredFromStations: MonorailStation[];
  filteredToStations: MonorailStation[];
  onSelectFrom: (name: string) => void;
  onSelectTo: (name: string) => void;
  onFromQueryChange: (query: string) => void;
  onToQueryChange: (query: string) => void;
  onFromFocus: () => void;
  onFromBlur: () => void;
  onToFocus: () => void;
  onToBlur: () => void;
  onSwapStations: () => void;
  onFindNearest: () => void;
  locatingNearest: boolean;
  nearestDistance: string | null;
  routeResult: MonorailRouteResult | null;
  isTripActive: boolean;
  currentStepIndex: number;
  trackerStationsList: TrackerStationItem[];
  copiedRoute: boolean;
  whatsappShareUrl: string;
  onStartTrip: () => void;
  onEndTrip: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onShareRoute: () => void;
  onOpenReportModal: (stationName?: string | null, fromRoute?: boolean) => void;
}

export interface MonorailLineExplorerProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  selectedLineObj: MonorailLineConfig;
  allLines: MonorailLineConfig[];
  selectedLine: MonorailLineId;
  onSelectLine: (lineId: MonorailLineId) => void;
  currentLineStations: MonorailStation[];
  filteredCurrentLineStations: MonorailStation[];
  lineSearchQuery: string;
  onSearchQueryChange: (q: string) => void;
  expandedStation: string | null;
  onToggleStation: (name: string) => void;
  onOpenReportModal: (stationName: string) => void;
}

export interface MonorailOverviewPanelProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
}

export interface MonorailReportBannerProps {
  bannerRef: React.RefObject<HTMLDivElement | null>;
  onOpenReportModal: () => void;
}

export interface MonorailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef: React.RefObject<HTMLDivElement | null>;
  user: User | null;
  targetScope: ReportScope;
  setTargetScope: (scope: ReportScope) => void;
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  stationQuery: string;
  setStationQuery: (query: string) => void;
  showStationList: boolean;
  setShowStationList: (show: boolean) => void;
  filteredStations: MonorailStation[];
  problemType: string;
  setProblemType: (type: string) => void;
  details: string;
  setDetails: (details: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  isDraggingImage: boolean;
  setIsDraggingImage: (dragging: boolean) => void;
  onImageSelect: (file: File | null) => void;
  error: string;
  loading: boolean;
  uploading: boolean;
  success: boolean;
  limitChecking: boolean;
  limitReached: boolean;
  onSubmit: (e: React.FormEvent) => void;
  hasRouteResult: boolean;
}
