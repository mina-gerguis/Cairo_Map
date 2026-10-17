import React from "react";
import Link from "next/link";

export function AdminDirectionsUnauthorized() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <h2 style={{ marginTop: "16px", color: "var(--text-primary)" }}>غير مصرح بالدخول</h2>
      <p style={{ color: "var(--text-secondary)" }}>عذراً، هذه الصفحة مخصصة لمديري النظام فقط.</p>
      <Link
        href="/"
        className="btn btn-primary"
        style={{ display: "inline-flex", marginTop: "20px", textDecoration: "none" }}
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
