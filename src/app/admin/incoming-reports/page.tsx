"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CustomModal from "@/components/common/Modals";

interface IncomingFeedback {
  id: string;
  user_id: string;
  type: "suggestion" | "bug";
  category: string | null;
  title: string | null;
  content: string;
  image_url: string | null;
  status: "pending" | "reviewed" | "action_taken";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name?: string;
    email?: string;
    phone?: string;
    username?: string;
    avatar_url?: string;
  } | null;
}

export default function IncomingReportsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [feedbacks, setFeedbacks] = useState<IncomingFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "metro" | "monorail" | "directory" | "suggestions" | "bugs" | "routes">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<IncomingFeedback | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Image Modal state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Add to Directory Modal state
  const [dirModalItem, setDirModalItem] = useState<IncomingFeedback | null>(null);
  const [dirType, setDirType] = useState<"phone" | "code">("phone");
  // Phone entry fields
  const [dirPhoneName, setDirPhoneName] = useState("");
  const [dirPhoneNumber, setDirPhoneNumber] = useState("");
  const [dirPhoneSpecialty, setDirPhoneSpecialty] = useState("عام");
  const [dirPhoneDesc, setDirPhoneDesc] = useState("");
  // Code entry fields
  const [dirCodeCompany, setDirCodeCompany] = useState<"vodafone" | "orange" | "etisalat" | "we">("vodafone");
  const [dirCodeTitle, setDirCodeTitle] = useState("");
  const [dirCodeValue, setDirCodeValue] = useState("");
  const [dirCodeSection, setDirCodeSection] = useState("خدمات عامة");
  // Options
  const [dirAutoActionTaken, setDirAutoActionTaken] = useState(true);
  const [isSubmittingDir, setIsSubmittingDir] = useState(false);

  const isAdmin = profile?.is_admin || false;

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) {
      router.push("/admin");
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    let isMounted = true;

    const loadData = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("app_feedback")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!isMounted) return;

        if (data && data.length > 0) {
          // Resolve user profiles
          const userIds = Array.from(new Set(data.map((r) => r.user_id).filter(Boolean)));
          let profilesMap = new Map();
          if (userIds.length > 0) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("id, full_name, email, phone, username, avatar_url")
              .in("id", userIds);
            if (profilesData) {
              profilesMap = new Map(profilesData.map((p) => [p.id, p]));
            }
          }

          if (isMounted) {
            const mapped: IncomingFeedback[] = data.map((item) => ({
              ...item,
              user_profile: profilesMap.get(item.user_id) || null,
            }));
            setFeedbacks(mapped);
          }
        } else if (isMounted) {
          setFeedbacks([]);
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        console.error("Failed to fetch incoming feedback:", err);
        if (isMounted) {
          showToast("error", "فشل تحميل البلاغات الواردة: " + errMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [user, isAdmin, refreshKey, showToast]);

  // Helper to categorize item
  const getItemSection = (item: IncomingFeedback): "directory" | "metro" | "monorail" | "bugs" | "suggestions" | "routes" | "other" => {
    const cat = (item.category || "").toLowerCase();
    const title = (item.title || "").toLowerCase();
    const content = (item.content || "").toLowerCase();

    if (
      cat.includes("مترو") ||
      title.includes("مترو") ||
      content.includes("مترو")
    ) {
      return "metro";
    }

    if (
      cat.includes("مونوريل") ||
      title.includes("مونوريل") ||
      content.includes("مونوريل")
    ) {
      return "monorail";
    }

    if (
      cat.includes("دليل") ||
      cat.includes("هاتف") ||
      cat.includes("كود") ||
      title.includes("دليل") ||
      title.includes("إضافة رقم") ||
      title.includes("كود") ||
      content.includes("دليل الهاتف")
    ) {
      return "directory";
    }

    if (cat.includes("مواصلات") || cat.includes("طريق") || title.includes("طريق") || cat.includes("موقف") || cat.includes("سرفيس")) {
      return "routes";
    }

    if (item.type === "bug" || cat.includes("خطأ") || cat.includes("مشكلة") || title.includes("خطأ") || title.includes("مشكلة")) {
      return "bugs";
    }

    return "suggestions";
  };

  // KPI calculations
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const pending = feedbacks.filter((f) => f.status === "pending").length;
    const reviewed = feedbacks.filter((f) => f.status === "reviewed").length;
    const actionTaken = feedbacks.filter((f) => f.status === "action_taken").length;
    const directoryCount = feedbacks.filter((f) => getItemSection(f) === "directory").length;
    const metroCount = feedbacks.filter((f) => getItemSection(f) === "metro").length;
    const monorailCount = feedbacks.filter((f) => getItemSection(f) === "monorail").length;
    return { total, pending, reviewed, actionTaken, directoryCount, metroCount, monorailCount };
  }, [feedbacks]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // 2. Category / Section Filter
      if (categoryFilter !== "all") {
        const sec = getItemSection(item);
        if (categoryFilter === "metro" && sec !== "metro") return false;
        if (categoryFilter === "monorail" && sec !== "monorail") return false;
        if (categoryFilter === "directory" && sec !== "directory") return false;
        if (categoryFilter === "bugs" && sec !== "bugs") return false;
        if (categoryFilter === "suggestions" && sec !== "suggestions") return false;
        if (categoryFilter === "routes" && sec !== "routes") return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = (item.user_profile?.full_name || "").toLowerCase();
        const userEmail = (item.user_profile?.email || "").toLowerCase();
        const userPhone = (item.user_profile?.phone || "").toLowerCase();
        const title = (item.title || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const content = (item.content || "").toLowerCase();

        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          userPhone.includes(q) ||
          title.includes(q) ||
          category.includes(q) ||
          content.includes(q)
        );
      }

      return true;
    });
  }, [feedbacks, statusFilter, categoryFilter, searchQuery]);

  // Status badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              color: "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f59e0b" }} />
            قيد الانتظار
          </span>
        );
      case "reviewed":
        return (
          <span
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3b82f6" }} />
            تمت المراجعة
          </span>
        );
      case "action_taken":
        return (
          <span
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981" }} />
            تم اتخاذ إجراء
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Category Tag badge helper
  const renderCategoryBadge = (item: IncomingFeedback) => {
    const sec = getItemSection(item);
    if (sec === "metro") {
      return (
        <span
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "3px 10px",
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="bx bx-train"></i>
          المترو
        </span>
      );
    }
    if (sec === "monorail") {
      return (
        <span
          style={{
            background: "rgba(59, 130, 246, 0.15)",
            color: "#3b82f6",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            padding: "3px 10px",
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="bx bx-train"></i>
          المونوريل
        </span>
      );
    }
    if (sec === "directory") {
      return (
        <span
          style={{
            background: "rgba(6, 182, 212, 0.15)",
            color: "#06b6d4",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            padding: "3px 10px",
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="bx bx-phone-call"></i>
          دليل الهاتف والأكواد
        </span>
      );
    }
    if (sec === "routes") {
      return (
        <span
          style={{
            background: "rgba(139, 92, 246, 0.15)",
            color: "#a78bfa",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            padding: "3px 10px",
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="bx bx-compass"></i>
          خطوط المواصلات
        </span>
      );
    }
    if (sec === "bugs") {
      return (
        <span
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "3px 10px",
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="bx bx-bug"></i>
          بلاغ / خطأ بالنظام
        </span>
      );
    }
    return (
      <span
        style={{
          background: "rgba(245, 158, 11, 0.15)",
          color: "#fbbf24",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          padding: "3px 10px",
          borderRadius: "8px",
          fontSize: "0.76rem",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <i className="bx bx-bulb"></i>
        اقتراح عام وميزات
      </span>
    );
  };

  // Update Status & Notify
  const handleUpdateStatus = async (item: IncomingFeedback, newStatus: "pending" | "reviewed" | "action_taken") => {
    if (!supabase || !isAdmin) return;
    setUpdatingStatusId(item.id);

    try {
      const { error } = await supabase
        .from("app_feedback")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      // Update state locally
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: newStatus } : f))
      );

      // Send notification to user
      let notifTitle = "";
      let notifMessage = "";
      const isSuggestion = item.type === "suggestion";

      if (newStatus === "action_taken") {
        notifTitle = isSuggestion ? "💡 تم اعتماد اقتراحك وإضافته!" : "✅ تم حل البلاغ المقدم من قبلك!";
        notifMessage = isSuggestion
          ? `يسرنا إبلاغك بأن الإدارة قد اعتمدت اقتراحك بخصوص "${item.category || item.title || "الخدمة"}". شكراً لمساهمتك القيمة!`
          : `تم اتخاذ الإجراء اللازم وحل المشكلة التي أبلغت عنها: "${item.title || "البلاغ"}". شكراً لمساعدتنا في تحسين الخدمة!`;
      } else if (newStatus === "reviewed") {
        notifTitle = "🔎 تمت مراجعة طلبك";
        notifMessage = `تمت مراجعة طلبك بخصوص "${item.category || item.title || "الخدمة"}" وهو قيد التدقيق حالياً من قِبل الإدارة.`;
      } else {
        notifTitle = "⏳ تم استلام طلبك";
        notifMessage = `طلبك قيد الانتظار والدراسة من قِبل الإدارة.`;
      }

      await supabase.from("notifications").insert([
        {
          user_id: item.user_id,
          title: notifTitle,
          message: notifMessage,
          type: newStatus === "action_taken" ? "success" : "info",
          link: "/profile",
        },
      ]);

      showToast("success", "تم تحديث حالة البلاغ وإشعار المستخدم بنجاح!");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error updating status:", err);
      showToast("error", "فشل تحديث الحالة: " + errMsg);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Send Admin Reply to User
  const handleSendReply = async (item: IncomingFeedback) => {
    if (!supabase || !isAdmin || !replyText.trim()) return;
    setReplyingId(item.id);

    try {
      const trimmedReply = replyText.trim();

      // 1. Update database record
      const { error: updateError } = await supabase
        .from("app_feedback")
        .update({
          admin_reply: trimmedReply,
          status: item.status === "pending" ? "reviewed" : item.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      // 2. Send in-app notification to user
      const { error: notifError } = await supabase.from("notifications").insert([
        {
          user_id: item.user_id,
          title: "💬 رد من إدارة المنصة على طلبك",
          message: `رد الإدارة بخصوص "${item.category || item.title || "طلبك"}": ${trimmedReply}`,
          type: "info",
          link: "/profile",
        },
      ]);

      if (notifError) console.error("Notification send error:", notifError);

      // 3. Update local state
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                admin_reply: trimmedReply,
                status: f.status === "pending" ? "reviewed" : f.status,
              }
            : f
        )
      );

      setReplyText("");
      showToast("success", "تم إرسال الرد للمستخدم بنجاح عبر الإشعارات!");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error sending reply:", err);
      showToast("error", "فشل إرسال الرد: " + errMsg);
    } finally {
      setReplyingId(null);
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !supabase || !isAdmin) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase.from("app_feedback").delete().eq("id", itemToDelete.id);
      if (error) throw error;

      setFeedbacks((prev) => prev.filter((f) => f.id !== itemToDelete.id));
      if (activeItemId === itemToDelete.id) {
        setActiveItemId(null);
      }
      showToast("success", "تم حذف البلاغ بنجاح 🗑️");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error deleting feedback:", err);
      showToast("error", "فشل حذف البلاغ: " + errMsg);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Open Add to Directory Modal with Auto-Parsed Fields
  const handleOpenAddToDirectory = (item: IncomingFeedback) => {
    const content = item.content || "";
    const title = item.title || "";
    const cat = (item.category || "").toLowerCase();

    const isCode =
      cat.includes("كود") ||
      title.toLowerCase().includes("كود") ||
      content.toLowerCase().includes("كود") ||
      content.toLowerCase().includes("شركة الاتصالات");

    if (isCode) {
      setDirType("code");

      // Company detection
      let detectedCompany: "vodafone" | "orange" | "etisalat" | "we" = "vodafone";
      const fullText = (title + " " + content + " " + cat).toLowerCase();
      if (fullText.includes("اورنج") || fullText.includes("orange")) detectedCompany = "orange";
      else if (fullText.includes("اتصالات") || fullText.includes("etisalat")) detectedCompany = "etisalat";
      else if (fullText.includes("وي") || fullText.includes("we") || fullText.includes("المصرية للاتصالات")) detectedCompany = "we";
      else if (fullText.includes("فودافون") || fullText.includes("vodafone")) detectedCompany = "vodafone";

      // Title extraction
      let extractedTitle = "";
      const titleMatch = content.match(/عنوان الخدمة \/ الغرض:\s*(.+)/);
      if (titleMatch) {
        extractedTitle = titleMatch[1].trim();
      } else {
        extractedTitle = title.replace(/^اقتراح كود [^:]*:\s*/, "").replace(/\s*\([^)]*\)$/, "").trim();
      }

      // Code extraction
      let extractedCode = "";
      const codeMatch = content.match(/الكود:\s*(.+)/);
      if (codeMatch) {
        extractedCode = codeMatch[1].trim();
      } else {
        const parenMatch = title.match(/\(([^)]+)\)/);
        if (parenMatch) extractedCode = parenMatch[1].trim();
      }

      // Section / Note
      let extractedSection = "خدمات عامة";
      if (content.includes("رصيد") || title.includes("رصيد")) extractedSection = "خدمات الرصيد والتحويل";
      else if (content.includes("باقة") || content.includes("نت") || content.includes("انترنت")) extractedSection = "باقات الإنترنت والميجابايتس";
      else if (content.includes("مكالمات")) extractedSection = "باقات المكالمات والأنظمة";

      setDirCodeCompany(detectedCompany);
      setDirCodeTitle(extractedTitle || title);
      setDirCodeValue(extractedCode);
      setDirCodeSection(extractedSection);
    } else {
      setDirType("phone");

      // Name extraction
      let extractedName = "";
      const nameMatch = content.match(/اسم الجهة أو الخدمة:\s*(.+)/);
      if (nameMatch) {
        extractedName = nameMatch[1].trim();
      } else {
        extractedName = title.replace(/^اقتراح إضافة رقم:\s*/, "").replace(/\s*\([^)]*\)$/, "").trim();
      }

      // Phone extraction
      let extractedPhone = "";
      const phoneMatch = content.match(/رقم الهاتف:\s*(.+)/);
      if (phoneMatch) {
        extractedPhone = phoneMatch[1].trim();
      } else {
        const parenMatch = title.match(/\(([^)]+)\)/);
        if (parenMatch) extractedPhone = parenMatch[1].trim();
      }

      // Specialty extraction
      let extractedSpec = "عام";
      const specMatch = content.match(/التخصص \/ الفئة:\s*(.+)/);
      if (specMatch) {
        extractedSpec = specMatch[1].trim();
      }

      // Description extraction
      let extractedDesc = "";
      const notesMatch = content.match(/ملاحظات أو تفاصيل إضافية:\s*(.+)/);
      if (notesMatch && !notesMatch[1].includes("لا توجد ملاحظات")) {
        extractedDesc = notesMatch[1].trim();
      }

      setDirPhoneName(extractedName || title);
      setDirPhoneNumber(extractedPhone);
      setDirPhoneSpecialty(extractedSpec || "عام");
      setDirPhoneDesc(extractedDesc);
    }

    setDirAutoActionTaken(true);
    setDirModalItem(item);
  };

  // Confirm Add to Database (phone_directory or telecom_codes)
  const handleConfirmAddToDirectory = async () => {
    if (!supabase || !dirModalItem || !isAdmin) return;

    setIsSubmittingDir(true);
    try {
      if (dirType === "phone") {
        if (!dirPhoneName.trim() || !dirPhoneNumber.trim()) {
          showToast("error", "يرجى إدخال اسم الجهة ورقم الهاتف.");
          setIsSubmittingDir(false);
          return;
        }

        const { error: insertErr } = await supabase.from("phone_directory").insert([
          {
            name: dirPhoneName.trim(),
            phone_number: dirPhoneNumber.trim(),
            specialty: dirPhoneSpecialty.trim() || "عام",
            description: dirPhoneDesc.trim(),
            icon: "bx bx-phone",
            logo_url: "",
          },
        ]);

        if (insertErr) throw insertErr;
      } else {
        if (!dirCodeTitle.trim() || !dirCodeValue.trim()) {
          showToast("error", "يرجى إدخال عنوان الخدمة والكود.");
          setIsSubmittingDir(false);
          return;
        }

        const { error: insertErr } = await supabase.from("telecom_codes").insert([
          {
            company: dirCodeCompany,
            title: dirCodeTitle.trim(),
            code: dirCodeValue.trim(),
            section_name: dirCodeSection.trim() || "خدمات عامة",
            icon: "bx bx-bookmark",
          },
        ]);

        if (insertErr) throw insertErr;
      }

      const itemName = dirType === "phone" ? dirPhoneName.trim() : dirCodeTitle.trim();

      // Automatically update feedback status to action_taken and send in-app notification
      if (dirAutoActionTaken) {
        const adminReplyText = `تم قبول اقتراحك وإضافة "${itemName}" بنجاح إلى دليل الهاتف والأكواد لتعم الفائدة على الجميع. شكراً لمساهمتك القيمة! 🌟`;

        const { error: updateErr } = await supabase
          .from("app_feedback")
          .update({
            status: "action_taken",
            admin_reply: adminReplyText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dirModalItem.id);

        if (updateErr) console.error("Error updating feedback status:", updateErr);

        // In-app notification to user
        const { error: notifErr } = await supabase.from("notifications").insert([
          {
            user_id: dirModalItem.user_id,
            title: "🎉 تم قبول اقتراحك وإضافته للدليل!",
            message: `يسرنا إبلاغك بأنه تم قبول اقتراحك وإضافة "${itemName}" رسمياً إلى دليل الهاتف. شكراً لمساهمتك في إفادة الجميع!`,
            type: "success",
            link: "/directory",
          },
        ]);

        if (notifErr) console.error("Error creating user notification:", notifErr);

        // Update local state
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.id === dirModalItem.id
              ? {
                  ...f,
                  status: "action_taken",
                  admin_reply: adminReplyText,
                }
              : f
          )
        );
      }

      showToast("success", `تمت إضافة "${itemName}" إلى دليل الهاتف بنجاح! 🎉`);
      setDirModalItem(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error adding to directory:", err);
      showToast("error", "فشل الإضافة إلى الدليل: " + errMsg);
    } finally {
      setIsSubmittingDir(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--textSecondary)" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid var(--borderGlass)", borderTopColor: "var(--colorPrimary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <span>جاري التحقق من صلاحيات الإدارة...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0 100px 0", maxWidth: "1200px", margin: "0 auto", direction: "rtl", fontFamily: "var(--font-heading)" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 99999,
            backgroundColor: toastMessage.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            fontWeight: "700",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "metro-animate-slide-up 0.3s ease",
          }}
        >
          <i className={toastMessage.type === "success" ? "bx bx-check-circle" : "bx bx-error"} style={{ fontSize: "1.2rem" }}></i>
          {toastMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "var(--colorSecondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
              <i className="bx bx-inbox"></i>
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
              البلاغات والاقتراحات الواردة
            </h1>
          </div>
          <p style={{ color: "var(--textSecondary)", fontSize: "0.92rem", margin: 0 }}>
            مراجعة كافة البلاغات واقتراحات دليل الهاتف والأكواد وملاحظات المستخدمين في مكان واحد.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              padding: "9px 18px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`} style={{ fontSize: "1.1rem" }}></i>
            تحديث البيانات
          </button>

          <Link
            href="/admin/directory"
            style={{
              background: "var(--colorSecondary)",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "700",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="bx bx-phone-call"></i>
            دليل الهواتف والأكواد
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--bgSecondary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "var(--textSecondary)", fontWeight: "600" }}>إجمالي الوارد</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--textPrimary)" }}>{stats.total}</span>
            <span style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>طلب وبلاغ</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "#f59e0b", fontWeight: "700" }}>⏳ قيد الانتظار والمراجعة</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f59e0b" }}>{stats.pending}</span>
            <span style={{ fontSize: "0.78rem", color: "#f59e0b" }}>في انتظار الإجراء</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(6, 182, 212, 0.08)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "#06b6d4", fontWeight: "700" }}>☎️ اقتراحات الدليل</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#06b6d4" }}>{stats.directoryCount}</span>
            <span style={{ fontSize: "0.78rem", color: "#06b6d4" }}>أرقام وأكواد مقترحة</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "#10b981", fontWeight: "700" }}>✅ تم اتخاذ إجراء واعتماده</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#10b981" }}>{stats.actionTaken}</span>
            <span style={{ fontSize: "0.78rem", color: "#10b981" }}>مكتمل بنجاح</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div
        style={{
          background: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "16px",
          padding: "18px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Category / Type Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {[
            { id: "all", label: "🌐 كل البلاغات والاقتراحات", count: feedbacks.length },
            { id: "metro", label: "🚇 المترو", count: stats.metroCount },
            { id: "monorail", label: "🚝 المونوريل", count: stats.monorailCount },
            { id: "directory", label: "☎️ دليل الهاتف والأكواد", count: stats.directoryCount },
            { id: "bugs", label: "⚠️ بلاغات وأخطاء النظام", count: feedbacks.filter((f) => getItemSection(f) === "bugs").length },
            { id: "suggestions", label: "💡 اقتراحات الميزات والتطبيق", count: feedbacks.filter((f) => getItemSection(f) === "suggestions").length },
            { id: "routes", label: "🧭 اقتراحات وبلاغات الطرق", count: feedbacks.filter((f) => getItemSection(f) === "routes").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as "all" | "metro" | "monorail" | "directory" | "bugs" | "suggestions" | "routes")}
              style={{
                padding: "8px 16px",
                borderRadius: "30px",
                border: categoryFilter === tab.id ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                background: categoryFilter === tab.id ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                color: categoryFilter === tab.id ? "var(--textPrimary)" : "var(--textSecondary)",
                fontWeight: "700",
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: categoryFilter === tab.id ? "var(--colorSecondary)" : "rgba(112, 109, 109, 0.53)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.72rem",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Status Controls Row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <i className="bx bx-search" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--textSecondary)", fontSize: "1.1rem" }}></i>
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم الهاتف، الإيميل، أو محتوى البلاغ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-fields"
              style={{
                width: "100%",
                height: "42px",
                paddingRight: "40px",
                paddingLeft: "14px",
                borderRadius: "10px",
                fontSize: "0.86rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            {[
              { id: "all", label: "كل الحالات" },
              { id: "pending", label: "قيد الانتظار" },
              { id: "reviewed", label: "تمت المراجعة" },
              { id: "action_taken", label: "تم اتخاذ إجراء" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "10px",
                  border: statusFilter === st.id ? "1px solid var(--colorPrimary)" : "1px solid var(--borderGlass)",
                  background: statusFilter === st.id ? "var(--colorPrimary)" : "var(--bgSecondary)",
                  color: statusFilter === st.id ? "#fff" : "var(--textSecondary)",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--textSecondary)" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid var(--borderGlass)", borderTopColor: "var(--colorPrimary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <span>جاري تحميل البلاغات والاقتراحات...</span>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bgSecondary)",
            border: "1px dashed var(--borderGlass)",
            borderRadius: "16px",
            color: "var(--textSecondary)",
          }}
        >
          <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>📭</div>
          <h3 style={{ margin: "0 0 6px", color: "var(--textPrimary)", fontSize: "1.1rem" }}>لا توجد بلاغات أو اقتراحات تطابق خياراتك</h3>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>جرب تغيير تبويب التصفية أو مسح عبارة البحث أعلاه.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredFeedbacks.map((item) => {
            const isOpen = activeItemId === item.id;
            const isDirectoryItem = getItemSection(item) === "directory";

            return (
              <div
                key={item.id}
                className="metro-animate-slide-up"
                style={{
                  background: "var(--bgPrimary)",
                  border: isOpen ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Item Header */}
                <div
                  onClick={() => {
                    setActiveItemId(isOpen ? null : item.id);
                    setReplyText("");
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    {/* Badges row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                      {renderCategoryBadge(item)}
                      {renderStatusBadge(item.status)}
                      <span style={{ fontSize: "0.76rem", color: "var(--textSecondary)" }}>
                        <i className="bx bx-time" style={{ marginLeft: "4px" }}></i>
                        {new Date(item.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: "1.05rem",
                        fontWeight: "800",
                        color: "var(--textPrimary)",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.title || item.category || (item.type === "bug" ? "بلاغ عن مشكلة" : "اقتراح جديد")}
                    </h3>

                    {/* User Mini Bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--textSecondary)", fontSize: "0.82rem", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                         <strong>{item.user_profile?.full_name || "مستخدم مسجل"}</strong>
                        <i className="bx bx-user" style={{ color: "var(--colorSecondary)" }}></i>
                      </span>

                      {item.user_profile?.phone && (
                        <a
                          href={`tel:${item.user_profile.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--colorSuccess)", textDecoration: "none", direction: "ltr" }}
                        >
                          <i className="bx bx-phone"></i>
                          {item.user_profile.phone}
                        </a>
                      )}

                      {item.user_profile?.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {item.user_profile.email}
                          <i className="bx bx-envelope"></i>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isDirectoryItem && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddToDirectory(item);
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        title="إضافة وتأكيد هذا المقترح في دليل الهاتف مباشرة"
                      >
                        <i className="bx bx-plus-circle" style={{ fontSize: "1rem" }}></i>
                        <span>إضافة في الدليل</span>
                      </button>
                    )}

                    <button
                      type="button"
                      style={{
                        background: isOpen ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        color: isOpen ? "var(--colorSecondary)" : "var(--textPrimary)",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isOpen ? "إخفاء" : "معالجة ورد"}
                      <i className={`bx bx-chevron-${isOpen ? "up" : "down"}`}></i>
                    </button>
                  </div>
                </div>

                {/* Main Content Box (Always Visible Preview / Full) */}
                <div
                  style={{
                    marginTop: "14px",
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.92rem",
                      color: "var(--textPrimary)",
                      whiteSpace: "pre-line",
                      lineHeight: "1.6",
                    }}
                  >
                    {item.content}
                  </p>

                  {item.image_url && (
                    <div style={{ marginTop: "12px" }}>
                      <span style={{ display: "block", fontSize: "0.78rem", color: "var(--textSecondary)", marginBottom: "6px" }}>مرفق مع البلاغ:</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt="مرفق"
                        onClick={() => setPreviewImageUrl(item.image_url)}
                        style={{
                          maxWidth: "180px",
                          maxHeight: "120px",
                          borderRadius: "10px",
                          border: "1px solid var(--borderGlass)",
                          cursor: "pointer",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Existing Admin Reply If Any */}
                {item.admin_reply && (
                  <div
                    style={{
                      marginTop: "12px",
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--colorSecondary)", fontWeight: "700", fontSize: "0.84rem", marginBottom: "4px" }}>
                      <i className="bx bx-check-circle"></i>
                      الرد السابق:
                    </div>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--textPrimary)", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                      {item.admin_reply}
                    </p>
                  </div>
                )}

                {/* Expanded Action Panel */}
                {isOpen && (
                  <div
                    className="metro-animate-fade"
                    style={{
                      marginTop: "18px",
                      paddingTop: "18px",
                      borderTop: "1px solid var(--borderGlass)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {/* Directory Proposal Direct Action Banner */}
                    {isDirectoryItem && (
                      <div
                        style={{
                          background: "var(--bgGlass)",
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div
                            style={{
                               fontSize: "0.84rem", fontWeight: "700", color: "var(--textSecondary)"
                            }}
                          >
                            <i className="bx bx-book-bookmark" style={{ fontSize: "1rem", marginLeft: "6px" }}></i>
                            الأجراءات:
                          </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleOpenAddToDirectory(item)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "10px",
                              fontSize: "0.85rem",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <i className="bx bx-plus-circle" style={{ fontSize: "1.1rem" }}></i>
                            <span>إضافة إلى الدليل الآن </span>
                          </button>

                          <Link
                            className="btn btn-cancel"
                            href="/admin/directory"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              border: "none",
                              color: "var(--textSecondary)",
                              padding: "6px 14px",
                              borderRadius: "10px",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span>فتح إدارة الدليل</span>
                            <i className="bx bx-link-external"></i>
                          </Link>
                        </div>
                        </div>

                      </div>
                    )}

                    {/* Metro Direct Action Banner */}
                    {getItemSection(item) === "metro" && (
                      <div
                        style={{
                          background: "rgba(16, 185, 129, 0.05)",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                          <i className="bx bx-train" style={{ color: "#10b981", fontSize: "1.2rem" }}></i>
                          <span>بلاغ متعلق بخدمة ومحطات مترو القاهرة</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Link
                            href="/metro"
                            target="_blank"
                            style={{
                              background: "var(--bgSecondary)",
                              border: "1px solid var(--borderGlass)",
                              color: "var(--textPrimary)",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>معاينة المترو</span>
                            <i className="bx bx-link-external"></i>
                          </Link>
                          <Link
                            href="/admin/metro"
                            style={{
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              color: "#10b981",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>إدارة المترو</span>
                            <i className="bx bx-cog"></i>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Monorail Direct Action Banner */}
                    {getItemSection(item) === "monorail" && (
                      <div
                        style={{
                          background: "rgba(59, 130, 246, 0.05)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                          <i className="bx bx-train" style={{ color: "#3b82f6", fontSize: "1.2rem" }}></i>
                          <span>بلاغ متعلق بخدمة ومحطات قطار المونوريل</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Link
                            href="/monorail"
                            target="_blank"
                            style={{
                              background: "var(--bgSecondary)",
                              border: "1px solid var(--borderGlass)",
                              color: "var(--textPrimary)",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>معاينة المونوريل</span>
                            <i className="bx bx-link-external"></i>
                          </Link>
                          <Link
                            href="/admin/monorail"
                            style={{
                              background: "rgba(59, 130, 246, 0.15)",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              color: "#3b82f6",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>إدارة المونوريل</span>
                            <i className="bx bx-cog"></i>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Status update buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--textSecondary)" }}>تغيير الحالة:</span>

                      <button
                        onClick={() => handleUpdateStatus(item, "pending")}
                        disabled={updatingStatusId === item.id || item.status === "pending"}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          background: item.status === "pending" ? "#f59e0b" : "rgba(245, 158, 11, 0.1)",
                          color: item.status === "pending" ? "#fff" : "#f59e0b",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          cursor: item.status === "pending" ? "default" : "pointer",
                          opacity: item.status === "pending" ? 0.85 : 1,
                        }}
                      >
                        قيد الانتظار 
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item, "reviewed")}
                        disabled={updatingStatusId === item.id || item.status === "reviewed"}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          background: item.status === "reviewed" ? "#3b82f6" : "rgba(59, 130, 246, 0.1)",
                          color: item.status === "reviewed" ? "#fff" : "#3b82f6",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          cursor: item.status === "reviewed" ? "default" : "pointer",
                          opacity: item.status === "reviewed" ? 0.85 : 1,
                        }}
                      >
                        تمت المراجعة 
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item, "action_taken")}
                        disabled={updatingStatusId === item.id || item.status === "action_taken"}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          background: item.status === "action_taken" ? "#10b981" : "rgba(16, 185, 129, 0.1)",
                          color: item.status === "action_taken" ? "#fff" : "#10b981",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          cursor: item.status === "action_taken" ? "default" : "pointer",
                          opacity: item.status === "action_taken" ? 0.85 : 1,
                        }}
                      >
                        اعتماد وتنفيذ 
                      </button>
                    </div>

                    {/* Admin Reply Input */}
                    <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "14px" }}>
                      <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "8px" }}>
                        إرسال رد رسمي للمستخدم (سيصله إشعار مباشر في حسابه 🔔):
                      </label>
                      <textarea
                        className="input-fields"
                        placeholder="اكتب رد الإدارة هنا، مثل: تم تدقيق الرقم وإضافته بنجاح لدليل الهاتف، شكراً لمساهمتك..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          fontSize: "0.88rem",
                          lineHeight: "1.5",
                          resize: "vertical",
                        }}
                      />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            padding: "6px 14px",
                            borderRadius: "10px",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <i className="bx bx-trash"></i>
                          حذف البلاغ
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendReply(item)}
                          disabled={replyingId === item.id || !replyText.trim()}
                          style={{
                            background: "var(--colorSecondary)",
                            color: "#ffffff",
                            padding: "8px 20px",
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            border: "none",
                            cursor: replyingId === item.id || !replyText.trim() ? "not-allowed" : "pointer",
                            opacity: replyingId === item.id || !replyText.trim() ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {replyingId === item.id ? "جاري إرسال الرد..." : "إرسال الرد وإشعار المستخدم "}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        title="تأكيد حذف البلاغ"
        titleColor="#ef4444"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(239, 68, 68, 0.3)"
        message="هل أنت متأكد من رغبتك في حذف هذا البلاغ/الاقتراح نهائياً؟ لن يمكن التراجع عن هذه العملية."
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : " احذف ",
          onClick: handleConfirmDelete,
          bgColor: "#ef4444",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setItemToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />,
        }}
      />

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt="معاينة الصورة"
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>
      )}

      {/* Add to Directory Modal */}
      {dirModalItem && (
        <div
          onClick={() => !isSubmittingDir && setDirModalItem(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            direction: "rtl",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="metro-animate-scale-up"
            style={{
              background: "var(--bgPrimary, #111827)",
              border: "1px solid var(--borderGlass, rgba(255,255,255,0.12))",
              borderRadius: "20px",
              padding: "24px 28px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              color: "var(--textPrimary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    color: "#06b6d4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  <i className="bx bx-book-add"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    إضافة المقترح إلى دليل الهاتف
                  </h3>
                  <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "var(--textSecondary)" }}>
                    تأكيد إدراج البيانات المقترحة مباشرة في قاعدة بيانات الدليل
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmittingDir && setDirModalItem(null)}
                style={{
                  background: "var(--bgSecondary, rgba(255,255,255,0.06))",
                  border: "1px solid var(--borderGlass)",
                  color: "var(--textSecondary)",
                  borderRadius: "10px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Type Switcher */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                background: "var(--bgSecondary, rgba(255,255,255,0.04))",
                padding: "4px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid var(--borderGlass)",
              }}
            >
              <button
                type="button"
                onClick={() => setDirType("phone")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: dirType === "phone" ? "linear-gradient(135deg, #06b6d4, #0284c7)" : "transparent",
                  color: dirType === "phone" ? "#fff" : "var(--textSecondary)",
                  fontWeight: "800",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bx bx-phone-call"></i>
                <span>رقم هاتف / جهة خدمة</span>
              </button>

              <button
                type="button"
                onClick={() => setDirType("code")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: dirType === "code" ? "linear-gradient(135deg, #a855f7, #6366f1)" : "transparent",
                  color: dirType === "code" ? "#fff" : "var(--textSecondary)",
                  fontWeight: "800",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bx bx-hash"></i>
                <span>كود شبكة اتصالات</span>
              </button>
            </div>

            {/* Form Fields */}
            {dirType === "phone" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    اسم الجهة أو الخدمة <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={dirPhoneName}
                    onChange={(e) => setDirPhoneName(e.target.value)}
                    placeholder="مثال: بنك مصر، طوارئ الكهرباء، صيدليات مصر..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    رقم الهاتف / الخط الساخن <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={dirPhoneNumber}
                    onChange={(e) => setDirPhoneNumber(e.target.value)}
                    placeholder="مثال: 19888 أو 0225123456"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      textAlign: "right",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    التخصص / الفئة
                  </label>
                  <input
                    type="text"
                    value={dirPhoneSpecialty}
                    onChange={(e) => setDirPhoneSpecialty(e.target.value)}
                    placeholder="مثال: بنوك ومصارف، طوارئ، اتصالات، عام..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      marginBottom: "6px",
                    }}
                  />
                  {/* Quick specialty tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["طوارئ وإسعاف", "بنوك ومصارف", "خدمات حكومية", "اتصالات وإنترنت", "شركات شحن وتوصيل", "مستشفيات وصيدليات", "عام"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDirPhoneSpecialty(s)}
                        style={{
                          background: dirPhoneSpecialty === s ? "rgba(6, 182, 212, 0.25)" : "rgba(255,255,255,0.05)",
                          border: dirPhoneSpecialty === s ? "1px solid #06b6d4" : "1px solid var(--borderGlass)",
                          color: dirPhoneSpecialty === s ? "#38bdf8" : "var(--textSecondary)",
                          padding: "3px 10px",
                          borderRadius: "16px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    ملاحظات أو تفاصيل إضافية (اختياري)
                  </label>
                  <textarea
                    value={dirPhoneDesc}
                    onChange={(e) => setDirPhoneDesc(e.target.value)}
                    rows={2}
                    placeholder="مواعيد العمل، الخدمة المتاحة، إلخ..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.88rem",
                      resize: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    شركة الاتصالات <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {[
                      { id: "vodafone", label: "فودافون", color: "#e60000", bg: "rgba(230,0,0,0.15)" },
                      { id: "orange", label: "أورنج", color: "#ff7900", bg: "rgba(255,121,0,0.15)" },
                      { id: "etisalat", label: "اتصالات", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
                      { id: "we", label: "وي", color: "#a855f7", bg: "rgba(168,85,247,0.15)" },
                    ].map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setDirCodeCompany(comp.id as "vodafone" | "orange" | "etisalat" | "we")}
                        style={{
                          padding: "8px 6px",
                          borderRadius: "10px",
                          border: dirCodeCompany === comp.id ? `2px solid ${comp.color}` : "1px solid var(--borderGlass)",
                          background: dirCodeCompany === comp.id ? comp.bg : "var(--bgSecondary)",
                          color: dirCodeCompany === comp.id ? comp.color : "var(--textSecondary)",
                          fontWeight: "800",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {comp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    عنوان الخدمة / الغرض <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={dirCodeTitle}
                    onChange={(e) => setDirCodeTitle(e.target.value)}
                    placeholder="مثال: معرفة الرصيد، تجديد باقة فلكس، باقات الإنترنت..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    الكود المطلوب <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={dirCodeValue}
                    onChange={(e) => setDirCodeValue(e.target.value)}
                    placeholder="مثال: *868*1# أو *100#"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.95rem",
                      fontFamily: "monospace",
                      fontWeight: "700",
                      boxSizing: "border-box",
                      textAlign: "right",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}>
                    القسم / التصنيف
                  </label>
                  <input
                    type="text"
                    value={dirCodeSection}
                    onChange={(e) => setDirCodeSection(e.target.value)}
                    placeholder="مثال: خدمات الرصيد والتحويل، باقات الإنترنت..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--borderGlass)",
                      background: "var(--bgSecondary)",
                      color: "var(--textPrimary)",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      marginBottom: "6px",
                    }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["خدمات الرصيد والتحويل", "باقات الإنترنت والميجابايتس", "باقات المكالمات والأنظمة", "خدمات الشريحة والخط", "خدمات عامة"].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDirCodeSection(sec)}
                        style={{
                          background: dirCodeSection === sec ? "rgba(168, 85, 247, 0.25)" : "rgba(255,255,255,0.05)",
                          border: dirCodeSection === sec ? "1px solid #a855f7" : "1px solid var(--borderGlass)",
                          color: dirCodeSection === sec ? "#c084fc" : "var(--textSecondary)",
                          padding: "3px 10px",
                          borderRadius: "16px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Checkbox auto update */}
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                id="dirAutoActionTaken"
                checked={dirAutoActionTaken}
                onChange={(e) => setDirAutoActionTaken(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#06b6d4" }}
              />
              <label htmlFor="dirAutoActionTaken" style={{ fontSize: "0.82rem", color: "var(--textPrimary)", cursor: "pointer", fontWeight: "600" }}>
                تحديث حالة البلاغ تلقائياً إلى &quot;تم اتخاذ إجراء&quot; وإشعار المستخدم باعتماد طلبه
              </label>
            </div>

            {/* Footer buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                onClick={() => !isSubmittingDir && setDirModalItem(null)}
                disabled={isSubmittingDir}
                style={{
                  background: "var(--bgSecondary)",
                  border: "1px solid var(--borderGlass)",
                  color: "var(--textSecondary)",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: isSubmittingDir ? "not-allowed" : "pointer",
                }}
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleConfirmAddToDirectory}
                disabled={isSubmittingDir}
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0284c7)",
                  border: "none",
                  color: "#fff",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  fontSize: "0.88rem",
                  fontWeight: "800",
                  cursor: isSubmittingDir ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(6, 182, 212, 0.35)",
                  opacity: isSubmittingDir ? 0.7 : 1,
                }}
              >
                {isSubmittingDir ? (
                  <>
                    <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span>جاري الحفظ في الدليل...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-check-circle" style={{ fontSize: "1.15rem" }}></i>
                    <span>تأكيد وإضافة للدليل الآن ✅</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
