"use client";

import React, { useState, useEffect } from "react";
import CustomModal from "@/components/common/Modals";
import { supabase } from "@/lib/supabase";
import { UnifiedReport } from "../types";

interface DirectoryProposalModalProps {
  item: UnifiedReport | null;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess: (updatedItem: UnifiedReport, msg: string) => void;
  onError: (msg: string) => void;
}

export function DirectoryProposalModal({
  item,
  isAdmin,
  onClose,
  onSuccess,
  onError,
}: DirectoryProposalModalProps) {
  const [dirType, setDirType] = useState<"phone" | "code">("phone");
  const [dirPhoneName, setDirPhoneName] = useState("");
  const [dirPhoneNumber, setDirPhoneNumber] = useState("");
  const [dirPhoneSpecialty, setDirPhoneSpecialty] = useState("عام");
  const [dirPhoneDesc, setDirPhoneDesc] = useState("");
  const [dirCodeCompany, setDirCodeCompany] = useState<"vodafone" | "orange" | "etisalat" | "we">("vodafone");
  const [dirCodeTitle, setDirCodeTitle] = useState("");
  const [dirCodeValue, setDirCodeValue] = useState("");
  const [dirCodeSection, setDirCodeSection] = useState("خدمات عامة");
  const [dirAutoActionTaken, setDirAutoActionTaken] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!item) return;

    const content = item.content || "";
    const title = item.title || "";
    const catLower = (item.category || "").toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    // Helper to extract field value by multiple possible line prefixes
    const getField = (prefixes: string[]): string => {
      for (const p of prefixes) {
        const regex = new RegExp(`(?:^|\\n)\\s*${p}\\s*[:：]\\s*(.+)`, "i");
        const match = content.match(regex);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return "";
    };

    // Extract raw fields from content or title
    const extractedRawName =
      getField([
        "الاسم / الخدمة",
        "الاسم",
        "الجهة / الرقم",
        "اسم الجهة أو الخدمة",
        "عنوان الخدمة / الغرض",
        "عنوان الخدمة",
      ]) ||
      title
        .replace(/^(?:اقتراح|بلاغ)\s*(?:رقم|كود|إضافة رقم)?(?:\s*\([^)]*\))?\s*[:：]\s*/i, "")
        .replace(/^مشكلة دليل الهاتف\s*[:：]\s*/i, "")
        .replace(/\s*\((?:اقتراح|بلاغ|كود|رقم|مشكلة)[^)]*\)$/i, "")
        .replace(/\s*\([^)]*\)$/, "")
        .trim();

    const extractedRawNumber =
      getField(["الرقم أو الكود", "رقم الهاتف", "الكود", "الرقم"]) ||
      (title.match(/\(([^)]+)\)/)?.[1] || "").trim();

    const extractedSpec =
      getField(["التخصص", "التصنيف", "التخصص / الفئة", "الفئة"]) || "عام";

    const extractedNotes =
      getField(["ملاحظات إضافية", "ملاحظات أو تفاصيل إضافية", "تفاصيل البلاغ", "الملاحظات", "ملاحظات"]) ||
      "";

    const cleanNotes =
      extractedNotes && !extractedNotes.includes("لا توجد ملاحظات")
        ? extractedNotes
        : "";

    // Code vs Phone Detection
    const hasExplicitCodeIndicator =
      catLower.includes("كود شبكة") ||
      titleLower.includes("اقتراح كود") ||
      titleLower.includes("بلاغ كود") ||
      titleLower.includes("كود شبكة") ||
      contentLower.includes("شركة الاتصالات") ||
      contentLower.includes("الشركة:");

    const isCodePattern = /^[*#]|\b\*\d+[\d*]*#\b/.test(extractedRawNumber);

    const isCode = hasExplicitCodeIndicator || isCodePattern;

    // Detect telecom company
    let detectedCompany: "vodafone" | "orange" | "etisalat" | "we" = "vodafone";
    const fullText = `${title} ${content} ${catLower}`.toLowerCase();
    if (fullText.includes("اورنج") || fullText.includes("orange") || fullText.includes("أورنج")) {
      detectedCompany = "orange";
    } else if (fullText.includes("اتصالات") || fullText.includes("etisalat") || fullText.includes("e&")) {
      detectedCompany = "etisalat";
    } else if (
      fullText.includes("وي") ||
      fullText.includes("we") ||
      fullText.includes("المصرية للاتصالات") ||
      fullText.includes("تي اي داتا")
    ) {
      detectedCompany = "we";
    } else if (fullText.includes("فودافون") || fullText.includes("vodafone")) {
      detectedCompany = "vodafone";
    }

    // Code section detection
    let extractedSection = "خدمات عامة";
    if (fullText.includes("رصيد") || fullText.includes("تحويل")) {
      extractedSection = "خدمات الرصيد والتحويل";
    } else if (
      fullText.includes("باقة") ||
      fullText.includes("نت") ||
      fullText.includes("انترنت") ||
      fullText.includes("ميجابايت")
    ) {
      extractedSection = "باقات الإنترنت والميجابايتس";
    } else if (
      fullText.includes("مكالمات") ||
      fullText.includes("فليكس") ||
      fullText.includes("انظمة") ||
      fullText.includes("أنظمة")
    ) {
      extractedSection = "باقات المكالمات والأنظمة";
    } else if (fullText.includes("شحن") || fullText.includes("كارت")) {
      extractedSection = "الشحن ودفع الفواتير";
    } else if (fullText.includes("خدمة عملاء") || fullText.includes("الدعم")) {
      extractedSection = "خدمة العملاء والدعم";
    }

    // Set active mode
    setDirType(isCode ? "code" : "phone");

    // Prepopulate Phone form fields
    setDirPhoneName(extractedRawName || title);
    setDirPhoneNumber(extractedRawNumber);
    setDirPhoneSpecialty(extractedSpec || "عام");
    setDirPhoneDesc(cleanNotes);

    // Prepopulate Code form fields
    setDirCodeCompany(detectedCompany);
    setDirCodeTitle(extractedRawName || title);
    setDirCodeValue(extractedRawNumber);
    setDirCodeSection(extractedSection);

    setDirAutoActionTaken(true);
  }, [item]);

  if (!item) return null;

  const handleConfirm = async () => {
    if (!supabase || !isAdmin) return;
    setIsSubmitting(true);

    try {
      if (dirType === "phone") {
        if (!dirPhoneName.trim() || !dirPhoneNumber.trim()) {
          onError("يرجى إدخال اسم الجهة ورقم الهاتف.");
          setIsSubmitting(false);
          return;
        }

        const { error: insertErr } = await supabase.from("phone_directory").insert([
          {
            name: dirPhoneName.trim(),
            phone_number: dirPhoneNumber.trim(),
            specialty: dirPhoneSpecialty.trim() || "عام",
            description: dirPhoneDesc.trim(),
            icon: "bx bx-phone",
            logo_url: "",
          },
        ]);

        if (insertErr) throw insertErr;
      } else {
        if (!dirCodeTitle.trim() || !dirCodeValue.trim()) {
          onError("يرجى إدخال عنوان الخدمة والكود.");
          setIsSubmitting(false);
          return;
        }

        const { error: insertErr } = await supabase.from("telecom_codes").insert([
          {
            company: dirCodeCompany,
            title: dirCodeTitle.trim(),
            code: dirCodeValue.trim(),
            section_name: dirCodeSection.trim() || "خدمات عامة",
            icon: "bx bx-bookmark",
          },
        ]);

        if (insertErr) throw insertErr;
      }

      const itemName = dirType === "phone" ? dirPhoneName.trim() : dirCodeTitle.trim();
      let updatedItem = { ...item };

      if (dirAutoActionTaken && item.source === "feedback") {
        const adminReplyText = `تم قبول اقتراحك وإضافة "${itemName}" بنجاح إلى دليل الهاتف والأكواد. شكراً لمساهمتك القيمة! 🌟`;

        await supabase
          .from("app_feedback")
          .update({
            status: "action_taken",
            admin_reply: adminReplyText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        if (item.user_id) {
          await supabase.from("notifications").insert([
            {
              user_id: item.user_id,
              title: "🎉 تم قبول اقتراحك وإضافته للدليل!",
              message: `يسرنا إبلاغك بأنه تم قبول اقتراحك وإضافة "${itemName}" رسمياً إلى دليل الهاتف. شكراً لمساهمتك!`,
              type: "success",
              link: "/directory",
            },
          ]);
        }

        updatedItem = {
          ...item,
          status: "action_taken",
          admin_reply: adminReplyText,
        };
      }

      onSuccess(updatedItem, `تمت إضافة "${itemName}" إلى دليل الهاتف والأكواد بنجاح! 🎉`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error adding to directory:", err);
      onError("فشل الإضافة إلى الدليل: " + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      isOpen={true}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title="إضافة المقترح إلى دليل الهاتف والأكواد"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "6px 0" }}>
        {/* Type selector */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setDirType("phone")}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: "10px",
              border: dirType === "phone" ? "2px solid var(--color-primary)" : "1px solid var(--border-glass)",
              background: dirType === "phone" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
              color: dirType === "phone" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            📞 رقم هاتف / جهة
          </button>
          <button
            type="button"
            onClick={() => setDirType("code")}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: "10px",
              border: dirType === "code" ? "2px solid var(--color-primary)" : "1px solid var(--border-glass)",
              background: dirType === "code" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
              color: dirType === "code" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            🔖 كود شبكة / خدمة
          </button>
        </div>

        {dirType === "phone" ? (
          <>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                اسم الجهة أو الخدمة *
              </label>
              <input
                type="text"
                value={dirPhoneName}
                onChange={(e) => setDirPhoneName(e.target.value)}
                placeholder="مثال: خدمة عملاء فودافون / مستشفى النزهة"
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                رقم الهاتف *
              </label>
              <input
                type="text"
                value={dirPhoneNumber}
                onChange={(e) => setDirPhoneNumber(e.target.value)}
                placeholder="مثال: 888 أو 0226300000 أو 19000"
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", direction: "ltr", textAlign: "right" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                التصنيف / التخصص
              </label>
              <input
                type="text"
                value={dirPhoneSpecialty}
                onChange={(e) => setDirPhoneSpecialty(e.target.value)}
                placeholder="مثال: اتصالات / مستشفيات / طوارئ / بنوك"
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                الوصف أو الملاحظات
              </label>
              <textarea
                rows={2}
                value={dirPhoneDesc}
                onChange={(e) => setDirPhoneDesc(e.target.value)}
                placeholder="ملاحظات توضيحية عن الرقم أو مواعيد العمل..."
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                شركة الاتصالات *
              </label>
              <select
                value={dirCodeCompany}
                onChange={(e) => setDirCodeCompany(e.target.value as any)}
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
              >
                <option value="vodafone">فودافون (Vodafone)</option>
                <option value="orange">أورنج (Orange)</option>
                <option value="etisalat">اتصالات (Etisalat e&)</option>
                <option value="we">وي (Telecom Egypt WE)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                عنوان الخدمة *
              </label>
              <input
                type="text"
                value={dirCodeTitle}
                onChange={(e) => setDirCodeTitle(e.target.value)}
                placeholder="مثال: معرفة الرصيد / تجديد الباقة"
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                الكود (مثال: *888#) *
              </label>
              <input
                type="text"
                value={dirCodeValue}
                onChange={(e) => setDirCodeValue(e.target.value)}
                placeholder="*888#"
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", direction: "ltr", textAlign: "right" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
                القسم
              </label>
              <input
                type="text"
                value={dirCodeSection}
                onChange={(e) => setDirCodeSection(e.target.value)}
                placeholder="مثال: باقات المكالمات والأنظمة / خدمات الرصيد"
                className="input-fields"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
              />
            </div>
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <input
            type="checkbox"
            id="dirAutoAction"
            checked={dirAutoActionTaken}
            onChange={(e) => setDirAutoActionTaken(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          <label htmlFor="dirAutoAction" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", cursor: "pointer" }}>
            تحديث حالة البلاغ تلقائياً إلى &ldquo;تم اتخاذ إجراء&rdquo; وإشعار المستخدم
          </label>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="btn btn-primary"
            style={{ flex: 1, padding: "10px", fontWeight: "800", fontSize: "0.9rem" }}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ في الدليل الآن"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="btn btn-cancel"
            style={{ padding: "10px 20px" }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
