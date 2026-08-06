const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profiles in Database:');
    data.forEach(p => {
      console.log(`- Username: ${p.username}, Admin: ${p.is_admin}, Tier: ${p.subscription_tier}, Status: ${p.subscription_status}, End: ${p.subscription_end}`);
    });
  }
}

run().catch(console.error);
