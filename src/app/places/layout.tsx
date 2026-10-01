import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دليل الأماكن والخدمات والمعالم السياحية في مصر 2026",
  description: "دليلك الشامل لجميع الأماكن، المعالم السياحية، المطاعم، الكافيهات، المستشفيات والأنشطة في القاهرة، الجيزة، الإسكندرية، وكافة محافظات مصر.",
  keywords: [
    "معالم مصر", "أماكن سياحية في مصر", "دليل أماكن مصر", "مطاعم القاهرة", "كافيهات التجمع", "أهرامات الجيزة", "المتحف المصري الكبير", "برج القاهرة", "قلعة صلاح الدين", "خان الخليلي", "شارع المعز", "ممشى أهل مصر", "قصر البارون", "قصر عابدين", "متحف الحضارة",
    "Egypt Landmarks", "Cairo Places", "Tourist Attractions in Egypt", "Giza Pyramids", "Grand Egyptian Museum", "Cairo Tower", "Cairo Citadel", "Khan el-Khalili", "Al-Muizz Street", "Egypt Places Directory"
  ],
  alternates: {
    canonical: "https://cairomap.vercel.app/places",
  },
  openGraph: {
    title: "دليل الأماكن والخدمات والمعالم السياحية | ماب القاهرة",
    description: "ابحث في آلاف الأماكن والخدمات والمعالم السياحية الموثقة مع أرقام الهواتف واللوكيشن ومواعيد العمل.",
    url: "https://cairomap.vercel.app/places",
  },
};

export default function PlacesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
