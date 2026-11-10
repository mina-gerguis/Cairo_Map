"use client";

import React, { useEffect, useMemo, useState } from "react";
import adminStyles from "../admin.module.css";
import vStyles from "./vouchers.module.css";
import {
  PromoExpiryMode,
  VOUCHER_REWARD_META,
  VOUCHER_STATUS_META,
  VoucherAudience,
  VoucherItem,
  VoucherRedemptionLog,
  VoucherRewardType,
  VoucherStatus,
} from "@/types/vouchers";
import {
  VOUCHER_FEATURE_OPTIONS,
  VOUCHER_PAGE_OPTIONS,
  createAdminVouchers,
  deleteAdminVoucher,
  fetchAdminVouchers,
  formatRewardSummary,
  updateAdminVoucher,
} from "@/lib/vouchers";

interface VoucherFormState {
  mode: "single" | "batch";
  code: string;
  batchPrefix: string;
  batchCount: number;
  batchName: string;
  title: string;
  description: string;
  rewardType: VoucherRewardType;
  amount: string;
  promoExpiryMode: PromoExpiryMode;
  promoExpiryDays: number;
  promoExpiryDate: string;
  featureKey: string;
  targetPage: string;
  accessDurationUnit: "hours" | "days";
  accessDurationValue: number;
  unlimitedUses: boolean;
  maxUses: number;
  maxUsesPerUser: number;
  startsAt: string;
  expiresAt: string;
  audience: VoucherAudience;
  isActive: boolean;
}

const DEFAULT_FORM: VoucherFormState = {
  mode: "single",
  code: "",
  batchPrefix: "QRB-",
  batchCount: 5,
  batchName: "",
  title: "",
  description: "",
  rewardType: "promo_balance",
  amount: "50",
  promoExpiryMode: "days_after_redeem",
  promoExpiryDays: 30,
  promoExpiryDate: "",
  featureKey: VOUCHER_FEATURE_OPTIONS[0].key,
  targetPage: VOUCHER_PAGE_OPTIONS[0].value,
  accessDurationUnit: "days",
  accessDurationValue: 7,
  unlimitedUses: false,
  maxUses: 100,
  maxUsesPerUser: 1,
  startsAt: "",
  expiresAt: "",
  audience: "all",
  isActive: true,
};

function generateRandomCode(prefix = "QRB-") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part = "";
  for (let i = 0; i < 6; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}${part}`;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [redemptionLogs, setRedemptionLogs] = useState<VoucherRedemptionLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | VoucherRewardType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | VoucherStatus>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create/Edit Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);
  const [form, setForm] = useState<VoucherFormState>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Logs Modal
  const [logsModalVoucher, setLogsModalVoucher] = useState<VoucherItem | null | "all">(null);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const res = await fetchAdminVouchers();
      setVouchers(res.vouchers);
      setRedemptionLogs(res.redemptions);
      setSchemaReady(res.schemaReady);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = useMemo(() => {
    const total = vouchers.length;
    const active = vouchers.filter((v) => v.status === "active").length;
    const totalRedemptions = vouchers.reduce((acc, v) => acc + v.usageCount, 0);
    const promoValueGranted = vouchers
      .filter((v) => v.rewardType === "promo_balance")
      .reduce((acc, v) => acc + (v.rewardConfig.amount ?? 0) * v.usageCount, 0);
    return { total, active, totalRedemptions, promoValueGranted };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vouchers.filter((v) => {
      if (typeFilter !== "all" && v.rewardType !== typeFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (!q) return true;
      return (
        v.code.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        (v.batchName || "").toLowerCase().includes(q)
      );
    });
  }, [vouchers, searchQuery, typeFilter, statusFilter]);

  const handleCopyCode = async (item: VoucherItem) => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  const openCreateModal = () => {
    setEditingVoucher(null);
    setForm({
      ...DEFAULT_FORM,
      code: generateRandomCode("QRB-"),
    });
    setFormError(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (item: VoucherItem) => {
    setEditingVoucher(item);
    setForm({
      mode: "single",
      code: item.code,
      batchPrefix: "QRB-",
      batchCount: 1,
      batchName: item.batchName || "",
      title: item.title,
      description: item.description || "",
      rewardType: item.rewardType,
      amount: String(item.rewardConfig.amount ?? 50),
      promoExpiryMode: item.rewardConfig.promoExpiryMode || "days_after_redeem",
      promoExpiryDays: item.rewardConfig.promoExpiryDays ?? 30,
      promoExpiryDate: item.rewardConfig.promoExpiryDate || "",
      featureKey: item.rewardConfig.featureKey || VOUCHER_FEATURE_OPTIONS[0].key,
      targetPage: item.rewardConfig.targetPage || VOUCHER_PAGE_OPTIONS[0].value,
      accessDurationUnit: item.rewardConfig.accessDurationUnit || "days",
      accessDurationValue: item.rewardConfig.accessDurationValue ?? 7,
      unlimitedUses: item.maxUses === null,
      maxUses: item.maxUses ?? 100,
      maxUsesPerUser: item.maxUsesPerUser,
      startsAt: item.startsAt ? item.startsAt.slice(0, 10) : "",
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
      audience: item.audience,
      isActive: item.status === "active",
    });
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleToggleStatus = async (item: VoucherItem) => {
    if (item.status !== "active" && item.status !== "paused") return;
    const nextStatus: VoucherStatus = item.status === "active" ? "paused" : "active";
    const res = await updateAdminVoucher(item.id, { status: nextStatus });
    if (res.success && res.item) {
      setVouchers((prev) => prev.map((v) => (v.id === item.id ? res.item! : v)));
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه القسيمة نهائياً؟")) return;
    const res = await deleteAdminVoucher(id);
    if (res.success) {
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError("يرجى إدخال عنوان واضح للقسيمة.");
      return;
    }

    if (
      (form.rewardType === "main_balance" || form.rewardType === "promo_balance") &&
      (isNaN(Number(form.amount)) || Number(form.amount) <= 0)
    ) {
      setFormError("يرجى إدخال مبلغ صحيح أكبر من الصفر.");
      return;
    }

    const featureOpt = VOUCHER_FEATURE_OPTIONS.find((f) => f.key === form.featureKey);
    const pageOpt = VOUCHER_PAGE_OPTIONS.find((p) => p.value === form.targetPage);

    const rewardConfig: VoucherItem["rewardConfig"] = {};
    if (form.rewardType === "main_balance") {
      rewardConfig.amount = Number(form.amount);
    } else if (form.rewardType === "promo_balance") {
      rewardConfig.amount = Number(form.amount);
      rewardConfig.promoExpiryMode = form.promoExpiryMode;
      if (form.promoExpiryMode === "days_after_redeem") {
        rewardConfig.promoExpiryDays = Math.max(1, form.promoExpiryDays);
      } else if (form.promoExpiryMode === "fixed_date") {
        rewardConfig.promoExpiryDate = form.promoExpiryDate || undefined;
      }
    } else if (form.rewardType === "feature_unlock") {
      rewardConfig.featureKey = form.featureKey;
      rewardConfig.featureLabel = featureOpt?.label || form.featureKey;
    } else if (form.rewardType === "page_access") {
      rewardConfig.targetPage = form.targetPage;
      rewardConfig.targetPageLabel = pageOpt?.label || form.targetPage;
      rewardConfig.accessDurationUnit = form.accessDurationUnit;
      rewardConfig.accessDurationValue = Math.max(1, form.accessDurationValue);
    }

    const baseStatus: VoucherStatus = form.isActive ? "active" : "paused";

    setSaving(true);
    try {
      if (editingVoucher) {
        const normalizedCode = form.code.trim().toUpperCase();
        if (!normalizedCode || normalizedCode.length < 4) {
          setFormError("يجب أن يتكون الكود من 4 أحرف أو أرقام على الأقل.");
          return;
        }
        const res = await updateAdminVoucher(editingVoucher.id, {
          code: normalizedCode,
          title: form.title.trim(),
          description: form.description.trim(),
          rewardType: form.rewardType,
          rewardConfig,
          status: baseStatus,
          maxUses: form.unlimitedUses ? null : Math.max(1, form.maxUses),
          maxUsesPerUser: Math.max(1, form.maxUsesPerUser),
          startsAt: form.startsAt ? `${form.startsAt}T00:00:00Z` : null,
          expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59Z` : null,
          audience: form.audience,
          batchName: form.batchName.trim() || null,
        });
        if (!res.success || !res.item) {
          setFormError(res.message || "تعذر حفظ التعديلات.");
          return;
        }
        setVouchers((prev) => prev.map((v) => (v.id === editingVoucher.id ? res.item! : v)));
        setIsEditorOpen(false);
        return;
      }

      if (form.mode === "batch") {
        const count = Math.min(25, Math.max(2, form.batchCount));
        const payloads = Array.from({ length: count }).map(() => ({
          code: generateRandomCode(form.batchPrefix || "QRB-"),
          title: form.title.trim(),
          description: form.description.trim(),
          rewardType: form.rewardType,
          rewardConfig,
          status: baseStatus,
          maxUses: form.unlimitedUses ? null : Math.max(1, form.maxUses),
          maxUsesPerUser: Math.max(1, form.maxUsesPerUser),
          startsAt: form.startsAt ? `${form.startsAt}T00:00:00Z` : null,
          expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59Z` : null,
          audience: form.audience,
          batchName: form.batchName.trim() || `دفعة ${new Date().toLocaleDateString("ar-EG")}`,
        }));
        const res = await createAdminVouchers(payloads);
        if (!res.success) {
          setFormError(res.message || "تعذر إصدار الدفعة.");
          return;
        }
        setVouchers((prev) => [...res.items, ...prev]);
      } else {
        const normalizedCode = (form.code || generateRandomCode()).trim().toUpperCase();
        if (normalizedCode.length < 4) {
          setFormError("يجب أن يتكون الكود من 4 أحرف أو أرقام على الأقل.");
          return;
        }
        const res = await createAdminVouchers([
          {
            code: normalizedCode,
            title: form.title.trim(),
            description: form.description.trim(),
            rewardType: form.rewardType,
            rewardConfig,
            status: baseStatus,
            maxUses: form.unlimitedUses ? null : Math.max(1, form.maxUses),
            maxUsesPerUser: Math.max(1, form.maxUsesPerUser),
            startsAt: form.startsAt ? `${form.startsAt}T00:00:00Z` : null,
            expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59Z` : null,
            audience: form.audience,
            batchName: form.batchName.trim() || null,
          },
        ]);
        if (!res.success) {
          setFormError(res.message || "تعذر إصدار القسيمة.");
          return;
        }
        setVouchers((prev) => [...res.items, ...prev]);
      }

      setIsEditorOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const visibleLogs = useMemo(() => {
    if (!logsModalVoucher || logsModalVoucher === "all") return redemptionLogs;
    return redemptionLogs.filter((l) => l.voucherId === logsModalVoucher.id);
  }, [logsModalVoucher, redemptionLogs]);

  return (
    <div className={vStyles.pageWrapper}>
      {/* Header */}
      <div className={vStyles.headerRow}>
        <div className={vStyles.headerText}>
          <h1>إدارة القسائم والأكواد الترويجية</h1>
          <p>
            إنشاء وإدارة أكواد الشحن، الرصيد الترويجي، وفتح المميزات والأقسام المؤقتة
          </p>
        </div>

        <div className={vStyles.headerActions}>
          <button
            type="button"
            className={vStyles.secondaryBtn}
            onClick={loadData}
            disabled={loadingData}
          >
            <i className={`bx bx-refresh ${loadingData ? "bx-spin" : ""}`} style={{ fontSize: "1.1rem" }} />
            <span>تحديث</span>
          </button>
          <button
            type="button"
            className={vStyles.secondaryBtn}
            onClick={() => setLogsModalVoucher("all")}
          >
            <i className="bx bx-history" style={{ fontSize: "1.1rem" }} />
            <span>سجل الاستردادات ({redemptionLogs.length})</span>
          </button>
          <button
            type="button"
            className={vStyles.primaryBtn}
            onClick={openCreateModal}
          >
            <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem" }} />
            <span>إنشاء كود جديد</span>
          </button>
        </div>
      </div>

      {!schemaReady && !loadingData && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            background: "rgba(245, 158, 11, 0.1)",
            color: "#fbbf24",
            fontSize: "0.84rem",
            fontWeight: 700,
          }}
        >
          جداول القسائم غير مفعّلة في قاعدة البيانات بعد. يرجى تشغيل ملف{" "}
          <code dir="ltr">supabase/supabase_promo_balance_schema.sql</code> ثم{" "}
          <code dir="ltr">supabase/supabase_vouchers_schema.sql</code> داخل Supabase SQL Editor.
        </div>
      )}

      {/* KPI Row */}
      <div className={vStyles.kpiGrid}>
        <div className={vStyles.kpiCard}>
          <div className={vStyles.kpiTop}>
            <span className={vStyles.kpiLabel}>إجمالي الأكواد المسجلة</span>
            <span
              className={vStyles.kpiIcon}
              style={{ background: "rgba(59, 130, 246, 0.14)", color: "#3b82f6" }}
            >
              <i className="bx bxs-coupon" />
            </span>
          </div>
          <div className={vStyles.kpiValue}>{kpis.total}</div>
          <span className={vStyles.kpiHint}>تشمل الأكواد الفردية والدفعات</span>
        </div>

        <div className={vStyles.kpiCard}>
          <div className={vStyles.kpiTop}>
            <span className={vStyles.kpiLabel}>الأكواد النشطة حالياً</span>
            <span
              className={vStyles.kpiIcon}
              style={{ background: "rgba(16, 185, 129, 0.14)", color: "#10b981" }}
            >
              <i className="bx bx-check-shield" />
            </span>
          </div>
          <div className={vStyles.kpiValue}>{kpis.active}</div>
          <span className={vStyles.kpiHint}>متاحة للاسترداد من صفحة الملف الشخصي</span>
        </div>

        <div className={vStyles.kpiCard}>
          <div className={vStyles.kpiTop}>
            <span className={vStyles.kpiLabel}>إجمالي عمليات الاسترداد</span>
            <span
              className={vStyles.kpiIcon}
              style={{ background: "rgba(245, 158, 11, 0.14)", color: "#f59e0b" }}
            >
              <i className="bx bx-transfer-alt" />
            </span>
          </div>
          <div className={vStyles.kpiValue}>{kpis.totalRedemptions.toLocaleString("ar-EG")}</div>
          <span className={vStyles.kpiHint}>عبر كل أنواع المكافآت</span>
        </div>

        <div className={vStyles.kpiCard}>
          <div className={vStyles.kpiTop}>
            <span className={vStyles.kpiLabel}>الرصيد الترويجي الممنوح</span>
            <span
              className={vStyles.kpiIcon}
              style={{ background: "rgba(99, 102, 241, 0.14)", color: "#818cf8" }}
            >
              <i className="bx bx-gift" />
            </span>
          </div>
          <div className={vStyles.kpiValue}>
            {kpis.promoValueGranted.toLocaleString("ar-EG")}{" "}
            <small style={{ fontSize: "0.85rem", fontWeight: 700 }}>ج.م</small>
          </div>
          <span className={vStyles.kpiHint}>رصيد تشجيعي للاستخدام داخل الموقع</span>
        </div>
      </div>

      {/* Filter Card */}
      <div className={vStyles.filterCard}>
        <div className={vStyles.filterTopRow}>
          <div className={vStyles.searchWrap}>
            <i className={`bx bx-search ${vStyles.searchIcon}`} />
            <input
              type="text"
              className={`${vStyles.inputControl} ${vStyles.searchInput}`}
              placeholder="ابحث بالكود أو اسم الحملة أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "170px" }}>
            <select
              className={vStyles.inputControl}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | VoucherStatus)}
              aria-label="تصفية حسب الحالة"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="paused">موقوف مؤقتاً</option>
              <option value="scheduled">مجدول</option>
              <option value="expired">منتهي الصلاحية</option>
              <option value="exhausted">مكتمل الاستخدام</option>
            </select>
          </div>
        </div>

        <div className={vStyles.filterChipsRow}>
          <button
            type="button"
            className={`${vStyles.filterChip} ${typeFilter === "all" ? vStyles.filterChipActive : ""}`}
            onClick={() => setTypeFilter("all")}
          >
            كل الأنواع ({vouchers.length})
          </button>
          {(Object.keys(VOUCHER_REWARD_META) as VoucherRewardType[]).map((t) => {
            const meta = VOUCHER_REWARD_META[t];
            const count = vouchers.filter((v) => v.rewardType === t).length;
            return (
              <button
                key={t}
                type="button"
                className={`${vStyles.filterChip} ${typeFilter === t ? vStyles.filterChipActive : ""}`}
                onClick={() => setTypeFilter(t)}
              >
                <i className={`bx ${meta.bxIcon}`} />
                <span>
                  {meta.shortLabel} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vouchers Table */}
      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableHeaderBar}>
          <div className={adminStyles.tableTitleGroup}>
            <div className={adminStyles.tableIcon}>
              <i className="bx bxs-coupon" />
            </div>
            <div>
              <h3 className={adminStyles.tableTitle}>قائمة الأكواد والقسائم</h3>
              <p className={adminStyles.tableSubtitle}>
                عرض {filteredVouchers.length} من إجمالي {vouchers.length} قسيمة
              </p>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#94a3b8" }}>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>جاري تحميل القسائم...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#94a3b8" }}>
            <i className="bx bxs-coupon" style={{ fontSize: "2.5rem", opacity: 0.45 }} />
            <p style={{ margin: "10px 0 0", fontSize: "0.9rem" }}>
              {vouchers.length === 0
                ? "لا توجد قسائم مضافة بعد. اضغط على «إنشاء كود جديد» للبدء."
                : "لا توجد قسائم مطابقة لمعايير البحث الحالية."}
            </p>
          </div>
        ) : (
          <div className={adminStyles.tableResponsive}>
            <table className={adminStyles.adminTable}>
              <thead>
                <tr>
                  <th className={adminStyles.adminTh}>الكود</th>
                  <th className={adminStyles.adminTh}>العنوان والدفعة</th>
                  <th className={adminStyles.adminTh}>نوع المكافأة والنتيجة</th>
                  <th className={adminStyles.adminTh}>الاستخدامات</th>
                  <th className={adminStyles.adminTh}>صلاحية الكود</th>
                  <th className={adminStyles.adminTh}>الحالة</th>
                  <th className={adminStyles.adminTh} style={{ textAlign: "center" }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((item) => {
                  const rewardMeta = VOUCHER_REWARD_META[item.rewardType];
                  const statusMeta = VOUCHER_STATUS_META[item.status];
                  const pct =
                    item.maxUses && item.maxUses > 0
                      ? Math.min(100, Math.round((item.usageCount / item.maxUses) * 100))
                      : 0;

                  return (
                    <tr key={item.id} className={adminStyles.adminTr}>
                      {/* Code */}
                      <td className={adminStyles.adminTd}>
                        <div className={vStyles.codeBadgeWrap}>
                          <code dir="ltr" className={vStyles.codeMono}>
                            {item.code}
                          </code>
                          <button
                            type="button"
                            className={vStyles.copyBtn}
                            onClick={() => handleCopyCode(item)}
                            title="نسخ الكود"
                          >
                            <i
                              className={`bx ${copiedId === item.id ? "bx-check" : "bx-copy"}`}
                              style={{
                                color: copiedId === item.id ? "#10b981" : undefined,
                                fontSize: "1rem",
                              }}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Title & Batch */}
                      <td className={adminStyles.adminTd}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{item.title}</div>
                        {item.batchName && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "3px",
                              fontSize: "0.72rem",
                              color: "#94a3b8",
                            }}
                          >
                            الحملة: {item.batchName}
                          </span>
                        )}
                      </td>

                      {/* Reward Type & Result */}
                      <td className={adminStyles.adminTd}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              background: rewardMeta.accentBg,
                              color: rewardMeta.accentColor,
                              border: `1px solid ${rewardMeta.accentBorder}`,
                            }}
                          >
                            <i className={`bx ${rewardMeta.bxIcon}`} />
                            {rewardMeta.shortLabel}
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                            {formatRewardSummary(item)}
                          </span>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className={adminStyles.adminTd}>
                        <div className={vStyles.usageCell}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700 }}>
                            <span>
                              {item.usageCount} / {item.maxUses ?? "∞"}
                            </span>
                            {item.maxUses && (
                              <span style={{ color: "#94a3b8" }}>{pct}%</span>
                            )}
                          </div>
                          {item.maxUses ? (
                            <div className={vStyles.usageTrack}>
                              <div
                                className={vStyles.usageFill}
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 90 ? "#ef4444" : rewardMeta.accentColor,
                                }}
                              />
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                              مفتوح الاستخدام
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Code Expiry */}
                      <td className={adminStyles.adminTd} style={{ fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>
                        {item.expiresAt
                          ? new Date(item.expiresAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "غير محدد المدة"}
                      </td>

                      {/* Status */}
                      <td className={adminStyles.adminTd}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            background: statusMeta.bg,
                            color: statusMeta.color,
                            border: `1px solid ${statusMeta.border}`,
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className={adminStyles.adminTd}>
                        <div className={adminStyles.actionGroup} style={{ justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => setLogsModalVoucher(item)}
                            className={`${adminStyles.actionBtn}`}
                            title="سجل استرداد هذا الكود"
                          >
                            <i className="bx bx-history" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className={`${adminStyles.actionBtn} ${adminStyles.actionBtnEdit}`}
                            title="تعديل خصائص الكود"
                          >
                            <i className="bx bx-edit-alt" />
                          </button>
                          {(item.status === "active" || item.status === "paused") && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className={adminStyles.actionBtn}
                              title={item.status === "active" ? "إيقاف الكود مؤقتاً" : "تفعيل الكود"}
                            >
                              <i
                                className={`bx ${item.status === "active" ? "bx-pause-circle" : "bx-play-circle"}`}
                              />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteVoucher(item.id)}
                            className={`${adminStyles.actionBtn} ${adminStyles.actionBtnDelete}`}
                            title="حذف القسيمة"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Voucher Modal */}
      {isEditorOpen && (
        <div
          className={vStyles.modalOverlay}
          data-modal-overlay="true"
          onClick={() => setIsEditorOpen(false)}
        >
          <div className={vStyles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={vStyles.modalHeader}>
              <h2>{editingVoucher ? "تعديل خصائص القسيمة" : "إنشاء قسيمة / أكواد جديدة"}</h2>
              <button
                type="button"
                className={vStyles.closeBtn}
                onClick={() => setIsEditorOpen(false)}
                aria-label="إغلاق"
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Single vs Batch Mode (Create only) */}
              {!editingVoucher && (
                <div>
                  <span className={vStyles.fieldLabel}>طريقة الإصدار</span>
                  <div className={vStyles.formGrid2}>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mode: "single" }))}
                      className={vStyles.rewardTypeCard}
                      style={{
                        borderColor: form.mode === "single" ? "#3b82f6" : undefined,
                        background: form.mode === "single" ? "rgba(59, 130, 246, 0.1)" : undefined,
                      }}
                    >
                      <strong style={{ fontSize: "0.86rem" }}>كود واحد (فردي أو متعدد الاستخدام)</strong>
                      <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                        مثالي للحملات العامة أو كود مخصص
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mode: "batch" }))}
                      className={vStyles.rewardTypeCard}
                      style={{
                        borderColor: form.mode === "batch" ? "#3b82f6" : undefined,
                        background: form.mode === "batch" ? "rgba(59, 130, 246, 0.1)" : undefined,
                      }}
                    >
                      <strong style={{ fontSize: "0.86rem" }}>توليد دفعة أكواد عشوائية (Batch)</strong>
                      <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                        توليد عدة أكواد فريدة بنفس الخصائص دفعة واحدة
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Code / Batch Inputs */}
              {form.mode === "single" ? (
                <div className={vStyles.formGrid2}>
                  <div>
                    <label className={vStyles.fieldLabel}>الكود (حروف وأرقام)</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        dir="ltr"
                        className={vStyles.inputControl}
                        style={{ fontFamily: "monospace", fontWeight: 700 }}
                        value={form.code}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
                          }))
                        }
                        placeholder="QRB-XXXX"
                      />
                      <button
                        type="button"
                        className={vStyles.secondaryBtn}
                        style={{ padding: "0 12px", flexShrink: 0 }}
                        onClick={() => setForm((f) => ({ ...f, code: generateRandomCode("QRB-") }))}
                        title="توليد كود عشوائي"
                      >
                        <i className="bx bx-refresh" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={vStyles.fieldLabel}>اسم الحملة / الدفعة (اختياري)</label>
                    <input
                      type="text"
                      className={vStyles.inputControl}
                      value={form.batchName}
                      onChange={(e) => setForm((f) => ({ ...f, batchName: e.target.value }))}
                      placeholder="مثال: حملة الشتاء"
                    />
                  </div>
                </div>
              ) : (
                <div className={vStyles.formGrid2}>
                  <div>
                    <label className={vStyles.fieldLabel}>بادئة الأكواد</label>
                    <input
                      type="text"
                      dir="ltr"
                      className={vStyles.inputControl}
                      style={{ fontFamily: "monospace", fontWeight: 700 }}
                      value={form.batchPrefix}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          batchPrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={vStyles.fieldLabel}>عدد الأكواد المطلوب توليدها</label>
                    <input
                      type="number"
                      min={2}
                      max={25}
                      className={vStyles.inputControl}
                      value={form.batchCount}
                      onChange={(e) => setForm((f) => ({ ...f, batchCount: Number(e.target.value) || 2 }))}
                    />
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div>
                <label className={vStyles.fieldLabel}>عنوان القسيمة</label>
                <input
                  type="text"
                  className={vStyles.inputControl}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="مثال: رصيد ترويجي ترحيبي 50 ج.م"
                />
              </div>

              {/* Reward Type Selector */}
              <div>
                <span className={vStyles.fieldLabel}>نوع المكافأة / النتيجة عند الاسترداد</span>
                <div className={vStyles.rewardTypeGrid}>
                  {(Object.keys(VOUCHER_REWARD_META) as VoucherRewardType[]).map((type) => {
                    const meta = VOUCHER_REWARD_META[type];
                    const selected = form.rewardType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rewardType: type }))}
                        className={vStyles.rewardTypeCard}
                        style={{
                          borderColor: selected ? meta.accentColor : undefined,
                          background: selected ? meta.accentBg : undefined,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i
                            className={`bx ${meta.bxIcon}`}
                            style={{ color: meta.accentColor, fontSize: "1.15rem" }}
                          />
                          <strong style={{ fontSize: "0.84rem" }}>{meta.label}</strong>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.45 }}>
                          {meta.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Reward Fields */}
              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "rgba(255, 255, 255, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {form.rewardType === "main_balance" && (
                  <div>
                    <label className={vStyles.fieldLabel}>المبلغ المضاف إلى المحفظة الأساسية (ج.م)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      className={vStyles.inputControl}
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                )}

                {form.rewardType === "promo_balance" && (
                  <>
                    <div className={vStyles.formGrid2}>
                      <div>
                        <label className={vStyles.fieldLabel}>قيمة الرصيد الترويجي (ج.م)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          className={vStyles.inputControl}
                          value={form.amount}
                          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className={vStyles.fieldLabel}>صلاحية الرصيد الترويجي بعد الاسترداد</label>
                        <select
                          className={vStyles.inputControl}
                          value={form.promoExpiryMode}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              promoExpiryMode: e.target.value as PromoExpiryMode,
                            }))
                          }
                        >
                          <option value="days_after_redeem">مدة محددة بالأيام</option>
                          <option value="fixed_date">تاريخ انتهاء ثابت</option>
                          <option value="unlimited">غير محدد المدة</option>
                        </select>
                      </div>
                    </div>

                    {form.promoExpiryMode === "days_after_redeem" && (
                      <div>
                        <label className={vStyles.fieldLabel}>عدد أيام صلاحية الرصيد بعد التفعيل</label>
                        <input
                          type="number"
                          min={1}
                          className={vStyles.inputControl}
                          value={form.promoExpiryDays}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, promoExpiryDays: Number(e.target.value) || 1 }))
                          }
                        />
                      </div>
                    )}

                    {form.promoExpiryMode === "fixed_date" && (
                      <div>
                        <label className={vStyles.fieldLabel}>تاريخ انتهاء الرصيد الترويجي</label>
                        <input
                          type="date"
                          className={vStyles.inputControl}
                          value={form.promoExpiryDate}
                          onChange={(e) => setForm((f) => ({ ...f, promoExpiryDate: e.target.value }))}
                        />
                      </div>
                    )}
                  </>
                )}

                {form.rewardType === "feature_unlock" && (
                  <div>
                    <label className={vStyles.fieldLabel}>اختر الميزة أو الخدمة المراد فتحها</label>
                    <select
                      className={vStyles.inputControl}
                      value={form.featureKey}
                      onChange={(e) => setForm((f) => ({ ...f, featureKey: e.target.value }))}
                    >
                      {VOUCHER_FEATURE_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {form.rewardType === "page_access" && (
                  <>
                    <div>
                      <label className={vStyles.fieldLabel}>الصفحة أو القسم المستهدف</label>
                      <select
                        className={vStyles.inputControl}
                        value={form.targetPage}
                        onChange={(e) => setForm((f) => ({ ...f, targetPage: e.target.value }))}
                      >
                        {VOUCHER_PAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={vStyles.formGrid2}>
                      <div>
                        <label className={vStyles.fieldLabel}>مدة فتح القسم</label>
                        <input
                          type="number"
                          min={1}
                          className={vStyles.inputControl}
                          value={form.accessDurationValue}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              accessDurationValue: Number(e.target.value) || 1,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className={vStyles.fieldLabel}>وحدة المدة</label>
                        <select
                          className={vStyles.inputControl}
                          value={form.accessDurationUnit}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              accessDurationUnit: e.target.value as "hours" | "days",
                            }))
                          }
                        >
                          <option value="days">أيام</option>
                          <option value="hours">ساعات</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Usage & Validity Limits */}
              <div className={vStyles.formGrid2}>
                <div>
                  <label className={vStyles.fieldLabel}>الحد الأقصى للاستخدام الكلي</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="number"
                      min={1}
                      disabled={form.unlimitedUses}
                      className={vStyles.inputControl}
                      value={form.maxUses}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, maxUses: Number(e.target.value) || 1 }))
                      }
                    />
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.78rem",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.unlimitedUses}
                        onChange={(e) => setForm((f) => ({ ...f, unlimitedUses: e.target.checked }))}
                      />
                      غير محدود
                    </label>
                  </div>
                </div>

                <div>
                  <label className={vStyles.fieldLabel}>تاريخ انتهاء صلاحية الكود</label>
                  <input
                    type="date"
                    className={vStyles.inputControl}
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className={vStyles.formGrid2}>
                <div>
                  <label className={vStyles.fieldLabel}>الفئة المستهدفة</label>
                  <select
                    className={vStyles.inputControl}
                    value={form.audience}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, audience: e.target.value as VoucherAudience }))
                    }
                  >
                    <option value="all">جميع المستخدمين</option>
                    <option value="new_users">المستخدمون الجدد فقط</option>
                    <option value="free_tier">أصحاب الباقة المجانية</option>
                    <option value="specific_users">مستخدمون محددون</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "8px" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    تفعيل القسيمة مباشرة بعد الحفظ
                  </label>
                </div>
              </div>

              {formError && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  type="button"
                  className={vStyles.secondaryBtn}
                  onClick={() => setIsEditorOpen(false)}
                >
                  إلغاء
                </button>
                <button type="submit" disabled={saving} className={vStyles.primaryBtn}>
                  <i className="bx bx-save" />
                  <span>{saving ? "جاري الحفظ..." : editingVoucher ? "حفظ التعديلات" : "إصدار القسيمة"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redemption Logs Modal */}
      {logsModalVoucher && (
        <div
          className={vStyles.modalOverlay}
          data-modal-overlay="true"
          onClick={() => setLogsModalVoucher(null)}
        >
          <div className={vStyles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={vStyles.modalHeader}>
              <h2>
                {logsModalVoucher === "all"
                  ? "سجل استرداد القسائم والأكواد"
                  : `سجل استرداد الكود: ${logsModalVoucher.code}`}
              </h2>
              <button
                type="button"
                className={vStyles.closeBtn}
                onClick={() => setLogsModalVoucher(null)}
                aria-label="إغلاق"
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {visibleLogs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 16px", color: "#94a3b8" }}>
                <i className="bx bx-receipt" style={{ fontSize: "2.4rem", opacity: 0.4 }} />
                <p style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>
                  لا توجد عمليات استرداد مسجلة لهذا الكود حتى الآن.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {visibleLogs.map((log) => {
                  const meta = VOUCHER_REWARD_META[log.rewardType];
                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        background: "rgba(255, 255, 255, 0.02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                          {log.userName}{" "}
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
                            ({log.userEmail})
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: meta.accentColor, marginTop: "3px" }}>
                          {log.rewardSummary}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                          تاريخ الاسترداد:{" "}
                          {new Date(log.redeemedAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <code dir="ltr" className={vStyles.codeMono}>
                        {log.code}
                      </code>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
