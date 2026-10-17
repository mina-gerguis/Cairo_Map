-- سياسة تفعيل الحذف لجدول اقتراحات الأماكن place_proposals في Supabase
-- قم بنسخ هذا الكود وتشغيله في Supabase SQL Editor لتمكين الحذف الفعلي المباشر

-- 1. تمكين صلاحية الحذف لجدول اقتراحات الأماكن
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'place_proposals' AND policyname = 'Allow delete on place_proposals'
  ) THEN
    CREATE POLICY "Allow delete on place_proposals"
    ON public.place_proposals
    FOR DELETE
    USING (true);
  END IF;
END $$;

-- 2. حذف أي مقترحات مرفوضة أو معلّمة للحذف سابقاً
DELETE FROM public.place_proposals WHERE status IN ('deleted', 'rejected');
