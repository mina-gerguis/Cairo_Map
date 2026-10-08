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
    // ── Egypt & General Terms (عربي وإنجليزي) ──
    "مصر", "دليل مصر", "سياحة مصر", "خريطة مصر", "خريطة القاهرة", "ماب القاهرة", "معالم مصر", "معالم القاهرة", "أماكن سياحية في مصر", "ازاي اروح", "دليل مواصلات مصر", "مترو القاهرة", "قطارات مصر", "مونوريل القاهرة", "القطار الكهربائي الخفيف", "الأتوبيس الترددي", "دليل الأماكن والخدمات", "مطاعم مصر", "كافيهات القاهرة",
    "Egypt", "Cairo", "Cairo Map", "Egypt Map", "Visit Egypt", "Egypt Tourism", "Egypt Travel Guide", "Cairo Travel Guide", "Egypt Landmarks", "Cairo Landmarks", "Egypt Attractions", "Things to do in Cairo", "Cairo Metro", "Egypt Railways", "Cairo Public Transport", "Cairo Restaurants", "Cairo Cafes", "Egypt Places Directory",

    // ── Cairo & Giza Landmarks (معالم القاهرة والجيزة) ──
    "أهرامات الجيزة", "أبو الهول", "هرم خوفو", "هرم خفرع", "هرم منقرع", "Giza Pyramids", "The Great Sphinx", "Pyramids of Giza", "Khufu Pyramid",
    "المتحف المصري الكبير", "Grand Egyptian Museum", "GEM Egypt",
    "المتحف القومي للحضارة المصرية", "National Museum of Egyptian Civilization", "NMEC",
    "المتحف المصري بالتحرير", "The Egyptian Museum Tahrir", "Tahrir Square", "ميدان التحرير",
    "برج القاهرة", "Cairo Tower", "Zamalek", "الزمالك",
    "قلعة صلاح الدين الأيوبي", "Cairo Citadel", "Citadel of Saladin", "مسجد محمد علي", "Mosque of Muhammad Ali",
    "خان الخليلي", "Khan el-Khalili", "شارع المعز", "Al-Muizz Street", "حي الحسين", "Al-Hussein Mosque", "جامع الأزهر", "Al-Azhar Mosque",
    "حديقة الأزهر", "Al-Azhar Park",
    "مجمع الأديان", "الكنيسة المعلقة", "Coptic Cairo", "Hanging Church", "مصر القديمة", "Old Cairo",
    "قصر عابدين", "Abdeen Palace", "قصر البارون", "Baron Empain Palace", "مصر الجديدة", "Heliopolis",
    "ممشى أهل مصر", "Mamsha Ahl Misr", "كورنيش النيل", "Nile Corniche",
    "العاصمة الإدارية الجديدة", "New Administrative Capital", "البرج الأيقوني", "Iconic Tower", "النهر الأخضر", "Green River",
    "التجمع الخامس", "New Cairo", "مدينة نصر", "Nasr City", "المعادي", "Maadi", "مدينة 6 أكتوبر", "6th of October", "الشيخ زايد", "Sheikh Zayed",

    // ── Alexandria & North Coast (الإسكندرية والساحل الشمالي) ──
    "الإسكندرية", "Alexandria", "قلعة قايتباي", "Citadel of Qaitbay", "مكتبة الإسكندرية", "Bibliotheca Alexandrina", "قصر المنتزه", "Montaza Palace", "كوبري ستانلي", "Stanley Bridge", "الساحل الشمالي", "North Coast Egypt", "مدينة العلمين الجديدة", "New Alamein",

    // ── Upper Egypt / Luxor & Aswan (الأقصر وأسوان والصعيد) ──
    "الأقصر", "Luxor", "معبد الكرنك", "Karnak Temple", "معبد الأقصر", "Luxor Temple", "وادي الملوك", "Valley of the Kings", "معبد حتشبسوت", "Hatshepsut Temple",
    "أسوان", "Aswan", "معبد أبو سمبل", "Abu Simbel Temples", "معبد فيلة", "Philae Temple", "السد العالي", "Aswan High Dam", "جزيرة النباتات", "Elephantine Island", "النوبة", "Nubian Village",

    // ── Red Sea & Sinai (البحر الأحمر وسيناء والمحميات) ──
    "شرم الشيخ", "Sharm El Sheikh", "رأس محمد", "Ras Mohamed", "خليج نعمة", "Naama Bay",
    "الغردقة", "Hurghada", "الجونة", "El Gouna", "سهل حشيش", "Sahl Hasheesh", "مكادي باي", "Makadi Bay",
    "دهب", "Dahab", "الثقب الأزرق", "Blue Hole Dahab", "نويبع", "Nuweiba", "طابا", "Taba",
    "مرسى علم", "Marsa Alam", "شاطئ النيزك", "Nayzak Beach", "مرسى مطروح", "Marsa Matruh", "عجيبة", "Ageeba Beach",
    "واحة سيوة", "Siwa Oasis", "بحر الرمال الأعظم", "Great Sand Sea", "عين السخنة", "Ain Sokhna"
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
  verification: {
    google: "9R9Wjnu7iPmzSLWqsZyBs24_mmcGTRfprEE7hzxvNDk",
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
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="9R9Wjnu7iPmzSLWqsZyBs24_mmcGTRfprEE7hzxvNDk"
        />
        {/* Monetag Verification */}
        <meta name="monetag" content="15496dd2536b0b446474e82ce63e72c1" />
        {/* Global JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        {/* Monetag Script */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="292659"
          data-cfasync="false"
          async
          strategy="afterInteractive"
        />
        {/* Google AdSense Main Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7465662881430123"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Service Worker Registration */}
        <Script id="sw-registration" strategy="lazyOnload">
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
