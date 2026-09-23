import React from "react";
import styles from "../propose-place.module.css";

interface ProposePlaceAlertsProps {
  editId: string | null;
  placeName: string;
  onCancelEdit: () => void;
  limitReached: boolean;
  rejectionReason: string | null;
}

export default function ProposePlaceAlerts({
  editId,
  placeName,
  onCancelEdit,
  limitReached,
  rejectionReason,
}: ProposePlaceAlertsProps) {
  return (
    <>
      {/* 1. Pending Limit Reached Notice (only if not editing) */}
      {limitReached && !editId && (
        <div className={`${styles.alertBox} ${styles.alertWarning}`}>
          <div style={{ fontSize: "1.8rem", color: "#ff9500", flexShrink: 0 }}>⚠️</div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#ff9500", margin: "0 0 4px" }}>
              وصلت للحد الأقصى (5 طلبات معلقة)
            </h3>
            <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
              لا يمكنك تقديم مكان جديد حالياً حتى تتم مراجعة الطلبات السابقة، ولكن يمكنك تعديل وإعادة إرسال أي مكان معلق أو مرفوض من قائمة "أماكني المقترحة" بالأسفل.
            </p>
          </div>
        </div>
      )}

      {/* 2. Active Edit Mode Banner */}
      {editId && (
        <div className={`${styles.alertBox} ${styles.alertEdit}`}>
          <span
            style={{
              fontWeight: "700",
              color: "var(--color-primary, #6c63ff)",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ✏️ أنت الآن تقوم بتعديل:{" "}
            <span style={{ color: "var(--text-primary)" }}>{placeName || "المكان المقترح"}</span>
          </span>
          <button
            type="button"
            onClick={onCancelEdit}
            className={styles.cancelEditBtn}
          >
            <i className="bx bx-x" /> إلغاء التعديل واقتراح مكان جديد
          </button>
        </div>
      )}

      {/* 3. Rejection Reason Banner if rejected & in edit mode */}
      {editId && rejectionReason && (
        <div className={`${styles.alertBox} ${styles.alertDanger}`}>
          <div style={{ fontSize: "1.8rem", color: "#ff3b30", flexShrink: 0 }}>⚠️</div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ff3b30", margin: "0 0 6px" }}>
              سبب رفض الاقتراح السابق من الإدارة:
            </h3>
            <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
              &ldquo;{rejectionReason}&rdquo;
            </p>
            <p style={{ margin: "10px 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
              قم بتعديل النقاط المذكورة أعلاه ثم اضغط على زر &quot;إعادة إرسال للمراجعة&quot; بالأسفل.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
