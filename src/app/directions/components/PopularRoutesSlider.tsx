import React, { RefObject } from "react";
import CardsSlider, { CardsSliderItem } from "@/components/common/CardsSlider";
import { QuickRouteItem } from "../types";

interface PopularRoutesSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  routes: QuickRouteItem[];
  onSelectRoute: (from: string, to: string) => void;
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

  const sliderItems: CardsSliderItem[] = routes.map((item, idx) => ({
    id: `${item.from}-${item.to}-${idx}`,
    title: item.label,
    subtitle: `من ${item.from} إلى ${item.to}`,
    icon: item.icon,
    accentColor: item.glowColor || "#3b82f6",
    onClick: () => handleRouteClick(item.from, item.to),
    ariaLabel: `اختيار مسار ${item.label}`,
  }));

  return (
    <CardsSlider
      containerRef={sliderRef}
      title="أشهر المسارات"
      titleIcon={<i className="bx bx-trending-up text-warning" />}
      items={sliderItems}
    />
  );
}

