import type { DocRoadmapStatus, DocType } from "@/types/doc";

export interface DocMetaBadge {
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export const DOC_TYPE_META: Record<DocType, DocMetaBadge> = {
  update: {
    label: "تاريخ التحديثات",
    shortLabel: "تحديث",
    description: "الإصدارات والتحسينات وإصلاحات الأداء المنشورة",
    icon: "bx bx-history",
    color: "var(--color-info)",
    bg: "rgba(0, 110, 255, 0.12)",
    border: "rgba(0, 110, 255, 0.28)",
  },
  feature: {
    label: "المميزات الجديدة",
    shortLabel: "ميزة جديدة",
    description: "الأدوات والقدرات الجديدة المضافة إلى منصة قريب",
    icon: "bx bx-bolt-circle",
    color: "var(--color-success)",
    bg: "rgba(0, 211, 123, 0.12)",
    border: "rgba(0, 211, 123, 0.28)",
  },
  roadmap: {
    label: "الخطط التي نعمل عليها",
    shortLabel: "خطة عمل",
    description: "المشاريع الجارية والميزات المخطط إطلاقها قريباً",
    icon: "bx bx-compass",
    color: "var(--color-secondary)",
    bg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.28)",
  },
};

export const ROADMAP_STATUS_META: Record<DocRoadmapStatus, DocMetaBadge> = {
  released: {
    label: "تم الإطلاق",
    shortLabel: "متاح الآن",
    description: "متوفر حالياً لجميع المستخدمين على المنصة",
    icon: "bx bx-check-circle",
    color: "var(--color-success)",
    bg: "rgba(0, 211, 123, 0.12)",
    border: "rgba(0, 211, 123, 0.28)",
  },
  testing: {
    label: "قيد التجربة",
    shortLabel: "تجريبي",
    description: "في مرحلة المراجعة والاختبار قبل التعميم",
    icon: "bx bx-test-tube",
    color: "var(--warningBtn)",
    bg: "rgba(255, 165, 0, 0.14)",
    border: "rgba(255, 165, 0, 0.30)",
  },
  in_progress: {
    label: "جاري العمل عليها",
    shortLabel: "قيد التطوير",
    description: "يعمل فريق قريب على تطويرها حالياً",
    icon: "bx bx-loader-circle",
    color: "var(--color-info)",
    bg: "rgba(0, 110, 255, 0.12)",
    border: "rgba(0, 110, 255, 0.28)",
  },
  planned: {
    label: "مخطط لها",
    shortLabel: "قريباً",
    description: "ضمن خطة التطوير القادمة للمنصة",
    icon: "bx bx-calendar-event",
    color: "var(--text-secondary)",
    bg: "rgba(161, 161, 170, 0.12)",
    border: "rgba(161, 161, 170, 0.26)",
  },
};

export const SUGGESTED_DOC_TAGS = [
  "الخرائط",
  "مترو الأنفاق",
  "المواصلات",
  "الذكاء الاصطناعي",
  "دليل الأماكن",
  "تحسين الأداء",
  "واجهة المستخدم",
  "الأمان والخصوصية",
];

export function formatDocDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

export function generateDocSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripHtmlToText(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const DOCS_SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS public.site_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT,
    doc_type TEXT NOT NULL DEFAULT 'update' CHECK (doc_type IN ('update', 'feature', 'roadmap')),
    version TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    highlights TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    roadmap_status TEXT NOT NULL DEFAULT 'released' CHECK (roadmap_status IN ('released', 'testing', 'in_progress', 'planned')),
    progress_percent INT NOT NULL DEFAULT 100 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    release_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    author_name TEXT DEFAULT 'فريق قريب',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published docs" ON public.site_docs;
CREATE POLICY "Anyone can view published docs" ON public.site_docs
    FOR SELECT USING (
        is_published = true
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

DROP POLICY IF EXISTS "Only admins can insert docs" ON public.site_docs;
CREATE POLICY "Only admins can insert docs" ON public.site_docs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

DROP POLICY IF EXISTS "Only admins can update docs" ON public.site_docs;
CREATE POLICY "Only admins can update docs" ON public.site_docs
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

DROP POLICY IF EXISTS "Only admins can delete docs" ON public.site_docs;
CREATE POLICY "Only admins can delete docs" ON public.site_docs
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

GRANT SELECT ON public.site_docs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_docs TO authenticated;`;
