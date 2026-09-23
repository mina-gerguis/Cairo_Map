"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { AppFeedback } from "../../types";

interface ProfileFeedbackModalsProps {
  // Suggestion Modal
  showSuggestionModal: boolean;
  setShowSuggestionModal: (show: boolean) => void;
  suggestionType: string;
  setSuggestionType: (type: string) => void;
  suggestionMessage: string;
  setSuggestionMessage: (msg: string) => void;
  suggestionLoading: boolean;
  isSuggestionFormValid: boolean;
  handleSendSuggestion: () => Promise<void>;
  // Bug Report Modal
  showBugReportModal: boolean;
  setShowBugReportModal: (show: boolean) => void;
  bugType: string;
  setBugType: (type: string) => void;
  bugDetails: string;
  setBugDetails: (details: string) => void;
  bugImage: string;
  setBugImage: (img: string) => void;
  setBugImageFile: (file: File | null) => void;
  bugLoading: boolean;
  bugUploading: boolean;
  isBugFormValid: boolean;
  handleBugImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendBugReport: () => Promise<void>;
  // Delete Feedback
  feedbackToDelete: AppFeedback | null;
  setFeedbackToDelete: (fb: AppFeedback | null) => void;
  handleDeleteFeedback: (id: string) => Promise<void>;
  // Retract Proposal
  proposalToRetract: string | null;
  setProposalToRetract: (id: string | null) => void;
  handleRetractProposal: (id: string) => Promise<void>;
  // Retract Report
  reportToRetract: string | null;
  setReportToRetract: (id: string | null) => void;
  handleRetractReport: (id: string) => Promise<void>;
}

export const ProfileFeedbackModals: React.FC<ProfileFeedbackModalsProps> = ({
  showSuggestionModal,
  setShowSuggestionModal,
  suggestionType,
  setSuggestionType,
  suggestionMessage,
  setSuggestionMessage,
  suggestionLoading,
  isSuggestionFormValid,
  handleSendSuggestion,
  showBugReportModal,
  setShowBugReportModal,
  bugType,
  setBugType,
  bugDetails,
  setBugDetails,
  bugImage,
  setBugImage,
  setBugImageFile,
  bugLoading,
  bugUploading,
  isBugFormValid,
  handleBugImageChange,
  handleSendBugReport,
  feedbackToDelete,
  setFeedbackToDelete,
  handleDeleteFeedback,
  proposalToRetract,
  setProposalToRetract,
  handleRetractProposal,
  reportToRetract,
  setReportToRetract,
  handleRetractReport,
}) => {
  return (
    <>
      {/* Suggestions Modal */}
      <CustomModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        title="تقديم اقتراح"
        message="ساعدنا في تحسين الخدمة."
        iconSrc="/images/icons3d/light.png"
        borderColor="var(--modelCardBorder)"
        primaryButton={{
          label: suggestionLoading ? "جاري الإرسال..." : "إرسال",
          onClick: handleSendSuggestion,
          bgColor: "var(--mainBtn)",
          disabled: suggestionLoading || !isSuggestionFormValid,
          icon: <i className="bx bx-paper-plane" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setShowSuggestionModal(false),
          bgColor: "var(--btn-cancel)",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: "bold",
              }}
            >
              نوع الاقتراح
            </label>
            <select
              value={suggestionType}
              onChange={(e) => setSuggestionType(e.target.value)}
              className="input-fields help-select"
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              <option value="اقتراح لتحسين الشكل">اقتراح لتحسين الشكل</option>
              <option value="اقتراح إضافة ميزة جديدة">اقتراح إضافة ميزة جديدة</option>
              <option value="اقتراح آخر">اقتراح آخر</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: "bold",
              }}
            >
              رسالة الاقتراح
            </label>
            <textarea
              className="input-fields"
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                resize: "vertical",
                fontFamily: "var(--font-cairo)",
              }}
              placeholder="اكتب تفاصيل اقتراحك هنا..."
              value={suggestionMessage}
              onChange={(e) => setSuggestionMessage(e.target.value)}
            />
          </div>
        </div>
      </CustomModal>

      {/* Bug Report Modal */}
      <CustomModal
        isOpen={showBugReportModal}
        onClose={() => {
          if (!bugLoading && !bugUploading) {
            setShowBugReportModal(false);
            setBugType("");
            setBugDetails("");
            setBugImage("");
            setBugImageFile(null);
          }
        }}
        closeOnOverlayClick={!bugLoading && !bugUploading}
        title="الإبلاغ عن مشكلة"
        message="يرجى تزويدنا بتفاصيل المشكلة لحلها."
        iconSrc="/images/icons3d/alert.png"
        borderColor="var(--modelCardBorder)"
        primaryButton={{
          label: bugLoading ? "جاري الإرسال..." : "إرسال",
          onClick: handleSendBugReport,
          bgColor: "var(--mainBtn)",
          disabled: bugLoading || bugUploading || !isBugFormValid,
          icon: <i className="bx bx-paper-plane" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => {
            if (!bugLoading && !bugUploading) {
              setShowBugReportModal(false);
              setBugType("");
              setBugDetails("");
              setBugImage("");
              setBugImageFile(null);
            }
          },
          bgColor: "var(--btn-cancel)",
          disabled: bugLoading || bugUploading,
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: "bold",
              }}
            >
              نوع المشكلة
            </label>
            <input
              type="text"
              className="input-fields"
              placeholder="مثال: مشكلة في تسجيل الدخول، بطء الصفحة، إلخ."
              value={bugType}
              onChange={(e) => setBugType(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: "bold",
              }}
            >
              تفاصيل المشكلة
            </label>
            <textarea
              className="input-fields"
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                resize: "vertical",
                fontFamily: "var(--font-cairo)",
              }}
              placeholder="يرجى كتابة تفاصيل ما حدث..."
              value={bugDetails}
              onChange={(e) => setBugDetails(e.target.value)}
            />
          </div>

          {/* Upload Image Section */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: "bold",
              }}
            >
              إرفاق صورة للمشكلة (اختياري)
            </label>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px dashed var(--border-glass)",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                position: "relative",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                height: "120px",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleBugImageChange}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                  cursor: "pointer",
                  width: "100%",
                }}
                disabled={bugLoading || bugUploading}
              />
              {bugImage ? (
                <div style={{ position: "relative", width: "100%", height: "100px" }}>
                  <img
                    src={bugImage}
                    alt="معاينة الصورة"
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBugImage("");
                      setBugImageFile(null);
                    }}
                    style={{
                      position: "absolute",
                      top: "0px",
                      left: "0px",
                      background: "rgba(0,0,0,0.7)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>
              ) : (
                <>
                  <i
                    className="bx bx-camera"
                    style={{ fontSize: "1.8rem", color: "var(--text-muted)" }}
                  ></i>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    اضغط لاختيار صورة، رفع ملف، أو التقاط صورة جديدة
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Delete Feedback Confirmation Modal */}
      <CustomModal
        isOpen={feedbackToDelete !== null}
        onClose={() => setFeedbackToDelete(null)}
        title="تأكيد الحذف"
        titleColor="#ff3b30"
        message="هل أنت متأكد من حذف هذا الطلب"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        primaryButton={{
          label: "تأكيد",
          onClick: () => {
            if (feedbackToDelete) {
              handleDeleteFeedback(feedbackToDelete.id);
            }
          },
          bgColor: "#ff3b30",
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setFeedbackToDelete(null),
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--btn-cancel)",
        }}
      >
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          سيتم حذف هذا الطلب نهائياً من سجلاتك ولا يمكن التراجع عن هذه الخطوة.
        </p>
      </CustomModal>

      {/* Retract Proposal Confirmation Modal */}
      <CustomModal
        isOpen={proposalToRetract !== null}
        onClose={() => setProposalToRetract(null)}
        title="تأكيد التراجع"
        titleColor="#ff9500"
        message="هل أنت متأكد من التراجع عن هذا الاقتراح؟"
        iconNode={
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 149, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff9500",
            }}
          >
            <i className="bx bx-undo" style={{ fontSize: "2rem" }}></i>
          </div>
        }
        borderColor="rgba(255, 149, 0, 0.25)"
        primaryButton={{
          label: "تأكيد",
          onClick: () => {
            const pid = proposalToRetract;
            if (pid) {
              setProposalToRetract(null);
              handleRetractProposal(pid);
            }
          },
          bgColor: "#ff9500",
          icon: <i className="bx bx-check" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setProposalToRetract(null),
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--btn-cancel)",
        }}
      >
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          سيتم سحب اقتراح هذا المكان ولن يعود معروضاً للمراجعة من قِبل المشرفين.
        </p>
      </CustomModal>

      {/* Retract Report Confirmation Modal */}
      <CustomModal
        isOpen={reportToRetract !== null}
        onClose={() => setReportToRetract(null)}
        title="تأكيد التراجع"
        titleColor="#ff9500"
        message="هل أنت متأكد من حذف هذا البلاغ؟"
        iconNode={
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 149, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff9500",
            }}
          >
            <i className="bx bx-undo" style={{ fontSize: "2rem" }}></i>
          </div>
        }
        borderColor="rgba(255, 149, 0, 0.25)"
        primaryButton={{
          label: "تأكيد",
          onClick: () => {
            const rid = reportToRetract;
            if (rid) {
              setReportToRetract(null);
              handleRetractReport(rid);
            }
          },
          bgColor: "#ff9500",
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setReportToRetract(null),
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--btn-cancel)",
        }}
      >
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          سيتم إغلاق وسحب هذا البلاغ ولن تتخذه الإدارة بعين الاعتبار.
        </p>
      </CustomModal>
    </>
  );
};
