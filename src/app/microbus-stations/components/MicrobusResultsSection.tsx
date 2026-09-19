import React, { RefObject } from "react";
import { MicrobusStation, VoteStats } from "../types";
import { STATION_PALETTE } from "../constants";
import MicrobusStationCard from "./MicrobusStationCard";
import styles from "../microbus.module.css";

interface MicrobusResultsSectionProps {
  resultsPanelRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  stations: MicrobusStation[];
  filteredStations: MicrobusStation[];
  selectedStation: string;
  destinationQuery: string;
  expandedStationId: string | null;
  onToggleStation: (id: string) => void;
  expandedRouteKey: string | null;
  onToggleRoute: (routeKey: string) => void;
  getRouteVotes: (stationName: string, destination: string) => VoteStats;
  onVoteRoute: (stationName: string, destination: string, type: "like" | "dislike") => void;
  onOpenReport: (stationName: string, destination: string) => void;
}

export default function MicrobusResultsSection({
  resultsPanelRef,
  loading,
  stations,
  filteredStations,
  selectedStation,
  destinationQuery,
  expandedStationId,
  onToggleStation,
  expandedRouteKey,
  onToggleRoute,
  getRouteVotes,
  onVoteRoute,
  onOpenReport,
}: MicrobusResultsSectionProps) {
  if (loading) {
    return (
      <div ref={resultsPanelRef} className={styles.stationCard} style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 12px" }} />
        <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>جاري تحديث بيانات المواقف...</span>
      </div>
    );
  }

  const isSpecificStation = selectedStation && selectedStation !== "all";
  const hasMatches = filteredStations.length > 0;
  const currentStation = isSpecificStation ? stations.find(s => s.name === selectedStation) : null;
  const hasQuery = destinationQuery.trim() !== "";

  const stationsToRender = hasMatches
    ? filteredStations
    : (isSpecificStation && currentStation ? [currentStation] : []);

  return (
    <div ref={resultsPanelRef} style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "28px" }}>
      {/* Notice: Specific station selected, but NO direct match for query */}
      {isSpecificStation && !hasMatches && hasQuery && currentStation && (
        <div style={{
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: "16px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontWeight: "800", fontSize: "0.95rem" }}>
            <i className="bx bx-info-circle" style={{ fontSize: "1.25rem" }} />
            <span>لا تتوفر ميكروباصات مباشرة من هذا الموقف إلى "{destinationQuery}"</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6" }}>
            تم إظهار جميع خطوط <strong>{selectedStation}</strong> بالأسفل لاختيار أقرب بديل.
          </p>
        </div>
      )}

      {/* Notice: Direct route found */}
      {isSpecificStation && hasMatches && hasQuery && (
        <div style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "16px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#10b981",
          fontWeight: "800",
          fontSize: "0.92rem"
        }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.25rem" }} />
          <span>متوفر خط سير مباشر إلى {destinationQuery} من هذا الموقف!</span>
        </div>
      )}

      {/* Notice: No stations match query in all stations */}
      {!isSpecificStation && !hasMatches && hasQuery && (
        <div className={styles.stationCard} style={{ textAlign: "center", padding: "36px 20px" }}>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            لم نتمكن من العثور على خط سير مباشر إلى <strong>"{destinationQuery}"</strong> حالياً. جارٍ التحديث وإضافة المزيد من الخطوط.
          </p>
        </div>
      )}

      {/* Render Station Cards */}
      {stationsToRender.map((station, sIdx) => {
        const isStationExpanded = expandedStationId === (station.id || station.name) || stationsToRender.length === 1;
        const palette = STATION_PALETTE[sIdx % STATION_PALETTE.length];

        return (
          <MicrobusStationCard
            key={station.id || sIdx}
            station={station}
            palette={palette}
            isExpanded={isStationExpanded}
            onToggleExpand={() => onToggleStation(station.id || station.name)}
            expandedRouteKey={expandedRouteKey}
            onToggleRoute={onToggleRoute}
            getRouteVotes={getRouteVotes}
            onVoteRoute={onVoteRoute}
            onOpenReport={onOpenReport}
            hasQuery={hasQuery}
            hasDirectMatches={hasMatches}
          />
        );
      })}
    </div>
  );
}
