import React from "react";
import { DirectorySliderProps } from "../types";
import { DIRECTORY_TOP_CARDS } from "../constants";
import styles from "../directory.module.css";

export default function DirectorySlider({
  sliderRef,
  activeMainTab,
  selectedSpecialty,
  onSelectCategory,
}: DirectorySliderProps) {
  return (
    <div ref={sliderRef} className={`${styles.sliderContainer} hide-scrollbar`}>
      {DIRECTORY_TOP_CARDS.map((card) => {
        const isTelecom = card.id === "telecom";
        const active = isTelecom
          ? activeMainTab === "telecom"
          : activeMainTab === "phones" && selectedSpecialty === card.specialtyFilter;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectCategory(card)}
            className={styles.sliderCard}
            style={{
              background: `radial-gradient(circle at 100% 0%, ${card.color}98 20%, transparent 65%), var(--bgPrimary)`,
              border: active ? `2px solid ${card.color}` : "1px solid var(--border-secondary)",
            }}
          >
            <div style={{ textAlign: "right", width: "100%", marginTop: "auto", position: "relative", zIndex: 1 }}>
              <div className={styles.sliderCardTitle}>{card.title}</div>
              <div className={styles.sliderCardSubtitle}>{card.subtitle}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
