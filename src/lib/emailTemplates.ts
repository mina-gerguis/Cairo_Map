/**
 * Cairo Map (Qareeb) - Transactional Email Templates
 * Built following React Email and Bulletproof Email standards.
 * Fully compatible with Gmail, Outlook (Desktop & Web), Apple Mail, and mobile clients.
 */

interface OtpEmailOptions {
  otp: string;
  email: string;
  siteUrl?: string;
}

export function generateOtpEmailHtml({ otp, email, siteUrl }: OtpEmailOptions): string {
  const baseUrl = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://cairomap.vercel.app').replace(/\/+$/, '');
  const logoUrl = `${baseUrl}/icons/qareeb.png`;
  const termsUrl = `${baseUrl}/terms`;
  const privacyUrl = `${baseUrl}/privacy`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>رمز تأكيد حسابك: ${otp} - قريب</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a, li, blockquote {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media (prefers-color-scheme: dark) {
      .email-bg {
        background-color: #0b0f19 !important;
      }
      .card-bg {
        background-color: #111827 !important;
        border-color: #1f2937 !important;
      }
      .heading-text {
        color: #f8fafc !important;
      }
      .sub-text {
        color: #94a3b8 !important;
      }
      .otp-box {
        background-color: #0f172a !important;
        border-color: #2563eb !important;
      }
      .otp-number {
        color: #60a5fa !important;
      }
      .security-box {
        background-color: rgba(30, 58, 138, 0.25) !important;
        border-color: rgba(59, 130, 246, 0.3) !important;
      }
      .security-text {
        color: #93c5fd !important;
      }
      .footer-text {
        color: #64748b !important;
      }
      .footer-link {
        color: #60a5fa !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right;" class="email-bg">
  <!-- Preheader preview text (hidden from view, shown in inbox snippet) -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    رمز تأكيد حسابك هو: ${otp} • صالح لمدة 10 دقائق لإتمام التسجيل في قريب.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (Max-Width 520px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; width: 100%; border-radius: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden;" class="card-bg">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #3b82f6 100%);"></td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="padding: 36px 32px 32px 32px; text-align: center;">
              
              <!-- Brand Header (Logo + Name + Badge) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <img src="${logoUrl}" alt="قريب" width="56" height="56" style="width: 56px; height: 56px; border-radius: 14px; display: block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <span style="font-size: 13px; font-weight: 700; color: #2563eb; background-color: #eff6ff; border: 1px solid #dbeafe; padding: 4px 12px; border-radius: 20px; display: inline-block; letter-spacing: 0.3px;">
                            قريب • تأكيد الحساب
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Main Heading -->
              <h1 class="heading-text" style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.4; letter-spacing: -0.3px;">
                رمز التحقق من البريد الإلكتروني
              </h1>

              <!-- Greeting & Instructions -->
              <p class="sub-text" style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.7; color: #475569; text-align: center;">
                أهلاً بك! لقد طلبت إنشاء حساب جديد على <strong style="color: #2563eb;">قريب</strong>. استخدم الرمز التالي لمرة واحدة لإثبات ملكيتك للبريد:
              </p>

              <!-- OTP Digits Box (Hero Element) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center">
                    <div class="otp-box" style="background-color: #f8fafc; border: 2px solid #2563eb; border-radius: 14px; padding: 20px 24px; display: inline-block; min-width: 240px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);">
                      <div class="otp-number" style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #1e40af; text-align: center; direction: ltr; margin-left: 12px;">
                        ${otp}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Timer Expiry Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; font-weight: 600; text-align: center;" class="sub-text">
                    ⏳ ينتهي هذا الرمز تلقائياً خلال <strong style="color: #0f172a;" class="heading-text">10 دقائق</strong>
                  </td>
                </tr>
              </table>

              <!-- Security Warning Box (Reassuring & Clean) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div class="security-box" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; text-align: right; direction: rtl;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="width: 24px; vertical-align: top; padding-left: 8px;">
                            <span style="font-size: 16px;">🛡️</span>
                          </td>
                          <td style="vertical-align: top;">
                            <p class="security-text" style="margin: 0; font-size: 12.5px; line-height: 1.6; color: #1e40af; font-weight: 500;">
                              <strong>تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص. فريق قريب لن يطلب منك هذا الرمز تحت أي ظرف عبر الهاتف أو الرسائل.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Reassurance Note -->
              <p class="footer-text" style="margin: 0; font-size: 12px; line-height: 1.6; color: #94a3b8; text-align: center;">
                إذا لم تكن قد طلبت إنشاء هذا الحساب على <span style="direction: ltr; display: inline-block;">${email}</span>، يمكنك تجاهل هذه الرسالة بأمان ولن يتم إنشاء الحساب.
              </p>

            </td>
          </tr>

          <!-- Card Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;" class="card-bg">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <a href="${termsUrl}" target="_blank" class="footer-link" style="color: #64748b; font-size: 12px; text-decoration: none; margin: 0 8px; font-weight: 600;">الشروط والأحكام</a>
                    <span style="color: #cbd5e1;">•</span>
                    <a href="${privacyUrl}" target="_blank" class="footer-link" style="color: #64748b; font-size: 12px; text-decoration: none; margin: 0 8px; font-weight: 600;">سياسة الخصوصية</a>
                    <span style="color: #cbd5e1;">•</span>
                    <a href="${baseUrl}" target="_blank" class="footer-link" style="color: #2563eb; font-size: 12px; text-decoration: none; margin: 0 8px; font-weight: 600;">قريب</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #94a3b8; line-height: 1.5;" class="footer-text">
                    © 2026 قريب (قريب) • دليل مواصلات القاهرة الكبرى الذكي
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
