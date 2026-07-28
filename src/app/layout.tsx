import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
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
    <html lang="ar" dir="rtl" className={almarai.variable}>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
