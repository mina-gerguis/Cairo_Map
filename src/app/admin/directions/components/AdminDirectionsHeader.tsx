import React from "react";
import styles from "../directions.module.css";

interface AdminDirectionsHeaderProps {
  showAddForm: boolean;
  onToggleForm: () => void;
  onOpenExcelModal: () => void;
  onExportExcel: () => void;
}

export function AdminDirectionsHeader({
  showAddForm,
  onToggleForm,
  onOpenExcelModal,
  onExportExcel
}: AdminDirectionsHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.headerInfo}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIcon}>
            <i className="bx bx-compass" />
          </div>
          <div>
            <h1 className={styles.pageTitle}>إدارة خطوط ومسارات المواصلات</h1>
            <p className={styles.pageSubtitle}>
              إضافة وتعديل خطوط مواصلات الانتقال بين المدن، المراحل، والأجرة والخطوات التفصيلية.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Export to Excel */}
        <button
          type="button"
          className={styles.secondaryActionBtn}
          onClick={onExportExcel}
          title="تصدير جميع المسارات إلى ملف Excel"
          style={{
            borderColor: "rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            background: "rgba(16, 185, 129, 0.08)"
          }}
        >
          <i className="bx bx-export" style={{ fontSize: "1.15rem" }} />
          <span>تصدير إكسل</span>
        </button>

        {/* Import from Excel */}
        <button
          type="button"
          className={styles.secondaryActionBtn}
          onClick={onOpenExcelModal}
          title="استيراد مسارات وخطوات من ملف Excel"
          style={{
            borderColor: "rgba(59, 130, 246, 0.3)",
            color: "#60a5fa",
            background: "rgba(59, 130, 246, 0.08)"
          }}
        >
          <i className="bx bx-import" style={{ fontSize: "1.15rem" }} />
          <span>استيراد من إكسل</span>
        </button>

        {/* Add Route Button */}
        <button
          className={showAddForm ? styles.secondaryActionBtn : styles.primaryActionBtn}
          onClick={onToggleForm}
          type="button"
        >
          <i
            className={`bx ${showAddForm ? "bx-x" : "bx-plus-circle"}`}
            style={{ fontSize: "1.2rem" }}
          />
          <span>{showAddForm ? "إلغاء الإضافة" : "+ إضافة طريق جديد"}</span>
        </button>
      </div>
    </div>
  );
}
