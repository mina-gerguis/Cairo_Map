import React from "react";
import { RouteLeg } from "../types";

interface RouteLegTimelineProps {
  legs: RouteLeg[];
}

export default function RouteLegTimeline({ legs }: RouteLegTimelineProps) {
  return (
    <div
      style={{
        background: "var(--bg-glass)",
        padding: "16px",
        borderRadius: "var(--ra-8)",
        border: "1px solid var(--border-glass)"
      }}
    >
      <h4
        style={{
          margin: "0 0 14px 0",
          fontSize: "0.92rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "var(--font-sub)"
        }}
      >
        <i className="bx bx-git-repo-forked" style={{ color: "var(--color-secondary)" }} />
        <span>خطوات ومراحل المسار:</span>
      </h4>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {legs.map((leg, legIdx) => {
          const isLastLeg = legIdx === legs.length - 1;

          return (
            <div key={legIdx} style={{ display: "flex", flexDirection: "column" }}>
              {/* Stage Header Item */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minHeight: "32px" }}>
                {/* Dot Number */}
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-secondary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    flexShrink: 0,
                    marginTop: "2px"
                  }}
                >
                  {legIdx + 1}
                </div>

                {/* Stage Content */}
                <div style={{ flexGrow: 1, paddingBottom: isLastLeg ? "4px" : "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "8px"
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      {leg.title}
                    </h5>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {leg.cost !== undefined && (
                        <span
                          style={{
                            background: "var(--tab-active-bg)",
                            color: "var(--tab-active-color)",
                            padding: "2px 8px",
                            borderRadius: "var(--ra-6)",
                            fontSize: "0.74rem",
                            fontWeight: "700"
                          }}
                        >
                          الأجرة: {leg.cost} ج.م
                        </span>
                      )}
                      {leg.duration && (
                        <span
                          style={{
                            background: "var(--tab-active-bg)",
                            color: "var(--tab-active-color)",
                            padding: "2px 8px",
                            borderRadius: "var(--ra-6)",
                            fontSize: "0.74rem",
                            fontWeight: "700"
                          }}
                        >
                          الوقت: {leg.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Steps list inside leg */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(leg?.steps || []).map((stepText, sIdx) => (
                      <div key={sIdx} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ color: "var(--color-secondary)", fontSize: "0.8rem", marginTop: "2px" }}>•</span>
                        <div
                          style={{
                            fontSize: "0.86rem",
                            color: "var(--textSecondary)",
                            lineHeight: "1.5",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          {stepText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connecting vertical line */}
              {!isLastLeg && (
                <div style={{ display: "flex", gap: "12px", minHeight: "14px", marginTop: "-8px", marginBottom: "4px" }}>
                  <div style={{ width: "24px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        width: "2px",
                        backgroundColor: "var(--color-secondary)",
                        minHeight: "14px",
                        opacity: 0.35,
                      }}
                    />
                  </div>
                  <div style={{ flexGrow: 1 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
