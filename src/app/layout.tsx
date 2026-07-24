import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "دفتر - دليل الأماكن والخدمات الذكي",
  description: "دليلك الشامل لأرقام، عناوين، ومواقع المطاعم، الكافيهات، الصيدليات، المستشفيات والحدائق — تطوير STAGE KODE",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "دفتر",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main style={{ paddingTop: "72px" }}>
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
