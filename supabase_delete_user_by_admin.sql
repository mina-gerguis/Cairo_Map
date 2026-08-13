-- دالة آمنة تتيح للمسؤولين (Admins) فقط حذف حساب أي مستخدم بالكامل من جدول auth.users
-- يرجى تشغيل هذا الاستعلام في لوحة تحكم Supabase (SQL Editor) لتفعيل الميزة بشكل كامل

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- التحقق من أن منفذ العملية الحالي مسؤول (Admin)
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
  
  IF NOT COALESCE(v_is_admin, FALSE) THEN
    RAISE EXCEPTION 'غير مصرح لك بإجراء هذا العمل. يجب أن تكون مسؤولاً.';
  END IF;

  -- حذف المستخدم من جدول auth.users (والذي يؤدي بالتتابع Cascade لحذفه من profiles والمستندات المرتبطة به)
  DELETE FROM auth.users WHERE id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
