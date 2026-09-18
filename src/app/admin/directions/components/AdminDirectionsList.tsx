import React from "react";
import styles from "../directions.module.css";
import { GroupedRoute } from "../types";
import { AdminDirectionsEmptyState } from "./AdminDirectionsEmptyState";
import { RouteCardOptionItem } from "./RouteCardOptionItem";

interface AdminDirectionsListProps {
  routes: GroupedRoute[];
  expandedRouteKeys: Record<string, boolean>;
  selectedRouteKeys: Record<string, boolean>;
  onToggleExpand: (routeKey: string) => void;
  onToggleSelect: (routeKey: string) => void;
  onEdit: (route: GroupedRoute) => void;
  onDelete: (fromLocation: string, toLocation: string) => void;
}

export function AdminDirectionsList({
  routes,
  expandedRouteKeys,
  selectedRouteKeys,
  onToggleExpand,
  onToggleSelect,
  onEdit,
  onDelete
}: AdminDirectionsListProps) {
  if (routes.length === 0) {
    return <AdminDirectionsEmptyState />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {routes.map((route, idx) => {
        const routeKey = `${route.from_location.trim()}|||${route.to_location.trim()}`;
        const isExpanded = !!expandedRouteKeys[routeKey];
        const isSelected = !!selectedRouteKeys[routeKey];

        // Summary calculations for collapsed view
        const optionCosts = (route.options || [])
          .map((o) => o.cost)
          .filter((c) => typeof c === "number");
        const minCost = optionCosts.length > 0 ? Math.min(...optionCosts) : 0;
        const maxCost = optionCosts.length > 0 ? Math.max(...optionCosts) : 0;
        const costSummary =
          minCost === maxCost ? `${minCost} ج.م` : `${minCost} - ${maxCost} ج.م`;

        return (
          <div
            key={idx}
            className={styles.routeCard}
            style={{
              borderColor: isSelected ? "var(--colorPrimary, #2563eb)" : undefined,
              backgroundColor: isSelected ? "rgba(0, 111, 238, 0.04)" : undefined
            }}
          >
            {/* Route Card Clickable Accordion Header */}
            <div
              className={`${styles.accordionHeader} ${
                !isExpanded ? styles.accordionHeaderCollapsed : ""
              }`}
              onClick={() => onToggleExpand(routeKey)}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                  minWidth: "260px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap"
                  }}
                >
                  {/* Select Checkbox */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(routeKey)}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                        accentColor: "var(--colorPrimary, #2563eb)"
                      }}
                      title="تحديد هذا المسار"
                    />
                  </div>

                  <h3 className={styles.routeTitle}>
                    <span>من</span>
                    <span className={styles.locationBadge}>{route.from_location}</span>
                    <i className="bx bx-left-arrow-alt" style={{ color: "#3b82f6" }} />
                    <span>إلى</span>
                    <span className={styles.locationBadge}>{route.to_location}</span>
                  </h3>

                  {/* Chevron Indicator */}
                  <div
                    className={`${styles.chevronIcon} ${
                      isExpanded ? styles.chevronRotated : ""
                    }`}
                  >
                    <i className="bx bx-chevron-down" />
                  </div>
                </div>

                {/* Summary Info Pill Bar */}
                <div className={styles.collapsedSummaryBar}>
                  <span className={styles.summaryPill}>
                    <i className="bx bx-bus" style={{ color: "#3b82f6" }} />
                    <span>{route.options.length} وسائل مواصلات</span>
                  </span>

                  <span className={styles.summaryPill}>
                    <i className="bx bx-wallet" style={{ color: "#10b981" }} />
                    <span>الأجرة {costSummary}</span>
                  </span>

                  {(route.from_aliases || route.to_aliases) && (
                    <span className={styles.summaryPill} style={{ opacity: 0.8 }}>
                      <i className="bx bx-tag-alt" />
                      <span>يتضمن كلمات بديلة للبحث</span>
                    </span>
                  )}
                </div>

                {/* Expanded Aliases Preview */}
                {isExpanded && (route.from_aliases || route.to_aliases) && (
                  <div className={styles.aliasesBar} style={{ marginTop: "6px" }}>
                    <span>الكلمات البديلة:</span>
                    {route.from_aliases && (
                      <span>
                        البداية (
                        {route.from_aliases.split(",").map((a, i) => (
                          <span key={i} className={styles.aliasChip}>
                            {a.trim()}
                          </span>
                        ))}
                        )
                      </span>
                    )}
                    {route.to_aliases && (
                      <span>
                        الوجهة (
                        {route.to_aliases.split(",").map((a, i) => (
                          <span key={i} className={styles.aliasChip}>
                            {a.trim()}
                          </span>
                        ))}
                        )
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                style={{ display: "flex", gap: "8px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.secondaryActionBtn}
                  onClick={() => onEdit(route)}
                  style={{ padding: "8px 16px", fontSize: "0.82rem", color: "#60a5fa" }}
                  title="تعديل بيانات هذا الطريق"
                  type="button"
                >
                  <i className="bx bx-edit-alt" />
                  <span>تعديل</span>
                </button>
                <button
                  className={styles.removeBtn}
                  onClick={() => onDelete(route.from_location, route.to_location)}
                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                  title="حذف هذا الطريق"
                  type="button"
                >
                  <i className="bx bx-trash" />
                  <span>حذف</span>
                </button>
              </div>
            </div>

            {/* Collapsible Content Section */}
            {isExpanded && (
              <div
                className={styles.optionsGrid}
                style={{ marginTop: "12px", animation: "slideDown 0.2s ease" }}
              >
                {(route.options || []).map((opt, optIdx) => (
                  <RouteCardOptionItem key={optIdx} option={opt} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
