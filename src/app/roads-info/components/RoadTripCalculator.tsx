"use client";

import React, { useState, useMemo } from "react";
import styles from "../roads-info.module.css";
import { HighwayItem } from "@/data/roads_info";
import { calculateTripMetrics } from "../utils";

interface RoadTripCalculatorProps {
  roads: HighwayItem[];
  defaultRoadId?: string;
}

export function RoadTripCalculator({
  roads,
  defaultRoadId,
}: RoadTripCalculatorProps) {
  const [selectedRoadId, setSelectedRoadId] = useState<string>(
    defaultRoadId || (roads[0]?.id ?? "")
  );
  const [customDistance, setCustomDistance] = useState<number>(0);
  const [vehicleType, setVehicleType] = useState<"privateCar" | "microbus" | "bus" | "truck">("privateCar");
  const [fuelEconomy, setFuelEconomy] = useState<number>(8.5); // L / 100 km

  const selectedRoad = useMemo(() => {
    return roads.find((r) => r.id === selectedRoadId) || null;
  }, [roads, selectedRoadId]);

  const activeDistance = customDistance > 0 ? customDistance : (selectedRoad?.lengthKm ?? 100);
  const roadSpeed = selectedRoad?.speeds[vehicleType] ?? 100;

  const metrics = useMemo(() => {
    return calculateTripMetrics(activeDistance, roadSpeed, fuelEconomy);
  }, [activeDistance, roadSpeed, fuelEconomy]);

  return (
    <div className={styles.calculatorCard}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <i className="bx bx-calculator" style={{ fontSize: "1.5rem", color: "#60a5fa" }} />
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
            حاسبة زمن الرحلة وتكلفة الوقود التقديرية
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            احسب الوقت المستغرق واستهلاك البنزين بالسرعات الرسمية المقررة
          </p>
        </div>
      </div>

      <div className={styles.calcInputsRow}>
        <div>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            اختر الطريق:
          </label>
          <select
            className={styles.filterSelect}
            style={{ width: "100%" }}
            value={selectedRoadId}
            onChange={(e) => {
              setSelectedRoadId(e.target.value);
              setCustomDistance(0);
            }}
          >
            {roads.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.lengthKm} كم)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            نوع المركبة:
          </label>
          <select
            className={styles.filterSelect}
            style={{ width: "100%" }}
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as any)}
          >
            <option value="privateCar">سيارة ملاكي (السرعة المقررة)</option>
            <option value="microbus">ميكروباص / ميني باص</option>
            <option value="bus">أتوبيس سياحي / نقل ركاب</option>
            <option value="truck">شاحنة / نقل ثقيل</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            المسافة المحسوبة:
          </label>
          <input
            type="number"
            className={styles.searchInput}
            style={{ padding: "10px" }}
            placeholder={`مثلاً ${selectedRoad?.lengthKm || 100} كم`}
            value={customDistance > 0 ? customDistance : selectedRoad?.lengthKm || ""}
            onChange={(e) => setCustomDistance(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.calcResultBox}>
        <div>
          <div className={styles.calcResultItemVal}>{metrics.formattedTime}</div>
          <div className={styles.calcResultItemLbl}>الوقت المتوقع بسرعة {roadSpeed} كم/س</div>
        </div>

        <div style={{ width: "1px", background: "var(--border-glass, rgba(255,255,255,0.1))" }} />

        <div>
          <div className={styles.calcResultItemVal} style={{ color: "#34d399" }}>
            {metrics.litersNeeded} لتر
          </div>
          <div className={styles.calcResultItemLbl}>استهلاك الوقود التقديري</div>
        </div>

        <div style={{ width: "1px", background: "var(--border-glass, rgba(255,255,255,0.1))" }} />

        <div>
          <div className={styles.calcResultItemVal} style={{ color: "#fbbf24" }}>
            ~ {metrics.estimatedCostEgp} ج.م
          </div>
          <div className={styles.calcResultItemLbl}>تكلفة البنزين التقديرية</div>
        </div>
      </div>
    </div>
  );
}
