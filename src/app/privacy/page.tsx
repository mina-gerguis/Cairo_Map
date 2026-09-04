"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const keyHighlights = [
    {
      icon: "bx bx-shield-quarter",
      title: "تشفير وأمان فائق",
      desc: "تشفير كامل للبيانات وحماية مشددة لخصوصية حسابك وتفاعلاتك داخل التطبيق.",
      color: "#006FEE",
    },
    {
      icon: "bx bx-block",
      title: "لا نبيع بياناتك مطلقاً",
      desc: "لا نشارك أو نؤجر أو نبيع معلوماتك الشخصية لأي طرف ثالث لأغراض تسويقية.",
      color: "#10b981",
    },
    {
      icon: "bx bx-user-check",
      title: "تحكم كامل بحسابك",
      desc: "يمكنك تعديل بياناتك أو طلب حذف حسابك نهائياً بمسح شامل لكافة السجلات فوراً.",
      color: "#f59e0b",
    },
  ];

  const sections = [
    {
      id: "intro",
      number: "01",
      title: "المقدمة والالتزام",
      content: (
        <>
          <p>
            نحن في تطبيق <strong style={{ color: "var(--colorPrimary)" }}>ماب القاهرة (Cairo Map)</strong> نضع خصوصية وأمان مستخدمينا على رأس أولوياتنا. تهدف هذه السياسة إلى توضيح الشفافية الكاملة حول كيفية جمعنا للمعلومات، واستخدامها، وحمايتها عند استخدامك لخدمات الدليل الذكي وخرائط المواقع ومحطات النقل.
          </p>
          <p style={{ marginTop: "10px" }}>
            باستخدامك لتطبيقنا وموقعنا الإلكتروني، فإنك توافق على الممارسات الموضحة في هذه الوثيقة وفقاً للقوانين واللوائح المعمول بها لحماية البيانات الرقمية.
          </p>
        </>
      ),
    },
    {
      id: "data-collected",
      number: "02",
      title: "البيانات التي نقوم بجمعها",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p>
            لتوفير تجربة استكشاف متكاملة ودقيقة للأماكن والخدمات، نقوم بجمع الأنواع التالية من البيانات:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginTop: "4px" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--colorPrimary)", fontWeight: "700" }}>
                <i className="bx bx-user-pin" style={{ fontSize: "1.3rem" }}></i>
                <span>البيانات الشخصية</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                الاسم، البريد الإلكتروني، رقم الهاتف، وتاريخ الميلاد التي تزودنا بها طواعية عند التسجيل أو تحديث ملفك الشخصي.
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#10b981", fontWeight: "700" }}>
                <i className="bx bx-map-pin" style={{ fontSize: "1.3rem" }}></i>
                <span>الموقع الجغرافي (GPS)</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                إذن الوصول لموقعك لحساب أقرب الأماكن، الفروع، المحطات والمسارات. لا يتم تتبع موقعك خارج إطار استخدامك الفعلي للخدمة.
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#f59e0b", fontWeight: "700" }}>
                <i className="bx bx-heart" style={{ fontSize: "1.3rem" }}></i>
                <span>التفاعل والمفضلات</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                الأماكن المضافة للمفضلة، التقييمات، الملاحظات، وسجلات البحث لتخصيص نتائجك وتسهيل وصولك السريع إليها.
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#8b5cf6", fontWeight: "700" }}>
                <i className="bx bx-devices" style={{ fontSize: "1.3rem" }}></i>
                <span>المعلومات التقنية</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                نوع المتصفح ونظام التشغيل، لتشخيص الأعطال وتحسين توافق وسرعة استجابة التطبيق عبر مختلف الأجهزة.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "data-usage",
      number: "03",
      title: "كيف نستخدم معلوماتك",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p>نستثمر هذه المعلومات بشكل دقيق ومسؤول في الأغراض التالية فقط:</p>
          <ul style={{
            paddingRight: "20px",
            color: "var(--textSecondary)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            margin: "6px 0 0 0",
          }}>
            <li>
              <strong style={{ color: "var(--textPrimary)" }}>توفير وتطوير الخدمات:</strong> تمكينك من البحث السريع عن أرقام الطوارئ، الهواتف، العناوين، ومحطات المترو والقطارات وحافلات النقل.
            </li>
            <li>
              <strong style={{ color: "var(--textPrimary)" }}>التخصيص الذكي:</strong> ترتيب وترشيح الفروع الأقرب لمحيطك الجغرافي تلقائياً لتوفير الوقت والجهد.
            </li>
            <li>
              <strong style={{ color: "var(--textPrimary)" }}>الأمان ومكافحة الاحتيال:</strong> التحقق من مصداقية الحسابات ومنع التعليقات المضللة أو الهجمات الضارة على التقييمات.
            </li>
            <li>
              <strong style={{ color: "var(--textPrimary)" }}>التواصل والتنبيهات:</strong> إرسال إشعارات التحديثات الحيوية، استعادة كلمة المرور، والتنبيهات الخدمية التي تهمك.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "security",
      number: "04",
      title: "حماية وتشفير البيانات",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>
            نطبق تدابير تقنية وتنظيمية متقدمة لضمان سرية وأمان معلوماتك ضد أي وصول غير مصرح به أو تسريب:
          </p>
          <div style={{
            background: "linear-gradient(135deg, rgba(0, 111, 238, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)",
            border: "1px solid rgba(0, 111, 238, 0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}>
            <i className="bx bx-check-shield" style={{ fontSize: "1.8rem", color: "var(--colorPrimary)", marginTop: "2px" }}></i>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", color: "var(--textPrimary)", fontWeight: "700" }}>ضمانة الحماية الرقمية</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                جميع الاتصالات مشفرة ببروتوكول HTTPS/TLS المتقدم، وتخزن كلمات المرور والبيانات الحساسة باستخدام خوارزميات التشفير غير القابلة للعكس (Hashing)، مع استضافة آمنة عبر بنية سحابية موثوقة.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cookies",
      number: "05",
      title: "ملفات تعريف الارتباط والتخزين المحلي",
      content: (
        <p>
          نستخدم التخزين المحلي (Local Storage) وملفات تعريف الارتباط الضرورية لتذكر تفضيلاتك (مثل الوضع الداكن/الفاتح، جلستك المسجلة، وحالة القوائم) بهدف منحك تجربة تصفح سريعة وسلسة دون الحاجة لإعادة ضبط إعداداتك في كل زيارة.
        </p>
      ),
    },
    {
      id: "user-rights",
      number: "06",
      title: "حقوقك والتحكم بحسابك وحذفه",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>
            أنت المالك الوحيد لبياناتك ولك كامل الصلاحية للتحكم بها في أي وقت:
          </p>
          <ul style={{
            paddingRight: "20px",
            color: "var(--textSecondary)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            margin: "0",
          }}>
            <li><strong>حق الاطلاع والتعديل:</strong> يمكنك مراجعة وتحديث معلوماتك من خلال <Link href="/profile" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>صفحة الملف الشخصي</Link>.</li>
            <li><strong>حق حذف الحساب نهائياً:</strong> نتيح خياراً مباشراً لحذف الحساب من الإعدادات، مما يؤدي إلى مسح فوري لا رجعة فيه لبياناتك، تقييماتك، ومفضلاتك من كافة قواعد بياناتنا.</li>
            <li><strong>إلغاء أذونات الموقع:</strong> يمكنك إيقاف إذن مشاركة الموقع الجغرافي في أي لحظة من إعدادات المتصفح أو هاتفك.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "updates",
      number: "07",
      title: "التعديلات والتحديثات على السياسة",
      content: (
        <p>
          قد نقوم بتحديث بنود سياسة الخصوصية من وقت لآخر لمواكبة التطورات التقنية أو الإضافات الجديدة على خدمات التطبيق أو المتطلبات التنظيمية. سنقوم بإشعار المستخدمين بأي تغييرات جوهرية مع تحديث تاريخ المراجعة أسفل العنوان.
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
          <span>الرجوع للخلف</span>
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
            <span>تحديث: سبتمبر /2026</span>
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
          borderRadius: "var(--radius-lg)",
          border:"none"
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
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
              src="/images/icons3d/document.png"
              alt="أيقونة سياسة الخصوصية ثلاثية الأبعاد"
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
          سياسة الخصوصية
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
          نلتزم في منصة <strong style={{ color: "var(--textPrimary)" }}>ماب القاهرة</strong> بحماية بياناتك الشخصية وتوفير بيئة تصفح واستكشاف آمنة وشفافة بالكامل.
        </p>
      </div>

      {/* Key Guarantees Highlight Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        {keyHighlights.map((item, index) => (
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
          <i className="bx bx-envelope"></i>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)" }}>
          هل لديك أي استفسار حول خصوصية بياناتك؟
        </h3>
        <p style={{ fontSize: "0.92rem", color: "var(--textSecondary)", maxWidth: "520px", margin: "0 auto 18px", lineHeight: "1.6" }}>
          يسعدنا الرد على أي استفسارات أو تقديم المساعدة بشأن إدارة وحذف بياناتك الشخصية في أي وقت.
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
            <span>إدارة حسابي وبياناتي</span>
          </Link>

          <a
            href="mailto:cairo.maps@hotmail.com"
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
            <span>مراسلة فريق الدعم</span>
          </a>
        </div>
      </div>

      {/* Floating Animation CSS */}
      <style jsx global>{`
        @keyframes floatPrivacyIcon {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1.5deg);
          }
        }
      `}</style>
    </div>
  );
}
