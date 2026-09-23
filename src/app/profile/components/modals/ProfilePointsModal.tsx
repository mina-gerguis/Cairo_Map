"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IoWalletOutline } from "react-icons/io5";
import { CiShop } from "react-icons/ci";
import { UserProfile, ProfileAlertMessage } from "../../types";
import { formatNumber } from "../../utils";
import styles from "../../page.module.css";

interface ProfilePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  showConvertSection: boolean;
  setShowConvertSection: (show: boolean) => void;
  convertPointsAmount: string;
  setConvertPointsAmount: (amount: string) => void;
  convertingPoints: boolean;
  convertStatus: ProfileAlertMessage | null;
  handleConvertPoints: () => Promise<void>;
}

export const ProfilePointsModal: React.FC<ProfilePointsModalProps> = ({
  isOpen,
  onClose,
  profile,
  showConvertSection,
  setShowConvertSection,
  convertPointsAmount,
  setConvertPointsAmount,
  convertingPoints,
  convertStatus,
  handleConvertPoints,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${styles.modalBackdropSlow}`} onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "24px 28px",
          borderRadius: "16px",
          background: "var(--bgPrimary)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
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
          }}
        >
          <button onClick={onClose} className="btn-close">
            <i className="bx bx-x"></i>
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              fontFamily: "var(--font-cairo)",
            }}
          >
            عملة ماب القاهرة
          </h3>
          <div style={{ width: "38px" }}></div>
        </div>

        {/* Wallet Dashboard Section */}
        <div
          style={{
            textAlign: "center",
            padding: "12px 0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <Image
              src="/images/profile/coin3dMapCairo.png"
              alt="عملة ماب القاهرة"
              draggable={false}
              width={100}
              height={100}
              style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }}
            />
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontWeight: "700",
              fontFamily: "var(--font-cairo)",
            }}
          >
            الرصيد الحالي
          </span>
          <h2
            style={{
              fontSize: "2.4rem",
              fontWeight: "700",
              color: "#cc9303c4",
              margin: "4px 0",
              fontFamily: "var(--font-tenor-sans)",
            }}
          >
            {formatNumber(profile?.points ?? 0)}
          </h2>
          <span
            style={{
              fontSize: "0.85rem",
              color: "#10b981",
              fontWeight: "bold",
              background: "rgba(16, 185, 129, 0.08)",
              padding: "2px 10px",
              borderRadius: "10px",
            }}
          >
            تساوي {formatNumber((profile?.points ?? 0) / 100, 2)} ج.م
          </span>
        </div>

        {/* Actions Buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            type="button"
            onClick={() => setShowConvertSection(!showConvertSection)}
            className="btn btn-primary sub-title"
            style={{ flex: 1, justifyContent: "center", fontSize: "0.9rem" }}
          >
            <IoWalletOutline style={{ fontSize: "1rem" }} />
            التحويل لرصيد
          </button>
          <button
            type="button"
            disabled
            className="btn btn-secondary sub-title"
            style={{
              flex: 1,
              justifyContent: "center",
              fontSize: "0.9rem",
              opacity: 0.5,
              cursor: "not-allowed",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(77, 77, 77, 0.38)",
            }}
          >
            <CiShop style={{ fontSize: "1rem" }} />
            المتجر
          </button>
        </div>

        {/* Convert Section */}
        {showConvertSection && (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "24px",
              animation: "slide-up 0.2s ease",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px",
                fontSize: "0.9rem",
                fontFamily: "var(--font-heading)",
                fontWeight: "700",
                color: "var(--text-primary)",
              }}
            >
              تحويل النقاط إلى رصيد محفظة كاش
            </h4>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "0.78rem",
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                lineHeight: "1.5",
              }}
            >
              الحد الأدنى للتحويل هو 1000 نقطة. كل 100 نقطة تساوي 1.00 جنيه مصري. سيتم إضافة الرصيد
              مباشرة إلى رصيدك الأساسي.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <input
                type="number"
                min="1000"
                step="1"
                className="input-fields"
                placeholder="أدخل عدد النقاط (1000 كحد أدنى)"
                value={convertPointsAmount}
                onChange={(e) => setConvertPointsAmount(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: "0.8rem",
                  textAlign: "center",
                  fontWeight: "700",
                  padding: "8px 6px",
                }}
              />
              <button
                type="button"
                onClick={() => setConvertPointsAmount((profile?.points ?? 0).toString())}
                className="btn"
                style={{
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "25%",
                  border: "1px solid var(--border-glass)",
                }}
              >
                الأقصي
              </button>
            </div>

            {convertPointsAmount &&
              !isNaN(parseInt(convertPointsAmount)) &&
              parseInt(convertPointsAmount) >= 1000 && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#10b981",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "14px",
                  }}
                >
                  ستحصل على: {formatNumber(parseInt(convertPointsAmount) / 100, 2)} ج.م
                </div>
              )}

            {convertStatus && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "14px",
                  background:
                    convertStatus.type === "success"
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(239, 68, 68, 0.12)",
                  color: convertStatus.type === "success" ? "#10b981" : "#f87171",
                  border:
                    convertStatus.type === "success"
                      ? "1px solid rgba(16, 185, 129, 0.2)"
                      : "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {convertStatus.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleConvertPoints}
              disabled={convertingPoints}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
            >
              <IoWalletOutline style={{ fontSize: "1rem" }} />
              {convertingPoints ? "جاري التحويل..." : "تأكيد عملية التحويل"}
            </button>
          </div>
        )}

        {/* Explanation Sections */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "20px",
          }}
        >
          {/* What is Cairo Map Coin */}
          <div>
            <h4
              className="sub-title"
              style={{
                margin: "0 0 8px",
                fontSize: "0.92rem",
                fontWeight: "800",
                color: "#9e7100ff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="bx bx-info-circle" style={{ fontSize: "1.1rem" }}></i>
              ما هي عملة ماب القاهرة؟
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
              }}
            >
              هي عملة رقمية تكافئية خاصة بمجتمع ماب القاهرة، صُممت لتشجيع المستخدمين على إثراء محتوى
              الدليل وتحسين جودة البيانات ومساعدة الآخرين، ويمكن الاستفادة منها عبر تحويلها مباشرة إلى
              كاش أو استخدامها في خدمات الموقع المختلفة.
            </p>
          </div>

          {/* How to Earn */}
          <div>
            <h4
              className="sub-title"
              style={{
                margin: "0 0 10px",
                fontSize: "0.92rem",
                fontWeight: "800",
                color: "#002a9eff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="bx bx-plus-circle" style={{ fontSize: "1.1rem" }}></i>
              كيف تكسب النقاط؟
            </h4>
            <ul
              style={{
                margin: 0,
                paddingRight: "0",
                listStyle: "none",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontFamily: "var(--font-body)",
              }}
            >
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-plus-circle"
                  style={{ color: "#0025f7ff", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <Link
                    href="/propose-place"
                    onClick={onClose}
                    style={{ color: "var(--color-primary)", fontWeight: "bold" }}
                  >
                    إضافة الأماكن:
                  </Link>{" "}
                  عند اقتراح إضافة مكان جديد للدليل.
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-error-alt"
                  style={{ color: "#ff3b30", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <Link
                    href="/directory"
                    onClick={onClose}
                    style={{ color: "var(--color-primary)", fontWeight: "bold" }}
                  >
                    الإبلاغ عن المشاكل:
                  </Link>{" "}
                  عند الإبلاغ عن بيانات خاطئة أو مكان مغلق ويتم اتخاذ إجراء لتعديله.
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-edit-alt"
                  style={{ color: "#10b981", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <Link
                    href="/directory"
                    onClick={onClose}
                    style={{ color: "var(--color-primary)", fontWeight: "bold" }}
                  >
                    تحسين وتدقيق البيانات:
                  </Link>{" "}
                  المساعدة في جعل ماب القاهرة أكثر دقة وتحديثاً.
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-gift"
                  style={{ color: "#3b82f6", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>
                    الهدايا والمكافآت:
                  </span>{" "}
                  الجوائز اليومية والمسابقات والفعاليات المنظمة.
                </div>
              </li>
            </ul>
          </div>

          {/* How to Use */}
          <div>
            <h4
              className="sub-title"
              style={{
                margin: "0 0 10px",
                fontSize: "0.92rem",
                fontWeight: "800",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="bx bx-help-circle" style={{ fontSize: "1.1rem" }}></i>
              كيف تستخدم النقاط؟
            </h4>
            <ul
              style={{
                margin: "0 0 30px 0",
                paddingRight: "0",
                listStyle: "none",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontFamily: "var(--font-body)",
              }}
            >
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-transfer-alt"
                  style={{ color: "#10b981", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <strong>التحويل لرصيد كاش:</strong> تحويلها مباشرة إلى رصيد مالي في محفظتك الشخصية
                  (كل 100 نقطة = 1 جنيه مصري).
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-purchase-tag-alt"
                  style={{ color: "#3b82f6", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <strong>اشتراكات الموقع والمشتريات:</strong> دفع قيمة الاشتراكات المميزة أو شراء السلع
                  من متجر الموقع.
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-calendar-event"
                  style={{ color: "#8b5cf6", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <strong>حجوزات وفواتير:</strong> دفع قيمة كشوفات الأطباء، حجوزات الأماكن، وفواتير الأكل
                  والخدمات.
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-cycling"
                  style={{ color: "#fbbf24", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <strong>إكرامية وتوصيل:</strong> دفع قيمة فواتير الديلفري أو تقديم إكرامية (Tips)
                  لسائقي التوصيل.
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <i
                  className="bx bx-heart"
                  style={{ color: "#ef4444", fontSize: "1.05rem", marginTop: "3px" }}
                ></i>
                <div>
                  <strong>التبرع والمساعدة:</strong> إمكانية التبرع بالنقاط للمؤسسات الخيرية مباشرة.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
