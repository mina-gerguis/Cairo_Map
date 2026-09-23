"use client";

import React from "react";
import Image from "next/image";
import clsx from "clsx";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import { UserProfile, BalanceTransaction, ProfileAlertMessage } from "../../types";
import { SUPPORTED_PAYMENT_PROVIDERS } from "../../constants";
import { formatNumber } from "../../utils";
import styles from "../../page.module.css";

interface ProfileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  walletTab: "main" | "deposit" | "withdraw" | "history";
  setWalletTab: (tab: "main" | "deposit" | "withdraw" | "history") => void;
  // Deposit
  depositMethod: string;
  setDepositMethod: (m: string) => void;
  depositAmount: string;
  setDepositAmount: (a: string) => void;
  depositSender: string;
  setDepositSender: (s: string) => void;
  depositImageFile: File | null;
  depositImageUrl: string;
  isSubmittingDeposit: boolean;
  depositStatus: ProfileAlertMessage | null;
  handleDepositImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepositSubmit: (e: React.FormEvent) => Promise<void>;
  // Withdraw
  withdrawMethod: string;
  setWithdrawMethod: (m: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (a: string) => void;
  withdrawRecipient: string;
  setWithdrawRecipient: (r: string) => void;
  withdrawName: string;
  setWithdrawName: (n: string) => void;
  isSubmittingWithdraw: boolean;
  withdrawStatus: ProfileAlertMessage | null;
  handleWithdrawSubmit: (e: React.FormEvent) => Promise<void>;
  // Transactions
  userTransactions: BalanceTransaction[];
  loadingTransactions: boolean;
  pendingTransactionsCount: number;
}

export const ProfileWalletModal: React.FC<ProfileWalletModalProps> = ({
  isOpen,
  onClose,
  profile,
  walletTab,
  setWalletTab,
  depositMethod,
  setDepositMethod,
  depositAmount,
  setDepositAmount,
  depositSender,
  setDepositSender,
  depositImageFile,
  depositImageUrl,
  isSubmittingDeposit,
  depositStatus,
  handleDepositImageChange,
  handleDepositSubmit,
  withdrawMethod,
  setWithdrawMethod,
  withdrawAmount,
  setWithdrawAmount,
  withdrawRecipient,
  setWithdrawRecipient,
  withdrawName,
  setWithdrawName,
  isSubmittingWithdraw,
  withdrawStatus,
  handleWithdrawSubmit,
  userTransactions,
  loadingTransactions,
  pendingTransactionsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "24px 28px",
          borderRadius: "16px",
          background: "var(--bgPrimary)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid var(--border-glass)",
          animation: "slide-up 0.3s ease",
          maxHeight: "90vh",
          overflowY: "auto",
          direction: "rtl",
          textAlign: "right",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {walletTab !== "main" ? (
            <button
              onClick={() => setWalletTab("main")}
              className="btn-close"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <i
                className="bx bx-arrow-back"
                style={{ fontSize: "1.2rem", transform: "scaleX(-1)" }}
              ></i>
            </button>
          ) : (
            <button onClick={onClose} className="btn-close">
              <i className="bx bx-x"></i>
            </button>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              fontFamily: "var(--font-cairo)",
            }}
          >
            {walletTab === "main" && "المحفظة المالية"}
            {walletTab === "deposit" && "طلب إيداع رصيد"}
            {walletTab === "withdraw" && "طلب سحب رصيد"}
            {walletTab === "history" && "سجل المعاملات"}
          </h3>
          <div style={{ width: "38px" }}></div>
        </div>

        {/* TAB 1: MAIN WALLET DASHBOARD */}
        {walletTab === "main" && (
          <>
            <div
              style={{
                textAlign: "center",
                padding: "12px 0 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Image
                  src="/images/profile/egyptianPounds3d.png"
                  alt="رصيد المحفظة"
                  draggable={false}
                  width={100}
                  height={100}
                  style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  fontWeight: "700",
                  fontFamily: "var(--font-cairo)",
                }}
              >
                رصيد المحفظة الحالي
              </span>
              <span style={{ fontSize: "2.4rem", fontWeight: "900", color: "#10b981", margin: "4px 0" }}>
                {formatNumber(profile?.balance ?? 0, 2)} ج.م
              </span>
            </div>

            {/* Actions Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                <button
                  type="button"
                  onClick={() => setWalletTab("deposit")}
                  className={clsx("btn", styles.actionsButton)}
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <PiHandWithdrawBold style={{ fontSize: "1.1rem" }} />
                  إيداع
                </button>
                <button
                  type="button"
                  onClick={() => setWalletTab("withdraw")}
                  className={clsx("btn", styles.actionsButton)}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#f87171",
                    border: "1px solid rgba(29, 26, 26, 0.2)",
                  }}
                >
                  <PiHandDepositBold style={{ fontSize: "1.1rem" }} />
                  سحب
                </button>
              </div>
              <button
                type="button"
                onClick={() => setWalletTab("history")}
                className="btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <i className="bx bx-history" style={{ fontSize: "1.1rem" }}></i>
                سجل المعاملات المالية
              </button>
            </div>
          </>
        )}

        {/* TAB 2: DEPOSIT FORM */}
        {walletTab === "deposit" && (
          <form
            onSubmit={handleDepositSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}
          >
            {pendingTransactionsCount >= 2 && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#f87171",
                  lineHeight: "1.6",
                  textAlign: "right",
                }}
              >
                <i className="bx bx-error" style={{ marginLeft: "8px", verticalAlign: "middle" }}></i>
                <strong>تنبيه هام (الحد الأقصى للطلبات المعلقة):</strong> لديك حالياً{" "}
                <strong>{pendingTransactionsCount}</strong> طلبات معلقة قيد المراجعة. لا يمكنك تقديم
                طلب إيداع جديد حتى تقوم الإدارة بمراجعة طلباتك الحالية.
              </div>
            )}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                طريقة الإيداع
              </label>
              <select
                className="input-fields"
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              >
                <option value="instapay">انستا باي (InstaPay)</option>
                <option value="telda">بطاقة تيلدا (Telda)</option>
                <option value="vodafone_cash">محفظة إلكترونية (فودافون كاش أو غيرها)</option>
                <option value="bank_transfer">تحويل بنكي مباشر</option>
              </select>
            </div>

            {/* Instructions */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "0.8rem",
              }}
            >
              <h5 style={{ margin: "0 0 8px", color: "var(--color-secondary)", fontWeight: "bold" }}>
                تعليمات التحويل:
              </h5>
              {depositMethod === "instapay" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بالتحويل عبر تطبيق انستا باي إلى الحساب التالي: <br />
                  العنوان: <strong style={{ color: "var(--text-primary)" }}>cairomap@instapay</strong>
                  <br />
                  الاسم: <strong style={{ color: "var(--text-primary)" }}>Mina G***** A</strong>
                  <br />
                  الرابط السريع :{" "}
                  <a
                    href="https://ipn.eg/S/cairomap/instapay/2FxCLI"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <strong style={{ color: "var(--color-secondary)" }}>
                      https://ipn.eg/S/cairomap/instapay/2FxCLI
                    </strong>
                  </a>
                </p>
              )}
              {depositMethod === "telda" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بالتحويل عبر تطبيق تيلدا إلى التاج (Tag) التالي:
                  <br />
                  التاج: <strong style={{ color: "var(--text-primary)" }}>@minagerguis</strong>
                  <br />
                  الاسم: <strong style={{ color: "var(--text-primary)" }}>Mina Gerguis</strong>
                </p>
              )}
              {depositMethod === "vodafone_cash" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بتحويل رصيد كاش إلى رقم المحفظة التالي:
                  <br />
                  الرقم: <strong style={{ color: "var(--text-primary)" }}>01020372317</strong>
                  <br />
                  الاسم: <strong style={{ color: "var(--text-primary)" }}>مينا جرجس</strong>
                </p>
              )}
              {depositMethod === "bank_transfer" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بالتحويل البنكي المباشر للحساب التالي:
                  <br />
                  البنك:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    بنك قطر الوطني الأهلي (QNB)
                  </strong>
                  <br />
                  رقم الحساب: <strong style={{ color: "var(--text-primary)" }}>1020670700235</strong>
                  <br />
                  الاسم: <strong style={{ color: "var(--text-primary)" }}>مينا جرجس</strong>
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                المبلغ المراد شحنه (بالجنيه المصري)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                placeholder="مثال: 100"
                className="input-fields"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                الرقم/الحساب الذي قمت بالتحويل منه
              </label>
              <input
                type="text"
                required
                placeholder="مثال: رقم محفظتك أو اسم حسابك البنكي"
                className="input-fields"
                value={depositSender}
                onChange={(e) => setDepositSender(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                إرفاق صورة إيصال التحويل
              </label>
              <label
                className="btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "2px dashed var(--bg-muted)",
                  padding: "12px",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <i className="bx bx-image-add" style={{ fontSize: "1.2rem", marginLeft: "6px" }}></i>
                {depositImageFile ? "تغيير الإيصال المرفق" : "اختر صورة الإيصال"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDepositImageChange}
                  className={styles.hiddenInput}
                />
              </label>

              {depositImageUrl && (
                <div style={{ marginTop: "10px", textAlign: "center" }}>
                  <img
                    src={depositImageUrl}
                    alt="إيصال التحويل"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "150px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-glass)",
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  margin: 0,
                  lineHeight: "1.6",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                لتسريع عملية الشحن، يرجى إرفاق صورة إيصال التحويل. <br />
                سيتم مراجعة طلب الشحن الخاص بك من قبل الإدارة وسيتم شحن رصيدك في أقرب وقت ممكن.
              </p>
              <p
                style={{
                  marginTop: "10px",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                }}
              >
                **ملاحظات هامة:**
                <br />• يتم مراجعة طلبات الشحن يدوياً وسيتم شحن رصيدك في أقرب وقت ممكن.
                <br />• تستغرق عملية الشحن من 5 دقائق إلى 24 ساعة.
                <br />• في حالة وجود أي خطأ، يرجى التواصل مع الدعم
              </p>
            </div>

            {depositStatus && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  background:
                    depositStatus.type === "success"
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(239, 68, 68, 0.12)",
                  color: depositStatus.type === "success" ? "#10b981" : "#f87171",
                  border:
                    depositStatus.type === "success"
                      ? "1px solid rgba(16, 185, 129, 0.2)"
                      : "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {depositStatus.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingDeposit || pendingTransactionsCount >= 2}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: "0.9rem",
                ...(pendingTransactionsCount >= 2
                  ? {
                      opacity: 0.35,
                      cursor: "not-allowed",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-muted, #8e8e93)",
                      borderColor: "var(--border-glass, rgba(255, 255, 255, 0.1))",
                    }
                  : {}),
              }}
            >
              {isSubmittingDeposit ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" style={{ marginLeft: "8px" }}></i>
                  جاري إرسال طلب الشحن...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: "6px" }}></i>
                  تأكيد
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: WITHDRAW FORM */}
        {walletTab === "withdraw" && (
          <form
            onSubmit={handleWithdrawSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}
          >
            {pendingTransactionsCount >= 2 && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#f87171",
                  lineHeight: "1.6",
                  textAlign: "right",
                }}
              >
                <i className="bx bx-error" style={{ marginLeft: "8px", verticalAlign: "middle" }}></i>
                <strong>تنبيه هام (الحد الأقصى للطلبات المعلقة):</strong> لديك حالياً{" "}
                <strong>{pendingTransactionsCount}</strong> طلبات معلقة قيد المراجعة. لا يمكنك تقديم
                طلب سحب جديد حتى تقوم الإدارة بمراجعة طلباتك الحالية.
              </div>
            )}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "0.8rem",
                textAlign: "center",
              }}
            >
              <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                الرصيد المتاح للسحب
              </span>
              <h4 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#10b981" }}>
                {formatNumber(profile?.balance ?? 0, 2)} ج.م
              </h4>
              <p style={{ margin: "6px 0 0 0", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                * الحد الأدنى لأي عملية سحب هو 100 ج.م
              </p>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                طريقة استلام الرصيد
              </label>
              <select
                className="input-fields"
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              >
                <option value="instapay">انستا باي (InstaPay)</option>
                <option value="telda">بطاقة تيلدا (Telda)</option>
                <option value="vodafone_cash">محفظة إلكترونية (فودافون كاش أو غيرها)</option>
                <option value="bank_transfer">تحويل بنكي مباشر</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                المبلغ المراد سحبه (بالجنيه المصري)
              </label>
              <input
                type="number"
                min="100"
                step="0.01"
                required
                placeholder="مثال: 100 كحد أدنى"
                className="input-fields"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                }}
              >
                {withdrawMethod === "instapay" && "عنوان انستا باي المستلم (IPA)"}
                {withdrawMethod === "telda" && "التاج الخاص بك على تيلدا (Telda Tag)"}
                {withdrawMethod === "vodafone_cash" && "رقم محفظة المحمول المراد التحويل إليها"}
                {withdrawMethod === "bank_transfer" && "رقم الحساب البنكي (IBAN)"}
              </label>
              <input
                type="text"
                required
                placeholder={
                  withdrawMethod === "instapay"
                    ? "مثال: name@instapay"
                    : withdrawMethod === "telda"
                    ? "مثال: @username"
                    : withdrawMethod === "vodafone_cash"
                    ? "مثال: 010xxxxxxxx"
                    : "أدخل رقم الحساب أو الآيبان كامل"
                }
                className="input-fields"
                value={withdrawRecipient}
                onChange={(e) => setWithdrawRecipient(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              />
            </div>

            {withdrawMethod !== "vodafone_cash" && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  اسم المستلم بالكامل (ثلاثي على الأقل)
                </label>
                <input
                  type="text"
                  required={withdrawMethod !== "vodafone_cash"}
                  placeholder="أدخل اسم صاحب الحساب"
                  className="input-fields"
                  value={withdrawName}
                  onChange={(e) => setWithdrawName(e.target.value)}
                  style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                />
              </div>
            )}

            {withdrawStatus && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  background:
                    withdrawStatus.type === "success"
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(239, 68, 68, 0.12)",
                  color: withdrawStatus.type === "success" ? "#10b981" : "#f87171",
                  border:
                    withdrawStatus.type === "success"
                      ? "1px solid rgba(16, 185, 129, 0.2)"
                      : "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {withdrawStatus.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingWithdraw || pendingTransactionsCount >= 2}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: "0.9rem",
                ...(pendingTransactionsCount >= 2
                  ? {
                      opacity: 0.35,
                      cursor: "not-allowed",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-muted, #8e8e93)",
                      borderColor: "var(--border-glass, rgba(255, 255, 255, 0.1))",
                    }
                  : {
                      background: "var(--color-primary)",
                      borderColor: "var(--color-primary)",
                    }),
              }}
            >
              {isSubmittingWithdraw ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" style={{ marginLeft: "8px" }}></i>
                  جاري إرسال طلب السحب...
                </>
              ) : (
                "تأكيد وإرسال طلب السحب"
              )}
            </button>
          </form>
        )}

        {/* TAB 4: TRANSACTION HISTORY */}
        {walletTab === "history" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "20px",
              maxHeight: "50vh",
              overflowY: "auto",
              paddingLeft: "4px",
            }}
          >
            {loadingTransactions ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <i
                  className="bx bx-loader-alt bx-spin"
                  style={{ fontSize: "1.8rem", color: "var(--color-primary)" }}
                ></i>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "8px" }}>
                  جاري تحميل كشف الحساب...
                </p>
              </div>
            ) : userTransactions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  border: "1px dashed var(--border-glass)",
                  borderRadius: "12px",
                }}
              >
                <i
                  className="bx bx-receipt"
                  style={{ fontSize: "2.4rem", color: "var(--text-muted)", marginBottom: "8px" }}
                ></i>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0 }}>
                  لا توجد معاملات سابقة حالياً.
                </p>
              </div>
            ) : (
              userTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            tx.type === "deposit"
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(239, 68, 68, 0.12)",
                          color: tx.type === "deposit" ? "#10b981" : "#f87171",
                        }}
                      >
                        <i
                          className={
                            tx.type === "deposit" ? "bx bx-plus-circle" : "bx bx-minus-circle"
                          }
                          style={{ fontSize: "1.1rem" }}
                        ></i>
                      </span>
                      <div>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: "bold",
                            color: "var(--text-primary)",
                          }}
                        >
                          {tx.type === "deposit" ? "إيداع رصيد" : "سحب رصيد"}
                        </span>
                        <span
                          style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}
                        >
                          {new Date(tx.created_at).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "left" }}>
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "900",
                          color: tx.type === "deposit" ? "#10b981" : "#f87171",
                        }}
                      >
                        {tx.type === "deposit" ? "+" : "-"} {formatNumber(tx.amount, 2)} ج.م
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.68rem",
                          fontWeight: "bold",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          textAlign: "center",
                          marginTop: "4px",
                          background:
                            tx.status === "approved"
                              ? "rgba(16, 185, 129, 0.1)"
                              : tx.status === "rejected"
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(251, 191, 36, 0.1)",
                          color:
                            tx.status === "approved"
                              ? "#10b981"
                              : tx.status === "rejected"
                              ? "#f87171"
                              : "#fbbf24",
                        }}
                      >
                        {tx.status === "pending" && "معلقة"}
                        {tx.status === "approved" && "مقبولة"}
                        {tx.status === "rejected" && "مرفوضة"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.03)",
                      paddingTop: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>
                      وسيلة الدفع:{" "}
                      <strong>
                        {tx.method === "instapay" && "انستا باي"}
                        {tx.method === "vodafone_cash" && "محفظة كاش"}
                        {tx.method === "bank_transfer" && "تحويل بنكي"}
                      </strong>
                    </span>
                    {tx.provider_number && (
                      <span>
                        الحساب/الرقم: <strong>{tx.provider_number}</strong>
                      </span>
                    )}
                    {tx.transaction_id && (
                      <span>
                        رقم العملية: <strong>{tx.transaction_id}</strong>
                      </span>
                    )}
                  </div>

                  {tx.admin_notes &&
                    (tx.status === "rejected" ? (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.05)",
                          border: "1px solid rgba(239, 68, 68, 0.1)",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          fontSize: "0.72rem",
                          color: "#f87171",
                        }}
                      >
                        <strong>تم رفض طلبك لأن</strong> {tx.admin_notes}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "rgba(59, 130, 246, 0.05)",
                          border: "1px solid rgba(59, 130, 246, 0.1)",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          fontSize: "0.72rem",
                          color: "#60a5fa",
                        }}
                      >
                        <strong>تم استخدام الرصيد في</strong> {tx.admin_notes}
                      </div>
                    ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Explanation Sections */}
        {walletTab === "main" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              borderTop: "1px solid var(--border-glass)",
              paddingTop: "20px",
            }}
          >
            <div>
              <h4
                className="sub-title"
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.92rem",
                  fontWeight: "800",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bx bx-info-circle" style={{ fontSize: "1.1rem" }}></i>
                ما هو رصيد المحفظة؟
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                هو رصيد مالي حقيقي بالجنيه المصري (EGP) يتم شحنه في حسابك، أو تحويل النقاط المكتسبة
                إليه. يمكنك استخدامه في شراء المنتجات المميزة، دفع اشتراكات الدليل، أو سحبه نقداً.
              </p>
            </div>

            <div>
              <h4
                className="sub-title"
                style={{
                  margin: "0 0 12px",
                  fontSize: "0.92rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bx bx-credit-card-front" style={{ fontSize: "1.1rem" }}></i>
                طرق الشحن والسحب المدعومة
              </h4>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                }}
              >
                يمكنك استخدام الطرق التالية للشحن أو سحب مستحقاتك وأرصدتك المالية:
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.02)",
                  padding: "12px",
                  borderRadius: "16px",
                  border: "1px solid var(--border-glass)",
                }}
              >
                {SUPPORTED_PAYMENT_PROVIDERS.map((pay) => (
                  <div
                    key={pay.name}
                    title={pay.title}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Image
                      src={pay.icon}
                      alt={pay.title}
                      width={20}
                      height={20}
                      style={{ objectFit: "contain", borderRadius: "4px" }}
                    />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-primary)",
                        fontWeight: "500",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {pay.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
