import { useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { ReportScope, RouteResult, StationInfo } from "../types";
import { METRO_PROBLEM_OPTIONS } from "../constants";
import { normalizeArabic } from "../utils";

export function useMetroReportModal(
  user: User | null,
  allStations: StationInfo[],
  result: RouteResult | null,
  selectedFrom: string | null,
  selectedTo: string | null
) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<ReportScope>("general");
  const [reportSelectedStation, setReportSelectedStation] = useState<string>("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState<string>("");
  const [showReportStationList, setShowReportStationList] = useState<boolean>(false);
  const [reportProblemType, setReportProblemType] = useState<string>("route_error");
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState<boolean>(false);
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
    if (!reportStationSearchQuery.trim()) return allStations;
    const q = normalizeArabic(reportStationSearchQuery);
    return allStations.filter(
      (s) =>
        normalizeArabic(s.name).includes(q) ||
        (s.landmarks && s.landmarks.some((l) => normalizeArabic(l).includes(q)))
    );
  }, [allStations, reportStationSearchQuery]);

  const handleReportImageSelect = useCallback((file: File | null) => {
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    if (!file) {
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
  }, [reportImagePreview]);

  const handleOpenReportModal = useCallback(
    async (stationName: string | null = null, fromRoute: boolean = false) => {
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
    },
    [reportImagePreview, result, selectedFrom, selectedTo, user]
  );

  const handleCloseReportModal = useCallback(() => {
    if (!reportLoading) {
      setReportModalOpen(false);
      handleReportImageSelect(null);
    }
  }, [reportLoading, handleReportImageSelect]);

  const handleSubmitReport = useCallback(
    async (e: React.FormEvent) => {
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
          const fileName = `metro_${user.id}_${Date.now()}.${fileExt}`;
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

        const curProblemOpt = METRO_PROBLEM_OPTIONS.find((o) => o.id === reportProblemType);
        const typeLabel = curProblemOpt ? curProblemOpt.title : "مشكلة في المترو";

        let scopeInfo = "";
        if (reportTargetScope === "route" && selectedFrom && selectedTo) {
          scopeInfo = `📍 المسار المعني: من ${selectedFrom} إلى ${selectedTo}
💰 السعر المحسوب: ${result?.price || "غير محدد"} ج.م
⏱️ الوقت المقدر: ${result?.estimatedTime || "غير محدد"} دقيقة
🚉 عدد المحطات: ${result?.stationCount || "غير محدد"} محطة`;
        } else if (reportTargetScope === "station" && reportSelectedStation) {
          scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
        }

        const contentText = `بلاغ عن مشكلة في صفحة مترو الأنفاق:
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

        const reportTitle =
          reportTargetScope === "route" && selectedFrom && selectedTo
            ? `مشكلة مسار: من ${selectedFrom} إلى ${selectedTo}`
            : reportTargetScope === "station" && reportSelectedStation
            ? `مشكلة محطة: ${reportSelectedStation}`
            : `مشكلة في المترو (${typeLabel})`;

        const { error: insertError } = await supabase.from("app_feedback").insert([
          {
            user_id: user.id,
            type: "bug",
            category: "مترو الأنفاق",
            title: reportTitle,
            content: contentText,
            image_url: finalImageUrl || null,
            status: "pending",
          },
        ]);

        if (insertError) throw insertError;

        try {
          await supabase.from("notifications").insert([
            {
              user_id: user.id,
              title: "تم استلام بلاغك بنجاح 🚇",
              message: `شكراً لمساعدتنا في تحسين وتدقيق خدمة مترو الأنفاق. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
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
        console.error("Error submitting metro report:", err);
        setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
      } finally {
        setReportLoading(false);
        setReportUploading(false);
      }
    },
    [
      user,
      reportTargetScope,
      reportSelectedStation,
      reportDetails,
      reportImageFile,
      reportImagePreview,
      reportProblemType,
      selectedFrom,
      selectedTo,
      result,
    ]
  );

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
    filteredReportStations,
    reportProblemType,
    setProblemType: setReportProblemType,
    showProblemTypeDropdown,
    setShowProblemTypeDropdown,
    reportDetails,
    setReportDetails,
    reportImageFile,
    reportImagePreview,
    isDraggingImage,
    setIsDraggingImage,
    handleReportImageSelect,
    reportLoading,
    reportUploading,
    reportSuccess,
    reportError,
    limitChecking,
    limitReached,
    handleOpenReportModal,
    handleCloseReportModal,
    handleSubmitReport,
  };
}
