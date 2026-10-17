export interface AdminMicrobusRoute {
  destination: string;
  fare: string;
  vehicleType: string;
  description?: string;
  notes?: string;
  via?: string;
  type?: "official" | "normal" | string;
  lastUpdated?: string;
  duration?: string;
}

export interface AdminMicrobusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  routes: AdminMicrobusRoute[];
  map_url: string;
  created_at?: string;
}

export interface MicrobusStationFormData {
  name: string;
  location: string;
  governorate: string;
  map_url: string;
}
