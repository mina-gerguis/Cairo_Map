-- ========================================================
-- Qareeb (Cairo Map) - Documentation & Changelog Schema
-- قم بنسخ هذا الكود وتشغيله في لوحة تحكم Supabase:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.site_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT,
    doc_type TEXT NOT NULL DEFAULT 'update' CHECK (doc_type IN ('update', 'feature', 'roadmap')),
    version TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_image TEXT DEFAULT '',
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

-- Indexes for fast public & admin queries
ALTER TABLE public.site_docs ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_site_docs_published_date
    ON public.site_docs (is_published, is_pinned DESC, release_date DESC, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_site_docs_type
    ON public.site_docs (doc_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_docs ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view published docs; admins can view all docs (including drafts)
DROP POLICY IF EXISTS "Anyone can view published docs" ON public.site_docs;
CREATE POLICY "Anyone can view published docs" ON public.site_docs
    FOR SELECT USING (
        is_published = true
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 2. Only admins can insert docs
DROP POLICY IF EXISTS "Only admins can insert docs" ON public.site_docs;
CREATE POLICY "Only admins can insert docs" ON public.site_docs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 3. Only admins can update docs
DROP POLICY IF EXISTS "Only admins can update docs" ON public.site_docs;
CREATE POLICY "Only admins can update docs" ON public.site_docs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. Only admins can delete docs
DROP POLICY IF EXISTS "Only admins can delete docs" ON public.site_docs;
CREATE POLICY "Only admins can delete docs" ON public.site_docs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

GRANT SELECT ON public.site_docs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_docs TO authenticated;
