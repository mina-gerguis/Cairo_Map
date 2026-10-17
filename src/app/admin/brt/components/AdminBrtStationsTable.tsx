"use client";

import React from "react";
import styles from "../../admin.module.css";
import { AdminBrtStation } from "../types";

interface AdminBrtStationsTableProps {
  stations: AdminBrtStation[];
  selectedStationKeys: Record<string, boolean>;
  onToggleSelect: (stationKey: string) => void;
  onToggleSelectAll: (stations: AdminBrtStation[]) => void;
  onEdit: (station: AdminBrtStation) => void;
  onDelete: (station: AdminBrtStation) => void;
}

export function AdminBrtStationsTable({
  stations,
  selectedStationKeys,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete
}: AdminBrtStationsTableProps) {
  const isAllSelected =
    stations.length > 0 &&
    stations.every((s) => {
      const key = s.id || s.name.trim();
      return !!selectedStationKeys[key];
    });

  const getSectorBadgeColor = (sector?: string) => {
    switch (sector) {
      case "شرق القاهرة":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
      case "جنوب القاهرة":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
      case "غرب القاهرة":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
      case "شمال القاهرة":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" };
    }
  };

  return (
    <div className={styles.tableCard} style={{ overflowX: "auto" }}>
      <table className={styles.adminTable} style={{ width: "100%" }}>
        <thead className={styles.adminThead}>
          <tr className={styles.adminTr}>
            <th className={styles.adminTh} style={{ width: "45px", textAlign: "center" }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => onToggleSelectAll(stations)}
                title="تحديد الكل"
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: "var(--color-primary)"
                }}
              />
            </th>
            <th className={styles.adminTh}>اسم المحطة</th>
            <th className={styles.adminTh}>القطاع</th>
            <th className={styles.adminTh}>المحافظة</th>
            <th className={styles.adminTh}>العنوان بالتفصيل</th>
            <th className={styles.adminTh}>الحالة</th>
            <th className={styles.adminTh}>عدد المسارات</th>
            <th className={styles.adminTh} style={{ textAlign: "center" }}>
              خيارات
            </th>
          </tr>
        </thead>
        <tbody>
          {stations.length === 0 ? (
            <tr className={styles.adminTr}>
              <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                لا توجد أي محطات متوفرة حالياً.
              </td>
            </tr>
          ) : (
            stations.map((item, idx) => {
              const stationKey = item.id || item.name.trim();
              const isSelected = !!selectedStationKeys[stationKey];
              const sectorStyle = getSectorBadgeColor(item.sector);

              return (
                <tr
                  key={item.id || `${item.name}-${idx}`}
                  className={styles.adminTr}
                  style={{
                    backgroundColor: isSelected ? "rgba(99, 102, 241, 0.08)" : undefined
                  }}
                >
                  <td className={styles.adminTd} style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(stationKey)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "var(--color-primary)"
                      }}
                    />
                  </td>
                  <td className={styles.adminTd} style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="bx bx-bus" style={{ color: "#e11d48", fontSize: "1.1rem" }} />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className={styles.adminTd}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.78rem",
                        fontWeight: "bold",
                        background: sectorStyle.bg,
                        color: sectorStyle.text,
                        border: `1px solid ${sectorStyle.border}`
                      }}
                    >
                      {item.sector || "شرق القاهرة"}
                    </span>
                  </td>
                  <td className={styles.adminTd}>{item.governorate || "القاهرة"}</td>
                  <td
                    className={styles.adminTd}
                    title={item.location}
                    style={{
                      maxWidth: "240px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {item.location}
                  </td>
                  <td className={styles.adminTd}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        background: item.status?.includes("تجريبي") ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                        color: item.status?.includes("تجريبي") ? "#fbbf24" : "#34d399"
                      }}
                    >
                      {item.status || "تشغيل تجريبي"}
                    </span>
                  </td>
                  <td className={styles.adminTd}>
                    <span className={styles.microbusRouteBadge}>
                      {Array.isArray(item.routes) ? item.routes.length : 0} مساراً
                    </span>
                  </td>
                  <td className={styles.adminTd}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      {item.map_url && (
                        <a
                          href={item.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionBtn}
                          title="عرض في خرائط جوجل"
                          style={{
                            padding: "5px",
                            borderRadius: "50%",
                            background: "var(--bg-secondary)",
                            color: "#38bdf8",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <i className="bx bx-map-pin" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(item)}
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        title="تعديل"
                        style={{
                          padding: "5px",
                          borderRadius: "50%",
                          background: "var(--bg-secondary)"
                        }}
                      >
                        <i className="bx bx-edit-alt" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                        title="حذف"
                        style={{
                          padding: "5px",
                          borderRadius: "50%",
                          background: "#ff000025",
                          color: "#ff0000f5",
                          border: "#ff000025"
                        }}
                      >
                        <i className="bx bx-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
