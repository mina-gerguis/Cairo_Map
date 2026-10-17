import { AdminBrtStation, AdminBrtRoute } from "./types";
import { DEFAULT_BRT_ADMIN_STATIONS, createEmptyBrtRoute } from "./constants";

const LOCAL_STORAGE_KEY = "local_brt_stations";

/**
 * Checks if a given string is a valid UUID
 */
export function isUUID(str: unknown): boolean {
  if (typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Retrieves cached local BRT stations from localStorage with fallback to default stations
 */
export function getLocalBrtStations(): AdminBrtStation[] {
  if (typeof window === "undefined") return DEFAULT_BRT_ADMIN_STATIONS;
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      return DEFAULT_BRT_ADMIN_STATIONS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BRT_ADMIN_STATIONS));
  return DEFAULT_BRT_ADMIN_STATIONS;
}

/**
 * Persists BRT stations array to localStorage
 */
export function saveLocalBrtStations(data: AdminBrtStation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Sanitizes and normalizes an array of routes for forms
 */
export function normalizeBrtRoutes(routes: unknown): AdminBrtRoute[] {
  if (!Array.isArray(routes) || routes.length === 0) {
    return [createEmptyBrtRoute()];
  }

  return routes.map((r: any) => ({
    destination: r.destination || "",
    fare: r.fare || "10",
    vehicleType: r.vehicleType || "أتوبيس ترددي كهربائي سريع",
    notes: r.notes || r.description || "",
    via: r.via || "",
    duration: r.duration || ""
  }));
}

/**
 * Validates BRT routes before form submission
 * Returns error string if invalid, null otherwise
 */
export function validateBrtRoutes(routes: AdminBrtRoute[]): string | null {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (!route.destination.trim()) {
      return `يرجى تحديد وجهة المسار رقم ${i + 1}`;
    }
    if (!route.fare.trim()) {
      return `يرجى تحديد سعر التذكرة للمسار رقم ${i + 1}`;
    }
  }
  return null;
}

/**
 * Filters stations based on search query matching name, location, governorate, sector, landmarks or destination
 */
export function filterBrtStations(
  stations: AdminBrtStation[],
  query: string,
  sectorFilter: string = "all"
): AdminBrtStation[] {
  let list = stations;

  if (sectorFilter && sectorFilter !== "all") {
    list = list.filter((s) => s.sector === sectorFilter);
  }

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return list;

  return list.filter((item) => {
    const nameMatch = item.name?.toLowerCase().includes(trimmed);
    const locationMatch = item.location?.toLowerCase().includes(trimmed);
    const govMatch = item.governorate?.toLowerCase().includes(trimmed);
    const sectorMatch = item.sector?.toLowerCase().includes(trimmed);
    const statusMatch = item.status?.toLowerCase().includes(trimmed);
    const typeMatch = item.type?.toLowerCase().includes(trimmed);
    const landmarkMatch = Array.isArray(item.landmarks) && item.landmarks.some((l) => l.toLowerCase().includes(trimmed));
    const routeMatch = Array.isArray(item.routes) && item.routes.some((r) =>
      r.destination?.toLowerCase().includes(trimmed) || r.via?.toLowerCase().includes(trimmed)
    );

    return Boolean(nameMatch || locationMatch || govMatch || sectorMatch || statusMatch || typeMatch || landmarkMatch || routeMatch);
  });
}
