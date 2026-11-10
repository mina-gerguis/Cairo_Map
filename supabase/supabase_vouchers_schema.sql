-- ============================================================================
-- Voucher Redemption & Timed Feature/Page Unlocks Schema
-- ============================================================================
-- Prerequisite: Run supabase/supabase_promo_balance_schema.sql first so
-- `grant_promo_balance` is available for `promo_balance` vouchers.

-- 1. Vouchers master table
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    reward_type TEXT NOT NULL
        CHECK (reward_type IN ('main_balance', 'promo_balance', 'feature_unlock', 'page_access')),
    reward_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'scheduled', 'expired', 'exhausted')),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    max_uses INTEGER NULL CHECK (max_uses IS NULL OR max_uses > 0),
    max_uses_per_user INTEGER NOT NULL DEFAULT 1 CHECK (max_uses_per_user > 0),
    starts_at TIMESTAMP WITH TIME ZONE NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    audience TEXT NOT NULL DEFAULT 'all'
        CHECK (audience IN ('all', 'new_users', 'free_tier', 'specific_users')),
    target_user_ids UUID[] NULL,
    batch_name TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code_upper ON public.vouchers (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.vouchers (status, expires_at);

-- 2. Redemptions audit table
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    reward_summary TEXT NOT NULL,
    reward_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user ON public.voucher_redemptions (user_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_voucher ON public.voucher_redemptions (voucher_id, redeemed_at DESC);

-- 3. User unlocked perks (features & timed page access)
CREATE TABLE IF NOT EXISTS public.user_unlocked_perks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('feature_unlock', 'page_access')),
    perk_key TEXT NOT NULL,
    title TEXT NOT NULL,
    source_code TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NULL -- NULL = permanent, otherwise auto-expires
);

CREATE INDEX IF NOT EXISTS idx_user_unlocked_perks_active
    ON public.user_unlocked_perks (user_id, kind, expires_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_perks ENABLE ROW LEVEL SECURITY;

-- Vouchers: Admin only (users redeem strictly through SECURITY DEFINER RPC)
DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;
CREATE POLICY "Admins can manage vouchers" ON public.vouchers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Redemptions: Users view own; Admins view all
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.voucher_redemptions;
CREATE POLICY "Users can view own redemptions" ON public.voucher_redemptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all redemptions" ON public.voucher_redemptions;
CREATE POLICY "Admins can view all redemptions" ON public.voucher_redemptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Unlocked perks: Users view own; Admins view all
DROP POLICY IF EXISTS "Users can view own unlocked perks" ON public.user_unlocked_perks;
CREATE POLICY "Users can view own unlocked perks" ON public.user_unlocked_perks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all unlocked perks" ON public.user_unlocked_perks;
CREATE POLICY "Admins can view all unlocked perks" ON public.user_unlocked_perks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 5. User Overview RPC (active perks + past redemptions)
CREATE OR REPLACE FUNCTION public.get_my_voucher_overview()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_perks JSONB;
    v_redemptions JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً.');
    END IF;

    SELECT COALESCE(jsonb_agg(row_to_json(p) ORDER BY p.unlocked_at DESC), '[]'::jsonb)
    INTO v_perks
    FROM (
        SELECT id, kind, perk_key, title, source_code, unlocked_at, expires_at
        FROM public.user_unlocked_perks
        WHERE user_id = v_user_id
          AND (expires_at IS NULL OR expires_at > now())
        ORDER BY unlocked_at DESC
    ) p;

    SELECT COALESCE(jsonb_agg(row_to_json(r) ORDER BY r.redeemed_at DESC), '[]'::jsonb)
    INTO v_redemptions
    FROM (
        SELECT id, voucher_id, code, reward_type, reward_summary, redeemed_at, expires_at
        FROM public.voucher_redemptions
        WHERE user_id = v_user_id
        ORDER BY redeemed_at DESC
        LIMIT 30
    ) r;

    RETURN jsonb_build_object(
        'success', true,
        'unlocked_perks', v_perks,
        'redemptions', v_redemptions
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Redeem Voucher Code RPC (atomic validation + reward delivery)
CREATE OR REPLACE FUNCTION public.redeem_voucher_code(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_clean_code TEXT;
    v_voucher RECORD;
    v_profile RECORD;
    v_user_uses INT;
    v_amount NUMERIC(10,2);
    v_promo_mode TEXT;
    v_promo_days INT;
    v_promo_date TEXT;
    v_promo_expires_at TIMESTAMP WITH TIME ZONE := NULL;
    v_perk_key TEXT;
    v_perk_title TEXT;
    v_duration_unit TEXT;
    v_duration_val INT;
    v_perk_expires_at TIMESTAMP WITH TIME ZONE := NULL;
    v_reward_summary TEXT;
    v_grant_res JSONB;
    v_redemption_id UUID;
    v_perk_id UUID;
    v_new_balance NUMERIC(10,2);
    v_new_promo NUMERIC(10,2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً لاسترداد القسائم.');
    END IF;

    v_clean_code := UPPER(TRIM(COALESCE(p_code, '')));
    IF LENGTH(v_clean_code) < 4 THEN
        RETURN jsonb_build_object('success', false, 'message', 'يرجى إدخال كود قسيمة صحيح.');
    END IF;

    SELECT * INTO v_voucher
    FROM public.vouchers
    WHERE UPPER(code) = v_clean_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'لم يتم العثور على كود قسيمة مطابق. تأكد من كتابة الكود بشكل صحيح.');
    END IF;

    IF v_voucher.status = 'paused' THEN
        RETURN jsonb_build_object('success', false, 'message', 'هذا الكود متوقف مؤقتاً من الإدارة.');
    END IF;

    IF v_voucher.status = 'expired' OR (v_voucher.expires_at IS NOT NULL AND v_voucher.expires_at <= now()) THEN
        UPDATE public.vouchers SET status = 'expired', updated_at = now() WHERE id = v_voucher.id AND status <> 'expired';
        RETURN jsonb_build_object('success', false, 'message', 'انتهت صلاحية هذا الكود ولم يعد متاحاً للاسترداد.');
    END IF;

    IF v_voucher.starts_at IS NOT NULL AND v_voucher.starts_at > now() THEN
        RETURN jsonb_build_object('success', false, 'message', 'لم يبدأ موعد تفعيل هذا الكود بعد.');
    END IF;

    IF v_voucher.status = 'exhausted' OR (v_voucher.max_uses IS NOT NULL AND v_voucher.usage_count >= v_voucher.max_uses) THEN
        UPDATE public.vouchers SET status = 'exhausted', updated_at = now() WHERE id = v_voucher.id AND status <> 'exhausted';
        RETURN jsonb_build_object('success', false, 'message', 'تم استنفاد الحد الأقصى لاستخدام هذا الكود.');
    END IF;

    SELECT COUNT(*) INTO v_user_uses
    FROM public.voucher_redemptions
    WHERE voucher_id = v_voucher.id AND user_id = v_user_id;

    IF v_user_uses >= v_voucher.max_uses_per_user THEN
        RETURN jsonb_build_object('success', false, 'message', 'لقد قمت باسترداد هذا الكود مسبقاً في حسابك.');
    END IF;

    SELECT id, full_name, username, subscription_tier, created_at, COALESCE(balance, 0.00) AS balance, COALESCE(promo_balance, 0.00) AS promo_balance
    INTO v_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_voucher.audience = 'new_users' AND v_profile.created_at < (now() - INTERVAL '14 days') THEN
        RETURN jsonb_build_object('success', false, 'message', 'هذا الكود مخصص للحسابات الجديدة فقط.');
    ELSIF v_voucher.audience = 'free_tier' AND COALESCE(v_profile.subscription_tier, 'free') <> 'free' THEN
        RETURN jsonb_build_object('success', false, 'message', 'هذا الكود مخصص لأصحاب الباقة المجانية فقط.');
    ELSIF v_voucher.audience = 'specific_users' AND (v_voucher.target_user_ids IS NULL OR NOT (v_user_id = ANY(v_voucher.target_user_ids))) THEN
        RETURN jsonb_build_object('success', false, 'message', 'حسابك غير مشمول ضمن الفئة المستهدفة لهذا الكود.');
    END IF;

    -- Deliver reward based on reward_type
    IF v_voucher.reward_type = 'main_balance' THEN
        v_amount := ROUND(COALESCE((v_voucher.reward_config->>'amount')::numeric, 0), 2);
        IF v_amount <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'إعدادات قيمة القسيمة غير صالحة.');
        END IF;

        UPDATE public.profiles
        SET balance = COALESCE(balance, 0.00) + v_amount
        WHERE id = v_user_id;

        INSERT INTO public.balance_transactions (
            user_id, type, amount, method, provider_number, recipient_name, transaction_id, status, admin_notes
        ) VALUES (
            v_user_id,
            'deposit',
            v_amount,
            'voucher_redemption',
            v_voucher.code,
            COALESCE(v_profile.full_name, v_profile.username, 'مستخدم'),
            'VCH_' || v_voucher.code || '_' || EXTRACT(EPOCH FROM now())::bigint,
            'approved',
            'استرداد قسيمة: ' || v_voucher.title
        );

        v_reward_summary := '+' || v_amount || ' ج.م إلى المحفظة الأساسية';

    ELSIF v_voucher.reward_type = 'promo_balance' THEN
        v_amount := ROUND(COALESCE((v_voucher.reward_config->>'amount')::numeric, 0), 2);
        IF v_amount <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'إعدادات قيمة الرصيد الترويجي غير صالحة.');
        END IF;

        v_promo_mode := COALESCE(v_voucher.reward_config->>'promoExpiryMode', 'unlimited');
        IF v_promo_mode = 'days_after_redeem' THEN
            v_promo_days := GREATEST(1, COALESCE((v_voucher.reward_config->>'promoExpiryDays')::int, 30));
            v_promo_expires_at := now() + (v_promo_days || ' days')::interval;
        ELSIF v_promo_mode = 'fixed_date' AND NULLIF(v_voucher.reward_config->>'promoExpiryDate', '') IS NOT NULL THEN
            v_promo_expires_at := (v_voucher.reward_config->>'promoExpiryDate')::timestamptz;
        ELSE
            v_promo_expires_at := NULL;
        END IF;

        v_grant_res := public.grant_promo_balance(
            v_user_id,
            v_amount,
            'voucher',
            v_voucher.title,
            v_voucher.code,
            v_promo_expires_at,
            'استرداد كود قسيمة: ' || v_voucher.code,
            v_user_id
        );

        IF COALESCE((v_grant_res->>'success')::boolean, false) = false THEN
            RETURN v_grant_res;
        END IF;

        v_perk_expires_at := v_promo_expires_at;
        v_reward_summary := '+' || v_amount || ' ج.م رصيد ترويجي' ||
            CASE WHEN v_promo_expires_at IS NOT NULL THEN ' (صالح حتى ' || to_char(v_promo_expires_at, 'YYYY-MM-DD') || ')' ELSE ' (غير محدد المدة)' END;

    ELSIF v_voucher.reward_type = 'feature_unlock' THEN
        v_perk_key := COALESCE(NULLIF(v_voucher.reward_config->>'featureKey', ''), 'custom_feature');
        v_perk_title := COALESCE(NULLIF(v_voucher.reward_config->>'featureLabel', ''), v_voucher.title);

        INSERT INTO public.user_unlocked_perks (
            user_id, voucher_id, kind, perk_key, title, source_code, expires_at
        ) VALUES (
            v_user_id, v_voucher.id, 'feature_unlock', v_perk_key, v_perk_title, v_voucher.code, NULL
        ) RETURNING id INTO v_perk_id;

        v_reward_summary := 'فتح ميزة: ' || v_perk_title;

    ELSIF v_voucher.reward_type = 'page_access' THEN
        v_perk_key := COALESCE(NULLIF(v_voucher.reward_config->>'targetPage', ''), 'all');
        v_perk_title := COALESCE(NULLIF(v_voucher.reward_config->>'targetPageLabel', ''), v_voucher.title);
        v_duration_unit := COALESCE(v_voucher.reward_config->>'accessDurationUnit', 'days');
        v_duration_val := GREATEST(1, COALESCE((v_voucher.reward_config->>'accessDurationValue')::int, 7));

        IF v_duration_unit = 'hours' THEN
            v_perk_expires_at := now() + (v_duration_val || ' hours')::interval;
        ELSE
            v_perk_expires_at := now() + (v_duration_val || ' days')::interval;
        END IF;

        INSERT INTO public.user_unlocked_perks (
            user_id, voucher_id, kind, perk_key, title, source_code, expires_at
        ) VALUES (
            v_user_id, v_voucher.id, 'page_access', v_perk_key, v_perk_title, v_voucher.code, v_perk_expires_at
        ) RETURNING id INTO v_perk_id;

        v_reward_summary := 'فتح ' || v_perk_title || ' لمدة ' || v_duration_val || ' ' ||
            CASE WHEN v_duration_unit = 'hours' THEN 'ساعة' ELSE 'أيام' END;
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'نوع المكافأة غير مدعوم.');
    END IF;

    -- Update voucher usage counters
    UPDATE public.vouchers
    SET usage_count = usage_count + 1,
        status = CASE
            WHEN max_uses IS NOT NULL AND (usage_count + 1) >= max_uses THEN 'exhausted'
            ELSE status
        END,
        updated_at = now()
    WHERE id = v_voucher.id;

    -- Record redemption log
    INSERT INTO public.voucher_redemptions (
        voucher_id, user_id, code, reward_type, reward_summary, reward_snapshot, expires_at
    ) VALUES (
        v_voucher.id, v_user_id, v_voucher.code, v_voucher.reward_type, v_reward_summary, v_voucher.reward_config, v_perk_expires_at
    ) RETURNING id INTO v_redemption_id;

    -- Notify user
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        v_user_id,
        'تم استرداد القسيمة بنجاح',
        'تم تفعيل الكود ' || v_voucher.code || ': ' || v_reward_summary || '.',
        'success',
        '/profile'
    );

    SELECT COALESCE(balance, 0.00), COALESCE(promo_balance, 0.00)
    INTO v_new_balance, v_new_promo
    FROM public.profiles
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'تم استرداد القسيمة بنجاح!',
        'reward_type', v_voucher.reward_type,
        'reward_summary', v_reward_summary,
        'new_balance', v_new_balance,
        'new_promo_balance', v_new_promo,
        'redemption_id', v_redemption_id,
        'perk_id', v_perk_id,
        'expires_at', v_perk_expires_at
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'حدث خطأ أثناء استرداد القسيمة: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
