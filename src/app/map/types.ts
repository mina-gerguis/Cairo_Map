import { Place, Branch } from "@/data/places";

export interface MapPlacePoint {
  id: string;
  placeId: string;
  branchId?: string;
  isBranch: boolean;
  name: string;
  branchName?: string;
  category: string;
  categoryLabel: string;
  subCategories?: string[];
  latitude: number;
  longitude: number;
  rating?: number;
  reviewsCount?: number;
  fullAddress: string;
  city?: string;
  governorate?: string;
  phones: string[];
  googleMapsUrl?: string;
  images: string[];
  workingHours?: string;
  isOpenNow?: boolean;
  distanceKm?: number;
  features?: string[];
  originalPlace: Place;
  originalBranch?: Branch;
}

export type MapLayerType = "dark" | "light" | "streets" | "satellite";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}
