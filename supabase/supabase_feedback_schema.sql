-- 1. Create the suggestions and bugs table
CREATE TABLE IF NOT EXISTS public.app_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug')),
    category TEXT, -- For suggestions: 'اقتراح لتحسين الشكل', 'اقتراح إضافة ميزة جديدة', 'اقتراح آخر'
    title TEXT, -- For bugs: type of problem
    content TEXT NOT NULL, -- Suggestion message or bug details
    image_url TEXT, -- Uploaded image URL (for bugs)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken')),
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.app_feedback;
CREATE POLICY "Users can insert their own feedback" ON public.app_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.app_feedback;
CREATE POLICY "Users can view their own feedback" ON public.app_feedback
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.app_feedback;
CREATE POLICY "Admins can view all feedback" ON public.app_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update feedback" ON public.app_feedback;
CREATE POLICY "Admins can update feedback" ON public.app_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can delete feedback" ON public.app_feedback;
CREATE POLICY "Admins can delete feedback" ON public.app_feedback
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Users can delete their own feedback" ON public.app_feedback;
CREATE POLICY "Users can delete their own feedback" ON public.app_feedback
    FOR DELETE USING (auth.uid() = user_id);
