"use client";

import React, { useState, useMemo } from "react";
import { FaCalculator, FaPiggyBank, FaTicketAlt, FaCheckCircle } from "react-icons/fa";

export default function MetroSubscriptionCalculator() {
  const [userCategory, setUserCategory] = useState<"public" | "student" | "senior" | "determination">("public");
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<"quarterly" | "annual">("quarterly");
  const [stages, setStages] = useState<number>(3); // 1: 9 stations, 2: 16 stations, 3: 23 stations, 4: 23+ stations
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10); // Default 5 working days x 2

  // Single cash ticket prices (2024/2026 OFFICIAL METRO TARIFF)
  const getSingleCashPrice = (stageNum: number) => {
    switch (stageNum) {
      case 1: return 8;   // Up to 9 stations
      case 2: return 10;  // 10 to 16 stations
      case 3: return 15;  // 17 to 23 stations
      case 4: return 20;  // 23+ stations
      default: return 15;
    }
  };

  // Calculate Subscription cost based on Egyptian Metro Authority Tariffs
  const subscriptionCost = useMemo(() => {
    // Standard Quarterly (3 Months - ~180 trips limit)
    let basePrice = 0;
    if (userCategory === "public") {
      if (stages === 1) basePrice = 310;
      else if (stages === 2) basePrice = 365;
      else if (stages === 3) basePrice = 425;
      else basePrice = 600;

      if (subscriptionPeriod === "annual") {
        basePrice = basePrice * 3.5; // Discounted annual rate
      }
    } else if (userCategory === "student") {
      // Subsidized Student Quarterly Pass
      basePrice = stages <= 2 ? 33 : 41;
      if (subscriptionPeriod === "annual") basePrice = basePrice * 3;
    } else if (userCategory === "senior") {
      // Seniors 60+ (50% discount)
      if (stages === 1) basePrice = 155;
      else if (stages === 2) basePrice = 185;
      else if (stages === 3) basePrice = 215;
      else basePrice = 300;

      if (subscriptionPeriod === "annual") basePrice = basePrice * 3.5;
    } else if (userCategory === "determination") {
      // People of Determination (~50 EGP quarterly pass)
      basePrice = 22;
      if (subscriptionPeriod === "annual") basePrice = 66;
    }

    return basePrice;
  }, [userCategory, subscriptionPeriod, stages]);

  const cashTotalCost = useMemo(() => {
    const weeks = subscriptionPeriod === "quarterly" ? 13 : 52;
    const cashPrice = getSingleCashPrice(stages);
    return tripsPerWeek * weeks * cashPrice;
  }, [tripsPerWeek, subscriptionPeriod, stages]);

  const savings = useMemo(() => {
    return Math.max(0, cashTotalCost - subscriptionCost);
  }, [cashTotalCost, subscriptionCost]);

  const savingsPercentage = useMemo(() => {
    if (cashTotalCost === 0) return 0;
    return Math.round((savings / cashTotalCost) * 100);
  }, [savings, cashTotalCost]);

  return (
    <div style={{
      backgroundColor: "var(--bgPrimary)",
      border: "1px solid var(--borderGlass)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "var(--shadow-card)",
      direction: "rtl",
      fontFamily: "var(--font-body)",
      marginTop: "24px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "12px" }}>
        <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
          <FaCalculator />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--textPrimary)" }}>حاسبة توفير اشتراكات المترو</h3>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--textSecondary)" }}>احسب مقدار التوفير المالي بين شراء التذاكر يومياً كاش أم عمل اشتراك مترو رسمي</p>
        </div>
      </div>

      {/* Form Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "18px" }}>

        {/* User Category */}
        <div>
          <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>فئة الراكب:</label>
          <select
            value={userCategory}
            onChange={(e) => setUserCategory(e.target.value as any)}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid var(--borderGlass)",
              background: "var(--bgSecondary)",
              color: "var(--textPrimary)",
              padding: "0 12px",
              fontSize: "0.88rem",
              fontWeight: "600"
            }}
          >
            <option value="public">جمهور (عادي)</option>
            <option value="student">طلاب المدارس والجامعات</option>
            <option value="senior">كبار السن (60 سنة فأكثر)</option>
            <option value="determination">ذوي الهمم والاحتياجات الخاصة</option>
          </select>
        </div>

        {/* Subscription Period */}
        <div>
          <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>مدة الاشتراك:</label>
          <select
            value={subscriptionPeriod}
            onChange={(e) => setSubscriptionPeriod(e.target.value as any)}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid var(--borderGlass)",
              background: "var(--bgSecondary)",
              color: "var(--textPrimary)",
              padding: "0 12px",
              fontSize: "0.88rem",
              fontWeight: "600"
            }}
          >
            <option value="quarterly">اشتراك ربع سنوي (3 أشهر)</option>
            <option value="annual">اشتراك سنوي (12 شهر)</option>
          </select>
        </div>

        {/* Stages / Stations */}
        <div>
          <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>عدد المحطات (المرحلة):</label>
          <select
            value={stages}
            onChange={(e) => setStages(Number(e.target.value))}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid var(--borderGlass)",
              background: "var(--bgSecondary)",
              color: "var(--textPrimary)",
              padding: "0 12px",
              fontSize: "0.88rem",
              fontWeight: "600"
            }}
          >
            <option value={1}>المرحلة الأولى (حتى 9 محطات - 8 ج.م كاش)</option>
            <option value={2}>المرحلة الثانية (من 10 إلى 16 محطة - 10 ج.م كاش)</option>
            <option value={3}>المرحلة الثالثة (من 17 إلى 23 محطة - 15 ج.م كاش)</option>
            <option value={4}>المرحلة الرابعة (أكثر من 23 محطة - 20 ج.م كاش)</option>
          </select>
        </div>

        {/* Trips Per Week */}
        <div>
          <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>عدد الرحلات الأسبوعية (ذهاب وإياد):</label>
          <select
            value={tripsPerWeek}
            onChange={(e) => setTripsPerWeek(Number(e.target.value))}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid var(--borderGlass)",
              background: "var(--bgSecondary)",
              color: "var(--textPrimary)",
              padding: "0 12px",
              fontSize: "0.88rem",
              fontWeight: "600"
            }}
          >
            <option value={4}>2 أيام عمل أسبوعياً (4 رحلات)</option>
            <option value={6}>3 أيام عمل أسبوعياً (6 رحلات)</option>
            <option value={10}>5 أيام عمل أسبوعياً (10 رحلات)</option>
            <option value={12}>6 أيام عمل أسبوعياً (12 رحلة)</option>
            <option value={14}>يومياً (14 رحلة أسبوعياً)</option>
          </select>
        </div>

      </div>

      {/* Results Comparison Grid */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "14px",
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center", padding: "10px", background: "var(--bgPrimary)", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", fontWeight: "600" }}>تكلفة التذاكر الكاش</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ef4444", marginTop: "4px" }}>{cashTotalCost} ج.م</div>
        </div>

        <div style={{ textAlign: "center", padding: "10px", background: "var(--bgPrimary)", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", fontWeight: "600" }}>تكلفة الاشتراك المترو الرسمية</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--colorSecondary)", marginTop: "4px" }}>{subscriptionCost} ج.م</div>
        </div>

        <div style={{ textAlign: "center", padding: "10px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <div style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <FaPiggyBank />
            <span>صافي التوفير لك</span>
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>
            {savings} ج.م <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>({savingsPercentage}%)</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "0.78rem", color: "var(--textSecondary)" }}>
        <FaCheckCircle style={{ color: "#10b981" }} />
        <span>الاشتراك يُتيح لك عدد رحلات غير محدود أو حتى 180 رحلة خلال الفترة المقررة.</span>
      </div>

      {/* 💳 Smart Cards & Subscription Hubs Guide Section */}
      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed var(--borderGlass)" }}>
        <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          💳 دليل الكارت الذكي (Smart Card) ومكاتب الاشتراكات
        </h4>

        {/* Smart Cards Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
            <h5 style={{ margin: "0 0 6px 0", color: "#6366f1", fontSize: "0.92rem", fontWeight: "700" }}>📲 كارت المحفظة الإلكترونية</h5>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
              يمكن شراؤه بقيمة 50 ج.م من أي شباك تذاكر، وتشحنه برصيد ينزل منه سعر الرحلة تلقائياً بدون الانتظار في طوابير التذاكر.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
            <h5 style={{ margin: "0 0 6px 0", color: "#10b981", fontSize: "0.92rem", fontWeight: "700" }}>💸 طرق الشحن المتاحة</h5>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
              عبر ماكينات التذاكر الذكية TVM بالمحطات، منافذ فوري وأمان، أو من خلال محفظة فودافون كاش والأهلي فون.
            </p>
          </div>
        </div>

        {/* Subscription Offices List */}
        <div style={{ background: "rgba(99, 102, 241, 0.06)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
          <h5 style={{ margin: "0 0 8px 0", color: "var(--textPrimary)", fontSize: "0.88rem", fontWeight: "800" }}>
            📍 أهم مكاتب عمل الاشتراكات ومواعيدها:
          </h5>
          <ul style={{ margin: 0, paddingRight: "18px", fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
            <li><strong>الخط الأول:</strong> محطات (الشهداء، حلوان، عين شمس، المعادي، المرج الجديدة).</li>
            <li><strong>الخط الثاني:</strong> محطات (الشهداء، العتبة، شبرا الخيمة، جامعة القاهرة، كلية الزراعة).</li>
            <li><strong>الخط الثالث:</strong> محطات (العدلي منصور، العباسية، الكيت كات، العتبة).</li>
            <li><strong>مواعيد العمل:</strong> يومياً من الساعة 07:00 صباحاً حتى 08:00 مساءً.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
