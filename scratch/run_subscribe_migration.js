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

const sqlFilePath = path.join(__dirname, '..', 'supabase_subscriptions_schema.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Run the SQL script
supabase.rpc('exec_sql', { query: sql }).then(({ data, error }) => {
  if (error) {
    console.error('Error executing migration:', error);
  } else {
    console.log('Migration executed successfully:', data);
  }
}).catch(console.error);
