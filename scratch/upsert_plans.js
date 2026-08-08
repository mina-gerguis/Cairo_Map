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

const plans = [
  {
    id: 'free',
    name: 'الباقة المجانية',
    price_daily: 0.00,
    price_monthly: 0.00,
    price_yearly: 0.00,
    features: ['تصفح خطوط المترو الأساسية', 'البحث عن محطات المترو', 'عرض جداول المواعيد والمحطات التبادلية']
  },
  {
    id: 'mishwar',
    name: 'باقة المشوار',
    price_daily: 9.00,
    price_monthly: 0.00,
    price_yearly: 0.00,
    features: ['اشتراك سريع لمدة 24 ساعة', 'تصفح خطوط المترو الأساسية والبحث', 'خريطة المونوريل التفاعلية الكاملة', 'محرك البحث المتقدم "ازاي اروح" لخطوط المواصلات', 'إضافة تذكيرات وملاحظات للأماكن']
  },
  {
    id: 'silver',
    name: 'الباقة الفضية',
    price_daily: 0.00,
    price_monthly: 40.00,
    price_yearly: 450.00,
    features: [
      'تصفح خطوط المترو الأساسية والبحث',
      'عرض جداول المواعيد والمحطات التبادلية',
      'خريطة المونوريل التفاعلية الكاملة 🚄',
      'دليل مواعيد وأسعار سكك حديد مصر 🚂',
      'دليل محطات وتعرفة القطار الكهربائي LRT 🚄',
      'محرك البحث المتقدم "ازاي اروح" للمواصلات 🗺️',
      'إضافة تذكيرات وملاحظات للأماكن 📝'
    ]
  },
  {
    id: 'gold',
    name: 'الباقة الذهبية',
    price_daily: 0.00,
    price_monthly: 60.00,
    price_yearly: 700.00,
    features: [
      'تصفح خطوط المترو الأساسية والبحث',
      'عرض جداول المواعيد والمحطات التبادلية',
      'خريطة المونوريل التفاعلية الكاملة 🚄',
      'دليل مواعيد وأسعار سكك حديد مصر 🚂',
      'دليل محطات وتعرفة القطار الكهربائي LRT 🚄',
      'محرك البحث المتقدم "ازاي اروح" للمواصلات 🗺️',
      'إضافة تذكيرات وملاحظات للأماكن 📝',
      'دليل المطارات المصرية والصالات ✈️',
      'دليل الموانئ البحرية التجارية والسياحية ⚓',
      'دليل مواقف وأتوبيسات السفر بين المدن 🚌',
      'دليل مواقف الميكروباص والسرفيس والتعرفة 🚐',
      'مخطط الرحلات الذكي بالذكاء الاصطناعي 🤖'
    ]
  }
];

async function run() {
  console.log('Upserting subscription plans...');
  const { data, error } = await supabase
    .from('subscription_plans')
    .upsert(plans, { onConflict: 'id' });

  if (error) {
    console.error('Error upserting plans:', error);
  } else {
    console.log('Successfully upserted plans!');
  }
}

run();
