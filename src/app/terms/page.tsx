"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  const keyPrinciples = [
    {
      icon: "bx bx-file-blank",
      title: "ميثاق الشفافية",
      desc: "توضح هذه الشروط حقوقك ومسؤولياتك بوضوح أثناء تصفح واستخدام دليل ماب القاهرة.",
      color: "#006FEE",
    },
    {
      icon: "bx bx-star",
      title: "نزاهة التقييمات",
      desc: "التقييمات والمراجعات مبنية على تجارب شخصية فعلية لدعم مجتمع المستخدمين بمصداقية.",
      color: "#10b981",
    },
    {
      icon: "bx bx-shield-quarter",
      title: "استخدام آمن وقانوني",
      desc: "الالتزام بعدم الإساءة، أو انتحال الشخصيات، أو الإضرار بسلامة وموثوقية المنصة.",
      color: "#f59e0b",
    },
  ];

  const sections = [
    {
      id: "acceptance",
      number: "01",
      title: "1. قبول الشروط ونطاق الخدمة",
      content: (
        <>
          <p>
            باستخدامك لتطبيق وموقع <strong style={{ color: "var(--colorPrimary)" }}>ماب القاهرة (Cairo Map)</strong>، فإنك توافق التام وغير المشروط على الالتزام بجميع بنود شروط الاستخدام الموضحة هنا، بالإضافة إلى <Link href="/privacy" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>سياسة الخصوصية</Link> الخاصة بنا.
          </p>
          <p style={{ marginTop: "8px" }}>
            إذا كنت لا توافق على أي بند من هذه الشروط، يرجى التوقف الفوري عن استخدام التطبيق وكافة خدمات الدليل المرتبطة به.
          </p>
        </>
      ),
    },
    {
      id: "account-rules",
      number: "02",
      title: "2. الحساب والتسجيل والمسؤولية",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>
            عند إنشاء حساب شخصي في المنصة، يتعين عليك الالتزام بالمعايير التالية لضمان سلامة المنظومة:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--colorPrimary)", fontWeight: "700", marginBottom: "6px" }}>
                <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }}></i>
                <span>دقة المعلومات</span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                تقديم بيانات صحيحة ومحدثة عند التسجيل (مثل الاسم والبريد الإلكتروني وتاريخ الميلاد).
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: "700", marginBottom: "6px" }}>
                <i className="bx bx-lock" style={{ fontSize: "1.2rem" }}></i>
                <span>سرية الحساب</span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                الحفاظ على سرية بيانات تسجيل الدخول، وأنت المسؤول الأول عن أي نشاط يصدر من خلال حسابك.
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontWeight: "700", marginBottom: "6px" }}>
                <i className="bx bx-block" style={{ fontSize: "1.2rem" }}></i>
                <span>حظر الانتحال</span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                يُحظر تماماً انتحال هوية أشخاص أو علامات تجارية أخرى أو استخدام أسماء مستخدمين مضللة أو غير لائقة.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "reviews-policy",
      number: "03",
      title: "3. ضوابط كتابة التقييمات والتعليقات",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>
            نهدف لبناء مجتمع استرشادي حقيقي وفعّال، لذلك تخضع جميع التقييمات والتعليقات للضوابط الصارمة التالية:
          </p>
          <ul style={{
            paddingRight: "20px",
            color: "var(--textSecondary)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            margin: 0,
          }}>
            <li><strong>التجربة الشخصية:</strong> يجب أن تكون التقييمات مبنية على تعامل واقعي ومباشر مع الخدمة أو المكان المعني.</li>
            <li><strong>الاحترام والمهنية:</strong> يُمنع منعاً باتاً نشر تعليقات مسيئة، أو استخدام لغة بذيئة، أو التحريض أو التشهير غير القانوني.</li>
            <li><strong>حظر التقييمات الترويجية والمدفوعة:</strong> يُحظر إنشاء حسابات وهمية لنشر تقييمات إيجابية أو سلبية مضللة بغرض التأثير التجاري.</li>
            <li><strong>حق الإشراف والحذف:</strong> تحتفظ إدارة التطبيق بالحق الكامل في مراجعة أو إخفاء أو حذف أي تعليق يخالف هذه المعايير دون إنذار مسبق.</li>
            <li><strong>تعديل التقييم:</strong> يحق لكل مستخدم كتابة تقييم واحد لكل مكان وتعديله أو تحديثه في أي وقت عبر حسابه.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      number: "04",
      title: "4. حقوق الملكية الفكرية والعلامة التجارية",
      content: (
        <p>
          كافة عناصر التصميم، الشفرات البرمجية، الأيقونات ثلاثية الأبعاد، الشعارات، والنصوص المنشورة في تطبيق <strong style={{ color: "var(--textPrimary)" }}>ماب القاهرة</strong> هي ملكية حصرية لشركة <strong>RepoDex</strong> (إحدى شركات جورجيوس القابضة) ومحمية بموجب قوانين حقوق الملكية الفكرية. لا يجوز نسخ أو إعادة إنتاج أو تفكيك أي جزء من المنصة دون إذن خطي مسبق.
        </p>
      ),
    },
    {
      id: "disclaimer",
      number: "05",
      title: "5. إخلاء المسؤولية وحدود الدليل الاسترشادي",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>
            تطبيق ماب القاهرة هو دليل استرشادي ذكي لتسهيل الوصول للأرقام ومواقع الأماكن ومحطات النقل وفروع الخدمات:
          </p>
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}>
            <i className="bx bx-info-circle" style={{ fontSize: "1.8rem", color: "#f59e0b", marginTop: "2px" }}></i>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem", color: "var(--textPrimary)", fontWeight: "700" }}>طبيعة البيانات الاسترشادية</h4>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                نبذل أقصى جهودنا للتحقق من صحة ودقة البيانات دورياً، ولكننا لا نضمن عدم حدوث تغييرات طارئة في أرقام الهواتف أو مواعيد العمل أو عناوين الفروع من قبل الجهات المالكة. استخدام المعلومات يقع على مسؤولية المستخدم الخاصة.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "termination",
      number: "06",
      title: "6. الإنهاء وتعليق الحسابات",
      content: (
        <p>
          نحتفظ بالحق في اتخاذ تدابير حازمة تشمل تعليق الحساب مؤقتاً أو حظره نهائياً ومنع الوصول للخدمات لأي مستخدم يثبت انتهاكه المتكرر لشروط الاستخدام، أو تورطه في ممارسات احتيالية، أو محاولة العبث بأمن المنصة والبنية التحتية لها.
        </p>
      ),
    },
    {
      id: "changes",
      number: "07",
      title: "7. التعديلات على شروط الاستخدام",
      content: (
        <p>
          يحق لنا تحديث شروط الاستخدام هذه في أي وقت لتعكس أي تحسينات في خدماتنا أو استجابة للمتطلبات التنظيمية. استمرارك في استخدام التطبيق بعد تاريخ سريان التحديثات يُعد قبولاً ضمنياً بالشروط المعدلة.
        </p>
      ),
    },
  ];

  return (
    <div className="app-container" style={{ maxWidth: "860px", paddingTop: "32px", paddingBottom: "70px", margin: "0 auto", paddingLeft: "16px", paddingRight: "16px" }}>
      {/* Top Nav Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Link
          href="/profile"
          className="glass-panel"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            color: "var(--textPrimary)",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "0.9rem",
            transition: "var(--transition-smooth)",
          }}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.3rem", color: "var(--colorPrimary)" }}></i>
          <span>العودة للخلف</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8rem",
            color: "var(--textMuted)",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
          }}>
            <i className="bx bx-time-five" style={{ color: "var(--colorPrimary)" }}></i>
            <span>تحديث:سبتمبر 2026</span>
          </span>
        </div>
      </div>

      {/* Hero Header with 3D Icon */}
      <div
        className="glass-panel"
        style={{
          padding: "44px 24px 36px",
          marginBottom: "28px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "none",
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            width: "280px",
            height: "160px",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* 3D Icon Container */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "110px",
              height: "110px",
            }}
          >
            <Image
              src="/images/icons3d/book.png"
              alt="أيقونة شروط الاستخدام ثلاثية الأبعاد"
              width={110}
              height={110}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
            />
          </div>
        </div>

        {/* Title & Description */}
        <h1
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            fontWeight: "900",
            marginBottom: "12px",
            color: "var(--textPrimary)",
            letterSpacing: "-0.02em",
          }}
        >
          شروط الاستخدام
        </h1>

        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "clamp(0.92rem, 2vw, 1.05rem)",
            color: "var(--textSecondary)",
            maxWidth: "580px",
            margin: "0 auto",
            lineHeight: "1.7",
          }}
        >
          القواعد والإرشادات المنظمة لضمان بيئة موثوقة وعادلة لجميع مستخدمي تطبيق <strong style={{ color: "var(--textPrimary)" }}>ماب القاهرة</strong>.
        </p>
      </div>

      {/* Key Principles Highlight Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        {keyPrinciples.map((item, index) => (
          <div
            key={index}
            className="glass-panel"
            style={{
              padding: "20px 18px",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "var(--transition-smooth)",
              border: "1px solid var(--borderGlass)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-sm)",
                background: `${item.color}15`,
                border: `1px solid ${item.color}35`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.color,
                fontSize: "1.4rem",
              }}
            >
              <i className={item.icon}></i>
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", margin: 0, color: "var(--textPrimary)" }}>
              {item.title}
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Structured Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {sections.map((sec) => (
          <div
            key={sec.id}
            id={sec.id}
            className="glass-panel"
            style={{
              padding: "24px 22px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--borderGlass)",
              transition: "var(--transition-smooth)",
            }}
          >
            {/* Section Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexGrow: 1 }}>
                <span style={{
                  fontSize: "0.8rem",
                  fontWeight: "800",
                  color: "var(--colorPrimary)",
                  background: "rgba(0, 111, 238, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontFamily: "var(--font-heading)",
                }}>
                  {sec.number}
                </span>
                <h2 style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "var(--textPrimary)",
                  margin: 0,
                }}>
                  {sec.title}
                </h2>
              </div>
            </div>

            {/* Section Body */}
            <div style={{
              color: "var(--textSecondary)",
              fontSize: "0.95rem",
              lineHeight: "1.8",
              paddingRight: "8px",
              fontFamily: "var(--font-heading)",
            }}>
              {sec.content}
            </div>
          </div>
        ))}
      </div>

      {/* Support & Contact Card */}
      <div
        className="glass-panel"
        style={{
          marginTop: "28px",
          padding: "28px 24px",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          background: "linear-gradient(180deg, var(--bgGlass) 0%, rgba(0, 111, 238, 0.04) 100%)",
          border: "1px solid var(--borderGlass)",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "rgba(0, 111, 238, 0.1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--colorPrimary)",
            fontSize: "1.6rem",
            marginBottom: "12px",
          }}
        >
          <i className="bx bx-help-circle"></i>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)" }}>
          هل لديك استفسار قانوني أو ملاحظة حول الشروط؟
        </h3>
        <p style={{ fontSize: "0.92rem", color: "var(--textSecondary)", maxWidth: "520px", margin: "0 auto 18px", lineHeight: "1.6" }}>
          فريقنا القانوني والدعم الفني مستعد دائماً لتوضيح أي بند ومساعدتك في أي استفسار.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
          <Link
            href="/profile"
            className="btn btn-primary"
            style={{
              padding: "10px 22px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.92rem",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bx bx-user" style={{ fontSize: "1.1rem" }}></i>
            <span>العودة للملف الشخصي</span>
          </Link>

          <a
            href="mailto:cairo.map@hotmail.com"
            target="_blank"
            className="btn btn-secondary"
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.92rem",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bx bx-support" style={{ fontSize: "1.1rem" }}></i>
            <span>مراسلة الدعم القانوني</span>
          </a>
        </div>
      </div>

      {/* Floating Animation CSS */}
      <style jsx global>{`
        @keyframes floatTermsIcon {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(-1.5deg);
          }
        }
      `}</style>
    </div>
  );
}
