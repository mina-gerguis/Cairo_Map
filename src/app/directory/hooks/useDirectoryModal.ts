"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { ModalMode, ModalType, UseDirectoryModalReturn } from "../types";
import { COMPANY_META } from "../constants";

export function useDirectoryModal(
  searchQuery: string = "",
  activeCompany: string = "vodafone"
): UseDirectoryModalReturn {
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("suggest");
  const [modalType, setModalType] = useState<ModalType>("phone");
  const [itemName, setItemName] = useState("");
  const [itemNumberOrCode, setItemNumberOrCode] = useState("");
  const [itemSpecialty, setItemSpecialty] = useState("");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [itemCompany, setItemCompany] = useState(activeCompany);
  const [modalNotes, setModalNotes] = useState("");
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Open Modal Handler
  const handleOpenModal = useCallback(
    async (
      mode: ModalMode = "suggest",
      type: ModalType = "phone",
      presetName: string = "",
      presetNumberOrCode: string = ""
    ) => {
      setModalError("");
      setModalSuccess(false);
      setModalMode(mode);
      setModalType(type);
      setItemName(presetName || (type === "phone" && searchQuery ? searchQuery : ""));
      setItemNumberOrCode(presetNumberOrCode);
      setItemSpecialty("");
      setCustomSpecialty("");
      setItemCompany(activeCompany);
      setModalNotes("");
      if (modalImagePreview) URL.revokeObjectURL(modalImagePreview);
      setModalImageFile(null);
      setModalImagePreview(null);
      setIsDraggingImage(false);

      setModalOpen(true);

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
    [user, searchQuery, activeCompany, modalImagePreview]
  );

  const handleModalImageSelect = useCallback(
    (file: File | null) => {
      if (modalImagePreview) URL.revokeObjectURL(modalImagePreview);
      if (!file) {
        setModalImageFile(null);
        setModalImagePreview(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setModalError("حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setModalError("يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).");
        return;
      }
      setModalError("");
      setModalImageFile(file);
      setModalImagePreview(URL.createObjectURL(file));
    },
    [modalImagePreview]
  );

  const handleSubmitModal = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        setModalError("يرجى تسجيل الدخول أولاً لتتمكن من إرسال طلبك.");
        return;
      }
      if (!itemName.trim() || !itemNumberOrCode.trim()) {
        setModalError("يرجى إدخال اسم الجهة / الخدمة ورقم الهاتف أو الكود.");
        return;
      }

      setModalLoading(true);
      setModalError("");

      try {
        if (!supabase) throw new Error("تعذر الاتصال بقاعدة البيانات.");

        let finalImageUrl = "";
        if (modalImageFile) {
          setModalUploading(true);
          const fileExt = modalImageFile.name.split(".").pop() || "jpg";
          const fileName = `dir_${user.id}_${Date.now()}.${fileExt}`;
          const filePath = `reports/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, modalImageFile, { upsert: true });

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath);
            if (publicUrl) finalImageUrl = publicUrl;
          }
          setModalUploading(false);
        }

        const finalSpec =
          customSpecialty.trim() ||
          (itemSpecialty !== "other" && itemSpecialty) ||
          "عام / غير محدد";
        const companyLabel = COMPANY_META[itemCompany]?.label || itemCompany;

        const isSuggest = modalMode === "suggest";
        const category =
          modalType === "phone"
            ? isSuggest
              ? "اقتراح رقم هاتف جديد"
              : "إبلاغ عن خطأ في رقم هاتف"
            : isSuggest
            ? "اقتراح كود شبكة جديد"
            : "إبلاغ عن خطأ في كود شبكة";

        const title =
          modalType === "phone"
            ? `${isSuggest ? "اقتراح رقم" : "بلاغ رقم"}: ${itemName.trim()} (${itemNumberOrCode.trim()})`
            : `${isSuggest ? "اقتراح كود" : "بلاغ كود"} (${companyLabel}): ${itemName.trim()} (${itemNumberOrCode.trim()})`;

        const content = `نوع الطلب: ${isSuggest ? "اقتراح إضافة جديد" : "بلاغ عن خطأ"} في دليل الهاتف
الاسم / الخدمة: ${itemName.trim()}
الرقم أو الكود: ${itemNumberOrCode.trim()}
${modalType === "phone" ? `التخصص: ${finalSpec}` : `الشركة: ${companyLabel}`}
ملاحظات إضافية: ${modalNotes.trim() || "لا توجد ملاحظات إضافية"}`;

        const { error: insertError } = await supabase.from("app_feedback").insert([
          {
            user_id: user.id,
            type: isSuggest ? "suggestion" : "bug",
            category,
            title,
            content,
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
              title: isSuggest ? "تم استلام اقتراحك بنجاح 💡" : "تم استلام بلاغك بنجاح ☎️",
              message: `شكراً لمساهمتك في تدقيق وتطوير دليل الهاتف! تم تسجيل طلبك بخصوص "${title}" وسيتم مراجعته قريباً.`,
              type: "info",
              link: "/profile",
            },
          ]);
        } catch (notifErr) {
          console.error("Failed to insert notification:", notifErr);
        }

        setModalSuccess(true);
        setTimeout(() => {
          setModalOpen(false);
          setModalSuccess(false);
        }, 2200);
      } catch (err: any) {
        console.error(err);
        setModalError(
          err?.message || "حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى."
        );
      } finally {
        setModalLoading(false);
        setModalUploading(false);
      }
    },
    [
      user,
      itemName,
      itemNumberOrCode,
      modalImageFile,
      customSpecialty,
      itemSpecialty,
      itemCompany,
      modalMode,
      modalType,
      modalNotes,
    ]
  );

  return {
    modalOpen,
    setModalOpen,
    modalMode,
    setModalMode,
    modalType,
    setModalType,
    itemName,
    setItemName,
    itemNumberOrCode,
    setItemNumberOrCode,
    itemSpecialty,
    setItemSpecialty,
    customSpecialty,
    setCustomSpecialty,
    itemCompany,
    setItemCompany,
    modalNotes,
    setModalNotes,
    modalImageFile,
    modalImagePreview,
    isDraggingImage,
    setIsDraggingImage,
    modalLoading,
    modalUploading,
    modalSuccess,
    modalError,
    limitChecking,
    limitReached,
    handleOpenModal,
    handleModalImageSelect,
    handleSubmitModal,
  };
}
