"use client";

import React from "react";
import { UserProfile, SubscriptionPlan, SubscriptionPeriod, ProfileAlertMessage } from "../../types";
import styles from "../../page.module.css";
import { ChevronRight, Check, X } from "lucide-react";

/* ─── Feature Item with Check / Cross Icon ─── */
const FeatureItem: React.FC<{
  included: boolean;
  text: string;
  isSpecial?: boolean;
}> = ({ included, text, isSpecial }) => (
  <li
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "0.78rem",
      lineHeight: "1.45",
      color: included
        ? isSpecial
          ? "var(--color-foreground)"
          : "var(--text-secondary)"
        : "var(--text-muted)",
      opacity: included ? 1 : 0.5,
      textDecoration: included ? "none" : "line-through",
      listStyle: "none",
    }}
  >
    <span
      style={{
        flexShrink: 0,
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: included
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(239, 68, 68, 0.12)",
      }}
    >
      {included ? (
        <Check size={11} color="#10b981" strokeWidth={3} />
      ) : (
        <X size={10} color="#ef4444" strokeWidth={2.5} />
      )}
    </span>
    <span style={{ fontWeight: isSpecial ? 700 : 400 }}>{text}</span>
  </li>
);

interface ProfileSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  selectedPlanId: string;
  subscriptionPeriod: "monthly" | "yearly";
  setSubscriptionPeriod: (period: "monthly" | "yearly") => void;
  subscribing: boolean;
  subMessage: ProfileAlertMessage | null;
  setSubMessage: (msg: ProfileAlertMessage | null) => void;
  activeCardIndex: number;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  scrollToCard: (index: number) => void;
  handleCarouselScroll: () => void;
  getPlanPrice: (planId: string, period: SubscriptionPeriod | null) => number;
  handleConfirmSubscribe: (planId: string, period: SubscriptionPeriod | null) => void;
  findPlan: (planId: string) => SubscriptionPlan;
}

export const ProfileSubscriptionModal: React.FC<ProfileSubscriptionModalProps> = ({
  isOpen,
  onClose,
  profile,
  selectedPlanId,
  subscriptionPeriod,
  setSubscriptionPeriod,
  subscribing,
  subMessage,
  setSubMessage,
  activeCardIndex,
  carouselRef,
  scrollToCard,
  handleCarouselScroll,
  getPlanPrice,
  handleConfirmSubscribe,
  findPlan,
}) => {
  if (!isOpen) return null;

  const isExpired = Boolean(
    profile?.subscription_end && new Date(profile.subscription_end) < new Date()
  );
  const effectiveTier = !profile?.subscription_tier || isExpired ? "free" : profile.subscription_tier;

  return (
    <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={onClose}>
      <div
        className={`glass-panel ${styles.glassPanel}`}
        onClick={(e) => e.stopPropagation()}
        style={{
         
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <button onClick={onClose} className="btn-close border-none">
            <ChevronRight size={18} />
          </button>
          <h3
            className="sub-title"
            style={{
              fontSize: "1.3rem",
              fontWeight: "900",
              color: "var(--color-foreground)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            باقات ماب القاهرة
          </h3>
        </div>

        {/* Current Tier Info & Wallet Info Summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-secondary)",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>الباقة الحالية:</div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "var(--color-foreground)",
                marginTop: "2px",
              }}
            >
              {effectiveTier === "mishwar"
                ? profile?.subscription_status === "cancelled"
                  ? " باقة المشوار (بانتظار الإلغاء)"
                  : " باقة المشوار (نشط)"
                : effectiveTier === "silver"
                  ? profile?.subscription_status === "cancelled"
                    ? " الباقة الفضية (بانتظار الإلغاء)"
                    : " الباقة الفضية (نشط)"
                  : effectiveTier === "gold"
                    ? profile?.subscription_status === "cancelled"
                      ? " الباقة الذهبية (بانتظار الإلغاء)"
                      : " الباقة الذهبية (نشط)"
                    : isExpired
                      ? "الباقة المجانية (انتهت صلاحية الباقة السابقة)"
                      : "الباقة المجانية"}
            </div>
            {profile?.subscription_tier !== "free" && profile?.subscription_end && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color:
                    isExpired || profile?.subscription_status === "cancelled"
                      ? "var(--color-error)"
                      : "var(--color-primary)",
                  marginTop: "2px",
                }}
              >
                {isExpired
                  ? `انتهت الصلاحية بتاريخ: ${new Date(
                    profile.subscription_end
                  ).toLocaleDateString("ar-EG")} (تم العودة للباقة المجانية)`
                  : profile?.subscription_status === "cancelled"
                    ? `تم إلغاء التجديد التلقائي. ستنتهي في: ${new Date(
                      profile.subscription_end
                    ).toLocaleDateString("ar-EG")}`
                    : `تاريخ انتهاء الصلاحية: ${new Date(
                      profile.subscription_end
                    ).toLocaleDateString("ar-EG")}`}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              رصيد المحفظة:
            </div>
            <strong
              style={{
                color: "var(--color-foreground)",
                fontSize: "1.15rem",
                marginTop: "2px",
                display: "block",
              }}
            >
              {(profile?.balance ?? 0).toFixed(2)} ج.م
            </strong>
          </div>
        </div>

        {/* Status Messages */}
        {subMessage && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "20px",
              color: subMessage.type === "success" ? "var(--color-success)" : "var(--color-error)",
              fontSize: "0.88rem",
              lineHeight: "1.5",
            }}
          >
            {subMessage.text}
          </div>
        )}

        {/* Toggle Billing Period */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              background: "var(--bg-muted)",
              padding: "4px",
              borderRadius: "30px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSubscriptionPeriod("monthly");
                setSubMessage(null);
              }}
              style={{
                padding: "6px 24px",
                borderRadius: "20px",
                background:
                  subscriptionPeriod === "monthly"
                    ? "linear-gradient(135deg, #cac7ffff 0%, #84b3ffff 100%)"
                    : "none",
                border: "none",
                color: subscriptionPeriod === "monthly" ? "#000" : "var(--text-secondary)",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              شهري
            </button>
            <button
              type="button"
              onClick={() => {
                setSubscriptionPeriod("yearly");
                setSubMessage(null);
              }}
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                background:
                  subscriptionPeriod === "yearly"
                    ? "linear-gradient(135deg, #cac7ffff 0%, #84b3ffff 100%)"
                    : "none",
                border: "none",
                color: subscriptionPeriod === "yearly" ? "#000" : "var(--text-secondary)",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              سنوي (توفير 15%+)
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef as any}
          onScroll={handleCarouselScroll}
          className="sub-carousel"
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            gap: "20px",
            padding: "10px 4px 20px",
            marginBottom: "10px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .sub-carousel::-webkit-scrollbar {
              display: none;
            }
          `,
            }}
          />

          {/* Card 1: Free */}
          <div
            style={{
              background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
              border:
                effectiveTier === "free"
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--border-glass)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              transition: "all 0.3s",
              width: "280px",
              flexShrink: 0,
              scrollSnapAlign: "center",
            }}
          >
            <div>
              <h4
                className="sub-title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--color-foreground)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("free").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--color-foreground)",
                  marginBottom: "16px",
                }}
              >
                مجاناً
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-glass)",
                  margin: "16px 0",
                }}
              />

              <ul
                style={{
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  listStyle: "none",
                }}
              >
                {(findPlan("free").features || []).map((feature: string, idx: number) => {
                  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(feature);
                  return (
                    <FeatureItem
                      key={idx}
                      included={true}
                      text={feature}
                      isSpecial={hasEmoji}
                    />
                  );
                })}
                <FeatureItem included={false} text="خريطة المونوريل التفاعلية الكاملة" />
                <FeatureItem included={false} text="محرك البحث &quot;ازاي اروح&quot; للمواصلات" />
                <FeatureItem included={false} text="دليل سكك حديد مصر والقطارات" />
                <FeatureItem included={false} text="دليل محطات وتعرفة القطار الكهربائي LRT" />
                <FeatureItem included={false} text="دليل مواقف السيارات والباركينج الذكي" />
                <FeatureItem included={false} text="إضافة تذكيرات وملاحظات شخصية للأماكن" />
                <FeatureItem included={false} text="دليل المطارات والموانئ المصرية" />
                <FeatureItem included={false} text="دليل مواقف وأتوبيسات وميكروباصات السفر" />
                <FeatureItem included={false} text="مخطط الرحلات الذكي بالذكاء الاصطناعي" />
              </ul>
            </div>

            <button
              type="button"
              disabled={subscribing || effectiveTier === "free"}
              onClick={() => handleConfirmSubscribe("free", null)}
              className="btn btn-primary border-none fs-sm fw-900"
              style={{
                backgroundColor: effectiveTier === "free" ? "var(--btn-cancel)" : "var(--btn-primary)",
                color: effectiveTier === "free" ? "var(--text-secondary)" : "var(--color-bg)",
                cursor: effectiveTier === "free" ? "no-drop" : "pointer",
              }}
            >
              {effectiveTier === "free" ? "باقتك الحالية" : "الرجوع للمجانية"}
            </button>
          </div>

          {/* Card 1.5: Mishwar */}
          <div
            style={{
              background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
              border: effectiveTier === "mishwar" ? "2px solid var(--color-primary)" : "1px solid var(--border-glass)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow:
                effectiveTier === "mishwar" ? "0 8px 24px rgba(16, 185, 129, 0.15)" : "none",
              transition: "all 0.3s",
              width: "280px",
              flexShrink: 0,
              scrollSnapAlign: "center",
            }}
          >
            <div>
              <h4
                className="sub-title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--color-foreground)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("mishwar").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--color-foreground)",
                  marginBottom: "16px",
                }}
              >
                {getPlanPrice("mishwar", "daily")} ج.م
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                  {" "}
                  / 24 ساعة
                </span>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-glass)",
                  margin: "16px 0",
                }}
              />

              <ul
                style={{
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  listStyle: "none",
                }}
              >
                {(findPlan("mishwar").features || []).map((feature: string, idx: number) => {
                  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(feature);
                  return (
                    <FeatureItem
                      key={idx}
                      included={true}
                      text={feature}
                      isSpecial={idx === 0 || idx === 1 || hasEmoji}
                    />
                  );
                })}
              </ul>
            </div>

            <button
              type="button"
              disabled={subscribing || effectiveTier === "mishwar"}
              onClick={() => handleConfirmSubscribe("mishwar", "daily")}
              className="btn btn-primary border-none fs-sm fw-900"
              style={{
                width: "100%",
                background: effectiveTier === "mishwar" ? "var(--btn-cancel)" : "var(--mainBtn)",
                color: effectiveTier === "mishwar" ? "#64748b" : "#fff",
                cursor: effectiveTier === "mishwar" ? "default" : "pointer",
              }}
            >
              {subscribing && selectedPlanId === "mishwar"
                ? "جاري التفعيل..."
                : effectiveTier === "mishwar"
                  ? "باقتك الحالية"
                  : "اشترك الآن"}
            </button>
          </div>

          {/* Card 2: Silver */}
          <div
            style={{
              background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
              border: effectiveTier === "silver" ? "2px solid var(--color-primary)" : "1px solid var(--border-glass)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow:
                effectiveTier === "silver" ? "0 8px 24px rgba(99, 102, 241, 0.15)" : "none",
              transition: "all 0.3s",
              width: "280px",
              flexShrink: 0,
              scrollSnapAlign: "center",
            }}
          >
            <div>
              <img src="/images/icons3d/CairoSilver.webp" alt="" width="60px" />
              <h4
                className="sub-title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--color-foreground)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("silver").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--color-foreground)",
                  marginBottom: "16px",
                }}
              >
                {getPlanPrice("silver", subscriptionPeriod)} ج.م
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                  {subscriptionPeriod === "monthly" ? " / شهرياً" : " / سنوياً"}
                </span>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-glass)",
                  margin: "16px 0",
                }}
              />

              <ul
                style={{
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  listStyle: "none",
                }}
              >
                {(findPlan("silver").features || []).map((feature: string, idx: number) => {
                  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(feature);
                  return (
                    <FeatureItem
                      key={idx}
                      included={true}
                      text={feature}
                      isSpecial={hasEmoji}
                    />
                  );
                })}
                <FeatureItem included={false} text="دليل المطارات المصرية وصالات السفر" />
                <FeatureItem included={false} text="دليل الموانئ البحرية التجارية والسياحية" />
                <FeatureItem included={false} text="دليل مواقف وأتوبيسات السفر بين المحافظات" />
                <FeatureItem included={false} text="دليل مواقف الميكروباص والسرفيس والتعرفة" />
                <FeatureItem included={false} text="مخطط الرحلات الذكي بالذكاء الاصطناعي" />
              </ul>
            </div>

            <button
              type="button"
              disabled={
                subscribing ||
                (effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod)
              }
              onClick={() => handleConfirmSubscribe("silver", subscriptionPeriod)}
              className="btn border-none fs-sm fw-900 mt-6"
              style={{
                background:
                  effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                    ? "var(--btn-cancel)"
                    : "var(--bg-subscribe-button-seliver)",
                color:
                  effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                    ? "#64748b"
                    : "#fff",
                cursor:
                  effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                    ? "default"
                    : "pointer",
              }}
            >
              {subscribing && selectedPlanId === "silver"
                ? "جاري التفعيل..."
                : effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                  ? "باقتك الحالية"
                  : "اشترك الآن"}
            </button>
          </div>

          {/* Card 3: Gold */}
          <div
            style={{
              background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
              border: effectiveTier === "gold" ? "2px solid var(--color-primary)" : "1px solid var(--border-glass)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow:
                effectiveTier === "gold" ? "0 8px 24px rgba(234, 179, 8, 0.15)" : "none",
              transition: "all 0.3s",
              width: "280px",
              flexShrink: 0,
              scrollSnapAlign: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "20px",
                background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                color: "#000",
                fontSize: "0.68rem",
                fontWeight: "900",
                padding: "3px 12px",
                borderRadius: "20px",
                border: "1px solid #fbbf24",
              }}
            >
              الأكثر تميزاً ⭐
            </div>
            <div>
              <img src="/images/icons3d/CairoGold.webp" alt="" width="60px" />

              <h4
                className="sub-title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--color-foreground)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("gold").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--color-foreground)",
                  marginBottom: "16px",
                }}
              >
                {getPlanPrice("gold", subscriptionPeriod)} ج.م
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                  {subscriptionPeriod === "monthly" ? " / شهرياً" : " / سنوياً"}
                </span>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-glass)",
                  margin: "16px 0",
                }}
              />

              <ul
                style={{
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  listStyle: "none",
                }}
              >
                {(findPlan("gold").features || []).map((feature: string, idx: number) => {
                  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(feature);
                  return (
                    <FeatureItem
                      key={idx}
                      included={true}
                      text={feature}
                      isSpecial={hasEmoji}
                    />
                  );
                })}
              </ul>
            </div>

            <button
              type="button"
              disabled={
                subscribing ||
                (effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod)
              }
              onClick={() => handleConfirmSubscribe("gold", subscriptionPeriod)}
              className="btn border-none fs-sm fw-900 mt-6"
              style={{
                width: "100%",
                background:
                  effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                    ? "var(--btn-cancel)"
                    : "var(--bg-subscribe-button-gold)",
                color:
                  effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                    ? "#64748b"
                    : "#000",
                cursor:
                  effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                    ? "default"
                    : "pointer",
              }}
            >
              {subscribing && selectedPlanId === "gold"
                ? "جاري التفعيل..."
                : effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                  ? "باقتك الحالية"
                  : "اشترك الآن"}
            </button>
          </div>
        </div>

        {/* Pagination Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginTop: "16px",
            marginBottom: "10px",
          }}
        >
          {/* Right/Prev Arrow (RTL back) */}
          <button
            type="button"
            onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
            disabled={activeCardIndex === 0}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: activeCardIndex === 0 ? "#475569" : "var(--mainBtn)",
              cursor: activeCardIndex === 0 ? "default" : "pointer",
              fontSize: "1.2rem",
              transition: "all 0.2s",
            }}
          >
            <i className="bx bx-chevron-right"></i>
          </button>

          {/* Dots */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToCard(idx)}
                style={{
                  width: activeCardIndex === idx ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: activeCardIndex === idx ? "var(--mainBtn)" : "var(--text-muted)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>

          {/* Left/Next Arrow (RTL forward) */}
          <button
            type="button"
            onClick={() => scrollToCard(Math.min(3, activeCardIndex + 1))}
            disabled={activeCardIndex === 3}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: activeCardIndex === 3 ? "var(--text-muted)" : "var(--mainBtn)",
              cursor: activeCardIndex === 3 ? "default" : "pointer",
              fontSize: "1.2rem",
              transition: "all 0.2s",
            }}
          >
            <i className="bx bx-chevron-left"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
