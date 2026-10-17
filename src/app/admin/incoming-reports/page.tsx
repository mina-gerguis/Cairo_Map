"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IncomingReportsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/reports");
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--border-glass)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px",
        }}
      />
      <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "8px" }}>
        جاري تحويلك إلى صفحة البلاغات...
      </h2>
      <p style={{ fontSize: "0.9rem" }}>
        إذا لم يتم التحويل تلقائياً،{" "}
        <Link href="/admin/reports" style={{ color: "var(--color-secondary)", fontWeight: "700" }}>
          اضغط هنا
        </Link>
      </p>
    </div>
  );
}
