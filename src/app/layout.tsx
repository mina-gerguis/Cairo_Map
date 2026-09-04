import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import Script from "next/script";
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
  title: "ماب القاهرة - دليل الأماكن والخدمات الذكي",
  description: "دليلك الشامل لأرقام وعناوين ومواقع المطاعم والكافيهات والصيدليات والمستشفيات والحدائق — © RepoDex، إحدى شركات جورجيوس القابضة.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ماب القاهرة",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={almarai.variable}>
      <head>
        {/* Google AdSense Main Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7465662881430123"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Service Worker Registration */}
        <Script id="sw-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('PWA ServiceWorker registered with scope: ', registration.scope); },
                  function(err) { console.log('PWA ServiceWorker registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
      </head>
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
