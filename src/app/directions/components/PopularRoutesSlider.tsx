"use client";

import React, { RefObject } from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { QuickRouteItem } from "../types";

interface PopularRoutesSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  routes: QuickRouteItem[];
  onSelectRoute: (from: string, to: string) => void;
}

// Fallback high quality Unsplash photos for prominent destinations
const ROUTE_IMAGES_MAP: Record<string, string> = {
  "معرض الكتاب": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "التجمع الخامس": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
  "6 أكتوبر": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
  "الإسكندرية": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
  "محطة مصر": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80",
  "رمسيس": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&auto=format&fit=crop&q=80",
  "العاشر من رمضان": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&auto=format&fit=crop&q=80",
  "مدينة نصر": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&auto=format&fit=crop&q=80",
  "المنصورة": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
  "الزقازيق": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
  "بنها": "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80",
};

const DEFAULT_ROUTE_IMAGES = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
];

function getRouteImage(route: QuickRouteItem, idx: number): string {
  for (const [key, url] of Object.entries(ROUTE_IMAGES_MAP)) {
    if (route.to.includes(key) || route.from.includes(key) || route.label.includes(key)) {
      return url;
    }
  }
  return DEFAULT_ROUTE_IMAGES[idx % DEFAULT_ROUTE_IMAGES.length];
}

export default function PopularRoutesSlider({
  sliderRef,
  routes,
  onSelectRoute,
}: PopularRoutesSliderProps) {
  if (!routes || routes.length === 0) return null;

  const handleRouteClick = (from: string, to: string) => {
    onSelectRoute(from, to);
    setTimeout(() => {
      const targetEl = document.getElementById("directions-results-section");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <section
      ref={sliderRef}
      className="w-full my-4"
      aria-label="أشهر المسارات"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100 flex items-center gap-2">
          <i className="bx bx-trending-up text-zinc-400 text-xl" />
          <span>أشهر المسارات والوجهات</span>
        </h2>
        <span className="text-xs text-zinc-400 font-medium">
          تصفح سريع وتلقائي
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-2xl bg-black/20 p-1 border border-white/5">
        <InfiniteSlider
          duration={38}
          durationOnHover={95}
          gap={16}
          direction="horizontal"
          className="py-2"
        >
          {routes.map((item, idx) => {
            const imageUrl = getRouteImage(item, idx);
            const cardKey = `pop-route-${item.from}-${item.to}-${idx}`;

            return (
              <button
                key={cardKey}
                type="button"
                dir="rtl"
                onClick={() => handleRouteClick(item.from, item.to)}
                className="group relative flex flex-col w-52 sm:w-60 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/85 backdrop-blur-md p-2.5 transition-all duration-300 hover:border-white/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/70 cursor-pointer text-right outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={`اختيار مسار ${item.label}`}
              >
                {/* Image / Visual on Top */}
                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-zinc-900">
                  <img
                    src={imageUrl}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Subtle Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badge: Vehicle 2D icon or Trending badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt="وسيلة المواصلات"
                        className="w-4 h-4 object-contain"
                      />
                    )}
                    {item.isTrending && (
                      <span className="text-[11px] font-semibold text-zinc-200">
                        شائع
                      </span>
                    )}
                  </div>

                  {/* Search count pill on bottom left of image */}
                  {item.subtitle && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-medium text-zinc-300 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
                      {item.subtitle}
                    </span>
                  )}
                </div>

                {/* Destination name & Details Underneath */}
                <div className="pt-2.5 pb-1 px-1 flex flex-col gap-0.5">
                  <h3 className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
                    {item.label}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <i className="fa-solid fa-location-dot text-[11px] text-zinc-400" />
                    <span className="truncate">{item.from} إلى {item.to}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </InfiniteSlider>
      </div>
    </section>
  );
}
