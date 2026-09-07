import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Secret for HMAC hashing
const OTP_SECRET = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SMTP_PASS || 'cairo-map-otp-secret-key-2026';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'يرجى إدخال بريد إلكتروني صحيح' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({
        error: 'لم يتم العثور على إعدادات البريد SMTP في الخادم'
      }, { status: 500 });
    }

    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiry: 10 minutes from now
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Create HMAC hash of (email + otp + expiresAt)
    const hashData = `${email.toLowerCase().trim()}:${otp}:${expiresAt}`;
    const hash = crypto.createHmac('sha256', OTP_SECRET).update(hashData).digest('hex');

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
        rejectUnauthorized: false
      }
    });

    const senderEmail = process.env.SMTP_FROM || smtpUser;

    const mailOptions = {
      from: `"ماب القاهرة - تأكيد الحساب" <${senderEmail}>`,
      to: email.toLowerCase().trim(),
      subject: `رمز تأكيد حسابك: ${otp} - ماب القاهرة`,
      text: `رمز التحقق الخاص بك هو: ${otp}\nهذا الرمز صالح لمدة 10 دقائق فقط. لا تشاركه مع أي شخص.`,
      html: `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>رمز تأكيد البريد الإلكتروني</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: center;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; margin: 0; padding: 40px 16px;">
            <tr>
              <td align="center">
                <div style="max-width: 440px; width: 100%; text-align: center; margin: 0 auto; background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
                  
                  <!-- الشعار أو الأيقونة -->
                  <div style="margin-bottom: 20px;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 16px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3);">
                      <span style="font-size: 30px;">🛡️</span>
                    </div>
                  </div>

                  <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 10px 0; color: #ffffff;">
                    تأكيد البريد الإلكتروني
                  </h2>
                  <p style="font-size: 0.95rem; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                    أهلاً بك في <strong style="color: #60a5fa;">ماب القاهرة</strong>! استخدم رمز التحقق التالي لإكمال إنشاء حسابك:
                  </p>

                  <!-- كود التحقق OTP -->
                  <div style="background: #030712; border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 18px 24px; margin-bottom: 20px; display: inline-block;">
                    <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">
                      ${otp}
                    </span>
                  </div>

                  <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 16px 0;">
                    ⏳ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.
                  </p>

                  <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 10px 14px; margin-top: 14px; text-align: center;">
                    <span style="font-size: 0.8rem; color: #fca5a5;">
                      ⚠️ تنبيه أمني: لا تشارك هذا الرمز مع أي شخص. فريق الدعم لن يطلب منك هذا الرمز أبداً.
                    </span>
                  </div>

                  <!-- تذييل سفلي -->
                  <p style="font-size: 11px; color: #475569; margin-top: 28px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px;">
                    إذا لم تكن قد طلبت هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

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
