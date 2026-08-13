const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('monorail_stations').select('*').limit(1);
  if (error) {
    console.error("Error fetching monorail_stations:", error);
  } else {
    console.log("monorail_stations first row:", data);
  }

  const { data: lrtData, error: lrtErr } = await supabase.from('lrt_stations').select('*').limit(1);
  if (lrtErr) {
    console.error("Error fetching lrt_stations:", lrtErr);
  } else {
    console.log("lrt_stations first row:", lrtData);
  }
}

run();
