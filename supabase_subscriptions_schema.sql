-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY, -- 'free', 'silver', 'gold'
    name TEXT NOT NULL,
    price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create Policies for subscription_plans
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify subscription plans" ON public.subscription_plans;
CREATE POLICY "Only admins can modify subscription plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Seed subscription plans
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, features)
VALUES 
    ('free', 'الباقة المجانية', 0.00, 0.00, ARRAY['تصفح خطوط المترو الأساسية', 'البحث عن محطات المترو', 'عرض جداول المواعيد والمحطات التبادلية']),
    ('silver', 'الباقة الفضية', 40.00, 450.00, ARRAY['تصفح خطوط المترو الأساسية', 'البحث عن محطات المترو', 'عرض جداول المواعيد والمحطات التبادلية', 'خريطة المونوريل التفاعلية الكاملة']),
    ('gold', 'الباقة الذهبية', 60.00, 700.00, ARRAY['تصفح خطوط المترو الأساسية', 'البحث عن محطات المترو', 'عرض جداول المواعيد والمحطات التبادلية', 'خريطة المونوريل التفاعلية الكاملة', 'محرك البحث المتقدم "ازاي اروح" لخطوط المواصلات'])
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    price_monthly = EXCLUDED.price_monthly, 
    price_yearly = EXCLUDED.price_yearly, 
    features = EXCLUDED.features;

-- 2. Add subscription columns to public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' REFERENCES public.subscription_plans(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_period TEXT CHECK (subscription_period IN ('monthly', 'yearly')) DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'expired', 'cancelled')) DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Modify security trigger on profiles to prevent unauthorized subscription editing
CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من حدوث تغيير في الحقول الحساسة (النقاط، الأرصدة، أو بيانات الاشتراك)
  IF (
    OLD.points IS DISTINCT FROM NEW.points OR
    OLD.balance IS DISTINCT FROM NEW.balance OR
    OLD.promo_balance IS DISTINCT FROM NEW.promo_balance OR
    OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier OR
    OLD.subscription_period IS DISTINCT FROM NEW.subscription_period OR
    OLD.subscription_status IS DISTINCT FROM NEW.subscription_status OR
    OLD.subscription_start IS DISTINCT FROM NEW.subscription_start OR
    OLD.subscription_end IS DISTINCT FROM NEW.subscription_end
  ) THEN
    -- التحقق مما إذا كان المستخدم المسؤول الحالي آدمن
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'غير مسموح لك بتعديل الرصيد أو تفاصيل الاشتراك مباشرة.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create secure function to allow users to subscribe using their wallet balance
CREATE OR REPLACE FUNCTION public.subscribe_to_plan(p_plan_id TEXT, p_period TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC(10,2);
  v_price NUMERIC(10,2);
  v_plan_name TEXT;
  v_duration_interval INTERVAL;
  v_new_end_date TIMESTAMP WITH TIME ZONE;
  v_tx_id UUID;
BEGIN
  -- جلب معرف المستخدم الحالي
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً.');
  END IF;

  -- التعامل مع الباقة المجانية بشكل خاص (إلغاء الاشتراك المدفوع أو الرجوع للمجاني)
  IF p_plan_id = 'free' THEN
    UPDATE public.profiles
    SET 
      subscription_tier = 'free',
      subscription_period = NULL,
      subscription_status = 'active',
      subscription_start = now(),
      subscription_end = NULL
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'تم التحويل للباقة المجانية بنجاح.', 'new_tier', 'free');
  END IF;

  -- التحقق من صلاحية فترة الاشتراك
  IF p_period NOT IN ('monthly', 'yearly') THEN
    RETURN jsonb_build_object('success', false, 'message', 'فترة الاشتراك غير صالحة (شهري أو سنوي فقط).');
  END IF;

  -- جلب سعر الباقة والمدة بناءً على فترة الاشتراك
  SELECT name, 
         CASE WHEN p_period = 'monthly' THEN price_monthly ELSE price_yearly END,
         CASE WHEN p_period = 'monthly' THEN INTERVAL '1 month' ELSE INTERVAL '1 year' END
  INTO v_plan_name, v_price, v_duration_interval
  FROM public.subscription_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'الباقة المطلوبة غير موجودة.');
  END IF;

  -- جلب الرصيد الحالي للمستخدم
  SELECT balance INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'لم يتم العثور على ملف المستخدم الشخصي.');
  END IF;

  -- التحقق من كفاية الرصيد
  IF v_current_balance < v_price THEN
    RETURN jsonb_build_object('success', false, 'message', 'رصيد محفظتك غير كافٍ للاشتراك (سعر الباقة: ' || v_price || ' ج.م، رصيدك الحالي: ' || v_current_balance || ' ج.م).');
  END IF;

  -- حساب تاريخ انتهاء الاشتراك الجديد
  v_new_end_date := now() + v_duration_interval;

  -- تسجيل العملية في جدول المعاملات المالي كعملية سحب ناجحة ومباشرة
  -- ملاحظة: المطلق (Trigger) على جدول المعاملات سيقوم بخصم المبلغ تلقائياً من رصيد المستخدم
  INSERT INTO public.balance_transactions (
      user_id,
      type,
      amount,
      method,
      provider_number,
      recipient_name,
      transaction_id,
      status,
      admin_notes
  ) VALUES (
      v_user_id,
      'withdrawal',
      v_price,
      'wallet',
      'system_wallet',
      'Cairo Map Subscription Service',
      'SUB_' || to_char(now(), 'YYYYMMDDHH24MISS'),
      'approved',
      'اشتراك تلقائي في الباقة: ' || v_plan_name || ' (' || CASE WHEN p_period = 'monthly' THEN 'شهري' ELSE 'سنوي' END || ')'
  ) RETURNING id INTO v_tx_id;

  -- تحديث بيانات باقة المستخدم في الجدول الشخصي
  -- نلتف حول المطلق check_profile_updates لأنه لا يمنع التحديث عندما يُنفذ عبر RPC ذو صلاحيات PostgreSQL Security Definer
  UPDATE public.profiles
  SET 
    subscription_tier = p_plan_id,
    subscription_period = p_period,
    subscription_status = 'active',
    subscription_start = now(),
    subscription_end = v_new_end_date
  WHERE id = v_user_id;

  -- إرسال إشعار للمستخدم
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    link
  ) VALUES (
    v_user_id,
    '🎉 تم تفعيل اشتراكك بنجاح',
    'مبروك! تم تفعيل اشتراكك في ' || v_plan_name || ' (' || CASE WHEN p_period = 'monthly' THEN 'شهرياً' ELSE 'سنوياً' END || ') بنجاح حتى تاريخ ' || to_char(v_new_end_date, 'YYYY-MM-DD') || '.',
    'success',
    '/profile'
  );

  -- جلب الرصيد الجديد بعد تحديث المطلق
  SELECT balance INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'تم الاشتراك وتفعيل الباقة بنجاح!', 
    'new_tier', p_plan_id,
    'new_balance', v_current_balance,
    'subscription_end', to_char(v_new_end_date, 'YYYY-MM-DD')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء معالجة الاشتراك: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Create secure function to allow admins to update any user's subscription
CREATE OR REPLACE FUNCTION public.admin_update_user_subscription(
    p_user_id UUID,
    p_tier TEXT,
    p_period TEXT,
    p_status TEXT,
    p_start TIMESTAMP WITH TIME ZONE,
    p_end TIMESTAMP WITH TIME ZONE
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

  -- تحديث بيانات باقة العضو بنجاح
  UPDATE public.profiles
  SET 
    subscription_tier = p_tier,
    subscription_period = p_period,
    subscription_status = p_status,
    subscription_start = p_start,
    subscription_end = p_end
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'تم تحديث اشتراك المستخدم بنجاح.');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء تحديث الاشتراك: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
