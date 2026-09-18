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
          <span className="sub-title" style={{ color: "var(--text-primary)" }}>المرحلة رقم {legIndex + 1}</span>
        </span>
        {totalLegs > 1 && (
          <button
            type="button"
            className="actionBtn actionBtnDelete"
            onClick={onRemoveLeg}
            title="حذف هذه المرحلة"
            style={{
              padding: "2px 8px",
              fontSize: "0.75rem"
            }}
          >
            <i className="bx bx-trash" />
          </button>
        )}
      </div>

      {/* Leg Title, Cost, Duration */}
      <div className={styles.formGrid}>
        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
            عنوان المرحلة *
          </label>
          <input
            type="text"
            required
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: المرحلة الأولى: ميكروباص من الزقازيق للسلام"
            value={leg.title}
            onChange={(e) => onUpdateField("title", e.target.value)}
          />
        </div>
        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
            أجرة هذه المرحلة (ج.م)
          </label>
          <input
            type="number"
            min="0"
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="20"
            value={leg.cost}
            onChange={(e) => onUpdateField("cost", e.target.value)}
          />
        </div>
        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
            وقت هذه المرحلة
          </label>
          <input
            type="text"
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="50 دقيقة"
            value={leg.duration}
            onChange={(e) => onUpdateField("duration", e.target.value)}
          />
        </div>
      </div>

      {/* Leg Sub-Steps */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <label className="help-label" style={{ margin: 0 }}>
            خطوات هذه المرحلة بالتفصيل *
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddStep}
          >
            + إضافة خطوة
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(leg.steps || []).map((stepVal, stepIdx) => (
            <div key={stepIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  color: "var(--text-secondary)",
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
                className="input-fields"
                placeholder="اكتب تفاصيل هذه الخطوة..."
                value={stepVal}
                onChange={(e) => onUpdateStep(stepIdx, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="actionBtn actionBtnDelete"
                onClick={() => onRemoveStep(stepIdx)}
                style={{ padding: "6px 10px" }}
                disabled={(leg.steps || []).length === 1}
                title="حذف الخطوة"
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
