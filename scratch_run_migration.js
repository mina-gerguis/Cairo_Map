const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const sql = fs.readFileSync('C:/Users/Mina Gerguis/.gemini/antigravity/brain/728f7ba0-aad6-48f8-bc92-5270a0a54d5e/scratch/migrate_reviews.sql', 'utf8');

supabase.rpc('exec_sql', { query: sql }).then(console.log).catch(console.error);
