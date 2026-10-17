export type { Airport } from "@/data/airports";

export type AirportTab = "list" | "guide";

export type AirportCategoryFilter =
  | "all"
  | "international"
  | "domestic"
  | "cairo"
  | "redsea_sinai"
  | "alex_delta"
  | "upper_egypt";

export interface AirportsStats {
  totalAirports: number;
  internationalCount: number;
  domesticCount: number;
}

export type AirportReportProblemType =
  | "phone"
  | "terminals"
  | "airlines"
  | "location"
  | "missing_airport"
  | "other";

export type AirportReportScope = "general" | "airport";

export interface AirportReportOption {
  id: AirportReportProblemType;
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}
