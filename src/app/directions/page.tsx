"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import VoiceInputButton from "@/components/VoiceInputButton";
const WeatherComfortWidget = dynamic(() => import("@/components/WeatherComfortWidget"), { ssr: false });
import EmergencyQuickBar from "@/components/EmergencyQuickBar";
import TransitFAQ from "@/components/TransitFAQ";
import styles from "./page.module.css";

interface RouteLeg {
  title: string;
  vehicleType?: string;
  cost?: number;
  duration?: string;
  steps: string[];
}

interface RouteOption {
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  typeName: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs?: RouteLeg[];
  tips?: string;
  map_link?: string;
}

interface RouteData {
  from: string;
  to: string;
  from_aliases?: string;
  to_aliases?: string;
  options: RouteOption[];
}

interface DbTransitRoute {
  id: string;
  from_location: string;
  to_location: string;
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[] | string;
  legs?: RouteLeg[] | string;
  tips?: string | null;
  from_aliases?: string | null;
  to_aliases?: string | null;
  map_link?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Arabic Text Normalization helper
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا") // Normalizing Alif Hamza
    .replace(/ة/g, "ه")    // Normalizing Ta Marbouta
    .replace(/ى/g, "ي")    // Normalizing Ya/Alef Layena
    .replace(/[\u064B-\u065F]/g, "") // Removing diacritics (Harakat)
    .replace(/(موقف|محطه|محطة|مدينه|مدينة|بوابه|بوابة|مركز|جامعة|جامعه|طريق)\s+/g, "") // Removing common prefix keywords
    .replace(/\s+/g, " ")  // Remove duplicate spaces
    .trim();
}

// Global Static Aliases/Keywords dictionary for quick mapping
const locationAliasesMap: Record<string, string> = {
  "معرض الكتاب": "أرض المعارض",
  "معرض القاهره": "أرض المعارض",
  "مركز مصر للمعارض": "أرض المعارض",
  "ارض المعارض": "أرض المعارض",
  "محطة مصر": "القاهرة (رمسيس)",
  "محطه مصر": "القاهرة (رمسيس)",
  "رمسيس": "القاهرة (رمسيس)",
  "عدلي منصور": "القاهرة (عدلي منصور - موقف السلام)",
  "موقف السلام": "القاهرة (عدلي منصور - موقف السلام)",
  "عبود": "القاهرة (عبود)",
  "طلخا": "المنصورة",
  "موقف الاحرار": "الزقازيق",
  "موقف الاحرار الجديد": "الزقازيق",
  "الاحرار": "الزقازيق",
  "جامعة الزقازيق": "الزقازيق"
};

const routesDataset: RouteData[] = [
  {
    from: "الزقازيق",
    from_aliases: "موقف الأحرار, الاحرار, جامعة الزقازيق",
    to: "العاشر من رمضان",
    to_aliases: "موقف العاشر, الاردنية, الأردنية, صيدناوي, العاشر",
    options: [
      {
        type: "microbus",
        typeName: "ميكروباص مباشر",
        icon: "bx",
        cost: 20,
        duration: "50 دقيقة",
        steps: [
          "الركوب من ممر (الزقازيق - العاشر) بموقف الأحرار الجديد بالزقازيق.",
          "الوصول عبر طريق بلبيس - العاشر الصحراوي.",
          "النزول في موقف الأردنية بالعاشر من رمضان.",
          "التحويل لمواصلة داخلية أو سرفيس لوجهتك النهائية."
        ],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص مباشر من الزقازيق إلى العاشر",
            vehicleType: "ميكروباص",
            cost: 20,
            duration: "50 دقيقة",
            steps: [
              "اركب ميكروباص من موقف الأحرار الجديد بالزقازيق (ممر العاشر من رمضان).",
              "السير عبر طريق بلبيس - العاشر الصحراوي.",
              "النزول في موقف الأردنية بالعاشر من رمضان.",
              "مواصلة سفرك بسرفيس داخلي للوصول لوجهتك."
            ]
          }
        ],
        tips: "الميكروباصات متوفرة طوال اليوم. يفضل السفر مبكراً في الصباح لتفادي الازدحام."
      },
      {
        type: "multi",
        typeName: "سيارة بيجو (7 راكب)",
        icon: "bx bx-car",
        cost: 30,
        duration: "45 دقيقة",
        steps: [
          "الذهاب إلى موقف الأحرار قسم سيارات البيجو 7 راكب.",
          "الركوب مباشر إلى العاشر بدون توقفات.",
          "النزول في صيدناوي أو موقف الأردنية.",
          "التحويل لوجهتك الفرعية."
        ],
        legs: [
          {
            title: "المرحلة الأولى: سيارة بيجو 7 راكب (الزقازيق ➔ العاشر)",
            vehicleType: "سيارة بيجو",
            cost: 30,
            duration: "45 دقيقة",
            steps: [
              "الذهاب لموقف الأحرار بالزقازيق وركوب سيارة بيجو 7 راكب.",
              "الانطلاق مباشرة عبر الطريق السريع بدون توقفات.",
              "النزول عند صيدناوي أو موقف الأردنية بالعاشر.",
              "التوجه لوجهتك الفرعية داخل المدينة."
            ]
          }
        ],
        tips: "أسرع من الميكروباص ولكن تكلفتها أعلى قليلاً وتنتظر حتى يكتمل عدد الركاب (7 أفراد)."
      }
    ]
  },
  {
    from: "الزقازيق",
    from_aliases: "موقف الأحرار, الاحرار, جامعة الزقازيق",
    to: "أرض المعارض",
    to_aliases: "ارض المعارض, معرض الكتاب, مركز المعارض, قاعة المؤتمرات",
    options: [
      {
        type: "multi",
        typeName: "ميكروباص ومترو الأنفاق",
        icon: "bx bx-transfer",
        cost: 28,
        duration: "70 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص (الزقازيق ➔ موقف السلام / عدلي منصور)",
            vehicleType: "ميكروباص",
            cost: 20,
            duration: "50 دقيقة",
            steps: [
              "اركب ميكروباص (الزقازيق - السلام) من موقف الأحرار بالزقازيق (20 ج.م).",
              "السير عبر طريق بلبيس الصحراوي مباشرة.",
              "النزول في محطة عدلي منصور التبادلية.",
              "التوجه للممر المباشر لرصيف مترو الأنفاق."
            ]
          },
          {
            title: "المرحلة الثانية: مترو الأنفاق (عدلي منصور ➔ أرض المعارض)",
            vehicleType: "مترو الأنفاق",
            cost: 8,
            duration: "20 دقيقة",
            steps: [
              "ركوب المترو (الخط الثالث - الأخضر) باتجاه الكيت كات / جامعة القاهرة (8 ج.م).",
              "المرور بمحطات النزهة، ألف مسكن، وهليوبوليس.",
              "النزول في محطة (أرض المعارض) مباشرة.",
              "الخروج من المحطة والتوجه لبوابة المعرض."
            ]
          }
        ],
        tips: "المترو هو أسرع وسيلة للوصول لأرض المعارض دون الدخول في زحام الطرق العادية."
      }
    ]
  },
  {
    from: "العاشر من رمضان",
    from_aliases: "موقف العاشر, الاردنية, الأردنية, صيدناوي, العاشر",
    to: "أرض المعارض",
    to_aliases: "ارض المعارض, معرض الكتاب, مركز المعارض",
    options: [
      {
        type: "multi",
        typeName: "ميكروباص ومترو الأنفاق",
        icon: "bx bx-transfer",
        cost: 23,
        duration: "60 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص (العاشر ➔ عدلي منصور / موقف السلام)",
            vehicleType: "ميكروباص",
            cost: 15,
            duration: "40 دقيقة",
            steps: [
              "ركوب ميكروباص من موقف الأردنية بالعاشر إلى موقف السلام / عدلي منصور (15 ج.م).",
              "السير عبر طريق الإسماعيلية الصحراوي.",
              "النزول عند محطة عدلي منصور التبادلية.",
              "التوجه لرصيف المترو داخل المحطة."
            ]
          },
          {
            title: "المرحلة الثانية: مترو الأنفاق (عدلي منصور ➔ أرض المعارض)",
            vehicleType: "مترو الأنفاق",
            cost: 8,
            duration: "20 دقيقة",
            steps: [
              "ركوب المترو (الخط الثالث - الأخضر) متوجهاً باتجاه الكيت كات (8 ج.م).",
              "الوصول حتى محطة أرض المعارض.",
              "النزول في محطة أرض المعارض مباشرة.",
              "التوجه لقاعات المعرض."
            ]
          }
        ]
      }
    ]
  },
  {
    from: "الزقازيق",
    from_aliases: "موقف الأحرار, الاحرار, جامعة الزقازيق",
    to: "القاهرة (رمسيس)",
    to_aliases: "رمسيس, محطة مصر, رمسيس رمسيس, محطة رمسيس",
    options: [
      {
        type: "train",
        typeName: "القطار المباشر",
        icon: "bx bx-train",
        cost: 25,
        duration: "105 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: القطار المباشر (الزقازيق ➔ رمسيس)",
            vehicleType: "قطار",
            cost: 25,
            duration: "ساعة و45 دقيقة",
            steps: [
              "ركوب القطار من محطة قطارات الزقازيق بميدان المحطة (خط الشرق).",
              "الانطلاق عبر الخط المباشر لقطارات الشرق.",
              "النزول في المحطة الأخيرة (محطة مصر برمسيس).",
              "التوجه لميدان رمسيس أو خطوط المترو."
            ]
          }
        ],
        tips: "القطار وسيلة مريحة وغير مكلفة. يمكنك مراجعة جدول المواعيد بانتظام، أشهرها قطارات الساعة 7:00 ص و 3:00 م."
      },
      {
        type: "multi",
        typeName: "ميكروباص ومترو الأنفاق",
        icon: "bx bx-transfer",
        cost: 33,
        duration: "90 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص (الزقازيق ➔ موقف عبود بالقاهرة)",
            vehicleType: "ميكروباص",
            cost: 25,
            duration: "75 دقيقة",
            steps: [
              "ركوب ميكروباص من موقف الأحرار بالزقازيق إلى موقف عبود (25 ج.م).",
              "السير عبر طريق القاهرة - الإسماعيلية / الزراعي.",
              "النزول في موقف عبود بالقاهرة.",
              "التوجه مشياً أو بتاكسي إلى محطة مترو المظلات."
            ]
          },
          {
            title: "المرحلة الثانية: مترو الأنفاق (المظلات ➔ الشهداء/رمسيس)",
            vehicleType: "مترو الأنفاق",
            cost: 8,
            duration: "15 دقيقة",
            steps: [
              "ركوب المترو (الخط الثاني - الأزرق) باتجاه المنيب (8 ج.م).",
              "المرور بمحطات مسرة والسراي.",
              "النزول في محطة الشهداء (ميدان رمسيس).",
              "التوجه لمخرج المحطة الرئيسي."
            ]
          }
        ],
        tips: "طريق سريع ومناسب في أوقات فراغ الطرق السريعة (الزراعي)."
      }
    ]
  },
  {
    from: "الزقازيق",
    from_aliases: "موقف الأحرار, الاحرار",
    to: "القاهرة (عدلي منصور - موقف السلام)",
    to_aliases: "عدلي منصور, موقف السلام, السلام",
    options: [
      {
        type: "microbus",
        typeName: "ميكروباص مباشر",
        icon: "bx",
        cost: 20,
        duration: "60 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص مباشر (الزقازيق ➔ السلام)",
            vehicleType: "ميكروباص",
            cost: 20,
            duration: "60 دقيقة",
            steps: [
              "ركوب ميكروباص (الزقازيق - السلام) من موقف الأحرار (20 ج.م).",
              "السير عبر طريق بلبيس الصحراوي.",
              "النزول في موقف السلام الجديد أو محطة عدلي منصور التبادلية.",
              "التوجه إلى المترو أو القطار الكهربائي LRT أو السوبرجيت."
            ]
          }
        ],
        tips: "طريق بلبيس الصحراوي سريع جداً ومتوفر على مدار 24 ساعة."
      }
    ]
  },
  {
    from: "الزقازيق",
    from_aliases: "موقف الأحرار",
    to: "الشروق",
    to_aliases: "الشروق, بوابة الشروق, الشروق 1",
    options: [
      {
        type: "multi",
        typeName: "ميكروباص وسرفيس داخلي",
        icon: "bx bx-transfer",
        cost: 20,
        duration: "45 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص الزقازيق ➔ طريق الإسماعيلية (بوابة الشروق 1)",
            vehicleType: "ميكروباص",
            cost: 15,
            duration: "35 دقيقة",
            steps: [
              "ركوب ميكروباص (الزقازيق - السلام) من موقف الأحرار.",
              "السير على طريق الإسماعيلية الصحراوي.",
              "النزول عند بوابة الشروق 1 على الطريق الصحراوي.",
              "التوجه لموقف السرفيس الداخلي أمام البوابة."
            ]
          },
          {
            title: "المرحلة الثانية: سرفيس داخلي لوسط مدينة الشروق",
            vehicleType: "سرفيس داخلي",
            cost: 5,
            duration: "10 دقائق",
            steps: [
              "ركوب ميكروباص/سرفيس داخلي من أمام البوابة.",
              "الوصول لوسط المدينة أو الجامعة البريطانية.",
              "النزول في وجهتك المحددة داخل الشروق.",
              "التوجه لوجهتك النهائية."
            ]
          }
        ],
        tips: "أسرع وأسهل طريقة للوصول للشروق من الزقازيق."
      }
    ]
  },
  {
    from: "العاشر من رمضان",
    from_aliases: "الاردنية, الأردنية, صيدناوي, موقف العاشر, العاشر",
    to: "القاهرة (عدلي منصور - موقف السلام)",
    to_aliases: "عدلي منصور, موقف السلام, السلام",
    options: [
      {
        type: "microbus",
        typeName: "ميكروباص مباشر",
        icon: "bx",
        cost: 15,
        duration: "40 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: ميكروباص مباشر (العاشر ➔ السلام)",
            vehicleType: "ميكروباص",
            cost: 15,
            duration: "40 دقيقة",
            steps: [
              "ركوب ميكروباص من موقف الأردنية بالعاشر من رمضان.",
              "السير عبر طريق الإسماعيلية الصحراوي.",
              "النزول في موقف السلام الجديد أو محطة عدلي منصور التبادلية.",
              "الانتقال لمترو الأنفاق الخط الثالث أو الأتوبيسات."
            ]
          }
        ],
        tips: "المواصلة متوفرة بغزارة شديدة على مدار الساعة."
      }
    ]
  },
  {
    from: "المنصورة",
    from_aliases: "طلخا, موقف طلخا, جامعة المنصورة",
    to: "القاهرة (رمسيس)",
    to_aliases: "رمسيس, محطة مصر",
    options: [
      {
        type: "train",
        typeName: "قطار توربيني / مكيف مباشر",
        icon: "bx bx-train",
        cost: 45,
        duration: "ساعتان ونصف",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: القطار التوربيني / المكيف (المنصورة ➔ رمسيس)",
            vehicleType: "قطار",
            cost: 45,
            duration: "ساعتان ونصف",
            steps: [
              "ركوب القطار المباشر من محطة قطارات المنصورة.",
              "السير عبر خط طنطا - القاهرة.",
              "النزول في محطة مصر بميدان رمسيس.",
              "التوجه لمترو الشهداء أو المواصلات العامة."
            ]
          }
        ],
        tips: "القطار التوربيني أو الروسي المكيف هو الخيار الأفضل والأكثر أماناً ومواعيده ثابتة."
      }
    ]
  },
  {
    from: "طنطا",
    from_aliases: "موقف طنطا, الجلاء",
    to: "القاهرة (رمسيس)",
    to_aliases: "رمسيس, محطة مصر",
    options: [
      {
        type: "train",
        typeName: "القطار المباشر (السريع)",
        icon: "bx bx-train",
        cost: 30,
        duration: "ساعة و15 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: القطار السريع (طنطا ➔ رمسيس)",
            vehicleType: "قطار",
            cost: 30,
            duration: "ساعة و15 دقيقة",
            steps: [
              "ركوب القطار السريع من محطة قطار طنطا.",
              "السير عبر الخط السريع لقطارات الإسكندرية - القاهرة.",
              "النزول في محطة رمسيس بالقاهرة.",
              "التوجه لمخرج المحطة أو المترو."
            ]
          }
        ],
        tips: "القطارات متوفرة تقريباً كل نصف ساعة نظراً لوقوع طنطا على الخط الرئيسي."
      }
    ]
  },
  {
    from: "الإسكندرية",
    from_aliases: "محطة سيدي جابر, محطة مصر الاسكندرية, محرم بك, سيدي جابر",
    to: "القاهرة (رمسيس)",
    to_aliases: "رمسيس, محطة مصر",
    options: [
      {
        type: "train",
        typeName: "قطار تالجو / مكيف مباشر",
        icon: "bx bx-train",
        cost: 70,
        duration: "ساعتان و15 دقيقة",
        steps: [],
        legs: [
          {
            title: "المرحلة الأولى: قطار تالجو / المكيف (الإسكندرية ➔ رمسيس)",
            vehicleType: "قطار",
            cost: 70,
            duration: "ساعتان و15 دقيقة",
            steps: [
              "ركوب قطار تالجو المباشر من محطة سيدي جابر أو محطة مصر بالإسكندرية.",
              "السير عبر الطريق السريع المباشر.",
              "النزول في محطة مصر برمسيس بالقاهرة.",
              "التوجه لوسط البلد أو خطوط المترو."
            ]
          }
        ],
        tips: "قطارات تالجو الجديدة سريعة ومريحة جداً وتقدم خدمات ممتازة."
      }
    ]
  }
];

function getOptionCategoryLabel(type: string): string {
  switch (type) {
    case "microbus":
      return "موقف ميكروباص";
    case "bus":
      return "أتوبيس النقل العام / السوبرجيت";
    case "car":
      return "سيارة خاصة / بيجو";
    case "train":
      return "محطة السكك الحديدية";
    case "monorail":
      return "قطار المونوريل";
    case "metro":
      return "مترو الأنفاق";
    case "plane":
      return "طيران / رحلات جوية";
    case "ship":
      return "عبارة / سفينة بحرية";
    default:
      return "وسائل مواصلات متعددة";
  }
}

function formatMinutesToArabic(mins: number): string {
  if (mins <= 0) return "0 دقيقة";
  if (mins === 1) return "دقيقة واحدة";
  if (mins === 2) return "دقيقتان";

  if (mins < 60) {
    if (mins >= 3 && mins <= 10) return `${mins} دقائق`;
    return `${mins} دقيقة`;
  }

  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;

  let hoursText = "";
  if (hours === 1) {
    hoursText = "ساعة";
  } else if (hours === 2) {
    hoursText = "ساعتان";
  } else if (hours >= 3 && hours <= 10) {
    hoursText = `${hours} ساعات`;
  } else {
    hoursText = `${hours} ساعة`;
  }

  if (remaining === 0) {
    return hoursText;
  }

  let remainingText = "";
  if (remaining === 1) {
    remainingText = "ودقيقة";
  } else if (remaining === 2) {
    remainingText = "ودقيقتان";
  } else if (remaining >= 3 && remaining <= 10) {
    remainingText = `و ${remaining} دقائق`;
  } else {
    remainingText = `و ${remaining} دقيقة`;
  }

  return `${hoursText} ${remainingText}`;
}

function parseMinutesFromArabic(text: string): number | null {
  if (!text) return null;
  const normalized = text.trim();

  if (normalized === "ساعة") return 60;
  if (normalized === "ساعتان" || normalized === "ساعتين") return 120;

  const hourMatch = normalized.match(/(\d+)\s+ساع/);
  const minMatch = normalized.match(/(\d+)\s+دقيق/);

  let totalMins = 0;
  let found = false;

  if (hourMatch) {
    totalMins += parseInt(hourMatch[1]) * 60;
    found = true;
  } else if (normalized.includes("ساعة") || normalized.includes("ساعه")) {
    totalMins += 60;
    found = true;
  } else if (normalized.includes("ساعتان") || normalized.includes("ساعتين")) {
    totalMins += 120;
    found = true;
  }

  if (minMatch) {
    totalMins += parseInt(minMatch[1]);
    found = true;
  } else if (normalized.includes("ودقيقة") || normalized.includes("ودقيقه")) {
    totalMins += 1;
    found = true;
  } else if (normalized.includes("ودقيقتان") || normalized.includes("ودقيقتين")) {
    totalMins += 2;
    found = true;
  }

  if (!hourMatch && !normalized.includes("ساعة") && !normalized.includes("ساعه") && !normalized.includes("ساعتين") && !normalized.includes("ساعتان")) {
    const rawNumberMatch = normalized.match(/^(\d+)/);
    if (rawNumberMatch) {
      return parseInt(rawNumberMatch[1]);
    }
  }

  return found ? totalMins : null;
}

function computeTotalTripSummary(option: RouteOption, legs: RouteLeg[]) {
  let totalCost = 0;
  let hasLegCost = false;

  (legs || []).forEach(leg => {
    if (typeof leg.cost === "number" && !isNaN(leg.cost) && leg.cost > 0) {
      totalCost += leg.cost;
      hasLegCost = true;
    }
  });

  const finalCost = hasLegCost ? totalCost : option.cost;

  let totalMinutes = 0;
  let hasLegDuration = false;

  (legs || []).forEach(leg => {
    if (leg.duration) {
      const mins = parseMinutesFromArabic(leg.duration);
      if (mins !== null && mins > 0) {
        totalMinutes += mins;
        hasLegDuration = true;
      }
    }
  });

  let finalDuration = option.duration;
  if (hasLegDuration && totalMinutes > 0) {
    finalDuration = formatMinutesToArabic(totalMinutes);
  }

  return {
    totalCost: finalCost,
    totalDuration: finalDuration
  };
}

// Safe helper to construct structured legs if not explicitly provided
function buildLegsFromOption(option: RouteOption): RouteLeg[] {
  if (!option) return [];

  if (option.legs && Array.isArray(option.legs) && option.legs.length > 0) {
    return option.legs.map((leg, idx) => ({
      title: leg?.title || `المرحلة ${idx + 1}`,
      vehicleType: leg?.vehicleType,
      cost: leg?.cost,
      duration: leg?.duration,
      steps: Array.isArray(leg?.steps) ? leg.steps : (typeof leg?.steps === "string" ? [leg.steps] : [])
    }));
  }

  const steps = Array.isArray(option.steps) ? option.steps : [];
  if (steps.length === 0) {
    return [
      {
        title: "المرحلة الأولى: المسار المباشر",
        cost: option.cost,
        duration: option.duration,
        steps: ["توجه لموقع الانطلاق الموضح.", "انتقل عبر الطريق المباشر.", "الوصول في المحطة المقصودة."]
      }
    ];
  }

  return [
    {
      title: "المرحلة الأولى: خطوات المسار التفصيلية",
      cost: option.cost,
      duration: option.duration,
      steps: steps
    }
  ];
}

export default function DirectionsPage() {
  const { user, profile, loading } = useAuth();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [matchedRoute, setMatchedRoute] = useState<RouteData | null>(null);

  // Resolved Search Labels (To show the user if an alias was resolved)
  const [resolvedFromLabel, setResolvedFromLabel] = useState("");
  const [resolvedToLabel, setResolvedToLabel] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleUseGPSLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("خاصية تحديد الموقع غير مدعومة في متصفحك.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setFromInput("القاهرة (رمسيس)");
        setShowFromSuggestions(false);
      },
      (err) => {
        setIsLocating(false);
        alert("تعذر تحديد الموقع. يرجى تفعيل خدمة GPS والتأكد من إعطاء الصلاحية للمتصفح.");
      }
    );
  };

  const handleShareRoute = (option: RouteOption, legs: RouteLeg[], summary: { totalCost: number; totalDuration: string }) => {
    const stepsList = legs
      .map((leg, i) => `📌 مرحلة ${i + 1}: ${leg.title}\n` + (leg.steps || []).map((s) => `  • ${s}`).join("\n"))
      .join("\n\n");
    const shareText = `🚗 *خط السير عبر ماب القاهرة (Cairo Map)* 🗺️\n\n📍 *من:* ${resolvedFromLabel || fromInput}\n🎯 *إلى:* ${resolvedToLabel || toInput}\n🚌 *نوع الوسيلة:* ${option.typeName}\n💵 *الإجمالي:* ${summary.totalCost} ج.م\n⏱️ *المدة المتوقعة:* ${summary.totalDuration}\n\n📋 *الخطوات التفصيلية:*\n${stepsList}\n\n🔗 *تصفح المسارات كاملة:* ${typeof window !== "undefined" ? window.location.href : ""}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `مسار مواصلات: من ${resolvedFromLabel || fromInput} إلى ${resolvedToLabel || toInput}`,
        text: shareText,
      }).catch(() => { });
    } else if (typeof window !== "undefined") {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, "_blank");
    }
  };

  // Suggestion form states
  const [suggestContent, setSuggestContent] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");

  // Report problem states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportProblemType, setReportProblemType] = useState<"pricing" | "steps" | "other">("pricing");
  const [reportContent, setReportContent] = useState("");
  const [reportingOption, setReportingOption] = useState<RouteOption | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("transit_routes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const grouped: Record<string, RouteOption[]> = {};
          const groupMeta: Record<string, { from_aliases: string; to_aliases: string }> = {};

          (data as unknown as DbTransitRoute[]).forEach((item) => {
            const key = `${item.from_location}|||${item.to_location}`;
            if (!grouped[key]) {
              grouped[key] = [];
              groupMeta[key] = { from_aliases: "", to_aliases: "" };
            }

            if (item.from_aliases) {
              const existing = groupMeta[key].from_aliases ? groupMeta[key].from_aliases.split(",") : [];
              const newAliases = item.from_aliases.split(",");
              const combined = Array.from(new Set([...existing, ...newAliases].map(a => a.trim()).filter(Boolean))).join(", ");
              groupMeta[key].from_aliases = combined;
            }
            if (item.to_aliases) {
              const existing = groupMeta[key].to_aliases ? groupMeta[key].to_aliases.split(",") : [];
              const newAliases = item.to_aliases.split(",");
              const combined = Array.from(new Set([...existing, ...newAliases].map(a => a.trim()).filter(Boolean))).join(", ");
              groupMeta[key].to_aliases = combined;
            }

            let stepsArr: string[] = [];
            if (Array.isArray(item.steps)) {
              stepsArr = item.steps;
            } else if (typeof item.steps === "string") {
              try {
                stepsArr = JSON.parse(item.steps);
              } catch {
                stepsArr = [item.steps];
              }
            }

            let legsArr: RouteLeg[] | undefined = undefined;
            if (Array.isArray(item.legs)) {
              legsArr = item.legs;
            } else if (typeof item.legs === "string") {
              try {
                legsArr = JSON.parse(item.legs);
              } catch {
                legsArr = undefined;
              }
            }

            grouped[key].push({
              type: item.type,
              typeName: item.type_name,
              icon: item.icon,
              cost: item.cost,
              duration: item.duration,
              steps: stepsArr,
              legs: legsArr,
              tips: item.tips || undefined,
              map_link: item.map_link || undefined
            });
          });

          const formatted: RouteData[] = Object.keys(grouped || {}).map(key => {
            const [from, to] = key.split("|||");
            return {
              from,
              to,
              from_aliases: groupMeta[key]?.from_aliases || undefined,
              to_aliases: groupMeta[key]?.to_aliases || undefined,
              options: grouped[key] || []
            };
          });

          setRoutes(formatted);
        } else {
          setRoutes(routesDataset);
        }
      } catch (err) {
        console.warn("Failed to fetch routes from Supabase, using local static dataset:", err);
        setRoutes(routesDataset);
      }
    };

    fetchRoutes();
  }, []);

  // List of all unique cities with their aliases for autocomplete
  const uniqueCitiesList = useMemo(() => {
    const list: Array<{ name: string; searchNames: string[] }> = [];
    (routes || []).forEach(r => {
      // For 'from'
      const fromAliasesArr = r.from_aliases ? r.from_aliases.split(",").map(a => a.trim()).filter(Boolean) : [];
      // Include global static aliases if matching
      Object.keys(locationAliasesMap || {}).forEach(aliasKey => {
        if (locationAliasesMap[aliasKey] === r.from && !fromAliasesArr.includes(aliasKey)) {
          fromAliasesArr.push(aliasKey);
        }
      });

      const fromObj = list.find(item => item.name === r.from);
      if (!fromObj) {
        list.push({ name: r.from, searchNames: Array.from(new Set([r.from, ...fromAliasesArr])) });
      } else {
        fromAliasesArr.forEach(a => {
          if (!fromObj.searchNames.includes(a)) fromObj.searchNames.push(a);
        });
      }

      // For 'to'
      const toAliasesArr = r.to_aliases ? r.to_aliases.split(",").map(a => a.trim()).filter(Boolean) : [];
      // Include global static aliases if matching
      Object.keys(locationAliasesMap || {}).forEach(aliasKey => {
        if (locationAliasesMap[aliasKey] === r.to && !toAliasesArr.includes(aliasKey)) {
          toAliasesArr.push(aliasKey);
        }
      });

      const toObj = list.find(item => item.name === r.to);
      if (!toObj) {
        list.push({ name: r.to, searchNames: Array.from(new Set([r.to, ...toAliasesArr])) });
      } else {
        toAliasesArr.forEach(a => {
          if (!toObj.searchNames.includes(a)) toObj.searchNames.push(a);
        });
      }
    });
    return list;
  }, [routes]);

  const filteredFromCities = useMemo(() => {
    const rawInput = fromInput.trim().toLowerCase();
    const normInput = normalizeArabic(fromInput);

    if (!rawInput) return uniqueCitiesList;

    return (uniqueCitiesList || []).filter(item => {
      if (item.name.toLowerCase() === rawInput) return false;
      return (item.searchNames || []).some(name => {
        const rawName = name.toLowerCase();
        const normName = normalizeArabic(name);
        return rawName.includes(rawInput) || (normInput !== "" && normName.includes(normInput));
      });
    });
  }, [fromInput, uniqueCitiesList]);

  const filteredToCities = useMemo(() => {
    const rawInput = toInput.trim().toLowerCase();
    const normInput = normalizeArabic(toInput);

    if (!rawInput) return uniqueCitiesList;

    return (uniqueCitiesList || []).filter(item => {
      if (item.name.toLowerCase() === rawInput) return false;
      return (item.searchNames || []).some(name => {
        const rawName = name.toLowerCase();
        const normName = normalizeArabic(name);
        return rawName.includes(rawInput) || (normInput !== "" && normName.includes(normInput));
      });
    });
  }, [toInput, uniqueCitiesList]);

  const totalRoutesCount = useMemo(() => (routes || []).length, [routes]);
  const totalOptionsCount = useMemo(() => {
    return (routes || []).reduce((acc, r) => acc + (r.options?.length || 0), 0);
  }, [routes]);

  // Smart Search logic incorporating Arabic Normalization and Aliases resolution
  const handleSearch = (fromVal = fromInput, toVal = toInput) => {
    if (!fromVal.trim() || !toVal.trim()) return;

    let searchFrom = fromVal.trim();
    let searchTo = toVal.trim();

    // 1. Resolve global aliases if any match directly
    const normFromInput = normalizeArabic(searchFrom);
    const normToInput = normalizeArabic(searchTo);

    Object.keys(locationAliasesMap || {}).forEach(aliasKey => {
      if (normalizeArabic(aliasKey) === normFromInput) {
        searchFrom = locationAliasesMap[aliasKey];
      }
      if (normalizeArabic(aliasKey) === normToInput) {
        searchTo = locationAliasesMap[aliasKey];
      }
    });

    const normFromResolved = normalizeArabic(searchFrom);
    const normToResolved = normalizeArabic(searchTo);

    // 2. Loop through routes dataset to locate matches
    let foundRoute: RouteData | null = null;
    let resolvedFrom = "";
    let resolvedTo = "";

    for (const route of (routes || [])) {
      // Match From Location
      const routeFromNorm = normalizeArabic(route.from);
      const isFromDirectMatch = routeFromNorm === normFromResolved || routeFromNorm.includes(normFromResolved) || normFromResolved.includes(routeFromNorm);
      const isFromAliasMatch = route.from_aliases && route.from_aliases.split(",").some(alias => {
        const normAlias = normalizeArabic(alias);
        return normAlias === normFromResolved || normAlias.includes(normFromResolved);
      });

      // Match To Location
      const routeToNorm = normalizeArabic(route.to);
      const isToDirectMatch = routeToNorm === normToResolved || routeToNorm.includes(normToResolved) || normToResolved.includes(routeToNorm);
      const isToAliasMatch = route.to_aliases && route.to_aliases.split(",").some(alias => {
        const normAlias = normalizeArabic(alias);
        return normAlias === normToResolved || normAlias.includes(normToResolved);
      });

      if ((isFromDirectMatch || isFromAliasMatch) && (isToDirectMatch || isToAliasMatch)) {
        foundRoute = route;
        resolvedFrom = route.from;
        resolvedTo = route.to;
        break;
      }
    }

    setMatchedRoute(foundRoute);
    setResolvedFromLabel(resolvedFrom || searchFrom);
    setResolvedToLabel(resolvedTo || searchTo);
    setSearchTriggered(true);
    setSuggestSuccess(false);
    setSuggestError("");
  };

  const handleSwap = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
    if (searchTriggered) {
      handleSearch(toInput, temp);
    }
  };

  const handlePresetSearch = (fromPreset: string, toPreset: string) => {
    setFromInput(fromPreset);
    setToInput(toPreset);
    handleSearch(fromPreset, toPreset);
  };

  const handleSuggestRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSuggestError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم اقتراح.");
      return;
    }
    if (!suggestContent.trim()) {
      setSuggestError("يرجى كتابة تفاصيل الطريق.");
      return;
    }

    setSuggestLoading(true);
    setSuggestError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const contentText = `اقتراح خط مواصلات جديد:\nمن: ${fromInput}\nإلى: ${toInput}\n\nطريقة الذهاب المقترحة:\n${suggestContent}`;

      const { error } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "suggestion",
          category: "اقتراح خط مواصلات جديد",
          content: contentText,
          status: "pending"
        }
      ]);

      if (error) throw error;

      setSuggestSuccess(true);
      setSuggestContent("");
    } catch {
      setSuggestError("حدث خطأ أثناء إرسال اقتراحك. يرجى المحاولة لاحقاً.");
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (!reportContent.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة.");
      return;
    }

    setReportLoading(true);
    setReportError("");
    setReportSuccess(false);

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const problemTypeLabel =
        reportProblemType === "pricing" ? "مشكلة في الأجرة / التسعير" :
          reportProblemType === "steps" ? "مشكلة في خطوات الطريق" : "أخرى";

      const contentText = `بلاغ عن مشكلة في خط مواصلات:
📍 من: ${resolvedFromLabel || fromInput}
🎯 إلى: ${resolvedToLabel || toInput}
🚌 وسيلة المواصلات: ${reportingOption?.typeName}
💰 الأجرة المسجلة حالياً: ${reportingOption?.cost} ج.م
⏱️ الوقت المقدر حالياً: ${reportingOption?.duration}

نوع المشكلة: ${problemTypeLabel}

تفاصيل المشكلة المبلغ عنها:
${reportContent}`;

      const { error } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "خطأ في خط مواصلات",
          title: reportProblemType === "pricing" ? "مشكلة في التسعير" : reportProblemType === "steps" ? "مشكلة في الخطوات" : "أخرى",
          content: contentText,
          status: "pending"
        }
      ]);

      if (error) throw error;

      setReportSuccess(true);
      setReportContent("");
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
      }, 2000);
    } catch {
      setReportError("حدث خطأ أثناء إرسال بلاغك. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--borderGlass)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }} />
        <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "1rem" }}>جاري التحقق من التفاصيل ...</p>
      </div>
    );
  }

  // Paywall / Lock screen if user doesn't have Gold access
  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "40px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
        {/* Header Banner matching Metro / Monorail / LRT standard */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
        }}>
          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/Cairo_directions.svg" alt="" loading="lazy" decoding="async" style={{ width: "40px", marginLeft: "10px" }} />
              ازاي اروح؟
            </h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              دليل السفر والانتقال الذكي لمختلف وسائل المواصلات والطرق المختصرة.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          {/* Back Button */}
          <div style={{ margin: "20px 0 0" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--colorSecondary, #3b82f6)",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "0.95rem",
              }}
            >
              <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
              <span>العودة للرئيسية</span>
            </Link>
          </div>

          {/* Lock Screen Card matching Metro / Monorail theme */}
          <div style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderPrimary)",
            borderRadius: "15px",
            padding: "36px 24px",
            marginTop: "20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              marginBottom: "24px",
            }}>
              <img src="images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
              ميزة البحث عن خطوط المواصلات تتطلب اشتراك في الباقة الفضية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "460px", margin: "0 auto 24px" }}>
              محرك البحث المتقدم عن خطوط المواصلات والطرق المختصرة (ميكروباص، أتوبيسات، مترو، ومونوريل) متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية أو المشوار.
            </p>

            <div style={{
              background: "var(--bgSecondary)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid var(--borderGlass)",
              textAlign: "right",
              margin: "0 auto 24px",
              maxWidth: "420px"
            }}>
              <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.9rem", marginBottom: "8px" }}>ميزات الباقة الفضية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px", fontFamily: "var(--font-body)" }}>
                <li>✨ البحث عن مسارات مواصلات بين أي منطقتين بالتفصيل</li>
                <li>✨ حساب تكلفة الرحلة والمدة المتوقعة بدقة لكل مرحلة</li>
                <li>✨ خيارات متعددة للتنقل (مباشر، مترو + ميكروباص، إلخ)</li>
                <li>✨ تشمل أيضاً خريطة المونوريل والقطار الكهربائي بالتفصيل</li>
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-seliver)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    border: "1px solid var(--br-subscribe-button-seliver)",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الفضية
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-base)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-base)",
                    display: "block"
                  }}
                >
                  سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}

              <Link
                href="/"
                style={{
                  padding: "var(--paddingBtn)",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--cancelBtn)",
                  color: "var(--textPrimary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--borderGlass)",
                  display: "block"
                }}
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "40px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
      {/* Header Banner - Standardized matching Metro / Monorail / LRT */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
      }}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/Cairo_directions.svg" alt="" loading="lazy" decoding="async" style={{ width: "40px", marginLeft: "10px" }} />
            ازاي اروح؟
          </h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            دليل السفر والانتقال الذكي. ابحث بأي اسم (مثل: رمسيس، معرض الكتاب، موقف الأحرار، العاشر) وسنقوم بتوجيهك للطريق الأنسب تلقائياً.
          </p>

          {/* Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--colorSecondary, #3b82f6)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>
              عدد الطرق والوجهات: {totalRoutesCount}
            </span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>
              عدد المسارات المتاحة: {totalOptionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        <div style={{ marginTop: "24px" }}>
          <WeatherComfortWidget />
        </div>

        {/* Search Panel Card */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--containerBg)",
          border: "1px solid var(--containerBorder)",
          borderRadius: "var(--containerRadius)",
          padding: "20px",
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 20,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>

            {/* FROM INPUT */}
            <div style={{ position: "relative", zIndex: showFromSuggestions ? 100 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", padding: "10px 8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0, fontFamily: "var(--font-heading)" }}>
                  <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "green" }}></i> هتتحرك منين ؟
                </label>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleUseGPSLocation}
                    title="حدد موقعك الحالي بالـ GPS"
                    style={{
                      background: "transparent",
                      color: isLocating ? "#ef4444" : "var(--textPrimary)",
                      border: "none",
                      padding: "0px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i className="bx bx-target-lock" style={{ fontSize: "1.1rem" }} />
                  </button>
                  <VoiceInputButton onTranscript={(text) => { setFromInput(text); setShowFromSuggestions(true); setSearchTriggered(false); }} />
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="اكتب اسم مكان الانطلاق... (مثال: موقف الأحرار أو الزقازيق)"
                  value={fromInput}
                  onChange={(e) => {
                    setFromInput(e.target.value);
                    setShowFromSuggestions(true);
                    setSearchTriggered(false);
                  }}
                  onFocus={() => setShowFromSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFromSuggestions(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                    height: "50px",
                  }}
                />
                {fromInput.trim() && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الإدخال</span>
                )}
              </div>
              {showFromSuggestions && (filteredFromCities || []).length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "var(--cardGlassBg)",
                  border: "1px solid var(--cardGlassBorder)",
                  borderRadius: "var(--cardGlassRadius)",
                  overflow: "hidden",
                  zIndex: 999,
                  maxHeight: "220px",
                  overflowY: "auto",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.17), var(--shadow-lg)",
                  marginTop: "6px",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  fontFamily: "var(--font-body)",
                }}>
                  {(filteredFromCities || []).map((item, idx) => {
                    const matchedAlias = fromInput.trim() ? (item.searchNames || []).find(
                      name => name.toLowerCase() !== item.name.toLowerCase() &&
                        (name.toLowerCase().includes(fromInput.trim().toLowerCase()) ||
                          (normalizeArabic(fromInput) !== "" && normalizeArabic(name).includes(normalizeArabic(fromInput))))
                    ) : null;
                    return (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setFromInput(item.name);
                          setShowFromSuggestions(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid var(--borderGlass, rgba(255,255,255,0.06))",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
              <button onClick={handleSwap} style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--textSecondary)",
                fontSize: "1.2rem",
                transition: "all 0.2s ease",
                marginTop: "4px",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "rotate(180deg)";
                  e.currentTarget.style.background = "var(--hoverBtn)";
                  e.currentTarget.style.color = "var(--colorSecondary)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "rotate(0deg)";
                  e.currentTarget.style.background = "var(--bgSecondary)";
                  e.currentTarget.style.color = "var(--textSecondary)";
                }}
              >
                ⇅
              </button>
            </div>

            {/* TO INPUT */}
            <div style={{ position: "relative", zIndex: showToSuggestions ? 100 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0 }}>
                  <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "red" }}></i> لفين ؟
                </label>
                <VoiceInputButton onTranscript={(text) => { setToInput(text); setShowToSuggestions(true); setSearchTriggered(false); }} />
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="اكتب اسم الوجهة... (مثال: معرض الكتاب أو أرض المعارض)"
                  value={toInput}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    setShowToSuggestions(true);
                    setSearchTriggered(false);
                  }}
                  onFocus={() => setShowToSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowToSuggestions(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                    height: "50px",
                  }}
                />
                {toInput.trim() && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الإدخال</span>
                )}
              </div>
              {showToSuggestions && (filteredToCities || []).length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "var(--cardGlassBg)",
                  border: "1px solid var(--cardGlassBorder)",
                  borderRadius: "var(--cardGlassRadius)",
                  overflow: "hidden",
                  zIndex: 999,
                  maxHeight: "220px",
                  overflowY: "auto",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.17), var(--shadow-lg)",
                  marginTop: "6px",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  fontFamily: "var(--font-body)",
                }}>
                  {(filteredToCities || []).map((item, idx) => {
                    const matchedAlias = toInput.trim() ? (item.searchNames || []).find(
                      name => name.toLowerCase() !== item.name.toLowerCase() &&
                        (name.toLowerCase().includes(toInput.trim().toLowerCase()) ||
                          (normalizeArabic(toInput) !== "" && normalizeArabic(name).includes(normalizeArabic(toInput))))
                    ) : null;
                    return (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setToInput(item.name);
                          setShowToSuggestions(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid var(--borderGlass, rgba(255,255,255,0.06))",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{item.name}</span>
                        {matchedAlias && (
                          <span style={{ fontSize: "0.75rem", background: "var(--borderGlass)", color: "var(--textSecondary)", padding: "2px 6px", borderRadius: "4px" }}>
                            {matchedAlias}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* SEARCH BUTTON */}
          <button
            onClick={() => handleSearch()}
            disabled={!fromInput.trim() || !toInput.trim()}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: (!fromInput.trim() || !toInput.trim()) ? "rgba(255,255,255,0.05)" : "var(--colorSecondary)",
              color: (!fromInput.trim() || !toInput.trim()) ? "var(--text-muted)" : "#ffffff",
              fontSize: "0.95rem",
              fontWeight: "700",
              border: "1px solid var(--borderGlassBtn)",
              cursor: (!fromInput.trim() || !toInput.trim()) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-display)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={e => {
              if (fromInput.trim() && toInput.trim()) {
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseLeave={e => {
              if (fromInput.trim() && toInput.trim()) {
                e.currentTarget.style.opacity = "1";
              }
            }}
          >
            <i className="bx bx-search-alt" style={{ fontSize: "1.2rem" }} />
            ابحث عن الطرق
          </button>

          {/* Preset Suggestions Quick Links */}
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>بحث سريع:</span>
            <button className={styles.presetTag} onClick={() => handlePresetSearch("الزقازيق", "العاشر من رمضان")}>الزقازيق ➔ العاشر</button>
            <button className={styles.presetTag} onClick={() => handlePresetSearch("موقف الأحرار", "معرض الكتاب")}>موقف الأحرار ➔ معرض الكتاب</button>
            <button className={styles.presetTag} onClick={() => handlePresetSearch("المنصورة", "محطة مصر")}>المنصورة ➔ محطة مصر</button>
            <button className={styles.presetTag} onClick={() => handlePresetSearch("العاشر من رمضان", "معرض الكتاب")}>العاشر ➔ معرض الكتاب</button>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {searchTriggered && (
          <div style={{ marginTop: "24px" }}>
            {matchedRoute ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Summary Header */}
                <div style={{
                  padding: "16px 20px",
                }}>
                  <h3 className="sub-title" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px", margin: 0, flexWrap: "wrap" }}>
                    <span> -  المسارات من</span>
                    <span style={{ color: "var(--colorSecondary)" }}>{resolvedFromLabel}</span>
                    <span>إلى</span>
                    <span style={{ color: "var(--colorSecondary)" }}>{resolvedToLabel}</span>
                  </h3>
                  {((fromInput.trim() !== resolvedFromLabel) || (toInput.trim() !== resolvedToLabel)) && (
                    <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "var(--colorSecondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="bx bx-info-circle" />
                      <span>تم توجيه بحثك تلقائياً بناءً على الأسماء الدلالية للمواقع.</span>
                    </p>
                  )}
                </div>

                {/* Route Options List */}
                {(matchedRoute?.options || []).map((option, idx) => {
                  const legs = buildLegsFromOption(option);
                  const summary = computeTotalTripSummary(option, legs);
                  return (
                    <div key={idx} style={{
                      backgroundColor: "var(--bgPrimary)",
                      border: "1px solid var(--containerBorder)",
                      borderRadius: "var(--containerRadius)",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}>
                      {/* Option Top Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--containerBorder)", paddingBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}>
                            <img src={`/images/icons2d/${option.icon}.png`} loading="lazy" decoding="async" style={{ width: "45px", height: "auto" }} alt="" />
                            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "var(--textPrimary)" }}>{option.typeName}</h2>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            color: "#10b981",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            fontWeight: "700"
                          }}>
                            💵 الإجمالي {summary.totalCost} ج.م
                          </span>
                          <span style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            color: "var(--colorSecondary)",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            fontWeight: "700"
                          }}>
                            ⏱️ {summary.totalDuration}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Multi-Stage Breakdown Section */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h4 className="sub-title" style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bx bx-git-repo-forked" style={{ color: "var(--colorSecondary)" }} />
                          <span>خطوات المسار:</span>
                        </h4>

                        {(legs || []).map((leg, legIdx) => (
                          <div key={legIdx} style={{
                            background: "var(--bgSecondary)",
                            border: "1px solid var(--containerBorder)",
                            borderRadius: "var(--containerRadius)",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                          }}>
                            {/* Stage Header with Time & Price for THIS specific Stage */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{
                                  background: "var(--colorSecondary)",
                                  color: "#ffffff",
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.78rem",
                                  fontWeight: "700",
                                  flexShrink: 0
                                }}>
                                  {legIdx + 1}
                                </span>
                                <h5 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "700", color: "var(--textPrimary)", fontFamily: "var(--font-display)" }}>
                                  {leg.title}
                                </h5>
                              </div>

                              {/* Stage Duration & Price Badges */}
                              <div style={{ display: "flex", gap: "6px", margin: "10px 0 0 0" }}>
                                {leg.cost !== undefined && (
                                  <span style={{
                                    background: "rgba(16, 185, 129, 0.12)",
                                    border: "1px solid rgba(16, 185, 129, 0.25)",
                                    color: "#10b981",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "0.78rem",
                                    fontWeight: "700"
                                  }}>
                                    الأجرة :  {leg.cost} ج.م
                                  </span>
                                )}
                                {leg.duration && (
                                  <span style={{
                                    background: "rgba(59, 130, 246, 0.12)",
                                    border: "1px solid rgba(59, 130, 246, 0.25)",
                                    color: "var(--colorSecondary)",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "0.78rem",
                                    fontWeight: "700"
                                  }}>
                                    الوقت :  {leg.duration}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Sub-steps inside Stage (Clean Step List) */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {(leg?.steps || []).map((stepText, sIdx) => (
                                <div key={sIdx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                  <div style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: "rgba(59, 130, 246, 0.12)",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                    color: "var(--colorSecondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    flexShrink: 0,
                                    marginTop: "0px"
                                  }}>
                                    {sIdx + 1}
                                  </div>
                                  <div style={{ fontSize: "0.9rem", color: "var(--textPrimary)", lineHeight: "1.5", fontFamily: "var(--font-body)" }}>
                                    {stepText}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Overall Trip Summary Box */}
                      <div style={{
                        background: "var(--bgAlert)",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "var(--containerRadius)",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--textPrimary)" }}><i className="bx bx-git-repo-forked" style={{ color: "var(--colorSecondary)" }} /> ملخص الرحلة</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--textMuted)" }}>مجموع الوقت والأجرة لكافة المراحل</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", alignItems: "center", flexDirection: "column", width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", background: "var(--bgPrimary)", padding: "6px 12px", borderRadius: "var(--radius-xs)", border: "1px solid var(--containerBorder)", width: "100%" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--textMuted)", fontFamily: "var(--font-display)" }}>هتصرف أجرة بقيمة :</span>
                            <span style={{ fontSize: "0.98rem", fontWeight: "800", color: "#119200ff", }}>💵 {summary.totalCost} ج.م</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", background: "var(--bgPrimary)", padding: "6px 12px", borderRadius: "var(--radius-xs)", border: "1px solid var(--containerBorder)", width: "100%" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--textMuted)", fontFamily: "var(--font-display)" }}> وقت الوصول المقدر :</span>
                            <span style={{ fontSize: "0.98rem", fontWeight: "800", color: "var(--colorSecondary)" }}>⏱️ {summary.totalDuration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tip */}
                      {option.tips && (
                        <div style={{
                          display: "flex",
                          gap: "10px",
                          background: "var(--bgAlert)",
                          border: "1px solid var(--containerBorder)",
                          padding: "6px 8px",
                          borderRadius: "var(--containerRadius)",
                          alignItems: "center",
                          justifyContent: "start"
                        }}>
                          <img
                            src="/images/icons3d/light.png"
                            alt="light"
                            width="40px"
                          />
                          <p className="sub-title" style={{ margin: 0, fontSize: "0.85rem", color: "var(--textPrimary)", lineHeight: "1.5", fontWeight: "500" }}>{option.tips}</p>
                        </div>
                      )}

                      {/* Action Buttons: WhatsApp Share & Google Maps */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleShareRoute(option, legs, summary)}
                          style={{
                            flex: "1 1 140px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            height: "44px",
                            fontWeight: "700",
                            fontSize: "0.9rem",
                            borderRadius: "var(--radiusBtn)",
                            color: "#ffffff",
                            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontFamily: "var(--font-display)"
                          }}
                        >
                          <i className="bx bxl-whatsapp" style={{ fontSize: "1.3rem" }} />
                          <span>مشاركة خط السير</span>
                        </button>
                        {option.map_link && (
                          <a
                            href={option.map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: "1 1 140px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              textDecoration: "none",
                              height: "44px",
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              borderRadius: "var(--radiusBtn)",
                              color: "#ffffff",
                              background: "var(--mainBtn)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <i className="bx bx-navigation" style={{ fontSize: "1.2rem" }} />
                            <span>خريطة Google</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setReportingOption(option);
                            setReportProblemType("pricing");
                            setReportContent("");
                            setReportSuccess(false);
                            setReportError("");
                            setReportModalOpen(true);
                          }}
                          style={{
                            flex: "1 1 140px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            height: "44px",
                            fontWeight: "700",
                            fontSize: "0.9rem",
                            borderRadius: "var(--radiusBtn)",
                            color: "#ff4d4d",
                            background: "rgba(255, 77, 77, 0.08)",
                            border: "1px solid rgba(255, 77, 77, 0.2)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontFamily: "var(--font-display)"
                          }}
                        >
                          <i className="bx bx-error-alt" style={{ fontSize: "1.2rem" }} />
                          <span>الإبلاغ عن مشكلة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // No Direct Route Found Card
              <div style={{
                backgroundColor: "var(--bgPrimary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "15px",
                padding: "24px",
                boxShadow: "var(--shadow-card)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "2.5rem" }}>📭</span>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--textPrimary)", margin: 0 }}>لا يوجد مسار مباشر مسجل</h2>
                  <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
                    عذراً، لم نقم بعد بإضافة المسار المباشر من <strong style={{ color: "var(--textPrimary)" }}>{fromInput}</strong> إلى <strong style={{ color: "var(--textPrimary)" }}>{toInput}</strong>.
                  </p>
                </div>

                {/* Suggest Route Form */}
                <div style={{ borderTop: "1px solid var(--borderGlass)", paddingTop: "20px", textAlign: "right" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>هل تعرف كيف تذهب؟ ساعدنا في إضافته!</h2>
                  <p className="sub-title" style={{ fontSize: "0.82rem", color: "var(--textSecondary)", marginBottom: "14px" }}>
                    اكتب خطوات الذهاب ومحطات الركوب والتكلفة المتوقعة لنقوم بمراجعتها وإضافتها فوراً لخدمة الجميع.
                  </p>

                  {user ? (
                    <form onSubmit={handleSuggestRoute} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <textarea
                        className="input-fields"
                        style={{ width: "100%", minHeight: "90px", padding: "12px", fontFamily: "var(--font-body)" }}
                        placeholder="مثال: من موقف الأحرار اركب عربيات العاشر وانزل عند الأردنية، الأجرة 20 جنيه والمشوار بياخد ساعة..."
                        value={suggestContent}
                        onChange={(e) => setSuggestContent(e.target.value)}
                        required
                      />

                      {suggestError && (
                        <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>⚠️ {suggestError}</div>
                      )}

                      {suggestSuccess && (
                        <div style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: "700" }}>✓ تم إرسال اقتراحك بنجاح! شكراً لمساهمتك القيمة.</div>
                      )}

                      <button
                        type="submit"
                        style={{
                          alignSelf: "flex-end",
                          height: "40px",
                          padding: "var(--paddingBtn)",
                          borderRadius: "var(--radiusBtn)",
                          background: "var(--mainBtn)",
                          color: "#ffffff",
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          fontFamily: "var(--font-display)",
                          border: "none",
                          cursor: suggestLoading || !suggestContent.trim() ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                        disabled={suggestLoading || !suggestContent.trim()}
                      >
                        {suggestLoading ? "جاري الإرسال..." : "إرسال الاقتراح"}
                      </button>
                    </form>
                  ) : (
                    <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", marginBottom: "10px" }}>سجل دخولك لتتمكن من اقتراح هذا الطريق وكسب نقاط مكافأة!</p>
                      <Link href="/login" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 20px",
                        fontSize: "0.88rem",
                        borderRadius: "10px",
                        background: "var(--colorSecondary)",
                        color: "#ffffff",
                        fontWeight: "700",
                        textDecoration: "none"
                      }}>
                        تسجيل الدخول
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Problem Modal Overlay */}
      {reportModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fade-in 0.2s ease"
          }}
          onClick={() => setReportModalOpen(false)}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              backgroundColor: "var(--bgPrimary, #121212)",
              border: "1px solid var(--containerBorder, rgba(255,255,255,0.08))",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              direction: "rtl",
              textAlign: "right",
              animation: "slide-up 0.25s ease",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--borderGlass, rgba(255,255,255,0.06))", paddingBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                ⚠️ الإبلاغ عن مشكلة في خط السير
              </h2>
              <button
                onClick={() => setReportModalOpen(false)}
                className="closeBtn"
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {/* Route Info Summary */}
            <div style={{ background: "var(--bgSecondary, rgba(255,255,255,0.02))", border: "1px solid var(--borderGlass)", borderRadius: "8px", padding: "12px", marginBottom: "20px", fontSize: "0.88rem", fontFamily: "var(--font-body)" }}>
              <div style={{ marginBottom: "6px" }}>
                📍 من: <strong style={{ color: "var(--textPrimary)" }}>{resolvedFromLabel || fromInput}</strong>
              </div>
              <div style={{ marginBottom: "6px" }}>
                🎯 إلى: <strong style={{ color: "var(--textPrimary)" }}>{resolvedToLabel || toInput}</strong>
              </div>
              <div>
                🚌 وسيلة المواصلة: <strong style={{ color: "var(--colorSecondary)" }}>{reportingOption?.typeName}</strong>
              </div>
            </div>

            {user ? (
              <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Problem Type selector */}
                <div>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)" }}>
                    ما هي المشكلة التي تواجهها؟
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setReportProblemType("pricing")}
                      style={{
                        flex: 1,
                        padding: "var(--paddingBtn)",
                        borderRadius: "var(--radiusBtn)",
                        fontFamily: "var(--font-sub)",
                        border: "1px solid " + (reportProblemType === "pricing" ? "var(--colorSecondary)" : "var(--borderGlass)"),
                        background: reportProblemType === "pricing" ? "rgba(59, 130, 246, 0.12)" : "transparent",
                        color: reportProblemType === "pricing" ? "var(--colorSecondary)" : "var(--textSecondary)",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      💵 تسعير الأجرة
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportProblemType("steps")}
                      style={{
                        flex: 1,
                        padding: "var(--paddingBtn)",
                        borderRadius: "var(--radiusBtn)",
                        fontFamily: "var(--font-sub)",
                        border: "1px solid " + (reportProblemType === "steps" ? "var(--colorSecondary)" : "var(--borderGlass)"),
                        background: reportProblemType === "steps" ? "rgba(59, 130, 246, 0.12)" : "transparent",
                        color: reportProblemType === "steps" ? "var(--colorSecondary)" : "var(--textSecondary)",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      📌 خطوات السير
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportProblemType("other")}
                      style={{
                        flex: 1,
                        padding: "var(--paddingBtn)",
                        borderRadius: "var(--radiusBtn)",
                        fontFamily: "var(--font-sub)",
                        border: "1px solid " + (reportProblemType === "other" ? "var(--colorSecondary)" : "var(--borderGlass)"),
                        background: reportProblemType === "other" ? "rgba(59, 130, 246, 0.12)" : "transparent",
                        color: reportProblemType === "other" ? "var(--colorSecondary)" : "var(--textSecondary)",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      🔍 أخرى
                    </button>
                  </div>
                </div>

                {/* Problem Description text area */}
                <div>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)" }}>
                    تفاصيل البلاغ:
                  </label>
                  <textarea
                    className="input-fields"
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-sub)",
                      borderRadius: "10px",
                      resize: "vertical"
                    }}
                    placeholder={
                      reportProblemType === "pricing"
                        ? "مثال: الأجرة الحالية زادت وأصبحت 25 جنيه بدلاً من 20 جنيه..."
                        : reportProblemType === "steps"
                          ? "مثال: ميكروباص بلبيس لا يمر بمحطة كذا، أو الخطوة رقم 2 غير دقيقة..."
                          : "مثال: اكتب المشكلة أو الملاحظة التي وجدتها في هذا المسار بالتفصيل..."
                    }
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    required
                  />
                </div>

                {/* Error Banner */}
                {reportError && (
                  <div style={{ color: "#ff4d4d", fontSize: "0.85rem", background: "rgba(255, 77, 77, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255, 77, 77, 0.2)" }}>
                    ⚠️ {reportError}
                  </div>
                )}

                {/* Success Banner */}
                {reportSuccess && (
                  <div style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: "700", background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    ✓ تم إرسال البلاغ بنجاح! شكراً لمساعدتك في تحسين جودة البيانات.
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={reportLoading || !reportContent.trim() || reportSuccess}
                    style={{
                      flex: 2,
                      padding: "var(--paddingBtn)",
                      borderRadius: "var(--radiusBtn)",
                      background: "var(--mainBtn)",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "0.92rem",
                      border: "none",
                      cursor: (reportLoading || !reportContent.trim() || reportSuccess) ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: (reportLoading || !reportContent.trim() || reportSuccess) ? 0.6 : 1,
                      transition: "opacity 0.2s"
                    }}
                  >
                    {reportLoading ? "جاري الإرسال..." : "إرسال البلاغ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "var(--paddingBtn)",
                      borderRadius: "var(--radiusBtn)",
                      background: "var(--cancelBtn)",
                      border: "1px solid var(--borderGlass, rgba(255,255,255,0.08))",
                      color: "var(--textPrimary, #ffffff)",
                      fontWeight: "700",
                      fontSize: "0.92rem",
                      cursor: "pointer"
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ background: "var(--bgSecondary, rgba(255, 255, 255, 0.02))", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--textSecondary)", marginBottom: "16px" }}>
                  يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ ومساعدة مجتمع ماب القاهرة.
                </p>
                <Link
                  href="/login"
                  onClick={() => setReportModalOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "10px 24px",
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    background: "var(--colorSecondary, #3b82f6)",
                    color: "#ffffff",
                    fontWeight: "700",
                    textDecoration: "none"
                  }}
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
