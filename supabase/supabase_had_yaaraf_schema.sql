-- ========================================================
-- Cairo Map (قريب) - حد يعرف؟ (Community Q&A Database Schema)
-- قم بنسخ هذا الكود وتشغيله في لوحة تحكم Supabase:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ========================================================

-- 1. جدول الأسئلة (community_questions)
CREATE TABLE IF NOT EXISTS public.community_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL DEFAULT 'مستخدم مجهول',
    author_username TEXT NOT NULL DEFAULT 'anonymous',
    author_avatar TEXT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL DEFAULT 'عام',
    tags TEXT[] DEFAULT '{}',
    location_tag TEXT,
    is_solved BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    answers_count INT DEFAULT 0,
    reactions_count JSONB DEFAULT '{"like": 0, "dislike": 0, "laugh": 0, "love": 0, "sad": 0, "angry": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول الإجابات والردود (community_answers)
CREATE TABLE IF NOT EXISTS public.community_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_username TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT false,
    reactions_count JSONB DEFAULT '{"like": 0, "dislike": 0, "laugh": 0, "love": 0, "sad": 0, "angry": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. جدول التفاعلات (community_reactions)
CREATE TABLE IF NOT EXISTS public.community_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
    target_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'laugh', 'love', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_reaction_per_target UNIQUE (target_type, target_id, user_id)
);

-- 4. الفهارس (Indexes)
CREATE INDEX IF NOT EXISTS idx_community_questions_created ON public.community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_category ON public.community_questions(category);
CREATE INDEX IF NOT EXISTS idx_community_answers_question_id ON public.community_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_target ON public.community_reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user ON public.community_reactions(user_id);

-- 5. تفعيل أمان الصفوف (Row Level Security)
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

-- سياسات الأسئلة
DROP POLICY IF EXISTS "Anyone can view community questions" ON public.community_questions;
CREATE POLICY "Anyone can view community questions" ON public.community_questions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert questions" ON public.community_questions;
CREATE POLICY "Authenticated users can insert questions" ON public.community_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authors or admins can update their questions" ON public.community_questions;
CREATE POLICY "Authors or admins can update their questions" ON public.community_questions
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

DROP POLICY IF EXISTS "Authors or admins can delete their questions" ON public.community_questions;
CREATE POLICY "Authors or admins can delete their questions" ON public.community_questions
    FOR DELETE USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- سياسات الإجابات
DROP POLICY IF EXISTS "Anyone can view community answers" ON public.community_answers;
CREATE POLICY "Anyone can view community answers" ON public.community_answers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert answers" ON public.community_answers;
CREATE POLICY "Authenticated users can insert answers" ON public.community_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authors or admins can update their answers" ON public.community_answers;
CREATE POLICY "Authors or admins can update their answers" ON public.community_answers
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.community_questions 
            WHERE id = question_id AND user_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

DROP POLICY IF EXISTS "Authors or admins can delete their answers" ON public.community_answers;
CREATE POLICY "Authors or admins can delete their answers" ON public.community_answers
    FOR DELETE USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- سياسات التفاعلات
DROP POLICY IF EXISTS "Anyone can view community reactions" ON public.community_reactions;
CREATE POLICY "Anyone can view community reactions" ON public.community_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage their reactions" ON public.community_reactions;
CREATE POLICY "Authenticated users can manage their reactions" ON public.community_reactions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. دوال وتريجرات لتحديث عدد الإجابات وتحديث الـ Reactions تلقائياً
CREATE OR REPLACE FUNCTION public.handle_community_answer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_questions
        SET answers_count = answers_count + 1
        WHERE id = NEW.question_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_questions
        SET answers_count = GREATEST(0, answers_count - 1)
        WHERE id = OLD.question_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_community_answer_count ON public.community_answers;
CREATE TRIGGER tr_community_answer_count
AFTER INSERT OR DELETE ON public.community_answers
FOR EACH ROW EXECUTE FUNCTION public.handle_community_answer_count();

CREATE OR REPLACE FUNCTION public.recalculate_community_reactions()
RETURNS TRIGGER AS $$
DECLARE
    v_target_type TEXT;
    v_target_id UUID;
    v_counts JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_target_type := OLD.target_type;
        v_target_id := OLD.target_id;
    ELSE
        v_target_type := NEW.target_type;
        v_target_id := NEW.target_id;
    END IF;

    SELECT jsonb_build_object(
        'like', COALESCE(SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END), 0),
        'dislike', COALESCE(SUM(CASE WHEN reaction_type = 'dislike' THEN 1 ELSE 0 END), 0),
        'laugh', COALESCE(SUM(CASE WHEN reaction_type = 'laugh' THEN 1 ELSE 0 END), 0),
        'love', COALESCE(SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END), 0),
        'sad', COALESCE(SUM(CASE WHEN reaction_type = 'sad' THEN 1 ELSE 0 END), 0),
        'angry', COALESCE(SUM(CASE WHEN reaction_type = 'angry' THEN 1 ELSE 0 END), 0)
    )
    INTO v_counts
    FROM public.community_reactions
    WHERE target_type = v_target_type AND target_id = v_target_id;

    IF v_target_type = 'question' THEN
        UPDATE public.community_questions
        SET reactions_count = v_counts
        WHERE id = v_target_id;
    ELSIF v_target_type = 'answer' THEN
        UPDATE public.community_answers
        SET reactions_count = v_counts
        WHERE id = v_target_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_community_reactions_update ON public.community_reactions;
CREATE TRIGGER tr_community_reactions_update
AFTER INSERT OR UPDATE OR DELETE ON public.community_reactions
FOR EACH ROW EXECUTE FUNCTION public.recalculate_community_reactions();

-- حذف أي أسئلة أو ردود تجريبية إن وجدت
DELETE FROM public.community_questions 
WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444'
);
