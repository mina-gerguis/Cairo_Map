import { RailwayRoute, RouteIconData } from "./types";
import { RAILWAY_ROUTES, ROUTE_COLORS, COLOR_PALETTE } from "./constants";

export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .trim()
    .toLowerCase();
}

export function getRouteColor(routeId: string, index: number): string {
  if (ROUTE_COLORS[routeId]) {
    return ROUTE_COLORS[routeId];
  }
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export function getRouteShortName(route: RailwayRoute): string {
  if (route.id === "cairo-alex") return "خط الإسكندرية";
  if (route.id === "cairo-aswan") return "خط الصعيد";
  if (route.id === "cairo-portsaid") return "خط القناة";
  if (route.id === "cairo-mansoura") return "خط الدلتا";

  const match = route.name.match(/\((خط [^)]+)\)/);
  if (match) {
    return match[1];
  }

  if (route.name.includes("⇆")) {
    const parts = route.name.split("⇆");
    return `خط ${parts[1].trim()}`;
  }

  if (route.name.includes("-")) {
    const parts = route.name.split("-");
    return `خط ${parts[parts.length - 1].trim()}`;
  }

  return route.name;
}

export function getRouteIconData(routeId: string, index: number, routeColor: string): RouteIconData {
  if (routeId === "cairo-alex") {
    return {
      icon: "fa-solid fa-train",
      bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      glowColor: "#ef4444"
    };
  }
  if (routeId === "cairo-aswan") {
    return {
      icon: "fa-solid fa-mountain-sun",
      bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      glowColor: "#f59e0b"
    };
  }
  if (routeId === "cairo-portsaid") {
    return {
      icon: "fa-solid fa-anchor",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      glowColor: "#3b82f6"
    };
  }
  if (routeId === "cairo-mansoura") {
    return {
      icon: "fa-solid fa-leaf",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      glowColor: "#10b981"
    };
  }

  const defaultIcons = ["fa-solid fa-train-subway", "fa-solid fa-train", "fa-solid fa-compass", "fa-solid fa-route"];
  return {
    icon: defaultIcons[index % defaultIcons.length],
    bgGradient: `linear-gradient(135deg, ${routeColor} 0%, ${routeColor}cc 100%)`,
    glowColor: routeColor
  };
}

export function getLocalRoutes(): RailwayRoute[] {
  if (typeof window === "undefined") return RAILWAY_ROUTES;
  const local = localStorage.getItem("local_railways_routes");
  if (!local) {
    localStorage.setItem("local_railways_routes", JSON.stringify(RAILWAY_ROUTES));
    return RAILWAY_ROUTES;
  }
  try {
    const parsed = JSON.parse(local);
    return parsed.map((route: any) => {
      if (Array.isArray(route.stops)) {
        route.stops = route.stops.map((stop: any) => {
          if (typeof stop === "string") {
            return { name: stop, status: "تشغيل فعلي" };
          }
          return { name: stop.name, status: stop.status || "تشغيل فعلي" };
        });
      } else {
        route.stops = [];
      }
      return route;
    });
  } catch {
    return RAILWAY_ROUTES;
  }
}
