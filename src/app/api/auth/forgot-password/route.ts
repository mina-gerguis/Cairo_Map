import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getClientIp, checkIpRateLimit, recordIpAttempt, resetIpRateLimit } from "@/lib/ipRateLimit";
import { FORGOT_PASSWORD_MESSAGES } from "@/app/forgot-password/constants";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const status = checkIpRateLimit(ip);
    return NextResponse.json({
      blocked: status.blocked,
      remaining: status.remaining,
      count: status.count,
      resetInMs: status.resetInMs,
    });
  } catch {
    return NextResponse.json({ blocked: false, remaining: 3, count: 0, resetInMs: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Check if this IP is currently blocked (exceeded 3 attempts within 24 hours)
    const currentStatus = checkIpRateLimit(ip);
    if (currentStatus.blocked) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          attemptsRemaining: 0,
          resetInMs: currentStatus.resetInMs,
          error: FORGOT_PASSWORD_MESSAGES.RATE_LIMIT_BLOCKED,
        },
        { status: 429 }
      );
    }

    // 2. Parse payload
    const body = await request.json().catch(() => ({}));
    const rawIdentifier = body?.identifier;

    if (!rawIdentifier || typeof rawIdentifier !== "string" || !rawIdentifier.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: FORGOT_PASSWORD_MESSAGES.EMPTY_IDENTIFIER,
        },
        { status: 400 }
      );
    }

    const trimmed = rawIdentifier.trim();

    // 3. Register this attempt for the IP
    const attemptResult = recordIpAttempt(ip);

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: FORGOT_PASSWORD_MESSAGES.DB_NOT_CONFIGURED,
        },
        { status: 500 }
      );
    }

    let targetEmail: string | null = null;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isEmail) {
      const cleanUsername = trimmed.replace(/^@+/, "").toLowerCase().trim();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email, is_suspended")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (profileData?.email && !profileData.is_suspended) {
        targetEmail = profileData.email;
      }
    } else {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("email", trimmed)
        .maybeSingle();

      if (!profileData?.is_suspended) {
        targetEmail = trimmed;
      }
    }

    if (targetEmail) {
      let baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
        request.headers.get("origin") ||
        "https://cairomap.vercel.app";
      baseUrl = baseUrl.replace(/\/+$/, "");
      const redirectTo = `${baseUrl}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo,
      });

      if (resetError) {
        if (
          resetError.message.toLowerCase().includes("rate limit") ||
          resetError.message.toLowerCase().includes("security purposes") ||
          resetError.status === 429
        ) {
          return NextResponse.json(
            {
              success: false,
              blocked: attemptResult.blocked,
              attemptsRemaining: attemptResult.remaining,
              resetInMs: attemptResult.resetInMs,
              error: FORGOT_PASSWORD_MESSAGES.RATE_LIMIT,
            },
            { status: 429 }
          );
        }

        const lowerMsg = resetError.message?.toLowerCase() || "";
        const isUserNotFound =
          lowerMsg.includes("not found") ||
          lowerMsg.includes("user") ||
          lowerMsg.includes("email") ||
          (resetError as any).code === "user_not_found";

        if (!isUserNotFound) {
          console.error("Forgot password reset error:", resetError);
          return NextResponse.json(
            {
              success: false,
              blocked: attemptResult.blocked,
              attemptsRemaining: attemptResult.remaining,
              resetInMs: attemptResult.resetInMs,
              error: FORGOT_PASSWORD_MESSAGES.SEND_ERROR,
            },
            { status: 500 }
          );
        }
      }
    } else {
      // Timing equalization (prevents side-channel timing attacks)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      blocked: attemptResult.blocked,
      attemptsRemaining: attemptResult.remaining,
      resetInMs: attemptResult.resetInMs,
      sentIdentifier: trimmed,
      message: FORGOT_PASSWORD_MESSAGES.SUCCESS_SENT,
    });
  } catch (error: any) {
    console.error("Forgot password route handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: FORGOT_PASSWORD_MESSAGES.SEND_ERROR,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler: resets the forgot password attempts for the current IP
 * Called automatically when the user logs in successfully.
 */
export async function DELETE(request: Request) {
  try {
    const ip = getClientIp(request);
    resetIpRateLimit(ip);
    return NextResponse.json({
      success: true,
      message: "تمت إعادة تعيين محاولات الاستعادة بنجاح بعد تسجيل الدخول",
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
