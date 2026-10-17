import { AdminMicrobusStation, AdminMicrobusRoute } from "./types";
import { DEFAULT_MICROBUS_STATIONS, createEmptyRoute } from "./constants";

const LOCAL_STORAGE_KEY = "local_microbus_stations";

/**
 * Checks if a given string is a valid UUID
 */
export function isUUID(str: unknown): boolean {
  if (typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Retrieves cached local microbus stations from localStorage with fallback to default stations
 */
export function getLocalMicrobusStations(): AdminMicrobusStation[] {
  if (typeof window === "undefined") return DEFAULT_MICROBUS_STATIONS;
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      return DEFAULT_MICROBUS_STATIONS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MICROBUS_STATIONS));
  return DEFAULT_MICROBUS_STATIONS;
}

/**
 * Persists microbus stations array to localStorage
 */
export function saveLocalMicrobusStations(data: AdminMicrobusStation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Sanitizes and normalizes an array of routes for forms
 */
export function normalizeRoutes(routes: unknown): AdminMicrobusRoute[] {
  if (!Array.isArray(routes) || routes.length === 0) {
    return [createEmptyRoute()];
  }

  return routes.map((r: any) => ({
    destination: r.destination || "",
    fare: r.fare || "",
    vehicleType: r.vehicleType || "ميكروباص",
    description: r.description || r.notes || "",
    via: r.via || "",
    type: r.type || "official",
    lastUpdated: r.lastUpdated || new Date().toISOString().split("T")[0],
    duration: r.duration || ""
  }));
}

/**
 * Validates routes before form submission
 * Returns error string if invalid, null otherwise
 */
export function validateRoutes(routes: AdminMicrobusRoute[]): string | null {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (!route.destination.trim()) {
      return `يرجى تحديد وجهة المسار رقم ${i + 1}`;
    }
    if (!route.fare.trim()) {
      return `يرجى تحديد الأجرة للمسار رقم ${i + 1}`;
    }
  }
  return null;
}

/**
 * Filters stations based on search query matching name, location, or governorate
 */
export function filterMicrobusStations(
  stations: AdminMicrobusStation[],
  query: string
): AdminMicrobusStation[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return stations;

  return stations.filter((item) => {
    const nameMatch = item.name?.toLowerCase().includes(trimmed);
    const locationMatch = item.location?.toLowerCase().includes(trimmed);
    const govMatch = item.governorate?.toLowerCase().includes(trimmed);
    return Boolean(nameMatch || locationMatch || govMatch);
  });
}
