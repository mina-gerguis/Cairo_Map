"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

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
  
  const [transactions, setTransactions] = useState<{
    deposits: { amount: number; created_at: string }[];
    withdrawals: { amount: number; created_at: string }[];
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
  });

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

      // 4. Fetch proposals count
      const { count: proposalsCount } = await supabase
        .from("place_proposals")
        .select("id", { count: "exact", head: true });

      // 5. Fetch pending reports & feedback
      const [reportsRes, feedbackRes] = await Promise.all([
        supabase.from("place_reports").select("id", { count: "exact", head: true }),
        supabase.from("app_feedback").select("id", { count: "exact", head: true })
      ]);
      const totalReports = (reportsRes.count || 0) + (feedbackRes.count || 0);

      // 6. Fetch balance transactions (Deposits & Withdrawals)
      const { data: deposits } = await supabase
        .from("balance_transactions")
        .select("amount, created_at")
        .eq("type", "deposit")
        .eq("status", "approved");

      const { data: withdrawals } = await supabase
        .from("balance_transactions")
        .select("amount, created_at")
        .eq("type", "withdrawal")
        .eq("status", "approved");

      if (deposits && withdrawals) {
        setTransactions({
          deposits: deposits.map(d => ({ amount: Number(d.amount), created_at: d.created_at })),
          withdrawals: withdrawals.map(w => ({ amount: Number(w.amount), created_at: w.created_at }))
        });
      }

      const totalRevenue = deposits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = withdrawals?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

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
  const handleExportData = () => {
    if (profiles.length === 0) return;
    
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
      { "المؤشر الإحصائي": "إجمالي الحسابات المسجلة", "القيمة": dbStats.totalAccounts },
      { "المؤشر الإحصائي": "الجلسات النشطة حالياً", "القيمة": dbStats.activeSessions },
      { "المؤشر الإحصائي": "إجمالي الأماكن في الدليل", "القيمة": dbStats.totalPlaces },
      { "المؤشر الإحصائي": "إجمالي طلبات الاقتراح", "القيمة": dbStats.totalProposals },
      { "المؤشر الإحصائي": "عدد الشكاوى والبلاغات", "القيمة": dbStats.totalReports },
      { "المؤشر الإحصائي": "إجمالي شحنات المحفظة (ج.م)", "القيمة": dbStats.totalRevenue },
      { "المؤشر الإحصائي": "إجمالي مسحوبات المحفظة (ج.م)", "القيمة": dbStats.totalExpenses },
      { "المؤشر الإحصائي": "صافي أرباح المحفظة المعلقة (ج.م)", "القيمة": dbStats.totalRevenue - dbStats.totalExpenses },
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

  if (loading || authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <span>جاري تحميل لوحة التحكم ...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  // Metrics scaling
  const revMultiplier = 1;

  // Filter deposits and withdrawals created after the reset date
  const filteredDeposits = transactions.deposits.filter(d => {
    if (!revenueResetAt) return true;
    return new Date(d.created_at) > new Date(revenueResetAt);
  });

  const filteredWithdrawals = transactions.withdrawals.filter(w => {
    if (!revenueResetAt) return true;
    return new Date(w.created_at) > new Date(revenueResetAt);
  });

  const currentRevenueSum = filteredDeposits.reduce((sum, item) => sum + item.amount, 0);
  const currentExpensesSum = filteredWithdrawals.reduce((sum, item) => sum + item.amount, 0);

  // Live financial metrics from the database (incorporating the reset offset)
  const liveRevenue = currentRevenueSum; 
  const liveExpenses = currentExpensesSum;
  const liveProfit = liveRevenue - liveExpenses;

  // Scale statistics
  const revenueVal = Math.round(liveRevenue * revMultiplier);

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

  // Actual logins grouped by month from dbStats
  const monthlyCounts = dbStats.monthlyVisits || Array(12).fill(0);
  const maxMonthlyCount = Math.max(...monthlyCounts, 1);
  const scaledBarHeights = monthlyCounts.map(count => {
    if (count === 0) return 4; // minimum height
    return Math.round((count / maxMonthlyCount) * 50) + 5;
  });



  return (
    <div className={styles.dashboardWrapper}>
      {/* ── Sub-Header Controls ── */}
      <div className={styles.dashboardHeader}>


        {/* Action triggers */}
        <div className={styles.dashboardActions}>
          <button 
            className={styles.quickStatAction}
            onClick={loadDashboardData}
            title="تحديث فوري للبيانات"
          >
            <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }} />
          </button>

          <select 
            className={styles.monthlySelect}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="weekly">أسبوعياً</option>
            <option value="monthly">شهرياً</option>
            <option value="yearly">سنوياً</option>
          </select>

          <button 
            className={styles.downloadButton}
            onClick={handleExportData}
          >
            تحميل التقرير الكامل
          </button>
        </div>
      </div>

      {/* ── 4 Main Cards Row ── */}
      <div className={styles.statsGrid}>
        {/* Revenue Card */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className={styles.statCardTitle}>الإيرادات الإجمالية</span>
              {revenueResetAt && (
                <span style={{ fontSize: "0.68rem", color: "#f87171", fontWeight: "700" }}>
                  بدءاً من: {new Date(revenueResetAt).toLocaleDateString("ar-EG")}
                </span>
              )}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {revenueResetAt ? (
                <button 
                  onClick={handleUndoReset}
                  className={styles.resetStatsBtn}
                  title="إلغاء التصفير وعرض إجمالي الإيداعات"
                >
                  <i className="bx bx-undo" />
                </button>
              ) : (
                <button 
                  onClick={handleResetRevenue}
                  className={styles.resetStatsBtn}
                  title="تصفير الإيرادات وإعادة العد من الآن"
                >
                  <i className="bx bx-rotate-left" />
                </button>
              )}

              <span className={`${styles.trendBadge} ${styles.trendBadgeUp}`}>
                <i className="bx bx-trending-up" />
                <span>3.2%</span>
              </span>
            </div>
          </div>
          <h2 className={styles.statCardValue}>{formatNum(revenueVal)} ج.م</h2>
        </div>

        {/* Accounts Card */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle}>الحسابات المسجلة</span>
            <span className={`${styles.trendBadge} ${styles.trendBadgeUp}`} style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#818cf8" }}>
              <i className="bx bx-user" style={{ fontSize: "1.1rem" }} />
              <span>نشط</span>
            </span>
          </div>
          <h2 className={styles.statCardValue}>{formatNum(dbStats.totalAccounts)} حساب</h2>
        </div>

        {/* Actual Visits Card */}
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle}>عدد الزيارات الفعلي</span>
            <span className={`${styles.trendBadge} ${styles.trendBadgeUp}`} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <i className="bx bx-line-chart" style={{ fontSize: "1.1rem" }} />
              <span>زيارات نشطة</span>
            </span>
          </div>
          <h2 className={styles.statCardValue}>{formatNum(dbStats.totalSessions)} زيارة</h2>
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
          <h2 className={styles.statCardValue}>{formatNum(dbStats.activeSessions)} مستخدم</h2>
        </div>
      </div>

      {/* ── Middle Widgets Section (Charts) ── */}
      <div className={styles.chartsGrid}>
        {/* Website Visits Widget */}
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div className={styles.chartTitleGroup}>
              <h3 className={styles.chartCardTitle}>مؤشرات زيارات الموقع</h3>
              <div className={styles.chartStatsGroup}>
                <div className={styles.chartStatItem}>
                  <div className={styles.chartStatValue}>
                    <span>{formatNum(dbStats.weeklyVisits)}</span>
                    <span style={{ color: "#10b981", fontSize: "0.72rem", display: "flex", alignItems: "center" }}>
                      <i className="bx bx-trending-up" /> 3.3%
                    </span>
                  </div>
                  <span className={styles.chartStatLabel}>زيارات أسبوعية</span>
                </div>
                <div className={styles.chartStatItem}>
                  <div className={styles.chartStatValue}>
                    <span>{formatNum(dbStats.dailyVisits)}</span>
                    <span style={{ color: "#10b981", fontSize: "0.72rem", display: "flex", alignItems: "center" }}>
                      <i className="bx bx-trending-up" /> 3.3%
                    </span>
                  </div>
                  <span className={styles.chartStatLabel}>زيارات يومية</span>
                </div>
                <div className={styles.chartStatItem}>
                  <div className={styles.chartStatValue}>
                    <span>{dbStats.avgBrowsingTime} دقيقة</span>
                    <span style={{ color: "#10b981", fontSize: "0.72rem", display: "flex", alignItems: "center" }}>
                      <i className="bx bx-trending-up" /> 1.2%
                    </span>
                  </div>
                  <span className={styles.chartStatLabel}>متوسط وقت التصفح</span>
                </div>
              </div>
            </div>

            <select className={styles.chartFilterSelect} defaultValue="14days">
              <option value="7days">آخر 7 أيام</option>
              <option value="14days">آخر أسبوعين</option>
              <option value="30days">آخر شهر</option>
            </select>
          </div>

          <div className={styles.chartBody}>
            {/* Horizontal Bar Chart Visuals matching the mockup layout */}
            <div className={styles.chartWithAxis}>
              <div className={styles.chartYAxis}>
                <span className={styles.chartYLabel}>60</span>
                <span className={styles.chartYLabel}>40</span>
                <span className={styles.chartYLabel}>20</span>
                <span className={styles.chartYLabel}>0</span>
              </div>
              <div className={styles.customBarChart}>
                {scaledBarHeights.map((h, idx) => (
                  <div key={idx} className={styles.barColumn}>
                    <div 
                      className={styles.barFill} 
                      style={{ height: `${h * 2.5}px` }}
                    >
                      <span className={styles.barTooltip}>
                        {formatNum(monthlyCounts[idx])} زيارة
                      </span>
                    </div>
                    <span className={styles.barLabel}>{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div className={styles.chartTitleGroup}>
              <h3 className={styles.chartCardTitle}>توزيع المستخدمين حسب المحافظة</h3>
              <div className={styles.chartStatsGroup}>
                <div className={styles.chartStatItem}>
                  <span className={styles.chartStatValue} style={{ fontSize: "1.5rem" }}>
                    {formatNum(profiles.filter(p => p.governorate).length)}
                  </span>
                  <span className={styles.chartStatLabel}>مستخدمين حددوا محافظتهم</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartBody} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
            {governorateList.map((gov, idx) => {
              const colors = [
                "linear-gradient(270deg, #3b82f6, #60a5fa)", // Blue
                "linear-gradient(270deg, #10b981, #34d399)", // Green
                "linear-gradient(270deg, #fbbf24, #fcd34d)", // Amber
                "linear-gradient(270deg, #8b5cf6, #a78bfa)", // Purple
                "linear-gradient(270deg, #ef4444, #f87171)"  // Red
              ];
              const barColor = colors[idx % colors.length];
              
              return (
                <div key={gov.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.88rem" }}>
                    <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{gov.name}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                      {gov.count} مستخدم ({gov.percentage}%)
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <div style={{
                      width: `${gov.percentage}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: "6px",
                      transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── All Employees Section (Registered Accounts Table) ── */}
      <div className={styles.tableCard}>
        {/* Table title header */}
        <div className={styles.employeesSectionHeader} style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className={styles.tableTitleGroup}>
            <h3 className={styles.sectionHeaderTitle} style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>جميع الأعضاء المسجلين</h3>
            <span className={styles.sectionHeaderBadge} style={{ marginLeft: '12px' }}>{profiles.length}</span>
          </div>
        </div>

        {/* Table actions toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.tableToolbarLeft}>
            <button 
              className={styles.toolbarBtn} 
              onClick={() => {
                setShowFilters(!showFilters);
                setShowColumnSelector(false);
              }}
              style={showFilters ? { background: "var(--accent-primary, #3b82f6)", color: "#fff" } : {}}
            >
              <i className="bx bx-filter-alt" />
              <span>تصفية</span>
            </button>
            <button 
              className={styles.toolbarBtn} 
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              style={{ display: "flex", gap: "6px", alignItems: "center" }}
            >
              <i className="bx bx-sort-alt-2" />
              <span>{sortOrder === "newest" ? "ترتيب حسب الأحدث" : "ترتيب حسب الأقدم"}</span>
            </button>
            <button 
              className={styles.toolbarBtn} 
              onClick={() => {
                setShowColumnSelector(!showColumnSelector);
                setShowFilters(false);
              }}
              style={showColumnSelector ? { background: "var(--accent-primary, #3b82f6)", color: "#fff" } : {}}
            >
              <i className="bx bx-columns" />
              <span>الأعمدة</span>
            </button>
          </div>

          {/* Search bar input */}
          <div className={styles.tableSearchWrapper}>
            <input 
              type="text" 
              className={styles.tableSearchInput}
              placeholder="البحث بالاسم أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className={`bx bx-search ${styles.tableSearchIcon}`} />
          </div>
        </div>

        {/* ── Filter Dropdown Panel ── */}
        {showFilters && (
          <div style={{
            display: "flex",
            gap: "20px",
            padding: "16px 24px",
            background: "var(--bg-secondary, rgba(255, 255, 255, 0.04))",
            borderBottom: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
            alignItems: "center",
            flexWrap: "wrap",
            direction: "rtl"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>المستوى (نوع الحساب):</span>
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value as any)}
                style={{
                  background: "var(--bg-primary, #0e1322)",
                  border: "1px solid var(--border-color, rgba(255, 255, 255, 0.1))",
                  color: "var(--text-primary, #f8fafc)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                <option value="all">الكل</option>
                <option value="admin">المديرين فقط</option>
                <option value="user">المستخدمين فقط</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>باقة الاشتراك:</span>
              <select 
                value={filterTier} 
                onChange={(e) => setFilterTier(e.target.value)}
                style={{
                  background: "var(--bg-primary, #0e1322)",
                  border: "1px solid var(--border-color, rgba(255, 255, 255, 0.1))",
                  color: "var(--text-primary, #f8fafc)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                <option value="all">الكل</option>
                <option value="free">المجانية</option>
                <option value="silver">الفضية</option>
                <option value="gold">الذهبية</option>
                <option value="mishwar">المشوار</option>
              </select>
            </div>

            <button 
              onClick={() => {
                setFilterRole("all");
                setFilterTier("all");
                setSearchQuery("");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--border-color, rgba(255, 255, 255, 0.15))",
                color: "var(--text-primary, #f8fafc)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontFamily: "var(--font-heading)",
                cursor: "pointer",
                marginRight: "auto"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}

        {/* ── Columns Visibility Selection Panel ── */}
        {showColumnSelector && (
          <div style={{
            display: "flex",
            gap: "16px",
            padding: "16px 24px",
            background: "var(--bg-secondary, rgba(255, 255, 255, 0.04))",
            borderBottom: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
            alignItems: "center",
            flexWrap: "wrap",
            direction: "rtl"
          }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold", marginLeft: "10px" }}>إظهار/إخفاء الأعمدة:</span>
            
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={visibleColumns.username} 
                onChange={(e) => setVisibleColumns({ ...visibleColumns, username: e.target.checked })}
                style={{ cursor: "pointer" }}
              />
              اسم المستخدم
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={visibleColumns.memberInfo} 
                onChange={(e) => setVisibleColumns({ ...visibleColumns, memberInfo: e.target.checked })}
                style={{ cursor: "pointer" }}
              />
              العضو (الاسم)
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={visibleColumns.email} 
                onChange={(e) => setVisibleColumns({ ...visibleColumns, email: e.target.checked })}
                style={{ cursor: "pointer" }}
              />
              البريد الإلكتروني
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={visibleColumns.subscription} 
                onChange={(e) => setVisibleColumns({ ...visibleColumns, subscription: e.target.checked })}
                style={{ cursor: "pointer" }}
              />
              باقة الاشتراك
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={visibleColumns.joiningDate} 
                onChange={(e) => setVisibleColumns({ ...visibleColumns, joiningDate: e.target.checked })}
                style={{ cursor: "pointer" }}
              />
              تاريخ الانضمام
            </label>
          </div>
        )}

        {/* Table data body */}
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead className={styles.adminThead}>
              <tr className={styles.adminTr}>
                {visibleColumns.username && <th className={styles.adminTh}>اسم المستخدم</th>}
                {visibleColumns.memberInfo && <th className={styles.adminTh}>العضو</th>}
                {visibleColumns.email && <th className={styles.adminTh}>البريد الإلكتروني</th>}
                {visibleColumns.subscription && <th className={styles.adminTh}>باقة الاشتراك</th>}
                {visibleColumns.joiningDate && <th className={styles.adminTh}>تاريخ الانضمام</th>}
                <th className={styles.adminTh}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((p) => {
                  const memberName = p.full_name || p.username || "أحد المشرفين";
                  const memberEmail = p.email || "بلا بريد مسجل";
                  const memberAvatar = p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(memberName)}`;

                  return (
                    <tr key={p.id} className={styles.adminTr}>
                      {/* Username */}
                      {visibleColumns.username && (
                        <td className={styles.adminTd}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span 
                              style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}
                              onClick={() => {
                                if (p.username) {
                                  handleCopyUsername(p.username, p.id);
                                }
                              }}
                              title="اضغط لنسخ اسم المستخدم"
                            >
                              {p.username ? `@${p.username}` : "غير محدد"}
                            </span>
                            {p.username && (
                              <button
                                onClick={() => handleCopyUsername(p.username!, p.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: copiedUserId === p.id ? "#10b981" : "var(--text-muted)",
                                  cursor: "pointer",
                                  padding: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "4px",
                                  transition: "all 0.2s"
                                }}
                                title={copiedUserId === p.id ? "تم النسخ!" : "نسخ اسم المستخدم"}
                              >
                                <i className={`bx ${copiedUserId === p.id ? "bx-check-circle" : "bx-copy"}`} style={{ fontSize: "0.95rem" }} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Member Info */}
                      {visibleColumns.memberInfo && (
                        <td className={styles.adminTd}>
                          <div className={styles.memberCell}>
                            <img src={memberAvatar} alt={memberName} className={styles.memberAvatar} />
                            <div className={styles.memberNameGroup}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className={styles.memberName}>{memberName}</span>
                                {p.is_admin && (
                                  <span style={{
                                    fontSize: "0.68rem",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    background: "rgba(59, 130, 246, 0.12)",
                                    color: "#3b82f6",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                    fontWeight: "bold"
                                  }}>مدير</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Email */}
                      {visibleColumns.email && (
                        <td className={styles.adminTd} style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
                          {p.email || "بلا بريد مسجل"}
                        </td>
                      )}

                      {/* Subscription Tier */}
                      {visibleColumns.subscription && (
                        <td className={styles.adminTd}>
                          <span className={styles.typeBadge}>
                            {p.subscription_tier === "gold" ? "الذهبية " : p.subscription_tier === "silver" ? "الفضية" : p.subscription_tier === "mishwar" ? "المشوار" : "المجانية "}
                          </span>
                        </td>
                      )}

                      {/* Joining Date */}
                      {visibleColumns.joiningDate && (
                        <td className={styles.adminTd} style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("ar-EG") : "غير معروف"}
                        </td>
                      )}

                      {/* Action trigger buttons */}
                      <td className={styles.adminTd}>
                        <div className={styles.actionIcons}>
                          <button 
                            className={`${styles.actionBtn} ${styles.actionBtnView}`} 
                            title="مشاهدة الملف"
                            onClick={() => setSelectedProfileForView(p)}
                          >
                            <i className="bx bx-show" />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`} 
                            title="تعديل الرصيد"
                            onClick={() => router.push(`/admin/points?user=${p.id}`)}
                          >
                            <i className="bx bx-edit-alt" />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`} 
                            title="حذف الحساب"
                            onClick={() => handleDeleteUser(p)}
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className={styles.adminTr}>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className={styles.adminTd} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    لا توجد حسابات مسجلة تطابق بحثك.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfileForView && (
        <div 
          className="admin-modal-overlay"
          onClick={() => setSelectedProfileForView(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(10, 10, 15, 0.8)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            direction: "rtl",
            animation: "fadeIn 0.3s ease"
          }}
        >
          <div 
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(22, 22, 34, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
              borderRadius: "28px",
              width: "100%",
              maxWidth: "540px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
              animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProfileForView(null)}
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#fff";
              }}
            >
              <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
            </button>

            {/* Profile Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "20px" }}>
              <img 
                src={selectedProfileForView.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedProfileForView.full_name || selectedProfileForView.username || 'عضو')}`} 
                alt="Avatar" 
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  border: "2px solid var(--accent-primary, #3b82f6)",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)"
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800", color: "#fff" }}>
                  {selectedProfileForView.full_name || "عضو غير محدد الاسم"}
                </h3>
                <span style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.5)", fontFamily: "monospace" }}>
                  @{selectedProfileForView.username || "username"}
                </span>
                <span 
                  style={{
                    alignSelf: "flex-start",
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    marginTop: "4px",
                    background: selectedProfileForView.is_admin ? "rgba(59, 130, 246, 0.12)" : "rgba(255, 255, 255, 0.05)",
                    color: selectedProfileForView.is_admin ? "#3b82f6" : "rgba(255, 255, 255, 0.7)",
                    border: selectedProfileForView.is_admin ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  {selectedProfileForView.is_admin ? "مدير" : "مستخدِم"}
                </span>
              </div>
            </div>

            {/* Profile Grid Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>البريد الإلكتروني</span>
                <span style={{ fontSize: "0.95rem", color: "#fff", wordBreak: "break-all" }}>{selectedProfileForView.email || "بلا بريد"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>رقم الهاتف</span>
                <span style={{ fontSize: "0.95rem", color: "#fff" }} dir="ltr">{selectedProfileForView.phone || "بلا هاتف"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>تاريخ التسجيل</span>
                <span style={{ fontSize: "0.95rem", color: "#fff" }}>
                  {selectedProfileForView.created_at ? new Date(selectedProfileForView.created_at).toLocaleDateString("ar-EG", { dateStyle: "long" }) : "غير معروف"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>البلد والمنطقة</span>
                <span style={{ fontSize: "0.95rem", color: "#fff" }}>
                  {selectedProfileForView.city || selectedProfileForView.governorate ? `${selectedProfileForView.city || ''}، ${selectedProfileForView.governorate || ''}` : "غير محدد"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>الرصيد الأساسي</span>
                <span style={{ fontSize: "1.1rem", color: "#10b981", fontWeight: "bold" }}>{selectedProfileForView.balance || 0} ج.م</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>الرصيد الترويجي</span>
                <span style={{ fontSize: "1.1rem", color: "#fbbf24", fontWeight: "bold" }}>{selectedProfileForView.promo_balance || 0} ج.م</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>إجمالي النقاط</span>
                <span style={{ fontSize: "1.1rem", color: "#3b82f6", fontWeight: "bold" }}>{selectedProfileForView.points || 0} نقطة</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>باقة الاشتراك</span>
                <span style={{ fontSize: "0.95rem", color: "#fff", fontWeight: "600" }}>
                  {selectedProfileForView.subscription_tier === "gold" ? "الذهبية " : selectedProfileForView.subscription_tier === "silver" ? "الفضية" : selectedProfileForView.subscription_tier === "mishwar" ? "المشوار" : "المجانية "}
                </span>
              </div>
            </div>

            {/* Interests Section */}
            {selectedProfileForView.interests && selectedProfileForView.interests.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>الاهتمامات</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedProfileForView.interests.map((intId) => {
                    const interestLabel = intId === "restaurants" ? "مطاعم" : intId === "drinks" ? "مشروبات" : intId === "family" ? "عائلية" : intId === "kids" ? "أطفال" : intId === "hotels_aqua" ? "فنادق واكوا" : intId === "activities" ? "ترفيه" : intId === "offers" ? "عروض" : intId === "cinema" ? "سينما" : intId === "medical" ? "طبية" : intId === "health_beauty" ? "صحة وجمال" : intId === "parks" ? "حدائق" : intId === "work" ? "عمل" : intId === "courses_study" ? "كورسات ودراسة" : intId === "quiet_places" ? "أماكن هادئة" : intId;
                    return (
                      <span 
                        key={intId} 
                        style={{
                          fontSize: "0.78rem",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "rgba(255, 255, 255, 0.8)"
                        }}
                      >
                        {interestLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "20px" }}>
              <button
                onClick={() => {
                  router.push(`/admin/points?user=${selectedProfileForView.id}`);
                  setSelectedProfileForView(null);
                }}
                className="ios-btn ios-btn-primary"
                style={{
                  flex: 2,
                  padding: "12px",
                  justifyContent: "center",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  background: "var(--accent-primary, #3b82f6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)"
                }}
              >
                <i className="bx bx-edit-alt" /> تعديل الرصيد والشحن
              </button>
              <button
                onClick={() => {
                  handleDeleteUser(selectedProfileForView);
                  setSelectedProfileForView(null);
                }}
                className="ios-btn"
                style={{
                  flex: 1,
                  padding: "12px",
                  justifyContent: "center",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                }}
              >
                <i className="bx bx-trash" /> حذف الحساب
              </button>
              <button
                onClick={() => setSelectedProfileForView(null)}
                className="ios-btn"
                style={{
                  padding: "12px 24px",
                  justifyContent: "center",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
              >
                إغلاق
              </button>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}

