import { useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { MonorailStation, MonorailRouteResult, ReportScope } from "../types";
import { MONORAIL_PROBLEM_OPTIONS, MONORAIL_STATION_DETAILS } from "../constants";
import { normalizeArabic } from "../utils";

export function useMonorailReportModal(
  user: User | null,
  allStationsList: MonorailStation[],
  routeResult: MonorailRouteResult | null,
  selectedFrom: string | null,
  selectedTo: string | null
) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<ReportScope>("general");
  const [reportSelectedStation, setReportSelectedStation] = useState("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState("");
  const [showReportStationList, setShowReportStationList] = useState(false);
  const [reportProblemType, setReportProblemType] = useState("route_error");
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Filtered station list for report search
  const filteredReportStations = useMemo(() => {
    if (!reportStationSearchQuery.trim()) return allStationsList;
    const q = normalizeArabic(reportStationSearchQuery.trim());
    return allStationsList.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) =>
        normalizeArabic(l).includes(q)
      );
      return nameMatch || landmarkMatch;
    });
  }, [allStationsList, reportStationSearchQuery]);

  // Image Selection Handler
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

  // Open Report Modal Handler
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
    setShowProblemTypeDropdown(false);

    if (stationName) {
      setReportTargetScope("station");
      setReportSelectedStation(stationName);
      setReportStationSearchQuery(stationName);
      setReportProblemType("station_info");
    } else if (fromRoute && routeResult && selectedFrom && selectedTo) {
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

  // Submit Report Handler
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
        throw new Error("تعذر الاتصال بقاعدة البيانات.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `monorail_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      }

      const problemOpt = MONORAIL_PROBLEM_OPTIONS.find((o) => o.id === reportProblemType);
      const problemLabel = problemOpt ? problemOpt.title : reportProblemType;

      let reportTitle = "";
      let contentText = "";

      if (reportTargetScope === "station" && reportSelectedStation) {
        reportTitle = `مشكلة في محطة مونوريل: ${reportSelectedStation}`;
        contentText = `[نطاق البلاغ: محطة مونوريل (${reportSelectedStation})]
[نوع المشكلة: ${problemLabel}]
تفاصيل البلاغ:
${reportDetails}`;
      } else if (reportTargetScope === "route" && selectedFrom && selectedTo) {
        reportTitle = `مشكلة في مسار المونوريل: ${selectedFrom} إلى ${selectedTo}`;
        contentText = `[نطاق البلاغ: مسار رحلة مونوريل]
من محطة: ${selectedFrom}
إلى محطة: ${selectedTo}
[نوع المشكلة: ${problemLabel}]
تفاصيل المشكلة:
${reportDetails}`;
      } else {
        reportTitle = `مشكلة عامة في خدمة مونوريل القاهرة`;
        contentText = `[نطاق البلاغ: عام - شبكة المونوريل]
[نوع المشكلة: ${problemLabel}]
تفاصيل البلاغ:
${reportDetails}`;
      }

      const { error: insertError } = await supabase.from("feedbacks").insert([
        {
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || "مستخدم",
          user_email: user.email || "",
          type: "report",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Insert notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🚝",
            message: `شكراً لمساعدتنا في تدقيق شبكة المونوريل. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
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
      console.error("Error submitting monorail report:", err);
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
    showProblemTypeDropdown,
    setShowProblemTypeDropdown,
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
