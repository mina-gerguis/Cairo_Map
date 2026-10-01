import React from "react";
import { Airport } from "../types";
import AirportCard from "./AirportCard";
import styles from "../airports.module.css";

interface AirportsResultsSectionProps {
  loading: boolean;
  airports: Airport[];
  expandedId: number | string | null;
  onToggleExpand: (id: number | string) => void;
  onReport?: (airport: Airport) => void;
}

export default function AirportsResultsSection({
  loading,
  airports,
  expandedId,
  onToggleExpand,
  onReport
}: AirportsResultsSectionProps) {
  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>جاري تحميل بيانات المطارات...</span>
      </div>
    );
  }

  if (airports.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <i className="bx bx-search-alt" />
        </div>
        <h4 className={styles.emptyStateTitle}>لم يتم العثور على أي مطارات</h4>
        <p className={styles.emptyStateDesc}>
          لا توجد نتائج مطابقة لبحثك أو الفلتر المحدد. جرب استخدام كلمات بحث مختلفة أو تغيير التصنيف.
        </p>
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
          onReport={onReport}
          index={idx}
        />
      ))}
    </div>
  );
}
