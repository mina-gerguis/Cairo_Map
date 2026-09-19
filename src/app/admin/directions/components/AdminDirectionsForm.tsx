import React from "react";
import styles from "../directions.module.css";
import { FormLeg, FormOption, RouteConnectionIdentifier } from "../types";
import { createDefaultLeg, createDefaultOption } from "../constants";
import { RouteOptionFormBox } from "./RouteOptionFormBox";
import CancelButton from "@/components/ui/button/CancelButton";
import SubmitButton from "@/components/ui/button/SubmitButton";

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
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        {/* Header matching metro modal */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {editingConnection
              ? "تعديل بيانات الطريق والمراحل"
              : "إضافة طريق ومسارات مواصلات ومراحل جديدة"}
          </h3>
          <button onClick={onCancel} className="btn-close" type="button" title="إغلاق">
            <i className="bx bx-x" />
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.modalBody}>
          {/* From & To inputs */}
          <div className={styles.formGrid}>
            <div>
              <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
                من (نقطة البداية) *
              </label>
              <input
                type="text"
                required
                className="input-fields"
                style={{ width: "100%" }}
                placeholder="مثال: الزقازيق"
                value={fromLocation}
                onChange={(e) => onFromLocationChange(e.target.value)}
              />
            </div>

            <div>
              <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
                إلى (الوجهة النهائية) *
              </label>
              <input
                type="text"
                required
                className="input-fields"
                style={{ width: "100%" }}
                placeholder="مثال: أرض المعارض"
                value={toLocation}
                onChange={(e) => onToLocationChange(e.target.value)}
              />
            </div>
          </div>

          {/* Aliases Inputs */}
          <div className={styles.formGrid}>
            <div>
              <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
                الأسماء والكلمات البديلة للبداية (مفصولة بفاصلة)
              </label>
              <input
                type="text"
                className="input-fields"
                style={{ width: "100%" }}
                placeholder="مثال: موقف الأحرار، الاحرار"
                value={fromAliases}
                onChange={(e) => onFromAliasesChange(e.target.value)}
              />
            </div>

            <div>
              <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
                الأسماء والكلمات البديلة للوجهة (مفصولة بفاصلة)
              </label>
              <input
                type="text"
                className="input-fields"
                style={{ width: "100%" }}
                placeholder="مثال: معرض الكتاب، ارض المعارض"
                value={toAliases}
                onChange={(e) => onToAliasesChange(e.target.value)}
              />
            </div>
          </div>

          {/* Options Sublist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-glass)",
                paddingBottom: "12px"
              }}
            >
              <h4
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  margin: 0,
                  fontFamily: 'var(--font-sub)'
                }}
              >
                وسائل المواصلات المتاحة لهذا الطريق ({(options || []).length})
              </h4>
              <button
                type="button"
                className="btn tab"
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

          {/* Modal Footer Actions matching metro */}
          <div className={styles.modalFooter}>
            <CancelButton
              onClick={onCancel}
              style={{
                width: "100%",
                padding: "10px 30px",
                margin: "10px 0"
              }}
            >
              إلغاء
            </CancelButton>

            <SubmitButton
              editingItem={Boolean(editingConnection)}
              disabled={isSubmitting}
              style={{
                margin: "10px 0",
                padding: "10px 30px",
                width: "100%"
              }}
            >
              {isSubmitting ? "جاري الحفظ..." : editingConnection ? "حفظ التغييرات" : "إضافة الطريق"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
