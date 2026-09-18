import React from "react";
import styles from "../directions.module.css";
import { FormLeg } from "../types";

interface RouteOptionLegEditorProps {
  leg: FormLeg;
  legIndex: number;
  totalLegs: number;
  onRemoveLeg: () => void;
  onUpdateField: (field: keyof FormLeg, val: string) => void;
  onUpdateStep: (stepIndex: number, val: string) => void;
  onAddStep: () => void;
  onRemoveStep: (stepIndex: number) => void;
}

export function RouteOptionLegEditor({
  leg,
  legIndex,
  totalLegs,
  onRemoveLeg,
  onUpdateField,
  onUpdateStep,
  onAddStep,
  onRemoveStep
}: RouteOptionLegEditorProps) {
  return (
    <div className={styles.legBox}>
      <div className={styles.legHeader}>
        <span className={styles.legTitle}>
          <i className="bx bx-current-location" />
          <span>المرحلة رقم {legIndex + 1}</span>
        </span>
        {totalLegs > 1 && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onRemoveLeg}
            style={{
              padding: "3px 10px",
              fontSize: "0.75rem",
              fontFamily: "var(--font-heading)"
            }}
          >
            <i className="bx bx-trash" />
          </button>
        )}
      </div>

      {/* Leg Title, Cost, Duration */}
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>عنوان المرحلة *</label>
          <input
            type="text"
            required
            className={styles.input}
            placeholder="مثال: المرحلة الأولى: ميكروباص من الزقازيق للسلام"
            value={leg.title}
            onChange={(e) => onUpdateField("title", e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>أجرة هذه المرحلة (ج.م)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            placeholder="20"
            value={leg.cost}
            onChange={(e) => onUpdateField("cost", e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>وقت هذه المرحلة</label>
          <input
            type="text"
            className={styles.input}
            placeholder="50 دقيقة"
            value={leg.duration}
            onChange={(e) => onUpdateField("duration", e.target.value)}
          />
        </div>
      </div>

      {/* Leg Sub-Steps */}
      <div className={styles.inputGroup}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px"
          }}
        >
          <label className={styles.label}>خطوات هذه المرحلة بالتفصيل *</label>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={onAddStep}
            style={{ padding: "2px 10px", fontSize: "0.75rem" }}
          >
            + إضافة خطوة
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(leg.steps || []).map((stepVal, stepIdx) => (
            <div key={stepIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  color: "#64748b",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  minWidth: "22px",
                  textAlign: "center"
                }}
              >
                {stepIdx + 1}.
              </span>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="اكتب تفاصيل هذه الخطوة..."
                value={stepVal}
                onChange={(e) => onUpdateStep(stepIdx, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemoveStep(stepIdx)}
                style={{ padding: "8px 12px" }}
                disabled={(leg.steps || []).length === 1}
              >
                <i className="bx bx-trash" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
