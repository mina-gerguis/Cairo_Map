"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatBoxIcon } from "@/data/places";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url?: string;
  icon?: string;
  description?: string;
}

interface TelecomCodeEntry {
  id: string;
  company: string;
  section_name: string;
  title: string;
  code: string;
  icon?: string;
}

const COMPANY_META: Record<string, { label: string; logo: string; color: string; border: string }> = {
  vodafone: { label: "فودافون", logo: "vodafone.png", color: "rgba(224, 0, 0, 0.08)", border: "rgba(224, 0, 0, 0.2)" },
  orange: { label: "اورنج", logo: "orange.png", color: "rgba(255, 102, 0, 0.08)", border: "rgba(255, 102, 0, 0.2)" },
  etisalat: { label: "اتصالات", logo: "etisalat.png", color: "rgba(0, 150, 0, 0.08)", border: "rgba(0, 150, 0, 0.2)" },
  we: { label: "وي", logo: "we.png", color: "rgba(108, 99, 255, 0.08)", border: "rgba(108, 99, 255, 0.2)" },
};

interface DirectorySuggestionBoxProps {
  searchQuery: string;
  user: { id: string } | null;
  specialties: string[];
  defaultType?: "phone" | "code";
  defaultCompany?: string;
  onSuccess?: () => void;
}

function DirectorySuggestionBox({
  searchQuery,
  user,
  specialties,
  defaultType = "phone",
  defaultCompany = "vodafone",
  onSuccess,
}: DirectorySuggestionBoxProps) {
  const q = searchQuery.trim();
  const isCodePattern = q.startsWith("*") || q.endsWith("#") || (q.includes("*") && q.includes("#"));
  const isDigitsPattern = /^[0-9+\s-]+$/.test(q);
  const calculatedType: "phone" | "code" = isCodePattern ? "code" : defaultType;

  const [type, setType] = useState<"phone" | "code">(calculatedType);
  const [phoneName, setPhoneName] = useState(() => (!isDigitsPattern && !isCodePattern && calculatedType === "phone" ? q : ""));
  const [phoneNumber, setPhoneNumber] = useState(() => (isDigitsPattern && calculatedType === "phone" ? q : ""));
  const [phoneSpecialty, setPhoneSpecialty] = useState("");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [phoneNotes, setPhoneNotes] = useState("");

  const [codeCompany, setCodeCompany] = useState(defaultCompany);
  const [codeTitle, setCodeTitle] = useState(() => (!isDigitsPattern && !isCodePattern && calculatedType === "code" ? q : ""));
  const [codeValue, setCodeValue] = useState(() => ((isCodePattern || isDigitsPattern) && calculatedType === "code" ? q : ""));
  const [codeNotes, setCodeNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("يرجى تسجيل الدخول أولاً لتتمكن من إرسال اقتراحك.");
      return;
    }
    if (!supabase) {
      setError("خدمة البيانات غير متوفرة حالياً. يرجى المحاولة لاحقاً.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const limitReached = await isFeedbackLimitReached(user.id);
      if (limitReached) {
        setError("لديك 5 طلبات أو اقتراحات قيد المراجعة حالياً. يرجى الانتظار حتى تنتهي الإدارة من مراجعتها.");
        setLoading(false);
        return;
      }

      let category = "";
      let title = "";
      let content = "";
      let itemTitle = "";

      if (type === "phone") {
        const finalName = phoneName.trim();
        const finalPhone = phoneNumber.trim();
        if (!finalName || !finalPhone) {
          setError("يرجى إدخال اسم الجهة أو الخدمة ورقم الهاتف.");
          setLoading(false);
          return;
        }

        const finalSpec = customSpecialty.trim() || (phoneSpecialty !== "other" && phoneSpecialty) || "عام / غير محدد";
        category = "اقتراح رقم هاتف جديد";
        title = `اقتراح إضافة رقم: ${finalName} (${finalPhone})`;
        itemTitle = finalName;
        content = `📞 نوع الاقتراح: إضافة رقم هاتف جديد للدليل
🏢 اسم الجهة أو الخدمة: ${finalName}
📱 رقم الهاتف: ${finalPhone}
🏷️ التخصص / الفئة: ${finalSpec}
📝 ملاحظات أو تفاصيل إضافية: ${phoneNotes.trim() || "لا توجد ملاحظات إضافية"}`;
      } else {
        const finalTitle = codeTitle.trim();
        const finalCode = codeValue.trim();
        if (!finalTitle || !finalCode) {
          setError("يرجى إدخال اسم الخدمة والكود المطلوب.");
          setLoading(false);
          return;
        }

        const companyLabel = COMPANY_META[codeCompany]?.label || codeCompany;
        category = "اقتراح كود شبكة جديد";
        title = `اقتراح كود ${companyLabel}: ${finalTitle} (${finalCode})`;
        itemTitle = `${finalTitle} (${companyLabel})`;
        content = `📶 نوع الاقتراح: إضافة كود شبكة اتصالات جديد
🏢 شركة الاتصالات: ${companyLabel}
📌 عنوان الخدمة / الغرض: ${finalTitle}
🔢 الكود: ${finalCode}
📝 ملاحظات أو طريقة الاستخدام: ${codeNotes.trim() || "لا توجد ملاحظات إضافية"}`;
      }

      const { error: insertErr } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "suggestion",
          category,
          title,
          content,
          status: "pending",
        },
      ]);

      if (insertErr) throw insertErr;

      // In-app notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام اقتراحك بنجاح 💡",
            message: `شكراً لمساهمتك في دليل الهاتف! تم استلام اقتراحك لإضافة "${itemTitle}". سيتم مراجعته وإضافته للدليل قريباً لتعم الفائدة على الجميع.`,
            type: "success",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إرسال الاقتراح. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="metro-animate-slide-up"
      style={{
        backgroundColor: "var(--bgPrimary)",
        border: "1px solid var(--borderGlass)",
        borderRadius: "var(--radius-card)",
        padding: "22px 18px",
        boxShadow: "var(--shadow-sm)",
        textAlign: "right",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, var(--colorSecondary), var(--colorPrimary), #10b981)",
        }}
      />

      {/* Header section */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            color: "var(--colorSecondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-lightbulb"></i>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1.02rem",
                fontWeight: "800",
                color: "var(--textPrimary)",
                fontFamily: "var(--font-cairo)",
              }}
            >
              لم تجد الرقم أو الكود الذي تبحث عنه؟
            </h3>
            {searchQuery.trim() && (
              <span
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  fontSize: "0.74rem",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontFamily: "var(--font-cairo)",
                }}
              >
                بحثك: {searchQuery}
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              color: "var(--textSecondary)",
              lineHeight: "1.5",
              fontFamily: "var(--font-cairo)",
            }}
          >
            إذا كنت تعرف هذا الرقم أو الكود غير الموجود، اقترحه الآن على الإدارة لمراجعته وإضافته للدليل حتى يستفيد الجميع!
          </p>
        </div>
      </div>

      {success ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius-card)",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.2)",
              color: "var(--colorSuccess)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              margin: "0 auto 10px",
            }}
          >
            <i className="fa-solid fa-check"></i>
          </div>
          <h4 style={{ margin: "0 0 6px", color: "var(--textPrimary)", fontSize: "0.98rem", fontWeight: "700", fontFamily: "var(--font-cairo)" }}>
            تم إرسال اقتراحك بنجاح للإدارة! 💡
          </h4>
          <p style={{ margin: "0 0 16px", color: "var(--textSecondary)", fontSize: "0.82rem", lineHeight: "1.5", fontFamily: "var(--font-cairo)" }}>
            شكراً لمساهمتك القيمة في إثراء الدليل، سيتم مراجعة بيانات الرقم أو الكود وإضافته في أقرب وقت لتعم الفائدة على الجميع.
          </p>
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setPhoneName("");
              setPhoneNumber("");
              setPhoneNotes("");
              setCodeTitle("");
              setCodeValue("");
              setCodeNotes("");
            }}
            style={{
              background: "var(--colorSecondary)",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "var(--font-cairo)",
            }}
          >
            اقتراح رقم أو كود آخر ➕
          </button>
        </div>
      ) : (
        <>
          {/* Tabs switch */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={() => setType("phone")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "10px",
                border: type === "phone" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                background: type === "phone" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                color: type === "phone" ? "var(--textPrimary)" : "var(--textSecondary)",
                fontWeight: "700",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "var(--font-cairo)",
                transition: "all 0.2s ease",
              }}
            >
              <i className="fa-solid fa-phone"></i>
              رقم هاتف أو جهة
            </button>

            <button
              type="button"
              onClick={() => setType("code")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "10px",
                border: type === "code" ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                background: type === "code" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                color: type === "code" ? "var(--textPrimary)" : "var(--textSecondary)",
                fontWeight: "700",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "var(--font-cairo)",
                transition: "all 0.2s ease",
              }}
            >
              <i className="fa-solid fa-hashtag"></i>
              كود شبكة اتصالات
            </button>
          </div>

          {/* If NOT logged in */}
          {!user ? (
            <div
              style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>🔐</div>
              <h5 style={{ margin: "0 0 6px", color: "var(--textPrimary)", fontSize: "0.92rem", fontWeight: "700", fontFamily: "var(--font-cairo)" }}>
                سجل دخولك لتتمكن من إرسال الاقتراح
              </h5>
              <p style={{ fontSize: "0.8rem", color: "var(--textSecondary)", margin: "0 0 12px", lineHeight: "1.5", fontFamily: "var(--font-cairo)" }}>
                سجل دخولك لتتمكن من مشاركة الأرقام والأكواد ومتابعة حالة اقتراحك وكسب نقاط مكافأة في حسابك!
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 22px",
                  fontSize: "0.85rem",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--colorSecondary)",
                  color: "#ffffff",
                  fontWeight: "700",
                  textDecoration: "none",
                  fontFamily: "var(--font-cairo)",
                }}
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                تسجيل الدخول للمتابعة
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {type === "phone" ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                      اسم الجهة أو الخدمة <span style={{ color: "var(--accent-danger, #ef4444)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="مثال: خدمة عملاء البنك الأهلي، طوارئ الغاز، صيدلية..."
                      value={phoneName}
                      onChange={(e) => setPhoneName(e.target.value)}
                      required
                      style={{ width: "100%", height: "40px", borderRadius: "10px", fontFamily: "var(--font-cairo)" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                        رقم الهاتف أو الخط الساخن <span style={{ color: "var(--accent-danger, #ef4444)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="مثال: 19888 أو 0233333333"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        style={{ width: "100%", height: "40px", borderRadius: "10px", direction: "ltr", textAlign: "right", fontFamily: "var(--font-cairo)" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                        التخصص أو الفئة
                      </label>
                      <select
                        className="input-fields"
                        value={phoneSpecialty}
                        onChange={(e) => setPhoneSpecialty(e.target.value)}
                        style={{ width: "100%", height: "40px", borderRadius: "10px", fontFamily: "var(--font-cairo)" }}
                      >
                        <option value="">اختر التخصص (اختياري)...</option>
                        {specialties.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                        <option value="other">تخصص آخر...</option>
                      </select>
                    </div>
                  </div>

                  {phoneSpecialty === "other" && (
                    <div>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="اكتب التخصص الجديد هنا..."
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        style={{ width: "100%", height: "38px", borderRadius: "10px", fontFamily: "var(--font-cairo)" }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                      ملاحظات أو تفاصيل إضافية (اختياري)
                    </label>
                    <textarea
                      className="input-fields"
                      placeholder="أوقات العمل، الفرع، أو أي تفاصيل تساعد في تدقيق الرقم..."
                      value={phoneNotes}
                      onChange={(e) => setPhoneNotes(e.target.value)}
                      rows={2}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", fontFamily: "var(--font-cairo)", resize: "vertical" }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "6px", fontFamily: "var(--font-cairo)" }}>
                      شركة الاتصالات <span style={{ color: "var(--accent-danger, #ef4444)" }}>*</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                      {Object.entries(COMPANY_META).map(([key, meta]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCodeCompany(key)}
                          style={{
                            padding: "8px 6px",
                            borderRadius: "10px",
                            border: codeCompany === key ? `1px solid ${meta.border}` : "1px solid var(--borderGlass)",
                            background: codeCompany === key ? meta.color : "var(--bgSecondary)",
                            color: codeCompany === key ? "var(--textPrimary)" : "var(--textSecondary)",
                            fontSize: "0.76rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: "var(--font-cairo)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Image src={`/images/company/${meta.logo}`} alt={meta.label} width={20} height={20} style={{ borderRadius: "50%" }} />
                          {meta.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                        اسم الخدمة / الغرض من الكود <span style={{ color: "var(--accent-danger, #ef4444)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="مثال: معرفة الرصيد، كود باقة سوبر ميجا..."
                        value={codeTitle}
                        onChange={(e) => setCodeTitle(e.target.value)}
                        required
                        style={{ width: "100%", height: "40px", borderRadius: "10px", fontFamily: "var(--font-cairo)" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                        الكود المطلوب <span style={{ color: "var(--accent-danger, #ef4444)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="مثال: *888# أو *86*..."
                        value={codeValue}
                        onChange={(e) => setCodeValue(e.target.value)}
                        required
                        style={{ width: "100%", height: "40px", borderRadius: "10px", direction: "ltr", textAlign: "right", fontFamily: "var(--font-cairo)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "4px", fontFamily: "var(--font-cairo)" }}>
                      ملاحظات أو طريقة الاستخدام (اختياري)
                    </label>
                    <textarea
                      className="input-fields"
                      placeholder="رسوم الخدمة، أو شروط تفعيلها..."
                      value={codeNotes}
                      onChange={(e) => setCodeNotes(e.target.value)}
                      rows={2}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", fontFamily: "var(--font-cairo)", resize: "vertical" }}
                    />
                  </div>
                </>
              )}

              {error && (
                <div style={{ color: "var(--accent-danger, #ef4444)", fontSize: "0.8rem", fontWeight: "700", fontFamily: "var(--font-cairo)" }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  alignSelf: "flex-end",
                  padding: "9px 22px",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--colorSecondary)",
                  color: "#ffffff",
                  fontSize: "0.86rem",
                  fontWeight: "700",
                  fontFamily: "var(--font-cairo)",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                  opacity: loading ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        border: "2px solid #ffffff",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    جاري إرسال الاقتراح...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    إرسال الاقتراح للإدارة
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default function PhoneDirectoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PhoneEntry[]>([]);
  const [codes, setCodes] = useState<TelecomCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // New Directory UI States
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("recent_phone_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showManualSuggest, setShowManualSuggest] = useState(false);

  // Public Telecom Codes UI State
  const [activeCompany, setActiveCompany] = useState<string>("vodafone");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        // Fetch directory phones
        const { data: phonesData } = await supabase
          .from("phone_directory")
          .select("*")
          .order("name", { ascending: true });
        if (phonesData) setEntries(phonesData);

        // Fetch telecom codes
        const { data: codesData } = await supabase
          .from("telecom_codes")
          .select("*");
        if (codesData) setCodes(codesData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset pagination limit when search query or category tab changes during render
  const [prevFilter, setPrevFilter] = useState({ query: searchQuery, specialty: selectedSpecialty });
  if (prevFilter.query !== searchQuery || prevFilter.specialty !== selectedSpecialty) {
    setPrevFilter({ query: searchQuery, specialty: selectedSpecialty });
    setVisibleCount(6);
  }

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ـ/g, "").toLowerCase();
  };

  const handleSaveSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 6);
      localStorage.setItem("recent_phone_searches", JSON.stringify(updated));
      return updated;
    });
  };

  // Dynamically extract unique specialties
  const specialties = React.useMemo(() => {
    const specs = entries.map((e) => e.specialty?.trim()).filter(Boolean);
    return Array.from(new Set(specs));
  }, [entries]);

  // Search Suggestions matching search query
  const suggestions = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return entries
      .filter((entry) => {
        const searchable = normalizeArabic(`${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`);
        return searchable.includes(q);
      })
      .slice(0, 5);
  }, [entries, searchQuery]);

  // Extract Boxicon maps for specialties
  const specialtyIcons = React.useMemo(() => {
    const map: Record<string, string> = {};
    entries.forEach((e) => {
      if (e.specialty && e.icon && !map[e.specialty]) {
        map[e.specialty] = e.icon;
      }
    });
    return map;
  }, [entries]);

  // Extract Boxicon maps for telecom sections
  const sectionIcons = React.useMemo(() => {
    const map: Record<string, string> = {};
    codes.forEach((c) => {
      if (c.section_name && c.icon && !map[c.section_name]) {
        map[c.section_name] = c.icon;
      }
    });
    return map;
  }, [codes]);

  // Combined filtering logic for phones
  const filteredEntries = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());

    // 1. Specialty Filter
    let result = entries;
    if (selectedSpecialty !== "all") {
      if (selectedSpecialty === "other") {
        result = entries.filter((e) => !e.specialty || e.specialty.trim() === "");
      } else {
        result = entries.filter((e) => e.specialty === selectedSpecialty);
      }
    }

    // 2. Search Query Filter
    if (q) {
      result = result.filter((entry) => {
        const searchable = normalizeArabic(`${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`);
        return searchable.includes(q);
      });
    }

    return result;
  }, [entries, searchQuery, selectedSpecialty]);

  // Paginated elements
  const slicedEntries = React.useMemo(() => {
    return filteredEntries.slice(0, visibleCount);
  }, [filteredEntries, visibleCount]);

  // Filter codes for the active company, taking searchQuery into account
  const activeCompanyCodes = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    const companyCodes = codes.filter((c) => c.company === activeCompany);
    if (!q) return companyCodes;
    return companyCodes.filter((c) => {
      const searchable = normalizeArabic(`${c.title} ${c.code} ${c.section_name} ${COMPANY_META[c.company]?.label || ""}`);
      return searchable.includes(q);
    });
  }, [codes, activeCompany, searchQuery]);

  // Check if search matches any telecom code across ANY OTHER company
  const matchingCodesInOtherCompanies = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return Object.keys(COMPANY_META)
      .filter((comp) => comp !== activeCompany)
      .filter((comp) => {
        return codes.some(
          (c) =>
            c.company === comp &&
            normalizeArabic(`${c.title} ${c.code} ${c.section_name} ${COMPANY_META[c.company]?.label || ""}`).includes(q)
        );
      });
  }, [codes, activeCompany, searchQuery]);

  // Group codes by section_name
  const groupedCodes: Record<string, TelecomCodeEntry[]> = React.useMemo(() => {
    const grouped: Record<string, TelecomCodeEntry[]> = {};
    activeCompanyCodes.forEach((code) => {
      if (!grouped[code.section_name]) {
        grouped[code.section_name] = [];
      }
      grouped[code.section_name].push(code);
    });
    return grouped;
  }, [activeCompanyCodes]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const getDialUrl = (code: string) => {
    return `tel:${code.replace(/#/g, "%23")}`;
  };

  const handleCopyCode = (code: string, id: string) => {
    if (typeof window !== "undefined") {
      const dialUrl = getDialUrl(code);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          setCopiedId(id);
          window.location.assign(dialUrl);
          setTimeout(() => {
            setCopiedId(null);
          }, 2000);
        }).catch((err) => {
          console.error("Failed to copy code: ", err);
          window.location.assign(dialUrl);
        });
      } else {
        window.location.assign(dialUrl);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
      {/* Header Banner - Redesigned with a beautiful cover image matching Metro */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
      }}>
        {/* Cover Image Banner */}


        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sub)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="images/icons2d/Cairo_directory.png" loading="lazy" decoding="async" style={{ width: "35px", marginLeft: "20px" }} alt="" />
            دليل الهاتف والخدمات
          </h1>

          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            أرقام الطوارئ، شركات الاتصالات، وخدمات العملاء في مكان واحد.
          </p>

          {/* Directory Sections badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--colorSecondary)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>☎️ {loading ? "..." : entries.length} أرقام لخدمة العملاء والطوارئ</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--colorSuccess)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>📶 {loading ? "..." : codes.length} أكواد للشبكات</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        {/* Search Panel Card - Styled matching Metro searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "var(--radius-card)",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 100,
        }}>
          <div style={{ position: "relative", zIndex: 10 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في الدليل (الاسم، الرقم أو التخصص)
            </label>
            <input
              className="input-fields"
              type="text"
              placeholder="ابحث بالاسم، الرقم، أو التخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveSearch(searchQuery);
                  setIsFocused(false);
                }
              }}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-sub)",
                height: "50px",
                borderRadius: "var(--radius-card)",
              }}
            />

            {/* Suggestions list */}
            {isFocused && searchQuery.trim() !== "" && suggestions.length > 0 && (
              <div
                className="metro-animate-fade"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 2000,
                  backgroundColor: "var(--bgPrimary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-md)",
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "6px 0",
                  direction: "rtl",
                }}
              >
                {suggestions.map((entry) => (
                  <div
                    key={entry.id}
                    onMouseDown={() => {
                      setSearchQuery(entry.name);
                      handleSaveSearch(entry.name);
                      setIsFocused(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--borderGlass)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bgSecondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {entry.logo_url ? (
                        <img
                          src={entry.logo_url}
                          alt={entry.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-sm)",
                            objectFit: "cover",
                            backgroundColor: "#fff",
                            border: "1px solid var(--borderGlass)"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem"
                        }}>
                          <img src="images/icons3d/headset.png" alt="phone" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                          {entry.name}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--textSecondary)" }}>
                          {entry.specialty}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <span style={{
                        fontSize: "0.8rem",
                        fontWeight: "800",
                        color: "var(--colorSuccess)",
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        direction: "ltr"
                      }}>
                        {entry.phone_number}
                      </span>
                      <a
                        href={getDialUrl(entry.phone_number)}
                        style={{
                          color: "var(--colorSecondary)",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          textDecoration: "none"
                        }}
                      >
                        <i className="fa-solid fa-phone"></i>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches Row */}
          {recentSearches.length > 0 && (
            <div style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
              animation: "slide-in-section 0.3s ease"
            }}>
              <span style={{ fontSize: "0.8rem", color: "var(--textSecondary)" }}>آخر عمليات البحث:</span>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSaveSearch(term);
                  }}
                  className="category-pill"
                  style={{ fontSize: "0.75rem", padding: "4px 12px", border: "1px solid var(--borderGlass)" }}
                >
                  🔍 {term}
                </button>
              ))}
              <button
              className="actionBtn actionBtnDelete"
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem("recent_phone_searches");
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                <i className="bx bx-trash"></i> 
              </button>
            </div>
          )}
        </div>
        {/* Loading Data */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--textSecondary)" }}>
            <span style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--borderGlass)", borderTopColor: "var(--colorPrimary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "10px" }}>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            {/* ==================== PHONES SECTION ==================== */}
            <div style={{ marginTop: "32px" }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "800",
                color: "var(--textPrimary)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i style={{ color: "var(--colorSecondary)" }} className="fa-solid fa-building"></i>
                أرقام خدمة العملاء والطوارئ
              </h2>
              <p style={{ color: "var(--textSecondary)", marginBottom: "20px", fontSize: "0.88rem" }}>
                كل أرقام الطوارئ والخدمات في مكان واحد
              </p>

              {/* Dynamic Categories Tabs */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
                <button
                  onClick={() => setSelectedSpecialty("all")}
                  style={{
                    background: selectedSpecialty === "all" ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                    border: `1px solid ${selectedSpecialty === "all" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                    color: selectedSpecialty === "all" ? "var(--textPrimary)" : "var(--textSecondary)",
                    padding: "8px 16px",
                    borderRadius: "50px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "var(--font-cairo)",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  🌐 الكل
                </button>
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    style={{
                      background: selectedSpecialty === spec ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                      border: `1px solid ${selectedSpecialty === spec ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                      color: selectedSpecialty === spec ? "var(--textPrimary)" : "var(--textSecondary)",
                      padding: "8px 16px",
                      borderRadius: "50px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <i className={formatBoxIcon(specialtyIcons[spec] || 'bx-building')} style={{ fontSize: "1rem" }}></i>
                    {spec}
                  </button>
                ))}
                {entries.some((e) => !e.specialty || e.specialty.trim() === "") && (
                  <button
                    onClick={() => setSelectedSpecialty("other")}
                    style={{
                      background: selectedSpecialty === "other" ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                      border: `1px solid ${selectedSpecialty === "other" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                      color: selectedSpecialty === "other" ? "var(--textPrimary)" : "var(--textSecondary)",
                      padding: "8px 16px",
                      borderRadius: "50px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    📦 أخرى
                  </button>
                )}
              </div>

              {/* Stack of phones */}
              {slicedEntries.length === 0 ? (
                searchQuery.trim() !== "" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{
                      textAlign: "center",
                      padding: "24px 20px",
                      color: "var(--textSecondary)",
                      backgroundColor: "var(--bgPrimary)",
                      border: "1px solid var(--borderGlass)",
                      borderRadius: "15px"
                    }}>
                      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
                      <p className="sub-title" style={{ margin: "0 0 6px", fontWeight: "700", color: "var(--textPrimary)", fontSize: "1rem" }}>
                        لم يتم العثور على أرقام مطابقة لبحثك &quot;{searchQuery}&quot;
                      </p>
                      <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--textSecondary)" }}>
                        إذا كنت تعرف هذا الرقم أو جهة الاتصال، شاركنا إياه عبر النموذج بالأسفل لإضافته للدليل ويستفيد الجميع!
                      </p>
                    </div>

                    <DirectorySuggestionBox
                      key={`${searchQuery}_empty_phone`}
                      searchQuery={searchQuery}
                      user={user}
                      specialties={specialties}
                      defaultType="phone"
                    />
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--textSecondary)",
                    backgroundColor: "var(--bgPrimary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "15px"
                  }}>
                    <div style={{ fontSize: "2rem", marginBottom: "10px" }}><i className="fa-solid fa-circle-notch"></i></div>
                    <p className="sub-title">لا توجد أرقام مطابقة لبحثك في هذا التبويب</p>
                  </div>
                )
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {slicedEntries.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          backgroundColor: "var(--bgPrimary)",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "var(--radius-card)",
                          padding: "16px",
                          boxShadow: "var(--shadow-sm)",
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        {entry.logo_url ? (
                          <img src={entry.logo_url} alt={entry.name} loading="lazy" decoding="async" style={{ width: "50px", height: "50px", borderRadius: "var(--radius-sm)", objectFit: "cover", }} />
                        ) : (
                          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-sm)", background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                            <img src="images/icons3d/headset.png" alt="phone" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                          <h5 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: "700", color: "var(--textPrimary)" }}>{entry.name}</h5>

                          {entry.description && (
                            <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.4", fontFamily: "var(--font-body)" }}>
                              {entry.description}
                            </p>
                          )}
                          <a href={getDialUrl(entry.phone_number)} style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            background: "rgba(16, 185, 129, 0.1)", color: "var(--colorSuccess)",
                            padding: "6px 14px", borderRadius: "20px", textDecoration: "none",
                            fontWeight: "800", fontSize: "0.85rem", width: "fit-content"
                          }}>
                            {entry.phone_number}
                            <i className="bx bx-phone" style={{ fontSize: "1rem" }} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredEntries.length > visibleCount && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                        style={{
                          width: "auto",
                          padding: "var(--paddingBtn)",
                          borderRadius: "var(--radiusBtn)",
                          background: "var(--colorSecondary)",
                          color: "#ffffff",
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-sub)",
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        عرض المزيد (+10)
                      </button>
                    </div>
                  )}

                  {/* Contributor suggestion toggle banner */}
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button
                      type="button"
                      onClick={() => setShowManualSuggest(!showManualSuggest)}
                      style={{
                        background: showManualSuggest ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                        border: "1px dashed var(--colorSecondary)",
                        color: "var(--textPrimary)",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-cairo)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <i className="fa-solid fa-lightbulb" style={{ color: "#f59e0b" }}></i>
                      {showManualSuggest ? "إغلاق نموذج الاقتراح" : "لم تجد الرقم أو الكود الذي تبحث عنه؟ اقترحه الآن 💡"}
                    </button>
                    {showManualSuggest && (
                      <div style={{ marginTop: "16px", textAlign: "right" }}>
                        <DirectorySuggestionBox
                          key={`${searchQuery}_manual_phone`}
                          searchQuery={searchQuery}
                          user={user}
                          specialties={specialties}
                          defaultType="phone"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <hr style={{ border: "none", height: "1px", background: "var(--borderGlass)", margin: "32px 0" }} />

            {/* ==================== TELECOM CODES SECTION ==================== */}
            <div>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "800",
                color: "var(--textPrimary)",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i className="fa-solid fa-phone-volume" style={{ color: "var(--colorSecondary)" }}></i>
                دليل أكواد شركات الاتصالات
              </h2>
              <p style={{ color: "var(--textSecondary)", marginBottom: "20px", fontSize: "0.88rem" }}>
                دليلك الشامل لجميع أكواد شركات المحمول في مصر.
              </p>

              {/* Company Tabs */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
                {Object.entries(COMPANY_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCompany(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: activeCompany === key ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                      border: activeCompany === key ? `1px solid ${meta.border}` : "1px solid var(--borderGlass)",
                      color: activeCompany === key ? "var(--textPrimary)" : "var(--textSecondary)",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Image src={`/images/company/${meta.logo}`} alt={meta.label} width={18} height={18} style={{ borderRadius: "50%" }} />
                    {meta.label}
                  </button>
                ))}
              </div>

              {/* Accordions */}
              {Object.keys(groupedCodes).length === 0 ? (
                searchQuery.trim() !== "" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{
                      textAlign: "center",
                      padding: "24px 20px",
                      color: "var(--textSecondary)",
                      backgroundColor: "var(--bgSecondary)",
                      borderRadius: "15px",
                      border: "1px solid var(--borderGlass)"
                    }}>
                      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
                      <p className="sub-title" style={{ fontWeight: "700", color: "var(--textPrimary)", margin: "0 0 6px", fontSize: "1rem" }}>
                        لا توجد أكواد مطابقة لبحثك &quot;{searchQuery}&quot; في شبكة {COMPANY_META[activeCompany]?.label}
                      </p>
                      {matchingCodesInOtherCompanies.length > 0 ? (
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--textSecondary)" }}>قد تتوفر نتائج في شبكات أخرى:</span>
                          {matchingCodesInOtherCompanies.map((comp) => (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => setActiveCompany(comp)}
                              style={{
                                background: "var(--bgPrimary)",
                                border: "1px solid var(--borderGlass)",
                                color: "var(--colorSecondary)",
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontFamily: "var(--font-cairo)"
                              }}
                            >
                              {COMPANY_META[comp]?.label} ↗
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--textSecondary)" }}>
                          إذا كنت تعرف هذا الكود، اقترحه الآن على الإدارة بالأسفل لإضافته في الدليل ويستفيد الجميع!
                        </p>
                      )}
                    </div>

                    <DirectorySuggestionBox
                      key={`${searchQuery}_${activeCompany}_code`}
                      searchQuery={searchQuery}
                      user={user}
                      specialties={specialties}
                      defaultType="code"
                      defaultCompany={activeCompany}
                    />
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--textSecondary)",
                    backgroundColor: "var(--bgSecondary)",
                    borderRadius: "15px",
                    border: "1px solid var(--borderGlass)"
                  }}>
                    <div className="sub-title" style={{ fontSize: "2rem", marginBottom: "10px" }}><i className="fa-solid fa-circle-notch"></i></div>
                    <p className="sub-title">لا توجد أكواد مضافة لهذه الشركة بعد</p>
                    <p className="sub-title" style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      تعمل الإدارة على تحديث البيانات وإضافة الأكواد قريباً.
                    </p>
                  </div>
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {Object.entries(groupedCodes).map(([sectionName, codeList]) => {
                    const isExpanded = searchQuery.trim() !== "" || !!expandedSections[sectionName];
                    return (
                      <div
                        key={sectionName}
                        style={{
                          backgroundColor: "var(--bgPrimary)",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "var(--radius-card)",
                          overflow: "hidden",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        {/* Header of Accordion */}
                        <div
                          onClick={() => toggleSection(sectionName)}
                          style={{
                            padding: "16px 20px",
                            background: "var(--bgSecondary)",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            userSelect: "none",
                          }}
                        >
                          <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={formatBoxIcon(sectionIcons[sectionName] || 'bx-folder')} style={{ fontSize: "1.1rem", color: "var(--colorSecondary)" }}></i>
                            {sectionName}
                          </h5>
                          <span style={{ fontSize: "1rem", color: "var(--textSecondary)" }}>
                            {isExpanded ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}
                          </span>
                        </div>

                        {/* List of Codes inside Accordion */}
                        {isExpanded && (
                          <div style={{ padding: "12px 20px", background: "var(--bgPrimary)", borderTop: "1px solid var(--borderGlass)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {codeList.map((item) => {
                                const codeParts = item.code.split(" | ");
                                const displayCode = codeParts[0];
                                const displayNote = codeParts[1];

                                const placeholderMatch = displayCode.match(/\[(.*?)\]/);
                                const placeholder = placeholderMatch ? placeholderMatch[1] : null;

                                const userVal = codeInputs[item.id] || "";
                                const finalCode = userVal
                                  ? displayCode.replace(/\[.*?\]/, userVal)
                                  : displayCode;

                                return (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      padding: "12px 0",
                                      borderBottom: "1px solid var(--borderGlass)",
                                      width: "100%"
                                    }}
                                  >
                                    <div style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      gap: "12px",
                                      width: "100%"
                                    }}>
                                      <div>
                                        <div className="sub-title" style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.88rem" }}>
                                          {item.title}
                                        </div>
                                        <div style={{ fontSize: "1rem", color: "var(--colorSecondary)", marginTop: "4px", direction: "ltr", textAlign: "right", fontWeight: "700" }}>
                                          {finalCode}
                                        </div>
                                      </div>

                                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <button
                                          onClick={() => handleCopyCode(finalCode, item.id)}
                                          style={{
                                            background: copiedId === item.id ? "rgba(16, 185, 129, 0.15)" : "var(--bgSecondary)",
                                            border: copiedId === item.id ? "1px solid var(--colorSuccess)" : "1px solid var(--borderGlass)",
                                            color: copiedId === item.id ? "var(--colorSuccess)" : "var(--textPrimary)",
                                            padding: "8px 16px",
                                            borderRadius: "20px",
                                            fontSize: "0.85rem",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            transition: "all 0.2s ease"
                                          }}
                                          title="نسخ الكود"
                                        >
                                          <i className={copiedId === item.id ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                                        </button>

                                        <a
                                          href={getDialUrl(finalCode)}
                                          style={{
                                            background: "var(--colorSecondary)",
                                            color: "#fff",
                                            padding: "8px 16px",
                                            borderRadius: "20px",
                                            fontSize: "0.85rem",
                                            fontWeight: "800",
                                            textDecoration: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                          }}
                                        >
                                          <i className="fa-solid fa-phone"></i>
                                        </a>
                                      </div>
                                    </div>

                                    {/* Placeholder Input Field */}
                                    {placeholder && (
                                      <div style={{ marginTop: "4px", width: "100%" }}>
                                        <input
                                          type="text"
                                          className="input-fields"
                                          placeholder={`أدخل ${placeholder} هنا...`}
                                          value={codeInputs[item.id] || ""}
                                          onChange={(e) => setCodeInputs({ ...codeInputs, [item.id]: e.target.value })}
                                          style={{
                                            height: "36px",
                                            fontSize: "0.85rem",
                                            borderRadius: "8px",
                                            background: "var(--bgSecondary)",
                                            border: "1px solid var(--borderGlass)",
                                            padding: "0 12px",
                                            width: "100%",
                                            fontFamily: "var(--font-cairo)"
                                          }}
                                        />
                                      </div>
                                    )}

                                    {/* Helper Note Bubble */}
                                    {displayNote && (
                                      <div style={{
                                        marginTop: "0px",
                                        padding: "0px 0px",
                                        fontSize: "0.78rem",
                                        color: "var(--textSecondary)",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        width: "100%"
                                      }}>
                                        <i className="bx bx-info-circle" style={{ fontSize: "0.9rem" }} />
                                        <span>{displayNote}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
