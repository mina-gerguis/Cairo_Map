const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  try {
    // 1. Get one record from places
    const { data: places, error: placesErr } = await supabase.from('places').select('*').limit(1);
    if (placesErr) {
      console.error("Error fetching places:", placesErr);
    } else {
      console.log("Places columns:", Object.keys(places[0] || {}));
    }

    // 2. Get one record from place_proposals
    const { data: proposals, error: proposalsErr } = await supabase.from('place_proposals').select('*').limit(1);
    if (proposalsErr) {
      console.error("Error fetching proposals:", proposalsErr);
    } else {
      console.log("Proposals columns:", Object.keys(proposals[0] || {}));
    }

    // 3. Get one record from branches
    const { data: branches, error: branchesErr } = await supabase.from('branches').select('*').limit(1);
    if (branchesErr) {
      console.error("Error fetching branches:", branchesErr);
    } else {
      console.log("Branches columns:", Object.keys(branches[0] || {}));
    }
  } catch (err) {
    console.error("Inspection error:", err);
  }
}

inspect();
