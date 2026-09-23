"use client";

import React from "react";
import { PlaceReviewsNotFoundProps } from "../types";

export function PlaceReviewsLoading() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        direction: "rtl",
      }}
    >
      <div style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>
        جاري تحميل البيانات...
      </div>
    </div>
  );
}

export function PlaceReviewsNotFound({ onBackHome }: PlaceReviewsNotFoundProps) {
  return (
    <div
      className="app-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <div
        style={{ padding: "40px", textAlign: "center" }}
        className="glass-panel"
      >
        <h2 style={{ fontSize: "1.6rem", marginBottom: "10px" }}>
          المكان غير موجود
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "20px",
          }}
        >
          عذراً، لم نتمكن من العثور على المكان المطلوب.
        </p>
        <button className="btn btn-primary" onClick={onBackHome}>
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
