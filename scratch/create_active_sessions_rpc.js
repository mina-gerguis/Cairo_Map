const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
let envVars = {};
try {
  const env = fs.readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    }
  });
} catch (e) {
  console.error("Error reading .env.local:", e);
  process.exit(1);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `
CREATE OR REPLACE FUNCTION get_active_sessions_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cnt bigint;
BEGIN
  SELECT count(*) INTO cnt
  FROM public.user_devices
  WHERE is_active = true;
  RETURN cnt;
END;
$$;
`;

supabase.rpc('exec_sql', { query: sql })
  .then((res) => {
    console.log("Success:", res);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
