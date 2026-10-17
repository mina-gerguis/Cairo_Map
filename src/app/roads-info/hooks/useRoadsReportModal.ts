"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { HighwayItem } from "@/data/roads_info";
import { RoadReportProblemType, RoadReportScope } from "../types";

export function useRoadsReportModal(user: any, roads: HighwayItem[]) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [targetScope, setTargetScope] = useState<RoadReportScope>("general");
  const [selectedRoadForReport, setSelectedRoadForReport] = useState<HighwayItem | null>(null);
  const [customRoadName, setCustomRoadName] = useState("");
  const [roadQuery, setRoadQuery] = useState("");
  const [reportProblemType, setReportProblemType] = useState<RoadReportProblemType>("speed_error");
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [limitChecking, setLimitChecking] = useState(false);

  const openReportModal = (road?: HighwayItem | null) => {
    if (road) {
      setSelectedRoadForReport(road);
      setTargetScope("road");
    } else {
      setSelectedRoadForReport(null);
      setTargetScope("general");
    }
    setReportError("");
    setReportSuccess("");
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportDetails("");
    setReportImageFile(null);
    setReportImagePreview(null);
    setReportError("");
    setReportSuccess("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setReportImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل البلاغ أو الملاحظة");
      return;
    }

    try {
      setReportLoading(true);
      setReportError("");

      let imageUrl: string | null = null;
      if (reportImageFile && supabase) {
        setReportUploading(true);
        const fileName = `roads-report-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("reports")
          .upload(fileName, reportImageFile);

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("reports")
            .getPublicUrl(fileName);
          imageUrl = publicUrlData?.publicUrl || null;
        }
        setReportUploading(false);
      }

      if (supabase) {
        await supabase.from("place_reports").insert({
          user_id: user?.id || null,
          place_id: selectedRoadForReport?.id || null,
          problem_type: `road_${reportProblemType}`,
          details: `[معلومات الطرق: ${targetScope === "road" ? selectedRoadForReport?.name || customRoadName : "عام"}] ${reportDetails}`,
          image_url: imageUrl,
          status: "pending",
        });
      }

      setReportSuccess("تم إرسال بلاغك بنجاح! سيتم مراجعته وتحديث بيانات الطريق.");
      setTimeout(() => {
        closeReportModal();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      setReportError(err.message || "حدث خطأ أثناء إرسال البلاغ");
    } finally {
      setReportLoading(false);
    }
  };

  return {
    reportModalOpen,
    openReportModal,
    closeReportModal,
    targetScope,
    setTargetScope,
    selectedRoadForReport,
    setSelectedRoadForReport,
    customRoadName,
    setCustomRoadName,
    roadQuery,
    setRoadQuery,
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
    handleSubmitReport,
  };
}
