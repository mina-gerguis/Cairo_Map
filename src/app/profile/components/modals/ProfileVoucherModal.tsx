"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Ticket,
  ClipboardPaste,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wallet,
  Star,
  LockOpen,
  Clock,
  Loader2,
  History,
} from "lucide-react";
import styles from "../../page.module.css";
import {
  ActiveUnlockedPerk,
  VoucherRedemptionLog,
  VoucherRewardType,
} from "@/types/vouchers";
import { redeemVoucherCode } from "@/lib/vouchers";
import { IconVersionsFilled } from "@tabler/icons-react";

export type VoucherModalVariant = "vouchers" | "coupons";

interface ProfileVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: VoucherModalVariant;
  unlockedPerks: ActiveUnlockedPerk[];
  redemptionHistory: VoucherRedemptionLog[];
  loadingVouchers?: boolean;
  onRedeemSuccess: () => Promise<void> | void;
  onOpenWalletPromo?: () => void;
  onOpenWalletMain?: () => void;
}

export const ProfileVoucherModal: React.FC<ProfileVoucherModalProps> = ({
  isOpen,
  onClose,
  unlockedPerks,
  redemptionHistory,
  loadingVouchers = false,
  onRedeemSuccess,
  onOpenWalletPromo,
  onOpenWalletMain,
}) => {
  const [codeInput, setCodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    rewardType?: VoucherRewardType;
  } | null>(null);

  if (!isOpen) return null;

  const handleCodeChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCodeInput(cleaned);
    if (feedback) setFeedback(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleCodeChange(text.trim());
      }
    } catch {
      // Clipboard access not granted; ignore silently
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = codeInput.trim().toUpperCase();
    if (!normalized || normalized.length < 4) {
      setFeedback({
        type: "error",
        title: "كود غير مكتمل",
        message: "يرجى إدخال كود صحيح مكوّن من حروف وأرقام (4 أحرف على الأقل).",
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await redeemVoucherCode(normalized);
      if (!res.success) {
        setFeedback({
          type: "error",
          title: "تعذر استرداد القسيمة",
          message: res.message,
        });
        return;
      }

      await onRedeemSuccess();
      setFeedback({
        type: "success",
        title: "تم الاسترداد بنجاح",
        message: res.rewardSummary || res.message,
        rewardType: res.rewardType,
      });
      setCodeInput("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        title: "حدث خطأ",
        message: err?.message || "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderRewardIcon = (type: VoucherRewardType) => {
    switch (type) {
      case "main_balance":
        return <Wallet size={16} style={{ color: "#10b981" }} />;
      case "promo_balance":
        return <Sparkles size={16} style={{ color: "#818cf8" }} />;
      case "feature_unlock":
        return <Star size={16} style={{ color: "#f59e0b" }} />;
      case "page_access":
        return <LockOpen size={16} style={{ color: "#0ea5e9" }} />;
    }
  };

  return (
    <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "24px",
          background: "var(--color-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card)",
          animation: "slide-up 0.3s ease",
          maxHeight: "88vh",
          overflowY: "auto",
          direction: "rtl",
          textAlign: "right",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-close border-none"
              aria-label="إغلاق"
            >
              <ChevronRight size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.12rem",
                  fontWeight: "800",
                  color: "var(--color-fg)",
                  fontFamily: "var(--font-sub)",
                }}
              >
                استرداد القسائم
              </h3>
            </div>
          </div>
        </div>

        {/* Redemption Form Card */}
        <form
          onSubmit={handleRedeem}
          style={{
            padding: "16px",
            marginBottom: "26px",
          }}
        >
          <label
            htmlFor="voucher-code-input"
            style={{
              display: "block",
              fontSize: "0.86rem",
              fontWeight: "700",
              color: "var(--color-fg)",
              marginBottom: "6px",
            }}
          >
            أدخل كود القسيمة
          </label>

          {/* Code Input Field */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <input
              id="voucher-code-input"
              type="text"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              placeholder="QRB-XXXX-XXXX"
              value={codeInput}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="input-fields"
              style={{
                width: "100%",
                height: "48px",
                paddingLeft: "86px",
                paddingRight: "14px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "1.02rem",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textAlign: "left",
                borderRadius: "10px",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {codeInput ? (
                <button
                  type="button"
                  onClick={() => handleCodeChange("")}
                  aria-label="مسح الكود"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    background: "var(--color-bg)",
                    color: "var(--text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  style={{
                    height: "32px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    background: "var(--color-bg)",
                    color: "var(--text-secondary)",
                    fontSize: "0.74rem",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                  }}
                >
                  <ClipboardPaste size={13} />
                  <span>لصق</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !codeInput.trim()}
            className={`btn btn-primary ${styles.modalPressBtn}`}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              justifyContent: "center",
              fontSize: "0.92rem",
              fontWeight: "800",
              gap: "8px",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>جاري التحقق من الكود...</span>
              </>
            ) : (
              <>
                <Ticket size={17} />
                <span>استرداد القسيمة</span>
              </>
            )}
          </button>
        </form>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              marginBottom: "16px",
              border:
                feedback.type === "success"
                  ? "1px solid rgba(16, 185, 129, 0.35)"
                  : "1px solid rgba(239, 68, 68, 0.35)",
              background:
                feedback.type === "success"
                  ? "rgba(16, 185, 129, 0.08)"
                  : "rgba(239, 68, 68, 0.08)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} style={{ color: "#10b981", marginTop: "2px", flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} style={{ color: "#ef4444", marginTop: "2px", flexShrink: 0 }} />
              )}
              <div>
                <div
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: "800",
                    color: feedback.type === "success" ? "#10b981" : "#ef4444",
                  }}
                >
                  {feedback.title}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-fg)",
                    marginTop: "3px",
                    lineHeight: 1.5,
                  }}
                >
                  {feedback.message}
                </div>
              </div>
            </div>

            {feedback.type === "success" &&
              (feedback.rewardType === "promo_balance" || feedback.rewardType === "main_balance") && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (feedback.rewardType === "promo_balance" && onOpenWalletPromo) {
                      onOpenWalletPromo();
                    } else if (onOpenWalletMain) {
                      onOpenWalletMain();
                    }
                  }}
                  className={styles.voucherChip}
                  style={{ flexShrink: 0 }}
                >
                  عرض بالمحفظة
                </button>
              )}
          </div>
        )}

        {/* Active Unlocked Features & Timed Page Access
        <div style={{ marginBottom: "16px" }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-fg)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <LockOpen size={15} style={{ color: "#0ea5e9" }} />
            الصلاحيات والمزايا المفتوحة ({unlockedPerks.length})
          </h3>

          {loadingVouchers ? (
            <div style={{ padding: "14px", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              جاري التحميل...
            </div>
          ) : unlockedPerks.length === 0 ? (
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                border: "1px dashed var(--border-glass)",
                textAlign: "center",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              لا توجد مزايا أو صلاحيات مؤقتة مفعّلة بالأكواد حالياً.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {unlockedPerks.map((perk) => (
                <div
                  key={perk.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(14, 165, 233, 0.25)",
                    background: "rgba(14, 165, 233, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                    {perk.kind === "feature_unlock" ? (
                      <Star size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
                    ) : (
                      <Clock size={16} style={{ color: "#0ea5e9", flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-fg)" }}>
                        {perk.title}
                      </div>
                      <div style={{ fontSize: "0.71rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {perk.expiresAt
                          ? `ينتهي تلقائياً في ${new Date(perk.expiresAt).toLocaleDateString("ar-EG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}`
                          : "مفتوح بشكل دائم"}
                      </div>
                    </div>
                  </div>
                  <code
                    dir="ltr"
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      background: "var(--color-bg)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    {perk.sourceCode}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div> */}

        {/* Redemption History */}
        <div style={{paddingTop: "14px" }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-fg)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <IconVersionsFilled  size={18}/>
            سجل الأكواد المستردة
          </h3>

          {loadingVouchers ? (
            <div style={{ padding: "14px", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              جاري التحميل...
            </div>
          ) : redemptionHistory.length === 0 ? (
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                border: "1px dashed var(--border-glass)",
                textAlign: "center",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              لم تقم باسترداد أي قسائم بعد.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {redemptionHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-glass)",
                    background: "var(--bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-fg)" }}>
                        {item.rewardSummary}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {new Date(item.redeemedAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <code
                    dir="ltr"
                   className="tab fs-xs"
                  >
                    {item.code}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
