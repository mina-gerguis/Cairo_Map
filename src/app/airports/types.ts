export type { Airport } from "@/data/airports";

export type AirportTab = "list" | "guide";

export interface AirportsStats {
  totalAirports: number;
  internationalCount: number;
  domesticCount: number;
}
