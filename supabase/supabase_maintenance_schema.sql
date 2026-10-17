-- =========================================================
-- Page Maintenance Schema for Cairo Map
-- =========================================================

CREATE TABLE IF NOT EXISTS public.page_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'الصفحة قيد الصيانة والتحديث',
    message TEXT NOT NULL DEFAULT 'نعمل حالياً على تطوير وتحديث هذه الصفحة لتقديم خدمة وتجربة أفضل. سنعود قريباً!',
    is_active BOOLEAN NOT NULL DEFAULT true,
    estimated_end TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.page_maintenance ENABLE ROW LEVEL SECURITY;

-- 1. Allow anyone (visitors and users) to view maintenance records
DROP POLICY IF EXISTS "Anyone can view maintenance records" ON public.page_maintenance;
CREATE POLICY "Anyone can view maintenance records" ON public.page_maintenance
    FOR SELECT USING (true);

-- 2. Allow only admins to insert maintenance records
DROP POLICY IF EXISTS "Only admins can insert maintenance records" ON public.page_maintenance;
CREATE POLICY "Only admins can insert maintenance records" ON public.page_maintenance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 3. Allow only admins to update maintenance records
DROP POLICY IF EXISTS "Only admins can update maintenance records" ON public.page_maintenance;
CREATE POLICY "Only admins can update maintenance records" ON public.page_maintenance
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. Allow only admins to delete maintenance records
DROP POLICY IF EXISTS "Only admins can delete maintenance records" ON public.page_maintenance;
CREATE POLICY "Only admins can delete maintenance records" ON public.page_maintenance
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
