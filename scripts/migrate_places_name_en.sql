-- Add name_en column to places table if it does not already exist
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS name_en TEXT;
