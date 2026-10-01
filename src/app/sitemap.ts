import type { MetadataRoute } from "next";
import { initialPlaces } from "@/data/places";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.vercel.app";
  const currentDate = new Date();

  // Primary static routes
  const mainRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/metro", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/directions", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/places", priority: 0.95, changeFrequency: "daily" as const },
    { path: "/monorail", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/lrt", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/brt", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/railways", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/airports", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/bus-stations", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/microbus-stations", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/parking", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/directory", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/live-updates", priority: 0.8, changeFrequency: "hourly" as const },
    { path: "/ai-planner", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.85, changeFrequency: "daily" as const },
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

  // Places mapping
  const placeIdsSet = new Set<string>();
  (initialPlaces || []).forEach((p) => placeIdsSet.add(p.id));

  if (supabase) {
    try {
      const { data: dbPlaces } = await supabase
        .from("places")
        .select("id, updated_at")
        .limit(2000);

      if (dbPlaces) {
        dbPlaces.forEach((p) => placeIdsSet.add(p.id));
      }
    } catch {
      // Fallback to static
    }
  }

  const placeUrls: MetadataRoute.Sitemap = Array.from(placeIdsSet).map((id) => ({
    url: `${siteUrl}/places/${id}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog articles mapping
  const blogSlugs = new Set<string>(["cairo-transportation-guide"]);
  if (supabase) {
    try {
      const { data: dbBlogs } = await supabase
        .from("blogs")
        .select("slug, updated_at")
        .eq("status", "published")
        .limit(500);

      if (dbBlogs) {
        dbBlogs.forEach((b) => {
          if (b.slug) blogSlugs.add(b.slug);
        });
      }
    } catch {
      // Fallback
    }
  }

  const blogUrls: MetadataRoute.Sitemap = Array.from(blogSlugs).map((slug) => ({
    url: `${siteUrl}/blog/${encodeURIComponent(slug)}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticUrls, ...placeUrls, ...blogUrls];
}
