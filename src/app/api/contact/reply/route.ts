import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

const escapeHtml = (str: string = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatParagraphs = (str: string = "") =>
  escapeHtml(str).replace(/\r\n|\r|\n/g, "<br />");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // 1. Authorization check: Ensure requester is an authenticated Admin
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'غير مصرح بالوصول: يتطلب تسجيل دخول مسؤول' }, { status: 401 });
    }

    if (token && supabase) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'جلسة المستخدم غير صالحة' }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        return NextResponse.json({ error: 'غير مصرح لك: هذه العملية مخصصة للمسؤولين فقط' }, { status: 403 });
      }
    }

    // 2. Server-Side Validation of Form Fields
    const { toEmail, toName, originalMessage, replyText } = await request.json();

    if (!toEmail || !toName || !replyText) {
      return NextResponse.json({ error: 'جميع الحقول الأساسية مطلوبة' }, { status: 400 });
    }

    if (typeof toEmail !== 'string' || !EMAIL_REGEX.test(toEmail.trim()) || toEmail.length > 254) {
      return NextResponse.json({ error: 'صيغة البريد الإلكتروني للمستلم غير صالحة' }, { status: 400 });
    }

    if (typeof toName !== 'string' || toName.trim().length === 0 || toName.length > 100) {
      return NextResponse.json({ error: 'اسم المستلم غير صالح أو يتجاوز الحد المسموح' }, { status: 400 });
    }

    if (typeof replyText !== 'string' || replyText.trim().length === 0 || replyText.length > 5000) {
      return NextResponse.json({ error: 'نص الرد غير صالح أو يتجاوز الحد المسموح (5000 حرف)' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({
        error: 'لم يتم إعداد بيانات SMTP في ملف البيئة (SMTP_USER & SMTP_PASS)'
      }, { status: 500 });
    }

    // Configure a modern, secure TLS transporter (no deprecated SSLv3)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465", // true for port 465, false for other ports (587/25)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    const senderEmail = process.env.SMTP_FROM || smtpUser;
    const safeToName = escapeHtml(toName);
    const safeOriginalMessage = formatParagraphs(originalMessage);
    const safeReplyText = formatParagraphs(replyText);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qareebmap.vercel.app";

    // Email content in Arabic
    const mailOptions = {
      from: `"قريب - الدعم الفني" <${senderEmail}>`,
      to: toEmail,
      replyTo: process.env.SMTP_REPLY_TO || senderEmail,
      subject: "الرد على استفسارك - قريب",
      text: `مرحباً ${toName}،\n\nقام فريق الدعم الفني بمراجعة رسالتك وإرسال الرد التالي:\n\nرسالتك الأصلية:\n${originalMessage || ''}\n\nرد الدعم الفني:\n${replyText}\n\n---\nقريب - الدعم الفني`,
      html: `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>الرد على استفسارك</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; direction: rtl; text-align: center;">
          
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; margin: 0; padding: 40px 16px;">
            <tr>
              <td align="center">
                <!-- المحتوى بتصميم ومقاس المودل وبدون حاوية إضافية -->
                <div style="max-width: 440px; width: 100%; text-align: center; margin: 0 auto;">
                  
                  <!-- أيقونة المودل ثلاثية الأبعاد (نفس أيقونة مودل الخروج والتنبيهات) -->
                  <div style="width: 72px; height: 72px; margin: 0 auto 18px auto; text-align: center;">
                    <img src="${siteUrl}/images/threeD/alert.webp" alt="قريب" width="72" height="72" style="width: 72px; height: 72px; display: inline-block; object-fit: contain; border: 0;" />
                  </div>

                  <!-- عنوان المودل -->
                  <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 10px 0; color: #f4f4f5; letter-spacing: -0.3px;">
                    الرد على استفسارك
                  </h2>

                  <!-- الرسالة الترحيبية -->
                  <p style="font-size: 0.95rem; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
                    مرحباً <strong style="color: #ffffff;">${safeToName}</strong>، لقد قام فريق الدعم الفني بمراجعة رسالتك والرد عليها:
                  </p>

                  <!-- الرسالة الأصلية إن وجدت (بتنسيق كروت المودل الهادئة) -->
                  ${originalMessage ? `
                  <div style="background-color: #0d0d0e; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; text-align: right; direction: rtl;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #71717a; margin-bottom: 6px;">لقد قمت بمراسلتنا بخصوص :</span>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #a1a1aa; font-style: italic;">
                      "${safeOriginalMessage}"
                    </p>
                  </div>
                  ` : ''}

                  <!-- رد الإدارة والدعم الفني -->
                  <div style="padding: 16px 18px; margin-bottom: 24px; text-align: right; direction: rtl;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">رد فريق الدعم الفني:</span>
                    <div style="font-size: 14px; line-height: 1.75; color: #f4f4f5; font-weight: 500;">
                      ${safeReplyText}
                    </div>
                  </div>

                  <!-- زر المودل الرئيسي (نفس زر تأكيد المودل) -->
                  <div style="margin: 28px 0 20px 0;">
                    <a href="${siteUrl}" target="_blank" style="display: inline-block; background-color: rgb(39, 39, 255); color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 14px rgba(39, 39, 255, 0.35);">
                      الانتقال إلى قريب
                    </a>
                  </div>

                  <!-- تذييل سفلي بسيط مدمج -->
                  <p style="font-size: 11px; color: #52525b; margin-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; line-height: 1.6;">
                    هذا البريد مرسل تلقائياً من خريطة قريب • لا يتطلب الرد المباشر
                  </p>

                </div>
              </td>
            </tr>
          </table>

        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending SMTP email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
