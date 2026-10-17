"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  UnifiedReport,
  CategoryFilterType,
  StatusFilterType,
  IncomingReportsStats,
  ParkingProposalData,
  DeletePlaceDbData,
} from "../types";
import { getItemSection } from "../utils";

export function useIncomingReports() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.is_admin || false;

  const [items, setItems] = useState<UnifiedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [itemToDelete, setItemToDelete] = useState<UnifiedReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [placeToDeleteFromDb, setPlaceToDeleteFromDb] = useState<DeletePlaceDbData | null>(null);
  const [isDeletingPlace, setIsDeletingPlace] = useState(false);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [dirModalItem, setDirModalItem] = useState<UnifiedReport | null>(null);
  const [parkingModalItem, setParkingModalItem] = useState<ParkingProposalData | null>(null);

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) {
      router.push("/admin");
    }
  }, [user, profile, authLoading, router]);

  // Load all reports from database
  useEffect(() => {
    if (!user || !isAdmin) return;

    let isMounted = true;

    const loadAllReports = async () => {
      if (!supabase) return;
      try {
        const [appFeedbackRes, placeReportsRes, contactMsgsRes, routeInteractionsRes] = await Promise.all([
          supabase.from("app_feedback").select("*").neq("status", "deleted").order("created_at", { ascending: false }),
          supabase.from("place_reports").select("*").neq("status", "deleted").order("created_at", { ascending: false }),
          supabase.from("contact_messages").select("*").neq("status", "deleted").order("created_at", { ascending: false }),
          supabase
            .from("route_interactions")
            .select("*")
            .neq("status", "deleted")
            .eq("interaction_type", "report")
            .order("created_at", { ascending: false }),
        ]);

        if (!isMounted) return;

        // Collect all distinct user IDs
        const allUserIds = new Set<string>();
        (appFeedbackRes.data || []).forEach((r) => r.user_id && allUserIds.add(r.user_id));
        (placeReportsRes.data || []).forEach((r) => r.user_id && allUserIds.add(r.user_id));
        (routeInteractionsRes.data || []).forEach((r) => r.user_id && allUserIds.add(r.user_id));

        // Collect all distinct place IDs
        const allPlaceIds = new Set<string>();
        (placeReportsRes.data || []).forEach((r) => r.place_id && allPlaceIds.add(r.place_id));

        // Fetch user profiles & place names
        let profilesMap = new Map<string, any>();
        if (allUserIds.size > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, username, avatar_url")
            .in("id", Array.from(allUserIds));
          if (profs) {
            profilesMap = new Map(profs.map((p) => [p.id, p]));
          }
        }

        let placesMap = new Map<string, string>();
        if (allPlaceIds.size > 0) {
          const { data: pls } = await supabase
            .from("places")
            .select("id, name")
            .in("id", Array.from(allPlaceIds));
          if (pls) {
            placesMap = new Map(pls.map((p) => [p.id, p.name]));
          }
        }

        // Map Feedback
        const mappedFeedback: UnifiedReport[] = (appFeedbackRes.data || []).map((item) => ({
          id: item.id,
          source: "feedback",
          user_id: item.user_id,
          feedback_type: item.type,
          category: item.category,
          title: item.title || (item.type === "bug" ? "بلاغ عن خطأ في النظام" : "اقتراح من مستخدم"),
          content: item.content,
          image_url: item.image_url,
          status: item.status || "pending",
          admin_reply: item.admin_reply,
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_profile: profilesMap.get(item.user_id) || null,
        }));

        // Map Places
        const mappedPlaces: UnifiedReport[] = (placeReportsRes.data || []).map((item) => {
          const pName = placesMap.get(item.place_id) || "مكان محذوف أو غير معروف";
          let problemTitle = "بلاغ عن مكان";
          switch (item.problem_type) {
            case "name":
              problemTitle = "تعديل اسم المكان";
              break;
            case "address":
              problemTitle = "تعديل العنوان / الخريطة";
              break;
            case "phone_website":
              problemTitle = "تعديل الهاتف أو الموقع";
              break;
            case "working_hours":
              problemTitle = "تعديل مواعيد العمل";
              break;
            case "closed":
              problemTitle = "إبلاغ أن المكان مغلق";
              break;
            case "category":
              problemTitle = "تعديل الفئة والتصنيف";
              break;
            default:
              problemTitle = item.details?.isMultiReport ? "بلاغ متعدد التعديلات" : "بلاغ وملاحظات مكان";
          }

          return {
            id: item.id,
            source: "place",
            user_id: item.user_id,
            place_id: item.place_id,
            place_name: pName,
            problem_type: item.problem_type,
            details: item.details,
            title: `بلاغ عن: ${pName} (${problemTitle})`,
            content: item.comment || `تم تقديم بلاغ (${problemTitle}) بخصوص هذا المكان.`,
            image_url: item.image_url,
            status: item.status || "pending",
            admin_reply: item.admin_reply,
            created_at: item.created_at,
            user_profile: profilesMap.get(item.user_id) || null,
          };
        });

        // Map Contacts
        const mappedContacts: UnifiedReport[] = (contactMsgsRes.data || []).map((item) => ({
          id: item.id,
          source: "contact",
          first_name: item.first_name,
          last_name: item.last_name,
          sender_email: item.email,
          sender_phone: item.phone,
          subject: item.subject,
          title: `رسالة تواصل: ${item.subject || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "رسالة استفسار"}`,
          content: item.message || "",
          image_url: null,
          status: item.status || "pending",
          admin_reply: item.admin_reply,
          created_at: item.created_at,
          user_profile: {
            full_name: `${item.first_name || ""} ${item.last_name || ""}`.trim() || "زائر للموقع",
            email: item.email,
            phone: item.phone,
          },
        }));

        // Map Microbus & BRT Route Interactions
        const mappedMicrobus: UnifiedReport[] = (routeInteractionsRes.data || []).map((item) => {
          const isBrt =
            item.comment?.includes("الأتوبيس الترددي") ||
            item.comment?.includes("BRT") ||
            item.comment?.includes("ترددي") ||
            item.route_destination?.includes("BRT") ||
            item.station_name?.includes("BRT");

          let reasonText = isBrt ? "بلاغ عن الأتوبيس الترددي BRT" : "بلاغ عن خط أو موقف سرفيس";

          if (isBrt) {
            if (item.comment?.includes("محطة/مسار BRT مقترح")) {
              reasonText = `اقتراح مسار/محطة للأتوبيس الترددي BRT (${item.station_name || ""} ⬅️ ${item.route_destination || ""})`.trim();
            } else if (item.report_reason === "fare") {
              reasonText = `سعر تذكرة الأتوبيس الترددي غير صحيح (${item.route_destination || item.station_name || ""})`.trim();
            } else if (item.report_reason === "via") {
              reasonText = `مسار الأتوبيس الترددي غير دقيق (${item.route_destination || item.station_name || ""})`.trim();
            } else if (item.report_reason === "location") {
              reasonText = `موقع محطة الأتوبيس الترددي غير صحيح (${item.station_name || ""})`.trim();
            }
          } else {
            if (item.comment?.includes("[خط غير موجود في الدليل]")) {
              reasonText = "طلب إضافة خط سرفيس غير موجود";
            } else if (item.report_reason === "fare") {
              reasonText = "الأجرة أو التعريفة غير صحيحة";
            } else if (item.report_reason === "via") {
              reasonText = "خط السير أو المناطق غير دقيقة";
            } else if (item.report_reason === "location") {
              reasonText = "موقع الموقف غير صحيح";
            }
          }

          return {
            id: item.id,
            source: "microbus",
            category: isBrt ? "الأتوبيس الترددي BRT" : "سرفيس ومواقف",
            user_id: item.user_id,
            route_id: item.route_id,
            station_id: item.station_id,
            report_reason: item.report_reason,
            rating: item.rating,
            title: reasonText,
            content: item.comment || (isBrt ? "بلاغ حول الأتوبيس الترددي BRT" : "بلاغ حول خط المواصلات"),
            image_url: null,
            status: item.status || "pending",
            admin_reply: item.admin_reply || null,
            created_at: item.created_at,
            user_profile: profilesMap.get(item.user_id) || null,
          };
        });

        const combined = [...mappedFeedback, ...mappedPlaces, ...mappedContacts, ...mappedMicrobus].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (isMounted) {
          setItems(combined);
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        console.error("Failed to fetch incoming reports:", err);
        if (isMounted) {
          showToast("error", "فشل تحميل البلاغات الواردة: " + errMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAllReports();

    return () => {
      isMounted = false;
    };
  }, [user, isAdmin, refreshKey, showToast]);

  // KPI Stats Overview
  const stats: IncomingReportsStats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((f) => f.status === "pending").length;
    const reviewed = items.filter((f) => f.status === "reviewed").length;
    const actionTaken = items.filter(
      (f) => f.status === "action_taken" || f.status === "accepted" || f.status === "replied"
    ).length;

    const placesCount = items.filter((f) => getItemSection(f) === "places").length;
    const contactsCount = items.filter((f) => getItemSection(f) === "contacts").length;
    const microbusCount = items.filter((f) => getItemSection(f) === "microbus").length;
    const busStationsCount = items.filter((f) => getItemSection(f) === "bus_stations").length;
    const brtCount = items.filter((f) => getItemSection(f) === "brt").length;
    const metroCount = items.filter((f) => getItemSection(f) === "metro").length;
    const monorailCount = items.filter((f) => getItemSection(f) === "monorail").length;
    const lrtCount = items.filter((f) => getItemSection(f) === "lrt").length;
    const railwayCount = items.filter((f) => getItemSection(f) === "railways").length;
    const airportsCount = items.filter((f) => getItemSection(f) === "airports").length;
    const portsCount = items.filter((f) => getItemSection(f) === "ports").length;
    const parkingCount = items.filter((f) => getItemSection(f) === "parking").length;
    const directoryCount = items.filter((f) => getItemSection(f) === "directory").length;
    const bugsCount = items.filter((f) => getItemSection(f) === "bugs").length;
    const suggestionsCount = items.filter((f) => getItemSection(f) === "suggestions").length;
    const routesCount = items.filter((f) => getItemSection(f) === "routes").length;

    return {
      total,
      pending,
      reviewed,
      actionTaken,
      placesCount,
      contactsCount,
      microbusCount,
      busStationsCount,
      brtCount,
      metroCount,
      monorailCount,
      lrtCount,
      railwayCount,
      airportsCount,
      portsCount,
      parkingCount,
      directoryCount,
      bugsCount,
      suggestionsCount,
      routesCount,
    };
  }, [items]);

  // Filtered reports
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && item.status !== "pending") return false;
        if (statusFilter === "reviewed" && item.status !== "reviewed") return false;
        if (
          statusFilter === "action_taken" &&
          item.status !== "action_taken" &&
          item.status !== "accepted" &&
          item.status !== "replied"
        )
          return false;
        if (statusFilter === "rejected" && item.status !== "rejected") return false;
      }

      // 2. Category Filter
      if (categoryFilter !== "all") {
        const sec = getItemSection(item);
        if (categoryFilter !== sec) return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = (item.user_profile?.full_name || "").toLowerCase();
        const userEmail = (item.user_profile?.email || item.sender_email || "").toLowerCase();
        const userPhone = (item.user_profile?.phone || item.sender_phone || "").toLowerCase();
        const title = (item.title || "").toLowerCase();
        const content = (item.content || "").toLowerCase();
        const placeName = (item.place_name || "").toLowerCase();

        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          userPhone.includes(q) ||
          title.includes(q) ||
          content.includes(q) ||
          placeName.includes(q)
        );
      }

      return true;
    });
  }, [items, statusFilter, categoryFilter, searchQuery]);

  // Toggle item card expansion
  const toggleItemExpansion = useCallback((itemId: string) => {
    setActiveItemId((prev) => (prev === itemId ? null : itemId));
    setReplyText("");
  }, []);

  // Update report status
  const handleUpdateStatus = useCallback(
    async (item: UnifiedReport, newStatus: string) => {
      if (!supabase || !isAdmin) return;
      setUpdatingStatusId(item.id);

      try {
        if (item.source === "feedback") {
          const { error } = await supabase
            .from("app_feedback")
            .update({
              status: newStatus,
              admin_reply: replyText.trim() || item.admin_reply,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);

          if (error) throw error;

          if (item.user_id) {
            let notifTitle = "";
            let notifMessage = "";
            const isSuggestion = item.feedback_type === "suggestion";

            if (newStatus === "action_taken") {
              notifTitle = isSuggestion ? "💡 تم اعتماد اقتراحك وتطبيقه!" : "✅ تم حل البلاغ المقدم من قبلك!";
              notifMessage = isSuggestion
                ? `يسرنا إبلاغك بأن الإدارة قد اعتمدت اقتراحك بخصوص "${item.category || item.title || "الخدمة"}". شكراً لمساهمتك! ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`
                : `تم اتخاذ الإجراء اللازم وحل المشكلة التي أبلغت عنها: "${item.title || "البلاغ"}". ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;
            } else if (newStatus === "reviewed") {
              notifTitle = "🔎 تمت مراجعة طلبك";
              notifMessage = `تمت مراجعة طلبك وهو قيد التدقيق حالياً من قِبل الإدارة. ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;
            } else {
              notifTitle = "⏳ تم استلام طلبك";
              notifMessage = `طلبك قيد الانتظار والدراسة من قِبل الإدارة. ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;
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
          }
        } else if (item.source === "place") {
          const { error: updateError } = await supabase
            .from("place_reports")
            .update({
              status: newStatus,
              admin_reply: replyText.trim() || item.admin_reply,
            })
            .eq("id", item.id);

          if (updateError) throw updateError;

          if (item.user_id && item.place_id) {
            let statusTextArabic = "";
            if (newStatus === "reviewed") statusTextArabic = "تحت الدراسة والنظر";
            if (newStatus === "accepted") statusTextArabic = "مقبول وتم التعديل";
            if (newStatus === "rejected") statusTextArabic = "مرفوض";

            const title = `تحديث بخصوص بلاغك حول: ${item.place_name || "المكان"}`;
            const message = `تم تغيير حالة إبلاغك إلى (${statusTextArabic}). ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`;

            await supabase.from("notifications").insert([
              {
                user_id: item.user_id,
                title,
                message,
                type: newStatus === "accepted" ? "success" : newStatus === "rejected" ? "warning" : "info",
                link: `/places/${item.place_id}`,
              },
            ]);
          }
        } else if (item.source === "contact") {
          const { error } = await supabase
            .from("contact_messages")
            .update({
              status: newStatus,
              admin_reply: replyText.trim() || item.admin_reply,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);

          if (error) throw error;
        } else if (item.source === "microbus") {
          try {
            await supabase
              .from("route_interactions")
              .update({
                status: newStatus,
                admin_reply: replyText.trim() || item.admin_reply,
              })
              .eq("id", item.id);
          } catch (e) {
            console.warn("Could not update route_interactions status:", e);
          }

          if (item.user_id) {
            const isBrt = getItemSection(item) === "brt";
            await supabase.from("notifications").insert([
              {
                user_id: item.user_id,
                title: newStatus === "action_taken" ? "✅ تم حل البلاغ وتحديث البيانات!" : "ℹ️ تحديث بخصوص بلاغك",
                message: `تم تحديث حالة بلاغك بخصوص ${isBrt ? "الأتوبيس الترددي BRT" : "خط المواصلات والسرفيس"}. ${replyText.trim() ? `رد الإدارة: ${replyText.trim()}` : ""}`,
                type: newStatus === "action_taken" ? "success" : "info",
                link: isBrt ? "/brt" : "/microbus",
              },
            ]);
          }
        }

        setItems((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: newStatus, admin_reply: replyText.trim() || f.admin_reply }
              : f
          )
        );

        setReplyText("");
        showToast("success", "تم تحديث حالة البلاغ بنجاح!");
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        console.error("Error updating status:", err);
        showToast("error", "فشل تحديث الحالة: " + errMsg);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [isAdmin, replyText, showToast]
  );

  // Send admin reply
  const handleSendReply = useCallback(
    async (item: UnifiedReport) => {
      if (!supabase || !isAdmin || !replyText.trim()) return;
      setReplyingId(item.id);

      try {
        const trimmedReply = replyText.trim();

        if (item.source === "contact") {
          const { error: updateError } = await supabase
            .from("contact_messages")
            .update({
              status: "replied",
              admin_reply: trimmedReply,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);

          if (updateError) throw updateError;

          if (item.sender_email) {
            const emailResponse = await fetch("/api/contact/reply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                toEmail: item.sender_email,
                toName: item.user_profile?.full_name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "المستخدم",
                originalMessage: item.content,
                replyText: trimmedReply,
              }),
            });

            const emailResult = await emailResponse.json();
            if (!emailResponse.ok) {
              throw new Error(emailResult.error || "فشل إرسال الإيميل للمستخدم، ولكن تم حفظ الرد.");
            }
          }

          setItems((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: "replied", admin_reply: trimmedReply } : f))
          );
          setReplyText("");
          showToast("success", "تم حفظ الرد وإرسال الإيميل للمستخدم بنجاح! 🎉");
          return;
        }

        if (item.source === "feedback") {
          const { error: updateError } = await supabase
            .from("app_feedback")
            .update({
              admin_reply: trimmedReply,
              status: item.status === "pending" ? "reviewed" : item.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);

          if (updateError) throw updateError;

          if (item.user_id) {
            await supabase.from("notifications").insert([
              {
                user_id: item.user_id,
                title: "💬 رد من إدارة المنصة على طلبك",
                message: `رد الإدارة بخصوص "${item.category || item.title || "طلبك"}": ${trimmedReply}`,
                type: "info",
                link: "/profile",
              },
            ]);
          }
        } else if (item.source === "place") {
          const { error: updateError } = await supabase
            .from("place_reports")
            .update({ admin_reply: trimmedReply })
            .eq("id", item.id);

          if (updateError) throw updateError;

          if (item.user_id && item.place_id) {
            await supabase.from("notifications").insert([
              {
                user_id: item.user_id,
                title: `💬 رد الإدارة على بلاغك حول: ${item.place_name || "المكان"}`,
                message: `رد الإدارة: ${trimmedReply}`,
                type: "info",
                link: `/places/${item.place_id}`,
              },
            ]);
          }
        } else if (item.source === "microbus") {
          try {
            await supabase
              .from("route_interactions")
              .update({ admin_reply: trimmedReply })
              .eq("id", item.id);
          } catch (e) {
            console.warn("Could not update route_interactions reply:", e);
          }

          if (item.user_id) {
            const isBrt = getItemSection(item) === "brt";
            await supabase.from("notifications").insert([
              {
                user_id: item.user_id,
                title: `💬 رد الإدارة على بلاغك بخصوص ${isBrt ? "الأتوبيس الترددي BRT" : "خط المواصلات"}`,
                message: `رد الإدارة: ${trimmedReply}`,
                type: "info",
                link: isBrt ? "/brt" : "/microbus",
              },
            ]);
          }
        }

        setItems((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  admin_reply: trimmedReply,
                  status: f.status === "pending" && f.source === "feedback" ? "reviewed" : f.status,
                }
              : f
          )
        );

        setReplyText("");
        showToast("success", "تم حفظ الرد وإشعار المستخدم بنجاح! 💬");
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        console.error("Error sending reply:", err);
        showToast("error", "فشل إرسال الرد: " + errMsg);
      } finally {
        setReplyingId(null);
      }
    },
    [isAdmin, replyText, showToast]
  );

  // Delete item
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete || !supabase || !isAdmin) return;
    setIsDeleting(true);

    try {
      const target = itemToDelete;
      if (target.source === "feedback") {
        const { data: delData, error: delErr } = await supabase
          .from("app_feedback")
          .delete()
          .eq("id", target.id)
          .select();

        if (delErr || !delData || delData.length === 0) {
          await supabase
            .from("app_feedback")
            .update({ status: "deleted" })
            .eq("id", target.id);
        }
      } else if (target.source === "place") {
        const { data: delData, error: delErr } = await supabase
          .from("place_reports")
          .delete()
          .eq("id", target.id)
          .select();

        if (delErr || !delData || delData.length === 0) {
          await supabase
            .from("place_reports")
            .update({ status: "deleted" })
            .eq("id", target.id);
        }
      } else if (target.source === "contact") {
        const { data: delData, error: delErr } = await supabase
          .from("contact_messages")
          .delete()
          .eq("id", target.id)
          .select();

        if (delErr || !delData || delData.length === 0) {
          await supabase
            .from("contact_messages")
            .update({ status: "deleted" })
            .eq("id", target.id);
        }
      } else if (target.source === "microbus") {
        const { data: delData, error: delErr } = await supabase
          .from("route_interactions")
          .delete()
          .eq("id", target.id)
          .select();

        if (delErr || !delData || delData.length === 0) {
          try {
            await supabase
              .from("route_interactions")
              .update({ status: "deleted" })
              .eq("id", target.id);
          } catch (e) {
            console.warn("Could not soft delete route interaction:", e);
          }
        }
      }

      setItems((prev) => prev.filter((f) => f.id !== target.id));
      if (activeItemId === target.id) {
        setActiveItemId(null);
      }
      showToast("success", "تم حذف البلاغ بنجاح 🗑️");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error deleting report:", err);
      showToast("error", "فشل حذف البلاغ: " + errMsg);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, isAdmin, activeItemId, showToast]);

  // Delete place completely from database
  const handleConfirmDeletePlaceFromDb = useCallback(async () => {
    if (!placeToDeleteFromDb || !supabase || !isAdmin) return;
    setIsDeletingPlace(true);

    const { placeId, placeName, reportId } = placeToDeleteFromDb;
    try {
      await Promise.allSettled([
        supabase.from("branches").delete().eq("place_id", placeId),
        supabase.from("favorite_places").delete().eq("place_id", placeId),
        supabase.from("place_notes").delete().eq("place_id", placeId),
        supabase.from("reviews").delete().eq("place_id", placeId),
      ]);

      let { error: placeError } = await supabase.from("places").delete().eq("id", placeId);

      if (placeError && placeError.message?.toLowerCase().includes("place_reports")) {
        await supabase.from("place_reports").delete().eq("place_id", placeId);
        const retry = await supabase.from("places").delete().eq("id", placeId);
        placeError = retry.error;
      }

      if (placeError) throw placeError;

      if (reportId) {
        try {
          const { data: delData, error: delErr } = await supabase
            .from("place_reports")
            .delete()
            .eq("id", reportId)
            .select();

          if (delErr || !delData || delData.length === 0) {
            await supabase.from("place_reports").update({ status: "deleted" }).eq("id", reportId);
          }
        } catch (repErr) {
          console.warn("Could not delete report associated with place:", repErr);
        }
      }

      setItems((prev) =>
        prev
          .filter((r) => (reportId ? r.id !== reportId : true))
          .map((r) => {
            if (r.place_id === placeId) {
              return {
                ...r,
                place_name: "مكان محذوف أو غير معروف",
              };
            }
            return r;
          })
      );

      showToast("success", `تم حذف المكان « ${placeName} » نهائياً من قاعدة البيانات بنجاح 🗑️`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Failed to delete place from DB:", err);
      showToast("error", `فشل حذف المكان: ${errMsg}`);
    } finally {
      setIsDeletingPlace(false);
      setPlaceToDeleteFromDb(null);
    }
  }, [placeToDeleteFromDb, isAdmin, showToast]);

  return {
    authLoading,
    loading,
    isAdmin,
    items,
    filteredItems,
    stats,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    activeItemId,
    toggleItemExpansion,
    replyText,
    setReplyText,
    replyingId,
    updatingStatusId,
    toastMessage,
    showToast,
    handleRefresh,
    handleUpdateStatus,
    handleSendReply,
    itemToDelete,
    setItemToDelete,
    isDeleting,
    handleConfirmDelete,
    placeToDeleteFromDb,
    setPlaceToDeleteFromDb,
    isDeletingPlace,
    handleConfirmDeletePlaceFromDb,
    previewImageUrl,
    setPreviewImageUrl,
    dirModalItem,
    setDirModalItem,
    parkingModalItem,
    setParkingModalItem,
    setItems,
  };
}
