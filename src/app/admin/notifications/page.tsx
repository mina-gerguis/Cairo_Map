"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setStatus("");

    try {
      const { error } = await supabase.from("notifications").insert([{
        user_id: null,
        title,
        message,
        type,
        link: link || null,
      }]);

      if (error) throw error;
      
      setStatus("تم إرسال الإشعار لجميع المستخدمين بنجاح!");
      setTitle("");
      setMessage("");
      setLink("");
    } catch (err: any) {
      setStatus(`خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>إرسال إشعارات للجميع</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        ستصل هذه الرسالة فوراً لجميع المستخدمين المسجلين في الموقع.
      </p>

      {status && (
        <div style={{ 
          padding: "16px", 
          marginBottom: "24px", 
          borderRadius: "12px", 
          background: status.includes("خطأ") ? "rgba(255, 59, 48, 0.1)" : "rgba(52, 199, 89, 0.1)",
          color: status.includes("خطأ") ? "#ff3b30" : "#34c759",
          border: `1px solid ${status.includes("خطأ") ? "rgba(255, 59, 48, 0.3)" : "rgba(52, 199, 89, 0.3)"}`
        }}>
          {status}
        </div>
      )}

      <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>عنوان الإشعار</label>
          <input 
            type="text" 
            className="ios-input" 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="مثال: تحديث جديد!" 
          />
        </div>

        <div>
          <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>محتوى الإشعار</label>
          <textarea 
            className="ios-input" 
            required 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            placeholder="أدخل رسالتك هنا..." 
            style={{ minHeight: "120px", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>نوع الإشعار</label>
            <select className="ios-input" value={type} onChange={e => setType(e.target.value)}>
              <option value="info">عادي (🔔)</option>
              <option value="success">نجاح (✅)</option>
              <option value="warning">تنبيه (⚠️)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="help-label" style={{ display: "block", marginBottom: "8px" }}>الرابط (اختياري)</label>
            <input 
              type="text" 
              className="ios-input" 
              value={link} 
              onChange={e => setLink(e.target.value)} 
              placeholder="/profile" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="ios-btn ios-btn-primary" 
          style={{ marginTop: "16px", padding: "16px", fontSize: "1.1rem" }}
        >
          {loading ? "جاري الإرسال..." : "إرسال الإشعار للجميع 🚀"}
        </button>
      </form>
    </div>
  );
}
