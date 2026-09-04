"use client";

import React, { useState } from "react";
import { FaPhoneAlt, FaShieldAlt, FaAmbulance, FaSubway, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function EmergencyQuickBar() {
  const [isOpen, setIsOpen] = useState(false);

  const emergencyContacts = [
    { name: "طوارئ المترو", number: "16048", icon: <FaSubway />, color: "#10b981" },
    { name: "طوارئ الطرق المرورية", number: "128", icon: <FaShieldAlt />, color: "#3b82f6" },
    { name: "الأسعاف", number: "123", icon: <FaAmbulance />, color: "#ef4444" },
    { name: "شرطة النجدة", number: "122", icon: <FaPhoneAlt />, color: "#f59e0b" },
  ];

  return (
    <div style={{
      backgroundColor: "var(--bgSecondary)",
      border: "1px solid var(--borderGlass)",
      borderRadius: "14px",
      padding: "12px 16px",
      margin: "20px auto",
      maxWidth: "600px",
      direction: "rtl",
      fontFamily: "var(--font-body)",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem"
          }}>
            <FaPhoneAlt />
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--textPrimary)" }}>
              أرقام الطوارئ والمساعدة السريعة للطرق والمواصلات
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)" }}>
              اضغط للاتصال المباشر بطوارئ المترو، الطرق، أو الإسعاف
            </div>
          </div>
        </div>
        <div style={{ color: "var(--textSecondary)", fontSize: "0.9rem" }}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {isOpen && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--borderGlass)"
        }}>
          {emergencyContacts.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.number}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--bgPrimary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "10px",
                textDecoration: "none",
                color: "var(--textPrimary)",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ color: contact.color, fontSize: "1rem" }}>{contact.icon}</span>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--textSecondary)" }}>{contact.name}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: "800", color: contact.color }}>{contact.number}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
