import React from "react";
import { Airport } from "../types";
import AirportCard from "./AirportCard";
import styles from "../airports.module.css";

interface AirportsResultsSectionProps {
  loading: boolean;
  airports: Airport[];
  expandedId: number | string | null;
  onToggleExpand: (id: number | string) => void;
}

export default function AirportsResultsSection({
  loading,
  airports,
  expandedId,
  onToggleExpand
}: AirportsResultsSectionProps) {
  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (airports.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i
          className="bx bx-info-circle"
          style={{
            fontSize: "2rem",
            color: "var(--text-muted)",
            display: "block",
            marginBottom: "8px"
          }}
        />
        لا توجد مطارات مطابقة لبحثك. يرجى تعديل العبارة والمحاولة مجدداً.
      </div>
    );
  }

  return (
    <div className={styles.resultsList}>
      {airports.map((airport, idx) => (
        <AirportCard
          key={airport.id || idx}
          airport={airport}
          isExpanded={expandedId === airport.id}
          onToggleExpand={onToggleExpand}
          index={idx}
        />
      ))}
    </div>
  );
}
