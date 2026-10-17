-- SQL schema to create tables for Egyptian Railways (ENR) in Supabase

-- 1. Railway Routes Table
CREATE TABLE IF NOT EXISTS public.railway_routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    duration TEXT NOT NULL,
    tips TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.railway_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view railway_routes" ON public.railway_routes FOR SELECT USING (true);
CREATE POLICY "Admins can manage railway_routes" ON public.railway_routes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 2. Railway Stations Table
CREATE TABLE IF NOT EXISTS public.railway_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id TEXT NOT NULL REFERENCES public.railway_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    station_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'تشغيل فعلي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.railway_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view railway_stations" ON public.railway_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage railway_stations" ON public.railway_stations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Seed default routes
INSERT INTO public.railway_routes (id, name, from_location, to_location, duration, tips) VALUES
('cairo-alex', 'القاهرة ⇆ الإسكندرية (خط بحري)', 'القاهرة (محطة رمسيس)', 'الإسكندرية (محطة سيدي جابر / مصر)', 'ساعتين إلى 3 ساعات ونصف (حسب نوع القطار)', 'قطارات تالجو هي الخيار الأفضل والأسرع على هذا الخط. يفضل الحجز قبل موعد الرحلة بـ 24 ساعة على الأقل.'),
('cairo-aswan', 'القاهرة ⇆ أسوان (خط قبلي الصعيد)', 'القاهرة (محطة رمسيس / الجيزة)', 'أسوان', '10 إلى 13 ساعة', 'لرحلات النوم، يفضل الحجز قبل السفر بأسبوع على الأقل نظراً للإقبال الشديد خصوصاً في مواسم الشتاء والسياحة.'),
('cairo-portsaid', 'القاهرة ⇆ بورسعيد (خط القناة)', 'القاهرة (محطة رمسيس)', 'بورسعيد', '3 إلى 4 ساعات', 'الرحلة تمر بمدن القناة وتوفر مناظر جميلة ومحطات ممتعة على طول قناة السويس.'),
('cairo-mansoura', 'القاهرة ⇆ المنصورة (خط الدلتا)', 'القاهرة (محطة رمسيس)', 'المنصورة', 'ساعتين إلى ساعتين ونصف', 'العديد من طلاب الجامعات يستخدمون هذا الخط يومياً، لذا ينصح بتجنب أوقات الذروة الصباحية وبعد الظهر.')
ON CONFLICT (id) DO NOTHING;

-- Seed default stations for cairo-alex
INSERT INTO public.railway_stations (route_id, name, station_order) VALUES
('cairo-alex', 'القاهرة (رمسيس)', 1),
('cairo-alex', 'بنها', 2),
('cairo-alex', 'طنطا', 3),
('cairo-alex', 'دمنهور', 4),
('cairo-alex', 'سيدي جابر', 5),
('cairo-alex', 'الإسكندرية', 6)
ON CONFLICT DO NOTHING;

-- Seed default stations for cairo-aswan
INSERT INTO public.railway_stations (route_id, name, station_order) VALUES
('cairo-aswan', 'القاهرة (رمسيس)', 1),
('cairo-aswan', 'الجيزة', 2),
('cairo-aswan', 'بني سويف', 3),
('cairo-aswan', 'المنيا', 4),
('cairo-aswan', 'أسيوط', 5),
('cairo-aswan', 'سوهاج', 6),
('cairo-aswan', 'قنا', 7),
('cairo-aswan', 'الأقصر', 8),
('cairo-aswan', 'إدفو', 9),
('cairo-aswan', 'كوم أمبو', 10),
('cairo-aswan', 'أسوان', 11)
ON CONFLICT DO NOTHING;

-- Seed default stations for cairo-portsaid
INSERT INTO public.railway_stations (route_id, name, station_order) VALUES
('cairo-portsaid', 'القاهرة (رمسيس)', 1),
('cairo-portsaid', 'بنها', 2),
('cairo-portsaid', 'الزقازيق', 3),
('cairo-portsaid', 'الإسماعيلية', 4),
('cairo-portsaid', 'القنطرة غرب', 5),
('cairo-portsaid', 'بورسعيد', 6)
ON CONFLICT DO NOTHING;

-- Seed default stations for cairo-mansoura
INSERT INTO public.railway_stations (route_id, name, station_order) VALUES
('cairo-mansoura', 'القاهرة (رمسيس)', 1),
('cairo-mansoura', 'بنها', 2),
('cairo-mansoura', 'قويسنا', 3),
('cairo-mansoura', 'بركة السبع', 4),
('cairo-mansoura', 'طنطا', 5),
('cairo-mansoura', 'المحلة الكبرى', 6),
('cairo-mansoura', 'سمنود', 7),
('cairo-mansoura', 'طلخا', 8),
('cairo-mansoura', 'المنصورة', 9)
ON CONFLICT DO NOTHING;
