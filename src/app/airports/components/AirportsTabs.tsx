import React from "react";
import { AirportTab } from "../types";
import { AIRPORT_TABS } from "../constants";
import styles from "../airports.module.css";

interface AirportsTabsProps {
  activeTab: AirportTab;
  onTabChange: (tab: AirportTab) => void;
}

export default function AirportsTabs({
  activeTab,
  onTabChange
}: AirportsTabsProps) {
  return (
    <div className={styles.tabsWrapper} role="tablist">
      {AIRPORT_TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${styles.tabBtn} ${
            activeTab === tab.id ? styles.tabBtnActive : ""
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
