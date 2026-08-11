"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

interface AlertItem {
  id: string;
  title: string;
  content: string;
  type: "info" | "success" | "warning" | "danger";
  show_type: "first_time" | "every_time";
  target_page: string;
  expiry_date: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminAlertsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "danger">("info");
  const [showType, setShowType] = useState<"first_time" | "every_time">("first_time");
  const [targetPage, setTargetPage] = useState("all");
  const [customPage, setCustomPage] = useState("");
  const [isPermanent, setIsPermanent] = useState(true);
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.is_admin) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
          fetchAlerts();
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const fetchAlerts = async () => {
    if (!supabase) return;
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Table might not exist yet, don't crash, just log and set empty
        console.warn("Error fetching alerts (perhaps table does not exist yet):", error);
        setAlerts([]);
      } else {
        setAlerts(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return;
    setLoading(true);
    setStatus("");

    const pageValue = targetPage === "custom" ? customPage.trim() : targetPage;
    if (targetPage === "custom" && !customPage) {
      setStatus("خطأ: يرجى تحديد مسار الصفحة المخصصة");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title,
        content,
        type,
        show_type: showType,
        target_page: pageValue || "all",
        expiry_date: isPermanent ? null : expiryDate ? new Date(expiryDate).toISOString() : null,
        image_url: imageUrl || null,
        is_active: true,
      };

      const { error } = await supabase.from("site_alerts").insert([payload]);

      if (error) throw error;
      
      setStatus("تم إضافة تنبيه الموقع بنجاح!");
      setTitle("");
      setContent("");
      setType("info");
      setShowType("first_time");
      setTargetPage("all");
      setCustomPage("");
      setIsPermanent(true);
      setExpiryDate("");
      setImageUrl("");
      fetchAlerts();
    } catch (err: any) {
      setStatus(`خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!supabase || !isAdmin || !confirm("هل أنت متأكد من رغبتك في حذف هذا التنبيه؟")) return;
    try {
      const { error } = await supabase.from("site_alerts").delete().eq("id", id);
      if (error) throw error;
      setStatus("تم حذف التنبيه بنجاح");
      fetchAlerts();
    } catch (err: any) {
      setStatus(`خطأ أثناء الحذف: ${err.message}`);
    }
  };

  const toggleAlertActive = async (id: string, currentStatus: boolean) => {
    if (!supabase || !isAdmin) return;
    try {
      const { error } = await supabase
        .from("site_alerts")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setStatus("تم تعديل حالة التنبيه بنجاح");
      fetchAlerts();
    } catch (err: any) {
      setStatus(`خطأ أثناء التعديل: ${err.message}`);
    }
  };

  if (authLoading || authChecking) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid var(--border-glass)", borderTop: "3px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
        <p style={{ color: "var(--text-secondary)" }}>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "50px", marginTop: "100px", maxWidth: "400px", margin: "100px auto" }}>
        <div style={{ width: "80px", height: "80px", background: "rgba(255, 59, 48, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <i className="bx bxs-error-circle" style={{ fontSize: "3rem", color: "#ff3b30" }}></i>
        </div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-primary)" }}>صلاحيات غير كافية</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: "1.6" }}>
          عفواً، حسابك لا يمتلك صلاحيات المسؤول للوصول إلى هذه الصفحة.
        </p>
        <Link href="/" className="ios-btn ios-btn-primary" style={{ padding: "14px 24px" }}>
          <i className="bx bx-home" style={{ fontSize: "1.2rem", marginLeft: "8px" }}></i> العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "30px" }}>
        
        {/* نموذج إضافة تنبيه */}
        <div className={styles.tableCard} style={{ marginBottom: "20px" }}>
          <div className={styles.tableHeaderBar}>
            <div className={styles.tableTitleGroup}>
              <div className={styles.tableIcon} style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc" }}>
                <i className="bx bx-plus-circle" />
              </div>
              <div>
                <h1 className={styles.tableTitle} style={{ fontSize: "1.3rem" }}>إضافة تنبيه للموقع</h1>
                <p className={styles.tableSubtitle}>إنشاء إشعار منبثق يظهر للمستخدمين عند تصفح الموقع.</p>
              </div>
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            {status && (
              <div style={{
                padding: "14px 18px",
                marginBottom: "24px",
                borderRadius: "12px",
                background: status.includes("خطأ") ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                color: status.includes("خطأ") ? "#f87171" : "#4ade80",
                border: `1px solid ${status.includes("خطأ") ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "700"
              }}>
                <i className={`bx ${status.includes("خطأ") ? "bx-error-circle" : "bx-check-circle"}`} style={{ fontSize: "1.3rem" }} />
                {status}
              </div>
            )}

            <form onSubmit={handleCreateAlert} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>عنوان التنبيه</label>
                <input
                  type="text"
                  className="ios-input"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: تحديث الصيانة القادم أو عرض خاص"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>محتوى التنبيه</label>
                <textarea
                  className="ios-input"
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="اكتب تفاصيل التنبيه التي ستظهر للمستخدم..."
                  style={{ minHeight: "100px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>نوع التنبيه (التصميم)</label>
                  <select className="ios-input" value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="info">🔵 تنبيه عادي (Info)</option>
                    <option value="success">🟢 إشعار نجاح / إيجابي (Success)</option>
                    <option value="warning">🟡 تحذير (Warning)</option>
                    <option value="danger">🔴 تنبيه هام / خطر (Danger)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>معدل الظهور</label>
                  <select className="ios-input" value={showType} onChange={e => setShowType(e.target.value as any)}>
                    <option value="first_time">👤 أول مرة يدخل فيها الموقع فقط</option>
                    <option value="every_time">🔄 كل مرة يزور فيها الموقع</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>الصفحة المستهدفة</label>
                  <select className="ios-input" value={targetPage} onChange={e => setTargetPage(e.target.value)}>
                    <option value="all">🌐 كل صفحات الموقع</option>
                    <option value="/">🏠 الصفحة الرئيسية</option>
                    <option value="/directory">📞 دليل الهواتف</option>
                    <option value="/directions">🚌 خطوط المواصلات</option>
                    <option value="/about">ℹ️ صفحة من نحن</option>
                    <option value="custom">✏️ صفحة مخصصة (أدخل المسار)</option>
                  </select>
                </div>
                {targetPage === "custom" && (
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>مسار الصفحة المخصصة</label>
                    <input
                      type="text"
                      className="ios-input"
                      required
                      value={customPage}
                      onChange={e => setCustomPage(e.target.value)}
                      placeholder="مثال: /favorites أو /profile"
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>رابط صورة مخصصة (اختياري - يظهر بدلاً من الأيقونة)</label>
                <input
                  type="text"
                  className="ios-input"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="مثال: https://example.com/image.png"
                />
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem", color: "#e2e8f0" }}>
                  <input
                    type="checkbox"
                    checked={isPermanent}
                    onChange={e => setIsPermanent(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#6366f1" }}
                  />
                  تنبيه دائم (ليس له تاريخ انتهاء)
                </label>
              </div>

              {!isPermanent && (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.88rem", color: "#94a3b8" }}>تاريخ ووقت الانتهاء</label>
                  <input
                    type="datetime-local"
                    className="ios-input"
                    required
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="ios-btn ios-btn-primary"
                style={{
                  marginTop: "10px",
                  justifyContent: "center",
                  background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                }}
              >
                <i className="bx bx-plus-circle" style={{ fontSize: "1.3rem" }} />
                {loading ? "جاري الإضافة..." : "حفظ ونشر التنبيه"}
              </button>
            </form>
          </div>
        </div>

        {/* قائمة التنبيهات المنشورة */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderBar}>
            <div className={styles.tableTitleGroup}>
              <div className={styles.tableIcon} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                <i className="bx bx-list-ul" />
              </div>
              <div>
                <h2 className={styles.tableTitle} style={{ fontSize: "1.3rem" }}>التنبيهات الحالية</h2>
                <p className={styles.tableSubtitle}>إدارة وتفعيل التنبيهات المضافة مسبقاً.</p>
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            {fetchLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ width: "30px", height: "30px", border: "3px solid var(--border-glass)", borderTop: "3px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 10px" }}></div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>جاري تحميل التنبيهات...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                <i className="bx bx-info-circle" style={{ fontSize: "2.5rem", marginBottom: "10px", color: "rgba(255,255,255,0.15)" }}></i>
                <p>لا توجد تنبيهات مضافة حالياً في قاعدة البيانات.</p>
              </div>
            ) : (
              <table className={styles.adminTable}>
                <thead className={styles.adminThead}>
                  <tr>
                    <th className={styles.adminTh}>التنبيه</th>
                    <th className={styles.adminTh}>الصفحة</th>
                    <th className={styles.adminTh}>الظهور</th>
                    <th className={styles.adminTh}>الصلاحية</th>
                    <th className={styles.adminTh}>الحالة</th>
                    <th className={styles.adminTh}>العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => {
                    const isExpired = alert.expiry_date ? new Date(alert.expiry_date) < new Date() : false;
                    
                    let badgeClass = styles.badgePrimary;
                    let typeText = "عادي";
                    if (alert.type === "success") {
                      badgeClass = styles.badgeSuccess;
                      typeText = "نجاح";
                    } else if (alert.type === "warning") {
                      badgeClass = styles.badgeWarning;
                      typeText = "تحذير";
                    } else if (alert.type === "danger") {
                      badgeClass = styles.badgeDanger;
                      typeText = "خطر";
                    }

                    return (
                      <tr key={alert.id} className={styles.adminTr}>
                        <td className={styles.adminTd}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            {alert.image_url && (
                              <img
                                src={alert.image_url}
                                alt="Alert icon"
                                style={{ width: "24px", height: "24px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                              />
                            )}
                            <div style={{ fontWeight: "700" }}>{alert.title}</div>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {alert.content}
                          </div>
                        </td>
                        <td className={styles.adminTd}>
                          <span style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px" }}>
                            {alert.target_page === "all" ? "كل الصفحات" : alert.target_page}
                          </span>
                        </td>
                        <td className={styles.adminTd}>
                          <span style={{ fontSize: "0.85rem" }}>
                            {alert.show_type === "first_time" ? "أول مرة" : "كل زيارة"}
                          </span>
                        </td>
                        <td className={styles.adminTd}>
                          {!alert.expiry_date ? (
                            <span style={{ color: "#a5b4fc", fontSize: "0.85rem" }}>♾️ دائم</span>
                          ) : (
                            <div style={{ fontSize: "0.8rem", color: isExpired ? "#f87171" : "#e2e8f0" }}>
                              {alert.expiry_date ? new Date(alert.expiry_date).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) : "دائم"}
                              {isExpired && <span style={{ display: "block", color: "#f87171", fontSize: "0.7rem", fontWeight: "700" }}>منتهي</span>}
                            </div>
                          )}
                        </td>
                        <td className={styles.adminTd}>
                          <button
                            onClick={() => toggleAlertActive(alert.id, alert.is_active)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "15px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              border: "none",
                              cursor: "pointer",
                              background: alert.is_active && !isExpired ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.1)",
                              color: alert.is_active && !isExpired ? "#4ade80" : "#94a3b8",
                            }}
                          >
                            {alert.is_active && !isExpired ? "نشط" : "معطل"}
                          </button>
                        </td>
                        <td className={styles.adminTd}>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#f87171",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}
                            title="حذف التنبيه"
                          >
                            <i className="bx bx-trash" style={{ fontSize: "1.1rem" }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-lg-width: 1024px) {
          .admin-grid-layout {
            grid-template-columns: 1fr 1.2fr !important;
          }
        }
      `}</style>
    </div>
  );
}
