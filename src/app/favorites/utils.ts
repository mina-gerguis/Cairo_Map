import { getFavoriteLandmarkIds, getStoredCities } from "@/data/cities";
import { FavoriteItem } from "./types";

/**
 * Returns favorited landmarks from stored cities as structured FavoriteItem objects.
 */
export function getFavoritedLandmarksAsItems(): FavoriteItem[] {
  const favIds = getFavoriteLandmarkIds();
  if (!favIds || favIds.length === 0) return [];

  const cities = getStoredCities();
  const result: FavoriteItem[] = [];

  cities.forEach((city) => {
    (city.landmarks || []).forEach((lm) => {
      if (favIds.includes(lm.id)) {
        result.push({
          id: lm.id,
          name: lm.name,
          category: "landmark",
          categoryLabel: "معلم سياحي",
          briefLocation: `مدينة ${city.name}`,
          fullAddress: lm.description,
          images: lm.images && lm.images.length > 0 ? lm.images : [lm.cover_image],
          isLandmark: true,
          landmarkObj: lm,
          cityObj: city,
        });
      }
    });
  });

  return result;
}

/**
 * Safely extracts the display category of a favorite item.
 */
export function getItemCategoryLabel(item: FavoriteItem): string {
  return item.categoryLabel || item.category || "";
}
