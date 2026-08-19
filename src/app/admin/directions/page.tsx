"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from "../admin.module.css";

interface RouteLeg {
  title: string;
  vehicleType?: string;
  cost?: number;
  duration?: string;
  steps: string[];
}

interface RouteEntry {
  id: string;
  from_location: string;
  to_location: string;
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs?: RouteLeg[];
  tips?: string;
  from_aliases?: string;
  to_aliases?: string;
  map_link?: string;
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

interface FormLeg {
  title: string;
  vehicleType: string;
  cost: string;
  duration: string;
  steps: string[];
}

interface FormOption {
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  type_name: string;
  icon: string;
  cost: string;
  duration: string;
  durationMinutes: number | "";
  steps: string[];
  legs: FormLeg[];
  tips: string;
  map_link: string;
}

interface GroupedRoute {
  from_location: string;
  to_location: string;
  from_aliases?: string;
  to_aliases?: string;
  options: Array<{
    id?: string;
    type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
    type_name: string;
    icon: string;
    cost: number;
    duration: string;
    steps: string[];
    legs?: RouteLeg[];
    tips?: string;
    map_link?: string;
  }>;
}

function getErrorMessage(err: unknown): string {
  if (!err) return "حدث خطأ غير معروف";
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    try {
      return JSON.stringify(err);
    } catch {
      return "خطأ في قراءة تفاصيل الاستجابة";
    }
  }
  return String(err);
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

export default function AdminDirectionsPage({ isSubComponent = false }: { isSubComponent?: boolean }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(isSubComponent ? true : false);
  const [loading, setLoading] = useState(isSubComponent ? false : true);
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [dbMissing, setDbMissing] = useState(false);

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<{ from_location: string; to_location: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromAliases, setFromAliases] = useState("");
  const [toAliases, setToAliases] = useState("");

  const defaultLeg = (num: number = 1): FormLeg => ({
    title: `المرحلة ${num === 1 ? "الأولى" : num === 2 ? "الثانية" : num === 3 ? "الثالثة" : `${num}`}: تفاصيل المرحلة`,
    vehicleType: "ميكروباص",
    cost: "",
    duration: "",
    steps: ["اركب...", "اوصل...", "انزل..."]
  });

  const defaultOption = (): FormOption => ({
    type: "microbus",
    type_name: "ميكروباص مباشر",
    icon: "bx bx-bus",
    cost: "0",
    duration: "",
    durationMinutes: "",
    steps: [""],
    legs: [defaultLeg(1)],
    tips: "",
    map_link: ""
  });

  const [options, setOptions] = useState<FormOption[]>([defaultOption()]);

  const resetForm = () => {
    setFromLocation("");
    setToLocation("");
    setFromAliases("");
    setToAliases("");
    setOptions([defaultOption()]);
    setEditingConnection(null);
    setError("");
  };

  const checkAdminAndFetch = async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchRoutes();
    } catch (err) {
      console.error("Verification error:", err);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("transit_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "P0001" || error.message.includes("does not exist")) {
          setDbMissing(true);
          loadFromLocalStorage();
        } else {
          throw error;
        }
      } else {
        setDbMissing(false);
        const formatted = ((data || []) as unknown as DbTransitRoute[]).map((item) => {
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

          return {
            id: item.id,
            from_location: item.from_location,
            to_location: item.to_location,
            type: item.type,
            type_name: item.type_name,
            icon: item.icon,
            cost: item.cost,
            duration: item.duration,
            steps: Array.isArray(stepsArr) ? stepsArr : [],
            legs: Array.isArray(legsArr) ? legsArr : undefined,
            tips: item.tips || undefined,
            from_aliases: item.from_aliases || undefined,
            to_aliases: item.to_aliases || undefined,
            map_link: item.map_link || undefined
          };
        });
        setRoutes(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setError("حدث خطأ أثناء جلب المسارات من قاعدة البيانات.");
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("dftry_admin_local_routes");
    if (saved) {
      try {
        setRoutes(JSON.parse(saved));
      } catch {
        setRoutes([]);
      }
    }
  };

  const saveToLocalStorage = (newRoutes: RouteEntry[]) => {
    localStorage.setItem("dftry_admin_local_routes", JSON.stringify(newRoutes));
    setRoutes(newRoutes);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const init = async () => {
      await checkAdminAndFetch();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  // Group routes list for UI display
  const groupedRoutesList = useMemo(() => {
    const grouped: Record<string, GroupedRoute> = {};
    (routes || []).forEach(r => {
      const key = `${(r.from_location || "").trim()}|||${(r.to_location || "").trim()}`;
      if (!grouped[key]) {
        grouped[key] = {
          from_location: r.from_location,
          to_location: r.to_location,
          from_aliases: r.from_aliases,
          to_aliases: r.to_aliases,
          options: []
        };
      }
      grouped[key].options.push({
        id: r.id,
        type: r.type,
        type_name: r.type_name,
        icon: r.icon,
        cost: r.cost,
        duration: r.duration,
        steps: Array.isArray(r.steps) ? r.steps : [],
        legs: Array.isArray(r.legs) ? r.legs : undefined,
        tips: r.tips,
        map_link: r.map_link
      });
    });
    return Object.values(grouped);
  }, [routes]);

  // Options Helper Functions
  const updateOption = (index: number, field: keyof FormOption, value: FormOption[keyof FormOption]) => {
    setOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOptionFields = (index: number, updates: Partial<FormOption>) => {
    setOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const addOptionField = () => {
    setOptions([...options, defaultOption()]);
  };

  const removeOptionField = (index: number) => {
    if (options.length === 1) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  // Leg Management Helpers
  const addLegToOption = (optIdx: number) => {
    const updated = [...options];
    const newLegNum = (updated[optIdx]?.legs || []).length + 1;
    updated[optIdx].legs.push(defaultLeg(newLegNum));
    setOptions(updated);
  };

  const removeLegFromOption = (optIdx: number, legIdx: number) => {
    const updated = [...options];
    if ((updated[optIdx]?.legs || []).length === 1) return;
    updated[optIdx].legs = updated[optIdx].legs.filter((_, idx) => idx !== legIdx);
    setOptions(updated);
  };

  const updateLegField = (optIdx: number, legIdx: number, field: keyof FormLeg, val: string) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx]) {
      legsCopy[legIdx] = { ...legsCopy[legIdx], [field]: val };
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const updateLegStep = (optIdx: number, legIdx: number, stepIdx: number, val: string) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx]) {
      const stepsCopy = [...(legsCopy[legIdx].steps || [])];
      stepsCopy[stepIdx] = val;
      legsCopy[legIdx].steps = stepsCopy;
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const addLegStep = (optIdx: number, legIdx: number) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx]) {
      legsCopy[legIdx].steps = [...(legsCopy[legIdx].steps || []), ""];
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const removeLegStep = (optIdx: number, legIdx: number, stepIdx: number) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx] && (legsCopy[legIdx].steps || []).length > 1) {
      legsCopy[legIdx].steps = legsCopy[legIdx].steps.filter((_, idx) => idx !== stepIdx);
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) {
      setError("يرجى إدخال نقطة الانطلاق والوصول.");
      return;
    }

    // Validate all options & legs
    for (let i = 0; i < (options || []).length; i++) {
      const opt = options[i];
      if (!opt.type_name.trim() || !opt.duration.trim()) {
        setError(`يرجى إكمال بيانات وسيلة المواصلات رقم ${i + 1}`);
        return;
      }
      if (!opt.legs || opt.legs.length === 0) {
        setError(`يجب إضافة مرحلة سفر واحدة على الأقل لوسيلة المواصلات رقم ${i + 1}`);
        return;
      }
      for (let j = 0; j < opt.legs.length; j++) {
        const leg = opt.legs[j];
        const filteredLegSteps = (leg.steps || []).map(s => s.trim()).filter(Boolean);
        if (filteredLegSteps.length === 0) {
          setError(`يجب إضافة خطوة واحدة على الأقل للمرحلة رقم ${j + 1} في الوسيلة ${i + 1}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Prepare payloads
    const payloads = (options || []).map(opt => {
      const formattedLegs = (opt.legs || []).map((leg, lIdx) => ({
        title: leg.title.trim() || `المرحلة ${lIdx + 1}`,
        vehicleType: leg.vehicleType.trim() || undefined,
        cost: leg.cost.trim() ? parseInt(leg.cost.trim()) : undefined,
        duration: leg.duration.trim() || undefined,
        steps: (leg.steps || []).map(s => s.trim()).filter(Boolean)
      }));

      // Flatten all leg steps for backward compatibility in flat `steps`
      const allFlatSteps: string[] = [];
      formattedLegs.forEach(leg => {
        (leg.steps || []).forEach(s => allFlatSteps.push(s));
      });

      return {
        from_location: fromLocation.trim(),
        to_location: toLocation.trim(),
        type: opt.type,
        type_name: opt.type_name.trim(),
        icon: opt.icon.trim() || "bx bx-bus",
        cost: parseInt(opt.cost) || 0,
        duration: opt.duration.trim(),
        steps: allFlatSteps,
        legs: formattedLegs,
        tips: opt.tips.trim() || undefined,
        from_aliases: fromAliases.trim() || undefined,
        to_aliases: toAliases.trim() || undefined,
        map_link: opt.map_link.trim() || undefined
      };
    });

    try {
      if (dbMissing) {
        // LocalStorage Mode
        let updatedRoutes = [...routes];

        // If editing, delete old connection first
        if (editingConnection) {
          updatedRoutes = updatedRoutes.filter(
            r => !(r.from_location.trim().toLowerCase() === editingConnection.from_location.trim().toLowerCase() &&
                   r.to_location.trim().toLowerCase() === editingConnection.to_location.trim().toLowerCase())
          );
        }

        const newLocalEntries = payloads.map((payload, idx) => ({
          id: `local-${Date.now()}-${idx}`,
          ...payload
        }));

        updatedRoutes = [...newLocalEntries, ...updatedRoutes];
        saveToLocalStorage(updatedRoutes);
        setSuccess(editingConnection ? "تم تعديل الطريق محلياً بنجاح!" : "تم إضافة الطريق محلياً بنجاح!");
        resetForm();
        setShowAddForm(false);
      } else {
        // Supabase Mode
        if (!supabase) {
          throw new Error("قاعدة البيانات غير متوفرة");
        }
        // If editing, delete old rows first
        if (editingConnection) {
          const { error: deleteError } = await supabase
            .from("transit_routes")
            .delete()
            .eq("from_location", editingConnection.from_location)
            .eq("to_location", editingConnection.to_location);

          if (deleteError) throw deleteError;
        }

        // Insert new payloads
        let { error: insertError } = await supabase
          .from("transit_routes")
          .insert(payloads);

        // Auto fallback if legs column does not exist in Supabase schema cache
        if (insertError && (
          insertError.message?.includes("legs") ||
          insertError.message?.includes("schema cache")
        )) {
          console.warn("legs column missing in Supabase, retrying insert without legs payload field...");
          const fallbackPayloads = payloads.map(p => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { legs, ...rest } = p;
            return rest;
          });
          const retryRes = await supabase
            .from("transit_routes")
            .insert(fallbackPayloads);

          insertError = retryRes.error;
          setDbMissing(true);
        }

        if (insertError) throw insertError;

        setSuccess(editingConnection ? "تم تحديث الطريق بجميع وسائله ومراخله بنجاح!" : "تم إضافة الطريق بجميع وسائله ومراخله بنجاح!");
        await fetchRoutes();
        resetForm();
        setShowAddForm(false);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      console.error("Save error:", err);
      setError("حدث خطأ أثناء حفظ البيانات: " + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (conn: GroupedRoute) => {
    setEditingConnection({ from_location: conn.from_location, to_location: conn.to_location });
    setFromLocation(conn.from_location);
    setToLocation(conn.to_location);
    setFromAliases(conn.from_aliases || "");
    setToAliases(conn.to_aliases || "");

    // Map options to form structure
    const mapped: FormOption[] = (conn.options || []).map(opt => {
      const parsedMins = parseMinutesFromArabic(opt.duration);

      let formLegs: FormLeg[] = [];
      if (opt.legs && Array.isArray(opt.legs) && opt.legs.length > 0) {
        formLegs = opt.legs.map(leg => ({
          title: leg.title || "المرحلة",
          vehicleType: leg.vehicleType || "ميكروباص",
          cost: leg.cost !== undefined ? leg.cost.toString() : "",
          duration: leg.duration || "",
          steps: leg.steps && Array.isArray(leg.steps) && leg.steps.length > 0 ? leg.steps : [""]
        }));
      } else {
        formLegs = [
          {
            title: "المرحلة الأولى: خطوات المسار",
            vehicleType: "ميكروباص",
            cost: opt.cost.toString(),
            duration: opt.duration,
            steps: opt.steps && Array.isArray(opt.steps) && opt.steps.length > 0 ? opt.steps : ["اركب...", "اوصل...", "انزل..."]
          }
        ];
      }

      return {
        type: opt.type,
        type_name: opt.type_name,
        icon: opt.icon,
        cost: opt.cost.toString(),
        duration: opt.duration,
        durationMinutes: parsedMins !== null ? parsedMins : "",
        steps: Array.isArray(opt.steps) ? opt.steps : [""],
        legs: formLegs,
        tips: opt.tips || "",
        map_link: opt.map_link || ""
      };
    });
    setOptions(mapped);

    setShowAddForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (fromVal: string, toVal: string) => {
    if (!confirm(`هل أنت متأكد من حذف طريق (من ${fromVal} إلى ${toVal}) بجميع وسائله؟`)) return;

    setError("");
    setSuccess("");

    try {
      if (dbMissing) {
        const updated = (routes || []).filter(
          r => !(r.from_location.trim().toLowerCase() === fromVal.trim().toLowerCase() &&
                 r.to_location.trim().toLowerCase() === toVal.trim().toLowerCase())
        );
        saveToLocalStorage(updated);
        setSuccess("تم حذف الطريق محلياً.");
      } else {
        if (!supabase) {
          throw new Error("قاعدة البيانات غير متوفرة");
        }
        const { error: deleteError } = await supabase
          .from("transit_routes")
          .delete()
          .eq("from_location", fromVal)
          .eq("to_location", toVal);

        if (deleteError) throw deleteError;
        setSuccess("تم حذف الطريق وجميع وسائله بنجاح من قاعدة البيانات.");
        await fetchRoutes();
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      console.error("Delete error:", err);
      setError("فشل حذف الطريق: " + errMsg);
    }
  };

  if (!isSubComponent && (loading || authLoading)) {
    return (
      <div className={styles.loadingContainer}>
        <span className={styles.loadingSpinner} />
        <p>جاري تحميل لوحة إدارة المسارات...</p>
      </div>
    );
  }

  if (!isSubComponent && !isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2 style={{ marginTop: "16px" }}>غير مصرح بالدخول</h2>
        <p style={{ color: "var(--text-secondary)" }}>عذراً، هذه الصفحة مخصصة لمديري النظام فقط.</p>
        <Link href="/" className="ios-btn ios-btn-primary" style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}>العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div style={isSubComponent ? { padding: 0 } : { maxWidth: "1000px", margin: "0 auto", padding: "10px" }}>

      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        {!isSubComponent ? (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "var(--text-primary)" }}>
              إدارة خطوط ومسارات المواصلات والمراحل
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "4px 0 0" }}>
              إضافة وتعديل خطوط مواصلات السفر والانتقال بين المدن مع تقسيم المراحل والأجرة والخطوات التفصيلية لخدمة {"\"ازاي اروح ؟\""}.
            </p>
          </div>
        ) : <div />}
        <button
          className="ios-btn ios-btn-primary"
          style={{ width: "auto" }}
          onClick={() => {
            if (showAddForm) {
              resetForm();
              setShowAddForm(false);
            } else {
              setShowAddForm(true);
            }
          }}
        >
          {showAddForm ? "إلغاء الإضافة" : "+ إضافة طريق جديد"}
        </button>
      </div>

      {/* SQL Setup Banner */}
      {dbMissing && (
        <div className="glass-panel" style={{ padding: "20px", borderRight: "4px solid var(--accent-warning)", marginBottom: "24px", background: "rgba(245, 158, 11, 0.05)" }}>
          <h4 style={{ color: "var(--accent-warning)", margin: "0 0 8px", fontSize: "1.05rem", fontWeight: "800" }}>
            ⚠️ تنبيه: جدول قاعدة البيانات غير منشأ أو ينقصه العمود `legs`
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            لتفعيل تقسيم المراحل وتخفيضات التذاكر الدائمة لجميع المستخدمين، يرجى إضافة عمود `legs` أو إنشاء الجدول في Supabase عبر الكود التالي:
          </p>
          <pre style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "10px", fontSize: "0.75rem", overflowX: "auto", marginTop: "12px", direction: "ltr", textAlign: "left", color: "#a7f3d0" }}>
{`ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS legs JSONB DEFAULT '[]'::jsonb;`}
          </pre>
        </div>
      )}

      {/* Notifications */}
      {error && <div className={styles.adminError} style={{ marginBottom: "20px" }}>⚠️ {error}</div>}
      {success && <div className={styles.adminSuccess} style={{ marginBottom: "20px" }}>✓ {success}</div>}

      {/* Form Section */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "30px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            {editingConnection ? "تعديل بيانات الطريق ومراحل المسار" : "إضافة طريق ومسارات مواصلات ومراحل جديدة"}
          </h2>

          {/* From & To inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <label className="help-label">من (نقطة البداية) *</label>
              <input
                type="text"
                required
                className="ios-input"
                placeholder="مثال: الزقازيق"
                value={fromLocation}
                onChange={e => setFromLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="help-label">إلى (الوجهة النهائية) *</label>
              <input
                type="text"
                required
                className="ios-input"
                placeholder="مثال: أرض المعارض"
                value={toLocation}
                onChange={e => setToLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Aliases Inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <label className="help-label">الأسماء والكلمات البديلة لنقطة البداية (مفصولة بفاصلة)</label>
              <input
                type="text"
                className="ios-input"
                placeholder="مثال: موقف الأحرار، الاحرار، جامعة الزقازيق"
                value={fromAliases}
                onChange={e => setFromAliases(e.target.value)}
              />
            </div>

            <div>
              <label className="help-label">الأسماء والكلمات البديلة للوجهة (مفصولة بفاصلة)</label>
              <input
                type="text"
                className="ios-input"
                placeholder="مثال: معرض الكتاب، ارض المعارض، مركز المعارض"
                value={toAliases}
                onChange={e => setToAliases(e.target.value)}
              />
            </div>
          </div>

          {/* Options Sublist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px", margin: "10px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>وسائل المواصلات المتاحة لهذا الطريق ({(options || []).length})</span>
              <button
                type="button"
                className="ios-btn"
                onClick={addOptionField}
                style={{ padding: "6px 16px", height: "auto", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
              >
                + إضافة وسيلة مواصلات أخرى
              </button>
            </h3>

            {(options || []).map((opt, optIdx) => (
              <div key={optIdx} className="glass-panel" style={{ padding: "20px", borderRight: "4px solid #3b82f6", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(255,255,255,0.01)" }}>

                {/* Option Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "800", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    🤖 وسيلة المواصلات رقم {optIdx + 1}
                  </span>
                  {(options || []).length > 1 && (
                    <button
                      type="button"
                      className="ios-btn"
                      onClick={() => removeOptionField(optIdx)}
                      style={{ padding: "4px 12px", height: "auto", fontSize: "0.8rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                    >
                      <i className="bx bx-trash" style={{ marginLeft: "4px" }} />
                      حذف هذه الوسيلة
                    </button>
                  )}
                </div>

                {/* Type, Name, Icon Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label className="help-label">نوع وسيلة المواصلات *</label>
                      <select
                        className="ios-input"
                        value={opt.type}
                        onChange={e => {
                          const newType = e.target.value as FormOption["type"];
                          let defaultName = opt.type_name;
                          let defaultIcon = opt.icon;
                          if (newType === "microbus") {
                            defaultIcon = "bx bx-bus";
                            defaultName = "ميكروباص مباشر";
                          } else if (newType === "bus") {
                            defaultIcon = "bx bx-bus-school";
                            defaultName = "أتوبيس النقل العام";
                          } else if (newType === "car") {
                            defaultIcon = "bx bx-car";
                            defaultName = "سيارة خاصة";
                          } else if (newType === "train") {
                            defaultIcon = "bx bx-train";
                            defaultName = "القطار المباشر";
                          } else if (newType === "monorail") {
                            defaultIcon = "bx bx-train";
                            defaultName = "قطار المونوريل";
                          } else if (newType === "metro") {
                            defaultIcon = "bx bx-subway";
                            defaultName = "مترو الأنفاق";
                          } else if (newType === "plane") {
                            defaultIcon = "bx bx-plane";
                            defaultName = "طائرة / طيران";
                          } else if (newType === "ship") {
                            defaultIcon = "bx bx-ship";
                            defaultName = "سفينة / عبارة";
                          } else if (newType === "multi") {
                            defaultIcon = "bx bx-transfer";
                            defaultName = "مواصلات متعددة";
                          }
                          updateOptionFields(optIdx, {
                            type: newType,
                            type_name: defaultName,
                            icon: defaultIcon
                          });
                        }}
                        style={{ background: "var(--bg-glass-card)" }}
                      >
                        <option value="microbus">ميكروباص</option>
                        <option value="bus">أتوبيس</option>
                        <option value="car">عربية خاص (سيارة)</option>
                        <option value="train">قطار</option>
                        <option value="monorail">مونوريل</option>
                        <option value="metro">مترو</option>
                        <option value="plane">طائرة</option>
                        <option value="ship">سفينة</option>
                        <option value="multi">مواصلات متعددة</option>
                      </select>
                    </div>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: "var(--accent-ios)" }}>
                      <i className={opt.icon} />
                    </div>
                  </div>

                  <div>
                    <label className="help-label">اسم وسيلة المواصلات المخصص *</label>
                    <input
                      type="text"
                      required
                      className="ios-input"
                      placeholder="مثال: ميكروباص مباشر"
                      value={opt.type_name}
                      onChange={e => updateOption(optIdx, "type_name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="help-label">رمز الأيقونة (Boxicon) *</label>
                    <input
                      type="text"
                      required
                      className="ios-input"
                      placeholder="bx bx-bus"
                      value={opt.icon}
                      onChange={e => updateOption(optIdx, "icon", e.target.value)}
                    />
                  </div>
                </div>

                {/* Cost & Duration Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label className="help-label">التكلفة الإجمالية المتوقعة (ج.م) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="ios-input"
                      placeholder="20"
                      value={opt.cost}
                      onChange={e => updateOption(optIdx, "cost", e.target.value)}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                    <div>
                      <label className="help-label">الزمن (دقائق)</label>
                      <input
                        type="number"
                        min="1"
                        className="ios-input"
                        placeholder="90"
                        value={opt.durationMinutes}
                        onChange={e => {
                          const val = e.target.value;
                          const mins = val ? parseInt(val) : "";
                          updateOptionFields(optIdx, {
                            durationMinutes: mins,
                            duration: mins ? formatMinutesToArabic(mins) : ""
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="help-label">النص النهائي لزمن الرحلة *</label>
                      <input
                        type="text"
                        required
                        className="ios-input"
                        placeholder="ساعة و 30 دقيقة"
                        value={opt.duration}
                        onChange={e => updateOption(optIdx, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Map Link / Google Maps URL */}
                <div>
                  <label className="help-label" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span>رابط بدء الرحلة ومسار خريطة Google (اختياري)</span>
                    {opt.type === "car" && (
                      <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 6px", borderRadius: "4px" }}>
                        يوصى به لـ {"\"عربية خاص\""}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="ios-input"
                    placeholder="https://www.google.com/maps/dir/..."
                    value={opt.map_link}
                    onChange={e => updateOption(optIdx, "map_link", e.target.value)}
                  />
                </div>

                {/* Stages / Legs Breakdown Editor */}
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-ios)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <i className="bx bx-git-repo-forked" />
                      <span>مراحل الرحلة والخطوات التفصيلية (المرحلة الأولى، الثانية...)</span>
                    </h4>
                    <button
                      type="button"
                      className="ios-btn"
                      onClick={() => addLegToOption(optIdx)}
                      style={{ padding: "4px 12px", height: "auto", fontSize: "0.8rem", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}
                    >
                      + إضافة مرحلة جديدة
                    </button>
                  </div>

                  {(opt.legs || []).map((leg, legIdx) => (
                    <div key={legIdx} style={{ background: "var(--bg-glass-card)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "var(--text-primary)" }}>
                          📍 المرحلة {legIdx + 1}
                        </span>
                        {(opt.legs || []).length > 1 && (
                          <button
                            type="button"
                            className="ios-btn"
                            onClick={() => removeLegFromOption(optIdx, legIdx)}
                            style={{ padding: "2px 8px", height: "auto", fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                          >
                            حذف هذه المرحلة
                          </button>
                        )}
                      </div>

                      {/* Leg Title, Cost, Duration */}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                        <div>
                          <label className="help-label">عنوان المرحلة *</label>
                          <input
                            type="text"
                            required
                            className="ios-input"
                            placeholder="مثال: المرحلة الأولى: ميكروباص من الزقازيق للسلام"
                            value={leg.title}
                            onChange={e => updateLegField(optIdx, legIdx, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="help-label">أجرة هذه المرحلة (ج.م)</label>
                          <input
                            type="number"
                            min="0"
                            className="ios-input"
                            placeholder="20"
                            value={leg.cost}
                            onChange={e => updateLegField(optIdx, legIdx, "cost", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="help-label">وقت هذه المرحلة</label>
                          <input
                            type="text"
                            className="ios-input"
                            placeholder="50 دقيقة"
                            value={leg.duration}
                            onChange={e => updateLegField(optIdx, legIdx, "duration", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Leg Sub-Steps */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <label className="help-label" style={{ margin: 0 }}>خطوات هذه المرحلة بالتفصيل *</label>
                          <button
                            type="button"
                            className="ios-btn"
                            onClick={() => addLegStep(optIdx, legIdx)}
                            style={{ padding: "2px 8px", height: "auto", fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                          >
                            + إضافة خطوة للمرحلة
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(leg.steps || []).map((stepVal, stepIdx) => (
                            <div key={stepIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700", minWidth: "20px" }}>
                                {stepIdx + 1}.
                              </span>
                              <input
                                type="text"
                                required
                                className="ios-input"
                                placeholder="اكتب تفاصيل هذه الخطوة..."
                                value={stepVal}
                                onChange={e => updateLegStep(optIdx, legIdx, stepIdx, e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                className="ios-btn"
                                onClick={() => removeLegStep(optIdx, legIdx, stepIdx)}
                                style={{ padding: "0", width: "30px", height: "30px", background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                                disabled={(leg.steps || []).length === 1}
                              >
                                <i className="bx bx-trash" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div>
                  <label className="help-label">نصيحة ذهبية للمسافرين (اختياري)</label>
                  <textarea
                    className="ios-input"
                    style={{ width: "100%", minHeight: "60px", padding: "10px", fontFamily: "inherit" }}
                    placeholder="اكتب أي نصيحة إضافية..."
                    value={opt.tips}
                    onChange={e => updateOption(optIdx, "tips", e.target.value)}
                  />
                </div>

              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", gap: "12px", alignSelf: "flex-end", marginTop: "10px" }}>
            <button
              type="button"
              className="ios-btn"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="ios-btn ios-btn-primary"
              disabled={isSubmitting}
              style={{ padding: "0 28px" }}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ الطريق والخطوات بالكامل"}
            </button>
          </div>
        </form>
      )}

      {/* Routes List */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 16px" }}>
          الطرق والمسارات المسجلة حالياً ({(groupedRoutesList || []).length})
        </h3>

        {(groupedRoutesList || []).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            <i className="bx bx-compass" style={{ fontSize: "2.5rem", marginBottom: "8px", display: "block" }} />
            لا يوجد مسارات مضافة حالياً.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {(groupedRoutesList || []).map((route, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-glass)", background: "rgba(255,255,255,0.01)", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", flex: 1, gap: "14px", minWidth: "280px", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bx bx-compass" style={{ fontSize: "1.2rem", color: "#3b82f6" }} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "var(--text-primary)" }}>
                      <span>من</span> <span style={{ color: "#3b82f6" }}>{route.from_location}</span> <span>إلى</span> <span style={{ color: "#3b82f6" }}>{route.to_location}</span>
                    </h4>
                  </div>

                  {/* Aliases */}
                  {(route.from_aliases || route.to_aliases) && (
                    <div style={{ fontSize: "0.82rem", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                      {route.from_aliases && <div><strong>الأسماء البديلة للبداية:</strong> {route.from_aliases}</div>}
                      {route.to_aliases && <div style={{ marginTop: "2px" }}><strong>الأسماء البديلة للوجهة:</strong> {route.to_aliases}</div>}
                    </div>
                  )}

                  {/* Transit Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-secondary)" }}>وسائل المواصلات المتاحة:</span>
                    {(route.options || []).map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: "flex", gap: "10px", padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-glass)", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={opt.icon} style={{ fontSize: "1.2rem", color: "#3b82f6" }} />
                            <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-primary)" }}>{opt.type_name}</span>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 6px", borderRadius: "4px" }}>الإجمالي {opt.cost} ج.م</span>
                            <span style={{ fontSize: "0.75rem", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "2px 6px", borderRadius: "4px" }}>{opt.duration}</span>
                          </div>
                        </div>

                        {/* Display Stages/Legs */}
                        {opt.legs && Array.isArray(opt.legs) && opt.legs.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                            {(opt.legs || []).map((leg, lIdx) => (
                              <div key={lIdx} style={{ background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                                  <span>📍 {leg.title}</span>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    {leg.cost !== undefined && <span style={{ color: "#10b981" }}>{leg.cost} ج.م</span>}
                                    {leg.duration && <span style={{ color: "#3b82f6" }}>{leg.duration}</span>}
                                  </div>
                                </div>
                                <ol style={{ paddingRight: "16px", margin: "4px 0 0", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                                  {(leg.steps || []).map((step, sIdx) => (
                                    <li key={sIdx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ol style={{ paddingRight: "16px", margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                            {(opt.steps || []).map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        )}

                        {/* Tip */}
                        {opt.tips && (
                          <div style={{ fontSize: "0.75rem", color: "var(--accent-warning)", marginTop: "4px", display: "flex", gap: "4px" }}>
                            <span>💡</span>
                            <span>{opt.tips}</span>
                          </div>
                        )}

                        {/* Map Link */}
                        {opt.map_link && (
                          <div style={{ fontSize: "0.75rem", color: "var(--accent-success)", marginTop: "4px", display: "flex", gap: "4px" }}>
                            <span>📍</span>
                            <span><strong>مسار بدء الرحلة:</strong> <a href={opt.map_link} target="_blank" rel="noopener noreferrer" style={{ color: "#10b981", textDecoration: "underline", fontWeight: "700" }}>فتح خرائط Google</a></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    className="ios-btn"
                    onClick={() => handleEdit(route)}
                    style={{ padding: "6px 12px", height: "auto", fontSize: "0.8rem", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
                  >
                    تعديل الطريق بالكامل
                  </button>
                  <button
                    className="ios-btn"
                    onClick={() => handleDelete(route.from_location, route.to_location)}
                    style={{ padding: "6px 12px", height: "auto", fontSize: "0.8rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                  >
                    حذف الطريق بالكامل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
