"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { applyNewUserTrialIfActive } from "@/lib/promotions";
import { extractUserEmail, generateSmartUsername } from "@/lib/profileValidation";

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

        // Check if user account is suspended and load existing fields
        const { data: profCheck } = await supabase
          .from("profiles")
          .select("id, is_suspended, email, username, full_name, avatar_url")
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

        const meta = user.user_metadata || {};
        const email = extractUserEmail(user);
        const fullName =
          meta.full_name ||
          meta.name ||
          `${meta.first_name || ""} ${meta.last_name || ""}`.trim() ||
          (email ? email.split("@")[0] : "") ||
          "مستخدم جديد";

        const avatarUrl =
          meta.avatar_url ||
          meta.picture?.data?.url ||
          (typeof meta.picture === "string" ? meta.picture : "") ||
          "";

        const generatedUsername = generateSmartUsername(fullName, email, meta, user.id);

        // Ensure user profile exists or update missing fields for existing users
        if (!profCheck) {
          setStatusMessage("جاري تهيئة ملفك الشخصي...");

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name: fullName,
              username: generatedUsername,
              email: email,
              avatar_url: avatarUrl,
              email_verified: Boolean(email),
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
        } else {
          // Profile exists: update email and username if they were missing or default user_
          const updates: Record<string, any> = {};
          if ((!profCheck.email || profCheck.email.trim() === "") && email) {
            updates.email = email;
          }
          if ((!profCheck.username || profCheck.username.trim() === "" || profCheck.username.startsWith("user_")) && generatedUsername) {
            updates.username = generatedUsername;
          }
          if ((!profCheck.full_name || profCheck.full_name.trim() === "" || profCheck.full_name === "مستخدم جديد") && fullName) {
            updates.full_name = fullName;
          }
          if ((!profCheck.avatar_url || profCheck.avatar_url.trim() === "") && avatarUrl) {
            updates.avatar_url = avatarUrl;
          }

          if (Object.keys(updates).length > 0) {
            updates.updated_at = new Date().toISOString();
            await supabase.from("profiles").update(updates).eq("id", user.id);
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
