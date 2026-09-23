import React from "react";
import { StepInfo } from "../types";
import styles from "../signup.module.css";

interface StepHeaderProps {
  step: number;
  onBack: () => void;
  stepInfo: StepInfo;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ step, onBack, stepInfo }) => {
  return (
    <>
      {/* Header Navigation Bar with Back Button */}
      <div className={styles.navBar}>
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع للخلف"
          className={styles.backButton}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.2rem" }}></i> رجوع للخلف
        </button>

        <span className={styles.stepBadge}>
          الخطوة {step} من 5
        </span>
      </div>

      {/* Step Title Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.headerTitle}>
          {stepInfo.headerTitle}
        </h2>
        <p className={styles.subTitle}>
          {stepInfo.subTitle}
        </p>
      </div>

      {/* 5-Step Progress Indicator */}
      <div className={styles.progressTrack}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`${styles.progressBar} ${step >= s ? styles.progressBarActive : ""}`}
            style={{
              background: step >= s ? stepInfo.gradient : undefined,
            }}
          />
        ))}
      </div>
    </>
  );
};
