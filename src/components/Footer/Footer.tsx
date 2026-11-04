"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/constants/assets";
import { useGSAP, gsap } from "@/lib/gsap";

const payicon = [
  { name: "vodafone cash", title: "فودافون كاش", icon: ASSETS.company.vodafone },
  { name: "instapay", title: "انستاباي", icon: ASSETS.company.instapay },
  { name: "meeza", title: "ميزة", icon: ASSETS.company.meeza },
  { name: "fawry", title: "فوري", icon: ASSETS.company.fawry },
  { name: "visa", title: "فيزا", icon: ASSETS.company.visa },
  { name: "mastercard", title: "ماستركارد", icon: ASSETS.company.mastercard },
  { name: "applepay", title: "ابل باي", icon: ASSETS.company.applepay },
  { name: "telda", title: "تيلدا", icon: ASSETS.company.telda },
];

export default function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = footerRef.current;
      if (!el) return;

      const copyright = el.querySelector(".footer-copyright");
      const badges = el.querySelectorAll(".payment-icon-item");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      if (copyright) {
        tl.fromTo(
          copyright,
          { autoAlpha: 0, y: 15 },
          { autoAlpha: 1, y: 0, duration: 0.5 }
        );
      }

      if (badges.length > 0) {
        tl.fromTo(
          badges,
          { autoAlpha: 0, scale: 0.8 },
          { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.04 },
          "-=0.3"
        );
      }
    },
    { scope: footerRef }
  );

  if (pathname === "/profile" || pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-container">
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span>© {currentYear} جميع الحقوق محفوظة لمنصة <strong>قريب</strong> — تطوير <a href="https://www.linkedin.com/showcase/nexus-group-dev" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>NEXUS GROUP</a>.</span>
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
