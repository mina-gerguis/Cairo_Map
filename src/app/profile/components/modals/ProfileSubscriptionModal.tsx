"use client";

import React from "react";
import { UserProfile, SubscriptionPlan, SubscriptionPeriod, ProfileAlertMessage } from "../../types";
import styles from "../../page.module.css";

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
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "960px",
          width: "100%",
          padding: "24px 28px",
          borderRadius: "16px",
          background: "var(--bgPrimary)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid var(--border-glass)",
          animation: "slide-up 0.3s ease",
          maxHeight: "90vh",
          overflowY: "auto",
          direction: "rtl",
          textAlign: "right",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            fontFamily: "var(--font-heading)",
          }}
        >
          <h3
            className="sub-title"
            style={{
              fontSize: "1.3rem",
              fontWeight: "900",
              color: "var(--text-primary)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bx bxs-crown" style={{ color: "#fbbf24" }}></i>
            باقات ماب القاهرة
          </h3>
          <button onClick={onClose} className="btn-close">
            <i className="bx bx-x"></i>
          </button>
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
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>باقيتك الحالية:</div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "var(--text-primary)",
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
                      ? "#ef4444"
                      : "var(--accent-gold, #eab308)",
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
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              رصيد محفظتك الحالي:
            </div>
            <strong
              style={{
                color: "#22c55e",
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
              background:
                subMessage.type === "success"
                  ? "rgba(52, 199, 89, 0.15)"
                  : "rgba(255, 59, 48, 0.15)",
              color: subMessage.type === "success" ? "#34c759" : "#ff3b30",
              fontSize: "0.88rem",
              border:
                subMessage.type === "success"
                  ? "1px solid rgba(52, 199, 89, 0.3)"
                  : "1px solid rgba(255, 59, 48, 0.3)",
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
                color: "var(--text-prmiry)",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
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
                padding: "6px 24px",
                borderRadius: "20px",
                background:
                  subscriptionPeriod === "yearly"
                    ? "linear-gradient(135deg, #cac7ffff 0%, #84b3ffff 100%)"
                    : "none",
                border: "none",
                color: "var(--text-prmiry)",
                fontFamily: "var(--font-heading)",
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
                  ? "2px solid var(--border-glass)"
                  : "1px solid var(--border-glass)",
              borderRadius: "16px",
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
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("free").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                {getPlanPrice("free", null)} ج.م
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
                  paddingRight: "16px",
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  lineHeight: "1.5",
                  listStyleType: "disc",
                }}
              >
                {(findPlan("free").features || []).map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
                <li style={{ textDecoration: "line-through", opacity: 0.5 }}>
                  خريطة المونوريل التفاعلية الكاملة
                </li>
                <li style={{ textDecoration: "line-through", opacity: 0.5 }}>
                  إضافة تذكيرات وملاحظات للأماكن
                </li>
                <li style={{ textDecoration: "line-through", opacity: 0.5 }}>
                  دليل &quot;ازاي اروح&quot; للمواصلات
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={subscribing || effectiveTier === "free"}
              onClick={() => handleConfirmSubscribe("free", null)}
              style={{
                width: "100%",
                padding: "var(--padding-btn)",
                borderRadius: "var(--radiusBtn)",
                background: effectiveTier === "free" ? "var(--btn-cancel)" : "rgba(255,255,255,0.1)",
                color: effectiveTier === "free" ? "#64748b" : "#fff",
                border: "none",
                fontWeight: "bold",
                marginTop: "24px",
                cursor: effectiveTier === "free" ? "default" : "pointer",
                fontSize: "0.88rem",
              }}
            >
              {effectiveTier === "free" ? "باقتك الحالية" : "الرجوع للمجانية"}
            </button>
          </div>

          {/* Card 1.5: Mishwar */}
          <div
            style={{
              background: "var(--bg-secondary, rgba(255, 255, 255, 0.02))",
              border: effectiveTier === "mishwar" ? "2px solid #10b981" : "1px solid var(--border-glass)",
              borderRadius: "16px",
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
                  color: "var(--text-primary)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("mishwar").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--text-primary)",
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
                  paddingRight: "16px",
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  lineHeight: "1.5",
                  listStyleType: "disc",
                }}
              >
                {(findPlan("mishwar").features || []).map((feature: string, idx: number) => (
                  <li
                    key={idx}
                    style={idx === 0 ? { color: "var(--mainBtn)", fontWeight: "bold" } : undefined}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={subscribing || effectiveTier === "mishwar"}
              onClick={() => handleConfirmSubscribe("mishwar", "daily")}
              style={{
                width: "100%",
                padding: "var(--padding-btn)",
                borderRadius: "var(--radiusBtn)",
                background: effectiveTier === "mishwar" ? "var(--btn-cancel)" : "var(--mainBtn)",
                color: effectiveTier === "mishwar" ? "#64748b" : "#fff",
                border: "none",
                fontWeight: "bold",
                marginTop: "24px",
                cursor: effectiveTier === "mishwar" ? "default" : "pointer",
                fontSize: "0.88rem",
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
              border: effectiveTier === "silver" ? "2px solid #6366f1" : "1px solid var(--border-glass)",
              borderRadius: "16px",
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
              <img src="/images/icons3d/CairoSailver.png" alt="" width="60px" />
              <h4
                className="sub-title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("silver").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--text-primary)",
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
                  paddingRight: "16px",
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  lineHeight: "1.4",
                  listStyleType: "disc",
                }}
              >
                {(findPlan("silver").features || []).map((feature: string, idx: number) => {
                  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(feature);
                  return (
                    <li
                      key={idx}
                      style={
                        hasEmoji
                          ? { color: "var(--text-primary)", fontWeight: "bold" }
                          : undefined
                      }
                    >
                      {feature}
                    </li>
                  );
                })}
                <li style={{ textDecoration: "line-through", opacity: 0.5 }}>
                  دليل المطارات والموانئ المصرية
                </li>
                <li style={{ textDecoration: "line-through", opacity: 0.5 }}>
                  مواقف الأتوبيسات والميكروباصات
                </li>
                <li style={{ textDecoration: "line-through", opacity: 0.5 }}>
                  مخطط الرحلات الذكي بالذكاء الاصطناعي
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={
                subscribing ||
                (effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod)
              }
              onClick={() => handleConfirmSubscribe("silver", subscriptionPeriod)}
              style={{
                width: "100%",
                padding: "var(--padding-btn)",
                borderRadius: "var(--radiusBtn)",
                background:
                  effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                    ? "rgba(255,255,255,0.04)"
                    : "var(--bg-subscribe-button-seliver)",
                color:
                  effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                    ? "#64748b"
                    : "#000000ff",
                border: "none",
                fontWeight: "bold",
                marginTop: "24px",
                cursor:
                  effectiveTier === "silver" && profile?.subscription_period === subscriptionPeriod
                    ? "default"
                    : "pointer",
                fontSize: "0.88rem",
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
              border: effectiveTier === "gold" ? "2px solid #eab308" : "1px solid var(--border-glass)",
              borderRadius: "16px",
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
              <img src="/images/icons3d/CairoGold.png" alt="" width="60px" />

              <h4
                className="sub-title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  margin: "0 0 8px",
                }}
              >
                {findPlan("gold").name}
              </h4>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: "var(--text-primary)",
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
                  paddingRight: "16px",
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  lineHeight: "1.4",
                  listStyleType: "disc",
                }}
              >
                {(findPlan("gold").features || []).map((feature: string, idx: number) => {
                  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(feature);
                  return (
                    <li
                      key={idx}
                      style={
                        hasEmoji
                          ? { color: "var(--text-primary)", fontWeight: "bold" }
                          : undefined
                      }
                    >
                      {feature}
                    </li>
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
              style={{
                width: "100%",
                padding: "var(--padding-btn)",
                borderRadius: "var(--radiusBtn)",
                background:
                  effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                    ? "var(--btn-cancel)"
                    : "var(--bg-subscribe-button-gold)",
                color:
                  effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                    ? "#64748b"
                    : "#000",
                border: "none",
                fontWeight: "bold",
                marginTop: "24px",
                cursor:
                  effectiveTier === "gold" && profile?.subscription_period === subscriptionPeriod
                    ? "default"
                    : "pointer",
                fontSize: "0.88rem",
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
