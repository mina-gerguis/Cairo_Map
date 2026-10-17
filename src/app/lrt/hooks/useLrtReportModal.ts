import { useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { LrtStation, LrtRouteResult, ReportScope } from "../types";
import { PROBLEM_TYPE_LABELS, STATION_DETAILS } from "../constants";
import { normalizeArabic } from "../utils";

export function useLrtReportModal(
  user: User | null,
  allStationsList: LrtStation[],
  result: LrtRouteResult | null,
  selectedFrom: string | null,
  selectedTo: string | null
) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<ReportScope>("general");
  const [reportSelectedStation, setReportSelectedStation] = useState<string>("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState<string>("");
  const [showReportStationList, setShowReportStationList] = useState<boolean>(false);
  const [reportProblemType, setReportProblemType] = useState<string>("route_error");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string>("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const filteredReportStations = useMemo(() => {
    const q = normalizeArabic(reportStationSearchQuery.trim());
    if (!q) return allStationsList;
    return allStationsList.filter((s: LrtStation) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l: string) =>
        normalizeArabic(l).includes(q)
      );
      return nameMatch || landmarkMatch;
    });
  }, [reportStationSearchQuery, allStationsList]);

  const handleReportImageSelect = (file: File | null) => {
    if (!file) {
      if (reportImagePreview) {
        URL.revokeObjectURL(reportImagePreview);
      }
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReportError("حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setReportError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportError("");
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  };

  const handleOpenReportModal = async (
    stationName: string | null = null,
    fromRoute: boolean = false
  ) => {
    setReportError("");
    setReportSuccess(false);
    setReportDetails("");
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    setReportImageFile(null);
    setReportImagePreview(null);
    setIsDraggingImage(false);

    if (stationName) {
      setReportTargetScope("station");
      setReportSelectedStation(stationName);
      setReportStationSearchQuery(stationName);
      setReportProblemType("station_info");
    } else if (fromRoute && result && selectedFrom && selectedTo) {
      setReportTargetScope("route");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("route_error");
    } else {
      setReportTargetScope("general");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("route_error");
    }

    setReportModalOpen(true);

    if (user) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (e) {
        console.error("Error checking feedback limit:", e);
      } finally {
        setLimitChecking(false);
      }
    }
  };

  const handleCloseReportModal = () => {
    if (!reportLoading) {
      setReportModalOpen(false);
      handleReportImageSelect(null);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (reportTargetScope === "station" && !reportSelectedStation) {
      setReportError("يرجى اختيار وتحديد المحطة المراد الإبلاغ عنها أولاً.");
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أو الخطأ.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `lrt_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const typeLabel =
        PROBLEM_TYPE_LABELS[reportProblemType] || "مشكلة في القطار الكهربائي LRT";

      let scopeInfo = "";
      if (reportTargetScope === "route" && selectedFrom && selectedTo) {
        scopeInfo = `📍 المسار المعني: من ${selectedFrom} إلى ${selectedTo}
💰 السعر المحسوب: ${result?.price || "غير محدد"} ج.م
⏱️ الوقت المقدر: ${result?.estimatedTime || "غير محدد"} دقيقة
🚉 عدد المحطات: ${result?.count || "غير محدد"}`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في صفحة القطار الكهربائي LRT:
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle =
        reportTargetScope === "route" && selectedFrom && selectedTo
          ? `مشكلة مسار LRT: من ${selectedFrom} إلى ${selectedTo}`
          : reportTargetScope === "station" && reportSelectedStation
          ? `مشكلة محطة LRT: ${reportSelectedStation}`
          : `مشكلة في القطار الكهربائي LRT (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "القطار الكهربائي LRT",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🚊",
            message: `شكراً لمساعدتنا في تحسين وتدقيق خدمة القطار الكهربائي LRT. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        if (reportImagePreview) {
          URL.revokeObjectURL(reportImagePreview);
        }
        setReportImageFile(null);
        setReportImagePreview(null);
      }, 2200);
    } catch (err: any) {
      console.error("Error submitting LRT report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  return {
    reportModalOpen,
    setReportModalOpen,
    reportTargetScope,
    setReportTargetScope,
    reportSelectedStation,
    setReportSelectedStation,
    reportStationSearchQuery,
    setReportStationSearchQuery,
    showReportStationList,
    setShowReportStationList,
    reportProblemType,
    setReportProblemType,
    reportDetails,
    setReportDetails,
    reportImageFile,
    reportImagePreview,
    isDraggingImage,
    setIsDraggingImage,
    reportLoading,
    reportUploading,
    reportSuccess,
    reportError,
    limitChecking,
    limitReached,
    filteredReportStations,
    handleReportImageSelect,
    handleOpenReportModal,
    handleCloseReportModal,
    handleSubmitReport,
  };
}
