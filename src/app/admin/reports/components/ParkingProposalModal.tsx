"use client";

import React, { useState } from "react";
import CustomModal from "@/components/common/Modals";
import { supabase } from "@/lib/supabase";
import { ParkingProposalData, UnifiedReport } from "../types";

interface ParkingProposalModalProps {
  data: ParkingProposalData | null;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess: (feedbackId: string, replyMsg: string, toastText: string) => void;
  onError: (msg: string) => void;
}

export function ParkingProposalModal({
  data,
  isAdmin,
  onClose,
  onSuccess,
  onError,
}: ParkingProposalModalProps) {
  const [formData, setFormData] = useState<ParkingProposalData | null>(data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parkingAddError, setParkingAddError] = useState("");

  // Sync state if prop changes
  React.useEffect(() => {
    setFormData(data);
    setParkingAddError("");
  }, [data]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !supabase || !isAdmin) return;

    setIsSubmitting(true);
    setParkingAddError("");

    try {
      const featuresArray =
        typeof formData.features === "string"
          ? formData.features.split(/[،,]/).map((f: string) => f.trim()).filter(Boolean)
          : formData.features;

      const newSpotRecord = {
        name: formData.name.trim(),
        area: formData.area.trim(),
        address: formData.address.trim(),
        nearest_metro: formData.nearestMetro.trim(),
        hourly_rate: Number(formData.hourlyRate || 0),
        max_daily_rate:
          formData.maxDailyRate !== "" && formData.maxDailyRate !== null
            ? Number(formData.maxDailyRate)
            : null,
        capacity: Number(formData.capacity || 0),
        type: formData.type,
        hours: formData.hours || "24 ساعة طوال الأسبوع",
        features: featuresArray,
        map_location_link: formData.mapLocationLink || "",
      };

      // 1. Insert into parking_spots
      const { error: insertError } = await supabase.from("parking_spots").insert([newSpotRecord]);
      if (insertError) throw insertError;

      // 2. Keep local storage in sync
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("local_parking_spots");
          const spots = saved ? JSON.parse(saved) : [];
          if (Array.isArray(spots)) {
            spots.unshift({
              id: `local_${Date.now()}`,
              name: newSpotRecord.name,
              area: newSpotRecord.area,
              address: newSpotRecord.address,
              nearestMetro: newSpotRecord.nearest_metro,
              hourlyRate: newSpotRecord.hourly_rate,
              maxDailyRate: newSpotRecord.max_daily_rate,
              capacity: newSpotRecord.capacity,
              type: newSpotRecord.type,
              hours: newSpotRecord.hours,
              features: newSpotRecord.features,
              mapLocationLink: newSpotRecord.map_location_link,
            });
            localStorage.setItem("local_parking_spots", JSON.stringify(spots));
          }
        } catch (e) {
          console.error("Failed to sync local_parking_spots:", e);
        }
      }

      // 3. Mark feedback status as action_taken
      const adminReplyText = `تمت مراجعة الاقتراح وإضافة الجراج (${newSpotRecord.name}) رسمياً إلى دليل الجراجات. شكراً لمساهمتك! 🅿️✨`;
      await supabase
        .from("app_feedback")
        .update({
          status: "action_taken",
          admin_reply: adminReplyText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formData.feedbackId);

      // 4. Send notification to user
      if (formData.feedbackUserId) {
        try {
          await supabase.from("notifications").insert([
            {
              user_id: formData.feedbackUserId,
              title: "🎉 تم قبول وإضافة الجراج الذي اقترحته!",
              message: `يسعدنا إخبارك بأنه تم اعتماد اقتراحك وإضافة جراج "${newSpotRecord.name}" رسمياً إلى دليل الجراجات. شكراً لدعمك!`,
              type: "success",
              link: "/parking",
            },
          ]);
        } catch (notifErr) {
          console.error("Failed to notify user:", notifErr);
        }
      }

      onSuccess(formData.feedbackId, adminReplyText, `تمت إضافة جراج "${newSpotRecord.name}" بنجاح وتحديث حالة الاقتراح! ✅`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      console.error("Error adding suggested garage:", err);
      setParkingAddError(errMsg);
      onError("فشلت إضافة الجراج: " + errMsg);
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
      title="إضافة الجراج المقترح إلى دليل الجراجات"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {parkingAddError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: "0.85rem",
            }}
          >
            {parkingAddError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              اسم الجراج *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              المنطقة / الحي *
            </label>
            <input
              type="text"
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
            العنوان بالتفصيل *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input-fields"
            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              أقرب محطة مترو *
            </label>
            <input
              type="text"
              required
              value={formData.nearestMetro}
              onChange={(e) => setFormData({ ...formData, nearestMetro: e.target.value })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              نوع الجراج *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            >
              <option value="مغطى ومتعدد الطوابق">مغطى ومتعدد الطوابق</option>
              <option value="جراج ذكي إلكتروني">جراج ذكي إلكتروني</option>
              <option value="جراج سطحي مفتوح">جراج سطحي مفتوح</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              سعر الساعة *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              الحد اليومي
            </label>
            <input
              type="number"
              min="0"
              placeholder="اختياري"
              value={formData.maxDailyRate}
              onChange={(e) => setFormData({ ...formData, maxDailyRate: e.target.value })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "6px" }}>
              السعة *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="input-fields"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: "12px",
              fontWeight: "800",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
            }}
          >
            {isSubmitting ? "جاري إضافة الجراج..." : "تأكيد وإضافة الجراج للدليل فوراً"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="btn btn-cancel"
            style={{ padding: "12px 20px" }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </CustomModal>
  );
}
