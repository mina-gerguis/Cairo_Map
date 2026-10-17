-- SQL schema to create tables for Cairo Metro in Supabase

-- 1. Metro Stations Table
CREATE TABLE IF NOT EXISTS public.metro_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    line_type TEXT NOT NULL CHECK (line_type IN ('line1', 'line2', 'line3', 'line3_branch_a', 'line3_branch_b', 'line4', 'line5', 'line6')),
    station_order INTEGER NOT NULL DEFAULT 0,
    landmarks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'تشغيل فعلي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.metro_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view metro_stations" ON public.metro_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage metro_stations" ON public.metro_stations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 2. Metro Ticket Prices Table
CREATE TABLE IF NOT EXISTS public.metro_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name TEXT NOT NULL,
    max_stations INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.metro_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view metro_prices" ON public.metro_prices FOR SELECT USING (true);
CREATE POLICY "Admins can manage metro_prices" ON public.metro_prices FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Seed default pricing tiers
INSERT INTO public.metro_prices (tier_name, max_stations, price) VALUES
('من 1 إلى 9 محطات', 9, 10),
('من 10 إلى 16 محطة', 16, 12),
('من 17 إلى 23 محطة', 23, 15),
('أكثر من 23 محطة', 999, 20)
ON CONFLICT DO NOTHING;

-- Seed default stations for Line 1
INSERT INTO public.metro_stations (name, line_type, station_order) VALUES
('حلوان', 'line1', 1), ('عين حلوان', 'line1', 2), ('جامعة حلوان', 'line1', 3), ('وادي حوف', 'line1', 4), ('حدائق حلوان', 'line1', 5),
('المعصرة', 'line1', 6), ('طرة الأسمنت', 'line1', 7), ('كوتسيكا', 'line1', 8), ('طرة البلد', 'line1', 9), ('ثكنات المعادي', 'line1', 10),
('المعادي', 'line1', 11), ('حدائق المعادي', 'line1', 12), ('دار السلام', 'line1', 13), ('الزهراء', 'line1', 14), ('مار جرجس', 'line1', 15),
('الملك الصالح', 'line1', 16), ('السيدة زينب', 'line1', 17), ('سعد زغلول', 'line1', 18), ('أنور السادات', 'line1', 19), ('جمال عبد الناصر', 'line1', 20),
('أحمد عرابي', 'line1', 21), ('الشهداء', 'line1', 22), ('غمرة', 'line1', 23), ('الدمرداش', 'line1', 24), ('منشية الصدر', 'line1', 25),
('كوبري القبة', 'line1', 26), ('حمامات القبة', 'line1', 27), ('سراي القبة', 'line1', 28), ('حدائق الزيتون', 'line1', 29), ('حلمية الزيتون', 'line1', 30),
('المطرية', 'line1', 31), ('عين شمس', 'line1', 32), ('عزبة النخل', 'line1', 33), ('المرج', 'line1', 34), ('المرج الجديدة', 'line1', 35)
ON CONFLICT DO NOTHING;

-- Seed default stations for Line 2
INSERT INTO public.metro_stations (name, line_type, station_order) VALUES
('شبرا الخيمة', 'line2', 1), ('كلية الزراعة', 'line2', 2), ('المظلات', 'line2', 3), ('الخلفاوي', 'line2', 4), ('سانت تريزا', 'line2', 5),
('روض الفرج', 'line2', 6), ('مسرة', 'line2', 7), ('الشهداء', 'line2', 8), ('العتبة', 'line2', 9), ('محمد نجيب', 'line2', 10),
('أنور السادات', 'line2', 11), ('الأوبرا', 'line2', 12), ('الدقي', 'line2', 13), ('البحوث', 'line2', 14), ('جامعة القاهرة', 'line2', 15),
('فيصل', 'line2', 16), ('الجيزة', 'line2', 17), ('أم المصريين', 'line2', 18), ('ساقية مكي', 'line2', 19), ('المنيب', 'line2', 20)
ON CONFLICT DO NOTHING;

-- Seed default stations for Line 3 (Trunk)
INSERT INTO public.metro_stations (name, line_type, station_order) VALUES
('عدلي منصور', 'line3', 1), ('الهايكستب', 'line3', 2), ('عمر بن الخطاب', 'line3', 3), ('قباء', 'line3', 4), ('هشام بركات', 'line3', 5),
('النزهة', 'line3', 6), ('نادي الشمس', 'line3', 7), ('ألف مسكن', 'line3', 8), ('ميدان هليوبوليس', 'line3', 9), ('هارون', 'line3', 10),
('الأهرام', 'line3', 11), ('كلية البنات', 'line3', 12), ('استاد القاهرة', 'line3', 13), ('المعرض', 'line3', 14), ('العباسية', 'line3', 15),
('عبده باشا', 'line3', 16), ('الجيش', 'line3', 17), ('باب الشعرية', 'line3', 18), ('العتبة', 'line3', 19), ('جمال عبد الناصر', 'line3', 20),
('ماسبيرو', 'line3', 21), ('صفاء حجازي', 'line3', 22), ('الكيت كات', 'line3', 23)
ON CONFLICT DO NOTHING;

-- Seed default stations for Line 3 (Branch A - Rod El Farag)
INSERT INTO public.metro_stations (name, line_type, station_order) VALUES
('السودان', 'line3_branch_a', 1), ('إمبابة', 'line3_branch_a', 2), ('البوهي', 'line3_branch_a', 3), ('القومية العربية', 'line3_branch_a', 4),
('الطريق الدائري', 'line3_branch_a', 5), ('محور روض الفرج', 'line3_branch_a', 6)
ON CONFLICT DO NOTHING;

-- Seed default stations for Line 3 (Branch B - Cairo University)
INSERT INTO public.metro_stations (name, line_type, station_order) VALUES
('التوفيقية', 'line3_branch_b', 1), ('وادي النيل', 'line3_branch_b', 2), ('جامعة الدول العربية', 'line3_branch_b', 3), ('بولاق الدكرور', 'line3_branch_b', 4),
('جامعة القاهرة', 'line3_branch_b', 5)
ON CONFLICT DO NOTHING;
