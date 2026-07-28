"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
