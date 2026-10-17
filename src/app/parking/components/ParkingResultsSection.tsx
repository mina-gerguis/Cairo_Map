"use client";

import React, { RefObject } from "react";
import { ParkingSpot } from "../types";
import { ParkingGarageCard } from "./ParkingGarageCard";
import styles from "../parking.module.css";

interface ParkingResultsSectionProps {
  resultsPanelRef?: RefObject<HTMLDivElement | null>;
  parkings: ParkingSpot[];
  expandedParkingId: string | null;
  onToggleParking: (id: string) => void;
  onReportParking: (parkingName: string) => void;
  searchTerm: string;
  onOpenSuggestModal: (initialName?: string) => void;
}

export function ParkingResultsSection({
  resultsPanelRef,
  parkings,
  expandedParkingId,
  onToggleParking,
  onReportParking,
  searchTerm,
  onOpenSuggestModal,
}: ParkingResultsSectionProps) {
  return (
    <div
      id="parking-results-section"
      ref={resultsPanelRef}
      className={styles.resultsSection}
      style={{ scrollMarginTop: "24px" }}
    >
      {/* Header with Counter */}
      <h2 className={styles.resultsHeader}>
        <i
          className="bx bx-list-ul"
          style={{ color: "var(--color-secondary, #3b82f6)" }}
        />
        <span>الجراجات المتاحة ({parkings.length})</span>
      </h2>

      {parkings.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIconBox}>
            <i className="bx bx-search-alt" />
          </div>

          <div>
            <h3
              style={{
                margin: "0 0 6px",
                fontSize: "1.1rem",
                fontWeight: "800",
                color: "var(--text-primary)",
              }}
            >
              لم يتم العثور على جراجات مطابقة للبحث
            </h3>
            {searchTerm.trim() && (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.86rem",
                  color: "var(--text-muted)",
                }}
              >
                لا يوجد جراج مسجل باسم أو منطقة &ldquo;
                <span
                  style={{
                    color: "var(--color-secondary, #3b82f6)",
                    fontWeight: "700",
                  }}
                >
                  {searchTerm.trim()}
                </span>
                &rdquo;
              </p>
            )}
          </div>

          <div className={styles.emptySuggestCard}>
            <div
              style={{
                fontSize: "0.88rem",
                color: "var(--text-primary)",
                fontWeight: "700",
              }}
            >
              هل تعرف هذا الجراج أو ترغب في إضافته إلى الدليل؟
            </div>
            <button
              type="button"
              onClick={() => onOpenSuggestModal(searchTerm.trim())}
              className={styles.suggestBtn}
            >
              <i className="bx bx-plus-circle" />
              <span>اقترح إضافة هذا الجراج</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.garageList}>
          {parkings.map((parking) => (
            <ParkingGarageCard
              key={parking.id}
              parking={parking}
              isExpanded={expandedParkingId === parking.id}
              onToggle={() => onToggleParking(parking.id)}
              onReportParking={onReportParking}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ParkingResultsSection;
