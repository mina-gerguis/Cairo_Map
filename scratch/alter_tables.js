const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('D:/Development/Project/Cairo Map/.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Altering tables via exec_sql RPC...");
  
  const sql = `
    ALTER TABLE public.monorail_stations ADD COLUMN IF NOT EXISTS landmarks JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.lrt_stations ADD COLUMN IF NOT EXISTS landmarks JSONB DEFAULT '[]'::jsonb;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error("RPC Error:", error);
    } else {
      console.log("Tables altered successfully!", data);
    }
  } catch (err) {
    console.error("Exception running RPC:", err);
  }
}

run();
