"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";




const payicon = [
  {name:"vodafone cash", title: "فودافون كاش", icon:"/image/telCompany/vodafone-logo.png"},
  {name:"instapay", title: "انستاباي", icon:"/image/payment/instapay.png"},
  {name:"visa", title: "فيزا", icon:"/image/payment/visa.png"},
  {name:"fawry", title: "فوري", icon:"/image/payment/fawry.png"},
  {name:"mastercard", title: "ماستركارد", icon:"/image/payment/mastercard.png"},
  {name:"applepay", title: "ابل باي", icon:"/image/payment/applepay.png"},
]

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/profile" || pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Top Section */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo/darkMode_logo.png" alt="دفتر" className="logo-img-dark" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
              <img src="/logo/lightMode_logo%5D.png" alt="دفتر" className="logo-img-light" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
            </div>
            <p className="footer-tagline">
              دليلك الذكي الشامل لأرقام وعناوين ومواقع الأماكن والخدمات في مصر — في متناول يدك دائماً.
            </p>
            <div className="footer-social">
              <a href="https://www.facebook.com/reposts3" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="فيسبوك">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" className="footer-social-btn" title="انستجرام">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">روابط سريعة</h4>
            <nav className="footer-nav">
              <Link href="/" className="footer-nav-link">الصفحة الرئيسية</Link>
              <Link href="/about" className="footer-nav-link">عن الموقع</Link>
              <Link href="/help" className="footer-nav-link">مركز المساعدة</Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">الفئات</h4>
            <nav className="footer-nav">
              <Link href="/?cat=restaurant" className="footer-nav-link">🍽️ مطاعم</Link>
              <Link href="/?cat=cafe" className="footer-nav-link">☕ كافيهات</Link>
              <Link href="/?cat=hospital" className="footer-nav-link">🏥 مستشفيات</Link>
              <Link href="/?cat=pharmacy" className="footer-nav-link">💊 صيدليات</Link>
              <Link href="/?cat=family" className="footer-nav-link">👨‍👩‍👧‍👦 عائلية</Link>
              <Link href="/?cat=entertainment" className="footer-nav-link">🎭 ترفيهية</Link>
            </nav>
          </div>

          {/* Contact / Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">STAGE KODE</h4>
            <p className="footer-company-desc">الشركة المطوّرة لتطبيق دفتر — نصنع تجارب رقمية متميزة تُبسّط حياتك اليومية.</p>
            <div className="footer-contact-items">
              <span className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                01234567890
              </span>
              <span className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                info@stagekode.com
              </span>
            </div>
          </div>
        </div>

        {/* Payment Icons */}
        <div className="footer-payments">
          <span className="footer-payments-title">وسائل الدفع المدعومة:</span>
          <div className="footer-payments-icons">
            {/* Vodafone Cash */}
            <div className="payment-badge" title="InstaPay">
             <Image src={payicon[0].icon} alt="Vodafone Cash" width={20} height={20} />
              <span>{payicon[0].title}</span>
            </div>
            {/* instaPay */}
            <div className="payment-badge" title="Vodafone Cash">
              <Image src={payicon[1].icon} alt="Vodafone Cash" width={20} height={20} />
              <span>{payicon[1].title}</span>
            </div>
            {/* Visa */}
            <div className="payment-badge" title="Visa">
              <Image src={payicon[2].icon} alt="Visa" width={20} height={20} />
              <span>{payicon[2].title}</span>
            </div>
            {/* Fawry */}
            <div className="payment-badge" title="Fawry">
              <Image src={payicon[3].icon} alt="Visa" width={20} height={20} />
              <span>{payicon[3].title}</span>
            </div>
            {/* Apple Pay */}
            <div className="payment-badge" title="Apple Pay">
             <Image src={payicon[4].icon} alt="Visa" width={20} height={20} />
              <span>{payicon[4].title}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>© {currentYear} جميع الحقوق محفوظة لـ <strong>STAGE KODE</strong></span>
          <span className="footer-bottom-sep">•</span>
          <span>تطبيق <strong>دفتر</strong> — دليل الأماكن والخدمات</span>
        </div>
      </div>
    </footer>
  );
}
