"use client";

import React, { useState } from "react";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "ما هي مواعيد تشغيل مترو القاهرة اليومية؟",
    answer: "يبدأ تشغيل المترو يومياً من الساعة 5:15 صباحاً وحتى الساعة 1:00 بعد منتصف الليل في الأيام العادية، وتُمدد المواعيد في الأعياد وشهر رمضان المبارك حتى الساعة 2:00 صباحاً."
  },
  {
    question: "كيف يتم تحديد أسعار تذاكر المترو؟",
    answer: "تُحدد أسعار التذاكر بحسب عدد المحطات: من 1 لـ 9 محطات بـ 8 جنيه، من 10 لـ 16 محطة بـ 10 جنيه، من 17 لـ 23 محطة بـ 15 جنيه، وأكثر من 23 محطة بـ 20 جنيه."
  },
  {
    question: "ما هو القطار الكهربائي الخفيف (LRT) وأين يصل؟",
    answer: "القطار الكهربائي الخفيف ينطلق من محطة عدلي منصور التبادلية ويصل إلى مدن العبور، الشروق، المستقبل، بدر، وحتى العاصمة الإدارية الجديدة والعاشر من رمضان."
  },
  {
    question: "هل يتيح الموقع لحساب تكلفة المواصلات التبادلية (ميكروباص + مترو)؟",
    answer: "نعم، يقدم دليلك الذكي في صفحة (ازاي اروح) خيارات متعددة تجمع بين الميكروباص، المترو، والأتوبيس لحساب التكلفة الإجمالية والوقت بدقة متناهية."
  }
];

export default function TransitFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div style={{
      backgroundColor: "var(--bgPrimary)",
      border: "1px solid var(--borderGlass)",
      borderRadius: "16px",
      padding: "20px",
      marginTop: "24px",
      marginBottom: "24px",
      direction: "rtl",
      fontFamily: "var(--font-body)",
      boxShadow: "var(--shadow-card)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "12px" }}>
        <div style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          <FaQuestionCircle />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "var(--textPrimary)" }}>الأسئلة الشائعة وإرشادات التنقل بالقاهرة</h3>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--textSecondary)" }}>إجابات سريعة لأهم استفسارات مواعيد المترو والقطارات والأسعار</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
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
                <span style={{ color: "var(--textSecondary)", fontSize: "0.8rem", marginRight: "8px" }}>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              {isOpen && (
                <div style={{
                  padding: "0 16px 14px 16px",
                  fontSize: "0.85rem",
                  color: "var(--textSecondary)",
                  lineHeight: "1.6",
                  borderTop: "1px solid rgba(255,255,255,0.04)"
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
