"use client";

import React, { useState } from "react";
import { Gift, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../types";
import styles from "../page.module.css";

interface ProfileVoucherCardProps {
  profile: UserProfile | null;
  isOwnProfile: boolean;
}

export const ProfileVoucherCard: React.FC<ProfileVoucherCardProps> = ({
  profile,
  isOwnProfile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOwnProfile) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className={styles.voucherCard} aria-labelledby="voucher-title">
      <button
        type="button"
        className={styles.voucherHeader}
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
      >
        <span className={styles.voucherIcon} aria-hidden="true">
          <Gift size={21} />
        </span>
        <span className={styles.voucherHeaderCopy}>
          <strong id="voucher-title">استرداد القسائم</strong>
          <small>أدخل كودًا لفتح رصيد أو ميزة داخل الموقع</small>
        </span>
        <ArrowLeft
          size={18}
          className={`${styles.voucherChevron} ${isExpanded ? styles.voucherChevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <div className={styles.voucherBody}>
          <div className={styles.voucherBalancePreview}>
            <div>
              <span>الرصيد الترويجي الحالي</span>
              <strong>{(profile?.promo_balance ?? 0).toLocaleString("ar-EG")} ج.م</strong>
            </div>
            <span className={styles.voucherExpiry}>يُستخدم داخل الموقع فقط</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.voucherForm}>
            <label htmlFor="voucher-code">كود القسيمة</label>
            <div className={styles.voucherInputRow}>
              <div className={styles.voucherInputWrap}>
                <KeyRound size={17} aria-hidden="true" />
                <input
                  id="voucher-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase());
                    setSubmitted(false);
                  }}
                  placeholder="مثال: CAIRO-2026"
                  autoComplete="off"
                />
              </div>
              <button type="submit" className={styles.voucherSubmit} disabled={!code.trim()}>
                استرداد
              </button>
            </div>
            <p className={styles.voucherHint}>
              كل كود يُستخدم مرة واحدة، وتظهر تفاصيل المكافأة قبل تأكيد العملية.
            </p>
            {submitted && (
              <div className={styles.voucherNotice} role="status">
                <CheckCircle2 size={17} aria-hidden="true" />
                تم استلام الكود للمعاينة. سيتم ربط التحقق الفعلي في المرحلة التالية.
              </div>
            )}
          </form>
        </div>
      )}
    </section>
  );
};
