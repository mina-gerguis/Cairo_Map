-- ============================================================================
-- Security Hardening Patch for Qareeb Map (Cairo Map) - RECURSION-SAFE VERSION
-- Fixes: "infinite recursion detected in policy for relation profiles"
-- ============================================================================

-- 1. Helper function with SECURITY DEFINER to avoid RLS infinite recursion
-- This function runs with owner privileges and bypasses RLS, completely eliminating recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Grant execution to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 2. Drop any previous recursive or conflicting policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own non-sensitive profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Clean, Non-Recursive Policies on public.profiles
-- A) Public read: Allows displaying user names, avatars on comments/reviews
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- B) Update policy: Users can update their own row (the trigger below prevents tampering with admin/balance)
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- C) Admin update: Admins can update any profile (uses recursion-safe is_admin() function)
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- 5. Hardened Security Trigger Function (check_profile_updates)
-- Strictly blocks privilege escalation and financial tampering
CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
DECLARE
  v_is_caller_admin BOOLEAN := FALSE;
BEGIN
  -- Allow internal database maintenance / service role
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  -- Use the recursion-safe is_admin function
  v_is_caller_admin := public.is_admin();

  -- 1. Prevent ID tampering
  IF OLD.id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'Security Violation: Cannot change profile primary key (id).';
  END IF;

  -- 2. Prevent Privilege Escalation (is_admin)
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF NOT v_is_caller_admin THEN
      RAISE EXCEPTION 'Security Violation: Unauthorized modification of administrative privileges (is_admin).';
    END IF;
  END IF;

  -- 3. Prevent Unauthorized Account Suspension Bypass
  IF (
    OLD.is_suspended IS DISTINCT FROM NEW.is_suspended OR
    OLD.suspended_at IS DISTINCT FROM NEW.suspended_at OR
    OLD.suspended_reason IS DISTINCT FROM NEW.suspended_reason
  ) THEN
    IF NOT v_is_caller_admin THEN
      RAISE EXCEPTION 'Security Violation: Unauthorized modification of account suspension status.';
    END IF;
  END IF;

  -- 4. Prevent Financial & Points Tampering (balance, points, promo_balance)
  IF (
    OLD.points IS DISTINCT FROM NEW.points OR
    OLD.balance IS DISTINCT FROM NEW.balance OR
    OLD.promo_balance IS DISTINCT FROM NEW.promo_balance
  ) THEN
    IF NOT v_is_caller_admin THEN
      RAISE EXCEPTION 'Security Violation: Unauthorized modification of wallet balances or reward points.';
    END IF;
  END IF;

  -- 5. Prevent tampering with created_at timestamp
  IF OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    NEW.created_at := OLD.created_at;
  END IF;

  -- Automatically update timestamp
  NEW.updated_at := timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach Trigger to public.profiles
DROP TRIGGER IF EXISTS ensure_profile_security ON public.profiles;
CREATE TRIGGER ensure_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_updates();

-- 6. Insert Guard: Forces non-admin and zero balances on any new registration
CREATE OR REPLACE FUNCTION public.check_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  NEW.is_admin := FALSE;
  NEW.is_suspended := FALSE;
  NEW.balance := 0.00;
  NEW.points := 0;
  NEW.promo_balance := 0.00;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_profile_insert_security ON public.profiles;
CREATE TRIGGER ensure_profile_insert_security
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_insert();
