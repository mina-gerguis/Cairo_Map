-- SQL Script: Database Migrations for Cairo Map Services New Features
-- Run this script in Supabase SQL Editor

-- 1. Add new columns to public.service_workers
ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS is_emergency_available BOOLEAN DEFAULT false;
ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8);
ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8);

-- 2. Add scheduling columns to public.service_requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS scheduled_date TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS scheduled_time TEXT;

-- 3. Create open_job_board table for client open tasks
CREATE TABLE IF NOT EXISTS public.open_job_board (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    budget NUMERIC(10,2) DEFAULT 0.00,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.open_job_board ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for open_job_board" ON public.open_job_board;
CREATE POLICY "Allow public read for open_job_board" ON public.open_job_board
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated client insert for open_job_board" ON public.open_job_board;
CREATE POLICY "Allow authenticated client insert for open_job_board" ON public.open_job_board
    FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Allow client update for open_job_board" ON public.open_job_board;
CREATE POLICY "Allow client update for open_job_board" ON public.open_job_board
    FOR ALL USING (auth.uid() = client_id);

-- 4. Create before_after_portfolio table
CREATE TABLE IF NOT EXISTS public.before_after_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.before_after_portfolio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for before_after_portfolio" ON public.before_after_portfolio;
CREATE POLICY "Allow public read for before_after_portfolio" ON public.before_after_portfolio
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner write for before_after_portfolio" ON public.before_after_portfolio;
CREATE POLICY "Allow owner write for before_after_portfolio" ON public.before_after_portfolio
    FOR ALL USING (auth.uid() = worker_id);

-- 5. Create service_price_estimates table
CREATE TABLE IF NOT EXISTS public.service_price_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    min_price NUMERIC(10,2) NOT NULL,
    max_price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'للكشف أو الخدمة',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.service_price_estimates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for service_price_estimates" ON public.service_price_estimates;
CREATE POLICY "Allow public read for service_price_estimates" ON public.service_price_estimates
    FOR SELECT USING (true);

-- Seed standard market price estimates in Egypt
INSERT INTO public.service_price_estimates (specialty, service_name, min_price, max_price, unit)
VALUES 
    ('سباك', 'كشف وإصلاح التسريب البسيط', 100.00, 200.00, 'للزيارة والكشف'),
    ('سباك', 'تركيب خلاط مياه جديد', 150.00, 250.00, 'للقطعة'),
    ('سباك', 'تركيب أو صيانة سخان مياه', 200.00, 350.00, 'للكشف والتركيب'),
    ('كهربائي', 'كشف وحل ماس كهربائي أو قفلة', 120.00, 250.00, 'للزيارة والكشف'),
    ('كهربائي', 'تركيب مفاتيح أو فيش كهرباء جديدة', 100.00, 200.00, 'لكل 3 مفاتيح'),
    ('كهربائي', 'تركيب نجفة أو كشاف إضاءة', 150.00, 300.00, 'للقطعة'),
    ('فني تكييف', 'صيانة وتنظيف تكييف سبليت', 250.00, 400.00, 'للجهاز'),
    ('فني تكييف', 'شحن فريون تكييف', 400.00, 700.00, 'للجهاز'),
    ('فني تكييف', 'فك وتركيب تكييف متكامل', 600.00, 1000.00, 'شامل الفك والتركيب'),
    ('نجار', 'تصليح باب أو كوالين', 100.00, 200.00, 'للباب'),
    ('نجار', 'فيك وتركيب غرف نوم أو مطابخ', 500.00, 1200.00, 'للغرفة كاملة'),
    ('نقاش', 'دهان ومحارة غرفة واحدة (مصنعية)', 600.00, 1500.00, 'للغرفة'),
    ('فني دش', 'ضبط وإشارة الطبق والريسفير', 100.00, 180.00, 'للزيارة والضبط')
ON CONFLICT DO NOTHING;
