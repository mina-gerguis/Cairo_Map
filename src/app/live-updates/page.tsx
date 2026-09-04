"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TrafficReport {
  id: string;
  location: string;
  type: "metro" | "road" | "microbus" | "lrt";
  status: "clear" | "moderate" | "heavy" | "stopped";
  title: string;
  description: string;
  timeAgo: string;
  upvotes: number;
}

const initialReports: TrafficReport[] = [
  {
    id: "1",
    location: "محطة مترو الشهداء (الخط الأول والثاني)",
    type: "metro",
    status: "heavy",
    title: "زدحام شديد برصيف الخط الأول متجه للحلمية",
    description: "تكدس كبير للمواطنين على الرصيف بسبب تأخر قطار لمدة 10 دقائق.",
    timeAgo: "منذ 8 دقائق",
    upvotes: 24,
  },
  {
    id: "2",
    location: "طريق الطريق الدائري - وصلة المريوطية",
    type: "road",
    status: "moderate",
    title: "بطء حركة السير اتجاه التجمع",
    description: "حركة المرور متوسطة بسبب أعمال الصيانة على جانب الطريق.",
    timeAgo: "منذ 15 دقيقة",
    upvotes: 12,
  },
  {
    id: "3",
    location: "محطة عدلي منصور التبادلية (LRT والخط الثالث)",
    type: "lrt",
    status: "clear",
    title: "السيولة المرورية ممتازة في صالة التبديل",
    description: "القطار الكهربائي يغادر في موعده تماماً والمحطة هادئة.",
    timeAgo: "منذ 25 دقيقة",
    upvotes: 18,
  },
  {
    id: "4",
    location: "موقف سيرفيس رمسيس (أحمد حلمي)",
    type: "microbus",
    status: "moderate",
    title: "إقبال كبير على سيارات أكتوبر والشيخ زايد",
    description: "وجود صف انتظار متوسط لسيارات أكتوبر والسيارات تتوافد بانتظام.",
    timeAgo: "منذ 35 دقيقة",
    upvotes: 9,
  },
  {
    id: "5",
    location: "محور 26 يوليو - اتجاه ميدان لبنان",
    type: "road",
    status: "heavy",
    title: "تكدس مروري أعلى المحور",
    description: "ازدحام مروري مرتفع بمنتصف المحور للسيارات القادمة من الشيخ زايد.",
    timeAgo: "منذ 40 دقيقة",
    upvotes: 31,
  },
];

export default function LiveUpdatesPage() {
  const [reports, setReports] = useState<TrafficReport[]>(initialReports);
  const [activeFilter, setActiveFilter] = useState<"all" | "metro" | "road" | "microbus" | "lrt">("all");
  const [showModal, setShowModal] = useState(false);

  // New report form state
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState<"metro" | "road" | "microbus" | "lrt">("metro");
  const [newStatus, setNewStatus] = useState<"clear" | "moderate" | "heavy" | "stopped">("moderate");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const filteredReports = reports.filter((r) => activeFilter === "all" || r.type === activeFilter);

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation || !newTitle) return;

    const created: TrafficReport = {
      id: Date.now().toString(),
      location: newLocation,
      type: newType,
      status: newStatus,
      title: newTitle,
      description: newDescription || "تم التحديث بواسطة أحد الركاب الآن.",
      timeAgo: "الآن",
      upvotes: 1,
    };

    setReports([created, ...reports]);
    setShowModal(false);
    setNewLocation("");
    setNewTitle("");
    setNewDescription("");
  };

  const getStatusBadge = (status: TrafficReport["status"]) => {
    switch (status) {
      case "clear":
        return { label: "طريق سالك 🟢", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
      case "moderate":
        return { label: "زحام متوسط 🟡", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
      case "heavy":
        return { label: "ازدحام شديد 🔴", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
      case "stopped":
        return { label: "توقف تام 🛑", color: "#dc2626", bg: "rgba(220, 38, 38, 0.25)" };
    }
  };

  return (
    <div style={{ padding: "30px 16px 80px 16px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Top Banner Header */}
      <div className="glass-panel" style={{ padding: "28px", borderRadius: "24px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99, 102, 241, 0.15)", padding: "4px 12px", borderRadius: "12px", color: "#818cf8", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px" }}>
              <span className="pulse-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              تحديث حي ومباشر (Live)
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
              🚦 حالة الطريق والمواصلات الآن
            </h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", marginTop: "6px", margin: 0 }}>
              تابع البلاغات المرورية المباشرة وازدحام محطات المترو والطرق الرئيسية من تجارب الركاب والسائقين لحظة بلحظة.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ padding: "12px 22px", borderRadius: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <i className="bx bx-plus-circle" style={{ fontSize: "1.3rem" }}></i>
            إضافة بلاغ مروري
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px" }}>
        {[
          { id: "all", label: "الكل 🌐" },
          { id: "metro", label: "أنفاق المترو 🚇" },
          { id: "road", label: "الطرق والدائري 🚗" },
          { id: "microbus", label: "المواقف والسيرفيس 🚐" },
          { id: "lrt", label: "القطارات والـ LRT 🚆" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            style={{
              padding: "8px 18px",
              borderRadius: "14px",
              border: activeFilter === tab.id ? "1px solid #6366f1" : "1px solid var(--borderGlass)",
              background: activeFilter === tab.id ? "rgba(99, 102, 241, 0.2)" : "var(--bgGlass)",
              color: activeFilter === tab.id ? "#818cf8" : "var(--textSecondary)",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filteredReports.map((report) => {
          const badge = getStatusBadge(report.status);
          return (
            <div
              key={report.id}
              className="glass-panel"
              style={{
                padding: "20px",
                borderRadius: "20px",
                borderRight: `5px solid ${badge.color}`,
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>
                    📍 {report.location} • {report.timeAgo}
                  </span>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
                    {report.title}
                  </h3>
                </div>

                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "800",
                    background: badge.bg,
                    color: badge.color,
                    whiteSpace: "nowrap"
                  }}
                >
                  {badge.label}
                </span>
              </div>

              <p style={{ fontSize: "0.92rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.5" }}>
                {report.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px dashed var(--borderGlass)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  تم التأكيد بواسطة الركاب
                </span>

                <button
                  onClick={() => handleUpvote(report.id)}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "10px",
                    padding: "4px 12px",
                    color: "var(--textPrimary)",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  👍 تؤيد هذا البلاغ؟ ({report.upvotes})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Report Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "28px", borderRadius: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>إضافة بلاغ جديد للحالة والمرور 📢</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleAddReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>الموقع / المحطة / الطريق</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محطة مترو العتبة أو طريق الدائري"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", color: "var(--textPrimary)", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>وسيلة النقل</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", color: "var(--textPrimary)" }}
                  >
                    <option value="metro">مترو الأنفاق</option>
                    <option value="road">طريق/دائري</option>
                    <option value="microbus">موقف/سيرفيس</option>
                    <option value="lrt">قطار/LRT</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>حالة المرور</label>
                  <select
                    value={newStatus}
                    onChange={(e: any) => setNewStatus(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", color: "var(--textPrimary)" }}
                  >
                    <option value="clear">سالك 🟢</option>
                    <option value="moderate">زحام متوسط 🟡</option>
                    <option value="heavy">زحام شديد 🔴</option>
                    <option value="stopped">توقف تام 🛑</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>عنوان البلاغ المختصر</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تكدس في رصيف اتجاه العتبة"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", color: "var(--textPrimary)", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>التفاصيل (اختياري)</label>
                <textarea
                  rows={3}
                  placeholder="اكتب ملاحظات إضافية تساعد الركاب..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", color: "var(--textPrimary)", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1 }}>إلغاء</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: "700" }}>نشر البلاغ 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
