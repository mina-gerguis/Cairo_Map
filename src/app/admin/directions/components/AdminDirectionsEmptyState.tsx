import React from "react";
import styles from "../directions.module.css";

export function AdminDirectionsEmptyState() {
  return (
    <div className={styles.emptyState}>
      <i className={`bx bx-compass ${styles.emptyIcon}`} />
      <h3 style={{ margin: "0", color: "#f8fafc", fontWeight: "800" }}>
        لا توجد مسارات مطابقة
      </h3>
      <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
        جرّب تغيير تبويب نقطة الانطلاق، كلمات البحث، أو أضف مساراً جديداً.
      </p>
    </div>
  );
}
