"use client";

import React, { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import { UserProfile, BalanceTransaction, ProfileAlertMessage } from "../../types";
import { formatNumber } from "../../utils";
import styles from "../../page.module.css";
import { ChevronRight } from "lucide-react";

interface ProfileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPointsModal?: () => void;
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
  onOpenPointsModal,
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
  const [copied, setCopied] = useState(false);

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
          background: "var(--color-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid var(--border-glass)",
          animation: "slide-up 0.3s ease",
          maxHeight: "80vh",
          overflowY: "auto",
          direction: "rtl",
          textAlign: "right",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {walletTab !== "main" ? (
            <button
              onClick={() => setWalletTab("main")}
              className="btn-close border-none"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={onClose} className="btn-close border-none">
              <ChevronRight size={18} />
            </button>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: "700",
              color: "var(--color-foreground)",
              fontFamily: "var(--font-sub)",
            }}
          >
            {walletTab === "main" && "رصيد قريب"}
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
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2.4rem",
                  fontWeight: "700",
                  color: "var(--color-foreground)",
                  margin: "4px 0",
                }}
              >
                {formatNumber(profile?.balance ?? 0, 2)} ج.م
              </span>
            </div>

            {/* Points Overview Card */}
            <div
              onClick={() => {
                if (onOpenPointsModal) {
                  onOpenPointsModal();
                }
              }}
              className={clsx("glass-panel", styles.walletSubCard)}
              style={{
                width: "100%",
                background: "var(--color-foreground)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "10px 18px",
                cursor: onOpenPointsModal ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                textAlign: "right",
              }}
              title={onOpenPointsModal ? "اضغط لعرض تفاصيل وتحويل النقاط" : "رصيد النقاط"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="bx bxs-coin" style={{ color: "var(--color-bg)", fontSize: "1.4rem" }}></i>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-bg)" }}>
                    {formatNumber(profile?.points ?? 0)}{" "}
                    <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>نقطة</span>
                  </div>
                </div>
              </div>

              {onOpenPointsModal && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-bg)", fontWeight: "600" }}>
                    تحويل النقاط
                  </span>
                  <i className="bx bx-chevron-left" style={{ color: "var(--color-bg)", fontSize: "1.2rem" }}></i>
                </div>
              )}
            </div>

            {/* Actions Buttons */}
            <div style={{ display: "flex", gap: "12px", width: "100%", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => setWalletTab("deposit")}
                className={clsx("btn", "btn-primary", styles.actionsButton)}
              >
                <PiHandWithdrawBold style={{ fontSize: "1.1rem" }} />
                إيداع
              </button>
              <button
                type="button"
                onClick={() => setWalletTab("withdraw")}
                className={clsx("btn", "btn-secondary", styles.actionsButton)}

              >
                <PiHandDepositBold style={{ fontSize: "1.1rem" }} />
                سحب
              </button>
            </div>

            {/* Transactions History Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderTop: "1px solid var(--border-glass)",
                paddingTop: "18px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <h4
                  className="sub-title"
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    color: "var(--color-foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="bx bx-history" style={{ fontSize: "1.15rem", color: "var(--color-primary)" }}></i>
                  سجل المعاملات
                </h4>
                {userTransactions.length > 0 && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    ({userTransactions.length} معاملة)
                  </span>
                )}
              </div>

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
                    padding: "30px 0",
                    border: "1px dashed var(--border-glass)",
                    borderRadius: "12px",
                  }}
                >
                  <i
                    className="bx bx-receipt"
                    style={{ fontSize: "2rem", color: "var(--text-muted)", marginBottom: "6px" }}
                  ></i>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0 }}>
                    لا توجد معاملات سابقة حالياً.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    maxHeight: "360px",
                    overflowY: "auto",
                    paddingLeft: "4px",
                  }}
                >
                  {userTransactions.map((tx) => (
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
                                color: "var(--color-foreground)",
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
                      </div>

                      {tx.admin_notes &&
                        (tx.status === "rejected" ? (
                          <div
                            style={{
                              padding: "8px",
                              fontSize: "0.72rem",
                              color: "var(--color-error)",
                            }}
                          >
                            <strong> تم رفض  طلب السحب بسبب وجود مشكلة في </strong> {tx.admin_notes}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              fontSize: "0.72rem",
                              color: "var(--color-primary)",
                            }}
                          >
                            <strong>تم استخدام الرصيد في</strong> {tx.admin_notes}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
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
                  fontSize: "0.85rem",
                  color: "var(--color-error)",
                  lineHeight: "1.6",
                  textAlign: "right",
                }}
              >
                لديك حالياً{" "}
                <strong>{pendingTransactionsCount}</strong> طلبات معلقة قيد المراجعة. لا يمكنك تقديم
                طلب إيداع جديد حتى تقوم الإدارة بمراجعة طلباتك الحالية.
              </div>
            )}

            {depositStatus && (
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: depositStatus.type === "success" ? "var(--color-success)" : "var(--color-error)",
                }}
              >
                {depositStatus.text}
              </div>
            )}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "var(--color-foreground)",
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
              {/* InstaPay instructions */}
              {depositMethod === "instapay" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بالتحويل عبر تطبيق انستا باي إلى الحساب التالي: <br />
                  العنوان: <strong style={{ color: "var(--color-foreground)" }}>mina0gerguis@instapay</strong>
                  <br />
                  الاسم: <strong style={{ color: "var(--color-foreground)" }}>Mina G***** A</strong>
                  <br />
                  الرابط السريع :{" "}
                  <a
                    href="https://ipn.eg/S/mina0gerguis/instapay/6inTOU"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <strong style={{ color: "var(--color-secondary)" }}>
                      https://ipn.eg/S/mina0gerguis
                    </strong>
                  </a>
                </p>
              )}
              {/* Telda instructions */}
              {depositMethod === "telda" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بالتحويل عبر تطبيق تيلدا إلى التاج (Tag) التالي:
                  <br />
                  التاج:
                  <button
                    type="button"
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText("@minagerguis");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="نسخ التاج"
                  >
                    <strong style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
                      <span>{copied ? "تم النسخ" : "@minagerguis"}</span>
                    </strong>{" "}
                  </button>
                  <br />
                  الاسم: <strong style={{ color: "var(--color-foreground)" }}>Mina Gerguis</strong>
                </p>
              )}
              {/* Vodafone Cash instructions */}
              {depositMethod === "vodafone_cash" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بتحويل رصيد كاش إلى رقم المحفظة التالي:
                  <br />
                  الرقم:
                  <button
                    type="button"
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText("01020372317");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="نسخ الرقم"
                  >
                    <strong style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
                      <span style={{ color: "var(--color-primary)" }}>{copied ? "تم النسخ" : "01020372317"}</span> </strong>
                  </button>
                  <br />
                  الاسم: <strong style={{ color: "var(--color-foreground)" }}>Mina Gerges</strong>
                </p>
              )}
              {/* Bank Transfer instructions */}
              {depositMethod === "bank_transfer" && (
                <p style={{ margin: 0, lineHeight: "1.6", color: "var(--text-secondary)" }}>
                  قم بالتحويل البنكي المباشر للحساب التالي:
                  <br />
                  البنك:{" "}
                  <strong style={{ color: "var(--color-foreground)" }}>
                    بنك قطر الوطني الأهلي (QNB)
                  </strong>
                  <br />
                  رقم الحساب:
                  <button
                    type="button"
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText("1020670700235");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="نسخ رقم الحساب"
                  >
                    <strong style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
                      <span style={{ color: "var(--color-primary)" }}>{copied ? "تم النسخ" : "1020670700235"}</span>
                    </strong>
                  </button>
                  <br />
                  الاسم: <strong style={{ color: "var(--color-foreground)" }}>Mina Gerges</strong>
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
                  color: "var(--color-foreground)",
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
                  color: "var(--color-foreground)",
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
                  color: "var(--color-foreground)",
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
                <strong>ملاحظات هامة:</strong>
                <br />• يتم مراجعة طلبات الشحن يدوياً وسيتم شحن رصيدك في أقرب وقت ممكن.
                <br />• تستغرق عملية الشحن من 5 دقائق إلى 24 ساعة.
                <br />• في حالة وجود أي خطأ، يرجى التواصل مع الدعم
              </p>
            </div>

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
                  تأكيد الأيداع
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
                  fontSize: "0.85rem",
                  color: "var(--color-error)",
                  lineHeight: "1.6",
                  textAlign: "right",
                }}
              >
                لديك حالياً{" "}
                <strong>{pendingTransactionsCount}</strong> طلبات معلقة قيد المراجعة. لا يمكنك تقديم
                طلب سحب جديد حتى تقوم الإدارة بمراجعة طلباتك الحالية.
              </div>
            )}

            {withdrawStatus && (
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: withdrawStatus.type === "success" ? "var(--color-success)" : "var(--color-error)",
                }}
              >
                {withdrawStatus.text}
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
              <h4 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "var(--color-foreground)" }}>
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
                  color: "var(--color-foreground)",
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
                  color: "var(--color-foreground)",
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
                  color: "var(--color-foreground)",
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
                    color: "var(--color-foreground)",
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
                    cursor: "not-allowed !important",
                    background: "rgba(0, 0, 0, 0.77)",
                    color: "#fff",
                    borderColor: "var(--border-glass, rgba(255, 255, 255, 0.1))",
                  }
                  : undefined),
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
      </div>
    </div>
  );
};
