export type TransitVehicleType =
  | "microbus"
  | "bus"
  | "car"
  | "train"
  | "monorail"
  | "lrt"
  | "brt"
  | "metro"
  | "plane"
  | "ship"
  | "multi";

export interface RouteLeg {
  title: string;
  vehicleType?: string;
  cost?: number;
  duration?: string;
  steps: string[];
}

export interface RouteEntry {
  id: string;
  from_location: string;
  to_location: string;
  type: TransitVehicleType;
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs?: RouteLeg[];
  tips?: string;
  from_aliases?: string;
  to_aliases?: string;
  map_link?: string;
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

export interface FormLeg {
  title: string;
  vehicleType: string;
  cost: string;
  duration: string;
  steps: string[];
}

export interface FormOption {
  type: TransitVehicleType;
  type_name: string;
  icon: string;
  cost: string;
  duration: string;
  durationMinutes: number | "";
  steps: string[];
  legs: FormLeg[];
  tips: string;
  map_link: string;
}

export interface GroupedRouteOption {
  id?: string;
  type: TransitVehicleType;
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs?: RouteLeg[];
  tips?: string;
  map_link?: string;
}

export interface GroupedRoute {
  from_location: string;
  to_location: string;
  from_aliases?: string;
  to_aliases?: string;
  options: GroupedRouteOption[];
}

export interface RouteConnectionIdentifier {
  from_location: string;
  to_location: string;
}

export interface OriginTabItem {
  name: string;
  count: number;
}
