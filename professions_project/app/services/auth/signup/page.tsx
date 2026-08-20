"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

const SPECIALTIES_LIST = [
  "سباك",
  "كهربائي",
  "ميكانيكي",
  "طبيب",
  "نجار",
  "نقاش",
  "بناء",
  "فني تكييف",
  "فني دش",
  "خياط",
  "أخرى (كتابة تخصص جديد)"
];

export default function ServicesSignupPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [role, setRole] = useState<"client" | "worker">("client");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("role") === "worker") {
        setRole("worker");
      }
    }
  }, []);

  // Check if logged in user is already a worker
  useEffect(() => {
    if (user && supabase) {
      setRole("worker");
      supabase
        .from("service_workers")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            router.push("/services/dashboard");
          }
        });
    }
  }, [user, router]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    governorate: "",
    city: "",
    dob: "",
    password: "",
    confirmPassword: ""
  });

  // Worker specific fields
  const [specialty, setSpecialty] = useState(SPECIALTIES_LIST[0]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [age, setAge] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Avatar profile image state (Mandatory for worker)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Location states
  const [workerGov, setWorkerGov] = useState("");
  const [workerCity, setWorkerCity] = useState("");
  const [workerCoords, setWorkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.phone && !workerPhone) setWorkerPhone(profile.phone);
      if (profile.governorate && !workerGov) setWorkerGov(profile.governorate);
      if (profile.city && !workerCity) setWorkerCity(profile.city);
      if (profile.avatar_url && !avatarPreview) setAvatarPreview(profile.avatar_url);
    }
  }, [profile, workerPhone, workerGov, workerCity, avatarPreview]);

  const handleGetGPSLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("خاصية تحديد الموقع غير مدعومة في متصفحك.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setWorkerCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGettingLocation(false);
        alert("تم تحديث موقع الـ GPS بنجاح! (" + pos.coords.latitude.toFixed(4) + ", " + pos.coords.longitude.toFixed(4) + ")");
      },
      (err) => {
        console.error(err);
        setGettingLocation(false);
        alert("تعذر التقاط الـ GPS تلقائياً، يمكنك الاعتماد على تحديد المحافظة والمدينة.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Available cities based on governorate
  const cities = formData.governorate ? egyptLocations[formData.governorate] || [] : [];

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setPortfolioFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setPortfolioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validatePassword = () => {
    const p = formData.password;
    if (p.length < 8) return "يجب أن تكون كلمة المرور 8 أحرف على الأقل.";
    if (!/[A-Z]/.test(p)) return "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.";
    if (!/[0-9]/.test(p)) return "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.";
    if (p !== formData.confirmPassword) return "كلمتا المرور غير متطابقتين.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("لم يتم تكوين إعدادات قاعدة البيانات بعد.");
      return;
    }

    // If user is already logged in, upgrade account using existing profile
    if (user) {
      setLoading(true);
      setError("");

      const selectedSpecialtyVal = specialty === "أخرى (كتابة تخصص جديد)" ? customSpecialty : specialty;
      if (!selectedSpecialtyVal.trim()) {
        setError("يرجى كتابة التخصص الخاص بك.");
        setLoading(false);
        return;
      }

      if (!avatarFile && !profile?.avatar_url && !avatarPreview) {
        setError("يرجى اختيار صورة شخصية (صورة البروفايل) الخاصة بك. الصورة الشخصية إجبارية لمقدمي الخدمات.");
        setLoading(false);
        return;
      }

      if (!age || parseInt(age) < 16) {
        setError("يرجى إدخال العمر / السن بشكل صحيح (إجباري).");
        setLoading(false);
        return;
      }

      const selectedGov = workerGov || profile?.governorate || "";
      const selectedCity = workerCity || profile?.city || "";
      if (!selectedGov || !selectedCity) {
        setError("يرجى تحديد المحافظة والمدينة لتحديد موقع تقديم خدماتك (إجباري لميزة بالقرب مني).");
        setLoading(false);
        return;
      }

      try {
        // Ensure profile exists for user.id
        const { data: profileCheck } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .limit(1);

        const phoneToSave = workerPhone.trim() || formData.phone.trim();
        const formattedPhone = phoneToSave ? (phoneToSave.startsWith("+") ? phoneToSave : `+20${phoneToSave.replace(/^0+/, "")}`) : null;

        // Upload avatar file if selected
        let finalAvatarUrl = profile?.avatar_url || "";
        if (avatarFile) {
          const avatarExt = avatarFile.name.split('.').pop();
          const avatarFileName = `${user.id}_avatar_${Date.now()}.${avatarExt}`;
          const avatarPath = `${user.id}/${avatarFileName}`;

          const { error: avatarErr } = await supabase.storage
            .from("portfolio")
            .upload(avatarPath, avatarFile);

          if (!avatarErr) {
            const { data: pubUrl } = supabase.storage.from("portfolio").getPublicUrl(avatarPath);
            if (pubUrl && pubUrl.publicUrl) {
              finalAvatarUrl = pubUrl.publicUrl;
            }
          }
        }

        if (!profileCheck || profileCheck.length === 0) {
          const fallbackName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "عميل";
          const fallbackUsername = profile?.username || user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${user.id.slice(0, 6)}`;
          
          await supabase.from("profiles").upsert({
            id: user.id,
            full_name: fallbackName,
            username: fallbackUsername,
            email: user.email || "",
            phone: formattedPhone || undefined,
            governorate: selectedGov,
            city: selectedCity,
            ...(finalAvatarUrl ? { avatar_url: finalAvatarUrl } : {})
          }, { onConflict: "id" });
        } else {
          await supabase.from("profiles").update({
            governorate: selectedGov,
            city: selectedCity,
            ...(formattedPhone ? { phone: formattedPhone } : {}),
            ...(finalAvatarUrl ? { avatar_url: finalAvatarUrl } : {})
          }).eq("id", user.id);
        }

        const { error: workerError } = await supabase
          .from("service_workers")
          .upsert({
            id: user.id,
            specialty: selectedSpecialtyVal.trim(),
            experience_years: parseInt(experienceYears) || 0,
            age: parseInt(age) || null,
            bio: bio.trim(),
            is_available: true,
            ...(workerCoords ? { latitude: workerCoords.lat, longitude: workerCoords.lng } : {})
          }, { onConflict: "id" });

        if (workerError) {
          setError("فشل تفعيل ملفك المهني: " + workerError.message);
          setLoading(false);
          return;
        }

        if (portfolioFiles.length > 0) {
          setUploadingFiles(true);
          for (let file of portfolioFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_portfolio_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("portfolio")
              .upload(filePath, file);

            if (!uploadError) {
              const { data: pubUrl } = supabase.storage.from("portfolio").getPublicUrl(filePath);
              if (pubUrl && pubUrl.publicUrl) {
                await supabase.from("worker_portfolio").insert({
                  worker_id: user.id,
                  image_url: pubUrl.publicUrl,
                  title: file.name.split('.')[0] || "عمل منجز"
                });
              }
            }
          }
          setUploadingFiles(false);
        }

        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push("/services/dashboard");
        }, 2000);
      } catch (err: any) {
        console.error(err);
        setError("حدث خطأ غير متوقع: " + err.message);
        setLoading(false);
      }
      return;
    }

    const pwdError = validatePassword();
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setLoading(true);
    setError("");

    const fullPhone = `+20${formData.phone.replace(/^0+/, "")}`;
    const fullNameCombined = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

    try {
      // 1. Check if email/username/phone exists in profiles
      const { data: existing } = await supabase
        .from("profiles")
        .select("username, email, phone")
        .or(`username.eq.${formData.username},email.eq.${formData.email},phone.eq.${fullPhone}`)
        .limit(1);

      if (existing && existing.length > 0) {
        const c = existing[0];
        if (c.username === formData.username) setError("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
        else if (c.email === formData.email) setError("البريد الإلكتروني مسجل مسبقاً.");
        else setError("رقم الهاتف مسجل مسبقاً.");
        setLoading(false);
        return;
      }

      // 2. Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullNameCombined,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            username: formData.username,
            phone: fullPhone,
            governorate: formData.governorate,
            city: formData.city,
            dob: formData.dob
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError("حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً.");
        setLoading(false);
        return;
      }

      // Wait a short moment to ensure profiles trigger finished
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. If Worker, create record in service_workers
      if (role === "worker") {
        if (!avatarFile && !avatarPreview) {
          setError("يرجى اختيار صورة شخصية (صورة البروفايل) الخاصة بك (إجباري لفنيي الخدمات).");
          setLoading(false);
          return;
        }

        if (!age || parseInt(age) < 16) {
          setError("يرجى إدخال العمر / السن بشكل صحيح (إجباري).");
          setLoading(false);
          return;
        }

        const selectedSpecialtyVal = specialty === "أخرى (كتابة تخصص جديد)" ? customSpecialty : specialty;
        if (!selectedSpecialtyVal.trim()) {
          setError("يرجى كتابة التخصص الخاص بك.");
          setLoading(false);
          return;
        }

        // Upload avatar file if selected
        if (avatarFile) {
          const avatarExt = avatarFile.name.split('.').pop();
          const avatarFileName = `${userId}_avatar_${Date.now()}.${avatarExt}`;
          const avatarPath = `${userId}/${avatarFileName}`;

          const { error: avatarErr } = await supabase.storage
            .from("portfolio")
            .upload(avatarPath, avatarFile);

          if (!avatarErr) {
            const { data: pubUrl } = supabase.storage.from("portfolio").getPublicUrl(avatarPath);
            if (pubUrl && pubUrl.publicUrl) {
              await supabase.from("profiles").update({ avatar_url: pubUrl.publicUrl }).eq("id", userId);
            }
          }
        }

        const { error: workerError } = await supabase
          .from("service_workers")
          .upsert({
            id: userId,
            specialty: selectedSpecialtyVal.trim(),
            experience_years: parseInt(experienceYears) || 0,
            age: parseInt(age) || null,
            bio: bio.trim(),
            is_available: true,
            ...(workerCoords ? { latitude: workerCoords.lat, longitude: workerCoords.lng } : {})
          }, { onConflict: "id" });

        if (workerError) {
          console.error("Worker insert error:", workerError);
          setError("تم إنشاء الحساب الأساسي ولكن فشل تسجيل تفاصيل المهنة: " + workerError.message);
          setLoading(false);
          return;
        }

        // 4. Upload portfolio images
        if (portfolioFiles.length > 0) {
          setUploadingFiles(true);
          for (let file of portfolioFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}_portfolio_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("portfolio")
              .upload(filePath, file);

            if (uploadError) {
              console.error("File upload error:", uploadError);
              continue;
            }

            // Get public url
            const { data: pubUrl } = supabase.storage
              .from("portfolio")
              .getPublicUrl(filePath);

            if (pubUrl && pubUrl.publicUrl) {
              await supabase
                .from("worker_portfolio")
                .insert({
                  worker_id: userId,
                  image_url: pubUrl.publicUrl,
                  title: file.name.split('.')[0] || "عمل منجز"
                });
            }
          }
          setUploadingFiles(false);
        }
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push(role === "worker" ? "/services/dashboard" : "/services");
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ غير متوقع أثناء التسجيل: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "var(--bg-primary)",
      direction: "rtl"
    }}>
      {/* Background Orbs */}
      <div style={{ position: "fixed", top: "-15%", right: "-10%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 65%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: "550px", position: "relative", zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontFamily: "var(--font-almarai)",
            fontSize: "2rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, var(--accent-ios, #3b82f6), #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
          }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            انضم الآن لدليل الخدمات كعميل مستفيد أو كمزود خدمة محترف
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "var(--shadow-card)",
        }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎉</div>
              <h3 style={{ color: "var(--accent-success, #10b981)", fontWeight: "800", fontSize: "1.2rem", marginBottom: "10px" }}>تم إنشاء الحساب بنجاح!</h3>
              <p style={{ color: "var(--text-secondary)" }}>جاري توجيهك إلى لوحة التحكم...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {error && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--accent-danger, #ef4444)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}>
                  ⚠️ {error}
                </div>
              )}

              {user ? (
                <div style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "1.6rem" }}>👤</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                        {profile?.full_name || user.email?.split("@")[0]}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-success, #10b981)", fontWeight: "700" }}>
                        ✅ حساب مسجل حالياً
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    <div>📧 البريد: <strong style={{ color: "var(--text-primary)" }}>{user.email}</strong></div>
                    <div>📞 الهاتف: <strong style={{ color: "var(--text-primary)" }}>{profile?.phone || "مسجل بالحساب"}</strong></div>
                    <div>📍 المحافظة: <strong style={{ color: "var(--text-primary)" }}>{profile?.governorate || "مسجل بالحساب"}</strong></div>
                    <div>🏙️ المدينة: <strong style={{ color: "var(--text-primary)" }}>{profile?.city || "مسجل بالحساب"}</strong></div>
                  </div>
                  <p style={{ margin: "12px 0 0", fontSize: "0.78rem", color: "var(--accent-ios, #3b82f6)", fontWeight: "700" }}>
                    ℹ️ سيتم تفعيل حسابك المهني كـ فني باستخدام بياناتك المسجلة أعلاه. يرجى استكمال بيانات التخصص والمهنة أدناه فقط:
                  </p>
                </div>
              ) : (
                <>
                  {/* Role Selection */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>نوع الحساب</label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={() => setRole("client")}
                        style={{
                          flex: 1,
                          padding: "14px",
                          borderRadius: "12px",
                          border: role === "client" ? "2px solid var(--accent-ios, #3b82f6)" : "1px solid var(--border-glass)",
                          background: role === "client" ? "rgba(59, 130, 246, 0.08)" : "var(--bg-secondary)",
                          color: role === "client" ? "var(--accent-ios, #3b82f6)" : "var(--text-secondary)",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontFamily: "var(--font-almarai)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        👤 عميل مستفيد
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("worker")}
                        style={{
                          flex: 1,
                          padding: "14px",
                          borderRadius: "12px",
                          border: role === "worker" ? "2px solid var(--accent-ios, #3b82f6)" : "1px solid var(--border-glass)",
                          background: role === "worker" ? "rgba(59, 130, 246, 0.08)" : "var(--bg-secondary)",
                          color: role === "worker" ? "var(--accent-ios, #3b82f6)" : "var(--text-secondary)",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontFamily: "var(--font-almarai)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        🛠️ مقدم خدمة / عامل
                      </button>
                    </div>
                  </div>

                  {/* Basic Fields Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>الاسم الأول</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>الاسم الأخير</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>اسم المستخدم (لاتيني، بدون فواصل)</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="username"
                      className="ios-input"
                      style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", direction: "ltr", textAlign: "right", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="example@mail.com"
                      className="ios-input"
                      style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", direction: "ltr", textAlign: "right", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>رقم الهاتف (بينما +20)</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10,11}"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                          placeholder="01xxxxxxxxx"
                          className="ios-input"
                          style={{ height: "42px", width: "100%", padding: "0 12px", fontSize: "0.88rem", direction: "ltr", textAlign: "right", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>تاريخ الميلاد</label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                  </div>

                  {/* Geography Fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>المحافظة</label>
                      <select
                        required
                        value={formData.governorate}
                        onChange={(e) => {
                          handleInputChange("governorate", e.target.value);
                          handleInputChange("city", "");
                        }}
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
                      >
                        <option value="">اختر المحافظة</option>
                        {governoratesList.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>المدينة / المنطقة</label>
                      <select
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        disabled={!formData.governorate}
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
                      >
                        <option value="">اختر المدينة</option>
                        {cities.map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>كلمة المرور</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="••••••••"
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>تأكيد كلمة المرور</label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Worker Specific Section (Visible only when role is Worker) */}
              {role === "worker" && (
                <div style={{
                  borderTop: "1px solid var(--border-glass)",
                  paddingTop: "16px",
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  animation: "slide-down 0.3s ease"
                }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-ios, #3b82f6)", marginBottom: "4px" }}>بيانات المهنة الإضافية</h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>التخصص المهني</label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
                      >
                        {SPECIALTIES_LIST.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>سنوات الخبرة</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                  </div>

                  {specialty === "أخرى (كتابة تخصص جديد)" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>اكتب التخصص الخاص بك</label>
                      <input
                        type="text"
                        required
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        placeholder="مثال: فني كاميرات مراقبة"
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
                  )}

                  {/* Avatar Profile Image Selection (Mandatory for Worker) */}
                  <div style={{
                    background: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>📷 صورة البروفايل الشخصية <span style={{ color: "#ef4444" }}>* (إجباري)</span></span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                      <div style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "50%",
                        background: "var(--bg-secondary)",
                        border: "2px solid var(--accent-ios, #3b82f6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        fontSize: "1.8rem"
                      }}>
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "👨‍🔧"
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                        <input
                          type="file"
                          accept="image/*"
                          id="avatarFileInput"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setAvatarFile(file);
                              setAvatarPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <label
                          htmlFor="avatarFileInput"
                          style={{
                            padding: "8px 14px",
                            background: "var(--accent-ios, #3b82f6)",
                            color: "#ffffff",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "inline-block",
                            textAlign: "center"
                          }}
                        >
                          {avatarPreview ? "🔄 تغيير الصورة الشخصية" : "📸 رفع صورة البروفايل"}
                        </label>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          ارفق صورة شخصية ثنائية الأبعاد لوجهك لتظهر في كارت الخدمة للعملاء
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Selection & GPS (Mandatory for Worker) */}
                  <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>
                      📍 موقع تقديم الخدمات <span style={{ color: "#ef4444" }}>* (إجباري لميزة بالقرب مني)</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>المحافظة</label>
                        <select
                          required
                          value={user ? workerGov : formData.governorate}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (user) { setWorkerGov(val); setWorkerCity(""); }
                            else { handleInputChange("governorate", val); handleInputChange("city", ""); }
                          }}
                          style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-primary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
                        >
                          <option value="">اختر المحافظة</option>
                          {governoratesList.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>المدينة / المنطقة</label>
                        <select
                          required
                          value={user ? workerCity : formData.city}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (user) setWorkerCity(val);
                            else handleInputChange("city", val);
                          }}
                          disabled={!(user ? workerGov : formData.governorate)}
                          style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-primary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
                        >
                          <option value="">اختر المدينة</option>
                          {((user ? workerGov : formData.governorate) ? egyptLocations[user ? workerGov : formData.governorate] || [] : []).map(ct => (
                            <option key={ct} value={ct}>{ct}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGetGPSLocation}
                      disabled={gettingLocation}
                      style={{
                        height: "40px",
                        borderRadius: "8px",
                        background: workerCoords ? "rgba(16,185,129,0.15)" : "var(--bg-primary)",
                        border: `1px solid ${workerCoords ? "rgba(16,185,129,0.3)" : "var(--border-glass)"}`,
                        color: workerCoords ? "var(--accent-success, #10b981)" : "var(--text-primary)",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      📍 {gettingLocation ? "جاري التقاط إحداثيات الـ GPS..." : workerCoords ? "تم التقاط موقعك بدقة عالية (GPS)" : "تحديد موقعي الحقيقي على الخريطة تلقائياً (GPS)"}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>نبذة عنك وعن خبراتك (Bio)</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="اكتب هنا تفاصيل مهاراتك والخدمات التي تقدمها لتجذب العملاء..."
                      style={{
                        height: "80px",
                        padding: "10px 12px",
                        fontSize: "0.88rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        fontFamily: "var(--font-almarai)",
                        color: "var(--text-primary)",
                        resize: "none",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Portfolio File Upload */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>صور من أعمالك المنجزة (معرض الأعمال)</label>
                    <div style={{
                      border: "2px dashed var(--border-glass)",
                      borderRadius: "10px",
                      padding: "20px",
                      textAlign: "center",
                      backgroundColor: "var(--bg-secondary)",
                      position: "relative",
                      cursor: "pointer"
                    }}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0,
                          cursor: "pointer"
                        }}
                      />
                      <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📸</div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>اسحب وافلت الصور هنا، أو اضغط للتصفح</p>
                    </div>

                    {/* Files Preview list */}
                    {portfolioFiles.length > 0 && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                        {portfolioFiles.map((file, idx) => (
                          <div key={idx} style={{
                            position: "relative",
                            width: "70px",
                            height: "70px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid var(--border-glass)"
                          }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "rgba(239, 68, 68, 0.8)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                fontSize: "0.6rem"
                              }}
                            >
                              ❌
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || uploadingFiles}
                style={{
                  height: "46px",
                  borderRadius: "10px",
                  background: "var(--accent-ios, #3b82f6)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  fontFamily: "var(--font-almarai)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "10px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                {loading ? (
                  <span style={{ display: "inline-block", width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                ) : uploadingFiles ? (
                  "جاري رفع الصور..."
                ) : user ? (
                  "⚡ تفعيل الحساب المهني والانضمام كـ فني"
                ) : (
                  "إنشاء الحساب"
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-glass)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>لديك حساب بالفعل؟</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-glass)" }} />
          </div>

          {/* Links */}
          <div style={{ textAlign: "center", fontSize: "0.85rem" }}>
            <Link href="/services/auth/login" style={{ color: "var(--accent-ios, #3b82f6)", fontWeight: "700", textDecoration: "none" }}>
              تسجيل الدخول هنا
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "40px" }}>
          <Link href="/services" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", textDecoration: "none" }}>
            ⬅️ العودة للدليل بدون تسجيل
          </Link>
        </div>
      </div>
    </div>
  );
}
