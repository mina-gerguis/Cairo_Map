-- Create site_alerts table in Supabase
CREATE TABLE IF NOT EXISTS public.site_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
    show_type TEXT NOT NULL DEFAULT 'first_time' CHECK (show_type IN ('first_time', 'every_time')),
    target_page TEXT NOT NULL DEFAULT 'all',
    expiry_date TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_alerts ENABLE ROW LEVEL SECURITY;

-- 1. Allow anyone to view active and unexpired alerts
DROP POLICY IF EXISTS "Anyone can view active alerts" ON public.site_alerts;
CREATE POLICY "Anyone can view active alerts" ON public.site_alerts
    FOR SELECT USING (
        (is_active = true AND (expiry_date IS NULL OR expiry_date > now()))
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 2. Allow only admins to insert alerts
DROP POLICY IF EXISTS "Only admins can insert alerts" ON public.site_alerts;
CREATE POLICY "Only admins can insert alerts" ON public.site_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 3. Allow only admins to update alerts
DROP POLICY IF EXISTS "Only admins can update alerts" ON public.site_alerts;
CREATE POLICY "Only admins can update alerts" ON public.site_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. Allow only admins to delete alerts
DROP POLICY IF EXISTS "Only admins can delete alerts" ON public.site_alerts;
CREATE POLICY "Only admins can delete alerts" ON public.site_alerts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
