import React from "react";
import styles from "../ports.module.css";

interface PortsReportBannerProps {
  onOpenReport: () => void;
}

export default function PortsReportBanner({ onOpenReport }: PortsReportBannerProps) {
  return (
    <div className={styles.reportBanner}>
      <div className={styles.reportBannerContent}>
        <div className={styles.reportBannerHeader}>
          <div className={styles.reportBannerIconBox}>
            <i className="bx bx-error-circle" />
          </div>
          <div>
            <h3 className={styles.reportBannerTitle}>
              الإبلاغ عن خطأ أو تحديث في بيانات الموانئ المصرية
            </h3>
            <p className={styles.reportBannerDesc}>
              هل لاحظت أي خطأ في بيانات الأرصفة، محطات التداول، الهيئات المشغلة، أو ترغب باقتراح ميناء جديد؟ شاركنا ملاحظتك لمساعدتنا في تدقيق البيانات.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenReport}
          className={styles.reportBannerBtn}
        >
          <i className="bx bx-flag" />
          <span>تقديم بلاغ عن خطأ</span>
        </button>
      </div>
    </div>
  );
}
