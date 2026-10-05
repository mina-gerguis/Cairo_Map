export type {
  HighwayItem,
  HighwaySpeedLimits,
  HighwayTollGate,
  RoadNewsCategory,
  RoadNewsItem,
  RoadNewsSeverity,
} from "@/data/roads_info";

import type { HighwayItem, RoadNewsItem } from "@/data/roads_info";

export type RoadsTabType = "roads" | "guide";

export type RoadTypeFilter =
  | "all"
  | "حر"
  | "صحراوي"
  | "ساحلي"
  | "زراعي"
  | "دائري"
  | "محور";

export interface RoadsStats {
  totalRoads: number;
  totalDistanceKm: number;
  openRoadsCount: number;
  newsCount: number;
}

export interface LiveRoadWeather {
  temp: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: "sun" | "cloud" | "rain" | "fog" | "wind" | "cold";
  windSpeed: number; // km/h
  humidity: number; // %
  visibilityKm?: number;
  safetyTip: string;
  hasWarning: boolean;
  warningText?: string;
  updatedAt: string;
}

export type RoadReportProblemType =
  | "speed_error"
  | "road_closed"
  | "radar_location"
  | "toll_fee"
  | "distance_error"
  | "pavement_issue"
  | "other";

export type RoadReportScope = "general" | "road";

export interface RoadReportOption {
  id: RoadReportProblemType;
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}
