export type VoucherRewardType =
  | "main_balance"
  | "promo_balance"
  | "feature_unlock"
  | "page_access";

export type VoucherStatus =
  | "active"
  | "paused"
  | "scheduled"
  | "expired"
  | "exhausted";

export type VoucherAudience = "all" | "new_users" | "free_tier" | "specific_users";

export type PromoExpiryMode = "unlimited" | "days_after_redeem" | "fixed_date";

export interface VoucherRewardConfig {
  /** For main_balance and promo_balance (EGP) */
  amount?: number;
  /** For promo_balance expiry rule */
  promoExpiryMode?: PromoExpiryMode;
  promoExpiryDays?: number;
  promoExpiryDate?: string;
  /** For feature_unlock */
  featureKey?: string;
  featureLabel?: string;
  /** For page_access (and optional timed feature_unlock) */
  targetPage?: string;
  targetPageLabel?: string;
  accessDurationUnit?: "hours" | "days";
  accessDurationValue?: number;
  /** Extensible hook for future reward types without breaking existing UI */
  metadata?: Record<string, string | number | boolean>;
}

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  rewardType: VoucherRewardType;
  rewardConfig: VoucherRewardConfig;
  status: VoucherStatus;
  usageCount: number;
  maxUses: number | null; // null = unlimited
  maxUsesPerUser: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  audience: VoucherAudience;
  batchName?: string | null;
  createdAt: string;
}

export interface VoucherRedemptionLog {
  id: string;
  voucherId: string;
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
  rewardType: VoucherRewardType;
  rewardSummary: string;
  redeemedAt: string;
  expiresAt?: string | null;
}

export interface PromoBalanceBatch {
  id: string;
  sourceLabel: string;
  sourceCode?: string;
  initialAmount: number;
  remainingAmount: number;
  grantedAt: string;
  expiresAt: string | null; // null = unlimited duration
  status: "active" | "expiring_soon" | "expired" | "depleted";
}

export interface PromoBalanceLedgerItem {
  id: string;
  type: "credit" | "debit" | "expired";
  title: string;
  description: string;
  amount: number;
  sourceCode?: string;
  createdAt: string;
  expiresAt?: string | null;
}

export interface ActiveUnlockedPerk {
  id: string;
  kind: "feature_unlock" | "page_access";
  title: string;
  targetRoute?: string;
  sourceCode: string;
  unlockedAt: string;
  expiresAt: string | null; // null = permanent
}

export interface VoucherRewardTypeMeta {
  type: VoucherRewardType;
  label: string;
  shortLabel: string;
  description: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  bxIcon: string;
}

/**
 * Central extensible registry for voucher reward types.
 * Adding a new reward type in Phase 2+ only requires registering it here
 * and adding its optional configuration fields.
 */
export const VOUCHER_REWARD_META: Record<VoucherRewardType, VoucherRewardTypeMeta> = {
  main_balance: {
    type: "main_balance",
    label: "رصيد محفظة أساسي",
    shortLabel: "رصيد أساسي",
    description: "يُضاف مباشرة إلى الرصيد الأساسي القابل للاستخدام والسحب",
    accentColor: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.12)",
    accentBorder: "rgba(16, 185, 129, 0.28)",
    bxIcon: "bx-wallet",
  },
  promo_balance: {
    type: "promo_balance",
    label: "رصيد ترويجي",
    shortLabel: "رصيد ترويجي",
    description: "رصيد تشجيعي للشراء والدفع داخل الموقع فقط دون سحب نقدي",
    accentColor: "#6366f1",
    accentBg: "rgba(99, 102, 241, 0.12)",
    accentBorder: "rgba(99, 102, 241, 0.28)",
    bxIcon: "bx-gift",
  },
  feature_unlock: {
    type: "feature_unlock",
    label: "فتح ميزة أو خدمة",
    shortLabel: "فتح ميزة",
    description: "يمنح المستخدم صلاحية استخدام ميزة أو أداة مدفوعة داخل الموقع",
    accentColor: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)",
    accentBorder: "rgba(245, 158, 11, 0.28)",
    bxIcon: "bx-star",
  },
  page_access: {
    type: "page_access",
    label: "فتح صفحة أو قسم مؤقت",
    shortLabel: "صلاحية قسم",
    description: "يفتح صفحة أو قسماً محدداً لفترة زمنية وتنتهي الصلاحية تلقائياً",
    accentColor: "#0ea5e9",
    accentBg: "rgba(14, 165, 233, 0.12)",
    accentBorder: "rgba(14, 165, 233, 0.28)",
    bxIcon: "bx-lock-open-alt",
  },
};

export const VOUCHER_STATUS_META: Record<
  VoucherStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  active: {
    label: "نشط",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.28)",
  },
  paused: {
    label: "موقوف مؤقتاً",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.28)",
  },
  scheduled: {
    label: "مجدول",
    color: "#0ea5e9",
    bg: "rgba(14, 165, 233, 0.12)",
    border: "rgba(14, 165, 233, 0.28)",
  },
  expired: {
    label: "منتهي الصلاحية",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.28)",
  },
  exhausted: {
    label: "مكتمل الاستخدام",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.25)",
  },
};
