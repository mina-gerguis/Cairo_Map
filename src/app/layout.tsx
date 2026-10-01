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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.vercel.app"),
  title: {
    default: "ماب القاهرة - دليل الأماكن، المواصلات والخدمات الذكي",
    template: "%s | ماب القاهرة",
  },
  description: "دليلك الشامل لخطوط المترو، السكة الحديد، المنوريل، الأتوبيس الترددي، وأرقام وعناوين ومواقع المطاعم والكافيهات والصيدليات والمستشفيات والحدائق في القاهرة والجيزة.",
  keywords: [
    "ماب القاهرة",
    "مترو القاهرة",
    "دليل مواصلات القاهرة",
    "ازاي اروح",
    "قطارات مصر",
    "مطاعم القاهرة",
    "كافيهات التجمع",
    "دليل الخدمات",
    "مونوريل القاهرة",
    "القطار الكهربائي",
  ],
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
  openGraph: {
    title: "ماب القاهرة - دليل الأماكن والمواصلات الذكي",
    description: "دليلك الشامل لخطوط المترو، السكة الحديد، المنوريل، وأرقام وعناوين الأماكن والخدمات في القاهرة الكبرى.",
    url: "https://cairomap.vercel.app",
    siteName: "ماب القاهرة",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "ماب القاهرة",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ماب القاهرة - دليل الأماكن والمواصلات الذكي",
    description: "دليلك الشامل للمواصلات والأماكن في القاهرة الكبرى.",
    images: ["/apple-touch-icon.png"],
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.vercel.app";

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ماب القاهرة",
      description: "دليل المواصلات والأماكن والخدمات الذكي في القاهرة الكبرى",
      inLanguage: "ar-EG",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/places?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ماب القاهرة - Cairo Map",
      url: siteUrl,
      logo: `${siteUrl}/apple-touch-icon.png`,
      sameAs: [],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={almarai.variable}>
      <head>
        {/* Global JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        {/* Google AdSense Main Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7465662881430123"
          crossOrigin="anonymous"
          strategy="lazyOnload"
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
