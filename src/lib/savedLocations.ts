"use client";

import { supabase } from "@/lib/supabase";

export interface SavedLocation {
  id: string;
  name: string;
  category: string;
  notes?: string;
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  address?: string;
  timestamp: number; // Date.now()
  formattedDate: string;
  formattedTime: string;
  googleMapsUrl: string;
  directionsUrl: string;
  userId?: string;
}

export const SAVED_LOCATIONS_STORAGE_KEY = "cairo_map_saved_user_places";

export const LOCATION_CATEGORIES = [
  { id: "parking", label: "ركنة سيارة", icon: "🚗" },
  { id: "home", label: "المنزل", icon: "🏠" },
  { id: "work", label: "العمل", icon: "💼" },
  { id: "cafe", label: "كافيه / مطعم", icon: "☕" },
  { id: "meeting", label: "نقطة لقاء", icon: "📍" },
  { id: "shopping", label: "تسوق", icon: "🛒" },
  { id: "other", label: "مكان عام", icon: "📌" },
];

/**
 * Format a Date object into Arabic date string (e.g. الإثنين، 5 أكتوبر 2026)
 */
export function formatArabicDate(date: Date): string {
  try {
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Format a Date object into Arabic time string (e.g. 01:45 م)
 */
export function formatArabicTime(date: Date): string {
  try {
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleTimeString();
  }
}

/**
 * Get relative time label in Arabic (e.g. منذ لحظات، منذ ساعتين)
 */
export function getRelativeTimeArabic(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "الآن / منذ لحظات";
  if (minutes === 1) return "منذ دقيقة واحدة";
  if (minutes === 2) return "منذ دقيقتين";
  if (minutes <= 10) return `منذ ${minutes} دقائق`;
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours === 1) return "منذ ساعة واحدة";
  if (hours === 2) return "منذ ساعتين";
  if (hours <= 10) return `منذ ${hours} ساعات`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days === 1) return "أمس";
  if (days === 2) return "منذ يومين";
  if (days <= 10) return `منذ ${days} أيام`;
  return `منذ ${days} يوم`;
}

/**
 * Generate standard Google Maps URLs
 */
export function createGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function createGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Map raw database row to SavedLocation
 */
function mapDbRowToSavedLocation(row: any): SavedLocation {
  const dateObj = row.created_at ? new Date(row.created_at) : new Date();
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);

  return {
    id: row.id,
    name: row.name || "موقعي المحفوظ",
    category: row.category || "other",
    notes: row.notes || undefined,
    latitude: lat,
    longitude: lng,
    accuracy: row.accuracy ? Math.round(row.accuracy * 10) / 10 : 0,
    address: row.address || undefined,
    timestamp: dateObj.getTime(),
    formattedDate: formatArabicDate(dateObj),
    formattedTime: formatArabicTime(dateObj),
    googleMapsUrl: createGoogleMapsUrl(lat, lng),
    directionsUrl: createGoogleMapsDirectionsUrl(lat, lng),
    userId: row.user_id,
  };
}

/**
 * Retrieve saved locations for an authenticated user from Supabase
 */
export async function fetchUserSavedLocations(userId: string): Promise<SavedLocation[]> {
  if (!userId) return [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("saved_user_places")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapDbRowToSavedLocation);
        // Cache to localStorage for offline access
        if (typeof window !== "undefined") {
          localStorage.setItem(`${SAVED_LOCATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch (err) {
      console.warn("Could not fetch user saved places from Supabase, checking local cache:", err);
    }
  }

  // Fallback to cache if Supabase table is not yet migrated or offline
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`${SAVED_LOCATIONS_STORAGE_KEY}_${userId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return [];
}

/**
 * Save a new location to the user's account in Supabase
 */
export async function addUserSavedLocation(
  userId: string,
  data: {
    name: string;
    category?: string;
    notes?: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  }
): Promise<SavedLocation> {
  const now = new Date();
  const lat = Number(data.latitude.toFixed(6));
  const lng = Number(data.longitude.toFixed(6));
  const finalName = data.name.trim() || "موقعي المحفوظ";
  const finalCategory = data.category || "other";
  const finalNotes = data.notes?.trim() || null;
  const finalAddress = data.address?.trim() || null;

  let savedItem: SavedLocation | null = null;

  if (supabase && userId) {
    try {
      const { data: dbData, error } = await supabase
        .from("saved_user_places")
        .insert({
          user_id: userId,
          name: finalName,
          category: finalCategory,
          notes: finalNotes,
          latitude: lat,
          longitude: lng,
          accuracy: data.accuracy,
          address: finalAddress,
          created_at: now.toISOString(),
        })
        .select()
        .single();

      if (!error && dbData) {
        savedItem = mapDbRowToSavedLocation(dbData);
      } else if (error) {
        console.warn("Supabase insert error (falling back to local):", error.message);
      }
    } catch (err) {
      console.warn("Supabase network error:", err);
    }
  }

  // Fallback / local caching
  if (!savedItem) {
    savedItem = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: finalName,
      category: finalCategory,
      notes: finalNotes || undefined,
      latitude: lat,
      longitude: lng,
      accuracy: Math.round(data.accuracy * 10) / 10,
      address: finalAddress || undefined,
      timestamp: now.getTime(),
      formattedDate: formatArabicDate(now),
      formattedTime: formatArabicTime(now),
      googleMapsUrl: createGoogleMapsUrl(lat, lng),
      directionsUrl: createGoogleMapsDirectionsUrl(lat, lng),
      userId,
    };
  }

  // Update local user cache
  if (typeof window !== "undefined" && userId) {
    try {
      const cached = localStorage.getItem(`${SAVED_LOCATIONS_STORAGE_KEY}_${userId}`);
      const list = cached ? JSON.parse(cached) : [];
      const updated = [savedItem, ...list.filter((x: SavedLocation) => x.id !== savedItem!.id)];
      localStorage.setItem(`${SAVED_LOCATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("saved_locations_updated", { detail: updated }));
    } catch {}
  }

  return savedItem;
}

/**
 * Delete a saved location from user's account in Supabase
 */
export async function deleteUserSavedLocation(
  userId: string,
  locationId: string
): Promise<boolean> {
  if (supabase && userId) {
    try {
      await supabase
        .from("saved_user_places")
        .delete()
        .match({ id: locationId, user_id: userId });
    } catch (err) {
      console.warn("Supabase delete error:", err);
    }
  }

  // Update local cache
  if (typeof window !== "undefined" && userId) {
    try {
      const cached = localStorage.getItem(`${SAVED_LOCATIONS_STORAGE_KEY}_${userId}`);
      if (cached) {
        const list = JSON.parse(cached);
        const updated = list.filter((item: SavedLocation) => item.id !== locationId);
        localStorage.setItem(`${SAVED_LOCATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("saved_locations_updated", { detail: updated }));
      }
    } catch {}
  }

  return true;
}

/**
 * Reverse geocode coordinates to Arabic address using OpenStreetMap Nominatim
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`,
      {
        headers: { "User-Agent": "CairoMapApp/1.0" },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return undefined;
    const json = await res.json();
    return json?.display_name || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get user location with maximum accuracy (enableHighAccuracy + sample settle)
 */
export function getHighAccuracyCoordinates(
  onProgress?: (status: { message: string; accuracy?: number }) => void
): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("متصفحك لا يدعم تحديد الموقع الجغرافي."));
      return;
    }

    onProgress?.({ message: "جاري الاتصال بالأقمار الصناعية (GPS)..." });

    let bestReading: { latitude: number; longitude: number; accuracy: number } | null = null;
    let watchId: number | null = null;
    let timeoutId: any = null;

    const finalize = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (bestReading) {
        resolve(bestReading);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          (err) => {
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      }
    };

    // Watch for 6 seconds to settle on the lowest accuracy reading
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        onProgress?.({
          message: `تم التقاط إشارة GPS بدقة ±${accuracy.toFixed(1)} متر...`,
          accuracy,
        });

        if (!bestReading || accuracy < bestReading.accuracy) {
          bestReading = { latitude, longitude, accuracy };
        }

        if (accuracy <= 8) {
          finalize();
        }
      },
      (err) => {
        if (!bestReading) {
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            },
            (fallbackErr) => {
              reject(fallbackErr);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          finalize();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    timeoutId = setTimeout(() => {
      finalize();
    }, 6000);
  });
}
