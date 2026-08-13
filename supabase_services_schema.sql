-- Create service_workers table
CREATE TABLE IF NOT EXISTS public.service_workers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 0,
    age INT,
    bio TEXT,
    rating_avg NUMERIC(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for service_workers
ALTER TABLE public.service_workers ENABLE ROW LEVEL SECURITY;

-- Policies for service_workers
DROP POLICY IF EXISTS "Allow public read for service_workers" ON public.service_workers;
CREATE POLICY "Allow public read for service_workers" ON public.service_workers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner write/update for service_workers" ON public.service_workers;
CREATE POLICY "Allow owner write/update for service_workers" ON public.service_workers
    FOR ALL USING (auth.uid() = id);

-- Create worker_portfolio table
CREATE TABLE IF NOT EXISTS public.worker_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for worker_portfolio
ALTER TABLE public.worker_portfolio ENABLE ROW LEVEL SECURITY;

-- Policies for worker_portfolio
DROP POLICY IF EXISTS "Allow public read for worker_portfolio" ON public.worker_portfolio;
CREATE POLICY "Allow public read for worker_portfolio" ON public.worker_portfolio
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner write/update for worker_portfolio" ON public.worker_portfolio;
CREATE POLICY "Allow owner write/update for worker_portfolio" ON public.worker_portfolio
    FOR ALL USING (auth.uid() = worker_id);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policies for service_requests
DROP POLICY IF EXISTS "Allow users to view their own requests" ON public.service_requests;
CREATE POLICY "Allow users to view their own requests" ON public.service_requests
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = worker_id);

DROP POLICY IF EXISTS "Allow clients to insert requests" ON public.service_requests;
CREATE POLICY "Allow clients to insert requests" ON public.service_requests
    FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Allow users to update their own requests" ON public.service_requests;
CREATE POLICY "Allow users to update their own requests" ON public.service_requests
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = worker_id);

-- Create worker_reviews table
CREATE TABLE IF NOT EXISTS public.worker_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating_quality INT CHECK (rating_quality BETWEEN 1 AND 5),
    rating_time INT CHECK (rating_time BETWEEN 1 AND 5),
    rating_price INT CHECK (rating_price BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for worker_reviews
ALTER TABLE public.worker_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for worker_reviews
DROP POLICY IF EXISTS "Allow public read for worker_reviews" ON public.worker_reviews;
CREATE POLICY "Allow public read for worker_reviews" ON public.worker_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow client to insert worker_reviews" ON public.worker_reviews;
CREATE POLICY "Allow client to insert worker_reviews" ON public.worker_reviews
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Create client_reviews table
CREATE TABLE IF NOT EXISTS public.client_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating_respect INT CHECK (rating_respect BETWEEN 1 AND 5),
    rating_clarity INT CHECK (rating_clarity BETWEEN 1 AND 5),
    rating_payment INT CHECK (rating_payment BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for client_reviews
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for client_reviews
DROP POLICY IF EXISTS "Allow public read for client_reviews" ON public.client_reviews;
CREATE POLICY "Allow public read for client_reviews" ON public.client_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow worker to insert client_reviews" ON public.client_reviews;
CREATE POLICY "Allow worker to insert client_reviews" ON public.client_reviews
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Setup portfolio storage bucket in storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio bucket
DROP POLICY IF EXISTS "Allow public access to portfolio" ON storage.objects;
CREATE POLICY "Allow public access to portfolio" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Allow authenticated upload to portfolio" ON storage.objects;
CREATE POLICY "Allow authenticated upload to portfolio" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow owner delete/update on portfolio" ON storage.objects;
CREATE POLICY "Allow owner delete/update on portfolio" ON storage.objects
    FOR ALL USING (bucket_id = 'portfolio' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = owner::text));

-- Function to update worker rating average and count when a new review is inserted
CREATE OR REPLACE FUNCTION public.update_worker_rating_on_review()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.service_workers
    SET 
        rating_avg = (
            SELECT COALESCE(ROUND(AVG((rating_quality + rating_time + rating_price) / 3.0), 2), 0.00)
            FROM public.worker_reviews
            WHERE worker_id = NEW.worker_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.worker_reviews
            WHERE worker_id = NEW.worker_id
        )
    WHERE id = NEW.worker_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for worker_reviews
DROP TRIGGER IF EXISTS on_worker_review_inserted ON public.worker_reviews;
CREATE TRIGGER on_worker_review_inserted
    AFTER INSERT OR UPDATE OR DELETE ON public.worker_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_worker_rating_on_review();
