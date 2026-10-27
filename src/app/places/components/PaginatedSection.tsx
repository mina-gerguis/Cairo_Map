"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { PaginatedSectionProps } from "../types";
import PlaceCard from "./PlaceCard";
import { useGSAP, gsap } from "@/lib/gsap";

export default function PaginatedSection({
  title,
  places,
  setSelectedPlace,
  getCategoryColor,
  toggleFavorite,
  favoriteIds,
  showRating = false,
  emptyMessage,
  itemsPerPage = 6,
  forceThreeColumns = false,
}: PaginatedSectionProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(places.length / itemsPerPage);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPage(1);
  }, [places.length]);

  useGSAP(
    () => {
      const el = sectionRef.current;
      if (!el) return;
      const cards = el.querySelectorAll(".glass-card");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.04,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [page, places.length] }
  );

  if (places.length === 0 && !emptyMessage) return null;

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPlaces = places.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section ref={sectionRef} style={{ animation: "slide-in-section 0.5s ease both" }}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {places.length === 0 && emptyMessage ? (
        <div
          className="glass-panel"
          style={{
            padding: "28px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            className={forceThreeColumns ? "grid-3-cols" : ""}
            style={
              forceThreeColumns
                ? { width: "100%" }
                : {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "16px",
                    width: "100%",
                  }
            }
          >
            {paginatedPlaces.map((place) => (
              <div
                key={place.id}
                className="glass-card"
                onClick={() => setSelectedPlace(place)}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  width: "100%",
                  maxWidth: "320px",
                  flex: forceThreeColumns ? "unset" : "1 1 280px",
                }}
              >
                <PlaceCard
                  place={place}
                  getCategoryColor={getCategoryColor}
                  showRating={showRating}
                  toggleFavorite={toggleFavorite}
                  favoriteIds={favoriteIds}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
      <hr className="section-divider" />
    </section>
  );
}
