"use client";

import React from "react";
import styles from "../roads-info.module.css";
import { RoadsTabType } from "../types";

interface RoadsTabsProps {
  activeTab: RoadsTabType;
  onTabChange: (tab: RoadsTabType) => void;
  roadsCount: number;
}

export function RoadsTabs({
  activeTab,
  onTabChange,
  roadsCount,
}: RoadsTabsProps) {
  return (
    <div className={styles.tabsContainer}>
      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === "roads" ? styles.tabButtonActive : ""}`}
        onClick={() => onTabChange("roads")}
      >
        <i className="bx bx-tachometer" />
        <span>دليل معلومات وسرعات الطرق</span>
        <span className={styles.tabBadge}>{roadsCount}</span>
      </button>

      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === "guide" ? styles.tabButtonActive : ""}`}
        onClick={() => onTabChange("guide")}
      >
        <i className="bx bx-compass" />
        <span>قواعد المرور وحاسبة الرحلة</span>
      </button>
    </div>
  );
}

