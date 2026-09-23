import React, { RefObject } from "react";
import { User } from "@supabase/supabase-js";
import { RouteData, RouteOption } from "../types";
import RouteOptionCard from "./RouteOptionCard";
import RouteNotFoundCard from "./RouteNotFoundCard";
import styles from "../page.module.css";

interface RouteResultsSectionProps {
  resultsPanelRef: RefObject<HTMLDivElement | null>;
  searchTriggered: boolean;
  matchedRoute: RouteData | null;
  fromInput: string;
  toInput: string;
  resolvedFrom: string;
  resolvedTo: string;
  user: User | null;
  onOpenReportModal: (option: RouteOption) => void;
}

export default function RouteResultsSection({
  resultsPanelRef,
  searchTriggered,
  matchedRoute,
  fromInput,
  toInput,
  resolvedFrom,
  resolvedTo,
  user,
  onOpenReportModal,
}: RouteResultsSectionProps) {
  if (!searchTriggered) return null;

  return (
    <div
      id="directions-results-section"
      ref={resultsPanelRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "24px",
        scrollMarginTop: "24px"
      }}
    >
      {matchedRoute ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Summary Header */}
          <div className={styles.summaryCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: 0,
                  flexWrap: "wrap",
                  fontFamily: "var(--font-sub)"
                }}
              >
                <span>المسارات المتاحة من</span>
                <span style={{ color: "var(--color-secondary)" }}>{resolvedFrom}</span>
                <span>إلى</span>
                <span style={{ color: "var(--color-secondary)" }}>{resolvedTo}</span>
              </h3>

              <span className={styles.bentoPill}>
                {matchedRoute.options?.length || 1} خيارات بديلة
              </span>
            </div>

            {((fromInput.trim() !== resolvedFrom) || (toInput.trim() !== resolvedTo)) && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <i className="bx bx-info-circle" style={{ color: "var(--color-secondary)" }} />
                <span>تم توجيه بحثك تلقائياً بناءً على أقرب نقطة انطلاق ومحطة رئيسية.</span>
              </p>
            )}
          </div>

          {/* Options Cards */}
          {(matchedRoute.options || []).map((option, idx) => (
            <RouteOptionCard
              key={idx}
              option={option}
              resolvedFrom={resolvedFrom}
              resolvedTo={resolvedTo}
              onOpenReportModal={onOpenReportModal}
            />
          ))}
        </div>
      ) : (
        <RouteNotFoundCard
          fromInput={fromInput}
          toInput={toInput}
          user={user}
        />
      )}
    </div>
  );
}
