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
          >
            {/* Route Card Clickable Accordion Header */}
            <div
              className={`${styles.accordionHeader} ${!isExpanded ? styles.accordionHeaderCollapsed : ""
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
                        accentColor: "var(--color-primary, #6366f1)"
                      }}
                      title="تحديد هذا المسار"
                    />
                  </div>

                  <h3 className={styles.routeTitle}>
                    <span>من</span>
                    <span className={styles.locationBadge}>{route.from_location}</span>
                    <i className="bx bx-left-arrow-alt" style={{ color: "var(--color-primary)" }} />
                    <span>إلى</span>
                    <span className={styles.locationBadge}>{route.to_location}</span>
                  </h3>

                  {/* Chevron Indicator */}
                  <div
                    className={`${styles.chevronIcon} ${isExpanded ? styles.chevronRotated : ""
                      }`}
                  >
                    <i className="bx bx-chevron-down" />
                  </div>
                </div>

                {/* Summary Info Pill Bar */}
                <div className={styles.collapsedSummaryBar}>
                  <span className={styles.summaryPill}>
                    <i className="bx bx-bus" />
                    <span className="sub-title">{route.options.length} وسائل مواصلات</span>
                  </span>

                  <span className={styles.summaryPill}>
                    <i className="bx bx-wallet" />
                    <span className="sub-title">الأجرة {costSummary}</span>
                  </span>

                  {(route.from_aliases || route.to_aliases) && (
                    <span className={styles.summaryPill}>
                      <i className="bx bx-tag-alt" />
                      <span className="sub-title">يتضمن كلمات بديلة</span>
                    </span>
                  )}
                </div>

                {/* Expanded Aliases Preview */}
                {isExpanded && (route.from_aliases || route.to_aliases) && (
                  <div className={styles.aliasesBar} style={{ marginTop: "6px" }}>
                    <span className="sub-title">الكلمات البديلة:</span>
                    {route.from_aliases && (
                      <span className="sub-title">
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
                      <span className="sub-title">
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

              {/* Actions Matching admin/metro buttons */}
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="actionBtn actionBtnEdit"
                  onClick={() => onEdit(route)}
                  title="تعديل هذا الطريق"
                >
                  <i className="bx bx-edit-alt" />
                </button>
                <button
                  type="button"
                  className="actionBtn actionBtnDelete"
                  onClick={() => onDelete(route.from_location, route.to_location)}
                  title="حذف هذا الطريق"
                >
                  <i className="bx bx-trash" />
                </button>
              </div>
            </div>

            {/* Collapsible Content Section */}
            {isExpanded && (
              <div
                className={styles.optionsGrid}
                style={{ marginTop: "16px" }}
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
