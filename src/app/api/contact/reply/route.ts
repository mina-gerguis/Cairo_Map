import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { toEmail, toName, originalMessage, replyText } = await request.json();

    if (!toEmail || !toName || !replyText) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ 
        error: 'لم يتم إعداد بيانات SMTP في ملف البيئة (SMTP_USER & SMTP_PASS)' 
      }, { status: 500 });
    }

    // Configure a generic and robust SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465", // true for port 465, false for other ports (587/25)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    const senderEmail = process.env.SMTP_FROM || smtpUser;

    // Email content in Arabic
    const mailOptions = {
      from: `"خريطة القاهرة - الدعم الفني" <${senderEmail}>`,
      to: toEmail,
      replyTo: process.env.SMTP_REPLY_TO || senderEmail,
      subject: "الرد على استفسارك - خريطة القاهرة",
      html: `
        <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #007aff; margin: 0; font-size: 1.5rem; font-weight: 800; border-bottom: 2px solid #007aff; padding-bottom: 10px; display: inline-block;">خريطة القاهرة - الدعم الفني</h2>
          </div>
          
          <p style="font-size: 1.05rem; margin-top: 20px;">مرحباً <strong>${toName}</strong>،</p>
          <p>نشكرك على تواصلك معنا. لقد قام فريق الدعم الفني بمراجعة رسالتك والرد عليها:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #f0f0f0; border-right: 4px solid #8e8e93; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #555; font-size: 0.9rem;">رسالتك الأصلية:</p>
            <p style="margin: 8px 0 0 0; color: #666; font-style: italic; font-size: 0.95rem; white-space: pre-wrap;">"${originalMessage}"</p>
          </div>
          
          <div style="background-color: #f2f9ff; padding: 18px; border: 1px solid #e1f0ff; border-right: 4px solid #34c759; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #0056b3; font-size: 0.9rem;">رد الإدارة والدعم الفني:</p>
            <p style="margin: 8px 0 0 0; color: #1c3d5a; font-weight: 500; font-size: 1.05rem; white-space: pre-wrap;">${replyText}</p>
          </div>
          
          <p style="font-size: 0.9rem; color: #8a8a8f; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">هذا البريد الإلكتروني مرسل تلقائياً، يرجى عدم الرد عليه مباشرة.</p>
        </div>
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
