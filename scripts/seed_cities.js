const fs = require('fs');
const path = require('path');

// Load env variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)$/m);
  const keyMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)$/m);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Supabase environment variables not found in .env.local");
  process.exit(1);
}

// Stable UUID mapping
const CITY_ID_MAP = {
  "cairo-1": "00000000-0000-0000-0000-000000000001",
  "alexandria-2": "00000000-0000-0000-0000-000000000002",
  "giza-3": "00000000-0000-0000-0000-000000000003",
  "aswan-4": "00000000-0000-0000-0000-000000000004"
};

const LM_ID_MAP = {
  "cairo-lm-1": "00000000-0000-0000-0000-000000000101",
  "cairo-lm-2": "00000000-0000-0000-0000-000000000102",
  "cairo-lm-3": "00000000-0000-0000-0000-000000000103",
  "cairo-lm-4": "00000000-0000-0000-0000-000000000104",
  "cairo-lm-5": "00000000-0000-0000-0000-000000000105",
  "cairo-lm-6": "00000000-0000-0000-0000-000000000106",

  "alex-lm-1": "00000000-0000-0000-0000-000000000201",
  "alex-lm-2": "00000000-0000-0000-0000-000000000202",
  "alex-lm-3": "00000000-0000-0000-0000-000000000203",
  "alex-lm-4": "00000000-0000-0000-0000-000000000204",
  "alex-lm-5": "00000000-0000-0000-0000-000000000205",

  "giza-lm-1": "00000000-0000-0000-0000-000000000301",
  "giza-lm-2": "00000000-0000-0000-0000-000000000302",
  "giza-lm-3": "00000000-0000-0000-0000-000000000303",
  "giza-lm-4": "00000000-0000-0000-0000-000000000304",

  "aswan-lm-1": "00000000-0000-0000-0000-000000000401",
  "aswan-lm-2": "00000000-0000-0000-0000-000000000402",
  "aswan-lm-3": "00000000-0000-0000-0000-000000000403",
};

const INITIAL_FAMOUS_CITIES = [
  {
    id: "cairo-1",
    name: "القاهرة",
    slug: "cairo",
    cover_image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80",
    population: "10.2 مليون نسمة",
    area: "3,085 كم²",
    density: "15,400 نسمة/كم²",
    temperature: "29° م",
    overview: "عاصمة جمهورية مصر العربية وأكبر مدنها، تجمع بين التراث التاريخي الإسلامي والفاطمي العريق والحياة العصرية النابضة على ضفاف نهر النيل الأطول في العالم.",
    order_index: 1,
    landmarks: [
      {
        id: "cairo-lm-1",
        city_id: "cairo-1",
        name: "برج القاهرة",
        cover_image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80",
        description: "تحفة معمارية مصممة على شكل زهرة اللوتس المصرية الشهيرة في جزيرة الزمالك يبلغ ارتفاعه 187 متراً وتطل منه على بانوراما شاملة للقاهرة الكبرى.",
        type: "معلم سياحي",
        is_popular: true,
        nearby_stations: ["محطة مترو الأوبرا (الخط الثاني) | 5 دقائق مشي (400 متر)", "موقف أتوبيسات الزمالك | 3 دقائق مشي (250 متر)"],
        images: [
          "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "مشاهدة بانوراما كاملة 360 درجة لمدينة القاهرة بالمنظار",
          "تناول وجبة فاخرة أو مشروب في المطعم والمقهى الدوار أعلى البرج",
          "التقاط أروع الصور التذكارية لغروب الشمس فوق النيل"
        ]
      },
      {
        id: "cairo-lm-2",
        city_id: "cairo-1",
        name: "المتحف المصري بالتحرير",
        cover_image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
        description: "أعرق متحف أثري في الشرق الأوسط يقع في ميدان التحرير، ويحتوي على أكثر من 120 ألف قطعة أثرية فرعونية نادرة تعود لمختلف العصور الفرعونية.",
        type: "متحف أثري",
        is_popular: true,
        nearby_stations: ["محطة مترو أنور السادات (التحرير) | 4 دقائق مشي (300 متر)", "موقف عبد المنعم رياض | 6 دقائق مشي (500 متر)"],
        images: [
          "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "مشاهدة التماثيل الملكية والتوابيت الذهبية والمومياوات الفرعونية",
          "التجول بين القاعات التاريخية المصممة على الطراز الكلاسيكي",
          "زيارة المتجر الأثري لشراء النماذج المقلدة للقطع الأثرية"
        ]
      },
      {
        id: "cairo-lm-3",
        city_id: "cairo-1",
        name: "خان الخليلي وشارع المعز",
        cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
        description: "أكبر متحف مفتوح للآثار الإسلامية في العالم، يضم مساجد فاطمية ومماليك وأسوق قديمة تعود لأكثر من 600 عام.",
        type: "تاريخي وتراثي",
        is_popular: true,
        nearby_stations: ["محطة مترو العتبة | 12 دقيقة مشي", "محطة مترو باب الشعرية | 10 دقائق مشي", "موقف الحسين | 3 دقائق مشي (200 متر)"],
        images: [
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "التسوق لشراء التحف النحاسية، العطور، والفضيات اليدوية",
          "الجلوس في مقهى الفيشاوي التاريخي وتناول الشاي بالنعناع",
          "زيارة مجموعة السلطان قلاوون وبيت السحيمي ومسجد الحسين"
        ]
      },
      {
        id: "cairo-lm-4",
        city_id: "cairo-1",
        name: "قلعة صلاح الدين الأيوبي",
        cover_image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80",
        description: "حصن إسلامي منيع شيده الناصر صلاح الدين الأيوبي فوق جبل المقطم، وتضم مسجد محمد علي المشهور بالمرمر والمتحف الحربي.",
        type: "قلعة ومعلم تاريخي",
        is_popular: true,
        nearby_stations: ["محطة مترو الملك الصالح | 15 دقيقة مشي (أو 5 دقائق تاكسي)", "موقف السيدة عائشة | 8 دقائق مشي (600 متر)"],
        images: [
          "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "زيارة مسجد محمد علي ذو المآذن المرتفعة والقبة الضخمة",
          "استكشاف المتحف الحربي ومتحف الشرطة ومتحف المركبات الملكية",
          "الاستمتاع بإطلالة مبهرة على القاهرة القديمة ومآذنها"
        ]
      },
      {
        id: "cairo-lm-5",
        city_id: "cairo-1",
        name: "حديقة الأزهر",
        cover_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        description: "واحدة من أجمل المساحات الخضراء في القاهرة تقع على مساحة 80 فداناً، تطل مباشرة على القلعة والمدينة القديمة.",
        type: "حديقة ومتنزه",
        is_popular: false,
        nearby_stations: ["موقف الحسين والدرسية"],
        images: [
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "التنزه والركض وسط البساتين والمجرى المائي والبحيرات الاصطناعية",
          "تناول الوجبات في المطعم البحري أو القلعة داخل الحديقة",
          "حضور العروض الموسيقية في مسرح الجينينة"
        ]
      },
      {
        id: "cairo-lm-6",
        city_id: "cairo-1",
        name: "قصر عابدين",
        cover_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        description: "مقر الحكم السابق في مصر وتحفة متميزة من القرن التاسع عشر يضم متاحف الأسلحة والأوسمة والهدايا الملكية.",
        type: "متحف وقصر تاريخي",
        is_popular: false,
        nearby_stations: ["محطة مترو محمد نجيب"],
        images: [
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "مشاهدة المجموعات الثمينة من الأسلحة السيوف والبنادق التاريخية",
          "استكشاف المقتنيات الفضية والهدايا المقدمة لملوك مصر",
          "التجول في ساحة حدائق القصر الملكية"
        ]
      }
    ]
  },
  {
    id: "alexandria-2",
    name: "الإسكندرية",
    slug: "alexandria",
    cover_image: "https://images.unsplash.com/photo-1566192091743-5966a6079483?auto=format&fit=crop&w=1200&q=80",
    population: "5.4 مليون نسمة",
    area: "2,679 كم²",
    density: "2,000 نسمة/كم²",
    temperature: "26° م",
    overview: "عروس البحر الأبيض المتوسط وعاصمة مصر الثانية، تشتهر بكورنيشها الساحر، مكتبتها العالمية، تاريخها اليوناني الروماني، وأطباق السمك الطازجة.",
    order_index: 2,
    landmarks: [
      {
        id: "alex-lm-1",
        city_id: "alexandria-2",
        name: "مكتبة الإسكندرية",
        cover_image: "https://images.unsplash.com/photo-1566192091743-5966a6079483?auto=format&fit=crop&w=800&q=80",
        description: "صرح ثقافي عالمي من تصميم نرويجي متميز يقع على الشاطئ مباشرة ويضم ملايين الكتب، ومتاحف للآثار والمخطوطات والقبة السماوية.",
        type: "صرح ثقافي ومتحف",
        is_popular: true,
        nearby_stations: ["محطة قطار سيدي جابر", "ترام الشاطبي"],
        images: [
          "https://images.unsplash.com/photo-1566192091743-5966a6079483?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "زيارة متحف المخطوطات والآثار الغارقة والقبة السماوية",
          "القراءة في أكبر قاعة قراءة رئيسية متدرجة في العالم",
          "حضور المؤتمرات والمعارض الفنية والدولية"
        ]
      },
      {
        id: "alex-lm-2",
        city_id: "alexandria-2",
        name: "قلعة قايتباي",
        cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
        description: "قلعة بحرية شيدها السلطان أشرف قايتباي في القرن الخامس عشر في موقع فنار الإسكندرية القديم لحماية المدينة من الغزوات.",
        type: "قلعة بحرية",
        is_popular: true,
        nearby_stations: ["ترام محطة بحري", "موقف بحري الأنفوشي"],
        images: [
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "استكشاف الأبراج الحربية والفتحات الخاصة بالمدافع والأسوار",
          "ركوب القوارب الصغيرة في ميناء القلعة وتناول الآيس كريم",
          "تناول المأكولات البحرية والسمك الطازج في مطاعم بحري"
        ]
      },
      {
        id: "alex-lm-3",
        city_id: "alexandria-2",
        name: "حدائق وقصر المنتزه",
        cover_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        description: "غابات وحدائق ملكية شاسعة تطل على خليج المنتزه الساحر وتضم قصر السلاملك وقصر الحرملك وكوبري المنتزه الأثري.",
        type: "حدائق وشواطئ",
        is_popular: true,
        nearby_stations: ["محطة قطار المنتزه", "موقف المنتزه النهائي"],
        images: [
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "التنزه في المسطحات الخضراء والأشجار النادرة على البحر",
          "السباحة والاسترخاء في شواطئ المنتزه الفيروزية",
          "التقاط صور أمام قصر السلاملك والحرملك الكلاسيكي"
        ]
      },
      {
        id: "alex-lm-4",
        city_id: "alexandria-2",
        name: "كوبري استانلي",
        cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        description: "أول كوبري يخترق البحر في مصر، مصمم بتصميم فلورنسي متميز ببرجين شهيرين يضفيان لمسة رومانسية على البحر.",
        type: "معلم سياحي",
        is_popular: true,
        nearby_stations: ["ترام استانلي"],
        images: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "المشي ليلاً على الجسر والتقاط صور ممتازة للبحر والأمواج",
          "الجلوس في المقاهي المطلة على الكوبري مباشرة",
          "الاستمتاع بنسيم البحر المتوسط الساحر"
        ]
      },
      {
        id: "alex-lm-5",
        city_id: "alexandria-2",
        name: "عمود السواري ومقابر كوم الشقافة",
        cover_image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
        description: "أكبر عمود تذكاري في العالم من قطعة واحدة من الجرانيت الوردي، ومقابر رومانية منحوتة في الصخر تحت الأرض.",
        type: "آثار يونانية ورومانية",
        is_popular: false,
        nearby_stations: ["ترام محطة كرموز"],
        images: [
          "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "النزول في أعماق المقبرة الأثرية المكونة من ثلاثة طوابق تحت الأرض",
          "مشاهدة تماثيل أبو الهول الحارسة لعمود السواري",
          "التعرف على التداخل الفريد بين الفن الفرعوني والفن الروماني"
        ]
      }
    ]
  },
  {
    id: "giza-3",
    name: "الجيزة",
    slug: "giza",
    cover_image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
    population: "9.1 مليون نسمة",
    area: "1,580 كم²",
    density: "5,700 نسمة/كم²",
    temperature: "30° م",
    overview: "موطن عجائب الدنيا السبع الأهرامات الثلاثة وأبو الهول، والمتحف المصري الكبير المذهل، وتعد البوابة التاريخية للحضارة المصرية القديمة.",
    order_index: 3,
    landmarks: [
      {
        id: "giza-lm-1",
        city_id: "giza-3",
        name: "أهرامات الجيزة وأبو الهول",
        cover_image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
        description: "أهرامات خوفو وخفرع ومنقرع وأبو الهول العظيم، أضخم بناء حجري في التاريخ وإحدى عجائب العالم القديم الباقية.",
        type: "معلم عالمي وأثري",
        is_popular: true,
        nearby_stations: ["محطة مترو الجيزة", "محطة المونوريل الأهرامات"],
        images: [
          "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "ركوب الجمال والخيل في هضبة الأهرامات",
          "الدخول داخل الممرات الداخلية لهرم خوفو الأكبر",
          "حضور عروض الصوت والضوء الأسطورية ليلاً"
        ]
      },
      {
        id: "giza-lm-2",
        city_id: "giza-3",
        name: "المتحف المصري الكبير (GEM)",
        cover_image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
        description: "أكبر متحف في العالم مخصص لحضارة واحدة، يضم القاعة الكاملة لكنوز الملك الذهبي توت عنخ آمون وتمثال رمسيس الثاني العظيم.",
        type: "متحف عالمي",
        is_popular: true,
        nearby_stations: ["محطة مترو المتحف الكبير", "طريق مصر الإسكندرية الصحراوي"],
        images: [
          "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "مشاهدة البهو العظيم والدرج العظيم المطل على الأهرامات",
          "زيارة متحف مراكب الشمس وقاعات الملك توت عنخ آمون",
          "التسوق وتناول الوجبات في المنطقة التجارية الفاخرة بالداخل"
        ]
      },
      {
        id: "giza-lm-3",
        city_id: "giza-3",
        name: "القرية الفرعونية",
        cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
        description: "جزيرة نيلية تعيد تجسيد تفاصيل الحياة اليومية للمصريين القدماء من خلال ممثلين وزوارق تعبر الممرات المائية.",
        type: "تاريخي وتجريبي",
        is_popular: true,
        nearby_stations: ["محطة مترو ساقية مكي"],
        images: [
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "جولة بالقارب العائم في القنوات المائية ومشاهدة الزراعة والتحنيط القديم",
          "زيارة نموذج مقبرة توت عنخ آمون الأصلية بالكامل",
          "زيارة متاحف التاريخ الحديث ومتحف الرؤساء"
        ]
      },
      {
        id: "giza-lm-4",
        city_id: "giza-3",
        name: "حديقة الحيوان بالجيزة",
        cover_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        description: "أقدم حديقة حيوان في إفريقيا والشرق الأوسط شيدت في عهد الخديوي إسماعيل وتضم أشجار نادرة وكوبري معلق فريد.",
        type: "حديقة وحيوانات",
        is_popular: false,
        nearby_stations: ["محطة مترو جامعة القاهرة"],
        images: [
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "مشاهدة الحيوانات والطيور والزواحف النادرة",
          "السير على الكوبري المعلق الذي صممه غوستاف ايفل",
          "زيارة المتحف الحيواني والاستراحة الملكية"
        ]
      }
    ]
  },
  {
    id: "aswan-4",
    name: "أسوان",
    slug: "aswan",
    cover_image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80",
    population: "1.6 مليون نسمة",
    area: "62,707 كم²",
    density: "25 نسمة/كم²",
    temperature: "35° م",
    overview: "جوهرة الجنوب وعاصمة النوبة الساحرة، تمتاز بطبيعتها النيلية البكر بين صخور الجرانيت الوردية والبيوت النوبية الملونة وطيبة أهلها.",
    order_index: 4,
    landmarks: [
      {
        id: "aswan-lm-1",
        city_id: "aswan-4",
        name: "معبد فيلة",
        cover_image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80",
        description: "معبد الإلهة إيزيس الأسطوري المقام على جزيرة أجيلكيا الوسطى في النيل، والذي تم إنقاذه بنقله قطعة قطعة من الغرق.",
        type: "معبد أثري ونيل",
        is_popular: true,
        nearby_stations: ["مرسى معبد فيلة النيلي", "محطة قطار أسوان"],
        images: [
          "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "ركوب المراكب الشراعية والنيلية للوصول إلى الجزيرة",
          "مشاهدة الأعمدة البسيطة والنقوش الفرعونية والرومانية المتقنة",
          "حضور عروض الصوت والضوء الليلية المبهرة"
        ]
      },
      {
        id: "aswan-lm-2",
        city_id: "aswan-4",
        name: "القرية النوبية (غرب سهيل)",
        cover_image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
        description: "قرية نوبية أصيلة على الضفة الغربية لنهر النيل تمتاز ببيوتها الملونة بألوان البهجة، وتربية التماسيح، والمشغولات اليدوية.",
        type: "تراث نوبي وثقافي",
        is_popular: true,
        nearby_stations: ["مرسى غرب سهيل النيلي"],
        images: [
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "شرب الشاي الكركديه النوبي والتعرف على التراث",
          "التقاط الصور مع التماسيح الصغيرة في منازل الأهالي",
          "رسم الحناء والتسوق لشراء التوابل والأعشاب النوبية"
        ]
      },
      {
        id: "aswan-lm-3",
        city_id: "aswan-4",
        name: "السد العالي ومتحف النيل",
        cover_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        description: "أحد أضخم المشاريع الهندسيّة في القرن العشرين الذي حطّم الفيضانات وولّد الكهرباء وحمى مصر، ومطل على بحيرة ناصر.",
        type: "معلم هندسي وقومي",
        is_popular: true,
        nearby_stations: ["محطة قطار السد العالي"],
        images: [
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80"
        ],
        activities: [
          "الوقوف فوق جسر السد ومشاهدة بحيرة ناصر الضخمة ومفيض توشكى",
          "زيارة نُصُب صداقة الشعوب والرمز التذكاري الشهير",
          "زيارة متحف النيل المائي والتعرف على دول حوض النيل"
        ]
      }
    ]
  }
];

async function seed() {
  console.log("Starting seeding process with stable UUIDs...");

  // First clean up default cities and landmarks to prevent duplicate or conflicting records
  const defaultCityUuids = Object.values(CITY_ID_MAP);
  console.log("Cleaning up previous entries of default cities...");
  
  // Note: city_landmarks cascade-deletes when a city is deleted, but we can delete them explicitly as well
  for (const cityId of defaultCityUuids) {
    const delLmUrl = `${supabaseUrl}/rest/v1/city_landmarks?city_id=eq.${cityId}`;
    await fetch(delLmUrl, {
      method: "DELETE",
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      }
    });

    const delCityUrl = `${supabaseUrl}/rest/v1/famous_cities?id=eq.${cityId}`;
    await fetch(delCityUrl, {
      method: "DELETE",
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      }
    });
  }

  for (const city of INITIAL_FAMOUS_CITIES) {
    const uuid = CITY_ID_MAP[city.id];
    console.log(`Upserting city: ${city.name} (${uuid})`);

    // Payload for city
    const cityPayload = {
      id: uuid,
      name: city.name,
      slug: city.slug,
      cover_image: city.cover_image,
      population: city.population,
      area: city.area,
      density: city.density,
      temperature: city.temperature,
      overview: city.overview,
      order_index: city.order_index
    };

    const upsertCityUrl = `${supabaseUrl}/rest/v1/famous_cities`;
    const resCity = await fetch(upsertCityUrl, {
      method: "POST",
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(cityPayload)
    });

    if (!resCity.ok) {
      const errText = await resCity.text();
      console.error(`Failed to upsert city ${city.name}:`, errText);
      continue;
    }
    console.log(`Successfully upserted city ${city.name}`);

    // Insert landmarks with fixed UUIDs
    for (const lm of city.landmarks) {
      const lmUuid = LM_ID_MAP[lm.id];
      console.log(`Upserting landmark: ${lm.name} (${lmUuid})`);
      const lmPayload = {
        id: lmUuid,
        city_id: uuid,
        name: lm.name,
        cover_image: lm.cover_image,
        description: lm.description,
        type: lm.type,
        is_popular: lm.is_popular,
        nearby_stations: JSON.stringify(lm.nearby_stations),
        images: JSON.stringify(lm.images),
        activities: JSON.stringify(lm.activities)
      };

      const upsertLmUrl = `${supabaseUrl}/rest/v1/city_landmarks`;
      const resLm = await fetch(upsertLmUrl, {
        method: "POST",
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(lmPayload)
      });

      if (!resLm.ok) {
        const errText = await resLm.text();
        console.error(`Failed to upsert landmark ${lm.name}:`, errText);
      } else {
        console.log(`Successfully upserted landmark ${lm.name}`);
      }
    }
  }
  console.log("Seeding process completed!");
}

seed();
