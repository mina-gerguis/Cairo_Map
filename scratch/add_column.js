const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const sql = `ALTER TABLE public.telecom_codes ADD COLUMN IF NOT EXISTS description TEXT;`;

async function run() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error('Migration error:', error);
    } else {
      console.log('Migration successful:', data);
    }
  } catch (e) {
    console.error('Thrown error:', e);
  }
}
run();
