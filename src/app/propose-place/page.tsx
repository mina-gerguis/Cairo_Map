"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { DEFAULT_CATEGORIES, CategoryItem, CATEGORIES_STRUCTURE, FEATURES_LIST, formatBoxIcon } from "@/data/places";
import { MultiSelectSearch } from "@/components/ui/MultiSelectSearch";
import { SERVICES_LIST } from "@/data/services";

function ProposePlaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(!!editId);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [limitChecking, setLimitChecking] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [userProposals, setUserProposals] = useState<any[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    category_label: "",
    sub_categories: [] as string[],
    place_type: "",
    place_type_icon: "",
    governorate: "",
    city: "",
    address: "",
    phone: "",
    description: "",
    image_url: "",
    images: [] as string[],
    working_hours: "",
    price_range: "متوسط",
    location_url: "",
    facebook: "",
    instagram: "",
    website_url: "",
    services: [] as string[],
    features: [] as string[],
  });

  const [newImgInput, setNewImgInput] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // Fetch categories from DB if available
  useEffect(() => {
    async function loadCategories() {
      if (!supabase) return;
      const { data } = await supabase.from("categories").select("*");
      if (data && data.length > 0) {
        setCategories(data.map((c: any) => ({
          name: c.name,
          label: c.label || c.name,
          icon: c.icon || "bx bx-category",
          color: c.color || "#007aff"
        })));
      }
    }
    loadCategories();
  }, []);

  // Fetch user's previous proposals
  const fetchUserProposals = async () => {
    if (!user || !supabase) return;
    setProposalsLoading(true);
    try {
      const { data, error } = await supabase
        .from("place_proposals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setUserProposals(data);
      }
    } catch (err) {
      console.error("Failed to fetch user proposals:", err);
    } finally {
      setProposalsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserProposals();
    }
  }, [user, authLoading]);

  // Check pending feedback limit (max 5)
  const checkLimit = async () => {
    if (!user) {
      setLimitChecking(false);
      return;
    }
    setLimitChecking(true);
    try {
      const { isFeedbackLimitReached } = await import("@/lib/feedbackLimit");
      const reached = await isFeedbackLimitReached(user.id);
      setLimitReached(reached);
    } catch (err) {
      console.error("Failed to check pending limit:", err);
    } finally {
      setLimitChecking(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkLimit();
    }
  }, [user, authLoading]);

  // Fetch existing proposal if in edit mode
  useEffect(() => {
    async function loadProposal() {
      if (!editId || !supabase || !user) return;
      setInitialFetching(true);
      try {
        const { data, error } = await supabase
          .from("place_proposals")
          .select("*")
          .eq("id", editId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          setErrorMsg("لم يتم العثور على المكان المقترح أو ليس لديك صلاحية لتعديله.");
        } else if (data) {
          setRejectionReason(data.rejection_reason || null);
          const links = data.social_links || {};
          setFormData({
            name: data.name || "",
            category: data.category || "",
            category_label: data.category_label || "",
            sub_categories: Array.isArray(data.sub_categories) ? data.sub_categories : [],
            place_type: data.place_type || "",
            place_type_icon: data.place_type_icon || "",
            governorate: data.governorate || "",
            city: data.city || "",
            address: data.address || "",
            phone: data.phone || "",
            description: data.description || "",
            image_url: data.image_url || "",
            images: Array.isArray(data.images) ? data.images : [],
            working_hours: data.working_hours || "",
            price_range: data.price_range || "متوسط",
            location_url: data.location_url || "",
            facebook: links.facebook || "",
            instagram: links.instagram || "",
            website_url: data.website_url || "",
            services: Array.isArray(data.services) ? data.services : [],
            features: Array.isArray(data.features) ? data.features : [],
          });
        }
      } catch (err: any) {
        setErrorMsg("حدث خطأ أثناء تحميل بيانات المكان.");
      } finally {
        setInitialFetching(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/propose-place");
      } else if (editId) {
        loadProposal();
      }
    }
  }, [editId, user, authLoading, router]);

  const handleCategoryChange = (catName: string) => {
    const mainCat = CATEGORIES_STRUCTURE.find((c) => c.name === catName);
    const subCats = mainCat?.subCategories || [];
    setFormData((prev) => ({
      ...prev,
      category: catName,
      category_label: mainCat ? mainCat.label : catName,
      sub_categories: subCats.length > 0 ? [subCats[0].name] : [],
      place_type: "",
      place_type_icon: "",
    }));
  };

  const handleAddImage = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!newImgInput.trim()) return;
    const url = newImgInput.trim();
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
      image_url: prev.image_url || url,
    }));
    setNewImgInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImg(true);
    try {
      if (supabase) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `proposals_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `proposals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (publicUrl) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, publicUrl],
              image_url: prev.image_url || publicUrl,
            }));
            setIsUploadingImg(false);
            return;
          }
        }
      }

      // Fallback: Read file as Data URL locally if storage bucket error
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result],
            image_url: prev.image_url || result,
          }));
        }
        setIsUploadingImg(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image upload failed:", err);
      setIsUploadingImg(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image_url: updated.length > 0 ? updated[0] : "",
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) {
      setErrorMsg("يرجى تسجيل الدخول أولاً لإرسال المقترح.");
      return;
    }

    if (!formData.name.trim() || !formData.category || !formData.governorate || !formData.city) {
      setErrorMsg("يرجى ملء جميع الحقول الإلزامية (اسم المكان، التصنيف، المحافظة، والمدينة).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload = {
      user_id: user.id,
      name: formData.name.trim(),
      category: formData.category,
      category_label: formData.category_label || formData.category,
      sub_categories: formData.sub_categories || [],
      place_type: formData.place_type.trim() || null,
      place_type_icon: formData.place_type.trim() ? (formatBoxIcon(formData.place_type_icon).trim() || "bx bx-tag") : null,
      governorate: formData.governorate,
      city: formData.city,
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      description: formData.description.trim(),
      image_url: formData.image_url || (formData.images.length > 0 ? formData.images[0] : ""),
      images: formData.images,
      working_hours: formData.working_hours.trim(),
      price_range: formData.price_range,
      location_url: formData.location_url.trim(),
      social_links: {
        facebook: formData.facebook.trim(),
        instagram: formData.instagram.trim(),
      },
      website_url: formData.website_url.trim(),
      services: formData.services || [],
      features: formData.features || [],
      status: "pending",
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editId) {
        let { error } = await supabase
          .from("place_proposals")
          .update(payload)
          .eq("id", editId)
          .eq("user_id", user.id);

        if (error) {
          console.warn("Update failed with website_url, trying fallback...");
          const fallbackPayload = { ...payload };
          // @ts-ignore
          delete fallbackPayload.website_url;
          let retry = await supabase
            .from("place_proposals")
            .update(fallbackPayload)
            .eq("id", editId)
            .eq("user_id", user.id);

          if (retry.error) {
            // @ts-ignore
            delete fallbackPayload.sub_categories;
            retry = await supabase
              .from("place_proposals")
              .update(fallbackPayload)
              .eq("id", editId)
              .eq("user_id", user.id);
          }
          error = retry.error;
        }
        if (error) throw error;
      } else {
        let { error } = await supabase.from("place_proposals").insert([payload]);
        if (error) {
          console.warn("Insert failed with website_url, trying fallback...");
          const fallbackPayload = { ...payload };
          // @ts-ignore
          delete fallbackPayload.website_url;
          let retry = await supabase.from("place_proposals").insert([fallbackPayload]);
          if (retry.error) {
            // @ts-ignore
            delete fallbackPayload.sub_categories;
            retry = await supabase.from("place_proposals").insert([fallbackPayload]);
          }
          error = retry.error;
        }
        if (error) throw error;
      }
      setSuccess(true);
      fetchUserProposals();
      checkLimit();
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء حفظ المكان المقترح: " + (err.message || "حاول مرة أخرى"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialFetching || limitChecking) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--textPrimary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: "40px", height: "40px", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--textSecondary)" }}>جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--textPrimary)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "60px 20px 60px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", padding: "12px 20px", borderRadius: "30px", background: "rgba(108, 99, 255, 0.12)", border: "1px solid rgba(108, 99, 255, 0.25)", color: "var(--colorPrimary)", fontSize: "0.9rem", fontWeight: "700", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
            <i className="bx bx-map-pin" style={{ fontSize: "1.2rem" }}></i>
            {editId ? "تعديل وإعادة إرسال اقتراح مكان" : "اقتراح مكان جديد"}
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--textPrimary)", margin: "0 0 10px" }}>
            {editId ? "تعديل بيانات المكان المقترح" : "ساهم معنا في إضافة مكان جديد"}
          </h1>

          <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
            يمكنك اقتراح أي مكان متميز (مطعم، كافيه، حديقة، الخ). سيقوم فريق الإدارة بمراجعة التفاصيل ونشره فور الاعتماد!
          </p>
        </div>

        {/* Pending Limit Notice */}
        {limitReached && !editId && (
          <div style={{ background: "rgba(255, 149, 0, 0.12)", border: "1px solid rgba(255, 149, 0, 0.35)", borderRadius: "20px", padding: "20px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", animation: "slide-down 0.3s ease" }}>
            <div style={{ fontSize: "1.8rem", color: "#ff9500" }}>⚠️</div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#ff9500", margin: "0 0 4px" }}>
                وصلت للحد الأقصى (5 طلبات معلقة)
              </h3>
              <p style={{ margin: 0, color: "var(--textPrimary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                لا يمكنك تقديم مكان جديد حالياً حتى تتم مراجعة الطلبات السابقة، ولكن يمكنك تعديل وإعادة إرسال أي مكان معلق أو مرفوض من قائمة "أماكني المقترحة" بالأسفل.
              </p>
            </div>
          </div>
        )}

        {/* Active Edit Mode Banner */}
        {editId && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(108, 99, 255, 0.1)", padding: "14px 20px", borderRadius: "18px", border: "1px solid rgba(108, 99, 255, 0.25)", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontWeight: "700", color: "var(--colorPrimary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
              ✏️ أنت الآن تقوم بتعديل: <span style={{ color: "var(--textPrimary)" }}>{formData.name || "المكان المقترح"}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                router.push("/propose-place");
                setFormData({
                  name: "", category: "", category_label: "", sub_categories: [] as string[], place_type: "", place_type_icon: "", governorate: "", city: "", address: "", phone: "", description: "", image_url: "", images: [] as string[], working_hours: "", price_range: "متوسط", location_url: "", facebook: "", instagram: "", website_url: "", services: [] as string[], features: [] as string[]
                });
                setRejectionReason(null);
              }}
              style={{ background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "6px 14px", borderRadius: "10px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <i className="bx bx-x"></i> إلغاء التعديل واقتراح مكان جديد
            </button>
          </div>
        )}

        {/* Rejection Notice if edit mode & rejected */}
        {editId && rejectionReason && (
          <div style={{ background: "rgba(255, 59, 48, 0.12)", border: "1px solid rgba(255, 59, 48, 0.35)", borderRadius: "20px", padding: "20px", marginBottom: "30px", display: "flex", gap: "16px", alignItems: "flex-start", animation: "slide-down 0.3s ease" }}>
            <div style={{ fontSize: "1.8rem", color: "#ff3b30" }}>⚠️</div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ff3b30", margin: "0 0 6px" }}>
                سبب رفض الاقتراح السابق من الإدارة:
              </h3>
              <p style={{ margin: 0, color: "var(--textPrimary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                "{rejectionReason}"
              </p>
              <p style={{ margin: "10px 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                قم بتعديل النقاط المذكورة أعلاه ثم اضغط على زر "إعادة إرسال للمراجعة" بالأسفل.
              </p>
            </div>
          </div>
        )}

        {/* Success Modal / Card */}
        {success ? (
          <div className="glass-panel" style={{ padding: "40px", borderRadius: "28px", textAlign: "center", animation: "fade-in 0.4s ease" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(52, 199, 89, 0.15)", color: "#34c759", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", margin: "0 auto 20px" }}>
              ✓
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--textPrimary)", marginBottom: "12px" }}>
              {editId ? "تمت إعادة إرسال الاقتراح بنجاح!" : "تم إرسال اقتراحك بنجاح!"}
            </h2>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
              شكراً لمساهمتك! ستقوم الإدارة بمراجعة تفاصيل المكان قريباً، وسوف يصلك إشعار فور اتخاذ القرار.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/profile" className="btn btn-primary" style={{ padding: "12px 24px", textDecoration: "none" }}>
                العودة للبروفايل
              </Link>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    name: "", category: "", category_label: "", sub_categories: [] as string[], place_type: "", place_type_icon: "", governorate: "", city: "", address: "", phone: "", description: "", image_url: "", images: [] as string[], working_hours: "", price_range: "متوسط", location_url: "", facebook: "", instagram: "", website_url: "", services: [] as string[], features: [] as string[]
                  });
                  if (editId) router.push("/propose-place");
                }}
                style={{ padding: "12px 24px" }}
              >
                اقتراح مكان آخر
              </button>
            </div>
          </div>
        ) : (
          /* Proposal Form */
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {errorMsg && (
              <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "14px", borderRadius: "14px", color: "#ff3b30", fontSize: "0.9rem" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Section 1: Basic Info */}
            <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "20px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--colorPrimary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-info-circle"></i> البيانات الأساسية للمكان
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontFamily: "var(--font-body)" }}>
                {/* Place Name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">اسم المكان <span style={{ color: "#ff3b30" }}>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطعم وكافيه الفيروز"
                    className="input-fields"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 <strong>تلميح:</strong> يفضل كتابة اسم المكان الرسمي المكتوب على اليافتة لسهولة التعرف عليه.
                  </p>
                </div>

                {/* Category */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">التصنيف الرئيسي <span style={{ color: "#ff3b30" }}>*</span></label>
                  <select
                    required
                    className="input-fields help-select"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled>اختر التصنيف الرئيسي...</option>
                    {CATEGORIES_STRUCTURE.map((c) => (
                      <option key={c.name} value={c.name}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 اختر التصنيف الأقرب لنشاط المكان الرئيسي.
                  </p>
                </div>

                {/* Sub-categories */}
                {formData.category && (
                  <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "var(--radius-xs)", border: "1px solid var(--borderGlass)" }}>
                    <label className="help-label" style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)", display: "block" }}>
                      التصنيفات الفرعية التابعة للقسم الرئيسي
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {(CATEGORIES_STRUCTURE.find(m => m.name === formData.category)?.subCategories || []).map(cat => {
                        const isSelected = formData.sub_categories?.includes(cat.name);
                        return (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => {
                              const current = formData.sub_categories || [];
                              const next = isSelected ? current.filter(s => s !== cat.name) : [...current, cat.name];
                              const shouldResetType = current[0] !== next[0];
                              setFormData({
                                ...formData,
                                sub_categories: next,
                                ...(shouldResetType ? { place_type: "", place_type_icon: "" } : {})
                              });
                            }}
                            style={{
                              background: isSelected ? "var(--colorPrimary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                              color: isSelected ? "#fff" : "var(--textPrimary)",
                              border: isSelected ? "none" : "1px solid var(--borderGlass)",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "0.85rem",
                              fontWeight: isSelected ? "700" : "500",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s"
                            }}
                          >
                            <i className={`bx ${cat.icon}`}></i> {cat.label} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-types selection (Propose Mode) */}
                {formData.category && formData.sub_categories?.length > 0 && (
                  <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr", gap: "12px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
                    <label className="help-label" style={{ fontWeight: "700" }}>
                      النوع الفرعي للمكان، مثل: المطبخ الصيني أو السوري للمطاعم، والقهوة العربية أو الفرنسية للكافيهات.
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                      <div>
                        <label className="help-label" style={{ fontSize: "0.85rem", color: "var(--textSecondary)" }}>اسم النوع:</label>
                        <input
                          className="input-fields"
                          placeholder="مثال: سوري، صيني، إيطالي..."
                          value={formData.place_type}
                          onChange={e => setFormData({ ...formData, place_type: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Selection */}
                <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
                  <label className="help-label" style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)", display: "block" }}>
                    مميزات إضافية للمكان (اختر كل ما ينطبق)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {FEATURES_LIST.map(feat => {
                      const isSelected = formData.features?.includes(feat.key);
                      return (
                        <button
                          key={feat.key}
                          type="button"
                          onClick={() => {
                            const current = formData.features || [];
                            const next = isSelected ? current.filter(s => s !== feat.key) : [...current, feat.key];
                            setFormData({ ...formData, features: next });
                          }}
                          style={{
                            background: isSelected ? "var(--colorPrimary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                            color: isSelected ? "#fff" : "var(--textPrimary)",
                            border: isSelected ? "none" : "1px solid var(--borderGlass)",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: isSelected ? "700" : "500",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                        >
                          <span>{feat.label}</span> {isSelected && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Services Selection */}
                <div style={{ gridColumn: "1 / -1", background: "rgba(46, 204, 113, 0.03)", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--borderGlass)" }}>
                  <MultiSelectSearch
                    label="الخدمات المتاحة بالمكان"
                    options={SERVICES_LIST}
                    selected={formData.services || []}
                    onChange={(selected) => setFormData({ ...formData, services: selected })}
                    placeholder="ابحث عن خدمات مثل: قاعة أفراح، شركة شحن، كهربائي سيارات..."
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Location & Address */}
            <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "20px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--colorPrimary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-map"></i> الموقع والعنوان التفصيلي
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontFamily:"var(--font-body)" }}>
                {/* Governorate */}
                <div>
                  <label className="help-label">المحافظة <span style={{ color: "#ff3b30" }}>*</span></label>
                  <select
                    required
                    className="input-fields help-select"
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value, city: "" })}
                  >
                    <option value="" disabled> المحافظة</option>
                    {governoratesList.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="help-label">المدينة / المنطقة <span style={{ color: "#ff3b30" }}>*</span></label>
                  <select
                    required
                    disabled={!formData.governorate}
                    className="input-fields help-select"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="" disabled> المدينة</option>
                    {formData.governorate && egyptLocations[formData.governorate]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Detailed Address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">العنوان التفصيلي</label>
                  <input
                    type="text"
                    placeholder="مثال: شارع الجلاء، أمام مستشفى السلام، بجوار البنك الأهلي"
                    className="input-fields"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 اكتب علامة مميزة بجوار المكان لسهولة الوصول إليه.
                  </p>
                </div>

                {/* Google Maps URL */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">رابط خريطة جوجل</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="input-fields"
                    value={formData.location_url}
                    onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 افتح خريطة جوجل واعمل "مشاركة" للرابط ولصقه هنا ليتسنى للزوار التوجه بالخريطة مباشرة!
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Hours */}
            <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "20px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--colorPrimary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-phone-call"></i> التواصل وساعات العمل
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontFamily: "var(--font-body)" }}>
                <div>
                  <label className="help-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="01012345678"
                    className="input-fields"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>

                <div>
                  <label className="help-label">مواعيد العمل</label>
                  <input
                    type="text"
                    placeholder="مثال: يومياً من 10 صباحاً حتى 12 منتصف الليل"
                    className="input-fields"
                    value={formData.working_hours}
                    onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="help-label">رابط موقع المكان الإلكتروني (إن وجد)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="input-fields"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Images & Media */}
            <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "20px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--colorPrimary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-image"></i> صور المكان
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px", fontFamily: "var(--font-body)" }}>
                {/* Upload from Device Button */}
                <div style={{ gridColumn: "1fr" }}>
                  <label
                    className="btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "var(--mainBtn)",
                      color: "#fff",
                      fontWeight: "700",
                      padding: "var(--paddingBtn)",
                      borderRadius: "var(--radiusBtn)",
                      cursor: isUploadingImg ? "not-allowed" : "pointer",
                      width:"100%"
                    }}
                  >
                    <i className={isUploadingImg ? "bx bx-loader-alt bx-spin" : "bx bx-cloud-upload"} style={{ fontSize: "1.3rem" }}></i>
                    <span>{isUploadingImg ? "جاري رفع الصورة..." : "رفع صورة من جهازك"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploadingImg}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                {/* Or paste URL */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="url"
                    placeholder="أو ضع رابط صورة من الإنترنت (https://...)"
                    className="input-fields"
                    value={newImgInput}
                    onChange={(e) => setNewImgInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    style={{ flex: 1, direction: "ltr", textAlign: "left", borderRadius:"var(--radiusBtn)" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn"
                    disabled={!newImgInput.trim()}
                    style={{ background: "rgba(108, 99, 255, 0.2)", color: "var(--colorPrimary)", fontWeight: "700", padding: "10px 18px" }}
                  >
                    🔗 إضافة رابط
                  </button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "14px", overflow: "hidden", border: "2px solid var(--borderGlass)" }}>
                      <img src={img} alt={`Preview ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", color: "#ff3b30", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                💡 <strong>نصيحة:</strong> الصور الواضحة تزيد بنسبة كبيرة من سرعة موافقة الإدارة على المكان المقترح!
              </p>
            </div>

            {/* Section 5: Description */}
            <div>
              <label className="help-label">وصف عن المكان والخدمات المقدمة</label>
              <textarea
                rows={4}
                placeholder="اكتب نبذة عن المكان والخدمات أو المميزات التي يشتهر بها..."
                className="input-fields"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (limitReached && !editId)}
              className="btn btn-primary"
              style={{
                fontSize: "1.05rem",
                fontWeight: "700",
                marginTop: "10px",
                justifyContent: "center",
                opacity: (limitReached && !editId) ? 0.6 : 1,
                cursor: (limitReached && !editId) ? "not-allowed" : "pointer"
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "20px", height: "20px" }} />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <i className="bx bx-paper-plane" style={{ fontSize: "1.3rem" }}></i>
                  {editId ? "إعادة إرسال للمراجعة" : limitReached ? "الحد الأقصى معلق (اختر مكان لتعديله)" : "إرسال الاقتراح للإدارة"}
                </>
              )}
            </button>
          </form>
        )}

        {/* Section: User's Previous Proposals */}
        <div style={{ marginTop: "50px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <i className="bx bx-list-ul" style={{ color: "var(--colorPrimary)", fontSize: "1.5rem" }}></i>
              أماكني المقترحة
              {userProposals.length > 0 && (
                <span style={{ fontSize: "0.85rem", background: "rgba(108, 99, 255, 0.15)", color: "var(--colorPrimary)", padding: "2px 10px", borderRadius: "12px", fontWeight: "700" }}>
                  {userProposals.length}
                </span>
              )}
            </h2>

            <button
              type="button"
              onClick={fetchUserProposals}
              disabled={proposalsLoading}
              style={{ background: "transparent", border: "1px solid var(--borderGlass)", color: "var(--textSecondary)", padding: "6px 14px", borderRadius: "12px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <i className={`bx bx-refresh ${proposalsLoading ? "bx-spin" : ""}`}></i> تحديث القائمة
            </button>
          </div>

          {proposalsLoading ? (
            <div className="glass-panel" style={{ padding: "30px", textAlign: "center", color: "var(--textSecondary)" }}>
              <div className="spinner" style={{ width: "30px", height: "30px", margin: "0 auto 12px" }} />
              جاري تحميل أماكنك المقترحة...
            </div>
          ) : userProposals.length === 0 ? (
            <div className="glass-panel" style={{ padding: "30px", textAlign: "center", color: "var(--textSecondary)" }}>
              <i className="bx bx-map-pin" style={{ fontSize: "2.5rem", color: "var(--text-muted)", marginBottom: "10px", display: "block" }}></i>
              لم تقم باقتراح أي أماكن حتى الآن.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              {userProposals.map((prop) => {
                const isCurrentEditing = editId === prop.id;
                const isApproved = prop.status === "approved";
                const isRejected = prop.status === "rejected";
                const isPending = prop.status === "pending" || !prop.status;

                return (
                  <div
                    key={prop.id}
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      border: isCurrentEditing
                        ? "2px solid var(--colorPrimary, #6c63ff)"
                        : "1px solid var(--borderGlass)",
                      boxShadow: isCurrentEditing ? "0 0 15px rgba(108, 99, 255, 0.25)" : "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      {/* Image Preview */}
                      <div style={{ width: "80px", height: "80px", borderRadius: "14px", overflow: "hidden", background: "rgba(255,255,255,0.05)", flexShrink: 0, border: "1px solid var(--borderGlass)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {prop.image_url || (prop.images && prop.images[0]) ? (
                          <img src={prop.image_url || prop.images[0]} alt={prop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <i className="bx bx-store-alt" style={{ fontSize: "2rem", color: "var(--text-muted)" }}></i>
                        )}
                      </div>

                      {/* Content Details */}
                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0, color: "var(--textPrimary)" }}>
                            {prop.name}
                          </h3>

                          {/* Status Badge */}
                          {isPending && (
                            <span style={{ background: "rgba(255, 149, 0, 0.15)", color: "#ff9500", border: "1px solid rgba(255, 149, 0, 0.3)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <i className="bx bx-time-five"></i> قيد المراجعة
                            </span>
                          )}
                          {isRejected && (
                            <span style={{ background: "rgba(255, 59, 48, 0.15)", color: "#ff3b30", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <i className="bx bx-x-circle"></i> مرفوض من الإدارة
                            </span>
                          )}
                          {isApproved && (
                            <span style={{ background: "rgba(52, 199, 89, 0.15)", color: "#34c759", border: "1px solid rgba(52, 199, 89, 0.3)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <i className="bx bx-check-circle"></i> مقبول ومُعتمد ✓
                            </span>
                          )}

                          {isCurrentEditing && (
                            <span style={{ background: "var(--colorPrimary)", color: "#fff", padding: "3px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>
                              ✏️ جاري التعديل
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--textSecondary)", marginBottom: "8px" }}>
                          <span><i className="bx bx-folder" style={{ color: "var(--colorPrimary)" }}></i> {prop.category_label || prop.category}</span>
                          {prop.governorate && <span><i className="bx bx-map-pin" style={{ color: "var(--colorPrimary)" }}></i> {prop.governorate} - {prop.city}</span>}
                          {prop.created_at && (
                            <span style={{ color: "var(--text-muted)" }}>
                              <i className="bx bx-calendar"></i> {new Date(prop.created_at).toLocaleDateString("ar-EG")}
                            </span>
                          )}
                        </div>

                        {/* Rejection Reason Notice inside card */}
                        {isRejected && prop.rejection_reason && (
                          <div style={{ background: "rgba(255, 59, 48, 0.08)", border: "1px dashed rgba(255, 59, 48, 0.3)", padding: "8px 12px", borderRadius: "10px", fontSize: "0.83rem", color: "var(--textPrimary)", marginTop: "6px" }}>
                            <strong style={{ color: "#ff3b30" }}>سبب الرفض:</strong> "{prop.rejection_reason}"
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {!isApproved && (
                        <div style={{ alignSelf: "center" }}>
                          <button
                            type="button"
                            onClick={() => {
                              router.push(`/propose-place?edit=${prop.id}`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="btn"
                            style={{
                              background: isCurrentEditing ? "var(--colorPrimary)" : "rgba(108, 99, 255, 0.12)",
                              color: isCurrentEditing ? "#fff" : "var(--colorPrimary)",
                              border: "1px solid rgba(108, 99, 255, 0.3)",
                              padding: "10px 18px",
                              borderRadius: "14px",
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <i className="bx bx-edit-alt" style={{ fontSize: "1.1rem" }}></i>
                            {isCurrentEditing ? "جاري التعديل..." : "تعديل وإعادة إرسال"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

export default function ProposePlacePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    }>
      <ProposePlaceContent />
    </Suspense>
  );
}
