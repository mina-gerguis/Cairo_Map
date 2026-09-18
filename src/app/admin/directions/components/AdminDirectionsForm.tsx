import React from "react";
import styles from "../directions.module.css";
import { FormLeg, FormOption, RouteConnectionIdentifier } from "../types";
import { createDefaultLeg, createDefaultOption } from "../constants";
import { RouteOptionFormBox } from "./RouteOptionFormBox";

interface AdminDirectionsFormProps {
  editingConnection: RouteConnectionIdentifier | null;
  fromLocation: string;
  onFromLocationChange: (val: string) => void;
  toLocation: string;
  onToLocationChange: (val: string) => void;
  fromAliases: string;
  onFromAliasesChange: (val: string) => void;
  toAliases: string;
  onToAliasesChange: (val: string) => void;
  options: FormOption[];
  onOptionsChange: React.Dispatch<React.SetStateAction<FormOption[]>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function AdminDirectionsForm({
  editingConnection,
  fromLocation,
  onFromLocationChange,
  toLocation,
  onToLocationChange,
  fromAliases,
  onFromAliasesChange,
  toAliases,
  onToAliasesChange,
  options,
  onOptionsChange,
  isSubmitting,
  onSubmit,
  onCancel
}: AdminDirectionsFormProps) {
  // Option item handlers
  const handleUpdateOptionField = <K extends keyof FormOption>(
    index: number,
    field: K,
    val: FormOption[K]
  ) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleUpdateOptionFields = (index: number, updates: Partial<FormOption>) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const handleAddOption = () => {
    onOptionsChange((prev) => [...prev, createDefaultOption()]);
  };

  const handleRemoveOption = (index: number) => {
    onOptionsChange((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  // Option legs handlers
  const handleAddLeg = (optIdx: number) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      const newLegNum = (updated[optIdx]?.legs || []).length + 1;
      updated[optIdx].legs.push(createDefaultLeg(newLegNum));
      return updated;
    });
  };

  const handleRemoveLeg = (optIdx: number, legIdx: number) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      if ((updated[optIdx]?.legs || []).length === 1) return prev;
      updated[optIdx].legs = updated[optIdx].legs.filter((_, idx) => idx !== legIdx);
      return updated;
    });
  };

  const handleUpdateLegField = (
    optIdx: number,
    legIdx: number,
    field: keyof FormLeg,
    val: string
  ) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      const legsCopy = [...(updated[optIdx]?.legs || [])];
      if (legsCopy[legIdx]) {
        legsCopy[legIdx] = { ...legsCopy[legIdx], [field]: val };
        updated[optIdx].legs = legsCopy;
      }
      return updated;
    });
  };

  const handleUpdateLegStep = (
    optIdx: number,
    legIdx: number,
    stepIdx: number,
    val: string
  ) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      const legsCopy = [...(updated[optIdx]?.legs || [])];
      if (legsCopy[legIdx]) {
        const stepsCopy = [...(legsCopy[legIdx].steps || [])];
        stepsCopy[stepIdx] = val;
        legsCopy[legIdx].steps = stepsCopy;
        updated[optIdx].legs = legsCopy;
      }
      return updated;
    });
  };

  const handleAddLegStep = (optIdx: number, legIdx: number) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      const legsCopy = [...(updated[optIdx]?.legs || [])];
      if (legsCopy[legIdx]) {
        legsCopy[legIdx].steps = [...(legsCopy[legIdx].steps || []), ""];
        updated[optIdx].legs = legsCopy;
      }
      return updated;
    });
  };

  const handleRemoveLegStep = (optIdx: number, legIdx: number, stepIdx: number) => {
    onOptionsChange((prev) => {
      const updated = [...prev];
      const legsCopy = [...(updated[optIdx]?.legs || [])];
      if (legsCopy[legIdx] && (legsCopy[legIdx].steps || []).length > 1) {
        legsCopy[legIdx].steps = legsCopy[legIdx].steps.filter((_, idx) => idx !== stepIdx);
        updated[optIdx].legs = legsCopy;
      }
      return updated;
    });
  };

  return (
    <form onSubmit={onSubmit} className={styles.formCard}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          <i
            className={`bx ${editingConnection ? "bx-edit-alt" : "bx-plus-circle"}`}
            style={{ color: "#3b82f6" }}
          />
          <span>
            {editingConnection
              ? "تعديل بيانات الطريق ومراحل المسار"
              : "إضافة طريق ومسارات مواصلات ومراحل جديدة"}
          </span>
        </h2>
        <button
          type="button"
          className={styles.secondaryActionBtn}
          onClick={onCancel}
          style={{ padding: "6px 14px", fontSize: "0.82rem" }}
        >
          إلغاء
        </button>
      </div>

      {/* From & To inputs */}
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>من (نقطة البداية) *</span>
          </label>
          <input
            type="text"
            required
            className={styles.input}
            placeholder="مثال: الزقازيق"
            value={fromLocation}
            onChange={(e) => onFromLocationChange(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>إلى (الوجهة النهائية) *</span>
          </label>
          <input
            type="text"
            required
            className={styles.input}
            placeholder="مثال: أرض المعارض"
            value={toLocation}
            onChange={(e) => onToLocationChange(e.target.value)}
          />
        </div>
      </div>

      {/* Aliases Inputs */}
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>الأسماء والكلمات البديلة لنقطة البداية (مفصولة بفاصلة)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="مثال: موقف الأحرار، الاحرار، جامعة الزقازيق"
            value={fromAliases}
            onChange={(e) => onFromAliasesChange(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>الأسماء والكلمات البديلة للوجهة (مفصولة بفاصلة)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="مثال: معرض الكتاب، ارض المعارض، مركز المعارض"
            value={toAliases}
            onChange={(e) => onToAliasesChange(e.target.value)}
          />
        </div>
      </div>

      {/* Options Sublist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "12px"
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "800",
              color: "#f8fafc",
              margin: 0
            }}
          >
            وسائل المواصلات المتاحة لهذا الطريق ({(options || []).length})
          </h3>
          <button
            type="button"
            className={styles.addOptionBtn}
            onClick={handleAddOption}
          >
            <i className="bx bx-plus" />
            <span>إضافة وسيلة مواصلات أخرى</span>
          </button>
        </div>

        {(options || []).map((opt, optIdx) => (
          <RouteOptionFormBox
            key={optIdx}
            option={opt}
            optionIndex={optIdx}
            totalOptions={(options || []).length}
            onRemoveOption={() => handleRemoveOption(optIdx)}
            onUpdateOptionField={(field, val) => handleUpdateOptionField(optIdx, field, val)}
            onUpdateOptionFields={(updates) => handleUpdateOptionFields(optIdx, updates)}
            onAddLeg={() => handleAddLeg(optIdx)}
            onRemoveLeg={(legIdx) => handleRemoveLeg(optIdx, legIdx)}
            onUpdateLegField={(legIdx, field, val) =>
              handleUpdateLegField(optIdx, legIdx, field, val)
            }
            onUpdateLegStep={(legIdx, stepIdx, val) =>
              handleUpdateLegStep(optIdx, legIdx, stepIdx, val)
            }
            onAddLegStep={(legIdx) => handleAddLegStep(optIdx, legIdx)}
            onRemoveLegStep={(legIdx, stepIdx) => handleRemoveLegStep(optIdx, legIdx, stepIdx)}
          />
        ))}
      </div>

      {/* Form Actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "10px"
        }}
      >
        <button
          type="button"
          className={styles.secondaryActionBtn}
          onClick={onCancel}
        >
          إلغاء
        </button>
        <button
          type="submit"
          className={styles.primaryActionBtn}
          disabled={isSubmitting}
          style={{ padding: "12px 32px" }}
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ الطريق والخطوات بالكامل"}
        </button>
      </div>
    </form>
  );
}
