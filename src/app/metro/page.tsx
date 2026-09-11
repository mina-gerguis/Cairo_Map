"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import VoiceInputButton from "@/components/VoiceInputButton";
import MetroSubscriptionCalculator from "@/components/MetroSubscriptionCalculator";
import EmergencyQuickBar from "@/components/EmergencyQuickBar";
import TransitFAQ from "@/components/TransitFAQ";

/* ============================================================
   Cairo Metro Data — Lines 1, 2, 3 (with branch)
   ============================================================ */
const LINE1_STATIONS = [
  "حلوان", "عين حلوان", "جامعة حلوان", "وادي حوف", "حدائق حلوان",
  "المعصرة", "طرة الأسمنت", "كوتسيكا", "طرة البلد", "ثكنات المعادي",
  "المعادي", "حدائق المعادي", "دار السلام", "الزهراء", "مار جرجس",
  "الملك الصالح", "السيدة زينب", "سعد زغلول", "أنور السادات",
  "جمال عبد الناصر", "أحمد عرابي", "الشهداء", "غمرة", "الدمرداش",
  "منشية الصدر", "كوبري القبة", "حمامات القبة", "سراي القبة",
  "حدائق الزيتون", "حلمية الزيتون", "المطرية", "عين شمس",
  "عزبة النخل", "المرج", "المرج الجديدة",
];

const LINE2_STATIONS = [
  "شبرا الخيمة", "كلية الزراعة", "المظلات", "الخلفاوي", "سانت تريزا",
  "روض الفرج", "مسرة", "الشهداء", "العتبة", "محمد نجيب",
  "أنور السادات", "الأوبرا", "الدقي", "البحوث", "جامعة القاهرة",
  "فيصل", "الجيزة", "أم المصريين", "ساقية مكي", "المنيب",
];

// Line 3 main trunk (up to Kit-Kat which is branching point)
const LINE3_TRUNK = [
  "عدلي منصور", "الهايكستب", "عمر بن الخطاب", "قباء", "هشام بركات",
  "النزهة", "نادي الشمس", "ألف مسكن", "ميدان هليوبوليس", "هارون",
  "الأهرام", "كلية البنات", "استاد القاهرة", "المعرض", "العباسية",
  "عبده باشا", "الجيش", "باب الشعرية", "العتبة", "جمال عبد الناصر",
  "ماسبيرو", "صفاء حجازي", "الكيت كات",
];
const LINE3_BRANCH_A = [
  "الكيت كات", "السودان", "إمبابة", "البوهي", "القومية العربية",
  "الطريق الدائري", "محور روض الفرج",
];
const LINE3_BRANCH_B = [
  "الكيت كات", "التوفيقية", "وادي النيل", "جامعة الدول العربية",
  "بولاق الدكرور", "جامعة القاهرة",
];

// Combined Line 3 stations (unique list)
const LINE3_STATIONS = [
  ...LINE3_TRUNK.slice(0, -1), // trunk without kit-kat
  "الكيت كات",
  ...LINE3_BRANCH_A.slice(1),
  ...LINE3_BRANCH_B.slice(1),
];

type LineId = "line1" | "line2" | "line3" | "line4" | "line5" | "line6";

interface StationInfo {
  name: string;
  lines: LineId[];
  isTransfer: boolean;
  landmarks?: string[];
}

const LINE_NAMES: Record<LineId, string> = {
  line1: "الخط الأول (الأحمر)",
  line2: "الخط الثاني (الأزرق)",
  line3: "الخط الثالث (الأخضر)",
  line4: "الخط الرابع (البرتقالي)",
  line5: "الخط الخامس (البنفسجي)",
  line6: "الخط السادس (الوردي)",
};

const LINE_COLORS: Record<LineId, string> = {
  line1: "#ef4444", // Modern Red
  line2: "#3b82f6", // Modern Blue
  line3: "#10b981", // Modern Green
  line4: "#f59e0b", // Orange
  line5: "#8b5cf6", // Purple
  line6: "#ec4899", // Pink
};

export const METRO_STATION_LANDMARKS: Record<string, string[]> = {
  // الخط الأول
  "حلوان": ["الحديقة اليابانية", "متحف ركن فاروق", "كابريتاج حلوان الكبريتي", "مستشفى حلوان العام", "شارع راغب التجاري", "سوق حلوان"],
  "عين حلوان": ["كلية الحاسبات والذكاء الاصطناعي", "مركز بحوث الفلزات", "مساكن عين حلوان", "معهد بحوث التبين"],
  "جامعة حلوان": ["الحرم الرئيسي لجامعة حلوان", "مجمع الكليات والمعاهد", "الصالة المغطاة للألعاب الرياضية", "مدينة الطلبة والطالبات"],
  "وادي حوف": ["ضاحية وادي حوف الهادئة", "شركة النصر لصناعة السيارات", "مستشفى النصر التخصصي", "مدرسة وادي حوف"],
  "حدائق حلوان": ["نادي حدائق حلوان الرياضي", "كورنيش النيل (المعادي - حلوان)", "شارع الوهم", "منطقة ركن حلوان"],
  "المعصرة": ["مصنع سيماف لعربات السكك الحديدية والمترو", "كورنيش المعصرة", "سوق المعصرة", "شارع المستودع"],
  "طرة الأسمنت": ["مصنع أسمنت بورتلاند طرة", "طريق الأوتوستراد السريع", "منطقة معادي هايتس"],
  "كوتسيكا": ["منطقة كوتسيكا الصناعية", "كوبري شمال طرة", "طريق مصر حلوان الزراعي"],
  "طرة البلد": ["مجمع مصالح طرة البلد", "كورنيش طرة النيل", "معهد أمين الشرطة", "شارع كورنيش النيل"],
  "ثكنات المعادي": ["نادي المعادي لليخوت والتجديف", "شارع 9 التجاري (الجهة الجنوبية)", "المستشفى العسكري بالمعادي", "فيكتوريا كوليدج المعادي"],
  "المعادي": ["شارع 9 السياحي (أشهر المطاعم والكافيهات)", "ميدان الحرية", "مستشفى القوات المسلحة بالمعادي", "كنيسة القديس يوحنا المعمدان", "جراند مول المعادي"],
  "حدائق المعادي": ["شارع حسنين دسوقي التجاري", "شارع فرج يوسف", "سوق حدائق المعادي", "أبراج النصر"],
  "دار السلام": ["سوق دار السلام الكبير", "مستشفى دار السلام العام (هرمل)", "شارع الفيوم التجاري", "مجمع مدارس دار السلام"],
  "الزهراء": ["المتحف القومي للحضارة المصرية (NMEC)", "بحيرة عين الصيرة وممشاها السياحي", "جامع عمرو بن العاص التاريخي", "مجمع الأديان بمصر القديمة", "حديقة تلال الفسطاط"],
  "مار جرجس": ["الكنيسة المعلقة (أقدم كنائس مصر)", "كنيسة ومزار مار جرجس", "المتحف القبطي", "حصن بابليون الروماني", "معبد بن عزرا اليهودي"],
  "الملك الصالح": ["مستشفى الملك الصالح", "مقياس النيل بجزيرة الروضة", "قصر المانسترلي ومتحف أم كلثوم", "شارع البحر الأعظم", "مستشفى حميات العباسية فرع مصر القديمة"],
  "السيدة زينب": ["مسجد السيدة زينب التاريخي وميدانها", "مستشفى أحمد ماهر التعليمي", "مستشفى أطفال أبو الريش (الياباني والمنيرة)", "مسرح الهوسابير", "شارع بورسعيد"],
  "سعد زغلول": ["ضريح ومتحف بيت الأمة (سعد زغلول)", "مقر مجلس النواب ومجلس الوزراء", "وزارة الصحة والسكان", "مستشفى قصر العيني القديم والفرنساوي", "شارع قصر العيني"],
  "أنور السادات": ["ميدان التحرير ومسلته التاريخية", "المتحف المصري بالتحرير", "مجمع التحرير الخدمي", "فندق النيل ريتز كارلتون", "مقر جامعة الدول العربية", "كوبري قصر النيل"],
  "جمال عبد الناصر": ["دار القضاء العالي", "نقابة المحامين ونقابة الصحفيين", "شارع 26 يوليو التجاري", "وكالة البلح للأقمشة والملابس", "محطة الإسعاف المصرية"],
  "أحمد عرابي": ["سوق التوفيقية لقطع غيار السيارات والفواكه", "مستشفى الجلاء التعليمي للولادة", "الهيئة القومية لسكك حديد مصر (المبنى الإداري)", "شارع الجلاء", "معهد ناصر للغات"],
  "الشهداء": ["محطة مصر للقطارات برمسيس", "ميدان رمسيس الشهير", "مسجد الفتح التاريخي", "شارع الفجالة (سوق الأدوات المدرسية والكتب)", "مبنى البريد المركزي المصري", "سنترال رمسيس"],
  "غمرة": ["مستشفى غمرة العسكري", "المستشفى القبطي", "كنيسة السيدة العذراء بغمرة", "مطلع ومنزل كوبري 6 أكتوبر", "شارع رمسيس الرئيسي"],
  "الدمرداش": ["مستشفيات جامعة عين شمس (مستشفى الدمرداش الجامعي)", "كلية الطب وكلية التمريض بجامعة عين شمس", "معهد القلب القومي القديم", "شارع رمسيس"],
  "منشية الصدر": ["قصر الزعفران (إدارة جامعة عين شمس)", "حرم جامعة عين شمس (كليات الآداب والحقوق والعلوم والتجارة)", "مدينة الطالبات بجامعة عين شمس", "ميدان العباسية"],
  "كوبري القبة": ["إدارة التجنيد والتعبئة بالقوات المسلحة", "مجمع كوبري القبة العسكري", "نادي ضباط القبة", "مشيخة الطرق الصوفية"],
  "حمامات القبة": ["قصر القبة الرئاسي وحدائقه الملكية", "ميدان سراي القبة", "مدرسة القبة الثانوية العسكرية", "محيط حي الزيتون التاريخي"],
  "سراي القبة": ["حديقة ابن سندر العامة", "ميدان السواح ومصانع الأدوية", "قصر الطاهرة التاريخي", "شارع مصر والسودان"],
  "حدائق الزيتون": ["كنيسة العذراء مريم بالزيتون (موقع التجلي الشهير)", "ميدان الساعة بالزيتون", "مستشفى الزيتون التخصصي", "شارع طومان باي"],
  "حلمية الزيتون": ["مستشفى الحلمية العسكري للعظام التخصصي", "ميدان ابن الحكم", "نادي الحلمية الرياضي", "شارع سليم الأول التجاري", "كنيسة مار يوحنا"],
  "المطرية": ["شجرة مريم العذراء ومزار العائلة المقدسة", "مسلة سنوسرت الأول التاريخية (مسلة المطرية)", "مستشفى المطرية التعليمي", "سوق الخميس التاريخي"],
  "عين شمس": ["كلية الهندسة جامعة عين شمس", "محطة قطار عين شمس السطحية", "شارع أحمد عصمت التجاري", "سوق عين شمس وميدان الحلمية"],
  "عزبة النخل": ["شارع ترعة التوفيقية التجاري", "موقف سيارات الأقاليم والقليوبية", "مستشفى اليوم الواحد بعزبة النخل", "سوق عزبة النخل المركزي"],
  "المرج": ["موقف أقاليم المرج للسيارات والميكروباصات", "شارع مؤسسة الزكاة التجاري", "كوبري المرج وسوق المرج القديم"],
  "المرج الجديدة": ["الطريق الدائري (تقاطع ونزلة المرج)", "موقف محافظات القليوبية والشرقية والدلتا", "ترعة الإسماعيلية وموقف سيارات السريع"],

  // الخط الثاني
  "شبرا الخيمة": ["قصر محمد علي التاريخي بشبرا الخيمة", "محطة قطارات شبرا الخيمة", "كوبري أحمد عرابي", "مستشفى النيل للتأمين الصحي", "كلية الزراعة فرع شبرا"],
  "كلية الزراعة": ["كلية الزراعة جامعة عين شمس", "ميدان المؤسسة بشبرا الخيمة", "طريق مصر إسكندرية الزراعي", "معهد بحوث وقاية النبات"],
  "المظلات": ["معهد ناصر للبحوث والعلاج", "كورنيش النيل بشبرا", "حديقة أغاخان النيلية", "كوبري المظلات", "نادي الكهرباء الرياضي"],
  "الخلفاوي": ["مستشفى شبرا العام", "معهد القلب القومي التابع لمعهد ناصر", "شارع شبرا الرئيسي", "سينما التحرير السابقة"],
  "سانت تريزا": ["كنيسة ومزار القديسة تريزا للأطفال", "مستشفى الراعي الصالح التخصصي", "شارع شبرا التجاري والملابس", "مدرسة الفرير شبرا"],
  "روض الفرج": ["سوق روض الفرج التاريخي", "قصر ثقافة روض الفرج التابع لوزارة الثقافة", "مدرسة التوفيقية الثانوية العريقة", "شارع جزيرة بدران"],
  "مسرة": ["كنيسة السيدة العذراء بمسرة", "منطقة البنوك والمحلات التجارية بشارع شبرا", "سينما أوسكار دوللي بشبرا", "مدرسة الترعة الإعدادية"],
  "العتبة": ["ميدان العتبة التجاري", "المسرح القومي المصري", "سور الأزبكية للكتب القديمة والمستعملة", "حديقة الأزبكية التراثية", "سوق الموسكي وخان الخليلي", "جراج العتبة"],
  "محمد نجيب": ["قصر عابدين التاريخي ومتاحفه الملكية", "ميدان الجمهورية بعابدين", "مقر وزارة التربية والتعليم", "شارع التحرير وشارع محمد فريد بوسط البلد"],
  "الأوبرا": ["دار الأوبرا المصرية ومسارحها", "برج القاهرة السياحي ومطلاته", "حديقة الأندلس التراثية على النيل", "نادي الجزيرة الرياضي العريق", "حديقة الحرية وحديقة الأسماك بالزمالك", "كوبري قصر النيل"],
  "الدقي": ["ميدان الدقي الشهير", "شارع التحرير ومحلات الدقي", "مستشفى مصر الدولي", "فندق شيراتون القاهرة", "مجمع مجلس الدولة", "متحف محمود خليل وحرمه"],
  "البحوث": ["المركز القومي للبحوث (NRC)", "مدينة الطلبة لجامعة القاهرة بالدقي", "شارع التحرير وشارع محيي الدين أبو العز", "مستشفى 6 أكتوبر للتأمين الصحي"],
  "جامعة القاهرة": ["قبة جامعة القاهرة التاريخية وساعة الجامعة", "الحرم الجامعي وكليات الحقوق والتجارة والآداب", "حديقة الحيوان بالجيزة", "حديقة الأورمان النباتية التراثية", "ميدان النهضة"],
  "فيصل": ["شارع الملك فيصل التجاري المزدحم", "كوبري فيصل المؤدي إلى الجيزة", "موقف ميكروباصات وسرفيس فيصل والهرم", "مستشفى تبارك للأطفال"],
  "الجيزة": ["محطة قطارات سكك حديد الجيزة للوجه القبلي", "ميدان الجيزة الرئيسي", "بداية شارع الأهرام (شارع الهرم)", "مجمع محاكم الجيزة بشارع مراد", "الباب الخلفي لحديقة الحيوان"],
  "أم المصريين": ["مستشفى أم المصريين العام", "ميدان أم المصريين", "مصلحة الجوازات والهجرة فرع الجيزة", "مدرسة الجيزة الثانوية للبنات"],
  "ساقية مكي": ["القرية الفرعونية السياحية على النيل", "شارع البحر الأعظم الترفيهي", "كورنيش الجيزة ومطاعم المراكب النيلية", "نادي التجديف واليخوت بجزيرة الدهب"],
  "المنيب": ["موقف المنيب الإقليمي لأوتوبيسات وميكروباصات الصعيد", "الطريق الدائري (نزلة المنيب وكوبري المنيب)", "كورنيش النيل بالمنيب", "شارع المدبح"],

  // الخط الثالث - Trunk
  "عدلي منصور": ["المحطة التبادلية المركزية عدلي منصور (مترو + قطار LRT + قطار السويس + SuperJet)", "موقف السلام للأقاليم", "طريق مصر الإسماعيلية الصحراوي", "سوق العبور الجديد"],
  "الهايكستب": ["منطقة الهايكستب العسكرية", "مستشفى الهايكستب العسكري للقوات المسلحة", "طريق مصر الإسماعيلية الصحراوي", "قرب الكلية الحربية"],
  "عمر بن الخطاب": ["شارع جسر السويس التجاري", "ميدان الحرفيين الشهير لقطع غيار السيارات", "مدرسة الفاروق الإسلامية للغات", "سوق قباء"],
  "قباء": ["مدينة قباء السكنية", "شارع جسر السويس", "شارع الأربعين", "مجمع مدارس قباء التجريبية"],
  "هشام بركات": ["مستشفى السلام التخصصي", "شارع الخمسين بالنزهة 2", "شارع جسر السويس", "موقف النزهة 2"],
  "النزهة": ["حي النزهة الجديدة الراقي", "شارع جوزيف تيتو المؤدي للمطار", "نادي النزهة الرياضي", "طريق مطار القاهرة الدولي"],
  "نادي الشمس": ["نادي الشمس الرياضي الاجتماعي", "شارع عبد الحميد بدوي", "حديقة بدر العامة", "ميدان الألف مسكن"],
  "ألف مسكن": ["ميدان الألف مسكن ومواقف سيارات التجمع ومدينة نصر", "شارع جسر السويس", "مستشفى عين شمس العام", "سوق الألف مسكن التجاري"],
  "ميدان هليوبوليس": ["ميدان هليوبوليس بمصر الجديدة", "كنيسة القديس مار جرجس هليوبوليس", "ميدان الحجاز", "مستشفى هليوبوليس التخصصي"],
  "هارون": ["شارع هارون الرشيد بمصر الجديدة", "ميدان الإسماعيلية", "شارع أبو بكر الصديق", "مدرسة نوتردام دي زابوتر"],
  "الأهرام": ["قصر البارون إمبان الأثري", "ميدان الكوربة التراثي والمطاعم التاريخية", "كنيسة البازيليك العريقة", "شارع الأهرام بمصر الجديدة"],
  "كلية البنات": ["كلية البنات جامعة عين شمس", "شارع الميرغني الشهير", "قصر الاتحادية الرئاسي", "مستشفى الصفا التخصصي"],
  "استاد القاهرة": ["مجمع صالات استاد القاهرة الدولي", "الصالة المغطاة ومجمع السباحة الأولمبي", "شارع يوسف عباس ودار الهيئة الهندسية", "ميدان الشهيد هشام بركات"],
  "المعرض": ["مركز القاهرة الدولي للمؤتمرات والمعارض (CICC)", "الهيئة العامة للاستثمار والمناطق الحرة (GAFI)", "أرض المعارض بمدينة نصر", "شارع صلاح سالم الحيوي"],
  "العباسية": ["ميدان العباسية وموقف سيارات الأقاليم", "مستشفى العباسية للصحة النفسية", "كلية الهندسة جامعة عين شمس", "مصلحة الأحوال المدنية بالعباسية", "كاتدرائية القديس مرقس بالعباسية"],
  "عبده باشا": ["كلية الهندسة جامعة عين شمس (بوابة عبده باشا)", "كلية الفنون التطبيقية جامعة حلوان", "ميدان عبده باشا", "مستشفى الطلبة بالعباسية"],
  "الجيش": ["ميدان الجيش بالظاهر", "شارع العباسية", "كنيسة العذراء مريم بالظاهر التراثية", "مستشفى باب الشعرية الجامعي (سيد جلال)"],
  "باب الشعرية": ["ميدان باب الشعرية التاريخي وتمثال محمد عبد الوهاب", "سوق باب الشعرية للأدوات والمصنوعات الجلدية", "مستشفى سيد جلال الجامعي", "شارع بورسعيد وجامع زغلول"],
  "ماسبيرو": ["مبنى الإذاعة والتليفزيون (ماسبيرو)", "مقر وزارة الخارجية المصرية على النيل", "أبراج ماسبيرو السكنية والاستثمارية الجديدة", "كورنيش النيل بالقاهرة", "كوبري 15 مايو"],
  "صفاء حجازي": ["حي الزمالك الراقي وسفارات الدول", "ساقية عبد المنعم الصاوي الثقافية", "شارع 26 يوليو بالزمالك ومطاعمه العالمية", "كلية التربية الموسيقية والتربية النوعية", "سفارة هولندا وسفارة ألمانيا"],
  "الكيت كات": ["ميدان الكيت كات الشهير", "كورنيش النيل بإمبابة والمراكب النيلية", "مسجد خالد بن الوليد بالكيت كات", "معهد الكبد القومي بإمبابة", "شارع السودان التجاري"],

  // الخط الثالث - Branch A
  "السودان": ["محكمة شمال الجيزة الابتدائية", "شارع السودان بحي الدقي والعجوزة", "مستشفى إمبابة العام", "محيط حي ميت عقبة"],
  "إمبابة": ["قلب حي إمبابة الشعبي العريق", "حديقة سفاري بارك بإمبابة (أكبر حدائق الجيزة)", "شارع طلعت حرب إمبابة", "مستشفى حميات إمبابة", "سوق إمبابة المركزي"],
  "البوهي": ["شارع البوهي التجاري المزدحم", "ميدان الجامع بإمبابة", "مجمع المدارس الحكومية والتجريبية بالبوهي", "مستشفى الصدر بإمبابة"],
  "القومية العربية": ["شارع القومية العربية التجاري", "سوق القومية العربية للخضار والمأكولات", "منطقة بشتيل الجديدة ومجمع المواقف", "شارع السبعين"],
  "الطريق الدائري": ["تقاطع الطريق الدائري مع الوراق ومحور 26 يوليو", "موقف ميكروباصات الطريق الدائري والمريوطية", "محور روض الفرج السريع", "منطقة الوراق السكنية"],
  "محور روض الفرج": ["كوبري تحيا مصر الملجم (أعرض كوبري ملجم في العالم)", "محور روض الفرج السريع", "ممشى أهل مصر بالوراق وشمال القاهرة", "كورنيش النيل شمال القاهرة وجزيرة الوراق"],

  // الخط الثالث - Branch B
  "التوفيقية": ["معهد بحوث البترول بالمهندسين", "شارع أحمد عرابي الشهير بالمهندسين", "نادي التوفيقية للتنس", "ميدان سفنكس ومحلات الإلكترونيات والكمبيوتر"],
  "وادي النيل": ["شارع وادي النيل بالمهندسين", "مستشفى ابن سينا التخصصي", "شارع جامعة الدول العربية ومطاعمه", "شارع جزيرة العرب للتسوق"],
  "جامعة الدول العربية": ["شارع جامعة الدول العربية الحيوي", "ميدان ومسجد مصطفى محمود", "شارع البطل أحمد عبد العزيز", "مطاعم وكافيهات وتوكيلات المهندسين العالمية"],
  "بولاق الدكرور": ["مستشفى بولاق الدكرور العام", "شارع التحرير باتجاه صفط اللبن وكوبري ثروت", "كلية التربية للطفولة المبكرة بجامعة القاهرة", "سوق بولاق الدكرور التجاري"],
};

const DEFAULT_METRO_STATIONS = [
  ...LINE1_STATIONS.map((name, idx) => ({ name, line_type: "line1" as LineId, station_order: idx + 1, landmarks: METRO_STATION_LANDMARKS[name] || [], status: "تشغيل فعلي" })),
  ...LINE2_STATIONS.map((name, idx) => ({ name, line_type: "line2" as LineId, station_order: idx + 1, landmarks: METRO_STATION_LANDMARKS[name] || [], status: "تشغيل فعلي" })),
  ...LINE3_TRUNK.map((name, idx) => ({ name, line_type: "line3" as LineId, station_order: idx + 1, landmarks: METRO_STATION_LANDMARKS[name] || [], status: "تشغيل فعلي" })),
  ...LINE3_BRANCH_A.slice(1).map((name, idx) => ({ name, line_type: "line3_branch_a" as LineId, station_order: idx + 1, landmarks: METRO_STATION_LANDMARKS[name] || [], status: "تشغيل فعلي" })),
  ...LINE3_BRANCH_B.slice(1).map((name, idx) => ({ name, line_type: "line3_branch_b" as LineId, station_order: idx + 1, landmarks: METRO_STATION_LANDMARKS[name] || [], status: "تشغيل فعلي" })),
];

const DEFAULT_METRO_PRICES = [
  { tier_name: "من 1 إلى 9 محطات", max_stations: 9, price: 10 },
  { tier_name: "من 10 إلى 16 محطة", max_stations: 16, price: 12 },
  { tier_name: "من 17 إلى 23 محطة", max_stations: 23, price: 15 },
  { tier_name: "أكثر من 23 محطة", max_stations: 999, price: 20 },
];

/* Coordinates of Cairo Metro Stations for GPS location helper */
const METRO_STATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // الخط الأول
  "حلوان": { lat: 29.8493, lng: 31.3342 },
  "عين حلوان": { lat: 29.8622, lng: 31.3275 },
  "جامعة حلوان": { lat: 29.8705, lng: 31.3204 },
  "وادي حوف": { lat: 29.8804, lng: 31.3129 },
  "حدائق حلوان": { lat: 29.8967, lng: 31.3032 },
  "المعصرة": { lat: 29.9073, lng: 31.2988 },
  "طرة الأسمنت": { lat: 29.9261, lng: 31.2872 },
  "كوتسيكا": { lat: 29.9366, lng: 31.2818 },
  "طرة البلد": { lat: 29.9472, lng: 31.2765 },
  "ثكنات المعادي": { lat: 29.9535, lng: 31.2644 },
  "المعادي": { lat: 29.9582, lng: 31.2584 },
  "حدائق المعادي": { lat: 29.9708, lng: 31.2505 },
  "دار السلام": { lat: 29.9822, lng: 31.2427 },
  "الزهراء": { lat: 29.9959, lng: 31.2325 },
  "مار جرجس": { lat: 30.0064, lng: 31.2301 },
  "الملك الصالح": { lat: 30.0175, lng: 31.2312 },
  "السيدة زينب": { lat: 30.0294, lng: 31.2361 },
  "سعد زغلول": { lat: 30.0366, lng: 31.2384 },
  "أنور السادات": { lat: 30.0444, lng: 31.2357 },
  "جمال عبد الناصر": { lat: 30.0531, lng: 31.2396 },
  "أحمد عرابي": { lat: 30.0573, lng: 31.2429 },
  "الشهداء": { lat: 30.0614, lng: 31.2464 },
  "غمرة": { lat: 30.0689, lng: 31.2648 },
  "الدمرداش": { lat: 30.0768, lng: 31.2773 },
  "منشية الصدر": { lat: 30.0825, lng: 31.2861 },
  "كوبري القبة": { lat: 30.0874, lng: 31.2936 },
  "حمامات القبة": { lat: 30.0932, lng: 31.3005 },
  "سراي القبة": { lat: 30.0993, lng: 31.3061 },
  "حدائق الزيتون": { lat: 30.1065, lng: 31.3117 },
  "حلمية الزيتون": { lat: 30.1143, lng: 31.3168 },
  "المطرية": { lat: 30.1218, lng: 31.3175 },
  "عين شمس": { lat: 30.1311, lng: 31.3202 },
  "عزبة النخل": { lat: 30.1402, lng: 31.3256 },
  "المرج": { lat: 30.1524, lng: 31.3348 },
  "المرج الجديدة": { lat: 30.1643, lng: 31.3364 },

  // الخط الثاني
  "شبرا الخيمة": { lat: 30.1224, lng: 31.2444 },
  "كلية الزراعة": { lat: 30.1139, lng: 31.2449 },
  "المظلات": { lat: 30.1039, lng: 31.2452 },
  "الخلفاوي": { lat: 30.0949, lng: 31.2451 },
  "سانت تريزا": { lat: 30.0878, lng: 31.2452 },
  "روض الفرج": { lat: 30.0805, lng: 31.2456 },
  "مسرة": { lat: 30.0711, lng: 31.2459 },
  "العتبة": { lat: 30.0526, lng: 31.2472 },
  "محمد نجيب": { lat: 30.0454, lng: 31.2439 },
  "الأوبرا": { lat: 30.0421, lng: 31.2246 },
  "الدقي": { lat: 30.0384, lng: 31.2124 },
  "البحوث": { lat: 30.0357, lng: 31.2003 },
  "جامعة القاهرة": { lat: 30.0261, lng: 31.2009 },
  "فيصل": { lat: 30.0172, lng: 31.2043 },
  "الجيزة": { lat: 30.0105, lng: 31.2069 },
  "أم المصريين": { lat: 30.0022, lng: 31.2078 },
  "ساقية مكي": { lat: 29.9926, lng: 31.2084 },
  "المنيب": { lat: 29.9812, lng: 31.2121 },

  // الخط الثالث
  "عدلي منصور": { lat: 30.1472, lng: 31.4012 },
  "الهايكستب": { lat: 30.1438, lng: 31.3854 },
  "عمر بن الخطاب": { lat: 30.1402, lng: 31.3712 },
  "قباء": { lat: 30.1362, lng: 31.3598 },
  "هشام بركات": { lat: 30.1311, lng: 31.3524 },
  "النزهة": { lat: 30.1255, lng: 31.3478 },
  "نادي الشمس": { lat: 30.1212, lng: 31.3444 },
  "ألف مسكن": { lat: 30.1171, lng: 31.3412 },
  "ميدان هليوبوليس": { lat: 30.1082, lng: 31.3359 },
  "هارون": { lat: 30.1008, lng: 31.3324 },
  "الأهرام": { lat: 30.0914, lng: 31.3255 },
  "كلية البنات": { lat: 30.0845, lng: 31.3288 },
  "استاد القاهرة": { lat: 30.0732, lng: 31.3164 },
  "المعرض": { lat: 30.0712, lng: 31.3032 },
  "العباسية": { lat: 30.0655, lng: 31.2854 },
  "عبده باشا": { lat: 30.0612, lng: 31.2742 },
  "الجيش": { lat: 30.0578, lng: 31.2643 },
  "باب الشعرية": { lat: 30.0543, lng: 31.2562 },
  "ماسبيرو": { lat: 30.0554, lng: 31.2325 },
  "صفاء حجازي": { lat: 30.0618, lng: 31.2224 },
  "الكيت كات": { lat: 30.0634, lng: 31.2132 },
  "السودان": { lat: 30.0692, lng: 31.2052 },
  "إمبابة": { lat: 30.0745, lng: 31.2064 },
  "البوهي": { lat: 30.0812, lng: 31.2081 },
  "القومية العربية": { lat: 30.0884, lng: 31.2095 },
  "الطريق الدائري": { lat: 30.0965, lng: 31.2082 },
  "محور روض الفرج": { lat: 30.1034, lng: 31.2045 },
  "التوفيقية": { lat: 30.0621, lng: 31.2038 },
  "وادي النيل": { lat: 30.0567, lng: 31.2024 },
  "جامعة الدول العربية": { lat: 30.0489, lng: 31.2014 },
  "بولاق الدكرور": { lat: 30.0381, lng: 31.1989 }
};

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ============================================================
   Graph Representation and Dijkstra Algorithm
   ============================================================ */
interface Edge {
  toStation: string;
  toLine: LineId;
  weight: number; // 1 for next station, 5 for line transfer
}

interface DijkstraState {
  station: string;
  line: LineId;
  dist: number;
  path: Array<{ station: string; line: LineId }>;
}

interface RouteResult {
  found: boolean;
  path: string[];
  lines: LineId[];
  stationCount: number;
  price: number;
  needsTransfer: boolean;
  transfers: Array<{ station: string; fromLine: LineId; toLine: LineId }>;
  description: string;
  detailedPath: Array<{ station: string; line: LineId; isTransferPoint: boolean; targetLine?: LineId }>;
  estimatedTime: number;
}

function findRoute(
  from: string,
  to: string,
  adjacencyGraph: Map<string, Edge[]>,
  stationLinesMap: Map<string, Set<LineId>>,
  getTicketPrice: (count: number) => number
): RouteResult {
  if (from === to) {
    return {
      found: true,
      path: [from],
      lines: [],
      stationCount: 1,
      price: getTicketPrice(1),
      needsTransfer: false,
      transfers: [],
      description: "أنت في محطة الوصول بالفعل!",
      detailedPath: [{ station: from, line: Array.from(stationLinesMap.get(from) || [])[0] || "line1", isTransferPoint: false }],
      estimatedTime: 0,
    };
  }

  const startLines = Array.from(stationLinesMap.get(from) || []);
  const endLines = Array.from(stationLinesMap.get(to) || []);

  if (startLines.length === 0 || endLines.length === 0) {
    return {
      found: false,
      path: [],
      lines: [],
      stationCount: 0,
      price: 0,
      needsTransfer: false,
      transfers: [],
      description: "المحطة المحددة غير موجودة في قاعدة البيانات.",
      detailedPath: [],
      estimatedTime: 0,
    };
  }

  // Priority Queue initialization
  const queue: DijkstraState[] = [];
  const minDistance = new Map<string, number>();

  startLines.forEach(line => {
    const key = `${from}|${line}`;
    queue.push({
      station: from,
      line,
      dist: 0,
      path: [{ station: from, line }],
    });
    minDistance.set(key, 0);
  });

  let bestState: DijkstraState | null = null;

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const curr = queue.shift()!;
    const currKey = `${curr.station}|${curr.line}`;

    if ((minDistance.get(currKey) ?? Infinity) < curr.dist) {
      continue;
    }

    if (curr.station === to) {
      if (!bestState || curr.dist < bestState.dist) {
        bestState = curr;
      }
    }

    if (bestState && curr.dist >= bestState.dist) {
      break;
    }

    const edges = adjacencyGraph.get(currKey) || [];
    for (const edge of edges) {
      const nextKey = `${edge.toStation}|${edge.toLine}`;
      const nextDist = curr.dist + edge.weight;

      if (nextDist < (minDistance.get(nextKey) ?? Infinity)) {
        minDistance.set(nextKey, nextDist);
        queue.push({
          station: edge.toStation,
          line: edge.toLine,
          dist: nextDist,
          path: [...curr.path, { station: edge.toStation, line: edge.toLine }],
        });
      }
    }
  }

  if (!bestState) {
    return {
      found: false,
      path: [],
      lines: [],
      stationCount: 0,
      price: 0,
      needsTransfer: false,
      transfers: [],
      description: "لا يمكن إيجاد مسار بين هاتين المحطتين بالمترو حالياً.",
      detailedPath: [],
      estimatedTime: 0,
    };
  }

  // Parse Dijkstra path to retrieve transitions
  const rawPath = bestState.path;
  const cleanPath: string[] = [];
  const linesUsed: LineId[] = [];
  const transfers: Array<{ station: string; fromLine: LineId; toLine: LineId }> = [];
  const detailedPath: Array<{ station: string; line: LineId; isTransferPoint: boolean; targetLine?: LineId }> = [];

  let currentLine = rawPath[0].line;
  linesUsed.push(currentLine);

  for (let i = 0; i < rawPath.length; i++) {
    const step = rawPath[i];
    const isLineChange = i > 0 && step.station === rawPath[i - 1].station && step.line !== rawPath[i - 1].line;

    if (isLineChange) {
      const fromLine = rawPath[i - 1].line;
      const toLine = step.line;
      transfers.push({
        station: step.station,
        fromLine,
        toLine,
      });
      // Mark the last added station in detailedPath as a transfer station
      if (detailedPath.length > 0) {
        detailedPath[detailedPath.length - 1].isTransferPoint = true;
        detailedPath[detailedPath.length - 1].targetLine = toLine;
      }
      currentLine = toLine;
      if (!linesUsed.includes(currentLine)) {
        linesUsed.push(currentLine);
      }
    } else {
      if (cleanPath.length === 0 || cleanPath[cleanPath.length - 1] !== step.station) {
        cleanPath.push(step.station);
      }
      detailedPath.push({
        station: step.station,
        line: step.line,
        isTransferPoint: false,
      });
    }
  }

  const stationCount = cleanPath.length;
  const price = getTicketPrice(stationCount);
  const needsTransfer = transfers.length > 0;
  const estimatedTime = (stationCount - 1) * 2;

  // Build Arabic Description
  let description = "";
  if (!needsTransfer) {
    description = `اسلك ${LINE_NAMES[rawPath[0].line]} من محطة "${from}" حتى محطة "${to}" مباشرة بدون أي تبديل. تستغرق الرحلة حوالي ${estimatedTime} دقيقة.`;
  } else {
    description = `اركـب ${LINE_NAMES[rawPath[0].line]} من محطة "${from}"، `;
    transfers.forEach((t, idx) => {
      description += `ثم قم بالانتقال والتحويل في محطة "${t.station}" إلى ${LINE_NAMES[t.toLine]}`;
      if (idx < transfers.length - 1) description += "، ";
    });
    description += `، وواصل رحلتك حتى محطة "${to}". تستغرق الرحلة حوالي ${estimatedTime} دقيقة (قد تزيد مع وقت التبديل بين الخطوط).`;
  }

  return {
    found: true,
    path: cleanPath,
    lines: linesUsed,
    stationCount,
    price,
    needsTransfer,
    transfers,
    description,
    detailedPath,
    estimatedTime,
  };
}

/* ============================================================
   UI Helpers
   ============================================================ */
function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

export default function MetroPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [ticketPrices, setTicketPrices] = useState<any[]>([]);
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);

  // Active Trip States
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Metro Explorer State
  const [explorerLine, setExplorerLine] = useState<LineId>("line1");
  const [line3ActiveBranch, setLine3ActiveBranch] = useState<"trunk" | "branchA" | "branchB">("trunk");

  // Auth and Report Problem State
  const { user } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<"general" | "route" | "station">("general");
  const [reportSelectedStation, setReportSelectedStation] = useState<string>("");
  const [reportStationSearchQuery, setReportStationSearchQuery] = useState<string>("");
  const [showReportStationList, setShowReportStationList] = useState<boolean>(false);
  const [reportProblemType, setReportProblemType] = useState<string>("route_error");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string>("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Load stations & prices dynamically
  useEffect(() => {
    document.title = "ماب القاهرة - مترو الأنفاق";
    const loadData = async () => {
      let loadedStations = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("metro_stations").select("*");
          if (!error && data && data.length > 0) {
            loadedStations = data.map((st: any) => ({
              ...st,
              landmarks: (st.landmarks && Array.isArray(st.landmarks) && st.landmarks.length > 0)
                ? st.landmarks
                : (METRO_STATION_LANDMARKS[st.name] || [])
            }));
          } else {
            loadedStations = getLocalStations();
          }
        } catch {
          loadedStations = getLocalStations();
        }
      } else {
        loadedStations = getLocalStations();
      }
      setStations(loadedStations);

      let loadedPrices = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("metro_prices").select("*");
          if (!error && data && data.length > 0) {
            loadedPrices = data;
          } else {
            loadedPrices = getLocalPrices();
          }
        } catch {
          loadedPrices = getLocalPrices();
        }
      } else {
        loadedPrices = getLocalPrices();
      }
      setTicketPrices(loadedPrices);
    };

    loadData();
  }, []);

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_METRO_STATIONS;
    const local = localStorage.getItem("local_metro_stations");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            let updated = { ...item };
            updated.status = item.status || "تشغيل فعلي";
            if (!updated.landmarks || !Array.isArray(updated.landmarks) || updated.landmarks.length === 0) {
              updated.landmarks = METRO_STATION_LANDMARKS[updated.name] || [];
            }
            return updated;
          });
        }
        return parsed;
      } catch {
        return DEFAULT_METRO_STATIONS;
      }
    }
    return DEFAULT_METRO_STATIONS;
  };

  const getLocalPrices = () => {
    if (typeof window === "undefined") return DEFAULT_METRO_PRICES;
    const local = localStorage.getItem("local_metro_prices");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_METRO_PRICES;
      }
    }
    return DEFAULT_METRO_PRICES;
  };

  // Build Adjacency Graph and Stations Map dynamically from stations state
  const { adjacencyGraph, stationLinesMap, allStations } = useMemo(() => {
    const adj = new Map<string, Edge[]>();
    const stationLines = new Map<string, Set<LineId>>();

    const addEdge = (s1: string, l1: LineId, s2: string, l2: LineId, weight: number) => {
      const key = `${s1}|${l1}`;
      if (!adj.has(key)) adj.set(key, []);
      adj.get(key)!.push({ toStation: s2, toLine: l2, weight });
    };

    const addLineEdges = (lineStations: any[], line: LineId) => {
      for (let i = 0; i < lineStations.length - 1; i++) {
        addEdge(lineStations[i].name, line, lineStations[i + 1].name, line, 1);
        addEdge(lineStations[i + 1].name, line, lineStations[i].name, line, 1);
      }
    };

    const l1Stats = stations.filter(s => s.line_type === "line1").sort((a, b) => a.station_order - b.station_order);
    const l2Stats = stations.filter(s => s.line_type === "line2").sort((a, b) => a.station_order - b.station_order);
    const l3Trunk = stations.filter(s => s.line_type === "line3").sort((a, b) => a.station_order - b.station_order);
    const l3BranchA = stations.filter(s => s.line_type === "line3_branch_a").sort((a, b) => a.station_order - b.station_order);
    const l3BranchB = stations.filter(s => s.line_type === "line3_branch_b").sort((a, b) => a.station_order - b.station_order);
    const l4Stats = stations.filter(s => s.line_type === "line4").sort((a, b) => a.station_order - b.station_order);
    const l5Stats = stations.filter(s => s.line_type === "line5").sort((a, b) => a.station_order - b.station_order);
    const l6Stats = stations.filter(s => s.line_type === "line6").sort((a, b) => a.station_order - b.station_order);

    addLineEdges(l1Stats, "line1");
    addLineEdges(l2Stats, "line2");
    addLineEdges(l3Trunk, "line3");

    if (l3BranchA.length > 0) {
      addEdge("الكيت كات", "line3", l3BranchA[0].name, "line3", 1);
      addEdge(l3BranchA[0].name, "line3", "الكيت كات", "line3", 1);
      addLineEdges(l3BranchA, "line3");
    }
    if (l3BranchB.length > 0) {
      addEdge("الكيت كات", "line3", l3BranchB[0].name, "line3", 1);
      addEdge(l3BranchB[0].name, "line3", "الكيت كات", "line3", 1);
      addLineEdges(l3BranchB, "line3");
    }

    addLineEdges(l4Stats, "line4");
    addLineEdges(l5Stats, "line5");
    addLineEdges(l6Stats, "line6");

    stations.forEach(s => {
      const lt = s.line_type;
      let resolvedLine: LineId = "line3";
      if (lt !== "line3_branch_a" && lt !== "line3_branch_b") {
        resolvedLine = lt as LineId;
      }
      if (!stationLines.has(s.name)) {
        stationLines.set(s.name, new Set());
      }
      stationLines.get(s.name)!.add(resolvedLine);
    });

    if (stationLines.has("الكيت كات")) {
      stationLines.get("الكيت كات")!.add("line3");
    }

    stationLines.forEach((lines, name) => {
      if (lines.size > 1) {
        const arr = Array.from(lines);
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            if (i !== j) {
              addEdge(name, arr[i], name, arr[j], 5);
            }
          }
        }
      }
    });

    const statsMap = new Map<string, Set<LineId>>();
    stations.forEach(s => {
      const lt = s.line_type;
      let l: LineId = "line3";
      if (lt !== "line3_branch_a" && lt !== "line3_branch_b") {
        l = lt as LineId;
      }
      if (!statsMap.has(s.name)) statsMap.set(s.name, new Set());
      statsMap.get(s.name)!.add(l);
    });

    const allStats: StationInfo[] = [];
    statsMap.forEach((lines, name) => {
      const stationObj = stations.find(s => s.name === name);
      const stationLandmarks = (stationObj && stationObj.landmarks && Array.isArray(stationObj.landmarks) && stationObj.landmarks.length > 0)
        ? stationObj.landmarks
        : (METRO_STATION_LANDMARKS[name] || []);
      allStats.push({
        name,
        lines: Array.from(lines) as LineId[],
        isTransfer: lines.size > 1,
        landmarks: stationLandmarks,
      });
    });
    allStats.sort((a, b) => a.name.localeCompare(b.name, "ar"));

    return { adjacencyGraph: adj, stationLinesMap: stationLines, allStations: allStats };
  }, [stations]);

  const getTicketPrice = (stationCount: number): number => {
    if (ticketPrices.length === 0) {
      if (stationCount <= 9) return 10;
      if (stationCount <= 16) return 12;
      if (stationCount <= 23) return 15;
      return 20;
    }
    const sorted = [...ticketPrices].sort((a, b) => a.max_stations - b.max_stations);
    for (const tier of sorted) {
      if (stationCount <= tier.max_stations) {
        return tier.price;
      }
    }
    return sorted[sorted.length - 1]?.price || 20;
  };

  const filteredFrom = useMemo(() => {
    const q = normalizeArabic(fromQuery.trim());
    if (!q) return [];
    return allStations.filter(s => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const landmarkMatch = (s.landmarks || []).some(l => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [fromQuery, allStations]);

  const filteredTo = useMemo(() => {
    const q = normalizeArabic(toQuery.trim());
    if (!q) return [];
    return allStations.filter(s => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const landmarkMatch = (s.landmarks || []).some(l => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [toQuery, allStations]);

  const filteredReportStations = useMemo(() => {
    const q = normalizeArabic(reportStationSearchQuery.trim());
    if (!q) return allStations;
    return allStations.filter(s => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const landmarkMatch = (s.landmarks || []).some(l => normalizeArabic(l).includes(q));
      return nameMatch || landmarkMatch;
    });
  }, [reportStationSearchQuery, allStations]);

  const handleFind = () => {
    if (!selectedFrom || !selectedTo) return;
    const route = findRoute(selectedFrom, selectedTo, adjacencyGraph, stationLinesMap, getTicketPrice);
    setResult(route);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const swapStations = () => {
    const tempF = selectedFrom;
    const tempT = selectedTo;
    setSelectedFrom(tempT);
    setSelectedTo(tempF);
    setFromQuery(tempT || "");
    setToQuery(tempF || "");
    setResult(null);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const [locatingNearest, setLocatingNearest] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<string | null>(null);
  const [copiedRoute, setCopiedRoute] = useState(false);

  const findNearestStation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك");
      return;
    }
    setLocatingNearest(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        let closestStation: string | null = null;
        let minDistance = Infinity;

        for (const [name, coords] of Object.entries(METRO_STATION_COORDINATES)) {
          const dist = getDistanceInKm(userLat, userLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestStation = name;
          }
        }

        if (closestStation) {
          setSelectedFrom(closestStation);
          setFromQuery(closestStation);
          setShowFromList(false);
          setNearestDistance(minDistance < 1 ? `${Math.round(minDistance * 1000)} متر` : `${minDistance.toFixed(1)} كم`);
          setResult(null);
        }
        setLocatingNearest(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("تعذر تحديد موقعك الحالي. يرجى التأكد من تشغيل الـ GPS والسماح للموقع.");
        setLocatingNearest(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleShareRoute = async () => {
    if (!result || !selectedFrom || !selectedTo) return;

    const transfersText = result.needsTransfer
      ? result.transfers.map(t => `\n- تحويل في محطة [${t.station}] إلى [${LINE_NAMES[t.toLine] || t.toLine}]`).join("")
      : "\n- رحلة مباشرة بدون تبديل";

    const shareText = `🚇 مسار رحلة المترو عبر تطبيق ماب القاهرة:
من: ${selectedFrom}
إلى: ${selectedTo}
• عدد المحطات: ${result.stationCount} محطة
• سعر التذكرة: ${result.price} ج.م
• الوقت المقدر: ${result.estimatedTime} دقيقة${transfersText}
• الخطوات: ${result.description}

رابط الرحلة: https://cairomap.net/metro`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `رحلة مترو من ${selectedFrom} إلى ${selectedTo}`,
          text: shareText,
          url: "https://cairomap.net/metro",
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedRoute(true);
      setTimeout(() => setCopiedRoute(false), 3000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const whatsappShareUrl = result && selectedFrom && selectedTo
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `🚇 رحلة مترو من ${selectedFrom} إلى ${selectedTo} (${result.stationCount} محطة - ${result.price} ج.م - ${result.estimatedTime} دقيقة)\nتفاصيل: https://cairomap.net/metro`
    )}`
    : "#";

  const handleReportImageSelect = (file: File | null) => {
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    if (!file) {
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReportError("حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setReportError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportError("");
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  };

  const handleOpenReportModal = async (stationName: string | null = null, fromRoute: boolean = false) => {
    setReportError("");
    setReportSuccess(false);
    setReportDetails("");
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    setReportImageFile(null);
    setReportImagePreview(null);
    setIsDraggingImage(false);

    if (stationName) {
      setReportTargetScope("station");
      setReportSelectedStation(stationName);
      setReportStationSearchQuery(stationName);
      setReportProblemType("station_info");
    } else if (fromRoute && result && selectedFrom && selectedTo) {
      setReportTargetScope("route");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("route_error");
    } else {
      setReportTargetScope("general");
      setReportSelectedStation("");
      setReportStationSearchQuery("");
      setReportProblemType("route_error");
    }

    setReportModalOpen(true);

    if (user) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (e) {
        console.error("Error checking feedback limit:", e);
      } finally {
        setLimitChecking(false);
      }
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (reportTargetScope === "station" && !reportSelectedStation) {
      setReportError("يرجى اختيار وتحديد المحطة المراد الإبلاغ عنها أولاً.");
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أو الخطأ.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split('.').pop() || 'jpg';
        const fileName = `metro_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const problemTypeLabels: Record<string, string> = {
        route_error: "خطأ في حساب مسار الرحلة أو زمن الوصول",
        price: "سعر التذكرة غير صحيح أو عدد المحطات غير دقيق",
        transfer: "خطأ في محطة التبديل أو تعليمات التحويل بين الخطوط",
        station_info: "اسم محطة غير صحيح أو معالم غير دقيقة",
        closed_station: "محطة مغلقة أو تحت الإنشاء أو تم تغيير حالتها",
        app_bug: "مشكلة تقنية أو زر لا يعمل في الصفحة",
        other: "ملاحظة أو مشكلة أخرى",
      };

      const typeLabel = problemTypeLabels[reportProblemType] || "مشكلة في المترو";

      let scopeInfo = "";
      if (reportTargetScope === "route" && selectedFrom && selectedTo) {
        scopeInfo = `📍 المسار المعني: من ${selectedFrom} إلى ${selectedTo}
💰 السعر المحسوب: ${result?.price || "غير محدد"} ج.م
⏱️ الوقت المقدر: ${result?.estimatedTime || "غير محدد"} دقيقة
🚉 عدد المحطات: ${result?.stationCount || "غير محدد"} محطة`;
      } else if (reportTargetScope === "station" && reportSelectedStation) {
        scopeInfo = `🚉 المحطة المعنية: ${reportSelectedStation}`;
      }

      const contentText = `بلاغ عن مشكلة في صفحة مترو الأنفاق:
${scopeInfo ? scopeInfo + "\n\n" : ""}⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle = reportTargetScope === "route" && selectedFrom && selectedTo
        ? `مشكلة مسار: من ${selectedFrom} إلى ${selectedTo}`
        : reportTargetScope === "station" && reportSelectedStation
          ? `مشكلة محطة: ${reportSelectedStation}`
          : `مشكلة في المترو (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "مترو الأنفاق",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🚇",
            message: `شكراً لمساعدتنا في تحسين وتدقيق خدمة مترو الأنفاق. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        if (reportImagePreview) {
          URL.revokeObjectURL(reportImagePreview);
        }
        setReportImageFile(null);
        setReportImagePreview(null);
      }, 2200);
    } catch (err: any) {
      console.error("Error submitting metro report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  return (
    <>
      <title>ماب القاهرة - مترو الأنفاق </title>
      <div style={{ minHeight: "100vh", paddingBottom: "40px", backgroundColor: "var(--bgPrimary)" }}>
        {/* Header Banner - Redesigned with a beautiful cover image instead of emoji */}
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
              <img src="/images/icons2d/metro.svg" alt="" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginLeft: "5px" }} />
              مترو القاهرة
            </h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
              احسب رحلتك في ثوانٍ، تصفح المسارات، واعرف قيمة تذكرتك.
            </p>

            {/* Lines Indicator Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                color: "#ff5a01",
                borderRadius: "10px",
                padding: "4px 14px",
                fontSize: "0.78rem",
                fontWeight: "700",
              }}>اعرف وجهتك</span>
              <span style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                color: "var(--textPrimary)",
                borderRadius: "10px",
                padding: "4px 14px",
                fontSize: "0.78rem",
                fontWeight: "700",
              }}>احسب تذكرتك</span>
              <span style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                color: "#0051ffff",
                borderRadius: "10px",
                padding: "4px 14px",
                fontSize: "0.78rem",
                fontWeight: "700",
              }}>وقت وصولك</span>
              <button
                type="button"
                onClick={() => handleOpenReportModal(null)}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  borderRadius: "10px",
                  padding: "4px 14px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-cairo)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                }}
                title="الإبلاغ عن أي خطأ أو مشكلة في صفحة المترو"
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.8rem" }}></i>
                الإبلاغ عن مشكلة
              </button>
            </div>

          </div>
        </div>

        {/* Main Container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

          {/* Search Panel Card - Styled matching profile sectionCard */}
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "var(--cardGlassRadius)",
            padding: "20px",
            marginTop: "24px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
            zIndex: 20,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>

              {/* FROM STATION INPUT */}
              <div style={{ position: "relative", zIndex: showFromList ? 10 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0, fontFamily: "var(--font-heading)" }}>
                    <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "green" }}></i> من محطة
                    {nearestDistance && selectedFrom && (
                      <span style={{ fontSize: "0.74rem", color: "var(--colorSuccess)", fontWeight: "700", marginRight: "8px", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "6px" }}>
                        🎯 أقرب محطة: {nearestDistance}
                      </span>
                    )}
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={findNearestStation}
                      disabled={locatingNearest}
                      style={{
                        background: "rgba(59, 130, 246, 0.08)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        borderRadius: "8px",
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "var(--colorSecondary)",
                        cursor: locatingNearest ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                      title="تحديد أقرب محطة مترو لموقعي الحالي عبر الـ GPS"
                    >
                      <i className={locatingNearest ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-location-crosshairs"}></i>
                      {locatingNearest ? "جاري التحديد..." : "أقرب محطة لي"}
                    </button>
                    <VoiceInputButton onTranscript={(text) => { setFromQuery(text); setSelectedFrom(null); setShowFromList(true); setResult(null); }} />
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className="input-fields"
                    placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: التحرير، برج القاهرة، جامعة حلوان)"
                    value={fromQuery}
                    onChange={e => { setFromQuery(e.target.value); setSelectedFrom(null); setShowFromList(true); setResult(null); }}
                    onFocus={() => setShowFromList(true)}
                    onBlur={() => setTimeout(() => setShowFromList(false), 250)}
                    style={{
                      width: "100%",
                      direction: "rtl",
                      fontFamily: "var(--font-body)",
                      height: "50px",
                    }}
                  />
                  {selectedFrom && (
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الاختيار ✔</span>
                  )}
                </div>
                {showFromList && filteredFrom.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0,
                    background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                    borderRadius: "var(--radius-card)", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  }}>
                    {filteredFrom.map(s => {
                      const q = normalizeArabic(fromQuery.trim());
                      const matchedLandmark = q ? (s.landmarks || []).find(l => normalizeArabic(l).includes(q)) : null;
                      return (
                        <div key={s.name} onMouseDown={() => { setSelectedFrom(s.name); setFromQuery(s.name); setShowFromList(false); }} style={{
                          padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          transition: "background 0.2s", fontFamily: "var(--font-sub)"
                        }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s.name}</span>
                            {matchedLandmark && (
                              <span style={{ fontSize: "0.72rem", color: "var(--colorSecondary)", fontWeight: "bold" }}>
                                📍 قريب من: {matchedLandmark}
                              </span>
                            )}
                          </div>
                          <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                            {s.lines.map(l => (
                              <span key={l} style={{ width: "6px", height: "6px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                            ))}
                          </div>
                          {s.isTransfer && <span style={{ fontSize: "0.72rem", background: "var(--borderGlass)", color: "var(--textSecondary)", padding: "2px 6px", borderRadius: "4px" }}>تبادلية</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SWAP BUTTON - Calm iOS Style */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
                <button onClick={swapStations} style={{
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
                  marginTop: "10px",
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

              {/* TO STATION INPUT */}
              <div style={{ position: "relative", zIndex: showToList ? 10 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", margin: 0, fontFamily: "var(--font-heading)" }}>
                    <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "red" }}></i> إلى محطة
                  </label>
                  <VoiceInputButton onTranscript={(text) => { setToQuery(text); setSelectedTo(null); setShowToList(true); setResult(null); }} />
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className="input-fields"
                    placeholder="ابحث باسم المحطة أو المعلم القريب... (مثال: العباسية، الأوبرا، قصر عابدين)"
                    value={toQuery}
                    onChange={e => { setToQuery(e.target.value); setSelectedTo(null); setShowToList(true); setResult(null); }}
                    onFocus={() => setShowToList(true)}
                    onBlur={() => setTimeout(() => setShowToList(false), 250)}
                    style={{
                      width: "100%",
                      direction: "rtl",
                      fontFamily: "var(--font-body)",
                      height: "50px"
                    }}
                  />
                  {selectedTo && (
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الاختيار ✔</span>
                  )}
                </div>
                {showToList && filteredTo.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0,
                    background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                    borderRadius: "var(--radius-card)", overflow: "hidden", zIndex: 1000, maxHeight: "220px", overflowY: "auto",
                    boxShadow: "var(--shadow-lg)", marginTop: "6px", fontFamily: "var(--font-sub)"
                  }}>
                    {filteredTo.map(s => {
                      const q = normalizeArabic(toQuery.trim());
                      const matchedLandmark = q ? (s.landmarks || []).find(l => normalizeArabic(l).includes(q)) : null;
                      return (
                        <div key={s.name} onMouseDown={() => { setSelectedTo(s.name); setToQuery(s.name); setShowToList(false); }} style={{
                          padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          transition: "background 0.2s",
                        }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s.name}</span>
                            {matchedLandmark && (
                              <span style={{ fontSize: "0.72rem", color: "var(--colorSecondary)", fontWeight: "bold" }}>
                                📍 قريب من: {matchedLandmark}
                              </span>
                            )}
                          </div>
                          <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                            {s.lines.map(l => (
                              <span key={l} style={{ width: "6px", height: "6px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                            ))}
                          </div>
                          {s.isTransfer && <span style={{ fontSize: "0.72rem", background: "var(--borderGlass)", color: "var(--textSecondary)", padding: "2px 6px", borderRadius: "4px" }}>تبادلية</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* SEARCH BUTTON - Calm accent iOS Button */}
            <button
              onClick={handleFind}
              disabled={!selectedFrom || !selectedTo}
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "var(--paddingBtn)",
                borderRadius: "var(--radiusBtn)",
                background: (!selectedFrom || !selectedTo) ? "rgba(255,255,255,0.05)" : "var(--colorSecondary)",
                color: (!selectedFrom || !selectedTo) ? "var(--textMuted)" : "#ffffff",
                fontSize: "0.95rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                cursor: (!selectedFrom || !selectedTo) ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-sub)",
              }}
              onMouseEnter={e => {
                if (selectedFrom && selectedTo) {
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onMouseLeave={e => {
                if (selectedFrom && selectedTo) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              اعرض الطريق
            </button>
          </div>

          {/* Metro Subscription Calculator */}

          {/* <MetroSubscriptionCalculator /> */}

          {/* RESULTS SECTION - Styled matching profile sectionCard */}
          {result && (
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "20px",
              marginTop: "20px",
              boxShadow: "var(--shadow-card)",
              animation: "slide-in-section 0.3s ease",
            }}>
              {!result.found ? (
                <div style={{ textAlign: "center", color: "var(--textSecondary)", padding: "20px 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>😕</div>
                  <h3 style={{ fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>عذراً، تعذر العثور على طريق</h3>
                  <p style={{ fontSize: "0.88rem" }}>{result.description}</p>
                </div>
              ) : (
                <>
                  {/* Result Title */}
                  <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "var(--textPrimary)" }}>
                    <i className="fa-solid fa-signs-post" style={{ marginLeft: "6px", color: "var(--colorSecondary)" }}></i> تفاصيل الرحلة
                  </h2>

                  {/* Grid Summary Cards - Calm design like Device Info List */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                    <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSecondary)" }}>{result.stationCount}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>محطات المرور</div>
                    </div>
                    <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSuccess)" }}>{result.price} ج.م</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>سعر التذكرة</div>
                    </div>
                    <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSecondary)" }}>{result.estimatedTime} د</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>وقت الوصول</div>
                    </div>
                    <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: "800", color: result.needsTransfer ? "var(--accent-warning)" : "var(--colorSuccess)" }}>
                        {result.needsTransfer ? result.transfers.length : "مباشر"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>التبديل</div>
                    </div>
                  </div>

                  {/* Informative Guidance Bubble - Soft colors (Only shown if trip is not active) */}
                  {!isTripActive && (
                    <div style={{
                      background: "rgba(59, 130, 246, 0.04)",
                      border: "1px solid rgba(59, 130, 246, 0.15)",
                      borderRadius: "12px",
                      padding: "16px 18px",
                      marginBottom: "20px",
                      fontFamily: "var(--font-sub)"
                    }}>
                      <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.9rem", color: "var(--textPrimary)", fontWeight: "600", fontFamily: "var(--font-body)" }}>
                        <i className="fa-solid fa-info-circle" style={{ marginLeft: "6px", color: "var(--colorSecondary)" }}></i>{result.description}
                      </p>
                    </div>
                  )}

                  {/* Actions Grid: Start Trip + Report Route Problem */}
                  {!isTripActive && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setIsTripActive(true);
                          setCurrentStepIndex(0);
                        }}
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s ease",
                          fontFamily: "var(--font-sub)"
                        }}
                      >
                        <i className="fa-solid fa-play"></i>
                        ابدأ الرحلة
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReportModal(null, true)}
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "10px 14px",
                          borderRadius: "var(--radiusBtn)",
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#ef4444",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: "var(--font-sub)"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                        title="الإبلاغ عن خطأ في حساب المسار، التبديل، أو سعر التذكرة"
                      >
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        الإبلاغ عن مشكلة بالمسار
                      </button>
                    </div>
                  )}

                  {/* Active Trip Tracker Card */}
                  {isTripActive && (
                    <div style={{
                      background: "var(--bgSecondary)",
                      border: "1px solid var(--borderGlass)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      boxShadow: "var(--shadow-card)",
                      animation: "slide-in-section 0.3s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--colorSecondary)", background: "rgba(59, 130, 246, 0.12)", padding: "4px 10px", borderRadius: "8px" }}>
                          رحلة نشطة حالياً
                        </span>
                        <button
                          onClick={() => {
                            setIsTripActive(false);
                            setCurrentStepIndex(0);
                          }}
                          style={{
                            border: "none",
                            color: "var(--accent-red)",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "var(--font-cairo)",
                            background: "rgba(246, 59, 59, 0.12)", padding: "4px 10px", borderRadius: "8px"
                          }}
                        >
                          <i className="fa-solid fa-trash" style={{ marginLeft: "8px" }}></i>
                          حذف التتبع
                        </button>
                      </div>

                      {/* Progress Indicator */}
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--textSecondary)", fontFamily: "var(--font-sub)" }}>
                        أنت دلوقتي في <span style={{ color: "var(--textPrimary)", fontSize: "1.1rem", fontWeight: "800", fontFamily: "var(--font-sub)" }}>{result.detailedPath[currentStepIndex].station}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "8px", fontFamily: "var(--font-sub)" }}>
                          ({currentStepIndex + 1} من {result.detailedPath.length})
                        </span>
                      </div>
                      {/* Live Remaining Time */}
                      {(() => {
                        const uniqueRemainingStations = Array.from(
                          new Set(result.detailedPath.slice(currentStepIndex).map(s => s.station))
                        );
                        const remainingTime = Math.max(0, (uniqueRemainingStations.length - 1) * 2);
                        return (
                          <div style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "16px", color: "var(--textSecondary)", fontFamily: "var(--font-sub)" }}>
                            ⏱️ الوقت المتبقي للوصول: <span style={{ color: "var(--colorSecondary)", fontSize: "1rem", fontWeight: "800", fontFamily: "var(--font-sub)" }}>{remainingTime} دقيقة</span>
                          </div>
                        );
                      })()}

                      {/* Transfer station instructions banner if current station is transfer */}
                      {result.detailedPath[currentStepIndex].isTransferPoint && (
                        <div style={{
                          background: "rgba(245, 158, 11, 0.06)",
                          border: "1px solid rgba(245, 158, 11, 0.2)",
                          borderRadius: "10px",
                          padding: "14px",
                          marginBottom: "16px",
                          color: "var(--textPrimary)",
                          fontSize: "0.85rem",
                          lineHeight: "1.7",
                          fontFamily: "var(--font-sub)"
                        }}>
                          <div style={{ fontWeight: "800", color: "var(--accent-warning)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>⚠️ تنبيه هام: محطة تحويل وتبديل خط!</span>
                          </div>
                          انزل هنا من القطار وابحث عن <strong>اليافطة الإرشادية</strong> المكتوب عليها{" "}
                          <span style={{ color: LINE_COLORS[result.detailedPath[currentStepIndex].targetLine!] }}>
                            {LINE_NAMES[result.detailedPath[currentStepIndex].targetLine!]}
                          </span>{" "}
                          واتبع الأسهم والتعليمات للتوجه نحو الرصيف الصحيح وركوب قطار الخط الجديد.
                        </div>
                      )}

                      {/* Controls */}
                      {currentStepIndex < result.detailedPath.length - 1 ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => setCurrentStepIndex(prev => prev + 1)}
                          style={{
                            width: "100%",
                            fontSize: "0.95rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          وصلت محطة {result.detailedPath[currentStepIndex + 1].station}
                        </button>
                      ) : (
                        <div style={{
                          textAlign: "center",
                          background: "rgba(16, 185, 129, 0.06)",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "10px",
                          padding: "16px",
                          animation: "pop-in 0.3s ease"
                        }}>
                          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
                          <h4 style={{ color: "var(--colorSuccess)", fontWeight: "800", margin: "0 0 6px" }}>حمدلله على السلامة!</h4>
                          <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", margin: "0 0 12px" }}>لقد وصلت إلى محطة<span style={{ color: "var(--colorSecondary)", fontSize: "1rem", fontWeight: "800" }}> {result.detailedPath[currentStepIndex].station}</span>.</p>
                          <button
                            onClick={() => {
                              setIsTripActive(false);
                              setCurrentStepIndex(0);
                            }}
                            style={{
                              background: "var(--colorSecondary)",
                              color: "#ffffff",
                              padding: "var(--paddingBtn)",
                              border: "none",
                              borderRadius: "var(--radiusBtn)",
                              fontWeight: "700",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              fontFamily: "var(--font-sub)"
                            }}
                          >
                            إنهاء الرحلة
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Path Timeline */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 className="sub-title" style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "12px" }}>
                      <i className="fa-solid fa-diamond-turn-right" style={{ margin: "0 6px" }}></i>
                      محطات المسار
                    </h4>

                    <div style={{
                      maxHeight: "350px", overflowY: "auto", padding: "16px",
                      background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                      borderRadius: "12px"
                    }}>
                      {result.detailedPath.map((node, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === result.detailedPath.length - 1;
                        const isTransfer = node.isTransferPoint;
                        const activeColor = LINE_COLORS[node.line];

                        const isPassed = isTripActive && idx < currentStepIndex;
                        const isCurrent = isTripActive && idx === currentStepIndex;

                        const stationObj = stations.find(s => s.name === node.station);
                        const isUnderConstruction = stationObj?.status === "تحت الإنشاء";

                        return (
                          <div key={idx} style={{ display: "flex", flexDirection: "column" }}>

                            {/* Station Row */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>

                              {/* Dot / Indicator */}
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                                {isPassed ? (
                                  <div style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--colorSuccess)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#ffffff",
                                    fontSize: "0.65rem",
                                    fontWeight: "bold",
                                    zIndex: 1
                                  }}>
                                    ✓
                                  </div>
                                ) : (
                                  <div style={{
                                    width: isFirst || isLast || isTransfer ? "14px" : "8px",
                                    height: isFirst || isLast || isTransfer ? "14px" : "8px",
                                    borderRadius: "50%",
                                    backgroundColor: isUnderConstruction ? "transparent" : (isCurrent
                                      ? (isFirst ? "var(--colorSuccess)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "var(--colorSecondary)")
                                      : (isFirst ? "var(--colorSuccess)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "var(--text-muted)")),
                                    border: isUnderConstruction
                                      ? `2px dashed ${activeColor}`
                                      : `2px solid ${isCurrent
                                        ? "#ffffff"
                                        : (isFirst ? "var(--colorSuccess)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "transparent")}`,
                                    boxShadow: isCurrent ? `0 0 10px ${activeColor}` : "none",
                                    zIndex: 1,
                                  }} />
                                )}
                              </div>

                              {/* Station Name and Badge */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexGrow: 1,
                                opacity: isPassed ? 0.5 : (isUnderConstruction ? 0.75 : 1),
                                transition: "opacity 0.3s ease"
                              }}>
                                <span style={{
                                  fontSize: isFirst || isLast ? "0.95rem" : "0.88rem",
                                  fontWeight: isFirst || isLast || isTransfer || isCurrent ? "700" : "500",
                                  color: isUnderConstruction
                                    ? "#ef4444"
                                    : (isCurrent
                                      ? "var(--textPrimary)"
                                      : (isFirst ? "var(--colorSuccess)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "var(--textPrimary)")),
                                  textDecoration: isPassed ? "line-through" : "none",
                                  fontFamily: "var(--font-sub)",
                                }}>
                                  {node.station}
                                </span>

                                {isUnderConstruction && (
                                  <span style={{
                                    fontSize: "0.68rem",
                                    background: "rgba(239, 68, 68, 0.12)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239, 68, 68, 0.25)",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    fontWeight: "bold"
                                  }}>
                                    تحت الإنشاء 🚧
                                  </span>
                                )}

                                {isFirst && <span style={{ fontSize: "0.68rem", background: "rgba(16,185,129,0.12)", color: "var(--colorSuccess)", padding: "1px 6px", borderRadius: "4px" }}>ركوب</span>}
                                {isLast && <span style={{ fontSize: "0.68rem", background: "rgba(239,68,68,0.12)", color: "var(--accent-red)", padding: "1px 6px", borderRadius: "4px" }}>وصول</span>}

                                <span style={{
                                  fontSize: "0.68rem",
                                  color: "#ffffff",
                                  background: activeColor + "66",
                                  border: `1px solid ${activeColor}88`,
                                  padding: "1px 6px",
                                  borderRadius: "6px",
                                  marginRight: "auto"
                                }}>
                                  {LINE_NAMES[node.line].split(" ")[0] + " " + LINE_NAMES[node.line].split(" ")[1]}
                                </span>
                              </div>
                            </div>

                            {/* Link line to next station or transfer card */}
                            {!isLast && (
                              <div style={{ display: "flex", gap: "12px", minHeight: "18px" }}>
                                <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                                  <div style={{
                                    width: "2px",
                                    backgroundColor: activeColor,
                                    minHeight: "18px",
                                    opacity: 0.7,
                                  }} />
                                </div>

                                <div style={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                                  {isTransfer && (
                                    <div style={{
                                      background: "rgba(245, 158, 11, 0.05)",
                                      border: "1px solid rgba(245, 158, 11, 0.2)",
                                      borderRadius: "10px",
                                      padding: "10px 14px",
                                      margin: "6px 0",
                                      fontSize: "0.8rem",
                                      color: "var(--accent-warning)",
                                      fontWeight: "600",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "4px",
                                      width: "100%",
                                      opacity: isPassed ? 0.6 : 1
                                    }}>
                                      <div style={{ fontWeight: "700" }}>
                                        🔄 محطة تبادلية: الانتقال إلى {LINE_NAMES[node.targetLine!]}
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                                        انزل هنا وابحث عن <strong>اليافطة الإرشادية</strong> للخط الجديد واتبع السهام للتوجه للرصيف الصحيح وركوب قطار الخط الجديد.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prices Legend Footer - Styled matching profile cards details */}
                  <div style={{
                    padding: "12px 16px",
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "12px",
                    fontSize: "0.78rem",
                    color: "var(--textSecondary)",
                    lineHeight: "1.5",
                    marginTop: "16px"
                  }}>
                    <i className="fa-regular fa-lightbulb" style={{ color: "var(--accent-warning)", marginLeft: "5px" }}></i>
                    <strong>تسعير التذاكر المعتمد:</strong> <br />
                    البيانات مبنية علي الاسعار الرسمية لأخر تحديث
                    {ticketPrices.length > 0 ? (
                      ticketPrices.map((tier, tIdx) => {
                        const color = tIdx === 0 || tIdx === 1 ? "var(--colorSuccess)" : (tIdx === 2 ? "var(--accent-warning)" : "var(--accent-danger)");
                        return (
                          <div key={tIdx} style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", marginTop: "4px", textAlign: "right", direction: "rtl" }}>
                            • <strong style={{ color }}>{tier.tier_name}:</strong> {tier.price} جنيهًا.
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", marginTop: "8px", textAlign: "right", direction: "rtl" }}>
                          • <strong style={{ color: "var(--colorSuccess)" }}>المسافة من 1-9 محطات:</strong> 10 جنيهات.
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
                          • <strong style={{ color: "var(--colorSuccess)" }}>المسافة من 10-19 محطة:</strong> 12 جنيهات.
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
                          • <strong style={{ color: "var(--accent-warning)" }}>المسافة من 20-29 محطة:</strong> 15 جنيهًا.
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
                          • <strong style={{ color: "var(--accent-danger)" }}>المسافة 30 محطة فأكثر:</strong> 20 جنيهًا.
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* METRO LINES EXPLORER */}
          <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "32px" }}>
            <h2 style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "var(--textPrimary)",
              marginBottom: "6px",
              textAlign: "center"
            }}>🗺️ مستعرض خطوط المترو الكاملة</h2>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.9rem", textAlign: "center", marginBottom: "20px", fontFamily: "var(--font-sub)" }}>
              اضغط على الخط لاستعراض كافة محطاته المسجلة.
            </p>

            {/* Explorer Tab Pills - Redesigned to match Verified security cards in profile */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {(["line1", "line2", "line3", "line4", "line5", "line6"] as LineId[]).map(lineId => {
                const active = explorerLine === lineId;
                const color = LINE_COLORS[lineId];
                const lineStatsCount = stations.filter(s => {
                  if (lineId === "line3") {
                    return s.line_type === "line3" || s.line_type === "line3_branch_a" || s.line_type === "line3_branch_b";
                  }
                  return s.line_type === lineId;
                }).length;

                return (
                  <button
                    key={lineId}
                    onClick={() => setExplorerLine(lineId)}
                    style={{
                      fontFamily: "var(--font-body)",
                      background: "var(--bgPrimary)",
                      border: active ? `2px solid ${color}` : "1px solid var(--borderGlass)",
                      borderRadius: "12px",
                      padding: "14px 8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "center",
                      boxShadow: active ? `0 0 10px ${color}15` : "none",
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.background = "var(--hoverBtn)";
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.background = "var(--bgPrimary)";
                    }}
                  >
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, margin: "0 auto 6px" }} />
                    <div style={{ color: active ? "var(--textPrimary)" : "var(--textSecondary)", fontWeight: "700", fontSize: "0.9rem", fontFamily: "var(--font-cairo)" }}>
                      {lineId === "line1" ? "الخط الأول" :
                        lineId === "line2" ? "الخط الثاني" :
                          lineId === "line3" ? "الخط الثالث" :
                            lineId === "line4" ? "الخط الرابع" :
                              lineId === "line5" ? "الخط الخامس" : "الخط السادس"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {lineStatsCount} {lineStatsCount >= 3 && lineStatsCount <= 10 ? "محطات" : "محطة"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explorer Station Container - Styled matching profile sectionCard */}
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "var(--shadow-card)",
            }}>

              {/* Line Summary in Explorer */}
              <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "14px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "4px" }}>
                  {LINE_NAMES[explorerLine]}
                </h2>
                <p style={{ color: "var(--textSecondary)", fontSize: "0.82rem", margin: 0 }}>
                  {explorerLine === "line1" && "اتجاه الحركة الرئيسي: حلوان ↔ المرج الجديدة"}
                  {explorerLine === "line2" && "اتجاه الحركة الرئيسي: شبرا الخيمة ↔ المنيب"}
                  {explorerLine === "line3" && "الخط الذكي الجديد مع تفريعتين بالكيت كات غرباً"}
                  {explorerLine === "line4" && "يربط غرب القاهرة (6 أكتوبر) بوسط العاصمة وشرقها (تحت الإنشاء)"}
                  {explorerLine === "line5" && "خط عرضي يربط شمال العاصمة من الساحل إلى مدينة نصر (تحت الإنشاء)"}
                  {explorerLine === "line6" && "يمتد من شمال القاهرة بالخصوص إلى جنوبها بالمعادي الجديدة (تحت الإنشاء)"}
                </p>

                {/* Sub-tabs for Line 3 branches - iOS Style using var(--colorSecondary) */}
                {explorerLine === "line3" && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    {[
                      { id: "trunk", name: "الفرع الرئيسي" },
                      { id: "branchA", name: "اتجاه روض الفرج" },
                      { id: "branchB", name: "اتجاه جامعة القاهرة" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setLine3ActiveBranch(tab.id as any)}
                        style={{
                          background: line3ActiveBranch === tab.id ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                          border: `1px solid ${line3ActiveBranch === tab.id ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          color: line3ActiveBranch === tab.id ? "var(--textPrimary)" : "var(--textSecondary)",
                          padding: "6px",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontFamily: "var(--font-sub)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Instruction Banner */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontSize: "0.78rem",
                color: "var(--textSecondary)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bx bx-info-circle" style={{ color: "var(--colorSecondary)", fontSize: "0.95rem" }} />
                  <span>انقر على اسم أي محطة لعرض المعالم والأماكن الهامة القريبة منها.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReportModal(null)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "0.76rem",
                    fontWeight: "700",
                    color: "#ef4444",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "var(--font-cairo)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                  title="الإبلاغ عن خطأ في بيانات المحطات أو المعالم"
                >
                  <i className="bx bx-error-circle" style={{ fontSize: "0.9rem" }}></i>
                  <span>الإبلاغ عن خطأ</span>
                </button>
              </div>

              {/* Vertically Scrollable List of Explorer Stations */}
              <div style={{
                maxHeight: "350px", overflowY: "auto", padding: "16px",
                background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                fontFamily: "var(--font-sub)",
              }}>
                {(() => {
                  let stationsList: any[] = [];
                  if (explorerLine === "line1") {
                    stationsList = stations.filter(s => s.line_type === "line1").sort((a, b) => a.station_order - b.station_order);
                  } else if (explorerLine === "line2") {
                    stationsList = stations.filter(s => s.line_type === "line2").sort((a, b) => a.station_order - b.station_order);
                  } else if (explorerLine === "line3") {
                    if (line3ActiveBranch === "trunk") {
                      stationsList = stations.filter(s => s.line_type === "line3").sort((a, b) => a.station_order - b.station_order);
                    } else if (line3ActiveBranch === "branchA") {
                      stationsList = stations.filter(s => s.line_type === "line3_branch_a").sort((a, b) => a.station_order - b.station_order);
                    } else {
                      stationsList = stations.filter(s => s.line_type === "line3_branch_b").sort((a, b) => a.station_order - b.station_order);
                    }
                  } else {
                    stationsList = stations.filter(s => s.line_type === explorerLine).sort((a, b) => a.station_order - b.station_order);
                  }

                  if (stationsList.length === 0) {
                    return (
                      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>
                        لا توجد محطات مسجلة في هذا الخط حالياً.
                      </div>
                    );
                  }

                  return stationsList.map((stationObj, idx) => {
                    const station = stationObj.name;
                    const landmarks = stationObj.landmarks || [];
                    const status = stationObj.status || "تشغيل فعلي";
                    const isUnderConstruction = status === "تحت الإنشاء";

                    const isFirst = idx === 0;
                    const isLast = idx === stationsList.length - 1;
                    const color = LINE_COLORS[explorerLine];

                    // Check if station is transfer
                    const allLinesForStation = Array.from(stationLinesMap.get(station) || []);
                    const isTransfer = allLinesForStation.length > 1;

                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>

                          {/* Dot */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                            <div style={{
                              width: isTransfer ? "12px" : "8px",
                              height: isTransfer ? "12px" : "8px",
                              borderRadius: "50%",
                              backgroundColor: isUnderConstruction ? "transparent" : (isTransfer ? "var(--accent-warning)" : color),
                              border: isUnderConstruction ? `2px dashed ${color}` : `2px solid ${isTransfer ? "#ffffff" : "transparent"}`,
                            }} />
                          </div>

                          {/* Station Text & Transfer Badges */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1, opacity: isUnderConstruction ? 0.75 : 1 }}>
                            <span style={{
                              fontSize: "0.88rem",
                              fontWeight: isTransfer || isFirst || isLast ? "700" : "500",
                              color: isUnderConstruction ? "#ef4444" : (isTransfer ? "var(--accent-warning)" : "var(--textPrimary)"),
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                              onClick={() => setExpandedStation(expandedStation === station ? null : station)}
                            >
                              {station}
                              <i
                                className={`bx ${expandedStation === station ? "bx-chevron-up" : "bx-chevron-down"}`}
                                style={{
                                  fontSize: "1rem",
                                  color: expandedStation === station ? "var(--colorSecondary)" : "var(--text-muted)",
                                  transition: "all 0.2s ease"
                                }}
                              />
                              {isUnderConstruction && (
                                <span style={{
                                  fontSize: "0.68rem",
                                  background: "rgba(239, 68, 68, 0.12)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.25)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "bold"
                                }}>
                                  تحت الإنشاء 🚧
                                </span>
                              )}
                            </span>

                            {isTransfer && (
                              <div style={{ display: "flex", gap: "4px" }}>
                                {allLinesForStation.filter(l => l !== explorerLine).map(l => (
                                  <button
                                    key={l}
                                    onClick={() => {
                                      setExplorerLine(l);
                                      if (l === "line3") setLine3ActiveBranch("trunk");
                                    }}
                                    style={{
                                      fontSize: "0.68rem",
                                      fontWeight: "700",
                                      color: LINE_COLORS[l],
                                      background: LINE_COLORS[l] + "1a",
                                      border: `1px solid ${LINE_COLORS[l]}33`,
                                      padding: "2px 6px",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontFamily: "var(--font-cairo)",
                                    }}
                                    title={`انقر للانتقال إلى ${LINE_NAMES[l]}`}
                                  >
                                    تبادل مع {l === "line1" ? "الخط الأول" : l === "line2" ? "الخط الثاني" : "الخط الثالث"}
                                  </button>
                                ))}
                              </div>
                            )}

                            {isFirst && <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>البداية</span>}
                            {isLast && <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>النهاية</span>}
                          </div>
                        </div>

                        {/* Expanded Landmarks / Status details */}
                        {expandedStation === station && (
                          <div style={{
                            margin: "4px 16px 12px 28px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.02)",
                            border: isUnderConstruction ? "1px dashed rgba(239, 68, 68, 0.3)" : "1px solid var(--borderGlass)",
                            opacity: isUnderConstruction ? 0.8 : 1,
                          }}>
                            {isUnderConstruction && (
                              <div style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <span>⚠️ هذه المحطة قيد الإنشاء وليست في الخدمة الفعلية بعد.</span>
                              </div>
                            )}
                            <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", marginBottom: "4px", fontWeight: "bold" }}>📍 المعالم والأماكن القريبة:</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {landmarks.length > 0 ? (
                                landmarks.map((landmark: string, lIdx: number) => (
                                  <span key={lIdx} style={{
                                    fontSize: "0.7rem",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "var(--textPrimary)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--borderGlass)",
                                  }}>
                                    {landmark}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>لم يتم تحديد معالم قريبة بعد لهذه المحطة.</span>
                              )}
                            </div>
                            <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--borderGlass)", display: "flex", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReportModal(station);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  background: "none",
                                  border: "none",
                                  color: "var(--textSecondary)",
                                  fontSize: "0.74rem",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  transition: "all 0.2s ease",
                                  fontFamily: "var(--font-cairo)"
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.color = "#ef4444";
                                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.color = "var(--textSecondary)";
                                  e.currentTarget.style.background = "none";
                                }}
                              >
                                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.75rem" }}></i>
                                الإبلاغ عن خطأ في محطة {station}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Rail segment */}
                        {!isLast && (
                          <div style={{ display: "flex", gap: "12px", minHeight: "14px" }}>
                            <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                              <div style={{
                                width: "2px",
                                backgroundColor: color,
                                minHeight: "14px",
                                opacity: 0.4,
                              }} />
                            </div>
                            <div style={{ flexGrow: 1 }} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

            </div>
          </div>

          {/* OFFICIAL METRO MAP DOWNLOAD SECTION */}
          <div className="metro-animate-slide-up metro-delay-400" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "20px",
            marginTop: "24px",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{
                fontSize: "1.3rem",
                fontWeight: "800",
                color: "var(--textPrimary)",
                margin: "0 0 6px 0",
              }}>🗺️ خريطة مترو القاهرة الرسمية</h2>
              <p style={{ color: "var(--textSecondary)", fontSize: "0.9rem", margin: 0, lineHeight: "1.5", fontFamily: "var(--font-sub)" }}>
                يمكنك استعراض الخريطة التوضيحية لشبكة المترو الرسمية أو تحميلها كصورة عالية الدقة للوصول إليها في أي وقت دون الحاجة لإنترنت.
              </p>
            </div>

            {/* Map Preview Image */}
            <div style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--borderGlass)",
              height: "220px",
              width: "100%",
              backgroundColor: "rgba(0,0,0,0.05)",
            }}>
              <a href="/images/metro/cairo-metro-map.png" target="_blank" rel="noopener noreferrer">
                <img
                  src="/images/metro/cairo-metro-map.png"
                  alt="Cairo Metro Official Map"
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
                {/* Fullscreen Overlay Guide */}
                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.6)",
                  color: "#ffffff",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backdropFilter: "blur(4px)",
                }}>
                  <i className="bx bx-expand-alt" style={{ fontSize: "0.9rem" }}></i>
                  اضغط للتكبير
                </div>
              </a>
            </div>

            {/* Download Button */}
            <a
              href="/image/cairo-metro-map.png"
              download="cairo-metro-map.png"
              style={{
                width: "100%",
                padding: "var(--paddingBtn)",
                borderRadius: "var(--radiusBtn)",
                background: "var(--colorSecondary)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-sub)",
                textAlign: "center",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <i className="bx bx-download" style={{ fontSize: "1.2rem" }}></i>
              تحميل الخريطة بجودة عالية
            </a>
          </div>

          {/* Emergency Quick Bar */}
          {/* <EmergencyQuickBar /> */}

          {/* Transit FAQ Accordion */}
          {/* <TransitFAQ /> */}

        </div>
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
            direction: "rtl"
          }}
          onClick={() => !reportLoading && setReportModalOpen(false)}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-card)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
              overflow: "hidden",
              position: "relative",
              animation: "metro-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--borderGlass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.02)"
            }}>
              <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
                مشكلة في صفحة مترو الأنفاق
              </h5>
              <button
                type="button"
                onClick={() => {
                  if (!reportLoading) {
                    setReportModalOpen(false);
                    handleReportImageSelect(null);
                  }
                }}
                className="closeBtn"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              {reportSuccess ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(52, 199, 89, 0.15)",
                    color: "#34c759",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    margin: "0 auto 16px"
                  }}>
                    <i className="bx bx-check"></i>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم استلام بلاغك بنجاح!
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    شكراً لمساهمتك في تحسين وتدقيق خدمة مترو الأنفاق. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
                  </p>
                </div>
              ) : limitChecking ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--colorSecondary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري التحقق...</span>
                </div>
              ) : limitReached ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "90px",
                    height: "90px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px"
                  }}>
                    <img src="/images/icons3d/error.png" alt="error" style={{ width: "100%", height: "100%" }} loading="lazy" />
                  </div>
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم الوصول للحد الأقصى من البلاغات المعلقة
                  </h5>
                  <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setReportModalOpen(false)}
                    style={{ width: "100%" }}
                  >
                    حسناً، فهمت
                  </button>
                </div>
              ) : !user ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    color: "var(--colorSecondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 14px"
                  }}>
                    <i className="bx bx-user"></i>
                  </div>
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تسجيل الدخول مطلوب
                  </h5>
                  <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة في المترو ومتابعة حالته وكسب نقاط المساهمة.
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link
                      href="/login"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Scope Segmented Control */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "8px" }}>
                      نطاق المشكلة:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: (selectedFrom && selectedTo) ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("general");
                          setReportSelectedStation("");
                          setReportStationSearchQuery("");
                          setShowReportStationList(false);
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "8px",
                          border: `1px solid ${reportTargetScope === "general" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          background: reportTargetScope === "general" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "general" ? "var(--textPrimary)" : "var(--textSecondary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        مشكلة عامة
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("station");
                          setShowReportStationList(true);
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "8px",
                          border: `1px solid ${reportTargetScope === "station" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          background: reportTargetScope === "station" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "station" ? "var(--textPrimary)" : "var(--textSecondary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        محطة معينة
                      </button>

                      {selectedFrom && selectedTo && (
                        <button
                          type="button"
                          onClick={() => {
                            setReportTargetScope("route");
                            setReportSelectedStation("");
                            setReportStationSearchQuery("");
                            setShowReportStationList(false);
                          }}
                          style={{
                            padding: "8px 4px",
                            borderRadius: "8px",
                            border: `1px solid ${reportTargetScope === "route" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                            background: reportTargetScope === "route" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                            color: reportTargetScope === "route" ? "var(--textPrimary)" : "var(--textSecondary)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontFamily: "var(--font-body)"
                          }}
                        >
                          الرحلة الحالية
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If Scope is Station: Searchable station autocomplete selector */}
                  {reportTargetScope === "station" && (
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        <span>اختر أو ابحث عن المحطة:</span>
                        {reportSelectedStation && (
                          <span style={{ fontSize: "0.74rem", color: "var(--colorSecondary)", fontWeight: "700" }}>
                            تم تحديد: {reportSelectedStation} ✔
                          </span>
                        )}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          className="input-fields"
                          placeholder="ابحث باسم المحطة أو المعلم القريب..."
                          value={reportStationSearchQuery}
                          onChange={e => {
                            const val = e.target.value;
                            setReportStationSearchQuery(val);
                            setShowReportStationList(true);
                            if (reportSelectedStation && val !== reportSelectedStation) {
                              setReportSelectedStation("");
                            }
                          }}
                          onFocus={() => setShowReportStationList(true)}
                          onBlur={() => setTimeout(() => setShowReportStationList(false), 250)}
                          style={{
                            width: "100%",
                            padding: "10px 10px 10px 36px",
                            borderRadius: "10px",
                            background: "var(--bgSecondary)",
                            color: "var(--textPrimary)",
                            border: reportSelectedStation ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                            fontFamily: "var(--font-body)",
                            fontSize: "0.9rem",
                            direction: "rtl"
                          }}
                        />

                        {reportStationSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportSelectedStation("");
                              setReportStationSearchQuery("");
                              setShowReportStationList(true);
                            }}
                            title="مسح"
                            style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(255, 255, 255, 0.08)",
                              border: "none",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              color: "var(--textSecondary)",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Station suggestions list popup */}
                      {showReportStationList && (
                        <div style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "10px",
                          overflow: "hidden",
                          zIndex: 1100,
                          maxHeight: "200px",
                          overflowY: "auto",
                          boxShadow: "var(--shadow-lg)",
                          marginTop: "4px",
                          fontFamily: "var(--font-body)"
                        }}>
                          {filteredReportStations.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", fontSize: "0.82rem", color: "var(--textSecondary)" }}>
                              لا توجد محطة مطابقة لبحثك "{reportStationSearchQuery}"
                            </div>
                          ) : (
                            filteredReportStations.map(st => {
                              const isSelected = reportSelectedStation === st.name;
                              const q = normalizeArabic(reportStationSearchQuery.trim());
                              const matchedLandmark = q ? (st.landmarks || []).find(l => normalizeArabic(l).includes(q)) : null;

                              return (
                                <div
                                  key={st.name}
                                  onMouseDown={() => {
                                    setReportSelectedStation(st.name);
                                    setReportStationSearchQuery(st.name);
                                    setShowReportStationList(false);
                                  }}
                                  style={{
                                    padding: "9px 14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                                    background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                    transition: "background 0.15s ease"
                                  }}
                                  onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = "var(--hoverBtn)";
                                  }}
                                  onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span style={{ fontSize: "0.88rem", fontWeight: isSelected ? "700" : "600", color: isSelected ? "var(--colorSecondary)" : "var(--textPrimary)", fontFamily:"var(--font-body)" }}>
                                      {st.name}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ display: "flex", gap: "3px" }}>
                                      {st.lines.map(l => (
                                        <span key={l} style={{ width: "7px", height: "7px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                                      ))}
                                    </div>
                                    {st.isTransfer && (
                                      <span style={{ fontSize: "0.68rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>
                                        تبادلية
                                      </span>
                                    )}
                                    {isSelected && (
                                      <span style={{ fontSize: "0.75rem", color: "var(--colorSuccess)", fontWeight: "700" }}>✔</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Scope is Route: display current route preview card */}
                  {reportTargetScope === "route" && selectedFrom && selectedTo && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(59, 130, 246, 0.06)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      fontSize: "0.84rem",
                      color: "var(--textPrimary)",
                      lineHeight: "1.6"
                    }}>
                      <div>📍 <strong>من:</strong> {selectedFrom} ← <strong>إلى:</strong> {selectedTo}</div>
                      {result && (
                        <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", marginTop: "4px" }}>
                          سعر التذكرة: {result.price} ج.م • المحطات: {result.stationCount} • الوقت: {result.estimatedTime} د
                        </div>
                      )}
                    </div>
                  )}

                  {/* Problem Type dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      نوع المشكلة:
                    </label>
                    <select
                      value={reportProblemType}
                      onChange={e => setReportProblemType(e.target.value)}
                      className="input-fields"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-sub)",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      <option value="route_error" style={{ background: "var(--bgSecondary)" }}> خطأ في حساب مسار الرحلة أو زمن الوصول</option>
                      <option value="price" style={{ background: "var(--bgSecondary)" }}> سعر التذكرة غير صحيح أو عدد المحطات غير دقيق</option>
                      <option value="transfer" style={{ background: "var(--bgSecondary)" }}> خطأ في محطة التبديل أو تعليمات التحويل بين الخطوط</option>
                      <option value="station_info" style={{ background: "var(--bgSecondary)" }}> اسم المحطة أو المعالم القريبة غير دقيقة</option>
                      <option value="closed_station" style={{ background: "var(--bgSecondary)" }}> محطة مغلقة أو تحت الإنشاء أو تغيرت حالتها</option>
                      <option value="app_bug" style={{ background: "var(--bgSecondary)" }}> مشكلة تقنية أو زر لا يستجيب في الصفحة</option>
                      <option value="other" style={{ background: "var(--bgSecondary)" }}> ملاحظة أو مشكلة أخرى</option>
                    </select>
                  </div>

                  {/* Details Textarea */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      تفاصيل المشكلة / التصحيح المقترح: <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: سعر التذكرة من حلوان للسادات أصبح كذا، أو محطة كذا تفتح في مواعيد مختلفة)..."
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      className="input-fields"
                      required
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-cairo)",
                        fontSize: "0.9rem",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Enhanced Image File Upload */}
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      <span>صورة توضيحية للمشكلة (اختياري):</span>
                      <span style={{ fontSize: "0.74rem", color: "var(--textSecondary)", fontWeight: "normal" }}>
                        JPG, PNG, WEBP (الحد الأقصى 5MB)
                      </span>
                    </label>

                    {!reportImagePreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(false);
                          const droppedFile = e.dataTransfer.files?.[0];
                          if (droppedFile) handleReportImageSelect(droppedFile);
                        }}
                        style={{
                          position: "relative",
                          border: isDraggingImage ? "2px dashed var(--colorSecondary)" : "1.5px dashed var(--borderGlass)",
                          borderRadius: "12px",
                          background: isDraggingImage ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          padding: "20px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDraggingImage) e.currentTarget.style.background = "var(--hoverBtn)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isDraggingImage) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReportImageSelect(file);
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />

                        <div style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          background: "rgba(59, 130, 246, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--colorSecondary)",
                          fontSize: "1.4rem"
                        }}>
                          <i className="bx bx-cloud-upload"></i>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "3px" }}>
                            اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--textSecondary)" }}>
                            لقطة شاشة للخطأ، أو صورة للمحطة لتوضيح المشكلة بدقة
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        position: "relative",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "12px",
                        background: "var(--bgSecondary)",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}>
                        {/* Thumbnail */}
                        <div style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#000",
                          border: "1px solid var(--borderGlass)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}>
                          <img
                            src={reportImagePreview}
                            alt="معاينة الصورة المرفقة"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        </div>

                        {/* File details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "0.86rem",
                            fontWeight: "700",
                            color: "var(--textPrimary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {reportImageFile?.name || "صورة توضيحية"}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--textSecondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>
                              {reportImageFile
                                ? reportImageFile.size < 1024 * 1024
                                  ? `${(reportImageFile.size / 1024).toFixed(0)} KB`
                                  : `${(reportImageFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : ""}
                            </span>
                            <span>•</span>
                            <span style={{ color: "var(--colorSuccess)", fontWeight: "600" }}>جاهزة للإرسال ✔</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Change button */}
                          <label style={{
                            cursor: "pointer",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--borderGlass)",
                            color: "var(--textPrimary)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <i className="bx bx-sync"></i>
                            <span>تغيير</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReportImageSelect(file);
                              }}
                              style={{ display: "none" }}
                            />
                          </label>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleReportImageSelect(null)}
                            title="حذف الصورة"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#ef4444",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <i className="bx bx-trash"></i>
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {reportError && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      fontSize: "0.85rem"
                    }}>
                      {reportError}
                    </div>
                  )}

                  {/* Submit and Cancel Buttons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="submit"
                      className="btn actionBtnDelete"
                      disabled={reportLoading || reportUploading}
                      style={{
                        flex: 1,
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        cursor: reportLoading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "50%",
                      }}
                    >
                      {reportLoading ? (
                        <>
                          <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          <span>{reportUploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}</span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-send"></i>
                          <span>إرسال البلاغ</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancle"
                      disabled={reportLoading}
                      onClick={() => {
                        setReportModalOpen(false);
                        handleReportImageSelect(null);
                      }}
                      style={{
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        width: "50%",
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
