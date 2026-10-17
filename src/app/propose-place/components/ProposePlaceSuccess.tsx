import React from "react";
import Link from "next/link";
import styles from "../propose-place.module.css";

interface ProposePlaceSuccessProps {
  isEditMode: boolean;
  onProposeAnother: () => void;
}

export default function ProposePlaceSuccess({
  isEditMode,
  onProposeAnother,
}: ProposePlaceSuccessProps) {
  return (
    <div className={styles.successCard}>
      <div className={styles.successIconWrap}>
        ✓
      </div>

      <h2 className={styles.successTitle}>
        {isEditMode ? "تمت إعادة إرسال الاقتراح بنجاح!" : "تم إرسال اقتراحك بنجاح!"}
      </h2>

      <p className={styles.successText}>
        شكراً لمساهمتك! ستقوم الإدارة بمراجعة تفاصيل المكان قريباً، وسوف يصلك إشعار فور اتخاذ القرار.
      </p>

      <div className={styles.successBtnGroup}>
        <Link
          href="/profile"
          className="btn btn-primary"
          style={{ padding: "12px 26px", textDecoration: "none" }}
        >
          <i className="bx bx-user" /> العودة للبروفايل
        </Link>
        <button
          type="button"
          className="btn"
          onClick={onProposeAnother}
          style={{ padding: "12px 24px" }}
        >
          <i className="bx bx-plus" /> اقتراح مكان آخر
        </button>
      </div>
    </div>
  );
}
