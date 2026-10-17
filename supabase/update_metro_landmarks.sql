-- ==============================================================================
-- Cairo Map - Metro Stations Landmarks & Nearby Places Update
-- تحديث المعالم والأماكن الشهيرة القريبة من كل محطة مترو (الخطوط 1 و 2 و 3)
-- 
-- تعليمات التشغيل:
-- افتح لوحة تحكم Supabase الخاصة بالمشروع:
-- (Supabase Dashboard -> SQL Editor -> New Query -> الصق هذا الملف واضغط Run)
-- ==============================================================================

-- ==============================================================================
-- الخط الأول: حلوان - المرج الجديدة (35 محطة)
-- ==============================================================================

UPDATE public.metro_stations SET landmarks = '["الحديقة اليابانية", "متحف ركن فاروق", "كابريتاج حلوان الكبريتي", "مستشفى حلوان العام", "شارع راغب التجاري", "سوق حلوان"]'::jsonb WHERE name = 'حلوان' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["كلية الحاسبات والذكاء الاصطناعي", "مركز بحوث الفلزات", "مساكن عين حلوان", "معهد بحوث التبين"]'::jsonb WHERE name = 'عين حلوان' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["الحرم الرئيسي لجامعة حلوان", "مجمع الكليات والمعاهد", "الصالة المغطاة للألعاب الرياضية", "مدينة الطلبة والطالبات"]'::jsonb WHERE name = 'جامعة حلوان' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["ضاحية وادي حوف الهادئة", "شركة النصر لصناعة السيارات", "مستشفى النصر التخصصي", "مدرسة وادي حوف"]'::jsonb WHERE name = 'وادي حوف' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["نادي حدائق حلوان الرياضي", "كورنيش النيل (المعادي - حلوان)", "شارع الوهم", "منطقة ركن حلوان"]'::jsonb WHERE name = 'حدائق حلوان' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مصنع سيماف لعربات السكك الحديدية والمترو", "كورنيش المعصرة", "سوق المعصرة", "شارع المستودع"]'::jsonb WHERE name = 'المعصرة' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مصنع أسمنت بورتلاند طرة", "طريق الأوتوستراد السريع", "منطقة معادي هايتس"]'::jsonb WHERE name = 'طرة الأسمنت' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["منطقة كوتسيكا الصناعية", "كوبري شمال طرة", "طريق مصر حلوان الزراعي"]'::jsonb WHERE name = 'كوتسيكا' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مجمع مصالح طرة البلد", "كورنيش طرة النيل", "معهد أمين الشرطة", "شارع كورنيش النيل"]'::jsonb WHERE name = 'طرة البلد' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["نادي المعادي لليخوت والتجديف", "شارع 9 التجاري (الجهة الجنوبية)", "المستشفى العسكري بالمعادي", "فيكتوريا كوليدج المعادي"]'::jsonb WHERE name = 'ثكنات المعادي' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["شارع 9 السياحي (أشهر المطاعم والكافيهات)", "ميدان الحرية", "مستشفى القوات المسلحة بالمعادي", "كنيسة القديس يوحنا المعمدان", "جراند مول المعادي"]'::jsonb WHERE name = 'المعادي' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["شارع حسنين دسوقي التجاري", "شارع فرج يوسف", "سوق حدائق المعادي", "أبراج النصر"]'::jsonb WHERE name = 'حدائق المعادي' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["سوق دار السلام الكبير", "مستشفى دار السلام العام (هرمل)", "شارع الفيوم التجاري", "مجمع مدارس دار السلام"]'::jsonb WHERE name = 'دار السلام' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["المتحف القومي للحضارة المصرية (NMEC)", "بحيرة عين الصيرة وممشاها السياحي", "جامع عمرو بن العاص التاريخي", "مجمع الأديان بمصر القديمة", "حديقة تلال الفسطاط"]'::jsonb WHERE name = 'الزهراء' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["الكنيسة المعلقة (أقدم كنائس مصر)", "كنيسة ومزار مار جرجس", "المتحف القبطي", "حصن بابليون الروماني", "معبد بن عزرا اليهودي"]'::jsonb WHERE name = 'مار جرجس' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مستشفى الملك الصالح", "مقياس النيل بجزيرة الروضة", "قصر المانسترلي ومتحف أم كلثوم", "شارع البحر الأعظم", "مستشفى حميات العباسية فرع مصر القديمة"]'::jsonb WHERE name = 'الملك الصالح' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مسجد السيدة زينب التاريخي وميدانها", "مستشفى أحمد ماهر التعليمي", "مستشفى أطفال أبو الريش (الياباني والمنيرة)", "مسرح الهوسابير", "شارع بورسعيد"]'::jsonb WHERE name = 'السيدة زينب' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["ضريح ومتحف بيت الأمة (سعد زغلول)", "مقر مجلس النواب ومجلس الوزراء", "وزارة الصحة والسكان", "مستشفى قصر العيني القديم والفرنساوي", "شارع قصر العيني"]'::jsonb WHERE name = 'سعد زغلول' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["ميدان التحرير ومسلته التاريخية", "المتحف المصري بالتحرير", "مجمع التحرير الحكومي", "فندق النيل ريتز كارلتون", "مقر جامعة الدول العربية", "كوبري قصر النيل"]'::jsonb WHERE name = 'أنور السادات' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["دار القضاء العالي", "نقابة المحامين ونقابة الصحفيين", "شارع 26 يوليو التجاري", "وكالة البلح للأقمشة والملابس", "محطة الإسعاف المصرية"]'::jsonb WHERE name = 'جمال عبد الناصر' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["سوق التوفيقية لقطع غيار السيارات والفواكه", "مستشفى الجلاء التعليمي للولادة", "الهيئة القومية لسكك حديد مصر (المبنى الإداري)", "شارع الجلاء", "معهد ناصر للغات"]'::jsonb WHERE name = 'أحمد عرابي' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["محطة مصر للقطارات برمسيس", "ميدان رمسيس الشهير", "مسجد الفتح التاريخي", "شارع الفجالة (سوق الأدوات المدرسية والكتب)", "مبنى البريد المركزي المصري", "سنترال رمسيس"]'::jsonb WHERE name = 'الشهداء' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مستشفى غمرة العسكري", "المستشفى القبطي", "كنيسة السيدة العذراء بغمرة", "مطلع ومنزل كوبري 6 أكتوبر", "شارع رمسيس الرئيسي"]'::jsonb WHERE name = 'غمرة' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مستشفيات جامعة عين شمس (مستشفى الدمرداش الجامعي)", "كلية الطب وكلية التمريض بجامعة عين شمس", "معهد القلب القومي القديم", "شارع رمسيس"]'::jsonb WHERE name = 'الدمرداش' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["قصر الزعفران (إدارة جامعة عين شمس)", "حرم جامعة عين شمس (كليات الآداب والحقوق والعلوم والتجارة)", "مدينة الطالبات بجامعة عين شمس", "ميدان العباسية"]'::jsonb WHERE name = 'منشية الصدر' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["إدارة التجنيد والتعبئة بالقوات المسلحة", "مجمع كوبري القبة العسكري", "نادي ضباط القبة", "مشيخة الطرق الصوفية"]'::jsonb WHERE name = 'كوبري القبة' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["قصر القبة الرئاسي وحدائقه الملكية", "ميدان سراي القبة", "مدرسة القبة الثانوية العسكرية", "محيط حي الزيتون التاريخي"]'::jsonb WHERE name = 'حمامات القبة' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["حديقة ابن سندر العامة", "ميدان السواح ومصانع الأدوية", "قصر الطاهرة التاريخي", "شارع مصر والسودان"]'::jsonb WHERE name = 'سراي القبة' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["كنيسة العذراء مريم بالزيتون (موقع التجلي الشهير)", "ميدان الساعة بالزيتون", "مستشفى الزيتون التخصصي", "شارع طومان باي"]'::jsonb WHERE name = 'حدائق الزيتون' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["مستشفى الحلمية العسكري للعظام التخصصي", "ميدان ابن الحكم", "نادي الحلمية الرياضي", "شارع سليم الأول التجاري", "كنيسة مار يوحنا"]'::jsonb WHERE name = 'حلمية الزيتون' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["شجرة مريم العذراء ومزار العائلة المقدسة", "مسلة سنوسرت الأول التاريخية (مسلة المطرية)", "مستشفى المطرية التعليمي", "سوق الخميس التاريخي"]'::jsonb WHERE name = 'المطرية' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["كلية الهندسة جامعة عين شمس", "محطة قطار عين شمس السطحية", "شارع أحمد عصمت التجاري", "سوق عين شمس وميدان الحلمية"]'::jsonb WHERE name = 'عين شمس' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["شارع ترعة التوفيقية التجاري", "موقف سيارات الأقاليم والقليوبية", "مستشفى اليوم الواحد بعزبة النخل", "سوق عزبة النخل المركزي"]'::jsonb WHERE name = 'عزبة النخل' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["موقف أقاليم المرج للسيارات والميكروباصات", "شارع مؤسسة الزكاة التجاري", "كوبري المرج وسوق المرج القديم"]'::jsonb WHERE name = 'المرج' AND line_type = 'line1';

UPDATE public.metro_stations SET landmarks = '["الطريق الدائري (تقاطع ونزلة المرج)", "موقف محافظات القليوبية والشرقية والدلتا", "ترعة الإسماعيلية وموقف سيارات السريع"]'::jsonb WHERE name = 'المرج الجديدة' AND line_type = 'line1';


-- ==============================================================================
-- الخط الثاني: شبرا الخيمة - المنيب (20 محطة)
-- ==============================================================================

UPDATE public.metro_stations SET landmarks = '["قصر محمد علي التاريخي بشبرا الخيمة", "محطة قطارات شبرا الخيمة", "كوبري أحمد عرابي", "مستشفى النيل للتأمين الصحي", "كلية الزراعة فرع شبرا"]'::jsonb WHERE name = 'شبرا الخيمة' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["كلية الزراعة جامعة عين شمس", "ميدان المؤسسة بشبرا الخيمة", "طريق مصر إسكندرية الزراعي", "معهد بحوث وقاية النبات"]'::jsonb WHERE name = 'كلية الزراعة' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["معهد ناصر للبحوث والعلاج", "كورنيش النيل بشبرا", "حديقة أغاخان النيلية", "كوبري المظلات", "نادي الكهرباء الرياضي"]'::jsonb WHERE name = 'المظلات' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["مستشفى شبرا العام", "معهد القلب القومي التابع لمعهد ناصر", "شارع شبرا الرئيسي", "سينما التحرير السابقة"]'::jsonb WHERE name = 'الخلفاوي' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["كنيسة ومزار القديسة تريزا للأطفال", "مستشفى الراعي الصالح التخصصي", "شارع شبرا التجاري والملابس", "مدرسة الفرير شبرا"]'::jsonb WHERE name = 'سانت تريزا' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["سوق روض الفرج التاريخي", "قصر ثقافة روض الفرج التابع لوزارة الثقافة", "مدرسة التوفيقية الثانوية العريقة", "شارع جزيرة بدران"]'::jsonb WHERE name = 'روض الفرج' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["كنيسة السيدة العذراء بمسرة", "منطقة البنوك والمحلات التجارية بشارع شبرا", "سينما أوسكار دوللي بشبرا", "مدرسة الترعة الإعدادية"]'::jsonb WHERE name = 'مسرة' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["محطة قطارات مصر (رمسيس)", "ميدان رمسيس التاريخي", "شارع الفجالة للأدوات المكتبية والمكتبات", "مسجد الفتح", "سنترال ومبنى بريد رمسيس الرئيسي"]'::jsonb WHERE name = 'الشهداء' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["ميدان العتبة التجاري", "المسرح القومي المصري", "سور الأزبكية للكتب القديمة والمستعملة", "حديقة الأزبكية التراثية", "سوق الموسكي وخان الخليلي", "جراج العتبة"]'::jsonb WHERE name = 'العتبة' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["قصر عابدين التاريخي ومتاحفه الملكية", "ميدان الجمهورية بعابدين", "مقر وزارة التربية والتعليم", "شارع التحرير وشارع محمد فريد بوسط البلد"]'::jsonb WHERE name = 'محمد نجيب' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["ميدان التحرير ومسلته التاريخية", "المتحف المصري بالتحرير", "مجمع التحرير الخدمي", "فندق النيل ريتز كارلتون", "حرم الجامعة الأمريكية بالتحرير", "كوبري قصر النيل"]'::jsonb WHERE name = 'أنور السادات' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["دار الأوبرا المصرية ومسارحها", "برج القاهرة السياحي ومطلاته", "حديقة الأندلس التراثية على النيل", "نادي الجزيرة الرياضي العريق", "حديقة الحرية وحديقة الأسماك بالزمالك", "كوبري قصر النيل"]'::jsonb WHERE name = 'الأوبرا' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["ميدان الدقي الشهير", "شارع التحرير ومحلات الدقي", "مستشفى مصر الدولي", "فندق شيراتون القاهرة", "مجمع مجلس الدولة", "متحف محمود خليل وحرمه"]'::jsonb WHERE name = 'الدقي' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["المركز القومي للبحوث (NRC)", "مدينة الطلبة لجامعة القاهرة بالدقي", "شارع التحرير وشارع محيي الدين أبو العز", "مستشفى 6 أكتوبر للتأمين الصحي"]'::jsonb WHERE name = 'البحوث' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["قبة جامعة القاهرة التاريخية وساعة الجامعة", "الحرم الجامعي وكليات الحقوق والتجارة والآداب", "حديقة الحيوان بالجيزة", "حديقة الأورمان النباتية التراثية", "ميدان النهضة"]'::jsonb WHERE name = 'جامعة القاهرة' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["شارع الملك فيصل التجاري المزدحم", "كوبري فيصل المؤدي إلى الجيزة", "موقف ميكروباصات وسرفيس فيصل والهرم", "مستشفى تبارك للأطفال"]'::jsonb WHERE name = 'فيصل' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["محطة قطارات سكك حديد الجيزة للوجه القبلي", "ميدان الجيزة الرئيسي", "بداية شارع الأهرام (شارع الهرم)", "مجمع محاكم الجيزة بشارع مراد", "الباب الخلفي لحديقة الحيوان"]'::jsonb WHERE name = 'الجيزة' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["مستشفى أم المصريين العام", "ميدان أم المصريين", "مصلحة الجوازات والهجرة فرع الجيزة", "مدرسة الجيزة الثانوية للبنات"]'::jsonb WHERE name = 'أم المصريين' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["القرية الفرعونية السياحية على النيل", "شارع البحر الأعظم الترفيهي", "كورنيش الجيزة ومطاعم المراكب النيلية", "نادي التجديف واليخوت بجزيرة الدهب"]'::jsonb WHERE name = 'ساقية مكي' AND line_type = 'line2';

UPDATE public.metro_stations SET landmarks = '["موقف المنيب الإقليمي لأوتوبيسات وميكروباصات الصعيد", "الطريق الدائري (نزلة المنيب وكوبري المنيب)", "كورنيش النيل بالمنيب", "شارع المدبح"]'::jsonb WHERE name = 'المنيب' AND line_type = 'line2';


-- ==============================================================================
-- الخط الثالث: المسار الرئيسي عدلي منصور - الكيت كات (23 محطة)
-- ==============================================================================

UPDATE public.metro_stations SET landmarks = '["المحطة التبادلية المركزية عدلي منصور (مترو + قطار LRT + قطار السويس + SuperJet)", "موقف السلام للأقاليم", "طريق مصر الإسماعيلية الصحراوي", "سوق العبور الجديد"]'::jsonb WHERE name = 'عدلي منصور' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["منطقة الهايكستب العسكرية", "مستشفى الهايكستب العسكري للقوات المسلحة", "طريق مصر الإسماعيلية الصحراوي", "قرب الكلية الحربية"]'::jsonb WHERE name = 'الهايكستب' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["شارع جسر السويس التجاري", "ميدان الحرفيين الشهير لقطع غيار السيارات", "مدرسة الفاروق الإسلامية للغات", "سوق قباء"]'::jsonb WHERE name = 'عمر بن الخطاب' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["مدينة قباء السكنية", "شارع جسر السويس", "شارع الأربعين", "مجمع مدارس قباء التجريبية"]'::jsonb WHERE name = 'قباء' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["مستشفى السلام التخصصي", "شارع الخمسين بالنزهة 2", "شارع جسر السويس", "موقف النزهة 2"]'::jsonb WHERE name = 'هشام بركات' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["حي النزهة الجديدة الراقي", "شارع جوزيف تيتو المؤدي للمطار", "نادي النزهة الرياضي", "طريق مطار القاهرة الدولي"]'::jsonb WHERE name = 'النزهة' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["نادي الشمس الرياضي الاجتماعي", "شارع عبد الحميد بدوي", "حديقة بدر العامة", "ميدان الألف مسكن"]'::jsonb WHERE name = 'نادي الشمس' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان الألف مسكن ومواقف سيارات التجمع ومدينة نصر", "شارع جسر السويس", "مستشفى عين شمس العام", "سوق الألف مسكن التجاري"]'::jsonb WHERE name = 'ألف مسكن' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان هليوبوليس بمصر الجديدة", "كنيسة القديس مار جرجس هليوبوليس", "ميدان الحجاز", "مستشفى هليوبوليس التخصصي"]'::jsonb WHERE name = 'ميدان هليوبوليس' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["شارع هارون الرشيد بمصر الجديدة", "ميدان الإسماعيلية", "شارع أبو بكر الصديق", "مدرسة نوتردام دي زابوتر"]'::jsonb WHERE name = 'هارون' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["قصر البارون إمبان الأثري", "ميدان الكوربة التراثي والمطاعم التاريخية", "كنيسة البازيليك العريقة", "شارع الأهرام بمصر الجديدة"]'::jsonb WHERE name = 'الأهرام' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["كلية البنات جامعة عين شمس", "شارع الميرغني الشهير", "قصر الاتحادية الرئاسي", "مستشفى الصفا التخصصي"]'::jsonb WHERE name = 'كلية البنات' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["مجمع صالات استاد القاهرة الدولي", "الصالة المغطاة ومجمع السباحة الأولمبي", "شارع يوسف عباس ودار الهيئة الهندسية", "ميدان الشهيد هشام بركات"]'::jsonb WHERE name = 'استاد القاهرة' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["مركز القاهرة الدولي للمؤتمرات والمعارض (CICC)", "الهيئة العامة للاستثمار والمناطق الحرة (GAFI)", "أرض المعارض بمدينة نصر", "شارع صلاح سالم الحيوي"]'::jsonb WHERE name = 'المعرض' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان العباسية وموقف سيارات الأقاليم", "مستشفى العباسية للصحة النفسية", "كلية الهندسة جامعة عين شمس", "مصلحة الأحوال المدنية بالعباسية", "كاتدرائية القديس مرقس بالعباسية"]'::jsonb WHERE name = 'العباسية' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["كلية الهندسة جامعة عين شمس (بوابة عبده باشا)", "كلية الفنون التطبيقية جامعة حلوان", "ميدان عبده باشا", "مستشفى الطلبة بالعباسية"]'::jsonb WHERE name = 'عبده باشا' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان الجيش بالظاهر", "شارع العباسية", "كنيسة العذراء مريم بالظاهر التراثية", "مستشفى باب الشعرية الجامعي (سيد جلال)"]'::jsonb WHERE name = 'الجيش' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان باب الشعرية التاريخي وتمثال محمد عبد الوهاب", "سوق باب الشعرية للأدوات والمصنوعات الجلدية", "مستشفى سيد جلال الجامعي", "شارع بورسعيد وجامع زغلول"]'::jsonb WHERE name = 'باب الشعرية' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان العتبة التجاري", "المسرح القومي المصري", "سور الأزبكية للكتب", "سوق الموسكي وخان الخليلي", "حديقة الأزبكية التراثية"]'::jsonb WHERE name = 'العتبة' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["دار القضاء العالي ومكتب النائب العام", "نقابة الصحفيين ونقابة المحامين", "شارع 26 يوليو وشارع رمسيس", "محكمة شمال القاهرة الابتدائية", "محطة الإسعاف المركزية"]'::jsonb WHERE name = 'جمال عبد الناصر' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["مبنى الإذاعة والتليفزيون (ماسبيرو)", "مقر وزارة الخارجية المصرية على النيل", "أبراج ماسبيرو السكنية والاستثمارية الجديدة", "كورنيش النيل بالقاهرة", "كوبري 15 مايو"]'::jsonb WHERE name = 'ماسبيرو' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["حي الزمالك الراقي وسفارات الدول", "ساقية عبد المنعم الصاوي الثقافية", "شارع 26 يوليو بالزمالك ومطاعمه العالمية", "كلية التربية الموسيقية والتربية النوعية", "سفارة هولندا وسفارة ألمانيا"]'::jsonb WHERE name = 'صفاء حجازي' AND line_type = 'line3';

UPDATE public.metro_stations SET landmarks = '["ميدان الكيت كات الشهير", "كورنيش النيل بإمبابة والمراكب النيلية", "مسجد خالد بن الوليد بالكيت كات", "معهد الكبد القومي بإمبابة", "شارع السودان التجاري"]'::jsonb WHERE name = 'الكيت كات' AND line_type = 'line3';


-- ==============================================================================
-- الخط الثالث: تفريعة روض الفرج - Branch A (6 محطات)
-- ==============================================================================

UPDATE public.metro_stations SET landmarks = '["محكمة شمال الجيزة الابتدائية", "شارع السودان بحي الدقي والعجوزة", "مستشفى إمبابة العام", "محيط حي ميت عقبة"]'::jsonb WHERE name = 'السودان' AND line_type = 'line3_branch_a';

UPDATE public.metro_stations SET landmarks = '["قلب حي إمبابة الشعبي العريق", "حديقة سفاري بارك بإمبابة (أكبر حدائق الجيزة)", "شارع طلعت حرب إمبابة", "مستشفى حميات إمبابة", "سوق إمبابة المركزي"]'::jsonb WHERE name = 'إمبابة' AND line_type = 'line3_branch_a';

UPDATE public.metro_stations SET landmarks = '["شارع البوهي التجاري المزدحم", "ميدان الجامع بإمبابة", "مجمع المدارس الحكومية والتجريبية بالبوهي", "مستشفى الصدر بإمبابة"]'::jsonb WHERE name = 'البوهي' AND line_type = 'line3_branch_a';

UPDATE public.metro_stations SET landmarks = '["شارع القومية العربية التجاري", "سوق القومية العربية للخضار والمأكولات", "منطقة بشتيل الجديدة ومجمع المواقف", "شارع السبعين"]'::jsonb WHERE name = 'القومية العربية' AND line_type = 'line3_branch_a';

UPDATE public.metro_stations SET landmarks = '["تقاطع الطريق الدائري مع الوراق ومحور 26 يوليو", "موقف ميكروباصات الطريق الدائري والمريوطية", "محور روض الفرج السريع", "منطقة الوراق السكنية"]'::jsonb WHERE name = 'الطريق الدائري' AND line_type = 'line3_branch_a';

UPDATE public.metro_stations SET landmarks = '["كوبري تحيا مصر الملجم (أعرض كوبري ملجم في العالم)", "محور روض الفرج السريع", "ممشى أهل مصر بالوراق وشمال القاهرة", "كورنيش النيل شمال القاهرة وجزيرة الوراق"]'::jsonb WHERE name = 'محور روض الفرج' AND line_type = 'line3_branch_a';


-- ==============================================================================
-- الخط الثالث: تفريعة جامعة القاهرة - Branch B (5 محطات)
-- ==============================================================================

UPDATE public.metro_stations SET landmarks = '["معهد بحوث البترول بالمهندسين", "شارع أحمد عرابي الشهير بالمهندسين", "نادي التوفيقية للتنس", "ميدان سفنكس ومحلات الإلكترونيات والكمبيوتر"]'::jsonb WHERE name = 'التوفيقية' AND line_type = 'line3_branch_b';

UPDATE public.metro_stations SET landmarks = '["شارع وادي النيل بالمهندسين", "مستشفى ابن سينا التخصصي", "شارع جامعة الدول العربية ومطاعمه", "شارع جزيرة العرب للتسوق"]'::jsonb WHERE name = 'وادي النيل' AND line_type = 'line3_branch_b';

UPDATE public.metro_stations SET landmarks = '["شارع جامعة الدول العربية الحيوي", "ميدان ومسجد مصطفى محمود", "شارع البطل أحمد عبد العزيز", "مطاعم وكافيهات وتوكيلات المهندسين العالمية"]'::jsonb WHERE name = 'جامعة الدول العربية' AND line_type = 'line3_branch_b';

UPDATE public.metro_stations SET landmarks = '["مستشفى بولاق الدكرور العام", "شارع التحرير باتجاه صفط اللبن وكوبري ثروت", "كلية التربية للطفولة المبكرة بجامعة القاهرة", "سوق بولاق الدكرور التجاري"]'::jsonb WHERE name = 'بولاق الدكرور' AND line_type = 'line3_branch_b';

UPDATE public.metro_stations SET landmarks = '["الحرم الرئيسي التاريخي لجامعة القاهرة", "مبنى قبة جامعة القاهرة وساعة الجامعة", "تمثال وميدان نهضة مصر", "حديقة الحيوان بالجيزة وحديقة الأورمان", "شارع الدقي وشارع مراد"]'::jsonb WHERE name = 'جامعة القاهرة' AND line_type = 'line3_branch_b';

-- تم تحديث جميع معالم محطات المترو بنجاح
