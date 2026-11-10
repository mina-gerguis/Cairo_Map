"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Gift, Plus, Search, Ticket, X } from "lucide-react";
import styles from "./vouchers.module.css";

type VoucherType = "رصيد أساسي" | "رصيد ترويجي" | "ميزة";

interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: string;
  status: "نشط" | "مسودة" | "منتهي";
  usage: string;
  expires: string;
}

const initialVouchers: Voucher[] = [
  { id: "1", code: "CAIRO-2026", type: "رصيد ترويجي", value: "100 ج.م", status: "نشط", usage: "18 / 100", expires: "31 ديسمبر 2026" },
  { id: "2", code: "WELCOME-MAP", type: "ميزة", value: "خرائط متقدمة", status: "نشط", usage: "64 / 500", expires: "بدون انتهاء" },
  { id: "3", code: "RAMADAN-25", type: "رصيد أساسي", value: "25 ج.م", status: "مسودة", usage: "0 / 250", expires: "20 أبريل 2027" },
  { id: "4", code: "SPRING-OLD", type: "رصيد ترويجي", value: "50 ج.م", status: "منتهي", usage: "250 / 250", expires: "01 مايو 2026" },
];

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [query, setQuery] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<VoucherType>("رصيد ترويجي");

  const filteredVouchers = useMemo(
    () => vouchers.filter((voucher) => voucher.code.includes(query.toUpperCase()) || voucher.type.includes(query)),
    [query, vouchers]
  );

  const createVoucher = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCode.trim()) return;
    setVouchers((current) => [
      {
        id: Date.now().toString(),
        code: newCode.toUpperCase(),
        type: newType,
        value: newType === "ميزة" ? "يُحدد لاحقًا" : "100 ج.م",
        status: "مسودة",
        usage: "0 / 100",
        expires: "بدون انتهاء",
      },
      ...current,
    ]);
    setNewCode("");
    setSaved(true);
  };

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <h1>إدارة القسائم والأكواد</h1>
          <p>أنشئ مكافآت قابلة للتوسع، وراجع نوع كل كود وحالته قبل تفعيله.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setShowCreator((current) => !current)}>
          <Plus size={18} />
          إنشاء كود جديد
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statBlock}><span>إجمالي الأكواد</span><strong>{vouchers.length}</strong><small>قابلة للإدارة من شاشة واحدة</small></div>
        <div className={styles.statBlock}><span>الأكواد النشطة</span><strong>{vouchers.filter((item) => item.status === "نشط").length}</strong><small className={styles.good}>جاهزة للاسترداد</small></div>
        <div className={styles.statBlock}><span>عمليات الاسترداد</span><strong>332</strong><small>منذ بداية الشهر</small></div>
        <div className={`${styles.statBlock} ${styles.signalBlock}`}><span>الرصيد الترويجي الموزع</span><strong>12,450 ج.م</strong><small>للاستخدام داخل الموقع فقط</small></div>
      </div>

      {showCreator && (
        <form className={styles.creatorPanel} onSubmit={createVoucher}>
          <div className={styles.creatorHeading}>
            <div><h2>تعريف كود جديد</h2><p>هذه واجهة إعداد أولية، وسيتم ربطها بالبيانات في المرحلة الثانية.</p></div>
            <button type="button" className={styles.iconButton} onClick={() => setShowCreator(false)} aria-label="إغلاق"><X size={18} /></button>
          </div>
          <div className={styles.creatorFields}>
            <label>اسم الكود<input value={newCode} onChange={(event) => setNewCode(event.target.value)} placeholder="مثال: SUMMER-100" /></label>
            <label>نوع المكافأة<select value={newType} onChange={(event) => setNewType(event.target.value as VoucherType)}><option>رصيد ترويجي</option><option>رصيد أساسي</option><option>ميزة</option></select></label>
            <label>الحد الأقصى للاستخدام<input defaultValue="100" type="number" min="1" /></label>
          </div>
          <div className={styles.creatorFooter}>
            <span>يمكن إضافة تاريخ انتهاء، نطاق مستخدمين، وصلاحيات وصول لاحقًا.</span>
            <button className={styles.primaryButton} type="submit"><Check size={17} />حفظ كمسودة</button>
          </div>
          {saved && <div className={styles.savedNotice}>تمت إضافة الكود كمسودة للعرض.</div>}
        </form>
      )}

      <section className={styles.tablePanel}>
        <div className={styles.toolbar}>
          <div><h2>الأكواد الحالية</h2><p>تتبع الحالة والاستخدام ونوع المكافأة بسرعة.</p></div>
          <div className={styles.toolbarTools}>
            <div className={styles.searchBox}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن كود أو نوع" /></div>
            <button className={styles.filterButton}>كل الحالات <ChevronDown size={15} /></button>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>الكود</th><th>نوع المكافأة</th><th>القيمة</th><th>الاستخدام</th><th>الانتهاء</th><th>الحالة</th><th /></tr></thead>
            <tbody>{filteredVouchers.map((voucher) => (
              <tr key={voucher.id}>
                <td><div className={styles.codeCell}><span className={styles.ticketIcon}><Ticket size={16} /></span><strong>{voucher.code}</strong></div></td>
                <td>{voucher.type}</td><td>{voucher.value}</td><td>{voucher.usage}</td><td>{voucher.expires}</td>
                <td><span className={`${styles.status} ${voucher.status === "نشط" ? styles.active : voucher.status === "مسودة" ? styles.draft : styles.expired}`}>{voucher.status}</span></td>
                <td><button className={styles.rowAction}>إدارة</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
