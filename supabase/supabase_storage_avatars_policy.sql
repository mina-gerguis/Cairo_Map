-- ==============================================================================
-- إعداد وتفعيل صلاحيات سلة تخزين الصور الشخصية (avatars Storage Bucket & RLS Policies)
-- ==============================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل Supabase Dashboard -> SQL Editor
-- لحل مشكلة: "new row violates row-level security policy" عند رفع صورة الحساب الجديد.
-- ==============================================================================

-- 1. إنشاء سلة التخزين 'avatars' إذا لم تكن موجودة وجعلها عامة (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 ميجابايت كحد أقصى للصورة
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. تفعيل نظام أمان الصفوف (RLS) على جدول storage.objects إن لم يكن مفعلاً
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. إزالة أي سياسات سابقة لتجنب أي تعارض (Conflict)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads to Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Updates to Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Deletes from Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Read Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- 4. سياسة القراءة (SELECT): السماح للجميع (عام) بمشاهدة وتحميل الصور
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. سياسة الإدخال والرفع (INSERT):
-- السماح برفع الصور داخل سلة avatars للجميع (يشمل الزوار الجدد أثناء التسجيل قبل تسجيل الدخول)
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- 6. سياسة التعديل (UPDATE):
-- السماح بتحديث أو استبدال الصورة للمستخدمين المسجلين أو العام
CREATE POLICY "Anyone can update avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');

-- 7. سياسة الحذف (DELETE):
-- السماح للمستخدمين المسجلين بحذف صورهم
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
