"use client";

import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { ParkingSpot, ReportScope } from "../types";
import { PROBLEM_TYPE_LABELS } from "../constants";
import { normalizeArabic } from "../utils";

export function useParkingReportModal(user: any, parkingData: ParkingSpot[]) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<ReportScope>("general");
  const [reportSelectedParking, setReportSelectedParking] = useState("");
  const [reportParkingSearchQuery, setReportParkingSearchQuery] = useState("");
  const [showReportParkingList, setShowReportParkingList] = useState(false);
  const [reportProblemType, setReportProblemType] = useState("price");
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

  const filteredReportParking = useMemo(() => {
    const q = normalizeArabic(reportParkingSearchQuery.trim());
    if (!q) return parkingData;
    return parkingData.filter((p) => {
      const n = normalizeArabic(p.name);
      const a = normalizeArabic(p.area);
      const addr = normalizeArabic(p.address);
      const m = normalizeArabic(p.nearestMetro);
      return n.includes(q) || a.includes(q) || addr.includes(q) || m.includes(q);
    });
  }, [parkingData, reportParkingSearchQuery]);

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
      alert("حجم الصورة يجب ألا يتجاوز 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  }, [reportImagePreview]);

  const handleOpenReportModal = useCallback(async (
    scope: ReportScope = "general",
    parkingName?: string
  ) => {
    setReportError("");
    setReportSuccess(false);
    setReportTargetScope(scope);
    if (parkingName) {
      setReportSelectedParking(parkingName);
      setReportParkingSearchQuery(parkingName);
    } else {
      setReportSelectedParking("");
      setReportParkingSearchQuery("");
    }
    setShowReportParkingList(false);
    setReportProblemType("price");
    setReportModalOpen(true);

    if (user?.id) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (err) {
        console.error("Failed to check feedback limit:", err);
      } finally {
        setLimitChecking(false);
      }
    }
  }, [user?.id]);

  const handleCloseReportModal = useCallback(() => {
    if (reportLoading) return;
    setReportModalOpen(false);
    handleReportImageSelect(null);
  }, [reportLoading, handleReportImageSelect]);

  const handleSubmitReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يجب تسجيل الدخول أولاً لتقديم بلاغ.");
      return;
    }
    if (!supabase) {
      setReportError("تعذر الاتصال بقاعدة البيانات حالياً.");
      return;
    }
    if (limitReached) {
      setReportError(
        "لقد تجاوزت الحد الأقصى للبلاغات المعلقة (5 بلاغات). يرجى الانتظار لحين مراجعتها."
      );
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أولاً.");
      return;
    }
    if (reportTargetScope === "parking" && !reportSelectedParking.trim()) {
      setReportError("يرجى اختيار الجراج الذي توجد به المشكلة.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      let finalImageUrl: string | null = null;

      // Upload image if selected
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `reports/parking_${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, reportImageFile, { upsert: true });

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          finalImageUrl = publicUrlData?.publicUrl || null;
        }
        setReportUploading(false);
      }

      const typeLabel = PROBLEM_TYPE_LABELS[reportProblemType] || reportProblemType;
      const selectedSpot = reportSelectedParking
        ? parkingData.find((p) => p.name === reportSelectedParking)
        : null;

      let contentText = `نوع المشكلة: ${typeLabel}\n`;
      if (reportTargetScope === "parking" && reportSelectedParking) {
        contentText += `الجراج المستهدف: ${reportSelectedParking}\n`;
        if (selectedSpot) {
          contentText += `المنطقة: ${selectedSpot.area} | العنوان: ${selectedSpot.address}\n`;
          contentText += `أقرب مترو: ${selectedSpot.nearestMetro} | السعر المسجل: ${selectedSpot.hourlyRate} ج.م/ساعة\n`;
        }
      } else {
        contentText += `نطاق البلاغ: مشكلة عامة في دليل الجراجات\n`;
      }
      contentText += `\n📝 تفاصيل المشكلة المبلغ عنها:\n${reportDetails.trim()}`;

      const reportTitle =
        reportTargetScope === "parking" && reportSelectedParking
          ? `مشكلة جراج: ${reportSelectedParking}`
          : `مشكلة في دليل الجراجات (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "باركينج",
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
            title: "تم استلام بلاغك بنجاح 🅿️",
            message: `شكراً لمساعدتنا في تحسين وتدقيق دليل الجراجات والمواقف. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
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
      console.error("Error submitting parking report:", err);
      setReportError(
        err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً."
      );
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  }, [
    user,
    limitReached,
    reportDetails,
    reportTargetScope,
    reportSelectedParking,
    reportImageFile,
    reportProblemType,
    parkingData,
    reportImagePreview,
  ]);

  return {
    reportModalOpen,
    setReportModalOpen,
    reportTargetScope,
    setReportTargetScope,
    reportSelectedParking,
    setReportSelectedParking,
    reportParkingSearchQuery,
    setReportParkingSearchQuery,
    showReportParkingList,
    setShowReportParkingList,
    filteredReportParking,
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
    handleReportImageSelect,
    handleOpenReportModal,
    handleCloseReportModal,
    handleSubmitReport,
  };
}
