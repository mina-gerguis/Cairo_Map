"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const payicon = [
  { name: "vodafone cash", title: "فودافون كاش", icon: "/images/telCompany/vodafone-logo.png" },
  { name: "instapay", title: "انستاباي", icon: "/images/payment/instapay.png" },
  { name: "meeza", title: "ميزة", icon: "/images/payment/meeza.png" },
  { name: "fawry", title: "فوري", icon: "/images/payment/fawry.png" },
  { name: "visa", title: "فيزا", icon: "/images/payment/visa.png" },
  { name: "mastercard", title: "ماستركارد", icon: "/images/payment/mastercard.png" },
  { name: "applepay", title: "ابل باي", icon: "/images/payment/applepay.png" },
  { name: "telda", title: "تيلدا", icon: "/images/payment/telda.jpg" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/profile" || pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Copyright & Description */}
        <div className="footer-text">
          <span>© {currentYear} جميع الحقوق محفوظة لـ <a href="https://www.linkedin.com/company/repo-dex" target="_blank"><strong>RepoDex.</strong></a></span>
          <span className="footer-sep">•</span>
          <span>تطبيق <strong>القاهرة ماب</strong> — دليل الأماكن والخدمات</span>
        </div>

        {/* Small, clean payment icons */}
        <div className="footer-payments-minimal">
          <div className="footer-payments-list">
            {payicon.map((pay) => (
              <div key={pay.name} className="payment-icon-item" title={pay.title}>
                <Image 
                  src={pay.icon} 
                  alt={pay.title} 
                  width={24} 
                  height={15} 
                  style={{ width: "auto", height: "14px" }}
                  className="payment-icon-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
