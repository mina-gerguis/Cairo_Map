-- ==============================================================================
-- Schema for saved_user_places (أحفظ مكاني على الحساب)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.saved_user_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    notes TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy REAL DEFAULT 0,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_user_places ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy (Users can only see their own saved places)
DROP POLICY IF EXISTS "Users can view their own saved places" ON public.saved_user_places;
CREATE POLICY "Users can view their own saved places" ON public.saved_user_places
    FOR SELECT USING (auth.uid() = user_id);

-- 2. INSERT Policy (Users can only insert places attached to their user_id)
DROP POLICY IF EXISTS "Users can insert their own saved places" ON public.saved_user_places;
CREATE POLICY "Users can insert their own saved places" ON public.saved_user_places
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE Policy (Users can update their own saved places)
DROP POLICY IF EXISTS "Users can update their own saved places" ON public.saved_user_places;
CREATE POLICY "Users can update their own saved places" ON public.saved_user_places
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. DELETE Policy (Users can delete their own saved places)
DROP POLICY IF EXISTS "Users can delete their own saved places" ON public.saved_user_places;
CREATE POLICY "Users can delete their own saved places" ON public.saved_user_places
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Admins can view/manage all saved places
DROP POLICY IF EXISTS "Admins can manage all saved places" ON public.saved_user_places;
CREATE POLICY "Admins can manage all saved places" ON public.saved_user_places
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Fast Indexes
CREATE INDEX IF NOT EXISTS idx_saved_user_places_user_id ON public.saved_user_places(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user_places_created_at ON public.saved_user_places(created_at DESC);
