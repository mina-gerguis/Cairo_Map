import React from "react";
import { RouteLeg } from "../types";
import { getTransitOptionIconPath } from "../utils";

interface RouteLegTimelineProps {
  legs: RouteLeg[];
}

export default function RouteLegTimeline({ legs }: RouteLegTimelineProps) {
  return (
    <div>
      <h4
        style={{
          margin: "0 0 16px 0",
          fontSize: "0.92rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-sub)"
        }}
      >
        <i className="bx bx-git-repo-forked" style={{ color: "var(--color-secondary)" }} />
        <span>خطوات ومراحل المسار:</span>
      </h4>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {legs.map((leg, legIdx) => {
          const isLastLeg = legIdx === legs.length - 1;
          const legIconData = getTransitOptionIconPath({
            vehicleType: leg.vehicleType || leg.title,
            type: leg.vehicleType
          });

          return (
            <div key={legIdx} style={{ display: "flex", flexDirection: "column" }}>
              {/* Stage Header Item */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Dot Number */}
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-secondary, #3b82f6)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    fontWeight: "800",
                    flexShrink: 0,
                    marginTop: "2px",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
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
                    <h5
                      style={{
                        margin: 0,
                        fontSize: "0.94rem",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "var(--font-sub)"
                      }}
                    >
                      {legIconData.type === "image" && legIconData.src ? (
                        <img
                          src={legIconData.src}
                          alt=""
                          style={{ width: "20px", height: "auto", objectFit: "contain" }}
                        />
                      ) : (
                        <i
                          className={legIconData.iconClass || "bx bx-right-arrow-alt"}
                          style={{ color: "var(--color-secondary)", fontSize: "1.05rem" }}
                        />
                      )}
                      <span>{leg.title}</span>
                    </h5>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {leg.cost !== undefined && (
                        <span className="tab" style={{ padding: "2px 8px", fontSize: "0.74rem" }}>
                          {leg.cost} ج.م
                        </span>
                      )}
                      {leg.duration && (
                        <span className="tab" style={{ padding: "2px 8px", fontSize: "0.74rem" }}>
                          {leg.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Steps list inside leg */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(leg?.steps || []).map((stepText, sIdx) => (
                      <div key={sIdx} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ color: "var(--color-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>•</span>
                        <div
                          style={{
                            fontSize: "0.86rem",
                            color: "var(--text-secondary)",
                            lineHeight: "1.6",
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
                <div style={{ display: "flex", gap: "12px", minHeight: "16px", marginTop: "-6px", marginBottom: "4px" }}>
                  <div style={{ width: "26px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        width: "2px",
                        backgroundColor: "var(--color-secondary, #3b82f6)",
                        minHeight: "16px",
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
