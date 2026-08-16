-- SQL script to create route_interactions table for likes, dislikes, and reports on microbus/transit routes
CREATE TABLE IF NOT EXISTS public.route_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    station_name TEXT NOT NULL,
    route_destination TEXT NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'report')),
    report_reason TEXT CHECK (report_reason IN ('fare', 'via', 'location', 'other')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure a user can only have at most one vote (either a single like or a single dislike) per route
CREATE UNIQUE INDEX IF NOT EXISTS route_votes_unique_idx 
ON public.route_interactions (user_id, station_name, route_destination) 
WHERE interaction_type IN ('like', 'dislike');

-- Enable Row Level Security (RLS)
ALTER TABLE public.route_interactions ENABLE ROW LEVEL SECURITY;

-- Enable Policies for access
DROP POLICY IF EXISTS "Anyone can view route interactions" ON public.route_interactions;
CREATE POLICY "Anyone can view route interactions" 
ON public.route_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert their own interactions" ON public.route_interactions;
CREATE POLICY "Authenticated users can insert their own interactions" 
ON public.route_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own interactions" ON public.route_interactions;
CREATE POLICY "Users can update their own interactions" 
ON public.route_interactions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.route_interactions;
CREATE POLICY "Users can delete their own interactions" 
ON public.route_interactions FOR DELETE USING (auth.uid() = user_id);
