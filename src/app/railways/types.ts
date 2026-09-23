export interface TrainClass {
  name: string;
  price: string;
  features: string;
}

export interface RailwayStop {
  id?: string;
  name: string;
  status: "تعمل" | "تشغيل فعلي" | "تحت الإنشاء";
}

export interface RailwayRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  duration: string;
  stops: RailwayStop[];
  classes: TrainClass[];
  tips: string;
}

export type ReportScope = "general" | "route" | "station";

export interface ReportProblemOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  badgeColor: string;
}

export interface StationListItem {
  name: string;
  routeName: string;
  routeId: string;
}

export interface RouteIconData {
  icon: string;
  bgGradient: string;
  glowColor: string;
}

export interface BookingMethod {
  title: string;
  desc: string;
  links: {
    name: string;
    url: string;
    icon: string;
    iconColor?: string;
  }[];
}
