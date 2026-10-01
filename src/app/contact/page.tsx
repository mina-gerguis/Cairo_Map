"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./contact.module.css";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaLinkedin,
  FaCheckCircle,
  FaExclamationCircle,
  FaHeadset,
} from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate sending or Supabase insertion
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: "", email: "", subject: "inquiry", message: "" });
    }, 800);
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "اتصل بنا - ماب القاهرة",
    url: `${siteUrl}/contact`,
    description: "تواصل مع فريق عمل وإدارة ماب القاهرة للاستفسارات والاقتراحات والشراكات الإعلانية.",
    mainEntity: {
      "@type": "Organization",
      name: "ماب القاهرة",
      url: siteUrl,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@cairomap.app",
        availableLanguage: ["Arabic", "English"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroBadge}>
            <FaHeadset /> فريق الدعم والتواصل
          </div>
          <h1 className={styles.title}>اتصل بنا وشاركنا استفساراتك</h1>
          <p className={styles.subtitle}>
            نحن هنا لمساعدتك والإجابة على أي أسئلة حول خطوط المواصلات، إضافة أماكن جديدة، أو الشراكات وتطوير المنصة.
          </p>
        </section>

        <div className={styles.grid}>
          {/* Info Card */}
          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>معلومات التواصل المباشر</h2>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaEnvelope />
              </div>
              <div>
                <div className={styles.contactLabel}>البريد الإلكتروني الرسمي</div>
                <a href="mailto:support@cairomap.app" className={styles.contactValue}>
                  support@cairomap.app
                </a>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaMapMarkerAlt />
              </div>
              <div>
                <div className={styles.contactLabel}>الموقع والمركز الرئيسي</div>
                <div className={styles.contactValue}>القاهرة، جمهورية مصر العربية</div>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaClock />
              </div>
              <div>
                <div className={styles.contactLabel}>أوقات الاستجابة والدعم</div>
                <div className={styles.contactValue}>الرد خلال 24 - 48 ساعة عمل</div>
              </div>
            </div>

            <div className={styles.socialBox}>
              <div className={styles.socialTitle}>تابعنا وشبكة المطورين</div>
              <div className={styles.socialLinks}>
                <a
                  href="https://www.linkedin.com/company/repo-dex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  title="RepoDex LinkedIn"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>

            <div style={{ marginTop: "12px", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              💡 إذا كنت تريد اقتراح إضافة مكان جديد أو تعديل بيانات محل أو محطة، يمكنك استخدام صفحة{" "}
              <Link href="/propose-place" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>
                اقتراح مكان
              </Link>.
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>أرسل رسالة مباشرة</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>نوع الاستفسار</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={styles.selectField}
                >
                  <option value="inquiry">استفسار عام</option>
                  <option value="feedback">اقتراح أو فكرة تحسين</option>
                  <option value="bug">الإبلاغ عن مشكلة تقنية</option>
                  <option value="business">إعلانات وشراكات تجارية</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>نص الرسالة *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب تفاصيل رسالتك أو استفسارك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={styles.textareaField}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting ? (
                  "جاري الإرسال..."
                ) : (
                  <>
                    <FaPaperPlane /> إرسال الرسالة
                  </>
                )}
              </button>

              {isSent && (
                <div className={styles.successMessage}>
                  <FaCheckCircle style={{ marginLeft: "6px" }} />
                  تم استلام رسالتك بنجاح! سيقوم فريق العمل بمراجعتها والرد عليك قريباً.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
