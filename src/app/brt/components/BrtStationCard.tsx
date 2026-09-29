import React from "react";
import { BrtStation, StationPaletteItem, VoteStats } from "../types";
import BrtRouteItem from "./BrtRouteItem";
import styles from "../brt.module.css";

interface BrtStationCardProps {
  station: BrtStation;
  palette: StationPaletteItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedRouteKey: string | null;
  onToggleRoute: (routeKey: string) => void;
  getRouteVotes: (stationName: string, destination: string) => VoteStats;
  onVoteRoute: (stationName: string, destination: string, type: "like" | "dislike") => void;
  onOpenReport: (stationName: string, destination: string) => void;
  hasQuery: boolean;
  hasDirectMatches: boolean;
}

export default function BrtStationCard({
  station,
  palette,
  isExpanded,
  onToggleExpand,
  expandedRouteKey,
  onToggleRoute,
  getRouteVotes,
  onVoteRoute,
  onOpenReport,
  hasQuery,
  hasDirectMatches,
}: BrtStationCardProps) {
  const routesCount = Array.isArray(station.routes) ? station.routes.length : 0;

  return (
    <div
      id={`station-${station.name}`}
      className={styles.stationCard}
      style={{ scrollMarginTop: "24px" }}
    >
      {/* Station Header */}
      <div onClick={onToggleExpand} className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h3 className={styles.stationName}>{station.name}</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "500" }}>
              {routesCount} وجهات ومسارات مباشرة من هذه المحطة
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {station.type && (
            <span
              style={{
                fontSize: "0.7rem",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(225, 29, 72, 0.12)",
                color: "#e11d48",
                fontWeight: "700",
              }}
            >
              {station.type.includes("تبادلية") ? "محطة تبادلية" : "محطة رئيسية"}
            </span>
          )}
          <span className={styles.statBadge}>{station.sector || station.governorate}</span>
          <i
            className={`bx bx-chevron-${isExpanded ? "up" : "down"}`}
            style={{
              fontSize: "1.4rem",
              color: "var(--text-muted)",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Location and Map Button */}
      <div className={styles.locationRow}>
        <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="bx bx-map" style={{ color: palette.color }} />
          {station.location}
        </span>
        {station.map_url && (
          <a
            href={station.map_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={styles.mapButton}
          >
            <i className="bx bx-navigation" />
            <span>خريطة Google</span>
          </a>
        )}
      </div>

      {/* Landmarks Tags */}
      {station.landmarks && station.landmarks.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {station.landmarks.map((lm, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "0.72rem",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-glass)",
                padding: "2px 8px",
                borderRadius: "6px",
                color: "var(--text-secondary)",
              }}
            >
              📍 {lm}
            </span>
          ))}
        </div>
      )}

      {/* Routes List Accordion */}
      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <h4 style={{
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              margin: 0,
              fontFamily: "var(--font-sub)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <i className="bx bx-git-branch" style={{ color: palette.color }} />
              {hasQuery && hasDirectMatches
                ? "المسارات المطابقة لبحثك:"
                : "جميع وجهات ومسارات الأتوبيس الترددي من المحطة:"}
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Array.isArray(station.routes) && station.routes.map((route, rIdx) => {
              const routeKey = `${station.name}-${route.destination}-${rIdx}`;
              const isRouteExpanded = expandedRouteKey === routeKey;
              const voteStats = getRouteVotes(station.name, route.destination);

              return (
                <BrtRouteItem
                  key={rIdx}
                  route={route}
                  stationName={station.name}
                  isExpanded={isRouteExpanded}
                  onToggleExpand={() => onToggleRoute(routeKey)}
                  accentColor={palette.color}
                  voteStats={voteStats}
                  onVote={type => onVoteRoute(station.name, route.destination, type)}
                  onOpenReport={() => onOpenReport(station.name, route.destination)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
