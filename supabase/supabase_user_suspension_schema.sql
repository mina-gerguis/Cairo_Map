-- =========================================================
-- SQL Migration Script: User Account Suspension System
-- يرجى تشغيل هذا الاستعلام في لوحة تحكم Supabase (SQL Editor) لتفعيل ميزة تعليق وإيقاف الحسابات
-- =========================================================

-- 1. إضافة أعمدة إيقاف وتعليق الحسابات في جدول profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS suspended_reason TEXT DEFAULT NULL;

-- 2. إنشاء فهرس لتسريع الاستعلام عن الحسابات الموقوفة
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);

-- 3. دالة آمنة للمسؤولين فقط لإيقاف الحساب أو فك الحظر، مع إلغاء تنشيط أجهزة المستخدم فوراً
CREATE OR REPLACE FUNCTION public.toggle_user_suspension(
  p_user_id UUID, 
  p_suspend BOOLEAN, 
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- التحقق من أن منفذ العملية مسؤول (Admin)
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, FALSE) THEN
    RAISE EXCEPTION 'غير مصرح لك بإجراء هذا العمل. يجب أن تكون مسؤولاً.';
  END IF;

  -- منع المسؤول من تعليق حسابه الخاص
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'لا يمكنك إيقاف أو تعليق حسابك الشخصي.';
  END IF;

  -- تحديث حالة الإيقاف في جدول profiles
  UPDATE public.profiles
  SET 
    is_suspended = p_suspend,
    suspended_at = CASE WHEN p_suspend THEN timezone('utc'::text, now()) ELSE NULL END,
    suspended_reason = CASE WHEN p_suspend THEN COALESCE(p_reason, 'تم إيقاف الحساب من قبل الإدارة') ELSE NULL END,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;

  -- في حالة الإيقاف: إلغاء تنشيط كافة جلسات الأجهزة للمستخدم فوراً لإجباره على تسجيل الخروج
  IF p_suspend THEN
    UPDATE public.user_devices
    SET 
      is_active = FALSE,
      logged_out_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id,
    'is_suspended', p_suspend,
    'message', CASE WHEN p_suspend THEN 'تم إيقاف الحساب بنجاح وتسجيل خروجه من كافة الأجهزة' ELSE 'تم إلغاء الإيقاف وإعادة تنشيط الحساب بنجاح' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
