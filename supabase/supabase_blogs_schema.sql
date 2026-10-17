-- ========================================================
-- Cairo Map - Blog System Database Schema
-- قم بنسخ هذا الكود بالكامل وتشغيله في لوحة تحكم Supabase
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ========================================================

-- 1. Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'عام',
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'فريق خريطة القاهرة',
    author_avatar TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    reading_time INT DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure author_avatar column exists if table was created previously
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_avatar TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create blog_likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (blog_id, user_id)
);

-- 4. Create blog_bookmarks table
CREATE TABLE IF NOT EXISTS public.blog_bookmarks (
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (blog_id, user_id)
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_bookmarks ENABLE ROW LEVEL SECURITY;

-- Security Policies for public.blogs
DROP POLICY IF EXISTS "Anyone can view blogs" ON public.blogs;
CREATE POLICY "Anyone can view blogs" ON public.blogs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON public.blogs;
CREATE POLICY "Authenticated users can insert blogs" ON public.blogs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update blogs" ON public.blogs;
CREATE POLICY "Authenticated users can update blogs" ON public.blogs FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON public.blogs;
CREATE POLICY "Authenticated users can delete blogs" ON public.blogs FOR DELETE USING (auth.role() = 'authenticated');

-- Security Policies for blog_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.blog_comments;
CREATE POLICY "Anyone can view comments" ON public.blog_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can insert comments" ON public.blog_comments;
CREATE POLICY "Auth users can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete comments" ON public.blog_comments;
CREATE POLICY "Users can delete comments" ON public.blog_comments FOR DELETE USING (auth.role() = 'authenticated');

-- Security Policies for blog_likes
DROP POLICY IF EXISTS "Anyone can view likes" ON public.blog_likes;
CREATE POLICY "Anyone can view likes" ON public.blog_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can insert likes" ON public.blog_likes;
CREATE POLICY "Auth users can insert likes" ON public.blog_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can delete likes" ON public.blog_likes;
CREATE POLICY "Auth users can delete likes" ON public.blog_likes FOR DELETE USING (auth.role() = 'authenticated');

-- Security Policies for blog_bookmarks
DROP POLICY IF EXISTS "Users can manage bookmarks" ON public.blog_bookmarks;
CREATE POLICY "Users can manage bookmarks" ON public.blog_bookmarks FOR ALL USING (auth.role() = 'authenticated');
