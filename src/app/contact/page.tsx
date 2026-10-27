"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./contact.module.css";
import { supabase } from "@/lib/supabase";
import { CONTACT_SUBJECT_OPTIONS } from "@/data/contactReasons";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaLinkedin,
  FaCheckCircle,
  FaExclamationCircle,
  FaHeadset,
  FaSpinner,
} from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    contactType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const email = "cairo.maps@hotmail.com";

  // GSAP Entrance Animations
  useGSAP(() => {
    // Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (badgeRef.current) {
      tl.from(badgeRef.current, { autoAlpha: 0, y: 20, duration: 0.5 });
    }
    if (titleRef.current) {
      tl.from(titleRef.current, { autoAlpha: 0, y: 25, duration: 0.6 }, "-=0.3");
    }
    if (subtitleRef.current) {
      tl.from(subtitleRef.current, { autoAlpha: 0, y: 20, duration: 0.5 }, "-=0.35");
    }

    // Info Card Slide & Reveal
    if (infoCardRef.current) {
      gsap.from(infoCardRef.current, {
        autoAlpha: 0,
        x: -35,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: infoCardRef.current,
          start: "top 85%",
          once: true,
        },
        clearProps: "transform,opacity,visibility",
      });
    }

    // Form Section Slide & Reveal
    if (formCardRef.current) {
      gsap.from(formCardRef.current, {
        autoAlpha: 0,
        x: 35,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: formCardRef.current,
          start: "top 85%",
          once: true,
        },
        clearProps: "transform,opacity,visibility",
      });
    }
  }, []);

  // Animate Success Card when message is sent
  useGSAP(() => {
    if (isSent && successRef.current) {
      gsap.from(successRef.current, {
        autoAlpha: 0,
        scale: 0.88,
        y: 20,
        duration: 0.6,
        ease: "back.out(1.5)",
        clearProps: "transform,opacity,visibility",
      });
    }
  }, [isSent]);

  // Auto-fill logged-in user profile details
  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      try {
        if (!supabase) return;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, email")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && isMounted) {
          const parts = (profile.full_name || "").trim().split(/\s+/);
          const fName = parts[0] || "";
          const lName = parts.slice(1).join(" ") || "";
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || fName,
            lastName: prev.lastName || lName,
            phone: prev.phone || profile.phone || "",
            email: prev.email || profile.email || user.email || "",
          }));
        } else if (user.email && isMounted) {
          setFormData((prev) => ({
            ...prev,
            email: prev.email || user.email || "",
          }));
        }
      } catch (err) {
        console.error("Error loading user profile in contact page:", err);
      }
    }
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.contactType ||
      !formData.message.trim()
    ) {
      setErrorMessage("يرجى ملء جميع الحقول المطلوبة واختيار سبب التواصل.");
      return;
    }

    if (!supabase) {
      setErrorMessage("تعذر الاتصال بقاعدة البيانات. برجاء المحاولة لاحقاً.");
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("contact_messages").insert([
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          contact_type: formData.contactType,
          message: formData.message.trim(),
          user_id: user ? user.id : null,
        },
      ]);

      if (error) throw error;

      setIsSent(true);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        contactType: "",
        message: "",
      });
    } catch (err: any) {
      console.error("Error submitting contact message:", err);
      setErrorMessage("فشل إرسال الرسالة: " + (err.message || "حدث خطأ غير متوقع"));
    } finally {
      setIsSubmitting(false);
    }
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
        <section ref={heroRef} className={styles.heroSection}>
          <div ref={badgeRef} className={styles.heroBadge}>
            <FaHeadset /> فريق الدعم والتواصل
          </div>
          <h1 ref={titleRef} className={styles.title}>اتصل بنا وشاركنا استفساراتك</h1>
          <p ref={subtitleRef} className={styles.subtitle}>
            نحن هنا لمساعدتك والإجابة على أي أسئلة حول خطوط المواصلات، إضافة أماكن جديدة، أو الشراكات وتطوير المنصة.
          </p>
        </section>

        <div className={styles.grid}>
          {/* Info Card */}
          <div ref={infoCardRef} className={styles.infoCard}>
            <h2 className={styles.infoTitle}>معلومات التواصل المباشر</h2>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaEnvelope />
              </div>
              <div>
                <div className={styles.contactLabel}>البريد الإلكتروني الرسمي</div>
                <a href={`mailto:${email}`} className={styles.contactValue}>
                  {email}
                </a>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaMapMarkerAlt />
              </div>
              <div>
                <div className={styles.contactLabel}>الموقع والمركز الرئيسي</div>
                <div className={styles.contactValue}>الشرقية - العاشر من رمضان</div>
              </div>
            </div>

            <div className={styles.socialBox}>
              <div className={styles.socialTitle}>تابعنا على منصات التواصل</div>
              <div className={styles.socialLinks}>
                <a
                  href="https://www.whatsapp.com/channel/0029VbE5UzFGpLHIjyTobP3p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  title="WhatsApp Channel"
                >
                  <i className="bx bxl-whatsapp" style={{ fontSize: "1.25rem", color: "#25d366" }}></i>
                </a>
                <a
                  href="https://www.facebook.com/share/1LTxiYMaJm/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  title="Facebook"
                >
                  <i className="bx bxl-facebook-circle" style={{ fontSize: "1.25rem", color: "#1877f2" }}></i>
                </a>
                <a
                  href="https://x.com/cairo_map"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  title="X (Twitter)"
                >
                  <svg width="18px" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/mina-gerguis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  title="LinkedIn"
                >
                  <FaLinkedin style={{ fontSize: "1.25rem", color: "#0a66c2" }} />
                </a>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div ref={formCardRef} className={styles.formSection}>
            {isSent ? (
              <div ref={successRef} className={styles.successBox}>
                <FaCheckCircle className={styles.successIcon} />
                <h3 className={styles.successTitle}>تم إرسال رسالتك بنجاح!</h3>
                <p className={styles.successDescription}>
                  شكراً لتواصلك معنا. سيقوم فريق الدعم الفني بمراجعة رسالتك والرد عليك عبر بريدك الإلكتروني في أقرب وقت ممكن.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className={styles.resetBtn}
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className={styles.errorAlert}>
                    <FaExclamationCircle />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className={styles.grid2Col}>
                  <div>
                    <label className={styles.formLabel}>الاسم الأول *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>الاسم الأخير *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: محمد"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.grid2Col}>
                  <div>
                    <label className={styles.formLabel}>رقم الهاتف *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`${styles.inputField} ${styles.inputLtrRight}`}
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      placeholder="example@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`${styles.inputField} ${styles.inputLtrRight}`}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>التواصل بخصوص *</label>
                  <select
                    required
                    value={formData.contactType}
                    onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                    className={styles.selectField}
                  >
                    <option value="">اختر موضوع التواصل...</option>
                    {CONTACT_SUBJECT_OPTIONS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
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
                    <>
                      <FaSpinner className={styles.spinner} /> جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
