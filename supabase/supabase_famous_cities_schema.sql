-- ========================================================
-- Cairo Map - Famous Cities & Tourist Landmarks Database Schema
-- قم بنسخ هذا الكود بالكامل وتشغيله في لوحة تحكم Supabase
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ========================================================

-- 1. Create famous_cities table
CREATE TABLE IF NOT EXISTS public.famous_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cover_image TEXT NOT NULL,
    population TEXT DEFAULT '',
    area TEXT DEFAULT '',
    density TEXT DEFAULT '',
    temperature TEXT DEFAULT '',
    overview TEXT DEFAULT '',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create city_landmarks table
CREATE TABLE IF NOT EXISTS public.city_landmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES public.famous_cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT DEFAULT 'معلم سياحي',
    is_popular BOOLEAN DEFAULT false,
    nearby_stations JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    activities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.famous_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_landmarks ENABLE ROW LEVEL SECURITY;

-- Security Policies for famous_cities
DROP POLICY IF EXISTS "Anyone can view famous_cities" ON public.famous_cities;
CREATE POLICY "Anyone can view famous_cities" ON public.famous_cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert famous_cities" ON public.famous_cities;
CREATE POLICY "Anyone can insert famous_cities" ON public.famous_cities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update famous_cities" ON public.famous_cities;
CREATE POLICY "Anyone can update famous_cities" ON public.famous_cities FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete famous_cities" ON public.famous_cities;
CREATE POLICY "Anyone can delete famous_cities" ON public.famous_cities FOR DELETE USING (true);

-- Security Policies for city_landmarks
DROP POLICY IF EXISTS "Anyone can view city_landmarks" ON public.city_landmarks;
CREATE POLICY "Anyone can view city_landmarks" ON public.city_landmarks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert city_landmarks" ON public.city_landmarks;
CREATE POLICY "Anyone can insert city_landmarks" ON public.city_landmarks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update city_landmarks" ON public.city_landmarks;
CREATE POLICY "Anyone can update city_landmarks" ON public.city_landmarks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete city_landmarks" ON public.city_landmarks;
CREATE POLICY "Anyone can delete city_landmarks" ON public.city_landmarks FOR DELETE USING (true);
