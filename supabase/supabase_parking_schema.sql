-- ========================================================
-- Cairo Map - Parking Spots Database Schema
-- قم بنسخ هذا الكود بالكامل وتشغيله في لوحة تحكم Supabase
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ========================================================

-- 1. Create parking_spots table
CREATE TABLE IF NOT EXISTS public.parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    nearest_metro TEXT NOT NULL,
    hourly_rate INTEGER NOT NULL DEFAULT 0,
    max_daily_rate INTEGER,
    capacity INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    hours TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    map_location_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;

-- Security Policies
DROP POLICY IF EXISTS "Anyone can view parking_spots" ON public.parking_spots;
CREATE POLICY "Anyone can view parking_spots" ON public.parking_spots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage parking_spots" ON public.parking_spots;
CREATE POLICY "Admins can manage parking_spots" ON public.parking_spots FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Seed default parking spots
INSERT INTO public.parking_spots (name, area, address, nearest_metro, hourly_rate, max_daily_rate, capacity, type, hours, features) VALUES
('جراج التحرير المتعدد الطوابق', 'وسط البلد', 'ميدان التحرير - أمام المجمع خلف جامعة الدول', 'محطة السادات (تبادلي الخط 1 و 2) - 2 دقيقة مشياً', 15, 120, 1700, 'مغطى ومتعدد الطوابق 🏢', '24 ساعة طوال الأسبوع', '["كاميرات مراقبة", "أمن وحراسة", "مصاعد كهربائية", "اركن واركب بالمترو"]'),
('جراج روكسي الذكي الإلكتروني', 'مصر الجديدة', 'ميدان روكسي - مصر الجديدة', 'محطة الأهرام (الخط الثالث) - 5 دقائق مشياً', 20, 150, 900, 'جراج ذكي إلكتروني 🤖', '24 ساعة طوال الأسبوع', '["ركن إلكتروني أوتوماتيكي بالكامل", "أمان مرتفع", "غسيل سيارات متاح"]'),
('جراج العتبة والأوبرا', 'العتبة / وسط البلد', 'ميدان الأوبرا خلف جراج العتبة المكتظ', 'محطة العتبة (تبادلي الخط 2 و 3) - 3 دقائق', 12, 90, 1200, 'مغطى ومتعدد الطوابق 🏢', '24 ساعة طوال الأسبوع', '["قريب جداً من الأسواق التجارية", "كاميرات مراقبة"]'),
('جراج محطة عدلي منصور التبادلية (Park & Ride)', 'السلام / طريق الإسماعيلية', 'مجمع محطات عدلي منصور المركزي', 'محطة عدلي منصور (الخط الثالث و LRT)', 10, 60, 600, 'جراج سطحي مفتوح 🅿️', 'من 05:30 ص حتى 01:00 ص', '["خدمة اركن واركب (Park & Ride)", "خصم خاص لمشتركي القطار الكهربائي والمترو"]'),
('جراج محطة شبرا الخيمة', 'شبرا الخيمة', 'بجوار محطة المترو النهائية بالخط الثاني', 'محطة شبرا الخيمة (الخط الثاني)', 10, 50, 400, 'جراج سطحي مفتوح 🅿️', 'من 05:30 ص حتى 01:00 ص', '["مناسب للقادمين من القليوبية والسريع"]'),
('جراج سيتي ستارز مول', 'مدينة نصر', 'شارع عمر بن الخطاب - سيتي ستارز', 'محطة أرض المعارض / الاستاد (الخط الثالث)', 25, 200, 3000, 'مغطى ومتعدد الطوابق 🏢', '24 ساعة طوال الأسبوع', '["شحن سيارات كهربائية", "أمن VIP", "غسيل سيارات"]')
ON CONFLICT DO NOTHING;
