import React, { RefObject } from "react";
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

  return (
    <div ref={sliderRef} className="mt-2 mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-md font-extrabold text-primary flex items-center gap-1.5 m-0 font-sub pb-2">
          <i className="bx bx-trending-up text-warning" />
          <span>أشهر المسارات</span>
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pt-1.5 px-1 pb-3.5 no-scrollbar snap-x">
        {routes.map((item, idx) => {
          const glow = item.glowColor || "#3b82f6";

          return (
            <button
              key={`${item.from}-${item.to}-${idx}`}
              type="button"
              onClick={() => handleRouteClick(item.from, item.to)}
              className="shrink-0 min-w-44 max-w-56 rounded-lg p-3.5 px-4 cursor-pointer outline-none text-right flex flex-col items-stretch snap-start relative overflow-hidden backdrop-blur-md border border-glass  transition select-none"
              style={{
                background: `radial-gradient(135px circle at top right, ${glow}28 0%, ${glow}0a 45%, transparent 75%), var(--bg-glass)`,
              }}
              aria-label={`اختيار مسار ${item.label}`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-10 h-10">
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <i
                      className="fa-solid fa-route"
                      style={{ color: glow, fontSize: "1rem" }}
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="text-primary font-sub font-bold text-sm leading-snug truncate">
                  {item.label}
                </div>
                <div className="text-muted font-body font-medium text-xs mt-1 truncate">
                  من {item.from} إلى {item.to}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
