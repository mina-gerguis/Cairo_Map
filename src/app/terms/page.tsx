"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          href="/profile" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--accent-ios)", 
            textDecoration: "none", 
            fontWeight: "600",
            fontSize: "0.95rem" 
          }}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
          <span>العودة للملف الشخصي</span>
        </Link>
      </div>

      {/* Header */}
      <div className="glass-panel" style={{ padding: "40px 30px", marginBottom: "32px", textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📄</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "800", marginBottom: "8px", color: "var(--text-primary)" }}>
          شروط الاستخدام
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", margin: 0 }}>
          تاريخ آخر تحديث: يوليو 2026
        </p>
      </div>

      {/* Content */}
      <div className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.8" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>1. قبول الشروط</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            باستخدامك لتطبيق <strong style={{ color: "var(--text-primary)" }}>ماب القاهرة</strong>، فإنك توافق تماماً على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على أي جزء منها، يرجى التوقف عن استخدام التطبيق فوراً.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>2. الحساب والتسجيل</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "8px" }}>
            عند إنشاء حساب في تطبيقنا، يجب الالتزام بالقواعد التالية:
          </p>
          <ul style={{ paddingRight: "20px", color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>تزويدنا بمعلومات صحيحة ودقيقة (مثل الاسم وتاريخ الميلاد والبريد الإلكتروني).</li>
            <li>الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك.</li>
            <li>تتحمل المسؤولية الكاملة عن أي أنشطة أو تفاعلات تتم من خلال حسابك.</li>
            <li>يُمنع استخدام أسماء مستخدمين مسيئة، أو انتحال شخصية الآخرين.</li>
          </ul>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>3. قواعد كتابة التقييمات والتعليقات</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "8px" }}>
            نحن نشجع المستخدمين على مشاركة تجاربهم الحقيقية مع الأماكن والخدمات، ولكن يُشترط:
          </p>
          <ul style={{ paddingRight: "20px", color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>أن تكون التقييمات والتعليقات مبنية على تجربة شخصية فعلية.</li>
            <li>يُمنع منعاً باتاً نشر محتوى مسيء، بذيء، أو ينطوي على تشهير غير قانوني أو كراهية.</li>
            <li>يُمنع نشر تقييمات وهمية أو مدفوعة بغرض ترويج أو تشويه سمعة أي مكان أو خدمة.</li>
            <li>يحق لإدارة التطبيق مراجعة وحذف أي تعليق أو تقييم يخالف هذه الشروط دون الرجوع للمستخدم.</li>
          </ul>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>4. تعديل التقييمات</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            يمكن للمستخدم كتابة تقييم واحد لكل مكان، وله الحق في تعديله أو تحديثه في أي وقت.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>5. إخلاء المسؤولية</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            تطبيق ماب القاهرة هو دليل استرشادي للأرقام وعناوين الأماكن وفروعها. نحن نبذل قصارى جهدنا للتحقق من صحة البيانات، ولكننا لا نضمن خلوها التام من الأخطاء أو عدم تغير أرقام الهواتف أو العناوين من قبل أصحاب الأماكن. استخدامك للمعلومات الواردة في الدليل يقع على مسؤوليتك الخاصة.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>6. الإنهاء وحظر الحساب</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الخدمات أو حظر حسابك بالكامل في حال مخالفتك المتكررة لشروط الاستخدام أو الإضرار بسلامة ومصداقية المنصة.
          </p>
        </div>
      </div>
    </div>
  );
}
