import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import BlogSlugClient, { BlogArticle, SAMPLE_POST } from "./BlogSlugClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogBySlug(slugParam: string): Promise<BlogArticle | null> {
  const decodedSlug = decodeURIComponent(slugParam);

  if (supabase) {
    try {
      let { data: blogData } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", decodedSlug)
        .maybeSingle();

      if (!blogData && decodedSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        const { data: byId } = await supabase
          .from("blogs")
          .select("*")
          .eq("id", decodedSlug)
          .maybeSingle();
        blogData = byId;
      }

      if (blogData) {
        return blogData as BlogArticle;
      }
    } catch {
      // Fallback
    }
  }

  if (decodedSlug === "cairo-transportation-guide" || decodedSlug === "sample-1") {
    return SAMPLE_POST;
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.net";

  if (!blog) {
    return {
      title: "المقال غير موجود | ماب القاهرة",
      description: "عذراً، لم يتم العثور على المقال المطلوب في مدونة ماب القاهرة.",
    };
  }

  const title = `${blog.title} | مدونة ماب القاهرة`;
  const description =
    blog.excerpt ||
    "اقرأ أحدث المقالات والإرشادات حول المواصلات وأماكن الخروج والخدمات في القاهرة الكبرى.";
  const coverImage = blog.cover_image || `${siteUrl}/images/cairo-map-og.png`;

  return {
    title,
    description,
    keywords: blog.tags || ["مواصلات", "القاهرة", "مترو", "دليل"],
    authors: [{ name: blog.author_name || "فريق ماب القاهرة" }],
    alternates: {
      canonical: `${siteUrl}/blog/${encodeURIComponent(blog.slug || slug)}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${encodeURIComponent(blog.slug || slug)}`,
      siteName: "ماب القاهرة - Cairo Map",
      type: "article",
      publishedTime: blog.created_at,
      authors: [blog.author_name || "فريق ماب القاهرة"],
      tags: blog.tags,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      locale: "ar_EG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
  };
}

export default async function SingleBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.net";

  // JSON-LD Schema
  const jsonLd = blog
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            "@id": `${siteUrl}/blog/${encodeURIComponent(blog.slug || slug)}#article`,
            headline: blog.title,
            description: blog.excerpt,
            image: blog.cover_image || `${siteUrl}/images/cairo-map-og.png`,
            datePublished: blog.created_at,
            dateModified: blog.created_at,
            author: {
              "@type": "Person",
              name: blog.author_name || "فريق ماب القاهرة",
            },
            publisher: {
              "@type": "Organization",
              name: "ماب القاهرة",
              url: siteUrl,
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/apple-touch-icon.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/blog/${encodeURIComponent(blog.slug || slug)}`,
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "الرئيسية",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "المدونة",
                item: `${siteUrl}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: blog.title,
                item: `${siteUrl}/blog/${encodeURIComponent(blog.slug || slug)}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogSlugClient slug={slug} />
    </>
  );
}
