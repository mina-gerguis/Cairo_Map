import React, { useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
    <div className="details-panel" style={{ textAlign: "center", gap: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "2.5rem" }}>📭</span>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
          لا يوجد مسار مباشر مسجل
        </h2>
        <p style={{ color: "var(--textSecondary)", fontSize: "0.88rem", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
          عذراً، لم نقم بعد بإضافة المسار المباشر من <strong style={{ color: "var(--textPrimary)" }}>{fromInput}</strong> إلى <strong style={{ color: "var(--textPrimary)" }}>{toInput}</strong>.
        </p>
      </div>

      {/* Suggest Route Form */}
      <div style={{ borderTop: "1px solid var(--borderGlass)", paddingTop: "16px", textAlign: "right" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "4px" }}>
          هل تعرف كيف تذهب؟ ساعدنا في إضافته!
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--textSecondary)", marginBottom: "12px" }}>
          اكتب خطوات الذهاب ومحطات الركوب والتكلفة المتوقعة لنقوم بمراجعتها وإضافتها فوراً لخدمة الجميع.
        </p>

        {user ? (
          <form onSubmit={handleSuggestRoute} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea
              className="input-fields"
              style={{
                width: "100%",
                minHeight: "85px",
                padding: "10px",
                fontFamily: "var(--font-body)",
                fontSize: "0.88rem"
              }}
              placeholder="مثال: من موقف الأحرار اركب عربيات العاشر وانزل عند الأردنية، الأجرة 20 جنيه والمشوار بياخد ساعة..."
              value={suggestContent}
              onChange={(e) => setSuggestContent(e.target.value)}
              required
            />

            {suggestError && (
              <div style={{ color: "#ef4444", fontSize: "0.82rem" }}>⚠️ {suggestError}</div>
            )}

            {suggestSuccess && (
              <div style={{ color: "#10b981", fontSize: "0.82rem", fontWeight: "700" }}>
                ✓ تم إرسال اقتراحك بنجاح! شكراً لمساهمتك القيمة.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                alignSelf: "flex-end",
                height: "38px",
                padding: "6px 16px",
                fontSize: "0.85rem",
                fontWeight: "700",
              }}
              disabled={suggestLoading || !suggestContent.trim()}
            >
              {suggestLoading ? "جاري الإرسال..." : "إرسال الاقتراح"}
            </button>
          </form>
        ) : (
          <div
            style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--ra-8)",
              padding: "14px",
              textAlign: "center"
            }}
          >
            <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", marginBottom: "10px" }}>
              سجل دخولك لتتمكن من اقتراح هذا الطريق وكسب نقاط مكافأة!
            </p>
            <Link
              href="/login"
              className="btn btn-primary"
              style={{ display: "inline-block", padding: "6px 18px", fontSize: "0.85rem" }}
            >
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
