"use client";

import React from "react";
import { FaTimes } from "react-icons/fa";
import styles from "./save-location.module.css";

interface ClearSearchProps {
  onClear: () => void;
}

export default function ClearSearch({ onClear }: ClearSearchProps) {
  return (
    <button
      type="button"
      className={styles.clearSearchBtn}
      onClick={onClear}
      title="مسح البحث"
      aria-label="مسح البحث"
    >
      <FaTimes />
    </button>
  );
}
