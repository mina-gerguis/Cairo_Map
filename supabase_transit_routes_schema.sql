-- SQL code to create transit_routes table in Supabase
CREATE TABLE IF NOT EXISTS public.transit_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('microbus', 'bus', 'car', 'train', 'monorail', 'metro', 'plane', 'ship', 'multi')),
    type_name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'bx bx-bus',
    cost INTEGER NOT NULL DEFAULT 0,
    duration TEXT NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    tips TEXT,
    from_aliases TEXT,
    to_aliases TEXT,
    map_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transit_routes ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Anyone can view transit routes" ON public.transit_routes;
CREATE POLICY "Anyone can view transit routes" ON public.transit_routes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage transit routes" ON public.transit_routes;
CREATE POLICY "Admins can manage transit routes" ON public.transit_routes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Migration to update check constraint for existing tables
ALTER TABLE public.transit_routes DROP CONSTRAINT IF EXISTS transit_routes_type_check;
ALTER TABLE public.transit_routes ADD CONSTRAINT transit_routes_type_check 
    CHECK (type IN ('microbus', 'bus', 'car', 'train', 'monorail', 'metro', 'plane', 'ship', 'multi'));

-- Migration to add map_link column to existing tables
ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS map_link TEXT;


