import React from "react";
import styles from "../directions.module.css";
import { FormLeg, FormOption, TransitVehicleType } from "../types";
import { TRANSIT_VEHICLE_CONFIG, createDefaultLeg } from "../constants";
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
          <span>وسيلة المواصلات رقم {optionIndex + 1}</span>
        </span>
        {totalOptions > 1 && (
          <button type="button" className={styles.removeBtn} onClick={onRemoveOption}>
            <i className="bx bx-trash" style={{ marginLeft: "4px" }} />
            حذف الوسيلة
          </button>
        )}
      </div>

      {/* Type, Name, Icon Grid */}
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>نوع وسيلة المواصلات *</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              className={styles.input}
              value={option.type}
              onChange={(e) => handleTypeChange(e.target.value as TransitVehicleType)}
              style={{ flex: 1 }}
            >
              <option value="microbus">ميكروباص</option>
              <option value="bus">أتوبيس</option>
              <option value="brt">الأتوبيس الترددي (BRT)</option>
              <option value="metro">مترو</option>
              <option value="lrt">القطار الكهربائي (LRT)</option>
              <option value="train">قطار</option>
              <option value="monorail">مونوريل</option>
              <option value="car">عربية خاص (سيارة)</option>
              <option value="plane">طائرة</option>
              <option value="ship">سفينة</option>
              <option value="multi">مواصلات متعددة</option>
            </select>
            <div className={styles.vehicleIcon}>
              {(() => {
                const iconRes = getTransitOptionIconPath(option);
                if (iconRes.type === "image" && iconRes.src) {
                  return (
                    <img
                      src={iconRes.src}
                      alt=""
                      style={{ width: "24px", height: "auto", objectFit: "contain" }}
                    />
                  );
                }
                return <i className={iconRes.iconClass || "bx bx-bus"} />;
              })()}
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>اسم وسيلة المواصلات المخصص *</label>
          <input
            type="text"
            required
            className={styles.input}
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
          marginTop: "4px",
          marginBottom: "12px",
          padding: "8px 12px",
          backgroundColor: "rgba(30, 41, 59, 0.5)",
          border: "1px solid #334155",
          borderRadius: "6px",
          fontSize: "0.85rem"
        }}
      >
        <span style={{ color: "#94a3b8" }}>الإجمالي التلقائي للوسيلة:</span>
        <span style={{ color: "#34d399", fontWeight: "bold" }}>
          💰 التكلفة: {calculatedCost} ج.م
        </span>
        <span style={{ color: "#60a5fa", fontWeight: "bold" }}>⏱️ الوقت: {formattedTime}</span>
      </div>

      {/* Map Link / Google Maps URL */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          <span>رابط بدء الرحلة ومسار خريطة Google </span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="https://www.google.com/maps/dir/..."
          value={option.map_link}
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
          <h4
            style={{
              margin: 0,
              fontSize: "0.95rem",
              fontWeight: "800",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-git-repo-forked" />
            <span>مراحل الرحلة والخطوات التفصيلية (المرحلة الأولى، الثانية...)</span>
          </h4>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={onAddLeg}
            style={{
              padding: "4px 12px",
              fontSize: "0.8rem",
              fontFamily: "var(--font-heading)"
            }}
          >
            + إضافة مرحلة جديدة
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
      <div className={styles.inputGroup}>
        <label className={styles.label}>نصيحة ذهبية للمسافرين (اختياري)</label>
        <textarea
          className={styles.textarea}
          placeholder="اكتب أي نصيحة إضافية..."
          value={option.tips}
          onChange={(e) => onUpdateOptionField("tips", e.target.value)}
        />
      </div>
    </div>
  );
}
