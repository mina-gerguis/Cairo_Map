"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
  link: {
    name: string;
    url: string;
    icon: string;
  };
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "ما هي مواعيد وأسعار تشغيل مترو القاهرة اليومية؟",
    answer: "يبدأ تشغيل المترو يومياً من الساعة 5:15 صباحاً وحتى 1:00 بعد منتصف الليل. وتُحدد أسعار التذاكر بحسب المحطات: (من 1 لـ 9 محطات بـ 8 ج.م، ومن 10 لـ 16 محطة بـ 10 ج.م، ومن 17 لـ 23 محطة بـ 15 ج.م، وأكثر من 23 محطة بـ 20 ج.م).",
    link: {
      name: "دليل ومحطات مترو القاهرة",
      url: "/metro",
      icon: "/images/icons2d/metro.svg"
    }
  },
  {
    question: "ما هو القطار الكهربائي الخفيف (LRT) وأين يصل؟",
    answer: "القطار الكهربائي الخفيف ينطلق من محطة عدلي منصور التبادلية المركزية ويصل إلى مدن العبور، الشروق، المستقبل، بدر، العاشر من رمضان، وصولاً إلى العاصمة الإدارية الجديدة ومحطة الفنون والثقافة.",
    link: {
      name: "دليل القطار الكهربائي الخفيف (LRT)",
      url: "/lrt",
      icon: "/images/icons2d/Cairo_lrt.png"
    }
  },
  {
    question: "أين تقع مسارات ومحطات مونوريل شرق وغرب النيل؟",
    answer: "يمتد مونوريل شرق النيل (العاصمة الإدارية) من محطة الاستاد بمدينة نصر مروراً بالتجمع الخامس وحتى العاصمة الإدارية، بينما يمتد مونوريل غرب النيل (6 أكتوبر) من وادي النيل بالمهندسين حتى مدينة 6 أكتوبر والمنطقة الصناعية.",
    link: {
      name: "دليل شبكة مونوريل القاهرة",
      url: "/monorail",
      icon: "/images/icons2d/Cairo_monorail_east.png"
    }
  },
  {
    question: "كيف يمكنني معرفة مواعيد وأسعار قطارات السفر بين المحافظات؟",
    answer: "يوفر دليل سكك حديد مصر جدولاً متكاملاً لمواعيد وأسعار قطارات الصعيد والوجه البحري ومدن القناة (تالجو، VIP، إسباني مطور، وروسي) ومحطات التوقف وطرق الحجز الإلكتروني المعتمدة.",
    link: {
      name: "دليل قطارات سكك حديد مصر",
      url: "/railways",
      icon: "/images/icons2d/Cairo_train.png"
    }
  },
  {
    question: "كيف أصل إلى مواقف الأتوبيسات ومحطات السوبرجيت؟",
    answer: "يمكنك استكشاف جميع مواقف الأتوبيسات الكبرى للنقل العام وبين المحافظات مثل مواقف عبود، السلام، المرج، المنيب، وعبد المنعم رياض، بالإضافة إلى مقرات وفروع شركات السوبرجيت وجو باص.",
    link: {
      name: "محطات ومواقف الأتوبيس",
      url: "/bus-stations",
      icon: "/images/icons2d/bus.png"
    }
  },
  {
    question: "أين أجد خطوط ومواقف الميكروباص في القاهرة والجيزة؟",
    answer: "تغطي شبكة مواقف الميكروباص كافة الخطوط الداخلية والسريعة الرابطة بين الميادين الحيوية والمدن الجديدة (التجمع الخامس، 6 أكتوبر، الشيخ زايد، العاشر من رمضان، والشروق).",
    link: {
      name: "دليل مواقف الميكروباص",
      url: "/microbus-stations",
      icon: "/images/icons2d/microbus.png"
    }
  },
  {
    question: "هل يتيح الموقع حساب تكلفة المواصلات التبادلية (ميكروباص + مترو)؟",
    answer: "نعم، يقدم دليلك الذكي في صفحة (ازاي اروح) خيارات متعددة تجمع بين الميكروباص، المترو، والقطار لحساب التكلفة الإجمالية والوقت والخطوات التفصيلية بدقة متناهية.",
    link: {
      name: "دليل الانتقال الذكي (ازاي اروح)",
      url: "/directions",
      icon: "/images/icons2d/bus.png"
    }
  }
];

export default function TransitFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bgPrimary)",
        border: "1px solid var(--borderGlass)",
        borderRadius: "var(--radius-xs)",
        padding: "20px",
        marginTop: "16px",
        marginBottom: "16px",
        direction: "rtl",
        fontFamily: "var(--font-body)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      {/* FAQ Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
          borderBottom: "1px solid var(--borderGlass)",
          paddingBottom: "12px"
        }}
      >
        <div
          style={{
            background: "rgba(59, 130, 246, 0.12)",
            color: "var(--colorSecondary)",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem"
          }}
        >
          <FaQuestionCircle />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)" }}>
            الأسئلة الشائعة وإرشادات شبكة المواصلات
          </h3>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            إجابات سريعة وروابط مباشرة لكافة خدمات المترو والقطارات والمونوريل والمواقف
          </p>
        </div>
      </div>

      {/* Accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "var(--radius-xs)",
                overflow: "hidden",
                transition: "all 0.2s ease"
              }}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "right",
                  color: "var(--textPrimary)",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  fontFamily: "var(--font-body)"
                }}
              >
                <span>{item.question}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginRight: "8px" }}>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 16px 14px 16px",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    lineHeight: "1.6",
                    borderTop: "1px solid var(--borderGlass)"
                  }}
                >
                  <p style={{ margin: "10px 0" }}>{item.answer}</p>

                  {/* Dedicated Page Link Card */}
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop: "1px dashed var(--borderGlass)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px"
                    }}
                  >
                    <span style={{ fontSize: "0.76rem", color: "var(--textMuted)", fontWeight: "600" }}>
                      🔗 تصفح الخدمة بالتفصيل:
                    </span>
                    <Link
                      href={item.link.url}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "var(--bgPrimary)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textPrimary)",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--colorSecondary)";
                        e.currentTarget.style.background = "var(--hoverBtn)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--borderGlass)";
                        e.currentTarget.style.background = "var(--bgPrimary)";
                      }}
                    >
                      <img
                        src={item.link.icon}
                        alt={item.link.name}
                        style={{ width: "22px", height: "22px", objectFit: "contain" }}
                      />
                      <span>{item.link.name}</span>
                      <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.1rem", color: "var(--colorSecondary)" }} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
