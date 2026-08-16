"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

interface PlaceReport {
  id: string;
  place_id: string;
  user_id: string;
  problem_type: string;
  details: any;
  comment: string | null;
  image_url: string | null;
  status: string;
  admin_reply: string | null;
  created_at: string;
  place_name?: string;
  user_profile?: {
    full_name?: string;
    email?: string;
    phone?: string;
    username?: string;
  } | null;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [reports, setReports] = useState<PlaceReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // App Suggestions & Bugs State
  const [activeReportTab, setActiveReportTab] = useState<"places" | "app" | "contacts" | "microbus">("places");
  const [appFeedbacks, setAppFeedbacks] = useState<any[]>([]);
  const [loadingAppFeedbacks, setLoadingAppFeedbacks] = useState(true);
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [appTypeFilter, setAppTypeFilter] = useState<"all" | "suggestion" | "bug">("all");
  const [solvedCount, setSolvedCount] = useState<number>(0);

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactStatusFilter, setContactStatusFilter] = useState<string>("all");

  // Microbus Reports State
  const [microbusReports, setMicrobusReports] = useState<any[]>([]);
  const [loadingMicrobus, setLoadingMicrobus] = useState(true);

  // Admin Reply Inputs
  const [replyText, setReplyText] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCount = localStorage.getItem("dftry_solved_bugs_count");
      if (storedCount) {
        setSolvedCount(parseInt(storedCount, 10));
      }
    }
  }, []);

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
          fetchReports();
          fetchAppFeedbacks();
          fetchContactMessages();
          fetchMicrobusReports();
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const fetchReports = async () => {
    if (!supabase) return;
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from("place_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Resolve user profiles
        const userIds = Array.from(new Set(data.map(r => r.user_id).filter(Boolean)));
        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, username")
            .in("id", userIds);
          if (profilesData) {
            profilesMap = new Map(profilesData.map(p => [p.id, p]));
          }
        }

        // Resolve place names
        const placeIds = Array.from(new Set(data.map(r => r.place_id).filter(Boolean)));
        let placesMap = new Map();
        if (placeIds.length > 0) {
          const { data: placesData } = await supabase
            .from("places")
            .select("id, name")
            .in("id", placeIds);
          if (placesData) {
            placesMap = new Map(placesData.map(p => [p.id, p.name]));
          }
        }

        const mapped: PlaceReport[] = data.map(item => ({
          ...item,
          place_name: placesMap.get(item.place_id) || "مكان محذوف أو غير معروف",
          user_profile: profilesMap.get(item.user_id) || null
        }));

        setReports(mapped);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchAppFeedbacks = async () => {
    if (!supabase) return;
    setLoadingAppFeedbacks(true);
    try {
      const { data, error } = await supabase
        .from("app_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Resolve user profiles
        const userIds = Array.from(new Set(data.map(r => r.user_id).filter(Boolean)));
        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, username")
            .in("id", userIds);
          if (profilesData) {
            profilesMap = new Map(profilesData.map(p => [p.id, p]));
          }
        }

        const mapped = data.map(item => ({
          ...item,
          user_profile: profilesMap.get(item.user_id) || null
        }));
        setAppFeedbacks(mapped);
      } else {
        setAppFeedbacks([]);
      }
    } catch (err) {
      console.error("Failed to fetch app feedbacks:", err);
    } finally {
      setLoadingAppFeedbacks(false);
    }
  };

  const fetchContactMessages = async () => {
    if (!supabase) return;
    setLoadingContacts(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContactMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch contact messages:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSendContactReply = async (contactMsg: any) => {
    if (!supabase || !isAdmin) return;
    if (!replyText.trim()) {
      alert("الرجاء كتابة الرد أولاً.");
      return;
    }

    setUpdatingId(contactMsg.id);
    setActionStatus("");

    try {
      // 1. Update status in database
      const { error: updateError } = await supabase
        .from("contact_messages")
        .update({
          status: "replied",
          admin_reply: replyText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", contactMsg.id);

      if (updateError) throw updateError;

      // 2. Call SMTP Route Handler to send the email
      const emailResponse = await fetch("/api/contact/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: contactMsg.email,
          toName: `${contactMsg.first_name} ${contactMsg.last_name}`,
          originalMessage: contactMsg.message,
          replyText: replyText.trim(),
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailResult.error || "فشل إرسال الإيميل للمستخدم، ولكن تم حفظ الرد في قاعدة البيانات.");
      }

      setActionStatus("تم حفظ الرد وإرسال الإيميل للمستخدم بنجاح! 🎉");
      setReplyText("");
      fetchContactMessages();
    } catch (err: any) {
      console.error(err);
      setActionStatus(`خطأ: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteContactMessage = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة نهائياً؟")) return;
    if (!supabase || !isAdmin) return;

    setUpdatingId(id);
    setActionStatus("");
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setActionStatus("تم حذف الرسالة بنجاح.");
      fetchContactMessages();
      if (activeReportId === id) {
        setActiveReportId(null);
      }
    } catch (err: any) {
      setActionStatus(`خطأ: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchMicrobusReports = async () => {
    if (!supabase) return;
    setLoadingMicrobus(true);
    try {
      const { data, error } = await supabase
        .from("route_interactions")
        .select("*")
        .eq("interaction_type", "report")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Resolve user profiles
        const userIds = Array.from(new Set(data.map(r => r.user_id).filter(Boolean)));
        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, username")
            .in("id", userIds);
          if (profilesData) {
            profilesMap = new Map(profilesData.map(p => [p.id, p]));
          }
        }

        const mapped = data.map(item => ({
          ...item,
          user_profile: profilesMap.get(item.user_id) || null
        }));

        setMicrobusReports(mapped);
      } else {
        setMicrobusReports([]);
      }
    } catch (err) {
      console.error("Failed to fetch microbus reports:", err);
    } finally {
      setLoadingMicrobus(false);
    }
  };

  const handleDeleteMicrobusReport = async (reportId: string) => {
    if (!supabase) return;
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا البلاغ؟")) return;

    try {
      const { error } = await supabase
        .from("route_interactions")
        .delete()
        .eq("id", reportId);

      if (error) {
        alert("فشل حذف البلاغ.");
      } else {
        alert("تم حذف البلاغ بنجاح.");
        setMicrobusReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      console.error("Failed to delete microbus report:", err);
      alert("حدث خطأ غير متوقع.");
    }
  };

  const handleUpdateAppFeedbackStatus = async (feedback: any, newStatus: string) => {
    if (!supabase || !isAdmin) return;

    let deleteEntry = false;
    if (newStatus === "action_taken") {
      deleteEntry = confirm("لقد قمت باتخاذ إجراء لحل هذه المشكلة/الاقتراح. هل تريد حذف هذا الطلب نهائياً من القائمة لتنظيف الشاشة؟");
    }

    setUpdatingId(feedback.id);
    setActionStatus("");

    try {
      if (deleteEntry) {
        // First delete it from app_feedback so it vanishes
        const { error: deleteError } = await supabase
          .from("app_feedback")
          .delete()
          .eq("id", feedback.id);
        if (deleteError) throw deleteError;
      } else {
        // Update the feedback status as usual
        const { error: updateError } = await supabase
          .from("app_feedback")
          .update({
            status: newStatus,
            admin_reply: replyText.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", feedback.id);
        if (updateError) throw updateError;
      }

      // 2. Send notification to the user (so they still know action was taken)
      let notifTitle = "";
      let notifMessage = "";
      let typeLabel = feedback.type === "suggestion" ? "اقتراحك" : "بلاغك عن المشكلة";

      if (newStatus === "action_taken") {
        notifTitle = feedback.type === "suggestion" ? "💡 تم اعتماد وتطبيق اقتراحك!" : "✅ تم حل مشكلتك بنجاح!";
        notifMessage = feedback.type === "suggestion"
          ? `تم اتخاذ إجراء وتطبيق اقتراحك بنجاح. شكراً لمساهمتك! ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`
          : `تم اتخاذ إجراء وحل مشكلتك التي أبلغت عنها. ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;
      } else if (newStatus === "reviewed") {
        notifTitle = "🔎 تمت مراجعة طلبك";
        notifMessage = `تمت مراجعة ${typeLabel} بنجاح وهي قيد النظر والدراسة حالياً. ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;
      } else {
        notifTitle = "👀 طلبك قيد الانتظار";
        notifMessage = `تم وضع ${typeLabel} قيد الانتظار والدراسة من قبل الإدارة. ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;
      }

      const { error: notifError } = await supabase.from("notifications").insert([{
        user_id: feedback.user_id,
        title: notifTitle,
        message: notifMessage,
        type: newStatus === "action_taken" ? "success" : "info",
        link: `/profile`
      }]);

      if (notifError) console.error("Failed to send notification:", notifError);

      // Increment solved count if status is action_taken
      if (newStatus === "action_taken") {
        const nextCount = solvedCount + 1;
        setSolvedCount(nextCount);
        localStorage.setItem("dftry_solved_bugs_count", nextCount.toString());
      }

      setActionStatus(deleteEntry ? "تم اتخاذ الإجراء وحذف الطلب بنجاح!" : "تم تحديث حالة البلاغ وإشعار المستخدم بنجاح!");
      setReplyText("");
      fetchAppFeedbacks();
    } catch (err: any) {
      setActionStatus(`خطأ: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (report: PlaceReport, newStatus: string) => {
    if (!supabase || !isAdmin) return;
    setUpdatingId(report.id);
    setActionStatus("");

    try {
      // 1. Update the report in the database
      const { error: updateError } = await supabase
        .from("place_reports")
        .update({
          status: newStatus,
          admin_reply: replyText.trim() || null
        })
        .eq("id", report.id);

      if (updateError) throw updateError;

      // 2. Send notification to the user
      let statusTextArabic = "";
      if (newStatus === "reviewed") statusTextArabic = "تحت الدراسة والنظر";
      if (newStatus === "accepted") statusTextArabic = "مقبول وتم التعديل";
      if (newStatus === "rejected") statusTextArabic = "مرفوض";

      const title = `تحديث بخصوص بلاغك حول: ${report.place_name}`;
      const message = `تم تغيير حالة إبلاغك إلى (${statusTextArabic}). ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;

      const { error: notifError } = await supabase.from("notifications").insert([{
        user_id: report.user_id,
        title,
        message,
        type: newStatus === "accepted" ? "success" : newStatus === "rejected" ? "warning" : "info",
        link: `/places/${report.place_id}`
      }]);

      if (notifError) console.error("Failed to send notification:", notifError);

      setActionStatus("تم تحديث حالة البلاغ وإشعار المستخدم بنجاح!");
      setReplyText("");
      fetchReports();
    } catch (err: any) {
      setActionStatus(`خطأ: ${err.message}`);
    } finally {
      setUpdatingId(null);
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
      </div>
    );
  }

  const getProblemLabel = (type: string, details?: any) => {
    if ((type === "other" || details?.isMultiReport) && details?.selectedIssues && details.selectedIssues.length > 0) {
      return `بلاغ متعدد (${details.selectedIssues.length} مشاكل) 📝`;
    }
    switch (type) {
      case "name": return "الاسم غير صحيح ✏️";
      case "address": return "العنوان أو موقع الخريطة غير صحيح 📍";
      case "phone_website": return "الهاتف أو موقع الويب غير صحيح 📞";
      case "working_hours": return "ساعات العمل غير صحيحة 🕐";
      case "closed": return "المكان مغلق 🔴";
      case "category": return "الفئة غير صحيحة 🗂️";
      default: return "شيء آخر أو تعديلات متعددة ⚠️";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span style={{ background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>معلق</span>;
      case "reviewed":
        return <span style={{ background: "rgba(0, 122, 255, 0.15)", color: "#007aff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>تحت النظر</span>;
      case "accepted":
        return <span style={{ background: "rgba(52, 199, 89, 0.15)", color: "#34c759", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>تم القبول والتعديل</span>;
      case "rejected":
        return <span style={{ background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>مرفوض</span>;
      case "retracted":
        return <span style={{ background: "rgba(142, 142, 147, 0.15)", color: "#8e8e93", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>متراجع عنه</span>;
      default:
        return <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem" }}>{status}</span>;
    }
  };

  const getAppStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span style={{ background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>قيد النظر</span>;
      case "reviewed":
        return <span style={{ background: "rgba(0, 122, 255, 0.15)", color: "#007aff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>تمت المراجعة</span>;
      case "action_taken":
        return <span style={{ background: "rgba(52, 199, 89, 0.15)", color: "#34c759", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>تم اتخاذ إجراء</span>;
      default:
        return <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem" }}>{status}</span>;
    }
  };

  const filteredReports = reports.filter(r => statusFilter === "all" || r.status === statusFilter);
  const filteredAppFeedbacks = appFeedbacks.filter(f => {
    const statusMatch = appStatusFilter === "all" || f.status === appStatusFilter;
    const typeMatch = appTypeFilter === "all" || f.type === appTypeFilter;
    return statusMatch && typeMatch;
  });
  const filteredContactMessages = contactMessages.filter(msg => {
    return contactStatusFilter === "all" || msg.status === contactStatusFilter;
  });

  return (
    <div style={{ padding: "30px 0 120px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.64rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px" }}>البلاغات</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>مراجعة التواصل و بلاغات الاماكن و الاقتراحات و الشكاوى و الرسائل النصية</p>
        </div>
        <button
          onClick={() => {
            if (activeReportTab === "places") fetchReports();
            else if (activeReportTab === "app") fetchAppFeedbacks();
            else fetchContactMessages();
          }}
          className="ios-btn"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 5px" }}
        >
          <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }}></i> تحديث
        </button>
      </div>

      {/* Segmented Control for Tabs */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "14px", border: "1px solid var(--border-glass)", marginBottom: "24px", maxWidth: "600px" }}>
        <button
          onClick={() => {
            setActiveReportTab("places");
            setActiveReportId(null);
            setReplyText("");
            setActionStatus("");
          }}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: activeReportTab === "places" ? "var(--accent-primary)" : "transparent",
            color: activeReportTab === "places" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "var(--font-body)"
          }}
        >
          الأماكن ({reports.length})
        </button>
        <button
          onClick={() => {
            setActiveReportTab("app");
            setActiveReportId(null);
            setReplyText("");
            setActionStatus("");
          }}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: activeReportTab === "app" ? "var(--accent-primary)" : "transparent",
            color: activeReportTab === "app" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "var(--font-body)"
          }}
        >
          الأقتراحات ({appFeedbacks.length})
        </button>
        <button
          onClick={() => {
            setActiveReportTab("contacts");
            setActiveReportId(null);
            setReplyText("");
            setActionStatus("");
          }}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: activeReportTab === "contacts" ? "var(--accent-primary)" : "transparent",
            color: activeReportTab === "contacts" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "var(--font-body)"
          }}
        >
          التواصل ({contactMessages.length})
        </button>
        <button
          onClick={() => {
            setActiveReportTab("microbus");
            setActiveReportId(null);
            setReplyText("");
            setActionStatus("");
          }}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: activeReportTab === "microbus" ? "var(--accent-primary)" : "transparent",
            color: activeReportTab === "microbus" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "var(--font-body)"
          }}
        >
          مواقف السرفيس ({microbusReports.length})
        </button>
      </div>

      {activeReportTab === "places" && (
        <>
          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
            {["all", "pending", "reviewed", "accepted", "rejected", "retracted"].map((status) => {
              const count = status === "all" ? reports.length : reports.filter(r => r.status === status).length;
              let label = "الكل";
              if (status === "pending") label = "معلق";
              if (status === "reviewed") label = "تحت النظر";
              if (status === "accepted") label = "مقبول";
              if (status === "rejected") label = "مرفوض";
              if (status === "retracted") label = "المتراجع عنها";

              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: isActive ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : "var(--text-primary)",
                    fontWeight: "600",
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-heading)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0
                  }}
                >
                  {label}
                  <span style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "0.78rem"
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loadingReports ? (
            <div style={{ textAlign: "center", padding: "60px" }}>جاري تحميل البلاغات...</div>
          ) : filteredReports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-glass)", borderRadius: "16px", color: "var(--text-muted)" }}>
              <i className="bx bx-info-circle" style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}></i>
              <span>لا يوجد بلاغات مطابقة للتصفية المحددة</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {filteredReports.map((report) => {
                const isOpen = activeReportId === report.id;
                return (
                  <div
                    key={report.id}
                    className="glass-card"
                    style={{
                      padding: "20px",
                      borderRadius: "16px",
                      border: isOpen ? "1px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                      transition: "all 0.2s"
                    }}
                  >
                    {/* Collapsed Header Summary */}
                    <div
                      onClick={() => {
                        setActiveReportId(isOpen ? null : report.id);
                        setReplyText("");
                        setActionStatus("");
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", gap: "16px", flexWrap: "wrap" }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>{report.place_name}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>#{report.place_id}</span>
                          {getStatusBadge(report.status)}
                        </div>

                        <div style={{ display: "flex", gap: "16px", color: "var(--text-secondary)", fontSize: "0.88rem", flexWrap: "wrap" }}>
                          <span>المشكلة: <strong>{getProblemLabel(report.problem_type, report.details)}</strong></span>
                          <span>بواسطة: <strong>{report.user_profile?.full_name || "مستخدم غير مسجل الاسم"}</strong></span>
                          <span>التاريخ: {new Date(report.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className="ios-btn" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                          {isOpen ? "إخفاء التفاصيل" : "عرض والرد"}
                        </button>
                        <i className={`bx bx-chevron-${isOpen ? "up" : "down"}`} style={{ fontSize: "1.4rem", color: "var(--text-secondary)" }}></i>
                      </div>
                    </div>

                    {/* Expanded Details Form */}
                    {isOpen && (
                      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fade-in 0.3s ease" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>

                          {/* Left Column: Report Details */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <h4 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: "800", borderBottom: "2px solid var(--accent-primary)", paddingBottom: "6px", width: "fit-content" }}>تفاصيل البلاغ</h4>

                            {/* Render details based on type */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "14px" }}>

                              {/* name incorrect */}
                              {report.problem_type === "name" && (
                                <div>
                                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>الاسم المقترح الجديد:</span>
                                  <strong style={{ fontSize: "1.1rem", color: "var(--accent-success)" }}>{report.details.newName}</strong>
                                </div>
                              )}

                              {/* address incorrect */}
                              {report.problem_type === "address" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div>
                                    <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>العنوان المقترح:</span>
                                    <strong>{report.details.newAddress || "غير محدد"}</strong>
                                  </div>
                                  {report.details.newMapsUrl && (
                                    <div>
                                      <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>رابط الخريطة المقترح:</span>
                                      <a href={report.details.newMapsUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", wordBreak: "break-all", fontSize: "0.85rem" }}>{report.details.newMapsUrl}</a>
                                    </div>
                                  )}
                                  {(report.details.newLatitude && report.details.newLongitude) && (
                                    <div>
                                      <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>الإحداثيات الجغرافية:</span>
                                      <code style={{ fontSize: "0.85rem" }}>{report.details.newLatitude}, {report.details.newLongitude}</code>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* phone/website incorrect */}
                              {report.problem_type === "phone_website" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {report.details.newPhones && report.details.newPhones.length > 0 && (
                                    <div>
                                      <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>أرقام الهاتف المقترحة:</span>
                                      <strong>{report.details.newPhones.join(" - ")}</strong>
                                    </div>
                                  )}
                                  {report.details.newWebsite && (
                                    <div>
                                      <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>موقع الويب المقترح:</span>
                                      <a href={report.details.newWebsite} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)" }}>{report.details.newWebsite}</a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* working hours incorrect */}
                              {report.problem_type === "working_hours" && report.details.workingHours && (
                                <div>
                                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>مواعيد العمل المقترحة:</span>
                                  {report.details.workingHours.type === "24/7" ? (
                                    <strong style={{ color: "#34c759" }}>🟢 مفتوح 24/7</strong>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                      {report.details.workingHours.schedule?.map((s: any, i: number) => (
                                        <div key={i} style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                                          <span>{s.day}:</span>
                                          <span>{s.isWorking ? `${s.openTime} ${s.openPeriod} - ${s.closeTime} ${s.closePeriod}` : <span style={{ color: "#ff3b30" }}>مغلق</span>}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* closed */}
                              {report.problem_type === "closed" && (
                                <div>
                                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>حالة الإغلاق المبلّغ عنها:</span>
                                  <strong style={{ color: "#ff3b30" }}>
                                    {report.details.closureStatus === "permanently_closed" && "مغلق نهائياً 🔴"}
                                    {report.details.closureStatus === "temporarily_closed" && "مغلق مؤقتاً ⚠️"}
                                    {report.details.closureStatus === "not_exist" && "غير موجود بالمرة 🚫"}
                                  </strong>
                                </div>
                              )}

                              {/* multi-issue / other incorrect */}
                              {(report.problem_type === "other" || report.details?.isMultiReport) && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {report.details?.selectedIssues && report.details.selectedIssues.length > 0 && (
                                    <div style={{ marginBottom: "6px" }}>
                                      <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>الأقسام المحددة للتعديل:</span>
                                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                        {report.details.selectedIssues.map((issueId: string) => (
                                          <span key={issueId} style={{ background: "rgba(0, 122, 255, 0.12)", color: "var(--accent-ios)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold", border: "1px solid rgba(0, 122, 255, 0.2)" }}>
                                            {getProblemLabel(issueId)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Sub-issue: Name */}
                                  {report.details?.name?.newName && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "2px" }}>الاسم المقترح الجديد:</span>
                                      <strong style={{ fontSize: "1rem", color: "var(--accent-success)" }}>{report.details.name.newName}</strong>
                                    </div>
                                  )}

                                  {/* Sub-issue: Address */}
                                  {report.details?.address && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", gap: "4px" }}>
                                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)" }}>العنوان المقترح:</span>
                                      <strong>{report.details.address.newAddress || "غير محدد"}</strong>
                                      {report.details.address.newMapsUrl && (
                                        <div>
                                          <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>رابط الخريطة:</span>
                                          <a href={report.details.address.newMapsUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", wordBreak: "break-all", fontSize: "0.8rem" }}>{report.details.address.newMapsUrl}</a>
                                        </div>
                                      )}
                                      {(report.details.address.newLatitude && report.details.address.newLongitude) && (
                                        <div>
                                          <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>الإحداثيات:</span>
                                          <code style={{ fontSize: "0.8rem" }}>{report.details.address.newLatitude}, {report.details.address.newLongitude}</code>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Sub-issue: Phone / Website */}
                                  {report.details?.phone_website && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", gap: "4px" }}>
                                      {report.details.phone_website.newPhones && report.details.phone_website.newPhones.length > 0 && (
                                        <div>
                                          <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)" }}>أرقام الهاتف المقترحة:</span>
                                          <strong>{report.details.phone_website.newPhones.join(" - ")}</strong>
                                        </div>
                                      )}
                                      {report.details.phone_website.newWebsite && (
                                        <div>
                                          <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)" }}>موقع الويب المقترح:</span>
                                          <a href={report.details.phone_website.newWebsite} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", fontSize: "0.8rem" }}>{report.details.phone_website.newWebsite}</a>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Sub-issue: Working Hours */}
                                  {report.details?.working_hours?.workingHours && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>مواعيد العمل المقترحة:</span>
                                      {report.details.working_hours.workingHours.type === "24/7" ? (
                                        <strong style={{ color: "#34c759" }}>🟢 مفتوح 24/7</strong>
                                      ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                          {report.details.working_hours.workingHours.schedule?.map((s: any, i: number) => (
                                            <div key={i} style={{ fontSize: "0.82rem", display: "flex", justifyContent: "space-between" }}>
                                              <span>{s.day}:</span>
                                              <span>{s.isWorking ? `${s.openTime} ${s.openPeriod} - ${s.closeTime} ${s.closePeriod}` : <span style={{ color: "#ff3b30" }}>مغلق</span>}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Sub-issue: Closed */}
                                  {report.details?.closed?.closureStatus && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "2px" }}>حالة الإغلاق المبلّغ عنها:</span>
                                      <strong style={{ color: "#ff3b30" }}>
                                        {report.details.closed.closureStatus === "permanently_closed" && "مغلق نهائياً 🔴"}
                                        {report.details.closed.closureStatus === "temporarily_closed" && "مغلق مؤقتاً ⚠️"}
                                        {report.details.closed.closureStatus === "not_exist" && "غير موجود بالمرة 🚫"}
                                      </strong>
                                    </div>
                                  )}

                                  {/* Sub-issue: Category */}
                                  {report.details?.category?.newCategoryLabel && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "2px" }}>التصنيف المقترح:</span>
                                      <strong>{report.details.category.newCategoryLabel} ({report.details.category.newCategory})</strong>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* category incorrect */}
                              {report.problem_type === "category" && (
                                <div>
                                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>التصنيف المقترح:</span>
                                  <strong>{report.details.newCategoryLabel} ({report.details.newCategory})</strong>
                                </div>
                              )}

                              {/* comment */}
                              {report.comment && (
                                <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>تعليق وتوضيح المستخدم:</span>
                                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "pre-line" }}>"{report.comment}"</p>
                                </div>
                              )}
                            </div>

                            {/* Image URL preview */}
                            {report.image_url && (
                              <div>
                                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>الصورة المرفقة بالبلاغ:</span>
                                <a href={report.image_url} target="_blank" rel="noreferrer">
                                  <img
                                    src={report.image_url}
                                    alt="المرفق"
                                    style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "10px", objectFit: "contain", border: "1px solid var(--border-glass)", cursor: "zoom-in" }}
                                  />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Right Column: User Profile & Action Form */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                            {/* Profile Info */}
                            <div>
                              <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "800", borderBottom: "2px solid var(--accent-primary)", paddingBottom: "6px", width: "fit-content" }}>بيانات صاحب البلاغ</h4>
                              {report.user_profile ? (
                                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem" }}>
                                  <div>الاسم الكامل: <strong>{report.user_profile.full_name || "غير محدد"}</strong></div>
                                  <div>البريد الإلكتروني: <strong>{report.user_profile.email || "غير محدد"}</strong></div>
                                  <div>رقم الهاتف: <strong>{report.user_profile.phone || "غير محدد"}</strong></div>
                                  <div>اسم المستخدم: <strong>@{report.user_profile.username || "غير محدد"}</strong></div>
                                </div>
                              ) : (
                                <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>بيانات المستخدم غير متوفرة (قد يكون الحساب قد حُذف).</div>
                              )}
                            </div>

                            {/* Reply Form */}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                              <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "800" }}>اتخاذ إجراء والرد على البلاغ</h4>

                              {report.status === "retracted" ? (
                                <div style={{
                                  background: "rgba(255, 255, 255, 0.04)",
                                  border: "1px dashed var(--border-glass)",
                                  padding: "16px",
                                  borderRadius: "12px",
                                  color: "var(--text-muted)",
                                  fontSize: "0.9rem",
                                  textAlign: "center"
                                }}>
                                  ℹ️ تم التراجع عن هذا البلاغ وحذفه من قبل المستخدم.
                                </div>
                              ) : (
                                <>
                                  {actionStatus && (
                                    <div style={{
                                      background: actionStatus.startsWith("خطأ") ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)",
                                      color: actionStatus.startsWith("خطأ") ? "#ff3b30" : "#34c759",
                                      padding: "10px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "12px"
                                    }}>
                                      {actionStatus}
                                    </div>
                                  )}

                                  {report.admin_reply && (
                                    <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                      الرد الحالي: <strong>"{report.admin_reply}"</strong>
                                    </div>
                                  )}

                                  <textarea
                                    className="ios-input"
                                    style={{ width: "100%", minHeight: "80px", padding: "10px", fontSize: "0.9rem", resize: "vertical", fontFamily: "var(--font-heading)", marginBottom: "12px" }}
                                    placeholder="اكتب رسالة الرد أو سبب الرفض/القبول للمستخدم هنا..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={updatingId !== null}
                                  />

                                  {/* Action Buttons */}
                                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                                    <button
                                      onClick={() => handleUpdateStatus(report, "reviewed")}
                                      disabled={updatingId !== null}
                                      className="ios-btn"
                                      style={{
                                        flex: 1,
                                        background: "rgba(0, 122, 255, 0.1)",
                                        border: "1px solid rgba(0, 122, 255, 0.2)",
                                        color: "#007aff",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      {updatingId === report.id ? "جاري الحفظ..." : "تحت النظر 👀"}
                                    </button>

                                    <button
                                      onClick={() => handleUpdateStatus(report, "accepted")}
                                      disabled={updatingId !== null}
                                      className="ios-btn"
                                      style={{
                                        flex: 1,
                                        background: "rgba(52, 199, 89, 0.1)",
                                        border: "1px solid rgba(52, 199, 89, 0.2)",
                                        color: "#34c759",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      {updatingId === report.id ? "جاري الحفظ..." : "مقبول ومعدل ✅"}
                                    </button>

                                    <button
                                      onClick={() => handleUpdateStatus(report, "rejected")}
                                      disabled={updatingId !== null}
                                      className="ios-btn"
                                      style={{
                                        flex: 1,
                                        background: "rgba(255, 59, 48, 0.1)",
                                        border: "1px solid rgba(255, 59, 48, 0.2)",
                                        color: "#ff3b30",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      {updatingId === report.id ? "جاري الحفظ..." : "مرفوض ❌"}
                                    </button>

                                  </div>
                                </>
                              )}

                              <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                                <Link
                                  href={`/places/${report.place_id}`}
                                  target="_blank"
                                  className="ios-btn"
                                  style={{ width: "100%", textAlign: "center", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                >
                                  <i className="bx bx-link-external"></i> الانتقال لصفحة المكان للمعاينة أو التعديل
                                </Link>
                              </div>

                            </div>
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeReportTab === "app" && (
        <>
          {/* Solved Count Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: "bold" }}>
              تصفية حسب الحالة:
            </div>
            <div style={{
              background: "rgba(52, 199, 89, 0.12)",
              border: "1px solid rgba(52, 199, 89, 0.2)",
              borderRadius: "14px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#34c759",
              fontWeight: "bold",
              fontSize: "0.9rem"
            }}>
              <i className="bx bx-check-double" style={{ fontSize: "1.2rem" }}></i>
              <span>عدد البلاغات/المشاكل المحلولة: {solvedCount}</span>
            </div>
          </div>

          {/* Filter Tabs for App Feedback Status */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", overflowX: "auto", paddingBottom: "8px" }}>
            {["all", "pending", "reviewed", "action_taken"].map((status) => {
              const count = status === "all" ? appFeedbacks.length : appFeedbacks.filter(r => r.status === status).length;
              let label = "الكل";
              if (status === "pending") label = "قيد النظر";
              if (status === "reviewed") label = "تمت المراجعة";
              if (status === "action_taken") label = "تم اتخاذ إجراء";

              const isActive = appStatusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setAppStatusFilter(status)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: isActive ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : "var(--text-primary)",
                    fontWeight: "600",
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-heading)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0
                  }}
                >
                  {label}
                  <span style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "0.78rem"
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Tabs for App Feedback Type */}
          <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: "bold", marginBottom: "12px" }}>
            تصفية حسب نوع الدعم:
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
            {[
              { key: "all", label: "كل الأنواع", icon: "bx-list-ul" },
              { key: "suggestion", label: "الاقتراحات فقط 💡", icon: "bx-bulb" },
              { key: "bug", label: "البلاغات والمشاكل فقط ⚠️", icon: "bx-error-alt" }
            ].map((type) => {
              const count = type.key === "all"
                ? appFeedbacks.length
                : appFeedbacks.filter(r => r.type === type.key).length;
              const isActive = appTypeFilter === type.key;
              return (
                <button
                  key={type.key}
                  onClick={() => setAppTypeFilter(type.key as any)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: isActive ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : "var(--text-primary)",
                    fontWeight: "600",
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-heading)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0
                  }}
                >
                  <i className={`bx ${type.icon}`} style={{ fontSize: "1.1rem" }}></i>
                  {type.label}
                  <span style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "0.78rem"
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loadingAppFeedbacks ? (
            <div style={{ textAlign: "center", padding: "60px" }}>جاري تحميل الاقتراحات والمشاكل...</div>
          ) : filteredAppFeedbacks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-glass)", borderRadius: "16px", color: "var(--text-muted)" }}>
              <i className="bx bx-info-circle" style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}></i>
              <span>لا يوجد اقتراحات أو مشاكل مطابقة للتصفية المحددة</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {filteredAppFeedbacks.map((feedback) => {
                const isOpen = activeReportId === feedback.id;
                return (
                  <div
                    key={feedback.id}
                    className="glass-card"
                    style={{
                      padding: "20px",
                      borderRadius: "16px",
                      border: isOpen ? "1px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                      transition: "all 0.2s",
                      background: "rgba(255, 255, 255, 0.02)"
                    }}
                  >
                    {/* Collapsed Header Summary */}
                    <div
                      onClick={() => {
                        setActiveReportId(isOpen ? null : feedback.id);
                        setReplyText("");
                        setActionStatus("");
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", gap: "16px", flexWrap: "wrap" }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                            {feedback.type === "suggestion" ? "💡 اقتراح: " + feedback.category : "⚠️ مشكلة: " + feedback.title}
                          </span>
                          {getAppStatusBadge(feedback.status)}
                        </div>

                        <div style={{ display: "flex", gap: "16px", color: "var(--text-secondary)", fontSize: "0.88rem", flexWrap: "wrap" }}>
                          <span>بواسطة: <strong>{feedback.user_profile?.full_name || "مستخدم غير مسجل الاسم"}</strong></span>
                          <span>التاريخ: {new Date(feedback.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className="ios-btn" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                          {isOpen ? "إخفاء التفاصيل" : "عرض والرد"}
                        </button>
                        <i className={`bx bx-chevron-${isOpen ? "up" : "down"}`} style={{ fontSize: "1.4rem", color: "var(--text-secondary)" }}></i>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fade-in 0.3s ease" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>

                          {/* Left: Feedback Details */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <h4 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: "800", borderBottom: "2px solid var(--accent-primary)", paddingBottom: "6px", width: "fit-content" }}>التفاصيل ومحتوى الرسالة</h4>

                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "14px" }}>
                              <div>
                                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>الرسالة / تفاصيل المشكلة:</span>
                                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                                  {feedback.content}
                                </p>
                              </div>
                            </div>

                            {feedback.image_url && (
                              <div>
                                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>الصورة المرفقة للمشكلة:</span>
                                <a href={feedback.image_url} target="_blank" rel="noreferrer">
                                  <img
                                    src={feedback.image_url}
                                    alt="مرفق المشكلة"
                                    style={{ maxWidth: "100%", maxHeight: "220px", borderRadius: "12px", objectFit: "contain", border: "1px solid var(--border-glass)", cursor: "zoom-in" }}
                                  />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Right: Profile & Actions */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                              <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "800", borderBottom: "2px solid var(--accent-primary)", paddingBottom: "6px", width: "fit-content" }}>بيانات صاحب البلاغ/الاقتراح</h4>
                              {feedback.user_profile ? (
                                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem" }}>
                                  <div>الاسم الكامل: <strong>{feedback.user_profile.full_name || "غير محدد"}</strong></div>
                                  <div>البريد الإلكتروني: <strong>{feedback.user_profile.email || "غير محدد"}</strong></div>
                                  <div>رقم الهاتف: <strong>{feedback.user_profile.phone || "غير محدد"}</strong></div>
                                  <div>اسم المستخدم: <strong>@{feedback.user_profile.username || "غير محدد"}</strong></div>
                                </div>
                              ) : (
                                <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>بيانات المستخدم غير متوفرة.</div>
                              )}
                            </div>

                            {/* Actions form */}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                              <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "800" }}>اتخاذ إجراء والرد</h4>

                              {actionStatus && (
                                <div style={{
                                  background: actionStatus.startsWith("خطأ") ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)",
                                  color: actionStatus.startsWith("خطأ") ? "#ff3b30" : "#34c759",
                                  padding: "10px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "12px"
                                }}>
                                  {actionStatus}
                                </div>
                              )}

                              {feedback.admin_reply && (
                                <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                  الرد الحالي: <strong>"{feedback.admin_reply}"</strong>
                                </div>
                              )}

                              <textarea
                                className="ios-input"
                                style={{ width: "100%", minHeight: "80px", padding: "10px", fontSize: "0.9rem", resize: "vertical", fontFamily: "var(--font-heading)", marginBottom: "12px" }}
                                placeholder="اكتب رد الإدارة للمستخدم هنا..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={updatingId !== null}
                              />

                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button
                                  onClick={() => handleUpdateAppFeedbackStatus(feedback, "pending")}
                                  disabled={updatingId !== null}
                                  className="ios-btn"
                                  style={{
                                    flex: 1,
                                    background: "rgba(255, 149, 0, 0.1)",
                                    border: "1px solid rgba(255, 149, 0, 0.2)",
                                    color: "#ff9500",
                                    fontSize: "0.85rem",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {updatingId === feedback.id ? "جاري الحفظ..." : "قيد النظر 👀"}
                                </button>

                                <button
                                  onClick={() => handleUpdateAppFeedbackStatus(feedback, "reviewed")}
                                  disabled={updatingId !== null}
                                  className="ios-btn"
                                  style={{
                                    flex: 1,
                                    background: "rgba(0, 122, 255, 0.1)",
                                    border: "1px solid rgba(0, 122, 255, 0.2)",
                                    color: "#007aff",
                                    fontSize: "0.85rem",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {updatingId === feedback.id ? "جاري الحفظ..." : "تمت المراجعة 🔎"}
                                </button>

                                <button
                                  onClick={() => handleUpdateAppFeedbackStatus(feedback, "action_taken")}
                                  disabled={updatingId !== null}
                                  className="ios-btn"
                                  style={{
                                    flex: 1,
                                    background: "rgba(52, 199, 89, 0.1)",
                                    border: "1px solid rgba(52, 199, 89, 0.2)",
                                    color: "#34c759",
                                    fontSize: "0.85rem",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {updatingId === feedback.id ? "جاري الحفظ..." : "اتخاذ إجراء ✅"}
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeReportTab === "contacts" && (
        <>
          {/* Filter Tabs for Contact Message Status */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", overflowX: "auto", paddingBottom: "8px" }}>
            {["all", "pending", "replied"].map((status) => {
              const count = status === "all" ? contactMessages.length : contactMessages.filter(r => r.status === status).length;
              let label = "الكل";
              if (status === "pending") label = "قيد الانتظار";
              if (status === "replied") label = "تم الرد";

              const isActive = contactStatusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setContactStatusFilter(status)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: isActive ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : "var(--text-secondary)",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-heading)",
                    whiteSpace: "nowrap"
                  }}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Contact Messages Content */}
          {loadingContacts ? (
            <div style={{ textAlign: "center", padding: "60px" }}>جاري تحميل رسائل التواصل...</div>
          ) : filteredContactMessages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-glass)", borderRadius: "16px", color: "var(--text-muted)" }}>
              <i className="bx bx-info-circle" style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}></i>
              <span>لا توجد رسائل تواصل مطابقة للتصفية المحددة</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {filteredContactMessages.map((contact) => {
                const isOpen = activeReportId === contact.id;
                return (
                  <div
                    key={contact.id}
                    className="glass-card"
                    style={{
                      padding: "20px",
                      borderRadius: "16px",
                      border: isOpen ? "1px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                      transition: "all 0.2s",
                      background: "rgba(255, 255, 255, 0.02)"
                    }}
                  >
                    {/* Collapsed Header Summary */}
                    <div
                      onClick={() => {
                        setActiveReportId(isOpen ? null : contact.id);
                        setReplyText("");
                        setActionStatus("");
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", gap: "16px", flexWrap: "wrap" }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                            📩 {contact.contact_type}: {contact.first_name} {contact.last_name}
                          </span>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            background: contact.status === "replied" ? "rgba(52, 199, 89, 0.12)" : "rgba(255, 149, 0, 0.12)",
                            color: contact.status === "replied" ? "#34c759" : "#ff9500"
                          }}>
                            {contact.status === "replied" ? "تم الرد" : "قيد الانتظار"}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "16px", color: "var(--text-secondary)", fontSize: "0.88rem", flexWrap: "wrap" }}>
                          <span>البريد: <strong>{contact.email}</strong></span>
                          <span>الهاتف: <strong>{contact.phone}</strong></span>
                          <span>التاريخ: {new Date(contact.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className="ios-btn" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                          {isOpen ? "إخفاء التفاصيل" : "عرض والرد"}
                        </button>
                        <i className={`bx bx-chevron-${isOpen ? "up" : "down"}`} style={{ fontSize: "1.4rem", color: "var(--text-secondary)" }}></i>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fade-in 0.3s ease" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>

                          {/* Left: Message Details */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <h4 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: "800", borderBottom: "2px solid var(--accent-primary)", paddingBottom: "6px", width: "fit-content" }}>محتوى رسالة التواصل</h4>

                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "14px" }}>
                              <div>
                                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>نص الرسالة:</span>
                                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                                  {contact.message}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions & Reply */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                              <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "800", borderBottom: "2px solid var(--accent-primary)", paddingBottom: "6px", width: "fit-content" }}>بيانات التواصل</h4>
                              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem" }}>
                                <div>الاسم الكامل: <strong>{contact.first_name} {contact.last_name}</strong></div>
                                <div>البريد الإلكتروني: <strong>{contact.email}</strong></div>
                                <div>رقم الهاتف: <strong>{contact.phone}</strong></div>
                                {contact.user_id && <div>معرف المستخدم المسجل: <strong style={{ fontSize: '0.75rem' }}>{contact.user_id}</strong></div>}
                              </div>
                            </div>

                            {/* Actions form */}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                              <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "800" }}>الرد على الرسالة كـ إيميل</h4>

                              {actionStatus && (
                                <div style={{
                                  background: actionStatus.startsWith("خطأ") ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)",
                                  color: actionStatus.startsWith("خطأ") ? "#ff3b30" : "#34c759",
                                  padding: "10px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "12px"
                                }}>
                                  {actionStatus}
                                </div>
                              )}

                              {contact.admin_reply && (
                                <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                  الرد المرسل سابقاً: <strong>"{contact.admin_reply}"</strong>
                                </div>
                              )}

                              <textarea
                                className="ios-input"
                                style={{ width: "100%", minHeight: "80px", padding: "10px", fontSize: "0.9rem", resize: "vertical", fontFamily: "var(--font-heading)", marginBottom: "12px" }}
                                placeholder="اكتب رد الدعم الفني للمستخدم هنا ليرسل كإيميل..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={updatingId !== null}
                              />

                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button
                                  onClick={() => handleSendContactReply(contact)}
                                  disabled={updatingId !== null}
                                  className="ios-btn ios-btn-primary"
                                  style={{
                                    flex: 2,
                                    fontSize: "0.85rem",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {updatingId === contact.id ? "جاري الإرسال..." : "إرسال الرد كـ إيميل 📧"}
                                </button>

                                <button
                                  onClick={() => handleDeleteContactMessage(contact.id)}
                                  disabled={updatingId !== null}
                                  className="ios-btn"
                                  style={{
                                    flex: 1,
                                    background: "rgba(255, 59, 48, 0.1)",
                                    border: "1px solid rgba(255, 59, 48, 0.2)",
                                    color: "#ff3b30",
                                    fontSize: "0.85rem",
                                    fontWeight: "bold"
                                  }}
                                >
                                  حذف 🗑️
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeReportTab === "microbus" && (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          {loadingMicrobus ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ width: "30px", height: "30px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <span>جاري تحميل بلاغات السرفيس...</span>
            </div>
          ) : microbusReports.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              {microbusReports.map((report) => {
                const isExpanded = activeReportId === report.id;
                let reasonLabel = "غير محدد";
                if (report.report_reason === "fare") reasonLabel = "💰 الأجرة / التعرفة غير صحيحة";
                else if (report.report_reason === "via") reasonLabel = "🛣️ خط السير / المناطق غير دقيقة";
                else if (report.report_reason === "location") reasonLabel = "📍 مكان الموقف غير صحيح";
                else if (report.report_reason === "other") reasonLabel = "📝 أخرى";

                return (
                  <div key={report.id} style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    transition: "all 0.2s"
                  }}>
                    {/* Header: Station & Route */}
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontSize: "1rem", fontWeight: "bold" }}>
                          🚌 {report.station_name}
                        </h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: "bold" }}>
                          🔀 الخط المتجه إلى: {report.route_destination}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        fontWeight: "bold"
                      }}>
                        {reasonLabel}
                      </span>
                    </div>

                    {/* Report Comments */}
                    {report.comment && (
                      <div style={{
                        background: "rgba(255, 255, 255, 0.01)",
                        borderRight: "3px solid #f59e0b",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5"
                      }}>
                        <strong>تعليق العضو:</strong> {report.comment}
                      </div>
                    )}

                    {/* Reporter Info (Click to toggle) */}
                    <div>
                      <button
                        onClick={() => setActiveReportId(isExpanded ? null : report.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent-primary)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: "bold",
                          padding: 0
                        }}
                      >
                        <i className={`bx bx-chevron-${isExpanded ? "up" : "down"}`}></i>
                        <span>{isExpanded ? "إخفاء بيانات صاحب البلاغ" : "عرض بيانات صاحب البلاغ"}</span>
                      </button>

                      {isExpanded && (
                        <div style={{
                          marginTop: "8px",
                          background: "rgba(255, 255, 255, 0.01)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          animation: "fadeIn 0.2s ease-out"
                        }}>
                          <div>👤 <strong>الاسم الكامل:</strong> {report.user_profile?.full_name || "غير متوفر"}</div>
                          <div>📧 <strong>البريد الإلكتروني:</strong> {report.user_profile?.email || "غير متوفر"}</div>
                          <div>📞 <strong>رقم الهاتف:</strong> {report.user_profile?.phone || "غير متوفر"}</div>
                          <div>📅 <strong>تاريخ البلاغ:</strong> {new Date(report.created_at).toLocaleString("ar-EG")}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border-glass)", paddingTop: "12px", marginTop: "4px" }}>
                      <button
                        onClick={() => handleDeleteMicrobusReport(report.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          color: "#ef4444",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        🗑️ حذف البلاغ
                      </button>
                      <Link
                        href="/microbus-stations"
                        target="_blank"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--border-glass)",
                          color: "var(--text-primary)",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        🔗 معاينة الصفحة
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-glass)",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              color: "var(--text-secondary)"
            }}>
              لا توجد بلاغات معلقة بخصوص مواقف السرفيس.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

