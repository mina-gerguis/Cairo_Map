import { RefObject } from "react";

export interface BrtRoute {
  destination: string;
  fare: string;
  vehicleType?: string;
  duration?: string;
  via?: string;
  notes?: string;
  description?: string;
}

export interface BrtStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة";
  map_url?: string;
  type?: string;
  status?: string;
  landmarks?: string[];
  routes: BrtRoute[];
}

export interface StationPaletteItem {
  color: string;
  glow: string;
  icon: string;
}

export interface VoteStats {
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
}

export interface RouteInteraction {
  id: string;
  user_id: string;
  station_name: string;
  route_destination: string;
  interaction_type: "like" | "dislike" | "report";
  report_reason?: "fare" | "via" | "location" | "other" | string;
  comment?: string;
  created_at: string;
}

export type BrtReportScope = "general" | "station" | "route";

export interface BrtProblemOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  badgeColor: string;
}

export interface BrtReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef: RefObject<HTMLDivElement | null>;
  user: any;
  targetScope: BrtReportScope;
  setTargetScope: (scope: BrtReportScope) => void;
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  stationSearchQuery: string;
  setStationSearchQuery: (query: string) => void;
  showStationList: boolean;
  setShowStationList: (show: boolean) => void;
  filteredStations: BrtStation[];
  reportingRouteDestination: string;
  setReportingRouteDestination: (dest: string) => void;
  problemType: string;
  setProblemType: (type: string) => void;
  showProblemTypeDropdown: boolean;
  setShowProblemTypeDropdown: (show: boolean | ((prev: boolean) => boolean)) => void;
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
  color?: string;
  onSubmit: (e: React.FormEvent) => void;
}
