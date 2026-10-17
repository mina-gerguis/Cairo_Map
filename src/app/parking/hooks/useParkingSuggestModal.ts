"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

export function useParkingSuggestModal(
  user: any,
  searchTerm: string,
  selectedArea: string
) {
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestArea, setSuggestArea] = useState("وسط البلد");
  const [suggestAddress, setSuggestAddress] = useState("");
  const [suggestNearestMetro, setSuggestNearestMetro] = useState("");
  const [suggestType, setSuggestType] = useState("مغطى متعدد طوابق");
  const [suggestHourlyRate, setSuggestHourlyRate] = useState("");
  const [suggestCapacity, setSuggestCapacity] = useState("");
  const [suggestMapLink, setSuggestMapLink] = useState("");
  const [suggestFeatures, setSuggestFeatures] = useState<string[]>([
    "أمن وحراسة",
    "كاميرات مراقبة",
  ]);
  const [suggestNotes, setSuggestNotes] = useState("");
  const [suggestImageFile, setSuggestImageFile] = useState<File | null>(null);
  const [suggestImagePreview, setSuggestImagePreview] = useState<string | null>(null);
  const [isDraggingSuggestImage, setIsDraggingSuggestImage] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestUploading, setSuggestUploading] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [suggestLimitChecking, setSuggestLimitChecking] = useState(false);
  const [suggestLimitReached, setSuggestLimitReached] = useState(false);

  const handleSuggestImageSelect = useCallback((file: File | null) => {
    if (suggestImagePreview) {
      URL.revokeObjectURL(suggestImagePreview);
    }
    if (!file) {
      setSuggestImageFile(null);
      setSuggestImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSuggestError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت.");
      return;
    }
    setSuggestImageFile(file);
    setSuggestImagePreview(URL.createObjectURL(file));
    setSuggestError("");
  }, [suggestImagePreview]);

  const handleOpenSuggestModal = useCallback(async (initialName = "") => {
    setSuggestError("");
    setSuggestSuccess(false);
    setSuggestName(initialName || (searchTerm.trim() ? searchTerm.trim() : ""));
    if (selectedArea && selectedArea !== "all") {
      setSuggestArea(selectedArea);
    }
    setSuggestModalOpen(true);

    if (user?.id) {
      setSuggestLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setSuggestLimitReached(reached);
      } catch (err) {
        console.error("Failed to check feedback limit:", err);
      } finally {
        setSuggestLimitChecking(false);
      }
    }
  }, [searchTerm, selectedArea, user?.id]);

  const handleCloseSuggestModal = useCallback(() => {
    if (suggestLoading) return;
    setSuggestModalOpen(false);
    handleSuggestImageSelect(null);
  }, [suggestLoading, handleSuggestImageSelect]);

  const toggleSuggestFeature = useCallback((feat: string) => {
    setSuggestFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  }, []);

  const handleSubmitSuggestion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSuggestError("يجب تسجيل الدخول أولاً لتقديم اقتراح.");
      return;
    }
    if (!supabase) {
      setSuggestError("تعذر الاتصال بقاعدة البيانات حالياً.");
      return;
    }
    if (suggestLimitReached) {
      setSuggestError(
        "لقد تجاوزت الحد الأقصى للاقتراحات/البلاغات المعلقة (5 طلبات). يرجى الانتظار لحين مراجعتها."
      );
      return;
    }
    if (!suggestName.trim()) {
      setSuggestError("يرجى كتابة اسم الجراج.");
      return;
    }
    if (!suggestAddress.trim()) {
      setSuggestError("يرجى كتابة العنوان أو معالم الوصول للجراج.");
      return;
    }

    setSuggestLoading(true);
    setSuggestError("");

    try {
      let finalImageUrl: string | null = null;

      if (suggestImageFile) {
        setSuggestUploading(true);
        const fileExt = suggestImageFile.name.split(".").pop() || "jpg";
        const fileName = `suggestions/parking_${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, suggestImageFile, { upsert: true });

        if (uploadError) {
          console.error("Suggestion image upload failed:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          finalImageUrl = publicUrlData?.publicUrl || null;
        }
        setSuggestUploading(false);
      }

      let contentText = `🏷️ اسم الجراج المقترح: ${suggestName.trim()}\n`;
      contentText += `📍 المنطقة / الحي: ${suggestArea}\n`;
      contentText += `🏢 العنوان والمعالم: ${suggestAddress.trim()}\n`;
      if (suggestNearestMetro.trim()) {
        contentText += `🚇 أقرب محطة مترو: ${suggestNearestMetro.trim()}\n`;
      }
      contentText += `🏗️ نوع الجراج: ${suggestType}\n`;
      if (suggestHourlyRate.trim()) {
        contentText += `💰 سعر الساعة التقديري: ${suggestHourlyRate.trim()} ج.م/ساعة\n`;
      }
      if (suggestCapacity.trim()) {
        contentText += `🚗 السعة التقديرية: ${suggestCapacity.trim()}\n`;
      }
      if (suggestMapLink.trim()) {
        contentText += `🗺️ رابط خرائط جوجل: ${suggestMapLink.trim()}\n`;
      }
      if (suggestFeatures.length > 0) {
        contentText += `✨ الميزات المتوفرة: ${suggestFeatures.join("، ")}\n`;
      }
      if (suggestNotes.trim()) {
        contentText += `\n📝 ملاحظات إضافية:\n${suggestNotes.trim()}`;
      }

      const suggestionTitle = `اقتراح جراج جديد: ${suggestName.trim()}`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "suggestion",
          category: "باركينج",
          title: suggestionTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // In-app notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام اقتراح الجراج بنجاح 💡🅿️",
            message: `شكراً لمساهمتك! تم إرسال اقتراح إضافة "${suggestName.trim()}" إلى فريق الإدارة وسنقوم بمراجعته وتدقيقه تمهيداً لإضافته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setSuggestSuccess(true);
      setTimeout(() => {
        setSuggestModalOpen(false);
        setSuggestSuccess(false);
        setSuggestName("");
        setSuggestAddress("");
        setSuggestNearestMetro("");
        setSuggestHourlyRate("");
        setSuggestCapacity("");
        setSuggestMapLink("");
        setSuggestNotes("");
        if (suggestImagePreview) {
          URL.revokeObjectURL(suggestImagePreview);
        }
        setSuggestImageFile(null);
        setSuggestImagePreview(null);
      }, 2300);
    } catch (err: any) {
      console.error("Error submitting garage suggestion:", err);
      setSuggestError(
        err?.message || "حدث خطأ أثناء إرسال الاقتراح. يرجى المحاولة لاحقاً."
      );
    } finally {
      setSuggestLoading(false);
      setSuggestUploading(false);
    }
  }, [
    user,
    suggestLimitReached,
    suggestName,
    suggestAddress,
    suggestImageFile,
    suggestArea,
    suggestNearestMetro,
    suggestType,
    suggestHourlyRate,
    suggestCapacity,
    suggestMapLink,
    suggestFeatures,
    suggestNotes,
    suggestImagePreview,
  ]);

  return {
    suggestModalOpen,
    setSuggestModalOpen,
    suggestName,
    setSuggestName,
    suggestArea,
    setSuggestArea,
    suggestAddress,
    setSuggestAddress,
    suggestNearestMetro,
    setSuggestNearestMetro,
    suggestType,
    setSuggestType,
    suggestHourlyRate,
    setSuggestHourlyRate,
    suggestCapacity,
    setSuggestCapacity,
    suggestMapLink,
    setSuggestMapLink,
    suggestFeatures,
    toggleSuggestFeature,
    suggestNotes,
    setSuggestNotes,
    suggestImageFile,
    suggestImagePreview,
    isDraggingSuggestImage,
    setIsDraggingSuggestImage,
    suggestLoading,
    suggestUploading,
    suggestSuccess,
    suggestError,
    suggestLimitChecking,
    suggestLimitReached,
    handleSuggestImageSelect,
    handleOpenSuggestModal,
    handleCloseSuggestModal,
    handleSubmitSuggestion,
  };
}
