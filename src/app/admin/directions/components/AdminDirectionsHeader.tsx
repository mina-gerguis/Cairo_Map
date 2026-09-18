import React from "react";
import styles from "../directions.module.css";

interface AdminDirectionsHeaderProps {
  showAddForm: boolean;
  onToggleForm: () => void;
  onOpenExcelModal: () => void;
  onExportExcel: () => void;
  onOpenCheatsheet: () => void;
}

export function AdminDirectionsHeader({
  showAddForm,
  onToggleForm,
  onOpenExcelModal,
  onExportExcel,
  onOpenCheatsheet
}: AdminDirectionsHeaderProps) {
  return (
    <div className={styles.headerRow}>
      <div>
        <h2 className={styles.pageTitle}>إدارة خطوط المواصلات</h2>
        <p className={styles.pageSubtitle}>
          إضافة وتعديل خطوط مواصلات الانتقال بين المدن، المراحل، والأجرة والخطوات التفصيلية.
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Transit Types Cheatsheet */}
        <button
          type="button"
          className="btn tab"
          onClick={onOpenCheatsheet}
          title="دليل كتابة أنواع ورموز المواصلات في الإكسل"
        style={{padding: "var(--padding-btn)"}}
        >
          <i className="bx bx-book-bookmark" style={{ marginLeft: "6px" }} />
          <span>دليل الأنواع </span>
        </button>

        {/* Export to Excel */}
        <button
          type="button"
          className="btn btn-export"
          onClick={onExportExcel}
          title="تصدير جميع المسارات إلى ملف Excel"
        >
          <i className="bx bx-export" style={{ marginLeft: "6px" }} />
          <span>تصدير</span>
        </button>

        {/* Import from Excel */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenExcelModal}
          title="استيراد مسارات وخطوات من ملف Excel"
        >
          <i className="bx bx-import" style={{ marginLeft: "6px" }} />
          <span>استيراد</span>
        </button>

        {/* Add Route Button */}
        <button
          onClick={onToggleForm}
          className={showAddForm ? "btn btn-cancel" : "btn btn-secondary"}
          type="button"
        >
          <i
            className={`bx ${showAddForm ? "bx-x" : "bx-plus-circle"}`}
            style={{ fontSize: "1.15rem", marginLeft: "6px" }}
          />
          <span>{showAddForm ? "إلغاء الإضافة" : "إضافة طريق جديد"}</span>
        </button>
      </div>
    </div>
  );
}
