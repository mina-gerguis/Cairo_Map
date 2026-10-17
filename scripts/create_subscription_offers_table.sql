-- Create subscription_offers table for offers and discounts settings
CREATE TABLE IF NOT EXISTS public.subscription_offers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'new_user_trial' or 'open_page_access'
  title TEXT,
  description TEXT,
  target_page TEXT, -- 'all', '/directions', '/ai-planner', '/airports', etc.
  target_tier TEXT, -- 'gold', 'silver', 'mishwar'
  duration_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  welcome_message TEXT,
  banner_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_offers ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users (public)
CREATE POLICY "Allow public read access on subscription_offers" 
ON public.subscription_offers FOR SELECT 
USING (true);

-- Allow admins full access (insert/update/delete)
CREATE POLICY "Allow admin full access on subscription_offers" 
ON public.subscription_offers FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Insert default row for new_user_trial if not exists
INSERT INTO public.subscription_offers (
  id,
  type,
  title,
  description,
  target_tier,
  duration_days,
  is_active,
  welcome_message,
  created_at,
  updated_at
) VALUES (
  'new_user_trial_config',
  'new_user_trial',
  'عرض الاشتراك التجريبي التلقائي للمسجلين الجدد',
  'تفعيل باقة مجانية تلقائية لكل حساب جديد يتم إنشاؤه في الموقع',
  'gold',
  30,
  false,
  '🎉 تهانينا! حصلت على اشتراك مجاني كهدية ترحيبية لتسجيل حسابك الجديد.',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
