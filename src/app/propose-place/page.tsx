"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { DEFAULT_CATEGORIES, CategoryItem } from "@/data/places";

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

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    category_label: "",
    sub_categories: [] as string[],
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
    const selectedCat = categories.find((c) => c.name === catName);
    setFormData((prev) => ({
      ...prev,
      category: catName,
      category_label: selectedCat ? selectedCat.label : catName,
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
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء حفظ المكان المقترح: " + (err.message || "حاول مرة أخرى"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialFetching) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: "40px", height: "40px", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)" }}>جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "100px 20px 60px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", padding: "12px 20px", borderRadius: "30px", background: "rgba(108, 99, 255, 0.12)", border: "1px solid rgba(108, 99, 255, 0.25)", color: "var(--accent-primary)", fontSize: "0.9rem", fontWeight: "700", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
            <i className="bx bx-map-pin" style={{ fontSize: "1.2rem" }}></i>
            {editId ? "تعديل وإعادة إرسال اقتراح مكان" : "اقتراح مكان جديد"}
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary)", margin: "0 0 10px" }}>
            {editId ? "تعديل بيانات المكان المقترح" : "ساهم معنا في إضافة مكان جديد"}
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
            يمكنك اقتراح أي مكان متميز (مطعم، كافيه، حديقة، الخ). سيقوم فريق الإدارة بمراجعة التفاصيل ونشره فور الاعتماد!
          </p>
        </div>

        {/* Rejection Notice if edit mode & rejected */}
        {editId && rejectionReason && (
          <div style={{ background: "rgba(255, 59, 48, 0.12)", border: "1px solid rgba(255, 59, 48, 0.35)", borderRadius: "20px", padding: "20px", marginBottom: "30px", display: "flex", gap: "16px", alignItems: "flex-start", animation: "slide-down 0.3s ease" }}>
            <div style={{ fontSize: "1.8rem", color: "#ff3b30" }}>⚠️</div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ff3b30", margin: "0 0 6px" }}>
                سبب رفض الاقتراح السابق من الإدارة:
              </h3>
              <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
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
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "12px" }}>
              {editId ? "تمت إعادة إرسال الاقتراح بنجاح!" : "تم إرسال اقتراحك بنجاح!"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
              شكراً لمساهمتك! ستقوم الإدارة بمراجعة تفاصيل المكان قريباً، وسوف يصلك إشعار فور اتخاذ القرار.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/profile" className="ios-btn ios-btn-primary" style={{ padding: "12px 24px", textDecoration: "none" }}>
                العودة للبروفايل
              </Link>
              <button 
                type="button"
                className="ios-btn"
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    name: "", category: "", category_label: "", sub_categories: [], governorate: "", city: "", address: "", phone: "", description: "", image_url: "", images: [], working_hours: "", price_range: "متوسط", location_url: "", facebook: "", instagram: "", website_url: ""
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
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "32px", borderRadius: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {errorMsg && (
              <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "14px", borderRadius: "14px", color: "#ff3b30", fontSize: "0.9rem" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Section 1: Basic Info */}
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-info-circle"></i> البيانات الأساسية للمكان
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Place Name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">اسم المكان <span style={{ color: "#ff3b30" }}>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطعم وكافيه الفيروز"
                    className="ios-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 <strong>تلميح:</strong> يفضل كتابة اسم المكان الرسمي المكتوب على اليافتة لسهولة التعرف عليه.
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="help-label">التصنيف الرئيسي <span style={{ color: "#ff3b30" }}>*</span></label>
                  <select
                    required
                    className="ios-input help-select"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="" disabled>اختر التصنيف...</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.label}</option>
                    ))}
                  </select>
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 اختر التصنيف الأقرب لنشاط المكان الرئيسي.
                  </p>
                </div>

                {/* Sub-categories */}
                <div style={{ gridColumn: "1 / -1", background: "rgba(108, 99, 255, 0.05)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border-glass)" }}>
                  <label className="help-label" style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)", display: "block" }}>
                    تصنيفات فرعية اختيارية
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {categories.filter(c => c.name !== formData.category).map(cat => {
                      const isSelected = formData.sub_categories?.includes(cat.name);
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => {
                            const current = formData.sub_categories || [];
                            const next = isSelected ? current.filter(s => s !== cat.name) : [...current, cat.name];
                            setFormData({ ...formData, sub_categories: next });
                          }}
                          style={{
                            background: isSelected ? "var(--accent-primary, #6c63ff)" : "rgba(255, 255, 255, 0.06)",
                            color: isSelected ? "#fff" : "var(--text-primary)",
                            border: isSelected ? "none" : "1px solid var(--border-glass)",
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

                {/* Price Range */}
                <div>
                  <label className="help-label">فئة الأسعار</label>
                  <select
                    className="ios-input help-select"
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  >
                    <option value="اقتصادي">اقتصادي (💰)</option>
                    <option value="متوسط">متوسط (💰💰)</option>
                    <option value="مرتفع">مرتفع / فاخر (💰💰💰)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Location & Address */}
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-map"></i> الموقع والعنوان التفصيلي
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Governorate */}
                <div>
                  <label className="help-label">المحافظة <span style={{ color: "#ff3b30" }}>*</span></label>
                  <select
                    required
                    className="ios-input help-select"
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value, city: "" })}
                  >
                    <option value="" disabled>اختر المحافظة...</option>
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
                    className="ios-input help-select"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="" disabled>اختر المدينة...</option>
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
                    className="ios-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    💡 اكتب علامة مميزة بجوار المكان لسهولة الوصول إليه.
                  </p>
                </div>

                {/* Google Maps URL */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">رابط خريطة جوجل (Google Maps Link)</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="ios-input"
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
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-phone-call"></i> التواصل وساعات العمل
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="help-label">رقم الهاتف / الدليفري</label>
                  <input
                    type="tel"
                    placeholder="01012345678"
                    className="ios-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>

                <div>
                  <label className="help-label">مواعيد وساعات العمل</label>
                  <input
                    type="text"
                    placeholder="مثال: يومياً من 10 صباحاً حتى 12 منتصف الليل"
                    className="ios-input"
                    value={formData.working_hours}
                    onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="help-label">رابط موقع المكان الإلكتروني (إن وجد)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="ios-input"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Images & Media */}
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-image"></i> صور المكان
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
                {/* Upload from Device Button */}
                <div>
                  <label
                    className="ios-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, var(--accent-primary), #4e44e0)",
                      color: "#fff",
                      fontWeight: "700",
                      padding: "12px 20px",
                      borderRadius: "14px",
                      cursor: isUploadingImg ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 15px rgba(108, 99, 255, 0.3)"
                    }}
                  >
                    <i className={isUploadingImg ? "bx bx-loader-alt bx-spin" : "bx bx-cloud-upload"} style={{ fontSize: "1.3rem" }}></i>
                    <span>{isUploadingImg ? "جاري رفع الصورة..." : "📸 رفع صورة من جهازك"}</span>
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
                    className="ios-input"
                    value={newImgInput}
                    onChange={(e) => setNewImgInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    style={{ flex: 1, direction: "ltr", textAlign: "left" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="ios-btn"
                    disabled={!newImgInput.trim()}
                    style={{ background: "rgba(108, 99, 255, 0.2)", color: "var(--accent-primary)", fontWeight: "700", padding: "10px 18px" }}
                  >
                    🔗 إضافة رابط
                  </button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "14px", overflow: "hidden", border: "2px solid var(--border-glass)" }}>
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
                className="ios-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="ios-btn ios-btn-primary"
              style={{ padding: "16px", fontSize: "1.05rem", fontWeight: "800", marginTop: "10px", justifyContent: "center" }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "20px", height: "20px" }} />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <i className="bx bx-paper-plane" style={{ fontSize: "1.3rem" }}></i>
                  {editId ? "إعادة إرسال للمراجعة" : "إرسال الاقتراح للإدارة"}
                </>
              )}
            </button>
          </form>
        )}
      </main>

      <Footer />
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
