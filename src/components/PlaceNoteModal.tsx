"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
// Icon
import { MdOutlinePostAdd, MdDelete } from "react-icons/md";

interface PlaceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
  onSaved?: (note: string | null) => void;
}

export default function PlaceNoteModal({ isOpen, onClose, placeId, placeName, onSaved }: PlaceNoteModalProps) {
  const { user } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isOpen || !placeId || !user || !supabase) return;

    const loadNote = async () => {
      if (!supabase) return;
      setLoading(true);
      setStatus("");
      try {
        const { data, error } = await supabase
          .from("place_notes")
          .select("note")
          .eq("user_id", user.id)
          .eq("place_id", placeId)
          .maybeSingle();
          
        if (data) {
          setNoteText(data.note);
          setExists(true);
        } else {
          setNoteText("");
          setExists(false);
        }
      } catch (err) {
        console.error("Error loading note:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [isOpen, placeId, user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user || !supabase) return;
    if (!noteText.trim()) {
      handleDelete();
      return;
    }

    setSaving(true);
    setStatus("");
    try {
      const { error } = await supabase
        .from("place_notes")
        .upsert({
          user_id: user.id,
          place_id: placeId,
          note: noteText.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,place_id" });

      if (error) throw error;
      
      setStatus("تم حفظ الملاحظة بنجاح!");
      if (onSaved) onSaved(noteText.trim());
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatus(`خطأ: ${err.message || "فشل الحفظ"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !supabase) return;
    setSaving(true);
    setStatus("");
    try {
      const { error } = await supabase
        .from("place_notes")
        .delete()
        .eq("user_id", user.id)
        .eq("place_id", placeId);

      if (error) throw error;
      
      setStatus("تم حذف الملاحظة.");
      setNoteText("");
      setExists(false);
      if (onSaved) onSaved(null);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatus(`خطأ: ${err.message || "فشل الحذف"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ios-sheet-overlay" style={{ zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
      <div className="glass-panel" style={{
        width: "90%",
        maxWidth: "400px",
        borderRadius: "24px",
        padding: "24px",
        border: "1px solid var(--border-glass)",
        background: "var(--bg-secondary)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)"
      }}>
        
        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            📝 إضافة تذكير / ملاحظة
          </h3>
          <button onClick={onClose} style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px" , borderRadius: "50%" }}>
            <i className="bx bx-x" style={{fontSize:"1.2rem", color:"var(--text-primary)"}}></i>
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: "1.4" }}>
          اكتب ملاحظة خاصة بك حول <strong>{placeName}</strong> (مثل: جرب طبق السوشي الجديد، أو اسأل عن العرض الخاص). لن يراها أحد غيرك.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>جاري تحميل ملاحظتك...</div>
        ) : (
          <div>
            {status && (
              <div style={{
                background: status.startsWith("خطأ") ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)",
                color: status.startsWith("خطأ") ? "#ff3b30" : "#34c759",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "12px"
              }}>
                {status}
              </div>
            )}

            <textarea
              className="ios-input"
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                fontSize: "0.95rem",
                borderRadius: "12px",
                resize: "vertical",
                fontFamily: "var(--font-cairo)",
                marginBottom: "16px"
              }}
              placeholder="اكتب تذكيرك هنا..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={saving}
              maxLength={500}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="ios-btn ios-btn-primary"
                style={{ flex: 1, padding: "10px", fontSize: "0.9rem",minWidth:"50%" }}
              >
                <MdOutlinePostAdd style={{fontSize:"1.2rem"}} />
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>

              {exists && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="ios-btn"
                  style={{ background: "rgba(255, 59, 48, 0.1)", border: "1px solid rgba(255, 59, 48, 0.2)", color: "#ff3b30", padding: "10px", fontSize: "0.9rem" }}
                >
                  <MdDelete style={{fontSize:"1.2rem"}}/>
                  حذف
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
