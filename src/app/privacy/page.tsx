"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Lock,
  MapPin,
  UserCheck,
  Cookie,
  Trash2,
  Eye,
  RefreshCw,
  Mail,
  FileText,
  CheckCircle2,
  ArrowRight,
  Search,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Server,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";

interface PrivacySection {
  id: string;
  tag: string;
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  summary: string;
  content: React.ReactNode;
}

export default function PrivacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsListRef = useRef<HTMLDivElement>(null);

  // ── GSAP Orchestrated Micro-Interactions & Scroll Animations ──
  useGSAP(
    () => {
      // 1. Hero Entrance Timeline
      if (heroRef.current) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        const backBtn = heroRef.current.querySelector(".privacy-back-btn");
        const badge = heroRef.current.querySelector(".privacy-badge");
        const title = heroRef.current.querySelector(".privacy-title");
        const subtitle = heroRef.current.querySelector(".privacy-subtitle");
        const highlights = heroRef.current.querySelectorAll(".privacy-highlight-card");
        const searchBox = heroRef.current.querySelector(".privacy-search-filter");

        if (backBtn) tl.fromTo(backBtn, { autoAlpha: 0, x: 15 }, { autoAlpha: 1, x: 0, duration: 0.35 });
        if (badge) tl.fromTo(badge, { autoAlpha: 0, y: -12, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2");
        if (title) tl.fromTo(title, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.25");
        if (subtitle) tl.fromTo(subtitle, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.3");
        if (highlights.length > 0) {
          tl.fromTo(
            highlights,
            { autoAlpha: 0, y: 20, scale: 0.97 },
            { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.45, clearProps: "transform,opacity,visibility" },
            "-=0.25"
          );
        }
        if (searchBox) tl.fromTo(searchBox, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.2");
      }

      // 2. ScrollTrigger Stagger for Policy Sections
      if (sectionsListRef.current) {
        const sectionCards = sectionsListRef.current.querySelectorAll(".privacy-section-card");
        if (sectionCards.length > 0) {
          ScrollTrigger.batch(sectionCards, {
            start: "top 88%",
            once: true,
            onEnter: (batch) => {
              gsap.fromTo(
                batch,
                { autoAlpha: 0, y: 24 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.5,
                  stagger: 0.06,
                  ease: "power2.out",
                  clearProps: "transform,opacity,visibility",
                }
              );
            },
          });
        }
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  // ── Copy Support Email with Feedback ──
  const handleCopyEmail = useCallback(() => {
    navigator.clipboard?.writeText("cairo.maps@hotmail.com").then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    });
  }, []);

  // ── Smooth Scroll to Anchor ──
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // ── 3 Trust Pillars Highlights ──
  const trustHighlights = [
    {
      icon: ShieldCheck,
      title: "أمان وتشفير قياسي",
      desc: "تشفير HTTPS/TLS 1.3 وحماية قواعد البيانات عبر سياسات الأمان على مستوى الصفوف (RLS).",
      color: "#006FEE",
      badgeText: "تشفير كامل",
    },
    {
      icon: Eye,
      title: "لا نبيع بياناتك مطلقاً",
      desc: "موقعك الجغرافي وبياناتك لا تُشارك ولا تُباع لشبكات إعلانية أو سماسرة بيانات تجارية.",
      color: "#10b981",
      badgeText: "خصوصية مطلقة",
    },
    {
      icon: Trash2,
      title: "حق الحذف الفوري",
      desc: "تحكم كامل في مسح وتعديل بياناتك، وخيار فوري لحذف الحساب ومسح كافة المفضلات والسجلات.",
      color: "#f59e0b",
      badgeText: "تحكم مباشر",
    },
  ];

  // ── Detailed Legal & Platform Policy Sections ──
  const allSections: PrivacySection[] = useMemo(
    () => [
      {
        id: "commitment",
        tag: "ميثاق الشفافية",
        title: "1. التزامنا وميثاق الشفافية (قريب)",
        icon: FileText,
        summary: "رؤيتنا لحماية خصوصية كل زائر ومستخدم لدليل وخدمات القاهرة الكبرى ومواصلاتها.",
        content: (
          <div className="space-y-3.5">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              نرحب بك في منصة وتطبيق <strong style={{ color: "var(--color-primary)" }}>قريب (Cairo Map)</strong>، دليلك الذكي الشامل لاستكشاف شوارع القاهرة، شبكات المترو والمونوريل، وسائل النقل، والأماكن الحيوية والخدمية. نضع خصوصية وأمان مستخدمينا في صميم أولوياتنا البرمجية والتصميمية.
            </p>
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              تحدد هذه الوثيقة المبادئ الصريحة التي تحكم تعاملنا مع بياناتك الرقمية، ونؤكد التزامنا التام بالشفافية الكاملة وفقاً لأحكام <strong style={{ color: "var(--color-foreground)" }}>قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020</strong>، وبما يتوافق مع أرقى المعايير العالمية لحماية البيانات والخصوصية الرقمية (GDPR).
            </p>
            <div
              style={{
                backgroundColor: "rgba(0, 111, 238, 0.06)",
                border: "1px solid rgba(0, 111, 238, 0.18)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <CheckCircle2 size={20} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--color-foreground)", lineHeight: "1.6", textWrap: "pretty" }}>
                <strong>تعهد واضح:</strong> استخدامك لمنصة قريب يعني أنك تستمتع بدليل موثوق دون أي ممارسات تتبع مخفية أو استغلال تجاري غير مصرح به لمعلوماتك.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "gps-location",
        tag: "الموقع الجغرافي",
        title: "2. الموقع الجغرافي اللحظي (GPS) ودقة الخرائط",
        icon: MapPin,
        summary: "كيف نستخدم إحداثياتك لحساب أقرب المحطات والخدمات فقط، ولماذا لا نتتبعك في الخلفية.",
        content: (
          <div className="space-y-4">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              تحتاج بعض ميزات المنصة (مثل: حساب أقرب محطة مترو، خط السير الأنسب، توجيهات المواصلات، والطقس المحلي) إلى معرفة موقعك الجغرافي التقريبي أو الدقيق. يتم ذلك وفق المعايير الصارمة التالية:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", fontWeight: "700", marginBottom: "8px" }}>
                  <MapPin size={18} />
                  <span>طلب الإذن الصريح</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.65", textWrap: "pretty" }}>
                  لا يتم الوصول للموقع الجغرافي إلا بعد موافقتك الصريحة عبر نافذة المتصفح أو الجهاز. يمكنك رفض الإذن والاستمرار في البحث اليدوي عن أي محطة أو شارع بحرية تامة.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: "700", marginBottom: "8px" }}>
                  <Smartphone size={18} />
                  <span>لا تتبع في الخلفية</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.65", textWrap: "pretty" }}>
                  لا نقوم بتتبع موقعك عندما يكون التطبيق أو المتصفح مغلقاً. يتم قراءة الإحداثيات حصراً لحظة طلبك للخدمة (مثل قياس المسافة أو الطقس) ثم يتم التوقف فوراً.
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <ShieldCheck size={20} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-foreground)", lineHeight: "1.6", textWrap: "pretty" }}>
                <strong>عدم الاحتفاظ بسجل المسارات:</strong> لا نقوم بتسجيل أو تخزين خطوط سيرك الجغرافية في أي قواعد بيانات ولا نقوم بإنشاء سجل لتحركاتك اليومية.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "account-data",
        tag: "بيانات الحساب",
        title: "3. بيانات الحساب والتسجيل (Supabase Auth)",
        icon: UserCheck,
        summary: "المعلومات المحفوظة عند تسجيل الدخول، والمفضلات، والأماكن التي تختار حفظها.",
        content: (
          <div className="space-y-3.5">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              يمكنك استخدام وتصفح دليل قريب بالكامل بدون تسجيل حساب. ولكن عند قيامك بإنشاء حساب طواعية للاستفادة من الميزات الإضافية (مثل حفظ الأماكن في المفضلة، وتقييم الخدمات، وإرسال الاقتراحات)، نقوم بحفظ البيانات الآتية:
            </p>
            <ul style={{ paddingRight: "22px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li style={{ textWrap: "pretty" }}>
                <strong style={{ color: "var(--color-foreground)" }}>بيانات التسجيل الأساسية:</strong> الاسم والبريد الإلكتروني وصورة الملف الشخصي (عند تسجيل الدخول عبر Google أو البريد).
              </li>
              <li style={{ textWrap: "pretty" }}>
                <strong style={{ color: "var(--color-foreground)" }}>كلمات المرور المشفرة:</strong> لا نعرف كلمة مرورك ولا يمكننا قراءتها؛ حيث يتم تشفيرها بخوارزميات تجزئة آمنة أحادية الاتجاه (Salted Hashes) عبر منظومة Supabase Authentication السحابية.
              </li>
              <li style={{ textWrap: "pretty" }}>
                <strong style={{ color: "var(--color-foreground)" }}>المفضلات والتقييمات:</strong> قائمة الأماكن التي تحفظها للرجوع السريع لها، والتعليقات أو الاقتراحات التي تشاركها لدعم مجتمع المستخدمين.
              </li>
            </ul>
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: "1.7", textWrap: "pretty" }}>
              نؤكد لك أننا لا نطلب أي بيانات مالية أو أرقام بطاقات بنكية لتصفح واستخدام الدليل الأساسي للمنصة.
            </p>
          </div>
        ),
      },
      {
        id: "ai-planner",
        tag: "الذكاء الاصطناعي",
        title: "4. مخطط الرحلات الذكي (AI Trip Planner)",
        icon: Sparkles,
        summary: "كيف يتعامل المساعد الذكي مع تفضيلاتك وميزانيتك لتنسيق يومك دون تدريب نماذج خارجية.",
        content: (
          <div className="space-y-3.5">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              توفر منصة قريب أداة "مخطط الرحلات بالذكاء الاصطناعي" لمساعدتك في تخطيط يومك في القاهرة أو الجيزة أو المدن المحيطة، وتنسيق أماكن الخروج والمطاعم والكافيهات بناءً على ميزانيتك وعدد الأفراد.
            </p>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", fontWeight: "700", marginBottom: "8px" }}>
                <Lock size={18} />
                <span>معالجة مؤقتة للاستفسارات</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.65", textWrap: "pretty" }}>
                تُعالج البيانات التي تدخلها في المخطط (مثل الميزانية، المنطقة، ونوع الخروجة) بشكل مؤقت ولحظي فقط لإنشاء جدول اليوم المناسب لك. لا نقوم بربط استفساراتك بهويتك الحقيقية لغرض الإعلانات الموجهة، ولا تُستخدم مدخلاتك لتدريب نماذج ذكاء اصطناعي تجارية عامة.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "cookies-storage",
        tag: "ملفات الكوكيز",
        title: "5. ملفات تعريف الارتباط والتخزين المحلي (Local Storage & Cookies)",
        icon: Cookie,
        summary: "حفظ تفضيلات الوضع الداكن/الفاتح، سرعة الاستجابة، والإعلانات الشفافة الداعمة للمنصة.",
        content: (
          <div className="space-y-3.5">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              تستخدم المنصة تقنيات التخزين المحلي وملفات الكوكيز الخفيفة لتقديم تجربة سريعة ومريحة لعينيك، وتنقسم إلى نوعين:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-foreground)", fontWeight: "700", marginBottom: "8px" }}>
                  <Server size={18} style={{ color: "var(--color-primary)" }} />
                  <span>التخزين المحلي الضروري (Local Storage)</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.65", textWrap: "pretty" }}>
                  نخزن في متصفحك تفضيلات المظهر (الوضع الليلي أو الفاتح)، وتفضيل المدينة المحددة، وسجل البحث السريع على جهازك حتى لا تضطر لإعادة ضبط اختياراتك في كل زيارة، ولتقليل استهلاك باقة الإنترنت.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-foreground)", fontWeight: "700", marginBottom: "8px" }}>
                  <Cookie size={18} style={{ color: "#f59e0b" }} />
                  <span>إعلانات Google المعتمدة</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.65", textWrap: "pretty" }}>
                  نستعين بشبكة إعلانات Google AdSense الموثوقة لعرض إعلانات غير مضللة تساعد في تغطية تكاليف الخوادم والخرائط وتقديم الخدمة مجاناً للجميع. يمكنك ضبط تفضيلات الإعلانات مباشرة عبر إعدادات خصوصية Google في أي وقت.
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "data-security",
        tag: "الأمن والتشفير",
        title: "6. أمن التشفير وحماية البيانات الفائقة",
        icon: Lock,
        summary: "بروتوكولات HTTPS/TLS وسياسات RLS السحابية لمنع أي تسريب أو اختراق.",
        content: (
          <div className="space-y-3.5">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              نطبق تدابير تقنية وبرمجية متعددة المستويات لحماية معلوماتك وضمان استمرارية أمان المنصة:
            </p>
            <ul style={{ paddingRight: "22px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li style={{ textWrap: "pretty" }}>
                <strong style={{ color: "var(--color-foreground)" }}>تشفير الاتصال الكامل (HTTPS/TLS 1.3):</strong> جميع البيانات المتبادلة بين جهازك وخوادمنا تمر عبر قنوات مشفرة 256-bit لمنع أي تنصت أو اعتراض على الشبكات العامة.
              </li>
              <li style={{ textWrap: "pretty" }}>
                <strong style={{ color: "var(--color-foreground)" }}>عزل الصلاحيات (Row Level Security):</strong> نطبق سياسات RLS الصارمة في قواعد بيانات Supabase، والتي تضمن برمجياً عدم قدرة أي مستخدم على قراءة أو تعديل مفضلات أو بيانات مستخدم آخر.
              </li>
              <li style={{ textWrap: "pretty" }}>
                <strong style={{ color: "var(--color-foreground)" }}>مراقبة دورية وفلاتر حماية:</strong> مراقبة مستمرة للتصدي لأي محاولات اختراق أو برمجيات خبيثة وحظر الهجمات الموزعة (DDoS Protection).
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "user-rights-deletion",
        tag: "حقوق المستخدم وحذف الحساب",
        title: "7. حقوقك القانونية وخيار حذف الحساب الفوري",
        icon: Trash2,
        summary: "حقوقك المنصوص عليها قانوناً، وزر الحذف الفوري لمسح الحساب وكافة السجلات بلا رجعة.",
        content: (
          <div className="space-y-4">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              بموجب قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020، وقوانين الخصوصية العالمية، تتمتع بالحقوق الكاملة الآتية:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                <strong style={{ color: "var(--color-foreground)", display: "block", marginBottom: "4px" }}>١. حق الاطلاع والتعديل</strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>مراجعة وتعديل بيانات ملفك الشخصي في أي وقت.</span>
              </div>
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                <strong style={{ color: "var(--color-foreground)", display: "block", marginBottom: "4px" }}>٢. حق سحب الموافقة</strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>تعطيل إذن الموقع الجغرافي أو إشعارات التنبيه فوراً.</span>
              </div>
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                <strong style={{ color: "var(--color-foreground)", display: "block", marginBottom: "4px" }}>٣. حق الحصول على نسخة</strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>طلب تقرير أو تصدير للأماكن والمفضلات التي قمت بحفظها.</span>
              </div>
            </div>

            {/* Direct Instant Account Deletion Callout */}
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.06)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "16px",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ef4444", fontWeight: "800", fontSize: "1.05rem" }}>
                <AlertCircle size={22} />
                <span>الحق المطلق في محو البيانات وحذف الحساب نهائياً</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--color-foreground)", lineHeight: "1.7", textWrap: "pretty" }}>
                نحترم رغبتك بالكامل إذا قررت التوقف عن استخدام المنصة. يمكنك حذف حسابك بشكل فوري ومباشر بنفسك من خلال الدخول إلى صفحة الملف الشخصي واختيار <strong>"حذف الحساب نهائياً"</strong>.
              </p>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: "1.6", textWrap: "pretty" }}>
                بمجرد تأكيدك، يتم مسح بريدك الإلكتروني، اسمك، صورتك، مفضلاتك، وكافة سجلاتك من قواعد بياناتنا السحابية فوراً دون استرجاع.
              </p>
              <div style={{ paddingTop: "4px" }}>
                <Link
                  href="/profile"
                  className="active:scale-[0.96] transition-transform"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#ef4444",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "0.88rem",
                    textDecoration: "none",
                    minHeight: "40px",
                  }}
                >
                  <Trash2 size={16} />
                  <span>الانتقال لصفحة الملف الشخصي للتحكم أو الحذف</span>
                </Link>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "support-contact",
        tag: "التواصل والدعم",
        title: "8. تحديثات السياسة وقنوات التواصل الرسمي",
        icon: Mail,
        summary: "كيف نخطرك بأي تحديث، وطريقة التواصل المباشر مع فريق ومسؤول حماية البيانات.",
        content: (
          <div className="space-y-3.5">
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              قد نقوم بتحديث هذه البنود من وقت لآخر لمواكبة الخدمات والميزات البرمجية الجديدة أو التعديلات التشريعية. عند إجراء أي تعديل جوهري، سنقوم بنشر إشعار بارز في المنصة مع تحديث تاريخ "آخر مراجعة" في رأس هذه الصفحة.
            </p>
            <p style={{ lineHeight: "1.8", textWrap: "pretty" }}>
              إذا كان لديك أي سؤال، استفسار قانوني، أو رغبة في تقديم شكوى أو استفسار بخصوص بياناتك، يمكنك التواصل مباشرة مع مسؤول حماية البيانات في قريب عبر البريد الإلكتروني الرسمي:
            </p>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={20} style={{ color: "var(--color-primary)" }} />
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>البريد الإلكتروني المعتمد للدعم والخصوصية:</div>
                  <strong style={{ fontSize: "1rem", color: "var(--color-foreground)", direction: "ltr", display: "inline-block" }}>
                    cairo.maps@hotmail.com
                  </strong>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="active:scale-[0.96] transition-transform"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--color-foreground)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    minHeight: "38px",
                    outline: "none",
                  }}
                  title="نسخ البريد الإلكتروني"
                >
                  {copiedEmail ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
                  <span>{copiedEmail ? "تم النسخ!" : "نسخ البريد"}</span>
                </button>
                <a
                  href="mailto:cairo.maps@hotmail.com?subject=استفسار%20حول%20خصوصية%20ماب%20القاهرة"
                  className="active:scale-[0.96] transition-transform"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    minHeight: "38px",
                  }}
                >
                  <Mail size={16} />
                  <span>إرسال رسالة</span>
                </a>
              </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px" }}>
              ⏳ نلتزم بالرد الرسمي على استفسارات وطلبات الخصوصية وحذف البيانات خلال <strong>24 إلى 48 ساعة</strong> من تاريخ الاستلام.
            </div>
          </div>
        ),
      },
    ],
    [copiedEmail, handleCopyEmail]
  );

  // ── Filtered Sections based on Search or Tag ──
  const filteredSections = useMemo(() => {
    let result = allSections;
    if (activeCategory !== "all") {
      result = result.filter((sec) => sec.id === activeCategory);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (sec) =>
          sec.title.toLowerCase().includes(q) ||
          sec.tag.toLowerCase().includes(q) ||
          sec.summary.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allSections, activeCategory, searchQuery]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        color: "var(--color-foreground)",
        fontFamily: "var(--font-heading)",
        paddingBottom: "80px",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "28px 16px 0 16px" }}>
        {/* ── 1. TOP NAV / BREADCRUMB ── */}
        <div
          ref={heroRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Link
            href="/"
            className="privacy-back-btn active:scale-[0.96] transition-transform"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              minHeight: "42px",
              borderRadius: "999px",
              backgroundColor: "var(--bg-glass-card)",
              border: "1px solid var(--border-glass)",
              color: "var(--color-foreground)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <ArrowRight size={18} style={{ color: "var(--color-primary)" }} />
            <span>العودة للرئيسية</span>
          </Link>

          <div
            className="privacy-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "var(--bg-glass)",
              border: "1px solid var(--border-glass)",
            }}
          >
            <ShieldCheck size={16} style={{ color: "#10b981" }} />
            <span>وثيقة معتمدة • آخر تحديث: أكتوبر 2026</span>
          </div>
        </div>

        {/* ── 2. HERO STATEMENT ── */}
        <div
          style={{
            padding: "36px 24px 32px 24px",
            marginBottom: "32px",
            textAlign: "center",
            position: "relative",
            borderRadius: "24px",
            backgroundColor: "var(--bg-glass-card)",
            border: "1px solid var(--border-glass)",
            boxShadow: "0 10px 30px var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "380px",
              height: "200px",
              background: "radial-gradient(circle, rgba(0, 111, 238, 0.15) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "22px",
              backgroundColor: "rgba(0, 111, 238, 0.1)",
              border: "1px solid rgba(0, 111, 238, 0.25)",
              marginBottom: "18px",
              position: "relative",
            }}
          >
            <Image
              src="/images/icons3d/document.webp"
              alt="سياسة الخصوصية"
              width={64}
              height={64}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <h1
            className="privacy-title"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: "900",
              marginBottom: "12px",
              color: "var(--color-foreground)",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            سياسة الخصوصية وحماية البيانات
          </h1>

          <p
            className="privacy-subtitle"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "var(--text-secondary)",
              maxWidth: "680px",
              margin: "0 auto 28px auto",
              lineHeight: "1.75",
              textWrap: "pretty",
            }}
          >
            نلتزم في <strong style={{ color: "var(--color-foreground)" }}>قريب (Cairo Map)</strong> بالشفافية الكاملة وحماية بياناتك وفق معايير قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020، لضمان استكشاف آمن وموثوق لكافة المعالم والمواصلات.
          </p>

          {/* ── 3 Trust Highlights ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
              textAlign: "right",
            }}
          >
            {trustHighlights.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="privacy-highlight-card active:scale-[0.96] transition-transform"
                  style={{
                    padding: "18px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid var(--border-glass)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        backgroundColor: `${item.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: item.color,
                      }}
                    >
                      <IconComp size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "999px",
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.badgeText}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1rem", fontWeight: "700", margin: 0, color: "var(--color-foreground)" }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6", textWrap: "pretty" }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. SEARCH & QUICK JUMP FILTER PILLS ── */}
        <div
          className="privacy-search-filter"
          style={{
            marginBottom: "28px",
            backgroundColor: "var(--bg-glass-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "18px",
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-glass)",
              borderRadius: "12px",
              padding: "10px 14px",
              marginBottom: "14px",
            }}
          >
            <Search size={18} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="ابحث داخل سياسة الخصوصية (مثال: حذف الحساب، الموقع الجغرافي، الكوكيز)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-foreground)",
                fontSize: "0.95rem",
                fontFamily: "inherit",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                مسح
              </button>
            )}
          </div>

          {/* Quick Jump Category Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600", marginLeft: "6px" }}>
              الانتقال السريع:
            </span>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="active:scale-[0.96] transition-transform"
              style={{
                padding: "6px 14px",
                minHeight: "36px",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: activeCategory === "all" ? "var(--color-primary)" : "rgba(255, 255, 255, 0.05)",
                color: activeCategory === "all" ? "#ffffff" : "var(--text-secondary)",
                border: "1px solid var(--border-glass)",
                outline: "none",
              }}
            >
              كافة البنود ({allSections.length})
            </button>
            {allSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveCategory(sec.id);
                  scrollToSection(sec.id);
                }}
                className="active:scale-[0.96] transition-transform"
                style={{
                  padding: "6px 14px",
                  minHeight: "36px",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: activeCategory === sec.id ? "var(--color-primary)" : "rgba(255, 255, 255, 0.05)",
                  color: activeCategory === sec.id ? "#ffffff" : "var(--text-secondary)",
                  border: "1px solid var(--border-glass)",
                  outline: "none",
                }}
              >
                {sec.tag}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. STRUCTURED POLICY SECTIONS ── */}
        <div ref={sectionsListRef} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filteredSections.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                backgroundColor: "var(--bg-glass-card)",
                borderRadius: "18px",
                border: "1px solid var(--border-glass)",
              }}
            >
              <AlertCircle size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px auto" }} />
              <h4 style={{ margin: "0 0 6px 0", color: "var(--color-foreground)" }}>لم نجد بنداً يطابق بحثك "{searchQuery}"</h4>
              <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                جرب البحث بكلمات أخرى مثل "الموقع"، "الحساب"، "كوكيز"، أو استعرض البنود كاملة.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="btn btn-primary active:scale-[0.96] transition-transform"
                style={{ minHeight: "40px", padding: "8px 20px" }}
              >
                عرض كافة بنود الخصوصية
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => {
              const SectionIcon = sec.icon;
              return (
                <article
                  key={sec.id}
                  id={sec.id}
                  className="privacy-section-card"
                  style={{
                    backgroundColor: "var(--bg-glass-card)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "18px",
                    padding: "26px 22px",
                    boxShadow: "var(--shadow-sm)",
                    scrollMarginTop: "90px",
                  }}
                >
                  {/* Section Title Bar */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(0, 111, 238, 0.08)",
                        border: "1px solid rgba(0, 111, 238, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-primary)",
                        flexShrink: 0,
                      }}
                    >
                      <SectionIcon size={22} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "var(--color-primary)",
                            backgroundColor: "rgba(0, 111, 238, 0.08)",
                            padding: "2px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {sec.tag}
                        </span>
                      </div>
                      <h2
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "800",
                          color: "var(--color-foreground)",
                          margin: "0 0 4px 0",
                          textWrap: "balance",
                        }}
                      >
                        {sec.title}
                      </h2>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", textWrap: "pretty" }}>
                        {sec.summary}
                      </p>
                    </div>
                  </div>

                  {/* Section Divider */}
                  <div style={{ height: "1px", backgroundColor: "var(--border-glass)", marginBottom: "18px" }} />

                  {/* Section Body */}
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.95rem",
                      lineHeight: "1.8",
                    }}
                  >
                    {sec.content}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ── 5. BOTTOM ACTION FOOTER & DATA REQUESTS ── */}
        <div
          style={{
            marginTop: "36px",
            padding: "36px 24px",
            borderRadius: "20px",
            backgroundColor: "var(--bg-glass-card)",
            border: "1px solid var(--border-glass)",
            boxShadow: "0 10px 30px var(--shadow-card)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 111, 238, 0.1)",
              border: "1px solid rgba(0, 111, 238, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              marginBottom: "16px",
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: "800",
              color: "var(--color-foreground)",
              marginBottom: "8px",
              textWrap: "balance",
            }}
          >
            هل ترغب في ممارسة حقوقك أو حذف بياناتك بالكامل؟
          </h3>

          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              maxWidth: "580px",
              margin: "0 auto 22px auto",
              lineHeight: "1.7",
              textWrap: "pretty",
            }}
          >
            نوفر لك إمكانية إدارة وتعديل مفضلاتك أو حذف حسابك نهائياً بمسح شامل لكافة السجلات فوراً، أو التواصل مباشرة مع فريق الدعم والخصوصية.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            <Link
              href="/profile"
              className="btn btn-primary active:scale-[0.96] transition-transform"
              style={{
                padding: "10px 24px",
                minHeight: "44px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <UserCheck size={18} />
              <span>إدارة الملف الشخصي وحذف الحساب</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="btn btn-outline active:scale-[0.96] transition-transform"
              style={{
                padding: "10px 22px",
                minHeight: "44px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              {copiedEmail ? <Check size={18} style={{ color: "#10b981" }} /> : <Copy size={18} />}
              <span>{copiedEmail ? "تم نسخ البريد الرسمي!" : "نسخ بريد مسؤول الخصوصية"}</span>
            </button>

            <Link
              href="/terms"
              className="btn btn-outline active:scale-[0.96] transition-transform"
              style={{
                padding: "10px 20px",
                minHeight: "44px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileText size={18} />
              <span>شروط الاستخدام</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
