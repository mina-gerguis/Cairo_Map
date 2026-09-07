const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)$/m);
  const serviceMatch = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)$/m);
  const anonMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)$/m);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  // Prefer service role key for bypass RLS if available, else anon
  if (serviceMatch) supabaseKey = serviceMatch[1].trim();
  else if (anonMatch) supabaseKey = anonMatch[1].trim();
}

console.log("==================================================");
console.log("Cairo Map - Phone Directory & Telecom Codes Seeder");
console.log("==================================================");

const sqlFilePath = path.join(__dirname, '../supabase/seed_phone_directory_and_codes.sql');
if (fs.existsSync(sqlFilePath)) {
  console.log(`\nتم تجهيز ملف الـ SQL بالكامل في المسار:`);
  console.log(`supabase/seed_phone_directory_and_codes.sql`);
  console.log(`\nلإضافتها إلى قاعدة البيانات مباشرة:`);
  console.log(`1. افتح لوحة تحكم Supabase الخاصة بك.`);
  console.log(`2. اذهب إلى SQL Editor -> New Query.`);
  console.log(`3. انسخ محتوى الملف 'supabase/seed_phone_directory_and_codes.sql' ثم اضغط Run.`);
} else {
  console.error("SQL file not found!");
}
