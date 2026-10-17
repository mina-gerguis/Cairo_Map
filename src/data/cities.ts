import { supabase } from "@/lib/supabase";

export interface CityLandmark {
  id: string;
  city_id: string;
  name: string;
  cover_image: string;
  description: string;
  type: string; // e.g., "معلم أثري", "متحف", "حديقة", "شاطئ", "ترفيه", "ثقافي"
  is_popular: boolean; // شائع ولا لا
  nearby_stations: (string | { name: string; distance?: string })[]; // المحطات القريبة مع المسافة
  images: string[]; // ألبوم الصور للمكان
  activities: string[]; // واقدر اعمل اي في المكان ده
}

export interface FamousCity {
  id: string;
  name: string;
  slug: string;
  cover_image: string;
  population: string; // السكان
  area: string; // المساحة
  density: string; // كثافة السكان
  temperature: string; // درجة الحرارة الحالية
  overview: string; // نبذة عن المدينة
  order_index?: number;
  landmarks?: CityLandmark[];
}

export const INITIAL_FAMOUS_CITIES: FamousCity[] = [];

// ── LOCAL STORAGE CITIES PERSISTENCE ──
const CITIES_STORAGE_KEY = "local_famous_cities";

export function getStoredCities(): FamousCity[] {
  if (typeof window === "undefined") return INITIAL_FAMOUS_CITIES;
  try {
    const raw = localStorage.getItem(CITIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(INITIAL_FAMOUS_CITIES));
      return INITIAL_FAMOUS_CITIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FAMOUS_CITIES;
  } catch {
    return INITIAL_FAMOUS_CITIES;
  }
}

export function saveStoredCities(cities: FamousCity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(cities));
    window.dispatchEvent(new Event("cities_updated"));
  } catch (err) {
    console.error("Error saving cities to localStorage:", err);
  }
}

// ── LOCAL STORAGE FAVORITES HELPERS ──
const FAVORITE_LANDMARKS_KEY = "cairo_map_favorite_landmarks";

export function getFavoriteLandmarkIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITE_LANDMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLandmarkFavorite(id: string): boolean {
  const ids = getFavoriteLandmarkIds();
  return ids.includes(id);
}

export function toggleLandmarkFavorite(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ids = getFavoriteLandmarkIds();
    let updated: string[] = [];
    let isAdded = false;
    if (ids.includes(id)) {
      updated = ids.filter((item) => item !== id);
      isAdded = false;
    } else {
      updated = [...ids, id];
      isAdded = true;
    }
    localStorage.setItem(FAVORITE_LANDMARKS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("favorites_updated"));

    // Sync asynchronously with Supabase DB for cross-device persistence
    if (supabase) {
      const client = supabase;
      client.auth.getUser().then(({ data }) => {
        const userId = data?.user?.id;
        if (userId) {
          if (isAdded) {
            client
              .from("favorite_places")
              .insert([{ user_id: userId, place_id: id }])
              .then();
          } else {
            client
              .from("favorite_places")
              .delete()
              .match({ user_id: userId, place_id: id })
              .then();
          }
        }
      });
    }

    return isAdded;
  } catch {
    return false;
  }
}

export async function syncUserFavoritesFromSupabase(userId: string): Promise<string[]> {
  if (typeof window === "undefined" || !supabase || !userId) return getFavoriteLandmarkIds();
  try {
    const { data } = await supabase
      .from("favorite_places")
      .select("place_id")
      .eq("user_id", userId);

    if (data) {
      const dbFavIds = data.map((item: { place_id: string | number }) => String(item.place_id));
      const localFavIds = getFavoriteLandmarkIds();
      const merged = Array.from(new Set([...localFavIds, ...dbFavIds]));
      localStorage.setItem(FAVORITE_LANDMARKS_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event("favorites_updated"));
      return merged;
    }
  } catch (e) {
    console.warn("Failed syncing favorites from Supabase DB:", e);
  }
  return getFavoriteLandmarkIds();
}

// ── LIVE TEMPERATURE FETCHER (Open-Meteo API) ──
export async function fetchLiveCityTemperature(cityName: string): Promise<string | null> {
  try {
    const knownCoords: Record<string, { lat: number; lon: number }> = {
      القاهرة: { lat: 30.0444, lon: 31.2357 },
      الإسكندرية: { lat: 31.2001, lon: 29.9187 },
      الجيزة: { lat: 30.0131, lon: 31.2089 },
      أسوان: { lat: 24.0889, lon: 32.8998 },
      الأقصر: { lat: 25.6872, lon: 32.6396 },
      "شرم الشيخ": { lat: 27.9158, lon: 34.3299 },
      الغردقة: { lat: 27.2579, lon: 33.8116 },
      بورسعيد: { lat: 31.2653, lon: 32.3019 },
      السويس: { lat: 29.9668, lon: 32.5498 },
      المنصورة: { lat: 31.0409, lon: 31.3785 },
      طنطا: { lat: 30.7865, lon: 31.0004 },
      الفيوم: { lat: 29.3084, lon: 30.8428 },
    };

    let lat: number;
    let lon: number;

    const trimmed = cityName.trim();
    if (knownCoords[trimmed]) {
      lat = knownCoords[trimmed].lat;
      lon = knownCoords[trimmed].lon;
    } else {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1`
      );
      if (!geoRes.ok) return null;
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) return null;
      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
    }

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.current_weather && typeof data.current_weather.temperature === "number") {
      const tempC = Math.round(data.current_weather.temperature);
      return `${tempC}°م`;
    }
  } catch (e) {
    console.warn("Failed to fetch live weather for", cityName, e);
  }
  return null;
}
