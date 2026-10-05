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
