"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  const [role, setRole] = useState<"client" | "worker">("client");
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
  const [bio, setBio] = useState("");
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
        const selectedSpecialtyVal = specialty === "أخرى (كتابة تخصص جديد)" ? customSpecialty : specialty;
        if (!selectedSpecialtyVal.trim()) {
          setError("يرجى كتابة التخصص الخاص بك.");
          setLoading(false);
          return;
        }

        const { error: workerError } = await supabase
          .from("service_workers")
          .insert({
            id: userId,
            specialty: selectedSpecialtyVal.trim(),
            experience_years: parseInt(experienceYears) || 0,
            age: parseInt(age) || null,
            bio: bio.trim(),
            is_available: true
          });

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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>العمر (بالسنوات)</label>
                      <input
                        type="number"
                        min="16"
                        max="100"
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="العمر"
                        className="ios-input"
                        style={{ height: "42px", padding: "0 12px", fontSize: "0.88rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}
                      />
                    </div>
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
