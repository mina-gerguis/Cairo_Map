import React, { RefObject } from "react";
import { PlaceProposal } from "../types";
import styles from "../propose-place.module.css";

interface ProposePlaceHistoryProps {
  historyRef?: RefObject<HTMLDivElement | null>;
  proposals: PlaceProposal[];
  loading: boolean;
  editId: string | null;
  onRefresh: () => void;
  onSelectEdit: (id: string) => void;
}

export default function ProposePlaceHistory({
  historyRef,
  proposals,
  loading,
  editId,
  onRefresh,
  onSelectEdit,
}: ProposePlaceHistoryProps) {
  return (
    <div ref={historyRef} className={styles.historySection}>
      {/* Header */}
      <div className={styles.historyHeader}>
        <h2 className={styles.historyTitle}>
          <i
            className="bx bx-list-ul"
            style={{ color: "var(--color-primary, #6c63ff)", fontSize: "1.4rem" }}
          />
          <span>أماكني المقترحة</span>
          {proposals.length > 0 && (
            <span className={styles.historyCount}>{proposals.length}</span>
          )}
        </h2>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className={styles.refreshBtn}
        >
          <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Content states */}
      {loading ? (
        <div className={styles.emptyCard}>
          <div className="spinner" style={{ width: "32px", height: "32px", margin: "0 auto 12px" }} />
          <span>جاري تحميل أماكنك المقترحة...</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className={styles.emptyCard}>
          <i
            className="bx bx-map-pin"
            style={{ fontSize: "2.6rem", color: "var(--text-muted)", marginBottom: "12px", display: "block" }}
          />
          <p style={{ margin: 0, fontWeight: "600" }}>لم تقم باقتراح أي أماكن حتى الآن.</p>
        </div>
      ) : (
        <div className={styles.proposalsList}>
          {proposals.map((prop) => {
            const isCurrentEditing = editId === prop.id;
            const isApproved = prop.status === "approved";
            const isRejected = prop.status === "rejected";
            const isPending = prop.status === "pending" || !prop.status;
            const displayImage = prop.image_url || (prop.images && prop.images[0]);

            return (
              <div
                key={prop.id}
                className={`${styles.proposalCard} ${
                  isCurrentEditing ? styles.proposalCardEditing : ""
                }`}
              >
                {/* Image Thumbnail */}
                <div className={styles.proposalThumb}>
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={prop.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <i
                      className="bx bx-store-alt"
                      style={{ fontSize: "2rem", color: "var(--text-muted)" }}
                    />
                  )}
                </div>

                {/* Details */}
                <div className={styles.proposalBody}>
                  <div className={styles.proposalHeaderRow}>
                    <h3 className={styles.proposalName}>{prop.name}</h3>

                    {/* Status Badges */}
                    {isPending && (
                      <span className={styles.statusBadgePending}>
                        <i className="bx bx-time-five" /> قيد المراجعة
                      </span>
                    )}
                    {isRejected && (
                      <span className={styles.statusBadgeRejected}>
                        <i className="bx bx-x-circle" /> مرفوض من الإدارة
                      </span>
                    )}
                    {isApproved && (
                      <span className={styles.statusBadgeApproved}>
                        <i className="bx bx-check-circle" /> مقبول ومُعتمد ✓
                      </span>
                    )}

                    {isCurrentEditing && (
                      <span className={styles.editingBadge}>✏️ جاري التعديل</span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className={styles.proposalMeta}>
                    <span>
                      <i className="bx bx-folder" style={{ color: "var(--color-primary, #6c63ff)" }} />{" "}
                      {prop.category_label || prop.category}
                    </span>
                    {prop.governorate && (
                      <span>
                        <i
                          className="bx bx-map-pin"
                          style={{ color: "var(--color-primary, #6c63ff)" }}
                        />{" "}
                        {prop.governorate} - {prop.city}
                      </span>
                    )}
                    {prop.created_at && (
                      <span style={{ color: "var(--text-muted)" }}>
                        <i className="bx bx-calendar" />{" "}
                        {new Date(prop.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </div>

                  {/* Rejection Note */}
                  {isRejected && prop.rejection_reason && (
                    <div className={styles.rejectionCallout}>
                      <strong style={{ color: "#ff3b30" }}>سبب الرفض:</strong> &ldquo;
                      {prop.rejection_reason}&rdquo;
                    </div>
                  )}
                </div>

                {/* Edit Action Button */}
                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => onSelectEdit(prop.id)}
                    className={`${styles.editProposalBtn} ${
                      isCurrentEditing ? styles.editProposalBtnActive : ""
                    }`}
                  >
                    <i className="bx bx-edit-alt" style={{ fontSize: "1.1rem" }} />
                    <span>{isCurrentEditing ? "جاري التعديل..." : "تعديل وإعادة إرسال"}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
