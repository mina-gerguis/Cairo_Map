"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";




const payicon = [
  {name:"vodafone cash", title: "فودافون كاش", icon:"/image/telCompany/vodafone-logo.png"},
  {name:"instapay", title: "انستاباي", icon:"/image/payment/instapay.png"},
  {name:"meeza", title: "ميزة", icon:"/image/payment/meeza.png"},
  {name:"fawry", title: "فوري", icon:"/image/payment/fawry.png"},
  {name:"visa", title: "فيزا", icon:"/image/payment/visa.png"},
  {name:"mastercard", title: "ماستركارد", icon:"/image/payment/mastercard.png"},
  {name:"applepay", title: "ابل باي", icon:"/image/payment/applepay.png"},
  {name:"telda", title: "تيلدا", icon:"/image/payment/telda.jpg"},
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
         <div>

         </div>
        </div>

        {/* Payment Icons */}
        <div className="footer-payments">
          <span className="footer-payments-title">يمكنك الدفع بأستخدام</span>
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
            {/* Miza */}
            <div className="payment-badge" title="Miza">
              <Image src={payicon[4].icon} alt="Visa" width={20} height={20} />
              <span>{payicon[4].title}</span>
            </div>
            {/* Apple Pay */}
            <div className="payment-badge" title="Apple Pay">
             <Image src={payicon[5].icon} alt="Visa" width={20} height={20} />
              <span>{payicon[5].title}</span>
            </div>
            {/* Telda Pay */}
            <div className="payment-badge" title="Telda Pay">
              <Image src={payicon[6].icon} alt="Telda Pay" width={20} height={20} />
              <span>{payicon[6].title}</span>
            </div>
            {/* Meeza */}
             <div className="payment-badge" title="Meeza">
              <Image src={payicon[7].icon} alt="Meeza" width={20} height={20} />
              <span>{payicon[7].title}</span>
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
