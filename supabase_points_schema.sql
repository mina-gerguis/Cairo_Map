-- 1. إضافة أعمدة النقاط والأرصدة إلى جدول profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promo_balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL;

-- 2. إنشاء دالة التحقق لمنع تعديل هذه الحقول الحساسة بواسطة غير المسؤولين (is_admin = true)
CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من حدوث تغيير في الحقول الحساسة
  IF (
    OLD.points IS DISTINCT FROM NEW.points OR
    OLD.balance IS DISTINCT FROM NEW.balance OR
    OLD.promo_balance IS DISTINCT FROM NEW.promo_balance
  ) THEN
    -- التحقق مما إذا كان المستخدم المسؤول الحالي آدمن
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'غير مسموح لك بتعديل النقاط أو الرصيد.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ربط الدالة بجدول profiles كمُطلق (Trigger) يتم تشغيله قبل التحديث
DROP TRIGGER IF EXISTS ensure_profile_security ON public.profiles;
CREATE TRIGGER ensure_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_updates();
