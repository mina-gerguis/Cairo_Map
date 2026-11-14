import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SiteDoc } from "@/types/doc";
import SingleDocClient from "./SingleDocClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getDocData(slugParam: string): Promise<{
  doc: SiteDoc | null;
  allDocs: SiteDoc[];
  prevDoc: SiteDoc | null;
  nextDoc: SiteDoc | null;
}> {
  const decodedSlug = decodeURIComponent(slugParam);
  let doc: SiteDoc | null = null;
  let allDocs: SiteDoc[] = [];
  let prevDoc: SiteDoc | null = null;
  let nextDoc: SiteDoc | null = null;

  if (supabase) {
    try {
      // 1. Fetch all published docs for navigation
      const { data: allData } = await supabase
        .from("site_docs")
        .select("*")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("release_date", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (allData) {
        allDocs = allData as SiteDoc[];
      }

      // 2. Find targeted doc by slug first, then by id
      doc = allDocs.find((d) => d.slug === decodedSlug) || null;

      if (!doc) {
        doc = allDocs.find((d) => d.id === decodedSlug) || null;
      }

      // If still not found, try direct single query
      if (!doc) {
        const { data: singleBySlug } = await supabase
          .from("site_docs")
          .select("*")
          .eq("slug", decodedSlug)
          .eq("is_published", true)
          .maybeSingle();

        if (singleBySlug) {
          doc = singleBySlug as SiteDoc;
        } else if (
          decodedSlug.match(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
          )
        ) {
          const { data: singleById } = await supabase
            .from("site_docs")
            .select("*")
            .eq("id", decodedSlug)
            .eq("is_published", true)
            .maybeSingle();
          if (singleById) {
            doc = singleById as SiteDoc;
          }
        }
      }

      // 3. Find previous and next doc in allDocs list
      if (doc && allDocs.length > 0) {
        const currentIndex = allDocs.findIndex((d) => d.id === doc?.id);
        if (currentIndex > 0) {
          prevDoc = allDocs[currentIndex - 1];
        }
        if (currentIndex >= 0 && currentIndex < allDocs.length - 1) {
          nextDoc = allDocs[currentIndex + 1];
        }
      }
    } catch (err) {
      console.error("Error fetching single doc:", err);
    }
  }

  return { doc, allDocs, prevDoc, nextDoc };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { doc } = await getDocData(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qareebmap.vercel.app";

  if (!doc) {
    return {
      title: "التوثيق غير موجود | قريب",
      description: "عذراً، لم يتم العثور على التوثيق المطلوب.",
    };
  }

  const title = `${doc.title} | توثيق قريب`;
  const description =
    doc.summary ||
    "تعرف على تفاصيل ومميزات هذا التحديث ضمن سجل التوثيق الرسمي لمنصة قريب.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/doc/${encodeURIComponent(doc.slug || doc.id)}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/doc/${encodeURIComponent(doc.slug || doc.id)}`,
      siteName: "قريب",
      locale: "ar_EG",
      type: "article",
      images: doc.cover_image ? [{ url: doc.cover_image }] : undefined,
    },
  };
}

export default async function SingleDocPage({ params }: PageProps) {
  const { slug } = await params;
  const { doc, allDocs, prevDoc, nextDoc } = await getDocData(slug);

  if (!doc) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "var(--font-body)",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          عذراً، هذا التوثيق غير موجود
        </h1>
        <p style={{ color: "#a1a1aa", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          قد يكون التحديث قد تم نقله أو حذفه، أو أن الرابط غير صحيح.
        </p>
        <Link
          href="/doc"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.65rem",
            backgroundColor: "var(--color-primary, #2727ff)",
            color: "#ffffff",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          <span>العودة إلى سجل التوثيق</span>
        </Link>
      </div>
    );
  }

  return (
    <SingleDocClient
      doc={doc}
      allDocs={allDocs}
      prevDoc={prevDoc}
      nextDoc={nextDoc}
    />
  );
}
