import React from "react";
import styles from "../airports.module.css";

interface AirportsReportBannerProps {
  onOpenReport: () => void;
}

export default function AirportsReportBanner({ onOpenReport }: AirportsReportBannerProps) {
  return (
    <div className={styles.reportBanner}>
      <div className={styles.reportBannerContent}>
        <div className={styles.reportBannerHeader}>
          <div className={styles.reportBannerIconBox}>
            <i className="bx bx-error-circle" />
          </div>
          <div>
            <h3 className={styles.reportBannerTitle}>
              الإبلاغ عن خطأ أو تحديث في بيانات المطارات
            </h3>
            <p className={styles.reportBannerDesc}>
              هل لاحظت أي خطأ في أرقام الهواتف، بيانات الصالات، شركات الطيران أو ترغب في اقتراح مطار جديد؟ شاركنا ملاحظتك لمساعدتنا في تدقيق البيانات وتحديثها باستمرار.
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
