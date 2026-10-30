"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "./help.module.css";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  FaQuestionCircle,
  FaSubway,
  FaMapMarkerAlt,
  FaRobot,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaEnvelope,
  FaPlusCircle,
} from "react-icons/fa";

interface HelpTopic {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: "h1",
    category: "transit",
    question: "كيف أستخدم خريطة مترو الأنفاق وأعرف محطات التبادل وسعر التذكرة؟",
    answer: "توفر صفحة خريطة المترو (/metro) خريطة تفاعلية لجميع خطوط المترو الثلاثة (الخط الأول: حلوان - المرج، الخط الثاني: شبرا - المنيب، الخط الثالث: عدلي منصور - جامعة القاهرة / روض الفرج). يمكنك تحديد محطة الانطلاق ومحطة الوصول لعرض أقصر مسار، محطات التبديل (مثل السادات، الشهداء، العتبة، الكيت كات)، وعدد المحطات وسعر التذكرة المطلوب.",
  },
  {
    id: "h2",
    category: "transit",
    question: "ما الفرق بين المترو، المونوريل، والقطار الكهربائي الخفيف (LRT)؟",
    answer: "المترو يخدم المناطق الداخلية بالقاهرة الكبرى تحت وفوق الأرض. بينما القطار الكهربائي الخفيف (LRT) ينطلق من محطة عدلي منصور المركزية لربط مدن شرق القاهرة (العبور، الشروق، المستقبل، بدر، العاشر من رمضان) بالعاصمة الإدارية الجديدة. أما المونوريل فهو قطار معلق يربط شرق النيل (مدينة نصر بالتجمع والعاصمة) وغرب النيل (المهندسين بـ 6 أكتوبر).",
  },
  {
    id: "h3",
    category: "places",
    question: "كيف أبحث عن مطعم أو صيدلية أو مستشفى في منطقتي؟",
    answer: "يمكنك استخدام شريط البحث الرئيسي في الصفحة الرئيسية أو الانتقال لصفحة دليل الأماكن (/places) وتصفية النتائج حسب المحافظة (القاهرة، الجيزة)، والمدينة (مثل التجمع، مدينة نصر، المعادي، الشيخ زايد)، والفئة المطلوبة. تتيح كل بطاقة مكان عرض أرقام الهواتف، مواعيد العمل، والعنوان الدقيق وموقعه على خرائط جوجل.",
  },
  {
    id: "h4",
    category: "places",
    question: "كيف يمكنني إضافة مكاني أو نشاطي التجاري إلى دليل قريب؟",
    answer: "نرحب بإضافة الأنشطة التجارية والخدمية مجاناً! توجه إلى صفحة (اقتراح مكان /propose-place)، واملأ بيانات المكان (الاسم، الفئة، العنوان، الهاتف، مواعيد العمل، ورابط خرائط جوجل). يقوم فريق المراجعة بتدقيق البيانات ونشرها خلال 24 - 48 ساعة.",
  },
  {
    id: "h5",
    category: "ai",
    question: "كيف يعمل مخطط الرحلات الذكي (AI Planner)؟",
    answer: "مخطط الرحلات الذكي (/ai-planner) يستخدم خوارزميات ذكاء اصطناعي لبناء خطة خروجة مفصلة. فقط اختر نوع الخروجة (عائلية، أصدقاء، عمل، هادئة)، الميزانية المقترحة، والمنطقة المفضلة، وسيقوم بتوليد جدول زمني متكامل للأماكن والأنشطة والمطاعم المقترحة مع تكلفة تقديرية.",
  },
  {
    id: "h6",
    category: "general",
    question: "كيف أبلغ عن خطأ في بيانات محطة أو رقم هاتف غير صحيح؟",
    answer: "نحرص على دقة البيانات بنسبة 100%. يمكنك النقر على زر 'الإبلاغ عن مشكلة' الموجود في صفحة أي مكان أو خدمة، أو مراسلتنا مباشرة عبر صفحة اتصل بنا (/contact) مع ذكر اسم المكان والتعديل المطلوب.",
  },
  {
    id: "h7",
    category: "general",
    question: "هل استخدام تطبيق ومنصة قريب مجاني بالكامل؟",
    answer: "نعم، كافة خدمات البحث في الخرائط، الاستعلام عن مواعيد وخطوط المواصلات، دليل الأماكن ومخطط الرحلات الذكي متاحة مجاناً لجميع المستخدمين.",
  },
];

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIdx, setOpenIdx] = useState<string | null>("h1");

  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);
  const contactBannerRef = useRef<HTMLElement>(null);

  // Hero entrance animation
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (badgeRef.current) tl.from(badgeRef.current, { autoAlpha: 0, y: 15, duration: 0.45 });
    if (titleRef.current) tl.from(titleRef.current, { autoAlpha: 0, y: 25, duration: 0.55 }, "-=0.25");
    if (subtitleRef.current) tl.from(subtitleRef.current, { autoAlpha: 0, y: 20, duration: 0.45 }, "-=0.3");
    if (searchBoxRef.current) tl.from(searchBoxRef.current, { autoAlpha: 0, y: 25, duration: 0.55 }, "-=0.25");

    // Stagger categories cards
    if (categoriesRef.current) {
      const cards = categoriesRef.current.children;
      gsap.from(cards, {
        autoAlpha: 0,
        y: 35,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: categoriesRef.current,
          start: "top 85%",
          once: true,
        },
        clearProps: "transform,opacity,visibility",
      });
    }

    // FAQ section reveal
    if (faqSectionRef.current) {
      gsap.from(faqSectionRef.current, {
        autoAlpha: 0,
        y: 30,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: faqSectionRef.current,
          start: "top 85%",
          once: true,
        },
        clearProps: "transform,opacity,visibility",
      });
    }

    // Contact banner reveal
    if (contactBannerRef.current) {
      gsap.from(contactBannerRef.current, {
        autoAlpha: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contactBannerRef.current,
          start: "top 88%",
          once: true,
        },
        clearProps: "transform,opacity,visibility",
      });
    }
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenIdx(openIdx === id ? null : id);
  };

  const filteredTopics = HELP_TOPICS.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      t.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: "مركز المساعدة والدعم - قريب",
    url: `${siteUrl}/help`,
    description: "إجابات وإرشادات شاملة حول استخدام خدمات ومواصلات وأماكن منصة قريب.",
    mainEntity: HELP_TOPICS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <section className={styles.heroSection}>
          <div ref={badgeRef} className={styles.heroBadge}>
            <FaQuestionCircle /> مركز الدعم والإرشادات
          </div>
          <h1 ref={titleRef} className={styles.title}>كيف يمكننا مساعدتك اليوم؟</h1>
          <p ref={subtitleRef} className={styles.subtitle}>
            دليلك السريع للتعرف على كافة خصائص وميزات منصة قريب، وحلول لأكثر الأسئلة الشائعة حول المواصلات والخدمات.
          </p>

          <div ref={searchBoxRef} className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ابحث عن سؤال أو معلومة (مثل: تذاكر المترو، إضافة مكان...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </section>

        {/* Quick Categories */}
        <div ref={categoriesRef} className={styles.categoriesGrid}>
          <div
            className={styles.categoryCard}
            style={{ cursor: "pointer", borderColor: selectedCategory === "transit" ? "var(--color-primary)" : undefined }}
            onClick={() => setSelectedCategory(selectedCategory === "transit" ? "all" : "transit")}
          >
            <div className={styles.categoryIcon}>
              <FaSubway />
            </div>
            <h2 className={styles.categoryTitle}>المواصلات والتنقل</h2>
            <p className={styles.categoryDesc}>
              إرشادات حول خطوط المترو، المونوريل، LRT، BRT، مواعيد القطارات وحساب التذاكر.
            </p>
          </div>

          <div
            className={styles.categoryCard}
            style={{ cursor: "pointer", borderColor: selectedCategory === "places" ? "var(--color-primary)" : undefined }}
            onClick={() => setSelectedCategory(selectedCategory === "places" ? "all" : "places")}
          >
            <div className={styles.categoryIcon}>
              <FaMapMarkerAlt />
            </div>
            <h2 className={styles.categoryTitle}>دليل الأماكن والخدمات</h2>
            <p className={styles.categoryDesc}>
              طرق البحث، العناوين، أرقام الهواتف، ومواعيد العمل وكيفية إضافة وتعديل الأماكن.
            </p>
          </div>

          <div
            className={styles.categoryCard}
            style={{ cursor: "pointer", borderColor: selectedCategory === "ai" ? "var(--color-primary)" : undefined }}
            onClick={() => setSelectedCategory(selectedCategory === "ai" ? "all" : "ai")}
          >
            <div className={styles.categoryIcon}>
              <FaRobot />
            </div>
            <h2 className={styles.categoryTitle}>المساعد الذكي (AI)</h2>
            <p className={styles.categoryDesc}>
              كيف تصمم جدول خروجة متكامل ومخصص حسب ميزانيتك وموقعك عبر الذكاء الاصطناعي.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <section ref={faqSectionRef} className={styles.faqSection}>
          <h2 className={styles.faqSectionTitle}>
            {selectedCategory === "all" ? "جميع الأسئلة الشائعة والإرشادات" : "الأسئلة المتعلقة بالتصنيف المحدد"}
          </h2>

          <div className={styles.faqList}>
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => {
                const isOpen = openIdx === topic.id;
                return (
                  <div key={topic.id} className={styles.faqItem}>
                    <button
                      type="button"
                      onClick={() => toggleFAQ(topic.id)}
                      className={styles.faqQuestion}
                    >
                      <span>{topic.question}</span>
                      <span>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{topic.answer}</div>}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                لم يتم العثور على نتائج مطابقة لبحثك. يمكنك التواصل معنا مباشرة لأي استفسار.
              </div>
            )}
          </div>
        </section>

        {/* Contact Banner */}
        <section ref={contactBannerRef} className={styles.contactBanner}>
          <h2 className={styles.contactBannerTitle}>لم تجد الإجابة التي تبحث عنها؟</h2>
          <p className={styles.contactBannerDesc}>
            فريق دعم قريب متواجد دائماً لمساعدتك في أي استفسار أو مشكلة تواجهك أثناء استخدام الموقع.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className={styles.contactBtn}>
              <FaEnvelope /> تواصل مع فريق الدعم
            </Link>
            <Link href="/propose-place" className={styles.contactBtn} style={{ background: "var(--bg-glass-card)", border: "1px solid var(--border-glass)", color: "var(--color-foreground)" }}>
              <FaPlusCircle /> إضافة مكان جديد
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
