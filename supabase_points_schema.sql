-- 1. إضافة أعمدة النقاط والأرصدة إلى جدول profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promo_balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL;

-- 2. إنشاء دالة التحقق لمنع تعديل هذه الحقول الحساسة بواسطة غير المسؤولين (is_admin = true)
CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- السماح بالتحديثات التي تتم عبر دوال النظام الآمنة (مثل عمليات الشراء والتحويل)
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

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

-- 4. دالة آمنة لتحويل النقاط إلى رصيد من قبل المستخدم العادي (SECURITY DEFINER ليتخطى القيد)
CREATE OR REPLACE FUNCTION public.convert_user_points(points_to_convert INT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_points INT;
  v_current_balance NUMERIC(10,2);
  v_cash_value NUMERIC(10,2);
BEGIN
  -- جلب معرف المستخدم الحالي
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً.');
  END IF;

  -- جلب النقاط والرصيد الحالي
  SELECT points, balance INTO v_current_points, v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'لم يتم العثور على ملف المستخدم الشخصي.');
  END IF;

  -- التحقق من المدخلات (الحد الأدنى 1000 نقطة)
  IF points_to_convert < 1000 THEN
    RETURN jsonb_build_object('success', false, 'message', 'عفواً، الحد الأدنى لتحويل النقاط هو 1000 نقطة.');
  END IF;

  IF v_current_points < points_to_convert THEN
    RETURN jsonb_build_object('success', false, 'message', 'رصيد النقاط لديك غير كافٍ لإجراء هذه العملية.');
  END IF;

  -- حساب القيمة المادية: كل 100 نقطة = 1 جنيه مصري
  v_cash_value := ROUND((points_to_convert::numeric / 100.0), 2);

  -- تحديث الحقول بأمان
  UPDATE public.profiles
  SET 
    points = points - points_to_convert,
    balance = balance + v_cash_value
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'تم تحويل النقاط إلى رصيد بنجاح!', 
    'new_points', v_current_points - points_to_convert,
    'new_balance', v_current_balance + v_cash_value
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء معالجة العملية: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. دالة آمنة لتحويل الرصيد إلى نقاط من قبل المستخدم العادي (SECURITY DEFINER ليتخطى القيد)
CREATE OR REPLACE FUNCTION public.convert_user_balance(balance_to_convert NUMERIC)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_points INT;
  v_current_balance NUMERIC(10,2);
  v_points_value INT;
BEGIN
  -- جلب معرف المستخدم الحالي
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً.');
  END IF;

  -- جلب النقاط والرصيد الحالي
  SELECT points, balance INTO v_current_points, v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'لم يتم العثور على ملف المستخدم الشخصي.');
  END IF;

  -- التحقق من المدخلات (الحد الأدنى 10 جنيهات = 1000 نقطة)
  IF balance_to_convert < 10.00 THEN
    RETURN jsonb_build_object('success', false, 'message', 'عفواً، الحد الأدنى لتحويل الرصيد هو 10 جنيهات مصري.');
  END IF;

  IF v_current_balance < balance_to_convert THEN
    RETURN jsonb_build_object('success', false, 'message', 'رصيد المحفظة لديك غير كافٍ لإجراء هذه العملية.');
  END IF;

  -- حساب عدد النقاط: كل 1 جنيه = 100 نقطة
  v_points_value := FLOOR(balance_to_convert * 100);

  -- تحديث الحقول بأمان
  UPDATE public.profiles
  SET 
    points = points + v_points_value,
    balance = balance - balance_to_convert
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'تم تحويل الرصيد إلى نقاط بنجاح!', 
    'new_points', v_current_points + v_points_value,
    'new_balance', v_current_balance - balance_to_convert
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء معالجة العملية: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. دالة آمنة تتيح للمسؤولين فقط تعديل نقاط وأرصدة أي مستخدم مباشرة (تتخطى قيود RLS)
CREATE OR REPLACE FUNCTION public.admin_update_user_assets(
    p_user_id UUID,
    p_points INT,
    p_balance NUMERIC(10,2),
    p_promo_balance NUMERIC(10,2)
)
RETURNS JSONB AS $$
BEGIN
  -- التحقق من أن منفذ العملية مسؤول (Admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'غير مصرح لك بإجراء هذه العملية. يجب أن تكون مسؤولاً.');
  END IF;

  -- تحديث بيانات النقاط والأرصدة
  UPDATE public.profiles
  SET 
    points = p_points,
    balance = p_balance,
    promo_balance = p_promo_balance
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'تم تحديث النقاط والأرصدة بنجاح.');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء تحديث البيانات: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


