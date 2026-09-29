import { RefObject } from "react";

export interface BrtRoute {
  destination: string;
  fare: string;
  vehicleType?: string;
  duration?: string;
  via?: string;
  notes?: string;
  description?: string;
}

export interface BrtStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة";
  map_url?: string;
  type?: string;
  status?: string;
  landmarks?: string[];
  routes: BrtRoute[];
}

export interface StationPaletteItem {
  color: string;
  glow: string;
  icon: string;
}

export interface VoteStats {
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
}

export interface RouteInteraction {
  id: string;
  user_id: string;
  station_name: string;
  route_destination: string;
  interaction_type: "like" | "dislike" | "report";
  report_reason?: "fare" | "via" | "location" | "other";
  comment?: string;
  created_at: string;
}
