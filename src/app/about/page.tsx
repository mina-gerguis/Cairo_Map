import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./about.module.css";
import {
  FaMapMarkedAlt,
  FaSubway,
  FaShieldAlt,
  FaUsers,
  FaBullseye,
  FaEye,
  FaCheckCircle,
  FaSyncAlt,
  FaEnvelope,
  FaSearchLocation,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "من نحن | ماب القاهرة - دليل الأماكن والمواصلات والخدمات",
  description:
    "تعرف على منصة ماب القاهرة (Cairo Map)، رسالتنا، فريق العمل، منهجيتنا في جمع وتدقيق بيانات شبكات المواصلات والأماكن والخدمات في القاهرة الكبرى ومصر.",
  alternates: {
    canonical: "https://cairomap.vercel.app/about",
  },
  openGraph: {
    title: "من نحن | ماب القاهرة - دليلك الذكي للمواصلات والخدمات",
    description:
      "منصة مصرية متكاملة تقدم حلولاً ذكية لحركة التنقل والمواصلات واستكشاف الأماكن والخدمات في القاهرة الكبرى.",
    url: "https://cairomap.vercel.app/about",
    siteName: "ماب القاهرة",
    locale: "ar_EG",
    type: "website",
  },
};

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "من نحن - ماب القاهرة",
    url: `${siteUrl}/about`,
    description:
      "معلومات شاملة عن منصة ماب القاهرة وفريق العمل والمنهجية المتبعة في التحقق من بيانات المواصلات والأماكن في مصر.",
    mainEntity: {
      "@type": "Organization",
      name: "ماب القاهرة - Cairo Map",
      alternateName: "RepoDex",
      url: siteUrl,
      logo: `${siteUrl}/apple-touch-icon.png`,
      foundingDate: "2024",
      description:
        "دليل رقمي ذكي لخطوط المترو، المونوريل، القطار الكهربائي LRT، الأتوبيس الترددي BRT، ومحطات القطارات والخدمات في مصر.",
      sameAs: [
        "https://www.linkedin.com/company/repo-dex",
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBadge}>
            <FaBullseye /> عن منصة ماب القاهرة
          </div>
          <h1 className={styles.title}>
            دليلك الذكي الأول للمواصلات والأماكن في <span className={styles.titleHighlight}>مصر والقاهرة الكبرى</span>
          </h1>
          <p className={styles.subtitle}>
            نهدف إلى تبسيط حركة التنقل اليومية وتقديم بيانات موثوقة ومحدثة باستمرار حول شبكة النقل العام
            والمعالم والخدمات والأماكن الترفيهية والتجارية، لخدمة ملايين المواطنين والزوار.
          </p>
        </section>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaSubway /></div>
            <div className={styles.statNumber}>+6 شبكات</div>
            <div className={styles.statLabel}>مترو، مونوريل، LRT، BRT وسكك حديد</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaSearchLocation /></div>
            <div className={styles.statNumber}>+1000 مكان</div>
            <div className={styles.statLabel}>مطاعم، كافيهات، صيدليات، ومستشفيات</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaSyncAlt /></div>
            <div className={styles.statNumber}>100% تحديث دوري</div>
            <div className={styles.statLabel}>مراجعة أسبوعية للأسعار والمواعيد والخطوط</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaShieldAlt /></div>
            <div className={styles.statNumber}>بيانات مدققة</div>
            <div className={styles.statLabel}>اعتماد رسمي وتجربة ميدانية للمسارات</div>
          </div>
        </div>

        {/* Mission & Vision */}
        <section className={styles.contentBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><FaEye /></div>
            <h2 className={styles.sectionTitle}>رؤيتنا ورسالتنا</h2>
          </div>
          <p className={styles.paragraph}>
            تأسست منصة <strong>ماب القاهرة (Cairo Map)</strong> تحت مظلة فريق <strong>RepoDex</strong> كاستجابة للتطور الهائل في البنية التحتية للنقل الذكي والمدن الجديدة في جمهورية مصر العربية. مع افتتاح خطوط المترو الجديدة، والقطار الكهربائي الخفيف (LRT)، ومشروع المونوريل والأتوبيس الترددي السريع (BRT)، أصبح المواطن والزائر بحاجة إلى مرجع رقمي موحد وسريع يجيب بدقة على سؤال: <em>«ازاي اروح بأسهل وأوفر وأسرع طريق؟»</em>.
          </p>
          <p className={styles.paragraph}>
            <strong>رسالتنا:</strong> تقديم واجهة تفاعلية خفيفة ومجانية تجمع بين خرائط النقل التفاعلية، حساب أسعار التذاكر والاشتراكات، وأدلة الأماكن والخدمات، ومساعد ذكاء اصطناعي لتخطيط الرحلات اليومية دون تعقيد.
          </p>
        </section>

        {/* Methodology & Data Quality */}
        <section className={styles.contentBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><FaCheckCircle /></div>
            <h2 className={styles.sectionTitle}>منهجيتنا ومعايير تدقيق البيانات</h2>
          </div>
          <p className={styles.paragraph}>
            نلتزم بأعلى معايير الدقة والشفافية في نشر المعلومات على المنصة:
          </p>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>
                <FaCheckCircle style={{ color: "var(--color-primary)" }} /> مصادر رسمية وموثقة
              </h3>
              <p className={styles.featureDesc}>
                يتم استقاء بيانات خطوط المترو ومحطات القطارات والأسعار من البيانات الرسمية الصادرة عن وزارة النقل وهيئة الأنفاق وسكك حديد مصر.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>
                <FaCheckCircle style={{ color: "var(--color-primary)" }} /> التدقيق الميداني والمراجعة
              </h3>
              <p className={styles.featureDesc}>
                يقوم فريق المحتوى بمراجعة أماكن المحطات، بوابات الخروج، وأرقام الهواتف ومواعيد عمل الأماكن دورياً والتأكد من مطابقتها على أرض الواقع.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>
                <FaCheckCircle style={{ color: "var(--color-primary)" }} /> مشاركة المجتمع المفتوح
              </h3>
              <p className={styles.featureDesc}>
                نستقبل اقتراحات المستخدمين وتقارير التعديل حول أي محطة أو مكان، ونراجع البلاغات بدقة قبل اعتماد أي تحديث لحماية المستخدمين من المعلومات المغلوطة.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className={styles.contentBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><FaMapMarkedAlt /></div>
            <h2 className={styles.sectionTitle}>ماذا تقدم منصة ماب القاهرة؟</h2>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>🚇 دليل النقل الذكي الشامل</h3>
              <p className={styles.featureDesc}>
                خرائط تفاعلية لخطوط المترو (الأول والثاني والثالث)، قطار المونوريل، القطار الكهربائي الخفيف (LRT)، والسكك الحديدية مع حاسبة اشتراكات المترو.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>📍 دليل الأماكن والأنشطة</h3>
              <p className={styles.featureDesc}>
                فهرس شامل للمطاعم، الكافيهات، الصيدليات، المستشفيات، المولات، والحدائق العامة مع العناوين التفصيلية وأرقام التليفونات ومواعيد العمل.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>🤖 مخطط الرحلات الذكي (AI)</h3>
              <p className={styles.featureDesc}>
                أداة متطورة تصمم لك برنامج خروجة أو يوم ترفيهي متكامل بناءً على ميزانيتك، اهتماماتك والمنطقة التي تفضلها.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>📖 مقالات وأدلة السفر</h3>
              <p className={styles.featureDesc}>
                أدلة حصرية وإرشادات مفصلة للمسافرين والزوار حول أفضل طرق الانتقال وتغطيات لأبرز المعالم السياحية والمدن المصرية.
              </p>
            </div>
          </div>
        </section>

        {/* Commitment to Privacy and Trust */}
        <section className={styles.contentBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><FaUsers /></div>
            <h2 className={styles.sectionTitle}>التزامنا تجاه المستخدمين</h2>
          </div>
          <p className={styles.paragraph}>
            نحن نحترم خصوصية جميع زوارنا ومستخدمينا بشكل كامل. لا نجمع أي بيانات شخصية حساسة دون إذن مسبق، ونلتزم بسياسات الأمان وتشفير البيانات المتوافقة مع المعايير الدولية. يمكنك قراءة <Link href="/privacy" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>سياسة الخصوصية</Link> و <Link href="/terms" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>شروط الاستخدام</Link> لمزيد من التفاصيل.
          </p>
        </section>

        {/* CTA Card */}
        <section className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>هل لديك أي استفسار أو اقتراح؟</h2>
          <p className={styles.ctaDesc}>
            فريق العمل يسعد دائماً بالاستماع إلى آرائكم وملاحظاتكم لتطوير المنصة وتحسين خدمات النقل والأماكن.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className={styles.primaryBtn}>
              <FaEnvelope style={{ marginLeft: "8px" }} /> تواصل مع فريق العمل
            </Link>
            <Link href="/help" className={styles.secondaryBtn}>
              مركز المساعدة والدعم
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
