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
  onSelectRoute
}: PopularRoutesSliderProps) {
  if (!routes || routes.length === 0) return null;

  return (
    <div
      ref={sliderRef}
      className="hide-scrollbar"
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        padding: "4px 4px 16px 4px",
        marginBottom: "16px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        scrollSnapType: "x mandatory",
      }}
    >
      {routes.map((item, idx) => {
        const isTop = idx === 0;
        const isSecond = idx === 1;

        return (
          <button
            key={`${item.from}-${item.to}-${idx}`}
            type="button"
            onClick={() => onSelectRoute(item.from, item.to)}
            style={{
              background: `radial-gradient(circle at 100% 0%, ${item.glowColor}98 20%, transparent 55%), var(--bgPrimary)`,
              border: isTop ? `1px solid ${item.glowColor}` : "1px solid var(--borderSecondary)",
              borderRadius: "var(--ra-6)",
              padding: "14px 16px",
              cursor: "pointer",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
              textAlign: "right",
              flex: "0 0 auto",
              minWidth: "165px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              scrollSnapAlign: "start",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Title & Subtitle */}
            <div style={{ textAlign: "right", width: "100%", marginTop: "auto", position: "relative", zIndex: 1 }}>
              <div
                style={{
                  color: "var(--textPrimary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  lineHeight: "1.3",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
