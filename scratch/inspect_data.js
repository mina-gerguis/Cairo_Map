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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectData() {
  try {
    const { data: places, error } = await supabase.from('places').select('*').limit(5);
    if (error) {
      console.error("Error fetching places:", error);
    } else {
      for (const place of places) {
        console.log(`Place: ${place.name}`);
        console.log(`- sub_categories: type=${typeof place.sub_categories}, isArray=${Array.isArray(place.sub_categories)}, val=`, place.sub_categories);
        console.log(`- features: type=${typeof place.features}, isArray=${Array.isArray(place.features)}, val=`, place.features);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

inspectData();
