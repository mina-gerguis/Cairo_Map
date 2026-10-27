"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp } from "react-icons/fa";
import { gsap } from "@/lib/gsap";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    if (isVisible && btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { autoAlpha: 0, scale: 0.6, y: 15 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isVisible]);

  const scrollToTop = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 0.85,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={scrollToTop}
      title="العودة لأعلى الصفحة"
      style={{
        position: "fixed",
        bottom: "85px",
        left: "20px",
        zIndex: 99,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: "var(--color-secondary, #3b82f6)",
        color: "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        cursor: "pointer",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <FaArrowUp />
    </button>
  );
}
