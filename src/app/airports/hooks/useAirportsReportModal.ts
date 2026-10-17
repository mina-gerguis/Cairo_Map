import { useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { Airport, AirportReportProblemType, AirportReportScope } from "../types";
import { AIRPORT_REPORT_PROBLEM_LABELS } from "../constants";
import { formatAirportReportContent } from "../utils";

export function useAirportsReportModal(user: User | null, airports: Airport[]) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [targetScope, setTargetScope] = useState<AirportReportScope>("general");
  const [selectedAirportForReport, setSelectedAirportForReport] = useState<Airport | null>(null);
  const [customAirportName, setCustomAirportName] = useState("");
  const [airportQuery, setAirportQuery] = useState("");
  const [reportProblemType, setReportProblemType] = useState<AirportReportProblemType>("phone");
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitChecking, setLimitChecking] = useState(false);

  const openReportModal = useCallback(
    async (airport: Airport | null = null, defaultProblem: AirportReportProblemType = "phone") => {
      if (airport) {
        setTargetScope("airport");
        setSelectedAirportForReport(airport);
        setAirportQuery(airport.name_ar);
        setCustomAirportName("");
      } else {
        setTargetScope("general");
        setSelectedAirportForReport(null);
        setAirportQuery("");
        setCustomAirportName("");
      }

      setReportProblemType(defaultProblem);
      setReportDetails("");
      setReportImageFile(null);
      setReportImagePreview(null);
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
    },
    [user]
  );

  const closeReportModal = useCallback(() => {
    if (!reportLoading && !reportUploading) {
      if (reportImagePreview) {
        URL.revokeObjectURL(reportImagePreview);
      }
      setReportImagePreview(null);
      setReportImageFile(null);
      setReportModalOpen(false);
    }
  }, [reportLoading, reportUploading, reportImagePreview]);

  const handleImageSelect = useCallback(
    (file: File | null) => {
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
    },
    [reportImagePreview]
  );

  const handleSubmitReport = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
        return;
      }

      let airportName = "";
      if (targetScope === "airport") {
        airportName = selectedAirportForReport
          ? selectedAirportForReport.name_ar
          : customAirportName.trim() || airportQuery.trim();

        if (!airportName && reportProblemType !== "missing_airport") {
          setReportError("يرجى تحديد المطار المعني بالبلاغ أو كتابة اسمه.");
          return;
        }
      } else {
        airportName = customAirportName.trim() || "مشكلة عامة بدليل المطارات";
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

        const reached = await isFeedbackLimitReached(user.id);
        if (reached) {
          setLimitReached(true);
          setReportError(
            "لقد وصلت للحد الأقصى من البلاغات المعلقة (5 بلاغات). يرجى الانتظار حتى تتم مراجعتها."
          );
          setReportLoading(false);
          return;
        }

        let finalImageUrl = "";
        if (reportImageFile) {
          setReportUploading(true);
          const fileExt = reportImageFile.name.split(".").pop() || "jpg";
          const fileName = `airport_${user.id}_${Date.now()}.${fileExt}`;
          const filePath = `reports/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, reportImageFile, { upsert: true });

          if (!uploadError) {
            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            if (data?.publicUrl) {
              finalImageUrl = data.publicUrl;
            }
          }
          setReportUploading(false);
        }

        const typeLabel =
          AIRPORT_REPORT_PROBLEM_LABELS[reportProblemType] || "خطأ في بيانات المطار";
        const contentText = formatAirportReportContent(
          airportName,
          typeLabel,
          reportDetails
        );

        const reportTitle =
          targetScope === "airport" && airportName
            ? `خطأ في مطار: ${airportName} (${typeLabel})`
            : `بلاغ دليل المطارات (${typeLabel})`;

        const { error: insertError } = await supabase.from("app_feedback").insert([
          {
            user_id: user.id,
            type: "bug",
            category: "المطارات",
            title: reportTitle,
            content: contentText,
            image_url: finalImageUrl || null,
            status: "pending"
          }
        ]);

        if (insertError) throw insertError;

        // Send user notification
        try {
          await supabase.from("notifications").insert([
            {
              user_id: user.id,
              title: "تم استلام بلاغك بنجاح 📋",
              message: `شكراً لمساعدتنا في تدقيق وتحديث دليل المطارات بخصوص "${airportName}". تم تسجيل البلاغ وجاري مراجعته.`,
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
          setReportImagePreview(null);
        }, 2200);
      } catch (err: any) {
        console.error("Airport report submit error:", err);
        setReportError(
          "حدث خطأ أثناء إرسال البلاغ: " + (err?.message || "يرجى المحاولة لاحقاً")
        );
      } finally {
        setReportLoading(false);
        setReportUploading(false);
      }
    },
    [
      user,
      targetScope,
      selectedAirportForReport,
      customAirportName,
      airportQuery,
      reportProblemType,
      reportDetails,
      reportImageFile
    ]
  );

  return {
    reportModalOpen,
    openReportModal,
    closeReportModal,
    targetScope,
    setTargetScope,
    selectedAirportForReport,
    setSelectedAirportForReport,
    customAirportName,
    setCustomAirportName,
    airportQuery,
    setAirportQuery,
    reportProblemType,
    setReportProblemType,
    reportDetails,
    setReportDetails,
    reportImageFile,
    reportImagePreview,
    handleImageSelect,
    reportUploading,
    reportLoading,
    reportError,
    reportSuccess,
    limitReached,
    limitChecking,
    handleSubmitReport
  };
}
