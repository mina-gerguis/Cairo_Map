import React from "react";
import styles from "../directions.module.css";
import { OriginTabItem } from "../types";

interface AdminDirectionsOriginTabsProps {
  selectedOrigin: string;
  onSelectOrigin: (origin: string) => void;
  totalRoutesCount: number;
  uniqueOrigins: OriginTabItem[];
}

export function AdminDirectionsOriginTabs({
  selectedOrigin,
  onSelectOrigin,
  totalRoutesCount,
  uniqueOrigins
}: AdminDirectionsOriginTabsProps) {
  return (
    <div className={styles.originTabsContainer}>
      <button
        type="button"
        className={`${styles.originTab} ${
          selectedOrigin === "all" ? styles.originTabActive : ""
        }`}
        onClick={() => onSelectOrigin("all")}
      >
        <i className="bx bx-grid-alt" />
        <span>كل مناطق الانطلاق</span>
        <span className={styles.tabBadge}>{totalRoutesCount}</span>
      </button>

      {uniqueOrigins.map((orig, i) => (
        <button
          key={i}
          type="button"
          className={`${styles.originTab} ${
            selectedOrigin === orig.name ? styles.originTabActive : ""
          }`}
          onClick={() => onSelectOrigin(orig.name)}
        >
          <i className="bx bx-map-pin" />
          <span>منطقة {orig.name}</span>
          <span className={styles.tabBadge}>{orig.count}</span>
        </button>
      ))}
    </div>
  );
}
