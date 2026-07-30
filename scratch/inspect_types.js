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

async function inspectTypes() {
  try {
    const sql = `
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name IN ('places', 'place_proposals', 'branches')
      AND column_name IN ('sub_categories', 'features');
    `;
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error("Error executing SQL:", error);
    } else {
      console.log("Column Data Types:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

inspectTypes();
