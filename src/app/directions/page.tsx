"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface RouteOption {
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  typeName: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
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
        icon: "bx bx-bus",
        cost: 20,
        duration: "50 دقيقة",
        steps: [
          "التوجه إلى موقف الأحرار الجديد بالزقازيق.",
          "الركوب من ممر (الزقازيق - العاشر من رمضان) ميكروباص مباشر.",
          "الوصول إلى موقف الأردنية بالعاشر من رمضان."
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
          "الذهاب إلى موقف الأحرار (قسم السيارات الـ 7 راكب).",
          "الركوب مباشرة متوجهاً إلى العاشر من رمضان.",
          "الوصول إلى صيدناوي أو الأردنية."
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
        typeName: "ميكروباص ومترو",
        icon: "bx bx-transfer",
        cost: 28,
        duration: "70 دقيقة",
        steps: [
          "اركب ميكروباص (الزقازيق - السلام) من موقف الأحرار بالزقازيق (20 ج.م).",
          "انزل في محطة عدلي منصور التبادلية.",
          "اركب المترو (الخط الثالث) متوجهاً باتجاه الكيت كات / جامعة القاهرة.",
          "انزل في محطة (أرض المعارض) مباشرة (8 ج.م)."
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
        typeName: "ميكروباص ومترو",
        icon: "bx bx-transfer",
        cost: 23,
        duration: "60 دقيقة",
        steps: [
          "اركب ميكروباص من موقف الأردنية بالعاشر إلى موقف السلام/عدلي منصور (15 ج.م).",
          "من محطة عدلي منصور، اركب المترو (الخط الثالث) باتجاه الكيت كات.",
          "انزل في محطة (أرض المعارض) مباشرة (8 ج.م)."
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
        duration: "ساعة و45 دقيقة",
        steps: [
          "التوجه إلى محطة قطارات الزقازيق بميدان المحطة.",
          "حجز تذكرة قطار (الزقازيق - رمسيس) خط الشرق.",
          "النزول في المحطة الأخيرة (محطة مصر برمسيس)."
        ],
        tips: "القطار وسيلة مريحة وغير مكلفة. يمكنك مراجعة جدول المواعيد بانتظام، أشهرها قطارات الساعة 7:00 ص و 3:00 م."
      },
      {
        type: "multi",
        typeName: "ميكروباص ومترو",
        icon: "bx bx-transfer",
        cost: 33,
        duration: "ساعة و30 دقيقة",
        steps: [
          "من موقف الأحرار بالزقازيق، اركب ميكروباص متوجهاً إلى موقف عبود بالقاهرة (25 ج.م).",
          "من موقف عبود، خذ تاكسي أو تمشية قصيرة لمحطة مترو المظلات (الخط الثاني).",
          "اركب المترو باتجاه الجيزة وانزل في محطة الشهداء (رمسيس) (8 ج.م)."
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
        icon: "bx bx-bus",
        cost: 20,
        duration: "60 دقيقة",
        steps: [
          "التوجه إلى موقف الأحرار بالزقازيق.",
          "الركوب من ممر (الزقازيق - السلام) ميكروباص مباشر.",
          "الوصول إلى موقف السلام الجديد أو محطة عدلي منصور التبادلية."
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
        typeName: "ميكروباص السلام مع النزول على الطريق",
        icon: "bx bx-transfer",
        cost: 20,
        duration: "45 دقيقة",
        steps: [
          "اركب ميكروباص (الزقازيق - السلام) من موقف الأحرار.",
          "اطلب من السائق النزول على طريق الإسماعيلية الصحراوي عند (بوابة الشروق 1).",
          "من أمام البوابة، اركب ميكروباص داخلي متوجهاً لوسط مدينة الشروق."
        ],
        tips: "أسرع وأسهل طريقة للوصول للشروق من الزقازيق."
      },
      {
        type: "multi",
        typeName: "عبر العاشر من رمضان",
        icon: "bx bx-transfer",
        cost: 28,
        duration: "70 دقيقة",
        steps: [
          "اركب ميكروباص من الزقازيق إلى العاشر من رمضان (20 ج.م).",
          "من موقف الأردنية بالعاشر، اركب ميكروباص متوجهاً إلى مدينة الشروق (8 ج.م).",
          "الدخول لمدينة الشروق عبر بوابة 2."
        ]
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
        icon: "bx bx-bus",
        cost: 15,
        duration: "40 دقيقة",
        steps: [
          "التوجه إلى موقف الأردنية بالعاشر من رمضان.",
          "الركوب من ممر (العاشر - السلام) ميكروباص مباشر.",
          "الوصول لموقف السلام ومحطة عدلي منصور التبادلية."
        ],
        tips: "المواصلة متوفرة بغزارة شديدة على مدار الساعة."
      },
      {
        type: "bus",
        typeName: "أتوبيس النقل العام / شرق الدلتا",
        icon: "bx bx-bus",
        cost: 20,
        duration: "45 دقيقة",
        steps: [
          "الانتظار في صيدناوي أو موقف الأردنية.",
          "ركوب أتوبيس هيئة النقل العام المتجه للسلام.",
          "النزول في محطة عدلي منصور."
        ],
        tips: "مريح ومكيف ولكنه ينطلق بمواعيد متفاوتة."
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
        steps: [
          "التوجه إلى محطة قطارات المنصورة.",
          "حجز قطار مباشر متوجه إلى محطة مصر برمسيس (خط المنصورة - طنطا - القاهرة).",
          "الوصول لمحطة رمسيس."
        ],
        tips: "القطار التوربيني أو الروسي المكيف هو الخيار الأفضل والأكثر أماناً ومواعيده ثابتة."
      },
      {
        type: "microbus",
        typeName: "ميكروباص مباشر",
        icon: "bx bx-bus",
        cost: 45,
        duration: "ساعتان ونصف",
        steps: [
          "التوجه لموقف المنصورة الجديد (الشرقية أو طلخا).",
          "الركوب متوجهاً إلى موقف عبود بالقاهرة.",
          "من موقف عبود، خذ المترو لرمسيس."
        ]
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
        steps: [
          "الذهاب لمحطة قطار طنطا.",
          "ركوب أي قطار متجه إلى القاهرة (خط الإسكندرية - القاهرة السريع).",
          "النزول في محطة رمسيس."
        ],
        tips: "القطارات متوفرة تقريباً كل نصف ساعة نظراً لوقوع طنطا على الخط الرئيسي."
      },
      {
        type: "microbus",
        typeName: "ميكروباص عبود",
        icon: "bx bx-bus",
        cost: 30,
        duration: "ساعة و30 دقيقة",
        steps: [
          "التوجه إلى موقف طنطا العمومي (موقف الجلاء أو المعرض).",
          "ركوب ميكروباص مباشر إلى موقف عبود بالقاهرة.",
          "من عبود خذ تاكسي أو مترو لوجهتك."
        ]
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
        duration: "ساعتان إلى ساعتين ونصف",
        steps: [
          "الذهاب إلى محطة قطار سيدي جابر أو محطة مصر بالإسكندرية.",
          "حجز قطار (سريع أو تالجو) مباشر إلى رمسيس.",
          "الوصول إلى رمسيس."
        ],
        tips: "قطارات تالجو الجديدة سريعة ومريحة جداً وتقدم خدمات ممتازة."
      },
      {
        type: "bus",
        typeName: "أتوبيس سوبر جيت / غرب الدلتا",
        icon: "bx bx-bus",
        cost: 90,
        duration: "3 ساعات",
        steps: [
          "الذهاب لمحطة السوبر جيت بمحرم بك.",
          "حجز تذكرة أتوبيس متوجه إلى موقف الترجمان أو الماظة بالقاهرة.",
          "الوصول للقاهرة."
        ]
      }
    ]
  }
];

export default function DirectionsPage() {
  const { user, profile, loading } = useAuth();
  const [routes, setRoutes] = useState<RouteData[]>(routesDataset);
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [matchedRoute, setMatchedRoute] = useState<RouteData | null>(null);

  // Resolved Search Labels (To show the user if an alias was resolved)
  const [resolvedFromLabel, setResolvedFromLabel] = useState("");
  const [resolvedToLabel, setResolvedToLabel] = useState("");

  // Suggestion form states
  const [suggestContent, setSuggestContent] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");

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
              groupMeta[key] = {
                from_aliases: item.from_aliases || "",
                to_aliases: item.to_aliases || ""
              };
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

            grouped[key].push({
              type: item.type,
              typeName: item.type_name,
              icon: item.icon,
              cost: item.cost,
              duration: item.duration,
              steps: stepsArr,
              tips: item.tips || undefined,
              map_link: item.map_link || undefined
            });
          });

          const formatted: RouteData[] = Object.keys(grouped).map(key => {
            const [from, to] = key.split("|||");
            return {
              from,
              to,
              from_aliases: groupMeta[key].from_aliases || undefined,
              to_aliases: groupMeta[key].to_aliases || undefined,
              options: grouped[key]
            };
          });

          // Merge with static dataset
          const merged = [...formatted];
          routesDataset.forEach(staticRoute => {
            const exists = merged.some(
              r => r.from.toLowerCase() === staticRoute.from.toLowerCase() &&
                   r.to.toLowerCase() === staticRoute.to.toLowerCase()
            );
            if (!exists) {
              merged.push(staticRoute);
            }
          });

          setRoutes(merged);
        }
      } catch (err) {
        console.warn("Failed to fetch routes from Supabase, using local static dataset:", err);
      }
    };

    fetchRoutes();
  }, []);

  // List of all unique cities with their aliases for autocomplete
  const uniqueCitiesList = useMemo(() => {
    const list: Array<{ name: string; searchNames: string[] }> = [];
    routes.forEach(r => {
      // For 'from'
      const fromAliasesArr = r.from_aliases ? r.from_aliases.split(",").map(a => a.trim()).filter(Boolean) : [];
      // Include global static aliases if matching
      Object.keys(locationAliasesMap).forEach(aliasKey => {
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
      Object.keys(locationAliasesMap).forEach(aliasKey => {
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

  const filteredFromCities = uniqueCitiesList.filter(item => {
    const normInput = normalizeArabic(fromInput);
    if (!normInput) return false;
    return item.searchNames.some(name => normalizeArabic(name).includes(normInput)) && item.name !== fromInput;
  });

  const filteredToCities = uniqueCitiesList.filter(item => {
    const normInput = normalizeArabic(toInput);
    if (!normInput) return false;
    return item.searchNames.some(name => normalizeArabic(name).includes(normInput)) && item.name !== toInput;
  });

  // Smart Search logic incorporating Arabic Normalization and Aliases resolution
  const handleSearch = (fromVal = fromInput, toVal = toInput) => {
    if (!fromVal.trim() || !toVal.trim()) return;

    let searchFrom = fromVal.trim();
    let searchTo = toVal.trim();

    // 1. Resolve global aliases if any match directly
    const normFromInput = normalizeArabic(searchFrom);
    const normToInput = normalizeArabic(searchTo);

    Object.keys(locationAliasesMap).forEach(aliasKey => {
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

    for (const route of routes) {
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

  if (loading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--accent-ios, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>جاري التحقق من تفاصيل الاشتراك...</p>
      </div>
    );
  }

  // Paywall / Lock screen if user doesn't have Gold access
  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || (profile?.subscription_tier === "gold" && !isExpired);

  if (!user || !hasAccess) {
    return (
      <div className="app-container" style={{ maxWidth: "600px", paddingTop: "60px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "24px" }}>
          <Link 
            href="/" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              color: "var(--accent-ios, #3b82f6)", 
              textDecoration: "none", 
              fontWeight: "600",
              fontSize: "0.95rem" 
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Premium Lock Panel */}
        <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(234, 179, 8, 0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />

          {/* Lock Icon */}
          <div style={{ 
            fontSize: "4.5rem", 
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            background: "rgba(234, 179, 8, 0.08)",
            borderRadius: "50%",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            color: "#eab308",
            animation: "pulse 2s infinite"
          }}>
            <i className="bx bxs-lock-alt"></i>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#fff", marginBottom: "14px" }}>
            دليل &quot;ازاي اروح&quot; ميزة ذهبية 🥇
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
            محرك البحث المتقدم عن خطوط المواصلات والطرق المختصرة (ميكروباص، أتوبيسات، مترو، ومونوريل) متاح حصرياً لعملاء الباقة الذهبية المميزة.
          </p>

          {/* Features list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية (60 ج.م/شهرياً):</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ البحث عن مسارات مواصلات بين أي منطقتين بالتفصيل</li>
              <li>✨ حساب تكلفة الرحلة والمدة المتوقعة بدقة</li>
              <li>✨ خيارات متعددة للتنقل (مباشر، مترو + ميكروباص، إلخ)</li>
              <li>✨ تشمل أيضاً خريطة المونوريل التفاعلية بالكامل</li>
            </ul>
          </div>

          {/* Call to Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
            {user ? (
              <Link
                href="/profile"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                  color: "#000",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
                  display: "block"
                }}
              >
                🚀 اشترك الآن ورقّ حسابك للذهبية
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  display: "block"
                }}
              >
                🔑 سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}
            
            <Link
              href="/"
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#94a3b8",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.9rem",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "block"
              }}
            >
              العودة لتصفح مترو القاهرة المجاني
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingTop: "30px", paddingBottom: "60px" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--accent-ios)", 
            textDecoration: "none", 
            fontWeight: "600",
            fontSize: "0.95rem" 
          }}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      {/* Header */}
      <div className="glass-panel" style={{ padding: "40px 30px", marginBottom: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🧭</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "8px", color: "var(--text-primary)" }}>
          ازاي اروح ؟
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          دليل السفر والانتقال الذكي. ابحث بأي اسم (مثل: رمسيس، معرض الكتاب، موقف الأحرار، العاشر) وسنقوم بتوجيهك للطريق الأنسب تلقائياً.
        </p>
      </div>

      {/* Inputs Panel */}
      <div className="glass-panel" style={{ padding: "30px", marginBottom: "24px" }}>
        <div className={styles.searchRow}>
          
          {/* Start Point */}
          <div style={{ flex: 1, position: "relative" }}>
            <label className="help-label" style={{ marginBottom: "8px", display: "block" }}>منين ؟ (نقطة البداية)</label>
            <div className={styles.inputWrapper}>
              <i className="bx bx-map-pin" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "1.2rem" }} />
              <input
                type="text"
                className="ios-input"
                style={{ paddingRight: "40px", width: "100%" }}
                placeholder="مثال: موقف الأحرار أو الزقازيق"
                value={fromInput}
                onChange={(e) => {
                  setFromInput(e.target.value);
                  setShowFromSuggestions(true);
                }}
                onFocus={() => setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
              />
            </div>
            
            {showFromSuggestions && filteredFromCities.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {filteredFromCities.map((item, idx) => {
                  const matchedAlias = item.searchNames.find(
                    name => name.toLowerCase() !== item.name.toLowerCase() && 
                            normalizeArabic(name).includes(normalizeArabic(fromInput))
                  );
                  return (
                    <button
                      key={idx}
                      className={styles.suggestionItem}
                      onClick={() => {
                        setFromInput(item.name);
                        setShowFromSuggestions(false);
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span style={{ fontWeight: "600" }}>{item.name}</span>
                      {matchedAlias && (
                        <span className={styles.matchedAliasText}>({matchedAlias})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <button 
            type="button" 
            className={styles.swapBtn} 
            onClick={handleSwap} 
            title="تبديل الاتجاه"
          >
            <i className="bx bx-transfer-alt" />
          </button>

          {/* Destination Point */}
          <div style={{ flex: 1, position: "relative" }}>
            <label className="help-label" style={{ marginBottom: "8px", display: "block" }}>لفين ؟ (الوجهة)</label>
            <div className={styles.inputWrapper}>
              <i className="bx bxs-map" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "1.2rem" }} />
              <input
                type="text"
                className="ios-input"
                style={{ paddingRight: "40px", width: "100%" }}
                placeholder="مثال: معرض الكتاب أو أرض المعارض"
                value={toInput}
                onChange={(e) => {
                  setToInput(e.target.value);
                  setShowToSuggestions(true);
                }}
                onFocus={() => setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
              />
            </div>

            {showToSuggestions && filteredToCities.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {filteredToCities.map((item, idx) => {
                  const matchedAlias = item.searchNames.find(
                    name => name.toLowerCase() !== item.name.toLowerCase() && 
                            normalizeArabic(name).includes(normalizeArabic(toInput))
                  );
                  return (
                    <button
                      key={idx}
                      className={styles.suggestionItem}
                      onClick={() => {
                        setToInput(item.name);
                        setShowToSuggestions(false);
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span style={{ fontWeight: "600" }}>{item.name}</span>
                      {matchedAlias && (
                        <span className={styles.matchedAliasText}>({matchedAlias})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <button 
          className="ios-btn ios-btn-primary" 
          style={{ width: "100%", height: "48px", fontSize: "1.05rem", fontWeight: "700", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          onClick={() => handleSearch()}
          disabled={!fromInput.trim() || !toInput.trim()}
        >
          <i className="bx bx-search-alt" style={{ fontSize: "1.3rem" }} />
          ابحث عن مواصلات
        </button>

        {/* Preset Suggestions Quick Links */}
        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>كلمات دلالية شائعة للبحث السريع:</span>
          <button className={styles.presetTag} onClick={() => handlePresetSearch("الزقازيق", "العاشر من رمضان")}>الزقازيق ➔ العاشر</button>
          <button className={styles.presetTag} onClick={() => handlePresetSearch("موقف الأحرار", "معرض الكتاب")}>موقف الأحرار ➔ معرض الكتاب</button>
          <button className={styles.presetTag} onClick={() => handlePresetSearch("المنصورة", "محطة مصر")}>المنصورة ➔ محطة مصر</button>
          <button className={styles.presetTag} onClick={() => handlePresetSearch("العاشر من رمضان", "معرض الكتاب")}>العاشر ➔ معرض الكتاب</button>
        </div>
      </div>

      {/* Results Section */}
      {searchTriggered && (
        <div style={{ animation: "fade-in 0.3s ease" }}>
          {matchedRoute ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <span>الطرق المتاحة من</span>
                  <span style={{ color: "#3b82f6" }}>{resolvedFromLabel}</span>
                  <span>إلى</span>
                  <span style={{ color: "#3b82f6" }}>{resolvedToLabel}</span>
                </h2>
                
                {/* Search redirection notice */}
                {((fromInput.trim() !== resolvedFromLabel) || (toInput.trim() !== resolvedToLabel)) && (
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--accent-ios)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className="bx bx-info-circle" />
                    <span>تم توجيه بحثك تلقائياً بناءً على الأسماء الدلالية والبديلة للمواقع.</span>
                  </p>
                )}
              </div>

              {matchedRoute.options.map((option, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", borderRight: "4px solid #3b82f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className={styles.optionIconBg}>
                        <i className={option.icon} style={{ fontSize: "1.4rem", color: "#3b82f6" }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>{option.typeName}</h3>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {option.type === "microbus" ? "موقف ميكروباص" : 
                           option.type === "bus" ? "أتوبيس النقل العام" : 
                           option.type === "car" ? "سيارة خاصة" : 
                           option.type === "train" ? "محطة قطار" : 
                           option.type === "monorail" ? "قطار المونوريل" : 
                           option.type === "metro" ? "مترو الأنفاق" : 
                           option.type === "plane" ? "طيران / طائرة" : 
                           option.type === "ship" ? "عبارة / سفينة" : 
                           "وسائل مواصلات متعددة"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <span className={styles.infoBadge} style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981" }}>
                        💵 {option.cost} ج.م
                      </span>
                      <span className={styles.infoBadge} style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>
                        ⏱️ {option.duration}
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className={styles.stepsWrapper}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>خطوات الانتقال بالتفصيل:</h4>
                    <ol style={{ paddingRight: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-secondary)", fontSize: "0.93rem" }}>
                      {option.steps.map((step, sIdx) => (
                        <li key={sIdx} style={{ lineHeight: "1.6" }}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Tip */}
                  {option.tips && (
                    <div style={{ display: "flex", gap: "10px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.15)", padding: "12px 16px", borderRadius: "12px" }}>
                      <span style={{ fontSize: "1.2rem" }}>💡</span>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(245, 158, 11, 0.9)", lineHeight: "1.5" }}>{option.tips}</p>
                    </div>
                  )}

                  {/* Google Maps Route Navigation Button */}
                  {option.map_link && (
                    <a 
                      href={option.map_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ios-btn ios-btn-primary" 
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "8px", 
                        textDecoration: "none", 
                        height: "44px", 
                        fontWeight: "700", 
                        fontSize: "0.95rem",
                        marginTop: "4px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                      }}
                    >
                      <i className="bx bx-navigation" style={{ fontSize: "1.2rem" }} />
                      <span>بدء الرحلة (خرائط Google)</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // No direct route found
            <div className="glass-panel" style={{ padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "3rem" }}>📭</span>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>لا يوجد مسار مباشر مسجل</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "500px", margin: "0 auto", lineHeight: "1.6" }}>
                  عذراً، لم نقم بعد بإضافة المسار المباشر من <strong style={{ color: "var(--text-primary)" }}>{fromInput}</strong> إلى <strong style={{ color: "var(--text-primary)" }}>{toInput}</strong>.
                </p>
              </div>

              {/* Propose / Suggest Route Form */}
              <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "24px", textAlign: "right" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>هل تعرف كيف تذهب؟ ساعدنا في إضافته!</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  اكتب خطوات الذهاب ومحطات الركوب والتكلفة المتوقعة لنقوم بمراجعتها وإضافتها فوراً لخدمة جميع المستخدمين.
                </p>

                {user ? (
                  <form onSubmit={handleSuggestRoute} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <textarea
                      className="ios-input"
                      style={{ width: "100%", minHeight: "100px", padding: "12px", fontFamily: "inherit" }}
                      placeholder="مثال: من موقف الأحرار اركب عربيات العاشر وانزل عند الأردنية، الأجرة 20 جنيه والمشوار بياخد ساعة..."
                      value={suggestContent}
                      onChange={(e) => setSuggestContent(e.target.value)}
                      required
                    />

                    {suggestError && (
                      <div style={{ color: "#ef4444", fontSize: "0.88rem" }}>⚠️ {suggestError}</div>
                    )}

                    {suggestSuccess && (
                      <div style={{ color: "#10b981", fontSize: "0.88rem", fontWeight: "700" }}>✓ تم إرسال اقتراحك بنجاح! شكراً لمساهمتك القيمة.</div>
                    )}

                    <button
                      type="submit"
                      className="ios-btn ios-btn-primary"
                      style={{ alignSelf: "flex-end", height: "40px", padding: "0 24px", display: "flex", alignItems: "center", gap: "6px" }}
                      disabled={suggestLoading || !suggestContent.trim()}
                    >
                      {suggestLoading ? "جاري الإرسال..." : "إرسال الاقتراح"}
                    </button>
                  </form>
                ) : (
                  <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "12px" }}>سجل دخولك لتتمكن من اقتراح هذا الطريق وكسب نقاط مكافأة!</p>
                    <Link href="/login" className="ios-btn ios-btn-primary" style={{ display: "inline-flex", textDecoration: "none", alignItems: "center", padding: "8px 24px", fontSize: "0.9rem", height: "auto" }}>
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
  );
}
