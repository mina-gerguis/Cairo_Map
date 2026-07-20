import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Top Section */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span>📋</span>
              <span className="footer-logo-text">دفتر</span>
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
            {/* InstaPay */}
            <div className="payment-badge" title="InstaPay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>InstaPay</span>
            </div>
            {/* Vodafone Cash */}
            <div className="payment-badge" title="Vodafone Cash">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#e60026"/>
              </svg>
              <span>Vodafone Cash</span>
            </div>
            {/* Visa */}
            <div className="payment-badge" title="Visa">
              <svg width="32" height="20" viewBox="0 0 48 16" fill="none">
                <text x="0" y="14" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1a1f71">VISA</text>
              </svg>
            </div>
            {/* Fawry */}
            <div className="payment-badge" title="Fawry">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7931e" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <span>Fawry</span>
            </div>
            {/* Apple Pay */}
            <div className="payment-badge" title="Apple Pay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              <span>Apple Pay</span>
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
