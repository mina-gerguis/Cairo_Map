import { BlogArticle } from "@/types/blog";

export const SAVED_ARTICLES_CATEGORY = "🔖 المقالات المحفوظة";

export const BLOG_CATEGORIES: readonly string[] = [
  "الكل",
  SAVED_ARTICLES_CATEGORY,
  "مواصلات وترانزيت",
  "دليل القاهرة والجيزة",
  "أخبار وشواهد",
  "نصائح سفر ورحلات",
  "مطارات وموانئ",
  "مترو ومنوريل",
] as const;

export const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800";

export const getAuthorAvatar = (authorName?: string, authorAvatar?: string): string => {
  if (authorAvatar) return authorAvatar;
  const seed = encodeURIComponent(authorName || "Author");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
};

export const SAMPLE_ARTICLES: BlogArticle[] = [
  {
    id: "sample-1",
    title: "دليل المواصلات الشامل في القاهرة والجيزة: كيف تختار وسيلتك الأسرع والأوفر؟",
    slug: "cairo-transportation-guide",
    content: "محتوى المقال التفصيلي...",
    excerpt:
      "تعرف على أحدث الخطوط والأسعار في مترو الأنفاق والقطار الكهربائي LRT والمنوريل، واستكشف أفضل الخطوط اليومية لتجنب الزحام المروري.",
    cover_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
    category: "مواصلات وترانزيت",
    tags: ["مترو", "منوريل", "أتوبيس"],
    author_name: "فريق خريطة القاهرة",
    status: "published",
    views_count: 1420,
    likes_count: 98,
    comments_count: 14,
    reading_time: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "أفضل 10 أماكن للخروج والتنزه في القاهرة بعيداً عن صخب المدينة",
    slug: "top-10-places-cairo",
    content: "محتوى المقال...",
    excerpt:
      "استكشف حدائق ومقاهي ومتاحف هادئة توفر لك تجربة ممتعة مع العائلة أو الأصدقاء في أجمل مناطق القاهرة الكبرى.",
    cover_image: "https://images.unsplash.com/photo-1572252821143-035a7448c5c2?q=80&w=800",
    category: "دليل القاهرة والجيزة",
    tags: ["خروج", "حدائق", "أماكن"],
    author_name: "مينا جرجس",
    status: "published",
    views_count: 980,
    likes_count: 65,
    comments_count: 8,
    reading_time: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    title: "كيف تستخدم محطة القطار الكهربائي خفيف الوزن LRT بالكامل مع أسعار التذاكر",
    slug: "lrt-train-full-guide",
    content: "محتوى المقال...",
    excerpt:
      "كل ما تحتاج معرفته عن محطات القطار الكهربائي LRT من عدلي منصور حتى العاصمة الإدارية، أوقات العمل ورسوم التذاكر بالتفصيل.",
    cover_image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800",
    category: "مترو ومنوريل",
    tags: ["LRT", "العاصمة", "قطار"],
    author_name: "فريق خريطة القاهرة",
    status: "published",
    views_count: 2100,
    likes_count: 154,
    comments_count: 23,
    reading_time: 6,
    created_at: new Date().toISOString(),
  },
];
