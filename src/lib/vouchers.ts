"use client";

import { supabase } from "./supabase";
import {
  ActiveUnlockedPerk,
  VoucherItem,
  VoucherRedemptionLog,
  VoucherRewardType,
  VoucherStatus,
} from "@/types/vouchers";

export const VOUCHER_FEATURE_OPTIONS = [
  { key: "ai_planner_pro", label: "مخطط الرحلات الذكي المتقدم (AI Planner Pro)" },
  { key: "smart_reminders", label: "التذكيرات والملاحظات غير المحدودة" },
  { key: "ad_free_browsing", label: "تصفح الموقع بدون إعلانات" },
  { key: "offline_transit_maps", label: "خرائط المواصلات التفاعلية الكاملة" },
  { key: "priority_support", label: "أولوية الدعم الفني ومراجعة المقترحات" },
];

export const VOUCHER_PAGE_OPTIONS = [
  { value: "/directions", label: "خطوط المواصلات والاتجاهات (إزاي أروح)" },
  { value: "/ai-planner", label: "المساعد ومخطط الرحلات الذكي" },
  { value: "/airports", label: "دليل المطارات المصرية والصالات" },
  { value: "/ports", label: "دليل الموانئ البحرية والسفر" },
  { value: "/railways", label: "دليل سكك حديد مصر والقطارات" },
  { value: "/lrt", label: "القطار الكهربائي الخفيف LRT" },
  { value: "/bus-stations", label: "دليل الأتوبيسات وسوبرجيت" },
  { value: "/parking", label: "دليل الجراجات وخدمة اركن واركب" },
  { value: "all", label: "جميع الأقسام والصفحات المدفوعة" },
];

export function formatRewardSummary(voucher: Pick<VoucherItem, "rewardType" | "rewardConfig" | "title">): string {
  const { rewardType, rewardConfig } = voucher;
  switch (rewardType) {
    case "main_balance":
      return `+${(rewardConfig.amount ?? 0).toFixed(2)} ج.م للمحفظة الأساسية`;
    case "promo_balance": {
      const amt = `${(rewardConfig.amount ?? 0).toFixed(2)} ج.م رصيد ترويجي`;
      if (rewardConfig.promoExpiryMode === "days_after_redeem" && rewardConfig.promoExpiryDays) {
        return `${amt} (صالح ${rewardConfig.promoExpiryDays} يوماً)`;
      }
      if (rewardConfig.promoExpiryMode === "fixed_date" && rewardConfig.promoExpiryDate) {
        return `${amt} (حتى ${rewardConfig.promoExpiryDate})`;
      }
      return `${amt} (غير محدد المدة)`;
    }
    case "feature_unlock":
      return `فتح ميزة: ${rewardConfig.featureLabel || rewardConfig.featureKey || "ميزة متقدمة"}`;
    case "page_access": {
      const pageLabel = rewardConfig.targetPageLabel || rewardConfig.targetPage || "قسم مخصص";
      const val = rewardConfig.accessDurationValue ?? 7;
      const unit = rewardConfig.accessDurationUnit === "hours" ? "ساعة" : "أيام";
      return `فتح ${pageLabel} لمدة ${val} ${unit}`;
    }
    default:
      return voucher.title;
  }
}

function mapVoucherRow(row: any): VoucherItem {
  return {
    id: String(row.id),
    code: String(row.code),
    title: String(row.title),
    description: row.description || undefined,
    rewardType: row.reward_type as VoucherRewardType,
    rewardConfig: row.reward_config || {},
    status: row.status as VoucherStatus,
    usageCount: Number(row.usage_count ?? 0),
    maxUses: row.max_uses !== null && row.max_uses !== undefined ? Number(row.max_uses) : null,
    maxUsesPerUser: Number(row.max_uses_per_user ?? 1),
    startsAt: row.starts_at ?? null,
    expiresAt: row.expires_at ?? null,
    audience: row.audience || "all",
    batchName: row.batch_name ?? null,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapRedemptionRow(row: any): VoucherRedemptionLog {
  return {
    id: String(row.id),
    voucherId: String(row.voucher_id),
    code: String(row.code),
    userId: String(row.user_id || ""),
    userName: row.profiles?.full_name || row.profiles?.username || "مستخدم",
    userEmail: row.profiles?.email || "",
    rewardType: row.reward_type as VoucherRewardType,
    rewardSummary: String(row.reward_summary || ""),
    redeemedAt: row.redeemed_at || new Date().toISOString(),
    expiresAt: row.expires_at ?? null,
  };
}

function mapPerkRow(row: any): ActiveUnlockedPerk {
  return {
    id: String(row.id),
    kind: row.kind,
    title: String(row.title),
    targetRoute: row.kind === "page_access" ? row.perk_key : undefined,
    sourceCode: String(row.source_code || ""),
    unlockedAt: row.unlocked_at || new Date().toISOString(),
    expiresAt: row.expires_at ?? null,
  };
}

export async function fetchUserVoucherOverview(userId?: string): Promise<{
  unlockedPerks: ActiveUnlockedPerk[];
  redemptions: VoucherRedemptionLog[];
  schemaReady: boolean;
}> {
  if (!supabase || !userId) {
    return { unlockedPerks: [], redemptions: [], schemaReady: false };
  }

  try {
    const { data, error } = await supabase.rpc("get_my_voucher_overview");
    if (!error && data && data.success) {
      return {
        unlockedPerks: Array.isArray(data.unlocked_perks)
          ? data.unlocked_perks.map(mapPerkRow)
          : [],
        redemptions: Array.isArray(data.redemptions)
          ? data.redemptions.map(mapRedemptionRow)
          : [],
        schemaReady: true,
      };
    }
  } catch {
    // fallback below
  }

  try {
    const nowIso = new Date().toISOString();
    const [perksRes, redemptionsRes] = await Promise.all([
      supabase
        .from("user_unlocked_perks")
        .select("*")
        .eq("user_id", userId)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order("unlocked_at", { ascending: false }),
      supabase
        .from("voucher_redemptions")
        .select("*")
        .eq("user_id", userId)
        .order("redeemed_at", { ascending: false })
        .limit(30),
    ]);

    const schemaReady = !perksRes.error && !redemptionsRes.error;
    return {
      unlockedPerks: !perksRes.error && perksRes.data ? perksRes.data.map(mapPerkRow) : [],
      redemptions:
        !redemptionsRes.error && redemptionsRes.data
          ? redemptionsRes.data.map(mapRedemptionRow)
          : [],
      schemaReady,
    };
  } catch {
    return { unlockedPerks: [], redemptions: [], schemaReady: false };
  }
}

export async function redeemVoucherCode(code: string): Promise<{
  success: boolean;
  message: string;
  rewardType?: VoucherRewardType;
  rewardSummary?: string;
  newBalance?: number;
  newPromoBalance?: number;
}> {
  if (!supabase) {
    return { success: false, message: "اتصال قاعدة البيانات غير متاح." };
  }

  const { data, error } = await supabase.rpc("redeem_voucher_code", {
    p_code: code.trim().toUpperCase(),
  });

  if (error) {
    const missing =
      error.code === "42883" ||
      error.code === "PGRST202" ||
      (error.message || "").includes("redeem_voucher_code");
    return {
      success: false,
      message: missing
        ? "نظام القسائم غير مفعّل في قاعدة البيانات بعد (يرجى تشغيل ملف supabase_vouchers_schema.sql)."
        : error.message || "تعذر استرداد الكود.",
    };
  }

  if (!data) {
    return { success: false, message: "لم يتم استلام استجابة من الخادم." };
  }

  return {
    success: Boolean(data.success),
    message: data.message || "",
    rewardType: data.reward_type,
    rewardSummary: data.reward_summary,
    newBalance: data.new_balance !== undefined ? Number(data.new_balance) : undefined,
    newPromoBalance:
      data.new_promo_balance !== undefined ? Number(data.new_promo_balance) : undefined,
  };
}

export async function fetchAdminVouchers(): Promise<{
  vouchers: VoucherItem[];
  redemptions: VoucherRedemptionLog[];
  schemaReady: boolean;
}> {
  if (!supabase) return { vouchers: [], redemptions: [], schemaReady: false };

  const [vouchersRes, logsRes] = await Promise.all([
    supabase.from("vouchers").select("*").order("created_at", { ascending: false }),
    supabase
      .from("voucher_redemptions")
      .select(`
        id,
        voucher_id,
        user_id,
        code,
        reward_type,
        reward_summary,
        redeemed_at,
        expires_at,
        profiles:user_id (
          full_name,
          username,
          email
        )
      `)
      .order("redeemed_at", { ascending: false })
      .limit(100),
  ]);

  const schemaReady = !vouchersRes.error && !logsRes.error;
  return {
    vouchers: !vouchersRes.error && vouchersRes.data ? vouchersRes.data.map(mapVoucherRow) : [],
    redemptions: !logsRes.error && logsRes.data ? logsRes.data.map(mapRedemptionRow) : [],
    schemaReady,
  };
}

export async function createAdminVouchers(
  payloads: Array<{
    code: string;
    title: string;
    description?: string;
    rewardType: VoucherRewardType;
    rewardConfig: VoucherItem["rewardConfig"];
    status: VoucherStatus;
    maxUses: number | null;
    maxUsesPerUser: number;
    startsAt?: string | null;
    expiresAt?: string | null;
    audience: VoucherItem["audience"];
    batchName?: string | null;
  }>
): Promise<{ success: boolean; items: VoucherItem[]; message?: string }> {
  if (!supabase) return { success: false, items: [], message: "اتصال قاعدة البيانات غير متاح." };

  const rows = payloads.map((p) => ({
    code: p.code.trim().toUpperCase(),
    title: p.title,
    description: p.description || null,
    reward_type: p.rewardType,
    reward_config: p.rewardConfig,
    status: p.status,
    max_uses: p.maxUses,
    max_uses_per_user: p.maxUsesPerUser,
    starts_at: p.startsAt || null,
    expires_at: p.expiresAt || null,
    audience: p.audience,
    batch_name: p.batchName || null,
  }));

  const { data, error } = await supabase.from("vouchers").insert(rows).select("*");
  if (error) {
    return { success: false, items: [], message: error.message };
  }

  return {
    success: true,
    items: (data || []).map(mapVoucherRow),
  };
}

export async function updateAdminVoucher(
  id: string,
  patch: Partial<{
    code: string;
    title: string;
    description: string;
    rewardType: VoucherRewardType;
    rewardConfig: VoucherItem["rewardConfig"];
    status: VoucherStatus;
    maxUses: number | null;
    maxUsesPerUser: number;
    startsAt: string | null;
    expiresAt: string | null;
    audience: VoucherItem["audience"];
    batchName: string | null;
  }>
): Promise<{ success: boolean; item?: VoucherItem; message?: string }> {
  if (!supabase) return { success: false, message: "اتصال قاعدة البيانات غير متاح." };

  const updateRow: Record<string, any> = { updated_at: new Date().toISOString() };
  if (patch.code !== undefined) updateRow.code = patch.code.trim().toUpperCase();
  if (patch.title !== undefined) updateRow.title = patch.title;
  if (patch.description !== undefined) updateRow.description = patch.description || null;
  if (patch.rewardType !== undefined) updateRow.reward_type = patch.rewardType;
  if (patch.rewardConfig !== undefined) updateRow.reward_config = patch.rewardConfig;
  if (patch.status !== undefined) updateRow.status = patch.status;
  if (patch.maxUses !== undefined) updateRow.max_uses = patch.maxUses;
  if (patch.maxUsesPerUser !== undefined) updateRow.max_uses_per_user = patch.maxUsesPerUser;
  if (patch.startsAt !== undefined) updateRow.starts_at = patch.startsAt;
  if (patch.expiresAt !== undefined) updateRow.expires_at = patch.expiresAt;
  if (patch.audience !== undefined) updateRow.audience = patch.audience;
  if (patch.batchName !== undefined) updateRow.batch_name = patch.batchName;

  const { data, error } = await supabase
    .from("vouchers")
    .update(updateRow)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { success: false, message: error.message };
  return { success: true, item: mapVoucherRow(data) };
}

export async function deleteAdminVoucher(id: string): Promise<{ success: boolean; message?: string }> {
  if (!supabase) return { success: false, message: "اتصال قاعدة البيانات غير متاح." };
  const { error } = await supabase.from("vouchers").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}
