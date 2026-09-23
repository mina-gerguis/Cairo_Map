export interface BusCompany {
  name: string;
  phone: string;
  type: string;
  logo?: string;
}

export interface BusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  companies: BusCompany[];
  destinations: string[];
  description: string;
  map_url: string;
}

export type ReportProblemType =
  | "phone"
  | "company"
  | "destinations"
  | "location"
  | "closed"
  | "missing_station"
  | "other";

export interface ReportProblemOption {
  id: ReportProblemType;
  label: string;
  icon?: string;
}
