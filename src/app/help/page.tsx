"use client";

import React, { useState } from "react";

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج"
];

const CONTACT_TYPES = ["إبلاغ", "شكوى", "طلب مساعدة", "اقتراح تطوير"];

export default function HelpPage() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    governorate: "", city: "", contactType: "", message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="app-container" style={{ maxWidth: "760px", paddingTop: "40px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🛟</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: "800", marginBottom: "10px" }}>مركز المساعدة والدعم</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.7", maxWidth: "480px", margin: "0 auto" }}>
          هل لديك استفسار، شكوى، أو اقتراح؟ فريقنا في STAGE KODE مستعد للمساعدة خلال 24 ساعة.
        </p>
      </div>

      {submitted ? (
        /* Success State */
        <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: "800", marginBottom: "12px" }}>تم إرسال رسالتك بنجاح!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.7", marginBottom: "28px" }}>
            شكراً لتواصلك معنا. سيقوم فريق STAGE KODE بالرد عليك في أقرب وقت ممكن.
          </p>
          <button className="ios-btn ios-btn-primary" onClick={() => { setSubmitted(false); setFormData({ firstName: "", lastName: "", phone: "", email: "", governorate: "", city: "", contactType: "", message: "" }); }}>
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        /* Form */
        <div className="glass-panel" style={{ padding: "36px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Name Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="help-label">الاسم الأول *</label>
                <input name="firstName" type="text" className="ios-input" placeholder="مثال: أحمد" value={formData.firstName} onChange={handleChange} style={{ paddingRight: "16px" }} required />
              </div>
              <div>
                <label className="help-label">الاسم الثاني *</label>
                <input name="lastName" type="text" className="ios-input" placeholder="مثال: محمد" value={formData.lastName} onChange={handleChange} style={{ paddingRight: "16px" }} required />
              </div>
            </div>

            {/* Contact Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="help-label">رقم الهاتف *</label>
                <input name="phone" type="tel" className="ios-input" placeholder="01xxxxxxxxx" value={formData.phone} onChange={handleChange} style={{ paddingRight: "16px" }} required />
              </div>
              <div>
                <label className="help-label">البريد الإلكتروني *</label>
                <input name="email" type="email" className="ios-input" placeholder="example@email.com" value={formData.email} onChange={handleChange} style={{ paddingRight: "16px" }} required />
              </div>
            </div>

            {/* Location Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="help-label">المحافظة *</label>
                <select name="governorate" className="ios-input help-select" value={formData.governorate} onChange={handleChange} required style={{ paddingRight: "16px" }}>
                  <option value="">اختر المحافظة...</option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="help-label">المدينة / الحي</label>
                <input name="city" type="text" className="ios-input" placeholder="مثال: مدينة نصر" value={formData.city} onChange={handleChange} style={{ paddingRight: "16px" }} />
              </div>
            </div>

            {/* Contact Type */}
            <div>
              <label className="help-label">نوع التواصل *</label>
              <select name="contactType" className="ios-input help-select" value={formData.contactType} onChange={handleChange} required style={{ paddingRight: "16px" }}>
                <option value="">اختر نوع التواصل...</option>
                {CONTACT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="help-label">رسالتك *</label>
              <textarea
                name="message"
                className="ios-input"
                placeholder="اكتب رسالتك بالتفصيل هنا... كلما كانت الرسالة واضحة كان الرد أسرع وأدق."
                value={formData.message}
                onChange={handleChange}
                required
                style={{ paddingRight: "16px", minHeight: "140px", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Info Note */}
            <div style={{ display: "flex", gap: "10px", padding: "14px 16px", background: "rgba(47, 128, 237, 0.06)", border: "1px solid rgba(47, 128, 237, 0.2)", borderRadius: "var(--radius-sm)", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>ℹ️</span>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6", margin: 0 }}>
                يتم معالجة جميع الطلبات خلال مدة أقصاها <strong>24-48 ساعة</strong> في أيام العمل. للحالات الطارئة يرجى الاتصال المباشر على <strong>01234567890</strong>.
              </p>
            </div>

            {/* Submit */}
            <button type="submit" className="ios-btn ios-btn-primary" disabled={loading} style={{ width: "100%", padding: "16px", fontSize: "1.1rem", marginTop: "6px", opacity: loading ? 0.8 : 1 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                  <span style={{ width: "18px", height: "18px", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                  جاري الإرسال...
                </span>
              ) : "إرسال الرسالة"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
