export interface AdminBrtRoute {
  destination: string;
  fare: string;
  vehicleType?: string;
  duration?: string;
  via?: string;
  notes?: string;
  description?: string;
}

export interface AdminBrtStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة";
  map_url?: string;
  type?: string;
  status?: string;
  landmarks?: string[];
  routes: AdminBrtRoute[];
  created_at?: string;
}

export interface BrtStationFormData {
  name: string;
  location: string;
  governorate: string;
  sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة";
  map_url: string;
  type: string;
  status: string;
  landmarksText: string;
}

export interface ParsedExcelBrtStation {
  name: string;
  location: string;
  governorate: string;
  sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة";
  map_url: string;
  type: string;
  status: string;
  landmarks: string[];
  routes: AdminBrtRoute[];
  isValid: boolean;
  validationError?: string;
}
