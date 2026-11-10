-- ============================================================================
-- Promotional Balance System Schema, Security, Expiry & Payment Integration
-- ============================================================================
-- Covers:
-- 1. Complete separation from main cash wallet balance (`profiles.balance`)
-- 2. Non-withdrawable, non-transferable promotional balance (`profiles.promo_balance`)
-- 3. Batch-level expiration tracking (fixed timestamp or NULL for unlimited)
-- 4. Full ledger (`promo_balance_transactions`) for credits, debits, and expirations
-- 5. FEFO (First-Expiring, First-Out) deduction for in-site purchases (subscriptions)
-- 6. Admin management RPCs + automatic expiry sweep

-- 1. Ensure promo_balance column exists on profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS promo_balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL;

-- 2. Create promo_balance_batches table (tracks each granted promotional credit & its expiry)
CREATE TABLE IF NOT EXISTS public.promo_balance_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL DEFAULT 'admin_grant'
        CHECK (source_type IN ('admin_grant', 'voucher', 'campaign', 'system_bonus', 'legacy_migration')),
    source_label TEXT NOT NULL,
    source_code TEXT,
    initial_amount NUMERIC(10,2) NOT NULL CHECK (initial_amount > 0),
    remaining_amount NUMERIC(10,2) NOT NULL CHECK (remaining_amount >= 0),
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = غير محدد المدة
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'depleted', 'expired')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_promo_batches_user_active
    ON public.promo_balance_batches (user_id, status, expires_at);

-- 3. Create promo_balance_transactions table (full audit ledger)
CREATE TABLE IF NOT EXISTS public.promo_balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.promo_balance_batches(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'expired')),
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    source_code TEXT,
    reference_type TEXT, -- 'subscription', 'admin_panel', 'voucher', 'expiry_sweep', etc.
    reference_id TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_promo_tx_user_created
    ON public.promo_balance_transactions (user_id, created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.promo_balance_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_balance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own promo batches" ON public.promo_balance_batches;
CREATE POLICY "Users can view their own promo batches" ON public.promo_balance_batches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all promo batches" ON public.promo_balance_batches;
CREATE POLICY "Admins can view all promo batches" ON public.promo_balance_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Users can view their own promo transactions" ON public.promo_balance_transactions;
CREATE POLICY "Users can view their own promo transactions" ON public.promo_balance_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all promo transactions" ON public.promo_balance_transactions;
CREATE POLICY "Admins can view all promo transactions" ON public.promo_balance_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 5. Sync / Expire helper for a user's promotional balance
CREATE OR REPLACE FUNCTION public.expire_user_promo_balances(p_user_id UUID DEFAULT NULL)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    v_target_user UUID;
    v_current_profile_promo NUMERIC(10,2);
    v_batch RECORD;
    v_active_sum NUMERIC(10,2);
    v_batch_count INT;
BEGIN
    v_target_user := COALESCE(p_user_id, auth.uid());
    IF v_target_user IS NULL THEN
        RETURN 0.00;
    END IF;

    -- Backfill legacy promo_balance into an unlimited batch if user has balance > 0 and no batches yet
    SELECT COALESCE(promo_balance, 0.00) INTO v_current_profile_promo
    FROM public.profiles
    WHERE id = v_target_user
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN 0.00;
    END IF;

    SELECT COUNT(*) INTO v_batch_count
    FROM public.promo_balance_batches
    WHERE user_id = v_target_user;

    IF v_batch_count = 0 AND v_current_profile_promo > 0 THEN
        INSERT INTO public.promo_balance_batches (
            user_id, source_type, source_label, initial_amount, remaining_amount, expires_at, status
        ) VALUES (
            v_target_user, 'legacy_migration', 'رصيد ترويجي حالي', v_current_profile_promo, v_current_profile_promo, NULL, 'active'
        );

        INSERT INTO public.promo_balance_transactions (
            user_id, type, title, description, amount, balance_after, reference_type
        ) VALUES (
            v_target_user, 'credit', 'رصيد ترويجي مرحّل', 'رصيد ترويجي متاح في الحساب (غير محدد المدة)', v_current_profile_promo, v_current_profile_promo, 'legacy_migration'
        );
    END IF;

    -- Expire any active batches whose expires_at has passed
    FOR v_batch IN
        SELECT id, source_label, source_code, remaining_amount, expires_at
        FROM public.promo_balance_batches
        WHERE user_id = v_target_user
          AND status = 'active'
          AND expires_at IS NOT NULL
          AND expires_at <= now()
        ORDER BY expires_at ASC
    LOOP
        UPDATE public.promo_balance_batches
        SET status = 'expired',
            remaining_amount = 0.00
        WHERE id = v_batch.id;

        IF v_batch.remaining_amount > 0 THEN
            SELECT COALESCE(SUM(remaining_amount), 0.00) INTO v_active_sum
            FROM public.promo_balance_batches
            WHERE user_id = v_target_user
              AND status = 'active'
              AND (expires_at IS NULL OR expires_at > now());

            INSERT INTO public.promo_balance_transactions (
                user_id, batch_id, type, title, description, amount, balance_after, source_code, reference_type, expires_at
            ) VALUES (
                v_target_user,
                v_batch.id,
                'expired',
                'انتهاء صلاحية رصيد ترويجي',
                'انتهت صلاحية دفعة: ' || v_batch.source_label,
                v_batch.remaining_amount,
                v_active_sum,
                v_batch.source_code,
                'expiry_sweep',
                v_batch.expires_at
            );
        END IF;
    END LOOP;

    -- Recompute authoritative active promotional balance
    SELECT COALESCE(SUM(remaining_amount), 0.00) INTO v_active_sum
    FROM public.promo_balance_batches
    WHERE user_id = v_target_user
      AND status = 'active'
      AND remaining_amount > 0
      AND (expires_at IS NULL OR expires_at > now());

    UPDATE public.profiles
    SET promo_balance = v_active_sum
    WHERE id = v_target_user;

    RETURN v_active_sum;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Internal / Admin Grant Promotional Balance
CREATE OR REPLACE FUNCTION public.grant_promo_balance(
    p_user_id UUID,
    p_amount NUMERIC(10,2),
    p_source_type TEXT DEFAULT 'admin_grant',
    p_source_label TEXT DEFAULT 'مكافأة رصيد ترويجي',
    p_source_code TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_amount NUMERIC(10,2);
    v_batch_id UUID;
    v_new_promo NUMERIC(10,2);
BEGIN
    v_amount := ROUND(p_amount, 2);
    IF v_amount IS NULL OR v_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب أن يكون مبلغ الرصيد الترويجي أكبر من الصفر.');
    END IF;

    IF p_expires_at IS NOT NULL AND p_expires_at <= now() THEN
        RETURN jsonb_build_object('success', false, 'message', 'تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل.');
    END IF;

    PERFORM public.expire_user_promo_balances(p_user_id);

    INSERT INTO public.promo_balance_batches (
        user_id, source_type, source_label, source_code, initial_amount, remaining_amount, expires_at, status, created_by
    ) VALUES (
        p_user_id,
        COALESCE(NULLIF(p_source_type, ''), 'admin_grant'),
        COALESCE(NULLIF(p_source_label, ''), 'رصيد ترويجي'),
        p_source_code,
        v_amount,
        v_amount,
        p_expires_at,
        'active',
        COALESCE(p_created_by, auth.uid())
    ) RETURNING id INTO v_batch_id;

    SELECT COALESCE(SUM(remaining_amount), 0.00) INTO v_new_promo
    FROM public.promo_balance_batches
    WHERE user_id = p_user_id
      AND status = 'active'
      AND remaining_amount > 0
      AND (expires_at IS NULL OR expires_at > now());

    UPDATE public.profiles
    SET promo_balance = v_new_promo
    WHERE id = p_user_id;

    INSERT INTO public.promo_balance_transactions (
        user_id, batch_id, type, title, description, amount, balance_after, source_code, reference_type, expires_at, created_by
    ) VALUES (
        p_user_id,
        v_batch_id,
        'credit',
        COALESCE(NULLIF(p_source_label, ''), 'إضافة رصيد ترويجي'),
        COALESCE(
            NULLIF(p_description, ''),
            CASE
                WHEN p_expires_at IS NULL THEN 'رصيد ترويجي غير محدد المدة للاستخدام داخل الموقع'
                ELSE 'رصيد ترويجي صالح حتى ' || to_char(p_expires_at, 'YYYY-MM-DD')
            END
        ),
        v_amount,
        v_new_promo,
        p_source_code,
        COALESCE(NULLIF(p_source_type, ''), 'admin_grant'),
        p_expires_at,
        COALESCE(p_created_by, auth.uid())
    );

    RETURN jsonb_build_object(
        'success', true,
        'batch_id', v_batch_id,
        'new_promo_balance', v_new_promo
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Internal FEFO Deduction Helper (First-Expiring, First-Out)
CREATE OR REPLACE FUNCTION public.deduct_promo_balance_fefo(
    p_user_id UUID,
    p_amount NUMERIC(10,2),
    p_title TEXT DEFAULT 'استخدام الرصيد الترويجي',
    p_description TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT 'purchase',
    p_reference_id TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_needed NUMERIC(10,2);
    v_available NUMERIC(10,2);
    v_batch RECORD;
    v_take NUMERIC(10,2);
    v_remaining_after NUMERIC(10,2);
BEGIN
    v_needed := ROUND(p_amount, 2);
    IF v_needed IS NULL OR v_needed <= 0 THEN
        RETURN jsonb_build_object('success', true, 'deducted', 0.00, 'new_promo_balance', public.expire_user_promo_balances(p_user_id));
    END IF;

    v_available := public.expire_user_promo_balances(p_user_id);
    IF v_available < v_needed THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'الرصيد الترويجي غير كافٍ لإتمام الخصم (المتاح: ' || v_available || ' ج.م).'
        );
    END IF;

    v_remaining_after := v_available;

    -- Consume batches expiring soonest first; unlimited (NULL) batches last
    FOR v_batch IN
        SELECT id, remaining_amount, source_code, expires_at
        FROM public.promo_balance_batches
        WHERE user_id = p_user_id
          AND status = 'active'
          AND remaining_amount > 0
          AND (expires_at IS NULL OR expires_at > now())
        ORDER BY expires_at ASC NULLS LAST, granted_at ASC
    LOOP
        EXIT WHEN v_needed <= 0;

        v_take := LEAST(v_batch.remaining_amount, v_needed);
        v_needed := v_needed - v_take;
        v_remaining_after := v_remaining_after - v_take;

        UPDATE public.promo_balance_batches
        SET remaining_amount = remaining_amount - v_take,
            status = CASE WHEN (remaining_amount - v_take) <= 0 THEN 'depleted' ELSE 'active' END
        WHERE id = v_batch.id;

        INSERT INTO public.promo_balance_transactions (
            user_id, batch_id, type, title, description, amount, balance_after, source_code, reference_type, reference_id, expires_at, created_by
        ) VALUES (
            p_user_id,
            v_batch.id,
            'debit',
            COALESCE(NULLIF(p_title, ''), 'دفع بالرصيد الترويجي'),
            COALESCE(NULLIF(p_description, ''), 'استخدام الرصيد الترويجي داخل الموقع'),
            v_take,
            v_remaining_after,
            v_batch.source_code,
            p_reference_type,
            p_reference_id,
            v_batch.expires_at,
            COALESCE(p_actor_id, auth.uid())
        );
    END LOOP;

    UPDATE public.profiles
    SET promo_balance = v_remaining_after
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'deducted', ROUND(p_amount, 2),
        'new_promo_balance', v_remaining_after
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. User Overview RPC (syncs expiries + returns balance, active/recent batches, and ledger)
CREATE OR REPLACE FUNCTION public.get_my_promo_balance_overview()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_balance NUMERIC(10,2);
    v_batches JSONB;
    v_transactions JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً.');
    END IF;

    v_balance := public.expire_user_promo_balances(v_user_id);

    SELECT COALESCE(jsonb_agg(row_to_json(b) ORDER BY b.granted_at DESC), '[]'::jsonb)
    INTO v_batches
    FROM (
        SELECT id, source_type, source_label, source_code, initial_amount, remaining_amount, granted_at, expires_at, status
        FROM public.promo_balance_batches
        WHERE user_id = v_user_id
          AND status IN ('active', 'expired')
        ORDER BY
            CASE WHEN status = 'active' THEN 0 ELSE 1 END,
            expires_at ASC NULLS LAST,
            granted_at DESC
        LIMIT 25
    ) b;

    SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::jsonb)
    INTO v_transactions
    FROM (
        SELECT id, type, title, description, amount, balance_after, source_code, reference_type, reference_id, expires_at, created_at
        FROM public.promo_balance_transactions
        WHERE user_id = v_user_id
        ORDER BY created_at DESC
        LIMIT 40
    ) t;

    RETURN jsonb_build_object(
        'success', true,
        'promo_balance', v_balance,
        'batches', v_batches,
        'transactions', v_transactions
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Admin Adjustment RPC for Promotional Balance (deposit with optional expiry, or withdraw)
CREATE OR REPLACE FUNCTION public.admin_adjust_promo_balance(
    p_user_id UUID,
    p_action TEXT, -- 'deposit' | 'withdraw'
    p_amount NUMERIC(10,2),
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_admin_id UUID;
    v_res JSONB;
    v_amount NUMERIC(10,2);
    v_new_promo NUMERIC(10,2);
BEGIN
    v_admin_id := auth.uid();
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_admin_id AND is_admin = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'غير مصرح لك بإجراء هذه العملية. يجب أن تكون مسؤولاً.');
    END IF;

    v_amount := ROUND(p_amount, 2);
    IF v_amount IS NULL OR v_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'يرجى إدخال مبلغ صحيح أكبر من الصفر.');
    END IF;

    IF p_action = 'deposit' THEN
        v_res := public.grant_promo_balance(
            p_user_id,
            v_amount,
            'admin_grant',
            'مكافأة رصيد ترويجي من الإدارة',
            NULL,
            p_expires_at,
            COALESCE(NULLIF(p_reason, ''), 'إضافة رصيد ترويجي بواسطة الإدارة'),
            v_admin_id
        );

        IF COALESCE((v_res->>'success')::boolean, false) = false THEN
            RETURN v_res;
        END IF;

        v_new_promo := (v_res->>'new_promo_balance')::numeric;

        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            p_user_id,
            'تمت إضافة رصيد ترويجي لحسابك',
            'تم شحن ' || v_amount || ' ج.م إلى رصيدك الترويجي للاستخدام داخل الموقع' ||
            CASE WHEN p_expires_at IS NOT NULL THEN ' (صالح حتى ' || to_char(p_expires_at, 'YYYY-MM-DD') || ')' ELSE ' (صلاحية غير محددة المدة)' END || '.',
            'success',
            '/profile'
        );

        RETURN jsonb_build_object(
            'success', true,
            'message', 'تمت إضافة الرصيد الترويجي بنجاح.',
            'new_promo_balance', v_new_promo
        );
    ELSIF p_action = 'withdraw' THEN
        v_res := public.deduct_promo_balance_fefo(
            p_user_id,
            v_amount,
            'خصم إداري من الرصيد الترويجي',
            COALESCE(NULLIF(p_reason, ''), 'تعديل إداري: خصم من الرصيد الترويجي'),
            'admin_panel',
            NULL,
            v_admin_id
        );

        IF COALESCE((v_res->>'success')::boolean, false) = false THEN
            RETURN v_res;
        END IF;

        v_new_promo := (v_res->>'new_promo_balance')::numeric;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'تم خصم الرصيد الترويجي بنجاح.',
            'new_promo_balance', v_new_promo
        );
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'نوع العملية غير صالح.');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء تعديل الرصيد الترويجي: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Upgrade subscribe_to_plan to support paying with Promotional Balance (FEFO) + Main Balance
CREATE OR REPLACE FUNCTION public.subscribe_to_plan(
    p_plan_id TEXT,
    p_period TEXT,
    p_use_promo BOOLEAN DEFAULT true
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC(10,2);
  v_current_promo NUMERIC(10,2);
  v_price NUMERIC(10,2);
  v_promo_used NUMERIC(10,2) := 0.00;
  v_main_used NUMERIC(10,2) := 0.00;
  v_plan_name TEXT;
  v_duration_interval INTERVAL;
  v_new_end_date TIMESTAMP WITH TIME ZONE;
  v_tx_id UUID;
  v_current_tier TEXT;
  v_current_period TEXT;
  v_current_end TIMESTAMP WITH TIME ZONE;
  v_current_status TEXT;
  v_current_price NUMERIC(10,2);
  v_current_rank INT;
  v_new_rank INT;
  v_deduct_res JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً.');
  END IF;

  -- Clean expired subscriptions
  UPDATE public.profiles
  SET
    subscription_tier = 'free',
    subscription_period = NULL,
    subscription_status = 'expired'
  WHERE id = v_user_id
    AND subscription_tier <> 'free'
    AND subscription_end IS NOT NULL
    AND subscription_end < now();

  SELECT subscription_tier, subscription_period, subscription_end, subscription_status
  INTO v_current_tier, v_current_period, v_current_end, v_current_status
  FROM public.profiles
  WHERE id = v_user_id;

  -- Handle switching to free (cancel auto-renewal)
  IF p_plan_id = 'free' THEN
    IF v_current_status = 'cancelled' THEN
      RETURN jsonb_build_object('success', false, 'message', 'لقد قمت بإلغاء التجديد التلقائي لهذه الباقة بالفعل، وسيتم تحويلك للباقة المجانية عند انتهاء صلاحيتها.');
    END IF;

    IF v_current_tier IS NOT NULL AND v_current_tier <> 'free' AND v_current_end > now() AND v_current_status = 'active' THEN
      UPDATE public.profiles
      SET subscription_status = 'cancelled'
      WHERE id = v_user_id;

      RETURN jsonb_build_object(
        'success', true,
        'message', 'تمت العملية بنجاح. سيتم إلغاء التجديد التلقائي وستظل باقتك الحالية نشطة حتى تاريخ ' || to_char(v_current_end, 'YYYY-MM-DD') || '، ثم ستعود للباقة المجانية تلقائياً.',
        'new_tier', v_current_tier
      );
    ELSE
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
  END IF;

  IF p_period NOT IN ('daily', 'monthly', 'yearly') THEN
    RETURN jsonb_build_object('success', false, 'message', 'فترة الاشتراك غير صالحة (يومي أو شهري أو سنوي فقط).');
  END IF;

  SELECT name,
         CASE WHEN p_period = 'daily' THEN price_daily
              WHEN p_period = 'monthly' THEN price_monthly
              ELSE price_yearly END,
         CASE WHEN p_period = 'daily' THEN INTERVAL '1 day'
              WHEN p_period = 'monthly' THEN INTERVAL '1 month'
              ELSE INTERVAL '1 year' END
  INTO v_plan_name, v_price, v_duration_interval
  FROM public.subscription_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'الباقة المطلوبة غير موجودة.');
  END IF;

  v_current_rank := CASE
    WHEN v_current_tier = 'mishwar' THEN 2
    WHEN v_current_tier = 'silver' THEN 3
    WHEN v_current_tier = 'gold' THEN 4
    ELSE 1
  END;
  v_new_rank := CASE
    WHEN p_plan_id = 'mishwar' THEN 2
    WHEN p_plan_id = 'silver' THEN 3
    WHEN p_plan_id = 'gold' THEN 4
    ELSE 1
  END;

  IF v_current_tier IS NOT NULL AND v_current_tier <> 'free' AND v_current_end > now() AND v_current_rank > v_new_rank THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'أنت على باقة أعلى حالياً ولا يمكن تخفيض اشتراكك. يمكنك بعد انتهاء مدة باقتك الحالية التي ستنتهي في ' || to_char(v_current_end, 'YYYY-MM-DD') || ' الاشتراك في ' || v_plan_name || '.'
    );
  END IF;

  v_current_price := 0;
  IF v_current_tier IS NOT NULL AND v_current_tier <> 'free' AND v_current_end > now() AND v_current_rank < v_new_rank THEN
    SELECT CASE WHEN v_current_period = 'daily' THEN price_daily
                WHEN v_current_period = 'monthly' THEN price_monthly
                ELSE price_yearly END
    INTO v_current_price
    FROM public.subscription_plans
    WHERE id = v_current_tier;

    IF v_price > v_current_price THEN
      v_price := v_price - v_current_price;
    ELSE
      v_price := 0;
    END IF;
  END IF;

  -- Sync expired promotional balances first before computing spendable amount
  v_current_promo := public.expire_user_promo_balances(v_user_id);

  SELECT COALESCE(balance, 0.00) INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'لم يتم العثور على ملف المستخدم الشخصي.');
  END IF;

  IF p_use_promo AND v_current_promo > 0 AND v_price > 0 THEN
    v_promo_used := LEAST(v_current_promo, v_price);
  ELSE
    v_promo_used := 0.00;
  END IF;

  v_main_used := v_price - v_promo_used;

  IF v_current_balance < v_main_used THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'الرصيد المتاح غير كافٍ للاشتراك (المطلوب: ' || v_price || ' ج.م، الرصيد الأساسي: ' || v_current_balance || ' ج.م، الرصيد الترويجي: ' || v_current_promo || ' ج.م).'
    );
  END IF;

  v_new_end_date := now() + v_duration_interval;

  -- Deduct promotional portion via FEFO batches
  IF v_promo_used > 0 THEN
    v_deduct_res := public.deduct_promo_balance_fefo(
      v_user_id,
      v_promo_used,
      'الاشتراك في ' || v_plan_name,
      'دفع بالرصيد الترويجي للاشتراك في ' || v_plan_name || ' (' || CASE WHEN p_period = 'daily' THEN 'يومي' WHEN p_period = 'monthly' THEN 'شهري' ELSE 'سنوي' END || ')',
      'subscription',
      p_plan_id || ':' || p_period,
      v_user_id
    );

    IF COALESCE((v_deduct_res->>'success')::boolean, false) = false THEN
      RETURN v_deduct_res;
    END IF;
  END IF;

  -- Deduct remaining main balance via balance_transactions trigger
  IF v_main_used > 0 THEN
    INSERT INTO public.balance_transactions (
      user_id, type, amount, method, provider_number, recipient_name, transaction_id, status, admin_notes
    ) VALUES (
      v_user_id,
      'withdrawal',
      v_main_used,
      'wallet',
      'system_wallet',
      'Cairo Map Subscription Service',
      'SUB_' || to_char(now(), 'YYYYMMDDHH24MISS'),
      'approved',
      'اشتراك في الباقة: ' || v_plan_name || ' (' || CASE WHEN p_period = 'daily' THEN 'يومي' WHEN p_period = 'monthly' THEN 'شهري' ELSE 'سنوي' END || ')' ||
      CASE WHEN v_promo_used > 0 THEN ' - استُخدم ' || v_promo_used || ' ج.م رصيد ترويجي' ELSE '' END
    ) RETURNING id INTO v_tx_id;
  END IF;

  UPDATE public.profiles
  SET
    subscription_tier = p_plan_id,
    subscription_period = p_period,
    subscription_status = 'active',
    subscription_start = now(),
    subscription_end = v_new_end_date
  WHERE id = v_user_id;

  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    v_user_id,
    'تم تفعيل اشتراكك بنجاح',
    'تم تفعيل اشتراكك في ' || v_plan_name || ' (' || CASE WHEN p_period = 'daily' THEN 'يومياً' WHEN p_period = 'monthly' THEN 'شهرياً' ELSE 'سنوياً' END || ') حتى تاريخ ' || to_char(v_new_end_date, 'YYYY-MM-DD') || '.',
    'success',
    '/profile'
  );

  SELECT COALESCE(balance, 0.00), COALESCE(promo_balance, 0.00)
  INTO v_current_balance, v_current_promo
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم الاشتراك وتفعيل الباقة بنجاح!',
    'new_tier', p_plan_id,
    'new_balance', v_current_balance,
    'new_promo_balance', v_current_promo,
    'promo_used', v_promo_used,
    'main_used', v_main_used,
    'subscription_end', to_char(v_new_end_date, 'YYYY-MM-DD')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء معالجة الاشتراك: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Keep admin_update_user_assets safe and synchronized with promo_balance_batches
CREATE OR REPLACE FUNCTION public.admin_update_user_assets(
    p_user_id UUID,
    p_points INT,
    p_balance NUMERIC(10,2),
    p_promo_balance NUMERIC(10,2)
)
RETURNS JSONB AS $$
DECLARE
  v_old_promo NUMERIC(10,2);
  v_diff NUMERIC(10,2);
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'غير مصرح لك بإجراء هذه العملية. يجب أن تكون مسؤولاً.');
  END IF;

  v_old_promo := public.expire_user_promo_balances(p_user_id);

  UPDATE public.profiles
  SET
    points = p_points,
    balance = p_balance
  WHERE id = p_user_id;

  v_diff := ROUND(COALESCE(p_promo_balance, 0.00) - COALESCE(v_old_promo, 0.00), 2);
  IF v_diff > 0 THEN
    PERFORM public.grant_promo_balance(
      p_user_id, v_diff, 'admin_grant', 'تعديل إداري للرصيد الترويجي', NULL, NULL, 'إضافة رصيد ترويجي غير محدد المدة', auth.uid()
    );
  ELSIF v_diff < 0 THEN
    PERFORM public.deduct_promo_balance_fefo(
      p_user_id, ABS(v_diff), 'تعديل إداري للرصيد الترويجي', 'خصم إداري من الرصيد الترويجي', 'admin_panel', NULL, auth.uid()
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'تم تحديث النقاط والأرصدة بنجاح.');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء تحديث البيانات: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
