-- SQL migration to add description column to phone_directory table
ALTER TABLE public.phone_directory ADD COLUMN IF NOT EXISTS description TEXT;
