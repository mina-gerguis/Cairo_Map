import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { generateOtpEmailHtml } from '@/lib/emailTemplates';
import { getClientIp, recordIpAttempt } from '@/lib/ipRateLimit';

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
    // Rate limit: max 4 OTP requests per 15-minute window
    const rateLimit = recordIpAttempt(clientIp, 'otp-send', 4, 15 * 60 * 1000);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى لطلب رموز التحقق. يرجى الانتظار 15 دقيقة قبل المحاولة مجدداً.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'يرجى إدخال بريد إلكتروني صحيح' }, { status: 400 });
    }

    let otpSecret: string;
    try {
      otpSecret = getOtpSecret();
    } catch {
      return NextResponse.json(
        { error: 'خطأ في إعدادات الأمان بالخادم. يرجى التواصل مع الإدارة.' },
        { status: 500 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiry: 10 minutes from now
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Create HMAC hash of (email + otp + expiresAt)
    const hashData = `${email.toLowerCase().trim()}:${otp}:${expiresAt}`;
    const hash = crypto.createHmac('sha256', otpSecret).update(hashData).digest('hex');

    if (!smtpUser || !smtpPass) {
      // In development mode, log the OTP to console and allow testing without blockage
      if (process.env.NODE_ENV === 'development') {
        console.warn(`\n=======================================================\n[DEV MODE] SMTP not configured in environment variables.\n🔑 Generated OTP for ${email}: ${otp}\n=======================================================\n`);
        return NextResponse.json({
          success: true,
          hash,
          expiresAt,
          devCode: otp,
          devWarning: 'لم يتم العثور على إعدادات البريد SMTP في ملف البيئة. تم توفير كود التحقق تلقائياً في وضع التطوير.',
          message: 'تم توليد رمز التحقق (وضع التطوير)'
        });
      }

      return NextResponse.json({
        error: 'لم يتم العثور على إعدادات البريد SMTP في الخادم. يرجى إضافة متغيرات SMTP (SMTP_USER و SMTP_PASS) في لوحة تحكم الاستضافة (Vercel).'
      }, { status: 500 });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    const senderEmail = process.env.SMTP_FROM || smtpUser;

    const mailOptions = {
      from: `"قريب - تأكيد الحساب" <${senderEmail}>`,
      to: email.toLowerCase().trim(),
      subject: `رمز تأكيد حسابك: ${otp} - قريب`,
      text: `رمز التحقق الخاص بك هو: ${otp}\nهذا الرمز صالح لمدة 10 دقائق فقط لإكمال تسجيل حسابك في قريب. لا تشاركه مع أي شخص.`,
      html: generateOtpEmailHtml({
        otp,
        email: email.toLowerCase().trim(),
      }),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError: any) {
      const errMsg = mailError?.message || '';
      const isBrevoNotActivated = errMsg.includes('502') || errMsg.toLowerCase().includes('not yet activated');
      const isBrevoUnauthorizedIp = errMsg.includes('525') || errMsg.toLowerCase().includes('unauthorized ip');
      const isBrevoAuthFailed = errMsg.includes('535') || errMsg.toLowerCase().includes('authentication failed');

      let devWarningMsg = 'تعذر إرسال البريد عبر SMTP. تم توفير كود التحقق في وضع التطوير.';
      let prodErrorMsg = errMsg || 'فشل في إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.';

      if (isBrevoUnauthorizedIp) {
        devWarningMsg = 'تم رفض الاتصال من Brevo بسبب حظر الـ IP (525 Unauthorized IP address). يرجى إزالة قيود الـ IP من إعدادات Brevo. تم توفير الكود للتجربة.';
        prodErrorMsg = 'تم رفض الاتصال من Brevo بسبب تقييد عنوان الـ IP (525 Unauthorized IP). يرجى إزالة قيود الـ IP من حساب Brevo.';
      } else if (isBrevoAuthFailed) {
        devWarningMsg = 'فشل تسجيل الدخول في Brevo SMTP (535 Authentication failed). يرجى التأكد من اسم المستخدم ومفتاح SMTP. تم توفير الكود للتجربة.';
        prodErrorMsg = 'فشل تسجيل الدخول في خادم البريد Brevo SMTP (535 Authentication failed). تأكد من صحة المفتاح والمستخدم.';
      } else if (isBrevoNotActivated) {
        devWarningMsg = 'حساب Brevo SMTP غير مفعّل بعد في لوحة التحكم. تم توفير كود التحقق تلقائياً في وضع التطوير.';
        prodErrorMsg = 'حساب إرسال البريد (Brevo SMTP) غير مفعّل بعد. يرجى تفعيله من لوحة تحكم Brevo أو مراسلة الدعم لتفعيله.';
      }

      console.error('Error sending OTP email via SMTP:', mailError);

      // In development mode, log the OTP to console and allow testing without blockage
      if (process.env.NODE_ENV === 'development') {
        console.warn(`\n=======================================================\n[DEV MODE] SMTP delivery failed (${errMsg}).\n🔑 Generated OTP for ${email}: ${otp}\n=======================================================\n`);
        return NextResponse.json({
          success: true,
          hash,
          expiresAt,
          devCode: otp,
          devWarning: devWarningMsg,
          message: 'تم توليد رمز التحقق (وضع التطوير)'
        });
      }

      return NextResponse.json({
        error: prodErrorMsg
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hash,
      expiresAt,
      message: 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني'
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error sending OTP email:', err);
    return NextResponse.json({
      error: err.message || 'فشل في إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.'
    }, { status: 500 });
  }
}
