import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getClientIp, recordIpAttempt, resetIpRateLimit } from '@/lib/ipRateLimit';

// Secure retrieval of secret for HMAC hashing - no weak hardcoded fallback in production
function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      return 'cairo-map-dev-temporary-secret-key-for-local-testing';
    }
    throw new Error('Missing server secret configuration (OTP_SECRET or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return secret;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit: max 5 failed attempts per 15-minute window
    const rateLimit = recordIpAttempt(clientIp, 'otp-verify', 5, 15 * 60 * 1000);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { error: 'تم حظر محاولات التحقق مؤقتاً لكثرة المحاولات الخاطئة. يرجى الانتظار 15 دقيقة.' },
        { status: 429 }
      );
    }

    const { email, otp, hash, expiresAt } = await request.json();

    if (!email || !otp || !hash || !expiresAt) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة لإتمام التحقق' }, { status: 400 });
    }

    // Check expiry
    const expiryTimestamp = parseInt(expiresAt, 10);
    if (isNaN(expiryTimestamp) || Date.now() > expiryTimestamp) {
      return NextResponse.json({ error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' }, { status: 400 });
    }

    let otpSecret: string;
    try {
      otpSecret = getOtpSecret();
    } catch {
      return NextResponse.json({ error: 'خطأ في إعدادات الأمان بالخادم' }, { status: 500 });
    }

    // Recompute expected hash
    const expectedData = `${email.toLowerCase().trim()}:${String(otp).trim()}:${expiresAt}`;
    const expectedHash = crypto.createHmac('sha256', otpSecret).update(expectedData).digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(String(hash), 'hex');
    const expectedBuffer = Buffer.from(expectedHash, 'hex');

    if (
      hashBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة' }, { status: 400 });
    }

    // Generate signed verification token valid for signup completion
    const verificationToken = crypto
      .createHmac('sha256', otpSecret)
      .update(`${email.toLowerCase().trim()}:verified:${expiresAt}`)
      .digest('hex');

    // Reset rate limit counter upon successful verification
    resetIpRateLimit(clientIp, 'otp-verify');

    return NextResponse.json({
      success: true,
      verified: true,
      verificationToken,
      message: 'تم تأكيد البريد الإلكتروني بنجاح'
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error verifying email OTP:', err);
    return NextResponse.json({
      error: err.message || 'حدث خطأ أثناء التحقق من الرمز'
    }, { status: 500 });
  }
}
