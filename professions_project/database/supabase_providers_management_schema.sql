-- =========================================================
-- SQL Migration Script: Service Providers Management
-- Run this script in the Supabase SQL Editor to enable full admin permissions & status columns.
-- =========================================================

-- 1. Add account status columns to profiles table if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_note TEXT;

-- 2. Add status columns to service_workers table if not exists
ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS status_note TEXT;

-- 3. Add RLS Policies for Admins to UPDATE service_workers and profiles
DROP POLICY IF EXISTS "Allow admins update on service_workers" ON public.service_workers;
CREATE POLICY "Allow admins update on service_workers" ON public.service_workers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Allow admins update on profiles" ON public.profiles;
CREATE POLICY "Allow admins update on profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. SECURITY DEFINER RPC to update worker status safely bypassing RLS
CREATE OR REPLACE FUNCTION public.update_worker_status_by_admin(
  p_worker_id UUID,
  p_is_blocked BOOLEAN,
  p_is_suspended BOOLEAN,
  p_status_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_status VARCHAR(20);
BEGIN
  -- Verify if requester is admin
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
  
  IF NOT COALESCE(v_is_admin, FALSE) THEN
    RAISE EXCEPTION 'غير مصرح لك بإجراء هذا العمل. يجب أن تكون مسؤولاً.';
  END IF;

  IF p_is_blocked THEN
    v_status := 'blocked';
  ELSIF p_is_suspended THEN
    v_status := 'suspended';
  ELSE
    v_status := 'active';
  END IF;

  -- Update profiles table
  UPDATE public.profiles
  SET 
    is_blocked = p_is_blocked,
    is_suspended = p_is_suspended,
    status_note = p_status_note
  WHERE id = p_worker_id;

  -- Update service_workers table (also update is_available)
  UPDATE public.service_workers
  SET 
    status = v_status,
    status_note = p_status_note,
    is_available = CASE WHEN (p_is_blocked OR p_is_suspended) THEN false ELSE true END
  WHERE id = p_worker_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function for admin to delete user permanently
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Verify if requester is admin
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
  
  IF NOT COALESCE(v_is_admin, FALSE) THEN
    RAISE EXCEPTION 'غير مصرح لك بإجراء هذا العمل. يجب أن تكون مسؤولاً.';
  END IF;

  -- Delete user from auth.users (cascades to profiles, service_workers, etc.)
  DELETE FROM auth.users WHERE id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
