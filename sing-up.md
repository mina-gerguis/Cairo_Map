src/app/signup/
├── types.ts                     # كافة تعريفات واجهات وبيانات TypeScript
├── constants.ts                 # الثوابت، شرائح العرض، صور الأفاتار، ومعلومات الخطوات
├── utils.ts                     # دوال التعريب، توليد مقترحات اسم المستخدم، وحساب العمر والتحقق
├── signup.module.css            # ملف التنسيق الموديولار المتجاوب والنظيف
├── hooks/
│   └── useSignupForm.ts         # هوك مخصص يدير كافة الحالات (State) والتحقق والتسجيل
├── components/
│   ├── AuthLayout.tsx           # غلاف خلفية الصفحة بتأثيرات الإضاءة الهادئة
│   ├── GlassCard.tsx            # بطاقة النموذج بتأثير الزجاج وتدرجات الظلال
│   ├── OnboardingSlider.tsx     # شاشة الترحيب والشرائح الثلاثية والأزرار
│   ├── StepHeader.tsx           # زر الرجوع، شارة الخطوة، العنوان، وشريط التقدم
│   ├── Step1PersonalInfo.tsx    # الخطوة 1: الاسم، اسم المستخدم، تأكيد البريد بـ OTP
│   ├── Step2Phone.tsx           # الخطوة 2: رقم الهاتف مع علم مصر ومفتاح الدولة +20
│   ├── Step3LocationAge.tsx     # الخطوة 3: تاريخ الميلاد، الجنس، المحافظة، المدينة
│   ├── Step4Avatar.tsx          # الخطوة 4: رفع الصورة الشخصية وشبكة الأفاتار
│   ├── Step5Password.tsx        # الخطوة 5: كلمة المرور ومطابقتها ومصفوفة القواعد
│   ├── DobConfirmModal.tsx      # نافذة تأكيد العمر وتاريخ الميلاد قبل الإرسال
│   └── index.ts                 # تصدير مجمع لكافة المكونات
└── page.tsx                     # منسق الصفحة النظيف والموجز (Orchestrator ~70 سطر)

src/app/railways/
├── types.ts                     # تعريفات TypeScript للخطوط والمحطات والدرجات والبلاغات
├── constants.ts                 # البيانات الأساسية للخطوط، الألوان، خيارات المشاكل، روابط الحجز
├── utils.ts                     # دوال تطبيع النصوص العربية وحساب الألوان وأسماء الخطوط
├── railways.module.css          # استايل الصفحة الكامل بنظام CSS Modules على غرار microbus.module.css
├── hooks/
│   └── useRailwaysData.ts       # هوك إدارة بيانات القطارات، الربط مع Supabase و LocalStorage
├── components/
│   ├── RailwaysHero.tsx         # الهيدر الترحيبي مع الشعار والإحصائيات
│   ├── RailwaysSlider.tsx       # سلايدر Bento لخطوط القطارات المختلفة
│   ├── RailwaysRouteDetails.tsx # تفاصيل الخط، ملخص المسار، الدرجات والأسعار، والمحطات
│   ├── RailwaysBookingSection.tsx # قسم كيفية حجز التذاكر وروابط الهيئة الرسمية
│   ├── RailwaysReportBanner.tsx # بانر التبليغ عن مشكلة
│   ├── RailwaysReportModal.tsx  # نافذة التبليغ التفاعلية مع رفع الصور والبحث عن المحطات
│   ├── RailwaysPaywall.tsx      # شاشة الاشتراك في الباقة الفضية
│   └── RailwaysLoading.tsx      # شاشة التحميل المتناسقة
└── page.tsx                     # الصفحة الرئيسية (Clean Orchestrator)

