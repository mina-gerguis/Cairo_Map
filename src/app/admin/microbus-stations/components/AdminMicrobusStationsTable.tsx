"use client";

import React from "react";
import styles from "../../admin.module.css";
import { AdminMicrobusStation } from "../types";

interface AdminMicrobusStationsTableProps {
  stations: AdminMicrobusStation[];
  onEdit: (station: AdminMicrobusStation) => void;
  onDelete: (station: AdminMicrobusStation) => void;
}

export function AdminMicrobusStationsTable({
  stations,
  onEdit,
  onDelete
}: AdminMicrobusStationsTableProps) {
  return (
    <div className={styles.tableCard} style={{ overflowX: "auto" }}>
      <table className={styles.adminTable} style={{ width: "100%" }}>
        <thead className={styles.adminThead}>
          <tr className={styles.adminTr}>
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
              <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                لا توجد أي سجلات متوفرة حالياً.
              </td>
            </tr>
          ) : (
            stations.map((item, idx) => (
              <tr key={item.id || `${item.name}-${idx}`} className={styles.adminTr}>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
