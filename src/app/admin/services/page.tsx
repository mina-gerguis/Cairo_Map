"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import AdminDirectoryPage from "../directory/page";
import AdminDirectionsPage from "../directions/page";
import { STATION_DETAILS } from "@/app/monorail/page";


// ── Default Mock / Seed Data ──
const DEFAULT_MONORAIL: any[] = [
  { name: "الاستاد", line_type: "east", station_order: 1 },
  { name: "هشام بركات", line_type: "east", station_order: 2 },
  { name: "نوري خطاب", line_type: "east", station_order: 3 },
  { name: "الحي السابع", line_type: "east", station_order: 4 },
  { name: "ذاكر حسين", line_type: "east", station_order: 5 },
  { name: "المنطقة الحرة", line_type: "east", station_order: 6 },
  { name: "المشير طنطاوي", line_type: "east", station_order: 7 },
  { name: "وان قطامية", line_type: "east", station_order: 8 },
  { name: "المستثمرين", line_type: "east", station_order: 9 },
  { name: "النسيم", line_type: "east", station_order: 10 },
  { name: "الجامعة الأمريكية", line_type: "east", station_order: 11 },
  { name: "إعمار", line_type: "east", station_order: 12 },
  { name: "ميدان النافورة", line_type: "east", station_order: 13 },
  { name: "البروة", line_type: "east", station_order: 14 },
  { name: "بيت الوطن", line_type: "east", station_order: 15 },
  { name: "مسجد الفتاح العليم", line_type: "east", station_order: 16 },
  { name: "الحي السكني R2", line_type: "east", station_order: 17 },
  { name: "الدائري الإقليمي", line_type: "east", station_order: 18 },
  { name: "فندق الماسة", line_type: "east", station_order: 19 },
  { name: "الحي الحكومي", line_type: "east", station_order: 20 },
  { name: "حي السفارات", line_type: "east", station_order: 21 },
  { name: "مدينة الفنون والثقافة", line_type: "east", station_order: 22 },
  { name: "أكتوبر الجديدة", line_type: "west", station_order: 1 },
  { name: "المنطقة الصناعية", line_type: "west", station_order: 2 },
  { name: "السادات", line_type: "west", station_order: 3 },
  { name: "جهاز مدينة 6 أكتوبر", line_type: "west", station_order: 4 },
  { name: "جمعية المهندسين", line_type: "west", station_order: 5 },
  { name: "جامعة النيل", line_type: "west", station_order: 6 },
  { name: "هايبر وان", line_type: "west", station_order: 7 },
  { name: "الصحراوي", line_type: "west", station_order: 8 },
  { name: "المنصورية", line_type: "west", station_order: 9 },
  { name: "المريوطية", line_type: "west", station_order: 10 },
  { name: "الطريق الدائري", line_type: "west", station_order: 11 },
  { name: "العريش", line_type: "west", station_order: 12 },
  { name: "المطبغة", line_type: "west", station_order: 13 },
  { name: "بولاق الدكرور", line_type: "west", station_order: 14 },
  { name: "جامعة الدول العربية", line_type: "west", station_order: 15 },
  { name: "وادي النيل", line_type: "west", station_order: 16 }
];



const DEFAULT_PORTS: any[] = [
  {
    name: "ميناء الإسكندرية البحري",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / ركاب / سياحي",
    capacity: "أكثر من 60% من تجارة مصر الخارجية تعبر من خلاله.",
    description: "أقدم وأهم ميناء بحري تجاري في مصر. يضم الميناء أرصفة مخصصة للحاويات، البضائع العامة، الفحم، ومحطة ركاب سياحية حديثة تستقبل السفن السياحية العالمية.",
    map_url: "https://maps.google.com/?q=Alexandria+Port"
  },
  {
    name: "ميناء الدخيلة",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / صناعي",
    capacity: "يعتبر الامتداد الطبيعي لميناء الإسكندرية لتقليل التكدس.",
    description: "يقع غرب ميناء الإسكندرية ويخدم بشكل كبير المجمعات الصناعية المجاورة، مثل مصانع الحديد والصلب وغيرها، ويمتلك أرصفة عميقة لاستقبال السفن الضخمة.",
    map_url: "https://maps.google.com/?q=Dekheila+Port"
  },
  {
    name: "ميناء دمياط",
    governorate: "دمياط",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / حاويات / غاز مسال",
    capacity: "يتميز بوجود أحدث محطة لتداول الحاويات والبضائع العامة والغاز.",
    description: "من أهم الموانئ المصرية الحديثة، يقع بالقرب من مدخل قناة السويس. يحتوي على تسهيلات متطورة لتداول الحاويات ومصنع رائد لتسييل وتصدير الغاز الطبيعي.",
    map_url: "https://maps.google.com/?q=Damietta+Port"
  },
  {
    name: "ميناء بورسعيد (شرق وغرب)",
    governorate: "بورسعيد",
    sea: "البحر الأبيض المتوسط / مدخل القناة",
    type: "تجاري / حاويات عالمي",
    capacity: "يقع مباشرة على المجرى الملاحي لقناة السويس.",
    description: "ينقسم إلى ميناء غرب بورسعيد وميناء شرق بورسعيد المحوري العملاق الذي يعد من أسرع موانئ تداول الحاويات نمواً في العالم، ويعمل كمحطة ترانزيت رئيسية لربط قارات العالم.",
    map_url: "https://maps.google.com/?q=Port+Said+Port"
  },
  {
    name: "ميناء العين السخنة",
    governorate: "السويس",
    sea: "خليج السويس / البحر الأحمر",
    type: "تجاري / صناعي حديث",
    capacity: "يتميز بأعماق تصل إلى 17 متراً لاستيعاب سفن الجيل الثالث.",
    description: "ميناء محوري يخدم المنطقة الاقتصادية لقناة السويس ويعد البوابة الجنوبية الرئيسية للبضائع القادمة من آسيا وشرق إفريقيا باتجاه القاهرة والدلتا.",
    map_url: "https://maps.google.com/?q=Sokhna+Port"
  },
  {
    name: "ميناء سفاجا البحري",
    governorate: "البحر الأحمر",
    sea: "البحر الأحمر",
    type: "ركاب / بضائع / سياحي",
    capacity: "البوابة الرئيسية لخدمة محافظات الصعيد وحركة الركاب مع دول الخليج.",
    description: "يتميز بموقعه الاستراتيجي وقربه من مدن الصعيد والأقصر، ويعتبر الميناء الرئيسي لحركة المعتمرين والحجاج والعمالة المصرية المسافرة عبر البحر الأحمر، بالإضافة لتداول الفوسفات والألومنيوم.",
    map_url: "https://maps.google.com/?q=Safaga+Port"
  },
  {
    name: "ميناء نويبع",
    governorate: "جنوب سيناء",
    sea: "خليج العقبة / البحر الأحمر",
    type: "ركاب / شاحنات (ميناء ربط عربي)",
    capacity: "يربط مصر بالأردن والمشرق العربي عبر خط الجسر العربي الملاحي.",
    description: "يقع على خليج العقبة ويخدم حركة التجارة والركاب والتبادل البيني للشاحنات بين مصر والأردن ودول الخليج العربي والشام.",
    map_url: "https://maps.google.com/?q=Nuweiba+Port"
  }
];

const DEFAULT_BUS_STATIONS: any[] = [
  {
    name: "موقف ألماظة للسوبر جيت (Almaza Terminal)",
    location: "مصر الجديدة - بجوار طريق السويس ومطار القاهرة",
    governorate: "القاهرة",
    companies: [
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "رسمي حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "شرم الشيخ", "الغردقة", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "السويس", "بورسعيد"],
    description: "أحدث محطات السوبر جيت في القاهرة. تخدم بشكل رئيسي المسافرين إلى مدن القناة، البحر الأحمر، والوجه القبلي والصعيد بتنظيم ممتاز وصالة انتظار مكيفة.",
    map_url: "https://maps.google.com/?q=Almaza+Super+Jet+Station"
  },
  {
    name: "موقف الترجمان (Cairo Gateway)",
    location: "وسط البلد - شارع الجلاء بجوار محطة مترو جمال عبد الناصر",
    governorate: "القاهرة",
    companies: [
      { name: "شركة شرق الدلتا للنقل", phone: "02-25761311", type: "حكومي" },
      { name: "شركة غرب ووسط الدلتا", phone: "02-25761211", type: "حكومي" },
      { name: "شركة الصعيد للنقل", phone: "02-25761411", type: "حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "مطروح", "المنصورة", "الزقازيق", "شبه جزيرة سيناء (العريش/طور سيناء)", "محافظات الصعيد بأكملها", "البحر الأحمر"],
    description: "المحطة المركزية الكبرى للنقل البري لجميع المحافظات والدول المجاورة. يضم مكاتب حجز لمعظم الشركات العامة والخاصة وصالة انتظار تجارية ضخمة.",
    map_url: "https://maps.google.com/?q=Torgoman+Bus+Station"
  },
  {
    name: "موقف عبد المنعم رياض (التحرير)",
    location: "وسط البلد - ميدان التحرير خلف المتاحف والمكتبة وبجوار هيلتون",
    governorate: "القاهرة",
    companies: [
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" },
      { name: "بلو باص (Blue Bus)", phone: "16148", type: "خاص فاخر" },
      { name: "سوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: ["الإسكندرية", "الساحل الشمالي", "شرم الشيخ", "دهب", "الغردقة", "المنيا", "أسيوط", "قنا", "الأقصر"],
    description: "موقع استراتيجي بقلب القاهرة يتيح للمسافرين ركوب الحافلات السياحية الفاخرة مباشرة فور الخروج من محطة مترو السادات بالتحرير.",
    map_url: "https://maps.google.com/?q=Abdel+Moneim+Riad+Bus+Station"
  },
  {
    name: "موقف عبود الإقليمي",
    location: "شمال القاهرة - شبرا بمقربة من الطريق الدائري ومترو المظلات",
    governorate: "القاهرة",
    companies: [
      { name: "أتوبيسات غرب الدلتا", phone: "19142", type: "اقتصادي" },
      { name: "أتوبيسات شرق الدلتا", phone: "02-22448400", type: "اقتصادي" }
    ],
    destinations: ["طنطا", "المحلة الكبرى", "المنصورة", "دمنهور", "كفر الشيخ", "الإسكندرية", "بلبيس", "الزقازيق"],
    description: "الموقف الرئيسي والأكبر لربط القاهرة بجميع محافظات الوجه البحري والدلتا. يضم أتوبيسات السفر الاقتصادية وسيارات الأجرة الإقليمية الكبرى.",
    map_url: "https://maps.google.com/?q=Abboud+Bus+Station"
  },
  {
    name: "موقف المنيب الإقليمي",
    location: "الجيزة - المنيب بجوار محطة مترو المنيب والطريق الدائري",
    governorate: "الجيزة",
    companies: [
      { name: "شركة الصعيد للنقل والاتوبيسات", phone: "19142", type: "حكومي" },
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: ["الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "الواحات البحرية"],
    description: "البوابة الجنوبية للقاهرة والجيزة ومركز النقل الرئيسي المتجه إلى محافظات الصعيد والوجه القبلي والفيوم والواحات.",
    map_url: "https://maps.google.com/?q=Moneeb+Bus+Station"
  }
];

const DEFAULT_MICROBUS: any[] = [
  {
    name: "موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Ramses+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "11-13 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "الشيخ زايد", fare: "12-14 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص / ميني باص" },
      { destination: "العبور", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "الشروق", fare: "12-14 ج.م", vehicleType: "ميكروباص" },
      { destination: "حلوان", fare: "9-11 ج.م", vehicleType: "ميكروباص" },
      { destination: "المرج", fare: "7-8 ج.م", vehicleType: "ميكروباص" },
      { destination: "الجيزة (ميدان الجيزة)", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "شبرا الخيمة", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "مطار القاهرة", fare: "8-10 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف المرج الجديدة",
    location: "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=El+Marg+Microbus+Station",
    routes: [
      { destination: "العبور", fare: "7-9 ج.م", vehicleType: "ميكروباص" },
      { destination: "الشروق", fare: "9-11 ج.م", vehicleType: "ميكروباص" },
      { destination: "بدر", fare: "11-13 ج.م", vehicleType: "ميكروباص" },
      { destination: "العاشر من رمضان", fare: "12-15 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "مدينتي", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "بلبيس", fare: "10-12 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "الزقازيق", fare: "15-18 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "مسطرد", fare: "5 ج.م", vehicleType: "ميكروباص" },
      { destination: "رمسيس", fare: "7-8 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف ميدان الجيزة",
    location: "الجيزة - ميدان الجيزة بجوار مسجد الاستقامة ومترو الجيزة",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Giza+Square+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "9-11 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "الشيخ زايد", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "الهرم / فيصل", fare: "4-5 ج.م", vehicleType: "ميكروباص داخلي" },
      { destination: "المنيب", fare: "3.5-4 ج.م", vehicleType: "ميكروباص داخلي" },
      { destination: "حدائق الأهرام", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "رمسيس", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص سقف عالي (عبر الدائري)" },
      { destination: "المعادي", fare: "7-9 ج.م", vehicleType: "ميكروباص (عبر الدائري)" }
    ]
  },
  {
    name: "موقف السيدة عائشة",
    location: "وسط القاهرة - ميدان السيدة عائشة أسفل القلعة",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Sayeda+Aisha+Microbus+Station",
    routes: [
      { destination: "حلوان", fare: "8-10 ج.م", vehicleType: "ميكروباص" },
      { destination: "المعادي (صقر قريش)", fare: "6-7 ج.م", vehicleType: "ميكروباص" },
      { destination: "التجمع الخامس", fare: "12-14 ج.م", vehicleType: "ميكروباص (الدائري)" },
      { destination: "رمسيس", fare: "5 ج.م", vehicleType: "ميكروباص" },
      { destination: "الجيزة", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "المرج", fare: "8-10 ج.م", vehicleType: "ميكروباص" },
      { destination: "المقطم", fare: "4-5 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف المنيب الكبرى",
    location: "الجيزة - بجوار محطة مترو المنيب ومخرج الدائري للجنوب",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Moneeb+Microbus+Station",
    routes: [
      { destination: "الفيوم", fare: "25-30 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "بني سويف", fare: "30-35 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "6 أكتوبر", fare: "9-11 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "حلوان", fare: "7-9 ج.م", vehicleType: "ميكروباص (عبر الدائري)" },
      { destination: "المعادي", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "ميدان الجيزة", fare: "3.5-4 ج.م", vehicleType: "ميكروباص داخلي" }
    ]
  }
];

type ServiceType = "monorail" | "ports" | "bus_stations" | "microbus_stations" | "directory" | "directions";

export default function AdminServicesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminServicesPageInner />
    </Suspense>
  );
}

function AdminServicesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ServiceType>("monorail");
  const [dbStatus, setDbStatus] = useState<Record<ServiceType, boolean>>({
    monorail: true,
        ports: true,
    bus_stations: true,
    microbus_stations: true,
    directory: true,
    directions: true
  });

  // Table Data States
  const [monorailData, setMonorailData] = useState<any[]>([]);
  
  const [portsData, setPortsData] = useState<any[]>([]);
  const [busStationsData, setBusStationsData] = useState<any[]>([]);
  const [microbusStationsData, setMicrobusStationsData] = useState<any[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");
  const [adminActiveMonorailLine, setAdminActiveMonorailLine] = useState<"all" | "east" | "west">("all");
    const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        checkAdmin();
      }
    }
  }, [user, authLoading]);

  // Sync tab with URL search parameter "tab"
  useEffect(() => {
    if (tabParam) {
      if (tabParam === "bus_stations") {
        router.replace("/admin/bus-stations");
        return;
      }
      const validTabs: ServiceType[] = ["monorail", "ports", "bus_stations", "microbus_stations", "directory", "directions"];
      if (validTabs.includes(tabParam as ServiceType)) {
        setActiveTab(tabParam as ServiceType);
      }
    }
  }, [tabParam]);

  const checkAdmin = async () => {
    if (!supabase || !user) return;
    try {
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileErr || !data?.is_admin) {
        setIsAdmin(false);
        router.push("/");
      } else {
        setIsAdmin(true);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
      router.push("/");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchServiceData("monorail", "monorail_stations", DEFAULT_MONORAIL, setMonorailData),
      
      fetchServiceData("ports", "ports", DEFAULT_PORTS, setPortsData),
      fetchServiceData("bus_stations", "bus_stations", DEFAULT_BUS_STATIONS, setBusStationsData),
      fetchServiceData("microbus_stations", "microbus_stations", DEFAULT_MICROBUS, setMicrobusStationsData)
    ]);
    setLoading(false);
  };

  const fetchServiceData = async (
    type: ServiceType,
    tableName: string,
    defaultData: any[],
    setData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (!supabase) {
      setData(getLocalData(type, defaultData));
      setDbStatus(prev => ({ ...prev, [type]: false }));
      return;
    }

    try {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) {
        console.warn(`Failed to fetch from ${tableName}, using fallback.`, error);
        setData(getLocalData(type, defaultData));
        setDbStatus(prev => ({ ...prev, [type]: false }));
      } else {
        let mappedData = data ? data.map(item => {
          let updated = { ...item };
          if (type === "monorail") {
            if (item.landmarks === undefined || item.landmarks === null || (Array.isArray(item.landmarks) && item.landmarks.length === 0)) {
              const staticInfo = STATION_DETAILS[item.name];
              if (staticInfo) {
                updated.landmarks = staticInfo.landmarks;
              }
            }
            updated.status = item.status || STATION_DETAILS[item.name]?.status || "تحت الإنشاء";
          }
          return updated;
        }) : [];



        setData(mappedData);
        setDbStatus(prev => ({ ...prev, [type]: true }));
      }
    } catch (err) {
      console.error(err);
      setData(getLocalData(type, defaultData));
      setDbStatus(prev => ({ ...prev, [type]: false }));
    }
  };



  const getLocalData = (type: ServiceType, defaultVal: any[]) => {
    if (typeof window === "undefined") return defaultVal;
    const local = localStorage.getItem(`local_${type}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (type === "monorail" && Array.isArray(parsed)) {
          return parsed.map(item => {
            let updated = { ...item };
            if (item.landmarks === undefined || item.landmarks === null || (Array.isArray(item.landmarks) && item.landmarks.length === 0)) {
              const staticInfo = STATION_DETAILS[item.name];
              if (staticInfo) {
                updated.landmarks = staticInfo.landmarks;
              }
            }
            updated.status = item.status || STATION_DETAILS[item.name]?.status || "تحت الإنشاء";
            return updated;
          });
        }

        return parsed;
      } catch {
        return defaultVal;
      }
    }
    localStorage.setItem(`local_${type}`, JSON.stringify(defaultVal));
    return defaultVal;
  };

  const saveLocalData = (type: ServiceType, data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`local_${type}`, JSON.stringify(data));
    }
  };

  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    if (activeTab === "monorail") {
      setFormData({ name: "", line_type: "east", station_order: 1, landmarks: "", status: "تحت الإنشاء" });
    
    } else if (activeTab === "ports") {
      setFormData({ name: "", governorate: "", sea: "", type: "", capacity: "", description: "", map_url: "" });
    } else if (activeTab === "bus_stations") {
      setFormData({ name: "", location: "", governorate: "", companies: "", destinations: "", description: "", map_url: "" });
    } else if (activeTab === "microbus_stations") {
      setFormData({ name: "", location: "", governorate: "", routes: "", map_url: "" });
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    if (activeTab === "bus_stations") {
      setFormData({
        ...item,
        destinations: Array.isArray(item.destinations) ? item.destinations.join(", ") : item.destinations || "",
        companies: Array.isArray(item.companies) ? JSON.stringify(item.companies, null, 2) : item.companies || ""
      });
    } else if (activeTab === "microbus_stations") {
      setFormData({
        ...item,
        routes: Array.isArray(item.routes) ? JSON.stringify(item.routes, null, 2) : item.routes || ""
      });
    } else if (activeTab === "monorail") {
      setFormData({
        ...item,
        landmarks: Array.isArray(item.landmarks) ? item.landmarks.join(", ") : item.landmarks || "",
        status: item.status || "تحت الإنشاء"
      });
    } else {
      setFormData({ ...item });
    }
    setShowModal(true);
  };

  const getTableName = (type: ServiceType) => {
    if (type === "monorail") return "monorail_stations";

    return type;
  };

  const getDataSetter = (type: ServiceType) => {
    if (type === "monorail") return setMonorailData;

    if (type === "ports") return setPortsData;
    if (type === "bus_stations") return setBusStationsData;
    return setMicrobusStationsData;
  };

  const getDefaultData = (type: ServiceType) => {
    if (type === "monorail") return DEFAULT_MONORAIL;

    if (type === "ports") return DEFAULT_PORTS;
    if (type === "bus_stations") return DEFAULT_BUS_STATIONS;
    return DEFAULT_MICROBUS;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isDbConnected = dbStatus[activeTab];
    const tableName = getTableName(activeTab);
    const dataSetter = getDataSetter(activeTab);
    const defaultData = getDefaultData(activeTab);

    // Format fields
    let payload = { ...formData };
    if (activeTab === "bus_stations") {
      payload.destinations = typeof formData.destinations === "string" 
        ? formData.destinations.split(",").map((d: string) => d.trim()).filter(Boolean)
        : formData.destinations;
      if (typeof formData.companies === "string") {
        try {
          payload.companies = JSON.parse(formData.companies);
        } catch {
          setError("خطأ في تنسيق JSON للشركات المشغلة. يجب أن يكون بتنسيق مصفوفة كائنات صالحة.");
          return;
        }
      }
    } else if (activeTab === "microbus_stations") {
      if (typeof formData.routes === "string") {
        try {
          payload.routes = JSON.parse(formData.routes);
        } catch {
          setError("خطأ في تنسيق JSON للمسارات والتعريفة. يجب أن يكون بتنسيق مصفوفة كائنات صالحة.");
          return;
        }
      }
    } else if (activeTab === "monorail") {
      payload.landmarks = typeof formData.landmarks === "string"
        ? formData.landmarks.split(",").map((s: string) => s.trim()).filter(Boolean)
        : formData.landmarks || [];
    }

    if (isDbConnected && supabase) {
      try {
        // Separate database columns from frontend properties
        const dbPayload = {
          name: payload.name || "",
          code: payload.code || "",
          city: payload.city || "",
          type: payload.type || "",
          terminals: payload.terminals || payload.terminals_count || "",
          services: payload.services || [],
          airlines: payload.airlines || "",
          phone: payload.phone || "",
          map_url: payload.map_url || "",
          
          // Enriched migration columns
          name_en: payload.name_en || "",
          iata_code: payload.iata_code || "",
          icao_code: payload.icao_code || "",
          governorate: payload.governorate || "",
          region: payload.region || "",
          short_desc: payload.short_desc || "",
          detailed_desc: payload.detailed_desc || "",
          coordinates: payload.coordinates || "",
          address: payload.address || "",
          capacity: payload.capacity || "",
          runways_count: payload.runways_count || "",
          runways_length: payload.runways_length || "",
          domestic_flights: payload.domestic_flights || "",
          international_flights: payload.international_flights || "",
          destinations: payload.destinations || "",
          landmarks: payload.landmarks || [],
          transit: payload.transit || [],
          parking: payload.parking || "",
          official_website: payload.official_website || "",
          search_keywords: payload.search_keywords || ""
        };

        const basicPayload = {
          name: payload.name || payload.name_ar || "",
          code: payload.code || payload.iata_code || "",
          city: payload.city || payload.city_ar || "",
          type: payload.type || "",
          terminals: payload.terminals || payload.terminals_count || "",
          services: payload.services || [],
          airlines: payload.airlines || "",
          phone: payload.phone || "",
          map_url: payload.map_url || ""
        };

        // Check if editing item is a real database record with a valid UUID
        const isUUID = (str: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
        const isEditingDbRecord = editingItem && editingItem.id && isUUID(editingItem.id);

        if (isEditingDbRecord) {
          let { error: dbErr } = await supabase
             .from(tableName)
             .update(dbPayload)
             .eq("id", editingItem.id);
          
          if (dbErr) {
            const errorMsg = dbErr.message || "";
            if (errorMsg.includes("Could not find the") || errorMsg.includes("column") || dbErr.code === "PGRST102") {
              console.warn("Schema mismatch, retrying with basic columns only:", errorMsg);
              const { error: retryErr } = await supabase
                 .from(tableName)
                 .update(basicPayload)
                 .eq("id", editingItem.id);
              if (retryErr) throw retryErr;
            } else {
              throw dbErr;
            }
          }
          setSuccess("تم تعديل السجل بنجاح في قاعدة البيانات.");
        } else {
          // If we are editing a local fallback record (with numeric ID like 3), it does not exist in DB yet!
          // We pass dbPayload directly. Since it does not contain 'id', Supabase will generate a valid UUID.
          let { error: dbErr } = await supabase
             .from(tableName)
             .insert(dbPayload);
          
          if (dbErr) {
            const errorMsg = dbErr.message || "";
            if (errorMsg.includes("Could not find the") || errorMsg.includes("column") || dbErr.code === "PGRST102") {
              console.warn("Schema mismatch, retrying with basic columns only:", errorMsg);
              const { error: retryErr } = await supabase
                 .from(tableName)
                 .insert(basicPayload);
              if (retryErr) throw retryErr;
            } else {
              throw dbErr;
            }
          }
          setSuccess("تم إضافة السجل بنجاح إلى قاعدة البيانات.");
        }
        // Reload from DB
        const { data } = await supabase.from(tableName).select("*");
        dataSetter(data || []);
        setShowModal(false);
      } catch (err: any) {
        console.error(err);
        let errMsg = "فشلت العملية في قاعدة البيانات: " + err.message;
        if (err.message && (err.message.includes("landmarks") || err.message.includes("status") || err.message.includes("column"))) {
          errMsg += " (تنبيه: قد يكون عمود landmarks أو status غير موجود في جدول قاعدة البيانات. يرجى تشغيل كود SQL التالي في لوحة تحكم Supabase لتحديث الجداول: ALTER TABLE public.monorail_stations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'تشغيل فعلي'; ALTER TABLE public.monorail_stations ADD COLUMN IF NOT EXISTS landmarks JSONB DEFAULT '[]'::jsonb;)";
        }
        setError(errMsg);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalData(activeTab, defaultData);
      if (editingItem) {
        currentLocal = currentLocal.map((item: any) => {
          if (editingItem.id && item.id === editingItem.id) {
            return { ...item, ...payload };
          }
          // fallback search by name if id missing
          if (!editingItem.id && item.name === editingItem.name) {
            return { ...item, ...payload };
          }
          return item;
        });
        setSuccess("تم تعديل السجل بنجاح محلياً (LocalStorage).");
      } else {
        const newRecord = { 
          id: Math.random().toString(36).substr(2, 9), 
          ...payload,
          created_at: new Date().toISOString() 
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة السجل بنجاح محلياً (LocalStorage).");
      }
      saveLocalData(activeTab, currentLocal);
      dataSetter(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    setError("");
    setSuccess("");

    const isDbConnected = dbStatus[activeTab];
    const tableName = getTableName(activeTab);
    const dataSetter = getDataSetter(activeTab);
    const defaultData = getDefaultData(activeTab);

    if (isDbConnected && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from(tableName)
          .delete()
          .eq("id", item.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف السجل بنجاح من قاعدة البيانات.");
        // Reload
        const { data } = await supabase.from(tableName).select("*");
        dataSetter(data || []);
      } catch (err: any) {
        console.error(err);
        setError("فشل الحذف في قاعدة البيانات: " + err.message);
      }
    } else {
      let currentLocal = getLocalData(activeTab, defaultData);
      currentLocal = currentLocal.filter((localItem: any) => {
        if (item.id && localItem.id !== item.id) return true;
        if (!item.id && localItem.name !== item.name) return true;
        return false;
      });
      saveLocalData(activeTab, currentLocal);
      dataSetter(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً (LocalStorage).");
    }
  };

  // Filtered table rows based on activeTab and searchQuery
  const getFilteredRows = () => {
    let raw: any[] = [];
    if (activeTab === "monorail") raw = monorailData;

    else if (activeTab === "ports") raw = portsData;
    else if (activeTab === "bus_stations") raw = busStationsData;
    else if (activeTab === "microbus_stations") raw = microbusStationsData;

    if (!searchQuery) return raw;
    return raw.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const govMatch = item.governorate?.toLowerCase().includes(searchQuery.toLowerCase());
      const codeMatch = item.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const cityMatch = item.city?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || descMatch || locationMatch || govMatch || codeMatch || cityMatch;
    });
  };

  const filteredRows = getFilteredRows();

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة الخدمات...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>
      
      {/* Upper Status/Welcome banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-primary, #fff)", marginBottom: "6px" }}>
            إدارة الخدمات والنقل
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            تحرير وتحديث خدمات ومحطات ومواقف ومطارات وموانئ القاهرة ومصر.
          </p>
        </div>

        {activeTab !== "directory" && activeTab !== "directions" && (
          <button onClick={handleOpenAdd} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
            <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
            {activeTab === "ports" ? "إضافة ميناء جديد" :
             activeTab === "microbus_stations" ? "إضافة موقف سرفيس" :
             activeTab === "bus_stations" ? "إضافة موقف أتوبيس" :
             "إضافة سجل جديد"}
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid var(--border-glass)", marginBottom: "24px", scrollbarWidth: "none" }}>
        {[
          { id: "monorail", label: "المنوريل", icon: "bx bx-navigation" },
          { id: "lrt", label: "القطار الكهربائي LRT", icon: "bx bx-train" },
          { id: "ports", label: "الموانئ", icon: "bx bx-anchor" },
          { id: "microbus_stations", label: "المواقف (سرفيس)", icon: "bx bx-map-pin" },
          { id: "bus_stations", label: "الأتوبيسات (سوبرجيت)", icon: "bx bx-bus" },
          { id: "directory", label: "دليل الهواتف والأكواد", icon: "bx bx-phone-call" },
          { id: "directions", label: "خطوط المواصلات", icon: "bx bx-git-compare" }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const isConnected = dbStatus[tab.id as ServiceType];
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "lrt") {
                  router.push("/admin/lrt");
                } else if (tab.id === "bus_stations") {
                  router.push("/admin/bus-stations");
                } else {
                  setActiveTab(tab.id as ServiceType);
                  setSearchQuery("");
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                fontSize: "0.9rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s",
                border: "1px solid",
                borderColor: isActive ? "rgba(99, 102, 241, 0.4)" : "var(--border-glass)",
                background: isActive ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.02)",
                color: isActive ? "#818cf8" : "#94a3b8"
              }}
            >
              <i className={tab.icon} style={{ fontSize: "1.1rem" }} />
              <span>{tab.label}</span>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isConnected ? "#10b981" : "#f59e0b",
                boxShadow: isConnected ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
                marginRight: "4px"
              }} title={isConnected ? "متصل بقاعدة البيانات السحابية" : "يعمل بوضع الحفظ المحلي (LocalStorage)"} />
            </button>
          );
        })}
      </div>

      {/* Directory Tab Content */}
      {activeTab === "directory" && (
        <AdminDirectoryPage isSubComponent={true} />
      )}

      {/* Directions Tab Content */}
      {activeTab === "directions" && (
        <AdminDirectionsPage isSubComponent={true} />
      )}

      {activeTab !== "directory" && activeTab !== "directions" && (
        <>
          {/* SQL Warning Card if DB is using LocalStorage fallback */}
          {!dbStatus[activeTab] && (
        <div style={{
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          padding: "16px 20px",
          borderRadius: "14px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f59e0b", fontWeight: "bold" }}>
            <i className="bx bx-warning" style={{ fontSize: "1.3rem" }} />
            <span>يعمل في وضع الحفظ المحلي (LocalStorage)</span>
          </div>
          <p style={{ color: "#d97706", fontSize: "0.85rem", margin: 0, lineHeight: "1.6" }}>
            لم يتم العثور على جدول قاعدة البيانات المناسب لهذه الخدمة في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
            لتفعيل حفظ التغييرات لكل مستخدمي الموقع بشكل دائم، يرجى فتح تبويب **SQL Editor** في لوحة تحكم Supabase الخاصة بك، وتشغيل السكريبت الموجود في ملف 
            `[supabase_transport_services.sql](file:///d:/Development/Project/Cairo%20Map/supabase_transport_services.sql)`.
          </p>
        </div>
      )}

      {/* Search Input bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px", 
        flexWrap: "wrap", 
        gap: "16px" 
      }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
          <i className="bx bx-search" style={{ 
            position: "absolute", 
            right: "16px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            color: "var(--text-muted, #94a3b8)", 
            fontSize: "1.2rem" 
          }} />
          <input
            type="text"
            placeholder={
              activeTab === "ports" ? "البحث عن ميناء، محافظة..." :
              activeTab === "microbus_stations" ? "البحث عن موقف، مسار..." :
              "البحث عن محطة، مطار، موصف، أو مدينة..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ios-input"
            style={{ 
              width: "100%", 
              paddingRight: "44px", 
              borderRadius: "12px",
              height: "46px",
              fontSize: "0.95rem",
              outline: "none",
              transition: "all 0.2s"
            }}
          />
        </div>

        <div className={styles.statsCounterBadge}>
          <i className="bx bx-list-ul" style={{ fontSize: "1rem" }} />
          <span>
            {activeTab === "ports" && `إجمالي الموانئ: ${filteredRows.length}`}
            {activeTab === "microbus_stations" && `إجمالي المواقف: ${filteredRows.length}`}
            {activeTab === "bus_stations" && `إجمالي المواقف: ${filteredRows.length}`}
          </span>
        </div>
      </div>

      {/* Notification Banner */}
      {success && (
        <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px 16px", borderRadius: "10px", color: "#10b981", marginBottom: "16px", fontSize: "0.9rem" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px 16px", borderRadius: "10px", color: "#ef4444", marginBottom: "16px", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Main Table Panel or Visual View */}
      {activeTab === "monorail" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
          
          {/* Segmented Line Control */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8" }}>عرض خط سير الرحلة:</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <>
                    {[
                      { id: "all", label: "جميع المحطات", color: "#818cf8" },
                      { id: "east", label: "شرق النيل (العاصمة الإدارية)", color: "#3b82f6" },
                      { id: "west", label: "غرب النيل (6 أكتوبر)", color: "#10b981" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAdminActiveMonorailLine(opt.id as any)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          fontSize: "0.82rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          border: "1px solid",
                          borderColor: adminActiveMonorailLine === opt.id ? opt.color : "rgba(255,255,255,0.08)",
                          background: adminActiveMonorailLine === opt.id ? `rgba(${opt.id === "west" ? "16, 185, 129" : opt.id === "east" ? "59, 130, 246" : "99, 102, 241"}, 0.15)` : "rgba(255,255,255,0.02)",
                          color: adminActiveMonorailLine === opt.id ? opt.color : "#94a3b8"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </>
              </div>
            </div>
            
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)" }}>
              عدد المحطات المعروضة: <strong style={{ color: "var(--text-primary, #fff)" }}>{filteredRows.length}</strong>
            </div>
          </div>

          {/* Visual Timeline / List of Cards */}
          {filteredRows.length === 0 ? (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "48px", borderRadius: "16px", textAlign: "center", color: "var(--text-muted, #94a3b8)" }}>
              لا توجد أي محطات مطابقة لخط البحث الحالي.
            </div>
          ) : (
            <div style={{ position: "relative", paddingRight: "40px", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Timeline Connector Line */}
              <div style={{
                position: "absolute",
                top: "20px",
                bottom: "20px",
                right: "19px",
                width: "2px",
                background: "linear-gradient(to bottom, rgba(99, 102, 241, 0.4), rgba(255,255,255,0.05))",
                borderRadius: "4px"
              }} />

              {filteredRows.map((station, index) => {
                const isEast = station.line_type === "east";
                
                // Determine line color and label
                let lineColor = isEast ? "#3b82f6" : "#10b981";
                let lineName = isEast ? "شرق النيل (العاصمة)" : "غرب النيل (أكتوبر)";

                return (
                  <div key={station.id || index} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                    
                    {/* Visual Node */}
                    <div style={{
                      position: "absolute",
                      right: "-31px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#0b0f19",
                      border: `4px solid ${lineColor}`,
                      boxShadow: `0 0 10px ${lineColor}4d`,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "#fff"
                    }}>
                      {station.station_order}
                    </div>

                    {/* Glass Station Card */}
                    <div style={{
                      flex: 1,
                      background: "rgba(11, 15, 25, 0.65)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      padding: "16px 20px",
                      borderRadius: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "wrap",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      transition: "border-color 0.25s, transform 0.25s"
                    }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        
                        {/* Order & Name */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--text-primary, #fff)" }}>
                              {station.name}
                            </span>
                            <span style={{ fontSize: "0.72rem", background: lineColor + "15", color: lineColor, border: `1px solid ${lineColor}30`, padding: "2px 8px", borderRadius: "20px", fontWeight: "bold" }}>
                              {lineName}
                            </span>
                            <span style={{
                              fontSize: "0.72rem",
                              background: station.status === "تحت الإنشاء" ? "rgba(239, 68, 68, 0.12)" : (station.status === "تشغيل تجريبي" ? "rgba(251, 191, 36, 0.12)" : "rgba(16, 185, 129, 0.12)"),
                              color: station.status === "تحت الإنشاء" ? "#ef4444" : (station.status === "تشغيل تجريبي" ? "#fbbf24" : "#10b981"),
                              border: `1px solid ${station.status === "تحت الإنشاء" ? "rgba(239, 68, 68, 0.25)" : (station.status === "تشغيل تجريبي" ? "rgba(251, 191, 36, 0.25)" : "rgba(16, 185, 129, 0.25)")}`,
                              padding: "2px 8px",
                              borderRadius: "20px",
                              fontWeight: "bold"
                            }}>
                              {station.status || "تشغيل فعلي"}
                            </span>
                          </div>

                          {/* Landmarks list */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                            {station.landmarks && Array.isArray(station.landmarks) && station.landmarks.length > 0 ? (
                              (station.landmarks as string[]).map((landmark, lIdx) => (
                                <span key={lIdx} style={{ fontSize: "0.73rem", background: "rgba(255,255,255,0.02)", color: "var(--text-primary, #e2e8f0)", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid var(--border-glass)" }}>
                                  <i className="bx bx-map-pin" style={{ color: lineColor, fontSize: "0.8rem" }} />
                                  {landmark}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "#475569", fontStyle: "italic" }}>
                                📍 لم يتم تحديد معالم قريبة بعد
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(station)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            color: "#34c759",
                            border: "1px solid rgba(52, 199, 89, 0.2)",
                            background: "rgba(52, 199, 89, 0.05)"
                          }}
                          title="تعديل المحطة"
                        >
                          <i className="bx bx-edit" style={{ fontSize: "1.1rem" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(station)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            color: "#ff3b30",
                            border: "1px solid rgba(255, 59, 48, 0.2)",
                            background: "rgba(255, 59, 48, 0.05)"
                          }}
                          title="حذف المحطة"
                        >
                          <i className="bx bx-trash" style={{ fontSize: "1.1rem" }} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>
      ) : (
        <div className={styles.tableCard} style={{ overflowX: "auto" }}>
          <table className={styles.adminTable} style={{ width: "100%" }}>
            <thead className={styles.adminThead}>
              <tr className={styles.adminTr}>

                {activeTab === "ports" && (
                  <>
                    <th className={styles.adminTh}>اسم الميناء</th>
                    <th className={styles.adminTh}>المحافظة</th>
                    <th className={styles.adminTh}>المسطح المائي</th>
                    <th className={styles.adminTh}>النوع</th>
                    <th className={styles.adminTh}>السعة الاستيعابية</th>
                    <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
                  </>
                )}
                {activeTab === "microbus_stations" && (
                  <>
                    <th className={styles.adminTh}>اسم الموقف</th>
                    <th className={styles.adminTh}>المحافظة</th>
                    <th className={styles.adminTh}>العنوان بالتفصيل</th>
                    <th className={styles.adminTh}>عدد الخطوط</th>
                    <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
                  </>
                )}
                {activeTab === "bus_stations" && (
                  <>
                    <th className={styles.adminTh}>اسم الموقف</th>
                    <th className={styles.adminTh}>المحافظة</th>
                    <th className={styles.adminTh}>العنوان بالتفصيل</th>
                    <th className={styles.adminTh}>الوجهات المتاحة</th>
                    <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr className={styles.adminTr}>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    لا توجد أي سجلات متوفرة حالياً.
                  </td>
                </tr>
              ) : (
                filteredRows.map((item, idx) => (
                  <tr key={item.id || idx} className={styles.adminTr}>

                    {activeTab === "ports" && (
                      <>
                        <td className={styles.adminTd} style={{ fontWeight: "bold" }}>{item.name}</td>
                        <td className={styles.adminTd}>{item.governorate}</td>
                        <td className={styles.adminTd}>{item.sea}</td>
                        <td className={styles.adminTd}>
                          <span className={styles.portTypeBadge}>{item.type}</span>
                        </td>
                        <td className={styles.adminTd} title={item.capacity} style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.capacity}</td>
                      </>
                    )}
                    {activeTab === "microbus_stations" && (
                      <>
                        <td className={styles.adminTd} style={{ fontWeight: "bold" }}>{item.name}</td>
                        <td className={styles.adminTd}>{item.governorate}</td>
                        <td className={styles.adminTd} title={item.location} style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.location}</td>
                        <td className={styles.adminTd}>
                          <span className={styles.microbusRouteBadge}>{Array.isArray(item.routes) ? item.routes.length : 0} مساراً</span>
                        </td>
                      </>
                    )}
                    {activeTab === "bus_stations" && (
                      <>
                        <td className={styles.adminTd} style={{ fontWeight: "bold" }}>{item.name}</td>
                        <td className={styles.adminTd}>{item.governorate}</td>
                        <td className={styles.adminTd} title={item.location} style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.location}</td>
                        <td className={styles.adminTd} title={Array.isArray(item.destinations) ? item.destinations.join("، ") : ""} style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {Array.isArray(item.destinations) ? item.destinations.join("، ") : ""}
                        </td>
                      </>
                    )}
                    <td className={styles.adminTd}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => handleOpenEdit(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="تعديل">
                          <i className="bx bx-edit" />
                          <span>تعديل</span>
                        </button>
                        <button onClick={() => handleDelete(item)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="حذف">
                          <i className="bx bx-trash" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Forms Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="glass-panel" style={{
            width: "100%",
            maxWidth: "650px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "30px",
            border: "1px solid var(--border-glass)",
            background: "#0f172a",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#fff", margin: 0 }}>
                {editingItem ? "تعديل بيانات السجل" : "إضافة سجل جديد لـ " + (
                  activeTab === "monorail" ? "المنوريل" :
                  
                  activeTab === "ports" ? "الموانئ" :
                  activeTab === "microbus_stations" ? "مواقف الميكروباص" : "أتوبيسات السفر"
                )}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: "32px", height: "32px", borderRadius: "50%", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Monorail & LRT Form */}
              {activeTab === "monorail" && (
                <>
                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>اسم المحطة *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المسار / الخط *</label>
                    <select
                      value={formData.line_type || ""}
                      onChange={e => setFormData({ ...formData, line_type: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", background: "#1e293b" }}
                    >
                        <>
                          <option value="east">شرق النيل (العاصمة الإدارية)</option>
                          <option value="west">غرب النيل (6 أكتوبر)</option>
                        </>
                    </select>
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>ترتيب المحطة في المسار *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.station_order || 1}
                      onChange={e => setFormData({ ...formData, station_order: parseInt(e.target.value) })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المعالم والأماكن القريبة (مفصولة بفاصلة)</label>
                    <input
                      type="text"
                      placeholder="مثال: ستاد القاهرة الدولي, مسجد آل رشدان, نادي الزهور الرياضي"
                      value={formData.landmarks || ""}
                      onChange={e => setFormData({ ...formData, landmarks: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>حالة المحطة *</label>
                    <select
                      value={formData.status || "تحت الإنشاء"}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", background: "#1e293b" }}
                    >
                      <option value="تشغيل تجريبي">تشغيل تجريبي (تجريبي)</option>
                      <option value="تحت الإنشاء">تحت الإنشاء (ليست في الخدمة)</option>
                      <option value="تشغيل فعلي">تشغيل فعلي (في الخدمة)</option>
                    </select>
                  </div>
                </>
              )}


              {/* Ports Form */}
              {activeTab === "ports" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>اسم الميناء *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المحافظة *</label>
                      <input
                        type="text"
                        required
                        value={formData.governorate || ""}
                        onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المسطح المائي (البحر) *</label>
                      <input
                        type="text"
                        required
                        placeholder="البحر الأبيض المتوسط / البحر الأحمر"
                        value={formData.sea || ""}
                        onChange={e => setFormData({ ...formData, sea: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>نوع الميناء *</label>
                      <input
                        type="text"
                        required
                        placeholder="تجاري / سياحي / صناعي"
                        value={formData.type || ""}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>السعة الاستيعابية / الأهمية التجارية *</label>
                    <input
                      type="text"
                      required
                      value={formData.capacity || ""}
                      onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوصف والخدمات التفصيلية</label>
                    <textarea
                      value={formData.description || ""}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "80px", resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>رابط خريطة جوجل *</label>
                    <input
                      type="url"
                      required
                      value={formData.map_url || ""}
                      onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}

              {/* Bus Stations Form */}
              {activeTab === "bus_stations" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>اسم الموقف *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المحافظة *</label>
                      <input
                        type="text"
                        required
                        value={formData.governorate || ""}
                        onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      value={formData.location || ""}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوجهات المتاحة (افصل بينها بفاصلة) *</label>
                    <input
                      type="text"
                      required
                      placeholder="الإسكندرية, شرم الشيخ, أسيوط..."
                      value={formData.destinations || ""}
                      onChange={e => setFormData({ ...formData, destinations: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الشركات المشغلة وساعات العمل (بتنسيق JSON) *</label>
                    <textarea
                      required
                      placeholder='[{"name": "السوبر جيت", "phone": "19142", "type": "رسمي"}]'
                      value={formData.companies || ""}
                      onChange={e => setFormData({ ...formData, companies: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "100px", fontFamily: "monospace", direction: "ltr", textAlign: "left" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوصف وملاحظات السفر</label>
                    <textarea
                      value={formData.description || ""}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "80px", resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>رابط خريطة جوجل *</label>
                    <input
                      type="url"
                      required
                      value={formData.map_url || ""}
                      onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}

              {/* Microbus Stations Form */}
              {activeTab === "microbus_stations" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>اسم الموقف *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المحافظة *</label>
                      <input
                        type="text"
                        required
                        value={formData.governorate || ""}
                        onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      value={formData.location || ""}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المسارات والتعريفة (بتنسيق JSON) *</label>
                    <textarea
                      required
                      placeholder='[{"destination": "6 أكتوبر", "fare": "11 ج.م", "vehicleType": "ميكروباص"}]'
                      value={formData.routes || ""}
                      onChange={e => setFormData({ ...formData, routes: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "130px", fontFamily: "monospace", direction: "ltr", textAlign: "left" }}
                    />
                  </div>

                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>رابط خريطة جوجل *</label>
                    <input
                      type="url"
                      required
                      value={formData.map_url || ""}
                      onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "14px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.backToSiteBtn} style={{ margin: 0 }}>
                  إلغاء
                </button>
                <button type="submit" className="ios-btn" style={{ margin: 0, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", padding: "10px 24px" }}>
                  {editingItem ? "حفظ التغييرات" : "إضافة السجل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

