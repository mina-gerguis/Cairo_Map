export type TransitVehicleType =
  | "microbus"
  | "bus"
  | "car"
  | "taxi"
  | "train"
  | "monorail"
  | "lrt"
  | "brt"
  | "metro"
  | "plane"
  | "ship"
  | "multi"
  | "walk";

export interface RouteLeg {
  title: string;
  vehicleType?: string;
  cost?: number;
  duration?: string;
  steps: string[];
}

export interface RouteOption {
  type: TransitVehicleType;
  typeName: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs?: RouteLeg[];
  tips?: string;
  map_link?: string;
}

export interface RouteData {
  from: string;
  to: string;
  from_aliases?: string;
  to_aliases?: string;
  options: RouteOption[];
}

export interface DbTransitRoute {
  id: string;
  from_location: string;
  to_location: string;
  type: TransitVehicleType;
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[] | string;
  legs?: RouteLeg[] | string;
  tips?: string | null;
  from_aliases?: string | null;
  to_aliases?: string | null;
  map_link?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CitySuggestion {
  name: string;
  searchNames: string[];
}

export interface QuickRouteItem {
  from: string;
  to: string;
  label: string;
  glowColor: string;
  searchCount?: number;
  isTrending?: boolean;
}

export interface ReportProblemOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  badgeColor: string;
}

export interface TripSummary {
  totalCost: number;
  totalDuration: string;
}
