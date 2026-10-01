"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaMapMarkedAlt,
  FaSubway,
  FaTrain,
  FaBus,
  FaRobot,
  FaCompass,
  FaPhoneAlt,
  FaBook,
  FaInfoCircle,
  FaEnvelope,
  FaShieldAlt,
  FaFileContract,
  FaQuestionCircle,
  FaPlusCircle,
  FaPlaneDeparture,
  FaAnchor,
} from "react-icons/fa";

const payicon = [
  { name: "vodafone cash", title: "فودافون كاش", icon: "/images/payment/vodafone.webp" },
  { name: "instapay", title: "انستاباي", icon: "/images/payment/instapay.webp" },
  { name: "meeza", title: "ميزة", icon: "/images/payment/meeza.webp" },
  { name: "fawry", title: "فوري", icon: "/images/payment/fawry.webp" },
  { name: "visa", title: "فيزا", icon: "/images/payment/visa.webp" },
  { name: "mastercard", title: "ماستركارد", icon: "/images/payment/mastercard.webp" },
  { name: "applepay", title: "ابل باي", icon: "/images/payment/applepay.webp" },
  { name: "telda", title: "تيلدا", icon: "/images/payment/telda.webp" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/profile" || pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Col 1: Brand & About */}
          <div className="footer-col brand-col">
            <Link href="/" className="footer-brand">
              <Image
                src="/images/icons/cairo-map.webp"
                alt="ماب القاهرة"
                width={38}
                height={38}
                className="footer-logo-img"
              />
              <span className="footer-brand-title">ماب القاهرة</span>
            </Link>
            <p className="footer-brand-desc">
              دليلك الرقمي الشامل لشبكة المواصلات الذكية وخطوط المترو والمونوريل والقطارات، وأرقام وعناوين الأماكن والخدمات في القاهرة الكبرى ومصر.
            </p>
            <div className="footer-badges">
              <span className="footer-pill">
                <FaShieldAlt style={{ marginLeft: "4px", color: "var(--color-primary)" }} /> بيانات مدققة ومحدثة
              </span>
            </div>
          </div>

          {/* Col 2: Transit Networks */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              <FaSubway style={{ marginLeft: "6px" }} /> شبكة المواصلات
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link href="/metro" className="footer-link">خريطة مترو القاهرة</Link>
              </li>
              <li>
                <Link href="/monorail" className="footer-link">قطار المونوريل المعلق</Link>
              </li>
              <li>
                <Link href="/lrt" className="footer-link">القطار الكهربائي الخفيف (LRT)</Link>
              </li>
              <li>
                <Link href="/brt" className="footer-link">الأتوبيس الترددي السريع (BRT)</Link>
              </li>
              <li>
                <Link href="/railways" className="footer-link">قطارات سكك حديد مصر</Link>
              </li>
              <li>
                <Link href="/bus-stations" className="footer-link">محطات ومواقف الأتوبيسات</Link>
              </li>
              <li>
                <Link href="/microbus-stations" className="footer-link">مواقف السرفيس والميكروباص</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Tools */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              <FaCompass style={{ marginLeft: "6px" }} /> الأدلة والخدمات
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link href="/places" className="footer-link">دليل الأماكن والأنشطة</Link>
              </li>
              <li>
                <Link href="/directions" className="footer-link">دليل ازاي اروح؟</Link>
              </li>
              <li>
                <Link href="/ai-planner" className="footer-link">مخطط الرحلات الذكي (AI)</Link>
              </li>
              <li>
                <Link href="/directory" className="footer-link">دليل الهواتف والأكواد</Link>
              </li>
              <li>
                <Link href="/blog" className="footer-link">مدونة ومقالات السفر</Link>
              </li>
              <li>
                <Link href="/airports" className="footer-link">المطارات المصرية</Link>
              </li>
              <li>
                <Link href="/ports" className="footer-link">الموانئ البحرية</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              <FaInfoCircle style={{ marginLeft: "6px" }} /> عن المنصة والمساعدة
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link href="/about" className="footer-link">من نحن (About Us)</Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">اتصل بنا (Contact Us)</Link>
              </li>
              <li>
                <Link href="/help" className="footer-link">مركز المساعدة والدعم</Link>
              </li>
              <li>
                <Link href="/propose-place" className="footer-link">اقتراح أو إضافة مكان</Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">سياسة الخصوصية</Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link">شروط الاستخدام</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span>© {currentYear} جميع الحقوق محفوظة لمنصة <strong>ماب القاهرة</strong> — تطوير <a href="https://www.linkedin.com/company/repo-dex" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>RepoDex</a>.</span>
          </div>

          {/* Payment Badges */}
          <div className="footer-payments-minimal">
            <div className="footer-payments-list">
              {payicon.map((pay) => (
                <div key={pay.name} className="payment-icon-item" title={pay.title}>
                  <Image
                    src={pay.icon}
                    alt={pay.title}
                    width={20}
                    height={15}
                    style={{ width: "auto", height: "15px" }}
                    className="payment-icon-img"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
