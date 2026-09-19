export interface MicrobusRoute {
  destination: string;
  fare: string;
  vehicleType: string;
  notes?: string;
  via?: string;
  type?: string;
  lastUpdated?: string;
  duration?: string;
  description?: string;
}

export interface MicrobusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  routes: MicrobusRoute[];
  map_url: string;
}

export interface RouteInteraction {
  id: string;
  user_id: string;
  station_name: string;
  route_destination: string;
  interaction_type: "like" | "dislike" | "report";
  report_reason?: "fare" | "via" | "location" | "other";
  comment?: string;
  created_at?: string;
}

export interface VoteStats {
  likes: number;
  dislikes: number;
  userVote?: "like" | "dislike";
}

export interface StationPaletteItem {
  color: string;
  glow: string;
  icon: string;
}
