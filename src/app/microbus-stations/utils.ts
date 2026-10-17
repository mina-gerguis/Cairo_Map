import { DEFAULT_MICROBUS_STATIONS } from "./constants";
import { MicrobusStation } from "./types";

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
 * Retrieves cached local microbus stations from localStorage with fallback to default stations
 */
export function getLocalMicrobusStations(): MicrobusStation[] {
  if (typeof window === "undefined") return DEFAULT_MICROBUS_STATIONS;
  const local = localStorage.getItem("local_microbus_stations");
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_MICROBUS_STATIONS;
    }
  }
  localStorage.setItem("local_microbus_stations", JSON.stringify(DEFAULT_MICROBUS_STATIONS));
  return DEFAULT_MICROBUS_STATIONS;
}
