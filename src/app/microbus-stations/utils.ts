import { DEFAULT_MICROBUS_STATIONS } from "./constants";
import { MicrobusStation } from "./types";

/**
 * Normalizes Arabic text for flexible matching across variations (alif, taa marbouta, diacritics, etc.)
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/ـ/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Calculates straight line distance in km between two GPS coordinates using Haversine formula
 */
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
