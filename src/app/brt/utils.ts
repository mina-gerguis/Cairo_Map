import { DEFAULT_BRT_STATIONS } from "./constants";
import { BrtStation } from "./types";

/**
 * Splits comma/dash-separated via route stops into an array of clean stop names
 */
export function parseViaStops(via?: string): string[] {
  if (!via) return [];
  return via
    .split(/[\-،,>]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Retrieves cached local BRT stations from localStorage with fallback to default stations
 */
export function getLocalBrtStations(): BrtStation[] {
  if (typeof window === "undefined") return DEFAULT_BRT_STATIONS;
  const local = localStorage.getItem("local_brt_stations");
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_BRT_STATIONS;
    }
  }
  localStorage.setItem("local_brt_stations", JSON.stringify(DEFAULT_BRT_STATIONS));
  return DEFAULT_BRT_STATIONS;
}
