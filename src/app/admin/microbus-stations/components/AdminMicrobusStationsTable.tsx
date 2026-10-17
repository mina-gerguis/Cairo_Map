"use client";

import React from "react";
import styles from "../../admin.module.css";
import { AdminMicrobusStation } from "../types";

interface AdminMicrobusStationsTableProps {
  stations: AdminMicrobusStation[];
  selectedStationKeys: Record<string, boolean>;
  onToggleSelect: (stationKey: string) => void;
  onToggleSelectAll: (stations: AdminMicrobusStation[]) => void;
  onEdit: (station: AdminMicrobusStation) => void;
  onDelete: (station: AdminMicrobusStation) => void;
}

export function AdminMicrobusStationsTable({
  stations,
  selectedStationKeys,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete
}: AdminMicrobusStationsTableProps) {
  const isAllSelected =
    stations.length > 0 &&
    stations.every((s) => {
      const key = s.id || s.name.trim();
      return !!selectedStationKeys[key];
    });

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
            <th className={styles.adminTh}>اسم الموقف</th>
            <th className={styles.adminTh}>المحافظة</th>
            <th className={styles.adminTh}>العنوان بالتفصيل</th>
            <th className={styles.adminTh}>عدد الخطوط</th>
            <th className={styles.adminTh} style={{ textAlign: "center" }}>
              خيارات
            </th>
          </tr>
        </thead>
        <tbody>
          {stations.length === 0 ? (
            <tr className={styles.adminTr}>
              <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                لا توجد أي سجلات متوفرة حالياً.
              </td>
            </tr>
          ) : (
            stations.map((item, idx) => {
              const stationKey = item.id || item.name.trim();
              const isSelected = !!selectedStationKeys[stationKey];

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
                    {item.name}
                  </td>
                  <td className={styles.adminTd}>{item.governorate}</td>
                  <td
                    className={styles.adminTd}
                    title={item.location}
                    style={{
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {item.location}
                  </td>
                  <td className={styles.adminTd}>
                    <span className={styles.microbusRouteBadge}>
                      {Array.isArray(item.routes) ? item.routes.length : 0} مساراً
                    </span>
                  </td>
                  <td className={styles.adminTd}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
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
