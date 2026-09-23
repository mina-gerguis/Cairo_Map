import { useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { BusStation, ReportProblemType } from "../types";
import { PROBLEM_LABELS } from "../constants";
import { formatReportContent } from "../utils";

export function useBusStationsReportModal(user: User | null, stations: BusStation[]) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedStationForReport, setSelectedStationForReport] = useState<BusStation | null>(null);
  const [customStationName, setCustomStationName] = useState("");
  const [reportProblemType, setReportProblemType] = useState<ReportProblemType>("phone");
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImageUrl, setReportImageUrl] = useState("");
  const [reportUploading, setReportUploading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitChecking, setLimitChecking] = useState(false);

  const openReportModal = useCallback(async (station: BusStation | null = null) => {
    setSelectedStationForReport(station);
    setCustomStationName("");
    setReportProblemType("phone");
    setReportDetails("");
    setReportImageFile(null);
    setReportImageUrl("");
    setReportError("");
    setReportSuccess(false);
    setReportModalOpen(true);

    if (user) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (err) {
        console.error("Failed to check feedback limit:", err);
      } finally {
        setLimitChecking(false);
      }
    } else {
      setLimitReached(false);
    }
  }, [user]);

  const closeReportModal = useCallback(() => {
    if (!reportLoading) {
      setReportModalOpen(false);
    }
  }, [reportLoading]);

  const handleSubmitReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }

    const stationName = selectedStationForReport
      ? selectedStationForReport.name
      : customStationName.trim();

    if (!stationName && reportProblemType !== "missing_station") {
      setReportError("يرجى تحديد اسم الموقف.");
      return;
    }

    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل الخطأ أو الملاحظة لمساعدتنا في تحديث البيانات.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      // Check feedback limit again right before inserting
      const reached = await isFeedbackLimitReached(user.id);
      if (reached) {
        setLimitReached(true);
        setReportError("لقد وصلت للحد الأقصى من البلاغات المعلقة (5 بلاغات). يرجى الانتظار حتى تتم مراجعتها.");
        setReportLoading(false);
        return;
      }

      // Optional image upload
      let finalImageUrl = reportImageUrl;
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `bus_station_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const typeLabel = PROBLEM_LABELS[reportProblemType] || "خطأ في بيانات الموقف";
      const contentText = formatReportContent(stationName, typeLabel, reportDetails);

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "مواقف الأتوبيسات",
          title: `خطأ في موقف: ${stationName || "مواقف الأتوبيسات"} (${typeLabel})`,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending"
        }
      ]);

      if (insertError) throw insertError;

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 📋",
            message: `شكراً لمساعدتنا في تحسين وتدقيق دليل مواقف الأتوبيسات بخصوص "${stationName || "مواقف الأتوبيسات"}". تم تسجيل البلاغ وجاري مراجعته.`,
            type: "info",
            link: "/profile"
          }
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        setReportImageFile(null);
        setReportImageUrl("");
      }, 2000);
    } catch (err: any) {
      console.error("Report submit error:", err);
      setReportError("حدث خطأ أثناء إرسال البلاغ: " + (err?.message || "يرجى المحاولة لاحقاً"));
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  }, [
    user,
    selectedStationForReport,
    customStationName,
    reportProblemType,
    reportDetails,
    reportImageUrl,
    reportImageFile
  ]);

  return {
    reportModalOpen,
    openReportModal,
    closeReportModal,
    selectedStationForReport,
    setSelectedStationForReport,
    customStationName,
    setCustomStationName,
    reportProblemType,
    setReportProblemType,
    reportDetails,
    setReportDetails,
    reportImageFile,
    setReportImageFile,
    reportUploading,
    reportLoading,
    reportError,
    reportSuccess,
    limitReached,
    limitChecking,
    handleSubmitReport
  };
}
