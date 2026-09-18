import React from "react";
import Link from "next/link";
import styles from "../directions.module.css";

export function AdminDirectionsUnauthorized() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <h2 style={{ marginTop: "16px", color: "#f8fafc" }}>غير مصرح بالدخول</h2>
      <p style={{ color: "#94a3b8" }}>عذراً، هذه الصفحة مخصصة لمديري النظام فقط.</p>
      <Link
        href="/"
        className={styles.primaryActionBtn}
        style={{ display: "inline-flex", marginTop: "20px", textDecoration: "none" }}
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
