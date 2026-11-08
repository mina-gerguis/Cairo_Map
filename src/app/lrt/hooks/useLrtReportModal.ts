import { useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { LrtStation, LrtRouteResult, ReportScope } from "../types";
import { LRT_PROBLEM_OPTIONS, STATION_DETAILS } from "../constants";
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
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState(false);
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
    const objectUrl = URL.createObjectURL(file);
    setReportImagePreview(objectUrl);
  }, [reportImagePreview]);

  const handleOpenReportModal = async (stationName?: string | null, fromRoute?: boolean) => {
    setReportError("");
    setReportSuccess(false);
    setShowProblemTypeDropdown(false);

    if (fromRoute && result) {
      setReportTargetScope("route");
      setReportProblemType("route_error");
    } else if (stationName) {
      setReportTargetScope("station");
      setReportSelectedStation(stationName);
      setReportStationSearchQuery(stationName);
      setReportProblemType("station_info");
    } else {
      setReportTargetScope("general");
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
    if (reportLoading || reportUploading) return;
    setReportModalOpen(false);
    setShowProblemTypeDropdown(false);
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    setReportImageFile(null);
    setReportImagePreview(null);
    setReportDetails("");
    setReportError("");
    setReportSuccess(false);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أو الملاحظة.");
      return;
    }

    if (reportTargetScope === "station" && !reportSelectedStation) {
      setReportError("يرجى اختيار المحطة المعنية بالبلاغ.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    let imageUrl: string | null = null;

    try {
      if (reportImageFile && supabase) {
        setReportUploading(true);
        const ext = reportImageFile.name.split(".").pop();
        const fileName = `lrt_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("feedback")
          .upload(filePath, reportImageFile);

        if (uploadErr) {
          throw new Error("فشل رفع الصورة المرفقة، يرجى المحاولة مرة أخرى.");
        }

        const { data: pubData } = supabase.storage
          .from("feedback")
          .getPublicUrl(filePath);

        imageUrl = pubData.publicUrl;
        setReportUploading(false);
      }

      const reportPayload = {
        scope: reportTargetScope,
        problem_type: reportProblemType,
        details: reportDetails.trim(),
        station_name: reportTargetScope === "station" ? reportSelectedStation : null,
        route_info:
          reportTargetScope === "route" && result
            ? {
                from: selectedFrom,
                to: selectedTo,
                count: result.count,
                price: result.price,
                estimatedTime: result.estimatedTime,
              }
            : null,
        image_url: imageUrl,
        user_id: user?.id || null,
        user_email: user?.email || null,
        system: "lrt",
        created_at: new Date().toISOString(),
      };

      if (supabase) {
        const { error: insertErr } = await supabase
          .from("system_reports")
          .insert([reportPayload]);

        if (insertErr) {
          const localReports = JSON.parse(
            localStorage.getItem("local_lrt_reports") || "[]"
          );
          localReports.push(reportPayload);
          localStorage.setItem("local_lrt_reports", JSON.stringify(localReports));
        }
      } else {
        const localReports = JSON.parse(
          localStorage.getItem("local_lrt_reports") || "[]"
        );
        localReports.push(reportPayload);
        localStorage.setItem("local_lrt_reports", JSON.stringify(localReports));
      }

      setReportSuccess(true);
      setTimeout(() => {
        handleCloseReportModal();
      }, 2400);
    } catch (err: any) {
      setReportError(err.message || "حدث خطأ أثناء إرسال البلاغ، يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  return {
    reportModalOpen,
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
    setReportProblemType,
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
