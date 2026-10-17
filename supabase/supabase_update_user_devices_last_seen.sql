-- إضافة عمود last_seen_at لجدول user_devices لتتبع نشاط الجلسات الفعلي
-- يرجى تشغيل هذا الاستعلام في لوحة تحكم Supabase (SQL Editor) لتفعيل الميزة بشكل كامل

ALTER TABLE public.user_devices 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
