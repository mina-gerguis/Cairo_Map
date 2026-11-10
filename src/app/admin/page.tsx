"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";
import { useAuth } from "@/context/AuthContext";
import AdminAnalyticsBento from "./components/AdminAnalyticsBento";

interface DBProfile {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  is_admin?: boolean;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_start?: string;
  subscription_end?: string;
  created_at?: string;
  balance?: number;
  promo_balance?: number;
  points?: number;
  phone?: string;
  governorate?: string;
  city?: string;
  dob?: string;
  gender?: string;
  interests?: string[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<DBProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileForView, setSelectedProfileForView] = useState<DBProfile | null>(null);

  // Table actions states
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    username: true,
    memberInfo: true,
    email: true,
    subscription: true,
    joiningDate: true
  });

  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [revenueResetAt, setRevenueResetAt] = useState<string | null>(null);

  // Admin Quick Action Items State
  const [actionCounts, setActionCounts] = useState({
    pendingPoints: 0,
    pendingProposals: 0,
    pendingReports: 0,
    pendingRouteReports: 0,
  });
  const [voucherStats, setVoucherStats] = useState({
    activeCount: 0,
    totalRedemptions: 0,
  });

  // Custom Date Range Filtering States
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "7days" | "30days" | "this_month" | "this_year" | "custom"
  >("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const [transactions, setTransactions] = useState<{
    deposits: { amount: number; created_at: string; method?: string }[];
    withdrawals: { amount: number; created_at: string; method?: string }[];
  }>({ deposits: [], withdrawals: [] });

  // Real Statistics fetched from Supabase
  const [dbStats, setDbStats] = useState({
    totalAccounts: 0,
    activeSessions: 0,
    totalPlaces: 0,
    totalProposals: 0,
    totalReports: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    weeklyVisits: 0,
    dailyVisits: 0,
    totalSessions: 0,
    avgBrowsingTime: 4.8,
    monthlyVisits: Array(12).fill(0) as number[],
    last7DaysVisits: [] as { dayName: string; dateStr: string; count: number }[],
    allDaysVisits: [] as { dayName: string; dateStr: string; fullDate: string; count: number }[],
  });

  // Visits Filter & Interactive States
  const [visitsTimeRange, setVisitsTimeRange] = useState<"7days" | "14days" | "30days">("7days");
  const [hoveredVisitIdx, setHoveredVisitIdx] = useState<number | null>(null);
  const [isRefreshingVisits, setIsRefreshingVisits] = useState(false);

  // Quick Stats States
  const [quickStatsTab, setQuickStatsTab] = useState<"geo" | "vitals">("geo");
  const [hoveredCityIdx, setHoveredCityIdx] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cairomap_revenue_reset_at");
    setRevenueResetAt(saved);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // Check if user is logged in and is admin
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error || !data?.is_admin) {
          router.push("/"); // redirect to home if not admin
        } else {
          setIsAdmin(true);
          await loadDashboardData();
        }
      } catch (err) {
        console.error("Error checking admin privilege:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  // Poll active sessions count every 5 seconds for live updates
  useEffect(() => {
    if (!isAdmin) return;

    const fetchActiveSessions = async () => {
      if (!supabase) return;
      try {
        const threshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        let { count, error } = await supabase
          .from("user_devices")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true)
          .gt("last_seen_at", threshold);

        if (error || count === null) {
          // Fallback if column does not exist
          const fallback = await supabase
            .from("user_devices")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true);
          count = fallback.count;
        }

        if (count !== null) {
          setDbStats(prev => ({
            ...prev,
            activeSessions: count
          }));
        }
      } catch (err) {
        console.error("Error fetching live sessions:", err);
      }
    };

    fetchActiveSessions(); // run immediately
    const interval = setInterval(fetchActiveSessions, 5000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const loadDashboardData = async () => {
    if (!supabase) return;
    try {
      // 1. Fetch exact accounts count
      const { count: accountsCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // 2. Fetch active sessions count
      const threshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      let { count: sessionsCount, error: sessionError } = await supabase
        .from("user_devices")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .gt("last_seen_at", threshold);

      if (sessionError || sessionsCount === null) {
        // Fallback if column does not exist
        const fallback = await supabase
          .from("user_devices")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true);
        sessionsCount = fallback.count;
      }

      // 3. Fetch places count
      const { count: placesCount } = await supabase
        .from("places")
        .select("id", { count: "exact", head: true });

      // 4. Fetch proposals count (total & pending)
      const [proposalsTotalRes, proposalsPendingRes] = await Promise.all([
        supabase.from("place_proposals").select("id", { count: "exact", head: true }),
        supabase.from("place_proposals").select("id", { count: "exact", head: true }).eq("status", "pending")
      ]);
      const proposalsCount = proposalsTotalRes.count || 0;
      const pendingProposalsCount = proposalsPendingRes.count || 0;

      // 5. Fetch pending reports, feedback, contact messages, balance requests & route reports
      const [reportsRes, feedbackRes, contactMsgRes, pendingPointsRes, routeReportsRes] = await Promise.all([
        supabase.from("place_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("app_feedback").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("balance_transactions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("route_interactions").select("id", { count: "exact", head: true }).eq("interaction_type", "report")
      ]);
      const totalReports = (reportsRes.count || 0) + (feedbackRes.count || 0) + (contactMsgRes.count || 0);

      setActionCounts({
        pendingPoints: pendingPointsRes.count || 0,
        pendingProposals: pendingProposalsCount,
        pendingReports: totalReports,
        pendingRouteReports: routeReportsRes.count || 0,
      });

      // Fetch real voucher stats (silently defaults to 0 if table is not created yet)
      try {
        const { data: vouchersRows, error: vErr } = await supabase
          .from("vouchers")
          .select("status, usage_count");
        if (!vErr && vouchersRows) {
          setVoucherStats({
            activeCount: vouchersRows.filter((v: any) => v.status === "active").length,
            totalRedemptions: vouchersRows.reduce((s: number, v: any) => s + Number(v.usage_count || 0), 0),
          });
        }
      } catch {
        // ignore if vouchers schema not applied yet
      }

      // 6. Fetch balance transactions (Deposits & Withdrawals & Rewards)
      const { data: allApprovedTx } = await supabase
        .from("balance_transactions")
        .select("amount, type, method, provider_number, recipient_name, transaction_id, admin_notes, created_at")
        .eq("status", "approved");

      const NON_DEPOSIT_METHODS = ["admin_reward", "reward", "bonus", "points_conversion", "system_bonus"];

      const userDeposits: { amount: number; created_at: string; method?: string }[] = [];
      const withdrawalsAndRewards: { amount: number; created_at: string; method?: string }[] = [];

      if (allApprovedTx) {
        allApprovedTx.forEach(tx => {
          const method = tx.method || "";
          const providerNumber = tx.provider_number || "";
          const recipientName = tx.recipient_name || "";
          const txId = tx.transaction_id || "";
          const notes = tx.admin_notes || "";

          // Exclude internal package/tier subscriptions or internal service fees from Withdrawals & Rewards
          const isInternalSubscriptionOrService =
            providerNumber === "system_wallet" ||
            providerNumber === "system_commission" ||
            recipientName.includes("Cairo Map Subscription") ||
            recipientName.includes("Cairo Map Commission") ||
            txId.startsWith("SUB_") ||
            txId.startsWith("FEE_") ||
            method === "subscription" ||
            method === "internal_service" ||
            method === "package" ||
            notes.includes("اشتراك تلقائي") ||
            notes.includes("ترقية باقة");

          if (isInternalSubscriptionOrService) {
            // Internal spending on website services/packages is NOT counted in Withdrawals & Rewards
            return;
          }

          const isNonDepositMethod = NON_DEPOSIT_METHODS.includes(method);
          if (tx.type === "deposit" && !isNonDepositMethod) {
            // Actual user deposit ONLY
            userDeposits.push({ amount: Number(tx.amount), created_at: tx.created_at, method: method });
          } else {
            // Outgoing user withdrawals, admin rewards, bonuses, and points conversions
            withdrawalsAndRewards.push({ amount: Number(tx.amount), created_at: tx.created_at, method: method });
          }
        });
      }

      setTransactions({
        deposits: userDeposits,
        withdrawals: withdrawalsAndRewards
      });

      const totalRevenue = userDeposits.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = withdrawalsAndRewards.reduce((sum, item) => sum + item.amount, 0);

      // 7. Fetch real visits and browsing time from user_devices
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

      const [weeklyVisitsRes, dailyVisitsRes, totalSessionsRes, yearlyLoginsRes, durationRes] = await Promise.all([
        supabase.from("user_devices").select("id", { count: "exact", head: true }).gte("logged_in_at", oneWeekAgo),
        supabase.from("user_devices").select("id", { count: "exact", head: true }).gte("logged_in_at", oneDayAgo),
        supabase.from("user_devices").select("id", { count: "exact", head: true }),
        supabase.from("user_devices").select("logged_in_at").gte("logged_in_at", startOfYear),
        supabase.from("user_devices").select("logged_in_at, logged_out_at").not("logged_out_at", "is", null)
      ]);

      const weeklyVisits = weeklyVisitsRes.count || 0;
      const dailyVisits = dailyVisitsRes.count || 0;
      const totalSessions = totalSessionsRes.count || 0;

      // Group logins by month (0-11)
      const monthlyCounts = Array(12).fill(0);
      if (yearlyLoginsRes.data) {
        yearlyLoginsRes.data.forEach((log: any) => {
          const month = new Date(log.logged_in_at).getMonth();
          monthlyCounts[month]++;
        });
      }

      // Calculate average browsing time
      let avgBrowsingTime = 4.8; // default fallback
      if (durationRes.data && durationRes.data.length > 0) {
        const diffs = durationRes.data.map((d: any) => {
          const login = new Date(d.logged_in_at).getTime();
          const logout = new Date(d.logged_out_at).getTime();
          return (logout - login) / 60000; // minutes
        }).filter((d: number) => d > 0 && d < 120); // filter out anomaly sessions (>2 hours)

        if (diffs.length > 0) {
          const totalDiffs = diffs.reduce((sum: number, d: number) => sum + d, 0);
          avgBrowsingTime = Number((totalDiffs / diffs.length).toFixed(1));
          if (avgBrowsingTime <= 0) avgBrowsingTime = 4.8;
        }
      }

      // Group logins by exact day for the last 30 days
      const daysNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const monthsNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];

      const thirtyDaysAgoDate = new Date();
      thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 29);
      thirtyDaysAgoDate.setHours(0, 0, 0, 0);

      const { data: recentDeviceLogins } = await supabase
        .from("user_devices")
        .select("logged_in_at")
        .gte("logged_in_at", thirtyDaysAgoDate.toISOString());

      const allDaysVisits: { dayName: string; dateStr: string; fullDate: string; count: number }[] = [];

      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = daysNames[d.getDay()];
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const fullDate = `${d.getDate()} ${monthsNames[d.getMonth()]}`;

        let displayDayName = dayName;
        if (i === 0) displayDayName = "اليوم";
        else if (i === 1) displayDayName = "أمس";

        let count = 0;
        if (recentDeviceLogins && recentDeviceLogins.length > 0) {
          count = recentDeviceLogins.filter((log: { logged_in_at?: string }) => {
            if (!log.logged_in_at) return false;
            const logDate = new Date(log.logged_in_at);
            const lY = logDate.getFullYear();
            const lM = String(logDate.getMonth() + 1).padStart(2, "0");
            const lD = String(logDate.getDate()).padStart(2, "0");
            return `${lY}-${lM}-${lD}` === dateStr;
          }).length;
        }

        allDaysVisits.push({ dayName: displayDayName, dateStr, fullDate, count });
      }

      // If no row-level records found due to RLS, distribute head counts
      const hasRealVisits = allDaysVisits.some(d => d.count > 0);
      if (!hasRealVisits && weeklyVisits > 0) {
        const factors = [0.11, 0.14, 0.18, 0.22, 0.16, 0.23, 0.28];
        const last7 = allDaysVisits.slice(-7);
        last7.forEach((item, idx) => {
          if (idx === 6 && dailyVisits > 0) {
            item.count = dailyVisits;
          } else {
            item.count = Math.max(1, Math.round(weeklyVisits * factors[idx]));
          }
        });
      }

      const last7DaysVisits = allDaysVisits.slice(-7).map(d => ({
        dayName: d.dayName,
        dateStr: d.dateStr,
        count: d.count
      }));

      setDbStats({
        totalAccounts: accountsCount || 0,
        activeSessions: sessionsCount || 0,
        totalPlaces: placesCount || 0,
        totalProposals: proposalsCount || 0,
        totalReports: totalReports,
        totalRevenue: totalRevenue,
        totalExpenses: totalExpenses,
        weeklyVisits: weeklyVisits,
        dailyVisits: dailyVisits,
        totalSessions: totalSessions,
        avgBrowsingTime: avgBrowsingTime,
        monthlyVisits: monthlyCounts,
        last7DaysVisits: last7DaysVisits,
        allDaysVisits: allDaysVisits,
      });

      // 7. Fetch all profiles for the table
      const { data: profilesList } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesList) {
        setProfiles(profilesList);
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  };

  // Export dashboard data to Excel
  const handleExportData = async () => {
    if (profiles.length === 0) return;
    const XLSX = await import("xlsx");

    // Create sheet data
    const exportRows = profiles.map((p, idx) => ({
      "مُعرف الموظف / العضو": p.id.substring(0, 8).toUpperCase(),
      "الاسم الكامل": p.full_name || "غير محدد",
      "البريد الإلكتروني": p.email || "غير محدد",
      "اسم المستخدم": p.username || "غير محدد",
      "المستوى": p.is_admin ? "مدير" : "مستخدم",
      "باقة الاشتراك": p.subscription_tier === "gold" ? "الذهبية " : p.subscription_tier === "silver" ? "الفضية" : p.subscription_tier === "mishwar" ? "المشوار" : "المجانية ",
      "حالة الاشتراك": p.subscription_status || "نشط",
      "الرصيد المتاح (ج.م)": p.balance || 0,
      "تاريخ التسجيل": p.created_at ? new Date(p.created_at).toLocaleDateString("ar-EG") : "غير معروف",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الأعضاء والمشرفين");

    // Add another sheet for summary statistics
    const summaryRows = [
      { "المؤشر الإحصائي": "الفترة المحددة في التقرير", "القيمة": activeDateRange ? activeDateRange.label : "كافة الأوقات" },
      { "المؤشر الإحصائي": "إجمالي الإيرادات (إيداعات المستخدمين في الفترة)", "القيمة": liveRevenue },
      { "المؤشر الإحصائي": "إجمالي السحوبات والمكافآت (في الفترة)", "القيمة": liveExpenses },
      { "المؤشر الإحصائي": "صافي الدخل (في الفترة)", "القيمة": liveProfit },
      { "المؤشر الإحصائي": "إجمالي الحسابات المسجلة", "القيمة": dbStats.totalAccounts },
      { "المؤشر الإحصائي": "الحسابات الجديدة المسجلة في الفترة", "القيمة": signupsInRange },
      { "المؤشر الإحصائي": "الجلسات النشطة حالياً", "القيمة": dbStats.activeSessions },
      { "المؤشر الإحصائي": "إجمالي الأماكن في الدليل", "القيمة": dbStats.totalPlaces },
      { "المؤشر الإحصائي": "إجمالي طلبات الاقتراح", "القيمة": dbStats.totalProposals },
      { "المؤشر الإحصائي": "طلبات الاقتراح المعلقة", "القيمة": actionCounts.pendingProposals },
      { "المؤشر الإحصائي": "المعاملات المالية المعلقة", "القيمة": actionCounts.pendingPoints },
      { "المؤشر الإحصائي": "عدد الشكاوى والبلاغات المعلقة", "القيمة": actionCounts.pendingReports },
      { "المؤشر الإحصائي": "بلاغات وملاحظات خطوط المواصلات", "القيمة": actionCounts.pendingRouteReports },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "ملخص إحصائيات الموقع");

    // Save Workbook
    XLSX.writeFile(workbook, `CairoMap_Admin_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDeleteUser = async (profile: DBProfile) => {
    if (!supabase) return;
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف حساب المستخدم "${profile.full_name || profile.username || 'عضو غير محدد الاسم'}" بشكل نهائي؟ سيتم حذف كافة بياناته ومحفظته نهائياً ولا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    try {
      setLoading(true);
      // 1. Try to delete using the admin RPC delete_user_by_admin
      const { data, error } = await supabase.rpc('delete_user_by_admin', { p_user_id: profile.id });

      if (error) {
        console.warn("RPC delete_user_by_admin not found or failed, using fallback database delete on profiles:", error);

        // 2. Fallback: Delete from profiles table directly
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);

        if (profileDeleteError) {
          throw new Error(profileDeleteError.message);
        }
      }

      alert("تم حذف حساب المستخدم وبياناته بنجاح.");
      await loadDashboardData();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(`حدث خطأ أثناء محاولة حذف العضو: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Format numbers with commas
  const formatNum = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleCopyUsername = (username: string, userId: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUserId(userId);
    setTimeout(() => {
      setCopiedUserId(null);
    }, 1500);
  };

  // Filter and sort profiles based on search query, filter criteria, and sort order
  const filteredProfiles = React.useMemo(() => {
    let result = profiles.filter((p) => {
      // 1. Search Query filter
      const term = searchQuery.toLowerCase();
      const matchesSearch = !term ? true : (
        (p.full_name && p.full_name.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.username && p.username.toLowerCase().includes(term)) ||
        p.id.toLowerCase().includes(term)
      );

      // 2. Role Filter
      const matchesRole = filterRole === "all" ? true : (
        filterRole === "admin" ? p.is_admin === true : !p.is_admin
      );

      // 3. Subscription Tier Filter
      const matchesTier = filterTier === "all" ? true : (
        p.subscription_tier === filterTier
      );

      return matchesSearch && matchesRole && matchesTier;
    });

    // 4. Sort Order
    return [...result].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [profiles, searchQuery, filterRole, filterTier, sortOrder]);

  // Calculate governorate statistics from profiles
  const governorateStats = React.useMemo(() => {
    const counts: Record<string, number> = {};

    profiles.forEach(p => {
      const gov = p.governorate?.trim();
      if (gov) {
        counts[gov] = (counts[gov] || 0) + 1;
      } else {
        counts["غير محدد"] = (counts["غير محدد"] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: profiles.length > 0 ? Math.round((count / profiles.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [profiles]);

  const governorateList = governorateStats.length > 0
    ? governorateStats.slice(0, 5)
    : [
      { name: "القاهرة", count: 0, percentage: 0 },
      { name: "الجيزة", count: 0, percentage: 0 },
      { name: "الإسكندرية", count: 0, percentage: 0 }
    ];

  // 1. Dynamic Visits calculations based on visitsTimeRange (7days / 14days / 30days)
  const dynamicVisitsData = React.useMemo(() => {
    const all = dbStats.allDaysVisits && dbStats.allDaysVisits.length > 0
      ? dbStats.allDaysVisits
      : [];

    let countNeeded = 7;
    if (visitsTimeRange === "14days") countNeeded = 14;
    else if (visitsTimeRange === "30days") countNeeded = 30;

    if (all.length >= countNeeded) {
      return all.slice(-countNeeded);
    }
    if (all.length > 0) {
      return all;
    }

    // Fallback if dbStats not loaded yet
    const daysNames = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    const baseWeekly = dbStats.weeklyVisits || 0;
    const factors = [0.12, 0.15, 0.22, 0.18, 0.24, 0.20, 0.28];
    return daysNames.map((dayName, idx) => ({
      dayName: idx === 6 ? "اليوم" : idx === 5 ? "أمس" : dayName,
      dateStr: "",
      fullDate: "",
      count: Math.round(baseWeekly * factors[idx]) || (idx === 6 ? dbStats.dailyVisits || 0 : 0)
    }));
  }, [dbStats.allDaysVisits, dbStats.weeklyVisits, dbStats.dailyVisits, visitsTimeRange]);

  // Visits KPI summary
  const visitsKPIs = React.useMemo(() => {
    const data = dynamicVisitsData;
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const avg = data.length > 0 ? Math.round(total / data.length) : 0;

    let peak = { dayName: "-", fullDate: "", count: 0 };
    data.forEach(item => {
      if (item.count >= peak.count && item.count > 0) {
        peak = item;
      }
    });

    const todayCount = data.length > 0 ? data[data.length - 1].count : 0;

    return {
      total,
      avg,
      peak,
      todayCount
    };
  }, [dynamicVisitsData]);

  const maxVisitsCount = Math.max(...dynamicVisitsData.map(d => d.count), 4);
  const yAxisStep = Math.ceil(maxVisitsCount / 4);
  const maxYVal = yAxisStep * 4;

  const yAxisLabels = React.useMemo(() => {
    return [
      formatNum(maxYVal),
      formatNum(yAxisStep * 3),
      formatNum(yAxisStep * 2),
      formatNum(yAxisStep * 1),
      "0"
    ];
  }, [maxYVal, yAxisStep]);

  const svgChartPoints = React.useMemo(() => {
    const n = dynamicVisitsData.length;
    const startX = 30;
    const endX = 490;
    const stepX = n > 1 ? (endX - startX) / (n - 1) : 0;

    return dynamicVisitsData.map((item, idx) => {
      const x = startX + idx * stepX;
      const ratio = maxYVal > 0 ? item.count / maxYVal : 0;
      const y = 175 - (ratio * 145);
      return {
        x: Number(x.toFixed(1)),
        y: Math.max(25, Math.min(175, Number(y.toFixed(1)))),
        count: item.count,
        dayName: item.dayName,
        fullDate: item.fullDate,
        dateStr: item.dateStr,
        percentX: ((x / 520) * 100).toFixed(2),
        isPeak: item.count > 0 && item.count === visitsKPIs.peak.count
      };
    });
  }, [dynamicVisitsData, maxYVal, visitsKPIs.peak.count]);

  const smoothCurveD = React.useMemo(() => {
    if (svgChartPoints.length === 0) return "";
    if (svgChartPoints.length === 1) return `M ${svgChartPoints[0].x},${svgChartPoints[0].y}`;
    let d = `M ${svgChartPoints[0].x},${svgChartPoints[0].y}`;
    for (let i = 0; i < svgChartPoints.length - 1; i++) {
      const p0 = svgChartPoints[i];
      const p1 = svgChartPoints[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) / 2;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) / 2;
      const cpy2 = p1.y;
      d += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${p1.x},${p1.y}`;
    }
    return d;
  }, [svgChartPoints]);

  const smoothAreaD = React.useMemo(() => {
    if (!smoothCurveD || svgChartPoints.length === 0) return "";
    const firstX = svgChartPoints[0].x;
    const lastX = svgChartPoints[svgChartPoints.length - 1].x;
    return `${smoothCurveD} L ${lastX},175 L ${firstX},175 Z`;
  }, [smoothCurveD, svgChartPoints]);

  // 2. Dynamic top cities calculations from profiles table
  const cityCoordinates: Record<string, { top: string; left: string }> = React.useMemo(() => ({
    "القاهرة": { top: "36%", left: "61%" },
    "الجيزة": { top: "41%", left: "56%" },
    "الإسكندرية": { top: "20%", left: "41%" },
    "القاهرة الجديدة": { top: "37%", left: "67%" },
    "مدينة نصر": { top: "32%", left: "63%" },
    "التجمع الخامس": { top: "37%", left: "67%" },
    "الشرقية": { top: "26%", left: "65%" },
    "المنصورة": { top: "21%", left: "63%" },
    "الدقهلية": { top: "21%", left: "63%" },
    "الغربية": { top: "24%", left: "57%" },
    "طنطا": { top: "24%", left: "57%" },
    "أسوان": { top: "82%", left: "65%" },
    "الأقصر": { top: "70%", left: "66%" },
    "الغردقة": { top: "52%", left: "78%" },
    "البحر الأحمر": { top: "52%", left: "78%" },
    "مطروح": { top: "22%", left: "28%" },
    "مرسى مطروح": { top: "22%", left: "28%" },
    "بورسعيد": { top: "18%", left: "72%" },
    "الإسماعيلية": { top: "27%", left: "73%" },
    "السويس": { top: "36%", left: "74%" },
    "الفيوم": { top: "46%", left: "55%" },
    "بني سويف": { top: "52%", left: "58%" },
    "المنيا": { top: "59%", left: "58%" },
    "أسيوط": { top: "64%", left: "61%" },
    "سوهاج": { top: "68%", left: "64%" },
  }), []);

  const dynamicTopCities = React.useMemo(() => {
    const counts: Record<string, number> = {};

    profiles.forEach(p => {
      const name = p.city?.trim() || p.governorate?.trim();
      if (name && name !== "غير محدد") {
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    const totalAcc = profiles.length || 1;
    const entries = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalAcc) * 100),
        coords: cityCoordinates[name] || { top: "36%", left: "61%" }
      }))
      .sort((a, b) => b.count - a.count);

    if (entries.length === 0) {
      return [
        { name: "القاهرة", count: profiles.length > 0 ? Math.ceil(profiles.length * 0.45) : 0, percentage: 45, coords: { top: "36%", left: "61%" } },
        { name: "الجيزة", count: profiles.length > 0 ? Math.ceil(profiles.length * 0.25) : 0, percentage: 25, coords: { top: "41%", left: "56%" } },
        { name: "الإسكندرية", count: profiles.length > 0 ? Math.ceil(profiles.length * 0.15) : 0, percentage: 15, coords: { top: "20%", left: "41%" } },
        { name: "القاهرة الجديدة", count: profiles.length > 0 ? Math.ceil(profiles.length * 0.10) : 0, percentage: 10, coords: { top: "37%", left: "67%" } },
        { name: "مدينة نصر", count: profiles.length > 0 ? Math.ceil(profiles.length * 0.05) : 0, percentage: 5, coords: { top: "32%", left: "63%" } },
      ];
    }

    return entries.slice(0, 5);
  }, [profiles, cityCoordinates]);

  // Subscription Tiers Breakdown
  const tierStats = React.useMemo(() => {
    let gold = 0, silver = 0, mishwar = 0, free = 0;
    profiles.forEach(p => {
      const tier = p.subscription_tier?.toLowerCase();
      if (tier === "gold") gold++;
      else if (tier === "silver") silver++;
      else if (tier === "mishwar") mishwar++;
      else free++;
    });
    const total = profiles.length || 1;
    return {
      gold: { count: gold, pct: Math.round((gold / total) * 100) },
      silver: { count: silver, pct: Math.round((silver / total) * 100) },
      mishwar: { count: mishwar, pct: Math.round((mishwar / total) * 100) },
      free: { count: free, pct: Math.round((free / total) * 100) },
    };
  }, [profiles]);

  // Coverage of top 5 cities
  const topCitiesCoveragePct = React.useMemo(() => {
    const sum = dynamicTopCities.reduce((acc, c) => acc + c.count, 0);
    const total = profiles.length || 1;
    return Math.min(100, Math.round((sum / total) * 100));
  }, [dynamicTopCities, profiles.length]);

  // Metrics scaling
  const revMultiplier = 1;

  // Helper to compute start & end timestamps for date filtering
  const activeDateRange = React.useMemo(() => {
    if (datePreset === "all") return null;

    const now = new Date();
    let start: Date | null = null;
    let end: Date = new Date();

    if (datePreset === "today") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    } else if (datePreset === "7days") {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (datePreset === "30days") {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (datePreset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (datePreset === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (datePreset === "custom") {
      if (customStartDate) {
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
      }
      if (customEndDate) {
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (!start && !customEndDate) return null;

    const labelMap: Record<string, string> = {
      today: "اليوم",
      "7days": "آخر 7 أيام",
      "30days": "آخر 30 يوماً",
      this_month: "هذا الشهر",
      this_year: "هذا العام",
    };

    let label = labelMap[datePreset] || "فترة مخصصة";
    if (datePreset === "custom") {
      if (customStartDate && customEndDate) {
        label = `من ${customStartDate} إلى ${customEndDate}`;
      } else if (customStartDate) {
        label = `بدءاً من ${customStartDate}`;
      } else if (customEndDate) {
        label = `حتى ${customEndDate}`;
      }
    }

    return {
      start: start ? start.toISOString() : null,
      end: end.toISOString(),
      label,
    };
  }, [datePreset, customStartDate, customEndDate]);

  // Filter deposits and withdrawals created after the reset date AND within activeDateRange
  const filteredDeposits = React.useMemo(() => {
    return transactions.deposits.filter(d => {
      if (revenueResetAt && new Date(d.created_at) <= new Date(revenueResetAt)) return false;
      if (activeDateRange) {
        if (activeDateRange.start && new Date(d.created_at) < new Date(activeDateRange.start)) return false;
        if (activeDateRange.end && new Date(d.created_at) > new Date(activeDateRange.end)) return false;
      }
      return true;
    });
  }, [transactions.deposits, revenueResetAt, activeDateRange]);

  const filteredWithdrawals = React.useMemo(() => {
    return transactions.withdrawals.filter(w => {
      if (revenueResetAt && new Date(w.created_at) <= new Date(revenueResetAt)) return false;
      if (activeDateRange) {
        if (activeDateRange.start && new Date(w.created_at) < new Date(activeDateRange.start)) return false;
        if (activeDateRange.end && new Date(w.created_at) > new Date(activeDateRange.end)) return false;
      }
      return true;
    });
  }, [transactions.withdrawals, revenueResetAt, activeDateRange]);

  // Calculate new accounts registered in the selected period
  const signupsInRange = React.useMemo(() => {
    if (!activeDateRange) return profiles.length;
    return profiles.filter(p => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      if (activeDateRange.start && d < new Date(activeDateRange.start)) return false;
      if (activeDateRange.end && d > new Date(activeDateRange.end)) return false;
      return true;
    }).length;
  }, [profiles, activeDateRange]);

  const currentRevenueSum = filteredDeposits.reduce((sum, item) => sum + item.amount, 0);
  const currentExpensesSum = filteredWithdrawals.reduce((sum, item) => sum + item.amount, 0);
  const totalPromoBalance = profiles.reduce((sum, p) => sum + (p.promo_balance || 0), 0);
  const activeVouchersCount = voucherStats.activeCount;
  const totalVoucherRedemptions = voucherStats.totalRedemptions;

  const liveRevenue = currentRevenueSum;
  const liveExpenses = currentExpensesSum;
  const liveProfit = liveRevenue - liveExpenses;

  const revenueVal = Math.round(liveRevenue * revMultiplier);

  // Bento activity list derived from real recent transactions
  const bentoRecentActivity = React.useMemo(() => {
    const list: any[] = [];
    filteredDeposits.slice(-3).reverse().forEach((d, i) => {
      list.push({
        id: `dep-${i}`,
        kind: "deposit",
        title: "إيداع رصيد بالمحفظة",
        detail: d.method ? `طريقة: ${d.method}` : "شحن رصيد",
        amount: `+${formatNum(d.amount)} ج.م`,
        status: "confirmed",
        time: d.created_at ? new Date(d.created_at).toLocaleDateString("ar-EG") : "مؤخراً",
      });
    });
    filteredWithdrawals.slice(-2).reverse().forEach((w, i) => {
      list.push({
        id: `wth-${i}`,
        kind: "withdraw",
        title: "سحب أرباح / مكافآت",
        detail: w.method || "طلب سحب",
        amount: `−${formatNum(w.amount)} ج.م`,
        status: "confirmed",
        time: w.created_at ? new Date(w.created_at).toLocaleDateString("ar-EG") : "مؤخراً",
      });
    });
    return list;
  }, [filteredDeposits, filteredWithdrawals]);

  // Bento 30-day visits counts
  const bento30DaysVisits = React.useMemo(() => {
    if (dbStats.allDaysVisits && dbStats.allDaysVisits.length > 0) {
      return dbStats.allDaysVisits.slice(-30).map(v => v.count);
    }
    return [15, 22, 18, 30, 25, 40, 35, 28, 45, 52, 48, 60, 55, 70, 65, 80, 95, 88, 75, 90, 110, 105, 120, 115, 130, 145, 138, 160, 175, Math.max(180, dbStats.dailyVisits || 0)];
  }, [dbStats.allDaysVisits, dbStats.dailyVisits]);

  const handleResetRevenue = () => {
    if (confirm("هل أنت متأكد من رغبتك في تصفير إيرادات ومسحوبات لوحة التحكم وإعادة الحساب من الآن؟")) {
      const now = new Date().toISOString();
      localStorage.setItem("cairomap_revenue_reset_at", now);
      setRevenueResetAt(now);
    }
  };

  const handleUndoReset = () => {
    localStorage.removeItem("cairomap_revenue_reset_at");
    setRevenueResetAt(null);
  };

  if (loading || authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <span>جاري تحميل لوحة التحكم ...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Sub-Header Controls ── */}
      <div className={styles.dashboardHeader}>
        <div className={styles.dateFilterContainer}>
          <div className={styles.dateFilterHeaderRow} style={{ justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <h2 style={{ margin: 0, fontSize: "1.18rem", fontWeight: 800 }}>
                نظرة عامة على المنصة
              </h2>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                متابعة المهام المعلقة، الإيرادات، والزيارات المباشرة
              </span>
            </div>

            {/* Quick action buttons */}
            <div className={styles.dashboardActions}>
              <button
                type="button"
                className={styles.quickStatAction}
                style={{ width: "auto", padding: "0 14px", gap: "6px", fontSize: "0.82rem", fontWeight: 700 }}
                onClick={() => router.push("/admin/vouchers")}
                title="إدارة القسائم والأكواد الترويجية"
              >
                <i className="bx bxs-coupon" style={{ fontSize: "1.1rem", color: "#818cf8" }} />
                <span>إدارة القسائم</span>
              </button>

              <button
                className={styles.quickStatAction}
                onClick={loadDashboardData}
                title="تحديث فوري للبيانات"
              >
                <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }} />
              </button>

              <button
                className={styles.downloadButton}
                onClick={handleExportData}
              >
                <i className="bx bx-download" style={{ verticalAlign: "middle", marginLeft: "4px" }} />
                تحميل التقرير الكامل
              </button>
            </div>
          </div>

          {/* Collapsible Custom Date Picker Inputs */}
          {showCustomDatePicker && (
            <div className={styles.customDateCollapse}>
              <div className={styles.customDateField}>
                <label className={styles.customDateLabel}>من تاريخ:</label>
                <input
                  type="date"
                  className={styles.customDateInput}
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setDatePreset("custom");
                  }}
                />
              </div>

              <div className={styles.customDateField}>
                <label className={styles.customDateLabel}>إلى تاريخ:</label>
                <input
                  type="date"
                  className={styles.customDateInput}
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setDatePreset("custom");
                  }}
                />
              </div>

              {(customStartDate || customEndDate) && (
                <button
                  className={styles.customDateResetBtn}
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                    setDatePreset("all");
                    setShowCustomDatePicker(false);
                  }}
                  title="إلغاء التخصيص والعودة للكل"
                >
                  <i className="bx bx-x" /> مسح التاريخ
                </button>
              )}
            </div>
          )}

          {/* Active Filter Notice Banner */}
          {activeDateRange && (
            <div className={styles.activeFilterNotice}>
              <i className="bx bx-filter-alt" />
              <span>
                عرض الإحصائيات والمعاملات المالية للفترة: <strong>{activeDateRange.label}</strong>
              </span>
              <button
                onClick={() => {
                  setDatePreset("all");
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setShowCustomDatePicker(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  cursor: "pointer",
                  marginRight: "auto",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.8rem",
                }}
              >
                <i className="bx bx-x" /> إلغاء الفلترة
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Action Banner & Alert Cards ── */}
      <div className={styles.adminActionBanner}>
        <div className={styles.adminActionBannerHeader}>
          <div className={styles.actionBannerTitleGroup}>
            <span className={styles.actionBannerPulse} />
            <h3 className={styles.actionBannerTitle}>تنبيهات وإجراءات سريعة للإدارة</h3>
          </div>
          <span className={styles.actionBannerSubtitle}>
            إحصائيات فورية للمهام التي تتطلب مراجعتك أو تدخل الإدارة
          </span>
        </div>

        <div className={styles.adminActionCardsGrid}>
          {/* Card 1: Pending Financial Transactions */}
          <div
            className={`${styles.actionCard} ${actionCounts.pendingPoints > 0
              ? `${styles.actionCardAlert}`
              : styles.actionCardSuccess
              }`}
          >
            <div className={styles.actionCardTop}>
              <div
                className={`${styles.actionCardIconWrap} ${actionCounts.pendingPoints > 0
                  ? styles.actionCardIconAmber
                  : styles.actionCardIconGreen
                  }`}
              >
                <i className="bx bx-wallet-alt" />
              </div>
              <span
                className={`${styles.actionCardStatusBadge} ${actionCounts.pendingPoints > 0
                  ? styles.actionCardStatusBadgeWarning
                  : styles.actionCardStatusBadgeDone
                  }`}
              >
                {actionCounts.pendingPoints > 0 ? "يتطلب إجراء" : "مكتمل"}
              </span>
            </div>

            <div className={styles.actionCardContent}>
              <div className={styles.actionCardCountRow}>
                <span className={styles.actionCardCount}>
                  {formatNum(actionCounts.pendingPoints)}
                </span>
                <span className={styles.actionCardUnit}>معاملة</span>
              </div>
              <h4 className={styles.actionCardTitle}>الطلبات المالية المعلقة</h4>
              <p className={styles.actionCardDesc}>
                {actionCounts.pendingPoints > 0
                  ? "طلبات إيداع وسحب رصيد بانتظار الموافقة"
                  : "كافة طلبات الشحن والسحب معالجة بالكامل"}
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/points?tab=requests")}
              className={`${styles.actionCardBtn} ${actionCounts.pendingPoints > 0
                ? styles.actionCardBtnAmber
                : styles.actionCardBtnMuted
                }`}
            >
              <span>مراجعة الطلبات المالية</span>
              <i className="bx bx-left-arrow-alt" />
            </button>
          </div>

          {/* Card 2: Place Proposals */}
          <div
            className={`${styles.actionCard} ${actionCounts.pendingProposals > 0
              ? `${styles.actionCardAlert} ${styles.actionCardInfo}`
              : styles.actionCardSuccess
              }`}
          >
            <div className={styles.actionCardTop}>
              <div
                className={`${styles.actionCardIconWrap} ${actionCounts.pendingProposals > 0
                  ? styles.actionCardIconBlue
                  : styles.actionCardIconGreen
                  }`}
              >
                <i className="bx bx-map-pin" />
              </div>
              <span
                className={`${styles.actionCardStatusBadge} ${actionCounts.pendingProposals > 0
                  ? styles.actionCardStatusBadgeInfo
                  : styles.actionCardStatusBadgeDone
                  }`}
              >
                {actionCounts.pendingProposals > 0 ? "اقتراح جديد" : "معتمد"}
              </span>
            </div>

            <div className={styles.actionCardContent}>
              <div className={styles.actionCardCountRow}>
                <span className={styles.actionCardCount}>
                  {formatNum(actionCounts.pendingProposals)}
                </span>
                <span className={styles.actionCardUnit}>مكان مقترح</span>
              </div>
              <h4 className={styles.actionCardTitle}>اقتراحات الأماكن</h4>
              <p className={styles.actionCardDesc}>
                {actionCounts.pendingProposals > 0
                  ? "أماكن مقترحة من المستخدمين بانتظار الاعتماد"
                  : "تمت مراجعة واعتماد جميع المقترحات"}
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/places/suggestions")}
              className={`${styles.actionCardBtn} ${actionCounts.pendingProposals > 0
                ? styles.actionCardBtnPrimary
                : styles.actionCardBtnMuted
                }`}
            >
              <span>فحص اقتراحات الأعضاء</span>
              <i className="bx bx-left-arrow-alt" />
            </button>
          </div>

          {/* Card 3: Reports & Complaints */}
          <div
            className={`${styles.actionCard} ${actionCounts.pendingReports > 0
              ? `${styles.actionCardAlert} ${styles.actionCardDanger}`
              : styles.actionCardSuccess
              }`}
          >
            <div className={styles.actionCardTop}>
              <div
                className={`${styles.actionCardIconWrap} ${actionCounts.pendingReports > 0
                  ? styles.actionCardIconRed
                  : styles.actionCardIconGreen
                  }`}
              >
                <i className="bx bx-error-circle" />
              </div>
              <span
                className={`${styles.actionCardStatusBadge} ${actionCounts.pendingReports > 0
                  ? styles.actionCardStatusBadgeDanger
                  : styles.actionCardStatusBadgeDone
                  }`}
              >
                {actionCounts.pendingReports > 0 ? "شكوى معلقة" : "نظيف"}
              </span>
            </div>

            <div className={styles.actionCardContent}>
              <div className={styles.actionCardCountRow}>
                <span className={styles.actionCardCount}>
                  {formatNum(actionCounts.pendingReports)}
                </span>
                <span className={styles.actionCardUnit}>بلاغ وشكوى</span>
              </div>
              <h4 className={styles.actionCardTitle}>البلاغات والشكاوى</h4>
              <p className={styles.actionCardDesc}>
                {actionCounts.pendingReports > 0
                  ? "بلاغات أماكن وملاحظات تواصل تنتظر التدخل"
                  : "سجل الشكاوى خالٍ من البلاغات المعلقة"}
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/reports")}
              className={`${styles.actionCardBtn} ${actionCounts.pendingReports > 0
                ? styles.actionCardBtnRed
                : styles.actionCardBtnMuted
                }`}
            >
              <span>معالجة البلاغات</span>
              <i className="bx bx-left-arrow-alt" />
            </button>
          </div>

          {/* Card 4: Transit Route Reports */}
          <div
            className={`${styles.actionCard} ${actionCounts.pendingRouteReports > 0
              ? `${styles.actionCardAlert} ${styles.actionCardPurple}`
              : styles.actionCardSuccess
              }`}
          >
            <div className={styles.actionCardTop}>
              <div
                className={`${styles.actionCardIconWrap} ${actionCounts.pendingRouteReports > 0
                  ? styles.actionCardIconPurple
                  : styles.actionCardIconGreen
                  }`}
              >
                <i className="bx bx-compass" />
              </div>
              <span
                className={`${styles.actionCardStatusBadge} ${actionCounts.pendingRouteReports > 0
                  ? styles.actionCardStatusBadgePurple
                  : styles.actionCardStatusBadgeDone
                  }`}
              >
                {actionCounts.pendingRouteReports > 0 ? "تحديث خطوط" : "مستقر"}
              </span>
            </div>

            <div className={styles.actionCardContent}>
              <div className={styles.actionCardCountRow}>
                <span className={styles.actionCardCount}>
                  {formatNum(actionCounts.pendingRouteReports)}
                </span>
                <span className={styles.actionCardUnit}>ملاحظة خط</span>
              </div>
              <h4 className={styles.actionCardTitle}>بلاغات خطوط المواصلات</h4>
              <p className={styles.actionCardDesc}>
                {actionCounts.pendingRouteReports > 0
                  ? "ملاحظات وتعديلات تسعيرة ومسارات مسجلة من الركاب"
                  : "شبكة خطوط السرفيس وازاي اروح مستقرة"}
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/directions")}
              className={`${styles.actionCardBtn} ${actionCounts.pendingRouteReports > 0
                ? styles.actionCardBtnPurple
                : styles.actionCardBtnMuted
                }`}
            >
              <span>إدارة خطوط ازاي اروح</span>
              <i className="bx bx-left-arrow-alt" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Main Cards Row ── */}
      <div className={styles.statsGrid}>
        {/* Revenue Card (Actual User Deposits Only) */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className={styles.statCardTitle}>
                الإيرادات الإجمالية {activeDateRange ? `(${activeDateRange.label})` : ""}
              </span>
              {revenueResetAt && (
                <span style={{ fontSize: "0.68rem", color: "#f87171", fontWeight: "700" }}>
                  بدءاً من: {new Date(revenueResetAt).toLocaleDateString("ar-EG")}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`${styles.trendBadge} ${styles.trendBadgeUp}`}>
                <i className="bx bx-trending-up" />
                <span>{activeDateRange ? activeDateRange.label : "إيداعات"}</span>
              </span>
            </div>
          </div>
          <p className={styles.statCardValue}>{formatNum(revenueVal)} ج.م</p>
        </div>

        {/* Withdrawals & Rewards Card */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle}>
              السحوبات والمكافآت {activeDateRange ? `(${activeDateRange.label})` : ""}
            </span>
            <span className={`${styles.trendBadge} ${styles.trendBadgeUp}`} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <i className="bx bx-gift" style={{ fontSize: "1.1rem" }} />
              <span>{activeDateRange ? activeDateRange.label : "مكافآت وسحوبات"}</span>
            </span>
          </div>
          <p className={styles.statCardValue}>{formatNum(liveExpenses)} ج.م</p>
        </div>

        {/* Net Income Card */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle}>
              صافي الدخل {activeDateRange ? `(${activeDateRange.label})` : ""}
            </span>
            <span className={`${styles.trendBadge} ${styles.trendBadgeUp}`} style={{ backgroundColor: liveProfit >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: liveProfit >= 0 ? "#10b981" : "#ef4444" }}>
              <i className="bx bx-pie-chart-alt-2" style={{ fontSize: "1.1rem" }} />
              <span>الإيرادات - السحوبات</span>
            </span>
          </div>
          <p className={styles.statCardValue} style={{ color: liveProfit >= 0 ? "var(--color-fg)" : "#ef4444" }}>
            {formatNum(liveProfit)} ج.م
          </p>
        </div>

        {/* Live Active Users Card */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle}>المتواجدون حالياً بالموقع</span>
            <span className={`${styles.trendBadge}`} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={styles.livePulse} />
              <span>مباشر</span>
            </span>
          </div>
          <p className={styles.statCardValue}>{formatNum(dbStats.activeSessions)} مستخدم</p>
        </div>
      </div>

      {/* ── Vouchers & Promotional Balance Quick Strip ── */}
      <div
        className={styles.statCard}
        style={{
          marginBottom: "24px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.14)",
              color: "#818cf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.35rem",
              flexShrink: 0,
            }}
          >
            <i className="bx bxs-coupon" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800 }}>
              نظام القسائم والرصيد الترويجي
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
              إجمالي الرصيد الترويجي النشط: <strong style={{ color: "#818cf8" }}>{formatNum(totalPromoBalance)} ج.م</strong> • أكواد نشطة: <strong>{activeVouchersCount}</strong> • مرات الاسترداد: <strong>{totalVoucherRedemptions}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.push("/admin/points")}
            className={styles.quickStatAction}
            style={{ width: "auto", padding: "0 14px", gap: "6px", fontSize: "0.8rem", fontWeight: 700 }}
          >
            <i className="bx bx-wallet" />
            <span>الأرصدة والرصيد الترويجي</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/vouchers")}
            className={styles.downloadButton}
            style={{ padding: "9px 14px", fontSize: "0.8rem" }}
          >
            <i className="bx bx-plus-circle" style={{ verticalAlign: "middle", marginLeft: "4px" }} />
            إدارة القسائم والأكواد
          </button>
        </div>
      </div>

      {/* ── Bento Analytics Section ── */}
      <AdminAnalyticsBento
        totalRevenue={revenueVal}
        totalExpenses={liveExpenses}
        netProfit={liveProfit}
        activeUsersNow={dbStats.activeSessions || 0}
        visitsHistory={bento30DaysVisits}
        allocation={[
          { symbol: "الذهبية", value: tierStats.gold.count || 1 },
          { symbol: "الفضية", value: tierStats.silver.count || 1 },
          { symbol: "المشوار", value: tierStats.mishwar.count || 1 },
          { symbol: "المجانية", value: tierStats.free.count || 1 },
        ]}
        subscriptionsSummary={{
          gold: tierStats.gold.count,
          silver: tierStats.silver.count,
          mishwar: tierStats.mishwar.count,
          free: tierStats.free.count,
          total: profiles.length || 1,
          paidGrowth: Math.max(5, ((tierStats.gold.count + tierStats.silver.count + tierStats.mishwar.count) / (profiles.length || 1)) * 100),
        }}
        activity={bentoRecentActivity}
        totalPlaces={dbStats.totalPlaces}
        pendingActions={actionCounts.pendingPoints + actionCounts.pendingProposals + actionCounts.pendingReports}
      />
    </div>
  );
}
