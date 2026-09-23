import React, { useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import styles from "../page.module.css";

interface RouteNotFoundCardProps {
  fromInput: string;
  toInput: string;
  user: User | null;
}

export default function RouteNotFoundCard({
  fromInput,
  toInput,
  user,
}: RouteNotFoundCardProps) {
  const [suggestContent, setSuggestContent] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");

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

  return (
    <div className={styles.routeCard} style={{ textAlign: "center" }}>
      <div className={styles.routeDetailsBox} style={{ padding: "28px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem"
            }}
          >
            📭
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "6px 0 0", fontFamily: "var(--font-sub)" }}>
            لا يوجد مسار مباشر مسجل حالياً
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
            عذراً، لم نقم بعد بإضافة المسار المباشر من <strong style={{ color: "var(--text-primary)" }}>{fromInput}</strong> إلى <strong style={{ color: "var(--text-primary)" }}>{toInput}</strong>.
          </p>
        </div>

        {/* Suggest Route Form */}
        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "18px", textAlign: "right", marginTop: "4px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px", fontFamily: "var(--font-sub)" }}>
            هل تعرف كيف تذهب؟ ساعدنا في إضافته!
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
            اكتب خطوات الذهاب ومحطات الركوب والتكلفة المتوقعة لنقوم بمراجعتها وإضافتها فوراً لخدمة الجميع.
          </p>

          {user ? (
            <form onSubmit={handleSuggestRoute} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <textarea
                className="input-fields"
                style={{
                  width: "100%",
                  minHeight: "90px",
                  padding: "12px",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.88rem",
                  borderRadius: "12px"
                }}
                placeholder="مثال: من موقف الأحرار اركب عربيات العاشر وانزل عند الأردنية، الأجرة 20 جنيه والمشوار بياخد ساعة..."
                value={suggestContent}
                onChange={(e) => setSuggestContent(e.target.value)}
                required
              />

              {suggestError && (
                <div style={{ color: "#ef4444", fontSize: "0.82rem", fontWeight: "700" }}>
                  {suggestError}
                </div>
              )}

              {suggestSuccess && (
                <div style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: "700", background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px" }}>
                  شكراً لك! تم استلام اقتراحك وسنقوم بمراجعته وإضافته في أقرب وقت.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={suggestLoading}
                style={{ height: "42px", fontSize: "0.9rem", fontWeight: "700" }}
              >
                {suggestLoading ? "جاري الإرسال..." : "إرسال الاقتراح للمراجعة"}
              </button>
            </form>
          ) : (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-glass)", textAlign: "center" }}>
              <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                يرجى تسجيل الدخول أولاً لتتمكن من إضافة واقتراح خطوط سير جديدة.
              </p>
              <Link href="/login" className="btn btn-secondary" style={{ display: "inline-block", padding: "8px 18px", fontSize: "0.85rem" }}>
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
