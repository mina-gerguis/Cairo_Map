"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { applyNewUserTrialIfActive } from "@/lib/promotions";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("جاري التحقق من الحساب...");

  useEffect(() => {
    let isCancelled = false;

    const processAuth = async () => {
      if (!supabase) {
        router.replace("/login?error=db_not_configured");
        return;
      }

      const next = searchParams.get("next") || "/";
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle OAuth errors from provider
      if (errorParam || errorDescription) {
        console.error("OAuth error:", errorParam, errorDescription);
        router.replace(`/login?error=${encodeURIComponent(errorDescription || errorParam || "oauth_failed")}`);
        return;
      }

      // If next points to reset-password, forward directly to /reset-password
      if (next.includes("reset-password") || next.startsWith("/reset-password")) {
        const fullSearch = typeof window !== "undefined" ? window.location.search : "";
        router.replace(`/reset-password${fullSearch}`);
        return;
      }

      try {
        const code = searchParams.get("code");
        if (code) {
          setStatusMessage("جاري إتمام تسجيل الدخول بواسطة Google...");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Exchange code error:", exchangeError);
            router.replace(`/login?error=${encodeURIComponent("فشل تأكيد جلسة الدخول مع Google")}`);
            return;
          }
        }

        // Fetch session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          console.error("Session retrieve error:", sessionError);
          router.replace("/login?error=oauth_failed");
          return;
        }

        if (isCancelled) return;

        const user = session.user;

        // Check if user account is suspended
        const { data: profCheck } = await supabase
          .from("profiles")
          .select("id, is_suspended")
          .eq("id", user.id)
          .maybeSingle();

        if (profCheck?.is_suspended) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account_suspended_notice", "true");
          }
          await supabase.auth.signOut();
          router.replace("/login?suspended=true");
          return;
        }

        // Ensure user profile exists
        if (!profCheck) {
          setStatusMessage("جاري تهيئة ملفك الشخصي...");
          const meta = user.user_metadata || {};
          const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "مستخدم جديد";
          const avatarUrl = meta.avatar_url || meta.picture || "";
          const email = user.email || "";
          const generatedUsername = (
            meta.user_name ||
            meta.preferred_username ||
            email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
          ).slice(0, 20);

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name: fullName,
              username: generatedUsername || `user_${user.id.slice(0, 8)}`,
              email: email,
              avatar_url: avatarUrl,
              email_verified: true,
              subscription_tier: "free",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          try {
            await applyNewUserTrialIfActive(user.id, fullName);
          } catch (trialErr) {
            console.warn("Trial application notice in OAuth callback:", trialErr);
          }
        }

        setStatusMessage("تم الدخول بنجاح! جاري تحويلك...");
        const targetUrl = next.startsWith("/") ? next : `/${next}`;
        router.replace(targetUrl);
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        router.replace("/login?error=oauth_failed");
      }
    };

    processAuth();

    return () => {
      isCancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        direction: "rtl",
        fontFamily: "var(--font-heading, inherit)",
        background: "var(--color-background, #ffffff)",
        color: "var(--color-foreground, #111827)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "3px solid rgba(66, 133, 244, 0.2)",
          borderTopColor: "#4285F4",
          animation: "spin 0.8s linear infinite",
          marginBottom: "20px",
        }}
      />
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 8px 0" }}>
        {statusMessage}
      </h2>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted, #6b7280)", margin: 0 }}>
        يرجى الانتظار لحظات قليلة...
      </p>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            direction: "rtl",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid rgba(66, 133, 244, 0.2)",
              borderTopColor: "#4285F4",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
