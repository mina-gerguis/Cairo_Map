"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?expand=help");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
      <span style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ marginRight: "12px", fontFamily: "var(--font-body)" }}>جاري توجيهك لمركز المساعدة والدعم...</p>
    </div>
  );
}
