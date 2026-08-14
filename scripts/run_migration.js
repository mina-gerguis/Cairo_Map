const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/);

if (!urlMatch || !keyMatch) {
  console.error("Could not find NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

console.log("Connecting to Supabase at:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

const sqlPath = path.join(__dirname, 'migrate_airports.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

supabase.rpc('exec_sql', { query: sql })
  .then(res => {
    console.log("Migration response:", res);
    if (res.error) {
      console.error("Migration failed inside database:", res.error);
    } else {
      console.log("Migration executed successfully!");
    }
  })
  .catch(err => {
    console.error("Error executing RPC:", err);
  });
