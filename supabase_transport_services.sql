-- SQL code to create tables for transit services in Supabase

-- 1. Monorail Stations Table
CREATE TABLE IF NOT EXISTS public.monorail_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    line_type TEXT NOT NULL CHECK (line_type IN ('east', 'west')),
    station_order INTEGER NOT NULL DEFAULT 0,
    landmarks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. LRT Stations Table
CREATE TABLE IF NOT EXISTS public.lrt_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    line_type TEXT NOT NULL CHECK (line_type IN ('trunk', 'capital', 'ramadan')),
    station_order INTEGER NOT NULL DEFAULT 0,
    landmarks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Airports Table
CREATE TABLE IF NOT EXISTS public.airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT NOT NULL,
    terminals TEXT NOT NULL,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    airlines TEXT NOT NULL,
    phone TEXT NOT NULL,
    map_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Ports Table
CREATE TABLE IF NOT EXISTS public.ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    governorate TEXT NOT NULL,
    sea TEXT NOT NULL,
    type TEXT NOT NULL,
    capacity TEXT NOT NULL,
    description TEXT NOT NULL,
    map_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Bus Stations Table
CREATE TABLE IF NOT EXISTS public.bus_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    governorate TEXT NOT NULL,
    companies JSONB NOT NULL DEFAULT '[]'::jsonb,
    destinations JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    map_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Microbus Stations Table
CREATE TABLE IF NOT EXISTS public.microbus_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    governorate TEXT NOT NULL,
    routes JSONB NOT NULL DEFAULT '[]'::jsonb,
    map_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE public.monorail_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lrt_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microbus_stations ENABLE ROW LEVEL SECURITY;

-- Select policies for anyone
CREATE POLICY "Anyone can view monorail_stations" ON public.monorail_stations FOR SELECT USING (true);
CREATE POLICY "Anyone can view lrt_stations" ON public.lrt_stations FOR SELECT USING (true);
CREATE POLICY "Anyone can view airports" ON public.airports FOR SELECT USING (true);
CREATE POLICY "Anyone can view ports" ON public.ports FOR SELECT USING (true);
CREATE POLICY "Anyone can view bus_stations" ON public.bus_stations FOR SELECT USING (true);
CREATE POLICY "Anyone can view microbus_stations" ON public.microbus_stations FOR SELECT USING (true);

-- Manage policies for Admins
CREATE POLICY "Admins can manage monorail_stations" ON public.monorail_stations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage lrt_stations" ON public.lrt_stations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage airports" ON public.airports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage ports" ON public.ports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage bus_stations" ON public.bus_stations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage microbus_stations" ON public.microbus_stations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Seed data for Monorail
INSERT INTO public.monorail_stations (name, line_type, station_order) VALUES
('الاستاد', 'east', 1), ('هشام بركات', 'east', 2), ('نوري خطاب', 'east', 3), ('الحي السابع', 'east', 4), ('ذاكر حسين', 'east', 5), ('المنطقة الحرة', 'east', 6), ('المشير طنطاوي', 'east', 7), ('وان قطامية', 'east', 8), ('المستثمرين', 'east', 9), ('النسيم', 'east', 10), ('الجامعة الأمريكية', 'east', 11), ('إعمار', 'east', 12), ('ميدان النافورة', 'east', 13), ('البروة', 'east', 14), ('بيت الوطن', 'east', 15), ('مسجد الفتاح العليم', 'east', 16), ('الحي السكني R2', 'east', 17), ('الدائري الإقليمي', 'east', 18), ('فندق الماسة', 'east', 19), ('الحي الحكومي', 'east', 20), ('حي السفارات', 'east', 21), ('مدينة الفنون والثقافة', 'east', 22),
('أكتوبر الجديدة', 'west', 1), ('المنطقة الصناعية', 'west', 2), ('السادات', 'west', 3), ('جهاز مدينة 6 أكتوبر', 'west', 4), ('جمعية المهندسين', 'west', 5), ('جامعة النيل', 'west', 6), ('هايبر وان', 'west', 7), ('الصحراوي', 'west', 8), ('المنصورية', 'west', 9), ('المريوطية', 'west', 10), ('الطريق الدائري', 'west', 11), ('العريش', 'west', 12), ('المطبغة', 'west', 13), ('بولاق الدكرور', 'west', 14), ('جامعة الدول العربية', 'west', 15), ('وادي النيل', 'west', 16)
ON CONFLICT DO NOTHING;

-- Seed data for LRT
INSERT INTO public.lrt_stations (name, line_type, station_order) VALUES
('عدلي منصور', 'trunk', 1), ('العبور', 'trunk', 2), ('المستقبل', 'trunk', 3), ('الشروق', 'trunk', 4), ('هليوبوليس الجديدة', 'trunk', 5), ('بدر', 'trunk', 6),
('الروبيكي', 'capital', 1), ('حدائق العاصمة', 'capital', 2), ('مطار العاصمة', 'capital', 3), ('مدينة الفنون والثقافة', 'capital', 4),
('المنطقة الصناعية', 'ramadan', 1), ('مدينة المعرفة', 'ramadan', 2)
ON CONFLICT DO NOTHING;

-- Seed data for Airports
INSERT INTO public.airports (name, code, city, type, terminals, services, airlines, phone, map_url) VALUES
('مطار القاهرة الدولي (CAI)', 'CAI', 'القاهرة', 'مطار دولي رئيسي', 'مبنى الركاب 1 (القديم)، مبنى الركاب 2 (المطور)، مبنى الركاب 3 (الجديد)، الصالة الموسمية (للحج والعمرة).', '["مواقف سيارات متعددة الطوابق", "إنترنت واي فاي مجاني", "صالات كبار الشخصيات (VIP Lounge)", "بنوك وصرافة 24 ساعة", "سوق حرة (Duty Free)", "تأجير سيارات", "فنادق ملاصقة للمطار"]', 'مصر للطيران (المركز الرئيسي)، طيران الإمارات، الخطوط السعودية، لوفتهانزا، الخطوط البريطانية، الخطوط الفرنسية، طيران الخليج، وغيرها.', '19934', 'https://maps.google.com/?q=Cairo+International+Airport'),
('مطار برج العرب الدولي (HBE)', 'HBE', 'الإسكندرية', 'مطار دولي إقليمي', 'مبنى ركاب رئيسي مجهز، ويجري حالياً إنشاء مبنى ركاب صديق للبيئة جديد.', '["صالة سفر ووصول مكيفة", "مكتب صرافة وماكينات ATM", "كافيهات ومطاعم", "مواقف سيارات", "سوق حرة مبسطة"]', 'مصر للطيران، طيران العربية، فلاي دبي، طيران النيل، الخطوط السعودية، طيران الجزيرة.', '03-4631000', 'https://maps.google.com/?q=Borg+El+Arab+International+Airport'),
('مطار سفنكس الدولي (SPX)', 'SPX', 'الجيزة (الشيخ زايد / 6 أكتوبر)', 'مطار دولي جديد', 'مبنى ركاب رئيسي يخدم غرب القاهرة ومحافظات الدلتا ويخدم المتحف المصري الكبير والأهرامات.', '["مواقف سيارات", "خدمات بنكية ومكينات ATM", "كافيهات وقاعة ركاب حديثة", "سوق حرة"]', 'مصر للطيران (رحلات داخلية وخارجية)، ويز إير (Wizz Air)، طيران أديل، طيران العربية.', '02-35391645', 'https://maps.google.com/?q=Sphinx+International+Airport'),
('مطار العاصمة الدولي (CCE)', 'CCE', 'العاصمة الإدارية الجديدة', 'مطار دولي جديد', 'مبنى ركاب رئيسي مجهز بأحدث تكنولوجيا التفتيش والخدمات يخدم العاصمة الجديدة والقناة.', '["تكييف مركزي متطور", "خدمات بنكية وصرافة", "صالات انتظار متميزة", "منطقة مطاعم وكافيهات"]', 'مصر للطيران، ورسميات وشارتر وسياحية خاصة وخطوط طيران إقليمية.', '02-38594700', 'https://maps.google.com/?q=Capital+International+Airport+Egypt'),
('مطار الغردقة الدولي (HRG)', 'HRG', 'البحر الأحمر (الغردقة)', 'مطار دولي سياحي', 'مبنى الركاب 1 (الجديد والمميز بتصميمه)، مبنى الركاب 2 (القديم).', '["صالات سفر ووصول واسعة", "إنترنت واي فاي متاح", "سوق حرة سياحية ضخمة", "مكاتب تأجير سيارات وشركات سياحة", "بنوك وصرافة"]', 'مصر للطيران، طيران إيزي جيت، طيران كورندون، طيران التكثيف الإقليمي والرحلات الشارتر الروسية والأوروبية.', '065-3412000', 'https://maps.google.com/?q=Hurghada+International+Airport'),
('مطار شرم الشيخ الدولي (SSH)', 'SSH', 'جنوب سيناء (شرم الشيخ)', 'مطار دولي سياحي', 'مبنى الركاب 1 (المطور والجديد)، ومبنى الركاب 2.', '["خدمات سياحية متكاملة", "سوق حرة متنوعة", "صالات VIP مخصصة للوفود", "بنوك وصرافة 24 ساعة", "منطقة كافيهات خارجية ممتازة"]', 'مصر للطيران، طيران الخليج، الخطوط السعودية، والعديد من شركات الطيران الأوروبية والشارتر والروسية.', '069-3601140', 'https://maps.google.com/?q=Sharm+El-Sheikh+International+Airport'),
('مطار الأقصر الدولي (LXR)', 'LXR', 'الأقصر', 'مطار دولي أثري', 'مبنى ركاب رئيسي مصمم بطراز يتماشى مع الطابع الأثري لمدينة الأقصر.', '["سوق حرة للهدايا والتحف", "صالات انتظار مريحة ومكيفة", "ماكينات صرف آلي وبنوك", "مواقف حافلات سياحية واسعة"]', 'مصر للطيران، طيران النيل، وطيران مصر للطيران إكسبريس، ورحلات سياحية عارضة من أوروبا والخليج.', '095-2374655', 'https://maps.google.com/?q=Luxor+International+Airport')
ON CONFLICT DO NOTHING;

-- Seed data for Ports
INSERT INTO public.ports (name, governorate, sea, type, capacity, description, map_url) VALUES
('ميناء الإسكندرية البحري', 'الإسكندرية', 'البحر الأبيض المتوسط', 'تجاري / ركاب / سياحي', 'أكثر من 60% من تجارة مصر الخارجية تعبر من خلاله.', 'أقدم وأهم ميناء بحري تجاري في مصر. يضم الميناء أرصفة مخصصة للحاويات، البضائع العامة، الفحم، ومحطة ركاب سياحية حديثة تستقبل السفن السياحية العالمية.', 'https://maps.google.com/?q=Alexandria+Port'),
('ميناء الدخيلة', 'الإسكندرية', 'البحر الأبيض المتوسط', 'تجاري / صناعي', 'يعتبر الامتداد الطبيعي لميناء الإسكندرية لتقليل التكدس.', 'يقع غرب ميناء الإسكندرية ويخدم بشكل كبير المجمعات الصناعية المجاورة، مثل مصانع الحديد والصلب وغيرها، ويمتلك أرصفة عميقة لاستقبال السفن الضخمة.', 'https://maps.google.com/?q=Dekheila+Port'),
('ميناء دمياط', 'دمياط', 'البحر الأبيض المتوسط', 'تجاري / حاويات / غاز مسال', 'يتميز بوجود أحدث محطة لتداول الحاويات والبضائع العامة والغاز.', 'من أهم الموانئ المصرية الحديثة، يقع بالقرب من مدخل قناة السويس. يحتوي على تسهيلات متطورة لتداول الحاويات ومصنع رائد لتسييل وتصدير الغاز الطبيعي.', 'https://maps.google.com/?q=Damietta+Port'),
('ميناء بورسعيد (شرق وغرب)', 'بورسعيد', 'البحر الأبيض المتوسط / مدخل القناة', 'تجاري / حاويات عالمي', 'يقع مباشرة على المجرى الملاحي لقناة السويس.', 'ينقسم إلى ميناء غرب بورسعيد وميناء شرق بورسعيد المحوري العملاق الذي يعد من أسرع موانئ تداول الحاويات نمواً في العالم، ويعمل كمحطة ترانزيت رئيسية لربط قارات العالم.', 'https://maps.google.com/?q=Port+Said+Port'),
('ميناء العين السخنة', 'السويس', 'خليج السويس / البحر الأحمر', 'تجاري / صناعي حديث', 'يتميز بأعماق تصل إلى 17 متراً لاستيعاب سفن الجيل الثالث.', 'ميناء محوري يخدم المنطقة الاقتصادية لقناة السويس ويعد البوابة الجنوبية الرئيسية للبضائع القادمة من آسيا وشرق إفريقيا باتجاه القاهرة والدلتا.', 'https://maps.google.com/?q=Sokhna+Port'),
('ميناء سفاجا البحري', 'البحر الأحمر', 'البحر الأحمر', 'ركاب / بضائع / سياحي', 'البوابة الرئيسية لخدمة محافظات الصعيد وحركة الركاب مع دول الخليج.', 'يتميز بموقعه الاستراتيجي وقربه من مدن الصعيد والأقصر، ويعتبر الميناء الرئيسي لحركة المعتمرين والحجاج والعمالة المصرية المسافرة عبر البحر الأحمر، بالإضافة لتداول الفوسفات والألومنيوم.', 'https://maps.google.com/?q=Safaga+Port'),
('ميناء نويبع', 'جنوب سيناء', 'خليج العقبة / البحر الأحمر', 'ركاب / شاحنات (ميناء ربط عربي)', 'يربط مصر بالأردن والمشرق العربي عبر خط الجسر العربي الملاحي.', 'يقع على خليج العقبة ويخدم حركة التجارة والركاب والتبادل البيني للشاحنات بين مصر والأردن ودول الخليج العربي والشام.', 'https://maps.google.com/?q=Nuweiba+Port')
ON CONFLICT DO NOTHING;

-- Seed data for Bus Stations
INSERT INTO public.bus_stations (name, location, governorate, companies, destinations, description, map_url) VALUES
('موقف ألماظة للسوبر جيت (Almaza Terminal)', 'مصر الجديدة - بجوار طريق السويس ومطار القاهرة', 'القاهرة', '[{"name": "السوبر جيت (Super Jet)", "phone": "19142", "type": "رسمي حكومي"}, {"name": "جو باص (Go Bus)", "phone": "19567", "type": "خاص فاخر"}]', '["الإسكندرية", "شرم الشيخ", "الغردقة", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "السويس", "بورسعيد"]', 'أحدث محطات السوبر جيت في القاهرة. تخدم بشكل رئيسي المسافرين إلى مدن القناة، البحر الأحمر، والوجه القبلي والصعيد بتنظيم ممتاز وصالة انتظار مكيفة.', 'https://maps.google.com/?q=Almaza+Super+Jet+Station'),
('موقف الترجمان (Cairo Gateway)', 'وسط البلد - شارع الجلاء بجوار محطة مترو جمال عبد الناصر', 'القاهرة', '[{"name": "شركة شرق الدلتا للنقل", "phone": "02-25761311", "type": "حكومي"}, {"name": "شركة غرب ووسط الدلتا", "phone": "02-25761211", "type": "حكومي"}, {"name": "شركة الصعيد للنقل", "phone": "02-25761411", "type": "حكومي"}, {"name": "جو باص (Go Bus)", "phone": "19567", "type": "خاص فاخر"}]', '["الإسكندرية", "مطروح", "المنصورة", "الزقازيق", "شبه جزيرة سيناء (العريش/طور سيناء)", "محافظات الصعيد بأكملها", "البحر الأحمر"]', 'المحطة المركزية الكبرى للنقل البري لجميع المحافظات والدول المجاورة. يضم مكاتب حجز لمعظم الشركات العامة والخاصة وصالة انتظار تجارية ضخمة.', 'https://maps.google.com/?q=Torgoman+Bus+Station'),
('موقف عبد المنعم رياض (التحرير)', 'وسط البلد - ميدان التحرير خلف المتاحف والمكتبة وبجوار هيلتون', 'القاهرة', '[{"name": "جو باص (Go Bus)", "phone": "19567", "type": "خاص فاخر"}, {"name": "بلو باص (Blue Bus)", "phone": "16148", "type": "خاص فاخر"}, {"name": "سوبر جيت (Super Jet)", "phone": "19142", "type": "حكومي"}]', '["الإسكندرية", "الساحل الشمالي", "شرم الشيخ", "دهب", "الغردقة", "المنيا", "أسيوط", "قنا", "الأقصر"]', 'موقع استراتيجي بقلب القاهرة يتيح للمسافرين ركوب الحافلات السياحية الفاخرة مباشرة فور الخروج من محطة مترو السادات بالتحرير.', 'https://maps.google.com/?q=Abdel+Moneim+Riad+Bus+Station'),
('موقف عبود الإقليمي', 'شمال القاهرة - شبرا بمقربة من الطريق الدائري ومترو المظلات', 'القاهرة', '[{"name": "أتوبيسات غرب الدلتا", "phone": "19142", "type": "اقتصادي"}, {"name": "أتوبيسات شرق الدلتا", "phone": "02-22448400", "type": "اقتصادي"}]', '["طنطا", "المحلة الكبرى", "المنصورة", "دمنهور", "كفر الشيخ", "الإسكندرية", "بلبيس", "الزقازيق"]', 'الموقف الرئيسي والأكبر لربط القاهرة بجميع محافظات الوجه البحري والدلتا. يضم أتوبيسات السفر الاقتصادية وسيارات الأجرة الإقليمية الكبرى.', 'https://maps.google.com/?q=Abboud+Bus+Station'),
('موقف المنيب الإقليمي', 'الجيزة - المنيب بجوار محطة مترو المنيب والطريق الدائري', 'الجيزة', '[{"name": "شركة الصعيد للنقل والاتوبيسات", "phone": "19142", "type": "حكومي"}, {"name": "السوبر جيت (Super Jet)", "phone": "19142", "type": "حكومي"}]', '["الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "الواحات البحرية"]', 'البوابة الجنوبية للقاهرة والجيزة ومركز النقل الرئيسي المتجه إلى محافظات الصعيد والوجه القبلي والفيوم والواحات.', 'https://maps.google.com/?q=Moneeb+Bus+Station')
ON CONFLICT DO NOTHING;

-- Seed data for Microbus Stations
INSERT INTO public.microbus_stations (name, location, governorate, routes, map_url) VALUES
('موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)', 'وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء', 'القاهرة', '[{"fare": "11-13 ج.م", "notes": "", "destination": "6 أكتوبر", "vehicleType": "ميكروباص سقف عالي"}, {"fare": "12-14 ج.م", "notes": "", "destination": "الشيخ زايد", "vehicleType": "ميكروباص سقف عالي"}, {"fare": "15-18 ج.م", "notes": "", "destination": "التجمع الخامس", "vehicleType": "ميكروباص / ميني باص"}, {"fare": "10-12 ج.م", "notes": "", "destination": "العبور", "vehicleType": "ميكروباص"}, {"fare": "12-14 ج.م", "notes": "", "destination": "الشروق", "vehicleType": "ميكروباص"}, {"fare": "9-11 ج.م", "notes": "", "destination": "حلوان", "vehicleType": "ميكروباص"}, {"fare": "7-8 ج.م", "notes": "", "destination": "المرج", "vehicleType": "ميكروباص"}, {"fare": "5-6 ج.م", "notes": "", "destination": "الجيزة (ميدان الجيزة)", "vehicleType": "ميكروباص"}, {"fare": "5-6 ج.م", "notes": "", "destination": "شبرا الخيمة", "vehicleType": "ميكروباص"}, {"fare": "8-10 ج.م", "notes": "", "destination": "مطار القاهرة", "vehicleType": "ميكروباص"}]', 'https://maps.google.com/?q=Ramses+Microbus+Station'),
('موقف المرج الجديدة', 'شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي', 'القاهرة', '[{"fare": "7-9 ج.م", "notes": "", "destination": "العبور", "vehicleType": "ميكروباص"}, {"fare": "9-11 ج.م", "notes": "", "destination": "الشروق", "vehicleType": "ميكروباص"}, {"fare": "11-13 ج.م", "notes": "", "destination": "بدر", "vehicleType": "ميكروباص"}, {"fare": "12-15 ج.م", "notes": "", "destination": "العاشر من رمضان", "vehicleType": "ميكروباص سقف عالي"}, {"fare": "10-12 ج.م", "notes": "", "destination": "مدينتي", "vehicleType": "ميكروباص"}, {"fare": "10-12 ج.م", "notes": "", "destination": "بلبيس", "vehicleType": "ميكروباص إقليمي"}, {"fare": "15-18 ج.م", "notes": "", "destination": "الزقازيق", "vehicleType": "ميكروباص إقليمي"}, {"fare": "5 ج.م", "notes": "", "destination": "مسطرد", "vehicleType": "ميكروباص"}, {"fare": "7-8 ج.م", "notes": "", "destination": "رمسيس", "vehicleType": "ميكروباص"}]', 'https://maps.google.com/?q=El+Marg+Microbus+Station'),
('موقف ميدان الجيزة', 'الجيزة - ميدان الجيزة بجوار مسجد الاستقامة ومترو الجيزة', 'الجيزة', '[{"fare": "9-11 ج.م", "notes": "", "destination": "6 أكتوبر", "vehicleType": "ميكروباص سقف عالي"}, {"fare": "10-12 ج.م", "notes": "", "destination": "الشيخ زايد", "vehicleType": "ميكروباص"}, {"fare": "4-5 ج.م", "notes": "", "destination": "الهرم / فيصل", "vehicleType": "ميكروباص داخلي"}, {"fare": "3.5-4 ج.م", "notes": "", "destination": "المنيب", "vehicleType": "ميكروباص داخلي"}, {"fare": "5-6 ج.م", "notes": "", "destination": "حدائق الأهرام", "vehicleType": "ميكروباص"}, {"fare": "5-6 ج.م", "notes": "", "destination": "رمسيس", "vehicleType": "ميكروباص"}, {"fare": "15-18 ج.م", "notes": "", "destination": "التجمع الخامس", "vehicleType": "ميكروباص سقف عالي (عبر الدائري)"}, {"fare": "7-9 ج.م", "notes": "", "destination": "المعادي", "vehicleType": "ميكروباص (عبر الدائري)"}]', 'https://maps.google.com/?q=Giza+Square+Microbus+Station'),
('موقف السيدة عائشة', 'وسط القاهرة - ميدان السيدة عائشة أسفل القلعة', 'القاهرة', '[{"fare": "8-10 ج.م", "notes": "", "destination": "حلوان", "vehicleType": "ميكروباص"}, {"fare": "6-7 ج.م", "notes": "", "destination": "المعادي (صقر قريش)", "vehicleType": "ميكروباص"}, {"fare": "12-14 ج.م", "notes": "", "destination": "التجمع الخامس", "vehicleType": "ميكروباص (الدائري)"}, {"fare": "5 ج.م", "notes": "", "destination": "رمسيس", "vehicleType": "ميكروباص"}, {"fare": "5-6 ج.م", "notes": "", "destination": "الجيزة", "vehicleType": "ميكروباص"}, {"fare": "8-10 ج.م", "notes": "", "destination": "المرج", "vehicleType": "ميكروباص"}, {"fare": "4-5 ج.م", "notes": "", "destination": "المقطم", "vehicleType": "ميكروباص"}]', 'https://maps.google.com/?q=Sayeda+Aisha+Microbus+Station'),
('موقف المنيب الكبرى', 'الجيزة - بجوار محطة مترو المنيب ومخرج الدائري للجنوب', 'الجيزة', '[{"fare": "25-30 ج.م", "notes": "", "destination": "الفيوم", "vehicleType": "ميكروباص إقليمي"}, {"fare": "30-35 ج.م", "notes": "", "destination": "بني سويف", "vehicleType": "ميكروباص إقليمي"}, {"fare": "9-11 ج.م", "notes": "", "destination": "6 أكتوبر", "vehicleType": "ميكروباص سقف عالي"}, {"fare": "7-9 ج.م", "notes": "", "destination": "حلوان", "vehicleType": "ميكروباص (عبر الدائري)"}, {"fare": "5-6 ج.م", "notes": "", "destination": "المعادي", "vehicleType": "ميكروباص"}, {"fare": "3.5-4 ج.م", "notes": "", "destination": "ميدان الجيزة", "vehicleType": "ميكروباص داخلي"}]', 'https://maps.google.com/?q=Moneeb+Microbus+Station')
ON CONFLICT DO NOTHING;
