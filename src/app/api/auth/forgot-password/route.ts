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
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (profileData?.email) {
        if (profileData.is_suspended) {
          return NextResponse.json(
            {
              success: false,
              error: FORGOT_PASSWORD_MESSAGES.ACCOUNT_SUSPENDED,
            },
            { status: 403 }
          );
        }
        targetEmail = profileData.email.toLowerCase().trim();
      }
    } else {
      const cleanEmail = trimmed.toLowerCase();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_suspended")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (profileData?.is_suspended) {
        return NextResponse.json(
          {
            success: false,
            error: FORGOT_PASSWORD_MESSAGES.ACCOUNT_SUSPENDED,
          },
          { status: 403 }
        );
      }

      targetEmail = cleanEmail;
    }

    if (targetEmail) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
      const proto = request.headers.get("x-forwarded-proto") || "https";

      let baseUrl =
        origin ||
        (host ? `${proto}://${host}` : null) ||
        process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
        "https://qareebmap.vercel.app";

      baseUrl = baseUrl.replace(/\/+$/, "");
      const redirectTo = `${baseUrl}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo,
      });

      if (resetError) {
        console.error("Supabase resetPasswordForEmail error:", resetError);

        const lowerMsg = resetError.message?.toLowerCase() || "";
        const isCooldown =
          lowerMsg.includes("rate limit") ||
          lowerMsg.includes("security purposes") ||
          (resetError as any).status === 429 ||
          (resetError as any).code === "over_email_send_rate_limit";

        if (isCooldown) {
          return NextResponse.json(
            {
              success: false,
              cooldown: true,
              blocked: false,
              attemptsRemaining: attemptResult.remaining,
              resetInMs: attemptResult.resetInMs,
              error: FORGOT_PASSWORD_MESSAGES.RATE_LIMIT,
            },
            { status: 429 }
          );
        }

        const isUserNotFound =
          lowerMsg.includes("user not found") ||
          (resetError as any).code === "user_not_found";

        if (!isUserNotFound) {
          return NextResponse.json(
            {
              success: false,
              blocked: attemptResult.blocked,
              attemptsRemaining: attemptResult.remaining,
              resetInMs: attemptResult.resetInMs,
              error: resetError.message || FORGOT_PASSWORD_MESSAGES.SEND_ERROR,
            },
            { status: 400 }
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
