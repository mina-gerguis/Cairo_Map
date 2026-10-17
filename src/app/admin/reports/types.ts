export type UnifiedSource = "feedback" | "place" | "contact" | "microbus";

export interface UserProfileInfo {
  full_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  avatar_url?: string;
}

export interface UnifiedReport {
  id: string;
  source: UnifiedSource;
  user_id?: string;
  title: string;
  content: string;
  category?: string | null;
  status: string; // 'pending' | 'reviewed' | 'action_taken' | 'accepted' | 'rejected' | 'replied' | 'retracted'
  admin_reply: string | null;
  image_url: string | null;
  created_at: string;
  updated_at?: string;
  user_profile?: UserProfileInfo | null;

  // Place report specific
  place_id?: string;
  place_name?: string;
  problem_type?: string;
  details?: any;

  // Contact message specific
  first_name?: string;
  last_name?: string;
  sender_email?: string;
  sender_phone?: string;
  subject?: string;

  // Microbus / Route specific
  route_id?: string;
  station_id?: string;
  report_reason?: string;
  rating?: number;

  // Feedback specific
  feedback_type?: "suggestion" | "bug";
}

export type CategoryFilterType =
  | "all"
  | "places"
  | "contacts"
  | "microbus"
  | "bus_stations"
  | "brt"
  | "metro"
  | "monorail"
  | "lrt"
  | "railways"
  | "airports"
  | "ports"
  | "parking"
  | "directory"
  | "suggestions"
  | "bugs"
  | "routes";

export type StatusFilterType = "all" | "pending" | "reviewed" | "action_taken" | "rejected";

export interface IncomingReportsStats {
  total: number;
  pending: number;
  reviewed: number;
  actionTaken: number;
  placesCount: number;
  contactsCount: number;
  microbusCount: number;
  busStationsCount: number;
  brtCount: number;
  metroCount: number;
  monorailCount: number;
  lrtCount: number;
  railwayCount: number;
  airportsCount: number;
  portsCount: number;
  parkingCount: number;
  directoryCount: number;
  bugsCount: number;
  suggestionsCount: number;
  routesCount: number;
}

export interface ParkingProposalData {
  feedbackId: string;
  feedbackUserId?: string;
  name: string;
  area: string;
  address: string;
  nearestMetro: string;
  type: string;
  hourlyRate: number;
  maxDailyRate: string;
  capacity: number;
  hours: string;
  features: string;
  mapLocationLink: string;
}

export interface DeletePlaceDbData {
  placeId: string;
  placeName: string;
  reportId: string;
}
