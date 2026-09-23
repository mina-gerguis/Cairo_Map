import React from "react";
import { User } from "@supabase/supabase-js";

export type LineId =
  | "line1"
  | "line2"
  | "line3"
  | "line4"
  | "line5"
  | "line6"
  | "line3_branch_a"
  | "line3_branch_b";

export type Line3BranchId = "trunk" | "branchA" | "branchB";

export interface StationInfo {
  name: string;
  lines: LineId[];
  isTransfer: boolean;
  landmarks?: string[];
}

export interface MetroStation {
  id?: string;
  name: string;
  line_type: LineId;
  station_order: number;
  landmarks?: string[];
  status?: string;
}

export interface MetroPriceTier {
  tier_name: string;
  max_stations: number;
  price: number;
}

export interface MetroLineConfig {
  id: LineId;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  from: string;
  to: string;
  desc: string;
}

export interface Edge {
  toStation: string;
  toLine: LineId;
  weight: number;
}

export interface DijkstraState {
  station: string;
  line: LineId;
  dist: number;
  path: Array<{ station: string; line: LineId }>;
}

export interface TransferInfo {
  station: string;
  fromLine: LineId;
  toLine: LineId;
}

export interface DetailedPathNode {
  station: string;
  line: LineId;
  isTransferPoint: boolean;
  targetLine?: LineId;
}

export interface RouteResult {
  found: boolean;
  path: string[];
  lines: LineId[];
  stationCount: number;
  price: number;
  needsTransfer: boolean;
  transfers: TransferInfo[];
  description: string;
  detailedPath: DetailedPathNode[];
  estimatedTime: number;
}

export type ReportScope = "general" | "route" | "station";

export interface MetroProblemOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  badgeColor: string;
}

// ── Component Props Interfaces ──

export interface MetroHeaderProps {
  headerRef: React.RefObject<HTMLDivElement | null>;
}

export interface MetroLinesSliderProps {
  sliderRef: React.RefObject<HTMLDivElement | null>;
  lines: MetroLineConfig[];
  selectedLine: LineId;
  onSelectLine: (lineId: LineId) => void;
  stations: MetroStation[];
}

export interface MetroRouteCalculatorProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  selectedFrom: string | null;
  selectedTo: string | null;
  fromQuery: string;
  toQuery: string;
  showFromList: boolean;
  showToList: boolean;
  filteredFrom: StationInfo[];
  filteredTo: StationInfo[];
  stations: MetroStation[];
  onSelectFrom: (name: string) => void;
  onSelectTo: (name: string) => void;
  onFromQueryChange: (q: string) => void;
  onToQueryChange: (q: string) => void;
  onFromFocus: () => void;
  onFromBlur: () => void;
  onToFocus: () => void;
  onToBlur: () => void;
  onSwapStations: () => void;
  onFindNearest: () => void;
  locatingNearest: boolean;
  nearestDistance: string | null;
  result: RouteResult | null;
  onFindRoute: () => void;
  isTripActive: boolean;
  currentStepIndex: number;
  copiedRoute: boolean;
  whatsappShareUrl: string;
  onStartTrip: () => void;
  onEndTrip: () => void;
  onStepNext: () => void;
  onShareRoute: () => void;
  onOpenReportModal: (stationName?: string | null, fromRoute?: boolean) => void;
}

export interface MetroLineExplorerProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  selectedLineObj: MetroLineConfig;
  explorerLine: LineId;
  line3ActiveBranch: Line3BranchId;
  onSelectBranch: (branch: Line3BranchId) => void;
  currentExplorerStations: MetroStation[];
  expandedStation: string | null;
  onToggleStation: (stationName: string) => void;
  onSwitchLine: (lineId: LineId) => void;
  stationLinesMap: Map<string, Set<LineId>>;
  color: string;
  onOpenReportModal: (stationName: string) => void;
}

export interface MetroMapSectionProps {
  mapPanelRef: React.RefObject<HTMLDivElement | null>;
}

export interface MetroReportBannerProps {
  bannerRef: React.RefObject<HTMLDivElement | null>;
  onOpenReportModal: () => void;
}

export interface MetroReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef: React.RefObject<HTMLDivElement | null>;
  user: User | null;
  targetScope: ReportScope;
  setTargetScope: (scope: ReportScope) => void;
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  stationSearchQuery: string;
  setStationSearchQuery: (query: string) => void;
  showStationList: boolean;
  setShowStationList: (show: boolean) => void;
  filteredStations: StationInfo[];
  problemType: string;
  setProblemType: (type: string) => void;
  showProblemTypeDropdown: boolean;
  setShowProblemTypeDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  details: string;
  setDetails: (details: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  isDraggingImage: boolean;
  setIsDraggingImage: (isDragging: boolean) => void;
  onImageSelect: (file: File | null) => void;
  loading: boolean;
  uploading: boolean;
  success: boolean;
  error: string;
  limitChecking: boolean;
  limitReached: boolean;
  selectedFrom: string | null;
  selectedTo: string | null;
  routeResult: RouteResult | null;
  color: string;
  onSubmit: (e: React.FormEvent) => void;
}
