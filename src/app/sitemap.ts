import type { MetadataRoute } from "next";
import { initialPlaces } from "@/data/places";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.net";
  const currentDate = new Date();

  // Primary static routes
  const mainRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/metro", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/directions", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/places", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/monorail", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/lrt", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/railways", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/airports", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/bus-stations", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/microbus-stations", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/intercity-buses", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/ports", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/parking", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/directory", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/live-updates", priority: 0.8, changeFrequency: "hourly" as const },
    { path: "/ai-planner", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/help", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/propose-place", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const staticUrls: MetadataRoute.Sitemap = mainRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Places pages
  const placeUrls: MetadataRoute.Sitemap = (initialPlaces || []).map((place) => ({
    url: `${siteUrl}/places/${place.id}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...placeUrls];
}
