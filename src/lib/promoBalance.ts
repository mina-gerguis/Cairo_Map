"use client";

import { supabase } from "./supabase";
import { PromoBalanceBatch, PromoBalanceLedgerItem } from "@/types/vouchers";

export interface PromoOverviewResult {
  promoBalance: number;
  batches: PromoBalanceBatch[];
  transactions: PromoBalanceLedgerItem[];
  schemaReady: boolean;
}

export interface AdminPromoLedgerEntry extends PromoBalanceLedgerItem {
  userId: string;
  userName?: string | null;
  userUsername?: string | null;
  userEmail?: string | null;
  balanceAfter?: number;
}

export function computeBatchStatus(
  remainingAmount: number,
  expiresAt: string | null,
  rawStatus?: string
): PromoBalanceBatch["status"] {
  if (rawStatus === "expired") return "expired";
  if (rawStatus === "depleted" || remainingAmount <= 0) return "depleted";
  if (expiresAt) {
    const expMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    if (expMs <= nowMs) return "expired";
    if (expMs - nowMs <= 7 * 24 * 60 * 60 * 1000) return "expiring_soon";
  }
  return "active";
}

function mapBatchRow(row: any): PromoBalanceBatch {
  const remainingAmount = Number(row.remaining_amount ?? 0);
  const expiresAt = row.expires_at ?? null;
  return {
    id: String(row.id),
    sourceLabel: row.source_label || "رصيد ترويجي",
    sourceCode: row.source_code || undefined,
    initialAmount: Number(row.initial_amount ?? remainingAmount),
    remainingAmount,
    grantedAt: row.granted_at || row.created_at || new Date().toISOString(),
    expiresAt,
    status: computeBatchStatus(remainingAmount, expiresAt, row.status),
  };
}

function mapTransactionRow(row: any): PromoBalanceLedgerItem {
  return {
    id: String(row.id),
    type: (row.type === "credit" || row.type === "debit" || row.type === "expired"
      ? row.type
      : "credit") as PromoBalanceLedgerItem["type"],
    title: row.title || "حركة رصيد ترويجي",
    description: row.description || "",
    amount: Number(row.amount ?? 0),
    sourceCode: row.source_code || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    expiresAt: row.expires_at ?? null,
  };
}

/**
 * Fetches the authenticated user's real promotional balance, active/expired batches,
 * and promotional balance transaction ledger. Automatically sweeps expired credits on the DB side.
 */
export async function fetchUserPromoOverview(userId?: string): Promise<PromoOverviewResult> {
  if (!supabase || !userId) {
    return { promoBalance: 0, batches: [], transactions: [], schemaReady: false };
  }

  try {
    const { data, error } = await supabase.rpc("get_my_promo_balance_overview");

    if (!error && data && data.success) {
      const batches = Array.isArray(data.batches) ? data.batches.map(mapBatchRow) : [];
      const transactions = Array.isArray(data.transactions)
        ? data.transactions.map(mapTransactionRow)
        : [];
      return {
        promoBalance: Number(data.promo_balance ?? 0),
        batches,
        transactions,
        schemaReady: true,
      };
    }
  } catch {
    // Fall back to direct queries below
  }

  try {
    const [profileRes, batchesRes, txRes] = await Promise.all([
      supabase.from("profiles").select("promo_balance").eq("id", userId).single(),
      supabase
        .from("promo_balance_batches")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["active", "expired"])
        .order("granted_at", { ascending: false })
        .limit(25),
      supabase
        .from("promo_balance_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const schemaReady = !batchesRes.error && !txRes.error;
    const rawPromo = Number(profileRes.data?.promo_balance ?? 0);

    return {
      promoBalance: rawPromo,
      batches: !batchesRes.error && batchesRes.data ? batchesRes.data.map(mapBatchRow) : [],
      transactions: !txRes.error && txRes.data ? txRes.data.map(mapTransactionRow) : [],
      schemaReady,
    };
  } catch {
    return { promoBalance: 0, batches: [], transactions: [], schemaReady: false };
  }
}

/**
 * Fetches promotional balance transactions across all users for the Admin Finance view.
 */
export async function fetchAdminPromoLedger(
  limit = 60
): Promise<{ items: AdminPromoLedgerEntry[]; schemaReady: boolean }> {
  if (!supabase) return { items: [], schemaReady: false };

  try {
    const { data, error } = await supabase
      .from("promo_balance_transactions")
      .select(`
        id,
        user_id,
        type,
        title,
        description,
        amount,
        balance_after,
        source_code,
        reference_type,
        reference_id,
        expires_at,
        created_at,
        profiles:user_id (
          full_name,
          username,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { items: [], schemaReady: false };
    }

    const items: AdminPromoLedgerEntry[] = (data || []).map((row: any) => ({
      ...mapTransactionRow(row),
      userId: String(row.user_id),
      userName: row.profiles?.full_name || null,
      userUsername: row.profiles?.username || null,
      userEmail: row.profiles?.email || null,
      balanceAfter: Number(row.balance_after ?? 0),
    }));

    return { items, schemaReady: true };
  } catch {
    return { items: [], schemaReady: false };
  }
}

/**
 * Admin helper to grant (with optional expiration) or deduct promotional balance safely.
 */
export async function adminAdjustPromoBalance(params: {
  userId: string;
  action: "deposit" | "withdraw";
  amount: number;
  expiresAt?: string | null;
  reason?: string;
  fallbackCurrentPromo?: number;
  currentPoints?: number;
  currentBalance?: number;
}): Promise<{ success: boolean; message: string; newPromoBalance?: number; usedLegacyFallback?: boolean }> {
  if (!supabase) {
    return { success: false, message: "اتصال قاعدة البيانات غير متاح." };
  }

  const {
    userId,
    action,
    amount,
    expiresAt = null,
    reason,
    fallbackCurrentPromo = 0,
    currentPoints = 0,
    currentBalance = 0,
  } = params;

  const { data, error } = await supabase.rpc("admin_adjust_promo_balance", {
    p_user_id: userId,
    p_action: action,
    p_amount: Number(amount.toFixed(2)),
    p_expires_at: action === "deposit" ? expiresAt : null,
    p_reason: reason || null,
  });

  if (!error && data) {
    return {
      success: Boolean(data.success),
      message: data.message || (data.success ? "تمت العملية بنجاح." : "تعذر تنفيذ العملية."),
      newPromoBalance:
        data.new_promo_balance !== undefined ? Number(data.new_promo_balance) : undefined,
    };
  }

  // Fallback if supabase_promo_balance_schema.sql has not been applied yet
  const isMissingRpc =
    error?.code === "42883" ||
    error?.code === "PGRST202" ||
    (error?.message || "").includes("admin_adjust_promo_balance");

  if (!isMissingRpc) {
    return { success: false, message: error?.message || "حدث خطأ غير متوقع." };
  }

  const nextPromo =
    action === "deposit"
      ? Number((fallbackCurrentPromo + amount).toFixed(2))
      : Number(Math.max(0, fallbackCurrentPromo - amount).toFixed(2));

  if (action === "withdraw" && fallbackCurrentPromo < amount) {
    return {
      success: false,
      message: `الرصيد الترويجي للمستخدم غير كافٍ للخصم (الرصيد الحالي: ${fallbackCurrentPromo} ج.م).`,
    };
  }

  const legacyRes = await supabase.rpc("admin_update_user_assets", {
    p_user_id: userId,
    p_points: currentPoints,
    p_balance: Number(currentBalance.toFixed(2)),
    p_promo_balance: nextPromo,
  });

  if (legacyRes.error || (legacyRes.data && !legacyRes.data.success)) {
    return {
      success: false,
      message:
        legacyRes.error?.message || legacyRes.data?.message || "تعذر تحديث الرصيد الترويجي.",
    };
  }

  return {
    success: true,
    message: "تم تحديث الرصيد الترويجي (يُرجى تشغيل ملف supabase_promo_balance_schema.sql لتفعيل تتبع الدفعات والصلاحية).",
    newPromoBalance: nextPromo,
    usedLegacyFallback: true,
  };
}
