import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { initialPlaces, Place, OLD_CATEGORY_TO_MAIN_MAP } from "@/data/places";
import { CATEGORY_LABELS } from "./constants";
import PlaceDetailsClient from "./PlaceDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlaceById(id: string): Promise<Place | null> {
  // Try Supabase first
  if (supabase) {
    try {
      const { data: dbPlace, error } = await supabase
        .from("places")
        .select("*, branches(*)")
        .eq("id", id)
        .single();

      if (!error && dbPlace) {
        const oldCat = dbPlace.category;
        let finalCategory = oldCat;
        let finalCategoryLabel =
          dbPlace.category_label || CATEGORY_LABELS[oldCat] || oldCat;
        let finalSubCategories = Array.isArray(dbPlace.sub_categories)
          ? [...dbPlace.sub_categories]
          : [];

        const mainCatKey = Object.keys(OLD_CATEGORY_TO_MAIN_MAP).find(
          (key) => key === oldCat
        );
        if (mainCatKey) {
          finalCategory = OLD_CATEGORY_TO_MAIN_MAP[mainCatKey];
          finalCategoryLabel = CATEGORY_LABELS[finalCategory] || finalCategory;
          if (!finalSubCategories.includes(oldCat)) {
            finalSubCategories.push(oldCat);
          }
        }

        return {
          id: dbPlace.id,
          name: dbPlace.name,
          name_en: dbPlace.name_en || "",
          category: finalCategory,
          categoryLabel: finalCategoryLabel,
          subCategories: finalSubCategories,
          place_type: dbPlace.place_type || null,
          place_type_icon: dbPlace.place_type_icon || null,
          governorate: dbPlace.governorate,
          city: dbPlace.city,
          shortDescription: dbPlace.short_description,
          fullAddress: dbPlace.full_address,
          phones: dbPlace.phones || [],
          googleMapsUrl: dbPlace.google_maps_url || "",
          images: dbPlace.images || [],
          menuImages: dbPlace.menu_images || [],
          workingHours: dbPlace.working_hours || "",
          rating: dbPlace.rating || 0,
          reviewsCount: dbPlace.reviews_count || 0,
          description: dbPlace.description || "",
          latitude: dbPlace.latitude || undefined,
          longitude: dbPlace.longitude || undefined,
          website_url: dbPlace.website_url,
          features: Array.isArray(dbPlace.features) ? dbPlace.features : [],
          services: Array.isArray(dbPlace.services) ? dbPlace.services : [],
          branches: dbPlace.branches || [],
        };
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback to static places array
  const found = initialPlaces.find((p) => p.id === id);
  return found || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.net";

  if (!place) {
    return {
      title: "المكان غير موجود | ماب القاهرة",
      description: "عذراً، لم يتم العثور على المكان المطلوب في دليل ماب القاهرة.",
    };
  }

  const categoryLabel = place.categoryLabel || CATEGORY_LABELS[place.category] || "خدمات وأماكن";
  const title = `${place.name} (${categoryLabel}) - العنوان، التليفون والمواعيد`;
  const locationText = [place.city, place.governorate].filter(Boolean).join("، ");
  const description =
    place.shortDescription ||
    place.description ||
    `تعرف على تفاصيل ${place.name} في ${locationText || "القاهرة"}. الأرقام، العناوين، مواعيد العمل، التقييمات، وطريقة الوصول عبر دليل ماب القاهرة.`;

  const coverImage =
    place.images && place.images.length > 0
      ? place.images[0]
      : `${siteUrl}/images/cairo-map-og.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/places/${id}`,
    },
    openGraph: {
      title: `${place.name} | ماب القاهرة`,
      description,
      url: `${siteUrl}/places/${id}`,
      siteName: "ماب القاهرة - Cairo Map",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: place.name,
        },
      ],
      locale: "ar_EG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${place.name} | ماب القاهرة`,
      description,
      images: [coverImage],
    },
  };
}

export default async function PlacePage({ params }: PageProps) {
  const { id } = await params;
  const place = await getPlaceById(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cairomap.net";

  // JSON-LD Schema
  const jsonLd = place
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Place",
            "@id": `${siteUrl}/places/${place.id}#place`,
            name: place.name,
            alternateName: place.name_en || undefined,
            description: place.shortDescription || place.description || undefined,
            image: place.images && place.images.length > 0 ? place.images : undefined,
            telephone: place.phones && place.phones.length > 0 ? place.phones[0] : undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: place.fullAddress || place.briefLocation || undefined,
              addressLocality: place.city || "القاهرة",
              addressRegion: place.governorate || "القاهرة",
              addressCountry: "EG",
            },
            ...(place.latitude && place.longitude
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: place.latitude,
                    longitude: place.longitude,
                  },
                }
              : {}),
            ...(place.rating && place.reviewsCount
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: place.rating,
                    reviewCount: place.reviewsCount,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
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
                name: "دليل الأماكن",
                item: `${siteUrl}/places`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: place.name,
                item: `${siteUrl}/places/${place.id}`,
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
      <PlaceDetailsClient id={id} />
    </>
  );
}
