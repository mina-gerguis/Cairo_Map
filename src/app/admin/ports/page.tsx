"use client";

import React, { useState, useEffect, Suspense } from "react";
import clxs from "clsx";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import CustomModal from "@/components/common/Modals";

const DEFAULT_PORTS: any[] = [
  {
    name: "ميناء الإسكندرية البحري",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / ركاب / سياحي / حاويات",
    capacity: "أكثر من 60% من تجارة مصر الخارجية تعبر من خلاله.",
    description: "أقدّم وأكبر ميناء بحري تجاري في مصر. يضم محطة ركاب سياحية حديثة، ومحطات متطورة لتداول الحاويات، والبضائع العامة، والصب الجاف والسائل.",
    berths_count: "أكثر من 80 رصيفاً مجهزاً بمختلف أعماق الملاحة",
    connections: ["طريق الإسكندرية - القاهرة الصحراوي", "محور التعمير الدولي", "شبكة السكك الحديدية القومية"],
    operator: "هيئة ميناء الإسكندرية",
    status: "تشغيل فعلي - تطوير شامل",
    map_url: "https://maps.google.com/?q=Alexandria+Port"
  },
  {
    name: "ميناء الدخيلة",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / صناعي / صب جاف",
    capacity: "الامتداد الطبيعي والمكمل لميناء الإسكندرية لاستيعاب السفن العملاقة.",
    description: "يقع غرب ميناء الإسكندرية على موقع متميز، ويخدم بصفة خاصة المجمعات الصناعية الكبرى ومصانع الحديد والصلب والحبوب بفضل أرصفته العميقة.",
    berths_count: "أرصفة عملاقة بأعماق تصل إلى 15 متراً",
    connections: ["محور الدخيلة المباشر للطريق الساحلي الدولي", "خطوط الشحن الحديدية"],
    operator: "هيئة ميناء الإسكندرية",
    status: "تشغيل فعلي",
    map_url: "https://maps.google.com/?q=Dekheila+Port"
  },
  {
    name: "ميناء دمياط",
    governorate: "دمياط",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / حاويات / غاز طبيعي مسال",
    capacity: "مركز محوري لتداول الحاويات وتسييل الغاز بالقرب من مدخل قناة السويس.",
    description: "من أهم الموانئ المصرية الحديثة والمتطورة. يتضمن أحدث محطات تداول الحاويات، ومصنعاً لتسييل وتصدير الغاز الطبيعي، إلى جانب ممر ملاحي نهري يربطه بالنيل.",
    berths_count: "محطات حاويات وحبوب وغاز متطورة مع أرصفة متعددة",
    connections: ["الطريق الدولي الساحلي", "محور دمياط - المنصورة", "الممر الملاحي لنهر النيل"],
    operator: "هيئة ميناء دمياط",
    status: "تشغيل فعلي - مشروع محطة تحيا مصر 1",
    map_url: "https://maps.google.com/?q=Damietta+Port"
  },
  {
    name: "ميناء بورسعيد (شرق وغرب)",
    governorate: "بورسعيد",
    sea: "البحر الأبيض المتوسط / مدخل القناة",
    type: "تجاري محوري / حاويات ترانزيت عالمي",
    capacity: "موقع استراتيجي فريد مباشرة عند المدخل الشمالي لقناة السويس.",
    description: "يشمل ميناء غرب بورسعيد التاريخي وميناء شرق بورسعيد العملاق، والذي يعد من أسرع موانئ تداول الحاويات نمواً في العالم، ويعمل كمحطة ترانزيت رئيسية لربط خطوط التجارة بين الشرق والغرب.",
    berths_count: "أرصفة حاويات عملاقة بأعماق تصل إلى 18.5 متراً",
    connections: ["أنفاق بورسعيد (3 يوليو)", "محور 30 يونيو شريان سيناء", "قناة السويس الملاحية"],
    operator: "الهيئة العامة للمنطقة الاقتصادية لقناة السويس",
    status: "تشغيل فعلي - توسعات عالمية مستمرة",
    map_url: "https://maps.google.com/?q=Port+Said+Port"
  },
  {
    name: "ميناء العين السخنة",
    governorate: "السويس",
    sea: "خليج السويس / البحر الأحمر",
    type: "تجاري / صناعي / بتروكيماويات / حاويات",
    capacity: "أكبر وأعمق ميناء مائي على خليج السويس لأحدث جيل من السفن.",
    description: "ميناء محوري يخدم المنطقة الاقتصادية لقناة السويس، وتعد البوابة الجنوبية الرئيسية للبضائع القادمة من آسيا وشرق إفريقيا نحو القاهرة والدلتا. يرتبط بالقطار الكهربائي السريع.",
    berths_count: "4 أحواض رئيسية عملاقة بأعماق تصل إلى 18 متراً",
    connections: ["القطار الكهربائي السريع (HSR)", "طريق القطامية - السخنة", "طريق السويس - السخنة"],
    operator: "الهيئة العامة للمنطقة الاقتصادية لقناة السويس",
    status: "تشغيل فعلي - مشروع الميناء الكبير",
    map_url: "https://maps.google.com/?q=Sokhna+Port"
  },
  {
    name: "ميناء سفاجا البحري",
    governorate: "البحر الأحمر",
    sea: "البحر الأحمر",
    type: "ركاب / تعديني / تجاري / سياحي",
    capacity: "البوابة البحرية الرئيسية لخدمة محافظات الصعيد وحركة الركاب مع دول الخليج.",
    description: "يتميز بموقعه الاستراتيجي وقربه من مدن الصعيد والأقصر، ويعتبر الميناء الرئيسي لحركة المعتمرين والحجاج والعمالة المسافرة عبر البحر الأحمر، فضلاً عن تصدير الفوسفات والألومنيوم.",
    berths_count: "محطة ركاب حديثة وأرصفة متخصصة للصب الجاف والتعدين",
    connections: ["طريق سفاجا - قنا (المثلث الذهبي)", "طريق الغردقة - سفاجا الساحلي"],
    operator: "هيئة موانئ البحر الأحمر",
    status: "تشغيل فعلي - إنشاء ميناء سفاجا 2",
    map_url: "https://maps.google.com/?q=Safaga+Port"
  },
  {
    name: "ميناء نويبع",
    governorate: "جنوب سيناء",
    sea: "خليج العقبة / البحر الأحمر",
    type: "ركاب / شاحنات (ميناء الجسر العربي)",
    capacity: "يربط مصر بالأردن والمشرق العربي عبر خط الجسر العربي الملاحي.",
    description: "يقع على خليج العقبة ويخدم حركة التجارة والركاب والتبادل البيني للشاحنات بين مصر والأردن ودول الخليج العربي والشام بخدمة العبّارات الجاسرة.",
    berths_count: "محطة ركاب متطورة وأرصفة عبّارات الشاحنات (Ro-Ro)",
    connections: ["طريق نويبع - طابا الدولي", "طريق النفق - نويبع عبر سيناء"],
    operator: "هيئة موانئ البحر الأحمر",
    status: "تشغيل فعلي",
    map_url: "https://maps.google.com/?q=Nuweiba+Port"
  },
  {
    name: "ميناء السويس (بورتوفيق)",
    governorate: "السويس",
    sea: "خليج السويس / البحر الأحمر",
    type: "ركاب / بترول / صيانة سفن",
    capacity: "الميناء التاريخي عند المدخل الجنوبي لقناة السويس.",
    description: "يتخصص في تداول المواد البترولية وركاب العبّارات، ويضم ترسانات إصلاح وصيانة السفن ومحطة ركاب بورتوفيق التاريخية.",
    berths_count: "أرصفة بترول وركاب ورصيف ترسانة صيانة السفن",
    connections: ["طريق القاهرة - السويس الصحراوي", "أنفاق الشهيد أحمد حمدي"],
    operator: "هيئة موانئ البحر الأحمر / هيئة قناة السويس",
    status: "تشغيل فعلي",
    map_url: "https://maps.google.com/?q=Port+Tewfik+Suez"
  },
  {
    name: "ميناء جرجوب البحري (النجيلة)",
    governorate: "مطروح",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / صناعي / لوجستي حديث",
    capacity: "أحدث ميناء تجاري مصري غرب البلاد لخدمة التجارة مع أوروبا وأفريقيا.",
    description: "ميناء عملاق حديث يقع بمدينة النجيلة بمحافظة مطروح، يخدم المنطقة اللوجستية الغربية وحركة التجارة عبر المتوسط وتصدير المنتجات الزراعية والمواد الخام.",
    berths_count: "أرصفة عملاقة بأعماق تصل إلى 17 متراً",
    connections: ["طريق مطروح - السلوم الدولي", "شبكة القطار السريع (مرسى مطروح)"],
    operator: "الهيئة العامة لموانئ مصر",
    status: "تشغيل جديد / تطوير مستمر",
    map_url: "https://maps.google.com/?q=Gargoub+Port"
  },
  {
    name: "ميناء العريش البحري",
    governorate: "شمال سيناء",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / تصديري / بضائع عامة",
    capacity: "البوابة البحرية الوحيدة لشمال سيناء لتصدير المنتجات التعدينية والملح.",
    description: "شهد عمليات تطوير شاملة بأرصفة وحواجز أمواج بطول كيلومترات لتصدير الأسمنت والملح والمنتجات التعدينية من سيناء إلى الأسواق العالمية.",
    berths_count: "أرصفة مطورة وحواجز أمواج بطول 3 كم",
    connections: ["طريق القنطرة - العريش الدولي", "شبكة طرق شمال سيناء"],
    operator: "الهيئة العامة للمنطقة الاقتصادية لقناة السويس",
    status: "تطوير شامل وتشغيل",
    map_url: "https://maps.google.com/?q=Arish+Port"
  }
];

export default function AdminPortsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-textSecondary)" }}>جاري التحميل...</div>}>
      <AdminPortsInner />
    </Suspense>
  );
}

function AdminPortsInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portsData, setPortsData] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [portToDelete, setPortToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    governorate: "",
    sea: "",
    type: "",
    capacity: "",
    description: "",
    berths_count: "",
    operator: "",
    status: "",
    map_url: ""
  });

  const getLocalData = (): any[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_ports");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          return DEFAULT_PORTS;
        }
      }
    }
    return DEFAULT_PORTS;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_ports", JSON.stringify(data));
    }
  };

  const fetchPortsData = async () => {
    if (!supabase) {
      setPortsData(getLocalData());
      setDbStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("ports").select("*");
      if (error) {
        console.warn("Failed to fetch ports, using fallback.", error);
        setPortsData(getLocalData());
        setDbStatus(false);
      } else {
        const mappedData = data ? data : [];
        const enriched = mappedData.map(dbPort => {
          const localMatch = DEFAULT_PORTS.find(
            lp => lp.name.includes(dbPort.name) || dbPort.name.includes(lp.name)
          );
          return {
            ...localMatch,
            ...dbPort
          };
        });

        const dbNames = new Set(mappedData.map(d => (d.name || "").toLowerCase()));
        const missingLocals = DEFAULT_PORTS.filter(lp => !dbNames.has((lp.name || "").toLowerCase()));

        setPortsData([...enriched, ...missingLocals]);
        setDbStatus(true);
      }
    } catch (err) {
      console.error(err);
      setPortsData(getLocalData());
      setDbStatus(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) {
        setIsAdmin(true);
        setLoading(false);
        setPortsData(getLocalData());
        setDbStatus(false);
        return;
      }

      try {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileErr || !profile?.is_admin) {
          router.push("/");
        } else {
          setIsAdmin(true);
          await fetchPortsData();
        }
      } catch (err) {
        console.error("Auth authorization check failed", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    setFormData({
      name: "",
      governorate: "",
      sea: "",
      type: "",
      capacity: "",
      description: "",
      berths_count: "",
      operator: "",
      status: "تشغيل فعلي",
      map_url: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      ...item
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let payload = { ...formData };

    if (dbStatus && supabase) {
      try {
        const fullPayload = {
          name: payload.name || "",
          governorate: payload.governorate || "",
          sea: payload.sea || "",
          type: payload.type || "",
          capacity: payload.capacity || "",
          description: payload.description || "",
          berths_count: payload.berths_count || "",
          operator: payload.operator || "",
          status: payload.status || "تشغيل فعلي",
          map_url: payload.map_url || ""
        };

        const basicPayload = {
          name: payload.name || "",
          governorate: payload.governorate || "",
          sea: payload.sea || "",
          type: payload.type || "",
          capacity: payload.capacity || "",
          description: payload.description || "",
          map_url: payload.map_url || ""
        };

        const isUUID = (str: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
        const isEditingDbRecord = editingItem && editingItem.id && isUUID(editingItem.id);

        if (isEditingDbRecord) {
          let { error: dbErr } = await supabase
            .from("ports")
            .update(fullPayload)
            .eq("id", editingItem.id);

          if (dbErr) {
            const errorMsg = dbErr.message || "";
            if (errorMsg.includes("Could not find the") || errorMsg.includes("column") || dbErr.code === "PGRST102") {
              console.warn("Schema mismatch, retrying with basic columns only:", errorMsg);
              const { error: retryErr } = await supabase
                .from("ports")
                .update(basicPayload)
                .eq("id", editingItem.id);
              if (retryErr) throw retryErr;
            } else {
              throw dbErr;
            }
          }
          setSuccess("تم تعديل بيانات الميناء بنجاح في قاعدة البيانات.");
        } else {
          let { error: dbErr } = await supabase
            .from("ports")
            .insert(fullPayload);

          if (dbErr) {
            const errorMsg = dbErr.message || "";
            if (errorMsg.includes("Could not find the") || errorMsg.includes("column") || dbErr.code === "PGRST102") {
              console.warn("Schema mismatch, retrying with basic columns only:", errorMsg);
              const { error: retryErr } = await supabase
                .from("ports")
                .insert(basicPayload);
              if (retryErr) throw retryErr;
            } else {
              throw dbErr;
            }
          }
          setSuccess("تم إضافة الميناء بنجاح إلى قاعدة البيانات.");
        }
        await fetchPortsData();
        setShowModal(false);
      } catch (err: any) {
        console.error(err);
        let errMsg = "فشلت العملية في قاعدة البيانات: " + err.message;
        if (err.message && (err.message.includes("berths_count") || err.message.includes("column"))) {
          errMsg += " (تنبيه: يمكنك إضافة الأعمدة الاختيارية لقاعدة البيانات بتشغيل: ALTER TABLE public.ports ADD COLUMN IF NOT EXISTS berths_count TEXT; ALTER TABLE public.ports ADD COLUMN IF NOT EXISTS operator TEXT; ALTER TABLE public.ports ADD COLUMN IF NOT EXISTS status TEXT;)";
        }
        setError(errMsg);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalData();
      if (editingItem) {
        currentLocal = currentLocal.map((item: any) => {
          if (editingItem.id && item.id === editingItem.id) {
            return { ...item, ...payload };
          }
          if (!editingItem.id && item.name === editingItem.name) {
            return { ...item, ...payload };
          }
          return item;
        });
        setSuccess("تم تعديل السجل بنجاح محلياً.");
      } else {
        const newRecord = {
          id: Date.now().toString(),
          ...payload
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة الميناء بنجاح محلياً.");
      }
      saveLocalData(currentLocal);
      setPortsData(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = (item: any) => {
    setPortToDelete(item);
  };

  const confirmDelete = async () => {
    if (!portToDelete) return;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("ports")
          .delete()
          .eq("id", portToDelete.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف الميناء بنجاح من قاعدة البيانات.");
        await fetchPortsData();
        setPortToDelete(null);
      } catch (err: any) {
        console.error(err);
        setError("فشل الحذف في قاعدة البيانات: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    } else {
      let currentLocal = getLocalData();
      currentLocal = currentLocal.filter((localItem: any) => {
        if (portToDelete.id && localItem.id !== portToDelete.id) return true;
        if (!portToDelete.id && localItem.name !== portToDelete.name) return true;
        return false;
      });
      saveLocalData(currentLocal);
      setPortsData(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً.");
      setPortToDelete(null);
      setIsDeleting(false);
    }
  };

  // Filter rows based on search query
  const filteredRows = portsData.filter(item => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const name = (item.name || "").toLowerCase();
    const gov = (item.governorate || "").toLowerCase();
    const sea = (item.sea || "").toLowerCase();
    const type = (item.type || "").toLowerCase();
    const cap = (item.capacity || "").toLowerCase();
    return name.includes(term) || gov.includes(term) || sea.includes(term) || type.includes(term) || cap.includes(term);
  });

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--colorSecondary, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة الموانئ البحرية...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>

      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--textPrimary, #fff)", marginBottom: "6px" }}>
            إدارة الموانئ البحرية
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            إضافة وتعديل وحذف الموانئ المصرية على البحرين المتوسط والأحمر وتحديث السعة والقدرات التشغيلية.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          إضافة ميناء جديد
        </button>
      </div>

      {/* SQL Warning Card if DB is using LocalStorage fallback */}
      {!dbStatus && (
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
            لم يتم العثور على جدول قاعدة البيانات المناسب لجدول الموانئ (`ports`) في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
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
            color: "var(--textMuted)",
            fontSize: "1.2rem"
          }} />
          <input
            type="text"
            placeholder="البحث عن ميناء باسمه، المحافظة، المسطح المائي..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "44px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textSecondary)"
            }}
          />
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          إجمالي الموانئ: {filteredRows.length}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", color: "#ff453a", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)", color: "#30d158", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem" }}>
          {success}
        </div>
      )}

      {/* Table grid */}
      <div className={styles.tableCard} style={{ overflowX: "auto" }}>
        <table className={styles.adminTable} style={{ width: "100%" }}>
          <thead className={styles.adminThead}>
            <tr className={styles.adminTr}>
              <th className={styles.adminTh}>اسم الميناء</th>
              <th className={styles.adminTh}>المحافظة</th>
              <th className={styles.adminTh}>المسطح المائي</th>
              <th className={styles.adminTh}>النوع والتخصص</th>
              <th className={styles.adminTh}>السعة والأهمية</th>
              <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr className={styles.adminTr}>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  لا توجد أي سجلات موانئ متوفرة حالياً.
                </td>
              </tr>
            ) : (
              filteredRows.map((item, idx) => (
                <tr key={item.id || idx} className={styles.adminTr}>
                  <td className={styles.adminTd} style={{ width: "20%", fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="bx bx-anchor" style={{ color: "#3b82f6", fontSize: "1.1rem" }} />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className={styles.adminTd} style={{ width: "10%" }}>
                    <span>{item.governorate}</span>
                  </td>
                  <td className={styles.adminTd} style={{ width: "20%" }}>
                    <span style={{ fontSize: "0.88rem", color: "#60a5fa" }}>{item.sea}</span>
                  </td>
                  <td className={styles.adminTd} style={{ width: "20%" }}>
                    <span className={styles.portTypeBadge} style={{
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "#818cf8",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "bold"
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td className={styles.adminTd} title={item.capacity} style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.capacity}</span>
                  </td>
                  <td className={styles.adminTd}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => handleOpenEdit(item)} title="تعديل"
                      className="actionBtn actionBtnEdit"
                      >
                        <i className="bx bx-edit-alt" />
                      </button>
                      <button onClick={() => handleDelete(item)} title="حذف"
                       className="actionBtn actionBtnDelete"
                      >
                        <i className="bx bx-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(portToDelete)}
        onClose={() => !isDeleting && setPortToDelete(null)}
        title="تأكيد حذف الميناء"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message={portToDelete ? `هل أنت متأكد من رغبتك في حذف ميناء "${portToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : undefined}
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDelete,
          bgColor: "#ff3b30",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setPortToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      />

      {/* Forms Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
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
            border: "1px solid var(--borderGlass)",
            background: "var(--bgGlass)",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "900",margin: 0 }}>
                {editingItem ? "تعديل بيانات الميناء" : "إضافة ميناء جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} className="closeBtn">
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>اسم الميناء *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المحافظة *</label>
                  <input
                    type="text"
                    required
                    value={formData.governorate || ""}
                    onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المسطح المائي (البحر) *</label>
                  <input
                    type="text"
                    required
                    placeholder="البحر الأبيض المتوسط / البحر الأحمر"
                    value={formData.sea || ""}
                    onChange={e => setFormData({ ...formData, sea: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>نوع الميناء وتخصصه *</label>
                  <input
                    type="text"
                    required
                    placeholder="تجاري / سياحي / صناعي / حاويات"
                    value={formData.type || ""}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>السعة الاستيعابية / الأهمية التجارية *</label>
                <input
                  type="text"
                  required
                  value={formData.capacity || ""}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>الوصف والخدمات التفصيلية</label>
                <textarea
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%", height: "80px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>الهيئة المشغلة</label>
                  <input
                    type="text"
                    placeholder="هيئة ميناء الإسكندرية / هيئة موانئ البحر الأحمر"
                    value={formData.operator || ""}
                    onChange={e => setFormData({ ...formData, operator: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>الحالة التشغيلية</label>
                  <input
                    type="text"
                    placeholder="تشغيل فعلي / تطوير شامل"
                    value={formData.status || ""}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>رابط خريطة جوجل *</label>
                <input
                  type="url"
                  required
                  value={formData.map_url || ""}
                  onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                 className="btn btn-cancel"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                 className="btn btn-primary"
                >
                  {editingItem ? "حفظ التعديلات" : "إضافة الميناء"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
