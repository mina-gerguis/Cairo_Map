import React from "react";
import { BusStation } from "../types";
import BusStationCard from "./BusStationCard";
import styles from "../bus-stations.module.css";

interface BusStationsResultsSectionProps {
  loading: boolean;
  stations: BusStation[];
  expandedStation: string | null;
  onToggleStation: (name: string) => void;
  onOpenReport: (station: BusStation | null) => void;
}

export default function BusStationsResultsSection({
  loading,
  stations,
  expandedStation,
  onToggleStation,
  onOpenReport
}: BusStationsResultsSectionProps) {
  return (
    <div className={styles.resultsContainer}>
      {/* Instruction Banner & General Report Trigger */}
      <div className={styles.infoNoticeBar}>
        <div className={styles.infoNoticeText}>
          <i
            className="bx bx-info-circle"
            style={{ color: "var(--color-secondary, #3b82f6)", fontSize: "1rem" }}
          />
          <span>انقر على اسم أي موقف لعرض تفاصيله والشركات المتاحة به ومواعيد الحجز.</span>
        </div>

        <button
          type="button"
          className={styles.generalReportBtn}
          onClick={() => onOpenReport(null)}
        >
          <i className="bx bx-error-circle" style={{ fontSize: "0.95rem" }} />
          <span>الإبلاغ عن خطأ أو إضافة موقف</span>
        </button>
      </div>

      {/* Stations List */}
      <div className={styles.stationsList}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid rgba(255, 255, 255, 0.1)",
                borderTopColor: "var(--color-secondary, #3b82f6)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px"
              }}
            />
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              جاري تحميل بيانات المواقف...
            </span>
          </div>
        ) : stations.length > 0 ? (
          stations.map((station, idx) => (
            <BusStationCard
              key={station.id || `${station.name}-${idx}`}
              station={station}
              isExpanded={expandedStation === station.name}
              onToggle={() => onToggleStation(station.name)}
              onReportProblem={(s) => onOpenReport(s)}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            لا توجد مواقف أتوبيسات مطابقة لبحثك. يرجى تعديل الكلمات والمحاولة مجدداً.
          </div>
        )}
      </div>
    </div>
  );
}
