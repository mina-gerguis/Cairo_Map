"use client";

import React from "react";
import styles from "../parking.module.css";

interface ParkingBottomBannerProps {
  onOpenSuggestModal: () => void;
  onOpenReportModal: () => void;
}

export function ParkingBottomBanner({
  onOpenSuggestModal,
  onOpenReportModal,
}: ParkingBottomBannerProps) {
  return (
    <div className={styles.calloutBanner}>
      <div className={styles.calloutIcon}>
        <i className="bx bx-bulb" />
      </div>

      <div className={styles.calloutText}>
        <h3 className={styles.calloutTitle}>
          تعرف جراج مش مسجل في الدليل أو لاحظت معلومة غير دقيقة؟
        </h3>
        <p className={styles.calloutDesc}>
          تقدر تقترح إضافة جراج جديد أو الإبلاغ عن أي تعديل في الأسعار والمواعيد لمساعدة باقي السائقين.
        </p>
      </div>

      <div className={styles.calloutActions}>
        <button
          type="button"
          onClick={onOpenSuggestModal}
          className={styles.suggestBtn}
        >
          <i className="bx bx-plus-circle" />
          <span>اقترح جراج جديد</span>
        </button>

        <button
          type="button"
          onClick={onOpenReportModal}
          className={styles.bannerReportBtn}
        >
          <i className="bx bx-error" />
          <span>إبلاغ عن مشكلة</span>
        </button>
      </div>
    </div>
  );
}

export default ParkingBottomBanner;
