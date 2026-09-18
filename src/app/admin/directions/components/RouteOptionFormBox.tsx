import React from "react";
import styles from "../directions.module.css";
import { FormLeg, FormOption, TransitVehicleType } from "../types";
import { TRANSIT_VEHICLE_CONFIG } from "../constants";
import { formatMinutesToArabic, parseMinutesFromArabic, getTransitOptionIconPath } from "../utils";
import { RouteOptionLegEditor } from "./RouteOptionLegEditor";

interface RouteOptionFormBoxProps {
  option: FormOption;
  optionIndex: number;
  totalOptions: number;
  onRemoveOption: () => void;
  onUpdateOptionField: <K extends keyof FormOption>(field: K, val: FormOption[K]) => void;
  onUpdateOptionFields: (updates: Partial<FormOption>) => void;
  onAddLeg: () => void;
  onRemoveLeg: (legIndex: number) => void;
  onUpdateLegField: (legIndex: number, field: keyof FormLeg, val: string) => void;
  onUpdateLegStep: (legIndex: number, stepIndex: number, val: string) => void;
  onAddLegStep: (legIndex: number) => void;
  onRemoveLegStep: (legIndex: number, stepIndex: number) => void;
}

export function RouteOptionFormBox({
  option,
  optionIndex,
  totalOptions,
  onRemoveOption,
  onUpdateOptionField,
  onUpdateOptionFields,
  onAddLeg,
  onRemoveLeg,
  onUpdateLegField,
  onUpdateLegStep,
  onAddLegStep,
  onRemoveLegStep
}: RouteOptionFormBoxProps) {
  // Compute real-time totals for feedback banner
  let calculatedCost = 0;
  let calculatedMins = 0;
  (option.legs || []).forEach((leg) => {
    calculatedCost += parseInt(leg.cost, 10) || 0;
    if (leg.duration) {
      const mins = parseMinutesFromArabic(leg.duration);
      if (mins !== null) {
        calculatedMins += mins;
      }
    }
  });

  const formattedTime =
    calculatedMins > 0
      ? formatMinutesToArabic(calculatedMins)
      : option.legs && option.legs.length > 0 && option.legs[0].duration
        ? option.legs[0].duration
        : "لم يحدد بعد";

  const handleTypeChange = (newType: TransitVehicleType) => {
    const config = TRANSIT_VEHICLE_CONFIG[newType];
    onUpdateOptionFields({
      type: newType,
      type_name: config ? config.defaultName : option.type_name,
      icon: config ? config.defaultIcon : option.icon
    });
  };

  return (
    <div className={styles.optionBox}>
      <div className={styles.optionHeader}>
        <span className={styles.optionTag}>
          <i className="bx bx-bus" />
          <span className="sub-title">وسيلة المواصلات رقم {optionIndex + 1}</span>
        </span>
        {totalOptions > 1 && (
          <button
            type="button"
            className="actionBtn actionBtnDelete"
            onClick={onRemoveOption}
            title="حذف هذه الوسيلة"
          >
            <i className="bx bx-trash" style={{ marginLeft: "4px" }} />
          </button>
        )}
      </div>

      {/* Type, Name, Icon Grid */}
      <div className={styles.formGrid}>
        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
            نوع وسيلة المواصلات *
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              className="input-fields"
              value={option.type}
              onChange={(e) => handleTypeChange(e.target.value as TransitVehicleType)}
              style={{ flex: 1 }}
            >
              {Object.entries(TRANSIT_VEHICLE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <div className={styles.vehicleIcon}>
              {(() => {
                const iconRes = getTransitOptionIconPath(option);
                if (iconRes.type === "image" && iconRes.src) {
                  return (
                    <img
                      src={iconRes.src}
                      alt=""
                      style={{ width: "22px", height: "auto", objectFit: "contain" }}
                    />
                  );
                }
                return <i className={iconRes.iconClass || "bx bx-bus"} />;
              })()}
            </div>
          </div>
        </div>

        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
            اسم وسيلة المواصلات *
          </label>
          <input
            type="text"
            required
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: ميكروباص مباشر"
            value={option.type_name}
            onChange={(e) => onUpdateOptionField("type_name", e.target.value)}
          />
        </div>
      </div>

      {/* Visual feedback of calculated totals */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "8px 14px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-glass)",
          borderRadius: "8px",
          fontSize: "0.85rem",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>الإجمالي التلقائي للوسيلة:</span>
        <span className="tab" style={{ padding: "0 var(--space-6)", borderRadius: "var(--ra-6)" }}>
          التكلفة: {calculatedCost} ج.م
        </span>
        <span className="tab" style={{ padding: "0 var(--space-6)", borderRadius: "var(--ra-6)" }}>الزمن : {formattedTime}</span>
      </div>

      {/* Map Link / Google Maps URL */}
      <div>
        <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
          رابط بدء الرحلة ومسار خريطة Google (اختياري)
        </label>
        <input
          type="text"
          className="input-fields"
          style={{ width: "100%" }}
          placeholder="https://www.google.com/maps/dir/..."
          value={option.map_link || ""}
          onChange={(e) => onUpdateOptionField("map_link", e.target.value)}
        />
      </div>

      {/* Stages / Legs Breakdown Editor */}
      <div className={styles.legsSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h5
            style={{
              margin: 0,
              fontSize: "0.92rem",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-git-repo-forked" />
            <span>مراحل الرحلة والخطوات التفصيلية (المرحلة الأولى، الثانية...)</span>
          </h5>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddLeg}
          >
            + إضافة مرحلة
          </button>
        </div>

        {(option.legs || []).map((leg, legIdx) => (
          <RouteOptionLegEditor
            key={legIdx}
            leg={leg}
            legIndex={legIdx}
            totalLegs={(option.legs || []).length}
            onRemoveLeg={() => onRemoveLeg(legIdx)}
            onUpdateField={(field, val) => onUpdateLegField(legIdx, field, val)}
            onUpdateStep={(stepIdx, val) => onUpdateLegStep(legIdx, stepIdx, val)}
            onAddStep={() => onAddLegStep(legIdx)}
            onRemoveStep={(stepIdx) => onRemoveLegStep(legIdx, stepIdx)}
          />
        ))}
      </div>

      {/* Tips */}
      <div>
        <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>
          نصيحة للمسافرين
        </label>
        <textarea
          className="input-fields"
          style={{ width: "100%", minHeight: "64px", resize: "vertical" }}
          placeholder="اكتب أي نصيحة إضافية..."
          value={option.tips || ""}
          onChange={(e) => onUpdateOptionField("tips", e.target.value)}
        />
      </div>
    </div>
  );
}
