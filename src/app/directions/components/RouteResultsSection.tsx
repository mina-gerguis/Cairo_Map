import React, { RefObject } from "react";
import { User } from "@supabase/supabase-js";
import { RouteData, RouteOption } from "../types";
import RouteOptionCard from "./RouteOptionCard";
import RouteNotFoundCard from "./RouteNotFoundCard";

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
    <div ref={resultsPanelRef} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
      {matchedRoute ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Summary Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-card)"
            }}
          >
            <h3
              style={{
                fontSize: "var(--fs-sm)",
                fontWeight: "var(--fw-medium)",
                color: "var(--textPrimary)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-8)",
                margin: 0,
                flexWrap: "wrap",
                fontFamily: "var(--font-sub)"
              }}
            >
              <span>المسارات من</span>
              <span style={{ color: "var(--colorSecondary)" }}>{resolvedFrom}</span>
              <span>إلى</span>
              <span style={{ color: "var(--colorSecondary)" }}>{resolvedTo}</span>
            </h3>

            {((fromInput.trim() !== resolvedFrom) || (toInput.trim() !== resolvedTo)) && (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "0.8rem",
                  color: "var(--textMuted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <i className="bx bx-info-circle" />
                <span>تم توجيه بحثك تلقائياً بناءً على الأسماء الدلالية والمواقف الرئيسية.</span>
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
