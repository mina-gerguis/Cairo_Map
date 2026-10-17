import { NextResponse } from 'next/server';
import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'cairo-map-otp-token-secret';

export async function POST(request: Request) {
  try {
    const { email, otp, hash, expiresAt } = await request.json();

    if (!email || !otp || !hash || !expiresAt) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة لإتمام التحقق' }, { status: 400 });
    }

    // Check expiry
    if (Date.now() > parseInt(expiresAt, 10)) {
      return NextResponse.json({ error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' }, { status: 400 });
    }

    // Recompute expected hash
    const expectedData = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`;
    const expectedHash = crypto.createHmac('sha256', OTP_SECRET).update(expectedData).digest('hex');

    if (hash !== expectedHash) {
      return NextResponse.json({ error: 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة' }, { status: 400 });
    }

    // Generate signed verification token valid for signup completion
    const verificationToken = crypto
      .createHmac('sha256', OTP_SECRET)
      .update(`${email.toLowerCase().trim()}:verified`)
      .digest('hex');

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
